import type { TElement } from "platejs";
import { createPlateEditor } from "platejs/react";
import { describe, expect, it } from "vitest";

import { insertContent } from "../src/commands/insert-content";
import {
	captureCursor,
	getOutline,
	releaseEditorLocationRefs,
} from "../src/editor-location";
import type { TLocation } from "../src/editor-api";
import type { TRichEditorValue } from "../src/types";

const documentEndLocation: TLocation = {
	type: "document",
	position: "end",
};

const paragraph = (
	text: string,
	attrs: Record<string, unknown> = {},
): TElement => ({
	type: "p",
	children: [{ text }],
	...attrs,
});

const value = (...nodes: TElement[]): TRichEditorValue => nodes;

const heading = (level: 1 | 2 | 3 | 4 | 5 | 6, text: string): TElement => ({
	type: `h${level}`,
	children: [{ text }],
});

const cloneValue = (input: TRichEditorValue): TRichEditorValue =>
	JSON.parse(JSON.stringify(input));

const stripNodeIds = (input: unknown): unknown => {
	if (Array.isArray(input)) return input.map(stripNodeIds);
	if (!input || typeof input !== "object") return input;

	return Object.fromEntries(
		Object.entries(input)
			.filter(([key]) => key !== "id" && key !== "_id")
			.map(([key, item]) => [key, stripNodeIds(item)]),
	);
};

const createEditor = (initialValue: TRichEditorValue) =>
	createPlateEditor({ value: cloneValue(initialValue) });

describe("insertContent", () => {
	it("appends one undo batch and moves the internal selection to the end", () => {
		const originalValue = value(paragraph("Before"));
		const editor = createEditor(originalValue);

		editor.tf.select(editor.api.end([]));
		editor.tf.insertText("!");
		const valueBeforeImport = cloneValue(editor.children);
		const historyLengthBeforeImport = editor.history.undos.length;

		const result = insertContent(
			editor,
			value(paragraph("Imported 1"), paragraph("Imported 2")),
			documentEndLocation,
		);

		expect(result).toEqual({ ok: true });
		expect(stripNodeIds(editor.children)).toEqual(
			stripNodeIds(
				value(
					paragraph("Before!"),
					paragraph("Imported 1"),
					paragraph("Imported 2"),
				),
			),
		);
		expect(editor.history.undos).toHaveLength(historyLengthBeforeImport + 1);
		const end = editor.api.end([]);
		expect(editor.selection).toEqual({ anchor: end, focus: end });

		editor.tf.undo();
		expect(stripNodeIds(editor.children)).toEqual(stripNodeIds(valueBeforeImport));

		editor.tf.undo();
		expect(stripNodeIds(editor.children)).toEqual(stripNodeIds(originalValue));
	});

	it("replaces the only plain empty paragraph", () => {
		const editor = createEditor(value(paragraph("")));

		const result = insertContent(
			editor,
			value(paragraph("Imported")),
			documentEndLocation,
		);

		expect(result).toEqual({ ok: true });
		expect(stripNodeIds(editor.children)).toEqual(
			stripNodeIds(value(paragraph("Imported"))),
		);

		editor.tf.undo();
		expect(stripNodeIds(editor.children)).toEqual(
			stripNodeIds(value(paragraph(""))),
		);
	});

	it("preserves an empty paragraph in a non-empty document", () => {
		const editor = createEditor(value(paragraph("Before"), paragraph("")));

		insertContent(editor, value(paragraph("Imported")), documentEndLocation);

		expect(stripNodeIds(editor.children)).toEqual(
			stripNodeIds(
				value(paragraph("Before"), paragraph(""), paragraph("Imported")),
			),
		);
	});

	it("rejects empty and invalid content without mutating the editor", () => {
		const editor = createEditor(value(paragraph("Before")));
		const initialValue = cloneValue(editor.children);

		expect(insertContent(editor, [], documentEndLocation)).toEqual({
			ok: false,
			reason: "empty-content",
		});
		expect(
			insertContent(
				editor,
				null as unknown as TRichEditorValue,
					documentEndLocation,
			),
		).toEqual({ ok: false, reason: "invalid-content" });
		expect(
			insertContent(
				editor,
				value({
					type: "unknown",
					children: [{ text: "Invalid" }],
				} as TElement),
					documentEndLocation,
			),
		).toEqual({ ok: false, reason: "invalid-content" });

		expect(editor.children).toEqual(initialValue);
		expect(editor.history.undos).toHaveLength(0);
	});

	it("does not mutate reused content and keeps inserted node ids unique", () => {
		const editor = createEditor(value(paragraph("Before", { id: "before" })));
		const content = value(paragraph("Imported", { id: "source" }));
		const originalContent = cloneValue(content);

		insertContent(editor, content, documentEndLocation);
		insertContent(editor, content, documentEndLocation);

		expect(content).toEqual(originalContent);
		const ids = editor.children
			.map((node) => (node as TElement).id)
			.filter((id): id is string => typeof id === "string");
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("keeps content, selection, and history isolated between editor instances", () => {
		const editorA = createEditor(value(paragraph("A")));
		const editorB = createEditor(value(paragraph("B")));
		const editorBValue = cloneValue(editorB.children);

		insertContent(editorA, value(paragraph("A imported")), documentEndLocation);

		expect(stripNodeIds(editorA.children)).toEqual(
			stripNodeIds(value(paragraph("A"), paragraph("A imported"))),
		);
		expect(editorA.history.undos).toHaveLength(1);
		expect(editorA.selection).not.toBeNull();

		expect(editorB.children).toEqual(editorBValue);
		expect(editorB.history.undos).toHaveLength(0);
		expect(editorB.selection).toBeNull();
	});

	it("inserts at the root document start", () => {
		const editor = createEditor(value(paragraph("After")));

		const result = insertContent(editor, value(paragraph("Before")), {
			type: "document",
			position: "start",
		});

		expect(result).toEqual({ ok: true });
		expect(stripNodeIds(editor.children)).toEqual(
			stripNodeIds(value(paragraph("Before"), paragraph("After"))),
		);
		expect(editor.selection).toEqual({
			anchor: editor.api.end([0]),
			focus: editor.api.end([0]),
		});
	});

	it("uses the live selection with paste semantics", () => {
		const editor = createEditor(value(paragraph("Before")));
		editor.tf.select({
			anchor: { path: [0, 0], offset: 2 },
			focus: { path: [0, 0], offset: 5 },
		});

		const result = insertContent(editor, value(paragraph("X")), {
			type: "selection",
		});

		expect(result).toEqual({ ok: true });
		expect(stripNodeIds(editor.children)).toEqual(
			stripNodeIds(value(paragraph("BeXe"))),
		);
		expect(editor.selection).toEqual({
			anchor: { path: [0, 0], offset: 3 },
			focus: { path: [0, 0], offset: 3 },
		});
	});

	it("rejects a selection location when no live selection exists", () => {
		const editor = createEditor(value(paragraph("Before")));

		expect(
			insertContent(editor, value(paragraph("Imported")), {
				type: "selection",
			}),
		).toEqual({ ok: false, reason: "location-unavailable" });
		expect(stripNodeIds(editor.children)).toEqual(
			stripNodeIds(value(paragraph("Before"))),
		);
	});

	it("tracks, reuses, and explicitly releases a captured cursor", () => {
		const editor = createEditor(value(paragraph("Before")));
		editor.tf.select({
			anchor: { path: [0, 0], offset: 3 },
			focus: { path: [0, 0], offset: 3 },
		});
		const cursor = captureCursor(editor, { position: "end" });
		expect(cursor).not.toBeNull();

		editor.tf.insertText("X", { at: { path: [0, 0], offset: 0 } });
		const cursorLocation: TLocation = {
			type: "cursor",
			cursor: cursor!,
		};
		expect(
			insertContent(editor, value(paragraph("1")), cursorLocation),
		).toEqual({ ok: true });
		expect(
			insertContent(editor, value(paragraph("2")), cursorLocation),
		).toEqual({ ok: true });
		expect(stripNodeIds(editor.children)).toEqual(
			stripNodeIds(value(paragraph("XBef12ore"))),
		);

		cursor!.release();
		cursor!.release();
		expect(
			insertContent(editor, value(paragraph("3")), cursorLocation),
		).toEqual({ ok: false, reason: "location-expired" });
	});

	it("expires cursors across editor instances and editor disposal", () => {
		const editorA = createEditor(value(paragraph("A")));
		const editorB = createEditor(value(paragraph("B")));
		editorA.tf.select(editorA.api.end([]));
		const cursor = captureCursor(editorA, { position: "end" });
		expect(cursor).not.toBeNull();

		expect(
			insertContent(editorB, value(paragraph("X")), {
				type: "cursor",
				cursor: cursor!,
			}),
		).toEqual({ ok: false, reason: "location-expired" });

		releaseEditorLocationRefs(editorA);
		expect(
			insertContent(editorA, value(paragraph("X")), {
				type: "cursor",
				cursor: cursor!,
			}),
		).toEqual({ ok: false, reason: "location-expired" });
	});

	it("returns a live outline and inserts relative to referenced blocks", () => {
		const editor = createEditor(
			value(
				heading(1, "First"),
				paragraph("First body"),
				heading(2, "Second"),
				paragraph("Second body"),
			),
		);
		const outline = getOutline(editor);

		expect(outline.map(({ level, text }) => ({ level, text }))).toEqual([
			{ level: 1, text: "First" },
			{ level: 2, text: "Second" },
		]);
		expect(new Set(outline.map((item) => item.key)).size).toBe(2);

		expect(
			insertContent(editor, value(paragraph("Before second")), {
				type: "block",
				block: outline[1].block,
				position: "before",
			}),
		).toEqual({ ok: true });
		expect(
			insertContent(editor, value(paragraph("After first")), {
				type: "block",
				block: outline[0].block,
				position: "after",
			}),
		).toEqual({ ok: true });
		expect(stripNodeIds(editor.children)).toEqual(
			stripNodeIds(
				value(
					heading(1, "First"),
					paragraph("After first"),
					paragraph("First body"),
					paragraph("Before second"),
					heading(2, "Second"),
					paragraph("Second body"),
				),
			),
		);
	});

	it("expires a block reference after deletion or across editors", () => {
		const editorA = createEditor(value(heading(1, "A"), paragraph("Body")));
		const editorB = createEditor(value(heading(1, "B")));
		const block = getOutline(editorA)[0].block;
		const blockLocation: TLocation = {
			type: "block",
			block,
			position: "after",
		};

		expect(
			insertContent(editorB, value(paragraph("X")), blockLocation),
		).toEqual({ ok: false, reason: "location-expired" });
		editorA.tf.removeNodes({ at: [0] });
		expect(
			insertContent(editorA, value(paragraph("X")), blockLocation),
		).toEqual({ ok: false, reason: "location-expired" });
	});
});

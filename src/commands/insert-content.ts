import {
	KEYS,
	PathApi,
	type Path,
	type Point,
	type TElement,
	type TNode,
	type TRange,
	type TText,
} from "platejs";
import type { PlateEditor } from "platejs/react";

import type { TLocation, TRichEditorCommandResult } from "@/editor-api";
import { resolveBlock, resolveCursor } from "@/editor-location";
import { validateValue } from "@/node/validate-value";
import type { TRichEditorValue } from "@/types";

const ELEMENT_ID_KEYS = new Set(["id", "_id"]);
const TEXT_ID_KEYS = new Set(["id", "_id"]);

const cloneValue = (value: TRichEditorValue): TRichEditorValue =>
	JSON.parse(JSON.stringify(value));

const removeNodeIds = (nodes: TRichEditorValue): TRichEditorValue => {
	const visit = (node: TNode): TNode => {
		const { _id: _discardedInternalId, id: _discardedId, ...rest } = node;

		if ("text" in node) return rest as TText;

		return {
			...rest,
			children: (node as TElement).children.map((child) =>
				visit(child as TNode),
			),
		} as TElement;
	};

	return nodes.map((node) => visit(node as TNode));
};

const isPlainEmptyText = (node: TNode): boolean => {
	if (!("text" in node)) return false;

	const text = node as TText;
	if (text.text !== "") return false;

	return Object.keys(text).every(
		(key) => key === "text" || TEXT_ID_KEYS.has(key),
	);
};

const isPlainEmptyParagraph = (node: TNode): boolean => {
	if ("text" in node) return false;

	const element = node as TElement;
	if (element.type !== KEYS.p) return false;
	if (!Array.isArray(element.children) || element.children.length !== 1) {
		return false;
	}
	if (!isPlainEmptyText(element.children[0] as TNode)) return false;

	return Object.keys(element).every(
		(key) => key === "type" || key === "children" || ELEMENT_ID_KEYS.has(key),
	);
};

const isEmptyDocument = (editor: PlateEditor): boolean =>
	editor.children.length === 1 &&
	isPlainEmptyParagraph(editor.children[0] as TNode);

type TResolvedInsertion =
	| {
			kind: "nodes";
			path: Path;
	  }
	| {
			kind: "fragment";
			at: Point | TRange;
	  };

type TLocationResolution =
	| { ok: true; insertion: TResolvedInsertion }
	| {
			ok: false;
			reason: "location-expired" | "location-unavailable";
	  };

/** Resolves opaque public locations against the editor's live document. */
const resolveInsertion = (
	editor: PlateEditor,
	location: TLocation,
): TLocationResolution => {
	switch (location.type) {
		case "document":
			return {
				ok: true,
				insertion: {
					kind: "nodes",
					path: [location.position === "start" ? 0 : editor.children.length],
				},
			};
		case "selection":
			return editor.selection
				? {
						ok: true,
						insertion: {
							kind: "fragment",
							at: {
								anchor: {
									...editor.selection.anchor,
									path: [...editor.selection.anchor.path],
								},
								focus: {
									...editor.selection.focus,
									path: [...editor.selection.focus.path],
								},
							},
						},
					}
				: { ok: false, reason: "location-unavailable" };
		case "cursor": {
			const point = resolveCursor(editor, location.cursor);
			return point
				? {
						ok: true,
						insertion: {
							kind: "fragment",
							at: { ...point, path: [...point.path] },
						},
					}
				: { ok: false, reason: "location-expired" };
		}
		case "block": {
			const path = resolveBlock(editor, location.block);
			return path
				? {
						ok: true,
						insertion: {
							kind: "nodes",
							path:
								location.position === "before" ? path : PathApi.next(path),
						},
					}
				: { ok: false, reason: "location-expired" };
		}
	}
};

const getLastInsertedPath = (path: Path, nodeCount: number): Path => [
	...path.slice(0, -1),
	path[path.length - 1] + nodeCount - 1,
];

export const insertContent = (
	editor: PlateEditor,
	content: TRichEditorValue,
	location: TLocation,
): TRichEditorCommandResult => {
	if (!Array.isArray(content)) {
		return { ok: false, reason: "invalid-content" };
	}

	if (content.length === 0) {
		return { ok: false, reason: "empty-content" };
	}

	if (!validateValue(content).valid) {
		return { ok: false, reason: "invalid-content" };
	}

	const resolution = resolveInsertion(editor, location);
	if (!resolution.ok) return resolution;

	const nextContent = removeNodeIds(cloneValue(content));
	const replaceEmptyDocument =
		location.type === "document" && isEmptyDocument(editor);
	const insertion = replaceEmptyDocument
		? ({ kind: "nodes", path: [0] } satisfies TResolvedInsertion)
		: resolution.insertion;

	editor.tf.withNewBatch(() => {
		editor.tf.withoutNormalizing(() => {
			if (replaceEmptyDocument) {
				editor.tf.removeNodes({ at: [0] });
			}

			if (insertion.kind === "nodes") {
				editor.tf.insertNodes(nextContent, { at: insertion.path });
				return;
			}

			editor.tf.insertFragment(nextContent, { at: insertion.at });
		});

		if (insertion.kind === "nodes") {
			const lastPath = getLastInsertedPath(
				insertion.path,
				nextContent.length,
			);
			editor.tf.select(editor.api.end(lastPath));
		}
	});

	return { ok: true };
};

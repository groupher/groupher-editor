import {
	ElementApi,
	NodeApi,
	RangeApi,
	type Path,
	type PathRef,
	type Point,
	type PointRef,
	type TElement,
} from "platejs";
import type { PlateEditor } from "platejs/react";

import type {
	TBlockRef,
	TRichEditorCaptureCursorOptions,
	TCursorRef,
	TRichEditorOutlineItem,
} from "@/editor-api";

type TCursorRefState = {
	editor: PlateEditor;
	pointRef: PointRef;
	released: boolean;
};

type TBlockRefState = {
	editor: PlateEditor;
	pathRef: PathRef;
	released: boolean;
};

const HEADING_LEVELS = new Map<string, TRichEditorOutlineItem["level"]>([
	["h1", 1],
	["h2", 2],
	["h3", 3],
	["h4", 4],
	["h5", 5],
	["h6", 6],
]);

const cursorRefStates = new WeakMap<TCursorRef, TCursorRefState>();
const cursorRefsByEditor = new WeakMap<PlateEditor, Set<TCursorRefState>>();
const blockRefStates = new WeakMap<TBlockRef, TBlockRefState>();
const blockRefsByEditor = new WeakMap<PlateEditor, Set<TBlockRefState>>();
let nextBlockKey = 0;

const releaseCursorState = (state: TCursorRefState): void => {
	if (state.released) return;

	state.pointRef.unref();
	state.released = true;
	cursorRefsByEditor.get(state.editor)?.delete(state);
};

const releaseBlockState = (state: TBlockRefState): void => {
	if (state.released) return;

	state.pathRef.unref();
	state.released = true;
	blockRefsByEditor.get(state.editor)?.delete(state);
};

/** Creates an editor-bound point reference without exposing Plate types. */
export const captureCursor = (
	editor: PlateEditor,
	options: TRichEditorCaptureCursorOptions,
): TCursorRef | null => {
	if (!editor.selection) return null;

	const point =
		options.position === "start"
			? RangeApi.start(editor.selection)
			: RangeApi.end(editor.selection);
	const pointRef = editor.api.pointRef(point, {
		// Repeated insertion at this cursor continues after previously inserted text.
		affinity: "forward",
	});
	let cursor: TCursorRef;
	cursor = {
		release: () => {
			const state = cursorRefStates.get(cursor);
			if (state) releaseCursorState(state);
		},
	} as TCursorRef;

	const state = { editor, pointRef, released: false };
	cursorRefStates.set(cursor, state);
	const refs = cursorRefsByEditor.get(editor) ?? new Set<TCursorRefState>();
	refs.add(state);
	cursorRefsByEditor.set(editor, refs);
	return cursor;
};

/** Resolves a cursor only inside the editor instance that created it. */
export const resolveCursor = (
	editor: PlateEditor,
	cursor: TCursorRef,
): Point | null => {
	const state = cursorRefStates.get(cursor);
	if (!state || state.released || state.editor !== editor) return null;

	return state.pointRef.current;
};

const createBlockRef = (
	editor: PlateEditor,
	path: Path,
): TBlockRef => {
	let block: TBlockRef;
	block = {
		release: () => {
			const state = blockRefStates.get(block);
			if (state) releaseBlockState(state);
		},
	} as TBlockRef;

	const state = {
		editor,
		pathRef: editor.api.pathRef(path, { affinity: "forward" }),
		released: false,
	};
	blockRefStates.set(block, state);
	const refs = blockRefsByEditor.get(editor) ?? new Set<TBlockRefState>();
	refs.add(state);
	blockRefsByEditor.set(editor, refs);
	return block;
};

/**
 * Reads the live heading outline and creates editor-bound block references.
 * Paths remain internal; callers receive only opaque, operation-aware refs.
 */
export const getOutline = (editor: PlateEditor): TRichEditorOutlineItem[] => {
	const items: TRichEditorOutlineItem[] = [];

	for (const [node, path] of editor.api.nodes<TElement>({
		at: [],
		match: (candidate) =>
			ElementApi.isElement(candidate) &&
			HEADING_LEVELS.has(String(candidate.type)),
	})) {
		const level = HEADING_LEVELS.get(String(node.type));
		if (!level) continue;
		const key =
			typeof node.id === "string"
				? node.id
				: `rich-editor-block-${++nextBlockKey}`;

		items.push({
			key,
			block: createBlockRef(editor, path),
			level,
			text: NodeApi.string(node),
		});
	}

	return items;
};

/** Resolves a tracked path so document operations do not stale the block ref. */
export const resolveBlock = (
	editor: PlateEditor,
	block: TBlockRef,
): Path | null => {
	const state = blockRefStates.get(block);
	if (!state || state.released || state.editor !== editor) return null;

	return state.pathRef.current;
};

/** Releases every tracked location when its editor instance is disposed. */
export const releaseEditorLocationRefs = (editor: PlateEditor): void => {
	const cursorRefs = cursorRefsByEditor.get(editor);
	if (cursorRefs) {
		for (const state of cursorRefs) releaseCursorState(state);
		cursorRefs.clear();
		cursorRefsByEditor.delete(editor);
	}

	const blockRefs = blockRefsByEditor.get(editor);
	if (blockRefs) {
		for (const state of blockRefs) releaseBlockState(state);
		blockRefs.clear();
		blockRefsByEditor.delete(editor);
	}
};

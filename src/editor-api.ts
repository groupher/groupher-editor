import type { TRichEditorValue } from "./types";

declare const richEditorCursorRefBrand: unique symbol;
declare const richEditorBlockRefBrand: unique symbol;

/**
 * An opaque reference to a logical cursor position in one editor instance.
 *
 * The reference follows document operations until its target is deleted, its
 * editor is disposed, or `release()` is called. Consumers should release it as
 * soon as an asynchronous interaction no longer needs the saved position.
 */
export type TCursorRef = {
	readonly [richEditorCursorRefBrand]: true;
	release: () => void;
};

/**
 * An opaque reference to a block in one editor instance.
 *
 * Consumers can compare or retain the reference, but cannot inspect or create
 * it. The editor resolves the block's live position when a command executes.
 * Release outline block references when the surrounding UI no longer needs
 * them.
 */
export type TBlockRef = {
	readonly [richEditorBlockRefBrand]: true;
	release: () => void;
};

/** A live heading exposed by the editor without leaking Plate node paths. */
export type TRichEditorOutlineItem = {
	/** Stable React key for this item while the outline snapshot is retained. */
	key: string;
	/** Opaque block reference accepted by a `block` location. */
	block: TBlockRef;
	level: 1 | 2 | 3 | 4 | 5 | 6;
	text: string;
};

/**
 * A generic insertion location.
 *
 * - `document` addresses a root document boundary and also works when empty.
 * - `selection` uses the live selection when the command runs, like paste.
 * - `cursor` uses a position previously returned by `captureCursor()`.
 * - `block` inserts a sibling immediately before or after a referenced block.
 */
export type TLocation =
	| {
			type: "document";
			position: "start" | "end";
	  }
	| {
			type: "selection";
	  }
	| {
			type: "cursor";
			cursor: TCursorRef;
	  }
	| {
			type: "block";
			block: TBlockRef;
			position: "before" | "after";
	  };

export type TRichEditorCaptureCursorOptions = {
	/** Boundary to save when the current selection is expanded. */
	position: "start" | "end";
};

export type TRichEditorCommandResult =
	| { ok: true }
	| {
			ok: false;
			reason:
				| "empty-content"
				| "invalid-content"
				| "location-expired"
				| "location-unavailable";
	  };

export type TRichEditorHandle = {
	/**
	 * Inserts cloned content as one undo batch. The command never remounts or
	 * focuses the editor and never mutates the caller-owned content. On success,
	 * the internal selection moves to the end of the inserted content; call
	 * `focus()` separately when the surrounding UI is ready.
	 */
	insertContent: (
		content: TRichEditorValue,
		/** Location resolved against the live editor when the command executes. */
		location: TLocation,
	) => TRichEditorCommandResult;
	/**
	 * Saves one boundary of the current selection. Returns `null` when the editor
	 * has no live selection.
	 */
	captureCursor: (
		options: TRichEditorCaptureCursorOptions,
	) => TCursorRef | null;
	/**
	 * Returns the current heading outline in document order. Release each item's
	 * block reference when the outline snapshot is discarded.
	 */
	getOutline: () => TRichEditorOutlineItem[];
	/** Focuses the editable DOM without changing document content. */
	focus: () => void;
};

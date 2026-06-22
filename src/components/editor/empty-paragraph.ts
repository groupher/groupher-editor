import { KEYS, type TElement, type TNode, type TText } from "platejs";
import type { PlateEditor } from "platejs/react";

export type TEmptyParagraphAnchor = {
	caretRect: DOMRect | null;
	lineRect: DOMRect;
};

export const getCurrentEmptyParagraphAnchor = (
	container: HTMLElement,
	editor: PlateEditor,
): TEmptyParagraphAnchor | null => {
	const selection = window.getSelection();

	if (!selection || selection.rangeCount === 0) return null;
	if (!selection.isCollapsed || !editor.selection) return null;
	if (!selection.anchorNode || !container.contains(selection.anchorNode)) {
		return null;
	}

	if (!isEmptyParagraphSelection(editor)) return null;

	const range = selection.getRangeAt(0);
	const caretRect = getUsableRangeRect(range);
	const element = getSelectionElement(selection.anchorNode);
	const lineRect = element?.getBoundingClientRect() ?? caretRect;

	if (hasVisibleDomText(element)) return null;
	if (!lineRect) return null;

	return {
		caretRect,
		lineRect,
	};
};

const isEmptyParagraphSelection = (editor: PlateEditor) => {
	const entries = Array.from(editor.api.blocks({ mode: "lowest" }));
	const entry = entries[0];

	if (!entry) return false;

	const [node] = entry;
	const element = node as TElement;

	if (element.type !== KEYS.p) return false;
	if (element.listStyleType || element[KEYS.listType]) return false;

	return getNodeText(element).trim().length === 0;
};

const getNodeText = (node: TNode): string => {
	if ("text" in node) return (node as TText).text ?? "";

	const children = (node as TElement).children;

	if (!Array.isArray(children)) return "";

	return children.map((child) => getNodeText(child as TNode)).join("");
};

const getUsableRangeRect = (range: Range) => {
	const rects = Array.from(range.getClientRects());
	const rect =
		rects.find((item) => item.height > 0) ?? range.getBoundingClientRect();

	if (rect.height > 0) return rect;

	return null;
};

const getSelectionElement = (node: Node) => {
	const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;

	return element?.closest<HTMLElement>('[data-slate-node="element"]') ?? null;
};

const hasVisibleDomText = (element: HTMLElement | null | undefined) => {
	const text = (element?.textContent ?? "")
		.replace(/[\u200B-\u200D\uFEFF]/g, "")
		.trim();

	return text.length > 0;
};

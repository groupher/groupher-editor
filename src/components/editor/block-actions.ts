"use client";

import type { ReactNode } from "react";

import { KEYS, type TElement } from "platejs";
import type { PlateEditor } from "platejs/react";

export const RICH_EDITOR_BUILTIN_BLOCK_ACTION_IDS = [
	"paragraph",
	"heading1",
	"heading2",
	"heading3",
	"bulletedList",
	"numberedList",
	"todoList",
	"toggle",
	"callout",
	"blockquote",
] as const;

export type TRichEditorBuiltinBlockActionId =
	(typeof RICH_EDITOR_BUILTIN_BLOCK_ACTION_IDS)[number];

export type TRichEditorListStyleType = "disc" | "decimal" | "todo";

export type TRichEditorActionContext = {
	setBlockType: (type: string, attrs?: Record<string, unknown>) => void;
	setListType: (listStyleType: TRichEditorListStyleType) => void;
	insertBlock: (node: TElement) => void;
	focus: () => void;
};

export type TRichEditorQuickActionCommand =
	| {
			type: "set-block";
			blockType: string;
			attrs?: Record<string, unknown>;
	  }
	| {
			type: "set-list";
			listStyleType: TRichEditorListStyleType;
	  }
	| {
			type: "insert-block";
			node: TElement | ((context: TRichEditorActionContext) => TElement);
	  }
	| ((context: TRichEditorActionContext) => void);

export type TRichEditorCustomQuickAction = {
	id: string;
	label: string;
	icon?: ReactNode;
	command: TRichEditorQuickActionCommand;
	disabled?: boolean;
};

export type TRichEditorQuickAction =
	| TRichEditorBuiltinBlockActionId
	| TRichEditorCustomQuickAction;

export type TRichEditorQuickActionsConfig =
	| false
	| {
			placement?: "right";
			visibleCount?: number;
			items?: TRichEditorQuickAction[];
			className?: string;
	  };

export const DEFAULT_QUICK_ACTION_ITEMS: TRichEditorBuiltinBlockActionId[] = [
	"heading1",
	"bulletedList",
	"callout",
	"blockquote",
];

const listStyleTypes = new Set<TRichEditorListStyleType>([
	"disc",
	"decimal",
	"todo",
]);

const listValueMap: Record<string, TRichEditorListStyleType> = {
	[KEYS.ul]: "disc",
	[KEYS.ol]: "decimal",
	[KEYS.listTodo]: "todo",
};

const listNodeKeys = [KEYS.listType, "indent", "listStyleType", "checked"];

export const getVisibleQuickActionItems = (
	config?: TRichEditorQuickActionsConfig,
): TRichEditorQuickAction[] => {
	if (config === false) return [];

	const items = config?.items?.length ? config.items : DEFAULT_QUICK_ACTION_ITEMS;
	const visibleCount = config?.visibleCount ?? items.length;

	return items.slice(0, Math.max(0, visibleCount));
};

export const getQuickActionsInset = (
	config?: TRichEditorQuickActionsConfig,
) => {
	const visibleCount = getVisibleQuickActionItems(config).length;

	if (visibleCount === 0) return 0;

	return 56 + visibleCount * 40;
};

export const isListActionValue = (value: string) => value in listValueMap;

export const setBlockType = (
	editor: PlateEditor,
	type: string,
	attrs: Record<string, unknown> = {},
) => {
	editor.tf.withoutNormalizing(() => {
		const entries = editor.api.blocks({ mode: "lowest" });

		for (const [node, path] of entries) {
			if ((node as TElement)[KEYS.listType] || (node as TElement).listStyleType) {
				editor.tf.unsetNodes(listNodeKeys, { at: path });
			}

			editor.tf.setNodes({ type, ...attrs } as Partial<TElement>, { at: path });
		}
	});
};

export const setListType = (
	editor: PlateEditor,
	listStyleType: TRichEditorListStyleType,
) => {
	if (!listStyleTypes.has(listStyleType)) return;

	editor.tf.withoutNormalizing(() => {
		const entries = editor.api.blocks({ mode: "lowest" });

		for (const [, path] of entries) {
			editor.tf.setNodes(
				{
					indent: 1,
					listStyleType,
					checked: listStyleType === "todo" ? false : undefined,
				} as Partial<TElement>,
				{ at: path },
			);
		}
	});
};

export const applyBlockActionValue = (editor: PlateEditor, value: string) => {
	const listStyleType = listValueMap[value];

	if (listStyleType) {
		setListType(editor, listStyleType);
		return;
	}

	setBlockType(editor, value);
};

export const getBuiltinQuickActionCommand = (
	id: TRichEditorBuiltinBlockActionId,
): TRichEditorQuickActionCommand => {
	switch (id) {
		case "paragraph":
			return { type: "set-block", blockType: KEYS.p };
		case "heading1":
			return { type: "set-block", blockType: KEYS.h1 };
		case "heading2":
			return { type: "set-block", blockType: KEYS.h2 };
		case "heading3":
			return { type: "set-block", blockType: KEYS.h3 };
		case "bulletedList":
			return { type: "set-list", listStyleType: "disc" };
		case "numberedList":
			return { type: "set-list", listStyleType: "decimal" };
		case "todoList":
			return { type: "set-list", listStyleType: "todo" };
		case "toggle":
			return { type: "set-block", blockType: KEYS.toggle };
		case "callout":
			return { type: "set-block", blockType: KEYS.callout, attrs: { icon: "💡" } };
		case "blockquote":
			return { type: "set-block", blockType: KEYS.blockquote };
	}
};

export const createRichEditorActionContext = (
	editor: PlateEditor,
): TRichEditorActionContext => ({
	setBlockType: (type, attrs) => setBlockType(editor, type, attrs),
	setListType: (listStyleType) => setListType(editor, listStyleType),
	insertBlock: (node) => editor.tf.insertNodes(node),
	focus: () => editor.tf.focus(),
});

export const applyQuickActionCommand = (
	editor: PlateEditor,
	command: TRichEditorQuickActionCommand,
) => {
	const context = createRichEditorActionContext(editor);

	if (typeof command === "function") {
		command(context);
		context.focus();
		return;
	}

	switch (command.type) {
		case "set-block":
			context.setBlockType(command.blockType, command.attrs);
			break;
		case "set-list":
			context.setListType(command.listStyleType);
			break;
		case "insert-block": {
			const node =
				typeof command.node === "function" ? command.node(context) : command.node;
			context.insertBlock(node);
			break;
		}
	}

	context.focus();
};

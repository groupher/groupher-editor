import type {
	ForwardRefExoticComponent,
	ReactNode,
	RefAttributes,
} from "react";
import type { TElement } from "platejs";

import type { TRichEditorHandle } from "./editor-api";
import type { TRichEditorValue } from "./types";

export type {
	TBlockRef,
	TRichEditorCaptureCursorOptions,
	TRichEditorCommandResult,
	TCursorRef,
	TLocation,
	TRichEditorHandle,
	TRichEditorOutlineItem,
} from "./editor-api";
export type { TRichEditorValue } from "./types";
export type TRichEditorLocale = "en" | "zh-CN";

export type TRichEditorMentionOption = {
	key: string;
	text: string;
};

export type TRichEditorBuiltinBlockActionId =
	| "paragraph"
	| "heading1"
	| "heading2"
	| "heading3"
	| "bulletedList"
	| "numberedList"
	| "todoList"
	| "toggle"
	| "callout"
	| "blockquote";

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

export type TRichEditorProps = {
	defaultValue?: TRichEditorValue;
	onChange?: (value: TRichEditorValue) => void;
	className?: string;
	debugMode?: boolean;
	locale?: TRichEditorLocale;
	mentionOptions?: TRichEditorMentionOption[];
	onMentionSearch?: (query: string) => void;
	quickActions?: TRichEditorQuickActionsConfig;
};

declare const RichEditor: ForwardRefExoticComponent<
	TRichEditorProps & RefAttributes<TRichEditorHandle>
>;

export default RichEditor;

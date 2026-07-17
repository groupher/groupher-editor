import type { ComponentType } from "react";

import type {
	TRichEditorLocale,
	TRichEditorMentionOption,
} from "./index";
import type { TRichEditorDiffValue } from "./diff/types";

export type { TRichEditorDiffValue } from "./diff/types";

export type TRichEditorDiffProps = {
	diffValue: TRichEditorDiffValue;
	className?: string;
	locale?: TRichEditorLocale;
	mentionOptions?: TRichEditorMentionOption[];
};

export declare const RichEditorDiff: ComponentType<TRichEditorDiffProps>;

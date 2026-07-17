import "./global.css";

import RichEditorDiffContent from "@/RichEditorDiffContent";
import { I18nProvider, type TLocale } from "@/i18n";
import { MentionProvider, type TMentionOption } from "@/mention-context";
import type { TRichEditorDiffValue } from "@/diff/types";

export type TRichEditorDiffProps = {
	diffValue: TRichEditorDiffValue;
	className?: string;
	locale?: TLocale;
	mentionOptions?: TMentionOption[];
};

export function RichEditorDiff({
	diffValue,
	className,
	locale,
	mentionOptions,
}: TRichEditorDiffProps) {
	return (
		<I18nProvider locale={locale}>
			<MentionProvider mentionOptions={mentionOptions}>
				<RichEditorDiffContent diffValue={diffValue} className={className} />
			</MentionProvider>
		</I18nProvider>
	);
}

export type { TRichEditorDiffValue } from "@/diff/types";

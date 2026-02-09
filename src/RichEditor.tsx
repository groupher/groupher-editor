import * as React from "react";

import type { Value } from "platejs";

import { Bold, Italic, Strikethrough, Underline } from "lucide-react";
import { Plate, usePlateEditor } from "platejs/react";

import { EditorKit } from "@/components/editor/editor-kit";
import { ActionBar } from "@/components/ui/action-bar";
import { Button } from "@/components/ui/button";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { FloatingToolbar } from "@/components/ui/floating-toolbar";
import { LinkToolbarButton } from "@/components/ui/link-toolbar-button";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { I18nProvider, type TLocale, useI18n } from "@/i18n";
import { MentionProvider, type TMentionOption } from "@/mention-context";

const storageKey = "groupher-rich-editor-value";

const defaultValue: Value = [
	{
		type: "h1",
		children: [{ text: "Plate Editor" }],
	},
	{
		type: "p",
		children: [
			{ text: "Use " },
			{ text: "/", bold: true },
			{ text: " to open the slash menu and " },
			{ text: "@", bold: true },
			{ text: " to mention." },
		],
	},
	{
		type: "blockquote",
		children: [{ text: "A short quote block for emphasis." }],
	},
	{
		type: "callout",
		icon: "💡",
		children: [{ text: "Callout blocks highlight important notes." }],
	},
	{
		type: "toggle",
		id: "toggle-1",
		children: [{ text: "Toggle blocks can hide content." }],
	},
	{
		type: "p",
		indent: 1,
		listStyleType: "disc",
		children: [{ text: "Bulleted list item." }],
	},
	{
		type: "p",
		indent: 1,
		listStyleType: "decimal",
		children: [{ text: "Numbered list item." }],
	},
	{
		type: "p",
		indent: 1,
		listStyleType: "todo",
		checked: false,
		children: [{ text: "Todo list item." }],
	},
];

type TRichEditorProps = {
	locale?: TLocale;
	mentionOptions?: TMentionOption[];
	onMentionSearch?: (query: string) => void;
};

function RichEditorInner() {
	const i18n = useI18n();
	const [value, setValue] = React.useState<Value>(() => {
		if (typeof window === "undefined") return defaultValue;

		const savedValue = localStorage.getItem(storageKey);

		if (!savedValue) return defaultValue;

		try {
			return JSON.parse(savedValue) as Value;
		} catch {
			return defaultValue;
		}
	});
	const [jsonInput, setJsonInput] = React.useState("");
	const [jsonError, setJsonError] = React.useState("");
	const [readOnlyValue, setReadOnlyValue] = React.useState<Value>(value);

	const editor = usePlateEditor({
		plugins: EditorKit,
		value,
	});
	const readOnlyEditor = usePlateEditor({
		plugins: EditorKit,
		value: readOnlyValue,
	});

	const handleExport = React.useCallback(() => {
		const nextJson = JSON.stringify(value, null, 2);
		setJsonInput(nextJson);
		setReadOnlyValue(value);
		setJsonError("");
	}, [value]);

	const handleRenderReadonly = React.useCallback(() => {
		try {
			const parsed = JSON.parse(jsonInput) as Value;
			setReadOnlyValue(parsed);
			setJsonError("");
		} catch {
			setJsonError(i18n.export.invalidJson);
		}
	}, [i18n.export.invalidJson, jsonInput]);

	React.useEffect(() => {
		readOnlyEditor.tf.setValue(readOnlyValue);
	}, [readOnlyEditor, readOnlyValue]);

	return (
		<div className="m-6 space-y-6">
		<Plate
			editor={editor}
			onChange={({ value }) => {
				setValue(value);
				localStorage.setItem(storageKey, JSON.stringify(value));
			}}
		>
				<FloatingToolbar>
					<MarkToolbarButton nodeType="bold" tooltip={i18n.toolbar.bold}>
						<Bold className="size-4" />
					</MarkToolbarButton>
					<MarkToolbarButton nodeType="italic" tooltip={i18n.toolbar.italic}>
						<Italic className="size-4" />
					</MarkToolbarButton>
					<MarkToolbarButton
						nodeType="underline"
						tooltip={i18n.toolbar.underline}
					>
						<Underline className="size-4" />
					</MarkToolbarButton>
					<MarkToolbarButton
						nodeType="strikethrough"
						tooltip={i18n.toolbar.strikethrough}
					>
						<Strikethrough className="size-4" />
					</MarkToolbarButton>
					<LinkToolbarButton />
				</FloatingToolbar>

			<EditorContainer>
				<Editor placeholder={i18n.placeholder} />
				<ActionBar />
			</EditorContainer>
		</Plate>

			<div className="rounded-lg border border-border bg-card p-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h3 className="text-sm font-semibold">{i18n.export.title}</h3>
					<div className="flex items-center gap-2">
						<Button size="sm" onClick={handleExport}>
							{i18n.export.button}
						</Button>
						<Button size="sm" variant="outline" onClick={handleRenderReadonly}>
							{i18n.export.loadButton}
						</Button>
					</div>
				</div>
				<textarea
					className="mt-3 h-40 w-full rounded-md border border-input bg-background p-3 text-xs font-mono text-foreground"
					placeholder={i18n.export.placeholder}
					value={jsonInput}
					onChange={(event) => setJsonInput(event.target.value)}
				/>
				{jsonError ? (
					<p className="mt-2 text-xs text-destructive">{jsonError}</p>
				) : null}
			</div>

			<div className="rounded-lg border border-border bg-card">
				<div className="border-b border-border px-4 py-2 text-sm font-semibold">
					{i18n.export.readonlyTitle}
				</div>
				<Plate editor={readOnlyEditor} readOnly>
					<EditorContainer>
						<Editor variant="demo" />
					</EditorContainer>
				</Plate>
			</div>
		</div>
	);
}

export default function RichEditor({
	locale,
	mentionOptions,
	onMentionSearch,
}: TRichEditorProps) {
	return (
		<I18nProvider locale={locale}>
			<MentionProvider
				mentionOptions={mentionOptions}
				onMentionSearch={onMentionSearch}
			>
				<RichEditorInner />
			</MentionProvider>
		</I18nProvider>
	);
}

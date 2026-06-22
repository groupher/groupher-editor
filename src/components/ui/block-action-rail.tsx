"use client";

import * as React from "react";

import {
	ChevronRightIcon,
	Heading1Icon,
	Heading2Icon,
	Heading3Icon,
	LightbulbIcon,
	ListIcon,
	ListOrdered,
	PilcrowIcon,
	Quote,
	Square,
} from "lucide-react";
import {
	useEditorRef,
	useEditorVersion,
	useSelectionVersion,
} from "platejs/react";

import {
	applyQuickActionCommand,
	getBuiltinQuickActionCommand,
	getVisibleQuickActionItems,
	type TRichEditorBuiltinBlockActionId,
	type TRichEditorQuickAction,
	type TRichEditorQuickActionsConfig,
} from "@/components/editor/block-actions";
import { getCurrentEmptyParagraphAnchor } from "@/components/editor/empty-paragraph";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

type TBlockActionRailProps = {
	config?: TRichEditorQuickActionsConfig;
};

export function BlockActionRail({ config }: TBlockActionRailProps) {
	const editor = useEditorRef();
	const editorVersion = useEditorVersion();
	const selectionVersion = useSelectionVersion();
	const i18n = useI18n();
	const railRef = React.useRef<HTMLDivElement>(null);
	const [position, setPosition] = React.useState({
		top: 4,
		visible: false,
	});
	const actions = getVisibleQuickActionItems(config);

	React.useLayoutEffect(() => {
		const updatePosition = () => {
			const rail = railRef.current;
			const container = rail?.parentElement;

			if (!rail || !container) {
				setPosition((current) =>
					current.visible ? { ...current, visible: false } : current,
				);
				return;
			}

			const anchor = getCurrentEmptyParagraphAnchor(container, editor);

			if (!anchor) {
				setPosition((current) =>
					current.visible ? { ...current, visible: false } : current,
				);
				return;
			}

			const containerRect = container.getBoundingClientRect();
			const railHeight = rail.offsetHeight || 32;
			const targetRect = anchor.lineRect;
			const top =
				targetRect.top -
				containerRect.top +
				container.scrollTop +
				(targetRect.height - railHeight) / 2;

			setPosition({
				top: Math.max(4, top),
				visible: true,
			});
		};

		updatePosition();

		const container = railRef.current?.parentElement;

		container?.addEventListener("scroll", updatePosition, { passive: true });
		window.addEventListener("resize", updatePosition);
		document.addEventListener("selectionchange", updatePosition);

		return () => {
			container?.removeEventListener("scroll", updatePosition);
			window.removeEventListener("resize", updatePosition);
			document.removeEventListener("selectionchange", updatePosition);
		};
	}, [selectionVersion, editorVersion, actions.length]);

	if (actions.length === 0) return null;

	return (
		<div
			ref={railRef}
			style={{ top: position.top }}
			className={cn(
				"rich-editor-quick-actions rich-editor-quick-actions-linear pointer-events-none absolute right-0 z-20 flex h-8 items-center justify-end rounded-r-md pr-1.5 pl-8",
				position.visible ? "opacity-100" : "opacity-0",
				config && typeof config === "object" ? config.className : undefined,
			)}
		>
			<div className="row-center pointer-events-auto gap-1.5">
				{actions.map((action) => {
					const normalized = normalizeQuickAction(action, i18n);
					const command =
						typeof action === "string"
							? getBuiltinQuickActionCommand(action)
							: action.command;

					return (
						<Tooltip key={normalized.id}>
							<TooltipTrigger asChild>
								<button
									type="button"
									aria-label={normalized.label}
									disabled={normalized.disabled}
									className="align-both size-6 rounded-md border border-border bg-background/80 text-muted-foreground shadow-sm transition hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
									onMouseDown={(event) => event.preventDefault()}
									onClick={(event) => {
										event.preventDefault();
										if (normalized.disabled) return;
										applyQuickActionCommand(editor, command);
									}}
								>
									<span className="rich-editor-quick-action-icon align-both size-3.5">
										{normalized.icon}
									</span>
								</button>
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={6}>
								{normalized.label}
							</TooltipContent>
						</Tooltip>
					);
				})}
			</div>
		</div>
	);
}

const normalizeQuickAction = (
	action: TRichEditorQuickAction,
	i18n: ReturnType<typeof useI18n>,
) => {
	if (typeof action !== "string") {
		return {
			id: action.id,
			label: action.label,
			icon: action.icon ?? <Square className="size-full" />,
			disabled: action.disabled,
		};
	}

	return {
		id: action,
		label: getBuiltinActionLabel(action, i18n),
		icon: getBuiltinActionIcon(action),
		disabled: false,
	};
};

const getBuiltinActionLabel = (
	action: TRichEditorBuiltinBlockActionId,
	i18n: ReturnType<typeof useI18n>,
) => {
	switch (action) {
		case "paragraph":
			return i18n.slash.items.paragraph;
		case "heading1":
			return i18n.slash.items.heading1;
		case "heading2":
			return i18n.slash.items.heading2;
		case "heading3":
			return i18n.slash.items.heading3;
		case "bulletedList":
			return i18n.slash.items.bulletedList;
		case "numberedList":
			return i18n.slash.items.numberedList;
		case "todoList":
			return i18n.slash.items.todoList;
		case "toggle":
			return i18n.slash.items.toggle;
		case "callout":
			return i18n.slash.items.callout;
		case "blockquote":
			return i18n.slash.items.blockquote;
	}
};

const getBuiltinActionIcon = (action: TRichEditorBuiltinBlockActionId) => {
	switch (action) {
		case "paragraph":
			return <PilcrowIcon className="size-full" />;
		case "heading1":
			return <Heading1Icon className="size-full" />;
		case "heading2":
			return <Heading2Icon className="size-full" />;
		case "heading3":
			return <Heading3Icon className="size-full" />;
		case "bulletedList":
			return <ListIcon className="size-full" />;
		case "numberedList":
			return <ListOrdered className="size-full" />;
		case "todoList":
			return <Square className="size-full" />;
		case "toggle":
			return <ChevronRightIcon className="size-full" />;
		case "callout":
			return <LightbulbIcon className="size-full" />;
		case "blockquote":
			return <Quote className="size-full" />;
	}
};

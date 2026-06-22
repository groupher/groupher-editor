"use client";

import * as React from "react";

import {
	useEditorRef,
	useEditorVersion,
	useSelectionVersion,
} from "platejs/react";

import { getCurrentEmptyParagraphAnchor } from "@/components/editor/empty-paragraph";
import { renderEditorPlaceholderContent } from "@/components/ui/editor-placeholder";
import { cn } from "@/lib/utils";

type TBlockPlaceholderProps = {
	className?: string;
	text: string;
};

export function BlockPlaceholder({ className, text }: TBlockPlaceholderProps) {
	const editor = useEditorRef();
	const editorVersion = useEditorVersion();
	const selectionVersion = useSelectionVersion();
	const placeholderRef = React.useRef<HTMLDivElement>(null);
	const [position, setPosition] = React.useState({
		left: 0,
		maxWidth: 0,
		top: 4,
		visible: false,
	});

	React.useLayoutEffect(() => {
		const updatePosition = () => {
			const placeholder = placeholderRef.current;
			const container = placeholder?.parentElement;

			if (!placeholder || !container || !text) {
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
			const placeholderHeight = placeholder.offsetHeight || anchor.lineRect.height;
			const textRect = anchor.caretRect ?? anchor.lineRect;
			const left = textRect.left - containerRect.left + container.scrollLeft;
			const top =
				anchor.lineRect.top -
				containerRect.top +
				container.scrollTop +
				(anchor.lineRect.height - placeholderHeight) / 2;
			const maxWidth = Math.max(0, containerRect.right - textRect.left - 12);

			setPosition({
				left: Math.max(0, left),
				maxWidth,
				top: Math.max(4, top),
				visible: true,
			});
		};

		updatePosition();

		const container = placeholderRef.current?.parentElement;

		container?.addEventListener("scroll", updatePosition, { passive: true });
		window.addEventListener("resize", updatePosition);
		document.addEventListener("selectionchange", updatePosition);

		return () => {
			container?.removeEventListener("scroll", updatePosition);
			window.removeEventListener("resize", updatePosition);
			document.removeEventListener("selectionchange", updatePosition);
		};
	}, [selectionVersion, editorVersion, text, editor]);

	if (!text) return null;

	return (
		<div
			ref={placeholderRef}
			aria-hidden="true"
			style={{
				left: position.left,
				maxWidth: position.maxWidth,
				top: position.top,
			}}
			className={cn(
				"pointer-events-none absolute z-10",
				position.visible ? "opacity-100" : "opacity-0",
				className,
			)}
		>
			<span className="rich-editor-placeholder">
				{renderEditorPlaceholderContent(text)}
			</span>
		</div>
	);
}

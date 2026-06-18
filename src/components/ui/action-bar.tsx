"use client";

import * as React from "react";

import type { TElement } from "platejs";

import { ChevronUp, Heading1, List } from "lucide-react";
import { KEYS } from "platejs";
import { useEditorRef } from "platejs/react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const listTypes = new Set(["disc", "decimal", "todo"]);

const listStyleMap: Record<string, "disc" | "decimal" | "todo"> = {
	[KEYS.ul]: "disc",
	[KEYS.ol]: "decimal",
	[KEYS.listTodo]: "todo",
};

const setBlockType = (
	editor: ReturnType<typeof useEditorRef>,
	type: string,
) => {
	editor.tf.withoutNormalizing(() => {
		const entries = editor.api.blocks({ mode: "lowest" });

		for (const [node, path] of entries) {
			if ((node as TElement)[KEYS.listType]) {
				editor.tf.unsetNodes([KEYS.listType, "indent"], { at: path });
			}

			editor.tf.setNodes({ type }, { at: path });
		}
	});
};

const setListType = (
	editor: ReturnType<typeof useEditorRef>,
	listStyleType: "disc" | "decimal" | "todo",
) => {
	editor.tf.withoutNormalizing(() => {
		const entries = editor.api.blocks({ mode: "lowest" });

		for (const [node, path] of entries) {
			if (!listTypes.has(listStyleType)) return;

			editor.tf.setNodes(
				{
					indent: 1,
					listStyleType,
					checked: listStyleType === KEYS.listTodo ? false : undefined,
				},
				{ at: path },
			);

			if ((node as TElement)[KEYS.listType]) {
				editor.tf.setNodes({ listStyleType }, { at: path });
			}
		}
	});
};

export function ActionBar({ className }: { className?: string }) {
	const editor = useEditorRef();

	return (
		<div
			className={cn(
				"flex flex-wrap items-center gap-2 text-sm",
				className,
			)}
		>
			<ActionGroup
				label="标题"
				icon={<Heading1 className="size-4" />}
				items={[
					{ label: "H1", onSelect: () => setBlockType(editor, KEYS.h1) },
					{ label: "H2", onSelect: () => setBlockType(editor, KEYS.h2) },
					{ label: "H3", onSelect: () => setBlockType(editor, KEYS.h3) },
				]}
			/>
			<ActionGroup
				label="列表"
				icon={<List className="size-4" />}
				items={[
					{
						label: "有序列表",
						onSelect: () => setListType(editor, listStyleMap[KEYS.ol]),
					},
					{
						label: "无序列表",
						onSelect: () => setListType(editor, listStyleMap[KEYS.ul]),
					},
					{
						label: "待办列表",
						onSelect: () => setListType(editor, listStyleMap[KEYS.listTodo]),
					},
				]}
			/>
		</div>
	);
}

const actionButtonClassName =
	"group inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground";

function ActionGroup({
	icon,
	items,
	label,
}: {
	icon: React.ReactNode;
	label: string;
	items: Array<{ label: string; onSelect?: () => void }>;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button" className={actionButtonClassName}>
					<span className="text-muted-foreground opacity-60">{icon}</span>
					<span className="opacity-65 group-hover:opacity-100">{label}</span>
					<ChevronUp className="-ml-1.5 size-3 text-muted-foreground" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="top" align="start" className="min-w-28">
				{items.map((item) => (
					<DropdownMenuItem
						key={item.label}
						onSelect={(event) => {
							event.preventDefault();
							item.onSelect?.();
						}}
					>
						{item.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

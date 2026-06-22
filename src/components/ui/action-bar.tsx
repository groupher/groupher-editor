"use client";

import * as React from "react";

import { ChevronUp, Heading1, List } from "lucide-react";
import { KEYS } from "platejs";
import { useEditorRef } from "platejs/react";

import { setBlockType, setListType } from "@/components/editor/block-actions";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
						onSelect: () => setListType(editor, "decimal"),
					},
					{
						label: "无序列表",
						onSelect: () => setListType(editor, "disc"),
					},
					{
						label: "待办列表",
						onSelect: () => setListType(editor, "todo"),
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

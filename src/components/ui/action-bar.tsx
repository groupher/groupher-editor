"use client";

import * as React from "react";

import type { TElement } from "platejs";

import {
	AtSign,
	ChevronUp,
	Clock3,
	Heading1,
	Image as ImageIcon,
	List,
} from "lucide-react";
import { KEYS } from "platejs";
import { useEditorRef } from "platejs/react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
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

const tabs = ["用户", "帖子", "更新日志", "文档"];

export function ActionBar({ className }: { className?: string }) {
	const editor = useEditorRef();
	const [activeTab, setActiveTab] = React.useState(tabs[0]);

	return (
		<div
			className={cn(
				"sticky bottom-0 z-10 mt-4 flex flex-wrap items-center gap-3 bg-card/95 px-16 py-3 text-sm backdrop-blur sm:px-[max(64px,calc(50%-350px))]",
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
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button type="button" className={actionButtonClassName}>
						<span className="text-muted-foreground">
							<AtSign className="size-3.5" />
						</span>
						<span className="opacity-65 group-hover:opacity-100">提及</span>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent side="top" align="start" className="w-[280px]">
					<div className="p-2">
						<input
							className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
							placeholder="搜索..."
							type="search"
						/>
						<div className="mt-2 flex flex-wrap gap-1">
							{tabs.map((tab) => (
								<button
									key={tab}
									type="button"
									className={cn(
										"rounded-full border px-2 py-0.5 text-xs",
										tab === activeTab
											? "border-primary bg-primary/10 text-primary"
											: "border-border text-muted-foreground",
									)}
									onClick={() => setActiveTab(tab)}
								>
									{tab}
								</button>
							))}
						</div>
					</div>
					<DropdownMenuSeparator />
					<div className="px-2 pb-2 text-xs text-muted-foreground">
						结果列表由外部搜索提供
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
			<ActionGroup
				label="Image"
				icon={<ImageIcon className="size-4" />}
				items={[{ label: "本地图像" }, { label: "网络资源" }]}
			/>
			<ActionGroup
				label="Clock"
				icon={<Clock3 className="size-4" />}
				items={[{ label: "Undo" }, { label: "Redo" }, { label: "历史版本" }]}
			/>
		</div>
	);
}

const actionButtonClassName =
	"group inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-foreground transition hover:bg-accent";

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
			<DropdownMenuContent side="top" align="start">
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

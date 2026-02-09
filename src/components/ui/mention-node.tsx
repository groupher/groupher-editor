"use client";

import { useEffect, useMemo, useState } from "react";

import type { TComboboxInputElement, TMentionElement } from "platejs";
import type { PlateElementProps } from "platejs/react";

import { getMentionOnSelectItem } from "@platejs/mention";
import { KEYS } from "platejs";
import {
	PlateElement,
	useFocused,
	useReadOnly,
	useSelected,
} from "platejs/react";

import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { useMentionContext } from "@/mention-context";

import {
	InlineCombobox,
	InlineComboboxContent,
	InlineComboboxEmpty,
	InlineComboboxGroup,
	InlineComboboxInput,
	InlineComboboxItem,
} from "./inline-combobox";

const onSelectItem = getMentionOnSelectItem();

export function MentionElement(
	props: PlateElementProps<TMentionElement> & {
		prefix?: string;
	},
) {
	const element = props.element;

	const selected = useSelected();
	const focused = useFocused();
	const readOnly = useReadOnly();

	return (
		<PlateElement
			{...props}
			className={cn(
				"inline-block rounded-md bg-sky-100 px-1.5 py-0.5 align-baseline font-medium text-sky-900",
				!readOnly && "cursor-pointer",
				selected && focused && "ring-2 ring-ring",
				element.children[0][KEYS.bold] === true && "font-bold",
				element.children[0][KEYS.italic] === true && "italic",
				element.children[0][KEYS.underline] === true && "underline",
			)}
			attributes={{
				...props.attributes,
				contentEditable: false,
				"data-slate-value": element.value,
				draggable: true,
			}}
		>
			<>
				@{element.value}
				{props.children}
			</>
		</PlateElement>
	);
}

export function MentionInputElement(
	props: PlateElementProps<TComboboxInputElement>,
) {
	const { editor, element } = props;
	const [search, setSearch] = useState("");
	const i18n = useI18n();
	const { mentionOptions: mentionablesProp, onMentionSearch } =
		useMentionContext();

	const mentionOptions = useMemo(
		() => mentionablesProp ?? [],
		[mentionablesProp],
	);

	useEffect(() => {
		onMentionSearch?.(search);
	}, [onMentionSearch, search]);

	return (
		<PlateElement {...props} as="span">
			<InlineCombobox
				value={search}
				element={element}
				setValue={setSearch}
				showTrigger={false}
				trigger="@"
				filter={({ value }, query) => {
					if (query.length === 0) return true;

					return value.toLowerCase().includes(query.toLowerCase());
				}}
			>
				<span className="inline-block rounded-md bg-sky-100 px-1.5 py-0.5 align-baseline text-sm text-sky-900 ring-ring focus-within:ring-2">
					@
					<InlineComboboxInput />
				</span>

				<InlineComboboxContent className="my-1.5">
					<InlineComboboxEmpty>{i18n.mention.empty}</InlineComboboxEmpty>

					<InlineComboboxGroup>
						{mentionOptions.map((item) => (
							<InlineComboboxItem
								key={item.key}
								value={item.text}
								onClick={() => onSelectItem(editor, item, search)}
							>
								{item.text}
							</InlineComboboxItem>
						))}
					</InlineComboboxGroup>
				</InlineComboboxContent>
			</InlineCombobox>

			{props.children}
		</PlateElement>
	);
}

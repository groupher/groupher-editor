import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./global.css";
import RE from "@groupher/rich-editor";
import RichEditor from "./RichEditor.tsx";

const MENTION_OPTIONS = [
	{
		key: "0",
		text: "Alice",
	},
	{
		key: "1",
		text: "Bob",
	},
	{
		key: "2",
		text: "Simon",
	},
];

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found");
}

createRoot(rootElement).render(
	<StrictMode>
		<RichEditor mentionOptions={MENTION_OPTIONS} />
		<hr />
		<RE />
	</StrictMode>,
);

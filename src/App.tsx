import type { Value } from "platejs";

import {
  BlockquotePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { Plate, usePlateEditor } from "platejs/react";

import { Editor, EditorContainer } from "@/components/ui/editor";
import { BlockquoteElement } from "@/components/ui/blockquote-node";
import { H1Element, H2Element, H3Element } from "@/components/ui/heading-node";
import { ToolbarButton } from "@/components/ui/toolbar"; // Generic toolbar button

import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";

const initialValue: Value = [
  {
    children: [{ text: "Title" }],
    type: "h3",
  },
  {
    children: [{ text: "This is a quote." }],
    type: "blockquote",
  },
  {
    type: "p",
    children: [
      { text: "Hello! Try out the " },
      { text: "bold", bold: true },
      { text: ", " },
      { text: "italic", italic: true },
      { text: ", and " },
      { text: "underline", underline: true },
      { text: " formatting." },
    ],
  },
];

export default function App() {
  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      H1Plugin.withComponent(H1Element),
      H2Plugin.withComponent(H2Element),
      H3Plugin.withComponent(H3Element),
      BlockquotePlugin.withComponent(BlockquoteElement),
    ], // mark plugins
    value: initialValue, // initial content
  });

  return (
    <div className="m-5 debug">
      <Plate editor={editor}>
        <FixedToolbar className="justify-start rounded-t-lg">
          <ToolbarButton onClick={() => editor.tf.h1.toggle()}>H1</ToolbarButton>
          <ToolbarButton onClick={() => editor.tf.h2.toggle()}>H2</ToolbarButton>
          <ToolbarButton onClick={() => editor.tf.h3.toggle()}>H3</ToolbarButton>
          <ToolbarButton onClick={() => editor.tf.blockquote.toggle()}>Quote</ToolbarButton>

          <MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">
            B
          </MarkToolbarButton>
          <MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">
            I
          </MarkToolbarButton>
          <MarkToolbarButton nodeType="underline" tooltip="Underline (⌘+U)">
            U
          </MarkToolbarButton>
        </FixedToolbar>
        <EditorContainer>
          <Editor placeholder="Type your amazing content here..." />
        </EditorContainer>
      </Plate>
    </div>
  );
}

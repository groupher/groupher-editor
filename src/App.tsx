import type { Value } from "platejs";

import { StrictMode } from "react";

import { BoldPlugin, ItalicPlugin, UnderlinePlugin } from "@platejs/basic-nodes/react";
import { Plate, usePlateEditor } from "platejs/react";

import { Editor, EditorContainer } from "@/components/ui/editor";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";

const initialValue: Value = [
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
    plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin], // mark plugins
    value: initialValue, // initial content
  });

  return (
    <div className="m-5 debug">
      <StrictMode>
        <Plate editor={editor}>
          <FixedToolbar className="justify-start rounded-t-lg">
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
      </StrictMode>
    </div>
  );
}

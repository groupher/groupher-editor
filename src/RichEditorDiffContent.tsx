import * as React from "react";

import { Plate, usePlateEditor } from "platejs/react";

import { DiffEditorKit } from "@/components/editor/plugins/diff-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import type { TRichEditorDiffValue } from "@/diff/types";

type TProps = {
	diffValue: TRichEditorDiffValue;
	className?: string;
};

export default function RichEditorDiffContent({
	diffValue,
	className,
}: TProps) {
	const editor = usePlateEditor({
		plugins: DiffEditorKit,
		value: diffValue.nodes,
	});

	React.useEffect(() => {
		editor.tf.setValue(diffValue.nodes);
	}, [diffValue, editor]);

	return (
			<div className={className}>
				<Plate editor={editor} readOnly>
					<EditorContainer>
						<Editor className="px-3" />
					</EditorContainer>
				</Plate>
			</div>
	);
}

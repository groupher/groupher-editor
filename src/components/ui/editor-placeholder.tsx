import type { ReactNode } from "react";
import type { PlateContentProps } from "platejs/react";

type TRenderPlaceholder = NonNullable<PlateContentProps["renderPlaceholder"]>;

export const renderEditorPlaceholder: TRenderPlaceholder = ({
	attributes,
	children,
}) => {
	return (
		<span
			{...attributes}
			className="rich-editor-placeholder"
			style={{
				...attributes.style,
				display: "flex",
				opacity: 1,
				top: 0,
			}}
		>
			{renderEditorPlaceholderContent(children)}
		</span>
	);
};

export const renderEditorPlaceholderContent = (children: ReactNode) => {
	if (typeof children !== "string") return children;

	const slashIndex = children.indexOf("/");

	if (slashIndex === -1) return children;

	const before = children.slice(0, slashIndex).trimEnd();
	const after = children.slice(slashIndex + 1).trimStart();

	return (
		<>
			{before ? <span>{before}</span> : null}
			<span className="rich-editor-placeholder-key">/</span>
			{after ? <span>{after}</span> : null}
		</>
	);
};

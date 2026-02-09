import * as React from "react";

export type TMentionOption = {
	key: string;
	text: string;
};

type TMentionContextValue = {
	mentionOptions?: TMentionOption[];
	onMentionSearch?: (query: string) => void;
};

const MentionContext = React.createContext<TMentionContextValue>({});

export function MentionProvider({
	children,
	mentionOptions,
	onMentionSearch,
}: React.PropsWithChildren<TMentionContextValue>) {
	const value = React.useMemo(
		() => ({ mentionOptions, onMentionSearch }),
		[mentionOptions, onMentionSearch],
	);

	return (
		<MentionContext.Provider value={value}>{children}</MentionContext.Provider>
	);
}

export function useMentionContext() {
	return React.useContext(MentionContext);
}

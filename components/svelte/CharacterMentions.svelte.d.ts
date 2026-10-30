export default CharacterMentions;
type CharacterMentions = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const CharacterMentions: import("svelte").Component<{
    /**
     * Where the read is. Loading until the host says otherwise.
     */
    read?: import("./lib/types.js").MentionsRead;
    /**
     * Whose mentions, for the list's label and its empty line.
     */
    characterName?: string;
    /**
     * The chosen wording, or null.
     */
    selected?: string | null;
    /**
     * Reports a chosen wording; null when the chosen one is chosen again.
     */
    onselect?: (wording: string | null) => void;
}, {}, "">;
type Props = {
    /**
     * Where the read is. Loading until the host says otherwise.
     */
    read?: import("./lib/types.js").MentionsRead;
    /**
     * Whose mentions, for the list's label and its empty line.
     */
    characterName?: string;
    /**
     * The chosen wording, or null.
     */
    selected?: string | null;
    /**
     * Reports a chosen wording; null when the chosen one is chosen again.
     */
    onselect?: (wording: string | null) => void;
};

export default CharacterTable;
type CharacterTable = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const CharacterTable: import("svelte").Component<{
    /**
     * khaosd's character rows.
     */
    characters?: readonly import("./lib/characters.js").CharacterRecord[];
    /**
     * The cast; null while it is unread.
     */
    castings?: readonly import("./lib/characters.js").CharacterCasting[] | null;
    /**
     * The narrator's voice name, or "Not set".
     */
    narratorCast?: string;
    /**
     * Each character's voice readiness by id, the narrator's under `@narrator`. A missing one reads as unknown.
     */
    readiness?: Readonly<Record<string, {
        state: string;
        label: string;
    }>>;
    /**
     * Each character's analysis standing by id.
     */
    standings?: Readonly<Record<string, {
        state: string;
    }>>;
    /**
     * Each character's appearance state by id; a missing one is `none`. Null when the host reads no images.
     */
    appearance?: Readonly<Record<string, string>> | null;
    /**
     * Resolved headshot URLs by character id.
     */
    portraits?: Readonly<Record<string, string>>;
    /**
     * The selected row's id.
     */
    selected?: string;
    /**
     * Narrows the rows by text.
     */
    filter?: string;
    /**
     * Reports a selected row.
     */
    onselect?: (id: string) => void;
    /**
     * The characters' read: a failed or unfinished read is said, never shown as an empty story.
     */
    status?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * Try again after a failed read.
     */
    onretry?: () => void;
}, {}, "">;
type Props = {
    /**
     * khaosd's character rows.
     */
    characters?: readonly import("./lib/characters.js").CharacterRecord[];
    /**
     * The cast; null while it is unread.
     */
    castings?: readonly import("./lib/characters.js").CharacterCasting[] | null;
    /**
     * The narrator's voice name, or "Not set".
     */
    narratorCast?: string;
    /**
     * Each character's voice readiness by id, the narrator's under `@narrator`. A missing one reads as unknown.
     */
    readiness?: Readonly<Record<string, {
        state: string;
        label: string;
    }>>;
    /**
     * Each character's analysis standing by id.
     */
    standings?: Readonly<Record<string, {
        state: string;
    }>>;
    /**
     * Each character's appearance state by id; a missing one is `none`. Null when the host reads no images.
     */
    appearance?: Readonly<Record<string, string>> | null;
    /**
     * Resolved headshot URLs by character id.
     */
    portraits?: Readonly<Record<string, string>>;
    /**
     * The selected row's id.
     */
    selected?: string;
    /**
     * Narrows the rows by text.
     */
    filter?: string;
    /**
     * Reports a selected row.
     */
    onselect?: (id: string) => void;
    /**
     * The characters' read: a failed or unfinished read is said, never shown as an empty story.
     */
    status?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * Try again after a failed read.
     */
    onretry?: () => void;
};

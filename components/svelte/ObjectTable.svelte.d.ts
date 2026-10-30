export default ObjectTable;
type ObjectTable = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ObjectTable: import("svelte").Component<{
    /**
     * khaosd's object rows.
     */
    objects?: readonly import("./lib/places.js").ObjectRecord[];
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
     * The objects' read: a failed or unfinished read is said, never shown as an empty story.
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
     * khaosd's object rows.
     */
    objects?: readonly import("./lib/places.js").ObjectRecord[];
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
     * The objects' read: a failed or unfinished read is said, never shown as an empty story.
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

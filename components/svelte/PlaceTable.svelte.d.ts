export default PlaceTable;
type PlaceTable = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PlaceTable: import("svelte").Component<{
    /**
     * khaosd's place rows.
     */
    places?: readonly import("./lib/places.js").PlaceRecord[];
    /**
     * Each place's analysis standing by id.
     */
    standings?: Readonly<Record<string, {
        state: string;
    }>>;
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
     * The places' read: a failed or unfinished read is said, never shown as an empty story.
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
     * khaosd's place rows.
     */
    places?: readonly import("./lib/places.js").PlaceRecord[];
    /**
     * Each place's analysis standing by id.
     */
    standings?: Readonly<Record<string, {
        state: string;
    }>>;
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
     * The places' read: a failed or unfinished read is said, never shown as an empty story.
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

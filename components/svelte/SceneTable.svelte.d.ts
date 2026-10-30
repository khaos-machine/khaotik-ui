export default SceneTable;
type SceneTable = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SceneTable: import("svelte").Component<{
    /**
     * khaosd's scene rows.
     */
    scenes?: readonly import("./lib/scenes.js").SceneRecord[];
    /**
     * Each scene's analysis standing by id.
     */
    standings?: Readonly<Record<string, {
        state: string;
    }>>;
    /**
     * Read counts the host holds newer than the rows, by scene id: a read just made shows at once.
     */
    reads?: Readonly<Record<string, number>>;
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
     * The scenes' read: a failed or unfinished read is said, never shown as an empty story.
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
     * khaosd's scene rows.
     */
    scenes?: readonly import("./lib/scenes.js").SceneRecord[];
    /**
     * Each scene's analysis standing by id.
     */
    standings?: Readonly<Record<string, {
        state: string;
    }>>;
    /**
     * Read counts the host holds newer than the rows, by scene id: a read just made shows at once.
     */
    reads?: Readonly<Record<string, number>>;
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
     * The scenes' read: a failed or unfinished read is said, never shown as an empty story.
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

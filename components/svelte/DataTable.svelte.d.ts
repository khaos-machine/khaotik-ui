export default DataTable;
type DataTable = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const DataTable: import("svelte").Component<{
    /**
     * Every row. Only the window is rendered.
     */
    rows?: readonly any[];
    /**
     * Column definitions; `cell` is an optional snippet that draws the cell from its row.
     */
    columns?: readonly (import("./lib/table.js").Column<any> & {
        cell?: import("svelte").Snippet<[any]>;
    })[];
    /**
     * A row's stable id; the selection and the `data-ui-id` use it.
     */
    rowKey?: (row: any) => string;
    /**
     * The grid's accessible name.
     */
    label?: string;
    /**
     * The selected row's id.
     */
    selected?: string;
    /**
     * Asked with a row's id.
     */
    onselect?: (id: string) => void;
    /**
     * Asked with the selected row's id on Return or double-click.
     */
    onopen?: (id: string) => void;
    /**
     * Rows whose any column contains this text are shown.
     */
    filter?: string;
    /**
     * The sort. Controlled when given with `onsort`.
     */
    sort?: {
        key: string;
        dir: 1 | -1;
    } | null;
    /**
     * Asked with the sort a header click wants.
     */
    onsort?: (sort: {
        key: string;
        dir: 1 | -1;
    }) => void;
    /**
     * Groups rows under a header row with a count, in first-seen order.
     */
    groupBy?: (row: any) => string;
    /**
     * The body's height in px. 0 measures it.
     */
    viewportHeight?: number;
    /**
     * Every row's height in px; with `wrap`, the shortest row's.
     */
    rowHeight?: number;
    /**
     * Wraps long cells in full, so rows grow to fit their text; each is measured as it renders. A column with a `subtitle` measures rows the same way, without wrapping.
     */
    wrap?: boolean;
    /**
     * Rows rendered beyond each edge of the viewport.
     */
    overscan?: number;
    /**
     * What an empty table says instead of rendering nothing.
     */
    empty?: string;
    /**
     * The rows' read. Only a loaded read says `empty`: a table still reading says so, and a failed read shows the host's message and Try again, so a failed read never reads as an empty story. Rows already shown stay while a re-read runs or fails; a failure is said under them.
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
     * Try again after a failed read. Absent, the failure shows no button.
     */
    onretry?: () => void;
    /**
     * What a table still reading says.
     */
    loadingLabel?: string;
    /**
     * Rows pinned above the header, set off by a hairline: never sorted, filtered or counted with the body. They take the same columns, and the keyboard walks into them from the first row.
     */
    pinned?: readonly any[];
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * Every row. Only the window is rendered.
     */
    rows?: readonly any[];
    /**
     * Column definitions; `cell` is an optional snippet that draws the cell from its row.
     */
    columns?: readonly (import("./lib/table.js").Column<any> & {
        cell?: import("svelte").Snippet<[any]>;
    })[];
    /**
     * A row's stable id; the selection and the `data-ui-id` use it.
     */
    rowKey?: (row: any) => string;
    /**
     * The grid's accessible name.
     */
    label?: string;
    /**
     * The selected row's id.
     */
    selected?: string;
    /**
     * Asked with a row's id.
     */
    onselect?: (id: string) => void;
    /**
     * Asked with the selected row's id on Return or double-click.
     */
    onopen?: (id: string) => void;
    /**
     * Rows whose any column contains this text are shown.
     */
    filter?: string;
    /**
     * The sort. Controlled when given with `onsort`.
     */
    sort?: {
        key: string;
        dir: 1 | -1;
    } | null;
    /**
     * Asked with the sort a header click wants.
     */
    onsort?: (sort: {
        key: string;
        dir: 1 | -1;
    }) => void;
    /**
     * Groups rows under a header row with a count, in first-seen order.
     */
    groupBy?: (row: any) => string;
    /**
     * The body's height in px. 0 measures it.
     */
    viewportHeight?: number;
    /**
     * Every row's height in px; with `wrap`, the shortest row's.
     */
    rowHeight?: number;
    /**
     * Wraps long cells in full, so rows grow to fit their text; each is measured as it renders. A column with a `subtitle` measures rows the same way, without wrapping.
     */
    wrap?: boolean;
    /**
     * Rows rendered beyond each edge of the viewport.
     */
    overscan?: number;
    /**
     * What an empty table says instead of rendering nothing.
     */
    empty?: string;
    /**
     * The rows' read. Only a loaded read says `empty`: a table still reading says so, and a failed read shows the host's message and Try again, so a failed read never reads as an empty story. Rows already shown stay while a re-read runs or fails; a failure is said under them.
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
     * Try again after a failed read. Absent, the failure shows no button.
     */
    onretry?: () => void;
    /**
     * What a table still reading says.
     */
    loadingLabel?: string;
    /**
     * Rows pinned above the header, set off by a hairline: never sorted, filtered or counted with the body. They take the same columns, and the keyboard walks into them from the first row.
     */
    pinned?: readonly any[];
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};

export default MeasureTable;
type MeasureTable = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const MeasureTable: import("svelte").Component<{
    /**
     * One object per item. Each carries a label field plus a numeric field per measure. Rows the kit cannot read a number from render the label and an empty cell rather than a zero — an absent measurement is not a measurement of zero.
     */
    rows?: readonly Record<string, any>[];
    /**
     * Which field is the row's name. `label` by default, so a caller with a differently-named field maps once rather than reshaping every row.
     */
    labelKey?: string;
    /**
     * The columns, in the order given. Order is editorial and never inferred.
     */
    measures?: readonly {
        /**
         * The field to read off each row.
         */
        key: string;
        /**
         * Column heading, and what a sort control announces.
         */
        label: string;
        /**
         * Renders the number. Counts by default; a duration or a percentage belongs to the caller.
         */
        format?: (value: number) => string;
    }[];
    /**
     * Measure key to sort by, when the HOST owns sorting. Omit and the table sorts itself. `''` means the rows' own order, which is a real choice a host makes — the screenplay's order is not the same claim as "unsorted".
     */
    sortKey?: string;
    /**
     * Direction, when the host owns sorting.
     */
    sortDir?: "asc" | "desc";
    /**
     * Called when a heading is activated. A host that only wants to OBSERVE sorting can pass this alone.
     */
    onSort?: (sort: {
        key: string;
        dir: "asc" | "desc";
    }) => void;
    /**
     * Label of the emphasised row. The rest recede rather than disappearing — context is the point of showing all of them.
     */
    selectedKey?: string;
    /**
     * Called with the row the user picked. Omit it and rows are not interactive, so a read-only table announces no controls it does not have.
     */
    onSelect?: (row: Record<string, any>) => void;
    /**
     * Describes the table, announced as its accessible description.
     */
    caption?: string;
    /**
     * Rendered instead of the table when there is nothing to draw. A zeroed table reads as a measurement of nothing rather than as nothing measured.
     */
    emptyLabel?: string;
}, {}, "">;
type Props = {
    /**
     * One object per item. Each carries a label field plus a numeric field per measure. Rows the kit cannot read a number from render the label and an empty cell rather than a zero — an absent measurement is not a measurement of zero.
     */
    rows?: readonly Record<string, any>[];
    /**
     * Which field is the row's name. `label` by default, so a caller with a differently-named field maps once rather than reshaping every row.
     */
    labelKey?: string;
    /**
     * The columns, in the order given. Order is editorial and never inferred.
     */
    measures?: readonly {
        /**
         * The field to read off each row.
         */
        key: string;
        /**
         * Column heading, and what a sort control announces.
         */
        label: string;
        /**
         * Renders the number. Counts by default; a duration or a percentage belongs to the caller.
         */
        format?: (value: number) => string;
    }[];
    /**
     * Measure key to sort by, when the HOST owns sorting. Omit and the table sorts itself. `''` means the rows' own order, which is a real choice a host makes — the screenplay's order is not the same claim as "unsorted".
     */
    sortKey?: string;
    /**
     * Direction, when the host owns sorting.
     */
    sortDir?: "asc" | "desc";
    /**
     * Called when a heading is activated. A host that only wants to OBSERVE sorting can pass this alone.
     */
    onSort?: (sort: {
        key: string;
        dir: "asc" | "desc";
    }) => void;
    /**
     * Label of the emphasised row. The rest recede rather than disappearing — context is the point of showing all of them.
     */
    selectedKey?: string;
    /**
     * Called with the row the user picked. Omit it and rows are not interactive, so a read-only table announces no controls it does not have.
     */
    onSelect?: (row: Record<string, any>) => void;
    /**
     * Describes the table, announced as its accessible description.
     */
    caption?: string;
    /**
     * Rendered instead of the table when there is nothing to draw. A zeroed table reads as a measurement of nothing rather than as nothing measured.
     */
    emptyLabel?: string;
};

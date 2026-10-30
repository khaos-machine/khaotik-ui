export default EventLog;
type EventLog = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const EventLog: import("svelte").Component<{
    /**
     * The changes, in the order to show them (newest first).
     */
    events?: readonly {
        /**
         * A stable id, such as the ledger sequence.
         */
        id: string;
        /**
         * The day the row is grouped under, as the reader says it.
         */
        day?: string;
        /**
         * The time, formatted by the host.
         */
        time: string;
        /**
         * The change kind.
         */
        kind: string;
        /**
         * Who made it.
         */
        actor: string;
        /**
         * What it changed or decided.
         */
        change: string;
    }[];
    /**
     * Rows whose any column contains this text are shown.
     */
    filter?: string;
    /**
     * The selected event's id.
     */
    selected?: string;
    /**
     * Asked with an event's id.
     */
    onselect?: (id: string) => void;
    /**
     * The body's height in px. 0 measures it.
     */
    viewportHeight?: number;
    /**
     * The grid's accessible name.
     */
    label?: string;
    /**
     * What an empty log says.
     */
    empty?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The changes, in the order to show them (newest first).
     */
    events?: readonly {
        /**
         * A stable id, such as the ledger sequence.
         */
        id: string;
        /**
         * The day the row is grouped under, as the reader says it.
         */
        day?: string;
        /**
         * The time, formatted by the host.
         */
        time: string;
        /**
         * The change kind.
         */
        kind: string;
        /**
         * Who made it.
         */
        actor: string;
        /**
         * What it changed or decided.
         */
        change: string;
    }[];
    /**
     * Rows whose any column contains this text are shown.
     */
    filter?: string;
    /**
     * The selected event's id.
     */
    selected?: string;
    /**
     * Asked with an event's id.
     */
    onselect?: (id: string) => void;
    /**
     * The body's height in px. 0 measures it.
     */
    viewportHeight?: number;
    /**
     * The grid's accessible name.
     */
    label?: string;
    /**
     * What an empty log says.
     */
    empty?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};

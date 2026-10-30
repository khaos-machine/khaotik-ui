export default SourceList;
type SourceList = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SourceList: import("svelte").Component<{
    /**
     * The destinations, in sections, in order. ↑ ↓ walk them across section boundaries.
     */
    sections?: {
        id: string;
        label: string;
        items: {
            id: string;
            label: string;
            /**
             * Phosphor icon name.
             */
            icon?: string;
            /**
             * Rendered exactly as given, zero included. Absent when not given.
             */
            count?: number | null;
        }[];
    }[];
    /**
     * The active row's id.
     */
    active?: string;
    /**
     * Asked with a row's id on click and on ↑ ↓ Home End.
     */
    onselect?: (id: string) => void;
    /**
     * The navigation landmark's name.
     */
    label?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The destinations, in sections, in order. ↑ ↓ walk them across section boundaries.
     */
    sections?: {
        id: string;
        label: string;
        items: {
            id: string;
            label: string;
            /**
             * Phosphor icon name.
             */
            icon?: string;
            /**
             * Rendered exactly as given, zero included. Absent when not given.
             */
            count?: number | null;
        }[];
    }[];
    /**
     * The active row's id.
     */
    active?: string;
    /**
     * Asked with a row's id on click and on ↑ ↓ Home End.
     */
    onselect?: (id: string) => void;
    /**
     * The navigation landmark's name.
     */
    label?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};

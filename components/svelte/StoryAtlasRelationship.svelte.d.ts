export default StoryAtlasRelationship;
type StoryAtlasRelationship = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StoryAtlasRelationship: import("svelte").Component<{
    /**
     * First endpoint; null means no selected connection.
     */
    source?: {
        /**
         * Engine identity, reported unchanged on selection.
         */
        id: string;
        /**
         * Supplied human-readable name.
         */
        label: string;
        /**
         * Supplied entity kind, e.g. character or scene.
         */
        kind?: string;
    } | null;
    /**
     * Second endpoint.
     */
    target?: {
        /**
         * Engine identity, reported unchanged on selection.
         */
        id: string;
        /**
         * Supplied human-readable name.
         */
        label: string;
        /**
         * Supplied entity kind, e.g. character or scene.
         */
        kind?: string;
    } | null;
    /**
     * Supplied connection meaning, not inferred from endpoint kinds.
     */
    label?: string;
    /**
     * Optional supplied supporting evidence. No count or narrative relationship is invented.
     */
    evidence?: string;
    /**
     * Requests selection of an endpoint.
     */
    onSelectEndpoint?: (id: string) => void;
    /**
     * Requests clearing the connection selection.
     */
    onClear?: () => void;
}, {}, "">;
type Props = {
    /**
     * First endpoint; null means no selected connection.
     */
    source?: {
        /**
         * Engine identity, reported unchanged on selection.
         */
        id: string;
        /**
         * Supplied human-readable name.
         */
        label: string;
        /**
         * Supplied entity kind, e.g. character or scene.
         */
        kind?: string;
    } | null;
    /**
     * Second endpoint.
     */
    target?: {
        /**
         * Engine identity, reported unchanged on selection.
         */
        id: string;
        /**
         * Supplied human-readable name.
         */
        label: string;
        /**
         * Supplied entity kind, e.g. character or scene.
         */
        kind?: string;
    } | null;
    /**
     * Supplied connection meaning, not inferred from endpoint kinds.
     */
    label?: string;
    /**
     * Optional supplied supporting evidence. No count or narrative relationship is invented.
     */
    evidence?: string;
    /**
     * Requests selection of an endpoint.
     */
    onSelectEndpoint?: (id: string) => void;
    /**
     * Requests clearing the connection selection.
     */
    onClear?: () => void;
};

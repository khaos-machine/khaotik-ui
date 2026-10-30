export default StoryAtlasToolbar;
type StoryAtlasToolbar = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StoryAtlasToolbar: import("svelte").Component<{
    /**
     * Controlled visible entity type.
     */
    lens?: string;
    /**
     * Requests a different view; the host supplies its graph.
     */
    onLensChange?: (lens: string) => void;
    /**
     * Requests the overview camera position; without it there is no Recenter, for a host whose canvas has its own.
     */
    onRecenter?: () => void;
    /**
     * Prevents navigation while a graph is unavailable.
     */
    disabled?: boolean;
    /**
     * Optional app-owned view actions.
     */
    trailing?: import("svelte").Snippet;
}, {}, "">;
type Props = {
    /**
     * Controlled visible entity type.
     */
    lens?: string;
    /**
     * Requests a different view; the host supplies its graph.
     */
    onLensChange?: (lens: string) => void;
    /**
     * Requests the overview camera position; without it there is no Recenter, for a host whose canvas has its own.
     */
    onRecenter?: () => void;
    /**
     * Prevents navigation while a graph is unavailable.
     */
    disabled?: boolean;
    /**
     * Optional app-owned view actions.
     */
    trailing?: import("svelte").Snippet;
};

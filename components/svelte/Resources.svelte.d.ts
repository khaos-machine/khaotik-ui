export default Resources;
type Resources = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Resources: import("svelte").Component<{
    /**
     * The registry read.
     */
    state?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * The registry's artifacts, as ResourceCatalog takes them.
     */
    artifacts?: readonly any[];
    /**
     * The artifact shown, or ''.
     */
    selectedId?: string;
    /**
     * Its kind.
     */
    selectedKind?: string;
    /**
     * Its version shown.
     */
    selectedVersion?: string;
    /**
     * The selected artifact's body.
     */
    body?: string;
    /**
     * Where the shown body came from.
     */
    bodyMeta?: {
        version?: string;
        source?: string;
        hash?: string;
    } | undefined;
    /**
     * Why there is no body, when there is none; ResourceCatalog shows it as listed, not previewable.
     */
    bodyUnavailable?: string;
    /**
     * Reports an artifact, or a version of it, chosen.
     */
    onSelect?: (artifact: {
        id: string;
        kind: string;
    }, version?: string) => void;
}, {}, "">;
type Props = {
    /**
     * The registry read.
     */
    state?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * The registry's artifacts, as ResourceCatalog takes them.
     */
    artifacts?: readonly any[];
    /**
     * The artifact shown, or ''.
     */
    selectedId?: string;
    /**
     * Its kind.
     */
    selectedKind?: string;
    /**
     * Its version shown.
     */
    selectedVersion?: string;
    /**
     * The selected artifact's body.
     */
    body?: string;
    /**
     * Where the shown body came from.
     */
    bodyMeta?: {
        version?: string;
        source?: string;
        hash?: string;
    } | undefined;
    /**
     * Why there is no body, when there is none; ResourceCatalog shows it as listed, not previewable.
     */
    bodyUnavailable?: string;
    /**
     * Reports an artifact, or a version of it, chosen.
     */
    onSelect?: (artifact: {
        id: string;
        kind: string;
    }, version?: string) => void;
};

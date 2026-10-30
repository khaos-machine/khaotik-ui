export default ModelsPane;
type ModelsPane = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ModelsPane: import("svelte").Component<{
    /**
     * The models khaosd holds.
     */
    inventory?: {
        kind: "unread";
    } | {
        kind: "not-served";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "served";
        models: readonly import("./lib/models.js").LocalModel[];
    };
    /**
     * An engine's display name from its service id, '' when it is not known.
     */
    engineName?: (service: string) => string;
    /**
     * The Hugging Face token's connection; null when there is none.
     */
    token?: {
        text: string;
        tone: "success" | "warning" | "neutral";
    } | null;
    /**
     * Why khaosd would not start the last download, or ''.
     */
    refusal?: string;
    /**
     * The model whose download waits on the person's yes.
     */
    confirming?: {
        name: string;
        blurb: string;
    } | null;
    /**
     * Asks to download (or retry) a model; the host asks for confirmation.
     */
    onDownload?: (id: string) => void;
    /**
     * The download's yes.
     */
    onConfirm?: () => void;
    /**
     * The download's no.
     */
    onCancel?: () => void;
    /**
     * Closes the refusal.
     */
    onDismissRefusal?: () => void;
    /**
     * Opens Providers, where the token is enrolled.
     */
    onProviders?: () => void;
}, {}, "">;
type Props = {
    /**
     * The models khaosd holds.
     */
    inventory?: {
        kind: "unread";
    } | {
        kind: "not-served";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "served";
        models: readonly import("./lib/models.js").LocalModel[];
    };
    /**
     * An engine's display name from its service id, '' when it is not known.
     */
    engineName?: (service: string) => string;
    /**
     * The Hugging Face token's connection; null when there is none.
     */
    token?: {
        text: string;
        tone: "success" | "warning" | "neutral";
    } | null;
    /**
     * Why khaosd would not start the last download, or ''.
     */
    refusal?: string;
    /**
     * The model whose download waits on the person's yes.
     */
    confirming?: {
        name: string;
        blurb: string;
    } | null;
    /**
     * Asks to download (or retry) a model; the host asks for confirmation.
     */
    onDownload?: (id: string) => void;
    /**
     * The download's yes.
     */
    onConfirm?: () => void;
    /**
     * The download's no.
     */
    onCancel?: () => void;
    /**
     * Closes the refusal.
     */
    onDismissRefusal?: () => void;
    /**
     * Opens Providers, where the token is enrolled.
     */
    onProviders?: () => void;
};

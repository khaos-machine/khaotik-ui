export default ContextualDialog;
type ContextualDialog = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const ContextualDialog: import("svelte").Component<{
    open?: boolean;
    target?: string;
    title?: string;
    closeLabel?: string;
    media?: boolean;
    onclose?: () => void;
    returnFocus?: () => HTMLElement | null;
    children?: import("svelte").Snippet;
}, {}, "">;
type $$ComponentProps = {
    open?: boolean;
    target?: string;
    title?: string;
    closeLabel?: string;
    media?: boolean;
    onclose?: () => void;
    returnFocus?: () => HTMLElement | null;
    children?: import("svelte").Snippet;
};

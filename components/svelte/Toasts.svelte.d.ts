export default Toasts;
type Toasts = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Toasts: import("svelte").Component<{
    /**
     * Newest last.
     */
    toasts?: readonly {
        id: string;
        tone?: "success" | "error";
        title?: string;
        /**
         * The engine's message, verbatim.
         */
        detail?: string;
        /**
         * Milliseconds before it dismisses itself; 0 keeps it until dismissed. Overrides the stack's.
         */
        duration?: number;
    }[];
    /**
     * Milliseconds before a toast dismisses itself; 0 keeps them until dismissed.
     */
    duration?: number;
    /**
     * Names the stack's region.
     */
    label?: string;
    /**
     * Reports a toast whose time ran out or whose dismiss button was pressed. Removing it is yours.
     */
    ondismiss?: (id: string) => void;
}, {}, "">;
type Props = {
    /**
     * Newest last.
     */
    toasts?: readonly {
        id: string;
        tone?: "success" | "error";
        title?: string;
        /**
         * The engine's message, verbatim.
         */
        detail?: string;
        /**
         * Milliseconds before it dismisses itself; 0 keeps it until dismissed. Overrides the stack's.
         */
        duration?: number;
    }[];
    /**
     * Milliseconds before a toast dismisses itself; 0 keeps them until dismissed.
     */
    duration?: number;
    /**
     * Names the stack's region.
     */
    label?: string;
    /**
     * Reports a toast whose time ran out or whose dismiss button was pressed. Removing it is yours.
     */
    ondismiss?: (id: string) => void;
};

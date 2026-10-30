export default RefusalOffer;
type RefusalOffer = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const RefusalOffer: import("svelte").Component<{
    /**
     * The refusal and its fixes.
     */
    offer?: import("./lib/types.js").Refusal;
    /**
     * Reports a chosen fix.
     */
    onFix?: (fix: import("./lib/types.js").RefusalFix) => void;
    /**
     * Reports Report a Problem….
     */
    onReport?: () => void;
}, {}, "">;
type Props = {
    /**
     * The refusal and its fixes.
     */
    offer?: import("./lib/types.js").Refusal;
    /**
     * Reports a chosen fix.
     */
    onFix?: (fix: import("./lib/types.js").RefusalFix) => void;
    /**
     * Reports Report a Problem….
     */
    onReport?: () => void;
};

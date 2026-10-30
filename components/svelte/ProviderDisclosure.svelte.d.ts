export default ProviderDisclosure;
type ProviderDisclosure = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ProviderDisclosure: import("svelte").Component<{
    /**
     * The disclosure awaiting an answer. Nothing renders without one.
     */
    disclosure?: {
        /**
         * The provider asking.
         */
        providerId: string;
        /**
         * The provider's name, named in the question.
         */
        title: string;
        /**
         * khaosd's disclosure, verbatim.
         */
        text: string;
    } | null;
    /**
     * Reports Continue. Starting the sign-in is yours.
     */
    onContinue?: () => void;
    /**
     * Reports Cancel. No login starts.
     */
    onCancel?: () => void;
}, {}, "">;
type Props = {
    /**
     * The disclosure awaiting an answer. Nothing renders without one.
     */
    disclosure?: {
        /**
         * The provider asking.
         */
        providerId: string;
        /**
         * The provider's name, named in the question.
         */
        title: string;
        /**
         * khaosd's disclosure, verbatim.
         */
        text: string;
    } | null;
    /**
     * Reports Continue. Starting the sign-in is yours.
     */
    onContinue?: () => void;
    /**
     * Reports Cancel. No login starts.
     */
    onCancel?: () => void;
};

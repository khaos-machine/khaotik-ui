export default GenerationFailureDetails;
type GenerationFailureDetails = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const GenerationFailureDetails: import("svelte").Component<{
    /**
     * The generation, in khaosd's shape. Nothing renders without a provider diagnostic.
     */
    generation?: {
        /**
         * The generation's id.
         */
        id: string;
        /**
         * khaosd's error, verbatim.
         */
        error?: string | null;
        /**
         * Who was asked.
         */
        provider?: {
            provider: string;
            model: string;
            profile: string;
        };
        /**
         * The provider evidence. Nothing renders without it.
         */
        providerDiagnostic?: {
            /**
             * The provider call that failed.
             */
            operation: string;
            /**
             * The provider's HTTP status.
             */
            httpStatus: number;
            /**
             * The provider's message, verbatim.
             */
            message?: string;
            /**
             * The provider's response, verbatim, credentials redacted.
             */
            responseBody?: string;
            /**
             * The provider's request id.
             */
            requestId?: string;
            /**
             * Whether the response was cut at khaosd's capture limit.
             */
            truncated: boolean;
            /**
             * When khaosd drops this evidence, as an ISO timestamp.
             */
            expiresAt: string;
            /**
             * When the provider says to retry, as an ISO timestamp.
             */
            retryAt?: string;
        };
    };
    /**
     * Puts text on the clipboard. Without it no Copy button renders.
     */
    copy?: (text: string) => Promise<void>;
}, {}, "">;
type Props = {
    /**
     * The generation, in khaosd's shape. Nothing renders without a provider diagnostic.
     */
    generation?: {
        /**
         * The generation's id.
         */
        id: string;
        /**
         * khaosd's error, verbatim.
         */
        error?: string | null;
        /**
         * Who was asked.
         */
        provider?: {
            provider: string;
            model: string;
            profile: string;
        };
        /**
         * The provider evidence. Nothing renders without it.
         */
        providerDiagnostic?: {
            /**
             * The provider call that failed.
             */
            operation: string;
            /**
             * The provider's HTTP status.
             */
            httpStatus: number;
            /**
             * The provider's message, verbatim.
             */
            message?: string;
            /**
             * The provider's response, verbatim, credentials redacted.
             */
            responseBody?: string;
            /**
             * The provider's request id.
             */
            requestId?: string;
            /**
             * Whether the response was cut at khaosd's capture limit.
             */
            truncated: boolean;
            /**
             * When khaosd drops this evidence, as an ISO timestamp.
             */
            expiresAt: string;
            /**
             * When the provider says to retry, as an ISO timestamp.
             */
            retryAt?: string;
        };
    };
    /**
     * Puts text on the clipboard. Without it no Copy button renders.
     */
    copy?: (text: string) => Promise<void>;
};

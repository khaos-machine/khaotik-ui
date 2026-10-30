export default AppearanceGenerationStatus;
type AppearanceGenerationStatus = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const AppearanceGenerationStatus: import("svelte").Component<{
    job?: {
        id: string;
        state?: string;
        publication: string;
        error?: string;
        revisionId?: string;
    } | null;
    requested?: boolean;
    requestError?: string;
    version?: string;
    purpose?: string;
    onreview?: () => void;
}, {}, "">;
type $$ComponentProps = {
    job?: {
        id: string;
        state?: string;
        publication: string;
        error?: string;
        revisionId?: string;
    } | null;
    requested?: boolean;
    requestError?: string;
    version?: string;
    purpose?: string;
    onreview?: () => void;
};

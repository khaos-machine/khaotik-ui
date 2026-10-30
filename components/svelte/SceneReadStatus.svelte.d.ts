export default SceneReadStatus;
type SceneReadStatus = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SceneReadStatus: import("svelte").Component<{
    /**
     * Host-declared scene workflow status and retained counts. Counts never imply permission to retry.
     */
    workflow?: {
        id: string;
        state: "running" | "partial" | "indeterminate" | "completed" | "retired";
        counts: {
            total: number;
            reused: number;
            completed: number;
            remaining: number;
        };
        resume: {
            allowed: true;
        } | {
            allowed: false;
            reason: string;
        };
        message?: string;
    };
    /**
     * Host-controlled resume admission in progress.
     */
    resuming?: boolean;
    /**
     * Explicit intent to resume this existing workflow, only when host eligibility permits. No new-read or execution behavior.
     */
    onResume?: (workflowId: string) => void;
}, {}, "">;
type Props = {
    /**
     * Host-declared scene workflow status and retained counts. Counts never imply permission to retry.
     */
    workflow?: {
        id: string;
        state: "running" | "partial" | "indeterminate" | "completed" | "retired";
        counts: {
            total: number;
            reused: number;
            completed: number;
            remaining: number;
        };
        resume: {
            allowed: true;
        } | {
            allowed: false;
            reason: string;
        };
        message?: string;
    };
    /**
     * Host-controlled resume admission in progress.
     */
    resuming?: boolean;
    /**
     * Explicit intent to resume this existing workflow, only when host eligibility permits. No new-read or execution behavior.
     */
    onResume?: (workflowId: string) => void;
};

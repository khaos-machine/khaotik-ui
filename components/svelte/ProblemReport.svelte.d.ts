export default ProblemReport;
type ProblemReport = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ProblemReport: import("svelte").Component<{
    /**
     * The report.
     */
    state?: {
        kind: "gathering";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "ready";
        text: string;
    };
    /**
     * A share is in progress: the actions wait.
     */
    sharing?: boolean;
    /**
     * What the last share did, or ''.
     */
    note?: string;
    /**
     * Gathers the report again.
     */
    onGather?: () => void;
    /**
     * Opens an email with the report's zip attached.
     */
    onEmail?: () => void;
    /**
     * Saves the report's zip as a file.
     */
    onSave?: () => void;
}, {}, "">;
type Props = {
    /**
     * The report.
     */
    state?: {
        kind: "gathering";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "ready";
        text: string;
    };
    /**
     * A share is in progress: the actions wait.
     */
    sharing?: boolean;
    /**
     * What the last share did, or ''.
     */
    note?: string;
    /**
     * Gathers the report again.
     */
    onGather?: () => void;
    /**
     * Opens an email with the report's zip attached.
     */
    onEmail?: () => void;
    /**
     * Saves the report's zip as a file.
     */
    onSave?: () => void;
};

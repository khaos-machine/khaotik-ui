export default ComposerExportDialog;
type ComposerExportDialog = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ComposerExportDialog: import("svelte").Component<{
    /**
     * Show the contextual export workspace.
     */
    open?: boolean;
    /**
     * Scene selected when export opens.
     */
    target?: string;
    /**
     * Scene or whole-story scope.
     */
    scope?: string;
    /**
     * Chosen scene identifiers, in any selection order.
     */
    sceneIds?: readonly string[];
    /**
     * Change a scene selection.
     */
    onscene?: (id: string, selected: boolean) => void;
    /**
     * Engine-owned output format identifier.
     */
    format?: string;
    /**
     * Rational output frame rate.
     */
    rate?: string;
    /**
     * Explicitly permit draft cards for missing chosen frames.
     */
    drafts?: boolean;
    /**
     * New export folder path.
     */
    destination?: string;
    /**
     * Preflight is being read.
     */
    loading?: boolean;
    /**
     * An export submission is awaiting admission.
     */
    starting?: boolean;
    /**
     * Engine-owned counts, warnings and refusals.
     */
    preflight?: {
        scenes: readonly {
            id: string;
            name: string;
            number: number;
        }[];
        ready: boolean;
        summary: {
            name: string;
            durationMs: number;
            scenes: number;
            pictures: number;
            readings: number;
        } | null;
        formats: readonly {
            id: string;
            name: string;
            ready: boolean;
            reason: string;
        }[];
        warnings: readonly {
            sceneId: string;
            kind: string;
            message: string;
        }[];
        refusals: readonly string[];
    } | null;
    /**
     * Retained job state, independent of dialog visibility.
     */
    job?: {
        name: string;
        status: string;
        current: string;
        completed: number | null;
        total: number | null;
        error: string;
        result: {
            directory: string;
            file: string;
            manifest: string;
        } | null;
    } | null;
    /**
     * Preserved operation failure.
     */
    error?: string;
    /**
     * Change an export option.
     */
    onoption?: (key: "scope" | "format" | "rate", value: string) => void;
    /**
     * Choose placeholder handling.
     */
    ondrafts?: (value: boolean) => void;
    /**
     * Edit destination.
     */
    ondestination?: (value: string) => void;
    /**
     * Ask the host for a new folder destination.
     */
    onchoose?: () => void;
    /**
     * Start this reviewed local export.
     */
    onexport?: () => void;
    /**
     * Cancel the active export.
     */
    oncancel?: () => void;
    /**
     * Check job status after a transport failure.
     */
    onretry?: () => void;
    /**
     * Reveal the completed export folder.
     */
    onreveal?: () => void;
    /**
     * Hide this dialog without canceling a job.
     */
    onclose?: () => void;
}, {}, "">;
type Props = {
    /**
     * Show the contextual export workspace.
     */
    open?: boolean;
    /**
     * Scene selected when export opens.
     */
    target?: string;
    /**
     * Scene or whole-story scope.
     */
    scope?: string;
    /**
     * Chosen scene identifiers, in any selection order.
     */
    sceneIds?: readonly string[];
    /**
     * Change a scene selection.
     */
    onscene?: (id: string, selected: boolean) => void;
    /**
     * Engine-owned output format identifier.
     */
    format?: string;
    /**
     * Rational output frame rate.
     */
    rate?: string;
    /**
     * Explicitly permit draft cards for missing chosen frames.
     */
    drafts?: boolean;
    /**
     * New export folder path.
     */
    destination?: string;
    /**
     * Preflight is being read.
     */
    loading?: boolean;
    /**
     * An export submission is awaiting admission.
     */
    starting?: boolean;
    /**
     * Engine-owned counts, warnings and refusals.
     */
    preflight?: {
        scenes: readonly {
            id: string;
            name: string;
            number: number;
        }[];
        ready: boolean;
        summary: {
            name: string;
            durationMs: number;
            scenes: number;
            pictures: number;
            readings: number;
        } | null;
        formats: readonly {
            id: string;
            name: string;
            ready: boolean;
            reason: string;
        }[];
        warnings: readonly {
            sceneId: string;
            kind: string;
            message: string;
        }[];
        refusals: readonly string[];
    } | null;
    /**
     * Retained job state, independent of dialog visibility.
     */
    job?: {
        name: string;
        status: string;
        current: string;
        completed: number | null;
        total: number | null;
        error: string;
        result: {
            directory: string;
            file: string;
            manifest: string;
        } | null;
    } | null;
    /**
     * Preserved operation failure.
     */
    error?: string;
    /**
     * Change an export option.
     */
    onoption?: (key: "scope" | "format" | "rate", value: string) => void;
    /**
     * Choose placeholder handling.
     */
    ondrafts?: (value: boolean) => void;
    /**
     * Edit destination.
     */
    ondestination?: (value: string) => void;
    /**
     * Ask the host for a new folder destination.
     */
    onchoose?: () => void;
    /**
     * Start this reviewed local export.
     */
    onexport?: () => void;
    /**
     * Cancel the active export.
     */
    oncancel?: () => void;
    /**
     * Check job status after a transport failure.
     */
    onretry?: () => void;
    /**
     * Reveal the completed export folder.
     */
    onreveal?: () => void;
    /**
     * Hide this dialog without canceling a job.
     */
    onclose?: () => void;
};

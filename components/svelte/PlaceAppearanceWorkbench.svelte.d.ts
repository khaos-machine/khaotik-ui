export default PlaceAppearanceWorkbench;
type PlaceAppearanceWorkbench = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PlaceAppearanceWorkbench: import("svelte").Component<{
    /**
     * Explicitly submit or retry the retained Build intent; the engine builds from the approved floor plan.
     */
    onbuild?: () => void;
    /**
     * Explicitly request cancellation.
     */
    oncancelbuild?: () => void;
    /**
     * Load an available result without discarding a draft.
     */
    onloadbuild?: () => void;
    /**
     * An acknowledged job is queued or running.
     */
    building?: boolean;
    /**
     * Submission, status or result read is pending.
     */
    buildBusy?: boolean;
    /**
     * Original submission outcome is uncertain; the action retries it.
     */
    retryBuild?: boolean;
    /**
     * Cancellation acknowledged, not yet terminal.
     */
    cancelRequested?: boolean;
    /**
     * Host-formatted engine status, rounds and decimal USD spend.
     */
    buildStatus?: string;
    /**
     * Retained generation failure.
     */
    buildError?: string;
    /**
     * Active Place Builder mode; defaults to Design.
     */
    mode?: "structure" | "design" | "build" | "render";
    /**
     * Reports deliberate mode navigation; never starts generation.
     */
    onmode?: (mode: "structure" | "design" | "build" | "render") => void;
    /**
     * The same Place's floor plan workspace, first on the rail; absent for a place with no structure, such as an exterior or a vehicle.
     */
    structure?: import("svelte").Snippet;
    /**
     * The same Place's complete Build workspace.
     */
    build?: import("svelte").Snippet;
    /**
     * Changes requested for the next suggestion.
     */
    refinementFeedback?: string;
    /**
     * Edit revision feedback without saving.
     */
    onfeedback?: (value: string) => void;
    /**
     * Explicitly start over without changing direction.
     */
    ondiscardsuggestion?: () => void;
    /**
     * Reviewable text proposal.
     */
    suggestion?: {
        brief: import("./lib/place-workbench.js").PlaceBrief;
        notes: readonly string[];
    } | null;
    /**
     * One text request is in progress.
     */
    refining?: boolean;
    /**
     * Retained text request failure.
     */
    refinementError?: string;
    /**
     * Proposal still matches its input draft.
     */
    canApplySuggestion?: boolean;
    /**
     * Request one suggestion explicitly.
     */
    onrefine?: () => void;
    /**
     * Load a suggestion into the draft without saving.
     */
    onapplysuggestion?: () => boolean;
    /**
     * Load one cited area into the draft.
     */
    onarea?: (index: number) => void;
    /**
     * Complete engine-owned place artwork read model.
     */
    workspace?: import("./lib/place-workbench.js").PlaceWorkspace | null;
    /**
     * Persistent host-owned direction draft.
     */
    brief?: import("./lib/place-workbench.js").PlaceBrief | null;
    /**
     * Authored image input roles.
     */
    references?: readonly {
        referenceId: string;
        role: string;
    }[];
    /**
     * Candidate being viewed, independently of adoption.
     */
    candidateId?: string;
    /**
     * Reference being viewed, empty returns to design.
     */
    inspectingId?: string;
    /**
     * Authenticated image URLs keyed by reference.
     */
    imageURLs?: Record<string, string>;
    /**
     * Main contained artwork.
     */
    mediaUrl?: string;
    /**
     * Main artwork read is pending.
     */
    mediaLoading?: boolean;
    /**
     * Retained media-read failure.
     */
    mediaError?: string;
    /**
     * Revision instruction for this candidate.
     */
    correction?: string;
    /**
     * Candidate review notes.
     */
    notes?: string;
    /**
     * Authored visual treatment, separate from script facts.
     */
    treatment?: string;
    /**
     * Direction changes await saving.
     */
    dirty?: boolean;
    /**
     * Prevent overlapping operations.
     */
    busy?: boolean;
    /**
     * Retained operation error.
     */
    error?: string;
    /**
     * Explicit operation feedback.
     */
    notice?: string;
    /**
     * Current explicit image request.
     */
    generationRequestId?: string;
    /**
     * Retained submission failure.
     */
    generationError?: string;
    /**
     * Contextual return destination.
     */
    returnLabel?: string;
    /**
     * Return to the prior Data or Atlas context.
     */
    onback?: () => void;
    /**
     * Change authored direction.
     */
    onchange?: (field: "spatialDescription" | "dressing" | "lighting" | "treatment", value: string) => void;
    /**
     * Edit fixed features for this set.
     */
    onfeatures?: (values: string[]) => void;
    /**
     * Persist the current brief.
     */
    onsave?: () => void;
    /**
     * Explicitly discard unsaved direction edits.
     */
    onrevert?: () => void;
    /**
     * Save edits then request one image.
     */
    ongenerate?: (correcting: boolean) => void;
    /**
     * View artwork without approval or selection.
     */
    onpreview?: (id: string) => void;
    /**
     * Inspect a reference, or return with an empty ID.
     */
    oninspect?: (id: string) => void;
    /**
     * Change a reference role.
     */
    onreference?: (id: string, role: string) => void;
    /**
     * Upload reference imagery.
     */
    onupload?: (files: File[]) => void;
    /**
     * Edit the correction draft.
     */
    oncorrection?: (value: string) => void;
    /**
     * Edit review notes.
     */
    onnotes?: (value: string) => void;
    /**
     * Review without adopting artwork.
     */
    onreview?: (state: "reviewed" | "rejected") => void;
    /**
     * Approve and select in one command.
     */
    onuse?: () => void;
    /**
     * Save returned artwork without provider retry.
     */
    onpublish?: (id: string) => void;
    /**
     * The engine label of the place state being designed, such as "Interior · Day"; named in the header.
     */
    stateLabel?: string;
}, {}, "mode">;
type Props = {
    /**
     * Explicitly submit or retry the retained Build intent; the engine builds from the approved floor plan.
     */
    onbuild?: () => void;
    /**
     * Explicitly request cancellation.
     */
    oncancelbuild?: () => void;
    /**
     * Load an available result without discarding a draft.
     */
    onloadbuild?: () => void;
    /**
     * An acknowledged job is queued or running.
     */
    building?: boolean;
    /**
     * Submission, status or result read is pending.
     */
    buildBusy?: boolean;
    /**
     * Original submission outcome is uncertain; the action retries it.
     */
    retryBuild?: boolean;
    /**
     * Cancellation acknowledged, not yet terminal.
     */
    cancelRequested?: boolean;
    /**
     * Host-formatted engine status, rounds and decimal USD spend.
     */
    buildStatus?: string;
    /**
     * Retained generation failure.
     */
    buildError?: string;
    /**
     * Active Place Builder mode; defaults to Design.
     */
    mode?: "structure" | "design" | "build" | "render";
    /**
     * Reports deliberate mode navigation; never starts generation.
     */
    onmode?: (mode: "structure" | "design" | "build" | "render") => void;
    /**
     * The same Place's floor plan workspace, first on the rail; absent for a place with no structure, such as an exterior or a vehicle.
     */
    structure?: import("svelte").Snippet;
    /**
     * The same Place's complete Build workspace.
     */
    build?: import("svelte").Snippet;
    /**
     * Changes requested for the next suggestion.
     */
    refinementFeedback?: string;
    /**
     * Edit revision feedback without saving.
     */
    onfeedback?: (value: string) => void;
    /**
     * Explicitly start over without changing direction.
     */
    ondiscardsuggestion?: () => void;
    /**
     * Reviewable text proposal.
     */
    suggestion?: {
        brief: import("./lib/place-workbench.js").PlaceBrief;
        notes: readonly string[];
    } | null;
    /**
     * One text request is in progress.
     */
    refining?: boolean;
    /**
     * Retained text request failure.
     */
    refinementError?: string;
    /**
     * Proposal still matches its input draft.
     */
    canApplySuggestion?: boolean;
    /**
     * Request one suggestion explicitly.
     */
    onrefine?: () => void;
    /**
     * Load a suggestion into the draft without saving.
     */
    onapplysuggestion?: () => boolean;
    /**
     * Load one cited area into the draft.
     */
    onarea?: (index: number) => void;
    /**
     * Complete engine-owned place artwork read model.
     */
    workspace?: import("./lib/place-workbench.js").PlaceWorkspace | null;
    /**
     * Persistent host-owned direction draft.
     */
    brief?: import("./lib/place-workbench.js").PlaceBrief | null;
    /**
     * Authored image input roles.
     */
    references?: readonly {
        referenceId: string;
        role: string;
    }[];
    /**
     * Candidate being viewed, independently of adoption.
     */
    candidateId?: string;
    /**
     * Reference being viewed, empty returns to design.
     */
    inspectingId?: string;
    /**
     * Authenticated image URLs keyed by reference.
     */
    imageURLs?: Record<string, string>;
    /**
     * Main contained artwork.
     */
    mediaUrl?: string;
    /**
     * Main artwork read is pending.
     */
    mediaLoading?: boolean;
    /**
     * Retained media-read failure.
     */
    mediaError?: string;
    /**
     * Revision instruction for this candidate.
     */
    correction?: string;
    /**
     * Candidate review notes.
     */
    notes?: string;
    /**
     * Authored visual treatment, separate from script facts.
     */
    treatment?: string;
    /**
     * Direction changes await saving.
     */
    dirty?: boolean;
    /**
     * Prevent overlapping operations.
     */
    busy?: boolean;
    /**
     * Retained operation error.
     */
    error?: string;
    /**
     * Explicit operation feedback.
     */
    notice?: string;
    /**
     * Current explicit image request.
     */
    generationRequestId?: string;
    /**
     * Retained submission failure.
     */
    generationError?: string;
    /**
     * Contextual return destination.
     */
    returnLabel?: string;
    /**
     * Return to the prior Data or Atlas context.
     */
    onback?: () => void;
    /**
     * Change authored direction.
     */
    onchange?: (field: "spatialDescription" | "dressing" | "lighting" | "treatment", value: string) => void;
    /**
     * Edit fixed features for this set.
     */
    onfeatures?: (values: string[]) => void;
    /**
     * Persist the current brief.
     */
    onsave?: () => void;
    /**
     * Explicitly discard unsaved direction edits.
     */
    onrevert?: () => void;
    /**
     * Save edits then request one image.
     */
    ongenerate?: (correcting: boolean) => void;
    /**
     * View artwork without approval or selection.
     */
    onpreview?: (id: string) => void;
    /**
     * Inspect a reference, or return with an empty ID.
     */
    oninspect?: (id: string) => void;
    /**
     * Change a reference role.
     */
    onreference?: (id: string, role: string) => void;
    /**
     * Upload reference imagery.
     */
    onupload?: (files: File[]) => void;
    /**
     * Edit the correction draft.
     */
    oncorrection?: (value: string) => void;
    /**
     * Edit review notes.
     */
    onnotes?: (value: string) => void;
    /**
     * Review without adopting artwork.
     */
    onreview?: (state: "reviewed" | "rejected") => void;
    /**
     * Approve and select in one command.
     */
    onuse?: () => void;
    /**
     * Save returned artwork without provider retry.
     */
    onpublish?: (id: string) => void;
    /**
     * The engine label of the place state being designed, such as "Interior · Day"; named in the header.
     */
    stateLabel?: string;
};

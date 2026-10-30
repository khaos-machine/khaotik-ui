export default ShotInspector;
type ShotInspector = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ShotInspector: import("svelte").Component<{
    /**
     * Pause the host context before full-frame review.
     */
    onreviewopen?: () => void;
    /**
     * Scene context for the selected shot.
     */
    sceneLabel?: string;
    /**
     * Ordered shots with frames in the current scene.
     */
    reviewShots?: readonly {
        id: string;
        title: string;
    }[];
    /**
     * Select a shot while keeping the review open.
     */
    onreviewshot?: (id: string) => void;
    /**
     * Available project designs for explicit attachment.
     */
    projectReferences?: readonly {
        id: string;
        label: string;
        subjectName?: string;
        subject?: {
            kind: string;
        };
        roles?: readonly string[];
    }[];
    /**
     * Loaded project image previews by reference ID.
     */
    referenceImages?: Record<string, string>;
    /**
     * Load a project reference for inspection.
     */
    oninspectreference?: (id: string) => void;
    /**
     * Add the chosen reference to the shot draft.
     */
    onaddreference?: (id: string, role: string) => void;
    /**
     * Open full-frame review in a contextual workspace.
     */
    reviewWorkspace?: boolean;
    /**
     * Controlled authored shot; null shows the start action.
     */
    shot?: {
        /**
         * Stable shot identity.
         */
        id: string;
        /**
         * Authored shot name.
         */
        title: string;
        /**
         * Authored visual direction.
         */
        direction: string;
        /**
         * Drawing treatment, independent of provider quality.
         */
        style: "rough_blocking" | "detailed_pencil";
        /**
         * Authored camera framing.
         */
        framing: string;
        /**
         * Resolved composition seconds; null when unresolved.
         */
        start: number | null;
        /**
         * Authored duration in seconds.
         */
        hold: number;
        /**
         * Engine timing resolution status.
         */
        timingStatus: string;
        /**
         * Source event supplied by the engine.
         */
        sourceText: string;
        /**
         * Candidate images in creation order.
         */
        frames: readonly {
            /**
             * Stable frame identity.
             */
            id: string;
            /**
             * Resolved image URL.
             */
            url: string;
            /**
             * Host media readiness.
             */
            imageState?: "ready" | "loading" | "failed" | "missing";
            /**
             * Explicit review state.
             */
            review: "unreviewed" | "reviewed" | "rejected";
            /**
             * Engine eligibility for a new playback choice.
             */
            canChoose?: boolean;
        }[];
        /**
         * Explicit playback choice.
         */
        chosenId: string;
        /**
         * Engine explanations about saved source, read or appearance lineage.
         */
        warnings?: readonly string[];
    } | null;
    /**
     * Candidate being inspected, separate from playback choice.
     */
    previewId?: string;
    /**
     * Exact engine reference inventory.
     */
    references?: readonly {
        referenceId: string;
        name: string;
        visibility: string;
        purpose?: string;
        imageUrl?: string;
        imageState?: "ready" | "loading" | "failed" | "missing";
    }[];
    /**
     * Engine-provided scene analysis beats.
     */
    beats?: readonly string[];
    /**
     * Engine source inventory for an authored shot.
     */
    events?: readonly {
        id: string;
        text: string;
        kind: string;
    }[];
    /**
     * Selected source event.
     */
    sourceEventId?: string;
    /**
     * Explicit source selection.
     */
    onsource?: (id: string) => void;
    /**
     * Show explicit deletion confirmation.
     */
    deletePending?: boolean;
    /**
     * Picture edit intent.
     */
    onaction?: (action: "insertBefore" | "insertAfter" | "split" | "delete") => void;
    /**
     * Remove the shot after confirmation.
     */
    ondeleteconfirm?: () => void;
    /**
     * Keep the shot.
     */
    ondeletecancel?: () => void;
    /**
     * Host records approval and selection together when Use is activated.
     */
    approveOnUse?: boolean;
    /**
     * Only frame preparation/generation is running.
     */
    generating?: boolean;
    /**
     * Status of that generation, never an unrelated command.
     */
    generationPhase?: string;
    /**
     * A command is in flight; prevents duplicate actions.
     */
    busy?: boolean;
    /**
     * Source context is loaded for adding a shot.
     */
    canAdd?: boolean;
    /**
     * Authored edits need saving before generation.
     */
    dirty?: boolean;
    /**
     * Engine provider readiness.
     */
    generationReady?: boolean;
    /**
     * Engine readiness explanation.
     */
    generationReason?: string;
    /**
     * Current operation status.
     */
    phase?: string;
    /**
     * Preserved command failure detail.
     */
    error?: string;
    /**
     * Exact engine error category and detail.
     */
    errorDetails?: string;
    /**
     * Retained redacted provider evidence; the host owns expiry.
     */
    diagnostic?: {
        operation: string;
        httpStatus: number;
        message?: string;
        responseBody?: string;
        requestId?: string;
        truncated: boolean;
        expiresAt: string;
    } | null;
    /**
     * Requested change to the previewed frame.
     */
    correction?: string;
    /**
     * Completed jobs awaiting explicit publication.
     */
    recoverableJobs?: readonly {
        id: string;
        label: string;
    }[];
    /**
     * Authored edits; host owns the draft.
     */
    onchange?: (patch: {
        /**
         * Edited shot name.
         */
        title?: string;
        /**
         * Edited direction.
         */
        direction?: string;
        /**
         * Edited treatment.
         */
        style?: "rough_blocking" | "detailed_pencil";
        /**
         * Edited framing.
         */
        framing?: string;
        /**
         * Edited composition start in seconds.
         */
        start?: number;
        /**
         * Edited duration in seconds.
         */
        hold?: number;
    }) => void;
    /**
     * Add a shot at the playhead.
     */
    onadd?: () => void;
    /**
     * Edit explicit reference visibility or omit it.
     */
    onreference?: (id: string, visibility: "visible" | "offscreen" | "omit") => void;
    /**
     * New chosen designs are available for this shot.
     */
    canUpdateReferences?: boolean;
    /**
     * Explicitly update the shot's saved image inputs.
     */
    oncurrentreferences?: () => void;
    /**
     * Place a shot with unresolved timing at the playhead.
     */
    onplace?: () => void;
    /**
     * Persist the authored direction and placement.
     */
    onsave?: () => void;
    /**
     * Inspect a candidate without choosing it.
     */
    onpreview?: (id: string) => void;
    /**
     * Explicitly review the previewed frame.
     */
    onreview?: (state: "reviewed" | "rejected") => void;
    /**
     * Choose the reviewed frame for playback.
     */
    onchoose?: () => void;
    /**
     * Edit the correction instruction.
     */
    oncorrection?: (value: string) => void;
    /**
     * Request one frame; never implicitly retries.
     */
    ongenerate?: () => void;
    /**
     * Publish an already completed job without generation.
     */
    onrecover?: (id: string) => void;
}, {}, "">;
type Props = {
    /**
     * Pause the host context before full-frame review.
     */
    onreviewopen?: () => void;
    /**
     * Scene context for the selected shot.
     */
    sceneLabel?: string;
    /**
     * Ordered shots with frames in the current scene.
     */
    reviewShots?: readonly {
        id: string;
        title: string;
    }[];
    /**
     * Select a shot while keeping the review open.
     */
    onreviewshot?: (id: string) => void;
    /**
     * Available project designs for explicit attachment.
     */
    projectReferences?: readonly {
        id: string;
        label: string;
        subjectName?: string;
        subject?: {
            kind: string;
        };
        roles?: readonly string[];
    }[];
    /**
     * Loaded project image previews by reference ID.
     */
    referenceImages?: Record<string, string>;
    /**
     * Load a project reference for inspection.
     */
    oninspectreference?: (id: string) => void;
    /**
     * Add the chosen reference to the shot draft.
     */
    onaddreference?: (id: string, role: string) => void;
    /**
     * Open full-frame review in a contextual workspace.
     */
    reviewWorkspace?: boolean;
    /**
     * Controlled authored shot; null shows the start action.
     */
    shot?: {
        /**
         * Stable shot identity.
         */
        id: string;
        /**
         * Authored shot name.
         */
        title: string;
        /**
         * Authored visual direction.
         */
        direction: string;
        /**
         * Drawing treatment, independent of provider quality.
         */
        style: "rough_blocking" | "detailed_pencil";
        /**
         * Authored camera framing.
         */
        framing: string;
        /**
         * Resolved composition seconds; null when unresolved.
         */
        start: number | null;
        /**
         * Authored duration in seconds.
         */
        hold: number;
        /**
         * Engine timing resolution status.
         */
        timingStatus: string;
        /**
         * Source event supplied by the engine.
         */
        sourceText: string;
        /**
         * Candidate images in creation order.
         */
        frames: readonly {
            /**
             * Stable frame identity.
             */
            id: string;
            /**
             * Resolved image URL.
             */
            url: string;
            /**
             * Host media readiness.
             */
            imageState?: "ready" | "loading" | "failed" | "missing";
            /**
             * Explicit review state.
             */
            review: "unreviewed" | "reviewed" | "rejected";
            /**
             * Engine eligibility for a new playback choice.
             */
            canChoose?: boolean;
        }[];
        /**
         * Explicit playback choice.
         */
        chosenId: string;
        /**
         * Engine explanations about saved source, read or appearance lineage.
         */
        warnings?: readonly string[];
    } | null;
    /**
     * Candidate being inspected, separate from playback choice.
     */
    previewId?: string;
    /**
     * Exact engine reference inventory.
     */
    references?: readonly {
        referenceId: string;
        name: string;
        visibility: string;
        purpose?: string;
        imageUrl?: string;
        imageState?: "ready" | "loading" | "failed" | "missing";
    }[];
    /**
     * Engine-provided scene analysis beats.
     */
    beats?: readonly string[];
    /**
     * Engine source inventory for an authored shot.
     */
    events?: readonly {
        id: string;
        text: string;
        kind: string;
    }[];
    /**
     * Selected source event.
     */
    sourceEventId?: string;
    /**
     * Explicit source selection.
     */
    onsource?: (id: string) => void;
    /**
     * Show explicit deletion confirmation.
     */
    deletePending?: boolean;
    /**
     * Picture edit intent.
     */
    onaction?: (action: "insertBefore" | "insertAfter" | "split" | "delete") => void;
    /**
     * Remove the shot after confirmation.
     */
    ondeleteconfirm?: () => void;
    /**
     * Keep the shot.
     */
    ondeletecancel?: () => void;
    /**
     * Host records approval and selection together when Use is activated.
     */
    approveOnUse?: boolean;
    /**
     * Only frame preparation/generation is running.
     */
    generating?: boolean;
    /**
     * Status of that generation, never an unrelated command.
     */
    generationPhase?: string;
    /**
     * A command is in flight; prevents duplicate actions.
     */
    busy?: boolean;
    /**
     * Source context is loaded for adding a shot.
     */
    canAdd?: boolean;
    /**
     * Authored edits need saving before generation.
     */
    dirty?: boolean;
    /**
     * Engine provider readiness.
     */
    generationReady?: boolean;
    /**
     * Engine readiness explanation.
     */
    generationReason?: string;
    /**
     * Current operation status.
     */
    phase?: string;
    /**
     * Preserved command failure detail.
     */
    error?: string;
    /**
     * Exact engine error category and detail.
     */
    errorDetails?: string;
    /**
     * Retained redacted provider evidence; the host owns expiry.
     */
    diagnostic?: {
        operation: string;
        httpStatus: number;
        message?: string;
        responseBody?: string;
        requestId?: string;
        truncated: boolean;
        expiresAt: string;
    } | null;
    /**
     * Requested change to the previewed frame.
     */
    correction?: string;
    /**
     * Completed jobs awaiting explicit publication.
     */
    recoverableJobs?: readonly {
        id: string;
        label: string;
    }[];
    /**
     * Authored edits; host owns the draft.
     */
    onchange?: (patch: {
        /**
         * Edited shot name.
         */
        title?: string;
        /**
         * Edited direction.
         */
        direction?: string;
        /**
         * Edited treatment.
         */
        style?: "rough_blocking" | "detailed_pencil";
        /**
         * Edited framing.
         */
        framing?: string;
        /**
         * Edited composition start in seconds.
         */
        start?: number;
        /**
         * Edited duration in seconds.
         */
        hold?: number;
    }) => void;
    /**
     * Add a shot at the playhead.
     */
    onadd?: () => void;
    /**
     * Edit explicit reference visibility or omit it.
     */
    onreference?: (id: string, visibility: "visible" | "offscreen" | "omit") => void;
    /**
     * New chosen designs are available for this shot.
     */
    canUpdateReferences?: boolean;
    /**
     * Explicitly update the shot's saved image inputs.
     */
    oncurrentreferences?: () => void;
    /**
     * Place a shot with unresolved timing at the playhead.
     */
    onplace?: () => void;
    /**
     * Persist the authored direction and placement.
     */
    onsave?: () => void;
    /**
     * Inspect a candidate without choosing it.
     */
    onpreview?: (id: string) => void;
    /**
     * Explicitly review the previewed frame.
     */
    onreview?: (state: "reviewed" | "rejected") => void;
    /**
     * Choose the reviewed frame for playback.
     */
    onchoose?: () => void;
    /**
     * Edit the correction instruction.
     */
    oncorrection?: (value: string) => void;
    /**
     * Request one frame; never implicitly retries.
     */
    ongenerate?: () => void;
    /**
     * Publish an already completed job without generation.
     */
    onrecover?: (id: string) => void;
};

export default SceneShotPlanner;
type SceneShotPlanner = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SceneShotPlanner: import("svelte").Component<{
    /**
     * Reviewable engine proposal.
     */
    plan?: {
        summary: string;
        warnings: readonly string[];
        shots: readonly {
            title: string;
            intent: string;
            direction: string;
            framing: string;
            startMs: number;
            durationMs: number;
            continuity: string;
            beatIndices: readonly number[];
            sourceEventIds: readonly string[];
            proposals: readonly string[];
        }[];
    } | null;
    /**
     * Storyteller’s planning direction.
     */
    brief?: string;
    /**
     * Drawing treatment for future frames.
     */
    style?: "rough_blocking" | "detailed_pencil";
    /**
     * A request is pending.
     */
    busy?: boolean;
    /**
     * Planning is unavailable.
     */
    disabled?: boolean;
    /**
     * Number of scene analysis beats.
     */
    beatCount?: number;
    /**
     * Visible request progress.
     */
    phase?: string;
    /**
     * Preserved request failure.
     */
    error?: string;
    /**
     * Edit planning direction.
     */
    onbrief?: (value: string) => void;
    /**
     * Choose drawing treatment.
     */
    onstyle?: (value: "rough_blocking" | "detailed_pencil") => void;
    /**
     * Request a new proposal.
     */
    onplan?: () => void;
    /**
     * Save proposed shots without images. Resolve after the host updates the plan or error.
     */
    onapply?: () => void | Promise<void>;
    /**
     * Discard this proposal.
     */
    ondiscard?: () => void;
    /**
     * Edit a proposed shot.
     */
    onchange?: (index: number, patch: {
        title?: string;
        intent?: string;
        direction?: string;
        framing?: string;
        startMs?: number;
        durationMs?: number;
        continuity?: string;
    }) => void;
    /**
     * Existing shots and host-reported frame readiness.
     */
    coverage?: readonly import("./lib/shot-coverage.js").CoverageItem[];
    /**
     * Intentional selection, independent of playback.
     */
    selectedShotId?: string;
    /**
     * Shot at the playhead.
     */
    activeShotId?: string;
    /**
     * Inspect an existing shot; does not seek.
     */
    onselect?: (id: string) => void;
    /**
     * Context named by the planning workspace.
     */
    sceneLabel?: string;
    /**
     * Keep the panel compact and open planning in a focused workspace.
     */
    modal?: boolean;
    /**
     * Why the host cannot start planning.
     */
    unavailableReason?: string;
    /**
     * Show scene properties and render tools instead of the coverage list.
     */
    inspector?: boolean;
    /**
     * Host-projected scene facts.
     */
    sceneInfo?: {
        location: string;
        timing: string;
        duration: string;
        characters: readonly string[];
        references: readonly string[];
    } | null;
    /**
     * Scene generation progress.
     */
    batch?: {
        running: boolean;
        total: number;
        completed: number;
        stopping: boolean;
        error: string;
    } | null;
    /**
     * Image generation is available.
     */
    generationReady?: boolean;
    /**
     * Why image generation is blocked.
     */
    generationReason?: string;
    /**
     * Host-resolved shots per generation mode; null while the host is resolving them.
     */
    frameQueue?: {
        missing: readonly {
            id: string;
            title: string;
        }[];
        all: readonly {
            id: string;
            title: string;
        }[];
    } | null;
    /**
     * Explicitly generate the confirmed scene queue, with the ids the dialog listed.
     */
    ongeneratescene?: (mode: "all" | "missing", shotIds: readonly string[]) => void;
    /**
     * Stop after the current frame.
     */
    onstopgeneration?: () => void;
    /**
     * Open this scene's readings.
     */
    onreadings?: () => void;
    /**
     * Open this scene in the data view.
     */
    ondata?: () => void;
    /**
     * Freeze the host's playback context before opening planning.
     */
    onopen?: () => void;
}, {}, "">;
type Props = {
    /**
     * Reviewable engine proposal.
     */
    plan?: {
        summary: string;
        warnings: readonly string[];
        shots: readonly {
            title: string;
            intent: string;
            direction: string;
            framing: string;
            startMs: number;
            durationMs: number;
            continuity: string;
            beatIndices: readonly number[];
            sourceEventIds: readonly string[];
            proposals: readonly string[];
        }[];
    } | null;
    /**
     * Storyteller’s planning direction.
     */
    brief?: string;
    /**
     * Drawing treatment for future frames.
     */
    style?: "rough_blocking" | "detailed_pencil";
    /**
     * A request is pending.
     */
    busy?: boolean;
    /**
     * Planning is unavailable.
     */
    disabled?: boolean;
    /**
     * Number of scene analysis beats.
     */
    beatCount?: number;
    /**
     * Visible request progress.
     */
    phase?: string;
    /**
     * Preserved request failure.
     */
    error?: string;
    /**
     * Edit planning direction.
     */
    onbrief?: (value: string) => void;
    /**
     * Choose drawing treatment.
     */
    onstyle?: (value: "rough_blocking" | "detailed_pencil") => void;
    /**
     * Request a new proposal.
     */
    onplan?: () => void;
    /**
     * Save proposed shots without images. Resolve after the host updates the plan or error.
     */
    onapply?: () => void | Promise<void>;
    /**
     * Discard this proposal.
     */
    ondiscard?: () => void;
    /**
     * Edit a proposed shot.
     */
    onchange?: (index: number, patch: {
        title?: string;
        intent?: string;
        direction?: string;
        framing?: string;
        startMs?: number;
        durationMs?: number;
        continuity?: string;
    }) => void;
    /**
     * Existing shots and host-reported frame readiness.
     */
    coverage?: readonly import("./lib/shot-coverage.js").CoverageItem[];
    /**
     * Intentional selection, independent of playback.
     */
    selectedShotId?: string;
    /**
     * Shot at the playhead.
     */
    activeShotId?: string;
    /**
     * Inspect an existing shot; does not seek.
     */
    onselect?: (id: string) => void;
    /**
     * Context named by the planning workspace.
     */
    sceneLabel?: string;
    /**
     * Keep the panel compact and open planning in a focused workspace.
     */
    modal?: boolean;
    /**
     * Why the host cannot start planning.
     */
    unavailableReason?: string;
    /**
     * Show scene properties and render tools instead of the coverage list.
     */
    inspector?: boolean;
    /**
     * Host-projected scene facts.
     */
    sceneInfo?: {
        location: string;
        timing: string;
        duration: string;
        characters: readonly string[];
        references: readonly string[];
    } | null;
    /**
     * Scene generation progress.
     */
    batch?: {
        running: boolean;
        total: number;
        completed: number;
        stopping: boolean;
        error: string;
    } | null;
    /**
     * Image generation is available.
     */
    generationReady?: boolean;
    /**
     * Why image generation is blocked.
     */
    generationReason?: string;
    /**
     * Host-resolved shots per generation mode; null while the host is resolving them.
     */
    frameQueue?: {
        missing: readonly {
            id: string;
            title: string;
        }[];
        all: readonly {
            id: string;
            title: string;
        }[];
    } | null;
    /**
     * Explicitly generate the confirmed scene queue, with the ids the dialog listed.
     */
    ongeneratescene?: (mode: "all" | "missing", shotIds: readonly string[]) => void;
    /**
     * Stop after the current frame.
     */
    onstopgeneration?: () => void;
    /**
     * Open this scene's readings.
     */
    onreadings?: () => void;
    /**
     * Open this scene in the data view.
     */
    ondata?: () => void;
    /**
     * Freeze the host's playback context before opening planning.
     */
    onopen?: () => void;
};

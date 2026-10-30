export default SceneReads;
type SceneReads = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SceneReads: import("svelte").Component<{
    /**
     * The scene's heading, for the confirmations.
     */
    sceneHeading?: string;
    /**
     * Inline players in the rows, or a host transport that owns auditions.
     */
    playback?: "inline" | "hosted";
    /**
     * The scene's reads, as TakeList takes them; each carries its `label` and `voiceName`.
     */
    takes?: readonly any[];
    /**
     * The chosen read's id.
     */
    chosenId?: string;
    /**
     * A read is being prepared or made.
     */
    generating?: boolean;
    /**
     * A choose, delete or prune is in flight.
     */
    mutating?: boolean;
    /**
     * How far the read in flight has got.
     */
    progress?: string;
    /**
     * Whether reads can be saved to a file.
     */
    canDownload?: boolean;
    /**
     * The read being saved.
     */
    downloadingId?: string;
    /**
     * The workflows reading this scene, as SceneReadStatus takes them.
     */
    workflows?: readonly {
        /**
         * The workflow's id.
         */
        id: string;
        /**
         * khaosd's workflow state: `running`, `partial`, `completed`, `retired`, …
         */
        state: string;
        /**
         * A provider failure, shown with its details.
         */
        failure?: {
            generation: any;
        };
    }[];
    /**
     * A prepared workflow the engine has not admitted, with its reason.
     */
    unadmitted?: {
        id: string;
        state: string;
        reason: string;
    } | null;
    /**
     * A resume is being admitted.
     */
    resuming?: boolean;
    /**
     * A workflow this window can attach to and follow.
     */
    recoveringId?: string;
    /**
     * Attaching to it is in flight.
     */
    observing?: boolean;
    /**
     * The reads that are not chosen.
     */
    unchosenIds?: readonly string[];
    /**
     * The narrator voice, for the hint before reading.
     */
    narrator?: {
        /**
         * What the app knows of the narrator voice.
         */
        status: "unknown" | "unset" | "notListed" | "unavailable" | "notLocked" | "usable" | string;
        /**
         * The narrator voice's name.
         */
        name?: string;
        /**
         * Its profile id, for Lock.
         */
        voiceProfileId?: string;
        /**
         * Why it is unavailable, in the engine's words.
         */
        reason?: string;
    };
    /**
     * Whether the narrator's voice can be chosen from here.
     */
    canChooseNarrator?: boolean;
    /**
     * The last refusal, by the engine's code.
     */
    outcome?: {
        code: string;
        voices?: readonly {
            voiceProfileId: string;
            voiceName: string;
        }[];
    } | null;
    /**
     * What the refusal offers.
     */
    offer?: import("./lib/types.js").Refusal | null;
    /**
     * What the engine left unread; null before a read.
     */
    skipped?: readonly {
        element: string;
        kind: string;
    }[] | null;
    /**
     * Reports Read scene.
     */
    onRead?: () => void;
    /**
     * Reports a read chosen.
     */
    onChoose?: (id: string) => void;
    /**
     * Reports a confirmed delete, or a confirmed retire of a workflow.
     */
    onDelete?: (id: string) => void;
    /**
     * Reports a read to save.
     */
    onDownload?: (id: string) => void;
    /**
     * Reports a read to open on its timeline. Without it no row offers it.
     */
    onOpen?: (id: string) => void;
    /**
     * Reports a workflow to resume.
     */
    onResume?: (id: string) => void;
    /**
     * Reports Observe existing scene read.
     */
    onObserve?: () => void;
    /**
     * Reports a confirmed prune, with the ids counted when it was asked.
     */
    onRemoveUnchosen?: (ids: readonly string[]) => void;
    /**
     * Reports Choose the narrator's voice.
     */
    onChooseNarrator?: () => void;
    /**
     * Reports a voice to lock. Without it no Lock is offered.
     */
    onLockVoice?: (voiceProfileId: string) => void;
    /**
     * Reports a refusal fix.
     */
    onFix?: (fix: any) => void;
    /**
     * Reports Report a Problem….
     */
    onReport?: () => void;
}, {}, "">;
type Props = {
    /**
     * The scene's heading, for the confirmations.
     */
    sceneHeading?: string;
    /**
     * Inline players in the rows, or a host transport that owns auditions.
     */
    playback?: "inline" | "hosted";
    /**
     * The scene's reads, as TakeList takes them; each carries its `label` and `voiceName`.
     */
    takes?: readonly any[];
    /**
     * The chosen read's id.
     */
    chosenId?: string;
    /**
     * A read is being prepared or made.
     */
    generating?: boolean;
    /**
     * A choose, delete or prune is in flight.
     */
    mutating?: boolean;
    /**
     * How far the read in flight has got.
     */
    progress?: string;
    /**
     * Whether reads can be saved to a file.
     */
    canDownload?: boolean;
    /**
     * The read being saved.
     */
    downloadingId?: string;
    /**
     * The workflows reading this scene, as SceneReadStatus takes them.
     */
    workflows?: readonly {
        /**
         * The workflow's id.
         */
        id: string;
        /**
         * khaosd's workflow state: `running`, `partial`, `completed`, `retired`, …
         */
        state: string;
        /**
         * A provider failure, shown with its details.
         */
        failure?: {
            generation: any;
        };
    }[];
    /**
     * A prepared workflow the engine has not admitted, with its reason.
     */
    unadmitted?: {
        id: string;
        state: string;
        reason: string;
    } | null;
    /**
     * A resume is being admitted.
     */
    resuming?: boolean;
    /**
     * A workflow this window can attach to and follow.
     */
    recoveringId?: string;
    /**
     * Attaching to it is in flight.
     */
    observing?: boolean;
    /**
     * The reads that are not chosen.
     */
    unchosenIds?: readonly string[];
    /**
     * The narrator voice, for the hint before reading.
     */
    narrator?: {
        /**
         * What the app knows of the narrator voice.
         */
        status: "unknown" | "unset" | "notListed" | "unavailable" | "notLocked" | "usable" | string;
        /**
         * The narrator voice's name.
         */
        name?: string;
        /**
         * Its profile id, for Lock.
         */
        voiceProfileId?: string;
        /**
         * Why it is unavailable, in the engine's words.
         */
        reason?: string;
    };
    /**
     * Whether the narrator's voice can be chosen from here.
     */
    canChooseNarrator?: boolean;
    /**
     * The last refusal, by the engine's code.
     */
    outcome?: {
        code: string;
        voices?: readonly {
            voiceProfileId: string;
            voiceName: string;
        }[];
    } | null;
    /**
     * What the refusal offers.
     */
    offer?: import("./lib/types.js").Refusal | null;
    /**
     * What the engine left unread; null before a read.
     */
    skipped?: readonly {
        element: string;
        kind: string;
    }[] | null;
    /**
     * Reports Read scene.
     */
    onRead?: () => void;
    /**
     * Reports a read chosen.
     */
    onChoose?: (id: string) => void;
    /**
     * Reports a confirmed delete, or a confirmed retire of a workflow.
     */
    onDelete?: (id: string) => void;
    /**
     * Reports a read to save.
     */
    onDownload?: (id: string) => void;
    /**
     * Reports a read to open on its timeline. Without it no row offers it.
     */
    onOpen?: (id: string) => void;
    /**
     * Reports a workflow to resume.
     */
    onResume?: (id: string) => void;
    /**
     * Reports Observe existing scene read.
     */
    onObserve?: () => void;
    /**
     * Reports a confirmed prune, with the ids counted when it was asked.
     */
    onRemoveUnchosen?: (ids: readonly string[]) => void;
    /**
     * Reports Choose the narrator's voice.
     */
    onChooseNarrator?: () => void;
    /**
     * Reports a voice to lock. Without it no Lock is offered.
     */
    onLockVoice?: (voiceProfileId: string) => void;
    /**
     * Reports a refusal fix.
     */
    onFix?: (fix: any) => void;
    /**
     * Reports Report a Problem….
     */
    onReport?: () => void;
};

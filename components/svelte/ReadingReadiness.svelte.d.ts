export default ReadingReadiness;
type ReadingReadiness = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ReadingReadiness: import("svelte").Component<{
    /**
     * The engine's readiness read; `unserved` when the engine has no such route.
     */
    readiness?: {
        kind: "loading";
    } | {
        kind: "loaded";
        readiness: {
            scenes: readonly {
                sceneId: string;
                ready: boolean;
                /**
                 * The engine's reason, verbatim; present exactly when not ready.
                 */
                refusal?: string;
                lines: number;
                newHosted: number;
                newLocal: number;
                reused: number;
            }[];
            totals: {
                scenes: number;
                ready: number;
                refused: number;
                lines: number;
                newHosted: number;
                newLocal: number;
                reused: number;
            };
            voices: readonly {
                voiceProfileId: string;
                name: string;
                /**
                 * Absent when false: khaosd omits it.
                 */
                narrator?: boolean;
                locked: boolean;
                providerAvailable: boolean;
                /**
                 * Why the voice cannot be used, verbatim.
                 */
                problem?: string;
                /**
                 * Why the voice cannot render on this Mac (khaos-manager#1091).
                 */
                blocked?: {
                    code: string;
                    message: string;
                    models?: readonly {
                        id: string;
                        name: string;
                        repoId: string;
                    }[];
                };
            }[];
            modelsMissing?: readonly {
                id: string;
                name: string;
                repoId: string;
            }[] | null;
        };
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "unserved";
    };
    /**
     * The inspected scene.
     */
    sceneId?: string;
    /**
     * Adds the on-this-Mac and already-made counts.
     */
    advanced?: boolean;
    /**
     * Asked to lock an unlocked voice.
     */
    onLockVoice?: (voiceProfileId: string) => void;
    /**
     * Asked to recast a voice whose engine is not enabled.
     */
    onRecast?: (voiceProfileId: string, narrator: boolean) => void;
    /**
     * Asked to download the models the story's voices need.
     */
    onDownloadModels?: () => void;
}, {}, "">;
type Props = {
    /**
     * The engine's readiness read; `unserved` when the engine has no such route.
     */
    readiness?: {
        kind: "loading";
    } | {
        kind: "loaded";
        readiness: {
            scenes: readonly {
                sceneId: string;
                ready: boolean;
                /**
                 * The engine's reason, verbatim; present exactly when not ready.
                 */
                refusal?: string;
                lines: number;
                newHosted: number;
                newLocal: number;
                reused: number;
            }[];
            totals: {
                scenes: number;
                ready: number;
                refused: number;
                lines: number;
                newHosted: number;
                newLocal: number;
                reused: number;
            };
            voices: readonly {
                voiceProfileId: string;
                name: string;
                /**
                 * Absent when false: khaosd omits it.
                 */
                narrator?: boolean;
                locked: boolean;
                providerAvailable: boolean;
                /**
                 * Why the voice cannot be used, verbatim.
                 */
                problem?: string;
                /**
                 * Why the voice cannot render on this Mac (khaos-manager#1091).
                 */
                blocked?: {
                    code: string;
                    message: string;
                    models?: readonly {
                        id: string;
                        name: string;
                        repoId: string;
                    }[];
                };
            }[];
            modelsMissing?: readonly {
                id: string;
                name: string;
                repoId: string;
            }[] | null;
        };
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "unserved";
    };
    /**
     * The inspected scene.
     */
    sceneId?: string;
    /**
     * Adds the on-this-Mac and already-made counts.
     */
    advanced?: boolean;
    /**
     * Asked to lock an unlocked voice.
     */
    onLockVoice?: (voiceProfileId: string) => void;
    /**
     * Asked to recast a voice whose engine is not enabled.
     */
    onRecast?: (voiceProfileId: string, narrator: boolean) => void;
    /**
     * Asked to download the models the story's voices need.
     */
    onDownloadModels?: () => void;
};

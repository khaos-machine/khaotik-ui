export default DialogueInspector;
type DialogueInspector = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const DialogueInspector: import("svelte").Component<{
    /**
     * The line being inspected.
     */
    line?: {
        /**
         * The line's element id.
         */
        element_id: string;
        /**
         * The line.
         */
        text: string;
        /**
         * Its direction.
         */
        parenthetical?: string;
        /**
         * Its scene's id.
         */
        scene_id: string;
        /**
         * Its scene's heading.
         */
        scene_slugline: string;
    };
    /**
     * The speaker's name.
     */
    speaker?: string;
    /**
     * Where it sits among its speaker's lines in the scene; null when unknown.
     */
    position?: {
        n: number;
        of: number;
    } | null;
    /**
     * Whether this line can be voiced here. Without it there is no Takes section.
     */
    takesOffered?: boolean;
    /**
     * The line's takes, as TakeList takes them.
     */
    takes?: readonly any[];
    /**
     * A take of this line is in flight.
     */
    generating?: boolean;
    /**
     * Why this line cannot be spoken now; empty when it can.
     */
    refusal?: string;
    /**
     * Why the cast voice takes no direction; empty when it takes one.
     */
    directionReason?: string;
    /**
     * How far the take in flight has got.
     */
    progress?: string;
    /**
     * The provider that bills for a take ("Gemini TTS"); empty when the voice runs on this machine.
     */
    billedBy?: string;
    /**
     * Voices a refusal says are not locked. Each gets a Lock button when `onLockVoice` is given.
     */
    lockVoices?: readonly {
        voiceProfileId: string;
        voiceName?: string;
    }[];
    /**
     * A refused take's fixes.
     */
    offer?: import("./lib/types.js").Refusal | null;
    /**
     * Reports Esc.
     */
    onDismiss?: () => void;
    /**
     * Reports the scene to show.
     */
    onOpenScene?: (sceneId: string) => void;
    /**
     * Reports Generate, with the direction.
     */
    onTake?: (direction: string) => void;
    /**
     * Reports a retried take.
     */
    onRetry?: (takeId: string) => void;
    /**
     * Reports a voice to lock.
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
     * The line being inspected.
     */
    line?: {
        /**
         * The line's element id.
         */
        element_id: string;
        /**
         * The line.
         */
        text: string;
        /**
         * Its direction.
         */
        parenthetical?: string;
        /**
         * Its scene's id.
         */
        scene_id: string;
        /**
         * Its scene's heading.
         */
        scene_slugline: string;
    };
    /**
     * The speaker's name.
     */
    speaker?: string;
    /**
     * Where it sits among its speaker's lines in the scene; null when unknown.
     */
    position?: {
        n: number;
        of: number;
    } | null;
    /**
     * Whether this line can be voiced here. Without it there is no Takes section.
     */
    takesOffered?: boolean;
    /**
     * The line's takes, as TakeList takes them.
     */
    takes?: readonly any[];
    /**
     * A take of this line is in flight.
     */
    generating?: boolean;
    /**
     * Why this line cannot be spoken now; empty when it can.
     */
    refusal?: string;
    /**
     * Why the cast voice takes no direction; empty when it takes one.
     */
    directionReason?: string;
    /**
     * How far the take in flight has got.
     */
    progress?: string;
    /**
     * The provider that bills for a take ("Gemini TTS"); empty when the voice runs on this machine.
     */
    billedBy?: string;
    /**
     * Voices a refusal says are not locked. Each gets a Lock button when `onLockVoice` is given.
     */
    lockVoices?: readonly {
        voiceProfileId: string;
        voiceName?: string;
    }[];
    /**
     * A refused take's fixes.
     */
    offer?: import("./lib/types.js").Refusal | null;
    /**
     * Reports Esc.
     */
    onDismiss?: () => void;
    /**
     * Reports the scene to show.
     */
    onOpenScene?: (sceneId: string) => void;
    /**
     * Reports Generate, with the direction.
     */
    onTake?: (direction: string) => void;
    /**
     * Reports a retried take.
     */
    onRetry?: (takeId: string) => void;
    /**
     * Reports a voice to lock.
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

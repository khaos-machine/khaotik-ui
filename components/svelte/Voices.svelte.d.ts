export default Voices;
type Voices = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Voices: import("svelte").Component<{
    /**
     * The pane shown.
     */
    view?: "profiles" | "speak" | "studio" | "sound";
    /**
     * A pane was chosen in the sidebar.
     */
    onView?: (view: "profiles" | "speak" | "studio" | "sound") => void;
    /**
     * Your voices' count in the sidebar; absent where the list is not read.
     */
    voiceCount?: number | undefined;
    /**
     * What the engine last said, above every pane.
     */
    outcomes?: readonly {
        key: string;
        tone: import("svelte").ComponentProps<typeof OutcomeBanner>["tone"];
        title: string;
        detail: string;
        onDismiss?: () => void;
        offer?: import("./lib/types.js").Refusal;
        onFix?: (fix: import("./lib/types.js").RefusalFix) => void;
        onReport?: () => void;
    }[];
    /**
     * The story hosted voice work is paid from (khaos-app#615): the open stories, most recent first, by path and title; the one chosen; why none can be, when no story is open; and `fixed` when the window was opened from a character, whose story it shows without a choice. Stories sharing a title are told apart by their file name. Null draws nothing.
     */
    story?: {
        choices: readonly {
            id: string;
            label: string;
        }[];
        chosen: string;
        reason: string;
        fixed: boolean;
    } | null;
    /**
     * Another open story was chosen to pay.
     */
    onStory?: (id: string) => void;
    /**
     * Whether Your voices can be read: undeclared shows one state and nothing else.
     */
    own?: {
        kind: "unread";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "undeclared";
        description: string;
    } | {
        kind: "loading";
    } | {
        kind: "loaded";
    };
    /**
     * Every voice the synth lists.
     */
    voices?: readonly {
        id: string;
        name: string;
        language: string;
        source: string;
        notLocked: boolean;
        group: "design" | "preset" | "clone";
    }[];
    /**
     * The voice chosen in Your voices.
     */
    ownId?: string;
    /**
     * A voice was chosen in Your voices.
     */
    onOwn?: (id: string) => void;
    /**
     * The chosen voice's details.
     */
    ownVoice?: {
        id: string;
        name: string;
        kind: string;
        language: string;
        notLocked: boolean;
        removal: string;
        remove: {
            deleted: boolean;
            disabled: boolean;
        } | null;
        lock: "lock" | "change" | null;
    } | null;
    /**
     * Delete or remove was agreed to, after the confirmation here.
     */
    onRemove?: (id: string) => void;
    /**
     * Lock a designed voice, or change the take it is locked to.
     */
    onLock?: (id: string) => void;
    /**
     * Whether the synth's voices can be read for Speak a line.
     */
    speak?: {
        kind: "unread";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "undeclared";
        description: string;
    } | {
        kind: "loading";
    } | {
        kind: "loaded";
    };
    /**
     * What Speak a line says when the synth lists no voice.
     */
    emptyTitle?: string;
    /**
     * The voice picked to speak a line in.
     */
    profileId?: string;
    /**
     * A voice was picked, here or with Speak a line in this voice.
     */
    onProfile?: (id: string) => void;
    /**
     * The voice picked to speak a line in, or null.
     */
    picked?: {
        name: string;
        directionReason: string;
        hosted: {
            ready: boolean;
            reason: string;
            active: boolean;
        } | null;
    } | null;
    /**
     * The line to speak.
     */
    line?: string;
    /**
     * The line was typed.
     */
    onLine?: (value: string) => void;
    /**
     * How to say it.
     */
    direction?: string;
    /**
     * The direction was typed.
     */
    onDirection?: (value: string) => void;
    /**
     * The local synth's tuning.
     */
    params?: {
        temperature: number;
        topK: number;
        topP: number;
        repetitionPenalty: number;
    };
    /**
     * A tuning control moved.
     */
    onParam?: (key: "temperature" | "top_k" | "top_p" | "repetition_penalty", value: number) => void;
    /**
     * Whether Speak with profile can be pressed now.
     */
    canSpeak?: boolean;
    /**
     * A line is with the engine.
     */
    submitted?: boolean;
    /**
     * The engine did not apply the direction to this voice.
     */
    directionNotApplied?: boolean;
    /**
     * Speak with profile.
     */
    onSpeak?: (() => void) | undefined;
    /**
     * The spoken line.
     */
    clip?: {
        src: string;
        peaks: import("svelte").ComponentProps<typeof AudioPlayback>["peaks"];
        peaksError: string;
    } | null;
    /**
     * Designing a voice for one character, or null.
     */
    character?: {
        name: string;
        brief: {
            kind: "loading";
        } | {
            kind: "failed";
            message: string;
        } | {
            kind: "narrator";
        } | {
            kind: "silent";
        } | {
            kind: "brief";
            suggested: readonly {
                detail: string;
                restsOn: string;
            }[];
            auditionLines: readonly {
                line: string;
                scene: string;
            }[];
        };
        kept: {
            name: string;
        } | null;
        casting: boolean;
        outcome: {
            title: string;
            detail: string;
        } | null;
    } | null;
    /**
     * Done with designing a voice for the character.
     */
    onCloseCharacter?: () => void;
    /**
     * Cast the character as the voice kept for them.
     */
    onCast?: () => void;
    /**
     * A provider candidate is waiting, or the studio is busy.
     */
    newVoiceDisabled?: boolean;
    /**
     * Start the studio afresh.
     */
    onNewVoice?: () => void;
    /**
     * Where the voice is made, 'local' or 'hosted'; null offers no choice.
     */
    source?: string | null;
    /**
     * Local or hosted was chosen.
     */
    onSource?: (value: string) => void;
    /**
     * What the last lock said, in the app's words; '' for none.
     */
    lockNote?: string;
    /**
     * Which studio is shown, and the states around it.
     */
    studio?: {
        kind: "hosted";
        readError: string;
        failure: {
            generation: import("svelte").ComponentProps<typeof GenerationFailureDetails>["generation"];
            copy?: (text: string) => Promise<void>;
        } | null;
        next: "discard" | "another" | null;
    } | {
        kind: "local";
    } | {
        kind: "lock-reading";
        name: string;
    } | {
        kind: "lock-failed";
        name: string;
        message: string;
    } | {
        kind: "lock-not-design";
        name: string;
    } | {
        kind: "lock";
        name: string;
    };
    /**
     * The host's VoiceStudio for the studio shown.
     */
    voiceStudio?: import("svelte").Snippet | undefined;
    /**
     * Discard the provider candidate.
     */
    onDiscardCandidate?: () => void;
    /**
     * Start another provider candidate.
     */
    onAnotherCandidate?: () => void;
    /**
     * Changing a locked voice's take is being asked.
     */
    changingTake?: {
        voice: string;
        take: string;
    } | null;
    /**
     * Changing the locked take was agreed to.
     */
    onConfirmChange?: () => void;
    /**
     * Changing the locked take was turned down.
     */
    onCancelChange?: () => void;
    /**
     * The host's SoundStudio; absent, Sound is not offered.
     */
    sound?: import("svelte").Snippet | undefined;
}, {}, "">;
type Props = {
    /**
     * The pane shown.
     */
    view?: "profiles" | "speak" | "studio" | "sound";
    /**
     * A pane was chosen in the sidebar.
     */
    onView?: (view: "profiles" | "speak" | "studio" | "sound") => void;
    /**
     * Your voices' count in the sidebar; absent where the list is not read.
     */
    voiceCount?: number | undefined;
    /**
     * What the engine last said, above every pane.
     */
    outcomes?: readonly {
        key: string;
        tone: import("svelte").ComponentProps<typeof OutcomeBanner>["tone"];
        title: string;
        detail: string;
        onDismiss?: () => void;
        offer?: import("./lib/types.js").Refusal;
        onFix?: (fix: import("./lib/types.js").RefusalFix) => void;
        onReport?: () => void;
    }[];
    /**
     * The story hosted voice work is paid from (khaos-app#615): the open stories, most recent first, by path and title; the one chosen; why none can be, when no story is open; and `fixed` when the window was opened from a character, whose story it shows without a choice. Stories sharing a title are told apart by their file name. Null draws nothing.
     */
    story?: {
        choices: readonly {
            id: string;
            label: string;
        }[];
        chosen: string;
        reason: string;
        fixed: boolean;
    } | null;
    /**
     * Another open story was chosen to pay.
     */
    onStory?: (id: string) => void;
    /**
     * Whether Your voices can be read: undeclared shows one state and nothing else.
     */
    own?: {
        kind: "unread";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "undeclared";
        description: string;
    } | {
        kind: "loading";
    } | {
        kind: "loaded";
    };
    /**
     * Every voice the synth lists.
     */
    voices?: readonly {
        id: string;
        name: string;
        language: string;
        source: string;
        notLocked: boolean;
        group: "design" | "preset" | "clone";
    }[];
    /**
     * The voice chosen in Your voices.
     */
    ownId?: string;
    /**
     * A voice was chosen in Your voices.
     */
    onOwn?: (id: string) => void;
    /**
     * The chosen voice's details.
     */
    ownVoice?: {
        id: string;
        name: string;
        kind: string;
        language: string;
        notLocked: boolean;
        removal: string;
        remove: {
            deleted: boolean;
            disabled: boolean;
        } | null;
        lock: "lock" | "change" | null;
    } | null;
    /**
     * Delete or remove was agreed to, after the confirmation here.
     */
    onRemove?: (id: string) => void;
    /**
     * Lock a designed voice, or change the take it is locked to.
     */
    onLock?: (id: string) => void;
    /**
     * Whether the synth's voices can be read for Speak a line.
     */
    speak?: {
        kind: "unread";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "undeclared";
        description: string;
    } | {
        kind: "loading";
    } | {
        kind: "loaded";
    };
    /**
     * What Speak a line says when the synth lists no voice.
     */
    emptyTitle?: string;
    /**
     * The voice picked to speak a line in.
     */
    profileId?: string;
    /**
     * A voice was picked, here or with Speak a line in this voice.
     */
    onProfile?: (id: string) => void;
    /**
     * The voice picked to speak a line in, or null.
     */
    picked?: {
        name: string;
        directionReason: string;
        hosted: {
            ready: boolean;
            reason: string;
            active: boolean;
        } | null;
    } | null;
    /**
     * The line to speak.
     */
    line?: string;
    /**
     * The line was typed.
     */
    onLine?: (value: string) => void;
    /**
     * How to say it.
     */
    direction?: string;
    /**
     * The direction was typed.
     */
    onDirection?: (value: string) => void;
    /**
     * The local synth's tuning.
     */
    params?: {
        temperature: number;
        topK: number;
        topP: number;
        repetitionPenalty: number;
    };
    /**
     * A tuning control moved.
     */
    onParam?: (key: "temperature" | "top_k" | "top_p" | "repetition_penalty", value: number) => void;
    /**
     * Whether Speak with profile can be pressed now.
     */
    canSpeak?: boolean;
    /**
     * A line is with the engine.
     */
    submitted?: boolean;
    /**
     * The engine did not apply the direction to this voice.
     */
    directionNotApplied?: boolean;
    /**
     * Speak with profile.
     */
    onSpeak?: (() => void) | undefined;
    /**
     * The spoken line.
     */
    clip?: {
        src: string;
        peaks: import("svelte").ComponentProps<typeof AudioPlayback>["peaks"];
        peaksError: string;
    } | null;
    /**
     * Designing a voice for one character, or null.
     */
    character?: {
        name: string;
        brief: {
            kind: "loading";
        } | {
            kind: "failed";
            message: string;
        } | {
            kind: "narrator";
        } | {
            kind: "silent";
        } | {
            kind: "brief";
            suggested: readonly {
                detail: string;
                restsOn: string;
            }[];
            auditionLines: readonly {
                line: string;
                scene: string;
            }[];
        };
        kept: {
            name: string;
        } | null;
        casting: boolean;
        outcome: {
            title: string;
            detail: string;
        } | null;
    } | null;
    /**
     * Done with designing a voice for the character.
     */
    onCloseCharacter?: () => void;
    /**
     * Cast the character as the voice kept for them.
     */
    onCast?: () => void;
    /**
     * A provider candidate is waiting, or the studio is busy.
     */
    newVoiceDisabled?: boolean;
    /**
     * Start the studio afresh.
     */
    onNewVoice?: () => void;
    /**
     * Where the voice is made, 'local' or 'hosted'; null offers no choice.
     */
    source?: string | null;
    /**
     * Local or hosted was chosen.
     */
    onSource?: (value: string) => void;
    /**
     * What the last lock said, in the app's words; '' for none.
     */
    lockNote?: string;
    /**
     * Which studio is shown, and the states around it.
     */
    studio?: {
        kind: "hosted";
        readError: string;
        failure: {
            generation: import("svelte").ComponentProps<typeof GenerationFailureDetails>["generation"];
            copy?: (text: string) => Promise<void>;
        } | null;
        next: "discard" | "another" | null;
    } | {
        kind: "local";
    } | {
        kind: "lock-reading";
        name: string;
    } | {
        kind: "lock-failed";
        name: string;
        message: string;
    } | {
        kind: "lock-not-design";
        name: string;
    } | {
        kind: "lock";
        name: string;
    };
    /**
     * The host's VoiceStudio for the studio shown.
     */
    voiceStudio?: import("svelte").Snippet | undefined;
    /**
     * Discard the provider candidate.
     */
    onDiscardCandidate?: () => void;
    /**
     * Start another provider candidate.
     */
    onAnotherCandidate?: () => void;
    /**
     * Changing a locked voice's take is being asked.
     */
    changingTake?: {
        voice: string;
        take: string;
    } | null;
    /**
     * Changing the locked take was agreed to.
     */
    onConfirmChange?: () => void;
    /**
     * Changing the locked take was turned down.
     */
    onCancelChange?: () => void;
    /**
     * The host's SoundStudio; absent, Sound is not offered.
     */
    sound?: import("svelte").Snippet | undefined;
};
import OutcomeBanner from './OutcomeBanner.svelte';
import AudioPlayback from './AudioPlayback.svelte';
import GenerationFailureDetails from './GenerationFailureDetails.svelte';

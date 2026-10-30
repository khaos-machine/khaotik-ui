export default VoiceStudio;
type VoiceStudio = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const VoiceStudio: import("svelte").Component<{
    /**
     * Given, renders provider identity creation instead of local speech sampling.
     */
    hostedChoices?: readonly {
        /**
         * Host-owned stable choice identity.
         */
        id: string;
        /**
         * Reviewed execution profile revision, part of consent scope.
         */
        profile?: string;
        /**
         * Provider and model label from the host.
         */
        label: string;
        operation: "voice.design" | "voice.clone";
        /**
         * Required for replication, supplied by the host.
         */
        cloneRequirements?: {
            /**
             * Mandatory words supplied by the host's reviewed provider profile.
             */
            consentStatement: string;
            /**
             * Locale of that statement.
             */
            consentLocale: string;
            /**
             * Provider's official recording guide.
             */
            documentationUrl: string;
            /**
             * Recording guidance supplied by the reviewed provider profile.
             */
            sourceInstructions: string;
            /**
             * How the same speaker records the required consent.
             */
            consentInstructions: string;
            sourceMinSeconds: number;
            sourceMaxSeconds: number;
            mimeType: string;
            sampleRate: number;
            channels: number;
            bitsPerSample: number;
        };
        /**
         * Host readiness, never inferred from catalogue membership.
         */
        ready: boolean;
        /**
         * Host reason for unavailability.
         */
        reason?: string;
    }[];
    /**
     * Controlled provider/model choice.
     */
    hostedChoiceId?: string;
    /**
     * Reports a choice; host owns selection.
     */
    onHostedChoice?: (id: string) => void;
    /**
     * Paid identity creation, admitted by the story budget and separate from acceptance.
     */
    onHostedDesign?: (spec: {
        name: string;
        description: string;
        traits?: {
            age?: string;
            gender?: string;
            languageCode?: string;
            regionCode?: string;
            accent?: string;
            pitch?: string;
            timbre?: string;
            persona?: string;
            context?: string;
            delivery?: string;
        };
    }) => void;
    /**
     * Optional host-owned text generation. Returns a reviewable proposal; never creates a voice or replaces the editable description automatically.
     */
    onRefineDescription?: (description: string, signal: AbortSignal, traits?: {
        age?: string;
        gender?: string;
        languageCode?: string;
        regionCode?: string;
        accent?: string;
        pitch?: string;
        timbre?: string;
        persona?: string;
        context?: string;
        delivery?: string;
    }) => Promise<{
        description: string;
        notes: readonly string[];
    }>;
    /**
     * Maps a refused refinement to the fixes it offers (such as Set budget… for an unbudgeted story), drawn with Report a Problem…. The host chooses them from the engine's fields; null, or no mapper, shows the error's message.
     */
    refinementRefusal?: (error: unknown) => {
        offer: import("./lib/types.js").Refusal;
        onFix?: (fix: import("./lib/types.js").RefusalFix) => void;
        onReport?: () => void;
    } | null;
    /**
     * Adult-human replication with separate real source and provider consent recordings. The host validates, bounds and submits.
     */
    onHostedClone?: (spec: {
        name: string;
        source: File;
        recording: File;
        subjectOrAuthority: string;
        allowedUses: string;
        capturedAt: string;
        sourceDescription: string;
        expiresAt: string;
        attested: true;
    }) => void;
    /**
     * Captured candidate preview; it is never a local reference.
     */
    hostedCandidate?: {
        id: string;
        name: string;
        src: string;
    };
    /**
     * Accept and lock the provider identity after audition.
     */
    onHostedAccept?: (id: string) => void;
    /**
     * Host lifecycle or unresolved-operation message.
     */
    hostedStatus?: string;
    /**
     * A refused creation or clone and the fixes it offers (such as Set budget… for an unbudgeted story), drawn with Report a Problem… in place of `hostedStatus`. The host chooses them from the engine's fields.
     */
    hostedRefusal?: {
        offer: import("./lib/types.js").Refusal;
        onFix?: (fix: import("./lib/types.js").RefusalFix) => void;
        onReport?: () => void;
    } | null;
    /**
     * An unresolved operation blocks further creation.
     */
    hostedBlocked?: boolean;
    /**
     * Host confirmed durable acceptance.
     */
    hostedAccepted?: boolean;
    /**
     * The latest generated clip, shared across tabs. Ignored for playback when `takes` is given: the takes column plays them.
     */
    result?: {
        /**
         * Audio URL of the generated clip.
         */
        src: string;
        /**
         * True while the host is synthesizing.
         */
        generating?: boolean;
    } | null;
    /**
     * The engine's preset speakers, for the Preset tab (D86).
     */
    speakers?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * Why the Preset tab has no speakers, in the host's words.
     */
    speakersReason?: string;
    /**
     * Language codes each tab offers, as the engine lists them (D88). A tab with none shows no picker.
     */
    languages?: {
        design?: readonly string[];
        clone?: readonly string[];
        preset?: readonly string[];
    };
    /**
     * The clone models the host can run, best first (D88).
     */
    cloneModels?: readonly {
        id: string;
        label: string;
    }[];
    /**
     * Called with the mode and its spec when a panel generates.
     */
    ongenerate?: (kind: "design" | "clone" | "preset" | "dialogue", spec: any) => void;
    /**
     * Which tabs to offer, in this order. Defaults to all three. A host that cannot serve a mode leaves it out rather than offering a tab that only refuses.
     */
    modes?: readonly ("Design" | "Clone" | "Preset" | "Dialogue")[];
    /**
     * Every audition the host kept, newest first. Given, the studio shows them beside the form (D79).
     */
    takes?: readonly {
        /**
         * The engine's generation id. Passed back to `onChooseTake`.
         */
        id: string;
        /**
         * The take's name, e.g. "Take 2".
         */
        label: string;
        /**
         * When it was generated, as an ISO 8601 timestamp.
         */
        createdAt: string;
        /**
         * What made it, in words: the description, or what the reference clip says.
         */
        voiceName: string;
        /**
         * Playable audio. Without it the take's player is disabled.
         */
        src?: string;
        /**
         * The engine's message for a take that failed, verbatim.
         */
        error?: string;
        /**
         * The words the take speaks. In lock mode a take of more than one sentence is warned about before it is locked (D90).
         */
        text?: string;
    }[];
    /**
     * A generation is in flight. Disables Generate. Consumer-set, never inferred.
     */
    generating?: boolean;
    /**
     * Keep the voice under this name. `lock` is the storyteller's choice on the Design tab: true locks the voice to the chosen take, false keeps the take as a sample and the voice stays designed. Always false for a clone. Reports intent: the host saves, re-reads and says how it went.
     */
    onSave?: (save: {
        kind: "design" | "clone" | "preset";
        name: string;
        lock: boolean;
    }) => void;
    /**
     * Why the voice cannot be kept right now, in the host's words. Disables Save and is shown under it. Blank means none.
     */
    saveReason?: string;
    /**
     * A save is in flight.
     */
    saving?: boolean;
    /**
     * The take the voice will be kept from. That row shows "Chosen".
     */
    chosenTakeId?: string;
    /**
     * Reports "Use this take". Without it takes cannot be chosen.
     */
    onChooseTake?: (id: string) => void;
    /**
     * Asks for a failed take again (D85).
     */
    onRetryTake?: (id: string) => void;
    /**
     * How far the take in flight has got, in the host's words (D87).
     */
    progress?: string;
    /**
     * One line under "Keep this voice" saying what Save keeps, in the host's words.
     */
    saveHint?: string;
    /**
     * Opens the studio on this designed voice to lock it to a take (D90): the Design tab alone, its description read-only, and one Lock button in place of the name and the keep choice. `saveReason` and `saving` apply to the lock.
     */
    lockVoice?: {
        /**
         * The voice's name, as the storyteller knows it.
         */
        name: string;
        /**
         * The voice's description, read from the engine. Takes are generated from it and it is not edited here.
         */
        description: string;
        /**
         * Whether the voice is already locked to a take. Then the button reads "Change the take…".
         */
        locked: boolean;
    };
    /**
     * Starting values, such as a character's voice brief: the name a voice is kept under, the description on the Design tab and the hosted form, and the line the Design tab speaks. Read once on mount; key the studio to start it again.
     */
    seed?: {
        name?: string;
        description?: string;
        text?: string;
    };
    /**
     * Lock mode: lock the voice to this take, the chosen one, else the newest that plays. Reports intent: the host locks, re-reads and says how it went. For a voice already `locked` it is a change of take, which the host confirms before it makes it.
     */
    onLock?: (takeId: string) => void;
}, {}, "">;
type Props = {
    /**
     * Given, renders provider identity creation instead of local speech sampling.
     */
    hostedChoices?: readonly {
        /**
         * Host-owned stable choice identity.
         */
        id: string;
        /**
         * Reviewed execution profile revision, part of consent scope.
         */
        profile?: string;
        /**
         * Provider and model label from the host.
         */
        label: string;
        operation: "voice.design" | "voice.clone";
        /**
         * Required for replication, supplied by the host.
         */
        cloneRequirements?: {
            /**
             * Mandatory words supplied by the host's reviewed provider profile.
             */
            consentStatement: string;
            /**
             * Locale of that statement.
             */
            consentLocale: string;
            /**
             * Provider's official recording guide.
             */
            documentationUrl: string;
            /**
             * Recording guidance supplied by the reviewed provider profile.
             */
            sourceInstructions: string;
            /**
             * How the same speaker records the required consent.
             */
            consentInstructions: string;
            sourceMinSeconds: number;
            sourceMaxSeconds: number;
            mimeType: string;
            sampleRate: number;
            channels: number;
            bitsPerSample: number;
        };
        /**
         * Host readiness, never inferred from catalogue membership.
         */
        ready: boolean;
        /**
         * Host reason for unavailability.
         */
        reason?: string;
    }[];
    /**
     * Controlled provider/model choice.
     */
    hostedChoiceId?: string;
    /**
     * Reports a choice; host owns selection.
     */
    onHostedChoice?: (id: string) => void;
    /**
     * Paid identity creation, admitted by the story budget and separate from acceptance.
     */
    onHostedDesign?: (spec: {
        name: string;
        description: string;
        traits?: {
            age?: string;
            gender?: string;
            languageCode?: string;
            regionCode?: string;
            accent?: string;
            pitch?: string;
            timbre?: string;
            persona?: string;
            context?: string;
            delivery?: string;
        };
    }) => void;
    /**
     * Optional host-owned text generation. Returns a reviewable proposal; never creates a voice or replaces the editable description automatically.
     */
    onRefineDescription?: (description: string, signal: AbortSignal, traits?: {
        age?: string;
        gender?: string;
        languageCode?: string;
        regionCode?: string;
        accent?: string;
        pitch?: string;
        timbre?: string;
        persona?: string;
        context?: string;
        delivery?: string;
    }) => Promise<{
        description: string;
        notes: readonly string[];
    }>;
    /**
     * Maps a refused refinement to the fixes it offers (such as Set budget… for an unbudgeted story), drawn with Report a Problem…. The host chooses them from the engine's fields; null, or no mapper, shows the error's message.
     */
    refinementRefusal?: (error: unknown) => {
        offer: import("./lib/types.js").Refusal;
        onFix?: (fix: import("./lib/types.js").RefusalFix) => void;
        onReport?: () => void;
    } | null;
    /**
     * Adult-human replication with separate real source and provider consent recordings. The host validates, bounds and submits.
     */
    onHostedClone?: (spec: {
        name: string;
        source: File;
        recording: File;
        subjectOrAuthority: string;
        allowedUses: string;
        capturedAt: string;
        sourceDescription: string;
        expiresAt: string;
        attested: true;
    }) => void;
    /**
     * Captured candidate preview; it is never a local reference.
     */
    hostedCandidate?: {
        id: string;
        name: string;
        src: string;
    };
    /**
     * Accept and lock the provider identity after audition.
     */
    onHostedAccept?: (id: string) => void;
    /**
     * Host lifecycle or unresolved-operation message.
     */
    hostedStatus?: string;
    /**
     * A refused creation or clone and the fixes it offers (such as Set budget… for an unbudgeted story), drawn with Report a Problem… in place of `hostedStatus`. The host chooses them from the engine's fields.
     */
    hostedRefusal?: {
        offer: import("./lib/types.js").Refusal;
        onFix?: (fix: import("./lib/types.js").RefusalFix) => void;
        onReport?: () => void;
    } | null;
    /**
     * An unresolved operation blocks further creation.
     */
    hostedBlocked?: boolean;
    /**
     * Host confirmed durable acceptance.
     */
    hostedAccepted?: boolean;
    /**
     * The latest generated clip, shared across tabs. Ignored for playback when `takes` is given: the takes column plays them.
     */
    result?: {
        /**
         * Audio URL of the generated clip.
         */
        src: string;
        /**
         * True while the host is synthesizing.
         */
        generating?: boolean;
    } | null;
    /**
     * The engine's preset speakers, for the Preset tab (D86).
     */
    speakers?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * Why the Preset tab has no speakers, in the host's words.
     */
    speakersReason?: string;
    /**
     * Language codes each tab offers, as the engine lists them (D88). A tab with none shows no picker.
     */
    languages?: {
        design?: readonly string[];
        clone?: readonly string[];
        preset?: readonly string[];
    };
    /**
     * The clone models the host can run, best first (D88).
     */
    cloneModels?: readonly {
        id: string;
        label: string;
    }[];
    /**
     * Called with the mode and its spec when a panel generates.
     */
    ongenerate?: (kind: "design" | "clone" | "preset" | "dialogue", spec: any) => void;
    /**
     * Which tabs to offer, in this order. Defaults to all three. A host that cannot serve a mode leaves it out rather than offering a tab that only refuses.
     */
    modes?: readonly ("Design" | "Clone" | "Preset" | "Dialogue")[];
    /**
     * Every audition the host kept, newest first. Given, the studio shows them beside the form (D79).
     */
    takes?: readonly {
        /**
         * The engine's generation id. Passed back to `onChooseTake`.
         */
        id: string;
        /**
         * The take's name, e.g. "Take 2".
         */
        label: string;
        /**
         * When it was generated, as an ISO 8601 timestamp.
         */
        createdAt: string;
        /**
         * What made it, in words: the description, or what the reference clip says.
         */
        voiceName: string;
        /**
         * Playable audio. Without it the take's player is disabled.
         */
        src?: string;
        /**
         * The engine's message for a take that failed, verbatim.
         */
        error?: string;
        /**
         * The words the take speaks. In lock mode a take of more than one sentence is warned about before it is locked (D90).
         */
        text?: string;
    }[];
    /**
     * A generation is in flight. Disables Generate. Consumer-set, never inferred.
     */
    generating?: boolean;
    /**
     * Keep the voice under this name. `lock` is the storyteller's choice on the Design tab: true locks the voice to the chosen take, false keeps the take as a sample and the voice stays designed. Always false for a clone. Reports intent: the host saves, re-reads and says how it went.
     */
    onSave?: (save: {
        kind: "design" | "clone" | "preset";
        name: string;
        lock: boolean;
    }) => void;
    /**
     * Why the voice cannot be kept right now, in the host's words. Disables Save and is shown under it. Blank means none.
     */
    saveReason?: string;
    /**
     * A save is in flight.
     */
    saving?: boolean;
    /**
     * The take the voice will be kept from. That row shows "Chosen".
     */
    chosenTakeId?: string;
    /**
     * Reports "Use this take". Without it takes cannot be chosen.
     */
    onChooseTake?: (id: string) => void;
    /**
     * Asks for a failed take again (D85).
     */
    onRetryTake?: (id: string) => void;
    /**
     * How far the take in flight has got, in the host's words (D87).
     */
    progress?: string;
    /**
     * One line under "Keep this voice" saying what Save keeps, in the host's words.
     */
    saveHint?: string;
    /**
     * Opens the studio on this designed voice to lock it to a take (D90): the Design tab alone, its description read-only, and one Lock button in place of the name and the keep choice. `saveReason` and `saving` apply to the lock.
     */
    lockVoice?: {
        /**
         * The voice's name, as the storyteller knows it.
         */
        name: string;
        /**
         * The voice's description, read from the engine. Takes are generated from it and it is not edited here.
         */
        description: string;
        /**
         * Whether the voice is already locked to a take. Then the button reads "Change the take…".
         */
        locked: boolean;
    };
    /**
     * Starting values, such as a character's voice brief: the name a voice is kept under, the description on the Design tab and the hosted form, and the line the Design tab speaks. Read once on mount; key the studio to start it again.
     */
    seed?: {
        name?: string;
        description?: string;
        text?: string;
    };
    /**
     * Lock mode: lock the voice to this take, the chosen one, else the newest that plays. Reports intent: the host locks, re-reads and says how it went. For a voice already `locked` it is a change of take, which the host confirms before it makes it.
     */
    onLock?: (takeId: string) => void;
};

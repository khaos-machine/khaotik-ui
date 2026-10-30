export default TakeList;
type TakeList = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const TakeList: import("svelte").Component<{
    /**
     * The line's takes, in the order the engine returned them.
     */
    takes?: readonly {
        /**
         * The engine's take id. Passed back to `onChoose` / `onDelete` / `onDownload` unchanged.
         */
        id: string;
        /**
         * The take's name, e.g. "Take 2". Also names the row's controls for assistive tech.
         */
        label: string;
        /**
         * When the take was recorded, as an ISO 8601 timestamp. Rendered in the reader's locale; a value that does not parse is shown as given.
         */
        createdAt: string;
        /**
         * The voice the engine resolved from the character's casting.
         */
        voiceName: string;
        /**
         * Playable audio — an http(s) URL or an object URL. Without it the row's player is disabled.
         */
        src?: string;
        /**
         * The engine's render state for this take: `stale` once the line it reads has changed since (a RenderMark). Absent means current.
         */
        state?: "stale";
        /**
         * The take's waveform peaks as khaosd serves them. Given, its player draws them behind the scrubber.
         */
        peaks?: {
            version: number;
            channels: number;
            sample_rate: number;
            samples_per_pixel: number;
            bits: number;
            length: number;
            data: number[];
        } | null;
        /**
         * The engine's message for a failed read of this take's peaks, **verbatim**. The take stays whole: its player plays, the message stands where the waveform would be, and the row offers no Try again. An `error` outranks it.
         */
        peaksError?: string;
        /**
         * The engine's message for this take, **verbatim** — e.g. a `STORY_DATA_CONFLICT` from reading its audio. Replaces the row's player. Blank or whitespace-only means no error; an `Error` renders by its `message`.
         */
        error?: string;
    }[];
    /**
     * The chosen take's `id`. That row, and only that row, shows a "Chosen" badge and no "Use this take". Absent means none is chosen — no row is promoted.
     */
    chosenId?: string;
    /**
     * A generation is in flight. Generate is disabled and the list says so. Consumer-set, never inferred. A `disabledReason` outranks it: the status and Generate's label then follow the reason.
     */
    generating?: boolean;
    /**
     * Why a take cannot be generated — the engine's message, verbatim (an uncast speaker, or a package that cannot hold takes). Generate is disabled and the reason is shown and announced. Blank or whitespace-only means none.
     */
    disabledReason?: string;
    /**
     * Asks for a new take, with the direction typed for it (`''` when none, or when there is no direction field). Without it Generate is disabled, not inert.
     */
    onGenerate?: (direction: string) => void;
    /**
     * Given, a direction field sits before Generate under this label ("Direction"), and its text goes with the request. The host says in each take's `voiceName` how the engine applied it. D80.
     */
    directionLabel?: string;
    /**
     * Generate's label. Defaults to "Generate take"; a scene's reads say "Read scene".
     */
    generateLabel?: string;
    /**
     * Reports "Use this take" with the take's `id`. Without it no row offers the action (D80): a dimmed button on every row, with nowhere to say why, reads as broken.
     */
    onChoose?: (id: string) => void;
    /**
     * Reports a delete request with the take's `id`. **It confirms nothing** — confirming is the app's. Without it no Delete renders: a destructive verb hides rather than dims.
     */
    onDelete?: (id: string) => void;
    /**
     * How far the generation in flight has got, in the host's words ("Sentence 2 of 3"). Shown in place of "Generating a take…" while `generating` (D87).
     */
    progress?: string;
    /**
     * Reports a download request with the take's `id` (#273). The host owns the save dialog, the file write and the outcome. Without it no Download renders. Never offered on a row with an `error`: there is no audio to save.
     */
    onDownload?: (id: string) => void;
    /**
     * The `id` of the take whose download the host has started and is waiting on. That row's Download renders `aria-busy`, a spinner and "Downloading…", and is disabled until it clears. **Consumer-driven, never inferred**, the same contract as `SpeakerPicker.pendingId`.
     */
    downloadingId?: string;
    /**
     * Asks to show the take in a timeline, receiving its `id`. Without it no row offers "Open in timeline" (D80).
     */
    onOpen?: (id: string) => void;
    /**
     * Asks for a failed take again, receiving its `id` (D85). Offered only on a row with an `error`. Without it no Try again renders.
     */
    onRetry?: (id: string) => void;
    /**
     * Inspector density: each take's name, marks and time on one line above its player, the small primary Generate, and every part wrapping rather than scrolling sideways at a narrow pane width.
     */
    compact?: boolean;
    /**
     * Defaults to true. False drops the Generate bar, for a host whose own form generates (VoiceStudio, D79): two Generate buttons for one action is one too many. Nothing else changes.
     */
    toolbar?: boolean;
}, {}, "">;
type Props = {
    /**
     * The line's takes, in the order the engine returned them.
     */
    takes?: readonly {
        /**
         * The engine's take id. Passed back to `onChoose` / `onDelete` / `onDownload` unchanged.
         */
        id: string;
        /**
         * The take's name, e.g. "Take 2". Also names the row's controls for assistive tech.
         */
        label: string;
        /**
         * When the take was recorded, as an ISO 8601 timestamp. Rendered in the reader's locale; a value that does not parse is shown as given.
         */
        createdAt: string;
        /**
         * The voice the engine resolved from the character's casting.
         */
        voiceName: string;
        /**
         * Playable audio — an http(s) URL or an object URL. Without it the row's player is disabled.
         */
        src?: string;
        /**
         * The engine's render state for this take: `stale` once the line it reads has changed since (a RenderMark). Absent means current.
         */
        state?: "stale";
        /**
         * The take's waveform peaks as khaosd serves them. Given, its player draws them behind the scrubber.
         */
        peaks?: {
            version: number;
            channels: number;
            sample_rate: number;
            samples_per_pixel: number;
            bits: number;
            length: number;
            data: number[];
        } | null;
        /**
         * The engine's message for a failed read of this take's peaks, **verbatim**. The take stays whole: its player plays, the message stands where the waveform would be, and the row offers no Try again. An `error` outranks it.
         */
        peaksError?: string;
        /**
         * The engine's message for this take, **verbatim** — e.g. a `STORY_DATA_CONFLICT` from reading its audio. Replaces the row's player. Blank or whitespace-only means no error; an `Error` renders by its `message`.
         */
        error?: string;
    }[];
    /**
     * The chosen take's `id`. That row, and only that row, shows a "Chosen" badge and no "Use this take". Absent means none is chosen — no row is promoted.
     */
    chosenId?: string;
    /**
     * A generation is in flight. Generate is disabled and the list says so. Consumer-set, never inferred. A `disabledReason` outranks it: the status and Generate's label then follow the reason.
     */
    generating?: boolean;
    /**
     * Why a take cannot be generated — the engine's message, verbatim (an uncast speaker, or a package that cannot hold takes). Generate is disabled and the reason is shown and announced. Blank or whitespace-only means none.
     */
    disabledReason?: string;
    /**
     * Asks for a new take, with the direction typed for it (`''` when none, or when there is no direction field). Without it Generate is disabled, not inert.
     */
    onGenerate?: (direction: string) => void;
    /**
     * Given, a direction field sits before Generate under this label ("Direction"), and its text goes with the request. The host says in each take's `voiceName` how the engine applied it. D80.
     */
    directionLabel?: string;
    /**
     * Generate's label. Defaults to "Generate take"; a scene's reads say "Read scene".
     */
    generateLabel?: string;
    /**
     * Reports "Use this take" with the take's `id`. Without it no row offers the action (D80): a dimmed button on every row, with nowhere to say why, reads as broken.
     */
    onChoose?: (id: string) => void;
    /**
     * Reports a delete request with the take's `id`. **It confirms nothing** — confirming is the app's. Without it no Delete renders: a destructive verb hides rather than dims.
     */
    onDelete?: (id: string) => void;
    /**
     * How far the generation in flight has got, in the host's words ("Sentence 2 of 3"). Shown in place of "Generating a take…" while `generating` (D87).
     */
    progress?: string;
    /**
     * Reports a download request with the take's `id` (#273). The host owns the save dialog, the file write and the outcome. Without it no Download renders. Never offered on a row with an `error`: there is no audio to save.
     */
    onDownload?: (id: string) => void;
    /**
     * The `id` of the take whose download the host has started and is waiting on. That row's Download renders `aria-busy`, a spinner and "Downloading…", and is disabled until it clears. **Consumer-driven, never inferred**, the same contract as `SpeakerPicker.pendingId`.
     */
    downloadingId?: string;
    /**
     * Asks to show the take in a timeline, receiving its `id`. Without it no row offers "Open in timeline" (D80).
     */
    onOpen?: (id: string) => void;
    /**
     * Asks for a failed take again, receiving its `id` (D85). Offered only on a row with an `error`. Without it no Try again renders.
     */
    onRetry?: (id: string) => void;
    /**
     * Inspector density: each take's name, marks and time on one line above its player, the small primary Generate, and every part wrapping rather than scrolling sideways at a narrow pane width.
     */
    compact?: boolean;
    /**
     * Defaults to true. False drops the Generate bar, for a host whose own form generates (VoiceStudio, D79): two Generate buttons for one action is one too many. Nothing else changes.
     */
    toolbar?: boolean;
};

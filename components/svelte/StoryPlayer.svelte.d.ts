export default StoryPlayer;
type StoryPlayer = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StoryPlayer: import("svelte").Component<{
    /**
     * Optional authored picture clips in composition seconds; null omits the lane. Host owns persistence, reference choice and timing constraints.
     */
    pictures?: readonly import("./lib/picture-range.js").PictureClip[] | null;
    /**
     * Engine-resolved picture currently under the playhead, independent of selection.
     */
    activePictureId?: string;
    /**
     * Selected authored picture clip.
     */
    selectedPictureId?: string;
    /**
     * Select a picture; host chooses whether to pause/seek.
     */
    onSelectPicture?: (id: string, source?: "context") => void;
    /**
     * Commit one move/trim; no callback on cancelled gestures. Shift bypasses pointer 0.1s snapping; keyboard arrows edit by 0.1s, Shift+arrows by 1s.
     */
    onChangePicture?: (id: string, range: {
        start: number;
        duration: number;
    }) => void;
    /**
     * Explicit picture-track editing intent.
     */
    onPictureAction?: (id: string, action: "add" | "insertBefore" | "insertAfter" | "split" | "delete") => void;
    /**
     * Host tools for intentional timeline selection.
     */
    tools?: import("svelte").Snippet;
    /**
     * Show the scene heading in the transport.
     */
    showContext?: boolean;
    /**
     * Intentionally selected reading scene id.
     */
    selectedReadingId?: string;
    /**
     * Reading selection, separate from seeking.
     */
    onSelectReading?: (sceneId: string) => void;
    /**
     * Render the built-in text panel. False when the host provides its own inspector.
     */
    showInspector?: boolean;
    /**
     * Saved read waveforms keyed by scene id. Each recording starts at zero locally; its scene supplies its position on the story timeline. Pending and failed media keep a seekable read block.
     */
    waveforms?: Record<string, {
        state: "loading" | "ready" | "failed";
        peaks?: {
            version: number;
            channels: number;
            sample_rate: number;
            samples_per_pixel: number;
            bits: number;
            length: number;
            data: number[];
        };
        message?: string;
    }>;
    /**
     * Emphasize the recording track with neutral event bars and a brand playhead. Default false preserves the composition view.
     */
    audioEmphasis?: boolean;
    /**
     * khaosd's enriched composition segments, verbatim, on the **0.11.0 wire**: `{ kind, sceneId?, sectionId?, level?, label, startMs, durationMs, events: [{ elementType, elementId, durationMs?, text?, … }] }`. Times are integer MILLISECONDS on the way in and seconds on the way out. `durationMs` and `startMs` are asserted for PRESENCE — a row missing either is reported to the operator, never sized zero.
     */
    segments?: readonly {
        /**
         * `section` rows are STRUCTURE — an act or a sequence — and are partitioned out of the track into the band above the ruler. They are not scenes and they are not lanes.
         */
        kind?: "scene" | "section";
        sceneId?: string;
        /**
         * Present on `kind: 'section'` rows; the id `onSelectSection` reports.
         */
        sectionId?: string;
        /**
         * Section depth — 1 is an act, deeper is a sequence. One band row per level.
         */
        level?: number;
        label?: string;
        /**
         * Integer milliseconds. **Required.** Position has no second source since the cursor accumulator was deleted, so an absent `startMs` is reported rather than guessed.
         */
        startMs?: number;
        /**
         * Integer milliseconds, or `null` for *not measured*. **Required by RFC 0069 §3.1.1** — an absent key is reported on the unreadable channel and never inferred from the plausibility of a value. `0` is a real measurement below the model's resolution and is NOT the same fact as `null`.
         */
        durationMs?: number | null;
        events?: readonly {
            elementType: string;
            elementId?: string;
            /**
             * Integer milliseconds into its segment. A scene read's lines carry it (KSPD RFC 0085 amendment 3), so they sit where the joiner placed them, pauses kept. Without it an event follows the one before.
             */
            startMs?: number;
            /**
             * Integer milliseconds. Absent on every event of every composition the daemon serves today, which is why its absence is NOT reported as unreadable — it would fire the loud channel on healthy data. An event with no `durationMs` keeps its place in the order and draws as an unmeasured marker.
             */
            durationMs?: number;
            text?: string;
            characterName?: string;
            parenthetical?: string;
            audioUrl?: string;
            hasAudio?: boolean;
        }[];
    }[];
    /**
     * Playhead position in seconds. Controlled — the host owns the clock; this component never advances it.
     */
    currentTime?: number;
    /**
     * Whether the host is playing. Drives the transport icon only; playback itself is the host's.
     */
    playing?: boolean;
    /**
     * Pixels per second, and the timeline scrolls horizontally. NOT fit-to-width: fitting a feature-length composition to a viewport puts most beats under one pixel. At the default 10, a one-second beat is 10px and still exactly proportional.
     */
    scale?: number;
    /**
     * Explicitly selected element. Takes precedence over the playhead for the content panel, so reading a beat does not fight the transport.
     */
    selectedElementId?: string;
    /**
     * Explicitly selected SECTION — an act or a sequence on the band. Its own axis, deliberately: reusing `selectedElementId` for it would merge the segment axis and the element axis that D66 keeps apart. Takes precedence over both the playhead and an element selection, because it is the more explicit act.
     */
    selectedSectionId?: string;
    /**
     * Which typed lanes to draw, in order (#22) — `scenes`, `action`, `dialogue`, `transition`, `audio`. The ruler is always drawn. **Sections are not among them** — they are structure over the ruler, and they never reach this list. The lanes are **derived from `segments`**, not supplied: every one is already recoverable from the composition khaosd returns, so a lane prop carrying its own segment lists would be a second source for the same truth. This chooses and orders; it does not carry data. A lane with no content is omitted, and an element kind the engine adds later appears on its own lane rather than vanishing. **Values must be distinct** — this list is keyed on the lane name, so a duplicate throws `each_key_duplicate` and the timeline does not render. The same rule a `<select>` has always had. The one wrinkle its siblings do not have: empty lanes are dropped (`lib/timeline.js`), so a repeated lane only collides when it actually has content — which makes a duplicate render fine on one composition and abort on the next.
     */
    lanes?: readonly ("scenes" | "action" | "dialogue" | "transition" | "audio")[];
    /**
     * Seconds. Fired by clicking the ruler or a beat.
     */
    onSeek?: (seconds: number) => void;
    /**
     * The clicked element id.
     */
    onSelect?: (elementId: string) => void;
    /**
     * The clicked section id. Fired by the band, and by nothing else — a band click never reports on `onSelect` or moves the playhead, because selecting an act is not seeking to one.
     */
    onSelectSection?: (sectionId: string) => void;
    /**
     * Play/pause pressed.
     */
    onTogglePlay?: () => void;
    /**
     * Stop pressed.
     */
    onStop?: () => void;
    /**
     * Previous scene pressed.
     */
    onPreviousScene?: () => void;
    /**
     * Next scene pressed.
     */
    onNextScene?: () => void;
    /**
     * Previous beat pressed.
     */
    onPreviousBeat?: () => void;
    /**
     * Next beat pressed.
     */
    onNextBeat?: () => void;
    /**
     * Pointer scrubbing begins; host may pause its audio clock.
     */
    onScrubStart?: () => void;
    /**
     * Pointer gesture ends or is cancelled; host may resume playback.
     */
    onScrubEnd?: () => void;
    /**
     * New pixels-per-second from the zoom control.
     */
    onScaleChange?: (scale: number) => void;
    /**
     * The zoom control's lowest pixels-per-second. Defaults to 2.
     */
    minScale?: number;
    /**
     * The zoom control's highest pixels-per-second. Defaults to 50; a scene read goes to 400.
     */
    maxScale?: number;
    /**
     * The recording behind the timeline's clock, as khaosd's audiowaveform v2 peaks — one scene read. Given, each measured block draws its stretch of the waveform inside its button, after its name; the button's name, focus and keys are unchanged. The composition Player passes none.
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
}, {}, "">;
type Props = {
    /**
     * Optional authored picture clips in composition seconds; null omits the lane. Host owns persistence, reference choice and timing constraints.
     */
    pictures?: readonly import("./lib/picture-range.js").PictureClip[] | null;
    /**
     * Engine-resolved picture currently under the playhead, independent of selection.
     */
    activePictureId?: string;
    /**
     * Selected authored picture clip.
     */
    selectedPictureId?: string;
    /**
     * Select a picture; host chooses whether to pause/seek.
     */
    onSelectPicture?: (id: string, source?: "context") => void;
    /**
     * Commit one move/trim; no callback on cancelled gestures. Shift bypasses pointer 0.1s snapping; keyboard arrows edit by 0.1s, Shift+arrows by 1s.
     */
    onChangePicture?: (id: string, range: {
        start: number;
        duration: number;
    }) => void;
    /**
     * Explicit picture-track editing intent.
     */
    onPictureAction?: (id: string, action: "add" | "insertBefore" | "insertAfter" | "split" | "delete") => void;
    /**
     * Host tools for intentional timeline selection.
     */
    tools?: import("svelte").Snippet;
    /**
     * Show the scene heading in the transport.
     */
    showContext?: boolean;
    /**
     * Intentionally selected reading scene id.
     */
    selectedReadingId?: string;
    /**
     * Reading selection, separate from seeking.
     */
    onSelectReading?: (sceneId: string) => void;
    /**
     * Render the built-in text panel. False when the host provides its own inspector.
     */
    showInspector?: boolean;
    /**
     * Saved read waveforms keyed by scene id. Each recording starts at zero locally; its scene supplies its position on the story timeline. Pending and failed media keep a seekable read block.
     */
    waveforms?: Record<string, {
        state: "loading" | "ready" | "failed";
        peaks?: {
            version: number;
            channels: number;
            sample_rate: number;
            samples_per_pixel: number;
            bits: number;
            length: number;
            data: number[];
        };
        message?: string;
    }>;
    /**
     * Emphasize the recording track with neutral event bars and a brand playhead. Default false preserves the composition view.
     */
    audioEmphasis?: boolean;
    /**
     * khaosd's enriched composition segments, verbatim, on the **0.11.0 wire**: `{ kind, sceneId?, sectionId?, level?, label, startMs, durationMs, events: [{ elementType, elementId, durationMs?, text?, … }] }`. Times are integer MILLISECONDS on the way in and seconds on the way out. `durationMs` and `startMs` are asserted for PRESENCE — a row missing either is reported to the operator, never sized zero.
     */
    segments?: readonly {
        /**
         * `section` rows are STRUCTURE — an act or a sequence — and are partitioned out of the track into the band above the ruler. They are not scenes and they are not lanes.
         */
        kind?: "scene" | "section";
        sceneId?: string;
        /**
         * Present on `kind: 'section'` rows; the id `onSelectSection` reports.
         */
        sectionId?: string;
        /**
         * Section depth — 1 is an act, deeper is a sequence. One band row per level.
         */
        level?: number;
        label?: string;
        /**
         * Integer milliseconds. **Required.** Position has no second source since the cursor accumulator was deleted, so an absent `startMs` is reported rather than guessed.
         */
        startMs?: number;
        /**
         * Integer milliseconds, or `null` for *not measured*. **Required by RFC 0069 §3.1.1** — an absent key is reported on the unreadable channel and never inferred from the plausibility of a value. `0` is a real measurement below the model's resolution and is NOT the same fact as `null`.
         */
        durationMs?: number | null;
        events?: readonly {
            elementType: string;
            elementId?: string;
            /**
             * Integer milliseconds into its segment. A scene read's lines carry it (KSPD RFC 0085 amendment 3), so they sit where the joiner placed them, pauses kept. Without it an event follows the one before.
             */
            startMs?: number;
            /**
             * Integer milliseconds. Absent on every event of every composition the daemon serves today, which is why its absence is NOT reported as unreadable — it would fire the loud channel on healthy data. An event with no `durationMs` keeps its place in the order and draws as an unmeasured marker.
             */
            durationMs?: number;
            text?: string;
            characterName?: string;
            parenthetical?: string;
            audioUrl?: string;
            hasAudio?: boolean;
        }[];
    }[];
    /**
     * Playhead position in seconds. Controlled — the host owns the clock; this component never advances it.
     */
    currentTime?: number;
    /**
     * Whether the host is playing. Drives the transport icon only; playback itself is the host's.
     */
    playing?: boolean;
    /**
     * Pixels per second, and the timeline scrolls horizontally. NOT fit-to-width: fitting a feature-length composition to a viewport puts most beats under one pixel. At the default 10, a one-second beat is 10px and still exactly proportional.
     */
    scale?: number;
    /**
     * Explicitly selected element. Takes precedence over the playhead for the content panel, so reading a beat does not fight the transport.
     */
    selectedElementId?: string;
    /**
     * Explicitly selected SECTION — an act or a sequence on the band. Its own axis, deliberately: reusing `selectedElementId` for it would merge the segment axis and the element axis that D66 keeps apart. Takes precedence over both the playhead and an element selection, because it is the more explicit act.
     */
    selectedSectionId?: string;
    /**
     * Which typed lanes to draw, in order (#22) — `scenes`, `action`, `dialogue`, `transition`, `audio`. The ruler is always drawn. **Sections are not among them** — they are structure over the ruler, and they never reach this list. The lanes are **derived from `segments`**, not supplied: every one is already recoverable from the composition khaosd returns, so a lane prop carrying its own segment lists would be a second source for the same truth. This chooses and orders; it does not carry data. A lane with no content is omitted, and an element kind the engine adds later appears on its own lane rather than vanishing. **Values must be distinct** — this list is keyed on the lane name, so a duplicate throws `each_key_duplicate` and the timeline does not render. The same rule a `<select>` has always had. The one wrinkle its siblings do not have: empty lanes are dropped (`lib/timeline.js`), so a repeated lane only collides when it actually has content — which makes a duplicate render fine on one composition and abort on the next.
     */
    lanes?: readonly ("scenes" | "action" | "dialogue" | "transition" | "audio")[];
    /**
     * Seconds. Fired by clicking the ruler or a beat.
     */
    onSeek?: (seconds: number) => void;
    /**
     * The clicked element id.
     */
    onSelect?: (elementId: string) => void;
    /**
     * The clicked section id. Fired by the band, and by nothing else — a band click never reports on `onSelect` or moves the playhead, because selecting an act is not seeking to one.
     */
    onSelectSection?: (sectionId: string) => void;
    /**
     * Play/pause pressed.
     */
    onTogglePlay?: () => void;
    /**
     * Stop pressed.
     */
    onStop?: () => void;
    /**
     * Previous scene pressed.
     */
    onPreviousScene?: () => void;
    /**
     * Next scene pressed.
     */
    onNextScene?: () => void;
    /**
     * Previous beat pressed.
     */
    onPreviousBeat?: () => void;
    /**
     * Next beat pressed.
     */
    onNextBeat?: () => void;
    /**
     * Pointer scrubbing begins; host may pause its audio clock.
     */
    onScrubStart?: () => void;
    /**
     * Pointer gesture ends or is cancelled; host may resume playback.
     */
    onScrubEnd?: () => void;
    /**
     * New pixels-per-second from the zoom control.
     */
    onScaleChange?: (scale: number) => void;
    /**
     * The zoom control's lowest pixels-per-second. Defaults to 2.
     */
    minScale?: number;
    /**
     * The zoom control's highest pixels-per-second. Defaults to 50; a scene read goes to 400.
     */
    maxScale?: number;
    /**
     * The recording behind the timeline's clock, as khaosd's audiowaveform v2 peaks — one scene read. Given, each measured block draws its stretch of the waveform inside its button, after its name; the button's name, focus and keys are unchanged. The composition Player passes none.
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
};

export default ReadTimeline;
type ReadTimeline = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ReadTimeline: import("svelte").Component<{
    /**
     * Where the read is. A loaded read with no measured length is still opening.
     */
    state?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * The read as StoryPlayer segments.
     */
    segments?: readonly any[];
    /**
     * The read's waveform peaks, in khaosd's shape; null when not fetched.
     */
    peaks?: any;
    /**
     * khaosd's words when the peaks failed. The read still plays; this shows under the timeline.
     */
    peaksError?: string;
    /**
     * The playhead, in seconds.
     */
    currentTime?: number;
    /**
     * Whether the read is playing.
     */
    playing?: boolean;
    /**
     * Pixels per second.
     */
    scale?: number;
    /**
     * The narrowest zoom.
     */
    minScale?: number;
    /**
     * The widest zoom.
     */
    maxScale?: number;
    /**
     * The followed line's element id.
     */
    selectedElementId?: string;
    /**
     * Reports a seek.
     */
    onSeek?: (seconds: number) => void;
    /**
     * Reports a picked line.
     */
    onSelect?: (eventId: string) => void;
    /**
     * Reports play or pause.
     */
    onTogglePlay?: () => void;
    /**
     * Reports a zoom.
     */
    onScaleChange?: (scale: number) => void;
}, {}, "">;
type Props = {
    /**
     * Where the read is. A loaded read with no measured length is still opening.
     */
    state?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * The read as StoryPlayer segments.
     */
    segments?: readonly any[];
    /**
     * The read's waveform peaks, in khaosd's shape; null when not fetched.
     */
    peaks?: any;
    /**
     * khaosd's words when the peaks failed. The read still plays; this shows under the timeline.
     */
    peaksError?: string;
    /**
     * The playhead, in seconds.
     */
    currentTime?: number;
    /**
     * Whether the read is playing.
     */
    playing?: boolean;
    /**
     * Pixels per second.
     */
    scale?: number;
    /**
     * The narrowest zoom.
     */
    minScale?: number;
    /**
     * The widest zoom.
     */
    maxScale?: number;
    /**
     * The followed line's element id.
     */
    selectedElementId?: string;
    /**
     * Reports a seek.
     */
    onSeek?: (seconds: number) => void;
    /**
     * Reports a picked line.
     */
    onSelect?: (eventId: string) => void;
    /**
     * Reports play or pause.
     */
    onTogglePlay?: () => void;
    /**
     * Reports a zoom.
     */
    onScaleChange?: (scale: number) => void;
};

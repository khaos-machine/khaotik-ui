export default AudioPlayback;
type AudioPlayback = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const AudioPlayback: import("svelte").Component<{
    /**
     * Audio source URL — an http(s) URL or a blob/object URL from `URL.createObjectURL`.
     */
    src?: string;
    /**
     * The clip's name, used for the accessible transport names. Defaults to "Audio playback".
     */
    label?: string;
    /**
     * The clip's waveform peaks, audiowaveform JSON v2 as khaosd serves them. Given, a Waveform draws behind the scrubber; the scrubber stays the control. Absent, nothing changes.
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
     * khaosd's message for a failed peaks read, **verbatim**. The clip still plays: the transport is untouched, and the message stands where the waveform would be, as a status. No control is added. Blank or whitespace-only means none.
     */
    peaksError?: string;
}, {}, "">;
type Props = {
    /**
     * Audio source URL — an http(s) URL or a blob/object URL from `URL.createObjectURL`.
     */
    src?: string;
    /**
     * The clip's name, used for the accessible transport names. Defaults to "Audio playback".
     */
    label?: string;
    /**
     * The clip's waveform peaks, audiowaveform JSON v2 as khaosd serves them. Given, a Waveform draws behind the scrubber; the scrubber stays the control. Absent, nothing changes.
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
     * khaosd's message for a failed peaks read, **verbatim**. The clip still plays: the transport is untouched, and the message stands where the waveform would be, as a status. No control is added. Blank or whitespace-only means none.
     */
    peaksError?: string;
};

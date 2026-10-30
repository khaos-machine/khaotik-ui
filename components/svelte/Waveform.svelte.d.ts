export default Waveform;
type Waveform = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Waveform: import("svelte").Component<{
    /**
     * The recording's peaks, audiowaveform JSON v2 as khaosd serves them. Absent or malformed peaks render "Waveform unreadable".
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
     * Window start, in seconds into the recording. Defaults to 0.
     */
    from?: number;
    /**
     * Window end, in seconds into the recording. Defaults to 0, which draws nothing.
     */
    to?: number;
}, {}, "">;
type Props = {
    /**
     * The recording's peaks, audiowaveform JSON v2 as khaosd serves them. Absent or malformed peaks render "Waveform unreadable".
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
     * Window start, in seconds into the recording. Defaults to 0.
     */
    from?: number;
    /**
     * Window end, in seconds into the recording. Defaults to 0, which draws nothing.
     */
    to?: number;
};

export default AudioTable;
type AudioTable = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const AudioTable: import("svelte").Component<{
    /**
     * The project's recordings, as khaosd lists them.
     */
    rows?: readonly import("./lib/recordings.js").Recording[];
    /**
     * Each row's waveform peaks, or why they could not be read, by recording id.
     */
    peaks?: Readonly<Record<string, {
        kind: "loaded";
        peaks: {
            version: number;
            channels: number;
            sample_rate: number;
            samples_per_pixel: number;
            bits: number;
            length: number;
            data: number[];
        };
    } | {
        kind: "failed";
        message: string;
    }>>;
    /**
     * Asked for a row's peaks once, as its cell renders.
     */
    onpeaks?: (id: string) => void;
    /**
     * The selected row's id.
     */
    selected?: string;
    /**
     * Narrows the rows by text.
     */
    filter?: string;
    /**
     * Reports a selected row.
     */
    onselect?: (id: string) => void;
}, {}, "">;
type Props = {
    /**
     * The project's recordings, as khaosd lists them.
     */
    rows?: readonly import("./lib/recordings.js").Recording[];
    /**
     * Each row's waveform peaks, or why they could not be read, by recording id.
     */
    peaks?: Readonly<Record<string, {
        kind: "loaded";
        peaks: {
            version: number;
            channels: number;
            sample_rate: number;
            samples_per_pixel: number;
            bits: number;
            length: number;
            data: number[];
        };
    } | {
        kind: "failed";
        message: string;
    }>>;
    /**
     * Asked for a row's peaks once, as its cell renders.
     */
    onpeaks?: (id: string) => void;
    /**
     * The selected row's id.
     */
    selected?: string;
    /**
     * Narrows the rows by text.
     */
    filter?: string;
    /**
     * Reports a selected row.
     */
    onselect?: (id: string) => void;
};

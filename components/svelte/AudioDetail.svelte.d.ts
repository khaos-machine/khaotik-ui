export default AudioDetail;
type AudioDetail = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const AudioDetail: import("svelte").Component<{
    /**
     * The selected recording; null when none is.
     */
    recording?: import("./lib/recordings.js").Recording | null;
    /**
     * A line take's audio, as the host resolved it.
     */
    playback?: {
        kind: "loading";
    } | {
        kind: "ready";
        url: string;
    } | {
        kind: "failed";
        message: string;
    };
    /**
     * A line take's waveform peaks.
     */
    peaks?: {
        kind: "loading";
    } | {
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
    };
    /**
     * The host's read timeline, for a scene read.
     */
    read?: import("svelte").Snippet | undefined;
    /**
     * Reports the recording's scene to show.
     */
    onRevealScene?: (sceneId: string) => void;
    /**
     * Reports the take's speaker to show.
     */
    onRevealCharacter?: (characterId: string) => void;
    /**
     * Reports a voice to open.
     */
    onOpenVoice?: (voiceProfileId: string) => void;
}, {}, "">;
type Props = {
    /**
     * The selected recording; null when none is.
     */
    recording?: import("./lib/recordings.js").Recording | null;
    /**
     * A line take's audio, as the host resolved it.
     */
    playback?: {
        kind: "loading";
    } | {
        kind: "ready";
        url: string;
    } | {
        kind: "failed";
        message: string;
    };
    /**
     * A line take's waveform peaks.
     */
    peaks?: {
        kind: "loading";
    } | {
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
    };
    /**
     * The host's read timeline, for a scene read.
     */
    read?: import("svelte").Snippet | undefined;
    /**
     * Reports the recording's scene to show.
     */
    onRevealScene?: (sceneId: string) => void;
    /**
     * Reports the take's speaker to show.
     */
    onRevealCharacter?: (characterId: string) => void;
    /**
     * Reports a voice to open.
     */
    onOpenVoice?: (voiceProfileId: string) => void;
};

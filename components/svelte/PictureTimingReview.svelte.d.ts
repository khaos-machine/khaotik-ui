export default PictureTimingReview;
type PictureTimingReview = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PictureTimingReview: import("svelte").Component<{
    /**
     * Revision-bound engine repair preview.
     */
    repair?: {
        kind?: string;
        unresolvedCount?: number;
        revision: string;
        sceneId: string;
        canApply: boolean;
        reason: string;
        changes: readonly {
            shotId: string;
            title: string;
            before: {
                startMs: number;
                durationMs: number;
            };
            after: {
                startMs: number;
                durationMs: number;
            } | null;
        }[];
    } | null;
    /**
     * Scene being repaired.
     */
    sceneLabel?: string;
    /**
     * An edit is pending.
     */
    busy?: boolean;
    /**
     * A shot has unsaved changes.
     */
    dirty?: boolean;
    /**
     * Full command failure.
     */
    error?: string;
    /**
     * Apply exactly this reviewed timing repair.
     */
    onapply?: (revision: string) => Promise<void>;
    /**
     * Pause playback before review.
     */
    onopen?: () => void;
}, {}, "">;
type Props = {
    /**
     * Revision-bound engine repair preview.
     */
    repair?: {
        kind?: string;
        unresolvedCount?: number;
        revision: string;
        sceneId: string;
        canApply: boolean;
        reason: string;
        changes: readonly {
            shotId: string;
            title: string;
            before: {
                startMs: number;
                durationMs: number;
            };
            after: {
                startMs: number;
                durationMs: number;
            } | null;
        }[];
    } | null;
    /**
     * Scene being repaired.
     */
    sceneLabel?: string;
    /**
     * An edit is pending.
     */
    busy?: boolean;
    /**
     * A shot has unsaved changes.
     */
    dirty?: boolean;
    /**
     * Full command failure.
     */
    error?: string;
    /**
     * Apply exactly this reviewed timing repair.
     */
    onapply?: (revision: string) => Promise<void>;
    /**
     * Pause playback before review.
     */
    onopen?: () => void;
};

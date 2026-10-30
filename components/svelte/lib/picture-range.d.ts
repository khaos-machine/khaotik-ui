/** A controlled picture clip, in composition seconds. */
/**
 * @typedef {Object} PictureClip
 * @property {string} id Clip identity.
 * @property {string} label Human-readable shot name.
 * @property {number} start Composition start, in seconds.
 * @property {number} duration Hold duration, in seconds; at least 0.1.
 * @property {string} [imageUrl] Chosen or explicitly previewed image URL.
 * @property {number} [minStart] Earliest allowed start, in seconds.
 * @property {number} [maxEnd] Latest allowed end, in seconds.
 * @property {string} [warning] Engine-provided timing or media warning.
 * @property {boolean} [readOnly] Retained timing preview; selection is allowed, timing edits are disabled.
 * @property {boolean} [chosen] Whether the host has chosen artwork for playback.
 */
/** @typedef {'move'|'start'|'end'} PictureEdit */
/** Compute a bounded edit without mutating a caller's clip.
 * @param {PictureClip} clip
 * @param {number} delta
 * @param {PictureEdit} edit
 * @param {number} total
 * @param {boolean} [snap]
 */
export function pictureRange(clip: PictureClip, delta: number, edit: PictureEdit, total: number, snap?: boolean): {
    start: number;
    duration: number;
};
export type PictureClip = {
    /**
     * Clip identity.
     */
    id: string;
    /**
     * Human-readable shot name.
     */
    label: string;
    /**
     * Composition start, in seconds.
     */
    start: number;
    /**
     * Hold duration, in seconds; at least 0.1.
     */
    duration: number;
    /**
     * Chosen or explicitly previewed image URL.
     */
    imageUrl?: string;
    /**
     * Earliest allowed start, in seconds.
     */
    minStart?: number;
    /**
     * Latest allowed end, in seconds.
     */
    maxEnd?: number;
    /**
     * Engine-provided timing or media warning.
     */
    warning?: string;
    /**
     * Retained timing preview; selection is allowed, timing edits are disabled.
     */
    readOnly?: boolean;
    /**
     * Whether the host has chosen artwork for playback.
     */
    chosen?: boolean;
};
export type PictureEdit = "move" | "start" | "end";

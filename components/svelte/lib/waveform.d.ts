/**
 * The peaks, checked whole. Throws on anything but mono 8- or 16-bit v2 with two values per bin.
 *
 * @param {any} peaks
 */
export function assertPeaks(peaks: any): void;
/**
 * One `[min, max]` per pixel column for the window `[fromSec, toSec)`. Zoomed out, a
 * column is the min and max over every bin it covers; zoomed in, it is the bin under it.
 * A column past the last bin is `null`: the last bin is never repeated.
 *
 * @param {{version: number, channels: number, sample_rate: number, samples_per_pixel: number, bits: number, length: number, data: number[]}} peaks
 * @param {number} fromSec
 * @param {number} toSec
 * @param {number} width Whole pixel columns.
 * @returns {(Array<number> | null)[]}
 */
export function peakColumns(peaks: {
    version: number;
    channels: number;
    sample_rate: number;
    samples_per_pixel: number;
    bits: number;
    length: number;
    data: number[];
}, fromSec: number, toSec: number, width: number): (Array<number> | null)[];
export function peaksSeconds(peaks: {
    sample_rate: number;
    samples_per_pixel: number;
    length: number;
}): number;

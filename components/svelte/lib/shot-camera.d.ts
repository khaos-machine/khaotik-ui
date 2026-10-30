/**
 * The camera turned about its target: yawDegrees counter-clockwise seen from above, then
 * pitchDegrees up, its distance unchanged.
 * @param {ShotCamera} cam @param {number} yawDegrees @param {number} pitchDegrees
 * @returns {ShotCamera}
 */
export function orbit(cam: ShotCamera, yawDegrees: number, pitchDegrees: number): ShotCamera;
/**
 * The camera moved along the line to its target, its distance times factor (below 1 is closer).
 * @param {ShotCamera} cam @param {number} factor
 * @returns {ShotCamera}
 */
export function dolly(cam: ShotCamera, factor: number): ShotCamera;
export type ShotCamera = {
    position: number[];
    target: number[];
    lensMm: number;
};

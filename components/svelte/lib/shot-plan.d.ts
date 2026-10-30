/**
 * The unit vector a figure faces at facingDegrees: -y at 0, turned counter-clockwise.
 * @param {number} facingDegrees
 * @returns {Point2}
 */
export function facingVector(facingDegrees: number): Point2;
/**
 * The facing, in degrees in (-180, 180], of a figure looking along (dx, dy).
 * @param {number} dx @param {number} dy
 */
export function facingOf(dx: number, dy: number): number;
/**
 * A floor object's top-down footprint: the four corners of the rectangle around its parts in the
 * object's own frame, turned by rotationZ and stood at position.
 * ponytail: a part's X and Y tilt are ignored, as the plan draws only its turn about z; a tilted
 * part's true extent needs the kit's built footprint.
 * @param {{ parts: { size: number[], position: number[], rotationDegrees: number[] }[] }} object
 * @param {{ position: number[], rotationZ: number }} floor
 * @returns {Point2[]}
 */
export function objectFootprint(object: {
    parts: {
        size: number[];
        position: number[];
        rotationDegrees: number[];
    }[];
}, floor: {
    position: number[];
    rotationZ: number;
}): Point2[];
/**
 * A pointer's client position as a plan point. The plan's SVG fits its viewBox inside its box,
 * centred (the default xMidYMid meet), and draws +y north, so SVG y is the plan's -y.
 * @param {{ left: number, top: number, width: number, height: number }} rect The SVG's box.
 * @param {number[]} viewBox [x, y, width, height].
 * @param {number} clientX @param {number} clientY
 * @returns {Point2}
 */
export function clientToPlan(rect: {
    left: number;
    top: number;
    width: number;
    height: number;
}, viewBox: number[], clientX: number, clientY: number): Point2;
/** RFC 0115's pose enum, in its order, with the labels a storyteller reads. */
export const POSES: {
    value: string;
    label: string;
}[];
export type Point2 = [number, number];

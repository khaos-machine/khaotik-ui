/**
 * A door leaf's yaw about +z at a given swing, in radians from +x: its pivot's closed yaw turned by
 * the swing on the leaf's hinge side. A shot blocking's `doors` set a leaf's swing for that shot;
 * the kit's .glb turns the pivot FIX_<id>_Hinge to this yaw.
 * @param {PlaceDefinition} definition @param {string} id @param {number} swingDegrees
 */
export function hingeYaw(definition: PlaceDefinition, id: string, swingDegrees: number): number;
/**
 * A fixture's top-down footprint: the four corners of the smallest rectangle around it and all
 * its parts, as the kit's build report measures it.
 * @param {PlaceDefinition} definition
 * @param {string} id
 * @returns {Point2[]}
 */
export function footprint(definition: PlaceDefinition, id: string): Point2[];
/**
 * A camera's top-down lens cone: its position, and the two edges of the horizontal field of view
 * of a 36 mm sensor width toward its target. The edges are a fixed 1 m long: the cone shows where
 * the camera looks, not how far it sees.
 * @param {{ position: number[], target: number[], lensMm: number }} c
 */
export function lensCone(c: {
    position: number[];
    target: number[];
    lensMm: number;
}): {
    position: Point2;
    left: Point2;
    right: Point2;
};
/**
 * A copy of the definition with one camera moved on the plan: x and y of its position and its
 * target as given, to the centimetre, each z kept. The definition itself is not changed.
 * @template {PlaceDefinition} D
 * @param {D} definition
 * @param {string} id
 * @param {{ position: number[], target: number[] }} pose The plan pose, x and y in metres.
 * @returns {D}
 */
export function moveCamera<D extends PlaceDefinition>(definition: D, id: string, pose: {
    position: number[];
    target: number[];
}): D;
/**
 * Everything PlacePlan draws, in the definition's frame.
 * @param {PlaceDefinition} definition
 */
export function planOf(definition: PlaceDefinition): {
    rooms: {
        id: string;
        points: Point2[];
    }[];
    openings: {
        id: string;
        kind: string;
        a: number[];
        b: number[];
    }[];
    fixtures: {
        id: any;
        kind: any;
        points: Point2[];
    }[];
    swings: {
        id: any;
        hinge: number[];
        radius: number;
        closed: Point2;
        open: Point2;
        clockwise: boolean;
    }[];
    cameras: {
        target: Point2;
        position: Point2;
        left: Point2;
        right: Point2;
        id: string;
    }[];
    bounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
};
export type Point2 = [number, number];
export type PlaceDefinition = {
    location?: string;
    rooms: {
        id: string;
        outline: Point2[];
        height: number;
        ceiling: boolean;
    }[];
    openings: {
        id: string;
        room: string;
        wall: number;
        offset: number;
        width: number;
        height: number;
        sill: number;
        kind: string;
    }[];
    fixtures: any[];
    cameras: {
        id: string;
        position: number[];
        target: number[];
        lensMm: number;
    }[];
};

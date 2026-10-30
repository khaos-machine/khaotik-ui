/**
 * @typedef {{ kind: string, id: string }} VisualSubject
 * @typedef {{ position: number[], target: number[], lensMm: number }} ShotCamera
 * @typedef {{ subject: VisualSubject, position: number[], facingDegrees: number, pose: string, heightM: number, hands?: { left?: number[], right?: number[] }, lookAt?: number[] }} ShotFigure
 * @typedef {{ position: number[], rotationZ: number }} FloorPlacement
 * @typedef {{ subject: VisualSubject, objectDefinitionId: string, placement: { floor?: FloorPlacement, held?: { figure: VisualSubject, hand: string } } }} ShotObject
 * @typedef {Object} ShotBlocking A shot's head blocking, as KSPD stores it (RFC 0115 §2).
 * @property {string} id
 * @property {{ width: number, height: number }} frame
 * @property {ShotCamera} camera
 * @property {ShotFigure[]} figures
 * @property {ShotObject[]} objects
 * @property {{ fixture: string, swingDegrees: number }[]} doors
 * @typedef {{ subject: VisualSubject, buildKey: string, tint?: string }} ShotFigureModel A figure's model in the previs read; tint is
 *   its identity colour (sRGB hex), multiplied into the figure's own materials.
 * @typedef {Object} PrevisShot One shot of khaosd's `GET /api/v1/composer/previs` read.
 * @property {string} shotId
 * @property {'blocked' | 'refused' | 'stale' | 'none' | 'waiting'} state
 * @property {{ kind: string, message: string }[]} [reasons]
 * @property {ShotBlocking | null} blocking
 * @property {{ figures: ShotFigureModel[] } | null} models
 */
/**
 * Stands a figure's model where the blocking puts it: its feet at position, turned facingDegrees.
 * @param {import('three').Object3D} node @param {{ position: number[], facingDegrees: number }} figure
 */
export function placeFigure(node: any, figure: {
    position: number[];
    facingDegrees: number;
}): void;
/**
 * Stands a floor object's model where the blocking puts it: its base centre at position, turned
 * rotationZ.
 * @param {import('three').Object3D} node @param {FloorPlacement} floor
 */
export function placeFloorObject(node: any, floor: FloorPlacement): void;
/**
 * A viewer for one scene's previs, drawing into canvas. Every model is parsed here, from the
 * bytes the host read; nothing is fetched. It renders on demand: after a show or a frame.
 * @param {HTMLCanvasElement} canvas
 * @param {{ place: Uint8Array, figures: Record<string, Uint8Array>, objects: Record<string, Uint8Array> }} models
 *   The place's .glb, each figure's by build key, and each floor object's by object definition id.
 */
export function createShotScene(canvas: HTMLCanvasElement, models: {
    place: Uint8Array;
    figures: Record<string, Uint8Array>;
    objects: Record<string, Uint8Array>;
}): Promise<{
    /** The three.js scene, for inspection. */
    scene: any;
    /** The camera last framed, or null. */
    camera: () => any;
    /** Every node name in the loaded place, figure and object scenes, as the place viewer's names(). */
    names: () => string[];
    /**
     * Shows one shot: each figure and floor object at its transform, and every door leaf at the
     * shot's swing, or the definition's where the shot names none. Nothing is parsed or fetched.
     * @param {ShotBlocking} blocking
     * @param {ShotFigureModel[]} figureModels Each figure's build key and tint, from the previs read.
     * @param {import('./place-plan.js').PlaceDefinition} definition The place the blocking names.
     */
    show(blocking: ShotBlocking, figureModels: ShotFigureModel[], definition: import("./place-plan.js").PlaceDefinition): void;
    /**
     * Frames the shot camera into a canvas of width by height CSS pixels.
     * @param {ShotCamera} cam @param {number} width @param {number} height
     */
    frame(cam: ShotCamera, width: number, height: number): void;
    dispose(): void;
}>;
export { fitFrame } from "./place-scene.js";
export type VisualSubject = {
    kind: string;
    id: string;
};
export type ShotCamera = {
    position: number[];
    target: number[];
    lensMm: number;
};
export type ShotFigure = {
    subject: VisualSubject;
    position: number[];
    facingDegrees: number;
    pose: string;
    heightM: number;
    hands?: {
        left?: number[];
        right?: number[];
    };
    lookAt?: number[];
};
export type FloorPlacement = {
    position: number[];
    rotationZ: number;
};
export type ShotObject = {
    subject: VisualSubject;
    objectDefinitionId: string;
    placement: {
        floor?: FloorPlacement;
        held?: {
            figure: VisualSubject;
            hand: string;
        };
    };
};
/**
 * A shot's head blocking, as KSPD stores it (RFC 0115 §2).
 */
export type ShotBlocking = {
    id: string;
    frame: {
        width: number;
        height: number;
    };
    camera: ShotCamera;
    figures: ShotFigure[];
    objects: ShotObject[];
    doors: {
        fixture: string;
        swingDegrees: number;
    }[];
};
/**
 * A figure's model in the previs read; tint is
 * its identity colour (sRGB hex), multiplied into the figure's own materials.
 */
export type ShotFigureModel = {
    subject: VisualSubject;
    buildKey: string;
    tint?: string;
};
/**
 * One shot of khaosd's `GET /api/v1/composer/previs` read.
 */
export type PrevisShot = {
    shotId: string;
    state: "blocked" | "refused" | "stale" | "none" | "waiting";
    reasons?: {
        kind: string;
        message: string;
    }[];
    blocking: ShotBlocking | null;
    models: {
        figures: ShotFigureModel[];
    } | null;
};

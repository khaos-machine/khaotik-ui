/**
 * A place camera, framed for a guide of aspect width / height: horizontal field of view
 * 2 atan(18 / lensMm), so three.js's vertical one is 2 atan(18 / (lensMm * aspect)).
 * @param {{ position: number[], target: number[], lensMm: number }} cam
 * @param {number} aspect
 */
export function placeCamera(cam: {
    position: number[];
    target: number[];
    lensMm: number;
}, aspect: number): any;
/**
 * The largest frame of aspect width / height inside a panel, centred: the letterbox. The rest
 * of the panel is the passepartout; the frame is never stretched.
 * @param {number} width @param {number} height @param {number} aspect
 */
export function fitFrame(width: number, height: number, aspect: number): {
    width: number;
    height: number;
    left: number;
    top: number;
};
/**
 * The definition element a glTF node belongs to: ENV_<id>, FIX_<id> and FIX_<id>_<part> (kit
 * IDs hold no underscore), or '' for anything else.
 * @param {string} name
 */
export function elementId(name: string): string;
/**
 * A viewer drawing the .glb in model into canvas. It renders on demand, not every frame: after
 * the model loads and whenever the camera or size changes. The bytes are parsed, never fetched:
 * the host reads them (Khaos App over its byte transport), so the kit makes no request and needs
 * no URL. No Draco or KTX2 loader is registered; the kit's .glb uses neither and holds no images.
 * @param {HTMLCanvasElement} canvas
 * @param {Uint8Array} model
 */
export function createPlaceScene(canvas: HTMLCanvasElement, model: Uint8Array): Promise<{
    /** The loaded scene's node names. */
    names: () => string[];
    /**
     * Frames cam into a canvas of width by height CSS pixels.
     * @param {{ position: number[], target: number[], lensMm: number }} cam @param {number} width @param {number} height
     */
    frame(cam: {
        position: number[];
        target: number[];
        lensMm: number;
    }, width: number, height: number): void;
    /**
     * The element under a canvas point, in CSS pixels from its top left, or ''.
     * @param {number} x @param {number} y @param {number} width @param {number} height
     */
    pick(x: number, y: number, width: number, height: number): string;
    dispose(): void;
}>;
export function toGltf(p: number[]): [number, number, number];

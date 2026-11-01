/** Draws a node's outline: a character is a circle, a place a diamond, a scene a square. */
export function outline(g: any, kind: any, radius: any): any;
export namespace icons {
    let character: string;
    let location: string;
    let scene: string;
}
export namespace tones {
    let current: string;
    let stale: string;
    let missing: string;
    let failed: string;
    let running: string;
    let unknown: string;
}
export namespace stateLabel {
    let current_1: string;
    export { current_1 as current };
    let stale_1: string;
    export { stale_1 as stale };
    let missing_1: string;
    export { missing_1 as missing };
    let failed_1: string;
    export { failed_1 as failed };
    let running_1: string;
    export { running_1 as running };
    let unknown_1: string;
    export { unknown_1 as unknown };
}
export function nodeSize(node: any): any;
export namespace kindHues {
    let character_1: string;
    export { character_1 as character };
    let location_1: string;
    export { location_1 as location };
    let scene_1: string;
    export { scene_1 as scene };
}
export const kindTint: 0.18;
export function edgeKey(edge: any): string;

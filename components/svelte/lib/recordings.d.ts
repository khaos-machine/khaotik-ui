/** The table group a recording (or a refused take) sits in: its scene's place and heading, or none. @param {{ scene?: AudioScene }} recording */
export function sceneGroup(recording: {
    scene?: AudioScene;
}): string;
/** A character's or voice's name, or its ID when the engine sent none. @param {Named} named */
export function nameOf(named: Named): string;
/** A refused take in words: what happened, and what to do about it (KSPD#674). @param {RefusedTake} take */
export function refusalText(take: RefusedTake): "This scene read was made before each line was timed, so it cannot play. It needs reading again: open the scene and read it." | "A scene read could not be read." | "A line take could not be read.";
/**
 * The scene a recording belongs to; `position` is its 1-based place in the story.
 * @typedef {Object} AudioScene
 * @property {string} id
 * @property {number} position
 * @property {string} [number]
 * @property {string} [slugline]
 */
/**
 * A character or voice. `name` is absent when the engine has none for it.
 * @typedef {Object} Named
 * @property {string} id
 * @property {string} [name]
 */
/**
 * One line take or scene read, in the fields a table shows.
 * @typedef {Object} Recording
 * @property {string} id
 * @property {'line' | 'scene'} kind
 * @property {AudioScene} [scene] Absent for a line placed in no scene.
 * @property {{ eventId?: string, kind?: string, text: string }} [line] A line take's line, as the story holds it now.
 * @property {Named} [character] A dialogue take's speaker.
 * @property {number} [lineCount] A scene read's line count.
 * @property {readonly Named[]} voices
 * @property {boolean} chosen
 * @property {boolean} [stale] Absent for a scene read the engine cannot judge.
 * @property {string} createdAt
 * @property {{ text: string, applied: string }} [direction] How a line take was directed.
 * @property {string} [generationId]
 * @property {RecordingMedia} [media]
 */
/**
 * A recording's audio file, in one of KSPD's two shapes (RFC 0112 §3.4): made by a provider, or
 * assembled from other takes, whose ids `assembledFrom` lists in reading order.
 * @typedef {{ format: string, sizeBytes: number } & ({ provider: string, providerModel?: string, assembledFrom?: undefined } | { assembledFrom: readonly string[], provider?: undefined, providerModel?: undefined })} RecordingMedia
 */
/**
 * A take the engine would not list, refused on its own so the rest still list (KSPD#674).
 * @typedef {Object} RefusedTake
 * @property {'line' | 'scene'} kind
 * @property {string} id
 * @property {AudioScene} [scene]
 * @property {'TAKE_NEEDS_REREAD' | 'TAKE_NOT_CONFORMANT' | string} code
 * @property {string} reason The engine's reason, for a person.
 */
export const NOT_IN_A_SCENE: "Not in a scene";
export function linesLabel(count: number): string;
export function takesLabel(count: number): string;
export function recordingText(recording: Recording): string;
/**
 * The scene a recording belongs to; `position` is its 1-based place in the story.
 */
export type AudioScene = {
    id: string;
    position: number;
    number?: string;
    slugline?: string;
};
/**
 * A character or voice. `name` is absent when the engine has none for it.
 */
export type Named = {
    id: string;
    name?: string;
};
/**
 * One line take or scene read, in the fields a table shows.
 */
export type Recording = {
    id: string;
    kind: "line" | "scene";
    /**
     * Absent for a line placed in no scene.
     */
    scene?: AudioScene;
    /**
     * A line take's line, as the story holds it now.
     */
    line?: {
        eventId?: string;
        kind?: string;
        text: string;
    };
    /**
     * A dialogue take's speaker.
     */
    character?: Named;
    /**
     * A scene read's line count.
     */
    lineCount?: number;
    voices: readonly Named[];
    chosen: boolean;
    /**
     * Absent for a scene read the engine cannot judge.
     */
    stale?: boolean;
    createdAt: string;
    /**
     * How a line take was directed.
     */
    direction?: {
        text: string;
        applied: string;
    };
    generationId?: string;
    media?: RecordingMedia;
};
/**
 * A recording's audio file, in one of KSPD's two shapes (RFC 0112 §3.4): made by a provider, or
 * assembled from other takes, whose ids `assembledFrom` lists in reading order.
 */
export type RecordingMedia = {
    format: string;
    sizeBytes: number;
} & ({
    provider: string;
    providerModel?: string;
    assembledFrom?: undefined;
} | {
    assembledFrom: readonly string[];
    provider?: undefined;
    providerModel?: undefined;
});
/**
 * A take the engine would not list, refused on its own so the rest still list (KSPD#674).
 */
export type RefusedTake = {
    kind: "line" | "scene";
    id: string;
    scene?: AudioScene;
    code: "TAKE_NEEDS_REREAD" | "TAKE_NOT_CONFORMANT" | string;
    /**
     * The engine's reason, for a person.
     */
    reason: string;
};

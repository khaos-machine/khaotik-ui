/**
 * @typedef {Object} SceneLabels
 * @property {(label: unknown) => string} scene The scene a label stands for, by the script's own number; the label itself when the analysis does not say.
 * @property {(labels: unknown) => string} scenes A list of labels as "Sc 3, Sc 17".
 * @property {(prose: unknown) => string} said Prose as the engine wrote it, with the request's scene labels turned into the script's numbers. The model cites "S3" inside a sentence as freely as in a scenes list, and there it is the third scene of this character or place, not scene 3.
 */
/** @param {Dict} analysis @returns {SceneLabels} */
export function sceneLabels(analysis: Dict): SceneLabels;
/**
 * @typedef {Object} MadeBy
 * @property {string} process
 * @property {string | null} model
 * @property {string} fingerprint
 */
/** Which process and model wrote the analysis; null when it records none. @param {Dict} analysis @returns {MadeBy | null} */
export function madeBy(analysis: Dict): MadeBy | null;
/** What the engine's own checks found wrong with an answer, by reading. @param {Dict} analysis @returns {{ reading: string, finding: string }[]} */
export function engineChecks(analysis: Dict): {
    reading: string;
    finding: string;
}[];
export function dict(v: unknown): Dict;
export function str(v: unknown): string;
export function list(v: unknown): unknown[];
export function strs(v: unknown): string[];
export type SceneLabels = {
    /**
     * The scene a label stands for, by the script's own number; the label itself when the analysis does not say.
     */
    scene: (label: unknown) => string;
    /**
     * A list of labels as "Sc 3, Sc 17".
     */
    scenes: (labels: unknown) => string;
    /**
     * Prose as the engine wrote it, with the request's scene labels turned into the script's numbers. The model cites "S3" inside a sentence as freely as in a scenes list, and there it is the third scene of this character or place, not scene 3.
     */
    said: (prose: unknown) => string;
};
export type MadeBy = {
    process: string;
    model: string | null;
    fingerprint: string;
};
export type Dict = Record<string, unknown>;

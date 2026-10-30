/**
 * One model as khaosd reports it. `service` is the on-device engine that loads it; `enables`
 * the capability it turns on, in the engine's words; `sizeBytes` 0 when not installed.
 * @typedef {Object} LocalModel
 * @property {string} id
 * @property {string} name
 * @property {string} kind
 * @property {string} service
 * @property {string} enables
 * @property {string} repo
 * @property {string} revision
 * @property {boolean} installed
 * @property {number} sizeBytes
 * @property {string} location
 * @property {'downloading' | 'failed'} [download] Absent when idle.
 * @property {string} [downloadError] With `failed`: the download tool's own last line.
 */
/**
 * One model as Settings › Models lists it. `size` is '' when it is not on disk: khaosd reports
 * no size before a download.
 * @typedef {Object} ModelRow
 * @property {string} id
 * @property {string} name
 * @property {string} repo
 * @property {string} usedFor
 * @property {string} size
 * @property {'installed' | 'available' | 'downloading' | 'failed'} state
 * @property {string} error With `failed`: the download tool's own last line.
 */
/** @typedef {{ service: string, title: string, rows: readonly ModelRow[] }} ModelGroup */
/** @param {LocalModel} model @returns {ModelRow} */
export function modelRow(model: LocalModel): ModelRow;
/**
 * Models grouped by the engine that loads them, in the order khaosd listed them. A group
 * explains why several models of one kind are there: each engine needs its own.
 * @param {readonly LocalModel[]} models @param {(service: string) => string} engineName @returns {ModelGroup[]}
 */
export function modelGroups(models: readonly LocalModel[], engineName: (service: string) => string): ModelGroup[];
/** The folder every model sits under, with the home folder as `~`, or '' when they differ. @param {readonly LocalModel[]} models */
export function storageFolder(models: readonly LocalModel[]): string;
/** Total size on disk of the models that are there. @param {readonly LocalModel[]} models */
export function installedSize(models: readonly LocalModel[]): string;
/**
 * One model as khaosd reports it. `service` is the on-device engine that loads it; `enables`
 * the capability it turns on, in the engine's words; `sizeBytes` 0 when not installed.
 */
export type LocalModel = {
    id: string;
    name: string;
    kind: string;
    service: string;
    enables: string;
    repo: string;
    revision: string;
    installed: boolean;
    sizeBytes: number;
    location: string;
    /**
     * Absent when idle.
     */
    download?: "downloading" | "failed";
    /**
     * With `failed`: the download tool's own last line.
     */
    downloadError?: string;
};
/**
 * One model as Settings › Models lists it. `size` is '' when it is not on disk: khaosd reports
 * no size before a download.
 */
export type ModelRow = {
    id: string;
    name: string;
    repo: string;
    usedFor: string;
    size: string;
    state: "installed" | "available" | "downloading" | "failed";
    /**
     * With `failed`: the download tool's own last line.
     */
    error: string;
};
export type ModelGroup = {
    service: string;
    title: string;
    rows: readonly ModelRow[];
};

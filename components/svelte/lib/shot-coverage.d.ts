/**
 * @typedef {Object} CoverageItem
 * @property {string} id
 * @property {string} title
 * @property {string} framing
 * @property {number|null} start Composition seconds; null requires retiming.
 * @property {number} hold
 * @property {'resolved'|'unresolved'|'stale'} timingStatus
 * @property {'missing'|'unreviewed'|'ready'|'used'|'rejected'|'unavailable'} status Host-supplied frame readiness.
 * @property {string} imageUrl Authenticated preview URL, when available.
 * @property {'ready'|'loading'|'failed'|'missing'} imageState
 */
/** @type {Record<CoverageItem['status'], string>} */
export const coverageLabels: Record<CoverageItem["status"], string>;
export type CoverageItem = {
    id: string;
    title: string;
    framing: string;
    /**
     * Composition seconds; null requires retiming.
     */
    start: number | null;
    hold: number;
    timingStatus: "resolved" | "unresolved" | "stale";
    /**
     * Host-supplied frame readiness.
     */
    status: "missing" | "unreviewed" | "ready" | "used" | "rejected" | "unavailable";
    /**
     * Authenticated preview URL, when available.
     */
    imageUrl: string;
    imageState: "ready" | "loading" | "failed" | "missing";
};

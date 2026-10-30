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
export const coverageLabels = {missing:'No frame',unreviewed:'Needs review',ready:'Ready to use',used:'In playback',rejected:'Rejected',unavailable:'Unavailable for use'}

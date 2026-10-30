// What a Stage 2 analysis's labels stand for. The engine's requests number a character's or
// place's scenes S1, S2…; the analysis stores what each stands for under `_scenes`, and cites
// them by label in lists and inside prose. Shared by the character and place analysis views.
// Moved from Khaos App's `src/app/analysis-labels.ts` (catalog app-coverage plan, T2).

/** @typedef {Record<string, unknown>} Dict */

/** @param {unknown} v @returns {Dict} */
export const dict = (v) => (typeof v === 'object' && v !== null && !Array.isArray(v) ? /** @type {Dict} */ (v) : {})
/** @param {unknown} v @returns {string} */
export const str = (v) => (typeof v === 'string' ? v : '')
/** @param {unknown} v @returns {unknown[]} */
export const list = (v) => (Array.isArray(v) ? v : [])
/** @param {unknown} v @returns {string[]} */
export const strs = (v) => /** @type {string[]} */ (list(v).filter((x) => typeof x === 'string'))

/**
 * @typedef {Object} SceneLabels
 * @property {(label: unknown) => string} scene The scene a label stands for, by the script's own number; the label itself when the analysis does not say.
 * @property {(labels: unknown) => string} scenes A list of labels as "Sc 3, Sc 17".
 * @property {(prose: unknown) => string} said Prose as the engine wrote it, with the request's scene labels turned into the script's numbers. The model cites "S3" inside a sentence as freely as in a scenes list, and there it is the third scene of this character or place, not scene 3.
 */

/** @param {Dict} analysis @returns {SceneLabels} */
export function sceneLabels(analysis) {
  const labels = dict(analysis['_scenes'])
  /** @param {unknown} label */
  const scene = (label) => {
    const number = dict(labels[str(label)])['number']
    return typeof number === 'number' ? `Sc ${number}` : str(label)
  }
  return {
    scene,
    scenes: (v) => list(v).map(scene).filter(Boolean).join(', '),
    said: (v) => str(v).replace(/\bS\d+\b/g, (label) => (labels[label] === undefined ? label : scene(label))),
  }
}

/**
 * @typedef {Object} MadeBy
 * @property {string} process
 * @property {string | null} model
 * @property {string} fingerprint
 */

/** Which process and model wrote the analysis; null when it records none. @param {Dict} analysis @returns {MadeBy | null} */
export function madeBy(analysis) {
  if (analysis['_provenance'] === undefined) return null
  const provenance = dict(analysis['_provenance'])
  const prompt = dict(dict(provenance['input'])['prompt'])
  const by = dict(provenance['made_by'])
  return {
    process: [str(prompt['id']), str(prompt['version'])].filter(Boolean).join(' '),
    model: [str(by['model']), str(by['provider'])].filter(Boolean).join(' · ') || null,
    fingerprint: str(provenance['fingerprint']),
  }
}

/** What the engine's own checks found wrong with an answer, by reading. @param {Dict} analysis @returns {{ reading: string, finding: string }[]} */
export function engineChecks(analysis) {
  return Object.entries(dict(analysis['_response_review'])).flatMap(([reading, findings]) => strs(findings).map((finding) => ({ reading, finding })))
}

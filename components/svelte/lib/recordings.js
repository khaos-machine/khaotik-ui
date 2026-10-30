// A project's recordings as khaosd serves them (`GET /api/v1/audio/assets`): how a table
// groups and names them. Moved from Khaos App's `src/app/audio-assets.svelte.ts` (catalog
// app-coverage plan, T2).

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

export const NOT_IN_A_SCENE = 'Not in a scene'

/** The table group a recording (or a refused take) sits in: its scene's place and heading, or none. @param {{ scene?: AudioScene }} recording */
export function sceneGroup(recording) {
  const scene = recording.scene
  if (!scene) return NOT_IN_A_SCENE
  return scene.slugline ? `${scene.position} · ${scene.slugline}` : `Scene ${scene.position}`
}

/** A character's or voice's name, or its ID when the engine sent none. @param {Named} named */
export function nameOf(named) {
  return named.name ?? named.id
}

/** "1 line", "7 lines". @param {number} count */
export const linesLabel = (count) => (count === 1 ? '1 line' : `${count} lines`)

/** "1 take", "3 takes". @param {number} count */
export const takesLabel = (count) => (count === 1 ? '1 take' : `${count} takes`)

/** What a recording voices: a line take's text, or a scene read's size. @param {Recording} recording */
export const recordingText = (recording) => (recording.kind === 'line' ? (recording.line?.text ?? '') : `Scene read · ${linesLabel(recording.lineCount ?? 0)}`)

/** A refused take in words: what happened, and what to do about it (KSPD#674). @param {RefusedTake} take */
export function refusalText(take) {
  if (take.code === 'TAKE_NEEDS_REREAD') return 'This scene read was made before each line was timed, so it cannot play. It needs reading again: open the scene and read it.'
  return take.kind === 'scene' ? 'A scene read could not be read.' : 'A line take could not be read.'
}

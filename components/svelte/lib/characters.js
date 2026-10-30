// The Characters destination, as data: khaosd's lists in, what the table, the inspector and the
// Voice pop-up show out. Pure. Moved from Khaos App's `src/app/characters.ts`,
// `src/app/format.ts`, `src/app/scene-analysis.ts` (analysisMark) and the appearance labels of
// `src/app/visual-assets.svelte.ts` (catalog app-coverage plan, T2).

/** The narrator's row id in the table: not a character, and never an id the engine sends. */
export const NARRATOR = '@narrator'

/**
 * The fields of khaosd's character row (`/api/v1/dashboard/characters`) the destination reads.
 * The dialogue measurements are optional because older engines omit them on a character with
 * no dialogue; absent reads as zero.
 * @typedef {Object} CharacterRecord
 * @property {string} id
 * @property {string} name
 * @property {number} [dialogue_lines]
 * @property {number} [scene_count]
 * @property {readonly string[]} [scenes]
 * @property {number} [percentage] The share of the screenplay's dialogue lines, as the engine measured it.
 * @property {readonly string[]} [mentionedSceneIds] Scenes that name the character without it appearing.
 * @property {string} [origin] Who asserted the character: `parsed`, `authored`…
 * @property {readonly string[]} [aliases]
 * @property {readonly string[]} [authoredAliases]
 * @property {readonly string[]} [introducedAliases]
 */

/**
 * A character's cast voice, as khaosd's castings list it.
 * @typedef {Object} CharacterCasting
 * @property {string} characterId
 * @property {string} voiceProfileId
 * @property {string} [voiceProfileName]
 */

/**
 * One Characters table row.
 * @typedef {Object} CharacterRow
 * @property {string} id
 * @property {string} name
 * @property {number} lines
 * @property {number} scenes
 * @property {number | null} share The share of the screenplay's dialogue; null when the engine sent none.
 * @property {string} cast The cast voice's name, "Not cast", or '' while the castings are unread.
 */

/** A share of the dialogue, as every Story surface shows it in prose: one decimal, then "%". @param {number} percent */
export const formatShare = (percent) => `${percent.toFixed(1)}%`

/**
 * The table rows. `castings` null means the cast is not read (yet, or at all), so the column
 * says nothing rather than claiming "Not cast".
 * @param {readonly CharacterRecord[]} characters
 * @param {readonly CharacterCasting[] | null} castings
 * @returns {CharacterRow[]}
 */
export function characterRows(characters, castings) {
  return characters.map((c) => {
    const cast = castings?.find((k) => k.characterId === c.id)
    return {
      id: c.id,
      name: c.name,
      lines: c.dialogue_lines ?? 0,
      scenes: c.scene_count ?? 0,
      share: typeof c.percentage === 'number' ? c.percentage : null,
      cast: castings === null ? '' : cast ? cast.voiceProfileName || cast.voiceProfileId : 'Not cast',
    }
  })
}

/** A character's Identity stats, as the inspector lists them; the detail repeats none. @param {CharacterRecord} c @returns {[string, string][]} */
export function characterIdentity(c) {
  /** @type {[string, string][]} */
  const rows = [
    ['Lines', String(c.dialogue_lines ?? 0)],
    ['Scenes', String(c.scene_count ?? 0)],
  ]
  if (typeof c.percentage === 'number') rows.push(['Share', formatShare(c.percentage)])
  const named = c.mentionedSceneIds?.length ?? 0
  if (named) rows.push(['Named in', named === 1 ? '1 scene' : `${named} scenes`])
  return rows
}

/**
 * A voice the character can be cast to.
 * @typedef {Object} CastableVoice
 * @property {string} profileId
 * @property {string} name
 * @property {string} [engine]
 */

/**
 * The Voice pop-up's items, with the voice that shares the character's name first and
 * suggested. The match is the whole name, case-insensitive: "Desmond" for DESMOND, never
 * "Des" for DESMOND.
 * @param {string} characterName
 * @param {readonly CastableVoice[]} castable
 * @returns {{ items: { id: string, label: string, detail?: string }[], suggested: string }}
 */
export function voiceChoices(characterName, castable) {
  const name = characterName.trim().toLowerCase()
  const match = castable.find((v) => v.name.trim().toLowerCase() === name)
  const items = castable.map((v) => ({ id: v.profileId, label: v.name, ...(v.engine ? { detail: v.engine } : {}) }))
  if (!match) return { items, suggested: '' }
  const first = items.find((i) => i.id === match.profileId)
  return { items: [...(first ? [first] : []), ...items.filter((i) => i.id !== match.profileId)], suggested: match.profileId }
}

/**
 * Where a line sits among its speaker's lines in the same scene, counted from 1, as the Line
 * inspector's Position row says it; null when the line is not in the list.
 * @param {readonly { element_id: string, scene_id: string }[]} lines
 * @param {string} elementId
 * @returns {{ n: number, of: number } | null}
 */
export function linePosition(lines, elementId) {
  const line = lines.find((l) => l.element_id === elementId)
  if (!line) return null
  const here = lines.filter((l) => l.scene_id === line.scene_id)
  return { n: here.indexOf(line) + 1, of: here.length }
}

/** An analysis's mark in a table: ready when current, stale when stale, nothing otherwise. @param {{ state: string } | undefined | null} standing @returns {'ready' | 'stale' | null} */
export function analysisMark(standing) {
  if (standing?.state === 'current') return 'ready'
  if (standing?.state === 'stale') return 'stale'
  return null
}

/** @type {Record<string, string>} */
const APPEARANCE_LABELS = {
  none: 'No appearance yet',
  record: 'Appearance record available',
  direction: 'Appearance direction saved',
  artwork: 'Artwork available · no selected headshot',
  portrait: 'Selected character headshot',
  unread: 'Reading appearance',
  unknown: 'Appearance status unavailable',
}

/** A character's appearance state in words: `none`, `record`, `direction`, `artwork`, `portrait`, or `unread` while the images are read. @param {string | undefined} state */
export const appearanceLabel = (state) => APPEARANCE_LABELS[state ?? 'unknown'] ?? APPEARANCE_LABELS.unknown

/**
 * One of an entity detail's `graph_context` lists (`/api/dashboard/detail`) as bars: one per
 * entry, its value the engine's own `frequency`, ranked most-first. An entry with no name is
 * left out; a missing frequency reads as 0 and keeps its row.
 * @param {unknown} entries
 * @returns {{ label: string, value: number }[]}
 */
export function frequencyBars(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => {
      const e = entry && typeof entry === 'object' ? /** @type {Record<string, unknown>} */ (entry) : {}
      return { label: typeof e.name === 'string' ? e.name : '', value: typeof e.frequency === 'number' ? e.frequency : 0 }
    })
    .filter((bar) => bar.label !== '')
    .sort((a, b) => b.value - a.value)
}

/**
 * Who the character shares scenes with, as the engine measured it on the character's detail
 * (`.graph_context.co_characters`).
 * @param {Record<string, unknown> | null | undefined} graphContext
 */
export const coAppearanceBars = (graphContext) => frequencyBars(graphContext?.co_characters)

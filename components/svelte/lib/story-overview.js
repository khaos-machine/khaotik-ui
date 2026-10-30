// The story-wide analyses' closed label maps and the reads the Overview's three panes share.
// Pure. Every map is closed: a value outside it fails its section rather than printing raw
// (khaos.machine docs/designs/2026-10-24-stage3-analysis-display.md, item 4).

/**
 * A value the engine sends with where it came from.
 * @typedef {{ value: any, source: 'llm' | 'deterministic' | 'derived' | 'none', confidence: string, model?: string, evidence?: readonly { ref: string, citation: string }[] }} Sourced
 */

/**
 * One section's read.
 * @template T
 * @typedef {{ kind: 'loading' } | { kind: 'missing', reason?: string } | { kind: 'failed', message: string } | { kind: 'loaded', data: T }} SectionRead
 */

/** @typedef {{ sceneId: string, name: string, turn: string }} TurnPoint */

/** @typedef {{ fit: { outcome: string, reason: string, lenses: readonly { id: string, score: number, p: number }[] }, names?: { state: string, points: readonly TurnPoint[] }, _provenance?: { made_by?: { model?: string } } }} StoryStructure */

/** @typedef {{ logline: Sourced, synopsis: Sourced }} StoryPremise */

/**
 * What the Overview selects: a turning point, a coverage character, a journey or a relationship, by
 * index in the engine's list.
 * @typedef {{ kind: 'turn' | 'character' | 'journey' | 'relationship', index: number }} OverviewSelection
 */

/** @type {Readonly<Record<string, string>>} */
export const OUTCOMES = {
  'author-declared': 'Your structure',
  inferred: 'Fits one structure',
  ambiguous: 'More than one structure fits',
  undetermined: 'No structure fits clearly',
  'insufficient-evidence': 'Not enough to tell',
}

/** @type {Readonly<Record<string, { text: string, tone: 'success' | 'warning' | 'danger' }>>} */
export const VERDICTS = { recommend: { text: 'Recommend', tone: 'success' }, consider: { text: 'Consider', tone: 'warning' }, pass: { text: 'Pass', tone: 'danger' } }

/** @type {Readonly<Record<string, string>>} */
export const INCOMPLETE = { 'character-journey': 'character journeys' }

/** @type {Readonly<Record<string, string>>} */
export const FLAGS = {
  extrasOrCrowdScenes: 'Crowd scenes',
  actionHeavyScenes: 'Action-heavy scenes',
  vfxOrStuntsSignals: 'Effects or stunts',
  periodSetting: 'Period setting',
  childRoles: 'Child roles',
  animalRoles: 'Animal roles',
}

/**
 * The structure's named turns, or null when the engine has not named them.
 * @param {StoryStructure | null} s
 */
export const namedPoints = (s) => (s?.names?.state === 'named' ? s.names.points : null)

/**
 * Whether the shape reads: its outcome is one the map knows.
 * @param {StoryStructure | null} s
 */
export const shapeReads = (s) => !!s && s.fit.outcome in OUTCOMES

/**
 * Whether the coverage reads: its verdict and incomplete sections are ones the maps know.
 * @param {Record<string, any> | null} r
 */
export const coverageReads = (r) => !!r && r.rubric?.verdict?.value in VERDICTS && (r.incompleteSections ?? []).every((/** @type {string} */ s) => s in INCOMPLETE)

/**
 * The production flags raised, labelled, and the contained-location share; null when a flag is
 * one the map has no label for, or is not a boolean, which fails the Production section only.
 * @param {Record<string, any> | null} r
 * @returns {{ raised: string[], contained: Sourced | undefined } | null}
 */
export function productionFlags(r) {
  const { containedLocationPct, ...rest } = r?.viability?.productionFlags ?? {}
  const keys = Object.keys(rest)
  if (keys.some((k) => !(k in FLAGS) || typeof rest[k] !== 'boolean')) return null
  return { raised: keys.filter((k) => rest[k]).map((k) => FLAGS[k]), contained: containedLocationPct }
}

/**
 * A character as khaosd names it beside a journey or a relationship: the story's display name,
 * null when the story no longer has that character (khaos-manager#1058).
 * @typedef {{ id: string, name: string | null }} NamedCharacter
 */

/** A journey's arc quality (KSPD RFC 0118), labelled. @type {Readonly<Record<string, string>>} */
export const ARCS = { complete: 'Complete arc', incomplete: 'Unfinished arc', ambiguous: 'Unclear arc' }

/** @param {NamedCharacter} c */
export const characterName = (c) => c.name ?? 'a character no longer in this story'

/** A character as a row or heading names them. @param {NamedCharacter} c */
export const journeyName = (c) => c.name ?? 'A character no longer in this story'

/**
 * A pair as "A and B", the first capitalised.
 * @param {readonly NamedCharacter[]} pair
 */
export const pairName = (pair) => `${journeyName(pair[0])} and ${characterName(pair[1])}`

/**
 * Whether the journeys read: a list whose every arc quality the map knows.
 * @param {unknown} list
 */
export const journeysRead = (list) => Array.isArray(list) && list.every((j) => j?.journey?.arc_quality in ARCS)

/**
 * Whether the relationships read: a list of pairs, each a synthesis or a skip.
 * @param {unknown} list
 */
export const relationshipsRead = (list) => Array.isArray(list) && list.every((r) => Array.isArray(r?.characters) && r.characters.length === 2 && (!!r.analysis?.synthesis !== !!r.analysis?.skip))

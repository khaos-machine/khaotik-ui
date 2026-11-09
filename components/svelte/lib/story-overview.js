// The story-wide analyses' closed label maps and the reads the Overview's three panes share.
// Pure. Every map but INCOMPLETE is closed: a value outside it fails its section rather than
// printing raw (khaos.machine docs/designs/2026-10-24-stage3-analysis-display.md, item 4).
// INCOMPLETE is open because the protocol says an unknown name is shown as sent; see it below.

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

/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/analysis/structure.schema.json:432 ($defs.act).
 * Indices are zero-based and endIndex is inclusive; fraction is the share of story words.
 * @typedef {{ name: string, startIndex: number, endIndex: number, fraction: number }} StructureAct
 */

/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/analysis/structure.schema.json: a lens's score and p are
 * absent when not scored (:371, :379); names.points is optional (:387).
 * @typedef {{ fit: { outcome: string, reason: string, lenses: readonly { id: string, score?: number, p?: number }[] }, names?: { state: string, points?: readonly TurnPoint[] }, acts?: readonly StructureAct[], _provenance?: { made_by?: { model?: string } } }} StoryStructure
 */

/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/coverage-report.schema.json:391 ($defs.measuredStructure).
 * document is absent when not-measured.
 * @typedef {{ outcome: string, reason: string, document?: string }} MeasuredStructure
 */

/** @typedef {{ logline: Sourced, synopsis: Sourced }} StoryPremise */

/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/coverage-report.schema.json:379, :422.
 * Only name is required in actSummary; absent measures must stay absent.
 * @typedef {{ name: string, percentage?: number, sceneCount?: number, durationMs?: number }} CoverageAct
 */

/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/coverage-report.schema.json:61, :450 ($defs.sceneCard).
 * @typedef {{ index?: number, slugline: string, summary: Omit<Sourced, 'value'> & { value: string }, narrativeRole: Omit<Sourced, 'value'> & { value: string }, characters?: readonly string[], durationMs: Omit<Sourced, 'value'> & { value: number } }} CoverageScene
 */

/**
 * The coverage fields these panes render. Optional acts and scenes are schema projections;
 * existing reports without them continue to render their other results.
 * @typedef {Object} StoryCoverage
 * @property {string} [generatedAt]
 * @property {Sourced} logline
 * @property {Sourced} synopsis
 * @property {Sourced} genre
 * @property {Sourced} tone
 * @property {{ verdict: Sourced, dimensions?: readonly { name: string, score: Sourced, summary?: Sourced }[] }} rubric Only verdict is required (:312).
 * @property {{ estimatedRuntimeMs: Sourced, pageCount: Sourced, sceneCount: Sourced, measured?: MeasuredStructure, pacingNotes?: Sourced, acts?: readonly CoverageAct[] }} structure measured is required by KSPD but read as optional, so older reports still render.
 * @property {readonly CoverageScene[]} [scenes]
 * @property {readonly { name: string, importance: Sourced, arcSummary: Sourced, dialogueWeight: Sourced, sceneCount?: number, strengths: Sourced, concerns: Sourced }[]} [characters]
 * @property {{ uniqueLocations?: number, castSize?: number, speakingRoles?: number, complexityTier: Sourced, productionFlags: { containedLocationPct: Sourced, extrasOrCrowdScenes: boolean, actionHeavyScenes: boolean, vfxOrStuntsSignals: boolean, periodSetting: boolean, childRoles: boolean, animalRoles: boolean } }} viability
 * @property {{ strengths: Sourced, concerns: Sourced, notes: Sourced }} assessment strengths and concerns may carry a null value (:280).
 * @property {readonly string[]} [incompleteSections]
 * @property {readonly string[]} [warnings]
 */


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

/** The empty verdict is the engine's when no dimension was scored (KSPD coverage-report, source none). */
/** @type {Readonly<Record<string, { text: string, tone: 'success' | 'warning' | 'danger' | 'neutral' }>>} */
export const VERDICTS = { recommend: { text: 'Recommend', tone: 'success' }, consider: { text: 'Consider', tone: 'warning' }, pass: { text: 'Pass', tone: 'danger' }, '': { text: 'No verdict', tone: 'neutral' } }

/**
 * The coverage section names KSPD declares and their labels (RFC 0128, "The names"). Unlike the other
 * maps this one is open: the RFC has a client show a name it does not know exactly as sent and still
 * show the report, so a name missing here is printed as is rather than failing Coverage.
 * @type {Readonly<Record<string, string>>}
 */
export const INCOMPLETE = {
  'scene-analysis': 'Scene analysis',
  'character-analysis': 'Character analysis',
  'location-analysis': 'Location analysis',
  'character-journey': 'Character journeys',
  relationships: 'Relationships',
  'story-structure': 'Story structure',
}

/** An unfinished section's label: the declared one, else the name exactly as sent. @param {string} s */
export const incompleteLabel = (s) => (Object.hasOwn(INCOMPLETE, s) ? INCOMPLETE[s] : s)

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
 * What coverage's structure.measured found: the shape outcomes, plus absence (KSPD
 * go/kspdprotocol/v0.136.1 coverage-report.schema.json:391, $defs.measuredStructure). Closed: an
 * outcome outside it fails only the measured block.
 * @type {Readonly<Record<string, string>>}
 */
export const MEASURED = { ...OUTCOMES, 'not-measured': 'Not measured' }

/**
 * The structure's named turns, or null when the engine has not named them. Named with no points is
 * an empty list: points is optional (KSPD analysis/structure.schema.json:387, $defs.names).
 * @param {StoryStructure | null} s
 */
export const namedPoints = (s) => (s?.names?.state === 'named' ? (s.names.points ?? []) : null)

/**
 * An attributed list's items; null is valid and means none (KSPD coverage-report.schema.json:280,
 * $defs.attributedStringList).
 * @param {{ value?: readonly string[] | null } | null | undefined} f
 * @returns {readonly string[]}
 */
export const listItems = (f) => f?.value ?? []

/**
 * Whether the shape reads: its outcome is one the map knows.
 * @param {StoryStructure | null} s
 */
export const shapeReads = (s) => !!s && s.fit.outcome in OUTCOMES

/**
 * Whether the coverage reads: its verdict is one the map knows and its incomplete sections are strings.
 * @param {Record<string, any> | null} r
 */
export const coverageReads = (r) => !!r && r.rubric?.verdict?.value in VERDICTS && (r.incompleteSections ?? []).every((/** @type {unknown} */ s) => typeof s === 'string')

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

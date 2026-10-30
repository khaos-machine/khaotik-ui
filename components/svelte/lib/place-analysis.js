// A place's Stage 2 analysis as the Places detail shows it. Pure: the artifact khaosd serves on
// the place's detail (`/api/dashboard/detail`, `.analysis`) in, the view out. The engine makes
// it in three readings, the story, the setting and the mentions, counts the facts itself, and
// has the decision model read how places connect. Nothing is inferred here: a part the engine
// did not write is empty. A wording's `why` is left out, as a tie's is: it argues the mentions
// call's own reading where the decision model read the line otherwise. Moved from Khaos App's
// `src/app/place-analysis.ts` (catalog app-coverage plan, T4).

import { dict, engineChecks, list, madeBy, sceneLabels, str, strs } from './analysis-labels.js'

/** @typedef {import('./analysis-labels.js').Dict} Dict */
/** @typedef {import('./character-analysis.js').Cited} Cited */
/** @typedef {import('./character-analysis.js').Suggested} Suggested */

/**
 * What the script's loose wording in this place's scenes means.
 * @typedef {Object} Mention
 * @property {string} wording "the kitchen", "his brownstone".
 * @property {{ means: string, decidedBy: string, lines: { scene: string, text: string }[] }[]} readings `means`: "This place", "Part of this place", another place's name, "Elsewhere: the street", "Not a place" or "Cannot tell". `decidedBy`: "Both readers 0.88", "Analysis" or "Review".
 */

/**
 * How this place joins another, with the lines that say so.
 * @typedef {Object} Connection
 * @property {string} sentence "ROOFTOP is inside FIFTH'S LOFT".
 * @property {string} decidedBy "Decision model 0.95", or "Mentions 0.93" for one the mentions imply.
 * @property {{ scene: string, words: string }[]} evidence
 */

/**
 * @typedef {Object} PlaceAnalysisView
 * @property {string} summary
 * @property {boolean} fromScene True when the place has one scene and the story is that scene's own summary.
 * @property {{ weight: string, does: string }} role
 * @property {{ scene: string, what: string }[]} events
 * @property {{ kind: string, what: string, scenes: string, phases: { state: string, scenes: string }[] }} change
 * @property {{ scenes: number, interiorExterior: string, timeOfDay: string, parts: string[], spokenOf: number }} facts
 * @property {{ atmosphere: string, stated: Cited[], changes: Cited[], suggested: Suggested[] }} setting
 * @property {Mention[]} mentions Suggestions for Review, never applied.
 * @property {Connection[]} connections Suggestions, never applied.
 * @property {{ reading: string, finding: string }[]} review
 * @property {import('./analysis-labels.js').MadeBy | null} madeBy
 */

/** @type {Record<string, string>} */
const MEANS = {
  this_place: 'This place',
  part_of_this_place: 'Part of this place',
  elsewhere: 'Elsewhere',
  not_a_place: 'Not a place',
  cannot_tell: 'Cannot tell',
}
/** @type {Record<string, string>} */
const DECIDED_BY = { both: 'Both readers', analysis: 'Analysis', review: 'Review', decision: 'Decision model', mention: 'Mentions' }
/** @type {Record<string, string>} */
const RELATIONS = {
  above: 'is above',
  below: 'is below',
  inside: 'is inside',
  contains: 'contains',
  next_to: 'is next to',
  in_same_building_as: 'is in the same building as',
}

/** @param {Dict} v */
const decidedBy = (v) => {
  const p = v['probability']
  const probability = typeof p === 'number' && p > 0 ? ` ${p.toFixed(2)}` : ''
  return `${DECIDED_BY[str(v['decided_by'])] ?? str(v['decided_by'])}${probability}`
}
/** "INT 7 · EXT 1", largest first. @param {unknown} v */
const tally = (v) =>
  /** @type {[string, number][]} */ (Object.entries(dict(v)).filter((e) => typeof e[1] === 'number'))
    .sort((a, b) => b[1] - a[1])
    .map(([key, n]) => `${key} ${n}`)
    .join(' · ')

/**
 * The view, or null when the record holds neither a story nor a setting reading.
 * @param {Dict | undefined | null} analysis
 * @returns {PlaceAnalysisView | null}
 */
export function placeAnalysisView(analysis) {
  if (!analysis || (analysis['story'] === undefined && analysis['setting'] === undefined)) return null
  const { scene, scenes, said } = sceneLabels(analysis)
  /** @param {unknown} v @param {string} key @returns {Cited} */
  const cited = (v, key) => ({ text: said(dict(v)[key]), scenes: scenes(dict(v)['scenes']) })
  const story = dict(analysis['story'])
  const role = dict(story['role'])
  const change = dict(story['change'])
  const setting = dict(analysis['setting'])
  const facts = dict(analysis['_facts'])

  return {
    summary: said(story['summary']),
    fromScene: str(story['source']) === 'scene',
    role: { weight: str(role['weight']), does: said(role['function']) },
    events: list(story['events']).map(dict).map((e) => ({ scene: scene(e['scene']), what: said(e['what']) })),
    change: {
      kind: str(change['kind']) === 'none' ? '' : str(change['kind']),
      what: said(change['what']),
      scenes: scenes(change['scenes']),
      phases: list(change['phases']).map(dict).map((p) => ({ state: str(p['state']), scenes: scenes(p['scenes']) })),
    },
    facts: {
      scenes: list(facts['scenes']).length,
      interiorExterior: tally(facts['interior_exterior']),
      timeOfDay: tally(facts['time_of_day']),
      parts: list(facts['parts']).map(dict).map((p) => str(p['name'])).filter(Boolean),
      spokenOf: list(facts['spoken_of']).length,
    },
    setting: {
      atmosphere: said(setting['atmosphere']),
      stated: list(setting['stated']).map((s) => cited(s, 'detail')),
      changes: list(setting['changes']).map((c) => cited(c, 'change')),
      suggested: list(setting['suggested']).map(dict).map((s) => ({ detail: said(s['detail']), restsOn: said(s['rests_on']) })),
    },
    mentions: list(dict(analysis['mentions'])['wordings']).map(dict).map((w) => {
      const lines = new Map(list(w['lines']).map(dict).map((l) => [str(l['label']), l]))
      return {
        wording: str(w['wording']) || str(w['record']),
        readings: list(w['readings']).map(dict).map((r) => {
          const reading = str(r['reading'])
          const named = str(r['name']) || str(r['which'])
          return {
            means: reading === 'other_place' ? named : [MEANS[reading] ?? reading, reading === 'elsewhere' ? named : ''].filter(Boolean).join(': '),
            decidedBy: decidedBy(r),
            lines: strs(r['lines']).map((label) => {
              const l = dict(lines.get(label))
              return { scene: scene(l['scene']), text: str(l['text']) }
            }),
          }
        }),
      }
    }),
    connections: list(analysis['connections']).map(dict).map((c) => ({
      sentence: [str(c['a_name']), RELATIONS[str(c['relation'])] ?? str(c['relation']), str(c['b_name'])].filter(Boolean).join(' '),
      decidedBy: decidedBy(c),
      evidence: list(c['evidence']).map(dict).map((e) => ({ scene: scene(e['scene']), words: str(e['words']) })),
    })),
    review: engineChecks(analysis),
    madeBy: madeBy(analysis),
  }
}

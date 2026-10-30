// A character's Stage 2 analysis as the Characters detail shows it. Pure: the artifact khaosd
// serves on the character's detail (`/api/dashboard/detail`, `.analysis`) in, the view out.
// The engine makes it in three readings, the story, the casting profile and the ties, and
// stores what each scene and line label it cites stands for. Nothing is inferred here: a part
// the engine did not write is empty. A tie's `why` is left out: it is the ties call's own
// reasoning in the request's labels, and it still argues that call's reading where Review or
// the decision model settled the line otherwise. Moved from Khaos App's
// `src/app/character-analysis.ts` (catalog app-coverage plan, T2).

import { dict, engineChecks, list, madeBy, sceneLabels, str, strs } from './analysis-labels.js'

/** @typedef {import('./analysis-labels.js').Dict} Dict */
/** @typedef {import('./analysis-labels.js').MadeBy} MadeBy */

/**
 * A statement with the scenes that show it, as "Sc 3, Sc 17".
 * @typedef {Object} Cited
 * @property {string} text
 * @property {string} scenes
 */

/**
 * @typedef {Object} Turn
 * @property {string} scene
 * @property {string} kind
 * @property {string} change
 */

/**
 * @typedef {Object} Relationship
 * @property {string} name
 * @property {string} basis recurring, or pivotal for a character met in one scene.
 * @property {string} nature
 * @property {string} development
 * @property {string} scenes
 */

/**
 * @typedef {Object} Suggested
 * @property {string} detail
 * @property {string} restsOn
 */

/**
 * @typedef {Object} Appearance
 * @property {string} castingNote
 * @property {Cited[]} stated
 * @property {Cited[]} changes
 * @property {Suggested[]} suggested In the note, not in the script.
 */

/**
 * @typedef {Object} VoiceProfile
 * @property {string} designNote
 * @property {string} register
 * @property {string} pace
 * @property {string} energy
 * @property {string} talks
 * @property {string} accent
 * @property {{ line: string, scene: string }[]} auditionLines
 * @property {Suggested[]} suggested
 */

/**
 * @typedef {Object} TieLine
 * @property {string} scene
 * @property {string} speaker Who says it; empty for the script's own description.
 * @property {string} wording
 * @property {string} text
 */

/**
 * @typedef {Object} TiePerson
 * @property {string} who Who the lines mean: a character's name, "Never brought on", or "Cannot tell".
 * @property {string} decidedBy Who settled it: "Review", "Decision model 0.94" or "Analysis".
 * @property {TieLine[]} lines
 */

/**
 * @typedef {Object} Tie
 * @property {string} tie "brother", "friend".
 * @property {TiePerson[]} people
 */

/**
 * @typedef {Object} CharacterAnalysisView
 * @property {string} summary
 * @property {{ weight: string, does: string }} role
 * @property {{ goal: string, obstacle: string, scenes: string }} want
 * @property {{ shape: string, start: Cited, end: Cited, turns: Turn[] }} arc
 * @property {Relationship[]} relationships
 * @property {Appearance} appearance
 * @property {{ gender: string, age: string }} demographics
 * @property {{ manner: string, habits: string[] } | null} voice How they talk; null when they never speak.
 * @property {VoiceProfile | null} voiceProfile
 * @property {Tie[]} ties Who the people the script ties to them are. Suggestions for Review, never applied.
 * @property {{ reading: string, finding: string }[]} review What the engine's own checks found wrong with an answer, by reading.
 * @property {MadeBy | null} madeBy
 */

/** "not stated" is the engine's word for a thing the script does not say; shown as nothing. @param {unknown} v */
const stated = (v) => (str(v) === 'not stated' ? '' : str(v))

/** @type {Record<string, string>} */
const DECIDED_BY = { review: 'Review', decision: 'Decision model', analysis: 'Analysis' }
/** @type {Record<string, string>} */
const READINGS = { offscreen: 'Never brought on', cannot_tell: 'Cannot tell' }

/**
 * The view, or null when the record holds neither a story nor a casting reading: an analysis
 * in a shape the engine no longer writes, or none.
 * @param {Dict | undefined | null} analysis
 * @returns {CharacterAnalysisView | null}
 */
export function characterAnalysisView(analysis) {
  if (!analysis || (analysis['story'] === undefined && analysis['casting'] === undefined)) return null
  const { scene, scenes, said } = sceneLabels(analysis)
  /** @param {unknown} v @param {string} key @returns {Cited} */
  const cited = (v, key) => ({ text: said(dict(v)[key]), scenes: scenes(dict(v)['scenes']) })
  /** @param {unknown} v @returns {Suggested[]} */
  const suggested = (v) => list(v).map(dict).map((s) => ({ detail: said(s['detail']), restsOn: said(s['rests_on']) }))

  const story = dict(analysis['story'])
  const casting = dict(analysis['casting'])
  const arc = dict(story['arc'])
  const want = dict(story['want'])
  const role = dict(story['role'])
  const appearance = dict(casting['appearance'])
  const demographics = dict(casting['demographics'])
  const voice = casting['voice'] ? dict(casting['voice']) : null
  const profile = casting['voice_profile'] ? dict(casting['voice_profile']) : null

  return {
    summary: said(story['summary']),
    role: { weight: str(role['weight']), does: said(role['function']) },
    want: { goal: said(want['goal']), obstacle: said(want['obstacle']), scenes: scenes(want['scenes']) },
    arc: {
      shape: str(arc['shape']),
      start: cited(arc['start'], 'state'),
      end: cited(arc['end'], 'state'),
      turns: list(arc['turns']).map(dict).map((t) => ({ scene: scene(t['scene']), kind: str(t['kind']), change: said(t['change']) })),
    },
    relationships: list(story['relationships']).map(dict).map((r) => ({
      name: str(r['name']) || str(r['with']),
      basis: str(r['basis']),
      nature: said(r['nature']),
      development: said(r['development']),
      scenes: scenes(r['scenes']),
    })),
    appearance: {
      castingNote: said(appearance['casting_note']),
      stated: list(appearance['stated']).map((s) => cited(s, 'detail')),
      changes: list(appearance['changes']).map((c) => cited(c, 'change')),
      suggested: suggested(appearance['suggested']),
    },
    demographics: { gender: stated(dict(demographics['gender'])['value']), age: stated(dict(demographics['age'])['value']) },
    voice: voice ? { manner: said(voice['manner']), habits: strs(voice['habits']).map(said) } : null,
    voiceProfile: profile
      ? {
          designNote: said(profile['design_note']),
          register: str(profile['register']),
          pace: str(profile['pace']),
          energy: str(profile['energy']),
          talks: str(profile['talks']),
          accent: stated(dict(profile['accent'])['value']),
          auditionLines: list(profile['audition_lines']).map(dict).map((l) => ({ line: str(l['line']), scene: scene(l['scene']) })),
          suggested: suggested(profile['suggested']),
        }
      : null,
    ties: list(dict(analysis['ties'])['pending']).map(dict).map((t) => {
      const lines = new Map(list(t['lines']).map(dict).map((l) => [str(l['label']), l]))
      return {
        tie: str(t['tie']) || str(t['record']),
        people: list(t['people']).map(dict).map((p) => {
          const probability = typeof p['probability'] === 'number' && p['probability'] > 0 ? ` ${p['probability'].toFixed(2)}` : ''
          return {
            who: str(p['reading']) === 'character' ? str(p['name']) || str(p['who']) : [READINGS[str(p['reading'])] ?? str(p['reading']), str(p['who'])].filter(Boolean).join(': '),
            decidedBy: `${DECIDED_BY[str(p['decided_by'])] ?? str(p['decided_by'])}${probability}`,
            lines: strs(p['lines']).map((label) => {
              const l = dict(lines.get(label))
              return { scene: scene(l['scene']), speaker: str(l['speaker']), wording: str(l['wording']), text: str(l['text']) }
            }),
          }
        }),
      }
    }),
    review: engineChecks(analysis),
    madeBy: madeBy(analysis),
  }
}

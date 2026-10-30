// A scene's Stage 2 analysis as the Scenes detail shows it. Pure: the artifact khaosd serves on
// the scene's detail (`/api/dashboard/detail`, `.analysis`) in, the view out. Nothing is
// inferred: a field the engine did not write is empty, and the model that made the analysis is
// null when the artifact does not record one. Moved from Khaos App's `src/app/scene-analysis.ts`
// (catalog app-coverage plan, T3).

import { dict, list, str, strs } from './analysis-labels.js'

/**
 * @typedef {Object} Interaction
 * @property {string} from
 * @property {string} to
 * @property {string} type
 * @property {string} valence
 * @property {string} significance
 * @property {string} description
 */

/**
 * @typedef {Object} ArcMoment
 * @property {string} character
 * @property {string} type
 * @property {string} milestone
 * @property {string} shift
 * @property {string} description
 */

/**
 * @typedef {Object} SuggestionView
 * @property {string} recordId
 * @property {string} kind
 * @property {string} words The suggestion in words: "bind to lock", "new", "supported".
 * @property {string} outcome The engine's verdict on the suggestion: accepted, statement or rejected.
 * @property {string} reason Why it was not accepted, in the engine's words; empty when it was.
 * @property {string[]} evidence The scene lines it cites, or the event's id when the scene does not hold it.
 */

/**
 * @typedef {Object} Provenance
 * @property {string} process The prompt that made it, id and version.
 * @property {string | null} model The model that made it and the provider it ran on (`made_by`); null on an analysis from before it was recorded.
 * @property {string} storyDataChange The Stage 1 ledger change the analysis was shown.
 * @property {string} fingerprint
 */

/**
 * @typedef {Object} SceneAnalysisView
 * @property {string} title
 * @property {string} summary
 * @property {string} pacing
 * @property {string} tone
 * @property {string} role
 * @property {string[]} themes
 * @property {string[]} beats
 * @property {{ name: string, goal: string, state: string }[]} speakers
 * @property {Interaction[]} interactions
 * @property {ArcMoment[]} arcMoments
 * @property {SuggestionView[]} suggestions Every suggestion the engine reviewed, accepted or not. Suggestions, never decisions.
 * @property {Provenance | null} provenance
 */

/**
 * What the view looks up in the host's lists.
 * @typedef {Object} ViewLookup
 * @property {readonly { id: string, name: string }[]} names Characters, objects and places, to name a bind target.
 * @property {ReadonlyMap<string, string>} lines The scene's event texts by event id, to quote a suggestion's evidence.
 */

/** @type {Record<string, string>} */
const SUGGESTION_WORDS = {
  not_present: 'not present',
  cannot_tell: 'cannot tell from this scene',
  not_supported: 'not supported',
}

/**
 * A suggestion in words; a bind names its target, by name when the story holds it.
 * @param {string} suggestion
 * @param {string} bindTo
 * @param {ViewLookup['names']} names
 */
export function suggestionWords(suggestion, bindTo, names) {
  if (suggestion === 'bind') return `bind to ${names.find((n) => n.id === bindTo)?.name ?? bindTo}`
  return SUGGESTION_WORDS[suggestion] ?? suggestion
}

/**
 * @param {Record<string, unknown> | undefined | null} analysis
 * @param {ViewLookup} lookup
 * @returns {SceneAnalysisView | null}
 */
export function sceneAnalysisView(analysis, lookup) {
  if (!analysis) return null
  const narrative = dict(analysis['narrative'])
  const input = dict(dict(analysis['_provenance'])['input'])
  const prompt = dict(input['prompt'])
  const madeBy = dict(dict(analysis['_provenance'])['made_by'])
  const hasProvenance = analysis['_provenance'] !== undefined
  return {
    title: str(analysis['title']),
    summary: str(analysis['summary']),
    pacing: str(analysis['pacing']),
    tone: str(narrative['emotional_tone']),
    role: str(narrative['story_role']),
    themes: strs(narrative['themes']),
    beats: strs(narrative['plot_beats']),
    speakers: list(analysis['speaking_characters']).map(dict).map((s) => ({
      name: str(s['name']),
      goal: str(s['goal']),
      state: str(s['emotional_state']),
    })),
    interactions: list(analysis['character_interactions']).map(dict).map((i) => ({
      from: str(i['from']),
      to: str(i['to']),
      type: str(i['interaction_type']),
      valence: str(i['emotional_valence']),
      significance: str(i['significance']),
      description: str(i['description']),
    })),
    arcMoments: list(analysis['arc_moments']).map(dict).map((m) => ({
      character: str(m['character']),
      type: str(m['arc_type']),
      milestone: str(m['milestone_type']),
      shift: str(m['emotional_shift']),
      description: str(m['description']),
    })),
    suggestions: list(analysis['_pending_suggestions']).map(dict).map((s) => ({
      recordId: str(s['record_id']),
      kind: str(s['kind']),
      words: suggestionWords(str(s['suggestion']), str(s['bind_to']), lookup.names),
      outcome: str(s['outcome']),
      reason: str(s['reason']),
      evidence: strs(s['evidence_event_ids']).map((id) => lookup.lines.get(id) ?? id),
    })),
    provenance: hasProvenance
      ? {
          process: [str(prompt['id']), str(prompt['version'])].filter(Boolean).join(' '),
          model: [str(madeBy['model']), str(madeBy['provider'])].filter(Boolean).join(' · ') || null,
          storyDataChange: str(dict(input['story_data'])['change_id']),
          fingerprint: str(dict(analysis['_provenance'])['fingerprint']),
        }
      : null,
  }
}

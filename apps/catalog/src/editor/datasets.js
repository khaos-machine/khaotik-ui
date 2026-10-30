// The only place data is named.
//
// THE NO-FABRICATION RULE, made a property of the tool rather than a rule people
// remember. AGENTS.md: "Real data, never fabricated" — the catalog's demo data
// is captured from the live khaosd daemon, and a gap is reported rather than
// papered over. In a viewer that rule is enforced by review. In an EDITOR it has
// to be enforced by the controls, because an editor with a free-text JSON field
// is an invitation to type a scene that does not exist and then screenshot it.
//
// So: a collection or entity prop can be bound to one of the captures below, or
// to an input of the enclosing document, and to nothing else. There is no
// free-text path to an array anywhere in the inspector. When no dataset matches
// a prop's declared shape, the panel says so in words and offers nothing — the
// same move as SECTION_EMPTY and FlowStrip's missing-step paragraph.
//
// These are the same files `fixtures.js` imports, not a second copy. Regenerate
// them with `scripts/fetch-all.sh`; nothing here is hand-written, and
// `datasets.test.js` asserts this module contains no array literal of its own so
// a fabricated row cannot be slipped in beside the real ones.

import { resolveValue } from '@khaos-machine/khaotik-ui/components/svelte/lib/compose.js'
import scenesDestination from '../data/scenes-destination.json'
import characters from '../data/characters.json'
import dialogues from '../data/dialogues.json'
import locations from '../data/locations.json'
import voices from '../data/voices.json'
import services from '../data/services.json'
import providerStatus from '../data/provider-status.json'
import casting from '../data/casting.json'
import storyGraph from '../data/story-graph.json'
import composition from '../data/composition.json'
import catalog from '../data/catalog.json'
import pacing from '../data/pacing.json'
import sceneAnalyses from '../data/scene-analyses.json'
import characterAnalyses from '../data/character-analyses.json'
import locationAnalyses from '../data/location-analyses.json'

/**
 * @typedef {Object} Dataset
 * @property {string} id Referenced as `{ $data: id }`.
 * @property {string} label
 * @property {string} file The capture it came from, shown in the picker.
 * @property {string|null} entity The element type, matched against a prop's
 *   declared `readonly Entity[]`. Null where the capture has no named type.
 * @property {'collection'|'record'} shape
 * @property {unknown} value
 */

/** @type {readonly Dataset[]} */
export const DATASETS = [
  { id: 'scenes', label: 'Scenes', file: 'scenes-destination.json', entity: 'SceneRecord', shape: 'collection', value: scenesDestination.scenes },
  { id: 'characters', label: 'Characters', file: 'characters.json', entity: 'Character', shape: 'collection', value: characters },
  { id: 'dialogues', label: 'Dialogue', file: 'dialogues.json', entity: 'DialogueLine', shape: 'collection', value: dialogues },
  { id: 'locations', label: 'Locations', file: 'locations.json', entity: 'Location', shape: 'collection', value: locations },
  { id: 'voices', label: 'Voices', file: 'voices.json', entity: 'Voice', shape: 'collection', value: voices },
  { id: 'services', label: 'Services', file: 'services.json', entity: 'Service', shape: 'collection', value: services },
  { id: 'provider-status', label: 'Provider status', file: 'provider-status.json', entity: 'ProviderStatus', shape: 'collection', value: providerStatus },
  { id: 'casting', label: 'Casting', file: 'casting.json', entity: null, shape: 'collection', value: casting },
  // Nested arrays inside a captured envelope. Named at the array rather than at
  // the file because a prop takes the rows, not the wrapper — and `_provenance`
  // beside them is the capture's own record, not data to render.
  { id: 'story-graph-nodes', label: 'Story graph · nodes', file: 'story-graph.json', entity: 'GraphNode', shape: 'collection', value: storyGraph.nodes },
  { id: 'story-graph-edges', label: 'Story graph · edges', file: 'story-graph.json', entity: 'GraphEdge', shape: 'collection', value: storyGraph.edges },
  { id: 'composition-segments', label: 'Composition · segments', file: 'composition.json', entity: 'CompositionSegment', shape: 'collection', value: composition.segments },
  { id: 'catalog-artifacts', label: 'Catalog · artifacts', file: 'catalog.json', entity: 'CatalogArtifact', shape: 'collection', value: catalog.artifacts },
  { id: 'pacing-series', label: 'Pacing · series', file: 'pacing.json', entity: 'SeriesPoint', shape: 'collection', value: pacing.series },
  // Keyed by entity id or name — the shape the four workspaces declare as
  // `Record<string, any>`.
  { id: 'scene-analyses', label: 'Scene analyses', file: 'scene-analyses.json', entity: 'SceneAnalysis', shape: 'record', value: sceneAnalyses },
  { id: 'character-analyses', label: 'Character analyses', file: 'character-analyses.json', entity: 'CharacterAnalysis', shape: 'record', value: characterAnalyses },
  { id: 'location-analyses', label: 'Location analyses', file: 'location-analyses.json', entity: 'LocationAnalysis', shape: 'record', value: locationAnalyses },
]

const BY_ID = new Map(DATASETS.map((d) => [d.id, d]))

/**
 * `{ id: rows }` — what the renderer binds a `$data` reference to.
 *
 * This is the catalog's answer to a question the DOCUMENT does not answer: a
 * document says `{ $data: 'scenes' }`, meaning "the scenes collection", and each
 * host supplies its own. The catalog supplies captures; an app supplies a live
 * query. Same document, same meaning, different rows.
 */
export const dataMap = Object.fromEntries(DATASETS.map((d) => [d.id, d.value]))

/** Every dataset id, for validation. */
export const datasetIds = DATASETS.map((d) => d.id)

/**
 * The datasets a prop with this control may be bound to.
 *
 * An entity match is exact when the prop names a type we captured. When it names
 * one we did not — `MenuItem`, `Fact`, `Bar` — the answer is an EMPTY LIST, not
 * every collection: offering `Scenes` for `readonly Fact[]` would render
 * something that looks plausible and is wrong, which is the failure this repo
 * keeps paying for. An empty list is the panel's cue to say what is missing.
 *
 * A null entity is the exception. The prop declares an anonymous shape
 * (`readonly {src?: string}[]`), so there is no name to match on and no basis to
 * exclude anything; every collection is offered and the choice is the author's.
 */
export function datasetsFor(control) {
  if (!control) return []
  if (control.kind === 'unknown') return DATASETS.filter((d) => d.shape === 'record')
  if (control.kind === 'collection' || control.kind === 'entity') {
    const collections = DATASETS.filter((d) => d.shape === 'collection')
    if (control.entity === null || control.entity === undefined) return collections
    if (control.entity === 'string' || control.entity === 'number') return []
    return collections.filter((d) => d.entity === control.entity)
  }
  return []
}

/**
 * `{ $data }` -> `{ value }`, or `{ missing }`.
 *
 * Reported rather than resolved to an empty array, following `resolveFlowSteps`:
 * a renamed capture should surface as a named gap, not as a list that renders
 * zero rows and looks like an empty state somebody designed.
 */
export function resolveDataRef(ref) {
  if (!ref || !BY_ID.has(ref.$data)) return { missing: ref?.$data ?? null }
  // Delegated, not reimplemented: `at` and `slice` mean the same thing wherever a
  // document renders, so the library owns them and this only says which rows.
  return resolveValue(ref, { data: dataMap })
}

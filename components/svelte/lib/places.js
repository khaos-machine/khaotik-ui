// The Places and Objects destinations, as data: khaosd's lists and headings in, the table rows,
// a place's cast and its headings out. Pure. Moved from Khaos App's `src/app/places.ts`,
// `locationCastBars` in `src/app/inspector-projections.ts` and the filters of
// `src/app/location-headings.svelte.ts` (catalog app-coverage plan, T4).

import { frequencyBars } from './characters.js'

/**
 * The fields of khaosd's place row (`/api/v1/dashboard/locations`) the destination reads.
 * @typedef {Object} PlaceRecord
 * @property {string} id
 * @property {string} name
 * @property {number} [scene_count]
 * @property {number} [page_count]
 * @property {readonly string[]} [mentionedSceneIds] Scenes that only name the place (RFC 0102).
 * @property {string} [origin]
 */

/**
 * @typedef {Object} PlaceRow
 * @property {string} id
 * @property {string} name
 * @property {number} scenes
 * @property {number} pages
 * @property {number} named Scenes that only name the place, apart from the scenes set there.
 * @property {string} origin
 */

/** @param {readonly PlaceRecord[]} places @returns {PlaceRow[]} */
export function placeRows(places) {
  return places.map((p) => ({
    id: p.id,
    name: p.name,
    scenes: p.scene_count ?? 0,
    pages: p.page_count ?? 0,
    named: p.mentionedSceneIds?.length ?? 0,
    origin: p.origin ?? '',
  }))
}

/**
 * The fields of khaosd's object row (`/api/v1/dashboard/objects`) the destination reads.
 * @typedef {Object} ObjectRecord
 * @property {string} id
 * @property {string} name
 * @property {number} [scene_count]
 * @property {readonly string[]} [mentionedSceneIds]
 * @property {'individual' | 'group' | string} [identityKind]
 * @property {readonly string[]} [members] A group's members, by id.
 * @property {readonly string[]} [memberOf] The groups an object belongs to, by id.
 * @property {readonly { sceneId: string }[]} [appearances]
 */

/**
 * @typedef {Object} ObjectRow
 * @property {string} id
 * @property {string} name
 * @property {number} scenes
 * @property {number} named
 * @property {string} group "group of 2", "one of glasses" (RFC 0078 §3.1), or '' for a plain object.
 */

/** @param {readonly ObjectRecord[]} objects @returns {ObjectRow[]} */
export function objectRows(objects) {
  /** @param {string} id */
  const name = (id) => objects.find((o) => o.id === id)?.name ?? id
  return objects.map((o) => ({
    id: o.id,
    name: o.name,
    scenes: o.scene_count ?? 0,
    named: o.mentionedSceneIds?.length ?? 0,
    group: o.identityKind === 'group' ? `group of ${o.members?.length ?? 0}` : o.memberOf?.length ? `one of ${o.memberOf.map(name).join(', ')}` : '',
  }))
}

/**
 * Which characters the engine measured in this place's scenes (`.graph_context.characters` on
 * the place's detail): measured, so it needs no analysis.
 * @param {Record<string, unknown> | null | undefined} graphContext
 */
export const placeCastBars = (graphContext) => frequencyBars(graphContext?.characters)

/**
 * Where a heading sits in the screenplay, as khaosd read it.
 * @typedef {Object} HeadingSpan
 * @property {number} lineNumber
 * @property {string} lineText
 * @property {number} startByte
 * @property {number} endByte
 * @property {string} sourcePhrase
 */

/**
 * One scene's heading and the place the engine resolved it to.
 * @typedef {Object} HeadingOccurrence
 * @property {string} locationId
 * @property {string} sourceHash The screenplay revision it was read from; a declaration sends it back as read.
 * @property {{ sceneId: string, span: HeadingSpan }} evidence
 */

/**
 * A landed decision between two headings: a merge, or a declaration.
 * @typedef {Object} HeadingDecision
 * @property {'merged' | 'declaredSame' | 'declaredDifferent' | 'split'} state
 * @property {number} decisionSeq
 * @property {string} canonicalId
 * @property {string} retiredId
 * @property {string} sourceHash
 * @property {{ sceneId: string, span: HeadingSpan }} canonical
 * @property {{ sceneId: string, span: HeadingSpan }} retired
 * @property {boolean} inEffect
 * @property {number} [mergeSeq] For a split: the merge it undid.
 */

/**
 * The project's headings as khaosd serves them (`/api/v1/locations/headings`).
 * @typedef {Object} HeadingLocations
 * @property {string} sourceHash
 * @property {readonly HeadingOccurrence[]} occurrences
 * @property {readonly HeadingDecision[]} decisions
 */

/**
 * What a place's Headings view shows.
 * @typedef {Object} PlaceHeadings
 * @property {HeadingOccurrence[]} occurrences This place's headings, in scene order.
 * @property {HeadingDecision[]} merges Merges into this place that are in effect: the headings it absorbed.
 * @property {HeadingDecision[]} keptApart Declarations in effect that keep this place apart from another.
 */

/**
 * A screenplay line the place builder cites for an area.
 * @typedef {Object} AreaCitation
 * @property {'space' | 'fixedFeature' | 'dressing' | 'lighting'} field The part of the brief it supports.
 * @property {string} detail The engine's sentence.
 * @property {readonly number[]} [sceneNumbers] The scenes it comes from; absent until the engine sends them.
 */

/**
 * An area of a place, as the place builder prepares it (`preparation.areas[]`).
 * @typedef {Object} PlaceArea
 * @property {string} name
 * @property {{ spatialDescription: string, fixedFeatures: readonly string[], dressing: string, lighting: string, unknowns: readonly string[] }} brief
 * @property {readonly AreaCitation[]} cited
 */

/** @typedef {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded', areas?: readonly PlaceArea[] }} PlaceAreasRead */

/** @param {HeadingLocations} read @param {string} locationId @returns {PlaceHeadings} */
export function headingsFor(read, locationId) {
  const { occurrences, decisions } = read
  return {
    occurrences: occurrences.filter((o) => o.locationId === locationId),
    merges: decisions.filter((d) => d.inEffect && (d.state === 'merged' || d.state === 'declaredSame') && d.canonicalId === locationId),
    keptApart: decisions.filter((d) => d.inEffect && d.state === 'declaredDifferent' && (d.canonicalId === locationId || d.retiredId === locationId)),
  }
}

/** Every heading outside this place: what one of its headings can be kept apart from. @param {HeadingLocations} read @param {string} locationId */
export const headingsOtherThan = (read, locationId) => read.occurrences.filter((o) => o.locationId !== locationId)

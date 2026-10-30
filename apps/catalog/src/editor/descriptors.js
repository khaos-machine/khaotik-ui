// Every published component, as a JSON descriptor.
//
// JSON IS THE PRIMARY COMPONENT. The canvas composes JSON, the registry lists
// JSON, the artifact is JSON. A Svelte component is one IMPLEMENTATION of a
// component, not the component itself — which is the right way round for a kit
// that intends to reach more than one platform, and the wrong way round from how
// the library was actually built. This module is the adapter between the two, and
// it runs in the direction that costs nothing: the descriptor is DERIVED from the
// component, so the 49 hand-authored Svelte files stay exactly as they are and
// the catalog still becomes JSON-first.
//
// DERIVED, NEVER HAND-WRITTEN, and never committed. It is regenerated at load
// from the same sources the props panel reads, so a renamed prop cannot leave a
// stale descriptor behind. A committed descriptor file would be `icon-inventory`'s
// hand-kept-list problem with more surface.
//
// `leaf: true` IS THE WHOLE DIFFERENCE between one of these and a document
// authored in the editor, and it is what the renderer branches on: a leaf hands
// off to its implementation, a body is walked. The leaf floor is not a matter of
// effort — StoryAtlasRelationship lays out a graph, BarChart and RenderStrip
// scale off a derived max, and the five Ark UI wrappers carry
// state machines rather than markup. A node tree cannot express any of those
// without an expression language, and an expression language is a programming
// language. So the leaf vocabulary can shrink; it cannot reach zero, and the
// badge carries information precisely because of that.

import * as lib from '@khaos-machine/khaotik-ui/components/svelte'
import { SCHEMA_VERSION } from './document.js'
import { schemas, componentPaths } from './props-schema.js'

/** The implementations a descriptor can claim. A list, not a boolean: a second
 *  target appends rather than forcing a schema change on every document. */
export const SVELTE = 'svelte'

/**
 * @typedef {Object} Descriptor
 * @property {number} schema
 * @property {'component'} kind
 * @property {string} slug PascalCase — the barrel export name.
 * @property {string} name
 * @property {Array<object>} inputs Derived from the JSDoc `Props` typedef.
 * @property {true} leaf No body; an implementation renders it.
 * @property {string[]} implementations Drives the badge.
 * @property {string} source Repo-relative path, for the source panel.
 */

const descriptorFor = (name) => ({
  schema: SCHEMA_VERSION,
  kind: 'component',
  slug: name,
  name,
  inputs: (schemas[name] ?? []).map((prop) => ({
    name: prop.name,
    type: prop.type,
    control: prop.control,
    description: prop.description,
    ...(prop.default === undefined ? {} : { default: prop.default }),
  })),
  leaf: true,
  implementations: [SVELTE],
  source: componentPaths[name],
})

/**
 * Components a consumer imports from `story-atlas.js` rather than the barrel, on purpose: they
 * load Pixi, which a barrel import would pull into a consumer's first chunk (catalog app-coverage
 * plan, choice 7). They are in the catalog, with fixtures, but not in the composer's palette.
 */
export const DEEP_ONLY = ['StoryAtlas', 'StoryAtlasCanvas']

/**
 * `{ MetricCard: Descriptor }` — one per BARREL EXPORT, not per file.
 *
 * Keyed off the barrel rather than the glob so a component that exists but is
 * not exported cannot appear in the palette: the catalog must offer what
 * consumers can actually import. `descriptors.test.js` asserts every component
 * file is either a barrel export or in DEEP_ONLY, and nothing else.
 */
export const descriptors = Object.fromEntries(
  Object.keys(lib).map((name) => [name, descriptorFor(name)]),
)

/** The Svelte component behind a descriptor. The only place the barrel is read for rendering. */
export const implementationOf = (name) => lib[name]

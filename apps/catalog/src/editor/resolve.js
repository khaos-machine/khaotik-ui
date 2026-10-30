// Resolving a slug, in the catalog.
//
// The RULE lives in the library — `lib/compose.js` owns what `@Name` versus
// `@kebab-name` means, because a consuming app resolves slugs too and two copies
// of that rule would be the drift `tokens/parse.js` exists to prevent. What is
// catalog-specific is only WHAT IT RESOLVES AGAINST: the barrel, and the
// descriptor the props panel needs, neither of which the library can supply to
// itself.
//
// The namespace itself is documented there. In short: PascalCase is a published
// export, kebab-case is an authored document, and the first character decides
// which — so the two halves of one flat namespace cannot collide, and publishing
// never has to rewrite a reference.

import * as lib from '@khaos-machine/khaotik-ui/components/svelte'
import {
  resolveComponent as resolveAgainst,
  isSlug,
  bareSlug,
  isLibrarySlug,
  slugsIn,
} from '@khaos-machine/khaotik-ui/components/svelte/lib/compose.js'
import { descriptors } from './descriptors.js'

export { isSlug, bareSlug, isLibrarySlug, slugsIn }

/**
 * `@slug` -> what it names, plus the descriptor when it is a published one.
 *
 * Returns `{ missing }` rather than throwing — the contract `resolveFlowSteps`
 * already sets in this repo. A renamed component surfaces as a named gap the
 * author can act on, not as an empty box that reads as a layout bug.
 *
 * @param {string} slug
 * @param {Map<string, object>} [composed] Authored documents, by bare slug.
 */
export function resolveComponent(slug, composed = new Map()) {
  const found = resolveAgainst(slug, { components: lib, documents: composed })
  if (found.kind !== 'library') return found
  // The descriptor is the catalog's own addition: the props panel is generated
  // from it, and the library has no reason to carry one.
  return { ...found, descriptor: descriptors[bareSlug(slug)] ?? null }
}

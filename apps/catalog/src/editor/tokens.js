// The dimension vocabulary the editor offers, read back out of the generated
// stylesheet rather than restated here.
//
// This is `tokens/parse.js`'s whole argument applied to a third surface: the
// BrandKit screens read `tokens.css` so the documentation and the screen cannot
// disagree, and the editor reads it so the PICKER and the screen cannot either.
// A hardcoded `['2xs','xs','sm',…]` would be a fourth copy of the scale, and the
// scar this repo carries is that the third copy drifted and shipped a crash.
//
// A DOCUMENT STORES A NAME, NEVER A LENGTH. That is what makes it portable —
// each target substitutes its own scale — and it is also what makes a later
// change to the scale reach every document already written, with no migration.

import { spacing, radius } from '@khaos-machine/khaotik-ui/tokens/parse.js'

/** `spacing-lg` -> `lg`. */
const suffix = (prefix) => (entry) => entry.name.slice(prefix.length)

/** `['2xs','xs','sm','md','lg','xl','2xl']`, in the scale's own order. */
export const SPACE_TOKENS = spacing.map(suffix('spacing-'))

/** `['sm','md','lg','full']`. */
export const RADIUS_TOKENS = radius.map(suffix('radius-'))

/** `lg` -> `var(--spacing-lg)`. The one place a token name becomes CSS. */
export const spaceVar = (name) => (name ? `var(--spacing-${name})` : null)

/** The px a token resolves to today — shown beside a name in the picker, never stored. */
export const SPACE_VALUES = Object.fromEntries(
  spacing.map((entry) => [entry.name.slice('spacing-'.length), entry.resolved ?? entry.value]),
)

// THE BRANDKIT DECLARES NO GRID. `Layout.svelte` states it directly — "there is
// no column, gutter or container" — and no baseline grid either, and it records
// why the catalog must not fill that in: "a grid is a BrandKit decision rather
// than a catalog one". Drawing a plausible one would assert a system nobody
// decided.
//
// So the grid node offers a COLUMN COUNT and a GAP TOKEN, which are real and
// inheritable, and offers no container width, no gutter and no baseline snap.
// The layout panel states this in words where those controls would otherwise be:
// an absent grid and a grid nobody thought to show must not look identical.
//
// If a column system is decided later it is a `tokens.json` change, and the
// editor inherits it with no document migration — because a document stores a
// column COUNT and a token NAME, never a resolved width.
export const GRID_IS_UNDECLARED =
  'The BrandKit declares no column, gutter or container system, and no baseline rhythm. Columns and gap are what the kit can honestly offer here.'

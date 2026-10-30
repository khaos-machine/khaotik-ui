import { describe, it, expect } from 'vitest'
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import utilities from '@khaos-machine/khaotik-ui/tokens/utilities.css?raw'
import composeCss from '@khaos-machine/khaotik-ui/components/svelte/lib/compose.css?raw'
import { byTheme, utilities as roster } from '@khaos-machine/khaotik-ui/tokens/parse.js'

// A SOURCE-READ test, deliberately — the same shape as shell-type.test.js.
//
// jsdom resolves no stylesheets, so a rendered assertion ("the eyebrow is
// uppercase") passes whether or not the rule exists anywhere. That is exactly
// how this defect survived: .eyebrow and .surface were defined only in the
// catalog's app.css, which the package does not export, while five library
// components render those classes. The catalog looked right and the then-published
// Storybook — the shared artifact — rendered every eyebrow as plain body text.
//
// So the assertion has to be about what SHIPS, not about what renders here.

const LIB = join(import.meta.dirname, '../../..')
const COMPONENTS = join(LIB, 'components/svelte')

const CLASS_RE = /class="([^"]*)"/g

// every class name the `.svelte` files in `dir` emit.
//
// Parameterised rather than pinned to COMPONENTS so the guard below can be
// pointed at a fixture directory and shown to fail. Pinned, the only way to red
// it was to break the shipped kit, which is not a test — it is a hope.
function emittedClasses(dir) {
  const found = new Set()
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.svelte'))) {
    const src = readFileSync(join(dir, file), 'utf8')
    for (const [, value] of src.matchAll(CLASS_RE)) {
      for (const name of value.split(/\s+/).filter(Boolean)) {
        // A token carrying an interpolation is not a class name — it is a
        // template. `class="node node--{layout}"` emits `node` plus one of a set
        // this scan cannot enumerate, and demanding the kit define a rule for the
        // literal string `node--{layout}` would be asking for a class nothing
        // renders. The `node` half is still checked, which is the part that is
        // actually a name.
        if (!name.includes('{')) found.add(name)
      }
    }
  }
  return found
}

// The discriminator, measured rather than guessed. A component-local block name
// in this kit's BEM-ish scheme has `__` descendants somewhere in the kit; a
// shared utility does not. Over components/svelte today: 366 distinct classes,
// 41 with no `__`, 37 of those having a `block__…` sibling — leaving 4 orphans.
//
// The previous filter was `!c.includes('__') && !c.includes('-')`, which hid
// every hyphenated name, so `visually-hidden` would have been invisible to this
// guard by name from the day it landed.
function orphansIn(emitted) {
  const all = [...emitted]
  return all
    .filter((name) => !name.includes('__'))
    .filter((name) => !all.some((other) => other.startsWith(`${name}__`)))
}

// The kit ships TWO stylesheets now. `utilities.css` carries the token-level
// classes the atoms render; `lib/compose.css` carries the layout a composed
// document describes, and it exists as a sheet for the same reason — two
// renderers emit those classes (the library's `Composed` and the catalog's
// editor), so scoped styles would give each its own copy of what `gap` means.
//
// The rule this case enforces is unchanged: a bare class a kit component renders
// must have a rule THE KIT SHIPS. Only the set of sheets it may be shipped in
// has grown, which is why the negative control below still goes red.
const kitSheets = utilities + composeCss

const undefinedByKit = (names) =>
  names.filter((name) => !new RegExp(`\\.${name}\\s*[,{]`).test(kitSheets))

describe('tokens/utilities.css', () => {
  it('defines the utility classes the library components render', () => {
    for (const name of ['eyebrow', 'surface']) {
      expect(utilities, `.${name} must ship with the kit`).toMatch(
        new RegExp(`\\.${name}\\s*\\{`),
      )
    }
  })

  it('is reachable through the package exports', () => {
    const exports = JSON.parse(readFileSync(join(LIB, 'package.json'), 'utf8')).exports
    expect(exports['./tokens/*']).toBe('./tokens/*')
  })

  // There were two surfaces to check — Storybook's preview and the catalog's
  // entry — and D61 retired Storybook, so the catalog is the only one left. The
  // assertion is kept rather than dropped with the second surface: it is what
  // catches the entry losing the import, which is the defect the whole file is
  // about, and it now covers 1 of 1 surfaces rather than 2 of 2.
  it('is imported by every surface that renders the components', () => {
    const main = readFileSync(join(import.meta.dirname, 'main.js'), 'utf8')
    expect(main).toMatch(/tokens\/utilities\.css/)
  })

  it('no longer leaves the utilities in the catalog app layer', () => {
    const appCss = readFileSync(join(import.meta.dirname, 'app.css'), 'utf8')
    expect(appCss).not.toMatch(/^\.eyebrow\s*\{/m)
    expect(appCss).not.toMatch(/^\.surface\s*\{/m)
  })

  // The guard that generalises: if a component starts rendering a bare utility
  // class the kit does not define, this fails rather than shipping unstyled.
  //
  // It could not fail before. It filtered out every hyphenated class, and it
  // computed the offender list and then asserted only `not.toContain('eyebrow')`
  // / `not.toContain('surface')` — nothing ever looked at the rest of it.
  //
  // A two-name allowlist, asserted with toEqual so it cannot silently grow. It
  // fails in both directions WITHIN ITS OWN REMIT — which is classes the kit's
  // components emit: a bare class rendered with no rule anywhere becomes a
  // third orphan, and if `pill` ever gains a `pill__x` descendant it stops
  // being an orphan and the stale entry goes red.
  //
  // It does NOT catch a utility dropped from the sheet unless a component still
  // emits it. `.visually-hidden` is only rendered by MetaStrip, and `.note` by
  // nothing in the kit at all, so deleting either would leave this case green.
  // That direction is carried by the roster case at :140-144, which is
  // deliberately a hardcoded list for exactly this reason.
  //
  // A zero-allowlist variant — "every emitted class is styled in utilities.css
  // or in its own component's <style>" — was measured and does NOT work: 25
  // false positives, because classes are legitimately styled through `:global()`,
  // nested selectors, or a parent component. Recorded so it is not re-proposed.
  //
  // Known limitation, stated rather than claimed closed: CLASS_RE reads literal
  // `class="…"` only. The nine `class:` directives already in the kit, and any
  // `class={expr}`, are invisible to it — as is the interpolated half of a
  // partially literal attribute (see emittedClasses).
  it('leaves no bare utility class undefined by the kit', () => {
    const orphans = orphansIn(emittedClasses(COMPONENTS))

    // `pill`, `labeled-pill` and `pmark` are component-local blocks that happen
    // to have no `__` descendant — not utilities. Everything else must ship a
    // rule. `pmark` joins them in #179: ProviderMark renders exactly one
    // element, so its block class can never acquire a descendant and will always
    // look like a utility to this scan. `ui-button` joins for the same reason in
    // #237: Button is one <button>, and its label is the host's snippet.
    expect(undefinedByKit(orphans).sort()).toEqual(['labeled-pill', 'pill', 'pmark', 'ui-button'])
  })

  // The red the case above cannot produce on its own: point the same machinery
  // at a component that renders a bare class with no rule anywhere, and it must
  // surface as an orphan. Permanent, and independent of the sheet's contents.
  it('surfaces a bare class the kit does not define', () => {
    const dir = mkdtempSync(join(tmpdir(), 'khaotik-utilities-'))
    writeFileSync(join(dir, 'Fixture.svelte'), '<span class="not-a-real-utility">x</span>\n')

    const orphans = orphansIn(emittedClasses(dir))
    expect(orphans).toContain('not-a-real-utility')
    expect(undefinedByKit(orphans)).toContain('not-a-real-utility')
  })

  // ---- the roster -----------------------------------------------------------

  // Literal on purpose, and this is the ONLY place a hardcoded list is correct.
  // The roster is parsed out of utilities.css, so a roster-derived assertion
  // cannot prove the sheet GAINED a class — it would be true by construction.
  it('ships every utility the roster is meant to carry', () => {
    expect(roster.map((u) => u.name)).toEqual(
      expect.arrayContaining(['eyebrow', 'surface', 'note', 'visually-hidden', 'ui-range']),
    )
  })

  it('gives every roster entry a declared kind, prose and declarations', () => {
    for (const utility of roster) {
      expect(['sample', 'demo'], `.${utility.name} @kind`).toContain(utility.kind)
      expect(utility.doc, `.${utility.name} prose`).toBeTruthy()
      // The rule's OWN comment, not everything above it. The first rule sits
      // under the sheet's header comment, and a lazy comment capture will
      // happily span both — which reads as a working parse and puts twenty
      // lines of file preamble on the screen as the class's explanation.
      expect(utility.doc, `.${utility.name} prose spans two comments`).not.toContain('*/')
      expect(utility.doc, `.${utility.name} prose keeps the annotation`).not.toContain('@kind')
      expect(utility.declarations.length, `.${utility.name} declarations`).toBeGreaterThan(0)
    }
  })

  // ---- the third enforced consumer: the docs -------------------------------
  //
  // One roster, three consumers that must all carry it — the sheet, the Type
  // screen, and this table. `.eyebrow` shipped in khaos-app's bundle under a
  // comment saying it is not optional polish, and was reinvented six times in
  // that same app anyway. A utility with no discovery surface repeats that.
  it('names every roster class in the library docs', () => {
    const doc = readFileSync(join(LIB, 'docs/using-the-library.md'), 'utf8')
    for (const utility of roster) {
      expect(doc, `.${utility.name} must appear in the utilities table`).toMatch(
        new RegExp(`^\\|\\s*\`\\.${utility.name}\`\\s*\\|`, 'm'),
      )
    }
  })

  // ---- both themes ----------------------------------------------------------
  //
  // NOT "declared in both maps": parse.js builds `light` as base + dark + light,
  // so a superset, and "declared in both" degenerates to "declared at all".
  //
  // The predicate is scoped BY PROPERTY. Build the overridden set — token names
  // whose resolved value differs between the two themes — and require every
  // COLOUR-BEARING declaration in the roster to be a var() reference to a member
  // of it. Everything else is out of scope and is not asserted on at all:
  // `.eyebrow`'s four `--caption-*` refs are mode-invariant BY DESIGN (parse.js
  // says the scale tiers "are declared once and mean the same thing in both
  // modes"), and requiring them to flip requires the kit to be something it
  // deliberately is not.
  //
  // COLOUR_BEARING is a CLOSED ENUMERATION of colour-carrying properties, to be
  // extended when a utility needs one outside it. It lists the colour LONGHANDS
  // of border/outline rather than the `border*`/`outline*` prefixes: the prefix
  // form catches `border: 0`, `border-radius`, `border-width` and
  // `outline-offset`, none of which is a colour and none of which can flip — and
  // `border: 0` is in the canonical `.visually-hidden` recipe. The cost of the
  // longhand list is that a colour hidden inside a `border:` shorthand is not
  // seen; no utility writes one, and the shorthand can be added here if one does.
  // `background-image` is deliberately out: its ordinary value is a `url()`,
  // which is not a colour and would red on correct input.
  const COLOUR_BEARING = new Set([
    'color',
    'background',
    'background-color',
    'border-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'border-block-color',
    'border-block-start-color',
    'border-block-end-color',
    'border-inline-color',
    'border-inline-start-color',
    'border-inline-end-color',
    'outline-color',
    'column-rule-color',
    'text-decoration-color',
    'text-emphasis-color',
    'caret-color',
    'accent-color',
    'scrollbar-color',
    '-webkit-text-fill-color',
    'fill',
    'stroke',
    'box-shadow',
    'text-shadow',
  ])

  const overridden = new Set(
    byTheme.dark.all
      .filter(({ name, resolved }) => {
        const light = byTheme.light.all.find((entry) => entry.name === name)
        return light !== undefined && light.resolved !== resolved
      })
      .map(({ name }) => name),
  )

  const REF = /^var\(\s*(--[a-z0-9-]+)\s*\)$/

  it('has a light block that genuinely overrides the dark one', () => {
    // reach probe: without this the predicate below is vacuous in the direction
    // that matters — an empty overridden set reds every colour declaration, and
    // a set that silently stopped being computed would red nothing if inverted.
    expect(overridden.size).toBeGreaterThan(20)
    expect(overridden.has('text-secondary')).toBe(true)
    expect(overridden.has('warm-500')).toBe(false)
  })

  it('paints every roster colour from a token that flips between themes', () => {
    const offenders = []
    for (const utility of roster) {
      for (const { prop, value } of utility.declarations) {
        if (!COLOUR_BEARING.has(prop)) continue
        // No colour at all, so nothing to flip: what shows is whatever is behind.
        if (value === 'transparent') continue
        const ref = REF.exec(value)
        if (ref === null) {
          offenders.push(`.${utility.name} { ${prop}: ${value} } — not a token reference`)
        } else if (!overridden.has(ref[1].slice(2))) {
          offenders.push(`.${utility.name} { ${prop}: ${value} } — resolves identically in both themes`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})

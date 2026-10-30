import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import IconSheet from './IconSheet.svelte'
import { icons, callerSupplied } from '../../icon-inventory.js'

// The sheet had no test, which matters more than it usually would: it is now
// the ONLY catalog surface for `Icon`. The component's own fixture was removed
// in favour of a `plays: ['Icon']` declaration, so if this renders nothing,
// `check-catalog` still reports 46/46 and the glyph vocabulary is unreachable.
//
// This repo has the precedent — a relationship chart shipped a wrong empty state
// with a documented Storybook story and no test, because a plausible-looking
// render is not a checked one.

describe('IconSheet', () => {
  it('has a harvested vocabulary to render', () => {
    // Guards the guard: an empty inventory would make every assertion vacuous,
    // and the inventory is derived, so it CAN silently become empty.
    expect(icons.length).toBeGreaterThan(20)
  })

  it('renders every glyph the kit was harvested to have', () => {
    render(IconSheet)

    // One copy control per glyph, named by the glyph — the sheet exists to
    // answer "which icon do I want", so the names have to be reachable. One
    // role query, not one per glyph: each walks the whole sheet's accessibility
    // tree, and per glyph that outran the timeout on a hosted runner.
    const named = new Set(screen.getAllByRole('button', { name: /^Copy / }).map((b) => b.getAttribute('aria-label')))
    const missing = icons.map(({ name }) => name).filter((name) => !named.has(`Copy ${name}`))
    expect(missing, 'in the inventory but not on the sheet').toEqual([])
  })

  it('invents no glyph — every name on the sheet resolves in Phosphor', () => {
    // The sheet has TWO bands: the kit's own harvested vocabulary and the
    // glyphs a surface passes in (the catalog's rail and fixtures). So it
    // legitimately renders more than `icons` — what it must never do is show a
    // name that renders nothing, which is precisely the failure a hand-written
    // list produces and this module exists to avoid.
    const phosphor = readFileSync(
      join(import.meta.dirname, '../../../../../node_modules/@phosphor-icons/web/src/regular/style.css'),
      'utf8',
    )

    render(IconSheet)
    const shown = screen
      .getAllByRole('button', { name: /^Copy / })
      .map((b) => b.getAttribute('aria-label').replace('Copy ', ''))

    expect(shown.length).toBeGreaterThanOrEqual(icons.length)

    const unresolvable = shown.filter((n) => !phosphor.includes(`.ph.ph-${n}:before`))
    expect(unresolvable, 'these render a blank tile').toEqual([])
  })

  it('names the components whose glyph the caller chooses', () => {
    render(IconSheet)

    // The sheet's honesty clause: components taking an icon as a prop cannot
    // contribute glyphs, so the sheet says which they are rather than letting
    // its silence read as completeness.
    for (const component of callerSupplied) {
      expect(screen.getByText(new RegExp(component))).toBeInTheDocument()
    }
  })
})

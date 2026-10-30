import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/svelte'
import Color from './Color.svelte'

// Carried over from BrandKit.test.js when the screen split into four. Every
// case here covered the palette half of that screen and covers this one
// unchanged — the split moved the markup, not the claims. What is new is the
// last block: the two sections that LEFT must be gone from here, and the tests
// that they arrived on Type and Shape are in those files.
describe('Color screen', () => {
  // the view reads the live theme off the document, so a test that sets it has
  // to put it back — otherwise the next test inherits a light document
  afterEach(() => {
    delete document.documentElement.dataset.theme
  })

  it('renders the header and every section heading', () => {
    render(Color)
    expect(screen.getByRole('region', { name: /Khaotik Color/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Primitive colours' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Semantic tokens' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Status tones' })).toBeInTheDocument()
  })

  it('renders every colour family in order', () => {
    const { container } = render(Color)
    const names = [...container.querySelectorAll('.family__name')].map((el) => el.textContent)
    expect(names).toEqual(['blue', 'gold', 'green', 'orange', 'red', 'violet', 'warm'])
  })

  it('paints plain-hex swatches', () => {
    const { container } = render(Color)
    const chips = [...container.querySelectorAll('.swatch__chip')]
    const warm950 = chips.find((chip) => chip.closest('button').ariaLabel.includes('--warm-950'))
    expect(warm950.style.backgroundColor).toBe('rgb(23, 22, 21)') // #171615
  })

  // A semantic token's value is a `var(--primitive)` reference, so a chip
  // painted from the literal is neutral and the row shows no colour at all.
  // These go red against that: the chip paints the colour the reference
  // resolves to, beside the name it belongs to.

  const rowNamed = (container, name) =>
    [...container.querySelectorAll('.token-row')].find((row) =>
      row.ariaLabel.startsWith(`Copy --${name}:`),
    )

  const rowChip = (container, name) =>
    rowNamed(container, name).querySelector('.token-row__chip')

  it('paints every semantic, status and compat row from its resolved colour', () => {
    const { container } = render(Color)
    const rowChips = [...container.querySelectorAll('.token-row__chip')]
    expect(rowChips.length).toBe(15 + 18 + 16) // semantic + status + st-*
    // reach probe: not one row is left on the neutral fallback
    for (const chip of rowChips) {
      expect(chip.style.backgroundColor).not.toBe('')
    }
    // and the paint is the referenced colour, not an arbitrary one
    expect(rowChip(container, 'surface-base').style.backgroundColor).toBe('rgb(23, 22, 21)') // #171615
    expect(rowChip(container, 'text-brand').style.backgroundColor).toBe('rgb(255, 204, 0)') // #ffcc00
    // two hops: st-normal-fg -> status-normal-fg -> green-450
    expect(rowChip(container, 'st-normal-fg').style.backgroundColor).toBe('rgb(62, 207, 142)') // #3ecf8e
  })

  it('places the swatch against the reference it paints, not against the name', () => {
    const { container } = render(Color)
    // --surface-base has no colour of its own; var(--warm-950) carries it.
    // The chip sits beside the reference, so the row reads role -> colour.
    const order = (name) =>
      [...rowNamed(container, name).children].map((el) =>
        [...el.classList].find((c) => c.startsWith('token-row__')),
      )
    expect(order('surface-base')).toEqual([
      'token-row__name',
      'token-row__chip',
      'token-row__value',
    ])
    expect(order('st-normal-fg')).toEqual(order('surface-base'))
  })

  // ---- the theme axis --------------------------------------------------------
  //
  // The semantic layer is declared twice and the shell switches between them
  // (App.svelte:57-59 writes data-theme onto <html>). A view pinned to one
  // surface shows the wrong reference and the wrong colour in the other.
  //
  // The reader now lives in lib/brand-view.svelte.js, shared by all four
  // screens, so these also cover the shared module's first-paint read: it is
  // initialised at import and re-read at each screen's init, because a
  // MutationObserver callback is a microtask and would miss a synchronous
  // render into an already-light document.

  const rowValue = (container, name) =>
    rowNamed(container, name).querySelector('.token-row__value').textContent.trim()

  it('reads the light surface when the document is in light mode', () => {
    document.documentElement.dataset.theme = 'light'
    const { container } = render(Color)
    expect(rowValue(container, 'surface-base')).toBe('var(--warm-100)')
    expect(rowChip(container, 'surface-base').style.backgroundColor).toBe('rgb(233, 232, 230)')
    expect(rowValue(container, 'text-brand')).toBe('var(--gold-750)')
    // the alias the light block never redeclares still flips, through
    // --status-normal-fg: green-850, not the dark green-450
    expect(rowChip(container, 'st-normal-fg').style.backgroundColor).toBe('rgb(3, 98, 60)')
    // control: action/* is gold in both modes, so this row must NOT move
    expect(rowValue(container, 'action-primary')).toBe('var(--gold-400)')
  })

  it('follows a theme change made after it rendered', async () => {
    document.documentElement.dataset.theme = 'dark'
    const { container } = render(Color)
    expect(rowChip(container, 'surface-base').style.backgroundColor).toBe('rgb(23, 22, 21)')

    document.documentElement.dataset.theme = 'light'
    await waitFor(() =>
      expect(rowChip(container, 'surface-base').style.backgroundColor).toBe('rgb(233, 232, 230)'),
    )
    expect(rowValue(container, 'surface-base')).toBe('var(--warm-100)')

    // and back — the observer is not a one-shot
    document.documentElement.dataset.theme = 'dark'
    await waitFor(() =>
      expect(rowChip(container, 'surface-base').style.backgroundColor).toBe('rgb(23, 22, 21)'),
    )
  })

  it('keeps the row copying the declared reference, not the resolved hex', () => {
    const { container } = render(Color)
    // the swatch is a reading aid; --surface-base *is* var(--warm-950), and
    // the value text and copy payload still say so
    const row = rowNamed(container, 'surface-base')
    expect(row.ariaLabel).toBe('Copy --surface-base: var(--warm-950)')
    expect(row.querySelector('.token-row__value').textContent.trim()).toBe('var(--warm-950)')
  })

  // ---- the shared step axis -------------------------------------------------
  //
  // These are the cases the wrapped-ladder layout failed: it had no ruler, no
  // column placement, and no run edges, so all four go red against it.

  const swatchByName = (container, name) =>
    [...container.querySelectorAll('.swatch')].find((el) => el.ariaLabel.startsWith(`Copy --${name}:`))

  it('rules the axis with every step any family declares, ascending', () => {
    const { container } = render(Color)
    const steps = [...container.querySelectorAll('.ruler')].map((el) => Number(el.textContent))
    expect(steps).toEqual([
      // 350 arrives with #75's third text step — the warm ramp had no rung
      // between 300 and 400, a 21.7 L* gap, which is why the step needed a new
      // primitive rather than an existing one. The half-step name is an interim
      // Andrew accepted, not a precedent; #182 tracks the palette-wide fix.
      50, 100, 150, 200, 250, 300, 350, 400, 450,
      500, 550, 600, 650, 700, 750, 800, 850, 900, 950,
    ])
    // the axis is the union, not any one family: no family carries all 19
    expect(container.querySelectorAll('.swatch').length).toBe(49)
  })

  it('places the same step in the same column across every family', () => {
    const { container } = render(Color)
    const columnOf = (name) => swatchByName(container, name).style.gridColumn
    // 500 is axis index 9 → column 11 (1-based, offset by the label column).
    // It was index 8 until #75 inserted 350 ahead of it.
    expect(columnOf('blue-500')).toBe('11')
    for (const name of ['gold-500', 'warm-500', 'violet-500']) {
      expect(columnOf(name)).toBe(columnOf('blue-500'))
    }
    // and a step nobody shares still lands on its own axis position
    expect(columnOf('warm-50')).toBe('2') // index 0, unmoved by the insert
    expect(columnOf('green-950')).toBe('20') // index 18
  })

  it('marks run edges against the shared axis, not against ±50', () => {
    const { container } = render(Color)
    const edges = (name) => {
      const el = swatchByName(container, name)
      return [el.classList.contains('is-start'), el.classList.contains('is-end')]
    }
    // control — the flags are not simply always on. warm-100 sits between
    // warm-50 and warm-150, both present: interior, neither edge.
    expect(edges('warm-100')).toEqual([false, false])
    // warm-200's axis neighbour 250 is red's, which warm lacks
    expect(edges('warm-200')).toEqual([false, true])
    // warm-500 WAS a run of one — it had neither 450 nor 550. #75 gave warm its
    // own 450, so the run now starts there and 500 is no longer an edge on that
    // side. 550 is still nobody-in-warm's, so it stays an end.
    expect(edges('warm-500')).toEqual([false, true])
    // the new rungs themselves: 350 sits between warm's 300 and 400, interior on
    // both sides, which is the whole reason it was the right place to put it.
    expect(edges('warm-350')).toEqual([false, false])
    // 450 opens a run: 400 is warm's, so not a start... and 500 is warm's too.
    expect(edges('warm-450')).toEqual([false, false])
    // the ramp's first step: no step before 50 on the shared axis
    expect(edges('warm-50')).toEqual([true, false])
    // green-50's axis neighbour is 100 (warm's), which green lacks — a run of one
    expect(edges('green-50')).toEqual([true, true])
  })

  it('keeps the token name and the hex on every swatch', () => {
    const { container } = render(Color)
    const swatch = swatchByName(container, 'warm-950')
    expect(swatch.querySelector('.swatch__name').textContent).toBe('--warm-950')
    expect(swatch.querySelector('.swatch__value').textContent.trim()).toBe('#171615')
  })

  it('renders the legacy st-* compat group', () => {
    render(Color)
    expect(screen.getByText('legacy st-*')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy --st-failed-fg: var(--red-250)' })).toBeInTheDocument()
  })

  // ---- what the split moved out ---------------------------------------------
  //
  // The silence half of the pair. Radius and the type scale shared this screen
  // until the split; asserting they are gone is only half a claim, and the
  // other half — that they arrived — is in Shape.test.js and Type.test.js. One
  // without the other is satisfied by a screen that simply dropped them.
  it('no longer carries the shape or type sections', () => {
    const { container } = render(Color)
    expect(screen.queryByRole('heading', { name: 'Radius' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Type scale' })).not.toBeInTheDocument()
    expect(container.querySelectorAll('.radius__box').length).toBe(0)
    expect(container.querySelectorAll('.type-row').length).toBe(0)
  })
})

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte'
import Tokens from './Tokens.svelte'
import Color from './Color.svelte'
import Type from './Type.svelte'
import Shape from './Shape.svelte'
import Layout from './Layout.svelte'
import { byTheme } from '@khaos-machine/khaotik-ui/tokens/parse.js'

describe('Tokens screen', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme
  })

  const declared = byTheme.dark.all.map((t) => t.name)

  const rows = (container) => [...container.querySelectorAll('.index__row')]
  const rowNames = (container) =>
    rows(container).map((el) => el.querySelector('.index__name').textContent.replace('--', ''))

  // The origin is stated once, on this screen. It used to be hard-coded into
  // BrandScreen's header, so all five screens printed it and none of them was
  // describing itself; this asserts the single home rather than the repetition.
  it('names the kit origin', () => {
    render(Tokens)
    expect(screen.getByText('khaos-studio/khaotik-3 · tokens.json → tokens.css')).toBeInTheDocument()
  })

  it('renders the header and the index', () => {
    render(Tokens)
    expect(screen.getByRole('region', { name: /Khaotik Tokens/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Every declaration' })).toBeInTheDocument()
  })

  // The count is pinned because it is a claim about the vendored kit, and the
  // kit is generated (D44) — it moves when Andrew's build emits a new token,
  // which is exactly when someone should look at this screen. It is not a
  // number kept by hand: `byTheme.dark.all` is compared against it, so a drift
  // between the parse and the render fails here and not in production.
  it('renders every declaration on the active surface, in declaration order', () => {
    const { container } = render(Tokens)
    // 153 since #75: Andrew's ruling emitted --warm-350 and --warm-450. The
    // comment above says this number moves when the build emits a new token,
    // and that this is exactly when someone should look at the screen.
    expect(declared.length).toBe(153)
    expect(rowNames(container)).toEqual(declared)
  })

  // The whole reason this screen exists. These six are parsed and reach no
  // category: --hairline, --quiet-fill, --scrim and --illustration-ink match no
  // predicate in tokens/parse.js, and st-provis-* is excluded from statusCompat
  // by contract. The pair is the point — the reach probe here, the silence case
  // in the next test. Either one alone is satisfied by a screen that renders
  // nothing at all.
  const ORPHANS = [
    'hairline', 'illustration-ink', 'quiet-fill', 'scrim', 'st-provis-bg', 'st-provis-fg',
  ]

  it('shows the declarations no category reaches', () => {
    const { container } = render(Tokens)
    const rendered = new Set(rowNames(container))
    for (const name of ORPHANS) {
      expect(rendered.has(name), `--${name} missing from the index`).toBe(true)
    }
  })

  // Names as the screens actually publish them: every copy control carries
  // `Copy --<name>: <value>`, except Type's scale rows, which copy the four
  // declarations of one style together and say so.
  const publishedNames = (container) => {
    const out = new Set()
    for (const el of container.querySelectorAll('[aria-label^="Copy --"]')) {
      const label = el.getAttribute('aria-label')
      const name = /^Copy --([a-z0-9-]+)/.exec(label)[1]
      if (label.endsWith('type declarations')) {
        for (const part of ['size', 'line', 'weight', 'track']) out.add(`${name}-${part}`)
      } else {
        out.add(name)
      }
    }
    return out
  }

  it('is the only screen that reaches them, and closes the gap the others leave', () => {
    // Four publishers now, not three: the spacing scale moved to Layout when
    // Shape was narrowed to the measures of a single element. The union is what
    // this gate is about, so a token moving between screens must not change it
    // — and this assertion is exactly what would have caught it going missing.
    const three = new Set([
      ...publishedNames(render(Color).container),
      ...publishedNames(render(Type).container),
      ...publishedNames(render(Shape).container),
      ...publishedNames(render(Layout).container),
    ])

    // measured, not assumed: exactly these six are missing from Color+Type+Shape
    expect(declared.filter((name) => !three.has(name)).sort()).toEqual(ORPHANS)
    // and nothing is published that the kit does not declare
    expect([...three].filter((name) => !declared.includes(name))).toEqual([])

    // the fourth screen closes it exactly — no more, no less
    const four = new Set([...three, ...publishedNames(render(Tokens).container)])
    expect([...four].sort()).toEqual([...declared].sort())
  })

  it('follows the theme, like the surface it indexes', async () => {
    document.documentElement.dataset.theme = 'light'
    const { container } = render(Tokens)
    const valueOf = (name) =>
      rows(container)
        .find((el) => el.ariaLabel.startsWith(`Copy --${name}:`))
        .querySelector('.index__value')
        .textContent.trim()

    expect(valueOf('surface-base')).toBe('var(--warm-100)')
    // control: action/* is gold in both modes, so this row must not move
    expect(valueOf('action-primary')).toBe('var(--gold-400)')

    document.documentElement.dataset.theme = 'dark'
    await waitFor(() => expect(valueOf('surface-base')).toBe('var(--warm-950)'))
  })

  it('shows the resolved colour only where following the chain says something new', () => {
    const { container } = render(Tokens)
    const resolvedOf = (name) =>
      rows(container)
        .find((el) => el.ariaLabel.startsWith(`Copy --${name}:`))
        .querySelector('.index__resolved')
        .textContent.trim()

    expect(resolvedOf('surface-base')).toBe('#171615') // var(--warm-950), followed
    // a literal resolves to itself; repeating it would make every primitive row
    // claim a reference it never had
    expect(resolvedOf('warm-950')).toBe('')
    expect(resolvedOf('radius-sm')).toBe('')
  })

  it('filters on the name, the reference and the resolved hex alike', async () => {
    const { container } = render(Tokens)
    const filter = screen.getByRole('searchbox')

    await fireEvent.input(filter, { target: { value: 'radius' } })
    expect(rowNames(container)).toEqual(['radius-sm', 'radius-md', 'radius-lg', 'radius-full'])

    // a reference: rows that POINT at gold-400, not the rung itself
    await fireEvent.input(filter, { target: { value: 'var(--gold-400)' } })
    expect(rowNames(container)).toEqual(['text-brand', 'action-primary', 'action-primary-border', 'border-focus', 'status-accent-fg'])

    // a hex only the resolver can reach — no row's declared value contains it
    await fireEvent.input(filter, { target: { value: '#ffcc00' } })
    expect(rowNames(container)).toContain('gold-400')
    expect(rowNames(container)).toContain('action-primary')
  })

  it('states an empty result instead of rendering an empty list', async () => {
    const { container } = render(Tokens)
    await fireEvent.input(screen.getByRole('searchbox'), { target: { value: 'nothing-here' } })
    expect(rows(container).length).toBe(0)
    expect(screen.getByText(/Nothing in the kit matches/)).toBeInTheDocument()
  })

  it('accepts a starting filter, so a fixture can show the filtered state', async () => {
    const { container, rerender } = render(Tokens, { props: { query: 'status' } })
    const names = rowNames(container)
    expect(names.length).toBeGreaterThan(0)
    expect(names.length).toBeLessThan(declared.length)
    for (const name of names) {
      // matched on the name or on the reference — st-normal-fg is here because
      // it points at --status-normal-fg, which is the index doing its job
      expect(name.includes('status') || name.startsWith('st-')).toBe(true)
    }

    // The catalog switches example states by changing props on a MOUNTED
    // component (Canvas.svelte:32-35 does not key on the example), so a seed
    // read once at init would leave the "Filtered" example showing the whole
    // index. This is the case that goes red against that.
    await rerender({ query: '' })
    expect(rowNames(container).length).toBe(declared.length)
  })

  it('labels each run of the index with the root it belongs to', () => {
    const { container } = render(Tokens)
    const labels = [...container.querySelectorAll('.index__root')].map((el) => el.textContent)
    expect(labels[0]).toBe('blue') // the first family the generated file declares
    expect(labels).toContain('spacing')
    expect(labels).toContain('status')
    // --hairline and --quiet-fill sit inside the st-* block (tokens.css:209-210),
    // so `st` opens twice. That is the file's shape, not an error to smooth over.
    expect(labels.filter((l) => l === 'st').length).toBe(2)
  })
})

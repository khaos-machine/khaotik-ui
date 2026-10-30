import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import MetaStrip from '@khaos-machine/khaotik-ui/components/svelte/MetaStrip.svelte'

// The inline metadata run (#56, D63). One prop, `items`, because five observed
// instances of the item shape needed nothing per-item beyond
// `{icon, label, text, numeric}` — and Player's apparent exception was never an
// item property, it was an un-named second run.
//
// Two of these cases are SOURCE-READS. jsdom resolves no stylesheets, so a
// rendered assertion cannot see a `font-variant-numeric` that is missing, a
// `min-width` that is missing, or a colour that drifted to `--text-tertiary`.
// The visual-contract case proper lives in `token-refs.test.js`, beside the
// file that already proves every `var()` names a shipped token.
const SOURCE = readFileSync(
  join(import.meta.dirname, '../../../../components/svelte/MetaStrip.svelte'),
  'utf8',
)

/** The declaration block of a single rule, comments stripped. */
const ruleBody = (selector) => {
  const css = (SOURCE.match(/<style>([\s\S]*)<\/style>/)?.[1] ?? '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
  const at = css.indexOf(selector)
  if (at === -1) return null
  const open = css.indexOf('{', at)
  const close = css.indexOf('}', open)
  if (open === -1 || close === -1) return null
  return css.slice(open + 1, close)
}

describe('MetaStrip', () => {
  it('renders every item text, in order', () => {
    const { container } = render(MetaStrip, {
      props: { items: [{ text: 'INT. KITCHEN' }, { text: 'MADISON' }] },
    })
    const texts = [...container.querySelectorAll('.meta-strip__item')].map((el) =>
      el.textContent.trim(),
    )
    expect(texts).toEqual(['INT. KITCHEN', 'MADISON'])
  })

  it('renders the Phosphor glyph only for the items that ask for one', () => {
    const { container } = render(MetaStrip, {
      props: { items: [{ text: 'INT. KITCHEN', icon: 'film-slate' }, { text: 'MADISON' }] },
    })
    const items = container.querySelectorAll('.meta-strip__item')
    expect(items[0].querySelector('i.ph.ph-film-slate')).toBeTruthy()
    expect(items[1].querySelector('i.ph')).toBeNull()
  })

  // The defect the atom exists to fix. `Icon.svelte:29` is `aria-hidden="true"`,
  // decorative by contract (`Icon.svelte:2-4`), so every hand-rolled
  // `<Icon/>{value}` announces a bare value with the icon carrying the whole
  // meaning. `label` says what the icon means, through `.visually-hidden`.
  it('announces the label the icon carries, visually hidden and not aria-hidden', () => {
    const { container } = render(MetaStrip, {
      props: { items: [{ text: 'INT. KITCHEN', icon: 'film-slate', label: 'Scene' }] },
    })
    const label = container.querySelector('.visually-hidden')
    expect(label).toBeTruthy()
    expect(label.textContent).toBe('Scene')
    expect(label.getAttribute('aria-hidden')).toBeNull()
    expect(screen.getByText('Scene')).toBeInTheDocument()
  })

  it('synthesises no label for an item that declares none', () => {
    const { container } = render(MetaStrip, {
      props: { items: [{ text: 'INT. KITCHEN', icon: 'film-slate' }] },
    })
    expect(container.querySelector('.visually-hidden')).toBeNull()
  })

  it('marks the numeric item so it can be styled, and renders the text unchanged', () => {
    const { container } = render(MetaStrip, {
      props: { items: [{ text: '0:44 / 2:52:54', label: 'Time', numeric: true }] },
    })
    const item = container.querySelector('.meta-strip__item--numeric')
    expect(item).toBeTruthy()
    expect(item.textContent).toContain('0:44 / 2:52:54')
  })

  // SOURCE-READ, and it must be the rule the numeric modifier SELECTS — that
  // the string occurs somewhere in the file proves nothing, since the header
  // comment names D57 and would satisfy a file-contains form on its own.
  it('gives the numeric modifier tabular figures (D57 has no token)', () => {
    expect(ruleBody('.meta-strip__item--numeric')).toMatch(
      /font-variant-numeric:\s*tabular-nums/,
    )
  })

  // SOURCE-READ. `min-width: 0` is in the decided contract: without it a long
  // value cannot shrink inside the flex item and pushes the run wide.
  it('lets an item shrink below its content width', () => {
    expect(ruleBody('.meta-strip__item')).toMatch(/min-width:\s*0/)
  })

  it('renders no run at all when there is nothing to show', () => {
    const { container } = render(MetaStrip, { props: { items: [] } })
    expect(container.querySelector('.meta-strip')).toBeNull()
  })

  // `items` carries an explicit default because it must: `props-optionality.test.js`
  // requires one of every prop in the kit, and `check-consumer.mjs` type-instantiates
  // every export with `{}`. The case above tests the value; this tests the default.
  it('takes an empty run as its default', () => {
    const { container } = render(MetaStrip, { props: {} })
    expect(container.querySelector('.meta-strip')).toBeNull()
  })
})

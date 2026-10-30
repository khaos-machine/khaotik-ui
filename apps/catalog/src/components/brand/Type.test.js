import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/svelte'
import Type from './Type.svelte'
import { fonts, type, utilities } from '@khaos-machine/khaotik-ui/tokens/parse.js'

describe('Type screen', () => {
  it('renders the header and both section headings', () => {
    render(Type)
    expect(screen.getByRole('region', { name: /Khaotik Type/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Font families' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Type scale' })).toBeInTheDocument()
  })

  // The type sections were the last two of five on the old single screen. This
  // is the reach half of Color.test.js's "no longer carries" case: it proves
  // there was something to move, not just something removed.
  // The engine re-serialises what it is handed: jsdom returns a font stack with
  // a space after every comma, and `letter-spacing: 0` as `0px`. Both are the
  // same declaration, so the comparison is made after the same normalisation —
  // asserting on the serialisation would pin a CSSOM detail and call it a
  // property of the kit.
  const canonical = (value) => String(value).replace(/,\s+/g, ',').replace(/^0$/, '0px')
  const same = (received, expected, label) =>
    expect(canonical(received), label).toBe(canonical(expected))

  it('renders every family the kit declares, and draws each in its own stack', () => {
    const { container } = render(Type)
    const rows = [...container.querySelectorAll('.font')]
    expect(rows.map((el) => el.querySelector('.font__name').textContent)).toEqual(
      fonts.map((f) => `--${f.name}`),
    )
    expect(rows.length).toBe(3) // display / sans / mono

    // A row that showed the stack as text but rendered the sample in the
    // inherited face would look right and prove nothing. The sample carries the
    // declared stack itself.
    for (const [i, row] of rows.entries()) {
      const sample = row.querySelector('.font__sample')
      same(sample.style.fontFamily, fonts[i].value, fonts[i].name)
      // the row's own text is the declaration verbatim, not the re-serialised form
      expect(row.querySelector('.font__stack').textContent.trim()).toBe(fonts[i].value)
    }
  })

  it('names the head of each stack beside the fallbacks', () => {
    const { container } = render(Type)
    const samples = [...container.querySelectorAll('.font__sample')].map((el) =>
      el.textContent.trim(),
    )
    // the quoted head, unquoted — "Sora" is what renders if it loaded, and the
    // rest of the stack is what renders if it did not
    expect(samples[0]).toBe('Sora — Khaotik 0123')
    expect(samples).toEqual([
      'Sora — Khaotik 0123',
      'Inter — Khaotik 0123',
      'JetBrains Mono — Khaotik 0123',
    ])
  })

  it('renders every scale at its declared size, line, weight and tracking', () => {
    const { container } = render(Type)
    const rows = [...container.querySelectorAll('.type-row')]
    expect(rows.length).toBe(8)
    expect(rows.map((el) => el.querySelector('.type-row__name').textContent)).toEqual(
      type.map((t) => t.name),
    )

    // every row, not just the first: a sample styled from one scale and
    // labelled with another is exactly the defect a spot check misses
    for (const [i, row] of rows.entries()) {
      const sample = row.querySelector('.type-row__sample')
      same(sample.style.fontSize, type[i].size, type[i].name)
      same(sample.style.lineHeight, type[i].line, type[i].name)
      same(sample.style.fontWeight, type[i].weight, type[i].name)
      same(sample.style.letterSpacing, type[i].track, type[i].name)
    }
    expect(screen.getByText('16px · 20px · 600 · -0.5px')).toBeInTheDocument()
  })

  // The tracking values are the reason this is worth asserting rather than
  // eyeballing: a unitless tracking is not a <length>, so `letter-spacing`
  // drops it silently and Chromium serialises the failure as `normal` —
  // indistinguishable from success. Andrew's kit declares units (`-0.5px`,
  // `0.06em`); this is the case that notices if that ever stops being true.
  it('declares tracking with units on every non-zero scale', () => {
    for (const scale of type) {
      if (scale.track === '0') continue
      expect(scale.track, scale.name).toMatch(/(px|em|rem)$/)
    }
    // reach probe: the guard above is not vacuous — two scales are non-zero
    expect(type.filter((s) => s.track !== '0').map((s) => s.name)).toEqual([
      'heading-md', 'label-sm', 'data-input',
    ])
  })

  it('copies a scale as one style, not as a loose value', () => {
    render(Type)
    // a type style is one thing on iOS and Android (tokens.css:147-148), so the
    // row hands back all four declarations together
    expect(screen.getByRole('button', { name: 'Copy --heading-md type declarations' }))
      .toBeInTheDocument()
  })

  it('carries no colour or shape sections', () => {
    const { container } = render(Type)
    expect(container.querySelectorAll('.swatch').length).toBe(0)
    expect(container.querySelectorAll('.radius__box').length).toBe(0)
  })

  // ---- the Utilities section -----------------------------------------------
  //
  // The discovery surface. `.eyebrow` already shipped in khaos-app's bundle,
  // imported under a comment saying it is not optional polish, and the pattern
  // was still reinvented six times in that same app. A utility nobody can find
  // is a utility that gets rewritten.

  const SOURCE = readFileSync(join(import.meta.dirname, 'Type.svelte'), 'utf8')

  it('renders a Utilities section heading', () => {
    render(Type)
    expect(screen.getByRole('heading', { name: 'Utilities' })).toBeInTheDocument()
  })

  // Source-read, deliberately. The screen must be DRIVEN by the parsed roster,
  // because a screen carrying its own list of class names is the second
  // declaration site parse.js exists to prevent ("there is exactly one").
  it('drives the section from the parsed roster and names no class of its own', () => {
    expect(SOURCE).toMatch(
      /import \{[^}]*\butilities\b[^}]*\} from '@khaos-machine\/khaotik-ui\/tokens\/parse\.js'/,
    )
    expect(SOURCE).toMatch(/\{#each utilities as /)
    for (const { name } of utilities) {
      expect(SOURCE, `.${name} must not be spelled out on the screen`).not.toMatch(
        new RegExp(`['"]${name}['"]`),
      )
    }
  })

  // Also source-read, and for the reason this whole area exists: jsdom resolves
  // no stylesheets, so a rendered assertion passes whether or not the specimen
  // actually carries the class it is demonstrating.
  it('puts each utility class on its own specimen, under its declared kind', () => {
    expect(SOURCE, 'the specimen carries the roster class itself').toMatch(
      /class=\{utility\.name\}/,
    )
    expect(SOURCE, 'sample entries get a rendered specimen').toContain("utility.kind === 'sample'")
    expect(SOURCE, 'demo entries show the class working instead').toContain(
      "utility.kind === 'demo'",
    )
    expect(SOURCE, 'the declarations are shown, not just the name').toMatch(
      /utility\.declarations/,
    )
  })

  it('lists every roster entry and its declarations', () => {
    render(Type)
    for (const utility of utilities) {
      expect(screen.getByText(`.${utility.name}`), utility.name).toBeInTheDocument()
      for (const { prop, value } of utility.declarations) {
        expect(
          screen.getAllByText(new RegExp(`${prop}:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
            .length,
          `.${utility.name} { ${prop} }`,
        ).toBeGreaterThan(0)
      }
    }
  })

  // A utility has no `--token` name to copy, so the affordance is named after
  // the class. A new convention, chosen deliberately.
  it('offers one copy affordance per roster entry', () => {
    const { container } = render(Type)
    for (const { name } of utilities) {
      expect(screen.getByRole('button', { name: `Copy .${name}` })).toBeInTheDocument()
    }
    expect(container.querySelectorAll('.utility').length).toBe(utilities.length)
  })
})

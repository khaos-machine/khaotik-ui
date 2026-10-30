import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import LabeledField from '@khaos-machine/khaotik-ui/components/svelte/LabeledField.svelte'
import StatusPill from '@khaos-machine/khaotik-ui/components/svelte/StatusPill.svelte'
import FixtureView from './shell/FixtureView.svelte'

// Same resolution the other source-read checks use (token-refs.test.js:25).
const LABELED_FIELD = join(import.meta.dirname, '../../../..', 'components/svelte/LabeledField.svelte')

// LabeledField rendered as `div` / `span` / `div`, which carries no
// relationship between the two halves. A screen-reader user heard "Mood" and
// then "Skeptical" as two unrelated runs of text — and an inspector is a dozen
// of those stacked, so the failure compounds exactly where the component is
// used most. The term/description pair is the one thing it exists to express.
describe('LabeledField semantics', () => {
  it('pairs the label and the value as a term and its description', () => {
    const { container } = render(LabeledField, { props: { label: 'Mood' } })

    const list = container.querySelector('dl')
    expect(list, 'the row is a description list').not.toBeNull()
    expect(list.querySelector('dt')?.textContent.trim()).toBe('Mood')
    expect(list.querySelector('dd')).not.toBeNull()
  })

  it('puts the slotted value inside the description, not beside it', () => {
    // The value is a slot — chips, prose, a runtime. Whatever it is has to sit
    // in the `dd`, or the pairing is cosmetic.
    const { container } = render(FixtureView, {
      props: {
        fixture: { name: 'LabeledField', component: LabeledField },
        example: { props: { label: 'Mood' }, snippets: { children: [{ component: StatusPill, props: { text: 'Skeptical' } }] } },
      },
    })

    const dd = container.querySelector('dl dd')
    expect(dd, 'the value sits in a description').not.toBeNull()
    expect(dd.textContent).toContain('Skeptical')
  })

  // The UA stylesheet indents a `dd` by 40px and gives a `dl` block margins.
  // Both must be reset: the label is a fixed 128px grid track the value is
  // measured against, so an inherited indent pushes every value out of the
  // column its label was aligned to.
  //
  // Read from the source rather than from getComputedStyle. jsdom does not map
  // logical properties onto the physical longhands, so it reports the UA's
  // `margin-inline-start: 40px` as though `margin: 0` had never applied — the
  // assertion would fail against a component that is correct in every real
  // browser. This is the source-read case CLAUDE.md describes.
  it('drops the browser defaults that would break the grid', () => {
    const css = readFileSync(LABELED_FIELD, 'utf8').match(/<style>([\s\S]*)<\/style>/)[1]
    const rule = (selector) =>
      css.match(new RegExp(`\\.${selector}\\s*\\{([^}]*)\\}`))?.[1] ?? ''

    expect(rule('labeled-field'), 'the dl keeps the UA block margin').toMatch(/margin:\s*0/)
    expect(rule('labeled-field__value'), 'the dd keeps the UA 40px indent').toMatch(/margin:\s*0/)
  })
})

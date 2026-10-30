import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import EngineDetails from '@khaos-machine/khaotik-ui/components/svelte/EngineDetails.svelte'

// #156, reported from khaos-app against a running window. The update badge
// rendered `label` as its ONLY carrier — no title, no accessible name of its
// own — so a host whose operator wants the verdict reduced to a word or a mark
// had to choose between a badge that overflows the 177px plate and a status a
// screen reader cannot read at all. They held rather than ship the second,
// which was the right call and is why this prop exists.
//
// What is asserted here is the CONTRACT, both halves:
//
//   detail absent   label is the accessible name, exactly as before. Existing
//                   hosts must see no change — that is what makes this additive.
//   detail present  label becomes visual only and detail carries the name.
//
// The second half is the one that can regress silently: if the visually-hidden
// span is dropped or the `aria-hidden` on the label is lost, the badge still
// LOOKS right and the page still renders. Only a name assertion catches it.

const withUpdate = (update) => ({
  engine: { components: [{ name: 'khaosd', version: '0.19.0', update }] },
})

describe('the update badge carries a name a screen reader can reach', () => {
  it('uses the label as the accessible name when no detail is supplied', () => {
    const { container } = render(EngineDetails, withUpdate({ label: 'Up to date', tone: 'success' }))
    const badge = container.querySelector('.details__update')

    expect(badge).not.toBeNull()
    expect(badge.textContent.trim()).toBe('Up to date')
    // No title attribute invented out of nothing. A host that passes no detail
    // gets exactly what it got before this prop existed.
    expect(badge.getAttribute('title')).toBeNull()
    expect(badge.querySelector('.visually-hidden')).toBeNull()
    expect(badge.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('lets the label shrink to a word while detail carries the verdict', () => {
    const detail = 'Version 0.24.1 could not be compared'
    const { container } = render(
      EngineDetails,
      withUpdate({ label: 'Unknown', tone: 'neutral', detail }),
    )
    const badge = container.querySelector('.details__update')

    // Seen: the short label. Heard: the full verdict. Hovered: the same string.
    expect(badge.querySelector('[aria-hidden="true"]').textContent).toBe('Unknown')
    expect(badge.querySelector('.visually-hidden').textContent).toBe(detail)
    expect(badge.getAttribute('title')).toBe(detail)
  })

  it('hides the visible label from assistive tech so the verdict is not heard twice', () => {
    // Without this the badge announces "Unknown Version 0.24.1 could not be
    // compared" — the MetaStrip defect (#153) one component over, where a
    // label and its value were both read and produced "54 scenes 54".
    const { container } = render(
      EngineDetails,
      withUpdate({ label: 'Unknown', tone: 'neutral', detail: 'Not in the update feed' }),
    )
    const label = container.querySelector('.details__update [aria-hidden="true"]')

    expect(label).not.toBeNull()
    expect(label.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders no badge at all when the host supplies no verdict', () => {
    // The three-way distinction khaosd makes is the host's to compute, so
    // absent must stay absent rather than defaulting to a reassuring reading.
    const { container } = render(EngineDetails, {
      engine: { components: [{ name: 'khaosd', version: '0.19.0' }] },
    })
    expect(container.querySelector('.details__update')).toBeNull()
  })

  it('keeps the tone on the badge in both shapes', () => {
    const plain = render(EngineDetails, withUpdate({ label: 'Behind', tone: 'warning' }))
    expect(plain.container.querySelector('.details__update').dataset.tone).toBe('warning')

    const detailed = render(
      EngineDetails,
      withUpdate({ label: 'Behind', tone: 'warning', detail: 'Update available — 0.19.0' }),
    )
    expect(detailed.container.querySelector('.details__update').dataset.tone).toBe('warning')
  })

  it('falls back to the neutral tone rather than inventing a favourable one', () => {
    // An unlisted or incomparable component is UNKNOWN, not up to date. A
    // default of `success` would have made the two states that mean "we cannot
    // tell" look like the one that means "you are current".
    const { container } = render(EngineDetails, withUpdate({ label: 'Unlisted' }))
    expect(container.querySelector('.details__update').dataset.tone).toBe('neutral')
  })

  it('renders a Phosphor glyph when the host supplies an icon instead of a label', () => {
    const { container } = render(
      EngineDetails,
      withUpdate({ icon: 'hammer', tone: 'warning', detail: 'dev' }),
    )
    const badge = container.querySelector('.details__update')

    // Seen: the glyph. Heard and hovered: the detail. The `Icon` component is
    // decorative (aria-hidden), so the accessible name is the visually-hidden
    // detail alone.
    expect(badge.querySelector('i.ph.ph-fill.ph-hammer')).not.toBeNull()
    expect(badge.querySelector('.visually-hidden').textContent).toBe('dev')
    expect(badge.getAttribute('title')).toBe('dev')
  })
})

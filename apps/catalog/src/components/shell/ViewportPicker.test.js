import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import ViewportPicker from './ViewportPicker.svelte'
import { findDevice } from './viewports.js'

const base = { device: 'web', size: 'fill', orientation: 'portrait' }

describe('ViewportPicker device', () => {
  it('offers the three tiers as named controls, since they are icon-only', () => {
    render(ViewportPicker, { props: base })

    for (const label of ['Mobile', 'Tablet', 'Web']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('presses in the current device and forwards a change', async () => {
    const ondevice = vi.fn()
    render(ViewportPicker, { props: { ...base, ondevice } })

    expect(screen.getByRole('button', { name: 'Web' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Mobile' })).toHaveAttribute('aria-pressed', 'false')

    await fireEvent.click(screen.getByRole('button', { name: 'Mobile' }))
    expect(ondevice).toHaveBeenCalledWith('mobile')
  })
})

describe('ViewportPicker orientation', () => {
  // One toggle, and it names the state it moves TO — the convention SectionRail's
  // theme and sort buttons already set, because a button reading "Portrait" while
  // portrait is on could be a label or an action and the two imply opposite
  // clicks.
  it('offers the orientation it would move to, not the one it is in', () => {
    const { unmount } = render(ViewportPicker, {
      props: { device: 'mobile', size: 'base', orientation: 'portrait' },
    })
    expect(screen.getByRole('button', { name: 'Rotate to landscape' })).toBeInTheDocument()
    unmount()

    render(ViewportPicker, {
      props: { device: 'mobile', size: 'base', orientation: 'landscape' },
    })
    expect(screen.getByRole('button', { name: 'Rotate to portrait' })).toBeInTheDocument()
  })

  it('forwards the target orientation for a device that rotates', async () => {
    const onorientation = vi.fn()
    render(ViewportPicker, { props: { device: 'mobile', size: 'base', onorientation } })

    await fireEvent.click(screen.getByRole('button', { name: 'Rotate to landscape' }))
    expect(onorientation).toHaveBeenCalledWith('landscape')
  })

  it('turns back from landscape rather than being one-way', async () => {
    const onorientation = vi.fn()
    render(ViewportPicker, {
      props: { device: 'mobile', size: 'base', orientation: 'landscape', onorientation },
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Rotate to portrait' }))
    expect(onorientation).toHaveBeenCalledWith('portrait')
  })

  // Disabled rather than absent: the row keeps its shape across devices, and a
  // control that cannot apply says so instead of vanishing.
  it('disables itself on web, which does not rotate', () => {
    render(ViewportPicker, { props: base })

    expect(screen.getByRole('button', { name: /^Rotate to/ })).toBeDisabled()
  })

  it('enables itself on a device that rotates', () => {
    render(ViewportPicker, { props: { device: 'tablet', size: 'base' } })

    expect(screen.getByRole('button', { name: /^Rotate to/ })).toBeEnabled()
  })
})

describe('ViewportPicker size', () => {
  it('names the axis and its current value on the trigger', () => {
    render(ViewportPicker, { props: { device: 'mobile', size: 'base' } })

    // Menu builds the trigger's name as "<label>: <value>" — a bare number would
    // announce a size with no word for what it sets.
    expect(screen.getByRole('button', { name: 'Size: Standard · 390' })).toBeInTheDocument()
  })

  // The whole point of scoping the list: 1536 is not a phone width, and a global
  // list would be mostly wrong at any moment.
  it('offers only the selected device own sizes', () => {
    render(ViewportPicker, { props: { device: 'mobile', size: 'base' } })

    const labels = [...document.querySelectorAll('[data-part="item-text"]')].map((n) =>
      n.textContent.trim(),
    )
    expect(labels).toEqual(findDevice('mobile').sizes.map((s) => s.label))
    expect(labels.some((l) => l.includes('1536'))).toBe(false)
  })

  it('offers the web breakpoints when web is selected', () => {
    render(ViewportPicker, { props: base })

    const labels = [...document.querySelectorAll('[data-part="item-text"]')].map((n) =>
      n.textContent.trim(),
    )
    expect(labels).toEqual(findDevice('web').sizes.map((s) => s.label))
  })

  // A size id carried over from the previous device would leave Menu's trigger
  // blank, because it matches items on the value it is handed.
  it('falls back to the device first size rather than rendering a blank trigger', () => {
    render(ViewportPicker, { props: { device: 'mobile', size: '2xl' } })

    const first = findDevice('mobile').sizes[0]
    expect(screen.getByRole('button', { name: `Size: ${first.label}` })).toBeInTheDocument()
  })
})

describe('ViewportPicker when the section cannot be framed', () => {
  // BrandKit documents the system; there is nothing responsive to playtest. The
  // controls stay put and go inert, so the bar does not change shape as you move
  // between sections.
  it('disables every control but keeps them present', () => {
    render(ViewportPicker, { props: { ...base, enabled: false } })

    for (const label of ['Mobile', 'Tablet', 'Web']) {
      expect(screen.getByRole('button', { name: label })).toBeDisabled()
    }
    expect(screen.getByRole('button', { name: /^Rotate to/ })).toBeDisabled()
  })

  it('presses nothing in while inert, so it does not assert a live selection', () => {
    render(ViewportPicker, { props: { device: 'mobile', size: 'base', enabled: false } })

    expect(screen.getByRole('button', { name: 'Mobile' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('says why it is inert rather than looking broken', () => {
    const { container } = render(ViewportPicker, { props: { ...base, enabled: false } })

    expect(container.querySelector('.vp').getAttribute('title')).toContain('not applicable')
  })
})

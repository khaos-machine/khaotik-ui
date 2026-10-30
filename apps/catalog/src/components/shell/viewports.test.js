import { describe, it, expect } from 'vitest'
import {
  DEVICES,
  DEFAULT_DEVICE,
  DEFAULT_ORIENTATION,
  findDevice,
  findSize,
  defaultSizeFor,
  resolveFrame,
  frameSummary,
} from './viewports.js'

// The size tables are claims about real devices and published breakpoints, so
// they are tested as claims rather than as rendering. A wrong width is invisible
// in a screenshot — 768 and 780 look the same — and the whole value of the
// control is that the number is the real one.
describe('viewport devices', () => {
  it('offers exactly the three device tiers, each with an icon and sizes', () => {
    expect(DEVICES.map((d) => d.id)).toEqual(['mobile', 'tablet', 'web'])

    for (const d of DEVICES) {
      expect(d.icon.length).toBeGreaterThan(0)
      expect(d.sizes.length).toBeGreaterThan(0)
    }
  })

  // compact <600, medium 600-839, expanded 840+.
  // https://m3.material.io/foundations/layout/breakpoints/overview
  it('keeps every mobile size inside Material 3 compact', () => {
    for (const s of findDevice('mobile').sizes) {
      expect(s.width).toBeLessThan(600)
    }
  })

  it('starts the tablet list at Material 3 medium or above', () => {
    for (const s of findDevice('tablet').sizes) {
      expect(s.width).toBeGreaterThanOrEqual(600)
    }
  })

  it('carries Tailwind default breakpoints at their published widths', () => {
    // https://tailwindcss.com/docs/responsive-design
    const web = Object.fromEntries(findDevice('web').sizes.map((s) => [s.id, s.width]))

    expect(web.md).toBe(768)
    expect(web.lg).toBe(1024)
    expect(web.xl).toBe(1280)
    expect(web['2xl']).toBe(1536)
  })

  // Sizes are stated portrait throughout so orientation is the only thing that
  // turns them. A landscape row in the table could disagree with the flag.
  it('states every device size portrait, taller than it is wide', () => {
    for (const d of DEVICES.filter((d) => d.orientable)) {
      for (const s of d.sizes) {
        expect(s.height).toBeGreaterThan(s.width)
      }
    }
  })

  // A web breakpoint is a width and says nothing about height. Encoding one
  // would invent a constraint the source does not carry.
  it('leaves web sizes unconstrained vertically', () => {
    for (const s of findDevice('web').sizes) {
      expect(s.height).toBeNull()
    }
  })

  it('only lets a real device rotate', () => {
    expect(findDevice('mobile').orientable).toBe(true)
    expect(findDevice('tablet').orientable).toBe(true)
    expect(findDevice('web').orientable).toBe(false)
  })

  it('gives every size a unique id within its device, and a label', () => {
    for (const d of DEVICES) {
      const ids = d.sizes.map((s) => s.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const s of d.sizes) expect(s.label.length).toBeGreaterThan(0)
    }
  })

  it('falls back rather than crashing on an unknown device or size', () => {
    expect(findDevice('nope').id).toBe('web')
    expect(findSize('mobile', 'nope').id).toBe(findDevice('mobile').sizes[0].id)
  })
})

describe('defaults', () => {
  // The default has to leave the canvas exactly as it was before the picker
  // existed, or adding the control silently reframes every fixture.
  it('starts unframed', () => {
    expect(DEFAULT_DEVICE).toBe('web')
    expect(DEFAULT_ORIENTATION).toBe('portrait')

    const frame = resolveFrame({
      device: DEFAULT_DEVICE,
      size: defaultSizeFor(DEFAULT_DEVICE),
      orientation: DEFAULT_ORIENTATION,
    })
    expect(frame.width).toBeNull()
    expect(frame.height).toBeNull()
  })

  // Switching device has to land on a size that device actually has — `2xl`
  // means nothing in the mobile list.
  it('gives each device its own default size, present in its own list', () => {
    for (const d of DEVICES) {
      const id = defaultSizeFor(d.id)
      expect(d.sizes.map((s) => s.id)).toContain(id)
    }
  })

  it('prefers each device its ordinary size, not its smallest', () => {
    expect(defaultSizeFor('mobile')).toBe('base')
    expect(findSize('mobile', 'base').width).toBe(390)
  })
})

describe('resolveFrame', () => {
  it('resolves a device size portrait', () => {
    const frame = resolveFrame({ device: 'mobile', size: 'base', orientation: 'portrait' })

    expect([frame.width, frame.height]).toEqual([390, 844])
    expect(frame.rotated).toBe(false)
  })

  it('swaps the axes in landscape', () => {
    const frame = resolveFrame({ device: 'mobile', size: 'base', orientation: 'landscape' })

    expect([frame.width, frame.height]).toEqual([844, 390])
    expect(frame.rotated).toBe(true)
  })

  // Orientation is app-level state that outlives the device choice, so it WILL
  // be 'landscape' while Web is selected. Ignoring it there — rather than
  // clearing it — is what lets you turn a phone, look at Web, come back and
  // still be landscape.
  it('ignores orientation on web, which does not rotate', () => {
    const frame = resolveFrame({ device: 'web', size: 'lg', orientation: 'landscape' })

    expect(frame.width).toBe(1024)
    expect(frame.height).toBeNull()
    expect(frame.rotated).toBe(false)
  })

  it('resolves fill to no frame at all', () => {
    const frame = resolveFrame({ device: 'web', size: 'fill', orientation: 'portrait' })

    expect(frame.width).toBeNull()
    expect(frame.height).toBeNull()
  })

  // BrandKit documents the system and has no responsive behaviour to playtest,
  // so the feature switches off rather than framing something pointlessly.
  it('frames nothing when disabled, whatever is selected', () => {
    const frame = resolveFrame({
      device: 'mobile',
      size: 'base',
      orientation: 'landscape',
      enabled: false,
    })

    expect(frame.width).toBeNull()
    expect(frame.height).toBeNull()
    expect(frame.rotated).toBe(false)
  })
})

describe('frameSummary', () => {
  it('states both axes for a device, turned or not', () => {
    expect(frameSummary({ device: 'mobile', size: 'base', orientation: 'portrait' })).toBe(
      '390 × 844',
    )
    expect(frameSummary({ device: 'mobile', size: 'base', orientation: 'landscape' })).toBe(
      '844 × 390',
    )
  })

  it('states a breakpoint as a width, because that is all it is', () => {
    expect(frameSummary({ device: 'web', size: 'lg', orientation: 'portrait' })).toBe('1024 wide')
  })

  it('does not invent a size for fill', () => {
    expect(frameSummary({ device: 'web', size: 'fill', orientation: 'portrait' })).toBe(
      'fills the canvas',
    )
  })
})

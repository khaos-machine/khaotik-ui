import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import Waveform from '@khaos-machine/khaotik-ui/components/svelte/Waveform.svelte'

const ROOT = join(import.meta.dirname, '../../../..')
const SOURCE = readFileSync(join(ROOT, 'components/svelte/Waveform.svelte'), 'utf8')

const peaks = { version: 2, channels: 1, sample_rate: 24000, samples_per_pixel: 240, bits: 8, length: 2, data: [-4, 9, -12, 3] }

// The Waveform atom (P1-U1). It is decoration behind controls that carry the names, so it
// is never announced and never focused; unreadable peaks are said, never drawn as silence.
describe('Waveform', () => {
  it('draws on a canvas that is hidden from assistive technology and not focusable', () => {
    const { container } = render(Waveform, { props: { peaks, from: 0, to: 0.02 } })
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    expect(canvas.getAttribute('aria-hidden')).toBe('true')
    expect(canvas.hasAttribute('tabindex')).toBe(false)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('says unreadable peaks out loud and draws nothing', () => {
    const { container } = render(Waveform, { props: { peaks: { ...peaks, version: 1 }, from: 0, to: 0.02 } })
    expect(screen.getByRole('status').textContent).toBe('Waveform unreadable')
    expect(container.querySelector('canvas')).toBeNull()
  })

  // A SOURCE READ, not a rendered one: jsdom resolves no stylesheets, so a rendered
  // assertion about colour passes whether the rule exists or not (RULES.md, "Testing and
  // delivery"). The canvas takes its stroke from its own computed `color` at draw time,
  // so the token is the only colour it can have.
  it('takes its colour from a semantic token, read at draw time', () => {
    expect(SOURCE).toMatch(/\.ui-waveform\s*\{[^}]*color:\s*var\(--text-secondary\)/)
    expect(SOURCE).toMatch(/getComputedStyle\(canvas\)\.color/)
    expect(SOURCE).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
})

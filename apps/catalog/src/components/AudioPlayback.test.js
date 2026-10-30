import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import AudioPlayback from '@khaos-machine/khaotik-ui/components/svelte/AudioPlayback.svelte'

// A stand-in for HTMLAudioElement: jsdom's does not load media. It records every
// element made, and emptying `src` fires `error` later, as WebKit does.
const made = []
class FakeAudio extends EventTarget {
  constructor(src) {
    super()
    this._src = src
    this.paused = true
    this.duration = NaN
    this.currentTime = 0
    made.push(this)
  }
  get src() {
    return this._src
  }
  set src(value) {
    this._src = value
    if (value === '') queueMicrotask(() => this.dispatchEvent(new Event('error')))
  }
  pause() {}
  play() {
    return Promise.resolve()
  }
}

afterEach(() => {
  made.length = 0
  vi.unstubAllGlobals()
})

describe('AudioPlayback across a change of clip', () => {
  it('keeps the new clip playable when the old one errors on the way out', async () => {
    vi.stubGlobal('Audio', FakeAudio)
    const { rerender } = render(AudioPlayback, { props: { src: 'blob:first', label: 'Take' } })
    await rerender({ src: 'blob:second', label: 'Take' })
    await Promise.resolve()
    flushSync()
    expect(made.map((el) => el.src)).toEqual(['', 'blob:second'])
    expect(screen.getByRole('button', { name: 'Play Take' })).toBeEnabled()
  })

  it('still disables on an error from the clip it is playing', async () => {
    vi.stubGlobal('Audio', FakeAudio)
    render(AudioPlayback, { props: { src: 'blob:broken', label: 'Take' } })
    made[0].dispatchEvent(new Event('error'))
    flushSync()
    expect(screen.getByRole('button', { name: 'Play Take' })).toBeDisabled()
  })
})

// P1-U2: with peaks, a Waveform draws behind the scrubber. The range input stays the only
// focusable scrubber, with the same name and step; the canvas is decoration.
describe('AudioPlayback with peaks', () => {
  const peaks = { version: 2, channels: 1, sample_rate: 24000, samples_per_pixel: 240, bits: 8, length: 2, data: [-4, 9, -12, 3] }

  it('draws a waveform behind the scrubber and keeps the scrubber the control', () => {
    vi.stubGlobal('Audio', FakeAudio)
    const { container } = render(AudioPlayback, { props: { src: 'blob:clip', label: 'Take 1', peaks } })
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    expect(canvas.getAttribute('aria-hidden')).toBe('true')
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(1)
    expect(sliders[0].getAttribute('aria-label')).toBe('Seek Take 1')
    expect(sliders[0].getAttribute('step')).toBe('0.01')
    expect(sliders[0].type).toBe('range')
    // The canvas sits before the input in the same track, so the input paints over it.
    expect(canvas.compareDocumentPosition(sliders[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect([...container.querySelectorAll('[tabindex]')].filter((el) => el.tabIndex >= 0)).toHaveLength(0)
  })

  it('renders exactly what it did before when there are no peaks', () => {
    vi.stubGlobal('Audio', FakeAudio)
    const { container } = render(AudioPlayback, { props: { src: 'blob:clip', label: 'Take 1' } })
    expect(container.querySelector('canvas')).toBeNull()
    expect(container.querySelector('.ui-audio__track')).toBeNull()
    expect(screen.getByRole('slider').parentElement.classList.contains('ui-audio')).toBe(true)
  })
})

// P1-U4: a peaks failure is not the clip's failure. The clip still plays; the waveform's
// place says what failed, in the engine's words, and nothing is offered in its stead.
describe('AudioPlayback with peaksError', () => {
  const message = "the generation's audio is audio/mpeg; peaks are drawn from audio/wav only"

  it('keeps play and the scrubber enabled and shows the message verbatim as a status', () => {
    vi.stubGlobal('Audio', FakeAudio)
    const { container } = render(AudioPlayback, { props: { src: 'blob:clip', label: 'Take 1', peaksError: message } })
    made[0].duration = 3
    made[0].dispatchEvent(new Event('loadedmetadata'))
    flushSync()
    expect(screen.getByRole('button', { name: 'Play Take 1' })).toBeEnabled()
    expect(screen.getByRole('slider', { name: 'Seek Take 1' })).toBeEnabled()
    expect(screen.getByRole('status')).toHaveTextContent(message)
    expect(screen.getByRole('status').textContent.trim()).toBe(message)
    expect(container.querySelector('canvas')).toBeNull()
    // The transport is the only control: no retry, no extra button.
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('treats a blank peaksError as none, rendering exactly what it did before', () => {
    vi.stubGlobal('Audio', FakeAudio)
    const before = render(AudioPlayback, { props: { src: 'blob:clip', label: 'Take 1' } }).container.innerHTML
    document.body.innerHTML = ''
    const after = render(AudioPlayback, { props: { src: 'blob:clip', label: 'Take 1', peaksError: '  ' } }).container.innerHTML
    expect(after).toBe(before)
    expect(screen.queryByRole('status')).toBeNull()
  })
})

// Measured live in khaos-app (P1-A6): in the failed track's column, the scrubber's
// `flex: 1` became a flex-basis of 0 on the vertical axis and the range input rendered
// 2px tall. jsdom resolves no stylesheets, so this reads the rule from source.
describe('AudioPlayback peaksError layout, read from source', () => {
  it('keeps the scrubber at its own height in the failed track', async () => {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const css = readFileSync(join(import.meta.dirname, '../../../../components/svelte/AudioPlayback.svelte'), 'utf8')
      .match(/<style>([\s\S]*)<\/style>/)[1]
      .replace(/\/\*[\s\S]*?\*\//g, '')
    expect(css).toMatch(/\.ui-audio__track--failed\s*\{[^}]*flex-direction:\s*column/)
    expect(css).toMatch(/\.ui-audio__track--failed\s+:global\(\.ui-audio__scrubber\)\s*\{[^}]*flex:\s*none/)
  })
})

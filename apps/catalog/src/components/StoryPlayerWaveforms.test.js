import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as waveform from '@khaos-machine/khaotik-ui/components/svelte/lib/waveform.js'
import StoryPlayer from '@khaos-machine/khaotik-ui/components/svelte/StoryPlayer.svelte'

const segments = [
  { kind: 'scene', sceneId: 'first', label: 'First scene', startMs: 0, durationMs: 3000, events: [] },
  { kind: 'scene', sceneId: 'second', label: 'Second scene', startMs: 3000, durationMs: 4000, events: [] },
]
const peaks = { version: 2, channels: 1, sample_rate: 100, samples_per_pixel: 100, bits: 8, length: 4, data: [-10, 10, -20, 20, -40, 40, -60, 60] }
afterEach(() => vi.restoreAllMocks())

describe('Story Player recording waveforms', () => {
  it('places separate recordings at engine offsets and seeks within the clicked read', async () => {
    const onSeek = vi.fn()
    render(StoryPlayer, { segments, scale: 100, waveforms: { first: { state: 'ready', peaks }, second: { state: 'ready', peaks } }, onSeek })
    const read = screen.getByRole('button', { name: 'Seek reading: Second scene' })
    expect(read.style.left).toBe('300px')
    expect(read.style.width).toBe('400px')
    expect(read.querySelector('canvas')).not.toBeNull()
    vi.spyOn(read, 'getBoundingClientRect').mockReturnValue({ left: 40, width: 400 })
    await fireEvent.click(read, { clientX: 140, detail: 1 })
    expect(onSeek).toHaveBeenLastCalledWith(4)
    await fireEvent.click(read, { detail: 0 })
    expect(onSeek).toHaveBeenLastCalledWith(3)
  })
  it('keeps pending and failed media visible without drawing invented peaks', () => {
    render(StoryPlayer, { segments, waveforms: { first: { state: 'loading' }, second: { state: 'failed', message: 'Saved waveform unavailable' } } })
    expect(screen.getByText('Loading waveform…')).toBeInTheDocument()
    expect(screen.getByText('Saved waveform unavailable')).toBeInTheDocument()
    expect(document.querySelector('canvas')).toBeNull()
    expect(screen.getByRole('button', { name: 'Seek reading: Second scene' })).toBeEnabled()
  })
  it('does not add a recording lane when the host supplies no recordings', () => {
    render(StoryPlayer, { segments })
    expect(screen.queryByRole('button', { name: /Seek reading/ })).toBeNull()
    expect(document.querySelector('.player__read-lane')).toBeNull()
  })
  it('samples later-scene audio from the start of its own recording', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'clientWidth', 'get').mockReturnValue(80)
    vi.spyOn(HTMLCanvasElement.prototype, 'clientHeight', 'get').mockReturnValue(32)
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ clearRect() {}, fillRect() {}, fillStyle: '' })
    const sample = vi.spyOn(waveform, 'peakColumns')
    render(StoryPlayer, { segments, waveforms: { second: { state: 'ready', peaks } } })
    await waitFor(() => expect(sample).toHaveBeenCalledWith(peaks, 0, 4, 80))
  })
  it('uses full-strength semantic foreground on the read surface in both themes', () => {
    const source = readFileSync(join(import.meta.dirname, '../../../../components/svelte/StoryPlayer.svelte'), 'utf8')
    expect(source).toMatch(/\.player__read :global\(\.ui-waveform\)\s*\{[^}]*color:\s*var\(--text-primary\)/)
    expect(source).toMatch(/\.player__read \{[^}]*background:\s*var\(--surface-raised\)/)
  })
})

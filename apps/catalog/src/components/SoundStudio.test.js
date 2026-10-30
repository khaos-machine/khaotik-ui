import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import SoundStudio from '@khaos-machine/khaotik-ui/components/svelte/SoundStudio.svelte'

// D81 — sound effects and music as a form beside takes. What reaches the host is only what
// the storyteller set: no steps or seed unless Finer control was opened.

// Illustrative bounds, deliberately not the engine's 360/30: the host supplies the real ones.
const LIMITS = { maxDurationSeconds: 90, maxSteps: 12 }

const TAKES = [{ id: 's1', label: 'Take 1', createdAt: '2026-09-30T20:01:00Z', voiceName: 'a campfire', src: 'blob:1' }]

describe('SoundStudio', () => {
  it('generates a sound effect from its prompt and length, with no music limits supplied', async () => {
    const onSfx = vi.fn()
    render(SoundStudio, { props: { onSfx } })
    const go = screen.getByRole('button', { name: /Generate sound/ })
    expect(go).toBeDisabled()
    await fireEvent.input(screen.getByLabelText('Describe the sound'), { target: { value: ' a campfire at night ' } })
    // Scoped to the open panel: without limits the hidden Music panel's length reads the same.
    await fireEvent.input(within(screen.getByRole('tabpanel')).getByLabelText('Length, seconds'), { target: { value: '5' } })
    await fireEvent.click(go)
    expect(onSfx).toHaveBeenCalledWith('sfx', { prompt: 'a campfire at night', durationSeconds: 5 })
  })

  it('keeps each take beside the form', () => {
    render(SoundStudio, { props: { sfxTakes: TAKES, onSfx: () => {} } })
    expect(screen.getByRole('button', { name: 'Play Take 1' })).toBeInTheDocument()
  })

  it('sends instrumental intent with empty lyrics, and no steps or seed unless finer control is opened', async () => {
    const onMusic = vi.fn()
    render(SoundStudio, { props: { onMusic, musicLimits: LIMITS } })
    await fireEvent.click(screen.getByRole('tab', { name: 'Music' }))
    await fireEvent.input(screen.getByLabelText('Describe the music'), { target: { value: 'slow lofi piano, rain' } })
    await fireEvent.click(screen.getByRole('button', { name: /Generate music/ }))
    expect(onMusic).toHaveBeenCalledWith('music', { caption: 'slow lofi piano, rain', instrumental: true, lyrics: '', duration: 60 })
  })

  it('sends trimmed words when not instrumental, and steps and seed once finer control is open', async () => {
    const onMusic = vi.fn()
    render(SoundStudio, { props: { onMusic, musicLimits: LIMITS } })
    await fireEvent.click(screen.getByRole('tab', { name: 'Music' }))
    await fireEvent.input(screen.getByLabelText('Describe the music'), { target: { value: 'a folk song' } })
    await fireEvent.click(screen.getByLabelText('Instrumental'))
    const go = screen.getByRole('button', { name: /Generate music/ })
    expect(go).toBeDisabled()
    await fireEvent.input(screen.getByLabelText('Lyrics'), { target: { value: ' la la ' } })
    await fireEvent.click(screen.getByText('Finer control'))
    await fireEvent.input(screen.getByLabelText('Seed (blank for a new one)'), { target: { value: '0' } })
    await fireEvent.click(go)
    // No steps typed: none sent, so no number the kit chose reaches the model.
    expect(onMusic).toHaveBeenLastCalledWith('music', { caption: 'a folk song', instrumental: false, lyrics: 'la la', duration: 60, seed: 0 })
    await fireEvent.input(screen.getByLabelText("Steps (1–12, blank for the engine's)"), { target: { value: '12' } })
    await fireEvent.click(go)
    expect(onMusic).toHaveBeenLastCalledWith('music', { caption: 'a folk song', instrumental: false, lyrics: 'la la', duration: 60, steps: 12, seed: 0 })
  })

  it('does not generate music until the host supplies its limits', async () => {
    const onMusic = vi.fn()
    const { rerender } = render(SoundStudio, { props: { onMusic } })
    await fireEvent.click(screen.getByRole('tab', { name: 'Music' }))
    await fireEvent.input(screen.getByLabelText('Describe the music'), { target: { value: 'rain' } })
    const go = screen.getByRole('button', { name: /Generate music/ })
    expect(go).toBeDisabled()
    await fireEvent.submit(go.closest('form'))
    expect(onMusic).not.toHaveBeenCalled()
    await rerender({ onMusic, musicLimits: LIMITS })
    expect(go).toBeEnabled()
  })

  it('bounds length and steps by the supplied limits, and follows them when they change', async () => {
    const { rerender } = render(SoundStudio, { props: { onMusic: () => {}, musicLimits: LIMITS } })
    await fireEvent.click(screen.getByRole('tab', { name: 'Music' }))
    await fireEvent.click(screen.getByText('Finer control'))
    expect(screen.getByLabelText('Length, seconds (up to 90)')).toHaveAttribute('max', '90')
    expect(screen.getByLabelText("Steps (1–12, blank for the engine's)")).toHaveAttribute('max', '12')
    await rerender({ onMusic: () => {}, musicLimits: { maxDurationSeconds: 45, maxSteps: 7 } })
    expect(screen.getByLabelText('Length, seconds (up to 45)')).toHaveAttribute('max', '45')
    expect(screen.getByLabelText("Steps (1–7, blank for the engine's)")).toHaveAttribute('max', '7')
  })

  it('keeps the lyric draft across the instrumental toggle and a tab switch', async () => {
    const onMusic = vi.fn()
    render(SoundStudio, { props: { onMusic, musicLimits: LIMITS } })
    await fireEvent.click(screen.getByRole('tab', { name: 'Music' }))
    await fireEvent.input(screen.getByLabelText('Describe the music'), { target: { value: 'a folk song' } })
    await fireEvent.click(screen.getByLabelText('Instrumental'))
    await fireEvent.input(screen.getByLabelText('Lyrics'), { target: { value: 'la la' } })
    await fireEvent.click(screen.getByLabelText('Instrumental'))
    await fireEvent.click(screen.getByRole('button', { name: /Generate music/ }))
    expect(onMusic).toHaveBeenLastCalledWith('music', { caption: 'a folk song', instrumental: true, lyrics: '', duration: 60 })
    await fireEvent.click(screen.getByLabelText('Instrumental'))
    expect(screen.getByLabelText('Lyrics')).toHaveValue('la la')
    await fireEvent.click(screen.getByRole('tab', { name: 'SFX' }))
    await fireEvent.click(screen.getByRole('tab', { name: 'Music' }))
    expect(screen.getByLabelText('Lyrics')).toHaveValue('la la')
  })

  it("shows the host's reason and does not generate while it stands", async () => {
    const onSfx = vi.fn()
    render(SoundStudio, { props: { onSfx, sfxReason: 'The sound-effects engine is not running.' } })
    await fireEvent.input(screen.getByLabelText('Describe the sound'), { target: { value: 'rain' } })
    expect(screen.getByRole('button', { name: /Generate sound/ })).toBeDisabled()
    expect(screen.getByText('The sound-effects engine is not running.')).toBeInTheDocument()
  })

  it('generates one at a time', () => {
    render(SoundStudio, { props: { onSfx: () => {}, generating: 'music' } })
    expect(screen.getByRole('button', { name: /Generate sound/ })).toBeDisabled()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import ReadingReadiness from '@khaos-machine/khaotik-ui/components/svelte/ReadingReadiness.svelte'
import captured from '../data/reading-readiness.json'

// Whether the inspected scene, and the whole story, can be read (khaos.machine
// docs/designs/2026-10-24-stage3-analysis-display.md, item 3). The data is b4p's, verbatim; the
// refused scene and the voices needing attention are illustrative.

const loaded = (readiness = captured) => ({ kind: 'loaded', readiness })
const first = captured.scenes[0]
const refusal = 'character_01M5 has no locked voice'
const refused = { ...captured, scenes: [{ ...first, ready: false, refusal, lines: 0, newHosted: 0 }, ...captured.scenes.slice(1)], totals: { ...captured.totals, ready: 56, refused: 1 } }

describe('ReadingReadiness', () => {
  it('says the scene is ready, with its hosted count', () => {
    render(ReadingReadiness, { props: { readiness: loaded(), sceneId: first.sceneId } })
    expect(screen.getByText('Ready to read. 7 lines: 7 new with your hosted voices.')).toBeVisible()
    expect(screen.queryByText(/on this Mac/)).toBeNull()
  })

  it('adds the local and reused counts in Advanced', () => {
    render(ReadingReadiness, { props: { readiness: loaded(), sceneId: first.sceneId, advanced: true } })
    expect(screen.getByText('Ready to read. 7 lines: 7 new with your hosted voices. · 0 new on this Mac · 0 already made')).toBeVisible()
  })

  it('shows a refused scene with the engine reason, verbatim', () => {
    render(ReadingReadiness, { props: { readiness: loaded(refused), sceneId: first.sceneId } })
    expect(screen.getByRole('alert')).toHaveTextContent("This scene can't be read yet.")
    expect(screen.getByRole('alert')).toHaveTextContent(refusal)
    expect(screen.queryByText(/Ready to read/)).toBeNull()
  })

  it('draws nothing for a scene the answer does not hold, and still shows All scenes', () => {
    render(ReadingReadiness, { props: { readiness: loaded(), sceneId: 'scene_absent' } })
    expect(screen.queryByText(/Ready to read/)).toBeNull()
    expect(screen.getByRole('button', { name: 'All scenes' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('sums the story up under All scenes, collapsed by default', async () => {
    render(ReadingReadiness, { props: { readiness: loaded(), sceneId: first.sceneId } })
    await fireEvent.click(screen.getByRole('button', { name: 'All scenes' }))
    expect(screen.getByText('57 of 57 scenes are ready to read. 1,449 lines in all.')).toBeVisible()
    expect(screen.queryByText(/scenes can't be read yet/)).toBeNull()
    expect(screen.getByText('All 28 voices are ready.')).toBeVisible()
  })

  it('counts refused scenes only when there are some', async () => {
    render(ReadingReadiness, { props: { readiness: loaded(refused), sceneId: 'scene_absent' } })
    await fireEvent.click(screen.getByRole('button', { name: 'All scenes' }))
    expect(screen.getByText("1 scenes can't be read yet.")).toBeVisible()
  })

  it('lists only the voices that need attention, with Lock voice… for an unlocked one', async () => {
    const onLockVoice = vi.fn()
    const [a, b, ...rest] = captured.voices
    const voices = [{ ...a, locked: false }, { ...b, providerAvailable: false, problem: 'the speech provider is not set up' }, ...rest]
    render(ReadingReadiness, { props: { readiness: loaded({ ...captured, voices }), sceneId: first.sceneId, onLockVoice } })
    await fireEvent.click(screen.getByRole('button', { name: 'All scenes' }))
    expect(screen.getByText(`${a.name} isn't locked yet.`)).toBeVisible()
    expect(screen.getByText(`${b.name}: the speech provider is not set up`)).toBeVisible()
    expect(screen.queryByText(/voices are ready/)).toBeNull()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    await fireEvent.click(screen.getByRole('button', { name: 'Lock voice…' }))
    expect(onLockVoice).toHaveBeenLastCalledWith(a.voiceProfileId)
  })

  it('says it is checking while loading, and what failed', () => {
    const { unmount } = render(ReadingReadiness, { props: { readiness: { kind: 'loading' }, sceneId: first.sceneId } })
    expect(screen.getByText("Checking this story's voices…")).toBeVisible()
    unmount()
    render(ReadingReadiness, { props: { readiness: { kind: 'failed', message: 'x' }, sceneId: first.sceneId } })
    expect(screen.getByText("Khaos couldn't check whether this scene is ready to read.")).toBeVisible()
  })

  it('draws nothing when the engine does not serve the route', () => {
    const { container } = render(ReadingReadiness, { props: { readiness: { kind: 'unserved' }, sceneId: first.sceneId } })
    expect(container.textContent?.trim()).toBe('')
  })
})

// khaos-manager#1091: a voice blocked from rendering on this Mac says why and offers its fix.
// The blocks and messages are khaosd's own (internal/api/casting_voice.go EngineNotEnabled and
// ModelsMissing); the voices they sit on are b4p's, and the pairing is illustrative.
describe('ReadingReadiness with a blocked voice', () => {
  const model = { id: 'qwen3-tts-1.7b', name: 'Qwen3 TTS 1.7B', repoId: 'Qwen/Qwen3-TTS-1.7B' }
  const engineOff = { code: 'VOICE_ENGINE_NOT_ENABLED', message: 'kitten is not enabled in Settings › Routing › Speech Generation; cast a voice on the configured engine' }
  const noModels = { code: 'MODELS_MISSING', message: `not downloaded on this Mac: ${model.name}; download in Settings › On-device engines`, models: [model] }
  const [one, two] = captured.voices
  const blocked = (voices, modelsMissing = null) => loaded({ ...captured, voices, modelsMissing })

  it('offers Recast… for a voice whose engine is not enabled, naming whether it is the narrator', async () => {
    const onRecast = vi.fn()
    render(ReadingReadiness, { props: { readiness: blocked([{ ...one, narrator: true, blocked: engineOff }, two]), sceneId: first.sceneId, onRecast } })
    expect(screen.getByText(`${one.name}: ${engineOff.message}`)).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Recast…' }))
    expect(onRecast).toHaveBeenCalledWith(one.voiceProfileId, true)
  })

  it('reads an absent narrator flag as a character', async () => {
    const onRecast = vi.fn()
    const { narrator: _absent, ...character } = one
    render(ReadingReadiness, { props: { readiness: blocked([{ ...character, blocked: engineOff }]), sceneId: first.sceneId, onRecast } })
    await fireEvent.click(screen.getByRole('button', { name: 'Recast…' }))
    expect(onRecast).toHaveBeenCalledWith(one.voiceProfileId, false)
  })

  it('offers one Download models… for every missing model, named once', async () => {
    const onDownloadModels = vi.fn()
    render(ReadingReadiness, { props: { readiness: blocked([{ ...one, blocked: noModels }, { ...two, blocked: noModels }], [model]), sceneId: first.sceneId, onDownloadModels } })
    expect(screen.getByText(`Voice models aren't on this Mac yet: ${model.name}.`)).toBeVisible()
    const download = screen.getAllByRole('button', { name: 'Download models…', hidden: true })
    expect(download).toHaveLength(1)
    await fireEvent.click(download[0])
    expect(onDownloadModels).toHaveBeenCalledOnce()
  })

  it('offers Download models… from the story list alone, and nothing when it is empty or null', () => {
    const { unmount } = render(ReadingReadiness, { props: { readiness: blocked(captured.voices, [model]), sceneId: first.sceneId } })
    expect(screen.getByRole('button', { name: 'Download models…' })).toBeInTheDocument()
    unmount()
    render(ReadingReadiness, { props: { readiness: blocked(captured.voices, null), sceneId: first.sceneId } })
    expect(screen.queryByRole('button', { name: 'Download models…', hidden: true })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Recast…', hidden: true })).toBeNull()
  })
})

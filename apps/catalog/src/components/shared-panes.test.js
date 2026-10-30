import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import AnalysisStale from '@khaos-machine/khaotik-ui/components/svelte/AnalysisStale.svelte'
import FinishSetupConfirm from '@khaos-machine/khaotik-ui/components/svelte/FinishSetupConfirm.svelte'
import GenerationFailureDetails from '@khaos-machine/khaotik-ui/components/svelte/GenerationFailureDetails.svelte'
import ImageThumb from '@khaos-machine/khaotik-ui/components/svelte/ImageThumb.svelte'
import PlaybackEventInspector from '@khaos-machine/khaotik-ui/components/svelte/PlaybackEventInspector.svelte'
import ProviderDisclosure from '@khaos-machine/khaotik-ui/components/svelte/ProviderDisclosure.svelte'
import QuitPrompt from '@khaos-machine/khaotik-ui/components/svelte/QuitPrompt.svelte'
import RefusalOffer from '@khaos-machine/khaotik-ui/components/svelte/RefusalOffer.svelte'
import SubjectImages from '@khaos-machine/khaotik-ui/components/svelte/SubjectImages.svelte'
import DialogueInspector from '@khaos-machine/khaotik-ui/components/svelte/DialogueInspector.svelte'
import IdentitySide from '@khaos-machine/khaotik-ui/components/svelte/IdentitySide.svelte'
import LineInspector from '@khaos-machine/khaotik-ui/components/svelte/LineInspector.svelte'
import ReadTimeline from '@khaos-machine/khaotik-ui/components/svelte/ReadTimeline.svelte'
import SceneReads from '@khaos-machine/khaotik-ui/components/svelte/SceneReads.svelte'

// Khaos App's shared panes, moved into the kit (catalog app-coverage plan, T1). Each is
// checked for the callbacks it reports and for its empty state. The host's models are
// not here: these components take plain values and report intent.

describe('RefusalOffer', () => {
  const offer = { headline: 'Voice not locked', detail: 'Lock a voice before reading.', fixes: [{ kind: 'lock', label: 'Lock voice' }] }

  it('reports the fix chosen and Report a Problem…', async () => {
    const onFix = vi.fn()
    const onReport = vi.fn()
    render(RefusalOffer, { props: { offer, onFix, onReport } })
    await fireEvent.click(screen.getByRole('button', { name: 'Lock voice' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Report a Problem…' }))
    expect(onFix).toHaveBeenCalledWith(offer.fixes[0])
    expect(onReport).toHaveBeenCalledOnce()
  })

  it('offers Report a Problem… alone when there is no fix', () => {
    render(RefusalOffer, { props: { offer: { headline: 'Refused', fixes: [] } } })
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('group', { name: 'Refused' })).toBeInTheDocument()
  })
})

describe('ProviderDisclosure', () => {
  const disclosure = { providerId: 'openrouter', title: 'OpenRouter', text: 'OpenRouter will see the text you send.' }

  it('asks with khaosd sentence and reports Continue and Cancel', async () => {
    const onContinue = vi.fn()
    const onCancel = vi.fn()
    render(ProviderDisclosure, { props: { disclosure, onContinue, onCancel } })
    expect(screen.getByText(disclosure.text)).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onContinue).toHaveBeenCalledOnce()
    expect(onCancel).toHaveBeenCalled()
  })

  it('renders nothing with no disclosure pending', () => {
    render(ProviderDisclosure, { props: { disclosure: null } })
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('FinishSetupConfirm', () => {
  it('names no command on the Basic path', () => {
    render(FinishSetupConfirm, { props: { open: true, basic: true } })
    expect(screen.getByText('Finish setting up Khaos?')).toBeInTheDocument()
    expect(screen.queryByText(/khaos-tools providers install/)).toBeNull()
  })

  it("names khaosd's command on the Advanced path and reports Install", async () => {
    const onConfirm = vi.fn()
    render(FinishSetupConfirm, { props: { open: true, basic: false, onConfirm } })
    expect(screen.getByText(/khaos-tools providers install/)).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Install' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('asks nothing while closed', () => {
    render(FinishSetupConfirm, { props: { open: false } })
    expect(screen.queryByRole('button', { name: 'Install' })).toBeNull()
  })
})

describe('QuitPrompt', () => {
  it('reports each of its three choices', async () => {
    const onStopAndQuit = vi.fn()
    const onLetFinish = vi.fn()
    const onDismiss = vi.fn()
    render(QuitPrompt, { props: { open: true, sentence: 'A scene read is running.', onStopAndQuit, onLetFinish, onDismiss } })
    await fireEvent.click(screen.getByRole('button', { name: 'Quit and Let It Finish' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Stop and Quit' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onLetFinish).toHaveBeenCalledOnce()
    expect(onStopAndQuit).toHaveBeenCalledOnce()
    expect(onDismiss).toHaveBeenCalled()
  })

  it('disables Let It Finish while a choice is being carried out', () => {
    render(QuitPrompt, { props: { open: true, busy: true } })
    expect(screen.getByRole('button', { name: 'Quit and Let It Finish' })).toHaveAttribute('aria-disabled', 'true')
  })
})

describe('GenerationFailureDetails', () => {
  const generation = {
    id: 'gen_1',
    error: 'provider refused',
    provider: { provider: 'gemini', model: 'gemini-tts', profile: 'default' },
    providerDiagnostic: { operation: 'synthesize', httpStatus: 429, truncated: false, expiresAt: '2026-10-22T00:00:00Z', responseBody: '{"error":"rate"}' },
  }

  it('copies the generation and says it did', async () => {
    const copy = vi.fn(() => Promise.resolve())
    render(GenerationFailureDetails, { props: { generation, copy } })
    await fireEvent.click(screen.getByRole('button', { name: 'Copy failure details' }))
    expect(copy).toHaveBeenCalledWith(JSON.stringify(generation, null, 2))
    expect(await screen.findByRole('status')).toHaveTextContent('Failure details copied.')
  })

  it('renders nothing for a generation with no provider diagnostic', () => {
    const { container } = render(GenerationFailureDetails, { props: { generation: { id: 'gen_2' } } })
    expect(container.querySelector('details')).toBeNull()
  })
})

describe('AnalysisStale', () => {
  it('lists each change, with its note', () => {
    render(AnalysisStale, { props: { standing: { state: 'stale', reasons: ['The scene text changed'], details: ['Re-run the analysis.'] } } })
    expect(screen.getByText('The scene text changed')).toBeInTheDocument()
    expect(screen.getByText('Re-run the analysis.')).toBeInTheDocument()
  })

  it('renders nothing for a current analysis', () => {
    const { container } = render(AnalysisStale, { props: { standing: { state: 'current', reasons: [], details: [] } } })
    expect(container.textContent.trim()).toBe('')
  })
})

describe('ImageThumb', () => {
  it('names the image and squares it for a row', () => {
    const { container } = render(ImageThumb, { props: { src: '', name: 'Madison', kind: 'character', square: true } })
    expect(container.querySelector('.image-thumb__square')).not.toBeNull()
  })
})

describe('SubjectImages', () => {
  it('reports the activated image', async () => {
    const onRevealImage = vi.fn()
    render(SubjectImages, { props: { read: { kind: 'loaded', rows: [{ referenceId: 'ref_1', label: 'Front' }] }, onRevealImage } })
    await fireEvent.click(screen.getByRole('button', { name: /Front/ }))
    expect(onRevealImage).toHaveBeenCalledWith('ref_1')
  })

  it("says the read failed, in the engine's words", () => {
    render(SubjectImages, { props: { read: { kind: 'failed', message: 'subject not found' } } })
    expect(screen.getByText('subject not found')).toBeInTheDocument()
  })

  it('says it is reading until the host has an answer', () => {
    render(SubjectImages, {})
    expect(screen.getByText('Reading images…')).toBeInTheDocument()
  })
})

describe('PlaybackEventInspector', () => {
  const scene = { kind: 'scene', timing: 'read', reads: [{ id: 'r1', chosen: true }], audio: { takeId: 'r1' } }
  const event = { elementType: 'dialogue', characterName: 'MADISON', text: 'Shit!', start: 3, duration: 1.5 }

  it('reports Go to event, Open in Data and Manage readings', async () => {
    const onSeek = vi.fn()
    const onData = vi.fn()
    const onReadings = vi.fn()
    render(PlaybackEventInspector, { props: { scene, event, onSeek, onData, onReadings } })
    await fireEvent.click(screen.getByRole('button', { name: 'Go to event' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Open in Data' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Manage readings' }))
    expect(onSeek).toHaveBeenCalledOnce()
    expect(onData).toHaveBeenCalledOnce()
    expect(onReadings).toHaveBeenCalledOnce()
    expect(screen.getByText('Chosen reading')).toBeInTheDocument()
  })

  it('says it is between events, and that no reading is chosen', () => {
    render(PlaybackEventInspector, { props: { scene: { kind: 'scene', timing: 'estimated', reads: [], audio: null }, event: null } })
    expect(screen.getByText('Between events')).toBeInTheDocument()
    expect(screen.getByText('No reading chosen')).toBeInTheDocument()
  })
})

describe('ReadTimeline', () => {
  it('says the read failed, in the engine words', () => {
    render(ReadTimeline, { props: { state: { kind: 'failed', message: 'scene take not found' } } })
    expect(screen.getByText('scene take not found')).toBeInTheDocument()
  })

  it('says it is opening until the read has a length', () => {
    render(ReadTimeline, { props: { state: { kind: 'loaded' }, segments: [{ kind: 'scene', durationMs: null, events: [] }] } })
    expect(screen.getByText('Opening the read…')).toBeInTheDocument()
  })
})

describe('IdentitySide', () => {
  const item = { id: 'loc_1', name: 'Airport', scene_count: 1, page_count: 2.6, origin: 'parsed' }

  it('reports a scene to show, and a delete only after the sheet confirms it', async () => {
    const onRevealScene = vi.fn()
    const onDelete = vi.fn()
    render(IdentitySide, { props: { kind: 'location', item, named: [{ id: 's1', label: 'EXT. AIRPORT - DAY' }], deletable: true, deleteMessage: 'Gone.', onRevealScene, onDelete } })
    await fireEvent.click(screen.getByRole('button', { name: 'EXT. AIRPORT - DAY' }))
    expect(onRevealScene).toHaveBeenCalledWith('s1')
    await fireEvent.click(screen.getByRole('button', { name: 'Delete Airport…' }))
    expect(onDelete).not.toHaveBeenCalled()
    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('renders nothing with nothing selected', () => {
    const { container } = render(IdentitySide, { props: { item: null } })
    expect(container.textContent.trim()).toBe('')
  })
})

describe('DialogueInspector', () => {
  const line = { element_id: 'e1', text: 'Shit!', scene_id: 's1', scene_slugline: 'INT. STUDIO - DAY' }

  it('takes a billed line at once, with the billing note and no charge ask (K: "Budget is consent")', async () => {
    const onTake = vi.fn()
    render(DialogueInspector, { props: { line, speaker: 'Madison', takesOffered: true, billedBy: 'Gemini TTS', onTake } })
    expect(screen.getByText('This voice runs on Gemini TTS, which bills for each take with no price limit.')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).toBeNull()
    await fireEvent.click(screen.getByRole('button', { name: /Generate/ }))
    expect(onTake).toHaveBeenCalledWith(expect.any(String))
  })

  it('reports the scene to show and Esc', async () => {
    const onOpenScene = vi.fn()
    const onDismiss = vi.fn()
    render(DialogueInspector, { props: { line, speaker: 'Madison', onOpenScene, onDismiss } })
    await fireEvent.click(screen.getByRole('button', { name: 'INT. STUDIO - DAY' }))
    await fireEvent.keyDown(window, { key: 'Escape' })
    expect(onOpenScene).toHaveBeenCalledWith('s1')
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('shows no Takes when the line cannot be voiced here', () => {
    render(DialogueInspector, { props: { line, speaker: 'Madison', takesOffered: false } })
    expect(screen.queryByText('Takes')).toBeNull()
  })
})

describe('LineInspector', () => {
  it('says a line the composition does not hold cannot be shown, and reports Back', async () => {
    const onclear = vi.fn()
    render(LineInspector, { props: { event: null, backLabel: 'Back', onclear } })
    expect(screen.getByRole('status')).toHaveTextContent('not in the composition')
    await fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onclear).toHaveBeenCalledOnce()
  })

  it('reports the speaker of a line to show', async () => {
    const onRevealCharacter = vi.fn()
    render(LineInspector, { props: { event: { elementType: 'dialogue', text: 'Hi', characterName: 'MADISON', characterId: 'c1' }, onRevealCharacter } })
    await fireEvent.click(screen.getByRole('button', { name: 'MADISON' }))
    expect(onRevealCharacter).toHaveBeenCalledWith('c1')
  })
})

describe('SceneReads', () => {
  const takes = [{ id: 't1', label: 'Read 1', voiceName: '' }, { id: 't2', label: 'Read 2', voiceName: '' }]

  it('reports Read scene, and a delete only after the confirmation', async () => {
    const onRead = vi.fn()
    const onDelete = vi.fn()
    render(SceneReads, { props: { sceneHeading: 'INT. STUDIO', playback: 'hosted', takes, onRead, onDelete } })
    await fireEvent.click(screen.getByRole('button', { name: /Read scene/ }))
    expect(onRead).toHaveBeenCalledOnce()
    await fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0])
    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getByText('Delete Read 1 of INT. STUDIO?')).toBeInTheDocument()
  })

  it('removes the unchosen reads counted when the confirmation opened', async () => {
    const onRemoveUnchosen = vi.fn()
    render(SceneReads, { props: { sceneHeading: 'INT. STUDIO', takes, unchosenIds: ['t2'], onRemoveUnchosen } })
    await fireEvent.click(screen.getByRole('button', { name: 'Remove unchosen takes' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onRemoveUnchosen).toHaveBeenCalledWith(['t2'])
  })

  it('asks for a narrator before reading when the project has none', () => {
    render(SceneReads, { props: { takes: [], narrator: { status: 'unset' } } })
    expect(screen.getByText(/no narrator voice/)).toBeInTheDocument()
  })
})

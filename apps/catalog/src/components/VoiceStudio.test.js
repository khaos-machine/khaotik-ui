import { describe, it, expect, vi } from 'vitest'
import { tick } from 'svelte'
import { render, screen, fireEvent } from '@testing-library/svelte'
import VoiceStudio from '@khaos-machine/khaotik-ui/components/svelte/VoiceStudio.svelte'

// D79 — the workbench. Without `takes` the studio is unchanged; with them it keeps every
// audition beside the form and ends in keeping the voice. Saving is the host's.

const TAKES = [
  { id: 't2', label: 'Take 2', createdAt: '2026-09-30T13:52:00Z', voiceName: 'a warm voice', src: 'blob:2' },
  { id: 't1', label: 'Take 1', createdAt: '2026-09-30T13:50:00Z', voiceName: 'a warm voice', src: 'blob:1' },
]

describe('VoiceStudio as it was', () => {
  it('offers all three modes and no takes or save by default', () => {
    render(VoiceStudio)
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent.trim())).toEqual(['Design', 'Clone', 'Dialogue'])
    expect(screen.queryByRole('heading', { name: 'Takes' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Save voice/ })).toBeNull()
  })
})

describe('VoiceStudio as a workbench (D79)', () => {
  it('offers only the modes the host serves', () => {
    render(VoiceStudio, { props: { modes: ['Design', 'Clone'], takes: [] } })
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent.trim())).toEqual(['Design', 'Clone'])
  })

  it('keeps every take beside the form, each with its own player', () => {
    render(VoiceStudio, { props: { takes: TAKES } })
    expect(screen.getByRole('heading', { name: 'Takes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play Take 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play Take 1' })).toBeInTheDocument()
    // One Generate, the form's: the takes column has none of its own.
    expect(screen.queryByRole('button', { name: /Generate take/ })).toBeNull()
  })

  it('says what the takes column is for before there are any', () => {
    render(VoiceStudio, { props: { takes: [] } })
    expect(screen.getByText(/Each take you generate stays here/)).toBeInTheDocument()
  })

  it('saves under the typed name, as the mode in front', async () => {
    const onSave = vi.fn()
    render(VoiceStudio, { props: { takes: TAKES, onSave } })
    const save = screen.getByRole('button', { name: /Save voice/ })
    expect(save).toBeDisabled()
    await fireEvent.input(screen.getByLabelText('Name'), { target: { value: '  Jetta, older  ' } })
    expect(save).toBeEnabled()
    await fireEvent.click(save)
    expect(onSave).toHaveBeenCalledWith({ kind: 'design', name: 'Jetta, older', lock: false })
  })

  it('shows the host’s reason and does not save while it stands', async () => {
    const onSave = vi.fn()
    render(VoiceStudio, { props: { takes: TAKES, onSave, saveReason: 'khaosd cannot save a voice yet.' } })
    await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Jetta' } })
    expect(screen.getByRole('button', { name: /Save voice/ })).toBeDisabled()
    expect(screen.getByText('khaosd cannot save a voice yet.')).toBeInTheDocument()
  })

  it('says a take is on its way while the host generates', () => {
    render(VoiceStudio, { props: { takes: [], generating: true } })
    expect(screen.getByText(/Generating a take/)).toBeInTheDocument()
  })

  it('lets a take be chosen, and marks the chosen one', async () => {
    const onChooseTake = vi.fn()
    const { rerender } = render(VoiceStudio, { props: { takes: TAKES, onChooseTake } })
    await fireEvent.click(screen.getByRole('button', { name: 'Use this take: Take 1' }))
    expect(onChooseTake).toHaveBeenCalledWith('t1')
    await rerender({ takes: TAKES, onChooseTake, chosenTakeId: 't1' })
    expect(screen.getByText('Chosen')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Use this take: Take 1' })).toBeNull()
  })

  it('says what Save keeps in the host’s words', () => {
    render(VoiceStudio, { props: { takes: TAKES, saveHint: 'Keeps Take 1, so the voice sounds the same on every line.' } })
    expect(screen.getByText('Keeps Take 1, so the voice sounds the same on every line.')).toBeInTheDocument()
  })

  it('asks how to keep a designed voice’s take, keeping it as a sample unless told to lock', async () => {
    const onSave = vi.fn()
    render(VoiceStudio, { props: { takes: TAKES, onSave } })
    expect(screen.getByText(/Stays designed/)).toBeInTheDocument()
    await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Jetta' } })
    await fireEvent.click(screen.getByText('Lock voice to the take'))
    expect(screen.getByText(/Sounds like the take on every line/)).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: /Save voice/ }))
    expect(onSave).toHaveBeenCalledWith({ kind: 'design', name: 'Jetta', lock: true })
  })

  it('offers a Preset tab that picks a speaker and a style direction (D86)', async () => {
    const ongenerate = vi.fn()
    render(VoiceStudio, {
      props: { modes: ['Design', 'Clone', 'Preset'], takes: [], ongenerate, speakers: [{ id: 'vivian', name: 'Vivian' }] },
    })
    await fireEvent.click(screen.getByRole('tab', { name: 'Preset' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Vivian' }))
    await fireEvent.input(screen.getByLabelText('Style direction'), { target: { value: 'warm' } })
    const texts = screen.getAllByLabelText('Text')
    await fireEvent.input(texts[texts.length - 1], { target: { value: 'Hello.' } })
    const gens = screen.getAllByRole('button', { name: /^Generate$/ })
    await fireEvent.click(gens[gens.length - 1])
    expect(ongenerate).toHaveBeenCalledWith('preset', expect.objectContaining({ speaker: 'vivian', instruct: 'warm', text: 'Hello.' }))
  })

  it('says why the Preset tab has no speakers, and cannot generate', async () => {
    render(VoiceStudio, { props: { modes: ['Preset'], takes: [], ongenerate: () => {}, speakersReason: 'Not listed yet.' } })
    expect(screen.getByText('Not listed yet.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Generate$/ })).toBeDisabled()
  })
})

describe('VoiceStudio reads what the engine offers (D88)', () => {
  async function generateOn(tab) {
    await fireEvent.click(screen.getByRole('tab', { name: tab }))
    const panel = screen.getByRole('tabpanel')
    const texts = [...panel.querySelectorAll('textarea')]
    await fireEvent.input(texts[texts.length - 1], { target: { value: 'Hello.' } })
    await fireEvent.click([...panel.querySelectorAll('button')].find((b) => /Generate/.test(b.textContent)))
  }

  it('names each language and sends the one chosen, detecting it by default', async () => {
    const ongenerate = vi.fn()
    render(VoiceStudio, { props: { modes: ['Design'], takes: [], ongenerate, languages: { design: ['auto', 'en', 'de'] } } })
    const select = screen.getByLabelText('Language')
    expect([...select.options].map((o) => o.textContent)).toEqual(['Detect from the text', 'English', 'German'])
    await generateOn('Design')
    expect(ongenerate).toHaveBeenLastCalledWith('design', expect.objectContaining({ lang: 'auto' }))
    await fireEvent.change(select, { target: { value: 'de' } })
    await generateOn('Design')
    expect(ongenerate).toHaveBeenLastCalledWith('design', expect.objectContaining({ lang: 'de' }))
  })

  it('offers no language picker when the engine lists none', () => {
    render(VoiceStudio, { props: { modes: ['Design'], takes: [] } })
    expect(screen.queryByLabelText('Language')).toBeNull()
  })

  it('takes a direction for the line apart from the voice description', async () => {
    const ongenerate = vi.fn()
    render(VoiceStudio, { props: { modes: ['Design'], takes: [], ongenerate } })
    await fireEvent.input(screen.getByLabelText('Voice description'), { target: { value: 'an old sailor' } })
    await fireEvent.input(screen.getByLabelText('Direction'), { target: { value: 'whispered' } })
    await generateOn('Design')
    expect(ongenerate).toHaveBeenCalledWith('design', expect.objectContaining({ instruct: 'an old sailor', direction: 'whispered' }))
  })

  it('lets a clone choose between the models the engine has, the first by default', async () => {
    const ongenerate = vi.fn()
    const cloneModels = [
      { id: 'quality', label: 'Quality' },
      { id: 'fast', label: 'Fast' },
    ]
    render(VoiceStudio, { props: { modes: ['Clone'], takes: [], ongenerate, cloneModels } })
    await generateOn('Clone')
    expect(ongenerate).toHaveBeenLastCalledWith('clone', expect.objectContaining({ cloneModel: 'quality' }))
    await fireEvent.click(screen.getByText('Fast'))
    await generateOn('Clone')
    expect(ongenerate).toHaveBeenLastCalledWith('clone', expect.objectContaining({ cloneModel: 'fast' }))
  })

  it('offers no model choice for a single clone model', () => {
    render(VoiceStudio, { props: { modes: ['Clone'], takes: [], cloneModels: [{ id: 'quality', label: 'Quality' }] } })
    expect(screen.queryByRole('radiogroup', { name: 'Model' })).toBeNull()
  })

  it('sends a preset’s language with its speaker', async () => {
    const ongenerate = vi.fn()
    render(VoiceStudio, {
      props: { modes: ['Preset'], takes: [], ongenerate, speakers: [{ id: 'vivian', name: 'Vivian' }], languages: { preset: ['en', 'zh'] } },
    })
    await fireEvent.click(screen.getByRole('button', { name: 'Vivian' }))
    await generateOn('Preset')
    expect(ongenerate).toHaveBeenCalledWith('preset', expect.objectContaining({ speaker: 'vivian', lang: 'en' }))
  })
})

// D90 — lock mode (khaos-app design "Locking a designed voice", K1 and K2). Opened on a
// designed voice, the studio auditions its own description and ends in locking the voice to
// one take. Locking is the host's: the studio reports the take, as it reports a save.
describe('VoiceStudio in lock mode (D90)', () => {
  const MADISON = { name: 'Madison', description: 'a warm, grounded voice', locked: false }
  const SPOKEN = [
    { id: 't2', label: 'Take 2', createdAt: '2026-10-07T10:02:00Z', voiceName: 'a warm, grounded voice', src: 'blob:2', text: 'Hello there.' },
    { id: 't1', label: 'Take 1', createdAt: '2026-10-07T10:01:00Z', voiceName: 'a warm, grounded voice', src: 'blob:1', text: 'Hello there.' },
  ]

  it('offers the Design tab alone, on the voice’s own description, read-only', () => {
    render(VoiceStudio, { props: { lockVoice: MADISON, takes: [] } })
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent.trim())).toEqual(['Design'])
    const description = screen.getByLabelText('Voice description')
    expect(description).toHaveValue('a warm, grounded voice')
    expect(description).toHaveAttribute('readonly')
  })

  it('generates from the voice’s description', async () => {
    const ongenerate = vi.fn()
    render(VoiceStudio, { props: { lockVoice: MADISON, takes: [], ongenerate } })
    await fireEvent.input(screen.getByLabelText('Text'), { target: { value: 'Hello there.' } })
    await fireEvent.click(screen.getByRole('button', { name: /^Generate$/ }))
    expect(ongenerate).toHaveBeenCalledWith('design', expect.objectContaining({ instruct: 'a warm, grounded voice', text: 'Hello there.' }))
  })

  it('generates from the description the host read after it opened', async () => {
    const ongenerate = vi.fn()
    const { rerender } = render(VoiceStudio, { props: { lockVoice: { ...MADISON, description: '' }, takes: [], ongenerate } })
    await rerender({ lockVoice: MADISON, takes: [], ongenerate })
    expect(screen.getByLabelText('Voice description')).toHaveValue('a warm, grounded voice')
    await fireEvent.input(screen.getByLabelText('Text'), { target: { value: 'Hello there.' } })
    await fireEvent.click(screen.getByRole('button', { name: /^Generate$/ }))
    expect(ongenerate).toHaveBeenCalledWith('design', expect.objectContaining({ instruct: 'a warm, grounded voice' }))
  })

  it('moves focus to the line field on open', async () => {
    render(VoiceStudio, { props: { lockVoice: MADISON, takes: [] } })
    await tick()
    expect(document.activeElement).toBe(screen.getByLabelText('Text'))
  })

  it('has one button naming the voice and the take in place of the name and the keep choice', () => {
    render(VoiceStudio, { props: { lockVoice: MADISON, takes: SPOKEN, onLock: () => {} } })
    expect(screen.queryByLabelText('Name')).toBeNull()
    expect(screen.queryByText('Lock voice to the take')).toBeNull()
    expect(screen.queryByRole('button', { name: /Save voice/ })).toBeNull()
    expect(
      screen.getByText(
        'Every line Madison speaks will sound like this take. Audition with one sentence: each sentence is designed anew, so a longer take can change voice partway, and the lock keeps that.',
      ),
    ).toBeInTheDocument()
    // The chosen take, else the newest that plays: none is chosen, so Take 2.
    expect(screen.getByRole('button', { name: 'Lock Madison to Take 2' })).toBeEnabled()
  })

  it('reports the chosen take when the lock is pressed', async () => {
    const onLock = vi.fn()
    render(VoiceStudio, { props: { lockVoice: MADISON, takes: SPOKEN, chosenTakeId: 't1', onLock } })
    await fireEvent.click(screen.getByRole('button', { name: 'Lock Madison to Take 1' }))
    expect(onLock).toHaveBeenCalledWith('t1')
  })

  it('never names a take that failed', () => {
    const failed = { id: 't3', label: 'Take 3', createdAt: '2026-10-07T10:03:00Z', voiceName: 'x', error: 'engine stopped' }
    render(VoiceStudio, { props: { lockVoice: MADISON, takes: [failed, ...SPOKEN], onLock: () => {} } })
    expect(screen.getByRole('button', { name: 'Lock Madison to Take 2' })).toBeInTheDocument()
  })

  it('cannot lock before there is a take, and says what to do', async () => {
    const onLock = vi.fn()
    render(VoiceStudio, { props: { lockVoice: MADISON, takes: [], onLock } })
    const lock = screen.getByRole('button', { name: 'Lock Madison' })
    expect(lock).toBeDisabled()
    expect(screen.getByText('Generate a take, then choose the one Madison should sound like.')).toBeInTheDocument()
    await fireEvent.click(lock)
    // A disabled button stops a click; the form refuses a submit made any other way.
    await fireEvent.submit(lock.closest('form'))
    expect(onLock).not.toHaveBeenCalled()
  })

  it('shows the host’s reason and does not lock while it stands', async () => {
    const onLock = vi.fn()
    render(VoiceStudio, { props: { lockVoice: MADISON, takes: SPOKEN, onLock, saveReason: 'This khaosd cannot lock voices.' } })
    const lock = screen.getByRole('button', { name: 'Lock Madison to Take 2' })
    expect(lock).toBeDisabled()
    expect(screen.getByText('This khaosd cannot lock voices.')).toBeInTheDocument()
    await fireEvent.click(lock)
    expect(onLock).not.toHaveBeenCalled()
  })

  it('says it is locking, busy, and announces it', () => {
    render(VoiceStudio, { props: { lockVoice: MADISON, takes: SPOKEN, onLock: () => {}, saving: true } })
    const lock = screen.getByRole('button', { name: 'Locking…' })
    expect(lock).toBeDisabled()
    expect(lock).toHaveAttribute('aria-busy', 'true')
    expect(screen.getAllByRole('status').some((s) => s.textContent.includes('Locking Madison to Take 2…'))).toBe(true)
  })

  it('offers to change the take of a voice already locked, reporting it for the host to confirm', async () => {
    const onLock = vi.fn()
    render(VoiceStudio, { props: { lockVoice: { ...MADISON, locked: true }, takes: SPOKEN, onLock } })
    expect(screen.queryByRole('button', { name: /^Lock Madison/ })).toBeNull()
    await fireEvent.click(screen.getByRole('button', { name: 'Change the take…' }))
    expect(onLock).toHaveBeenCalledWith('t2')
  })

  it('warns before locking a take of several sentences (E4)', () => {
    const long = [{ ...SPOKEN[0], text: 'Hello there. It has been a long time.' }]
    render(VoiceStudio, { props: { lockVoice: MADISON, takes: long, onLock: () => {} } })
    expect(screen.getByText('Take 2 is more than one sentence, so it may not be one consistent voice.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lock Madison to Take 2' })).toBeEnabled()
  })

  it('does not warn about a take of one sentence', () => {
    render(VoiceStudio, { props: { lockVoice: MADISON, takes: SPOKEN, onLock: () => {} } })
    expect(screen.queryByText(/more than one sentence/)).toBeNull()
  })
})

describe('VoiceStudio saving a new design (K2)', () => {
  it('keeps the take as a sample by default, and says a sample cannot be cast until it is locked', () => {
    render(VoiceStudio, { props: { takes: TAKES } })
    expect(
      screen.getByText(
        'Stays designed: each line is designed anew from the description, and the take is kept with it. It cannot be cast until it is locked.',
      ),
    ).toBeInTheDocument()
  })
})

describe('hosted voice identity workbench', () => {
  const choice = { id: 'flash/design', label: 'Gemini TTS · Flash', operation: 'voice.design', ready: true }
  it('creates a design without a per-request paid-consent ask or numeric sampling (K: "Budget is consent")', async () => {
    const onHostedDesign = vi.fn()
    render(VoiceStudio, { props: { hostedChoices: [choice], hostedChoiceId: choice.id, onHostedDesign } })
    await fireEvent.input(screen.getByLabelText('Voice name'), { target: { value: 'Mara' } })
    await fireEvent.input(screen.getByLabelText('Voice description'), { target: { value: 'Low, calm' } })
    const generate = screen.getByRole('button', { name: 'Create candidate' })
    expect(screen.queryByRole('checkbox', { name: /price ceiling/ })).toBeNull()
    expect(generate).toBeEnabled()
    await fireEvent.click(generate)
    expect(onHostedDesign).toHaveBeenCalledWith({ name: 'Mara', description: 'Low, calm' })
    expect(screen.queryByText('Temperature')).toBeNull()
  })
  it('shows an uncertified provider and its reason without permitting creation', () => {
    render(VoiceStudio, { props: { hostedChoices: [{ ...choice, ready: false, reason: 'Uncertified' }], hostedChoiceId: choice.id } })
    expect(screen.getByText('Uncertified')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create candidate' })).toBeDisabled()
  })

  // The picker listed every model the catalogue names, ready or not, and picking one that
  // could not run did nothing and said nothing.
  it('lists a choice the host cannot run as not available, and does not let it be picked', () => {
    render(VoiceStudio, { props: { hostedChoices: [choice, { ...choice, id: 'lite', label: 'Gemini TTS · Lite · Design', ready: false, reason: 'Not proven yet' }], hostedChoiceId: '' } })
    const unavailable = screen.getByRole('option', { name: 'Gemini TTS · Lite · Design · not available' })
    expect(unavailable).toBeDisabled()
    expect(screen.getByRole('option', { name: choice.label })).not.toBeDisabled()
  })
  it('accepts heard provider identity separately from generation and local take locking', async () => {
    const onHostedAccept = vi.fn()
    render(VoiceStudio, { props: { hostedChoices: [choice], hostedChoiceId: choice.id, hostedCandidate: { id: 'candidate', name: 'Mara', src: 'blob:preview' }, onHostedAccept } })
    await fireEvent.click(screen.getByRole('button', { name: 'Accept and lock Mara' }))
    expect(onHostedAccept).toHaveBeenCalledWith('candidate')
    expect(screen.queryByRole('button', { name: /Save voice/ })).toBeNull()
    expect(screen.queryByText('Keep take as a sample')).toBeNull()
  })
})

describe('hosted human voice replication', () => {
  it('requires separate source and provider consent recordings and attestation', async () => {
    render(VoiceStudio, { props: { hostedChoices: [{ id: 'clone', label: 'Gemini TTS · Human replication', operation: 'voice.clone', ready: true }], hostedChoiceId: 'clone', onHostedClone: vi.fn() } })
    expect(screen.getByLabelText('Adult human source recording')).toHaveAttribute('accept', 'audio/wav,.wav')
    expect(screen.getByLabelText('Provider consent recording')).toHaveAttribute('accept', 'audio/wav,.wav')
    expect(screen.getByRole('checkbox', { name: /adult human subject/ })).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Create human clone candidate' })).toBeDisabled()
    expect(screen.getByText(/Locally generated voices cannot be replicated/)).toBeInTheDocument()
  })
})

// Host-provided Developer API requirements; the kit does not own provider policy.
const CLONE_REQUIREMENTS = {
  consentStatement: 'I am the owner of this voice and I consent to Google using this voice to create a synthetic voice model.',
  documentationUrl: 'https://ai.google.dev/gemini-api/docs/voice-replication',
  sourceMinSeconds: 10,
  sourceMaxSeconds: 30,
  consentLocale: 'en-US',
  sourceInstructions: 'Record clean, natural speech. Both recordings must be real, unmodified recordings of the same adult speaker.',
  consentInstructions: 'Record the same adult speaker clearly reciting the mandatory statement.',
  mimeType: 'audio/wav',
  sampleRate: 24000,
  channels: 1,
  bitsPerSample: 16,
}
const CLONE_CHOICE = { id: 'clone', label: 'Gemini TTS · Human replication', operation: 'voice.clone', ready: true, cloneRequirements: CLONE_REQUIREMENTS }
async function completeCloneForm() {
  await fireEvent.input(screen.getByLabelText('Voice name'), { target: { value: 'Mara' } })
  const source = new File(['real-source-fixture'], 'source.wav', { type: 'audio/wav' })
  const recording = new File(['human-consent-fixture'], 'consent.wav', { type: 'audio/wav' })
  await fireEvent.change(screen.getByLabelText('Adult human source recording'), { target: { files: [source] } })
  await fireEvent.change(screen.getByLabelText('Provider consent recording'), { target: { files: [recording] } })
  await fireEvent.input(screen.getByLabelText('Subject or authorized representative'), { target: { value: 'Mara' } })
  await fireEvent.input(screen.getByLabelText('Allowed uses, separated by commas'), { target: { value: 'Narration, Dialogue' } })
  await fireEvent.input(screen.getByLabelText('Consent recorded at'), { target: { value: '2026-10-11T20:00' } })
  await fireEvent.input(screen.getByLabelText('Recording source'), { target: { value: 'Recorded by subject' } })
  await fireEvent.click(screen.getByRole('checkbox', { name: /adult human subject/ }))
  return { source, recording }
}
describe('hosted replication requirements and unresolved work', () => {
  it('shows host supplied mandatory spoken statement, duration and official documentation', () => {
    render(VoiceStudio, { props: { hostedChoices: [CLONE_CHOICE], hostedChoiceId: 'clone' } })
    expect(screen.getByText(CLONE_REQUIREMENTS.consentStatement)).toBeInTheDocument()
    expect(screen.getByText('Source recording: 10–30 seconds.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Provider recording requirements' })).toHaveAttribute('href', CLONE_REQUIREMENTS.documentationUrl)
  })
  it('emits a complete human clone request only after the required inputs and consent', async () => {
    const onHostedClone = vi.fn()
    render(VoiceStudio, { props: { hostedChoices: [CLONE_CHOICE], hostedChoiceId: 'clone', onHostedClone } })
    const { source, recording } = await completeCloneForm()
    const button = screen.getByRole('button', { name: 'Create human clone candidate' })
    expect(button).toBeEnabled()
    await fireEvent.click(button)
    expect(onHostedClone).toHaveBeenCalledWith({ name: 'Mara', source, recording, subjectOrAuthority: 'Mara', allowedUses: 'Narration, Dialogue', capturedAt: '2026-10-11T20:00', sourceDescription: 'Recorded by subject', expiresAt: '', attested: true })
  })
  it('refuses cloning when host recording requirements are absent, even with complete inputs', async () => {
    const onHostedClone = vi.fn()
    render(VoiceStudio, { props: { hostedChoices: [{ ...CLONE_CHOICE, cloneRequirements: undefined }], hostedChoiceId: 'clone', onHostedClone } })
    await completeCloneForm()
    expect(screen.getByRole('button', { name: 'Create human clone candidate' })).toBeDisabled()
    expect(screen.getByText('Provider recording requirements are unavailable.')).toBeInTheDocument()
  })
  it('blocks complete cloning and acceptance while an operation requires reconciliation', async () => {
    const onHostedClone = vi.fn()
    const onHostedAccept = vi.fn()
    render(VoiceStudio, { props: { hostedChoices: [CLONE_CHOICE], hostedChoiceId: 'clone', hostedBlocked: true, hostedStatus: 'Requires reconciliation', hostedCandidate: { id: 'pending', name: 'Mara', src: 'blob:preview' }, onHostedClone, onHostedAccept } })
    await completeCloneForm()
    expect(screen.getByRole('button', { name: 'Create human clone candidate' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Accept and lock Mara' })).toBeDisabled()
    expect(screen.getByText('Requires reconciliation')).toBeInTheDocument()
  })
})

describe('controlled hosted consent scope', () => {
  it.each([
    ['provider choice', { ...CLONE_CHOICE, id: 'clone-other', label: 'Other provider' }],
    ['profile revision', { ...CLONE_CHOICE, profile: 'reviewed-v2' }],
    ['mandatory consent statement', { ...CLONE_CHOICE, cloneRequirements: { ...CLONE_REQUIREMENTS, consentStatement: 'Statement for a different reviewed requirement' } }],
  ])('clears human attestation and provider recording when host changes %s', async (_label, next) => {
    const onHostedClone = vi.fn()
    const { rerender } = render(VoiceStudio, { props: { hostedChoices: [{ ...CLONE_CHOICE, profile: 'reviewed-v1' }], hostedChoiceId: CLONE_CHOICE.id, onHostedClone } })
    await completeCloneForm()
    expect(screen.getByRole('button', { name: 'Create human clone candidate' })).toBeEnabled()
    await rerender({ hostedChoices: [next], hostedChoiceId: next.id, onHostedClone })
    expect(screen.getByRole('checkbox', { name: /adult human subject/ })).not.toBeChecked()
    expect(screen.getByLabelText('Provider consent recording').files).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Create human clone candidate' })).toBeDisabled()
    expect(onHostedClone).not.toHaveBeenCalled()
  })
})

describe('VoiceStudio seeded from a character', () => {
  const seed = { name: 'Fifth', description: 'Male, thirty two. Casual register.', text: "Hey Blaine. How's it hanging?" }

  it('starts the Design tab and the name from the seed', () => {
    render(VoiceStudio, { props: { seed, takes: [], onSave: () => {} } })
    expect(screen.getByDisplayValue(seed.description)).toBeTruthy()
    expect(screen.getByDisplayValue(seed.text)).toBeTruthy()
    expect(screen.getByDisplayValue('Fifth')).toBeTruthy()
  })

  it('starts the hosted form from the seed', () => {
    render(VoiceStudio, { props: { seed, hostedChoices: [{ id: 'g', label: 'Gemini', operation: 'voice.design', ready: true }], onHostedDesign: () => {} } })
    expect(screen.getByDisplayValue(seed.description)).toBeTruthy()
    expect(screen.getByDisplayValue('Fifth')).toBeTruthy()
  })
})

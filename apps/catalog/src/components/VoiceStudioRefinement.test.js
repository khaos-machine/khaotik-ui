import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte'
import VoiceStudio from '@khaos-machine/khaotik-ui/components/svelte/VoiceStudio.svelte'

const choice = { id: 'gemini/design', label: 'Gemini voice design', operation: 'voice.design', ready: true }
const props = { hostedChoices: [choice], hostedChoiceId: choice.id, seed: { name: 'Officer', description: 'Existing description' } }

describe('optional voice description refinement', () => {
  it('requires an explicit draft choice before creating a candidate after refinement', async () => {
    const create = vi.fn()
    render(VoiceStudio, { props: { ...props, onHostedDesign: create, onRefineDescription: async () => ({ description: 'A revised voice.', notes: [] }) } })
    expect(screen.getByRole('button', { name: 'Create candidate' }).disabled).toBe(false)
    await fireEvent.click(screen.getByRole('button', { name: 'Refine for voice design' }))
    await screen.findByRole('button', { name: 'Use this description' })
    expect(screen.getByRole('button', { name: 'Create candidate' }).disabled).toBe(true)
    await fireEvent.click(screen.getByRole('button', { name: 'Create candidate' }))
    expect(create).not.toHaveBeenCalled()
    await fireEvent.click(screen.getByRole('button', { name: 'Keep my description' }))
    expect(screen.getByRole('button', { name: 'Create candidate' }).disabled).toBe(false)
  })
  it('keeps manual design available without prompt refinement', async () => {
    const create = vi.fn()
    render(VoiceStudio, { props: { ...props, onHostedDesign: create } })
    expect(screen.queryByRole('button', { name: 'Refine for voice design' })).toBeNull()
    await fireEvent.click(screen.getByRole('button', { name: 'Create candidate' }))
    expect(create).toHaveBeenCalledWith({ name: 'Officer', description: 'Existing description' })
  })

  it('preserves edits during generation and applies a proposal only on explicit acceptance', async () => {
    let resolve
    const refine = vi.fn(() => new Promise((done) => { resolve = done }))
    const create = vi.fn()
    render(VoiceStudio, { props: { ...props, onRefineDescription: refine, onHostedDesign: create } })
    const input = screen.getByRole('textbox', { name: 'Voice description' })
    await fireEvent.click(screen.getByRole('button', { name: 'Refine for voice design' }))
    expect(refine).toHaveBeenCalledWith('Existing description', expect.any(AbortSignal))
    await fireEvent.input(input, { target: { value: 'My newer edit' } })
    resolve({ description: 'Low and dry, with precise articulation.', notes: ['Timbre is a creative suggestion.'] })
    await screen.findByRole('button', { name: 'Use this description' })
    expect(input.value).toBe('My newer edit')
    expect(screen.getByText('Timbre is a creative suggestion.')).toBeTruthy()
    expect(screen.getByText(/Your description changed/)).toBeTruthy()
    expect(create).not.toHaveBeenCalled()
    await fireEvent.click(screen.getByRole('button', { name: 'Use this description' }))
    expect(input.value).toBe('Low and dry, with precise articulation.')
    expect(create).not.toHaveBeenCalled()
  })

  it('retains the original draft when regeneration fails or is dismissed', async () => {
    const refine = vi.fn().mockResolvedValueOnce({ description: 'A proposed voice.', notes: [] }).mockRejectedValueOnce(new Error('Text provider unavailable'))
    render(VoiceStudio, { props: { ...props, onRefineDescription: refine } })
    await fireEvent.click(screen.getByRole('button', { name: 'Refine for voice design' }))
    await screen.findByRole('button', { name: 'Regenerate draft' })
    await fireEvent.click(screen.getByRole('button', { name: 'Regenerate draft' }))
    await screen.findByRole('alert')
    expect(screen.getByText('A proposed voice.')).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Voice description' }).value).toBe('Existing description')
    await fireEvent.click(screen.getByRole('button', { name: 'Keep my description' }))
    expect(screen.queryByText('A proposed voice.')).toBeNull()
  })

  it('aborts an outstanding text request when the character studio closes', async () => {
    let signal
    const refine = vi.fn((_description, current) => { signal = current; return new Promise(() => {}) })
    const view = render(VoiceStudio, { props: { ...props, onRefineDescription: refine } })
    await fireEvent.click(screen.getByRole('button', { name: 'Refine for voice design' }))
    view.unmount()
    await waitFor(() => expect(signal.aborted).toBe(true))
  })

  it('allows preparing the next description while a prior provider operation still needs reconciliation', async () => {
    const refine = vi.fn().mockResolvedValue({ description: 'A revised vocal identity.', notes: [] })
    render(VoiceStudio, { props: { ...props, hostedBlocked: true, onRefineDescription: refine } })
    expect(screen.getByRole('textbox', { name: 'Voice description' }).disabled).toBe(false)
    await fireEvent.click(screen.getByRole('button', { name: 'Refine for voice design' }))
    await screen.findByRole('button', { name: 'Use this description' })
    await fireEvent.click(screen.getByRole('button', { name: 'Use this description' }))
    expect(screen.getByRole('textbox', { name: 'Voice description' }).value).toBe('A revised vocal identity.')
    expect(screen.getByRole('button', { name: 'Create candidate' }).disabled).toBe(true)
  })
})
it('creates a new description from explicit language, region and voice traits before any paid audio action',async()=>{
 const refine=vi.fn(async()=>({description:'A warm mature woman speaking Mexican Spanish with a Mexico City accent.',notes:[]})),create=vi.fn()
 render(VoiceStudio,{hostedChoices:[choice],hostedChoiceId:choice.id,onRefineDescription:refine,onHostedDesign:create})
 await fireEvent.click(screen.getByText('Voice traits · language and accent'))
 await fireEvent.input(screen.getByRole('textbox',{name:'Voice language code'}),{target:{value:'es-MX'}})
 await fireEvent.input(screen.getByRole('textbox',{name:'Voice region code'}),{target:{value:'MX'}})
 await fireEvent.input(screen.getByRole('textbox',{name:'Voice regional accent'}),{target:{value:'Mexico City'}})
 await fireEvent.input(screen.getByRole('textbox',{name:'Voice age impression'}),{target:{value:'50s'}})
 await fireEvent.click(screen.getByRole('button',{name:'Generate voice description'}))
 await waitFor(()=>expect(refine).toHaveBeenCalledWith('',expect.any(AbortSignal),{languageCode:'es-MX',regionCode:'MX',accent:'Mexico City',age:'50s'}))
 expect(create).not.toHaveBeenCalled()
 expect(screen.getByRole('textbox',{name:'Voice description'})).toHaveValue('')
 await fireEvent.click(screen.getByRole('button',{name:'Use this description'}))
 expect(screen.getByRole('textbox',{name:'Voice description'})).toHaveValue('A warm mature woman speaking Mexican Spanish with a Mexico City accent.')
})

describe('a refused refinement offers its fixes (budget_not_set)', () => {
  // The host's EngineFailure, as the app's adapter throws it: khaosd's code in the message, the
  // typed cause beside it. The kit never reads either; the host maps the failure to an offer.
  class EngineFailure extends Error {
    constructor(engineError) { super(`${engineError.code}: ${engineError.message}`); this.engineError = engineError }
  }
  const unbudgeted = new EngineFailure({ code: 'BUDGET_NOT_SET', message: 'This story has no budget.', cause: 'budget_not_set' })
  const refinementRefusal = (error) => error instanceof EngineFailure && error.engineError.cause === 'budget_not_set'
    ? { offer: { headline: 'This story has no budget yet.', detail: error.engineError.message, fixes: [{ kind: 'budget', label: 'Set budget…' }] }, onFix: fixed, onReport: reported }
    : null
  const fixed = vi.fn(), reported = vi.fn()

  it('draws the host’s offer with Set budget… and Report a Problem…, and reports the fix', async () => {
    render(VoiceStudio, { props: { ...props, onRefineDescription: vi.fn().mockRejectedValue(unbudgeted), refinementRefusal } })
    await fireEvent.click(screen.getByRole('button', { name: 'Refine for voice design' }))
    const offer = await screen.findByRole('group', { name: 'This story has no budget yet.' })
    expect(offer.textContent).toContain('This story has no budget.')
    expect(offer.textContent).not.toContain('BUDGET_NOT_SET')
    await fireEvent.click(screen.getByRole('button', { name: 'Set budget…' }))
    expect(fixed).toHaveBeenCalledWith({ kind: 'budget', label: 'Set budget…' })
    await fireEvent.click(screen.getByRole('button', { name: 'Report a Problem…' }))
    expect(reported).toHaveBeenCalledOnce()
  })

  it('keeps the plain message for a failure the host does not map, and clears the offer on a new try', async () => {
    const refine = vi.fn().mockRejectedValueOnce(unbudgeted).mockRejectedValueOnce(new Error('Text provider unavailable'))
    render(VoiceStudio, { props: { ...props, onRefineDescription: refine, refinementRefusal } })
    await fireEvent.click(screen.getByRole('button', { name: 'Refine for voice design' }))
    await screen.findByRole('button', { name: 'Set budget…' })
    await fireEvent.click(screen.getByRole('button', { name: 'Refine for voice design' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Text provider unavailable')
    expect(screen.queryByRole('button', { name: 'Set budget…' })).toBeNull()
  })
})

describe('a refused hosted creation offers its fixes (budget_not_set)', () => {
  const offer = { headline: 'This story has no budget yet.', detail: 'This story has no budget.', fixes: [{ kind: 'budget', label: 'Set budget…' }] }

  it('draws the host’s offer in place of the status line, and reports the fix and Report a Problem…', async () => {
    const onFix = vi.fn(), onReport = vi.fn()
    render(VoiceStudio, { props: { ...props, onHostedDesign: vi.fn(), hostedStatus: 'BUDGET_NOT_SET: This story has no budget.', hostedRefusal: { offer, onFix, onReport } } })
    expect(screen.getByRole('group', { name: 'This story has no budget yet.' })).toBeTruthy()
    expect(screen.queryByText(/BUDGET_NOT_SET/)).toBeNull()
    await fireEvent.click(screen.getByRole('button', { name: 'Set budget…' }))
    expect(onFix).toHaveBeenCalledWith({ kind: 'budget', label: 'Set budget…' })
    await fireEvent.click(screen.getByRole('button', { name: 'Report a Problem…' }))
    expect(onReport).toHaveBeenCalledOnce()
  })

  it('shows the status line as before with no refusal', () => {
    render(VoiceStudio, { props: { ...props, onHostedDesign: vi.fn(), hostedStatus: 'Creating provider candidate…', hostedRefusal: null } })
    expect(screen.getByText('Creating provider candidate…')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Report a Problem…' })).toBeNull()
  })
})

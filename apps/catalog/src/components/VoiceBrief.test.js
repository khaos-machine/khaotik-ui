import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/svelte'
import VoiceBrief from '@khaos-machine/khaotik-ui/components/svelte/VoiceBrief.svelte'
import CharacterSide from '@khaos-machine/khaotik-ui/components/svelte/CharacterSide.svelte'
import voiceBriefs from '../data/voice-briefs.json'

// The engine's voice brief, captured from khaosd (voice-briefs.json). What the analysis suggests
// is kept apart from what the script states, so nothing suggested reads as stated.

const madison = { kind: 'ready', brief: voiceBriefs.madison }

describe('VoiceBrief', () => {
  it('shows what the script says, what the analysis suggests beyond it, and lines to audition', () => {
    const { container } = render(VoiceBrief, { props: { name: 'Madison', read: madison } })
    expect(screen.getByText('From the script')).toBeInTheDocument()
    expect(screen.getByText(voiceBriefs.madison.description)).toBeInTheDocument()
    const [suggested, lines] = container.querySelectorAll('.ui-voice-brief__list')
    expect(suggested.querySelectorAll('li')).toHaveLength(voiceBriefs.madison.suggested.length)
    expect(suggested.textContent).toContain(voiceBriefs.madison.suggested[0].restsOn)
    expect(lines.querySelectorAll('li')).toHaveLength(voiceBriefs.madison.auditionLines.length)
  })

  it('leaves out what the voice studio already shows: the description and the first line', () => {
    const { container } = render(VoiceBrief, { props: { name: 'Madison', read: madison, description: false, linesFrom: 1 } })
    expect(screen.queryByText('From the script')).toBeNull()
    expect(screen.getByText('More lines to audition')).toBeInTheDocument()
    const lines = [...container.querySelectorAll('.ui-voice-brief__list')].at(-1)
    expect(lines.querySelectorAll('li')).toHaveLength(voiceBriefs.madison.auditionLines.length - 1)
    expect(lines.textContent).not.toContain(voiceBriefs.madison.auditionLines[0].line)
  })

  it("says what the narrator's story doesn't give", () => {
    render(VoiceBrief, { props: { name: 'Narrator', read: { kind: 'ready', brief: { ...voiceBriefs.narrator, gaps: ['genre', 'premise'] } } } })
    expect(screen.getByText("The story doesn't give a genre or a premise.")).toBeInTheDocument()
  })

  it('says a character with no lines has nothing to design from, and nothing else', () => {
    const { container } = render(VoiceBrief, { props: { name: 'POP', read: { kind: 'ready', brief: { speaks: false, description: 'ignored', auditionLines: [], suggested: [] } } } })
    expect(screen.getByText('POP has no lines, so there is nothing to design a voice from.')).toBeInTheDocument()
    expect(container.querySelector('.ui-voice-brief__list')).toBeNull()
  })

  it("announces a read that failed, in the host's words", () => {
    render(VoiceBrief, { props: { name: 'Madison', read: { kind: 'failed', message: "Madison hasn't been analysed yet." } } })
    expect(screen.getByRole('alert')).toHaveTextContent("Madison hasn't been analysed yet.")
  })
})

describe("CharacterSide shows the selection's voice brief under the picker", () => {
  it('in Casting, for a character', () => {
    render(CharacterSide, { props: { character: { id: 'c1', name: 'Madison' }, voiceBrief: madison } })
    const casting = screen.getByRole('region', { name: /Casting/ })
    expect(within(casting).getByText(voiceBriefs.madison.description)).toBeInTheDocument()
  })

  // The narrator's inspector takes the character's sections (khaos-app#620).
  it('in Casting, for the narrator', () => {
    render(CharacterSide, { props: { narrator: true, voiceBrief: { kind: 'ready', brief: voiceBriefs.narrator } } })
    const casting = screen.getByRole('region', { name: /Casting/ })
    expect(within(casting).getByText(voiceBriefs.narrator.description)).toBeInTheDocument()
  })

  it('shows no brief when the host gives none', () => {
    const { container } = render(CharacterSide, { props: { character: { id: 'c1', name: 'Madison' } } })
    expect(container.querySelector('.ui-voice-brief')).toBeNull()
  })
})

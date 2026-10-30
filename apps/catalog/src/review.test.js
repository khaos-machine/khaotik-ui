import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/svelte'
import { characterNamed, groupNote, referentChoices, reviewPhrase, reviewTitle } from '@khaos-machine/khaotik-ui/components/svelte/lib/review.js'
import ExtractionReview from '@khaos-machine/khaotik-ui/components/svelte/ExtractionReview.svelte'
import ReviewOccurrences from '@khaos-machine/khaotik-ui/components/svelte/ReviewOccurrences.svelte'
import ReviewSide from '@khaos-machine/khaotik-ui/components/svelte/ReviewSide.svelte'
import ReviewSuggestions from '@khaos-machine/khaotik-ui/components/svelte/ReviewSuggestions.svelte'

// Khaos App's Review destination in the kit (catalog app-coverage plan, T6). What a record
// offers is the host's; these pin what the kit draws from it and what it reports back.

const SRC = { sceneId: 'scene_1', lineText: 'The SCREEN DOOR slides open and DICK STEEL emerges.' }
const STEEL = { kind: 'entityAppearance', record: { ...SRC, id: 'appear_e', lineNumber: 17, sourcePhrase: 'DICK STEEL', name: 'DICK STEEL', entityKind: 'individual' } }
const DOOR = { kind: 'objectAppearance', record: { ...SRC, id: 'appear_o', lineNumber: 17, sourcePhrase: 'SCREEN DOOR', displayNoun: 'SCREEN DOOR', candidateObjectIds: [] } }
const DOOR2 = { kind: 'objectAppearance', record: { ...DOOR.record, id: 'appear_o2', lineNumber: 40 } }
const WOODS = { kind: 'reference', record: { ...SRC, id: 'ref_w', lineNumber: 26, sourcePhrase: 'the woods', referentKind: 'location', name: 'the woods', candidateIds: ['location_yard'] } }
const STORY = {
  characters: [{ id: 'character_steel', name: 'STEEL', aliases: ['Dick Steel'] }, { id: 'character_brick', name: 'BRICK' }],
  objects: [],
  groups: [],
  locations: [{ id: 'location_yard', name: 'Yard' }, { id: 'location_bar', name: 'Bar' }],
}
const DOORS = { key: 'object', kind: 'objectAppearance', label: 'SCREEN DOOR', items: [DOOR, DOOR2], scenes: 1 }

describe('how Review names a record', () => {
  it('titles each kind, and quotes its phrase', () => {
    expect(reviewTitle(STEEL)).toBe('DICK STEEL')
    expect(reviewTitle(DOOR)).toBe('SCREEN DOOR')
    expect(reviewPhrase(WOODS)).toBe('the woods')
  })

  it('finds a character by name or alias, ignoring case and spacing', () => {
    expect(characterNamed('  dick   steel ', STORY.characters)?.id).toBe('character_steel')
    expect(characterNamed('', STORY.characters)).toBeNull()
  })

  it('lists the suggested identities first, each once', () => {
    expect(referentChoices(WOODS.record, STORY)).toEqual([
      { value: 'location_yard', label: 'Yard', group: 'Suggested' },
      { value: 'location_bar', label: 'Bar', group: 'In the story' },
    ])
  })

  it('says which occurrences an answer decides', () => {
    expect(groupNote({ ...DOORS, included: DOORS.items })).toBe('Your answer applies to all 2 lines. Uncheck any that differ.')
    expect(groupNote({ ...DOORS, included: [DOOR] })).toBe('Your answer applies to 1 of 2 lines. The unchecked ones stay for later.')
    expect(groupNote({ ...DOORS, items: [DOOR] })).toBe('')
  })
})

describe('the occurrences', () => {
  // The rows are DataTable's, virtualised; jsdom measures no height, so none render here. The
  // checkboxes are proven in the catalog live pass.
  it('names the table after the chosen mention, or asks for one', () => {
    render(ReviewOccurrences, { props: { group: { ...DOORS, included: [DOOR] } } })
    expect(screen.getByRole('grid', { name: 'Occurrences of SCREEN DOOR' }).getAttribute('aria-rowcount')).toBe('3')
  })

  it('asks for a mention when none is chosen', () => {
    render(ReviewOccurrences, { props: { group: null } })
    expect(screen.getByText('No mention chosen')).toBeTruthy()
  })
})

describe('the answer pane', () => {
  it('draws the group note above the host answer', () => {
    render(ReviewSide, { props: { item: DOOR, group: { ...DOORS, included: [DOOR] }, count: 2 } })
    expect(screen.getByRole('status').textContent).toBe('Your answer applies to 1 of 2 lines. The unchecked ones stay for later.')
  })

  it('says nothing is left once the queue is empty', () => {
    render(ReviewSide, { props: { item: null, count: 0 } })
    expect(screen.getByText('Nothing to review')).toBeTruthy()
  })
})

describe('the suggestions', () => {
  it('reports the accepted decision unchanged, and a dismissal', async () => {
    const decision = { kind: 'objectAppearance' }
    const onaccept = vi.fn()
    const ondismiss = vi.fn()
    const suggestion = { sceneId: 'scene_1', recordId: 'appear_o', suggestion: 'new', outcome: 'accepted', dismissed: false }
    render(ReviewSuggestions, { props: { rows: [{ suggestion, offer: { says: 'This is new to the story.', accepts: [{ label: 'Accept as one thing', decision }], needs: '' } }], sceneNumber: () => 3, onaccept, ondismiss } })
    expect(screen.getByText('Scene 3')).toBeTruthy()
    await fireEvent.click(screen.getByRole('button', { name: 'Accept as one thing' }))
    expect(onaccept).toHaveBeenCalledWith(decision)
    await fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(ondismiss).toHaveBeenCalledWith(suggestion, true)
  })
})

describe('one record under review', () => {
  const decision = { kind: 'entityAppearance', verdict: 'bound' }
  const decisionsFor = vi.fn(({ answer, pick }) => ({
    kind: 'decidable',
    create: null,
    buttons: [{ verdict: 'bound', label: 'Bind', primary: true, decision: answer === 'existing' && pick ? decision : null }],
    hint: answer ? `answered ${answer}` : 'Choose who it is to bind it.',
  }))
  const answers = [{ key: 'new', title: 'A new character', subtitle: 'named DICK STEEL' }, { key: 'existing', title: 'Someone already in the story', subtitle: 'choose who' }]

  it('asks the host for each choice, and draws Bind disabled until it offers a decision', async () => {
    render(ExtractionReview, { props: { item: STEEL, story: STORY, sceneNumber: () => 4, answers, decisionsFor } })
    expect(screen.getByText('Scene S4 · line 17')).toBeTruthy()
    expect(decisionsFor).toHaveBeenLastCalledWith({ answer: null, pick: null })
    expect(screen.getByRole('button', { name: 'Bind' }).getAttribute('aria-disabled')).toBe('true')
    await fireEvent.click(screen.getByText('Someone already in the story'))
    expect(decisionsFor).toHaveBeenLastCalledWith({ answer: 'existing', pick: null })
    expect(screen.getByText('answered existing')).toBeTruthy()
  })

  it('sends the host decision with the phrase, how it is bound and the alias', async () => {
    const ondecide = vi.fn(async () => true)
    const steel = { ...STEEL, record: { ...STEEL.record, name: 'STEEL' } }
    render(ExtractionReview, { props: { item: steel, story: STORY, answers, decisionsFor, ondecide } })
    await fireEvent.click(screen.getByText('Someone already in the story'))
    // The menu's pick, as Menu reports it.
    const menu = screen.getByRole('button', { name: /Character/ })
    await fireEvent.click(menu)
    await fireEvent.click(screen.getByRole('menuitemradio', { name: 'STEEL' }))
    await fireEvent.click(screen.queryByRole('switch', { name: /^Always match/ }) ?? screen.getByRole('checkbox', { name: /^Always match/ }))
    await fireEvent.click(screen.getByRole('button', { name: 'Bind' }))
    expect(ondecide).toHaveBeenCalledWith(decision, 'DICK STEEL', 'to STEEL', { characterId: 'character_steel', characterName: 'STEEL', alias: 'STEEL' })
  })
})

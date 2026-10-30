import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import CharacterAliases from '@khaos-machine/khaotik-ui/components/svelte/CharacterAliases.svelte'
import CharacterAnalysis from '@khaos-machine/khaotik-ui/components/svelte/CharacterAnalysis.svelte'
import CharacterMentions from '@khaos-machine/khaotik-ui/components/svelte/CharacterMentions.svelte'
import CharacterRecordings from '@khaos-machine/khaotik-ui/components/svelte/CharacterRecordings.svelte'
import CharacterDetail from '@khaos-machine/khaotik-ui/components/svelte/CharacterDetail.svelte'
import CharacterSide from '@khaos-machine/khaotik-ui/components/svelte/CharacterSide.svelte'
import CharacterTable from '@khaos-machine/khaotik-ui/components/svelte/CharacterTable.svelte'
import { aliasGroups } from '@khaos-machine/khaotik-ui/components/svelte/lib/character-aliases.js'
import { sceneGroup } from '@khaos-machine/khaotik-ui/components/svelte/lib/recordings.js'
import destination from '../data/characters-destination.json'

// Khaos App's Characters panes, moved into the kit (catalog app-coverage plan, T2). Each is
// checked for the callbacks it reports and for its empty state; the host's models stay in the
// app. The alias and mention cases are the app's, re-hosted on props.

const STEEL = {
  id: 'character_steel',
  name: 'STEEL',
  aliases: ['STEEL', 'DICK STEEL', 'Dickie', 'MR. STEEL'],
  authoredAliases: ['Dickie'],
  introducedAliases: ['DICK STEEL'],
}
/** @param {string} id @param {number} lineNumber @param {string} lineText */
const mention = (id, lineNumber, lineText) => ({ id, name: 'Dickie', sceneId: 'scene_2', lineNumber, lineText })
const M1 = mention('appear_1', 12, 'Dickie lights a cigarette.')
const M2 = mention('ref_2', 30, 'Ask Dickie where he was.')
const M3 = mention('ref_3', 44, 'Dickie, BRICK’s kid brother, waves.')
const CAST = [
  { id: 'character_steel', name: 'STEEL' },
  { id: 'character_brick', name: 'BRICK' },
]
/** @param {typeof M1[]} mentions */
const strandedWith = (mentions) => ({ characterId: STEEL.id, characterName: 'STEEL', alias: 'Dickie', mentions })

describe('aliasGroups', () => {
  it("splits the names by who asserted them; the rest are the engine's, and the character's own name is not repeated", () => {
    expect(aliasGroups(STEEL)).toEqual({ authored: ['Dickie'], introduced: ['DICK STEEL'], other: ['MR. STEEL'] })
  })

  it('reads a row without the RFC 0097 fields as no authored or introduced aliases', () => {
    expect(aliasGroups({ id: 'c', name: 'ALMA' })).toEqual({ authored: [], introduced: [], other: [] })
  })
})

describe('CharacterAliases', () => {
  const section = () => within(screen.getByRole('region', { name: 'Aliases' }))

  it('offers Remove on an authored alias, "Not this character" on an introduced one, and nothing on the others', () => {
    render(CharacterAliases, { props: { character: STEEL, characters: CAST } })
    expect(section().getByRole('button', { name: 'Remove “Dickie”' })).toBeInTheDocument()
    expect(section().getByRole('button', { name: 'Not this character: “DICK STEEL”' })).toBeInTheDocument()
    expect(section().getByText('MR. STEEL')).toBeInTheDocument()
    expect(section().queryByRole('button', { name: /MR\. STEEL/ })).toBeNull()
  })

  it('confirms a removal naming the alias and the character, then reports it', async () => {
    const onRemove = vi.fn(() => true)
    render(CharacterAliases, { props: { character: STEEL, characters: CAST, onRemove } })
    await fireEvent.click(section().getByRole('button', { name: 'Remove “Dickie”' }))
    const dialog = await screen.findByRole('alertdialog').catch(() => screen.getByRole('dialog'))
    expect(within(dialog).getByText('Remove “Dickie” from STEEL?')).toBeInTheDocument()
    expect(within(dialog).getByText(/Mentions already matched stay matched/)).toBeInTheDocument()
    expect(onRemove).not.toHaveBeenCalled()
    await fireEvent.click(within(dialog).getByRole('button', { name: 'Remove' }))
    await vi.waitFor(() => expect(onRemove).toHaveBeenCalledWith('Dickie', 'authored'))
  })

  it('reports an added alias', async () => {
    const onAdd = vi.fn()
    render(CharacterAliases, { props: { character: STEEL, characters: CAST, onAdd } })
    await fireEvent.click(screen.getByRole('button', { name: 'Edit Add an alias' }))
    await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'Dick' } })
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await vi.waitFor(() => expect(onAdd).toHaveBeenCalledWith('Dick'))
  })

  it('lists each mention a removed alias matched, with its line, and reports a move of the ones chosen', async () => {
    const onMove = vi.fn()
    render(CharacterAliases, { props: { character: STEEL, characters: CAST, stranded: strandedWith([M1, M2, M3]), onMove } })
    const list = within(screen.getByRole('group', { name: 'Mentions matched through “Dickie”' }))
    expect(list.getAllByRole('checkbox')).toEqual([M1, M2, M3].map((m) => list.getByRole('checkbox', { name: m.lineText })))
    expect(screen.getByRole('button', { name: 'Move 0 mentions' })).toHaveAttribute('aria-disabled', 'true')
    await fireEvent.click(list.getByRole('checkbox', { name: M3.lineText }))
    await fireEvent.click(screen.getByRole('button', { name: /^Move to/ }))
    expect(screen.queryByRole('menuitemradio', { name: 'STEEL', hidden: true })).toBeNull()
    expect(screen.getByRole('menuitemradio', { name: 'A new character', hidden: true })).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('menuitemradio', { name: 'BRICK', hidden: true }))
    await fireEvent.click(screen.getByRole('button', { name: 'Move 1 mention' }))
    const dialog = await screen.findByRole('alertdialog').catch(() => screen.getByRole('dialog'))
    expect(within(dialog).getByText('Move 1 mention of “Dickie” to BRICK?')).toBeInTheDocument()
    await fireEvent.click(within(dialog).getByRole('button', { name: 'Move' }))
    await vi.waitFor(() => expect(onMove).toHaveBeenCalledWith(['ref_3'], { kind: 'existing', characterId: 'character_brick' }, 'BRICK'))
  })

  it('announces each mention as checked or not, by its line', async () => {
    render(CharacterAliases, { props: { character: STEEL, characters: CAST, stranded: strandedWith([M1, M2]) } })
    const row = screen.getByRole('checkbox', { name: M2.lineText })
    expect(row).not.toBeChecked()
    await fireEvent.click(row)
    await vi.waitFor(() => expect(screen.getByRole('checkbox', { name: M2.lineText })).toBeChecked())
    expect(screen.getByRole('checkbox', { name: M1.lineText })).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Move 1 mention' })).toBeInTheDocument()
  })

  it('selects every listed mention at once, and reports leaving them', async () => {
    const onLeave = vi.fn()
    render(CharacterAliases, { props: { character: STEEL, characters: CAST, stranded: strandedWith([M1, M2]), onLeave } })
    await fireEvent.click(screen.getByRole('button', { name: 'Select all' }))
    expect(screen.getByRole('button', { name: 'Move 2 mentions' })).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Leave them' }))
    expect(onLeave).toHaveBeenCalledOnce()
  })

  it("shows no stranded mentions that are another character's", () => {
    render(CharacterAliases, { props: { character: STEEL, characters: CAST, stranded: { ...strandedWith([M1]), characterId: 'character_brick' } } })
    expect(screen.queryByRole('group', { name: /Mentions matched through/ })).toBeNull()
  })

  it('is empty for a character with no aliases: only the field to add one', () => {
    render(CharacterAliases, { props: { character: { id: 'c', name: 'ALMA' } } })
    expect(screen.queryByRole('list')).toBeNull()
    expect(screen.getByRole('button', { name: 'Edit Add an alias' })).toBeInTheDocument()
  })
})

describe('CharacterMentions', () => {
  const ROWS = [
    { wording: 'Des', count: 2, sceneIds: ['scene_1', 'scene_2'] },
    { wording: 'my husband', count: 1, sceneIds: ['scene_1'] },
  ]
  const loaded = { kind: 'loaded', mentions: ROWS }

  it('lists one row per wording with its count and scene count', () => {
    render(CharacterMentions, { props: { read: loaded, characterName: 'DESMOND' } })
    expect(screen.getByRole('button', { name: 'Des' })).toBeInTheDocument()
    expect(screen.getByText('2 mentions · 2 scenes')).toBeInTheDocument()
    expect(screen.getByText('1 mention · 1 scene')).toBeInTheDocument()
  })

  it('reports a chosen wording, and null when the chosen one is chosen again', async () => {
    const onselect = vi.fn()
    const { rerender } = render(CharacterMentions, { props: { read: loaded, characterName: 'DESMOND', onselect } })
    await fireEvent.click(screen.getByRole('button', { name: 'Des' }))
    expect(onselect).toHaveBeenLastCalledWith('Des')
    await rerender({ read: loaded, characterName: 'DESMOND', onselect, selected: 'Des' })
    expect(screen.getByRole('button', { name: 'Des' })).toHaveAttribute('aria-current', 'true')
    await fireEvent.click(screen.getByRole('button', { name: 'Des' }))
    expect(onselect).toHaveBeenLastCalledWith(null)
  })

  it('offers nothing to bind: binding stays in Review', () => {
    render(CharacterMentions, { props: { read: { kind: 'loaded', mentions: [] }, characterName: 'DESMOND' } })
    expect(screen.getByText(/No line names DESMOND through a bound mention yet/)).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it("says the engine's words when the mentions cannot be read", () => {
    render(CharacterMentions, { props: { read: { kind: 'failed', message: 'NOT_FOUND: no such package' } } })
    expect(screen.getByText(/NOT_FOUND: no such package/)).toBeInTheDocument()
  })
})

describe('CharacterRecordings', () => {
  const recordings = destination.focus.recordings

  it("groups the captured recordings by scene and reports the one activated", async () => {
    const onRevealRecording = vi.fn()
    render(CharacterRecordings, { props: { read: { kind: 'loaded', recordings }, characterName: 'Madison', onRevealRecording } })
    const grid = screen.getByRole('grid', { name: 'Recordings of Madison' })
    expect(within(grid).getAllByText(sceneGroup(recordings[0])).length).toBeGreaterThan(0)
    await fireEvent.click(within(grid).getAllByText(recordings[0].line.text)[0])
    expect(onRevealRecording).toHaveBeenCalled()
  })

  it('says why the recordings could not be read', () => {
    render(CharacterRecordings, { props: { read: { kind: 'failed', message: 'NOT_FOUND' } } })
    expect(screen.getByText('Recordings could not be read')).toBeInTheDocument()
  })

  it('is empty for a character with no recordings', () => {
    render(CharacterRecordings, { props: { read: { kind: 'loaded', recordings: [] }, characterName: 'Madison' } })
    expect(screen.getByText('Madison has no recordings.')).toBeInTheDocument()
  })
})

describe('CharacterAnalysis', () => {
  it("draws the captured analysis's readings, ties included", () => {
    render(CharacterAnalysis, { props: { analysis: destination.focus.analysis } })
    for (const title of ['Story', 'Arc', 'Relationships', 'Appearance', 'Voice', 'Ties']) expect(screen.getByText(title)).toBeInTheDocument()
  })

  it('draws nothing for no analysis, or one in a shape the engine no longer writes', () => {
    const { container } = render(CharacterAnalysis, { props: { analysis: { profile: {} } } })
    expect(container.querySelector('.ui-character-analysis')).toBeNull()
  })

  it('is empty for an analysis that says nothing: only its standing sections', () => {
    render(CharacterAnalysis, { props: { analysis: { story: {}, casting: {} } } })
    expect(screen.getByText('Story')).toBeInTheDocument()
    expect(screen.queryByText('Ties')).toBeNull()
  })
})

const desmond = { id: 'chr_des', name: 'DESMOND', dialogue_lines: 299, scene_count: 31, percentage: 28.4, mentionedSceneIds: ['s1', 's2'], scenes: ['s1'], origin: 'parsed' }

describe('CharacterTable', () => {
  it('keeps labels wrapping in a narrow pane, and has an Analysis column', () => {
    render(CharacterTable, { props: { characters: [desmond], castings: [] } })
    expect(screen.getByRole('grid', { name: 'Characters' })).toHaveClass('table--wrap')
    expect(screen.getByRole('columnheader', { name: 'An' })).toBeInTheDocument()
  })

  // khaos-app#617: a story with no characters (Parallel Lives) says so in the body, under the
  // header, with the Narrator pinned above it rather than filling the body.
  it('shows the empty state in the body, under the pinned Narrator, for a story with no characters', () => {
    const { container } = render(CharacterTable, { props: { characters: [], castings: [] } })
    expect(container.querySelector('.table__body')?.textContent).toBe('This story has no characters.')
    expect(container.querySelector('.table__pinned [data-ui-id="story.characters.row.@narrator"]')).not.toBeNull()
  })

  it('pins the Narrator above the header, outside the rows the table counts', () => {
    const { container } = render(CharacterTable, { props: { characters: [desmond], castings: [] } })
    const narrator = /** @type {HTMLElement} */ (container.querySelector('[data-ui-id="story.characters.row.@narrator"]'))
    expect(narrator.closest('.table__pinned')).not.toBeNull()
    expect(narrator.compareDocumentPosition(screen.getByRole('columnheader', { name: 'Name' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(container.querySelector('.table__body [data-ui-id="story.characters.row.@narrator"]')).toBeNull()
  })

  it('selects the Narrator by click, and walks up into it from the first row', async () => {
    const onselect = vi.fn()
    const { container } = render(CharacterTable, { props: { characters: [desmond], castings: [], selected: desmond.id, onselect } })
    await fireEvent.keyDown(screen.getByRole('grid', { name: 'Characters' }), { key: 'ArrowUp' })
    expect(onselect).toHaveBeenLastCalledWith('@narrator')
    await fireEvent.click(/** @type {HTMLElement} */ (container.querySelector('[data-ui-id="story.characters.row.@narrator"]')))
    expect(onselect).toHaveBeenCalledTimes(2)
  })
})

describe('CharacterDetail', () => {
  const lines = { kind: 'loaded', lines: [{ element_id: 'd1', scene_slugline: 'INT. CAR - DAY', text: 'Get in the car.' }] }

  it('shows the view switch and none of the inspector’s stats; lines wrap', () => {
    render(CharacterDetail, { props: { character: desmond, dialogues: lines } })
    expect(screen.getByRole('radiogroup', { name: 'Character view' })).toBeInTheDocument()
    expect(screen.queryByText(/299 lines/)).toBeNull()
    expect(screen.getByRole('grid', { name: 'Lines of DESMOND' })).toHaveClass('table--wrap')
  })

  it('reports the view chosen, and shows the recordings it is given', async () => {
    const onview = vi.fn()
    render(CharacterDetail, { props: { character: desmond, dialogues: lines, recordings: { kind: 'loaded', recordings: [] }, onview } })
    await fireEvent.click(screen.getByRole('radio', { name: 'Recordings' }))
    expect(onview).toHaveBeenCalledWith('recordings')
    expect(screen.getByText('DESMOND has no recordings.')).toBeInTheDocument()
  })

  it("shows a chosen mention's lines in place of the view, and a view chosen clears it", async () => {
    const onClearMention = vi.fn()
    const mention = { wording: 'Des', occurrences: [{ referenceId: 'ref_1', sceneId: 's1', lineNumber: 4, lineText: 'Tell Des I said so.' }] }
    render(CharacterDetail, { props: { character: desmond, dialogues: lines, mention, onClearMention } })
    expect(screen.getByRole('grid', { name: 'Lines that say “Des”' })).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('radio', { name: 'Lines' }))
    expect(onClearMention).toHaveBeenCalledOnce()
  })

  it('draws the analysis it is given, and says when there is none or it is in an older shape', async () => {
    const { unmount } = render(CharacterDetail, { props: { character: desmond, detail: { kind: 'loaded', analysis: destination.focus.analysis } } })
    await fireEvent.click(screen.getByRole('radio', { name: 'Analysis' }))
    expect(screen.getByText('Ties')).toBeInTheDocument()
    unmount()
    render(CharacterDetail, { props: { character: desmond, detail: { kind: 'loaded', analysis: { profile: {} } } } })
    await fireEvent.click(screen.getByRole('radio', { name: 'Analysis' }))
    expect(screen.getByText('Analysed by an older process')).toBeInTheDocument()
  })

  it('is empty with no character selected', () => {
    render(CharacterDetail, { props: { character: null } })
    expect(screen.getByText('No character selected')).toBeInTheDocument()
  })
})

describe('CharacterSide', () => {
  it("lists the Identity stats and reports Design a voice for the character", async () => {
    const onDesignVoice = vi.fn()
    render(CharacterSide, { props: { character: desmond, onDesignVoice } })
    expect(screen.getByText('Named in')).toBeInTheDocument()
    expect(screen.getByText('28.4%')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Design a voice for DESMOND…' }))
    expect(onDesignVoice).toHaveBeenCalledWith('chr_des', 'DESMOND')
  })

  it('offers Lock… on its own unlocked cast voice, and reports it', async () => {
    const onLockVoice = vi.fn()
    render(CharacterSide, { props: { character: desmond, castUnlocked: { name: 'Eric', profileId: 'v1' }, onLockVoice } })
    await fireEvent.click(screen.getByRole('button', { name: 'Lock Eric…' }))
    expect(onLockVoice).toHaveBeenCalledWith('v1')
  })

  it("draws who the character appears with from the engine's graph context", () => {
    render(CharacterSide, { props: { character: desmond, graphContext: destination.focus.graphContext } })
    expect(screen.getByText(destination.focus.graphContext.co_characters[1].name)).toBeInTheDocument()
  })

  it('confirms a deletion before reporting it', async () => {
    const onDelete = vi.fn()
    render(CharacterSide, { props: { character: desmond, deletable: true, onDelete } })
    await fireEvent.click(screen.getByRole('button', { name: 'Delete DESMOND…' }))
    expect(onDelete).not.toHaveBeenCalled()
    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  // khaos-app#620 (K: "the narrator inspect should match the other character inspectors
  // visually"): the same sections and the same Design a voice control, not a link.
  it("shows the narrator in the character inspector's sections, with its Design a voice button", async () => {
    const onDesignVoice = vi.fn()
    const { container } = render(CharacterSide, { props: { narrator: true, narratorLabel: 'Not set', onDesignVoice } })
    const sections = [...container.querySelectorAll('[data-ui-id^="story.inspector."]')].map((s) => s.getAttribute('data-ui-id')).filter((id) => /^story\.inspector\.[a-z-]+$/.test(id ?? ''))
    expect(sections.slice(0, 2)).toEqual(['story.inspector.identity', 'story.inspector.casting'])
    expect(screen.getByText('Every action line')).toBeInTheDocument()
    const design = screen.getByRole('button', { name: 'Design a voice for Narrator…' })
    expect(design).toHaveAttribute('data-variant', 'secondary')
    await fireEvent.click(design)
    expect(onDesignVoice).toHaveBeenCalledWith('@narrator', 'Narrator')
  })

  // K: "no way of previewing without launching voice manager".
  it("previews the narrator's voice in place: asks for the clip, says it is making it, then plays it", async () => {
    const onPreviewNarrator = vi.fn()
    const props = { narrator: true, narratorLabel: 'Ava', onPreviewNarrator }
    const { rerender } = render(CharacterSide, { props: { ...props, narratorPreview: { kind: 'none' } } })
    await fireEvent.click(screen.getByRole('button', { name: 'Preview voice' }))
    expect(onPreviewNarrator).toHaveBeenCalledOnce()
    await rerender({ ...props, narratorPreview: { kind: 'making' } })
    expect(screen.getByRole('status')).toHaveTextContent('Making a preview…')
    await rerender({ ...props, narratorPreview: { kind: 'ready', src: 'blob:narrator' } })
    expect(screen.getByRole('button', { name: 'Play Narrator voice preview' })).toBeInTheDocument()
    await rerender({ ...props, narratorPreview: { kind: 'failed', message: 'The voice engine is not running.' } })
    expect(screen.getByRole('alert')).toHaveTextContent('The voice engine is not running.')
    expect(screen.getByRole('button', { name: 'Preview voice' })).toBeInTheDocument()
  })

  it('draws no preview with no narrator voice set', () => {
    render(CharacterSide, { props: { narrator: true, narratorLabel: 'Not set', narratorPreview: null } })
    expect(screen.queryByRole('button', { name: 'Preview voice' })).toBeNull()
  })

  it('is empty with nothing selected', () => {
    const { container } = render(CharacterSide, { props: { character: null } })
    expect(container.textContent?.trim()).toBe('')
  })
})

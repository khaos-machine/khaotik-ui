import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import LocationHeadings from '@khaos-machine/khaotik-ui/components/svelte/LocationHeadings.svelte'
import ObjectDetail from '@khaos-machine/khaotik-ui/components/svelte/ObjectDetail.svelte'
import ObjectSide from '@khaos-machine/khaotik-ui/components/svelte/ObjectSide.svelte'
import PlaceAnalysis from '@khaos-machine/khaotik-ui/components/svelte/PlaceAnalysis.svelte'
import PlaceDetail from '@khaos-machine/khaotik-ui/components/svelte/PlaceDetail.svelte'
import PlaceSide from '@khaos-machine/khaotik-ui/components/svelte/PlaceSide.svelte'
import PlaceTable from '@khaos-machine/khaotik-ui/components/svelte/PlaceTable.svelte'
import SubjectDesign from '@khaos-machine/khaotik-ui/components/svelte/SubjectDesign.svelte'
import places from '../data/places-destination.json'

// Khaos App's Places and Objects panes, moved into the kit (catalog app-coverage plan, T4).
// Each is checked for what it reports and for its empty state; the host's models stay in the
// app. The headings cases are the app's, on the same read, reporting rather than writing.

/** @param {string} locationId @param {string} sceneId @param {number} lineNumber @param {string} lineText */
const occ = (locationId, sceneId, lineNumber, lineText) => ({ locationId, evidence: { sceneId, span: { lineNumber, lineText } } })
const CLUB_1 = occ('location_club', 'scene_3', 139, "INT. VOLSKI'S NIGHT CLUB - NIGHT")
const CLUB_2 = occ('location_club', 'scene_20', 600, 'INT. NIGHT CLUB - NIGHT')
const BAR = occ('location_bar', 'scene_9', 320, 'INT. CLUB BAR - NIGHT')
const BACK = occ('location_back', 'scene_11', 410, 'INT. BACK OF THE CLUB - NIGHT')
const MERGE = { state: 'merged', decisionSeq: 3, canonicalId: 'location_club', retiredId: 'location_nightclub', canonical: CLUB_1.evidence, retired: CLUB_2.evidence, inEffect: true }
const READ = { occurrences: [CLUB_1, BAR, BACK, CLUB_2], decisions: [MERGE] }
const loaded = { kind: 'loaded', read: READ }

/** @param {string} text */
const snippet = (text) => createRawSnippet(() => ({ render: () => `<p>${text}</p>` }))

describe('LocationHeadings', () => {
  it('lists this location’s headings and the heading merged into it', () => {
    render(LocationHeadings, { props: { read: loaded, locationId: 'location_club' } })
    const here = screen.getByRole('group', { name: 'Headings here' })
    expect(within(here).getAllByRole('button').map((b) => b.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      "INT. VOLSKI'S NIGHT CLUB - NIGHT Line 139",
      'INT. NIGHT CLUB - NIGHT Line 600',
    ])
    expect(screen.getByText('Merged into this place')).toBeInTheDocument()
    expect(screen.getByText(`Merged with “INT. VOLSKI'S NIGHT CLUB - NIGHT”`)).toBeInTheDocument()
  })

  it('keeps two headings apart only once both are chosen and it is confirmed, reporting both exactly as read', async () => {
    const onKeepApart = vi.fn(() => true)
    render(LocationHeadings, { props: { read: loaded, locationId: 'location_club', onKeepApart } })
    const act = screen.getByRole('button', { name: 'These are different places' })
    expect(act).toHaveAttribute('aria-disabled', 'true')
    await fireEvent.click(within(screen.getByRole('group', { name: 'Headings here' })).getByRole('button', { name: /VOLSKI/ }))
    await fireEvent.input(screen.getByLabelText('Filter other headings'), { target: { value: 'bar' } })
    const others = screen.getByRole('group', { name: 'Other headings' })
    expect(within(others).getAllByRole('button')).toHaveLength(1)
    await fireEvent.click(within(others).getByRole('button', { name: /CLUB BAR/ }))
    await fireEvent.click(act)
    expect(screen.getByText(/never merged automatically/)).toBeInTheDocument()
    expect(onKeepApart).not.toHaveBeenCalled()
    await fireEvent.click(screen.getByRole('button', { name: 'Keep apart' }))
    await vi.waitFor(() => expect(onKeepApart).toHaveBeenCalledWith(CLUB_1, BAR))
  })

  it('confirms a split, naming the heading, then reports the merge', async () => {
    const onSplit = vi.fn(() => true)
    render(LocationHeadings, { props: { read: loaded, locationId: 'location_club', onSplit } })
    await fireEvent.click(screen.getByRole('button', { name: 'Split INT. NIGHT CLUB - NIGHT' }))
    expect(screen.getByText(/This takes effect now/)).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Split' }))
    await vi.waitFor(() => expect(onSplit).toHaveBeenCalledWith(MERGE))
  })

  it('says why the headings could not be read, in the engine’s words', () => {
    render(LocationHeadings, { props: { read: { kind: 'failed', message: 'NOT_V3: no committed v3 story state' } } })
    expect(screen.getByText('NOT_V3: no committed v3 story state')).toBeInTheDocument()
  })

  it('is empty for a place no heading resolves to', () => {
    render(LocationHeadings, { props: { read: { kind: 'loaded', read: { occurrences: [], decisions: [] } }, locationId: 'location_club' } })
    expect(screen.getByText('No headings')).toBeInTheDocument()
  })
})

describe('PlaceTable', () => {
  it('has an Analysis column and says when a story has no places', () => {
    render(PlaceTable, { props: { places: [] } })
    expect(screen.getByRole('columnheader', { name: 'An' })).toBeInTheDocument()
    expect(screen.getByText('This story has no places.')).toBeInTheDocument()
  })
})

describe('PlaceAnalysis', () => {
  it("draws the captured place's readings", () => {
    render(PlaceAnalysis, { props: { analysis: places.focus.analysis } })
    expect(screen.getByText('Story')).toBeInTheDocument()
    expect(screen.getByText('Mentions')).toBeInTheDocument()
  })

  it('draws nothing for an analysis in a shape the engine no longer writes', () => {
    const { container } = render(PlaceAnalysis, { props: { analysis: { profile: {} } } })
    expect(container.querySelector('.ui-place-analysis')).toBeNull()
  })
})

describe('PlaceDetail', () => {
  const place = { id: places.focus.id, name: "DESMOND'S APARTMENT", scene_count: 11 }

  it("reports the view chosen, and draws the place's cast from its graph context", async () => {
    const onview = vi.fn()
    render(PlaceDetail, { props: { place, detail: { kind: 'loaded', analysis: null, graphContext: places.focus.graphContext }, onview } })
    await fireEvent.click(screen.getByRole('radio', { name: 'Cast' }))
    expect(onview).toHaveBeenCalledWith('cast')
    const first = /** @type {{ name: string }} */ (places.focus.graphContext.characters[0])
    expect(screen.getByText(first.name)).toBeInTheDocument()
  })

  it('shows its headings on the Headings view', async () => {
    render(PlaceDetail, { props: { place: { id: 'location_club', name: 'THE CLUB' }, headings: loaded } })
    await fireEvent.click(screen.getByRole('radio', { name: 'Headings' }))
    expect(screen.getByRole('group', { name: 'Headings here' })).toBeInTheDocument()
  })

  it('is empty with no place selected', () => {
    render(PlaceDetail, { props: { place: null } })
    expect(screen.getByText('No place selected')).toBeInTheDocument()
  })
})

describe('ObjectDetail', () => {
  it('lists the scenes the object appears in, and reports the view chosen', async () => {
    const onview = vi.fn()
    const object = { id: 'o1', name: 'phone', appearances: [{ sceneId: 's2' }] }
    render(ObjectDetail, { props: { object, scenes: [{ id: 's1', index: 0, slugline: 'INT. ONE' }, { id: 's2', index: 1, slugline: 'INT. TWO' }], onview } })
    expect(screen.getByRole('grid', { name: 'Scenes with phone' })).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('radio', { name: 'Images' }))
    expect(onview).toHaveBeenCalledWith('images')
  })

  it('is empty with no object selected', () => {
    render(ObjectDetail, { props: { object: null } })
    expect(screen.getByText('No object selected')).toBeInTheDocument()
  })
})

describe('SubjectDesign', () => {
  it('opens the designer from the chosen sheet and from its action', async () => {
    const ondesign = vi.fn()
    render(SubjectDesign, { props: { kind: 'location', name: 'LOFT', design: { kind: 'chosen', image: { url: 'data:image/png;base64,' } }, ondesign } })
    await fireEvent.click(screen.getByRole('button', { name: 'LOFT selected reference sheet' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Edit place design…' }))
    expect(ondesign).toHaveBeenCalledTimes(2)
  })

  it('says where the design stands', () => {
    render(SubjectDesign, { props: { kind: 'object', design: { kind: 'awaiting' }, activity: 'Drawing 2 of 4…' } })
    expect(screen.getByText('Designs awaiting selection')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Drawing 2 of 4…')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('says why the artwork could not be read', () => {
    render(SubjectDesign, { props: { kind: 'object', design: { kind: 'chosen', image: { url: '', error: 'NOT_FOUND' } } } })
    expect(screen.getByRole('alert')).toHaveTextContent('NOT_FOUND')
  })

  it('is not designed yet, with no design chosen', () => {
    render(SubjectDesign, { props: { kind: 'location', design: { kind: 'none' } } })
    expect(screen.getByText('Not designed')).toBeInTheDocument()
    expect(screen.getByText('No place design chosen')).toBeInTheDocument()
  })
})

describe('PlaceSide and ObjectSide', () => {
  it("put the host's identity section after the design, and the drafted direction after it", () => {
    render(PlaceSide, { props: { selected: true, name: 'LOFT', identity: snippet('the identity'), direction: { spatialDescription: 'A loft over a garage.', lighting: 'North light', fixedFeatures: ['skylight'] } } })
    expect(screen.getByRole('region', { name: 'Place design' })).toBeInTheDocument()
    expect(screen.getByText('the identity')).toBeInTheDocument()
    expect(screen.getByText('A loft over a garage.')).toBeInTheDocument()
    expect(screen.getByText('skylight')).toBeInTheDocument()
  })

  it("name the object's design and its materials", () => {
    render(ObjectSide, { props: { selected: true, name: 'tote', direction: { form: 'A canvas tote.', materials: 'canvas' } } })
    expect(screen.getByRole('region', { name: 'Object design' })).toBeInTheDocument()
    expect(screen.getByText('canvas')).toBeInTheDocument()
  })

  it('are empty with nothing selected', () => {
    const { container } = render(PlaceSide, { props: { selected: false } })
    expect(container.textContent?.trim()).toBe('')
  })
})

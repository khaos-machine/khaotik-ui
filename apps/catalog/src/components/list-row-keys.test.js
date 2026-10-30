import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import DataTable from '@khaos-machine/khaotik-ui/components/svelte/DataTable.svelte'
import Gallery from '@khaos-machine/khaotik-ui/components/svelte/Gallery.svelte'
import StoryPlayer from '@khaos-machine/khaotik-ui/components/svelte/StoryPlayer.svelte'
import ResourceCatalog from '@khaos-machine/khaotik-ui/components/svelte/ResourceCatalog.svelte'
import ServiceStatusList from '@khaos-machine/khaotik-ui/components/svelte/ServiceStatusList.svelte'

// One defect class across every list the kit renders, so it is tested in one place rather
// than as near-identical files. The story's tables (scenes, characters, places, objects, images,
// audio) all draw through DataTable, so it carries the cases the retired lists did.
//
// THE DEFECT. Each list keyed its `{#each}` with `entity.id ?? entity.name`.
// `??` falls back on null and undefined only, and khaosd sends neither: the
// `id` key is ABSENT on disk, and khaosd unmarshals into a Go struct whose
// `ID string` zero-value marshals back as `""`. An empty string is a populated
// value, so the fallback never fires and every row keys as `''`. Svelte throws
// `each_key_duplicate`, the subtree render aborts, and the host's loading state
// never clears — the window sits on a spinner forever. That is worse than a
// visibly broken list: the surface reports "in progress" for a condition that
// will never change. Reproduced against khaosd 0.9.1 with 48 scenes, every id
// empty (khaotik-ui#94).
//
// `??` IS THE WRONG OPERATOR AGAINST ANY GO PRODUCER. Zero values arrive as
// `""`, `0` or `false` and never as null, so a `??` fallback on a khaosd-sourced
// field is dead code waiting for a field to go missing, which it will not. DataTable's
// default `rowKey` is `String(row?.id ?? '')`, so the same lesson applies at its key.
//
// WHY `||` IS NOT THE FIX EITHER. The obvious repair is
// `scene.id || scene.slugline`, and it still throws on the operator's own
// script: `apps/catalog/src/data/scenes.json` holds 54 scenes with 7 repeated
// sluglines, one appearing 5 times. Two scenes sharing a slugline is ordinary
// screenwriting, not an edge case, so `||` trades a guaranteed collision for a
// likely one. DataTable keeps the id, so a measured row height follows its row through a
// sort, and gives a repeat an occurrence suffix, which cannot collide.
//
// WHY THE SUITE DID NOT CATCH IT. `apps/catalog/src/data/*.json` was fetched
// from an older daemon and every row in it carries a real id — 54 scenes, 27
// characters, 26 locations, zero empties. The fixtures encode the state the
// producer no longer sends, which is khaotik-ui#85 one component to the left.
// So the empty-id case has to be constructed here deliberately.
const scenesWithNoIds = Array.from({ length: 48 }, (_, i) => ({
  id: '',
  number: i + 1,
  title: `Scene ${i + 1}`,
  // Deliberately repeated: two rows sharing a slugline is the case that
  // defeats a `||` fallback. Six distinct sluglines across 48 rows.
  slugline: `INT. DESMOND'S APARTMENT - ${['DAY', 'NIGHT', 'DAWN', 'DUSK', 'LATER', 'CONTINUOUS'][i % 6]}`,
}))

// DataTable draws only the rows in its window, so the viewport is stated: tall enough for all 48.
const table = (props) => render(DataTable, {
  props: {
    columns: [{ key: 'slugline', label: 'Scene', width: '1fr', value: (s) => s.slugline }],
    label: 'Scenes', viewportHeight: 48 * 28, rowHeight: 28, overscan: 0, ...props,
  },
})
const dataRows = (container) => container.querySelectorAll('.table__data')
const selectedRows = (container) => container.querySelectorAll('[aria-selected="true"], .table__data--selected')

describe('list row keys survive empty ids', () => {
  it('DataTable renders 48 scenes whose ids are all empty strings', () => {
    const { container } = table({ rows: scenesWithNoIds })
    expect(dataRows(container)).toHaveLength(48)
  })

  // Fixing the key alone leaves a second defect on the very next line.
  // `id === selected` compares '' to '', so with the default `selected` of '' EVERY row
  // reports itself selected. It would have read as a styling bug much later and sent someone
  // into the CSS.
  it('DataTable marks no row selected when the ids are empty', () => {
    const { container } = table({ rows: scenesWithNoIds, selected: '' })
    expect(
      selectedRows(container).length,
      'with no usable ids the honest answer is that nothing is selected, not that everything is',
    ).toBe(0)
  })

  it('DataTable still selects the right row when ids are real', () => {
    const scenes = [
      { id: 'scn_a', number: 1, title: 'One', slugline: 'INT. A - DAY' },
      { id: 'scn_b', number: 2, title: 'Two', slugline: 'INT. A - DAY' },
    ]
    const { container } = table({ rows: scenes, selected: 'scn_b' })
    const selected = selectedRows(container)
    expect(new Set([...selected].map((r) => r.closest('.table__data')))).toHaveProperty('size', 1)
    expect(selected[0].closest('.table__data').textContent).toContain('INT. A - DAY')
  })

  // The same defect in the five sites the first pass deliberately left alone.
  // Each was latent rather than live only because its producer had not yet sent
  // an empty id; the crash is identical and so is the cause.

  // Same '' === '' comparison the lists carried, one component over.
  it('Gallery renders images whose srcs are all empty strings', () => {
    const images = Array.from({ length: 8 }, () => ({ src: '', caption: '' }))
    const { container } = render(Gallery, { props: { images, name: 'Someone' } })
    expect(container.querySelectorAll('.gallery__item')).toHaveLength(8)
  })

  it('StoryPlayer renders segments whose sceneIds are all empty strings', () => {
    // On khaosd 0.11.0's wire (#124). The keys are migrated and nothing else: this test
    // is about EMPTY IDS aborting the render, not about the duration contract, and a
    // fixture left on the retired `duration`/`start` keys would land every row on the
    // unreadable channel and assert the keying guard against a track that draws nothing.
    const segments = Array.from({ length: 5 }, (_, i) => ({
      kind: 'scene',
      sceneId: '',
      label: `Beat ${i + 1}`,
      startMs: i * 10000,
      durationMs: 10000,
      events: [{ elementType: 'action', elementId: '', durationMs: 10000, text: 'Something happens.' }],
    }))
    const { container } = render(StoryPlayer, { props: { segments } })
    expect(container.querySelector('.player')).toBeTruthy()
    expect(
      container.querySelectorAll('.player__segment'),
      '`.player` alone is truthy even when the empty-state branch renders instead of the timeline',
    ).toHaveLength(5)
  })

  // Found by red-team, not by me: two more sites in this family, both proven to
  // crash under a positive-controlled probe. A graph keyed three blocks on a
  // BARE `node.character_id` with no fallback at all, and StoryPlayer's event
  // lane — in the same file whose scene lane I had just fixed — falls back to
  // `${row.lane}-${event.start}`, which is not unique: `duration` is optional
  // and `seconds(undefined)` is 0, so two zero-duration events in one lane share
  // a start and therefore a key.

  it("StoryPlayer's event lane survives events khaosd sends with no duration", () => {
    // The SEGMENT is migrated to khaosd 0.11.0's wire (#124) and the EVENTS are
    // deliberately left without one. That split is the whole test: the segment must be
    // readable or `buildTimeline` files it under `unreadable`, `total` is 0 and the stage
    // never renders — asserting the keying guard against a track that draws nothing. The
    // events must stay duration-free because that is the collision: `timeline.js:110-114`
    // gives every one of them `duration: null` and leaves the offset at 0, so all three
    // share `start: 0` and used to collide on the `${row.lane}-${event.start}` key.
    // Giving the events a `durationMs` would space them out and delete the defect.
    const segments = [
      {
        kind: 'scene',
        sceneId: 'scn_a',
        label: 'Beat',
        startMs: 0,
        durationMs: 10000,
        events: [
          { elementType: 'action', elementId: '', text: 'First.' },
          { elementType: 'action', elementId: '', text: 'Second.' },
          { elementType: 'action', elementId: '', text: 'Third.' },
        ],
      },
    ]
    const { container } = render(StoryPlayer, { props: { segments } })
    expect(container.querySelector('.player')).toBeTruthy()
    // `.player` is the unconditional root at StoryPlayer.svelte:229 and is truthy even
    // against `segments: []`. Count the bars the test is named for, or it asserts nothing.
    expect(
      container.querySelectorAll('.player__event'),
      'three no-duration events share start 0 — all three bars must draw',
    ).toHaveLength(3)
    expect(container.querySelectorAll('.player__segment')).toHaveLength(1)
  })

  // Four more, and neither the red-team nor I found them by grepping for `??` —
  // these key on a BARE `.id` with no fallback of any kind, so every search for
  // the `??` shape walked straight past them. They surfaced only when a test
  // rendered the component with the payload khaosd actually sends.

  it('ResourceCatalog renders artifacts whose ids are all empty strings', () => {
    const artifacts = Array.from({ length: 5 }, (_, i) => ({
      id: '',
      kind: 'prompt',
      name: `Artifact ${i + 1}`,
    }))
    const { container } = render(ResourceCatalog, { props: { artifacts } })
    expect(container.querySelectorAll('.catalog__item')).toHaveLength(5)
  })

  it('ServiceStatusList renders services whose ids are all empty strings', () => {
    const services = Array.from({ length: 3 }, (_, i) => ({
      id: '',
      name: `Service ${i + 1}`,
      state: 'running',
    }))
    const { container } = render(ServiceStatusList, { props: { services } })
    expect(container.querySelectorAll('.services__row')).toHaveLength(3)
  })
})

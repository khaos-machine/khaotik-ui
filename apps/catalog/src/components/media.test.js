import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import AudioDetail from '@khaos-machine/khaotik-ui/components/svelte/AudioDetail.svelte'
import AudioSide from '@khaos-machine/khaotik-ui/components/svelte/AudioSide.svelte'
import AudioTable from '@khaos-machine/khaotik-ui/components/svelte/AudioTable.svelte'
import ImageDetail from '@khaos-machine/khaotik-ui/components/svelte/ImageDetail.svelte'
import ImageSide from '@khaos-machine/khaotik-ui/components/svelte/ImageSide.svelte'
import ImageTable from '@khaos-machine/khaotik-ui/components/svelte/ImageTable.svelte'
import RefusedTakes from '@khaos-machine/khaotik-ui/components/svelte/RefusedTakes.svelte'
import { imageRows } from '@khaos-machine/khaotik-ui/components/svelte/lib/images.js'
import media from '../data/images-audio-destination.json'

// Khaos App's Images and Audio panes, moved into the kit (catalog app-coverage plan, T5). Each
// is checked for what it reports and for its empty state; the host's models stay in the app.

/** @param {string} text */
const snippet = (text) => createRawSnippet(() => ({ render: () => `<p>${text}</p>` }))
const rows = imageRows(/** @type {any} */ (media.subjects))
const generated = rows.find((r) => r.provenance)
const take = /** @type {any} */ (media.recordings.find((r) => r.id === media.peaks.recordingId))
const read = /** @type {any} */ (media.recordings.find((r) => r.kind === 'scene'))
const spoken = /** @type {any} */ (media.recordings.find((r) => r.kind === 'line' && r.character))

describe('ImageTable', () => {
  it('says so when the project has no images', () => {
    render(ImageTable, { props: { rows: [] } })
    expect(screen.getByText('This project has no images.')).toBeInTheDocument()
  })
})

describe('ImageDetail', () => {
  it("shows a generated image's provenance, and reports its subject to show", async () => {
    const onRevealSubject = vi.fn()
    render(ImageDetail, { props: { row: generated, onRevealSubject } })
    expect(screen.getByText('Provenance')).toBeInTheDocument()
    expect(screen.getByText(/** @type {any} */ (generated).provenance.generationId)).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: /** @type {any} */ (generated).subjectName }))
    expect(onRevealSubject).toHaveBeenCalledWith(/** @type {any} */ (generated).subject)
  })

  it('says when nothing is selected', () => {
    render(ImageDetail, { props: { row: null } })
    expect(screen.getByText('No image selected')).toBeInTheDocument()
  })
})

describe('ImageSide', () => {
  it("lists the image's facts, and says when nothing is selected", () => {
    const { unmount } = render(ImageSide, { props: { row: generated } })
    expect(screen.getByText('PNG')).toBeInTheDocument()
    unmount()
    render(ImageSide, { props: { row: null } })
    expect(screen.getByText('No image selected')).toBeInTheDocument()
  })
})

describe('AudioTable', () => {
  it('says so when a project has no recordings', () => {
    render(AudioTable, { props: { rows: [] } })
    expect(screen.getByText('This project has no recordings.')).toBeInTheDocument()
  })
})

describe('AudioDetail', () => {
  it("shows a line take's line, its facts, and links its scene, character and voice", async () => {
    const onRevealScene = vi.fn()
    const onRevealCharacter = vi.fn()
    const onOpenVoice = vi.fn()
    render(AudioDetail, { props: { recording: spoken, playback: { kind: 'loading' }, onRevealScene, onRevealCharacter, onOpenVoice } })
    expect(screen.getByRole('heading', { name: spoken.line.text })).toBeInTheDocument()
    expect(screen.getByText('Reading the recording…')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: spoken.character.name }))
    expect(onRevealCharacter).toHaveBeenCalledWith(spoken.character.id)
    await fireEvent.click(screen.getByRole('button', { name: spoken.voices[0].name }))
    expect(onOpenVoice).toHaveBeenCalledWith(spoken.voices[0].id)
  })

  it("shows a scene read's timeline from the host, and says why a line take cannot play", () => {
    const { unmount } = render(AudioDetail, { props: { recording: read, read: snippet('the read timeline') } })
    expect(screen.getByText('the read timeline')).toBeInTheDocument()
    unmount()
    render(AudioDetail, { props: { recording: take, playback: { kind: 'failed', message: 'synthesis engine is unavailable' } } })
    expect(screen.getByText('synthesis engine is unavailable')).toBeInTheDocument()
  })

  it('says so when nothing is selected', () => {
    render(AudioDetail, { props: { recording: null } })
    expect(screen.getByText('No recording selected')).toBeInTheDocument()
  })
})

describe('AudioSide', () => {
  it("shows the recording's facts, or the host's followed line in their place", () => {
    const { unmount } = render(AudioSide, { props: { recording: read } })
    expect(screen.getByText('Scene read')).toBeInTheDocument()
    unmount()
    render(AudioSide, { props: { recording: read, line: snippet('the followed line') } })
    expect(screen.getByText('the followed line')).toBeInTheDocument()
    expect(screen.queryByText('Scene read')).toBeNull()
  })
})

describe('RefusedTakes', () => {
  const placed = { kind: 'line', id: 't1', scene: { id: 's1', position: 3, slugline: 'INT. LOFT - DAY' }, code: 'TAKE_NOT_CONFORMANT', reason: 'audio sha256 does not match' }
  const unplaced = { kind: 'line', id: 't2', code: 'TAKE_NOT_CONFORMANT', reason: 'names no event' }
  const sceneRead = { kind: 'scene', id: 'r1', scene: placed.scene, code: 'TAKE_NEEDS_REREAD', reason: 'untimed' }

  it("lists refused line takes only, with the engine's reason and a way to the scene", async () => {
    const onRevealScene = vi.fn()
    render(RefusedTakes, { props: { refused: [placed, unplaced, sceneRead], onRevealScene } })
    const list = within(screen.getByRole('list', { name: 'Recordings that need attention' }))
    expect(list.getAllByRole('status')).toHaveLength(2)
    expect(list.getByText('audio sha256 does not match')).toBeInTheDocument()
    expect(list.getAllByRole('button', { name: 'Open scene' })).toHaveLength(1)
    await fireEvent.click(list.getByRole('button', { name: 'Open scene' }))
    expect(onRevealScene).toHaveBeenCalledWith('s1')
  })

  it('renders nothing when no take is refused', () => {
    const { container } = render(RefusedTakes, { props: { refused: [] } })
    expect(container.querySelector('ul')).toBeNull()
  })
})

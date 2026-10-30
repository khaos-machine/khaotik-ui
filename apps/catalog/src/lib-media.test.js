import { describe, expect, it } from 'vitest'
import { formatBytes } from '@khaos-machine/khaotik-ui/components/svelte/lib/bytes.js'
import { formatName, imageRows } from '@khaos-machine/khaotik-ui/components/svelte/lib/images.js'
import { render, screen } from '@testing-library/svelte'
import AudioDetail from '@khaos-machine/khaotik-ui/components/svelte/AudioDetail.svelte'
import { linesLabel, recordingText, refusalText, takesLabel } from '@khaos-machine/khaotik-ui/components/svelte/lib/recordings.js'
import { peaksSeconds } from '@khaos-machine/khaotik-ui/components/svelte/lib/waveform.js'

// The Images and Audio destinations as data (catalog app-coverage plan, T5). formatBytes and
// peaksSeconds moved from Khaos App with their assertions intact; peaksSeconds now reads the
// kit's own peaks shape.

describe('formatBytes', () => {
  it.each([
    [0, '0 bytes'],
    [999, '999 bytes'],
    [1000, '1.0 KB'],
    [412_300, '412.3 KB'],
    [2_100_000, '2.1 MB'],
    [44_700_000, '44.7 MB'],
    [4_523_160_708, '4.5 GB'],
  ])('%i reads as %s', (bytes, text) => {
    expect(formatBytes(bytes)).toBe(text)
  })
})

describe('peaksSeconds', () => {
  it('is the length the peaks cover, so a Waveform given it draws the whole clip', () => {
    expect(peaksSeconds({ sample_rate: 24000, samples_per_pixel: 240, length: 272 })).toBeCloseTo(2.72)
  })
})

describe('the image rows', () => {
  const subject = { kind: /** @type {const} */ ('character'), id: 'c1' }
  const image = { width: 1536, height: 1024, sizeBytes: 2_110_807, mimeType: 'image/png', sha256: 'abc' }

  it('one per reference, named by the subject, a generated one keeping its recipe', () => {
    const recipe = { generationId: 'g1', providerId: 'openai', modelId: 'm', promptDigest: 'p', inputDigests: [] }
    const rows = imageRows([
      { subject, name: 'MADISON', references: [
        { id: 'r1', label: 'sheet', origin: 'uploaded', image, createdAt: 't' },
        { id: 'r2', label: 'headshot', origin: 'generated', image, createdAt: 't', provenance: recipe },
      ] },
      { subject: { kind: 'object', id: 'o1' }, references: [{ id: 'r3', label: 'cup', origin: 'uploaded', image, createdAt: 't' }] },
    ])
    expect(rows.map((r) => [r.referenceId, r.subjectName, r.subjectKind])).toEqual([
      ['r1', 'MADISON', 'character'],
      ['r2', 'MADISON', 'character'],
      ['r3', 'o1', 'object'],
    ])
    expect(rows[0].provenance).toBeUndefined()
    expect(rows[1].provenance).toBe(recipe)
  })

  it('names an image format from its media type', () => {
    expect(formatName('image/png')).toBe('PNG')
    expect(formatName('image/jpeg')).toBe('JPEG')
  })
})

describe('a recording in words', () => {
  it('is a line take’s line, or a scene read’s size', () => {
    expect(recordingText({ id: 't', kind: 'line', line: { text: 'Hello' }, voices: [], chosen: false, createdAt: '' })).toBe('Hello')
    expect(recordingText({ id: 'r', kind: 'scene', lineCount: 1, voices: [], chosen: false, createdAt: '' })).toBe('Scene read · 1 line')
    expect(linesLabel(7)).toBe('7 lines')
  })

  it('says what to do about a refused take', () => {
    expect(refusalText({ kind: 'scene', id: 's', code: 'TAKE_NEEDS_REREAD', reason: '' })).toMatch(/needs reading again/)
    expect(refusalText({ kind: 'line', id: 'l', code: 'TAKE_NOT_CONFORMANT', reason: '' })).toBe('A line take could not be read.')
  })
})

describe('a recording’s media', () => {
  const read = { id: 'r', kind: 'scene', lineCount: 3, voices: [], chosen: true, createdAt: '' }

  it('names the provider of a provider-made recording', () => {
    render(AudioDetail, { props: { recording: { ...read, media: { format: 'mp3', sizeBytes: 2048, provider: 'gemini', providerModel: 'gemini-tts' } } } })
    expect(screen.getByText('gemini')).toBeTruthy()
    expect(screen.getByText('gemini-tts')).toBeTruthy()
    expect(screen.queryByText('Assembled from')).toBeNull()
  })

  it('counts the takes an assembled recording was made from, and names no provider', () => {
    render(AudioDetail, { props: { recording: { ...read, media: { format: 'wav', sizeBytes: 2048, assembledFrom: ['a', 'b', 'c'] } } } })
    expect(screen.getByText('3 takes')).toBeTruthy()
    expect(screen.queryByText('Provider')).toBeNull()
    expect(takesLabel(1)).toBe('1 take')
  })
})

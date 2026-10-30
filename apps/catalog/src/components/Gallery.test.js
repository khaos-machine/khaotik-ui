import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Gallery from '@khaos-machine/khaotik-ui/components/svelte/Gallery.svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// #346 — khaos-app shows a subject's committed images in a Gallery and needs
// activating one to reveal it elsewhere. At lib-0.84.0 the Gallery had no
// handler at all, and no "object" kind for the placeholder glyph.

const IMAGES = [
  { id: 'ref-1', src: 'blob:one', caption: 'Front' },
  { id: 'ref-2', src: 'blob:two', caption: 'Profile' },
]

describe('Gallery activation', () => {
  it('names each activatable image by its caption, as a native button', () => {
    render(Gallery, { props: { images: IMAGES, onactivate: () => {} } })

    const front = screen.getByRole('button', { name: 'Front' })
    // A native button is focusable and takes Return and Space from the browser.
    expect(front.tagName).toBe('BUTTON')
    expect(front.getAttribute('type')).toBe('button')
    expect(screen.getByRole('button', { name: 'Profile' })).toBeTruthy()
  })

  it('calls onactivate with the image id when an image is clicked', async () => {
    const onactivate = vi.fn()
    render(Gallery, { props: { images: IMAGES, onactivate } })

    await fireEvent.click(screen.getByRole('button', { name: 'Profile' }))

    expect(onactivate).toHaveBeenCalledTimes(1)
    expect(onactivate).toHaveBeenCalledWith('ref-2')
  })

  it('falls back to the gallery name when an image has no caption', () => {
    render(Gallery, { props: { name: 'Cadi', images: [{ id: 'ref-9', src: 'blob:x' }], onactivate: () => {} } })
    expect(screen.getByRole('button', { name: 'Cadi' })).toBeTruthy()
  })

  it('offers nothing to activate without onactivate, or for an image without an id', () => {
    const { container } = render(Gallery, { props: { images: IMAGES } })
    expect(container.querySelectorAll('button')).toHaveLength(0)

    const { container: c2 } = render(Gallery, {
      props: { images: [{ src: 'blob:x', caption: 'Loose' }], onactivate: () => {} },
    })
    expect(c2.querySelectorAll('button')).toHaveLength(0)
    expect(c2.querySelectorAll('.gallery__item')).toHaveLength(1)
  })
})

describe('Gallery kind', () => {
  // Portrait already drew the object glyph, so the runtime path held before
  // #346; what a consumer could not do was TYPE `kind: 'object'`. The shipped
  // declaration is the contract, so it is what this reads.
  it('declares "object" in the shipped kind union', () => {
    const dts = readFileSync(join(import.meta.dirname, '../../../..', 'components/svelte/Gallery.svelte.d.ts'), 'utf8')
    const union = dts.match(/kind\?: ([^;]+);/)?.[1] ?? ''
    expect(union.split(' | ')).toContain('"object"')
  })

  it('passes kind "object" through to the placeholder figure', () => {
    const figureFor = vi.fn(() => null)
    render(Gallery, { props: { kind: 'object', images: [{ caption: 'Gun' }], figureFor } })
    expect(figureFor).toHaveBeenCalledWith(expect.objectContaining({ kind: 'object' }))
  })
})

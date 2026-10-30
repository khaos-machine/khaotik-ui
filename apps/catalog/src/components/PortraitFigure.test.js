import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Portrait from '@khaos-machine/khaotik-ui/components/svelte/Portrait.svelte'
import Gallery from '@khaos-machine/khaotik-ui/components/svelte/Gallery.svelte'
import characterAnalyses from '../data/character-analyses.json'

// #23 — two inspectors and Gallery:14 all passed
// `gender` and `age` to a Portrait that declared NEITHER. Svelte drops undeclared
// props in silence, so the call sites read as though the figure varied by
// demographic while every character rendered the same glyph. khaos-app built
// twelve gender/age silhouettes against that contract and could reach none of
// them.
//
// The fix is a resolver, not built-in artwork: the library ships no assets, and
// `coverFor` on Launcher (#20) set the precedent for exactly this.
//
// Every assertion here fails against the previous Portrait — the props did not
// exist, so no resolver could ever have been called.

const FIGURE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E'

// A real analysed character with real demographics: Desmond is male, and the
// gender/age the inspector derives come from character-analyses.json.
const withDemographics = Object.values(characterAnalyses).find((c) => c.demographics?.gender)

describe('Portrait figure resolution', () => {
  it('calls the resolver with the demographics it was given', () => {
    const figureFor = vi.fn(() => FIGURE)
    render(Portrait, { props: { name: 'Desmond', gender: 'male', age: 'adult', figureFor } })

    expect(figureFor).toHaveBeenCalledWith(
      expect.objectContaining({ gender: 'male', age: 'adult', name: 'Desmond' }),
    )
  })

  it('renders what the resolver returns, as a string or as an object', () => {
    const { container } = render(Portrait, { props: { name: 'Desmond', figureFor: () => FIGURE } })
    expect(container.querySelector('img')?.getAttribute('src')).toBe(FIGURE)

    const { container: c2 } = render(Portrait, {
      props: { name: 'Desmond', figureFor: () => ({ src: FIGURE, srcset: `${FIGURE} 2x` }) },
    })
    expect(c2.querySelector('img')?.getAttribute('srcset')).toBe(`${FIGURE} 2x`)
  })

  it('omits srcset rather than emitting it empty', () => {
    // An empty srcset is a candidate list a browser can fail to resolve — the
    // same contract ProjectCard's cover keeps.
    const { container } = render(Portrait, { props: { name: 'D', figureFor: () => FIGURE } })
    expect(container.querySelector('img')?.hasAttribute('srcset')).toBe(false)
  })

  it("falls back to the kit's own silhouette when the resolver declines", () => {
    // Returning nothing is the normal case, not an error — a consuming app may
    // override some buckets and not others, and the kit covers the rest.
    const { container } = render(Portrait, { props: { name: 'D', figureFor: () => null } })
    expect(container.querySelector('img')?.getAttribute('src')).toMatch(/unknown-adult/)
  })

  it('ships a figure for every gender/age bucket, and lands unknowns on a real one', () => {
    // 21 of 27 characters in the real data carry no demographics at all, so the
    // unknown/adult bucket is the one most often seen. It has to be a real
    // figure rather than a degraded state.
    for (const [gender, age, expected] of [
      ['female', 'young', 'female-young'],
      ['male', 'senior', 'male-senior'],
      ['nonbinary', 'adult', 'nonbinary-adult'],
      // The engine's own spelling. khaos-tools' character-schema.json declares
      // `male, female, non-binary, or "unknown"`, and the asset filenames carry
      // no hyphen — so the value the engine actually sends must still land on
      // the right figure rather than silently on `unknown`.
      ['non-binary', 'adult', 'nonbinary-adult'],
      ['Non-Binary', 'senior', 'nonbinary-senior'],
      ['', '', 'unknown-adult'],
      ['martian', 'ancient', 'unknown-adult'],
      // `child` is what an inspector derived from the engine's age; it maps onto the
      // young bucket rather than falling through to adult.
      ['female', 'child', 'female-young'],
    ]) {
      const { container } = render(Portrait, { props: { name: 'D', gender, age } })
      expect(
        container.querySelector('img')?.getAttribute('src'),
        `${gender || '(none)'}/${age || '(none)'} should resolve to ${expected}`,
      ).toMatch(expected)
    }
  })

  it('leaves scenes and locations on the glyph', () => {
    // The figure set is people. A location rendering a human silhouette would be
    // worse than the glyph it replaced.
    for (const kind of ['scene', 'location']) {
      const { container } = render(Portrait, { props: { name: 'Docks', kind } })
      expect(container.querySelector('img'), `${kind} should not take a figure`).toBeNull()
      expect(container.querySelector('.portrait__template')).not.toBeNull()
    }
  })

  it('lets an explicit src win over the resolver', () => {
    const figureFor = vi.fn(() => FIGURE)
    const { container } = render(Portrait, { props: { src: '/real.png', name: 'D', figureFor } })

    expect(container.querySelector('img')?.getAttribute('src')).toBe('/real.png')
    expect(figureFor).not.toHaveBeenCalled()
  })

  it('needs no resolver at all — the kit ships the default', () => {
    // The point of shipping the set rather than only the seam: a consumer that
    // does nothing still gets a figure, the same way utilities.css means an
    // eyebrow renders without the app owning the class.
    const { container } = render(Portrait, { props: { name: 'D', gender: 'male', age: 'adult' } })
    expect(container.querySelector('img')?.getAttribute('src')).toMatch(/male-adult/)
  })
})

describe('placeholders and real artwork coexist', () => {
  // The figure sets are pre-production placeholders and will be replaced by
  // user-supplied or generated images — the engine's /api/characters/appearance
  // already returns real art for some characters. So the placeholder era ends
  // PER ENTITY, not all at once, and a list has to render both at the same time
  // without the caller switching modes. That is why `src` wins per-Portrait
  // rather than a single "use placeholders" flag existing anywhere.
  it('renders real art where it exists and the placeholder where it does not', () => {
    const figureFor = vi.fn(() => FIGURE)
    const { container } = render(Gallery, {
      props: {
        name: 'Desmond',
        figureFor,
        images: [
          { src: '/generated/desmond.png', caption: 'Generated' },
          { caption: 'Awaiting art', gender: 'female', age: 'adult' },
        ],
      },
    })

    // Scoped to the artwork layer. Every Portrait now also carries its
    // silhouette in Avatar's fallback — present but `hidden` until the image
    // fails — so a bare `img` sweep sees four elements and answers a different
    // question than this test is asking.
    const srcs = [...container.querySelectorAll('.portrait__img')].map((i) => i.getAttribute('src'))
    expect(srcs).toEqual(['/generated/desmond.png', FIGURE])

    // Only the entry without art consulted the resolver.
    expect(figureFor).toHaveBeenCalledTimes(1)
    expect(figureFor).toHaveBeenCalledWith(expect.objectContaining({ gender: 'female' }))
  })
})

// Portrait chose between art and the template at RENDER time, on whether `src`
// was a non-empty string. A src that resolved to nothing therefore rendered the
// browser's broken-image icon and no placeholder at all — and that is not an
// edge case here. Artwork arrives per entity as the engine generates it, so a
// reference that exists but fails to load is an ordinary state.
//
// Ark UI's Avatar carries the load-status machine now. The template is always
// rendered and the machine hides whichever of the two is not current, so the
// assertions below are about the `hidden` attribute rather than about presence.
describe('Portrait load status', () => {
  const parts = (container) => ({
    img: container.querySelector('.portrait__img'),
    template: container.querySelector('.portrait__template'),
  })

  it('shows the template until the image has actually loaded', () => {
    const { container } = render(Portrait, { props: { name: 'Desmond', src: '/generated/desmond.webp' } })
    const { img, template } = parts(container)

    expect(img).not.toBeNull()
    expect(img.hasAttribute('hidden'), 'the image is not shown before it loads').toBe(true)
    expect(template.hasAttribute('hidden'), 'the template covers the gap').toBe(false)
  })

  it('swaps to the artwork once it loads', async () => {
    const { container } = render(Portrait, { props: { name: 'Desmond', src: '/generated/desmond.webp' } })
    await fireEvent.load(parts(container).img)
    const { img, template } = parts(container)

    expect(img.hasAttribute('hidden')).toBe(false)
    expect(template.hasAttribute('hidden')).toBe(true)
  })

  // The case the component could not express before: a src that is present and
  // broken. It used to leave a broken-image glyph on screen; it now falls back
  // to the silhouette it was always supposed to show.
  it('falls back to the silhouette when the artwork fails to load', async () => {
    const { container } = render(Portrait, { props: { name: 'Desmond', gender: 'male', age: 'adult', src: '/generated/gone.webp' } })
    await fireEvent.error(parts(container).img)
    const { img, template } = parts(container)

    expect(img.hasAttribute('hidden'), 'the broken image is taken off screen').toBe(true)
    expect(template.hasAttribute('hidden')).toBe(false)
    expect(template.querySelector('img').getAttribute('src')).toMatch(/male-adult/)
  })
})

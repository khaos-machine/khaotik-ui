import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ProjectCard from '@khaos-machine/khaotik-ui/components/svelte/ProjectCard.svelte'
import WelcomeWindow from '@khaos-machine/khaotik-ui/components/svelte/WelcomeWindow.svelte'
import Portrait from '@khaos-machine/khaotik-ui/components/svelte/Portrait.svelte'
import {
  identityChroma,
  identityColor,
  identityHue,
} from '@khaos-machine/khaotik-ui/components/svelte/lib/identity.js'

const PROJECT = {
  id: 'story_01KJXTKAMJ84E5S7K9J21ZKQZ7',
  title: 'BROKEN IN 4 PLACES',
  path: '/Users/k/khaos/projects/broken in 4 places.kspd',
  scene_count: 54,
}

const cover = (container) => container.querySelector('.project__art')
const tint = (container) => container.querySelector('.project__tint')
const styleOf = (el) => el?.getAttribute('style') ?? ''

describe('the cover image', () => {
  it('renders the art and drops the monogram when given a cover', () => {
    const { container } = render(ProjectCard, {
      props: { project: PROJECT, cover: '/cover.webp' },
    })
    expect(cover(container)?.getAttribute('src')).toBe('/cover.webp')
    expect(container.querySelector('.project__monogram')).toBeNull()
  })

  it('keeps the monogram when there is no cover', () => {
    // A consumer with no art must not get a blank hero.
    const { container } = render(ProjectCard, { props: { project: PROJECT } })
    expect(cover(container)).toBeNull()
    expect(container.querySelector('.project__monogram')?.textContent).toBeTruthy()
  })

  it('passes a srcset through when given one, and omits it otherwise', () => {
    const withSet = render(ProjectCard, {
      props: { project: PROJECT, cover: '/c.webp', coverSrcset: '/c.webp 1x, /c@2x.webp 2x' },
    })
    expect(cover(withSet.container)?.getAttribute('srcset')).toBe('/c.webp 1x, /c@2x.webp 2x')

    const without = render(ProjectCard, { props: { project: PROJECT, cover: '/c.webp' } })
    // An empty srcset attribute is not the same as no srcset — browsers treat "" as a
    // candidate list and can fail to pick any source.
    expect(cover(without.container)?.hasAttribute('srcset')).toBe(false)
  })

  it('marks the art decorative and lazy', () => {
    // The title is already in the DOM as text; an alt describing the cover would make a
    // screen reader announce the same project twice.
    const { container } = render(ProjectCard, { props: { project: PROJECT, cover: '/c.webp' } })
    expect(cover(container)?.getAttribute('alt')).toBe('')
    expect(cover(container)?.getAttribute('loading')).toBe('lazy')
  })
})

describe('the identity tint', () => {
  it('keys off the project id, not the title', () => {
    // #9's bug, on a different component: a colour derived from a label moves when the
    // label does. Same title, different project → different tint.
    const a = render(ProjectCard, { props: { project: PROJECT, cover: '/c.webp' } })
    const b = render(ProjectCard, {
      props: { project: { ...PROJECT, id: 'story_other' }, cover: '/c.webp' },
    })
    expect(styleOf(a.container.querySelector('.project__cover'))).not.toBe(
      styleOf(b.container.querySelector('.project__cover')),
    )
  })

  it('gives the SAME project the same tint every time', () => {
    // Stability is the whole feature: a colour that changes between runs is noise.
    const first = render(ProjectCard, { props: { project: PROJECT, cover: '/c.webp' } })
    const second = render(ProjectCard, { props: { project: { ...PROJECT }, cover: '/c.webp' } })
    expect(styleOf(first.container.querySelector('.project__cover'))).toBe(
      styleOf(second.container.querySelector('.project__cover')),
    )
  })

  it('distinguishes two projects that share a title', () => {
    // Not hypothetical — the launcher lists two projects both called
    // "TURTLE ISLAND'S TOP CLASS CLOWN".
    const shared = { title: "TURTLE ISLAND'S TOP CLASS CLOWN", scene_count: 2 }
    const a = render(ProjectCard, { props: { project: { ...shared, id: 'story_a' }, cover: '/c.webp' } })
    const b = render(ProjectCard, { props: { project: { ...shared, id: 'story_b' }, cover: '/c.webp' } })
    expect(styleOf(a.container.querySelector('.project__cover'))).not.toBe(
      styleOf(b.container.querySelector('.project__cover')),
    )
  })

  it('falls back to the path, then the title, when there is no id', () => {
    const { container } = render(ProjectCard, {
      props: { project: { title: 'T', path: '/p.kspd' }, cover: '/c.webp' },
    })
    expect(styleOf(container.querySelector('.project__cover'))).toContain(identityColor('/p.kspd'))
  })

  it('renders the tint element only with a cover', () => {
    const withArt = render(ProjectCard, { props: { project: PROJECT, cover: '/c.webp' } })
    expect(tint(withArt.container)).not.toBeNull()
    const without = render(ProjectCard, { props: { project: PROJECT } })
    expect(tint(without.container)).toBeNull()
  })
})

describe('the shared identity helper', () => {
  // The reference hash, spelled out here rather than imported: the point of these tests is
  // that the SOURCE of the colour never moves, so a copy that would have to be edited
  // alongside identity.js is the whole assertion.
  const referenceHash = (key) => {
    let h = 0
    for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) | 0
    return Math.abs(h)
  }

  it('still derives from the hash Portrait always used', () => {
    // The hash moved out of Portrait UNCHANGED and must stay that way: it decides the
    // colour of every character, scene and location already on screen, and stability
    // across runs is the feature (#9). #42 changed how the hash is MAPPED to a colour,
    // never the hash itself — so the stop an entity lands on is still a pure function of
    // this arithmetic.
    expect(identityHue('FORREST')).toBe((referenceHash('FORREST') % 16) * 22.5)
  })

  it('quantises hue to 16 evenly spaced stops, so near-misses cannot occur', () => {
    // #42: `hash % 360` left four of ten real projects inside an 18° band and three inside
    // 5°, which at a fixed lightness is not a perceptible difference. Two entities must
    // now either match exactly or differ obviously — ambiguity reads as a rendering
    // glitch, repetition reads as repetition.
    const hues = new Set()
    for (let i = 0; i < 500; i += 1) hues.add(identityHue(`entity_${i}`))
    expect(hues.size).toBeLessThanOrEqual(16)
    for (const h of hues) {
      expect(h % 22.5).toBe(0)
      expect(h).toBeLessThan(360)
    }
  })

  it('keeps both chroma tiers inside the sRGB gamut at every stop', () => {
    // The tiers are a capacity decision bounded by gamut, not taste. At L=52% the sRGB
    // chroma ceiling swings from 0.0886 (hue 202.5°) to 0.29 (292.5°), so any tier above
    // the worst-case ceiling is silently clamped by the browser — and two colours that
    // differ in code then render identically, which is the exact ambiguity #42 is about.
    // The previous fixed 0.09 was itself over that ceiling around 202°.
    const WORST_CASE_CEILING = 0.0886
    const chromas = new Set()
    for (let i = 0; i < 500; i += 1) chromas.add(identityChroma(`entity_${i}`))
    expect(chromas.size).toBe(2)
    for (const c of chromas) expect(c).toBeLessThan(WORST_CASE_CEILING)
  })

  it('is stable: the same key always yields the same colour', () => {
    expect(identityColor('chr_1')).toBe(identityColor('chr_1'))
    expect(identityColor('/p.kspd')).toBe(identityColor('/p.kspd'))
  })

  it('still drives Portrait, so the two components agree', () => {
    const { container } = render(Portrait, { props: { name: 'FORREST', identity: 'chr_1' } })
    expect(container.querySelector('.portrait')?.getAttribute('style')).toContain(
      identityColor('chr_1'),
    )
  })

  it('treats an empty key as a stable default rather than throwing', () => {
    expect(identityColor('')).toBe(identityColor('x'))
    expect(identityColor(null)).toBe(identityColor('x'))
  })
})

describe('WelcomeWindow forwards cover art', () => {
  // Without this the `cover` prop is unreachable: WelcomeWindow renders the cards, so a
  // ProjectCard prop no consumer can pass is exactly the defect #15 was about.
  const projects = [
    { id: 'story_a', title: 'A', scene_count: 1 },
    { id: 'story_b', title: 'B', scene_count: 2 },
  ]

  it('gives each card the art the host resolves for it', () => {
    const { container } = render(WelcomeWindow, {
      props: {
        projects,
        coverFor: (p) => ({ src: `/${p.id}.webp`, srcset: `/${p.id}.webp 1x, /${p.id}@2x.webp 2x` }),
      },
    })
    const art = [...container.querySelectorAll('.project__art')]
    expect(art.map((a) => a.getAttribute('src'))).toEqual(['/story_a.webp', '/story_b.webp'])
    expect(art[0].getAttribute('srcset')).toContain('/story_a@2x.webp 2x')
  })

  it('renders monograms when the host resolves no art', () => {
    // Not every consumer has cover art, and the window must not go blank for them.
    const { container } = render(WelcomeWindow, { props: { projects } })
    expect(container.querySelectorAll('.project__art')).toHaveLength(0)
    expect(container.querySelectorAll('.project__monogram')).toHaveLength(2)
  })

  it('tolerates a resolver that returns nothing for some projects', () => {
    const { container } = render(WelcomeWindow, {
      props: { projects, coverFor: (p) => (p.id === 'story_a' ? { src: '/a.webp' } : null) },
    })
    expect(container.querySelectorAll('.project__art')).toHaveLength(1)
    expect(container.querySelectorAll('.project__monogram')).toHaveLength(1)
  })
})

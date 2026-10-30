// Placeholder artwork for the fixtures.
//
// The COVER now comes from the kit itself (assets/placeholders) — it used to be
// an inline SVG duplicated between here and stories/, which was defensible only
// while the library shipped no art. It does now, so there is one copy and it is
// the real thing.
import coverSrc from '@khaos-machine/khaotik-ui/assets/placeholders/project-cover.webp'
import cover2x from '@khaos-machine/khaotik-ui/assets/placeholders/project-cover@2x.webp'

export const DEMO_COVER = coverSrc
export const DEMO_COVER_SRCSET = `${coverSrc} 1x, ${cover2x} 2x`

// A placeholder FIGURE set for the Portrait fixtures (#23).
//
// Pre-production, unlike the cover above, these are NOT the kit's set — they stand in
// for an app supplying its own, to demonstrate the `figureFor` override. They carry the early milestones
// and get replaced by user-supplied or generated artwork. They live here and not
// in the library for that reason — swapping them out must be a change in the
// consuming app, never a release of the kit.
//
// Deliberately abstract silhouettes. The variation shows the resolver is keyed on
// the demographics; it is not an attempt to draw people.
const figure = (hue, headR, shoulder) => `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">` +
  `<rect width="120" height="160" fill="hsl(${hue} 18% 22%)"/>` +
  `<circle cx="60" cy="${54 - headR}" r="${headR}" fill="hsl(${hue} 24% 62%)"/>` +
  `<path d="M60 ${64 - headR} C${60 - shoulder} ${70 - headR}, ${60 - shoulder} 160, ${60 - shoulder} 160 L${60 + shoulder} 160 C${60 + shoulder} 160, ${60 + shoulder} ${70 - headR}, 60 ${64 - headR} Z" fill="hsl(${hue} 24% 62%)"/>` +
  `</svg>`,
)}`

/** `figureFor` for the fixtures: one placeholder per gender/age bucket. */
export const demoFigureFor = ({ gender = '', age = '' } = {}) => {
  const g = String(gender).toLowerCase()
  const young = String(age).toLowerCase() === 'child'
  const hue = g === 'male' ? 210 : g === 'female' ? 340 : 40
  return young ? figure(hue, 16, 26) : figure(hue, 20, 34)
}

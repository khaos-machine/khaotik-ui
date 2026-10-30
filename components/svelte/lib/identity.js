// The deterministic identity colour: one entity, one colour, everywhere and forever.
//
// Extracted from Portrait rather than copied into ProjectCard. Two implementations of
// this hash is how the same character ends up teal in one surface and amber in another —
// and #9 was already a bug of exactly that family, where the colour keyed off a display
// LABEL, so it moved whenever the label did.
//
// The key must be a STABLE entity key — an id, a path — never a title or a name. Those
// change; identity does not.

/**
 * Portrait's original hash, moved here UNCHANGED.
 *
 * Deliberately not "improved" to FNV-1a on the way out. This function decides the colour
 * of every character, scene and location already on screen; a better hash would re-colour
 * all of them for no user-visible benefit, and identity colours are supposed to be stable
 * across runs — that stability is the whole feature (#9).
 */
function hash(value) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * WHY THE HUE IS QUANTISED (#42).
 *
 * `hash % 360` gives distinct hues but guarantees no SPACING, and measured against a real
 * library that failed the job the tint exists for: of ten projects, four landed within an
 * 18° band and three of those within 5°. At a fixed lightness a 3° step is not a
 * perceptible difference, so half the library read as one green field while 132°–340° sat
 * empty. Distinct is not the same as distinguishable, and it degrades as projects are
 * added.
 *
 * Sixteen stops, 22.5° apart. Two entities now either share a colour EXACTLY or differ
 * obviously — never the near-miss that reads as a rendering glitch. Ambiguity is worse
 * than repetition.
 *
 * The stop count is a gamut decision, not taste. At `L=52%` the sRGB chroma ceiling
 * varies by more than 3× across the wheel — 0.0886 at hue 202.5°, 0.29 at 292.5° — so any
 * scheme that raises chroma to add capacity clips on the hues it needs most.
 */
const HUE_STOPS = 16
const HUE_STEP = 360 / HUE_STOPS

/**
 * The two chroma tiers, in gamut at EVERY stop.
 *
 * A second axis doubles capacity to 32 combinations, which halves exact repeats. It has to
 * be chroma: the original note is right that lightness must not vary, because a lighter
 * swatch reads as a less important entity, and chroma carries no such meaning.
 *
 * Both values sit under 0.0886 — the worst-case ceiling, at hue 202.5° — so neither tier
 * clips anywhere on the wheel. That also fixes a latent bug: the previous fixed 0.09 was
 * itself out of gamut around 202°, where the browser silently clamped it, so two hues that
 * differed in code could render identically on screen.
 *
 * Holding both tiers constant across hues preserves the property the fixed chroma was
 * chosen for — every identity at the same visual weight — which per-hue chroma ceilings
 * would have thrown away.
 */
const CHROMA_TIERS = [0.05, 0.085]

/** The hue, 0–359, for an entity key. One of 16 evenly spaced stops (#42). */
export function identityHue(key) {
  return (hash(String(key || 'x')) % HUE_STOPS) * HUE_STEP
}

/** The chroma for an entity key: one of two tiers, both in sRGB gamut at every hue (#42). */
export function identityChroma(key) {
  const h = hash(String(key || 'x'))
  return CHROMA_TIERS[Math.floor(h / HUE_STOPS) % CHROMA_TIERS.length]
}

/**
 * The identity colour for an entity key.
 *
 * Fixed lightness so every identity sits at the same visual weight — a hue wheel with
 * varying lightness reads as some entities being more important than others.
 */
export function identityColor(key) {
  return `oklch(52% ${identityChroma(key)} ${identityHue(key)})`
}

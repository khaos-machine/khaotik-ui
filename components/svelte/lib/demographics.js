// The engine's demographic vocabulary, mapped onto the buckets the kit's
// placeholder figures ship for. One mapping for every view that draws a figure:
// two inspectors once derived it identically and separately — and were
// therefore wrong in the same way twice (#29).
//
// khaos-tools' `character-schema.json` declares the contract:
//
//   gender.value     e.g. male, female, non-binary, or "unknown"
//   age_range.value  e.g. teens, 20s, 30s, 40s, 50s, 60s+, or "unknown"
//
// Both call sites compared `ageRange === 'child'`. That string is not in the
// vocabulary and never was, so the comparison could not match at any point and
// EVERY character resolved to `adult` — including the one whose band is `teens`.
// Invisible until the kit started shipping figures, because a wrong bucket and a
// right one rendered the same glyph.

/** The three buckets `assets/placeholders/silhouettes` ships. */
const YOUNG = 'young'
const ADULT = 'adult'
const SENIOR = 'senior'

/**
 * An engine age band → a figure bucket.
 *
 * The boundaries are a judgement, not a fact, and they are recorded here rather
 * than inlined so there is one place to argue with:
 *
 *   teens and below → young     a teenager is not an adult figure (also a stated age under 20)
 *   20s–50s         → adult     the bulk of most casts
 *   60s+            → senior    (also a stated age of 60 or more)
 *
 * `50s` sits on the line and is deliberately `adult`: the senior figure reads
 * distinctly older, and mis-ageing someone upward is the more noticeable error.
 *
 * Anything unrecognised — including empty and "not stated", which is 31 of 34
 * characters in the real data — falls to `adult`, the neutral middle. That is not a claim about
 * the character; `Portrait` pairs it with the `unknown` gender figure, and the
 * pair reads as "no demographics" rather than as a specific person.
 */
export function ageBucket(value) {
  const a = String(value ?? '').trim().toLowerCase()
  if (!a) return ADULT

  // Explicit bands first.
  if (a === 'child' || a === 'children' || a === 'teen' || a === 'teens') return YOUNG
  if (a === 'senior' || a === 'elderly') return SENIOR
  if (a === YOUNG || a === ADULT) return a

  // Decade bands (`60s`, `60s+`) and stated ages (`36`): read the leading number
  // rather than listing every spelling, so a value the engine adds later still
  // lands somewhere sensible instead of silently becoming `adult`.
  const decade = a.match(/^(\d{1,3})(?:s\b|\+|$|\s)/)
  if (decade) {
    const n = Number(decade[1])
    if (n < 20) return YOUNG
    if (n >= 60) return SENIOR
    return ADULT
  }

  return ADULT
}

/**
 * An engine gender value → a figure bucket.
 *
 * `non-binary` arrives hyphenated from the engine and the asset filenames have
 * no hyphen, so separators are stripped before matching. Accepting only the
 * filename spelling sent every non-binary character to the `unknown` figure —
 * a plausible wrong figure rather than a visible failure, which reads as a data
 * gap rather than a mapping bug.
 */
export function genderBucket(value) {
  const g = String(value ?? '').toLowerCase().replace(/[\s_-]/g, '')
  return g === 'female' || g === 'male' || g === 'nonbinary' ? g : 'unknown'
}

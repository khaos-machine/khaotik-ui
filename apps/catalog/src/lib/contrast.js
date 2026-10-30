// WCAG 2.1 relative luminance and contrast, plus the decision rule #66 turns on.
//
// One implementation, so the two instruments cannot drift apart. Today it has
// exactly ONE caller in the tree — the Vitest calculator (`../contrast.test.js`),
// which since #218 also composites tones onto their own tints with `composite`.
// The runtime audit is a manual MCP-driven sweep of the running catalog, not a
// checked-in script, so it pastes this logic in rather than importing it; the
// two are held together by the calculator reproducing, from the shipped tokens,
// the same eight ratios the audit recorded. That is agreement on results, not
// a shared implementation, and it is weaker. A second copy would drift, and this repo
// has already shipped a crash from exactly that — there were two token parsers
// (tokens/parse.js's header says so).
//
// Thresholds are WCAG SC 1.4.3: 4.5:1 for normal text, 3:1 for large text,
// where large is 18pt (24px) or 14pt (18.66px) bold.

const CHANNEL = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i
const SHORT = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i
const RGB_FN = /^rgba?\(\s*([0-9.]+)[\s,]+([0-9.]+)[\s,]+([0-9.]+)/i

/**
 * Parse a hex string or an `rgb()` / `rgba()` string into [r, g, b] in 0..255.
 * Throws rather than guessing: a parser that quietly returns a default makes
 * every ratio built on it plausible and wrong.
 * @param {string} colour
 * @returns {[number, number, number]}
 */
export function toRgb(colour) {
  const value = String(colour).trim()
  const short = SHORT.exec(value)
  if (short !== null) {
    return /** @type {[number, number, number]} */ (
      short.slice(1, 4).map((c) => parseInt(c + c, 16))
    )
  }
  const hex = CHANNEL.exec(value)
  if (hex !== null) {
    return /** @type {[number, number, number]} */ (hex.slice(1, 4).map((c) => parseInt(c, 16)))
  }
  const fn = RGB_FN.exec(value)
  if (fn !== null) {
    return /** @type {[number, number, number]} */ (fn.slice(1, 4).map(Number))
  }
  throw new Error(`cannot parse colour: ${colour}`)
}

/**
 * WCAG relative luminance.
 * @param {string} colour
 * @returns {number}
 */
export function luminance(colour) {
  const [r, g, b] = toRgb(colour).map((channel) => {
    const s = channel / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * WCAG contrast ratio between two opaque colours. Symmetric; 1 for a colour
 * against itself; 21 for black on white.
 * @param {string} foreground
 * @param {string} background
 * @returns {number}
 */
export function contrastRatio(foreground, background) {
  const a = luminance(foreground)
  const b = luminance(background)
  const [lighter, darker] = a > b ? [a, b] : [b, a]
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * `foreground` at `alpha` laid over an opaque `background`, alpha-over in sRGB,
 * rounded to 8-bit channels as the browser paints it. This is what
 * `color-mix(in oklab, C p%, transparent)` composites to: C at alpha p, so no
 * oklab maths is needed.
 * @param {string} foreground
 * @param {string} background
 * @param {number} alpha 0..1
 * @returns {string} `#rrggbb`
 */
export function composite(foreground, background, alpha) {
  if (!(alpha >= 0 && alpha <= 1)) throw new Error(`alpha must be within 0..1, got ${alpha}`)
  const fg = toRgb(foreground)
  const bg = toRgb(background)
  return `#${fg
    .map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)).toString(16).padStart(2, '0'))
    .join('')}`
}

/** WCAG large text: 18pt (24px), or 14pt (18.66px) bold. */
export const LARGE_PX = 24
export const LARGE_BOLD_PX = 18.66

/**
 * @param {number} sizePx computed font-size in CSS pixels
 * @param {boolean} bold computed font-weight >= 700
 * @returns {boolean}
 */
export function largeText(sizePx, bold) {
  return sizePx >= LARGE_PX || (bold && sizePx >= LARGE_BOLD_PX)
}

/**
 * The bar this text has to clear.
 * @param {number} sizePx
 * @param {boolean} bold
 * @returns {4.5 | 3}
 */
export function requiredRatio(sizePx, bold) {
  return largeText(sizePx, bold) ? 3 : 4.5
}

/**
 * The decision rule. A correct ratio function with a wrong threshold
 * mass-passes, so this is asserted at its boundaries separately.
 * @param {number} ratio
 * @param {number} sizePx
 * @param {boolean} bold
 * @returns {boolean}
 */
export function passesContrast(ratio, sizePx, bold) {
  return ratio >= requiredRatio(sizePx, bold)
}

/** `font-weight` values that count as bold for the large-text threshold. */
export function isBold(fontWeight) {
  const numeric = Number(fontWeight)
  if (Number.isFinite(numeric)) return numeric >= 700
  return fontWeight === 'bold' || fontWeight === 'bolder'
}

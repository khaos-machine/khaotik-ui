// catalog/src/lib/brand-view.svelte.js
//
// What the four BrandKit screens — Color, Type, Shape, Tokens — share: the
// surface they are documenting, the rule for painting a chip, and the
// copy-to-clipboard affordance every row carries.
//
// It lives here rather than inside one of the four because none of them owns
// it. A screen importing another screen for its theme reader would make one of
// the four load-bearing for the other three, and the split exists to stop
// exactly that kind of coupling.

import { byTheme } from '@khaos-machine/khaotik-ui/tokens/parse.js'

// ---- which surface a screen is documenting ---------------------------------
//
// The primitives are one ladder in both modes, but the semantic layer is
// declared twice: --surface-base is indigo-950 in dark and grey-50 in light. A
// view pinned to one of them shows the wrong reference and the wrong colour in
// the other, which is exactly what a style guide must not do.
//
// The theme is read off <html> rather than taken as a prop because that
// attribute is what the shell actually sets (App.svelte:57-59), and these
// screens render through the fixture machinery, which does not thread the
// shell's state down to them.
const DEFAULT_THEME = 'dark'

export function readTheme() {
  if (typeof document === 'undefined') return DEFAULT_THEME
  const declared = document.documentElement.dataset.theme
  // hasOwn, not `in`: `'constructor' in byTheme` is true up the prototype
  return Object.hasOwn(byTheme, declared ?? '') ? declared : DEFAULT_THEME
}

let theme = $state(readTheme())

// One observer for the module rather than one per screen: the attribute is a
// property of the document, so the answer is the same for every reader. It is
// never disconnected because the document outlives every screen that reads it.
if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
  new MutationObserver(() => {
    theme = readTheme()
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
}

// Call this at a screen's init. The re-read is NOT redundant with the observer:
// module state is initialised the first time this file is imported, a
// MutationObserver callback is a microtask, and a theme set between those two
// points would miss the first paint entirely. Rendering into a document already
// in light mode is the ordinary case, not an edge one.
export function surface() {
  theme = readTheme()
  return {
    get theme() {
      return theme
    },
    get tokens() {
      return byTheme[theme]
    },
  }
}

// ---- painting a chip -------------------------------------------------------
//
// A swatch paints a plain hex. A semantic token declares a reference rather
// than a colour, so the chip paints `token.resolved` — the reference followed
// through the active theme's map (tokens/parse.js) — while the row keeps showing
// and copying the reference the kit actually declares. Anything that does not
// resolve to a hex (an oklch() or a color-mix() is a computation, not a
// reference) keeps the neutral chip rather than a guessed paint.
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export const isHex = (value) => HEX.test(value ?? '')
export const paint = (token) => (isHex(token.resolved) ? token.resolved : null)

// ---- click to copy ---------------------------------------------------------
//
// Shared across the four screens, and correct to share: only one of them is on
// the canvas at a time, so "which row was just copied" has one answer.
let copiedName = $state('')

export const copied = {
  get name() {
    return copiedName
  },
  is(name) {
    return copiedName === name
  },
}

export async function copyText(name, text) {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    return // clipboard unavailable — the value stays visible, nothing to do
  }
  copiedName = name
  setTimeout(() => {
    if (copiedName === name) copiedName = ''
  }, 1200)
}

// `--name: value;` — the declaration, not the resolved colour. A row that
// copied the hex would hand back a value the kit does not contain.
export const copyToken = (token) => copyText(token.name, `--${token.name}: ${token.value};`)

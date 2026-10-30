// Does a scrollable region sit close enough to its bottom that new content
// should keep it there? Extracted rather than inlined for one reason: this is
// the only part of tail-following that can be tested honestly. The DOM half
// needs a layout engine, and the test environment has none.
//
// jsdom performs no layout — `scrollHeight` and `clientHeight` are hard-coded
// `0` and the `scrollTop` setter is a no-op for an element with no layout box —
// so a rendered "it scrolled" assertion would pass identically against a
// component with the effect deleted. The arithmetic below needs no layout, so
// it is where the real test lives (`apps/catalog/src/components/tail-follow.test.js`).

/** How close to the bottom still counts as "at the bottom", in CSS pixels. */
export const STICK_THRESHOLD_PX = 24

/**
 * @param {{ scrollTop?: number, clientHeight?: number, scrollHeight?: number } | null} metrics
 * @param {number} [threshold]
 * @returns {boolean}
 */
export const shouldFollow = (metrics, threshold = STICK_THRESHOLD_PX) => {
  if (!metrics) return false
  const { scrollTop = 0, clientHeight = 0, scrollHeight = 0 } = metrics
  return scrollHeight - clientHeight - scrollTop <= threshold
}

import { describe, it, expect } from 'vitest'
import { shouldFollow, STICK_THRESHOLD_PX } from '@khaos-machine/khaotik-ui/components/svelte/lib/tail-follow.js'

// The tail-following DECISION, tested where it can be tested honestly.
//
// jsdom does no layout, so the DOM half of tail-following — "and then it
// scrolled" — cannot be asserted here at all: a test that rendered the
// component, added a line and checked `scrollTop` would pass identically
// against a build with both `$effect`s deleted. That is a vacuous gate and this
// repo has shipped three of them (CLAUDE.md).
//
// The predicate is arithmetic, and arithmetic needs no layout engine. This file
// tests the rule; `SetupProgress.test.js` tests that the component consults it.

describe('shouldFollow', () => {
  // 400 tall, 100 visible → the scrollable range is 300, and 300 is the
  // scrollTop at which the region is exactly at its bottom.
  const at = (scrollTop) => ({ scrollTop, clientHeight: 100, scrollHeight: 400 })

  it('follows when the region is exactly at its bottom', () => {
    expect(shouldFollow(at(300))).toBe(true)
  })

  it('follows one pixel inside the threshold', () => {
    // distance = 300 - 277 = 23, which is under 24.
    expect(shouldFollow(at(277))).toBe(true)
  })

  it('follows exactly at the threshold — the boundary is inclusive', () => {
    // distance = 300 - 276 = 24. `<=`, not `<`: a region sitting precisely
    // STICK_THRESHOLD_PX from the bottom is still at the bottom.
    expect(shouldFollow(at(276))).toBe(true)
  })

  it('does NOT follow one pixel past the threshold', () => {
    // distance = 300 - 275 = 25.
    expect(shouldFollow(at(275))).toBe(false)
  })

  it('does NOT follow when the operator has scrolled far up', () => {
    expect(shouldFollow(at(0))).toBe(false)
  })

  it('follows a region with nothing to scroll', () => {
    // An unlaid-out or not-yet-overflowing region reports 0/0/0, distance 0.
    // Following is right: a panel with nothing to scroll IS at its bottom, and
    // the alternative is a log that refuses to follow until it first overflows.
    expect(shouldFollow({ scrollTop: 0, clientHeight: 0, scrollHeight: 0 })).toBe(true)
  })

  it('follows when handed an empty metrics object', () => {
    // Every member defaults to 0, which is the 0/0/0 case above.
    expect(shouldFollow({})).toBe(true)
  })

  it('does NOT follow when there is no element at all', () => {
    // `null` is "the element is not mounted", which is not a claim about
    // position. Refusing to follow means the effect does nothing rather than
    // reaching into nothing.
    expect(shouldFollow(null)).toBe(false)
    expect(shouldFollow(undefined)).toBe(false)
  })

  it('honours an explicit threshold over the default', () => {
    // distance = 300 - 290 = 10.
    expect(shouldFollow(at(290), 5)).toBe(false)
    expect(shouldFollow(at(290), 10)).toBe(true)
  })

  it('exports the threshold the component and this file agree on', () => {
    expect(STICK_THRESHOLD_PX).toBe(24)
  })
})

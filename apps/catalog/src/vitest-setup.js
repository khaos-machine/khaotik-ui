import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/svelte'
import { afterEach } from 'vitest'

// jsdom implements no ResizeObserver. Ark UI's Segment Group measures the
// checked item to place its moving indicator (@zag-js/dom-query's
// resize-observer, reached from radio-group.machine's syncIndicatorRect), so
// rendering the adopted SegmentedControl throws without this.
//
// A no-op is the right shim, not an under-implementation: the indicator's
// position is a pixel geometry no test here asserts, and jsdom lays nothing
// out, so a "real" polyfill would report zeroes and mean no more than this.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

afterEach(cleanup)

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SegmentedControl from '@khaos-machine/khaotik-ui/components/svelte/SegmentedControl.svelte'

// A row narrower than its items scrolls, and the chosen item is scrolled into view (phone width,
// where a tap left "Characters" cut off at "Chara"). jsdom does no layout, so the row's and the
// items' geometry is set by hand: four 100px items in a 150px row.

const items = ['all', 'character', 'location', 'scene'].map((value) => ({ value, label: value }))

function lay(container) {
  const row = container.querySelector('.ui-segmented')
  Object.defineProperty(row, 'clientWidth', { value: 150, configurable: true })
  container.querySelectorAll('.ui-segmented__item').forEach((item, i) => {
    Object.defineProperty(item, 'offsetLeft', { value: i * 100, configurable: true })
    Object.defineProperty(item, 'offsetWidth', { value: 100, configurable: true })
  })
  return row
}

describe('SegmentedControl in a row too narrow for it', () => {
  it('scrolls the chosen item into view, from either side', async () => {
    const { container, rerender } = render(SegmentedControl, { props: { label: 'Lens', items, value: 'all' } })
    const row = lay(container)
    await rerender({ value: 'scene' })
    expect(row.scrollLeft).toBe(250)
    await rerender({ value: 'character' })
    expect(row.scrollLeft).toBe(100)
  })

  it('leaves the row alone when the chosen item is already in view', async () => {
    const { container, rerender } = render(SegmentedControl, { props: { label: 'Lens', items, value: 'all' } })
    const row = lay(container)
    row.scrollLeft = 0
    await rerender({ value: 'all' })
    expect(row.scrollLeft).toBe(0)
  })
})

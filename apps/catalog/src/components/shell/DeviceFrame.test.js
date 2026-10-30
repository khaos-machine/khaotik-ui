import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import DeviceFrame from './DeviceFrame.svelte'

// The chassis is drawn from the resolved device, not from a caller's opinion of
// it, so these assert the mapping rather than the styling: which device classes
// get a case, which get a status bar, and what happens when there is no device
// to be the case OF.
//
// jsdom resolves no stylesheets, so the radius and the bar's height are NOT
// asserted here — a rendered check would pass whether or not the rule shipped.
// What is checkable is the markup the rules key on, and that is what this pins.
const at = (device, size, extra = {}) => ({ device, size, orientation: 'portrait', enabled: true, ...extra })

describe('DeviceFrame', () => {
  it('sizes the frame from the device and size, and says which', () => {
    const { container } = render(DeviceFrame, { props: { frame: at('mobile', 'base') } })
    const frame = container.querySelector('.frame')
    expect(frame).toHaveStyle({ width: '390px', height: '844px' })
    expect(frame).toHaveAttribute('data-viewport', 'mobile:base')
  })

  it('draws a case and a status bar for a handset', () => {
    const { container } = render(DeviceFrame, { props: { frame: at('mobile', 'base') } })
    expect(container.querySelector('.frame').className).toContain('frame--chassis')
    expect(container.querySelector('.statusbar')).toBeInTheDocument()
  })

  // A tablet's status bar is a different shape at a different height, and this
  // repo has no reference for one. It takes the case without the bar rather than
  // wearing a handset's, which would put a device on screen that does not exist.
  it('draws a case for a tablet but no status bar', () => {
    const { container } = render(DeviceFrame, { props: { frame: at('tablet', 'base') } })
    expect(container.querySelector('.frame').className).toContain('frame--chassis')
    expect(container.querySelector('.statusbar')).not.toBeInTheDocument()
  })

  // A breakpoint is a width, not a machine.
  it('draws no case for a web breakpoint', () => {
    const { container } = render(DeviceFrame, { props: { frame: at('web', 'lg') } })
    const frame = container.querySelector('.frame')
    expect(frame.style.width).toBe('1024px')
    expect(frame.className).not.toContain('frame--chassis')
    expect(container.querySelector('.statusbar')).not.toBeInTheDocument()
  })

  // At Fill there is no device, so there is nothing to be the case of — and the
  // frame draws nothing at all, which is the behaviour the canvas already had.
  it('draws no case, and no frame, when nothing is sized', () => {
    const { container } = render(DeviceFrame, { props: { frame: at('web', 'fill') } })
    const frame = container.querySelector('.frame')
    expect(frame.getAttribute('style')).toBe('')
    expect(frame.className).not.toContain('frame--sized')
    expect(frame.className).not.toContain('frame--chassis')
  })

  it('takes the case off on request, keeping the size', () => {
    const { container } = render(DeviceFrame, { props: { frame: at('mobile', 'base'), chassis: false } })
    const frame = container.querySelector('.frame')
    expect(frame).toHaveStyle({ width: '390px' })
    expect(frame.className).not.toContain('frame--chassis')
    expect(container.querySelector('.statusbar')).not.toBeInTheDocument()
  })

  // The status bar names no control and reading "9:41" between the chrome and
  // the screen would be noise.
  it('hides the status bar from the accessible tree', () => {
    const { container } = render(DeviceFrame, { props: { frame: at('mobile', 'base') } })
    expect(container.querySelector('.statusbar')).toHaveAttribute('aria-hidden', 'true')
  })

  it('swaps the axes in landscape and keeps the case', () => {
    const { container } = render(DeviceFrame, {
      props: { frame: at('mobile', 'base', { orientation: 'landscape' }) },
    })
    const frame = container.querySelector('.frame')
    expect(frame).toHaveStyle({ width: '844px', height: '390px' })
    expect(frame).toHaveAttribute('data-viewport', 'mobile:base:landscape')
    expect(frame.className).toContain('frame--chassis')
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import SectionRail from './SectionRail.svelte'
import fs from 'node:fs'
import path from 'node:path'

// The rail exists for one property: reaching a section costs the same whether
// that section holds three components or three hundred. That only holds while
// the control is outside the scrolling list — App.test.js pins the containment;
// these pin the rail's own behaviour.
describe('SectionRail', () => {
  // The workspace axis is gone. It carried four entries, two of them empty by
  // declaration, above a rail that already listed the only workspace anyone
  // used — so it was a level of navigation whose whole job was choosing between
  // one populated branch and three sparse ones. Screens and Flows join the rail
  // as peers of the System sections, and the nav is one axis deep.
  it('rails every destination, System sections and the rest alike', () => {
    render(SectionRail, { section: 'brandkit' })

    for (const s of ['BrandKit', 'Foundation', 'Components', 'Screens', 'Flows']) {
      expect(screen.getByRole('button', { name: `${s} section` })).toBeInTheDocument()
    }
    // Playground is dropped, not hidden — it is out of the data entirely, so
    // there is no declared-but-invisible shelf left behind.
    expect(screen.queryByRole('button', { name: /Playground/ })).not.toBeInTheDocument()
  })

  it('marks the active section and forwards a choice up', async () => {
    const onsection = vi.fn()
    render(SectionRail, { section: 'foundation', onsection })

    expect(screen.getByRole('button', { name: 'Foundation section' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'BrandKit section' })).not.toHaveAttribute('aria-current')

    await fireEvent.click(screen.getByRole('button', { name: 'Components section' }))
    expect(onsection).toHaveBeenCalledWith('components')
  })

  // The rail's shape does not depend on where you are standing. Earlier
  // versions of this axis hid entries — the switcher vanished in a
  // single-section workspace, and before that whole workspaces were behind a
  // dropdown — so the standing controls differed by location and could not be
  // learned. Every destination is present in every state now.
  it('renders the same entries whichever destination is active', () => {
    const { unmount } = render(SectionRail, { section: 'brandkit' })
    const from = (r) => [...r.querySelectorAll('button')].map((b) => b.getAttribute('aria-label'))
    const atBrandkit = from(document)
    unmount()

    render(SectionRail, { section: 'flows' })
    expect(from(document)).toEqual(atBrandkit)
  })

})

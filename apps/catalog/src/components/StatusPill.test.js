import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import StatusPill from '@khaos-machine/khaotik-ui/components/svelte/StatusPill.svelte'

describe('StatusPill', () => {
  it('renders the status text', () => {
    render(StatusPill, { props: { text: 'Complete', tone: 'success' } })
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('applies the tone as a data attribute (BrandKit mapping is CSS-side)', () => {
    const { container } = render(StatusPill, { props: { text: 'Skipped', tone: 'skipped' } })
    expect(container.querySelector('[data-tone="skipped"]')).toBeInTheDocument()
  })

  it('renders the optional Phosphor icon hidden from the accessible tree', () => {
    const { container } = render(StatusPill, { props: { text: 'Warning', tone: 'warning', icon: 'warning' } })
    const icon = container.querySelector('.pill i[aria-hidden="true"]')
    expect(icon).toBeTruthy()
    expect(icon.className).toContain('ph-warning')
  })
})

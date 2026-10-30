import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import MetricCard from '@khaos-machine/khaotik-ui/components/svelte/MetricCard.svelte'

describe('MetricCard', () => {
  it('groups the metric under its label (fixture a11y: role=group, label=$.label)', () => {
    render(MetricCard, { props: { value: '4.2 min', label: 'Runtime' } })
    expect(screen.getByRole('group', { name: 'Runtime' })).toBeInTheDocument()
  })

  it('renders the value as visible content', () => {
    render(MetricCard, { props: { value: '4.2 min', label: 'Runtime' } })
    expect(screen.getByText('4.2 min')).toBeInTheDocument()
  })

  it('renders the optional sub line', () => {
    render(MetricCard, { props: { value: '42%', label: 'Share', sub: 'of film' } })
    expect(screen.getByText('of film')).toBeInTheDocument()
  })
})

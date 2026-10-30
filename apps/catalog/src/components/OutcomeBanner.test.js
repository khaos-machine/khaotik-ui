import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import OutcomeBanner from '@khaos-machine/khaotik-ui/components/svelte/OutcomeBanner.svelte'

// #27 — khaos-app's ADR-0007 rule 3 requires every mutation to report its
// outcome, and on failure to show THE ENGINE'S OWN MESSAGE rather than a generic
// one.
//
// That is the constraint worth guarding. khaosd's errors are specific
// ("projectPath query param required", "project is not a git repository"), and
// replacing them with "Something went wrong" discards the only part that tells
// anyone what to do next.

// A real khaosd error envelope message, verbatim.
const ENGINE_ERROR = 'projectPath query param required'

describe('OutcomeBanner carries the engine\'s own words', () => {
  it('renders the detail verbatim', () => {
    render(OutcomeBanner, { props: { tone: 'error', title: 'Could not delete project', detail: ENGINE_ERROR } })
    expect(screen.getByText(ENGINE_ERROR)).toBeInTheDocument()
  })

  it('renders a long message whole, with no ellipsis of its own', () => {
    // An error clipped mid-sentence is worse than no error, because it reads as
    // complete. Wrapping is the component's answer to length, never truncation.
    const long =
      'failed to open project at /Users/k/khaos/projects/broken in 4 places.kspd: ' +
      'the .kspd directory exists but contains no info.json, so it cannot be read as a project'
    render(OutcomeBanner, { props: { tone: 'error', detail: long } })

    const el = screen.getByText(long)
    expect(el.textContent).toBe(long)
    expect(el.textContent).not.toContain('…')
  })

  it('shows the title alone when there is no engine message', () => {
    render(OutcomeBanner, { props: { tone: 'success', title: 'Project deleted' } })
    expect(screen.getByText('Project deleted')).toBeInTheDocument()
  })

  it('renders neither line when given neither, rather than an empty box of prose', () => {
    const { container } = render(OutcomeBanner, { props: { tone: 'success' } })
    expect(container.querySelector('.outcome__title')).toBeNull()
    expect(container.querySelector('.outcome__detail')).toBeNull()
  })
})

describe('OutcomeBanner announces a failure differently from a success', () => {
  it('interrupts on error', () => {
    // A mutation that did not happen is worth interrupting a screen reader for.
    render(OutcomeBanner, { props: { tone: 'error', title: 'Could not delete project' } })
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('waits its turn on success', () => {
    render(OutcomeBanner, { props: { tone: 'success', title: 'Project deleted' } })
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('carries the tone as data, so the styling has something to key off', () => {
    const { container } = render(OutcomeBanner, { props: { tone: 'error' } })
    expect(container.querySelector('.outcome').dataset.tone).toBe('error')
  })
})

describe('OutcomeBanner dismissal', () => {
  it('reports a dismiss', async () => {
    const onDismiss = vi.fn()
    render(OutcomeBanner, { props: { tone: 'success', title: 'Project deleted', onDismiss } })

    await fireEvent.click(screen.getByRole('button', { name: /Dismiss/ }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('names what it is dismissing', () => {
    // "Dismiss" alone gives a screen-reader user no idea which of two banners
    // they are on.
    render(OutcomeBanner, { props: { tone: 'error', title: 'Could not delete project' } })
    expect(screen.getByRole('button', { name: 'Dismiss: Could not delete project' })).toBeInTheDocument()
  })

  it('can be made permanent', () => {
    render(OutcomeBanner, { props: { tone: 'error', title: 'Could not delete project', dismissible: false } })
    expect(screen.queryByRole('button', { name: /Dismiss/ })).toBeNull()
  })

  it('does not throw when dismissed with no handler', async () => {
    render(OutcomeBanner, { props: { tone: 'success', title: 'Done' } })
    await fireEvent.click(screen.getByRole('button', { name: /Dismiss/ }))
    expect(screen.getByText('Done')).toBeInTheDocument()
  })
})

// Source-read, because jsdom computes no layout: a rule that truncates the
// engine's message would pass every rendered assertion above while shipping the
// exact defect this component exists to prevent.
describe('nothing in the styles can clip the engine message', () => {
  const source = readFileSync(
    join(import.meta.dirname, '../../../..', 'components/svelte/OutcomeBanner.svelte'),
    'utf8',
  )
  const styles = (source.match(/<style>([\s\S]*)<\/style>/)?.[1] ?? '').replace(/\/\*[\s\S]*?\*\//g, '')
  const detailRule = styles.match(/\.outcome__detail\s*\{([^}]*)\}/)?.[1] ?? ''

  it('the detail wraps rather than truncating', () => {
    expect(detailRule).toMatch(/overflow-wrap:\s*anywhere/)
    expect(detailRule).toMatch(/white-space:\s*pre-wrap/)
  })

  it('the detail declares no ellipsis and no line clamp', () => {
    expect(detailRule).not.toMatch(/text-overflow/)
    expect(detailRule).not.toMatch(/line-clamp/)
    expect(detailRule).not.toMatch(/white-space:\s*nowrap/)
  })
})

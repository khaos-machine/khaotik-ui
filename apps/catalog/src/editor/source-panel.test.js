import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Canvas from '../components/shell/Canvas.svelte'
import SourcePanel from './SourcePanel.svelte'
import { fixtures } from '../fixtures.js'
import { composedFixture } from './registry.js'
import { createDocument, layoutNode, componentNode } from './document.js'

const frame = { device: 'web', size: 'fill', orientation: 'portrait', enabled: true }
const metricCard = fixtures.find((f) => f.name === 'MetricCard')
const brandScreen = fixtures.find((f) => f.section === 'brandkit')

const card = {
  ...createDocument({ kind: 'component', slug: 'scene-card', name: 'Scene card' }),
  root: layoutNode({ id: 'n0', children: [componentNode('@MetricCard', { id: 'n1' })] }),
}

const show = (selected) =>
  render(Canvas, { props: { selected, active: selected.examples?.[0] ?? null, frame } })

describe('the implementation badge and source panel', () => {
  it('badges a published component as having a Svelte implementation', () => {
    show(metricCard)
    expect(screen.getByRole('button', { name: 'Svelte' })).toBeInTheDocument()
  })

  it('badges a composed component as JSON with nothing generated from it', () => {
    // The badge carries information only because the answer varies. If every
    // entry were Svelte-backed it would be decoration.
    show(composedFixture(card))
    expect(screen.getByText('JSON only')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Svelte' })).toBeNull()
  })

  it('badges nothing for a BrandKit specimen', () => {
    // Those are catalog-local screens documenting the system, not components of
    // the kit. Labelling them would claim something that is not being claimed.
    show(brandScreen)
    expect(screen.queryByRole('button', { name: 'Svelte' })).toBeNull()
    expect(screen.queryByText('JSON only')).toBeNull()
  })

  it('opens the real source file behind a published component', async () => {
    show(metricCard)
    expect(screen.queryByLabelText('Source')).toBeNull()
    await fireEvent.click(screen.getByRole('button', { name: 'Svelte' }))

    const panel = screen.getByLabelText('Source')
    expect(panel).toHaveTextContent('components/svelte/MetricCard.svelte')
    // The actual file, not a summary of it.
    expect(panel).toHaveTextContent('$props()')
    expect(panel).toHaveTextContent('--tone-')
  })

  it('closes the panel when the selection changes', async () => {
    // A panel that stayed open would show the previous component's code beside
    // the new one's render, on a surface whose whole job is saying what backs
    // what.
    const { rerender } = show(metricCard)
    await fireEvent.click(screen.getByRole('button', { name: 'Svelte' }))
    expect(screen.getByLabelText('Source')).toBeInTheDocument()

    await rerender({ selected: brandScreen, active: brandScreen.examples?.[0] ?? null, frame })
    expect(screen.queryByLabelText('Source')).toBeNull()
  })

  it('shows a composed document as JSON, and says no Svelte was generated', () => {
    // Honest rather than an empty tab: emitting code from a document is a code
    // generator, which is a different piece of work and is not pretended at.
    render(SourcePanel, { props: { document: card } })
    const panel = screen.getByLabelText('Source')
    expect(panel).toHaveTextContent('scene-card.json')
    expect(panel).toHaveTextContent('"@MetricCard"')
    expect(panel).toHaveTextContent(/No Svelte implementation has been generated/)
  })

  it('fills the frame for a composed page, and not for a composed component', () => {
    // FOUND IN A BROWSER, and still reachable: `Canvas` renders a composed
    // document whenever it is reached from outside Compose — a search hit, or a
    // flow step. It decided fill from `kind === 'screen'`, which predates pages,
    // so a page never got `.frame--fill`, the frame shrank to its content, and a
    // grid inside collapsed to zero-width tracks: `minmax(0, 1fr)` has nothing to
    // divide without a definite width. A page is screen-shaped; a component is
    // not, and is shown at its own size.
    const page = { ...createDocument({ kind: 'page', slug: 'triage', name: 'Triage' }) }
    const asPage = show(composedFixture(page))
    expect(asPage.container.querySelector('.frame--fill')).toBeInTheDocument()

    const asComponent = show(composedFixture(card))
    expect(asComponent.container.querySelector('.frame--fill')).toBeNull()
  })

  it('says so when there is nothing to show, rather than rendering an empty pane', () => {
    render(SourcePanel, { props: {} })
    expect(screen.getByText('No source to show.')).toBeInTheDocument()
  })
})

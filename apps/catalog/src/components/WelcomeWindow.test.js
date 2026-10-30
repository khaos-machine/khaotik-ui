import { describe, it, expect, vi } from 'vitest'
import { createRawSnippet } from 'svelte'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import WelcomeWindow from '@khaos-machine/khaotik-ui/components/svelte/WelcomeWindow.svelte'
import EngineDetails from '@khaos-machine/khaotik-ui/components/svelte/EngineDetails.svelte'

// The desktop welcome window (data-layer plan A11; audit §3.9): an action rail with the engine
// plates under it, always visible, and the story cards beside it.

const b4p = { id: 's1', title: 'BROKEN IN 4 PLACES', path: '/p/b4p.kspd', scene_count: 57, character_count: 27, location_count: 26, package_stage: 'indexed', git_repo: true }
const heart = { id: 's2', title: 'Heart of an Indie', path: '/p/heart.kspd', scene_count: 5, character_count: 4, location_count: 3, package_stage: 'parsed' }
const importing = { id: 'pending', title: 'Brick & Steel', path: '/p/brick.kspd' }
const engine = { state: 'ready', components: [{ name: 'Daemon', version: '0.93.0' }, { name: 'Tools', version: '0.51.0' }] }
const routes = [{ capability: 'analysis.text', label: 'Analysis', provider: 'openrouter', model: 'deepseek/deepseek-v4.1-flash' }]
const services = [{ name: 'khaos-synth', state: 'running', ready_to_use: true }, { name: 'ollama', state: 'stopped' }]
const base = { engine, routes, services, projects: [importing, b4p, heart], jobFor: (p) => (p.id === 'pending' ? { kind: 'import', phase: 'running', elapsedMs: 65_000 } : undefined) }

describe('the action rail', () => {
  it('offers Import, Open and Clone, each disabled when the host gives no handler', () => {
    render(WelcomeWindow, { props: { ...base, onImport: vi.fn(), onOpen: vi.fn() } })
    const rail = screen.getByRole('navigation', { name: 'Project actions' })
    expect(within(rail).getByRole('button', { name: /Import Screenplay/ })).toBeEnabled()
    expect(within(rail).getByRole('button', { name: /Open/ })).toBeEnabled()
    expect(within(rail).getByRole('button', { name: /Clone Repository/ })).toHaveAttribute('aria-disabled', 'true')
  })

  // Khaos App Q6, "Settings everywhere" (first-run fixes K1): the launcher can offer Settings.
  // The label is the operator's, approved 2026-10-16. Absent means not offered, not disabled.
  it('offers Settings… only when the host gives a handler', async () => {
    const onSettings = vi.fn()
    render(WelcomeWindow, { props: { ...base, onSettings } })
    const rail = screen.getByRole('navigation', { name: 'Project actions' })
    await fireEvent.click(within(rail).getByRole('button', { name: /Settings…/ }))
    expect(onSettings).toHaveBeenCalledOnce()
  })

  it('has no Settings action when the host gives none', () => {
    render(WelcomeWindow, { props: base })
    const rail = screen.getByRole('navigation', { name: 'Project actions' })
    expect(within(rail).queryByRole('button', { name: /Settings/ })).toBeNull()
  })
})

describe('the story cards (operator: "bring back the cards but adjust to fit")', () => {
  it('draws one card per story, the importing one first with its job, and no table', () => {
    render(WelcomeWindow, { props: base })
    expect(screen.queryByRole('grid')).toBeNull()
    const cards = within(screen.getByRole('list', { name: 'Stories' })).getAllByRole('listitem')
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveTextContent('Brick & Steel')
    expect(cards[0]).toHaveTextContent('Importing screenplay')
    expect(cards[1]).toHaveTextContent('BROKEN IN 4 PLACES')
  })

  it('keeps each card’s own actions: open, extract a parsed story, remove from recents', async () => {
    const onOpenProject = vi.fn()
    const onExtractProject = vi.fn()
    const onRemoveProject = vi.fn()
    render(WelcomeWindow, { props: { ...base, onOpenProject, onExtractProject, onRemoveProject } })
    await fireEvent.click(screen.getByRole('button', { name: 'Extract Heart of an Indie' }))
    expect(onExtractProject).toHaveBeenCalledWith(heart)
    await fireEvent.click(screen.getByLabelText('Remove BROKEN IN 4 PLACES from Recents'))
    expect(onRemoveProject).toHaveBeenCalledWith(b4p)
  })
})

describe('the engine plates (operator: "want to see these and not have them buried")', () => {
  it('shows the engine, its routing and the on-device engines in the rail, with nothing to open', () => {
    render(WelcomeWindow, { props: base })
    const rail = screen.getByRole('complementary')
    expect(within(rail).getByText('Engine')).toBeInTheDocument()
    expect(within(rail).getByText('Ready')).toBeInTheDocument()
    expect(within(rail).getByText('Daemon')).toBeInTheDocument()
    expect(within(rail).getByText('0.51.0')).toBeInTheDocument()
    expect(within(rail).getByText('Routing')).toBeInTheDocument()
    expect(within(rail).getByText('deepseek-v4.1-flash')).toBeInTheDocument()
    expect(within(rail).getByText('On-device engines')).toBeInTheDocument()
    expect(within(rail).getByText('1 running')).toBeInTheDocument()
    expect(within(rail).getByText('ollama')).toBeInTheDocument()
  })

  it('has no status line or Details popover duplicating them', () => {
    render(WelcomeWindow, { props: base })
    expect(screen.queryByRole('button', { name: 'Details' })).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('EngineDetails', () => {
  it('lists each component and version, each route by its model, and the on-device engines', () => {
    render(EngineDetails, { props: { engine, routes, services } })
    expect(screen.getByText('Daemon')).toBeInTheDocument()
    expect(screen.getByText('0.93.0')).toBeInTheDocument()
    expect(screen.getByText('Analysis')).toBeInTheDocument()
    expect(screen.getByText('deepseek-v4.1-flash')).toBeInTheDocument()
    expect(screen.getByText('khaos-synth')).toBeInTheDocument()
    expect(screen.getByText('1 running')).toBeInTheDocument()
  })

  it('carries the engine pill and the running count in the plate heads, as Launcher did', () => {
    render(EngineDetails, { props: { engine, routes, services } })
    expect(within(screen.getByRole('button', { name: /^Engine/ })).getByText('Ready')).toBeInTheDocument()
    expect(within(screen.getByRole('button', { name: /On-device engines/ })).getByText('1 running')).toBeInTheDocument()
    expect(screen.queryByText('Status')).toBeNull()
  })

  it('lists the first three on-device engines and counts the rest, as the plate did', () => {
    const six = ['Image', 'Kitten', 'Music', 'Pilot', 'Sound', 'Speech'].map((n) => ({ name: n, state: 'running', ready_to_use: true }))
    render(EngineDetails, { props: { engine, services: six } })
    expect(screen.getByText('6 running')).toBeInTheDocument()
    expect(screen.getByText('Music')).toBeInTheDocument()
    expect(screen.queryByText('Pilot')).toBeNull()
    expect(screen.getByText('+3 more')).toBeInTheDocument()
  })

  it('keeps each engine\u2019s state as its dot, beside "not installed" too, as the plate did', () => {
    const { container } = render(EngineDetails, { props: { engine, services: [...services, { name: 'localmlx', state: 'error', provisioned: false }] } })
    const dots = [...container.querySelectorAll('[data-state]')].map((d) => d.getAttribute('data-state'))
    expect(dots).toEqual(['running', 'stopped', 'error'])
    expect(screen.getByText('not installed')).toBeInTheDocument()
  })

  it('marks a version that is not an exact release, as the plate did', () => {
    render(EngineDetails, { props: { engine: { state: 'ready', components: [{ name: 'App', version: '0.22.0' }, { name: 'Tools', version: '0.51.0-3-gabc+dirty' }] } } })
    expect(screen.getByText('0.51.0-3-gabc+dirty')).toHaveAttribute('data-release', 'false')
    expect(screen.getByText('0.22.0')).toHaveAttribute('data-release', 'true')
  })
})

describe('EngineDetails, update verdicts', () => {
  it('keeps a component’s update verdict beside its version, its detail as the name and the hover', () => {
    const components = [{ name: 'Tools', version: 'installed, version unknown', update: { icon: 'question', tone: 'warning', detail: 'Version unknown: exit status 1: boom' } }]
    const { container } = render(EngineDetails, { props: { engine: { state: 'ready', components } } })
    expect(screen.getByText('installed, version unknown')).toBeInTheDocument()
    expect(container.querySelector('[title="Version unknown: exit status 1: boom"]')).not.toBeNull()
    expect(screen.getByText('Version unknown: exit status 1: boom')).toHaveClass('visually-hidden')
  })
})

// A card's host content, per story (ProjectCard `children`, as Launcher's `detail`): khaos-app
// offers a failed extraction's fix and Report a Problem… on the card (onboarding A5).
describe('the story cards carry a per-card detail', () => {
  it('renders the detail snippet inside that story’s card, given its project', () => {
    const detail = createRawSnippet((p) => ({ render: () => `<p>offer for ${p().title}</p>` }))
    render(WelcomeWindow, { props: { ...base, detail } })
    const offer = screen.getByText('offer for Heart of an Indie')
    expect(offer.closest('li')).toHaveTextContent('Heart of an Indie')
    expect(offer.closest('li')).not.toHaveTextContent('BROKEN IN 4 PLACES')
  })
})

// BA-R4b (onboarding plan, Basic and Advanced): under Basic the host passes no engines at all,
// and the plate goes, rather than reading "No on-device engines" (operator: "Hide it in Basic").
describe('the on-device engines plate can be absent (BA-R4b)', () => {
  it('renders no engines section when services is omitted', () => {
    const { services: _omitted, ...rest } = base
    render(WelcomeWindow, { props: rest })
    expect(screen.queryByText('On-device engines')).toBeNull()
    expect(screen.queryByText('No on-device engines')).toBeNull()
  })

  it('keeps the empty section when services is an empty list', () => {
    render(WelcomeWindow, { props: { ...base, services: [] } })
    expect(screen.getByText('On-device engines')).toBeInTheDocument()
    expect(screen.getByText('No on-device engines')).toBeInTheDocument()
  })

  it('EngineDetails alone: omitted services draws no section', () => {
    render(EngineDetails, { props: { engine, routes } })
    expect(screen.queryByText('On-device engines')).toBeNull()
  })
})

describe('the Clone action can be absent', () => {
  // A host where cloning is not a feature on this path says so with clone: false, and the
  // action is not there at all rather than disabled. Omitting onClone still disables it.
  it('renders no Clone Repository when clone is false', () => {
    render(WelcomeWindow, { props: { ...base, onImport: vi.fn(), onOpen: vi.fn(), clone: false } })
    const rail = screen.getByRole('navigation', { name: 'Project actions' })
    expect(within(rail).queryByRole('button', { name: /Clone Repository/ })).toBeNull()
    expect(within(rail).getByRole('button', { name: /Import Screenplay/ })).toBeEnabled()
  })

  it('keeps Clone Repository, enabled with a handler, when clone is true', () => {
    render(WelcomeWindow, { props: { ...base, onClone: vi.fn(), clone: true } })
    const rail = screen.getByRole('navigation', { name: 'Project actions' })
    expect(within(rail).getByRole('button', { name: /Clone Repository/ })).toBeEnabled()
  })
})

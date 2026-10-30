import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import EngineDetails from '@khaos-machine/khaotik-ui/components/svelte/EngineDetails.svelte'
import WelcomeWindow from '@khaos-machine/khaotik-ui/components/svelte/WelcomeWindow.svelte'

// The engine plates' behaviour, moved with them from Launcher (catalog app-coverage plan,
// K-final). Each case below was pinned against Launcher's plates and is asserted here against
// EngineDetails, which draws the same three axes; WelcomeWindow.test.js covers how the window
// hosts it. STRUCTURE is asserted against the render, CSS against the SOURCE: jsdom resolves no
// stylesheets, so a rendered assertion about layout passes whether the rule exists or not.

const componentsDir = join(import.meta.dirname, '../../../..', 'components/svelte')
const source = readFileSync(join(componentsDir, 'EngineDetails.svelte'), 'utf8')
const markSource = readFileSync(join(componentsDir, 'ProviderMark.svelte'), 'utf8')

const section = (container, title) =>
  [...container.querySelectorAll('.section')].find((s) => s.querySelector('.section__title')?.textContent.trim() === title)
const readings = (container) =>
  [...section(container, 'Engine').querySelectorAll('.prop')].map((row) => [
    row.querySelector('.prop__label').textContent.trim(),
    row.querySelector('.details__reading').textContent.trim(),
  ])

describe('the engine section', () => {
  it('maps the legacy three fields into rows, so old consumers still read correctly', () => {
    const { container } = render(EngineDetails, { props: { engine: { appVersion: '0.1.0', daemonVersion: '0.4.11', wflAvailable: true } } })
    expect(readings(container)).toEqual([['App', '0.1.0'], ['Daemon', '0.4.11'], ['WFL', 'ready']])
  })

  it('renders one row per component when the host supplies them', () => {
    // Real values from /api/health + /api/update-check on khaosd 0.4.11.
    const components = [
      { name: 'Khaos App', version: '0.1.0' },
      { name: 'Foundation', version: '0.4.51' },
      { name: 'khaosd', version: '0.4.11' },
      { name: 'git', status: 'present' },
    ]
    const { container } = render(EngineDetails, { props: { engine: { state: 'ready', components } } })
    expect(readings(container)).toEqual([['Khaos App', '0.1.0'], ['Foundation', '0.4.51'], ['khaosd', '0.4.11'], ['git', 'present']])
  })

  it('sets a status apart from a version', () => {
    // A state is prose, not a number: only a version carries a release verdict.
    render(EngineDetails, { props: { engine: { components: [{ name: 'khaosd', version: '0.4.11' }, { name: 'git', status: 'not found' }] } } })
    expect(screen.getByText('0.4.11')).toHaveAttribute('data-release')
    expect(screen.getByText('not found')).not.toHaveAttribute('data-release')
  })

  it('prefers components over the legacy fields when both are given', () => {
    const { container } = render(EngineDetails, { props: { engine: { appVersion: '9.9.9', daemonVersion: '9.9.9', components: [{ name: 'khaosd', version: '0.4.11' }] } } })
    expect(readings(container)).toEqual([['khaosd', '0.4.11']])
  })

  it('falls back to the legacy fields when components is empty', () => {
    const { container } = render(EngineDetails, { props: { engine: { appVersion: '0.1.0', components: [] } } })
    expect(readings(container)).toEqual([['App', '0.1.0'], ['WFL', '—']])
  })

  it('renders an em-dash for a component with neither version nor status, never a guess', () => {
    const { container } = render(EngineDetails, { props: { engine: { components: [{ name: 'khaosd' }] } } })
    expect(readings(container)).toEqual([['khaosd', '—']])
  })

  it('infers Ready from a known daemon version when no state is given', () => {
    // Learning a daemon version requires a successful handshake.
    render(EngineDetails, { props: { engine: { daemonVersion: '0.4.11' } } })
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })

  it('says Offline when there is no daemon version and no state', () => {
    render(EngineDetails, { props: { engine: { appVersion: '0.1.0' } } })
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })

  it('lets an explicit state override the inference', () => {
    render(EngineDetails, { props: { engine: { daemonVersion: '0.4.11', state: 'starting' } } })
    expect(screen.getByText('Starting')).toBeInTheDocument()
    expect(screen.queryByText('Ready')).toBeNull()
  })
})

// #149: the plate wrapped the moment a host supplied `update`: two rows with a badge broke
// mid-phrase ("Up to / date"), the two without one did not.
describe('#149: the reading and its verdict stay on one line', () => {
  const withUpdate = {
    engine: {
      components: [
        { name: 'KHAOS-TOOLS', version: '0.24.0', update: { label: 'Up to date', tone: 'success' } },
        { name: 'FOUNDATION', version: '0.5.21' },
      ],
    },
  }

  it('gives the reading its own element, the verdict beside it rather than inside it', () => {
    const { container } = render(EngineDetails, { props: withUpdate })
    const reading = screen.getByText('0.24.0')
    expect(reading).toHaveClass('details__reading')
    const update = container.querySelector('.details__update')
    expect(update.parentElement).toBe(reading.parentElement)
  })

  it('still renders a row with no verdict, which is what isolated the cause', () => {
    const { container } = render(EngineDetails, { props: withUpdate })
    const rows = [...section(container, 'Engine').querySelectorAll('.prop')]
    expect(rows.find((r) => !r.querySelector('.details__update')).querySelector('.details__reading').textContent.trim()).toBe('0.5.21')
  })

  it('the verdict cannot wrap or shrink', () => {
    const block = source.match(/\.details__update \{([^}]*)\}/)[1]
    expect(block).toMatch(/white-space:\s*nowrap/)
    expect(block).toMatch(/flex:\s*none/)
  })

  // The founding defect, pinned as a class rather than one site: `text-overflow: ellipsis`
  // without `white-space: nowrap` does nothing, so the content wraps instead of truncating.
  it('no ellipsis is declared without a nowrap to make it work', () => {
    const broken = source.split('}').filter((b) => /text-overflow:\s*ellipsis/.test(b) && !/white-space:\s*nowrap/.test(b))
    expect(broken).toEqual([])
  })
})

describe('the on-device engines section', () => {
  const SERVICES = [
    { name: 'mlx-audio', state: 'stopped' },
    { name: 'kittentts', state: 'stopped' },
    { name: 'magenta-rt', state: 'stopped' },
  ]

  it('reads Idle when every engine is provisioned but stopped', () => {
    // The ordinary state of a fresh machine. It must not read as "no engines installed".
    render(EngineDetails, { props: { services: SERVICES } })
    expect(screen.getByText('Idle')).toBeInTheDocument()
    expect(screen.queryByText('No on-device engines')).toBeNull()
  })

  it('shows the label when the caller has one, and the identifier when it does not', () => {
    // khaosd's /api/services returns no display name; showing the id is the honest half.
    render(EngineDetails, { props: { services: [{ name: 'mlx-audio', label: 'MLX Audio', state: 'stopped' }, { name: 'kittentts', state: 'stopped' }] } })
    expect(screen.getByText('MLX Audio')).toBeInTheDocument()
    expect(screen.getByText('kittentts')).toBeInTheDocument()
  })

  it('shows no pill at all when there are no engines', () => {
    // "Idle" over an empty list would claim engines exist and are resting.
    render(EngineDetails, { props: { services: [] } })
    expect(screen.getByText('No on-device engines')).toBeInTheDocument()
    expect(screen.queryByText('Idle')).toBeNull()
  })

  // #43 gap 2: the count reads a structured field, never a rendered word.
  it('does not count a process that is up and not usable', () => {
    // The daemon reports 'running' with health_ok false, so ready_to_use is false.
    render(EngineDetails, { props: { services: [{ name: 'mlx-audio', state: 'running', ready_to_use: false }] } })
    expect(screen.getByText('mlx-audio')).toBeInTheDocument()
    expect(screen.getByText('Idle')).toBeInTheDocument()
    expect(screen.queryByText('1 running')).toBeNull()
  })

  it('counts an engine the daemon vouched for whatever the state string says', () => {
    // `stopping` still serves while it winds down; `stopped` with ready_to_use is vouched for.
    render(EngineDetails, { props: { services: [{ name: 'mlx-audio', state: 'stopping', ready_to_use: true }, { name: 'kittentts', state: 'stopped', ready_to_use: true }] } })
    expect(screen.getByText('2 running')).toBeInTheDocument()
  })

  it('falls back to the state when the caller does not decode ready_to_use', () => {
    // The fallback understates rather than over-claims.
    render(EngineDetails, { props: { services: [{ name: 'mlx-audio', state: 'running' }, { name: 'kittentts', state: 'stopped' }] } })
    expect(screen.getByText('1 running')).toBeInTheDocument()
  })

  it('falls back rather than trusting a value that is not a boolean', () => {
    // null must fall back, not read as unusable; the STRING 'false' must not count as usable.
    render(EngineDetails, {
      props: { services: [
        { name: 'mlx-audio', state: 'running', ready_to_use: null },
        { name: 'kittentts', state: 'stopped', ready_to_use: 'false' },
        { name: 'orpheus', state: 'stopped', ready_to_use: undefined },
      ] },
    })
    expect(screen.getByText('mlx-audio')).toBeInTheDocument()
    expect(screen.getByText('1 running')).toBeInTheDocument()
  })

  // #43 gap 1: provisioned: false is not stopped; starting it is not one click away.
  it('replaces the state word with "not installed" and keeps the state in the dot', () => {
    const { container } = render(EngineDetails, { props: { services: [{ name: 'whisper', label: 'Whisper', state: 'error', provisioned: false }] } })
    expect(screen.getByText('not installed')).toBeInTheDocument()
    expect(screen.queryByText('error')).toBeNull()
    expect(container.querySelector('.details__dot').dataset.state).toBe('error')
  })

  it('stays quiet about setup for an engine that is merely stopped, or whose provisioning is unknown', () => {
    // Absent must read as unknown, never as "not installed".
    render(EngineDetails, { props: { services: [{ name: 'kittentts', state: 'stopped', provisioned: true }, SERVICES[0]] } })
    expect(screen.getByText('kittentts')).toBeInTheDocument()
    expect(screen.getByText('mlx-audio')).toBeInTheDocument()
    expect(screen.queryByText('not installed')).toBeNull()
  })

  it('keeps the three-row budget when every engine needs setup', () => {
    // A summary, not a container: adding a fact must not add rows.
    const many = ['a', 'b', 'c', 'd', 'e'].map((n) => ({ name: n, state: 'stopped', provisioned: false }))
    const { container } = render(EngineDetails, { props: { services: many } })
    expect(section(container, 'On-device engines').querySelectorAll('.prop')).toHaveLength(3)
    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })
})

// #150: what a capability is ROUTED TO. Routed capabilities only (operator ruling); the ones
// reading "no model pinned" stay in Settings.
describe('#150: the routing section', () => {
  const routes = [
    { capability: 'analysis.text', label: 'Analysis', provider: 'openrouter', model: 'deepseek/deepseek-v4.1-flash' },
    { capability: 'decision.presence', label: 'Decisioning', provider: 'openrouter', model: 'typesafe/jev-1.13' },
  ]
  const routing = (container) => section(container, 'Routing')

  it('renders nothing at all when no route is reported', () => {
    const { container } = render(EngineDetails, { props: { engine: { components: [] } } })
    expect(routing(container)).toBeUndefined()
  })

  it('renders the engine-supplied label verbatim, never the capability id', () => {
    const { container } = render(EngineDetails, { props: { routes } })
    expect([...routing(container).querySelectorAll('.prop__label')].map((l) => l.textContent.trim())).toEqual(['Analysis', 'Decisioning'])
    expect(routing(container).textContent).not.toContain('analysis.text')
    expect(routing(container).textContent).not.toContain('decision.presence')
  })

  // D83: the provider is a MARK beside the model, its name in the row's title.
  it('renders the provider as a mark beside the model, with its name in the row title', () => {
    const { container } = render(EngineDetails, { props: { routes } })
    const row = routing(container).querySelector('.details__route')
    expect(row.getAttribute('title')).toBe('openrouter · deepseek/deepseek-v4.1-flash')
    const svg = row.querySelector('svg.pmark')
    expect(svg.getAttribute('fill')).toBe('currentColor')
    expect(svg.querySelector('path').getAttribute('d')).toMatch(/^M/)
    expect(row.querySelector('.details__route-name').textContent.trim()).toBe('deepseek-v4.1-flash')
  })

  it("truncates the model's own name on one line rather than wrapping it mid-name", () => {
    const rule = source.match(/\.details__route-name \{([^}]*)\}/)[1]
    expect(rule).toMatch(/text-overflow:\s*ellipsis/)
    expect(rule).toMatch(/white-space:\s*nowrap/)
  })

  it('sizes the mark to the text, so the inline SVG never fills the rail', () => {
    const mark = markSource.match(/\.pmark \{([^}]*)\}/)[1]
    expect(mark).toMatch(/width:\s*1em/)
    expect(mark).toMatch(/height:\s*1em/)
  })

  it('falls back to a placeholder glyph for a provider the kit ships no mark for', () => {
    const { container } = render(EngineDetails, { props: { routes: [{ ...routes[0], provider: 'groq' }] } })
    const row = routing(container).querySelector('.details__route')
    expect(row.querySelector('.pmark')).toBeNull()
    expect(row.querySelector('[class*="ph-"]').className).toContain('ph-plugs-connected')
    expect(row.getAttribute('title')).toContain('groq')
  })

  it('uses the host glyph for an unshipped provider when one is supplied', () => {
    const { container } = render(EngineDetails, { props: { routes: [{ ...routes[0], provider: 'groq', icon: 'cloud' }] } })
    expect(routing(container).querySelector('.details__route [class*="ph-"]').className).toContain('ph-cloud')
  })

  // A mark the kit SHIPS beats a Phosphor name the host passes: `icon` is a fallback.
  it('a shipped mark wins over a host-supplied glyph name, matched case-insensitively', () => {
    const { container } = render(EngineDetails, { props: { routes: [{ ...routes[0], provider: 'OpenRouter', icon: 'cloud' }] } })
    expect(routing(container).querySelector('.pmark')).not.toBeNull()
    expect(routing(container).querySelector('[class*="ph-cloud"]')).toBeNull()
  })

  it('identifies a route the engine marks local with the desktop glyph, and no other (D84)', () => {
    const { container } = render(EngineDetails, { props: { routes: [{ ...routes[0], provider: 'khaos-synth', model: 'Qwen3-TTS-12Hz-1.7B-8bit', local: true }] } })
    expect(routing(container).querySelector('.details__route [class*="ph-"]').className).toContain('ph-desktop')
  })
})

// The rail's identity actions stay when the host cannot handle them: dimmed, never hidden, and
// saying why. khaos-app once shipped dead Import and Clone buttons for weeks because a rail
// button with no handler looked like a working one.
describe('rail actions without handlers', () => {
  const rail = () => screen.getByRole('navigation', { name: 'Project actions' })

  it('keeps Import, Open and Clone, dimmed, and explains each on hover', () => {
    render(WelcomeWindow, { props: {} })
    const buttons = [...rail().querySelectorAll('button')]
    expect(buttons.map((b) => b.textContent.trim())).toEqual(['Import Screenplay', 'Open… ⌘O', 'Clone Repository'])
    for (const b of buttons) {
      expect(b).toHaveAttribute('aria-disabled', 'true')
      expect(b).toHaveAttribute('title', 'Not available in this app')
    }
  })

  it('leaves no title on an action the host handles', () => {
    render(WelcomeWindow, { props: { onImport: () => {} } })
    expect(rail().querySelector('button')).not.toHaveAttribute('title')
  })

  it('omits Refresh entirely when it cannot refresh, and renders it when it can', () => {
    // Refresh is not part of the rail's identity, so it hides rather than dims.
    const { unmount } = render(WelcomeWindow, { props: {} })
    expect(screen.queryByRole('button', { name: 'Refresh' })).toBeNull()
    unmount()
    render(WelcomeWindow, { props: { onRefresh: () => {} } })
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
  })
})

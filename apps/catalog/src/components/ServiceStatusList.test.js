import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ServiceStatusList from '@khaos-machine/khaotik-ui/components/svelte/ServiceStatusList.svelte'
import services from '../data/services.json'

// #25 — the on-device engines, from a live `GET /api/services`.
//
// The point of the component is that it needs NO label table. khaosd 0.6.2 added
// `name` and `description` (khaos-manager#147) precisely so the product name for
// an engine the daemon owns stops living in each client and drifting.

describe('ServiceStatusList renders what the daemon says', () => {
  it('shows the daemon-supplied name, not the id', () => {
    render(ServiceStatusList, { props: { services } })
    // Real payload: mlx-audio → "MLX Audio", kittentts → "KittenTTS".
    expect(screen.getByText('MLX Audio')).toBeInTheDocument()
    expect(screen.queryByText('mlx-audio')).toBeNull()
  })

  it('shows the description the daemon supplies', () => {
    render(ServiceStatusList, { props: { services } })
    expect(screen.getByText('Kokoro and MLX voices, on-device')).toBeInTheDocument()
  })

  it('falls back to the id only if a name is genuinely absent', () => {
    // The daemon guarantees `name` is populated, so this should never fire in
    // practice — but rendering an empty string would be worse than the id.
    render(ServiceStatusList, { props: { services: [{ id: 'mystery-engine', state: 'stopped' }] } })
    expect(screen.getByText('mystery-engine')).toBeInTheDocument()
  })

  it('shows the port, which is what an operator curls', () => {
    render(ServiceStatusList, { props: { services } })
    expect(screen.getByText(':8100')).toBeInTheDocument()
  })

  it('says so when there is nothing registered', () => {
    render(ServiceStatusList, { props: { services: [] } })
    expect(screen.getByText(/No on-device engines registered/)).toBeInTheDocument()
  })
})

describe('ServiceStatusList does not over-claim a state', () => {
  it('reports starting as info, not as running', () => {
    // "starting" has not started. Reporting it as success is the same class of
    // over-claim as a git chip saying "synced" from fields it never received.
    const { container } = render(ServiceStatusList, {
      props: { services: [{ id: 'a', name: 'A', state: 'starting' }] },
    })
    expect(container.querySelector('.services__dot').dataset.tone).toBe('info')
  })

  it.each([
    ['running', 'success'],
    ['stopped', 'neutral'],
    ['error', 'danger'],
  ])('maps %s to %s', (state, tone) => {
    const { container } = render(ServiceStatusList, { props: { services: [{ id: 'a', name: 'A', state }] } })
    expect(container.querySelector('.services__dot').dataset.tone).toBe(tone)
  })

  it('distinguishes not-installed from stopped', () => {
    // `provisioned: false` is not the same as stopped — starting it is not one
    // click away — so it is said rather than collapsed into the state.
    render(ServiceStatusList, {
      props: { services: [{ id: 'a', name: 'A', state: 'stopped', provisioned: false }] },
    })
    expect(screen.getByText('not installed')).toBeInTheDocument()
  })
})

describe('ServiceStatusList shows the capability it cannot use', () => {
  it('renders start disabled when no handler is given', () => {
    // khaos-app's ADR-0007 does not permit it to start services yet. Disabled
    // rather than hidden: absent reads as "the product cannot do this", disabled
    // reads as "not for you right now", and only the second is true.
    render(ServiceStatusList, { props: { services } })
    for (const button of screen.getAllByRole('button', { name: 'Start' })) {
      expect(button).toBeDisabled()
    }
  })

  it('enables start once a handler exists, and reports the service', async () => {
    const onStart = vi.fn()
    render(ServiceStatusList, { props: { services: [{ id: 'mlx-audio', name: 'MLX Audio', state: 'stopped' }], onStart } })

    const button = screen.getByRole('button', { name: 'Start' })
    expect(button).not.toBeDisabled()
    await fireEvent.click(button)
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ id: 'mlx-audio' }))
  })

  it('offers stop instead of start for a running service', async () => {
    const onStop = vi.fn()
    render(ServiceStatusList, { props: { services: [{ id: 'a', name: 'A', state: 'running' }], onStop } })

    expect(screen.queryByRole('button', { name: 'Start' })).toBeNull()
    await fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(onStop).toHaveBeenCalledOnce()
  })

  it('keeps start disabled for an unprovisioned service even with a handler', () => {
    // Starting something that is not installed cannot succeed, so offering it
    // would be an invitation to a guaranteed failure.
    render(ServiceStatusList, {
      props: { services: [{ id: 'a', name: 'A', state: 'stopped', provisioned: false }], onStart: () => {} },
    })
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled()
  })
})

// #49: the component rendered the two most common unusable states and offered
// nothing for either. `needsSetup` disabled Start and relabelled the pill, with
// no route to the action that fixes it — the dead end #15 already ruled out for
// delete. And every action is SYNCHRONOUS: the daemon holds the connection for
// 90s on start and five minutes on setup, emitting nothing in between, so an
// untouched row looked inert and invited a second click that was a real
// concurrent request.
describe('ServiceStatusList setup and in-flight actions (#49)', () => {
  const unprovisioned = [{ id: 'whisper', name: 'Whisper', state: 'stopped', provisioned: false }]
  const stopped = [{ id: 'kittentts', name: 'KittenTTS', state: 'stopped', provisioned: true }]
  const running = [{ id: 'kittentts', name: 'KittenTTS', state: 'running', provisioned: true }]

  it('offers Setup when the engine is not installed', () => {
    render(ServiceStatusList, { props: { services: unprovisioned, onSetup: () => {} } })
    expect(screen.getByRole('button', { name: 'Setup' })).toBeEnabled()
  })

  it('keeps Start visible and disabled behind Setup, so the sequence is legible', () => {
    // Not hidden: install-then-run is the order, and a vanishing Start would
    // make the row look like it can never run at all.
    render(ServiceStatusList, { props: { services: unprovisioned, onSetup: () => {}, onStart: () => {} } })
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled()
  })

  it('renders Setup disabled rather than absent when the consumer cannot call it', () => {
    // Same contract as onStart/onStop: absent reads as "the product cannot do
    // this", disabled reads as "not for you right now", and only the second is true.
    render(ServiceStatusList, { props: { services: unprovisioned } })
    expect(screen.getByRole('button', { name: 'Setup' })).toBeDisabled()
  })

  it('reports intent — onSetup fires on click and the component runs nothing itself', () => {
    let got = null
    render(ServiceStatusList, { props: { services: unprovisioned, onSetup: (s) => { got = s } } })
    screen.getByRole('button', { name: 'Setup' }).click()
    expect(got?.id).toBe('whisper')
    expect(got?.needsSetup).toBe(true)
  })

  it('names the verb in flight and disables the row it belongs to', () => {
    render(ServiceStatusList, { props: { services: stopped, pendingId: 'kittentts', onStart: () => {} } })
    expect(screen.getByRole('button', { name: 'Starting…' })).toBeDisabled()
  })

  it('names Stopping and Setting up for the other two verbs', () => {
    const a = render(ServiceStatusList, { props: { services: running, pendingId: 'kittentts', onStop: () => {} } })
    expect(a.getByRole('button', { name: 'Stopping…' })).toBeDisabled()
    a.unmount()
    const b = render(ServiceStatusList, { props: { services: unprovisioned, pendingId: 'whisper', onSetup: () => {} } })
    expect(b.getByRole('button', { name: 'Setting up…' })).toBeDisabled()
  })

  it('marks only the pending row busy, leaving its neighbours operable', () => {
    render(ServiceStatusList, {
      props: {
        services: [...stopped, { id: 'magenta-rt', name: 'Magenta', state: 'stopped', provisioned: true }],
        pendingId: 'kittentts',
        onStart: () => {},
      },
    })
    const busy = document.querySelectorAll('[aria-busy="true"]')
    expect(busy.length).toBe(1)
    expect(screen.getAllByRole('button', { name: 'Start' })[0]).toBeEnabled()
  })

  it('never infers pending from having been clicked — the pill is untouched', () => {
    // `starting` and `stopping` are the ENGINE's states, observable whenever
    // anything else drives the daemon. Rendering one because a request was sent
    // would assert something the component never observed.
    render(ServiceStatusList, { props: { services: stopped, pendingId: 'kittentts', onStart: () => {} } })
    expect(screen.getByText('stopped')).toBeInTheDocument()
    expect(screen.queryByText('starting')).toBeNull()
  })
})

// #43 gap 3: the row said `error` and stopped there. khaosd sends the engine's
// own failure sentence and the path it expects that engine's log at, both only
// inside `if info.State == StateError` (lifecycle.go:273-283) and both
// `omitempty`, so a field-keyed guard cannot fire on a healthy row.
//
// `log_path` is CONSTRUCTED, not probed — lifecycle.go:280 joins it with no
// stat, and on the Apple-silicon precheck path the service enters StateError
// before anything launches, so the file need not exist. It is labelled as the
// conventional location, never as "the crash output".
describe('ServiceStatusList reports why an engine failed (#43 gap 3)', () => {
  const LOG = '/Users/k/.khaos/logs/orpheus.log'
  const REASON = 'orpheus did not become healthy on port 8500 within 1m30s — the process likely crashed on launch'

  const errored = (extra) => [{ id: 'orpheus', name: 'Orpheus TTS', state: 'error', ...extra }]

  it('renders the reason khaosd sends with an errored service', () => {
    render(ServiceStatusList, { props: { services: errored({ reason: REASON }) } })
    expect(screen.getByText(REASON)).toBeInTheDocument()
    expect(screen.getByText('Reason:')).toBeInTheDocument()
  })

  it('renders the log path, labelled as the conventional location', () => {
    // The label may not claim the file exists.
    render(ServiceStatusList, { props: { services: errored({ reason: REASON, log_path: LOG }) } })
    expect(screen.getByText(LOG)).toBeInTheDocument()
    expect(screen.getByText('Log (expected at):')).toBeInTheDocument()
  })

  it('renders the log line alone when there is no reason', () => {
    // `info.Reason` is set only when the service-map lookup succeeds
    // (lifecycle.go:275-277) while `info.LogPath` is unconditional at :280, so
    // a log path with no reason is reachable — and a bare `Reason` label with
    // nothing after it is not an option. Each line is guarded on its own.
    const { container } = render(ServiceStatusList, { props: { services: errored({ log_path: LOG }) } })
    expect(screen.getByText(LOG)).toBeInTheDocument()
    expect(container.querySelector('.services__reason')).toBeNull()
  })

  it('omits the log line when the reason already ends in that path', () => {
    // lifecycle.go:152's format string ends in `; see %s` — the log path. On
    // the commonest error path the daemon's own sentence already carries it,
    // and two renderings of one path invite the reader to wonder whether they
    // are two different paths.
    const { container } = render(ServiceStatusList, {
      props: { services: errored({ reason: `${REASON}; see ${LOG}`, log_path: LOG }) },
    })
    expect(container.querySelector('.services__log')).toBeNull()
    expect(screen.getByText(`${REASON}; see ${LOG}`)).toBeInTheDocument()
  })

  it('renders neither line for a service that is not in error', () => {
    const { container } = render(ServiceStatusList, {
      props: { services: [{ id: 'a', name: 'A', state: 'running' }] },
    })
    expect(container.querySelector('.services__detail')).toBeNull()
  })

  it('wraps the detail rather than truncating it', () => {
    // SOURCE READ, not a rendered assertion: jsdom resolves no stylesheets, so
    // `toHaveStyle` on a class-based rule passes whatever the CSS says. The
    // declarations are load-bearing — the row's `minmax(0, 1fr)` guard
    // constrains column 2 only and does not cover a `grid-column: 1 / -1`
    // child, so an unbreakable 60-character path blows out the grid track.
    // Comments are stripped first: this component explains its wrapping in
    // prose that names the very properties under test.
    const css = readFileSync(
      join(import.meta.dirname, '../../../..', 'components/svelte/ServiceStatusList.svelte'),
      'utf8',
    )
    const m = css.match(/\.services__detail\s*\{([^}]*)\}/)
    const body = (m ? m[1] : '').replace(/\/\*[\s\S]*?\*\//g, '')

    expect(body).toMatch(/overflow-wrap:\s*anywhere/)
    expect(body).toMatch(/white-space:\s*pre-wrap/)
    expect(body).not.toMatch(/text-overflow/)
    expect(body).not.toMatch(/-webkit-line-clamp/)
  })
})

// BA-R11a: a per-engine "Start with Khaos" switch. khaosd serves `start_with_khaos` on each
// /api/services row (BA-R9); the host writes the opt-in. Disabled, not absent, without a handler.
describe('ServiceStatusList "Start with Khaos" (BA-R11a)', () => {
  const rows = [
    { id: 'synth-speech', name: 'Speech', state: 'stopped', provisioned: true, start_with_khaos: true },
    { id: 'synth-image', name: 'Image', state: 'stopped', provisioned: true, start_with_khaos: false },
  ]
  const switches = () => screen.getAllByRole('checkbox', { name: /Start with Khaos/ })

  it('renders one switch per row, checked from start_with_khaos', () => {
    render(ServiceStatusList, { props: { services: rows, onStartWithKhaos: vi.fn() } })
    const [speech, image] = switches()
    expect(speech).toBeChecked()
    expect(image).not.toBeChecked()
    expect(speech).toBeEnabled()
  })

  it('reports the row and the new value when toggled', async () => {
    const onStartWithKhaos = vi.fn()
    render(ServiceStatusList, { props: { services: rows, onStartWithKhaos } })
    await fireEvent.click(switches()[1])
    expect(onStartWithKhaos).toHaveBeenCalledOnce()
    const [service, on] = onStartWithKhaos.mock.calls[0]
    expect(service.id).toBe('synth-image')
    expect(on).toBe(true)
  })

  it('renders disabled, not absent, without a handler', () => {
    render(ServiceStatusList, { props: { services: rows } })
    expect(switches()).toHaveLength(2)
    for (const s of switches()) expect(s).toBeDisabled()
  })

  it('is disabled on the row whose action is pending', () => {
    render(ServiceStatusList, { props: { services: rows, onStartWithKhaos: vi.fn(), pendingId: 'synth-speech' } })
    const [speech, image] = switches()
    expect(speech).toBeDisabled()
    expect(image).toBeEnabled()
  })
})

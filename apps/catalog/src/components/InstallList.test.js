import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/svelte'
import InstallList from '@khaos-machine/khaotik-ui/components/svelte/InstallList.svelte'

// The store row (D77). What is pinned here is who acts, what a row is allowed to
// claim, and that the right edge is never empty: a row that can be pressed shows a
// capsule, and one that cannot shows the same capsule disabled, or a finished state.

const item = (over = {}) => ({ id: 'jq', name: 'jq', state: 'available', ...over })
const slots = (container) => [...container.querySelectorAll('.store__row')].map((r) => r.dataset.slot)

describe('InstallList never leaves the right edge empty', () => {
  it('gives every row exactly one of: a finished state, a capsule, or words', () => {
    const { container } = render(InstallList, {
      props: {
        items: [
          item({ id: 'a', name: 'a', state: 'installed' }),
          item({ id: 'b', name: 'b' }),
          item({ id: 'c', name: 'c' }),
          item({ id: 'd', name: 'd', state: 'unknown' }),
        ],
        installable: ['b'],
        onInstall: () => {},
      },
    })
    expect(slots(container)).toEqual(['done', 'action', 'blocked', 'unknown'])
    for (const action of container.querySelectorAll('.store__action')) {
      expect(action.children.length).toBeGreaterThan(0)
    }
  })

  it('shows an installed row as a quiet finished state, not as a control', () => {
    render(InstallList, { props: { items: [item({ state: 'installed' })], installable: ['jq'], onInstall: () => {} } })
    expect(screen.getByText('Installed')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('shows a row the host cannot install as a DISABLED capsule with the host’s caption under it', () => {
    render(InstallList, {
      props: { items: [item({ caption: 'Install Homebrew first' })], onInstall: () => {} },
    })
    expect(screen.getByRole('button', { name: 'Install jq' })).toBeDisabled()
    expect(screen.getByText('Install Homebrew first')).toBeInTheDocument()
  })
})

describe('InstallList never over-claims', () => {
  it('says an unknown row was not checked, and offers nothing', () => {
    const { container } = render(InstallList, {
      props: { items: [item({ state: 'unknown' })], installable: ['jq'], onInstall: () => {} },
    })
    expect(screen.getByText('Not checked')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.querySelector('.store__done')).toBeNull()
  })

  it('reads a state it does not know as unknown rather than as installed', () => {
    const { container } = render(InstallList, { props: { items: [item({ state: 'probably-fine' })] } })
    expect(slots(container)).toEqual(['unknown'])
  })

  it('says nothing was reported rather than implying there is nothing to install', () => {
    render(InstallList, { props: { items: [] } })
    expect(screen.getByText('Nothing has been reported.')).toBeInTheDocument()
  })

  it('marks Required only on a required item that is missing', () => {
    render(InstallList, {
      props: {
        items: [
          item({ required: true }),
          item({ id: 'wget', name: 'wget' }),
          item({ id: 'git', name: 'git', required: true, state: 'installed' }),
        ],
      },
    })
    expect(screen.getAllByText('Required')).toHaveLength(1)
  })
})

describe('InstallList acts only through the host', () => {
  it('renders every capsule DISABLED when onInstall is omitted', () => {
    render(InstallList, { props: { items: [item()], installable: ['jq'] } })
    expect(screen.getByRole('button', { name: 'Install jq' })).toBeDisabled()
  })

  it('reports intent with the item, and executes nothing itself', async () => {
    const asked = []
    render(InstallList, { props: { items: [item()], installable: ['jq'], onInstall: (i) => asked.push(i.id) } })
    await fireEvent.click(screen.getByRole('button', { name: 'Install jq' }))
    expect(asked).toEqual(['jq'])
  })

  it('says Update over a present item, and Retry after a failure', () => {
    render(InstallList, {
      props: {
        items: [item({ state: 'update' }), item({ id: 'hf', name: 'hf', failure: 'Error: no bottle available' })],
        installable: ['jq', 'hf'],
        onInstall: () => {},
      },
    })
    expect(screen.getByRole('button', { name: 'Update jq' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry hf' })).toBeInTheDocument()
  })
})

describe('InstallList shows an install in flight only when the host says one is', () => {
  it('names the verb on the installing row and disables every capsule', () => {
    render(InstallList, {
      props: {
        items: [item({ installing: true }), item({ id: 'git', name: 'git' })],
        installable: ['jq', 'git'],
        onInstall: () => {},
      },
    })
    expect(screen.getByRole('button', { name: 'Installing jq' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Install git' })).toBeDisabled()
  })

  it('does not turn a click into an installing state on its own', async () => {
    render(InstallList, { props: { items: [item()], installable: ['jq'], onInstall: () => {} } })
    await fireEvent.click(screen.getByRole('button', { name: 'Install jq' }))
    expect(screen.getByRole('button', { name: 'Install jq' })).toBeEnabled()
  })
})

describe('InstallList draws the icon and the words it is given', () => {
  it('leads every row with a mark that is its state, and spends colour only on what needs you', () => {
    const { container } = render(InstallList, {
      props: {
        items: [
          { id: 'git', name: 'git', state: 'installed' },
          { id: 'py', name: 'Python', state: 'available', required: true },
          { id: 'jq', name: 'jq', state: 'available' },
          { id: 'brew', name: 'Homebrew', state: 'unknown' },
          { id: 'uv', name: 'uv', state: 'update' },
          { id: 'ff', name: 'ffmpeg', state: 'available', failure: 'brew exited 1' },
        ],
        installable: ['py', 'jq', 'uv', 'ff'],
        onInstall: () => {},
      },
    })
    const marks = [...container.querySelectorAll('.store__mark')].map((m) => m.dataset.mark)
    expect(marks).toEqual(['done', 'alarm', 'missing', 'unknown', 'update', 'alarm'])
    // No identity tiles: nothing in a row is coloured for being itself.
    expect(container.querySelector('.store__icon')).toBeNull()
  })

  it('renders the tagline the host chose, verbatim, and nothing when there is none', () => {
    const { container } = render(InstallList, {
      props: { items: [item({ id: 'ollama', name: 'Ollama', tagline: 'Local inference for analysis and chat' }), item()] },
    })
    expect(screen.getByText('Local inference for analysis and chat')).toBeInTheDocument()
    expect(container.querySelectorAll('.store__tagline')).toHaveLength(1)
  })

  it('shows a failure in full, in the engine’s words', () => {
    const failure = 'Error: jq: the bottle needs the Xcode Command Line Tools to be installed.\nInstall them and try again.'
    const { container } = render(InstallList, { props: { items: [item({ failure })] } })
    expect(container.querySelector('.store__failure').textContent).toBe(failure)
  })

  it('puts the host’s caption under the right edge of a finished row too', () => {
    const { container } = render(InstallList, { props: { items: [item({ state: 'installed', caption: '1.7.1' })] } })
    expect(container.querySelector('.store__caption').textContent).toBe('1.7.1')
  })
})

describe('InstallList action words', () => {
  it('says what pressing does: Install by default, the host’s word when it names one', async () => {
    const { render, screen } = await import('@testing-library/svelte')
    const { default: InstallList } = await import('@khaos-machine/khaotik-ui/components/svelte/InstallList.svelte')
    render(InstallList, {
      props: {
        items: [
          { id: 'jq', name: 'jq', state: 'available' },
          { id: 'flux', name: 'FLUX.2', state: 'available', verb: 'Download', busyVerb: 'Downloading' },
          { id: 'kokoro', name: 'Kokoro', state: 'available', verb: 'Download', busyVerb: 'Downloading', installing: true },
        ],
        installable: ['jq', 'flux', 'kokoro'],
        onInstall: () => {},
      },
    })
    expect(screen.getByRole('button', { name: 'Install jq' })).toHaveTextContent('Install')
    expect(screen.getByRole('button', { name: 'Download FLUX.2' })).toHaveTextContent('Download')
    expect(screen.getByRole('button', { name: 'Downloading Kokoro' })).toHaveTextContent('Downloading')
  })
})

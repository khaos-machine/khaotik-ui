import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import ResourceCatalog from '@khaos-machine/khaotik-ui/components/svelte/ResourceCatalog.svelte'
import catalog from '../data/catalog.json'

// `catalog.json` is a live capture of khaosd's GET /api/catalog/prompts with the links
// khaos-tools #1120 adds, so these assert against what the engine serves.
const artifacts = catalog.artifacts
const byId = (id, kind) => artifacts.find((a) => a.id === id && a.kind === kind)
const sectionLabels = (container) =>
  [...container.querySelectorAll('.catalog__kind')].map((p) => p.textContent.replace(/\d+\s*$/, '').trim())

describe('ResourceCatalog lists jobs, not files', () => {
  it('groups the current prompts by what they analyse, then other kinds, then what no job uses', () => {
    const { container } = render(ResourceCatalog, { props: { artifacts } })
    const labels = sectionLabels(container)
    expect(labels.slice(0, 2)).toEqual(['Scenes', 'Characters'])
    expect(labels).toContain('Report templates')
    expect(labels).not.toContain('System messages')
    expect(labels).not.toContain('Schemas')
  })

  it('lists each job once, by its current prompt, and never a retained version beside it', () => {
    render(ResourceCatalog, { props: { artifacts } })
    const index = within(screen.getByRole('navigation', { name: 'Catalog resources' }))
    expect(index.getAllByText('scene-stage1-claims')).toHaveLength(1)
    expect(index.queryByText('scene-stage1-claims-v8')).toBeNull()
  })

  it('says how many older versions a job keeps', () => {
    const retained = artifacts.filter((a) => a.kind === 'prompt' && a.retained && a.family === 'scene-stage1-claims')
    const { container } = render(ResourceCatalog, { props: { artifacts } })
    const row = [...container.querySelectorAll('.catalog__item')].find((r) => r.querySelector('.catalog__id')?.textContent === 'scene-stage1-claims')
    expect(row?.querySelector('.catalog__tag')?.textContent).toBe(`+${retained.length}`)
  })

  it('puts a system message or schema no current prompt uses under Not in use, never attached by name', () => {
    const unused = artifacts.filter(
      (a) => (a.kind === 'system_message' || a.kind === 'schema') &&
        !(a.usedBy ?? []).some((id) => artifacts.some((p) => p.kind === 'prompt' && !p.retained && p.id === id)),
    )
    const { container } = render(ResourceCatalog, { props: { artifacts } })
    const labels = sectionLabels(container)
    if (unused.length) expect(labels.at(-1)).toBe('Not in use')
    else expect(labels).not.toContain('Not in use')
  })

  it('appends a kind it does not know rather than dropping it', () => {
    const { container } = render(ResourceCatalog, {
      props: { artifacts: [...artifacts, { id: 'x', kind: 'mystery_kind' }] },
    })
    expect(sectionLabels(container)).toContain('mystery_kind')
  })
})

describe('a job’s detail', () => {
  const job = byId('scene-stage1-claims', 'prompt')

  it('shows the active prompt with the system message and schema it runs with, as the engine links them', () => {
    render(ResourceCatalog, { props: { artifacts, selectedId: job.id, selectedKind: 'prompt' } })
    expect(screen.getByRole('heading', { name: /scene-stage1-claims/ })).toHaveTextContent('Current version')
    const tabs = screen.getAllByRole('tab').map((t) => t.textContent.replace(/\s+/g, ' ').trim())
    expect(tabs).toEqual([
      `Prompt v${job.version}`,
      `System message v${byId(job.systemMessageId, 'system_message').version}`,
      expect.stringMatching(/^Schema /),
    ])
    expect(screen.getByRole('tab', { name: /Prompt/ })).toHaveAttribute('aria-selected', 'true')
  })

  it('reports the linked artifact when a tab is chosen, so the host can fetch its body', async () => {
    const onSelect = vi.fn()
    render(ResourceCatalog, { props: { artifacts, selectedId: job.id, selectedKind: 'prompt', onSelect } })
    await fireEvent.click(screen.getByRole('tab', { name: /System message/ }))
    expect(onSelect).toHaveBeenCalledWith(byId(job.systemMessageId, 'system_message'))
  })

  it('keeps the job in view when its system message is selected', () => {
    render(ResourceCatalog, { props: { artifacts, selectedId: job.systemMessageId, selectedKind: 'system_message' } })
    expect(screen.getByRole('heading', { name: /scene-stage1-claims/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /System message/ })).toHaveAttribute('aria-selected', 'true')
  })

  it('reads a retained version as Retained, with the note that says what replaced it', () => {
    const old = artifacts.find((a) => a.kind === 'prompt' && a.retained && a.family === job.id)
    if (!old) return
    const { container } = render(ResourceCatalog, { props: { artifacts, selectedId: old.id, selectedKind: 'prompt' } })
    expect(screen.getByRole('heading', { name: /scene-stage1-claims/ })).toHaveTextContent('Retired version')
    expect(container.querySelector('.catalog__note')?.textContent).toContain(old.notes)
  })

  it('selects by id and kind, since a prompt and a system message can share an id', () => {
    const shared = artifacts.find((a) => a.kind === 'system_message' && artifacts.some((p) => p.kind === 'prompt' && p.id === a.id))
    if (!shared) return
    const { container } = render(ResourceCatalog, { props: { artifacts, selectedId: shared.id, selectedKind: 'system_message' } })
    expect(container.querySelector('.catalog__meta')?.textContent).toContain(shared.source)
  })
})

describe('a prompt’s own version history', () => {
  const prompt = {
    id: 'scene-claims', kind: 'prompt', domain: 'scene', version: '9.0.0', family: 'scene-claims',
    versions: [
      { version: '9.0.0', released: '2026-10-10', deprecated: false },
      { version: '8.0.0', released: '2026-10-09', deprecated: true },
    ],
  }

  it('lists past versions under Older versions and asks the host for the one chosen', async () => {
    const onSelect = vi.fn()
    render(ResourceCatalog, { props: { artifacts: [prompt], selectedId: prompt.id, selectedKind: 'prompt', onSelect } })
    expect(screen.getByText('Older versions (1)')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: /v8\.0\.0/ }))
    expect(onSelect).toHaveBeenCalledWith(prompt, '8.0.0')
  })

  it('never shows the current version’s file or hash beside a past version’s text', () => {
    const current = { ...prompt, source: 'templates/v9.md', hash: 'sha256:current' }
    const { container, rerender } = render(ResourceCatalog, {
      props: { artifacts: [current], selectedId: current.id, selectedKind: 'prompt', selectedVersion: '8.0.0' },
    })
    expect(container.querySelector('.catalog__meta')?.textContent).not.toContain('templates/v9.md')
    expect(container.querySelector('.catalog__meta')?.textContent).not.toContain('sha256:current')
    rerender({ bodyMeta: { version: '8.0.0', source: 'templates/v8.md', hash: 'sha256:eight' } })
    expect(container.querySelector('.catalog__meta')?.textContent).toContain('templates/v8.md')
    expect(container.querySelector('.catalog__hash')?.textContent).toBe('sha256:eight')
  })

  it('reads a chosen past version as retired, with its own version number', () => {
    const { container } = render(ResourceCatalog, {
      props: { artifacts: [prompt], selectedId: prompt.id, selectedKind: 'prompt', selectedVersion: '8.0.0' },
    })
    expect(screen.getByRole('heading', { name: /scene-claims/ })).toHaveTextContent('Retired version')
    expect(container.querySelector('.catalog__meta')?.textContent).toContain('8.0.0')
  })
})

describe('what is in use, as the engine declares it', () => {
  const used = { id: 'scene-first', kind: 'prompt', domain: 'scene', version: '2.1.0', usedFor: ['Scene analysis · opening scene'], systemMessageId: 'sm', schemaId: 'sc' }
  const unusedPrompt = { id: 'scene-analysis-v2', kind: 'prompt', domain: 'scene', version: '2.0.0', systemMessageId: 'sm-old' }
  const all = [
    used, unusedPrompt,
    { id: 'sm', kind: 'system_message', usedBy: ['scene-first'] },
    { id: 'sm-old', kind: 'system_message', usedBy: ['scene-analysis-v2'] },
    { id: 'sc', kind: 'schema', usedBy: ['scene-first'] },
  ]

  it('lists a prompt no job runs under Not in use, with what only it uses', () => {
    const { container } = render(ResourceCatalog, { props: { artifacts: all } })
    const index = within(screen.getByRole('navigation', { name: 'Catalog resources' }))
    expect(index.getByText('scene-first')).toBeInTheDocument()
    const sections = [...container.querySelectorAll('.catalog__section')]
    const unused = sections.find((s) => s.textContent.includes('Not in use'))
    expect(unused?.textContent).toContain('scene-analysis-v2')
    expect(unused?.textContent).toContain('sm-old')
    expect(unused?.textContent).not.toContain('scene-first')
  })

  it('names the jobs that run a prompt, and says In use', () => {
    render(ResourceCatalog, { props: { artifacts: all, selectedId: 'scene-first', selectedKind: 'prompt' } })
    expect(screen.getByRole('heading', { name: /scene-first/ })).toHaveTextContent('In use')
    expect(screen.getByText('Used for: Scene analysis · opening scene')).toBeInTheDocument()
  })

  it('says plainly when no job runs a prompt', () => {
    render(ResourceCatalog, { props: { artifacts: all, selectedId: 'scene-analysis-v2', selectedKind: 'prompt' } })
    expect(screen.getByRole('heading', { name: /scene-analysis-v2/ })).toHaveTextContent('Not in use')
    expect(screen.getByText('No job in the engine runs this prompt.')).toBeInTheDocument()
  })

  it('claims nothing about use when the engine does not report it', () => {
    const silent = all.map(({ usedFor, ...rest }) => rest)
    render(ResourceCatalog, { props: { artifacts: silent, selectedId: 'scene-analysis-v2', selectedKind: 'prompt' } })
    expect(screen.getByRole('heading', { name: /scene-analysis-v2/ })).toHaveTextContent('Current version')
    expect(screen.queryByText(/Not in use|In use/)).toBeNull()
  })
})

describe('the parts the engine owns', () => {
  const first = artifacts.find((a) => a.kind === 'prompt' && !a.retained)

  it('renders the hash whole, because half a hash compares to nothing', () => {
    const { container } = render(ResourceCatalog, { props: { artifacts, selectedId: first.id, selectedKind: 'prompt' } })
    expect(container.querySelector('.catalog__hash')?.textContent).toBe(first.hash)
  })

  it('renders a body when the host supplies one', () => {
    render(ResourceCatalog, { props: { artifacts, selectedId: first.id, selectedKind: 'prompt', body: 'BODY TEXT' } })
    expect(screen.getByText('BODY TEXT')).toBeInTheDocument()
  })

  it('reads as listed-but-not-previewable rather than as an error', () => {
    render(ResourceCatalog, { props: { artifacts, selectedId: first.id, selectedKind: 'prompt', bodyUnavailable: 'engine said no' } })
    expect(screen.getByText(/Listed, not previewable/)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('says so when nothing is selected, and when the catalog is empty', () => {
    render(ResourceCatalog, { props: { artifacts } })
    expect(screen.getByText('Nothing selected')).toBeInTheDocument()
    const { container } = render(ResourceCatalog, { props: { artifacts: [] } })
    expect(container.textContent).toContain('No resources')
  })
})

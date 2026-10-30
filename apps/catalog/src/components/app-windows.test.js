import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import Activity from '@khaos-machine/khaotik-ui/components/svelte/Activity.svelte'
import ModelsPane from '@khaos-machine/khaotik-ui/components/svelte/ModelsPane.svelte'
import ProblemReport from '@khaos-machine/khaotik-ui/components/svelte/ProblemReport.svelte'
import ProjectHistory from '@khaos-machine/khaotik-ui/components/svelte/ProjectHistory.svelte'
import Resources from '@khaos-machine/khaotik-ui/components/svelte/Resources.svelte'
import Splash from '@khaos-machine/khaotik-ui/components/svelte/Splash.svelte'
import VoiceRow from '@khaos-machine/khaotik-ui/components/svelte/VoiceRow.svelte'
import windows from '../data/app-windows.json'
import catalog from '../data/catalog.json'

// Khaos App's windows (catalog app-coverage plan, T9). The host binds its models; these pin what
// each window draws and what it reports back.

describe('the splash', () => {
  it('marks each check in a boot log’s words', () => {
    render(Splash, { props: { appVersion: '0.86.0', checks: [{ name: 'khaosd runtime', state: 'failed', detail: 'not running' }] } })
    const checks = screen.getByRole('list', { name: 'Startup checks' })
    expect(within(checks).getByText('FAILED')).toBeTruthy()
    expect(within(checks).getByText('not running')).toBeTruthy()
  })
})

describe('a voice row', () => {
  it('is a button named by its voice, pressed when selected', async () => {
    const onclick = vi.fn()
    render(VoiceRow, { props: { name: 'Achernar', source: 'Gemini', language: 'en-US', selected: true, onclick } })
    const row = screen.getByRole('button', { name: 'Achernar' })
    expect(row.getAttribute('aria-pressed')).toBe('true')
    await fireEvent.click(row)
    expect(onclick).toHaveBeenCalledOnce()
  })
})

describe('the models pane', () => {
  it('groups the captured models by engine and reports a download asked for', async () => {
    const onDownload = vi.fn()
    const models = windows.models.map((m, i) => (i === 0 ? { ...m, installed: false, sizeBytes: 0 } : m))
    render(ModelsPane, { props: { inventory: { kind: 'served', models }, engineName: (s) => (s === 'synth-speech' ? 'Speech engine' : ''), onDownload } })
    expect(screen.getByRole('rowheader', { name: 'Speech engine' })).toBeTruthy()
    await fireEvent.click(screen.getByRole('button', { name: `Download ${models[0].name}` }))
    expect(onDownload).toHaveBeenCalledWith(models[0].id)
  })
})

describe('the resource library', () => {
  it('counts the captured registry by kind, prompts first', () => {
    render(Resources, { props: { state: { kind: 'loaded' }, artifacts: catalog.artifacts } })
    const prompts = catalog.artifacts.filter((a) => a.kind === 'prompt').length
    expect(screen.getByText(`prompt${prompts === 1 ? '' : 's'}`, { exact: false }).textContent).toContain(String(prompts))
  })
})

describe('the activity window', () => {
  it('says a project with no committed story has no activity', () => {
    render(Activity, { props: { state: { kind: 'missing' }, projectTitle: 'B4P' } })
    expect(screen.getByText('No committed story')).toBeTruthy()
  })

  it('says when the filter leaves nothing', () => {
    render(Activity, { props: { state: { kind: 'loaded' }, total: 2, rowCount: 2, days: [], query: 'merge' } })
    expect(screen.getByText('No changes match that filter.')).toBeTruthy()
  })
})

describe('the problem report', () => {
  it('offers only the two ways that deliver the zip', () => {
    render(ProblemReport, { props: { state: { kind: 'ready', text: 'report' } } })
    expect(screen.getAllByRole('button').map((b) => b.textContent.trim())).toEqual(['Email report…', 'Save a file…'])
  })

  it('waits while a share is in progress', () => {
    render(ProblemReport, { props: { state: { kind: 'ready', text: 'report' }, sharing: true } })
    for (const name of ['Email report…', 'Save a file…']) {
      expect(screen.getByRole('button', { name }).getAttribute('aria-disabled')).toBe('true')
    }
  })
})

describe('the project history', () => {
  const checkpoints = [
    { commit: 'c2', message: 'Later', at: '2026-10-21T18:40:00Z', restorable: true },
    { commit: 'c1', message: 'Imported', at: null, restorable: false },
  ]

  it('offers restoring only older checkpoints, and reports which', async () => {
    const onRestoreFiles = vi.fn()
    render(ProjectHistory, { props: { view: { kind: 'tracked', repository: { changedFiles: 2 }, checkpoints }, onRestoreFiles } })
    expect(screen.getByText('2 files changed since the last checkpoint')).toBeTruthy()
    expect(screen.getByText('Time not recorded')).toBeTruthy()
    const buttons = screen.getAllByRole('button', { name: 'Put files back…' })
    expect(buttons).toHaveLength(1)
    await fireEvent.click(buttons[0])
    expect(onRestoreFiles).toHaveBeenCalledWith(checkpoints[1])
  })

  it('names the project in a pending write’s confirmation', () => {
    render(ProjectHistory, { props: { view: { kind: 'tracked', repository: { changedFiles: 1 }, checkpoints }, projectTitle: 'B4P', pending: { kind: 'discard' } } })
    expect(screen.getByRole('alertdialog').textContent).toContain('B4P')
  })
})

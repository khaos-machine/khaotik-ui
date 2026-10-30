// Moved from Khaos App's src/app/model-table.test.ts, src/domain/resource.test.ts and
// src/app/provider-setup.test.ts (catalog app-coverage plan, T9), assertions unchanged.
import { describe, expect, it } from 'vitest'
import { installedSize, modelGroups, modelRow, storageFolder } from '@khaos-machine/khaotik-ui/components/svelte/lib/models.js'
import { artifactsByKind, resourceKindLabel, RESOURCE_KIND_ORDER } from '@khaos-machine/khaotik-ui/components/svelte/lib/resources.js'
import { providerConnectionLabel, providerConnectionTone } from '@khaos-machine/khaotik-ui/components/svelte/lib/providers.js'

const MODEL = (over) => ({
  id: 'qwen3-tts-base',
  name: 'Qwen3-TTS Base',
  kind: 'speech',
  service: 'synth-speech',
  enables: 'Cloned voices',
  repo: 'mlx-community/Qwen3-TTS-Base',
  revision: 'abc',
  installed: true,
  sizeBytes: 3_104_158_788,
  location: '/Users/k/.cache/huggingface/hub/models--mlx-community--Qwen3-TTS-Base/snapshots/abc',
  ...over,
})

describe('the Models table', () => {
  it('groups models by the engine that loads them, in khaosd’s order', () => {
    const groups = modelGroups(
      [MODEL({}), MODEL({ id: 'sfx', service: 'synth-sfx' }), MODEL({ id: 'kitten', service: 'synth-speech' })],
      (service) => ({ 'synth-speech': 'Synth Speech', 'synth-sfx': 'Synth Sound Effects' })[service] ?? '',
    )
    expect(groups.map((g) => [g.title, g.rows.map((r) => r.id)])).toEqual([
      ['Synth Speech', ['qwen3-tts-base', 'kitten']],
      ['Synth Sound Effects', ['sfx']],
    ])
  })

  it('names a size only for what is on disk, and carries a failed download’s own words', () => {
    expect(modelRow(MODEL({})).size).toBe('3.1 GB')
    expect(modelRow(MODEL({ installed: false, sizeBytes: 0 }))).toMatchObject({ size: '', state: 'available' })
    expect(modelRow(MODEL({ installed: false, download: 'downloading' })).state).toBe('downloading')
    expect(modelRow(MODEL({ installed: false, download: 'failed', downloadError: 'disk full' }))).toMatchObject({ state: 'failed', error: 'disk full' })
  })

  it('says where models are kept, with the home folder as ~, and how much they take', () => {
    const models = [MODEL({}), MODEL({ id: 'b', location: '/Users/k/.cache/huggingface/hub/models--x--y/snapshots/1', sizeBytes: 1_000_000_000 })]
    expect(storageFolder(models)).toBe('~/.cache/huggingface/hub')
    expect(storageFolder([MODEL({}), MODEL({ location: '/Volumes/X/models--a--b/snapshots/1' })])).toBe('')
    expect(installedSize(models)).toBe('4.1 GB')
  })
})

function artifact(id, kind) {
  return {
    id, kind, domain: '', version: '', description: '', hash: '', source: '', status: '',
    systemMessageId: '', schemaId: '', family: '', retained: false, notes: '', usedBy: [], usedFor: [], versions: [],
  }
}

describe('the kind ordering', () => {
  it('counts each kind in the display order', () => {
    const counts = artifactsByKind([
      artifact('scene-schema', 'schema'),
      artifact('character-analysis', 'prompt'),
      artifact('coverage-report', 'report_template'),
      artifact('scene-analysis', 'prompt'),
    ])
    expect(counts).toEqual([
      { kind: 'prompt', count: 2 },
      { kind: 'schema', count: 1 },
      { kind: 'report_template', count: 1 },
    ])
  })

  it('omits a kind the engine sent none of, rather than showing a zero', () => {
    expect(artifactsByKind([artifact('a', 'prompt')])).toEqual([{ kind: 'prompt', count: 1 }])
  })

  /**
   * The registry admits seven kinds and serves five. An eighth appearing upstream must
   * show up rather than be filtered out by a table nobody remembered to extend — which is
   * the same rule khaotik-ui's `ResourceCatalog` follows for its sections.
   */
  it('appends a kind this app has never heard of instead of dropping it', () => {
    const counts = artifactsByKind([artifact('a', 'prompt'), artifact('b', 'workflow_message')])
    expect(counts).toEqual([
      { kind: 'prompt', count: 1 },
      { kind: 'workflow_message', count: 1 },
    ])
  })

  it('leads with prompts, which are what the window is opened for', () => {
    expect(RESOURCE_KIND_ORDER[0]).toBe('prompt')
  })
})

describe('the kind heading', () => {
  it('reads an engine identifier as a heading', () => {
    expect(resourceKindLabel('prompt')).toBe('Prompt')
    expect(resourceKindLabel('system_message')).toBe('System message')
    expect(resourceKindLabel('report_template')).toBe('Report template')
  })

  it('names an unlabelled kind rather than rendering a blank heading', () => {
    expect(resourceKindLabel('')).toBe('Other')
  })
})

describe('a provider connection', () => {
  it('labels each declared state in the engine’s words', () => {
    expect(providerConnectionLabel('not-defined')).toBe(
      'No account defined — run khaos-tools providers install',
    )
    expect(providerConnectionLabel('refresh-failed')).toBe('Token refresh refused')
    expect(providerConnectionLabel('not-configured')).toBe('Not configured')
    expect(providerConnectionTone('not-defined')).toBe('warning')
    expect(providerConnectionTone('refresh-failed')).toBe('warning')
    expect(providerConnectionTone('not-configured')).toBe('neutral')
    expect(providerConnectionLabel('client-not-registered')).toBe('Sign-in not available')
    expect(providerConnectionTone('client-not-registered')).toBe('neutral')
  })
})

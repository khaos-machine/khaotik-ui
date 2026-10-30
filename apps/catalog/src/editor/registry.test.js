import { describe, it, expect } from 'vitest'
import {
  composedFixture, flowFixture, composedRegistry, composedMap, attachVariants, isVariant,
} from './registry.js'
import { createDocument, layoutNode, componentNode } from './document.js'
import { resolveFlowSteps, isFlowStep, SECTION_GROUPS } from '../fixtures.js'

const card = createDocument({ kind: 'component', slug: 'scene-card', name: 'Scene card' })
const screen = createDocument({ kind: 'screen', slug: 'scene-triage', name: 'Scene triage' })
const flow = { schema: 1, kind: 'flow', slug: 'first-run', name: 'First run', steps: ['launcher', 'scene-triage'] }

/** A candidate replacement for something already named. */
const variant = (slug, of) => ({ ...createDocument({ kind: 'component', slug, name: slug }), variantOf: of })

describe('a composed document, wearing the registry shape', () => {
  it('carries every field the shell reads off a fixture', () => {
    // This is what lets FixtureView, Canvas, DeviceFrame and SidebarNav render a
    // composed document with no edit at all.
    const entry = composedFixture(card)
    expect(entry).toMatchObject({ id: 'scene-card', name: 'Scene card', kind: 'component' })
    expect(entry.component).toBeTruthy()
    expect(entry.examples[0].props.document).toBe(card)
  })

  it('files a composed screen under Screens, beside the hand-authored ones', () => {
    // Whether a screen was typed in Svelte or composed in JSON is provenance,
    // not category — the same call the Svelte badge already makes.
    expect(composedFixture(screen)).toMatchObject({ section: 'screens', group: 'drafts' })
    expect(flowFixture(flow)).toMatchObject({ section: 'flows', group: 'flows' })
  })

  it('parks an unfiled component in drafts, and moves it once it has a group', () => {
    // A waiting room, not a shelf: comparing a card against the other cards is
    // what the catalog is for, so a filed draft goes and sits with them.
    expect(composedFixture(card)).toMatchObject({ section: 'components', group: 'drafts' })
    expect(composedFixture({ ...card, group: 'cards' })).toMatchObject({ section: 'components', group: 'cards' })
  })

  it('files into groups the taxonomy actually declares', () => {
    for (const entry of composedRegistry([card, screen])) {
      expect(SECTION_GROUPS[entry.section], entry.id).toContain(entry.group)
    }
    expect(SECTION_GROUPS.flows).toContain(flowFixture(flow).group)
  })

  it('gives a flow steps and no component, because a strip is not one mounted thing', () => {
    expect(flowFixture(flow).steps).toEqual(['launcher', 'scene-triage'])
    expect(flowFixture(flow).component).toBeUndefined()
  })

  it('threads every composed document into the others, so a nested slug resolves', () => {
    const inner = { ...card, root: layoutNode({ id: 'n0', children: [componentNode('@MetricCard', { id: 'n1' })] }) }
    const outer = { ...screen, root: layoutNode({ id: 'n0', children: [componentNode('@scene-card', { id: 'n1' })] }) }
    const entry = composedRegistry([inner, outer]).find((e) => e.id === 'scene-triage')
    expect(entry.examples[0].props.composed.get('scene-card')).toBe(inner)
  })

  it('keeps flows out of the composed lookup — a flow is not a component', () => {
    expect([...composedMap([card, screen, flow]).keys()].sort()).toEqual(['scene-card', 'scene-triage'])
  })
})

describe('variants', () => {
  it('does not list a variant beside the thing it is competing to become', () => {
    // Four candidate MetricCards are four variants OF MetricCard, not four
    // entries in the Cards group. Listing them flat buries the thing they are
    // competing to become underneath its own candidates.
    const entries = composedRegistry([card, variant('scene-card-dense', 'scene-card')])
    expect(entries.map((e) => e.id)).toEqual(['scene-card'])
    expect(isVariant(variant('x', 'y'))).toBe(true)
    expect(isVariant(card)).toBe(false)
  })

  it('hangs a variant off a composed parent, matched by its id', () => {
    const docs = [card, variant('scene-card-dense', 'scene-card')]
    const { registry, orphans } = attachVariants(composedRegistry(docs), docs)
    expect(orphans).toEqual([])
    expect(registry.find((e) => e.id === 'scene-card').variants.map((v) => v.id)).toEqual(['scene-card-dense'])
  })

  it('hangs a variant off a PUBLISHED parent, matched by its export name', () => {
    // The two halves of the namespace are addressed differently by convention —
    // an export is PascalCase and is its entry's name, an authored document is
    // kebab-case and is its entry's id — so one comparison covers both.
    const parent = { id: 'metric-card', name: 'MetricCard', section: 'components', group: 'cards', kind: 'component' }
    const docs = [variant('metric-card-dense', 'MetricCard')]
    const { registry } = attachVariants([parent, ...composedRegistry(docs)], docs)
    expect(registry.find((e) => e.id === 'metric-card').variants.map((v) => v.id)).toEqual(['metric-card-dense'])
  })

  it('holds several variants of one thing at once', () => {
    // The whole point: candidates coexist until there is reason to pick one.
    const docs = [card, variant('a', 'scene-card'), variant('b', 'scene-card'), variant('c', 'scene-card')]
    const { registry } = attachVariants(composedRegistry(docs), docs)
    expect(registry.find((e) => e.id === 'scene-card').variants).toHaveLength(3)
  })

  it('reports a variant whose parent is gone rather than dropping it', () => {
    // Work someone did would otherwise vanish from the app without a word.
    const docs = [variant('orphaned', 'renamed-away')]
    const { registry, orphans } = attachVariants(composedRegistry(docs), docs)
    expect(orphans.map((d) => d.slug)).toEqual(['orphaned'])
    expect(registry.some((e) => e.id === 'orphaned')).toBe(false)
  })

  it('leaves the registry alone when nothing is a variant', () => {
    const entries = composedRegistry([card])
    expect(attachVariants(entries, [card]).registry).toBe(entries)
  })
})

describe('what a flow may step through', () => {
  it('resolves a composed screen and a hand-authored one in one flow', () => {
    const registry = [
      { id: 'launcher', name: 'Launcher', section: 'screens', kind: 'screen' },
      ...composedRegistry([screen]),
    ]
    expect(resolveFlowSteps(flow, registry).steps.map((s) => s.id)).toEqual(['launcher', 'scene-triage'])
    expect(resolveFlowSteps(flow, registry).missing).toEqual([])
  })

  it('is one test now, because there is one kind of screen', () => {
    // The `|| kind === 'page'` this used to carry existed only because composed
    // screens filed somewhere else. It stays a SECTION test rather than becoming
    // `kind === 'screen'`: the six BrandKit specimens carry kind 'screen' with
    // section 'brandkit', and a flow through the colour palette is not a journey.
    expect(isFlowStep({ section: 'screens', kind: 'screen' })).toBe(true)
    expect(isFlowStep({ section: 'brandkit', kind: 'screen' })).toBe(false)
    expect(isFlowStep({ section: 'components', kind: 'component' })).toBe(false)
  })

  it('still reports a step that names nothing', () => {
    const broken = { ...flow, steps: ['launcher', 'ghost'] }
    expect(resolveFlowSteps(broken, composedRegistry([screen])).missing).toEqual(['launcher', 'ghost'])
  })
})

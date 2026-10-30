import { describe, it, expect } from 'vitest'
import { resolveComponent, isSlug, isLibrarySlug, bareSlug, slugsIn } from './resolve.js'
import { createDocument, componentNode, layoutNode } from './document.js'

const composed = new Map([['scene-card', createDocument({ slug: 'scene-card', name: 'Scene card' })]])

describe('the slug namespace', () => {
  it('resolves a PascalCase slug to a library descriptor and its implementation', () => {
    const found = resolveComponent('@MetricCard', composed)
    expect(found.kind).toBe('library')
    expect(found.descriptor.leaf).toBe(true)
    expect(found.descriptor.implementations).toEqual(['svelte'])
    expect(found.component).toBeTruthy()
  })

  it('resolves a kebab-case slug to a composed document', () => {
    const found = resolveComponent('@scene-card', composed)
    expect(found.kind).toBe('composed')
    expect(found.document.slug).toBe('scene-card')
  })

  it('reports a miss by name instead of rendering nothing', () => {
    // The `resolveFlowSteps` contract: a renamed component surfaces as a named
    // gap the author can act on, not as an empty box that reads as a layout bug.
    expect(resolveComponent('@typo', composed)).toEqual({ missing: '@typo' })
    expect(resolveComponent('@MetricCrad', composed)).toEqual({ missing: '@MetricCrad' })
    expect(resolveComponent('MetricCard', composed).missing).toBe('MetricCard')
    expect(resolveComponent(undefined, composed).missing).toBe('')
  })

  it('cannot let a composed document shadow a library export', () => {
    // The first character decides which half of the namespace a slug is on, so
    // the two conventions the repo already uses — PascalCase exports, kebab-case
    // ids — cannot collide, with no lookup and no precedence rule.
    const impostor = new Map([['MetricCard', createDocument({ slug: 'MetricCard' })]])
    expect(resolveComponent('@MetricCard', impostor).kind).toBe('library')
    expect(isLibrarySlug('@MetricCard')).toBe(true)
    expect(isLibrarySlug('@scene-card')).toBe(false)
  })

  it('knows a slug from a string', () => {
    expect(isSlug('@MetricCard')).toBe(true)
    expect(isSlug('MetricCard')).toBe(false)
    expect(isSlug('@')).toBe(false)
    expect(bareSlug('@MetricCard')).toBe('MetricCard')
  })

  it('collects every slug a tree references, deduplicated', () => {
    const root = layoutNode({ id: 'n0', children: [
      componentNode('@MetricCard', { id: 'n1' }),
      layoutNode({ id: 'n2', children: [componentNode('@MetricCard', { id: 'n3' }), componentNode('@StatusPill', { id: 'n4' })] }),
    ] })
    expect(slugsIn(root).sort()).toEqual(['@MetricCard', '@StatusPill'])
  })
})

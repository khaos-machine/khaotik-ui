import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import css from '@khaos-machine/khaotik-ui/tokens/tokens.css?raw'
import { SPACE_TOKENS, RADIUS_TOKENS, SPACE_VALUES, spaceVar, GRID_IS_UNDECLARED } from './tokens.js'

// SOURCE-READ, NOT RENDERED, AND IT HAS TO BE.
//
// jsdom resolves no stylesheets, so a rendered assertion that a layout node uses
// the space scale passes whether the token exists or not — `var(--spacing-lg)`
// against a stylesheet that never declared it renders as no gap at all, silently.
// CLAUDE.md names a rule the kit references but does not ship as one of two
// defect classes invisible to the build, and both have shipped green before.
//
// What is pinned: the editor's dimension vocabulary is exactly what tokens.css
// declares, and the renderer emits names rather than lengths.

const NODE_VIEW = readFileSync(join(import.meta.dirname, 'NodeView.svelte'), 'utf8')
// The layout rules live in the library's shipped sheet, not in either renderer —
// `Composed.svelte` and the editor both emit these classes, so one source.
const COMPOSE_CSS = readFileSync(
  join(import.meta.dirname, '../../../../components/svelte/lib/compose.css'), 'utf8',
)
const TOKENS_JS = readFileSync(join(import.meta.dirname, 'tokens.js'), 'utf8')
/** Code only. A comment may SHOW the scale as an example; only a literal in the
 *  code would be a second copy of it. */
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

describe('the editor inherits the BrandKit scale', () => {
  it('has tokens to check', () => {
    // Guards the guard: an empty scale would make every assertion below vacuous.
    expect(SPACE_TOKENS.length).toBeGreaterThan(4)
    expect(RADIUS_TOKENS.length).toBeGreaterThan(2)
  })

  it('offers only space tokens the generated stylesheet actually declares', () => {
    for (const token of SPACE_TOKENS) {
      expect(css, token).toContain(`--spacing-${token}:`)
    }
  })

  it('offers only radius tokens the generated stylesheet actually declares', () => {
    for (const token of RADIUS_TOKENS) {
      expect(css, token).toContain(`--radius-${token}:`)
    }
  })

  it('offers every space token the stylesheet declares — none dropped', () => {
    // Both directions. A token added to tokens.json that never reaches the
    // picker is a scale the editor silently cannot use.
    const declared = [...css.matchAll(/--spacing-([a-z0-9]+)\s*:/g)].map((m) => m[1])
    expect([...new Set(declared)].sort()).toEqual([...SPACE_TOKENS].sort())
  })

  it('does not restate the scale — it reads it back', () => {
    // `tokens/parse.js` exists because the token parser lived twice, the copies
    // drifted, and the drift shipped a crash. A literal ['2xs','xs',…] here
    // would be that same second copy, one surface further on.
    expect(TOKENS_JS).toContain("from '@khaos-machine/khaotik-ui/tokens/parse.js'")
    expect(stripComments(TOKENS_JS)).not.toMatch(/\[\s*'2xs'\s*,/)
  })

  it('turns a token name into a custom property, never into a length', () => {
    expect(spaceVar('lg')).toBe('var(--spacing-lg)')
    expect(spaceVar(null)).toBeNull()
    // The px are shown beside a name in the picker and never stored in a
    // document — which is what lets a later change to the scale reach every
    // document already written, with no migration.
    expect(SPACE_VALUES.lg).toMatch(/^\d+px$/)
  })

  it('emits no length of its own from the renderer', () => {
    // Every dimension in a composition comes from a token. A stray `16px` here
    // would be a value the BrandKit never agreed to and no target could
    // substitute.
    // Both places a dimension could come from: the shipped layout sheet, and the
    // editor's own chrome.
    const styles = stripComments(NODE_VIEW.slice(NODE_VIEW.indexOf('<style>')) + COMPOSE_CSS)
    const lengths = [...styles.matchAll(/:\s*\d+(?:px|rem|em)\b/g)].map((m) => m[0])
    expect(lengths).toEqual([])
  })

  it('wraps a row, so an overfull one cannot render its children on top of each other', () => {
    // FOUND IN A BROWSER, NOT IN A TEST, and it could only be found there: jsdom
    // lays nothing out, so a rendered assertion sees no overlap whether the rule
    // ships or not. At 390 a row of two components in a 155px grid cell shrank
    // its children past their own content and drew "S1 SceAnalysed" — one card's
    // text on top of the next, which reads as a rendering fault rather than as a
    // layout that ran out of room.
    const rowRule = COMPOSE_CSS.slice(COMPOSE_CSS.indexOf('.node--row'))
    expect(rowRule.slice(0, rowRule.indexOf('}'))).toContain('flex-wrap: wrap')
  })

  it('lets a grid track shrink below its content rather than widening the frame', () => {
    // `minmax(0, 1fr)` and not `1fr`: a child holding a long unbroken string
    // blows a plain `1fr` track past its share and pushes the row wider than the
    // device, which at 390 is the difference between a layout and a horizontal
    // scrollbar.
    expect(COMPOSE_CSS).toContain('minmax(0, 1fr)')
  })

  it('states the grid the BrandKit does not have, rather than inventing one', () => {
    // Layout.svelte: "The BrandKit declares no grid: there is no column, gutter
    // or container", and no baseline rhythm. An absent grid and a grid nobody
    // thought to show must not look identical, so the gap is carried as copy the
    // layout panel can render.
    expect(GRID_IS_UNDECLARED).toMatch(/column, gutter or container/)
    expect(css).not.toContain('--grid-columns')
    expect(css).not.toContain('--baseline')
  })
})

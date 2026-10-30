import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

// SOURCE-READ, NOT RENDERED, AND IT HAS TO BE.
//
// jsdom resolves no stylesheets and evaluates neither `@media` nor `@container`,
// so a rendered assertion that a workspace collapses at 390 passes whether the
// rule ships or not. CLAUDE.md names this as one of two defect classes invisible
// to the build, both of which have shipped green before. The viewport frame's
// whole value rests on these rules existing, so they are checked as text.
//
// What is being pinned: the catalog's frame establishes a NAMED container, every
// component that collapses on width answers BOTH the window and that container
// by name, and the two agree on every breakpoint. The pair is an interim —
// @container alone is the intended end state — and the risk of an interim is
// that half of it gets edited. That is what fails here.

const LIB = path.resolve(import.meta.dirname, '../../../../../components/svelte')
// The frame moved out of Canvas and into DeviceFrame, which draws it for the
// canvas and for a flow strip alike. The contract is unchanged — same element,
// same classes, same named container — so these assertions follow the rule to
// its new file rather than being rewritten.
const FRAME = path.resolve(import.meta.dirname, 'DeviceFrame.svelte')

// The name the frame declares and the components query. An UNNAMED @container
// binds to the nearest ancestor carrying a container-type, whatever it was
// established for — so a consuming app that containerises a pane for its own
// unrelated reasons would silently start collapsing the workspaces inside it,
// shipping straight from main with no tag and no signal. The name is what makes
// this change additive rather than a behaviour change for consumers.
const CONTAINER = 'viewport'

// Matches any @media/@container max-width rule regardless of what sits between
// the at-keyword and the condition — a container name, `screen and`, a media
// type. Matching the literal `'@media (max-width:'` meant a fifth component
// written `@media screen and (max-width: 720px)` was silently not discovered
// and every assertion below skipped it, while the non-empty guard stayed green
// on the strength of the other four.
//
// Rules are read from the component's <style> block with CSS comments removed,
// so prose explaining the pairing is never mistaken for a rule, and the body is
// found by matching braces rather than by layout. The first version required the
// closing brace on its own indented line, so every rule written on one line —
// `@media(max-width:620px){…}` — was never discovered, and five components that
// collapse on width answered the window but not the frame while this file stayed
// green.
const AT_RULE = /@(media|container)\b([^{]*?)\(max-width:\s*(\d+)px\)\s*\{/g

function styleOf(source) {
  const m = source.match(/<style[^>]*>([\s\S]*?)<\/style>/)
  return (m ? m[1] : '').replace(/\/\*[\s\S]*?\*\//g, '')
}

function rulesIn(source) {
  const css = styleOf(source)
  const out = []
  for (const m of css.matchAll(AT_RULE)) {
    let depth = 1
    let i = m.index + m[0].length
    const start = i
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++
      else if (css[i] === '}') depth--
      i++
    }
    out.push({ kind: m[1], prelude: m[2].trim(), width: m[3], body: css.slice(start, i - 1).replace(/\s+/g, ' ').trim() })
  }
  return out
}

// Every library component that collapses its columns on width, including the
// internal ones a public component renders. Discovered rather than listed, so
// one added later is covered by this test on the day it lands instead of the
// day someone remembers it.
function svelteFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? svelteFiles(path.join(dir, e.name)) : e.name.endsWith('.svelte') ? [path.join(dir, e.name)] : [],
  )
}

function responsiveComponents() {
  return svelteFiles(LIB)
    .map((f) => ({ name: path.relative(LIB, f), source: fs.readFileSync(f, 'utf8') }))
    .filter((c) => rulesIn(c.source).some((r) => r.kind === 'media'))
}

describe('the device frame is a container query context', () => {
  it('declares container-type on the sized frame', () => {
    const source = fs.readFileSync(FRAME, 'utf8')

    expect(source).toMatch(/\.frame--sized\s*\{[^}]*container-type:\s*inline-size/s)
  })

  it('names that container, so components bind to it and nothing else', () => {
    const source = fs.readFileSync(FRAME, 'utf8')

    expect(source).toMatch(
      new RegExp(`\\.frame--sized\\s*\\{[^}]*container-name:\\s*${CONTAINER}`, 's'),
    )
  })

  // Only the sized frame. Inline-size containment makes an element's width
  // independent of its contents, which is free when the width is explicit and
  // wrong for the unsized frame, whose width is exactly what its contents make it.
  it('does not declare it on the unsized frame', () => {
    const source = fs.readFileSync(FRAME, 'utf8')
    const unsized = source.match(/\n {2}\.frame\s*\{([^}]*)\}/s)

    expect(unsized).not.toBeNull()
    expect(unsized[1]).not.toContain('container-type')
  })
})

describe('responsive components answer the frame as well as the window', () => {
  it('finds the components this applies to', () => {
    // If this ever reads 0, the discovery above has broken and every assertion
    // below would vacuously pass.
    expect(responsiveComponents().length).toBeGreaterThan(0)
  })

  it('pairs every @media width rule with an @container rule', () => {
    for (const { name, source } of responsiveComponents()) {
      const rules = rulesIn(source)
      const media = rules.filter((r) => r.kind === 'media').map((r) => r.width)
      const container = rules.filter((r) => r.kind === 'container').map((r) => r.width)

      expect(container, `${name} has a @media width rule but no matching @container rule`).toEqual(
        media,
      )
    }
  })

  it('queries the frame by name rather than whatever container is nearest', () => {
    for (const { name, source } of responsiveComponents()) {
      for (const rule of rulesIn(source).filter((r) => r.kind === 'container')) {
        expect(rule.prelude, `${name} has an unnamed @container query`).toBe(CONTAINER)
      }
    }
  })

  // The interim's one real hazard: two copies of a number, and only one of them
  // edited. A frame that collapses at a different width than the window does is
  // worse than either alone, because it looks like it works.
  //
  // Compared per breakpoint, not as one flat set: a component that correctly
  // pairs TWO breakpoints (720 to one column, 480 to something else) has four
  // rules and two distinct bodies, and asserting a single body across the file
  // failed it for being right.
  it('applies the same declaration in both rules, breakpoint for breakpoint', () => {
    for (const { name, source } of responsiveComponents()) {
      const rules = rulesIn(source)
      const widths = [...new Set(rules.map((r) => r.width))]

      expect(widths.length, `${name} should have a width rule`).toBeGreaterThan(0)

      for (const width of widths) {
        const at = rules.filter((r) => r.width === width)
        const bodies = at.map((r) => r.body)

        expect(at.length, `${name} should have both rules at ${width}px`).toBeGreaterThanOrEqual(2)
        expect(
          new Set(bodies).size,
          `${name} rules at ${width}px diverged: ${bodies.join(' vs ')}`,
        ).toBe(1)
      }
    }
  })
})

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import allowFile from './data/contrast-allow.json'

// The #66 regression guard (D64).
//
// It answers one question: does any rule under components/svelte/ declare
// `--text-tertiary` that is not on the hand-authored allow list, and has any
// allow-listed rule quietly stopped declaring it?
//
//   allow     = { r | r.verdict in { KEPT, NON_TEXT, RESTORED } }  // 4 + 0 + 9 = 13
//   offenders = declaring \ allow                         // must be empty
//   missing   = allow \ declaring                         // must be empty
//
// CHANGED is deliberately NOT in the allow set. That is the whole point: it is
// what makes a regression re-adding --text-tertiary at Gallery's
// .gallery__caption red.
//
// The mutation target MOVED with #75. It was LabeledField's
// .labeled-field__label, which Andrew's ruling restored to --text-tertiary and
// which is now a RESTORED allow entry — so re-adding the token there is correct
// rather than a regression, and the mutation's own "did this land" assertion
// caught that rather than the suite going quietly green on a mutation that no
// longer mutated anything. It moved again when SceneList retired (K-final):
// .gallery__caption is a #66 substitution that stays substituted, so it is a genuine CHANGED rule.
//
// WHY THIS IS NOT A TAUTOLOGY. A reference scan compared against a set that can
// be mechanically regenerated from the thing being scanned cannot red — the
// first maintainer who saw it go red would regenerate the set and the gate would
// join the three vacuous ones this repo has already shipped. So the two sides
// come from genuinely independent instruments:
//
//   declaring  <- this file, a pure function over source text (below)
//   allow      <- data/contrast-allow.json, HAND-AUTHORED, NO GENERATOR
//
// There is no command anyone can run to make the allow list agree with the scan.
// Remove the generator and the guard can red. `contrast-audit.json` — the
// runtime measurements — is NEVER read here; it carries a `regenerateWith`
// field, so reading it would relocate the disarming path onto a file that
// advertises its own generator.
//
// SCOPE. components/svelte/ only. It must NOT reach tokens/tokens.css, where
// `--illustration-ink` (:282) legitimately takes --text-tertiary as a color-mix
// input — D64's Ruling A exemption. A guard that read the token sheet would red
// on a reference that must not be removed, and the fix someone reached for would
// be deleting a token or inventing a value.
//
// WHAT THIS GUARD DOES NOT CATCH (condition d — an admission, not a gap to fill):
//
//   1. A KEPT entry whose INHERITED computed size later drops below 24px. The
//      scan reads source text and cannot resolve inheritance; only the runtime
//      audit can. (No entry is exempted on size today — the largest computed
//      size in the whole population is 19.2px — so nothing currently rests on
//      this.)
//   2. A new element that inherits `color` from a KEPT rule WITHOUT naming the
//      token. It never appears in `declaring`, so no source-text scan can see
//      it. This is the SectionHeader:45 shape, and it is why C2 moved that rule
//      into CHANGED rather than documenting around it. No mutation case exists
//      for this class by ruling: a mutation case cannot exist for a defect the
//      instrument cannot see, and manufacturing one would only pretend to cover
//      it.
//   3. Non-text contrast. The two NON_TEXT entries are on the allow list because
//      a text bar is a category error on them (#76), not because they were
//      measured and passed.

const TOKEN = '--text-tertiary'
const LIB = join(import.meta.dirname, '../../..', 'components/svelte')
const REASONS = ['size>=24px', 'decorative', 'inactive-control', 'non-text', 'ladder-step']
const VERDICTS = ['KEPT', 'NON_TEXT', 'RESTORED']

// ---------------------------------------------------------------------------
// the predicate, as a pure function over source text
// ---------------------------------------------------------------------------

// Blank comments to SPACES, preserving both length and line count. Stripping
// them instead shifts every line number in any component whose <style> block
// carries prose — and these components carry a lot of it. Three earlier
// source-read passes over this same population gave three different answers,
// with no error message from any of them; two of the three were defeated here.
export function blankComments(src) {
  let out = ''
  let i = 0
  while (i < src.length) {
    if (src[i] === '/' && src[i + 1] === '*') {
      let j = src.indexOf('*/', i + 2)
      j = j === -1 ? src.length : j + 2
      for (let k = i; k < j; k++) out += src[k] === '\n' ? '\n' : ' '
      i = j
    } else if (src.startsWith('<!--', i)) {
      let j = src.indexOf('-->', i + 4)
      j = j === -1 ? src.length : j + 3
      for (let k = i; k < j; k++) out += src[k] === '\n' ? '\n' : ' '
      i = j
    } else {
      out += src[i]
      i++
    }
  }
  return out
}

/**
 * Every rule in one component's <style> block that declares the token, as
 * { line, selector, body }. Handles one level of at-rule nesting (@media /
 * @container), which four components use.
 */
function rulesIn(raw) {
  const src = blankComments(raw)
  const open = src.indexOf('<style')
  if (open === -1) return []
  const from = src.indexOf('>', open) + 1
  const to = src.indexOf('</style>', from)
  if (to === -1) return []
  const style = src.slice(from, to)
  const found = []

  const lineAt = (offsetInStyle) => raw.slice(0, from + offsetInStyle).split('\n').length

  const walk = (text, base, depth) => {
    let level = 0
    let blockStart = -1
    let selStart = 0
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (level === 0) blockStart = i
        level++
      } else if (text[i] === '}') {
        level--
        if (level === 0) {
          const selRaw = text.slice(selStart, blockStart)
          const selector = selRaw.trim().replace(/\s+/g, ' ')
          const body = text.slice(blockStart + 1, i)
          const lead = selRaw.length - selRaw.trimStart().length
          if (body.includes('{')) {
            // an at-rule or nesting container: descend one level
            if (depth < 4) walk(body, base + blockStart + 1, depth + 1)
          } else if (body.includes(TOKEN) && !selector.startsWith('@')) {
            found.push({ line: lineAt(base + selStart + lead), selector, body: body.trim() })
          }
          selStart = i + 1
        }
      }
    }
  }
  walk(style, 0, 0)
  return found
}

/**
 * `declaring(sources)` — the set of KEYS under components/svelte/ that declare
 * --text-tertiary.
 *
 * KEY = component + selector + OCCURRENCE ORDINAL, and grouped selectors are
 * split into one entry per comma-separated part before keying.
 *
 * The ordinal is load-bearing. `component + selector` alone is not unique: nine
 * collisions exist in this tree, and eight @media/@container blocks in four
 * components duplicate selectors by construction. None of the eight allow-set
 * selectors is duplicated TODAY, so a selector-keyed guard would be sound by
 * luck rather than design — and its failure mode is silent: a responsive
 * override declaring the token under an allow-set selector would collide with
 * the allow entry, offenders would come back empty, and a real regression would
 * ship green. Mutation C is the only case that detects that.
 *
 * TRAVERSAL ORDER IS PINNED — files by sorted path, source order within a file,
 * grouped parts left-to-right. This is a precondition of Mutation C, not a
 * tidiness point: with undefined order an injected rule can take occurrence 0
 * and displace the original to 1, so `missing` goes non-empty and the case fails
 * for the wrong reason — a red that proves nothing.
 *
 * @param {Record<string,string>} sources component filename -> source text
 */
export function declaring(sources) {
  const seen = new Map()
  const keys = []
  for (const file of Object.keys(sources).sort()) {
    const component = file.replace(/\.svelte$/, '')
    for (const rule of rulesIn(sources[file])) {
      for (const part of rule.selector.split(',').map((s) => s.trim())) {
        const id = component + '|' + part
        const occurrence = seen.get(id) ?? 0
        seen.set(id, occurrence + 1)
        keys.push({ component, selector: part, occurrence, line: rule.line })
      }
    }
  }
  return keys
}

const keyOf = (k) => `${k.component}|${k.selector}|${k.occurrence}`

/**
 * The comparison. `offenders` emits HUMAN SENTENCES, never allow-schema-shaped
 * objects — a maintainer must not be able to paste the failure output into
 * contrast-allow.json to make the red go away. Removing that copy-paste
 * affordance costs nothing architecturally.
 */
export function compare(declaringKeys, allowEntries) {
  const allowKeys = new Set(allowEntries.map(keyOf))
  const declaredKeys = new Set(declaringKeys.map(keyOf))
  const offenders = declaringKeys
    .filter((k) => !allowKeys.has(keyOf(k)))
    .map(
      (k) =>
        `${k.component}.svelte ${k.selector} (occurrence ${k.occurrence}, line ${k.line}) declares ${TOKEN} and is not in the allow list`,
    )
  const missing = allowEntries
    .filter((e) => !declaredKeys.has(keyOf(e)))
    .map(
      (e) =>
        `${e.component}.svelte ${e.selector} (occurrence ${e.occurrence}) is allow-listed as ${e.verdict} but no longer declares ${TOKEN}`,
    )
  return { offenders, missing }
}

// ---------------------------------------------------------------------------
// the real sources
// ---------------------------------------------------------------------------

const walkDir = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walkDir(p, out)
    else if (p.endsWith('.svelte')) out.push(p)
  }
  return out
}

const componentPaths = walkDir(LIB)
const sources = Object.fromEntries(
  componentPaths.map((p) => [p.slice(LIB.length + 1), readFileSync(p, 'utf8')]),
)
const allow = allowFile.entries

// ---------------------------------------------------------------------------

describe('the guard can see anything at all', () => {
  // A read that quietly returns nothing makes every case below vacuously true.
  it('found components to scan', () => {
    expect(componentPaths.length).toBeGreaterThan(40)
    expect(Object.keys(sources).length).toBe(componentPaths.length)
  })

  // POSITIVE CONTROL ON THE PARSER, on a synthetic source rather than on the
  // live CSS. Asserting a count against the real components would only describe
  // whatever the tree happens to hold today — before #66 it was 75 keys, after
  // it is 8 — so it measures the CSS, not the instrument. This measures the
  // instrument, and it stays meaningful whatever the components do next.
  //
  // Every shape that defeated an earlier attempt is in here: a block comment
  // carrying prose AND braces (two passes were thrown by this), a grouped
  // selector, an @media override producing a second occurrence, :global(), and
  // a rule that does not name the token at all.
  const SYNTHETIC = `<script>let x = 1</script>
<div class="a"></div>
<style>
  /* A comment with prose and a { brace } in it, spanning
     two lines, of the kind these components carry a lot of. */
  .a {
    color: var(--text-tertiary);
  }
  .b, :global(.c) {
    color: var(--text-tertiary);
  }
  .d {
    color: var(--text-secondary);
  }
  @media (prefers-contrast: more) {
    .a {
      color: var(--text-tertiary);
    }
  }
</style>`

  it('the parser sees grouped selectors, at-rule nesting and comments', () => {
    const keys = declaring({ 'Synth.svelte': SYNTHETIC })
    expect(keys.map((k) => `${k.selector}#${k.occurrence}`)).toEqual([
      '.a#0',
      '.b#0',
      ':global(.c)#0',
      '.a#1', // the @media override — a SECOND occurrence, not a collision
    ])
    // `.d` does not name the token and must not appear
    expect(keys.some((k) => k.selector === '.d')).toBe(false)
    // line numbers survive the comment blanking: `.a` opens on line 6
    expect(keys[0].line).toBe(6)
  })

  it('a parser that lost rules would fail this, rather than pass a smaller set', () => {
    // The failure mode that shipped once: an attempt that computed offsets
    // against unblanked source silently lost 42 of 73 rules and reported clean.
    expect(declaring({ 'Synth.svelte': SYNTHETIC })).toHaveLength(4)
    expect(declaring({ 'Empty.svelte': '<div></div>' })).toEqual([])
  })

  it('on the real sources it now finds exactly the allow set', () => {
    // After #66 the only rules left declaring the token are the eight on the
    // allow list. Stated as a set, not a count, so it cannot pass by accident.
    const keys = declaring(sources).map(keyOf).sort()
    expect(keys).toEqual(allow.map(keyOf).sort())
  })

  it('does not scan tokens/ — --illustration-ink must survive (condition c-prime)', () => {
    const tokensCss = readFileSync(
      join(import.meta.dirname, '../../..', 'tokens/tokens.css'),
      'utf8',
    )
    // The exempt reference really is there, so this is a live control rather
    // than an assertion about an empty file.
    expect(tokensCss).toContain('--illustration-ink')
    expect(tokensCss).toContain(TOKEN)
    // ...and no scanned path reaches it.
    expect(componentPaths.every((p) => p.includes('/components/svelte/'))).toBe(true)
    expect(componentPaths.some((p) => p.includes('/tokens/'))).toBe(false)
  })
})

describe('contrast-allow.json is a well-formed human decision list', () => {
  // Seven entries left with the components they reviewed when those components
  // were retired (catalog app-coverage plan, K4); both NON_TEXT entries were
  // strokes in retired charts. Two KEPT entries came with CharacterTable's decorative icons (T2),
  // and Launcher's two disabled-action entries left with it (K-final).
  it('has thirteen entries: four KEPT and nine RESTORED', () => {
    expect(allow).toHaveLength(13)
    expect(allow.filter((e) => e.verdict === 'KEPT')).toHaveLength(4)
    expect(allow.filter((e) => e.verdict === 'NON_TEXT')).toHaveLength(0)
    expect(allow.filter((e) => e.verdict === 'RESTORED')).toHaveLength(9)
  })

  it('every entry carries a verdict and an enum reason, not free text', () => {
    for (const e of allow) {
      expect(VERDICTS, `${e.component} ${e.selector} verdict`).toContain(e.verdict)
      expect(REASONS, `${e.component} ${e.selector} reason`).toContain(e.reason)
      expect(typeof e.occurrence, `${e.component} ${e.selector} occurrence`).toBe('number')
    }
  })

  it('reasons are used only where they apply', () => {
    // `non-text` is for the SVG strokes; the three SC 1.4.3 reasons are for text
    // that stays. Crossing them would assert a text exemption over a case whose
    // contrast is not even a token-pair ratio.
    for (const e of allow) {
      if (e.verdict === 'NON_TEXT') expect(e.reason).toBe('non-text')
      else expect(e.reason).not.toBe('non-text')
    }
  })

  it('`size>=24px` has zero members, which is correct rather than suspicious', () => {
    // The largest computed size anywhere in the 75-key population is 19.2px, so
    // nothing can be exempted on size. If the type scale grows, this is where a
    // member would appear.
    expect(allow.filter((e) => e.reason === 'size>=24px')).toHaveLength(0)
  })

  // Uniqueness is asserted HERE, on the hand-authored side, and not on
  // `declaring` — a traversal ordinal cannot collide with itself, so asserting
  // it there has an empty red set by construction, which is this plan's own
  // definition of vacuity. The side that genuinely collides is the one a human
  // types, where an entry can be pasted twice.
  it('has no duplicate keys', () => {
    const keys = allow.map(keyOf)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('case 1 — GREEN on the real sources', () => {
  // This case is NOT a formality. It is the only one of the four that fails a
  // guard which names everything: a 100%-false-positive guard passes mutations
  // A and B, because both assert only that the mutated rule APPEARS.
  it('no component declares --text-tertiary outside the allow list', () => {
    const { offenders } = compare(declaring(sources), allow)
    expect(offenders).toEqual([])
  })

  it('every allow-listed rule still declares --text-tertiary', () => {
    const { missing } = compare(declaring(sources), allow)
    expect(missing).toEqual([])
  })
})

describe('case 2 — mutation A, the regression', () => {
  // If this passes, the guard is vacuous and PR 1 does not ship.
  it('reds when --text-tertiary is re-added to a CHANGED rule', () => {
    const mutated = { ...sources }
    const before = mutated['Gallery.svelte']
    mutated['Gallery.svelte'] = before.replace(
      /(\.gallery__caption\s*\{[^}]*?)color:\s*var\(--text-secondary\)/,
      `$1color: var(${TOKEN})`,
    )
    // the mutation actually landed
    expect(mutated['Gallery.svelte']).not.toBe(before)

    const { offenders, missing } = compare(declaring(mutated), allow)
    expect(offenders).toHaveLength(1)
    expect(offenders[0]).toContain('Gallery.svelte')
    expect(offenders[0]).toContain('.gallery__caption')
    expect(missing).toEqual([])
  })

  it('names the offender in a sentence, not as a pasteable allow entry', () => {
    const mutated = { ...sources }
    mutated['Gallery.svelte'] = mutated['Gallery.svelte'].replace(
      /(\.gallery__caption\s*\{[^}]*?)color:\s*var\(--text-secondary\)/,
      `$1color: var(${TOKEN})`,
    )
    const { offenders } = compare(declaring(mutated), allow)
    expect(typeof offenders[0]).toBe('string')
    expect(offenders[0]).toMatch(/declares --text-tertiary and is not in the allow list$/)
    // nothing a maintainer can paste into contrast-allow.json to silence it
    expect(offenders[0]).not.toContain('"verdict"')
    expect(offenders[0]).not.toContain('"reason"')
    expect(() => JSON.parse(offenders[0])).toThrow()
  })
})

describe('case 3 — mutation B, the drift', () => {
  it('reds when an allow-listed rule stops declaring the token', () => {
    const mutated = { ...sources }
    const before = mutated['Toggle.svelte']
    mutated['Toggle.svelte'] = before.replace(
      /(:global\(\.ui-toggle\[data-disabled\] \.ui-toggle__label\)\s*\{[^}]*?)color:\s*var\(--text-tertiary\)/,
      '$1color: var(--text-secondary)',
    )
    expect(mutated['Toggle.svelte']).not.toBe(before)

    const { offenders, missing } = compare(declaring(mutated), allow)
    expect(missing).toHaveLength(1)
    expect(missing[0]).toContain('Toggle.svelte')
    expect(missing[0]).toContain('.ui-toggle__label')
    expect(offenders).toEqual([])
  })
})

describe('case 4 — mutation C, occurrence-keying in discrimination form', () => {
  // A SECOND rule under an allow-set selector — the @media shape four
  // components already use. Under correct keying its key is
  // (component, selector, 1), which is NOT in allow (the entry is occurrence 0).
  //
  // This does not collapse into mutation A. A guard keyed (component, selector)
  // with no ordinal PASSES A and FAILS C: the injected rule's key matches the
  // allow entry, offenders comes back empty, and the case reds. C is what
  // separates an occurrence-keyed guard from a selector-keyed one — M9's silent
  // failure exactly, and the only case that detects it.
  const injectSecondOccurrence = () => {
    const mutated = { ...sources }
    const before = mutated['Toggle.svelte']
    mutated['Toggle.svelte'] = before.replace(
      '</style>',
      `
  @media (prefers-contrast: more) {
    :global(.ui-toggle[data-disabled] .ui-toggle__label) {
      color: var(${TOKEN});
    }
  }
</style>`,
    )
    expect(mutated['Toggle.svelte']).not.toBe(before)
    return mutated
  }

  it('the injected rule is found, and it is the SECOND occurrence', () => {
    const keys = declaring(injectSecondOccurrence()).filter(
      (k) =>
        k.component === 'Toggle' &&
        k.selector === ':global(.ui-toggle[data-disabled] .ui-toggle__label)',
    )
    expect(keys.map((k) => k.occurrence)).toEqual([0, 1])
    // pinned traversal order: the ORIGINAL keeps occurrence 0. If it did not,
    // `missing` would go non-empty and this case would red for the wrong reason.
    expect(keys[0].line).toBeLessThan(keys[1].line)
  })

  it('reds on the injected second occurrence, and missing stays empty', () => {
    const { offenders, missing } = compare(declaring(injectSecondOccurrence()), allow)
    expect(offenders).toHaveLength(1)
    expect(offenders[0]).toContain('occurrence 1')
    expect(offenders[0]).toContain('Toggle.svelte')
    // the original allow entry is still matched — this is the wrong-reason check
    expect(missing).toEqual([])
  })

  it('a SELECTOR-KEYED guard passes mutation A and FAILS this case', () => {
    // The discrimination, executed rather than asserted in prose. Same inputs,
    // same allow list, ordinal dropped from the key.
    const selectorKeyed = (keys, entries) => {
      const allowKeys = new Set(entries.map((e) => `${e.component}|${e.selector}`))
      return keys.filter((k) => !allowKeys.has(`${k.component}|${k.selector}`))
    }

    // it still catches mutation A ... (same target as mutation A itself, moved
    // to Gallery after #75 — see the note at the top of this file)
    const a = { ...sources }
    a['Gallery.svelte'] = a['Gallery.svelte'].replace(
      /(\.gallery__caption\s*\{[^}]*?)color:\s*var\(--text-secondary\)/,
      `$1color: var(${TOKEN})`,
    )
    expect(selectorKeyed(declaring(a), allow)).toHaveLength(1)

    // ... and it is BLIND to mutation C, which is the silent failure.
    expect(selectorKeyed(declaring(injectSecondOccurrence()), allow)).toEqual([])

    // the occurrence-keyed guard, on the same input, is not.
    expect(compare(declaring(injectSecondOccurrence()), allow).offenders).toHaveLength(1)
  })
})

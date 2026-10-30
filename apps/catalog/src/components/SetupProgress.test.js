import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import SetupProgress from '@khaos-machine/khaotik-ui/components/svelte/SetupProgress.svelte'

const ROOT = join(import.meta.dirname, '../../../..')
const SOURCE = join(ROOT, 'components/svelte/SetupProgress.svelte')

describe('SetupProgress', () => {
  // The verbatim rule at InstallScript.svelte:19 holds for its script, applied
  // to streamed output: the text on screen is the text khaosd emitted. The
  // panel is COLLAPSED by default, so the transcript must not be in the
  // document at all until the disclosure is open — hidden-but-present would
  // still be read by a screen reader and would still be found by this query.
  it('keeps the transcript out of the document until the disclosure is open', async () => {
    const lines = [
      'Creating virtual environment at /Users/k/.khaos/mlx-audio/venv',
      'Resolved 41 packages in 812ms',
    ]

    const { rerender } = render(SetupProgress, {
      props: { title: 'Provisioning MLX Audio', lines, open: false },
    })
    expect(screen.queryByText(/Resolved 41 packages/)).toBeNull()

    await rerender({ title: 'Provisioning MLX Audio', lines, open: true })

    // ONE TEXT NODE, joined — not two elements — so the transcript can be
    // selected and copied as khaosd wrote it. Asserted as the structural
    // property rather than as string equality: `.textContent === lines.join()`
    // reds against any template formatting that puts a newline between the
    // `<pre>` tag and the expression, which is what a formatter naturally
    // does. The child-node assertion is what the rule actually is.
    const log = screen.getByTestId('setup-progress-log')
    expect(log.childNodes.length).toBe(1)
    expect(log.childNodes[0].nodeType).toBe(Node.TEXT_NODE)
    expect(log.textContent.trim()).toBe(lines.join('\n'))
  })

  it('names the disclosure differently open than closed', async () => {
    // Two props, not one. A control that still reads "Show setup details" over
    // an open panel is a false statement — the defect class D71 and D72 both
    // turn on.
    const props = { lines: ['a'], onToggle: () => {}, open: false }
    const { rerender } = render(SetupProgress, { props })

    expect(screen.getByRole('button', { name: 'Show setup details' })).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')

    await rerender({ ...props, open: true })
    expect(screen.getByRole('button', { name: 'Hide setup details' })).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('asks for the state being requested, rather than announcing its own', async () => {
    const onToggle = vi.fn()
    render(SetupProgress, { props: { lines: ['a'], open: false, onToggle } })

    await fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('renders the disclosure DISABLED when onToggle is omitted, not absent', () => {
    // The house contract InstallScript.onCopy and ServiceStatusList's row
    // actions both use. A host that renders a transcript it will not let
    // anyone open should have that visible.
    render(SetupProgress, { props: { lines: ['a'] } })

    const button = screen.getByRole('button', { name: 'Show setup details' })
    expect(button).toBeDisabled()
  })

  describe('the busy claim', () => {
    it('is carried by busyLabel and NOT by note', () => {
      // THE M2 RED. `note` defaults to `''`, so this — `busy` with no `note` —
      // is the default path and the one a first integration takes. An earlier
      // draft had `note` carrying the claim, which meant an aria-hidden ring
      // and nothing else: a screen-reader user told nothing at all for the five
      // minutes the work ran.
      render(SetupProgress, { props: { title: 'Provisioning MLX Audio', busy: true, note: '' } })

      expect(screen.getByText('Working…')).toBeInTheDocument()
    })

    it("uses the caller's word when one is given", () => {
      render(SetupProgress, { props: { busy: true, busyLabel: 'Resolving packages…' } })
      expect(screen.getByText('Resolving packages…')).toBeInTheDocument()
    })

    it('makes no claim at all when the caller sets nothing', () => {
      // `busy` is consumer-set and never inferred: output arriving is not proof
      // work is still running. A caller that says nothing produces no claim.
      render(SetupProgress, { props: { title: 'Provisioning MLX Audio', lines: ['a'] } })
      expect(screen.queryByText('Working…')).toBeNull()
    })
  })

  describe('the step feed', () => {
    it('is a polite live region, and the transcript is not', () => {
      // Three regions, three different answers. The step rows are discrete and
      // few, which is the textbook polite case. The transcript is silent
      // because `role="log"` carries an implicit `aria-live="polite"`, and a
      // five-minute uv transcript announced line by line is a denial of
      // service rather than an accessibility win.
      render(SetupProgress, {
        props: {
          steps: [{ name: 'venv', state: 'passed' }],
          lines: ['Resolved 41 packages in 812ms'],
          open: true,
          onToggle: () => {},
        },
      })

      const list = screen.getByRole('list')
      expect(list).toHaveAttribute('aria-live', 'polite')
      expect(list).toHaveAttribute('aria-relevant', 'additions text')

      const log = screen.getByTestId('setup-progress-log')
      expect(log).not.toHaveAttribute('aria-live')
      expect(log).not.toHaveAttribute('role')
    })

    it('renders the step name verbatim, with no display-name table', () => {
      // `apple_silicon` is the daemon's word. Inventing "Apple silicon" means
      // guessing at a vocabulary khaosd owns.
      render(SetupProgress, { props: { steps: [{ name: 'apple_silicon', state: 'passed' }] } })
      expect(screen.getByText('apple_silicon')).toBeInTheDocument()
    })

    it('renders a step detail verbatim and whole', () => {
      const detail = '3.12 (/opt/homebrew/bin/python3.12)'
      render(SetupProgress, { props: { steps: [{ name: 'python', state: 'passed', detail }] } })

      const el = screen.getByText(detail)
      expect(el.textContent).toBe(detail)
      expect(el.textContent).not.toContain('…')
    })

    describe('tones', () => {
      // The dot carries the tone, and the pill carries the word. Asserted on
      // the dot's `data-tone`, because the pill's text is the raw state and
      // would pass whatever the mapping did.
      //
      // SCOPED TO `.setup__dot`, and that scoping is the whole assertion.
      // `StatusPill.svelte:17` also renders `data-tone`, is fed the identical
      // `toneFor(step)` value, and comes SECOND in document order — so a bare
      // `[data-tone]` selector still found a tone with the dot's attribute
      // deleted, and all six cases below stayed green through that mutation.
      // Measured: deleting `data-tone={toneFor(step)}` from
      // SetupProgress.svelte:188 left 30/30 passing on the unscoped selector
      // and reds all six here.
      const toneOf = (step) => {
        const { container, unmount } = render(SetupProgress, { props: { steps: [step] } })
        const dot = container.querySelector('.setup__dot[data-tone]')
        expect(dot).toBeTruthy()
        const tone = dot.getAttribute('data-tone')
        unmount()
        return tone
      }

      it('maps passed to success', () => {
        expect(toneOf({ name: 'venv', state: 'passed' })).toBe('success')
      })

      it('maps failed to danger', () => {
        expect(toneOf({ name: 'weights', state: 'failed' })).toBe('danger')
      })

      it('maps skipped to skipped, not to neutral', () => {
        // `skipped` is why StatusTone is seven-way rather than five. Mapping it
        // to neutral is the defect that put it there.
        expect(toneOf({ name: 'apple_silicon', state: 'skipped' })).toBe('skipped')
      })

      it('renders pending NEUTRAL — not success, and not danger', () => {
        // Rendering pending as success is the failure this whole surface
        // exists to prevent. It is not danger either: nothing is known to be
        // wrong. Same rule RequirementList applies to `unknown`.
        expect(toneOf({ name: 'packages', state: 'pending' })).toBe('neutral')
      })

      it('renders an UNRECOGNISED state neutral', () => {
        // `StepState` is open at the producer — khaos-manager can add a member
        // and this client receives it unfiltered. A state this build has never
        // heard of is not a pass and not a failure.
        expect(toneOf({ name: 'packages', state: 'quarantined' })).toBe('neutral')
      })

      it('renders an ABSENT state neutral', () => {
        expect(toneOf({ name: 'packages' })).toBe('neutral')
      })
    })
  })

  describe('nothing emitted is not the same as finished', () => {
    it('shows emptyLabel and NO log element when the disclosure is open on no lines', () => {
      render(SetupProgress, { props: { lines: [], open: true, onToggle: () => {} } })

      // The `<pre>` is rendered only when there is a transcript, so the testid
      // element's text content is the transcript and nothing else. `emptyLabel`
      // is a SIBLING of it, never inside it.
      expect(screen.queryByTestId('setup-progress-log')).toBeNull()
      expect(screen.getByText('No output yet.')).toBeInTheDocument()
    })

    it("takes the host's own words for it", () => {
      render(SetupProgress, {
        props: { lines: [], open: true, onToggle: () => {}, emptyLabel: 'khaosd has not written anything yet.' },
      })
      expect(screen.getByText('khaosd has not written anything yet.')).toBeInTheDocument()
    })
  })

  describe('variant', () => {
    // The chrome is the component's; the takeover is the HOST's. `surface`
    // drops the border and radius so a host can mount this full-window without
    // reaching into component internals. It does not seize the viewport, and
    // there is no focus trap, no aria-modal and no scroll locking — that is a
    // deliberate narrowing of #63, ruled by the operator (D73).
    const variantOf = (props) => {
      const { container, unmount } = render(SetupProgress, { props })
      const v = container.querySelector('.setup').getAttribute('data-variant')
      unmount()
      return v
    }

    it('is card by default', () => {
      expect(variantOf({ title: 'Provisioning MLX Audio' })).toBe('card')
    })

    it('drops the chrome on surface', () => {
      expect(variantOf({ title: 'Provisioning MLX Audio', variant: 'surface' })).toBe('surface')
    })

    it('starts no mode: no dialog role, no aria-modal', () => {
      render(SetupProgress, { props: { title: 'Provisioning MLX Audio', variant: 'surface' } })
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(document.querySelector('[aria-modal]')).toBeNull()
    })
  })

  describe('follow-the-tail wiring', () => {
    // WHAT THIS PROVES: the effect is wired to the right element, the scroll
    // handler consults `shouldFollow` in BOTH directions, and the threshold the
    // component uses is the one tail-follow.js exports.
    //
    // WHAT IT DOES NOT PROVE: that a real engine scrolls. jsdom performs no
    // layout — scrollHeight and clientHeight are hard-coded 0 and the scrollTop
    // setter is a no-op — so the layout below is one THIS TEST WROTE. The
    // honest confirmation is the catalog running on device, and there is no
    // runner for it.

    /** 400 tall, 100 visible → range 300; STICK_THRESHOLD_PX is 24, so
        top >= 276 follows and top < 276 does not. */
    const instrument = (el) => {
      let top = 0
      Object.defineProperty(el, 'scrollHeight', { get: () => 400, configurable: true })
      Object.defineProperty(el, 'clientHeight', { get: () => 100, configurable: true })
      Object.defineProperty(el, 'scrollTop', {
        get: () => top,
        set: (v) => { top = v },
        configurable: true,
      })
      return {
        get top() { return top },
        set top(v) { top = v },
      }
    }

    const setup = async () => {
      const props = { lines: ['one'], open: true, onToggle: () => {} }
      const { rerender } = render(SetupProgress, { props })
      const el = screen.getByTestId('setup-progress-log')
      const pos = instrument(el)
      let n = 1
      return {
        pos,
        el,
        /** Another line arrives. */
        stream: async () => {
          n += 1
          await rerender({ ...props, lines: Array.from({ length: n }, (_, i) => `line ${i}`) })
        },
      }
    }

    it('follows the tail by default', async () => {
      // Does NOT consult the predicate: `follow` starts `true`. Stated as such
      // — this assertion alone cannot tell shouldFollow from a latch.
      const { pos, stream } = await setup()
      await stream()
      expect(pos.top).toBe(400)
    })

    it('stops following once the operator scrolls away', async () => {
      // A panel that yanks itself to the bottom while someone is reading an
      // error is worse than one that never scrolls.
      const { pos, el, stream } = await setup()
      pos.top = 0
      await fireEvent.scroll(el)
      await stream()
      expect(pos.top).toBe(0)
    })

    it('RESUMES following when the operator scrolls back within the threshold', async () => {
      // THE DISTINGUISHING CASE. A boolean latch — `onscroll={() => follow =
      // false}` — reds here, because nothing would ever set `follow` back to
      // true. This is the assertion that proves the handler calls
      // `shouldFollow` rather than merely clearing a flag.
      const { pos, el, stream } = await setup()

      pos.top = 0
      await fireEvent.scroll(el)
      await stream()
      expect(pos.top).toBe(0)

      pos.top = 290 // 400 - 100 - 290 = 10, inside the 24px band
      await fireEvent.scroll(el)
      await stream()
      expect(pos.top).toBe(400)
    })

    it('does NOT resume just outside the band', async () => {
      // Paired with the case above this pins the threshold at the COMPONENT
      // level, not only in the pure module.
      const { pos, el, stream } = await setup()

      pos.top = 0
      await fireEvent.scroll(el)
      await stream()

      pos.top = 200 // 400 - 100 - 200 = 100, well past 24
      await fireEvent.scroll(el)
      await stream()
      expect(pos.top).toBe(200)
    })
  })
})

// The bounding and wrapping rules — a SOURCE READ, not a rendered assertion.
//
// jsdom resolves no stylesheets, so `max-height`, the centred-flex clipping
// trap and the two wrapping properties are all invisible to anything rendered:
// an assertion about them passes identically whether or not the declaration is
// in the file. `token-refs.test.js` cannot see them either — it matches
// `var(--…)` and these are literals.
//
// Comments are stripped first, the pattern token-refs.test.js:41-45 already
// uses and the trap regressions.test.js:22 learned the hard way: the log rule
// above is explained in prose that names every property under test, so a scan
// over raw text would be satisfied by the explanation.
const style = readFileSync(SOURCE, 'utf8')
  .match(/<style>([\s\S]*)<\/style>/)[1]
  .replace(/\/\*[\s\S]*?\*\//g, '')

/** Every `selector { … }` rule in the stripped stylesheet, as { selector, body }. */
const parseRules = (css) =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    body: m[2],
  }))

const rules = parseRules(style)

/** The declared value of one property within one rule, or null. */
const decl = (rule, prop) =>
  rule.body.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`))?.[1]?.trim() ?? null

// `parseRules` cannot see into an at-rule: its `[^{}]*` body stops at the first
// nested `{`, so the scanner slides past `@media …` and matches the rule NESTED
// INSIDE it instead. Two consequences, and both of the helpers below exist for
// them:
//
//   - `rules` holds TWO `.setup__spinner` entries — the real one and the
//     reduced-motion override — and one `to` from `@keyframes`. A `.find()` on
//     that list is answering a question about whichever came first in the file.
//   - the at-rule PRELUDE is nowhere in `rules` at all, so "is the animation
//     guarded" cannot be asked of it.

/** The brace-matched body of an at-rule block named by its prelude, or null.
 *
 * The prelude match is ANCHORED — it must be followed by optional whitespace
 * and the opening `{` of its own block. An unanchored `indexOf` is a prefix
 * match, and a prefix match here is a hole big enough to drive both of this
 * helper's callers through:
 *
 *   - `@keyframes setup-spin` prefix-matches `@keyframes setup-spin-x`, so a
 *     renamed keyframes block — leaving `animation: setup-spin …` naming
 *     nothing, and nothing spinning — still returns a truthy body.
 *   - `@media (prefers-reduced-motion: reduce)` prefix-matches
 *     `@media (prefers-reduced-motion: reduce) and (min-width: 9999px)`, a
 *     guard that can never apply on a real viewport, in the test named for
 *     stopping the spin.
 *
 * Both were measured green at 39/39 before the anchor existed.
 */
const atRuleBody = (prelude) => {
  const anchored = new RegExp(`${prelude.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`)
  const found = anchored.exec(style)
  if (!found) return null
  const open = found.index + found[0].length - 1
  let depth = 0
  for (let i = open; i < style.length; i += 1) {
    if (style[i] === '{') depth += 1
    else if (style[i] === '}') {
      depth -= 1
      if (depth === 0) return style.slice(open + 1, i)
    }
  }
  return null
}

/** The rules OUTSIDE every at-rule — so `.setup__spinner` here is the
    unguarded declaration and never the reduced-motion override. */
const topRules = parseRules(style.replace(/@[a-z-]+[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, ''))

describe('the log rule, read from source', () => {
  const logRule = rules.find((r) => r.selector === '.setup__log')

  it('finds the rule at all — the positive control for every check below', () => {
    // Without this, a renamed class would silently turn all four checks into
    // assertions about `undefined` and the suite would go green on a component
    // that ships none of them.
    expect(logRule).toBeTruthy()
    expect(rules.length).toBeGreaterThan(10)
  })

  it('bounds the log with a REAL max-height, in the rule that scrolls', () => {
    // Not a string-presence check. `max-height: none` contains the property and
    // bounds nothing, which is exactly the shape a well-meaning "fix" for a
    // clipped log reaches for.
    expect(decl(logRule, 'overflow-y')).toBe('auto')

    const maxHeight = decl(logRule, 'max-height')
    expect(maxHeight).not.toBeNull()
    expect(['none', 'unset', 'initial', 'revert', 'auto']).not.toContain(maxHeight)
    expect(maxHeight).toMatch(/^\d*\.?\d+(rem|em|px|vh|%)$/)
  })

  it('centres nothing that scrolls — anywhere in this component', () => {
    // #63's second comment corrects its first: the reference's
    // `max-h-28 overflow-auto` was right, and the clipping came from
    // `flex-1 items-center justify-center` inside an `overflow-y-auto` parent.
    // A flex container that centres content it cannot fit clips the
    // overflowing end instead of letting it scroll.
    //
    // SCOPED TO THE RULE BLOCK, not the file: a centred flex row elsewhere in
    // this component is fine and must not red this.
    const offenders = rules.filter((r) => {
      const overflowY = decl(r, 'overflow-y') ?? decl(r, 'overflow')
      if (!overflowY || overflowY === 'visible') return false
      return decl(r, 'justify-content') === 'center' || decl(r, 'align-items') === 'center'
    })

    expect(offenders.map((r) => r.selector)).toEqual([])
  })

  it('wraps rather than scrolling sideways', () => {
    // A bare `<pre>` defaults to `white-space: pre`, so a 200-character `uv`
    // resolution line would scroll the log region horizontally instead of
    // wrapping. `pre-wrap` and NOT `pre-line`: `pre-line` collapses runs of
    // spaces, and a provisioning log's column alignment is part of what khaosd
    // wrote.
    //
    // Asserted by VALUE, not by presence — a presence-only check passes against
    // `white-space: pre`, which is the default this declaration exists to
    // override.
    expect(decl(logRule, 'white-space')).toBe('pre-wrap')
  })

  it('breaks a path that has no spaces to break at', () => {
    expect(decl(logRule, 'overflow-wrap')).toBe('anywhere')
  })
})

// The motion, chrome and stroke rules — SOURCE READS, for the same reason the
// log rule above is one: jsdom resolves no stylesheets, so every declaration
// below is invisible to any rendered assertion. Each of the four was deleted
// from the component and the full suite stayed green before these existed.
describe('the motion, chrome and stroke rules, read from source', () => {
  it('finds the top-level rules at all — the positive control', () => {
    // Without this, a change to the at-rule stripper turns every check below
    // into an assertion about `undefined` and they all pass on a component
    // that ships none of it.
    expect(topRules.length).toBeGreaterThan(10)
    expect(topRules.map((r) => r.selector)).toContain('.setup__spinner')
  })

  it('SPINS — the animation, and the keyframes it names', () => {
    // `busy` renders a ring that has to turn; a static ring is a claim that
    // nothing is happening. Neither half is enough alone: an `animation`
    // naming keyframes that do not exist animates nothing, and keyframes
    // nothing references are dead text.
    //
    // That claim is only true because `atRuleBody` anchors its prelude match.
    // It did not, once, and the first half of this sentence was false while it
    // was written directly above the test that was supposed to prove it:
    // renaming the block to `@keyframes setup-spin-x` prefix-matched and went
    // 39/39 green. Read the anchor note on `atRuleBody` before loosening it.
    //
    // NOTE, not a defect: `topRules.find` returns whichever `.setup__spinner`
    // rule comes FIRST outside an at-rule. There is one today. Moving the
    // reduced-motion override above the base rule — if it ever left its
    // `@media` — would have this reading the wrong one.
    const spinner = topRules.find((r) => r.selector === '.setup__spinner')
    expect(spinner).toBeTruthy()

    const animation = decl(spinner, 'animation')
    expect(animation).toBeTruthy()
    expect(animation).toMatch(/(^|\s)setup-spin(\s|$)/)
    expect(atRuleBody('@keyframes setup-spin')).toBeTruthy()
  })

  it('STOPS SPINNING under prefers-reduced-motion', () => {
    // The library's first `@keyframes`, so also its first reduced-motion
    // guard, so there is no house precedent that would catch its loss. Read
    // through `atRuleBody` and not through `rules`, because `rules` cannot see
    // an at-rule prelude — the guarded declaration and an unguarded one are
    // indistinguishable to it.
    const guarded = atRuleBody('@media (prefers-reduced-motion: reduce)')
    expect(guarded).toBeTruthy()

    const spinner = parseRules(guarded).find((r) => r.selector === '.setup__spinner')
    expect(spinner).toBeTruthy()
    expect(decl(spinner, 'animation')).toBe('none')
  })

  it("DROPS THE CHROME on variant='surface', rather than only labelling it", () => {
    // The variant tests above assert the attribute is present. That is not the
    // contract — the contract is that the card border and radius are gone, so
    // a host can mount this full-window without reaching into internals. The
    // attribute can be perfectly correct while the rule it selects is absent.
    const card = topRules.find((r) => r.selector === '.setup')
    const surface = topRules.find((r) => r.selector === ".setup[data-variant='surface']")

    // Positive control: there has to BE chrome for dropping it to mean
    // anything. If `.setup` ever stops drawing a border, this test is
    // asserting nothing and should be re-derived rather than deleted.
    expect(card).toBeTruthy()
    expect(decl(card, 'border')).toBeTruthy()
    expect(decl(card, 'border-radius')).toBeTruthy()

    expect(surface).toBeTruthy()
    expect(decl(surface, 'border')).toBe('0')
    expect(decl(surface, 'border-radius')).toBe('0')
  })

  describe('the border shorthand puts a LENGTH in the width slot', () => {
    // The defect this exists for: `border: var(--border-hairline) solid
    // var(--border-default)` — `--border-hairline` is a COLOUR
    // (tokens/tokens.css:178, :241). In the `<line-width>` slot the shorthand
    // reads *colour solid colour*, which is invalid at computed-value time, so
    // the ENTIRE declaration is discarded and the element ships with no border
    // at all. Measured in a real engine: `width=0px style=none`.
    //
    // Invisible to everything else the repo runs. jsdom resolves no
    // stylesheets; `token-refs` checks that a `var(--…)` reference RESOLVES,
    // not that it resolves to the right KIND of value; the build is happy
    // because the syntax is well-formed.
    const TOKENS = readFileSync(join(ROOT, 'tokens/tokens.css'), 'utf8')

    /** Every value `--name` is given ANYWHERE in tokens.css — light and dark
        both. A token that is a length in one theme and a colour in the other
        is still a defect, so all of them are checked, not the first. */
    const tokenValues = (name) =>
      [...TOKENS.matchAll(new RegExp(`(?:^|[;{])\\s*${name}\\s*:\\s*([^;}]+)`, 'g'))].map((m) =>
        m[1].trim(),
      )

    /** A `var()` chain flattened to the literals it can end at.
     *
     * KNOWN LIMIT, deliberate: the pattern admits no fallback, so a legal
     * `var(--size-stroke-hairline, 1px)` is treated as an opaque literal and
     * fails `LENGTH`. That is a FALSE RED, not a hole — it fails loud, on a
     * declaration that is actually correct, and the fix is to widen the
     * pattern at that point rather than to discover a silent pass later. The
     * kit writes no fallbacks today. */
    const resolve = (value, depth = 0) => {
      const ref = value.match(/^var\(\s*(--[\w-]+)\s*\)$/)
      if (!ref || depth > 4) return [value]
      const values = tokenValues(ref[1])
      // A reference to a token that does not exist resolves to nothing, and
      // `flatMap` over nothing yields an empty list that passes every
      // assertion below vacuously.
      expect(values.length, `${ref[1]} is not declared in tokens.css`).toBeGreaterThan(0)
      return values.flatMap((v) => resolve(v, depth + 1))
    }

    // `0` is a legal `<line-width>` with no unit — `.setup[data-variant='surface']`
    // writes `border: 0` to drop the card chrome, and that is correct.
    const LENGTH = /^(0|\d*\.?\d+(px|rem|em))$/

    it('resolves a known length token — the positive control for the resolver', () => {
      expect(resolve('var(--size-stroke-hairline)')).toEqual(['1px'])
    })

    it('resolves a known COLOUR token to something that is not a length', () => {
      // The negative half of the control. If `resolve` silently returned []
      // or the raw `var(…)` text, the checks below would pass on the very
      // defect they exist for.
      const resolved = resolve('var(--border-hairline)')
      expect(resolved.length).toBeGreaterThan(0)
      for (const value of resolved) expect(value).not.toMatch(LENGTH)
    })

    // DERIVED FROM THE STYLESHEET, never enumerated. A hand-maintained list of
    // selectors is the exact shape `check-catalog` exists because of: it gates
    // what someone remembered to add and is silent about everything else. The
    // list that stood here named `.setup`, `.setup__toggle` and `.setup__log`,
    // and the same defect planted in the two declarations it did not name —
    // the busy ring's `border` and the focus `outline` — passed 39/39 twice.
    //
    // Every rule in the component is scanned, INCLUDING the ones nested inside
    // at-rules: `rules` is parsed from the whole stylesheet, not `topRules`.
    const WIDTH_SLOT = /^(border|border-(top|right|bottom|left)|outline)$/

    // KNOWN LIMIT, and it fails SILENT rather than loud, which is why it is
    // written down. `WIDTH_SLOT` matches seven property spellings. It does not
    // match `border-width`, `border-*-width`, `outline-width`, the logical
    // shorthands (`border-block`, `border-inline`, `border-{block,inline}-*`)
    // or `column-rule`. None of those appears anywhere in `components/svelte`
    // or `tokens` today, so nothing is uncovered — but the count floor below
    // defends against a declaration being REMOVED, not against one ARRIVING in
    // a spelling this regex cannot see. Widen it here if the kit starts writing
    // logical borders.

    /** The top-level components of a CSS shorthand, not splitting inside
        parentheses. A naive `split(/\s+/)` shreds `rgb(0 0 0 / 0.2)` into
        tokens, one of which is `0` — and bare `0` is a legal length, so a
        fragment of the COLOUR would satisfy the width slot and a broken
        declaration would pass. `rgb(<n> <n> <n> / <a>)` is this kit's house
        form (13 occurrences, e.g. `components/svelte/Menu.svelte:115`), so
        that is a live shape, not a hypothetical one. */
    const shorthandComponents = (value) => {
      const out = []
      let depth = 0
      let current = ''
      for (const char of value) {
        if (char === '(') depth += 1
        else if (char === ')') depth -= 1
        if (depth === 0 && /\s/.test(char)) {
          if (current) out.push(current)
          current = ''
        } else current += char
      }
      if (current) out.push(current)
      return out
    }

    /** Every `<line-width>`-bearing shorthand declared anywhere in the
        component, as { selector, prop, value }. */
    const widthSlots = rules.flatMap((rule) =>
      [...rule.body.matchAll(/(?:^|;)\s*([a-z-]+)\s*:\s*([^;]+)/g)]
        .filter((m) => WIDTH_SLOT.test(m[1]))
        .map((m) => ({ selector: rule.selector, prop: m[1], value: m[2].trim() })),
    )

    it('derives the shorthands from the stylesheet — the positive control', () => {
      // Without this, a change to `parseRules` or to `WIDTH_SLOT` derives an
      // empty list and every check below passes vacuously over nothing.
      const seen = widthSlots.map((s) => `${s.selector} { ${s.prop} }`)
      expect(seen).toContain(".setup[data-variant='surface'] { border }")
      expect(seen).toContain('.setup__spinner { border }')
      expect(seen).toContain('.setup__toggle:focus-visible { outline }')
      expect(widthSlots.length).toBeGreaterThanOrEqual(6)
    })

    it.each(widthSlots)('$selector declares a width in $prop, not a colour', (slot) => {
      // Order-independent by design. CSS accepts the shorthand components in
      // any order (`border: solid 1px red` is legal), so the assertion is that
      // SOME component resolves to a length in every theme it is declared in —
      // not that the first one does. The F1 defect leaves none that do:
      // `var(--border-hairline) solid var(--border-default)` is colour, style,
      // colour, which is invalid at computed-value time and drops the whole
      // declaration.
      const isLength = (token) => {
        const resolved = resolve(token)
        return resolved.length > 0 && resolved.every((value) => LENGTH.test(value))
      }

      const components = shorthandComponents(slot.value)
      expect(
        components.some(isLength),
        `${slot.selector} { ${slot.prop}: ${slot.value} } has no length in its width slot`,
      ).toBe(true)
    })
  })
})

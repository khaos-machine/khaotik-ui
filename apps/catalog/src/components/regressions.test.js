import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import Portrait from '@khaos-machine/khaotik-ui/components/svelte/Portrait.svelte'

// Regression guards for the fixes shipped in 0.9.2 (PRs #3, #5, #6, #9); #8 went with SceneRow.
//
// Every one of them was found by measuring the running app, and the suite passed
// at 190 throughout — none was test-visible. These exist so the next change that
// reintroduces one fails here instead of in someone's hands.
//
// Two are CSS and stacking, which jsdom does not compute, so they are checked by
// SOURCE READ against the component's own <style> block — the same shape as
// utilities.test.js. A rendered assertion would pass either way.

const LIB = join(import.meta.dirname, '../../../..', 'components/svelte')
const read = (n) => readFileSync(join(LIB, n), 'utf8')

// The declaration body of one rule, with comments stripped — these components
// explain their stacking in prose that mentions the very properties under test,
// so counting raw occurrences would count the explanation too.
function rule(css, selector) {
  const m = css.match(new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`))
  return m ? m[1].replace(/\/\*[\s\S]*?\*\//g, '') : ''
}

describe('#9 — Portrait colour keys off the entity, not the label', () => {
  const colourOf = (props) => {
    const { container } = render(Portrait, { props })
    return container.querySelector('.portrait')?.getAttribute('style') ?? ''
  }

  it('gives two entities sharing a name different colours', () => {
    const a = colourOf({ name: 'Desmond', identity: 'chr_aaa' })
    const b = colourOf({ name: 'Desmond', identity: 'chr_bbb' })
    expect(a).not.toBe(b)
  })

  it('keeps a colour stable when the label changes but the entity does not', () => {
    const before = colourOf({ name: 'Desmond', identity: 'chr_aaa' })
    const after = colourOf({ name: 'Desmond Cole', identity: 'chr_aaa' })
    expect(after).toBe(before)
  })

  it('falls back to the name so existing callers are unaffected', () => {
    expect(colourOf({ name: 'Desmond' })).toBe(colourOf({ name: 'Desmond', identity: '' }))
  })
})

describe('#5 — ProjectCard activate button is above its siblings', () => {
  const css = read('ProjectCard.svelte')

  it('gives the stretched button a stacking context above the cover and footer', () => {
    expect(rule(css, '.project__activate')).toMatch(/z-index:\s*1/)
  })

  // The shipped fix was inert because it ADDED z-index: 1 and left the original
  // z-index: 0 on the next line — later declarations win, so the computed value
  // stayed 0 and the card was still dead to a mouse. Tests could not see it:
  // programmatic .click() bypasses hit-testing.
  it('declares z-index exactly once, so no later declaration overrides it', () => {
    const decls = (rule(css, '.project__activate').match(/z-index\s*:/g) ?? []).length
    expect(decls, 'a duplicate z-index silently overrides the first').toBe(1)
  })

  it('keeps the actions above activate so their corner still wins', () => {
    // Was asserted on `.project__delete`, which owned its own positioning while
    // it was the only action. A second button pinned to the same corner would
    // have sat on top of it, so the row owns the placement now — and the row is
    // what has to outrank the stretched activate button.
    expect(rule(css, '.project__actions')).toMatch(/z-index:\s*2/)
  })
})

describe('#6 — the welcome window scrolls its story cards and its rail, each on its own', () => {
  const css = read('WelcomeWindow.svelte')

  it('makes the card grid and the rail the scroll regions', () => {
    for (const region of ['.welcome__cards', '.welcome__rail']) {
      const body = rule(css, region)
      expect(body, region).toMatch(/overflow-y:\s*auto/)
      // load-bearing: a grid or flex item will not shrink below its content without it,
      // so the cards would push past the window and drag the rail off the top
      expect(body, region).toMatch(/min-height:\s*0/)
    }
  })

  it('fills a bounded parent rather than growing to content', () => {
    expect(rule(css, '.welcome')).toMatch(/height:\s*100%/)
  })
})

// Adopting Ark's Editable and Avatar put two load-bearing CSS rules in the tree
// that nothing asserted.
//
// Both machines hide parts with the `hidden` ATTRIBUTE rather than by removing
// them — Editable keeps the preview and input mounted and toggles `hidden`, and
// Avatar does the same for the image and its fallback. The UA stylesheet's
// `[hidden] { display: none }` is beaten by the components' own
// `display: flex` / `display: block`, so without an explicit rule the hidden
// half renders anyway: the editor and the read-only prose visible at once, or
// the silhouette showing through the loaded portrait.
//
// The author's own comment says that bug "was caught by looking at it" — which
// is exactly the problem. jsdom resolves no stylesheets, so a rendered
// assertion passes whether the rule ships or not, and `build-storybook`
// compiles it either way. The next refactor that drops the rule gives a
// visibly broken component and a completely green suite.
describe('#36 — the [hidden] rules the Ark machines depend on', () => {
  it.each([
    ['EditableField.svelte', '.editable'],
    ['Portrait.svelte', '.portrait'],
  ])('%s ships a rule that actually hides [hidden]', (file, scope) => {
    const css = read(file)

    // Scoped :global, not a bare [hidden] — the parts are Ark's, so Svelte
    // scopes our classes off them and an unscoped rule would not apply.
    const match = css.match(
      new RegExp(`:global\\(\\${scope}\\s*\\[hidden\\]\\)\\s*\\{([^}]*)\\}`),
    )

    expect(match, `${file} has no :global(${scope} [hidden]) rule`).not.toBeNull()
    expect(match[1].replace(/\/\*[\s\S]*?\*\//g, '')).toMatch(/display:\s*none/)
  })
})

// Khaos App's quit prompt (first-run fixes A17) drew BEHIND the launcher's story cards, with no
// dimmed backdrop: ConfirmDialog declared no z-index, ProjectCard's layers declare 1-2 and Sheet's
// scrim 30, so a positioned card painted over a fixed, unstacked dialog. Found live; jsdom does
// not compute stacking, so this reads the source.
describe('ConfirmDialog stacks above the cards and sheets it confirms over', () => {
  const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')
  const declared = (css, cls) => {
    const m = strip(css).match(new RegExp(`:global\\(\\.${cls}\\)\\s*\\{([^}]*)\\}`))
    return [...(m ? m[1] : '').matchAll(/z-index:\s*(\d+)/g)].map((z) => Number(z[1]))
  }
  const highest = (css) => Math.max(0, ...[...strip(css).matchAll(/z-index:\s*(\d+)/g)].map((z) => Number(z[1])))
  const confirm = read('ConfirmDialog.svelte')
  const below = Math.max(highest(read('Sheet.svelte')), highest(read('ProjectCard.svelte')))

  it.each(['ui-confirm__backdrop', 'ui-confirm__positioner'])('%s declares one z-index above every Sheet and ProjectCard layer', (cls) => {
    const z = declared(confirm, cls)
    expect(z, `${cls} declares ${z.length} z-index`).toHaveLength(1)
    expect(z[0]).toBeGreaterThan(below)
  })
})

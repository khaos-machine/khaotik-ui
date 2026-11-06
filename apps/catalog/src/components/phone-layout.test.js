import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { fixtures } from '../fixtures.js'
import FixtureView from './shell/FixtureView.svelte'
import Toolbar from '@khaos-machine/khaotik-ui/components/svelte/Toolbar.svelte'

// Phone width (below 600px) shows one pane at a time. jsdom does no layout, so the
// widths are measured live; these hold the state the CSS reads. The phone-only buttons are
// display:none at jsdom's width, hence `hidden: true`.

// Toolbar's style rules, read from source because jsdom applies no CSS: each with its
// selectors, its declarations as [property, value], and whether it sits in the phone block.
const toolbarRules = () => {
  const source = readFileSync(`${import.meta.dirname}/../../../../components/svelte/Toolbar.svelte`, 'utf8')
  const style = source.slice(source.indexOf('<style>') + 7, source.indexOf('</style>')).replace(/\/\*[\s\S]*?\*\//g, '')
  const phoneAt = style.indexOf('@container (max-width: 599px)')
  return [...style.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    phone: phoneAt >= 0 && m.index > phoneAt,
    selectors: m[1].split(',').map((s) => s.trim()),
    declarations: m[2].split(';').map((d) => d.split(':')).filter((d) => d.length > 1).map(([p, ...v]) => [p.trim(), v.join(':').trim()]),
  }))
}

const example = (id) => {
  const fixture = fixtures.find((f) => f.id === id)
  return { component: fixture.component, props: fixture.examples[0].props }
}

describe('ScreenplayEditor at phone width', () => {
  it('Scenes shows the outline, and choosing one goes back to the script', async () => {
    const { component, props } = example('screenplay-editor')
    const { container } = render(component, { props })
    const writer = container.querySelector('.screenplay-editor__writer')
    expect(writer.dataset.pane).toBe('script')
    await fireEvent.click(screen.getByRole('button', { name: 'Scenes', hidden: true }))
    expect(writer.dataset.pane).toBe('outline')
    await fireEvent.click(screen.getByRole('button', { name: 'Title page' }))
    expect(writer.dataset.pane).toBe('script')
  })
})

describe('StoryPlayback at phone width', () => {
  it('opens the scene list as a sheet, and choosing a scene closes it', async () => {
    const { component, props } = example('story-playback')
    const { container } = render(component, { props })
    const main = container.querySelector('.ui-story-playback')
    expect(main.dataset.sheet).toBeUndefined()
    await fireEvent.click(screen.getByRole('button', { name: 'Scenes', hidden: true }))
    expect(main.dataset.sheet).toBe('scenes')
    await fireEvent.click(container.querySelector('.ui-story-playback__scene'))
    expect(main.dataset.sheet).toBeUndefined()
  })

  it('says nothing under a scene with no readings to choose from', () => {
    const { component, props } = example('story-playback')
    const { container } = render(component, { props: { ...props, segments: [{ kind: 'scene', sceneId: 's1', label: 'INT. ROOM - DAY', reads: [] }, { kind: 'scene', sceneId: 's2', label: 'EXT. ROOF - NIGHT', audio: {} }] } })
    const rows = [...container.querySelectorAll('.ui-story-playback__scene-label')]
    expect(rows.map((r) => r.querySelector('small')?.textContent ?? '')).toEqual(['', 'Read ready'])
  })

  it('its sheets close with their own Close', async () => {
    const { component, props } = example('story-playback')
    const { container } = render(component, { props })
    await fireEvent.click(screen.getByRole('button', { name: 'Scenes', hidden: true }))
    await fireEvent.click(screen.getByRole('button', { name: 'Close scenes', hidden: true }))
    expect(container.querySelector('.ui-story-playback').dataset.sheet).toBeUndefined()
  })
})

describe('StoryPlayer at phone width', () => {
  it('its fitted timeline seeks by share of the width, and reports the gesture once', async () => {
    const seeks = []
    let starts = 0
    let ends = 0
    const { component, props } = example('story-player')
    render(component, { props: { ...props, currentTime: 0, onSeek: (s) => seeks.push(s), onScrubStart: () => starts++, onScrubEnd: () => ends++ } })
    const bar = screen.getByRole('slider', { name: 'Position', hidden: true })
    const total = Number(bar.getAttribute('aria-valuemax'))
    bar.getBoundingClientRect = () => ({ left: 0, width: 200, top: 0, height: 20, right: 200, bottom: 20, x: 0, y: 0, toJSON() {} })
    await fireEvent.pointerDown(bar, { button: 0, pointerId: 1, clientX: 50 })
    await fireEvent.pointerMove(bar, { pointerId: 1, clientX: 100 })
    await fireEvent.pointerUp(bar, { pointerId: 1 })
    expect(seeks).toEqual([total / 4, total / 2])
    expect([starts, ends]).toEqual([1, 1])
  })

  it('opens upward into named scenes from one toggle', async () => {
    const { component, props } = example('story-player')
    const { container } = render(component, { props: { segments: props.segments.slice(0, 3) } })
    const toggle = screen.getByRole('button', { name: 'Show timeline', hidden: true })
    expect(container.querySelector('.player__mini-scene').textContent).toBe('')
    await fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('.player__mini-scene').textContent).not.toBe('')
  })
})

describe('ScreenplayEditor footnote', () => {
  it('keeps its default line, and an empty footnote leaves it out', () => {
    const { component, props } = example('screenplay-editor')
    const { unmount } = render(component, { props })
    expect(screen.getByText('Existing recordings and artwork are kept')).toBeInTheDocument()
    unmount()
    render(component, { props: { ...props, footnote: '' } })
    expect(screen.queryByText('Existing recordings and artwork are kept')).toBeNull()
  })
})

describe('One toolbar row at phone width', () => {
  it('Toolbar keeps the host tools in one group, so the row never splits them', () => {
    const fixture = fixtures.find((f) => f.id === 'toolbar')
    const { container } = render(FixtureView, { props: { fixture, example: fixture.examples.find((e) => e.label.includes('screenplay actions')) } })
    const groups = container.querySelectorAll('.toolbar__tools')
    expect(groups).toHaveLength(1)
    expect(groups[0].querySelectorAll('.ui-button')).toHaveLength(4)
  })

  it('ScreenplayActions part="edit" leaves out Discard, and the editor offers it in its outline', () => {
    const { component } = example('screenplay-actions')
    const { unmount } = render(component, { props: { dirty: 1, iconOnly: true, part: 'edit', onscenes: () => {} } })
    expect(screen.queryByRole('button', { name: 'Discard…' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
    unmount()
    const editor = example('screenplay-editor')
    const { container } = render(editor.component, { props: { ...editor.props, dirty: 1, actions: false } })
    expect(container.querySelector('.screenplay-editor__outline-discard')?.textContent).toContain('Discard…')
  })

  it('Toolbar never wraps its row, so a host may fix the bar at 52 and nothing falls below it', () => {
    // jsdom applies no CSS, so the rule is read from source. Measured in Chromium at 390: the
    // phone row wrapped the filter to a second line, the bar grew to 85 and the filter sat at
    // 51-81, over the admin's range row below its fixed 52px bar.
    const rules = toolbarRules()
    const declarations = rules.flatMap((r) => r.declarations)
    const wraps = declarations.filter(([p, v]) => (p === 'flex-wrap' || p === 'flex-flow') && /\bwrap\b/.test(v))
    expect(wraps, 'the row wraps').toEqual([])
    // The bar's own rule caps its height at 52: a floor alone lets anything grow it.
    const bar = rules.filter((r) => r.selectors.includes('.toolbar')).flatMap((r) => r.declarations)
    const heights = bar.filter(([p]) => /^(min-|max-)?height$/.test(p))
    expect(heights.filter(([p]) => p === 'height').map(([, v]) => v), 'the bar has no fixed height').toEqual(['52px'])
    expect(heights.filter(([p, v]) => p !== 'height' && v !== '52px'), 'a min- or max-height other than 52 overrides the cap').toEqual([])
    const phone = rules.filter((r) => r.phone)
    const filter = phone.filter((r) => r.selectors.includes('.toolbar__filter')).flatMap((r) => r.declarations)
    const floor = ['min-width', 'min(96px, calc(100% - 2 * var(--spacing-lg)))']
    expect(filter, 'the phone filter has no floor, so a short row squeezes it to nothing instead of folding labels').toContainEqual(floor)
    const compactFilter = phone.filter((r) => r.selectors.includes('.toolbar--compact .toolbar__filter')).flatMap((r) => r.declarations)
    expect(compactFilter, 'compact, the desktop 96px floor cannot sit clear of both fades in a narrow row').toContainEqual(floor)
    const row = phone.filter((r) => r.selectors.includes('.toolbar__main')).flatMap((r) => r.declarations)
    expect(row, 'a phone row that cannot wrap must scroll, or its pane toggles are cut off').toContainEqual(['overflow-x', 'auto'])
  })

  it('Toolbar gives a phone filter the room the spacer would take', () => {
    // Measured at 390 with a title, a command and the filter: a spacer still at flex 1 split
    // the free room with the filter, leaving 73px empty beside a filter at its 96px floor.
    const spacer = toolbarRules().filter((r) => r.phone && r.selectors.some((s) => /:has\(>\s*\.toolbar__filter\)\s*>\s*\.toolbar__spacer$/.test(s)))
    expect(spacer.flatMap((r) => r.declarations), 'the spacer still takes room beside the filter').toContainEqual(['flex', 'none'])
  })

  // jsdom does no layout, so a scrolling row's geometry is stubbed: 600px of content in 300.
  const scrolling = (el, at = 0) => {
    let left = at
    Object.defineProperty(el, 'scrollWidth', { configurable: true, get: () => 600 })
    Object.defineProperty(el, 'clientWidth', { configurable: true, get: () => 300 })
    Object.defineProperty(el, 'scrollLeft', { configurable: true, get: () => left, set: (v) => { left = v } })
    return el
  }
  const cut = (el) => [el.style.getPropertyValue('--toolbar-cut-start'), el.style.getPropertyValue('--toolbar-cut-end')]
  const adminRow = () => render(Toolbar, { props: { title: 'Khaos Cloud Admin', filter: '', filterLabel: 'Filter accounts', commands: [{ id: 'refresh', label: 'Refresh', icon: 'play' }] } }).container.querySelector('.toolbar__main')

  it('Toolbar fades only the side of the row that is cut off, and neither at rest', async () => {
    const row = adminRow()
    expect(cut(row), 'a row that fits shows a cue').toEqual(['0', '0'])
    scrolling(row, 0)
    await fireEvent.scroll(row)
    expect(cut(row), 'at the start').toEqual(['0', '1'])
    row.scrollLeft = 150
    await fireEvent.scroll(row)
    expect(cut(row), 'midway').toEqual(['1', '1'])
    row.scrollLeft = 300
    await fireEvent.scroll(row)
    expect(cut(row), 'at the end').toEqual(['1', '0'])
  })

  it('Toolbar turns a vertical wheel over the row sideways, and lets it go at the end', () => {
    const row = scrolling(adminRow(), 0)
    const wheel = (init) => { const e = new WheelEvent('wheel', { cancelable: true, bubbles: true, ...init }); row.dispatchEvent(e); return e.defaultPrevented }
    expect(wheel({ deltaY: 100 }), 'a vertical wheel was not taken').toBe(true)
    expect(row.scrollLeft).toBe(100)
    expect(cut(row)).toEqual(['1', '1'])
    expect(wheel({ deltaX: 40, deltaY: 10 }), 'a sideways gesture is the browser’s own').toBe(false)
    row.scrollLeft = 300
    expect(wheel({ deltaY: 100 }), 'at the end, the wheel must reach the page').toBe(false)
    expect(row.scrollLeft).toBe(300)
  })

  it('Toolbar scrolls a focused control clear of the fade on each side that is cut off', async () => {
    // Measured at 390 in Chromium: Source list focused at the row's end sat 9px clipped.
    // A 300px row over 600px of content (scrollable 0-300); the fade is 24px on a cut side.
    const rect = (left, width) => () => ({ left, right: left + width, width, top: 0, bottom: 44, height: 44, x: left, y: 0, toJSON() {} })
    const row = scrolling(adminRow(), 100)
    const filter = row.querySelector('.toolbar__filter')
    row.getBoundingClientRect = rect(0, 300)
    // Where the box sits after the scroll, and the fade zones then in force.
    const clear = (left, width, before) => {
      const at = row.scrollLeft
      const start = left + before - at
      return start >= (at > 0 ? 24 : 0) && start + width <= 300 - (at < 300 ? 24 : 0)
    }
    filter.getBoundingClientRect = rect(280, 44) // under the end fade
    await fireEvent.focusIn(filter)
    expect(row.scrollLeft, 'past the end fade: scrolled to sit just clear of it').toBe(148)
    expect(clear(280, 44, 100)).toBe(true)
    row.scrollLeft = 100
    filter.getBoundingClientRect = rect(10, 44) // under the start fade
    await fireEvent.focusIn(filter)
    expect(row.scrollLeft, 'past the start fade').toBe(86)
    expect(clear(10, 44, 100)).toBe(true)
    row.scrollLeft = 100
    filter.getBoundingClientRect = rect(130, 44) // already clear
    await fireEvent.focusIn(filter)
    expect(row.scrollLeft, 'a control already clear moves nothing').toBe(100)
    row.scrollLeft = 10
    filter.getBoundingClientRect = rect(-5, 44) // near the true start
    await fireEvent.focusIn(filter)
    expect(row.scrollLeft, 'at the true start there is no fade to clear').toBe(0)
    expect(clear(-5, 44, 10)).toBe(true)
    row.scrollLeft = 250
    filter.getBoundingClientRect = rect(290, 44) // near the true end
    await fireEvent.focusIn(filter)
    expect(row.scrollLeft, 'at the true end there is no fade to clear').toBe(300)
    expect(clear(290, 44, 250)).toBe(true)
  })

  it('Toolbar keeps the fade on while focus is in the row', () => {
    // K: "Keep the fade". No rule may lift the mask for focus: the cue stays, and the focused
    // control is scrolled clear of it instead.
    const source = readFileSync(`${import.meta.dirname}/../../../../components/svelte/Toolbar.svelte`, 'utf8')
    const { css } = compile(source, { filename: 'Toolbar.svelte', css: 'external' })
    const code = css.code.replace(/\/\*[\s\S]*?\*\//g, '')
    const masks = [...code.matchAll(/([^{}]+)\{([^{}]*mask-image[^{}]*)\}/g)]
    expect(masks.length, 'no mask rule left').toBeGreaterThan(0)
    for (const [, selector, body] of masks) {
      expect(body, `${selector.trim()} drops the mask`).not.toMatch(/mask-image:\s*none/)
      expect(selector, `${selector.trim()} masks by focus`).not.toMatch(/focus/)
    }
  })

  it('Toolbar brings a focused segment into view by the segment, not its 1px radio', async () => {
    // Measured at 320: the switcher's focus lands on a hidden radio one pixel wide, so scrolling
    // to it left the segment the user sees half out of the row.
    const rect = (left, width) => () => ({ left, right: left + width, width, top: 0, bottom: 44, height: width > 1 ? 44 : 1, x: left, y: 0, toJSON() {} })
    const modes = [{ value: 'story', label: 'Story' }, { value: 'cast', label: 'Cast' }]
    const { container } = render(Toolbar, { props: { title: 'BROKEN IN 4 PLACES', modes, mode: 'story', width: 1200, filter: '' } })
    const row = scrolling(container.querySelector('.toolbar__main'), 100)
    const radio = row.querySelector('input[type="radio"]')
    const segment = radio.closest('label')
    expect(segment, 'the switcher no longer wraps its radio in a label').toBeTruthy()
    row.getBoundingClientRect = rect(0, 300)
    radio.getBoundingClientRect = rect(300, 1)
    segment.getBoundingClientRect = rect(280, 80)
    await fireEvent.focusIn(radio)
    expect(row.scrollLeft, 'scrolled to the radio, not the segment').toBe(100 + 360 - (300 - 24))
  })

  it('Toolbar gives way in the status, not the title: its message truncates, its controls stay whole', () => {
    // K: "Status gives way". Measured at 320: a failure message, Retry and the gear took 244px
    // and left the row 44px, under the title's 96px floor. The message is host markup, so the
    // rules reach it with `:global`; compiled, a scoped selector would carry `.svelte-x` and
    // never match it.
    const source = readFileSync(`${import.meta.dirname}/../../../../components/svelte/Toolbar.svelte`, 'utf8')
    const { css } = compile(source, { filename: 'Toolbar.svelte', css: 'external' })
    const code = css.code.replace(/\/\*[\s\S]*?\*\//g, '')
    const phone = code.slice(code.indexOf('@container (max-width: 599px)'))
    const rule = (re) => [...phone.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, s]) => re.test(s.trim())).map(([, s, b]) => [s.trim(), b])
    const [status] = rule(/^\.toolbar__status\.svelte-[a-z0-9]+$/)
    expect(status?.[1], 'the status group does not shrink').toMatch(/flex:\s*0 1 auto/)
    expect(status?.[1]).toMatch(/min-width:\s*0/)
    const [message] = rule(/^\.toolbar__status\.svelte-[a-z0-9]+ > :not\(/)
    expect(message, 'no rule truncates the status message').toBeTruthy()
    expect(message[0].split('>')[1], 'the message rule is scoped, so it never matches host markup').not.toMatch(/svelte-/)
    for (const control of ['button', 'a', 'input', 'select', "[role='button']", '.ui-button']) expect(message[0], `${control} would truncate`).toContain(control)
    expect(message[1]).toMatch(/text-overflow:\s*ellipsis/)
    const [row] = rule(/^\.toolbar__main\.svelte-[a-z0-9]+$/).filter(([, b]) => /min-width/.test(b))
    expect(row?.[1], 'the row has no floor, so the status takes the title').toMatch(/min-width:\s*calc\(2 \* var\(--spacing-2xl\) \+ var\(--spacing-lg\)\)/)
  })

  it('Toolbar gives the host tools the same cue', async () => {
    const fixture = fixtures.find((f) => f.id === 'toolbar')
    const { container } = render(FixtureView, { props: { fixture, example: fixture.examples.find((e) => e.label.includes('four lenses')) } })
    const tools = scrolling(container.querySelector('.toolbar__tools'), 300)
    await fireEvent.scroll(tools)
    expect(cut(tools)).toEqual(['1', '0'])
    const masked = toolbarRules().filter((r) => r.phone && r.selectors.includes('.toolbar__main > .toolbar__tools'))
    expect(masked.flatMap((r) => r.declarations).map(([p]) => p), 'the tools fade nowhere').toContain('mask-image')
  })

  it('Toolbar keeps a readable title at phone width and its full accessible name', () => {
    const title = 'Khaos Cloud Administration and Usage'
    const { container } = render(Toolbar, { props: { title, filter: '' } })
    expect(container.querySelector('.toolbar').getAttribute('aria-label')).toBe(title)
    expect(container.querySelector('.toolbar__heading').textContent).toBe(title)
    const floor = toolbarRules().filter((r) => r.phone && r.selectors.includes('.toolbar__title')).flatMap((r) => r.declarations)
    expect(floor, 'the title can truncate to nothing').toContainEqual(['min-width', 'calc(2 * var(--spacing-2xl))'])
  })

  it('Toolbar with no title draws no title cell', () => {
    const { component } = example('toolbar')
    const { container } = render(component, { props: { modes: [{ value: 'a', label: 'A' }], mode: 'a', filter: null } })
    expect(container.querySelector('.toolbar__title')).toBeNull()
  })

  it('StoryPlayback opens a sheet from the host, and draws no stage icons when told', () => {
    const { component, props } = example('story-playback')
    const { container } = render(component, { props: { ...props, sheet: 'scenes', sheetButtons: false } })
    expect(container.querySelector('.ui-story-playback').dataset.sheet).toBe('scenes')
    expect(container.querySelector('.ui-story-playback__phone-bar')).toBeNull()
  })

  it('ScreenplayEditor shows the pane it is given, and leaves its actions to the host', () => {
    const { component, props } = example('screenplay-editor')
    const { container } = render(component, { props: { ...props, pane: 'outline', actions: false } })
    expect(container.querySelector('.screenplay-editor__writer').dataset.pane).toBe('outline')
    expect(screen.queryByRole('button', { name: 'Undo', hidden: true })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Scenes', hidden: true })).toBeNull()
  })

  it('ScreenplayActions, icons only, keeps every name and confirms Discard', async () => {
    let discarded = 0
    let scenes = 0
    const { component } = example('screenplay-actions')
    render(component, { props: { dirty: 1, canUndo: true, iconOnly: true, onscenes: () => scenes++, ondiscard: () => discarded++ } })
    for (const name of ['Scenes', 'Undo', 'Redo', 'Discard…', 'Save']) expect(screen.getByRole('button', { name })).toBeTruthy()
    await fireEvent.click(screen.getByRole('button', { name: 'Scenes' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Discard…' }))
    expect(discarded).toBe(0)
    await fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }))
    expect([scenes, discarded]).toEqual([1, 1])
  })
})

describe('WorkspaceSwitcher pop-up', () => {
  it('is sized by the chosen label, not the longest option', () => {
    const { component } = example('toolbar')
    const modes = [{ value: 'data', label: 'Data' }, { value: 'screenplay', label: 'Screenplay' }]
    const { container } = render(component, { props: { modes, mode: 'data', width: 390, compactBelow: 560, filter: null } })
    expect(container.querySelector('.switcher__sizer').textContent).toBe('Data')
  })
})

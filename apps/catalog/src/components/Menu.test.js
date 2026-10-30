import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import { tick } from 'svelte'
import Menu from '@khaos-machine/khaotik-ui/components/svelte/Menu.svelte'

// Every behaviour here is driven through zag — a real keydown or click on the
// element zag listens to — never asserted from markup alone. zag stamps the
// state (`aria-expanded`, `aria-activedescendant`, `aria-checked`) and these
// tests read it back, so a green result means the state machine did the thing.
//
// Every "cannot" has a positive control in the same setup: a keydown that
// opens nothing proves nothing unless the same keydown, without the guard,
// opens the menu.

const voices = [
  { value: 'alloy', label: 'Alloy', group: 'OpenAI', groupMark: 'openai' },
  { value: 'ash', label: 'Ash', group: 'OpenAI', groupMark: 'openai' },
  { value: 'bella', label: 'Bella', group: 'KittenTTS', groupMark: 'kittentts', unavailable: true, reason: 'stopped' },
  { value: 'adam', label: 'Adam', group: 'ElevenLabs', groupMark: 'elevenlabs', unavailable: true },
]

const trigger = () => document.querySelector('[data-part="trigger"]')
const content = () => document.querySelector('[data-part="content"]')
const items = () => [...document.querySelectorAll('[data-part="item"]')]
const item = (label) => {
  const found = items().filter(
    (el) => el.querySelector('[data-part="item-text"]')?.textContent.trim() === label,
  )
  if (found.length !== 1) throw new Error(`expected one item labelled "${label}", found ${found.length}`)
  return found[0]
}
const expanded = () => trigger().getAttribute('aria-expanded')
const active = () => content().getAttribute('aria-activedescendant')

async function key(el, k) {
  await fireEvent.keyDown(el, { key: k })
  await tick()
}

async function openByKeyboard() {
  trigger().focus()
  await key(trigger(), 'ArrowDown')
  await waitFor(() => expect(expanded()).toBe('true'))
}

// Home, then ArrowDown until `label` is the active descendant.
async function arrowTo(label) {
  const target = item(label).id
  await key(content(), 'Home')
  for (let i = 0; i < items().length && active() !== target; i++) {
    await key(content(), 'ArrowDown')
  }
  expect(active(), `arrowed to "${label}"`).toBe(target)
}

describe('Menu — unavailable items (C1)', () => {
  it('A1: an unavailable item is reachable by arrow and describes its reason', async () => {
    render(Menu, { props: { label: 'Voice', value: 'alloy', items: voices } })
    await openByKeyboard()

    await arrowTo('Bella')

    expect(active()).toBe(item('Bella').id)
    expect(item('Bella')).toHaveAccessibleDescription('stopped')
  })

  it('A2 (Enter): Enter on an unavailable item selects nothing and keeps the menu open; an enabled one selects and closes', async () => {
    const onselect = vi.fn()
    render(Menu, { props: { label: 'Voice', value: 'alloy', items: voices, onselect } })
    await openByKeyboard()

    await arrowTo('Bella')
    expect(active(), 'Bella is highlighted before Enter').toBe(item('Bella').id)
    await key(content(), 'Enter')
    await tick()
    expect(onselect).not.toHaveBeenCalled()
    expect(expanded()).toBe('true')

    // control
    await arrowTo('Ash')
    await key(content(), 'Enter')
    await waitFor(() => expect(onselect).toHaveBeenCalledWith('ash'))
    await waitFor(() => expect(expanded()).toBe('false'))
  })

  it('A2 (click): clicking an unavailable item selects nothing and keeps the menu open; an enabled one selects', async () => {
    const onselect = vi.fn()
    render(Menu, { props: { label: 'Voice', value: 'alloy', items: voices, onselect } })
    await fireEvent.click(trigger())
    await waitFor(() => expect(expanded()).toBe('true'))

    await fireEvent.click(item('Bella'))
    await tick()
    expect(onselect).not.toHaveBeenCalled()
    expect(expanded()).toBe('true')

    // control
    await fireEvent.click(item('Ash'))
    await waitFor(() => expect(onselect).toHaveBeenCalledWith('ash'))
  })
})

describe('Menu — controlled value (C2)', () => {
  it('A3: a rejected save across two groups leaves exactly one check, on the old value', async () => {
    const onselect = vi.fn()
    const list = [
      { value: 'a', label: 'Alpha', group: 'One' },
      { value: 'b', label: 'Bravo', group: 'Two' },
    ]
    render(Menu, { props: { label: 'Voice', value: 'a', items: list, onselect } })
    await fireEvent.click(trigger())
    await waitFor(() => expect(expanded()).toBe('true'))

    await fireEvent.click(item('Bravo'))
    await waitFor(() => expect(onselect).toHaveBeenCalledWith('b'))
    await tick()

    const checked = document.querySelectorAll('[aria-checked="true"]')
    expect(checked).toHaveLength(1)
    expect(checked[0]).toBe(item('Alpha'))
  })
})

describe('Menu — groups', () => {
  const defaults = [
    { value: 'fal/', label: 'Default', group: 'fal' },
    { value: 'fal/flux', label: 'Flux', group: 'fal' },
    { value: 'khaos-synth/', label: 'Default', group: 'Khaos Synth' },
    { value: 'khaos-synth/kokoro', label: 'Kokoro', group: 'Khaos Synth' },
  ]
  const inGroup = (el) =>
    document.getElementById(el.closest('[role="group"]')?.getAttribute('aria-labelledby') ?? '')
      ?.textContent.trim()

  it('A4: two composed defaults are each reachable and only the current one is checked', async () => {
    render(Menu, { props: { label: 'Model', value: 'khaos-synth/', items: defaults } })
    await openByKeyboard()

    const all = items()
    const ids = all.map((el) => el.id)
    await key(content(), 'Home')
    const seen = [active()]
    for (let i = 1; i < all.length; i++) {
      await key(content(), 'ArrowDown')
      seen.push(active())
    }
    // on and off each default, in order
    expect(seen).toEqual(ids)

    const checked = document.querySelectorAll('[aria-checked="true"]')
    expect(checked).toHaveLength(1)
    expect(checked[0].querySelector('[data-part="item-text"]').textContent.trim()).toBe('Default')
    expect(inGroup(checked[0])).toBe('Khaos Synth')
    expect(inGroup(all[0])).toBe('fal')
  })

  it('A4b: a literal "" item value is a real value; "" matching nothing shows currentLabel', async () => {
    const onselect = vi.fn()
    const list = [
      { value: '', label: 'Provider default' },
      { value: 'x', label: 'Xylo' },
    ]
    const { unmount } = render(Menu, { props: { label: 'Model', value: '', items: list, onselect } })
    expect(trigger()).toHaveAccessibleName('Model: Provider default')
    await fireEvent.click(trigger())
    await waitFor(() => expect(expanded()).toBe('true'))
    await fireEvent.click(item('Xylo'))
    await waitFor(() => expect(onselect).toHaveBeenCalledWith('x'))
    unmount()

    render(Menu, {
      props: { label: 'Model', value: '', currentLabel: 'Echo', items: [{ value: 'x', label: 'Xylo' }] },
    })
    expect(trigger()).toHaveAccessibleName('Model: Echo')
  })

  it('A5: duplicate values throw an error naming the value; distinct values render', () => {
    expect(() =>
      render(Menu, {
        props: { items: [{ value: 'openai/alloy', label: 'A', group: 'x' }, { value: 'openai/alloy', label: 'B', group: 'y' }] },
      }),
    ).toThrow(/Menu: duplicate item value "openai\/alloy"/)

    // control
    render(Menu, { props: { items: [{ value: 'openai/alloy', label: 'A' }, { value: 'openai/ash', label: 'B' }] } })
    expect(items()).toHaveLength(2)
  })

  it('A8: a named group is labelled by its heading; the unlabelled group carries no dangling reference', () => {
    const everyLabelledbyResolves = () => {
      for (const el of document.querySelectorAll('[aria-labelledby]')) {
        for (const id of el.getAttribute('aria-labelledby').split(/\s+/)) {
          expect(document.getElementById(id), `aria-labelledby="${id}" resolves`).not.toBeNull()
        }
      }
    }

    const { unmount } = render(Menu, { props: { label: 'Voice', items: voices } })
    const groups = [...document.querySelectorAll('[role="group"]')]
    expect(groups.map((g) => document.getElementById(g.getAttribute('aria-labelledby'))?.textContent.trim())).toEqual([
      'OpenAI',
      'KittenTTS',
      'ElevenLabs',
    ])
    everyLabelledbyResolves()
    unmount()

    render(Menu, { props: { label: 'Voice', items: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] } })
    const plain = document.querySelectorAll('[role="group"]')
    expect(plain).toHaveLength(1)
    expect(plain[0].hasAttribute('aria-labelledby')).toBe(false)
    everyLabelledbyResolves()
  })
})

describe('Menu — whole control disabled (M3)', () => {
  const opens = [
    ['click', (t) => fireEvent.click(t)],
    ['Enter', (t) => key(t, 'Enter')],
    ['Space', (t) => key(t, ' ')],
    ['ArrowDown', (t) => key(t, 'ArrowDown')],
  ]

  it('A6: a disabled trigger is announced disabled, opens on nothing, and lets Tab through', async () => {
    render(Menu, { props: { label: 'Voice', value: 'alloy', items: voices, disabled: true } })
    expect(trigger()).toHaveAttribute('aria-disabled', 'true')

    for (const [name, act] of opens) {
      trigger().focus()
      await act(trigger())
      await tick()
      expect(expanded(), `${name} leaves it closed`).toBe('false')
    }

    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    trigger().dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
  })

  it.each(opens)('A6 control: %s opens the same menu when not disabled', async (_, act) => {
    render(Menu, { props: { label: 'Voice', value: 'alloy', items: voices } })
    expect(expanded()).toBe('false')
    trigger().focus()
    await act(trigger())
    await waitFor(() => expect(expanded()).toBe('true'))
  })

  it('A12: disabling while open discards a click on an enabled item', async () => {
    const onselect = vi.fn()
    const { rerender } = render(Menu, { props: { label: 'Voice', value: 'alloy', items: voices, onselect } })
    await fireEvent.click(trigger())
    await waitFor(() => expect(expanded()).toBe('true'))

    await rerender({ label: 'Voice', value: 'alloy', items: voices, onselect, disabled: true })
    await fireEvent.click(item('Ash'))
    await tick()
    expect(onselect).not.toHaveBeenCalled()
  })
})

describe('Menu — focus, trigger text, keys, typeahead', () => {
  it('A7: after choosing an enabled item, focus is back on the trigger', async () => {
    render(Menu, { props: { label: 'Voice', value: 'alloy', items: voices, onselect: () => {} } })
    await openByKeyboard()
    await arrowTo('Ash')
    await key(content(), 'Enter')
    await waitFor(() => expect(document.activeElement).toBe(trigger()))
  })

  it('A9: an unavailable current value names its reason on the trigger and is still the checked item', async () => {
    render(Menu, { props: { label: 'Voice', value: 'bella', items: voices } })
    expect(trigger()).toHaveAccessibleName('Voice: Bella, unavailable: stopped')

    await fireEvent.click(trigger())
    await waitFor(() => expect(expanded()).toBe('true'))
    expect(item('Bella')).toHaveAttribute('aria-checked', 'true')
  })

  it('A9b: an unavailable current value with no reason still says unavailable on the trigger (G2)', async () => {
    render(Menu, { props: { label: 'Voice', value: 'adam', items: voices } })
    expect(trigger()).toHaveAccessibleName('Voice: Adam, unavailable')

    await fireEvent.click(trigger())
    await waitFor(() => expect(expanded()).toBe('true'))
    expect(item('Adam')).toHaveAttribute('aria-checked', 'true')
  })

  it('A10: the highlighted item survives an insertion above it', async () => {
    const onselect = vi.fn()
    const before = [
      { value: 'a', label: 'Alpha' },
      { value: 'x', label: 'Xray' },
    ]
    const { rerender } = render(Menu, { props: { label: 'L', value: 'a', items: before, onselect } })
    await openByKeyboard()
    await arrowTo('Xray')

    await rerender({ label: 'L', value: 'a', items: [before[0], { value: 'n', label: 'New' }, before[1]], onselect })
    await key(content(), 'Enter')
    await waitFor(() => expect(onselect).toHaveBeenCalledWith('x'))
  })

  it('A11: typeahead matches the visible label, not the value', async () => {
    const list = [
      { value: 'vp_01', label: 'Alloy' },
      { value: 'vp_02', label: 'Zephyr' },
      { value: 'vp_03', label: 'Nova' },
    ]
    render(Menu, { props: { label: 'Voice', value: 'vp_01', items: list } })
    await openByKeyboard()

    await key(content(), 'z')
    await waitFor(() => expect(active()).toBe(item('Zephyr').id))
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import Button from '@khaos-machine/khaotik-ui/components/svelte/Button.svelte'

// #237 — the kit's Button, as specified in khaos-app's review-surface design
// (`docs/design/review-surface-217.md`, §8). Its first caller is the review
// surface's verdict row, where Bind stays disabled until an answer is chosen and
// a keyboard user must still be able to reach it and hear the hint saying why.

const label = (text) => createRawSnippet(() => ({ render: () => `<span>${text}</span>` }))

const SOURCE = readFileSync(join(process.cwd(), '../../components/svelte/Button.svelte'), 'utf8')

/** The declarations of the first rule whose selector contains `selector`. */
function ruleBody(selector) {
  const at = SOURCE.indexOf(selector)
  expect(at, `no rule for ${selector}`).toBeGreaterThan(-1)
  return SOURCE.slice(SOURCE.indexOf('{', at) + 1, SOURCE.indexOf('}', at))
}

describe('a disabled Button stays reachable and does nothing (§8, K1)', () => {
  it('is focusable — aria-disabled, never the native disabled attribute', () => {
    // A natively disabled button leaves the Tab order, so the hint explaining why
    // Bind is unavailable would never be heard (§7, "Disabled verdict").
    render(Button, { props: { disabled: true, children: label('Bind') } })
    const button = screen.getByRole('button', { name: 'Bind' })

    expect(button).not.toHaveAttribute('disabled')
    button.focus()
    expect(button).toHaveFocus()
  })

  it('reports aria-disabled="true"', () => {
    render(Button, { props: { disabled: true, children: label('Bind') } })
    expect(screen.getByRole('button', { name: 'Bind' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not call onclick on click', async () => {
    const onclick = vi.fn()
    render(Button, { props: { disabled: true, onclick, children: label('Bind') } })

    await fireEvent.click(screen.getByRole('button', { name: 'Bind' }))
    expect(onclick).not.toHaveBeenCalled()
  })

  it('does not call onclick on Enter or Space', async () => {
    // jsdom does not perform a button's keyboard activation, so this replays what
    // a browser does: Enter activates on keydown, Space on keyup, and both
    // activations arrive as a click. The guard under test is the one every
    // activation routes through — remove it and this goes red with the click test.
    const onclick = vi.fn()
    render(Button, { props: { disabled: true, onclick, children: label('Bind') } })
    const button = screen.getByRole('button', { name: 'Bind' })
    button.focus()

    await fireEvent.keyDown(button, { key: 'Enter' })
    await fireEvent.click(button, { detail: 0 })
    await fireEvent.keyDown(button, { key: ' ' })
    await fireEvent.keyUp(button, { key: ' ' })
    await fireEvent.click(button, { detail: 0 })

    expect(onclick).not.toHaveBeenCalled()
  })

  it('does not submit a form when type="submit"', async () => {
    // A guard that skipped onclick but let the click through would still post the
    // form a submit button sits in.
    const onsubmit = vi.fn((e) => e.preventDefault())
    const form = document.createElement('form')
    form.addEventListener('submit', onsubmit)
    document.body.append(form)
    render(Button, { target: form, props: { type: 'submit', disabled: true, children: label('Save') } })

    await fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onsubmit).not.toHaveBeenCalled()
    form.remove()
  })
})

describe('an enabled Button', () => {
  it('calls onclick with the event', async () => {
    const onclick = vi.fn()
    render(Button, { props: { onclick, children: label('Check again') } })

    await fireEvent.click(screen.getByRole('button', { name: 'Check again' }))
    expect(onclick).toHaveBeenCalledOnce()
    expect(onclick.mock.calls[0][0]).toBeInstanceOf(MouseEvent)
  })

  it('does not report aria-disabled', () => {
    render(Button, { props: { children: label('Check again') } })
    expect(screen.getByRole('button', { name: 'Check again' })).not.toHaveAttribute('aria-disabled')
  })

  it('is type="button" unless told otherwise, so it never submits by accident', () => {
    render(Button, { props: { children: label('Bind') } })
    expect(screen.getByRole('button', { name: 'Bind' })).toHaveAttribute('type', 'button')
  })

  it('takes type="submit"', () => {
    render(Button, { props: { type: 'submit', children: label('Save') } })
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit')
  })

  it('passes describedby through as aria-describedby', () => {
    render(Button, { props: { describedby: 'review-hint', children: label('Bind') } })
    expect(screen.getByRole('button', { name: 'Bind' })).toHaveAttribute('aria-describedby', 'review-hint')
  })

  it('draws a leading icon that is not part of its name', () => {
    render(Button, { props: { icon: 'arrow-clockwise', children: label('Check again') } })
    const button = screen.getByRole('button', { name: 'Check again' })
    const glyph = button.querySelector('.ph-arrow-clockwise')

    expect(glyph).not.toBeNull()
    expect(glyph).toHaveAttribute('aria-hidden', 'true')
    expect(button.firstElementChild).toBe(glyph)
  })

  it('draws no icon when given none', () => {
    render(Button, { props: { children: label('Bind') } })
    expect(screen.getByRole('button', { name: 'Bind' }).querySelector('.ph')).toBeNull()
  })
})

describe('Button variants', () => {
  it('is secondary unless told otherwise', () => {
    render(Button, { props: { children: label('Refuse') } })
    expect(screen.getByRole('button', { name: 'Refuse' }).dataset.variant).toBe('secondary')
  })

  it.each(['primary', 'secondary', 'text'])('carries variant="%s" as data', (variant) => {
    render(Button, { props: { variant, children: label('Go') } })
    expect(screen.getByRole('button', { name: 'Go' }).dataset.variant).toBe(variant)
  })

  // jsdom resolves no stylesheets, so whether primary is drawn in the primary
  // action tokens is a fact only the source can answer (RULES.md, "Testing and
  // delivery", class 1).
  it('renders variant="primary" in the primary action tokens', () => {
    const body = ruleBody("[data-variant='primary']")
    expect(body).toMatch(/background:\s*var\(--action-primary\)/)
    expect(body).toMatch(/color:\s*var\(--action-on-primary\)/)
    expect(body).toMatch(/border-color:\s*var\(--action-primary-border\)/)
  })

  it('draws a disabled primary in the disabled action tokens, not the amber', () => {
    const body = ruleBody("[data-variant='primary'][aria-disabled='true']")
    expect(body).toMatch(/background:\s*var\(--action-disabled\)/)
    expect(body).toMatch(/color:\s*var\(--action-on-disabled\)/)
  })

  it('uses tokens only — no literal colour anywhere in its styles', () => {
    const style = SOURCE.slice(SOURCE.indexOf('<style>'))
    expect(style).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/)
  })
})


it('provides a named compact tool with a tooltip and the same disabled guard',async()=>{
 const onclick=vi.fn()
 render(Button,{props:{variant:'tool',icon:'scissors',title:'Split shot at playhead',children:label('Split'),disabled:true,onclick}})
 const button=screen.getByRole('button',{name:'Split'})
 expect(button).toHaveAttribute('data-variant','tool')
 expect(button).toHaveAttribute('title','Split shot at playhead')
 expect(button.querySelector('.ph-scissors')).not.toBeNull()
 await fireEvent.click(button)
 expect(onclick).not.toHaveBeenCalled()
})

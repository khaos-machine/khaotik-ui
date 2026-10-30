import { describe, it, expect, vi } from 'vitest'
import { createRawSnippet } from 'svelte'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ConfirmDialog from '@khaos-machine/khaotik-ui/components/svelte/ConfirmDialog.svelte'

// #26 — khaos-app's first permitted mutation is project delete, and its ADR-0007
// rule 2 requires the confirmation to NAME its target: "Delete Heart of an
// Indie?", never "Delete this project?".
//
// That is the assertion that matters most here. A modal that does not say what
// it will destroy asks the reader to trust their own memory of what they
// selected — and catching the case where that memory is wrong is the entire
// reason the step exists.

describe('ConfirmDialog names what it will act on', () => {
  it('builds the question from the target', () => {
    render(ConfirmDialog, { props: { open: true, action: 'Delete', target: 'Heart of an Indie' } })
    expect(screen.getByText('Delete Heart of an Indie?')).toBeInTheDocument()
  })

  it('renders a long target whole rather than eliding it', () => {
    // The name is the load-bearing part; a confirmation that truncates the thing
    // it names defeats itself. Overflow is handled by wrapping, not clipping.
    const target = 'Heart of an Indie: Ignited by Story Intelligence'
    render(ConfirmDialog, { props: { open: true, target } })
    expect(screen.getByText(`Delete ${target}?`)).toBeInTheDocument()
  })

  it('degrades to a bare question rather than saying "this project"', () => {
    // With no target there is nothing honest to name, so it asks the plain
    // question instead of inventing a vague referent.
    render(ConfirmDialog, { props: { open: true, action: 'Discard', target: '' } })
    expect(screen.getByText('Discard?')).toBeInTheDocument()
  })

  it('is not in the document when closed', () => {
    render(ConfirmDialog, { props: { open: false, target: 'Heart of an Indie' } })
    expect(screen.queryByText('Delete Heart of an Indie?')).toBeNull()
  })
})

describe('ConfirmDialog reports intent without acting', () => {
  it('reports a confirm', async () => {
    const onConfirm = vi.fn()
    render(ConfirmDialog, { props: { open: true, target: 'Breaking Even', onConfirm } })

    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('stays open after confirming, so a failed mutation can say why', () => {
    // `open` is the consumer's state. A dialog that closed itself on confirm
    // would take the failure message down with it — and a delete that fails is
    // exactly when the reader most needs the dialog still there.
    const { container } = render(ConfirmDialog, { props: { open: true, target: 'Breaking Even', onConfirm: () => {} } })
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(container.ownerDocument.body.textContent).toContain('Delete Breaking Even?')
  })

  it('reports a cancel', async () => {
    const onCancel = vi.fn()
    render(ConfirmDialog, { props: { open: true, target: 'Breaking Even', onCancel } })

    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('does not throw with no handlers at all', async () => {
    render(ConfirmDialog, { props: { open: true, target: 'Breaking Even' } })
    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Delete Breaking Even?')).toBeInTheDocument()
  })
})

describe('ConfirmDialog carries the adopted behaviour', () => {
  it('is an alertdialog, so it interrupts rather than waiting its turn', () => {
    render(ConfirmDialog, { props: { open: true, target: 'Breaking Even' } })
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('labels itself by its own question', () => {
    // Ark wires aria-labelledby from DialogTitle. Asserted because a modal whose
    // accessible name is empty announces as "dialog" and nothing else.
    render(ConfirmDialog, { props: { open: true, target: 'Breaking Even' } })
    expect(screen.getByRole('alertdialog', { name: /Delete Breaking Even\?/ })).toBeInTheDocument()
  })

  it('describes itself from the description when one is given', () => {
    render(ConfirmDialog, {
      props: { open: true, target: 'Breaking Even', description: 'The .kspd file is removed from disk. This cannot be undone.' },
    })
    expect(screen.getByText(/cannot be undone/)).toBeInTheDocument()
  })

  it('puts cancel before confirm in the DOM, so focus lands on the safe choice', () => {
    render(ConfirmDialog, { props: { open: true, target: 'Breaking Even' } })
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    const confirm = screen.getByRole('button', { name: 'Delete' })
    expect(cancel.compareDocumentPosition(confirm) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('routes every close through one pipeline, reporting both callbacks', async () => {
    // Cancel is a DialogCloseTrigger, so it dismisses the same way Escape and a
    // backdrop click do. That is what this asserts: one close path, and a
    // consumer wiring only `onOpenChange` or only `onCancel` still hears about
    // it. A dialog with two close paths is how `open` gets stuck true after
    // Escape while the Cancel button appears to work.
    //
    // Escape itself is not simulated: zag binds it inside its dismissable layer
    // and a jsdom-dispatched keydown never reaches that listener. It is the
    // primitive's behaviour, adopted deliberately (D39/D50) — what is ours is
    // that both callbacks fire when a close arrives, which the cancel path
    // exercises end to end.
    const onOpenChange = vi.fn()
    const onCancel = vi.fn()
    render(ConfirmDialog, { props: { open: true, target: 'Breaking Even', onOpenChange, onCancel } })

    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onCancel).toHaveBeenCalled()
  })
})

describe('ConfirmDialog treats the destructive action as the destructive one', () => {
  const root = () => screen.getByRole('alertdialog')

  it('defaults to danger, because that is what a confirmation is for', () => {
    render(ConfirmDialog, { props: { open: true, target: 'Breaking Even' } })
    expect(root().dataset.tone).toBe('danger')
  })

  it('can be told otherwise', () => {
    render(ConfirmDialog, { props: { open: true, target: 'Breaking Even', action: 'Publish', tone: 'default' } })
    expect(root().dataset.tone).toBe('default')
  })

  it('labels the confirm button with the verb, not with "OK"', () => {
    // "OK" on a destructive confirm makes the dangerous button the agreeable
    // one. The verb is what the reader is agreeing to.
    render(ConfirmDialog, { props: { open: true, action: 'Discard', target: 'draft' } })
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^OK$/i })).toBeNull()
  })
})

// The class forwarding trap, checked by SOURCE READ because jsdom resolves no
// stylesheets — a rendered assertion passes whether or not the rule survives
// compilation.
//
// Cancel is a DialogCloseTrigger: Ark renders that element, so it never carries
// Svelte's scope hash. A scoped `.ui-confirm__cancel` compiles away and the
// dialog ships with two buttons that look nothing alike. The catalog's
// AGENTS.md lists this under "Svelte 5 gotchas (each cost a rebuild)".
describe('the styles that reach Ark-rendered elements are :global', () => {
  const source = readFileSync(
    join(import.meta.dirname, '../../../..', 'components/svelte/ConfirmDialog.svelte'),
    'utf8',
  )
  const styles = (source.match(/<style>([\s\S]*)<\/style>/)?.[1] ?? '').replace(/\/\*[\s\S]*?\*\//g, '')

  // Every class handed to an Ark component in the markup.
  it.each([
    'ui-confirm__backdrop',
    'ui-confirm__positioner',
    'ui-confirm',
    'ui-confirm__title',
    'ui-confirm__description',
    'ui-confirm__cancel',
  ])('%s is styled globally', (cls) => {
    const scopedOnly = new RegExp(`(^|[^(\\w-])\\.${cls}[^\\w-][^{]*\\{`, 'm')
    const globalRule = new RegExp(`:global\\([^)]*\\.${cls}\\b`)

    expect(styles, `.${cls} is forwarded to an Ark element and must be :global`).toMatch(globalRule)
    // And no bare scoped rule for it, which would compile away silently.
    const bare = styles.split('\n').filter((l) => scopedOnly.test(l) && !l.includes(':global'))
    expect(bare).toEqual([])
  })

  it('styles the descendant button globally as well', () => {
    // `.ui-confirm__actions button` would match the confirm button and miss the
    // cancel one — the worst version, because it looks like it works.
    expect(styles).toMatch(/:global\(\.ui-confirm__actions button\)/)
  })
})

// Visual order, source-read: jsdom computes no layout, so the DOM-order test
// above passed while `row-reverse` was rendering Delete on the LEFT and Cancel
// on the right — a reader reaching for the rightmost button would have hit the
// destructive one. Caught in a browser, pinned here.
describe('the confirm button sits where a reader expects it', () => {
  const source = readFileSync(
    join(import.meta.dirname, '../../../..', 'components/svelte/ConfirmDialog.svelte'),
    'utf8',
  )
  const styles = (source.match(/<style>([\s\S]*)<\/style>/)?.[1] ?? '').replace(/\/\*[\s\S]*?\*\//g, '')
  const actions = styles.match(/\.ui-confirm__actions\s*\{([^}]*)\}/)?.[1] ?? ''

  it('does not reverse the row, so DOM order is visual order', () => {
    expect(actions).not.toMatch(/row-reverse/)
  })

  it('aligns the pair to the end', () => {
    expect(actions).toMatch(/justify-content:\s*flex-end/)
  })
})

describe('ConfirmDialog carries a choice the host supplies (D78)', () => {
  it('renders the host snippet between the question and the buttons', () => {
    const children = createRawSnippet(() => ({ render: () => '<p>Install with Homebrew or curl</p>' }))
    render(ConfirmDialog, { props: { open: true, action: 'Install', target: 'Hugging Face CLI', children } })
    const choice = screen.getByText('Install with Homebrew or curl')
    const confirm = screen.getByRole('button', { name: 'Install' })
    expect(choice.compareDocumentPosition(confirm) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('draws no empty slot without one', () => {
    render(ConfirmDialog, { props: { open: true, target: 'Breaking Even' } })
    expect(document.querySelector('.ui-confirm__choice')).toBeNull()
  })
})

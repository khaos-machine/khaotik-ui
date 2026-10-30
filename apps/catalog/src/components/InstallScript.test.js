import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import InstallScript from '@khaos-machine/khaotik-ui/components/svelte/InstallScript.svelte'

// The acquisition script pane.
//
// Two things are pinned here that are not styling. First, there is no Run
// button and there must not be one — the settled decision is that Khaos Machine
// never executes acquisition. Second, a script carrying bidirectional overrides
// can render as one command and run as another (Trojan Source, CVE-2021-42574),
// and this pane's only job is to let a human read a script before running it as
// themselves.

const RLO = '‮' // RIGHT-TO-LEFT OVERRIDE
const ZWSP = '​' // ZERO WIDTH SPACE

describe('InstallScript shows the script and offers only to copy it', () => {
  it('renders the script verbatim', () => {
    const { container } = render(InstallScript, {
      props: { script: 'brew install wget jq\nbrew upgrade ollama' },
    })
    expect(container.querySelector('.script__body').textContent)
      .toBe('brew install wget jq\nbrew upgrade ollama')
  })

  it('names the package manager it targets', () => {
    render(InstallScript, { props: { script: 'brew install jq', manager: 'Homebrew' } })
    expect(screen.getByText('Homebrew')).toBeInTheDocument()
  })

  it('offers no way to run it', () => {
    // Not an oversight. Adding one is a product decision, and this test is the
    // tripwire that makes it a deliberate one.
    render(InstallScript, { props: { script: 'brew install jq', onCopy: () => {} } })
    expect(screen.queryByRole('button', { name: /run|install|execute/i })).toBeNull()
  })

  it('says so, in the success tone, when there is nothing to install', () => {
    const { container } = render(InstallScript, { props: { script: '' } })
    expect(screen.getByText(/Nothing to install/)).toBeInTheDocument()
    expect(container.querySelector('.script__body')).toBeNull()
  })
})

describe('InstallScript renders Copy disabled rather than absent', () => {
  it('disables Copy when no handler is wired', () => {
    render(InstallScript, { props: { script: 'brew install jq' } })
    expect(screen.getByRole('button', { name: /Copy/ })).toBeDisabled()
  })

  it('enables and calls Copy when one is', async () => {
    const onCopy = vi.fn()
    render(InstallScript, { props: { script: 'brew install jq', onCopy } })
    const button = screen.getByRole('button', { name: /Copy/ })
    expect(button).toBeEnabled()
    await fireEvent.click(button)
    expect(onCopy).toHaveBeenCalledOnce()
  })
})

describe('InstallScript refuses a script it cannot render truthfully', () => {
  it('renders a bidi override as its code point, not as an invisible character', () => {
    const { container } = render(InstallScript, {
      props: { script: `brew install jq ${RLO}# gnitset ylno` },
    })
    const marks = container.querySelectorAll('.script__suspect')
    expect(marks).toHaveLength(1)
    expect(marks[0].textContent).toBe('U+202E')
    // And the raw character is gone from the rendering entirely.
    expect(container.querySelector('.script__body').textContent).not.toContain(RLO)
  })

  it('catches zero-width characters too', () => {
    const { container } = render(InstallScript, {
      props: { script: `brew install cur${ZWSP}l` },
    })
    expect(container.querySelector('.script__suspect').textContent).toBe('U+200B')
  })

  it('disables Copy even when a handler IS wired', () => {
    // The refusal is the component's, not the consumer's. A pane that renders a
    // script it admits it cannot show truthfully, and then hands it to the
    // clipboard anyway, has warned and done the dangerous thing regardless.
    render(InstallScript, { props: { script: `brew install jq ${RLO}x`, onCopy: () => {} } })
    expect(screen.getByRole('button', { name: /Copy/ })).toBeDisabled()
  })

  it('raises an alert that says what is wrong and how many', () => {
    render(InstallScript, { props: { script: `a${RLO}b${ZWSP}c`, onCopy: () => {} } })
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/2 characters/)
    expect(alert).toHaveTextContent(/Copying is disabled/)
  })

  it('does not strip the characters, because stripping would copy something else', () => {
    // Displaying a cleaned script while the bytes stay dirty is the same defect
    // wearing the opposite mask. The marker is IN the flow, at the position the
    // character occupied.
    const { container } = render(InstallScript, { props: { script: `one${RLO}two` } })
    expect(container.querySelector('.script__body').textContent).toBe('oneU+202Etwo')
  })

  it('leaves a clean script alone', () => {
    const { container } = render(InstallScript, {
      props: { script: 'brew install wget jq', onCopy: () => {} },
    })
    expect(container.querySelectorAll('.script__suspect')).toHaveLength(0)
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('button', { name: /Copy/ })).toBeEnabled()
  })
})

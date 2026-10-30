import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import ProviderBadge from '@khaos-machine/khaotik-ui/components/svelte/ProviderBadge.svelte'

// #178, reported from khaos-app wiring the Settings Routing pane.
//
// THE CLASS, NOT THE INSTANCE. `provider` did double duty: it was both the text
// rendered beside the mark AND the key the mark was looked up by. khaosd spells
// one provider several ways — an engine id, a voice-catalogue display name, a
// per-voice `providerId`, an analysis id on a prompt trace, and a `title` for a
// Settings pane — and #157, #163, #165 and #178 were each one of those arriving
// without artwork. Each was answered with another alias.
//
// `title` is what broke the pattern. khaosd calls `openai` "OpenAI Platform",
// which lowercases to a key no table will hold unless someone types it. A host
// wanting the pane to READ "OpenAI Platform" had to choose between the right
// label and the right mark.
//
// NO ALIAS WAS ADDED FOR IT, deliberately. An `openai platform` entry would fix
// this report and leave the next title to be discovered by another consumer.

describe('the label and the lookup key are different things', () => {
  it('draws the mark from the id while printing the name', () => {
    render(ProviderBadge, { props: { provider: 'OpenAI Platform', providerId: 'openai' } })

    expect(screen.getByText('OpenAI Platform')).toBeInTheDocument()
    // The artwork, not the placeholder: one <path>, not the plug glyph.
    expect(document.querySelector('.pmark')).not.toBeNull()
  })

  it('still resolves from the name when no id is given', () => {
    // Every caller predating `providerId` must be unchanged.
    render(ProviderBadge, { props: { provider: 'openrouter' } })
    expect(document.querySelector('.pmark')).not.toBeNull()
  })

  it('renders the placeholder when the id has no artwork, and keeps the label', () => {
    render(ProviderBadge, { props: { provider: 'Ollama', providerId: 'ollama' } })

    expect(screen.getByText('Ollama')).toBeInTheDocument()
    expect(document.querySelector('.pmark')).toBeNull()
  })

  it('does NOT resolve the title as a spelling', () => {
    // The guard against someone "fixing" #178 by adding the alias later. If a
    // title ever becomes a key, this reds and the reasoning above gets re-read.
    render(ProviderBadge, { props: { provider: 'OpenAI Platform' } })
    expect(document.querySelector('.pmark')).toBeNull()
  })

  it('prefers the id over the name when the two disagree', () => {
    // A host passing both is telling the kit which is which. The id wins for
    // resolution; the name wins for reading. Anthropic artwork, OpenAI label
    // would be wrong — so assert they resolve to DIFFERENT marks rather than
    // that one exists.
    const a = render(ProviderBadge, { props: { provider: 'openai', providerId: 'anthropic' } })
    const path = a.container.querySelector('.pmark path').getAttribute('d')

    const b = render(ProviderBadge, { props: { provider: 'openai' } })
    const openaiPath = [...b.container.querySelectorAll('.pmark path')].pop().getAttribute('d')

    expect(path).not.toBe(openaiPath)
  })
})

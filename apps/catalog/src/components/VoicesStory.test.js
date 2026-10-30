import { readFileSync } from 'node:fs'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Voices from '@khaos-machine/khaotik-ui/components/svelte/Voices.svelte'

// Which open story pays for hosted voice work (khaos-app#615; K: "Pick the story").
const b4p = { id: '/stories/b4p.kspd', label: 'BROKEN IN 4 PLACES' }
const proof = { id: '/stories/broken-in-4-places proof.kspd', label: 'BROKEN IN 4 PLACES' }
const loft = { id: '/stories/loft.kspd', label: 'THE LOFT' }
const base = { view: 'speak', voices: [] }

describe('Voices: the story hosted voice work pays from', () => {
  it('offers the open stories, names duplicates by their file, and reports the choice', async () => {
    const onStory = vi.fn()
    render(Voices, { props: { ...base, story: { choices: [b4p, proof, loft], chosen: b4p.id, reason: '', fixed: false }, onStory } })
    const trigger = screen.getByRole('button', { name: /Story that pays/ })
    expect(trigger.textContent).toContain('BROKEN IN 4 PLACES — b4p')
    await fireEvent.click(trigger)
    expect(screen.getByRole('menuitemradio', { name: 'BROKEN IN 4 PLACES — broken-in-4-places proof', hidden: true })).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('menuitemradio', { name: 'THE LOFT', hidden: true }))
    expect(onStory).toHaveBeenCalledWith(loft.id)
  })

  it('shows a fixed story without a choice', () => {
    render(Voices, { props: { ...base, story: { choices: [loft], chosen: loft.id, reason: '', fixed: true } } })
    expect(screen.getByText('THE LOFT')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Story that pays/ })).toBeNull()
  })

  it('asks for a story to be opened when none is', () => {
    const reason = 'Open a story first. Hosted voices are paid from its budget.'
    render(Voices, { props: { ...base, story: { choices: [], chosen: '', reason, fixed: false } } })
    expect(screen.getByText(reason)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Story that pays/ })).toBeNull()
  })

  it('draws nothing without a story', () => {
    render(Voices, { props: base })
    expect(screen.queryByText('Paid from')).toBeNull()
  })

  // jsdom lays nothing out, so the rule is asserted in the source: beside the full-width trigger the
  // label wrapped to "Paid" / "from" (khaos-app#616 live pass).
  it('keeps the label on one line beside the trigger', () => {
    const source = readFileSync(`${import.meta.dirname}/../../../../components/svelte/Voices.svelte`, 'utf8')
    const rule = source.match(/\.ui-voices__story-label \{([^}]*)\}/)?.[1] ?? ''
    expect(rule).toMatch(/white-space:\s*nowrap/)
  })
})

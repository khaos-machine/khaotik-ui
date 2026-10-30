import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import SelectableRow from '@khaos-machine/khaotik-ui/components/svelte/SelectableRow.svelte'
import CharacterMentions from '@khaos-machine/khaotik-ui/components/svelte/CharacterMentions.svelte'
// D52 covers NAMING a row and hiding its inner visual text. It says nothing
// about state or about SVG text alternatives, and both were being dropped:
//
//  - SelectableRow conveyed "selected" through `class:selected` and CSS only,
//    so every single-select list in the kit told a screen-reader user nothing
//    about which row was chosen.
//  - A chart that carried role="img" pruned its whole subtree, so every name
//    and relation it drew was unreachable and the card read as one unlabelled
//    image. That is data loss, not decoration.

describe('SelectableRow selected state', () => {
  // These pass `onclick` since #193, which made the row a `<button>` only when
  // it can act. They were asserting the aria-current contract and happened to
  // rely on the unconditional button; an interactive row is the case they mean.
  // The read-only row's aria-current is covered in SelectableRowReadOnly.test.js.
  const act = () => {}

  it('exposes the selected row to assistive tech', () => {
    render(SelectableRow, { props: { title: 'Desmond Cole', selected: true, onclick: act } })
    expect(screen.getByRole('button', { name: 'Desmond Cole' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('omits aria-current when not selected rather than saying false', () => {
    render(SelectableRow, { props: { title: 'Mara Voss', selected: false, onclick: act } })
    expect(screen.getByRole('button', { name: 'Mara Voss' })).not.toHaveAttribute('aria-current')
  })

  it('marks exactly one row in a list', () => {
    const mention = (wording) => ({ wording, count: 1, sceneIds: ['s1'] })
    render(CharacterMentions, {
      props: {
        read: { kind: 'loaded', mentions: [mention('Desmond'), mention('Jetta'), mention('Madison')] },
        characterName: 'Madison',
        selected: 'Jetta',
      },
    })

    expect(screen.getByRole('button', { name: /^Jetta/ })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: /^Desmond/ })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('button', { name: /^Madison/ })).not.toHaveAttribute('aria-current')
  })
})


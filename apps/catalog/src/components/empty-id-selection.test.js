import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ResourceCatalog from '@khaos-machine/khaotik-ui/components/svelte/ResourceCatalog.svelte'
import WelcomeWindow from '@khaos-machine/khaotik-ui/components/svelte/WelcomeWindow.svelte'

// The second half of the empty-id family. The keyed-`{#each}` half crashes
// loudly (`each_key_duplicate`, covered in list-row-keys.test.js); this half is
// silent and worse for it — nothing throws, the surface just reports something
// untrue.
//
// The shape is always `entity.id === selectedId` with both sides `''`. khaosd
// sends `id: ''` because the key is absent on disk and a Go `ID string`
// zero-value marshals back as an empty string, and these components default
// `selectedId` to `''` for "nothing is selected". So at rest, with no user
// action at all, EVERY row compares equal to the selection and `.find()`
// returns the FIRST row rather than none.
//
// One graph in the kit already guarded its comparison with `Boolean(selectedId) &&`.
// The guard was applied to one of four comparisons in that file and to none of
// the others here.
//
// Found by a red-team pass on the keyed-each fix, not by the author of it.

describe('empty ids must not read as a selection', () => {
  it('ResourceCatalog marks no artifact current when every id is empty', () => {
    const artifacts = Array.from({ length: 4 }, (_, i) => ({
      id: '',
      kind: 'prompt',
      name: `Artifact ${i + 1}`,
    }))
    const { container } = render(ResourceCatalog, { props: { artifacts, selectedId: '' } })
    expect(container.querySelectorAll('[aria-current="true"]')).toHaveLength(0)
  })

  // The sharpest one. `scenes.find((s) => s.id === selectedId)` resolves to
  // scene 0 at rest, so the inspector renders scene 0's imagery while the list
  // — correctly guarded since #95 — shows nothing selected. Two surfaces in one
  // workspace disagreeing about what is selected.
  // The reviewer's correction to my "latent" claim, and it was right. The leak
  // is not latent as a property of the component — it is conditional on the
  // CALLER, and the condition is one a real host meets. A host that builds
  // `analyses` keyed by scene id, from the same payload whose ids are empty,
  // produces a map with a '' key. `analyses[selectedId]` then resolves at rest
  // and the inspector renders someone else's analysis with nothing selected.
  // Not a selection, but the same operator against the same producer, and it
  // inverts a status the user acts on. `engine.state ?? (daemonVersion ? …)` was
  // meant to read "with no state, a known daemon version means the handshake
  // succeeded" (`lib/engine.js` `engineState`). An empty string IS
  // "no state", and `??` cannot see it, so a daemon that is up and whose version
  // is known reports Offline in red.
  it('the engine plate reports a known daemon as Ready when engine.state is an empty string', () => {
    const { container } = render(WelcomeWindow, {
      props: { engine: { state: '', daemonVersion: '0.9.1', appVersion: '0.16.0' } },
    })
    const text = container.textContent ?? ''
    expect(text, 'a daemon whose version we know is not Offline').not.toContain('Offline')
    expect(text).toContain('Ready')
  })
})

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ServiceStatusList from '@khaos-machine/khaotik-ui/components/svelte/ServiceStatusList.svelte'

// #62. The action branch was a two-way switch over a FIVE-state vocabulary:
// `running` got Stop and everything else got Start. khaosd reports `stopped`,
// `starting`, `running`, `stopping`, `error`
// (khaos-manager/internal/localservices/manager.go:20-24).
//
// So two of the five got a wrong-verb ENABLED control:
//   `starting` → enabled Start, inviting a second start against an engine
//                already coming up
//   `stopping` → enabled Start, inviting a start against one shutting down
//
// `starting` is in the shipped union and reachable by any consumer today. No
// cast, no widening, nothing pending — which is why this was filed separately
// from the type work in #51: no type change makes it reachable and none fixes it.
//
// The transient control is DISABLED and names what the ENGINE said. That is the
// same distinction `pendingId` exists for: a row can be mid-transition because
// something else drove the daemon, so rendering this consumer's verb there would
// assert something the component never observed.
const svc = (state) => ([{ id: 'whisper', name: 'Whisper', state }])
const noop = () => {}
const actionText = (c) => [...c.querySelectorAll('.services__action')].map((b) => b.textContent.trim())
const enabled = (c) => [...c.querySelectorAll('.services__action')].filter((b) => !b.disabled).map((b) => b.textContent.trim())

describe('ServiceStatusList action branch covers all five daemon states (#62)', () => {
  it.each([['starting', 'Starting…'], ['stopping', 'Stopping…']])(
    'renders %s as a disabled %s, never an enabled Start',
    (state, label) => {
      const { container } = render(ServiceStatusList, {
        props: { services: svc(state), onStart: noop, onStop: noop },
      })
      expect(actionText(container)).toContain(label)
      expect(
        enabled(container),
        `an enabled control in the ${state} state invites the wrong verb`,
      ).toEqual([])
    },
  )

  // The two that were always right, asserted so the fix cannot have moved them.
  it('still offers Stop while running', () => {
    const { container } = render(ServiceStatusList, {
      props: { services: svc('running'), onStart: noop, onStop: noop },
    })
    expect(enabled(container)).toEqual(['Stop'])
  })

  it.each([['stopped'], ['error']])('still offers Start when %s', (state) => {
    const { container } = render(ServiceStatusList, {
      props: { services: svc(state), onStart: noop, onStop: noop },
    })
    expect(enabled(container), 'a failed engine is retried, not blocked').toEqual(['Start'])
  })

  // PINS CURRENT BEHAVIOUR, and it is not obviously the right behaviour — said
  // plainly because the first version of this comment claimed an unrecognised
  // state "must not acquire an enabled verb" and then asserted that it does.
  //
  // A state this build does not recognise falls through to Start. That is
  // defensible (a newer daemon member is most likely a resting state) and it is
  // also a confident verb offered against something unobserved — the shape D65,
  // D66 and D71 all rule against elsewhere in this library. Offering Start
  // against an engine that is actually running is the concrete cost.
  //
  // Out of scope for #62, which names `starting` and `stopping` specifically.
  // Pinned here so the behaviour is deliberate rather than incidental, and filed
  // rather than widened mid-fix.
  it('falls through to Start for an unrecognised state (see the note above)', () => {
    const { container } = render(ServiceStatusList, {
      props: { services: svc('reticulating'), onStart: noop, onStop: noop },
    })
    expect(enabled(container)).toEqual(['Start'])
  })
})

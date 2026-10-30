// The one reading of a khaosd service that two surfaces share.
//
// `EngineDetails`' on-device engines section is the SUMMARY — three rows, a `+N more` line, a
// count. `ServiceStatusList` is the DETAIL — description, port, failure reason,
// log path, actions. Both derive the same facts from the same payload, and when
// they derived them separately the two surfaces disagreed: the plate counted a
// rendered state string while the list read `provisioned` (#43 gaps 1 and 2).
//
// Deliberately NOT exported from `components/svelte/index.js`. Both coverage
// gates key off that barrel — `check-catalog-coverage.sh:24-25`,
// `check-taxonomy.mjs:35-36` — so a barrel entry demands a catalog fixture and a
// taxonomy group, and a helper module with nothing to render has neither to give.

/** @typedef {import('./types.js').Service} Service */
/** @typedef {import('./types.js').StatusTone} StatusTone */

// khaosd's states, mapped onto the seven-way StatusTone. `starting` is `info`
// rather than `success` — it has not started yet, and reporting it as running
// is the same class of over-claim as a git chip saying "synced".
const TONES = {
  running: 'success',
  starting: 'info',
  stopped: 'neutral',
  error: 'danger',
}

/**
 * The kit's ONE wording for `provisioned === false`. Exported so the two
 * surfaces that render it cannot drift into two voices about one state — a
 * drift no build step and no rendered test can see, because both wordings
 * render and both look fine.
 */
export const NOT_INSTALLED = 'not installed'

/**
 * The three facts two components derive from one service.
 *
 * `usable` is the count's input, and it reads a structured field rather than a
 * rendered word. `typeof … === 'boolean'` rather than
 * `ready_to_use ?? (state === 'running')`: the two agree on `null`, `undefined`
 * and absent, and diverge only on a non-nullish non-boolean, where `??` passes
 * the value straight through — the STRING `'false'` from a lax decoder is
 * truthy and would count as running. This form never over-claims.
 *
 * @param {Service} service
 * @returns {{ tone: StatusTone, needsSetup: boolean, usable: boolean }}
 */
export function readService(service) {
  return {
    tone: TONES[service.state] ?? 'neutral',
    // `provisioned: false` is a different thing from `stopped`: the engine is
    // not installed, so starting it is not one click away. `=== false`, not
    // `!provisioned` — absent means the caller never decoded the field, and
    // "unknown" must not render as "not installed".
    needsSetup: service.provisioned === false,
    usable:
      typeof service.ready_to_use === 'boolean'
        ? service.ready_to_use
        : service.state === 'running',
  }
}

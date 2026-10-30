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
export function readService(service: Service): {
    tone: StatusTone;
    needsSetup: boolean;
    usable: boolean;
};
/**
 * The kit's ONE wording for `provisioned === false`. Exported so the two
 * surfaces that render it cannot drift into two voices about one state — a
 * drift no build step and no rendered test can see, because both wordings
 * render and both look fine.
 */
export const NOT_INSTALLED: "not installed";
export type Service = import("./types.js").Service;
export type StatusTone = import("./types.js").StatusTone;

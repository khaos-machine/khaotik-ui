// Where a draft lives between reloads.
//
// ONE KEY, NOT ONE PER DOCUMENT. A single atomic read and write, so there is no
// state where the components loaded and the flows did not, and no key
// enumeration to keep in step with what is actually stored.
//
// localStorage RATHER THAN THE FILESYSTEM. The catalog ships twice — a signed
// Tauri app and a static web build at khaotik-catalog.loswf.com — and a
// Tauri-only store would make the whole mode vanish on the web surface.
// `capabilities/default.json` stays `core:default`; nothing here needs a plugin
// or a permission.
//
// REPORT, NEVER REPAIR, NEVER CLEAR. Every failure below returns a named problem
// and leaves the stored bytes exactly where they were. This is the house rule —
// SECTION_EMPTY, GROUP_EMPTY, `resolveFlowSteps`'s `missing` and FlowStrip's
// missing-step paragraph are all the same move — and it matters most here,
// because the alternative is silently resetting to an empty workspace, which is
// how somebody loses an afternoon's work and is told nothing happened.

export const STORAGE_KEY = 'khaotik-catalog:compose:v1'
export const SCHEMA_VERSION = 1

/**
 * @typedef {Object} Problem
 * @property {'unavailable'|'unparseable'|'wrong-schema'|'quota'|'write-failed'} kind
 * @property {string} detail Said in words, for a banner.
 * @property {string} [raw] The stored payload, verbatim, so it can be copied out.
 */

const problem = (kind, detail, raw) => ({ kind, detail, ...(raw === undefined ? {} : { raw }) })

/**
 * The storage a caller should use, or null.
 *
 * Wrapped because reading `globalThis.localStorage` THROWS rather than returning
 * undefined in a few real contexts — a hardened webview, Safari's private mode
 * historically, a browser configured to block site data. A mode that crashes on
 * load in those is worse than one that works without remembering.
 */
export function defaultStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

/**
 * Read the workspace.
 * @returns {{ documents: object[], problem: Problem|null }}
 */
export function load(storage = defaultStorage()) {
  if (!storage) {
    return { documents: [], problem: problem('unavailable', 'This browser is not letting the catalog store anything, so Compose will not remember your work between reloads.') }
  }

  let raw
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch (error) {
    return { documents: [], problem: problem('unavailable', `Reading saved work failed: ${error.message}`) }
  }
  if (raw === null || raw === undefined) return { documents: [], problem: null }

  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    // The raw string comes back with the problem. Nothing is destroyed without a
    // copy in the author's hand.
    return { documents: [], problem: problem('unparseable', 'Saved work could not be read. It is kept exactly as it was — copy it out before starting over.', raw) }
  }

  if (payload?.schema > SCHEMA_VERSION) {
    // A newer writer's document is not ours to guess at. Reading it with an
    // older reader would drop whatever the newer schema added, and then SAVE
    // that loss back over the original.
    return { documents: [], problem: problem('wrong-schema', `Saved work is version ${payload.schema}; this build reads version ${SCHEMA_VERSION}. It has not been touched.`, raw) }
  }

  const migrated = migrate(payload)
  if (migrated.problem) return { documents: [], problem: { ...migrated.problem, raw } }
  return { documents: migrated.payload.documents ?? [], problem: null }
}

/**
 * Bring an older payload forward.
 *
 * The identity at v1, and stated rather than absent: the first migration is the
 * one that gets written in a hurry against a payload nobody kept, so
 * `storage.test.js` freezes a v1 literal that this must keep reading forever.
 */
export function migrate(payload) {
  if (!payload || typeof payload !== 'object') {
    return { payload: { schema: SCHEMA_VERSION, documents: [] }, problem: problem('unparseable', 'Saved work was not an object.') }
  }
  if (payload.schema === SCHEMA_VERSION || payload.schema === undefined) {
    return { payload: { ...payload, schema: SCHEMA_VERSION, documents: payload.documents ?? [] }, problem: null }
  }
  return { payload, problem: problem('wrong-schema', `No migration from version ${payload.schema}.`) }
}

/**
 * Write the workspace.
 * @returns {{ ok: boolean, problem: Problem|null }}
 */
export function save({ documents, app } = {}, storage = defaultStorage()) {
  if (!storage) return { ok: false, problem: problem('unavailable', 'Nothing was saved — this browser is not letting the catalog store anything.') }

  const payload = {
    schema: SCHEMA_VERSION,
    // Recorded for diagnosis and NEVER branched on. The schema is the contract;
    // the app version is a note in the margin.
    ...(app ? { app } : {}),
    savedAt: new Date().toISOString(),
    documents: documents ?? [],
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return { ok: true, problem: null }
  } catch (error) {
    const quota = /quota|exceed/i.test(error?.name + ' ' + error?.message)
    // The in-memory document is untouched either way. Saying the save failed is
    // the whole job: a silent failure means the next reload is the first anyone
    // hears of it.
    return {
      ok: false,
      problem: quota
        ? problem('quota', 'Saved work is too large for this browser to store. Nothing in the editor has been lost — publish or copy a document out to free space.')
        : problem('write-failed', `Saving failed: ${error?.message ?? 'unknown error'}`),
    }
  }
}

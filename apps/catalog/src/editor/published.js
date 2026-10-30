// The documents that have been published into the repo.
//
// `components/composed/*.json` is the artifact D67 and D72 decided on: a composed
// component is not compiled into anything, the file IS the component, and
// `Composed.svelte` in the library is what renders one. The catalog reads the
// same directory a consuming app installs, so what is listed here is exactly
// what ships.
//
// Globbed rather than listed, for the reason `icon-inventory.js` records: a
// hand-kept index is a second copy of a fact the directory already states, and
// it goes stale silently. `import.meta.glob` is Vite-only and therefore stays on
// the catalog side of the line — the library's own interpreter takes its
// documents as a prop precisely so it needs no glob.
//
// EMPTY IS A REAL STATE and renders as one. One document is published now —
// `first-run.json`, the repo's first flow (#60) — so this glob is no longer empty
// and the empty path below is reached only if that file is removed. The rule
// stands; the count in it did not, and was left stale by the commit that filled
// the directory.

const files = import.meta.glob('../../../../components/composed/*.json', {
  eager: true,
  import: 'default',
})

/** Every published document, by the file it came from. */
export const published = Object.entries(files)
  .map(([path, document]) => ({ ...document, publishedAs: path.split('/').pop() }))
  .sort((a, b) => (a.slug ?? '').localeCompare(b.slug ?? ''))

/** The slugs that exist in the repo, for telling a draft from a published thing. */
export const publishedSlugs = new Set(published.map((d) => d.slug))

/**
 * Merge published documents with local drafts.
 *
 * A DRAFT WINS over the published file of the same slug, because a draft is what
 * you are editing — showing the committed version while you type into it would
 * be the surprise. The distinction stays visible: `publishedSlugs` is what the
 * publish control reads to say "Publish" or "Update".
 */
export function mergeDocuments(drafts = []) {
  const bySlug = new Map(published.map((d) => [d.slug, d]))
  for (const draft of drafts) bySlug.set(draft.slug, draft)
  return [...bySlug.values()]
}

/**
 * Write a document into the repo.
 *
 * Dev-server only, and it says so rather than failing quietly: the plugin that
 * handles this exists under `npm run dev` and not in the built app, where
 * publishing to a git repo is meaningless. The built app offers the JSON to copy
 * instead.
 *
 * @returns {Promise<{ok: true, path: string} | {ok: false, error: string}>}
 */
export async function publish(document) {
  if (!import.meta.env?.DEV) {
    return { ok: false, error: 'Publishing writes a file into the repo, which only the dev server can do. Copy the JSON instead.' }
  }
  try {
    const response = await fetch('/__publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(document),
    })
    const body = await response.json()
    return response.ok ? { ok: true, path: body.path } : { ok: false, error: body.error ?? 'Publishing failed.' }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

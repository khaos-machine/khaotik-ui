// A composed document, wearing the fixture registry's shape.
//
// THIS IS WHY ALMOST NOTHING ELSE CHANGES. `FixtureView` reads
// `fixture.component` and `example.props` and renders them; `Canvas` reads
// `selected.name`, `selected.kind` and `selected.examples`; `DeviceFrame` reads
// a frame request; `SidebarNav` reads `section` and `group`. Give a document
// those fields and every one of those files renders it with no edit at all — the
// canvas, the device frame and the flow strip included.
//
// The alternative was a second rendering path beside the fixture one, branched
// on at every level of the shell. That is four files each growing an `{#if
// composed}`, and four places for the two paths to diverge.
//
// BUILT AT RUNTIME, NEVER WRITTEN INTO `fixtures.js`. Beyond the obvious — a
// draft is not source — there is a mechanical reason: `check-taxonomy` strips
// flow entries with `/\{[^{}]*kind:\s*'flow'[^{}]*\}/g`, and `[^{}]` cannot
// cross a nested brace. A document literal carrying `root: {…}` would survive
// that strip, its `name:` could then register as a bogus export placement, and
// the gate would fail — or, under its own partial-parse rule, report CANNOT RUN,
// which is a red rather than a message. Documents live in localStorage and in
// `components/composed/`; the registry sees them only as these objects.

import ComposedView from './ComposedView.svelte'

/**
 * Where a document files in the nav.
 *
 * A COMPOSED SCREEN FILES UNDER SCREENS, beside the hand-authored ones. Whether
 * a screen was typed in Svelte or composed in JSON is provenance, not category —
 * the same call the Svelte badge already makes — and filing them apart was a
 * consequence of Compose being its own destination rather than a decision.
 *
 * A component or screen with no group yet lands in its section's `drafts`, which
 * is a WAITING ROOM and not a shelf: give it a group and it moves to sit beside
 * its peers, because comparing a card against the other cards is what the
 * catalog is for. Screens file by the app window or pane they stand for.
 */
// Exported so nothing that needs "what section does this document file under"
// re-derives the rule — one fact, one place.
export const placement = (doc) =>
  doc.kind === 'flow' ? { section: 'flows', group: 'flows' }
    : doc.kind === 'screen' ? { section: 'screens', group: doc.group ?? 'drafts' }
      : { section: 'components', group: doc.group ?? 'drafts' }

/**
 * One composed component or screen, as a registry entry.
 *
 * `composed` is threaded into the example props rather than read from a module
 * singleton, so a nested `@slug` resolves against the same set the caller is
 * holding — and so these stay pure enough to test without a store.
 */
export const composedFixture = (doc, composed = new Map()) => ({
  ...placement(doc),
  id: doc.slug,
  name: doc.name,
  kind: doc.kind,
  component: ComposedView,
  examples: [{ label: 'Composed', props: { document: doc, composed } }],
  // The document itself, for the editor and the inspector. The shell never reads
  // it; it looks at the fields above like any other fixture.
  document: doc,
})

/**
 * One flow, as a registry entry.
 *
 * No `component`: a flow is not rendered by mounting one thing, it is a strip of
 * frames, and `FlowStrip` already draws it.
 */
export const flowFixture = (flow) => ({
  ...placement(flow),
  id: flow.slug,
  name: flow.name,
  kind: 'flow',
  steps: flow.steps ?? [],
  document: flow,
})

/** A document that exists to compete with an already-named thing. */
export const isVariant = (doc) => Boolean(doc?.variantOf)

/**
 * Every authored document that stands on its own, as registry entries.
 *
 * VARIANTS ARE EXCLUDED, and that is the point of them. Four candidate
 * MetricCards are not four entries in the Cards group — they are four variants
 * OF MetricCard, and they reach the nav through `attachVariants` below. Listing
 * them flat would bury the thing they are competing to become underneath its own
 * candidates.
 */
export function composedRegistry(documents = []) {
  const composed = composedMap(documents)
  return documents
    .filter((doc) => !isVariant(doc))
    .map((doc) => (doc.kind === 'flow' ? flowFixture(doc) : composedFixture(doc, composed)))
}

/**
 * Hang each variant off the entry it is a variant of.
 *
 * Matched on `name` OR `id` because the two halves of the slug namespace are
 * addressed differently by convention: a published export is PascalCase and is
 * its entry's NAME (`MetricCard`, whose id is `metric-card`), while an authored
 * document is kebab-case and is its entry's ID. The conventions cannot overlap,
 * so one comparison covers both with no ambiguity.
 *
 * A variant whose parent does not exist is REPORTED rather than dropped: it is
 * returned in `orphans`, because a variant of something that has been renamed is
 * work someone did that would otherwise vanish from the app silently.
 */
export function attachVariants(registry, documents = []) {
  const variants = documents.filter(isVariant)
  if (!variants.length) return { registry, orphans: [] }

  const composed = composedMap(documents)
  const orphans = []
  const byParent = new Map()
  for (const variant of variants) {
    const entry = registry.find((f) => f.name === variant.variantOf || f.id === variant.variantOf)
    if (!entry) {
      orphans.push(variant)
      continue
    }
    if (!byParent.has(entry.id)) byParent.set(entry.id, [])
    byParent.get(entry.id).push({ ...composedFixture(variant, composed), variantOf: variant.variantOf })
  }

  return {
    registry: registry.map((entry) =>
      byParent.has(entry.id) ? { ...entry, variants: byParent.get(entry.id) } : entry,
    ),
    orphans,
  }
}

/** The lookup a renderer needs: authored documents by bare slug. */
export function composedMap(documents = []) {
  return new Map(documents.filter((d) => d.kind !== 'flow').map((d) => [d.slug, d]))
}

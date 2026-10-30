<script>
  // A place's Headings view (RFC 0079 §4.1): the scene headings that resolve to it, the merges
  // into it and the declarations that keep it apart; splitting a merge, and declaring two
  // headings different places. Each change is confirmed here and reported; the host writes it
  // and answers with the next read. Moved from Khaos App (catalog app-coverage plan, T4).
  import Button from './Button.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import EmptyState from './EmptyState.svelte'
  import FilterField from './FilterField.svelte'
  import SectionHeader from './SectionHeader.svelte'
  import SelectableRow from './SelectableRow.svelte'
  import { headingsFor, headingsOtherThan } from './lib/places.js'

  /** @typedef {import('./lib/places.js').HeadingLocations} HeadingLocations */
  /** @typedef {import('./lib/places.js').HeadingOccurrence} HeadingOccurrence */
  /** @typedef {import('./lib/places.js').HeadingDecision} HeadingDecision */

  /**
   * @typedef {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded', read: HeadingLocations }} HeadingsRead
   */

  /**
   * @typedef {Object} Props
   * @property {HeadingsRead} [read] The project's headings read. Loading until the host says otherwise.
   * @property {string} [locationId] The place whose view this is.
   * @property {boolean} [busy] A change is being written: the actions wait.
   * @property {(merge: HeadingDecision) => boolean | void | Promise<boolean | void>} [onSplit] Reports a confirmed split. The confirmation stays open when it answers false.
   * @property {(here: HeadingOccurrence, there: HeadingOccurrence) => boolean | void | Promise<boolean | void>} [onKeepApart] Reports a confirmed declaration. The confirmation stays open when it answers false.
   */

  /** @type {Props} */
  let { read = { kind: 'loading' }, locationId = '', busy = false, onSplit = undefined, onKeepApart = undefined } = $props()

  /** A long screenplay has hundreds of headings; the list shows this many matches. */
  const SHOWN = 40

  const view = $derived(read.kind === 'loaded' ? headingsFor(read.read, locationId) : null)
  const others = $derived(read.kind === 'loaded' ? headingsOtherThan(read.read, locationId) : [])
  let filter = $state('')
  const matches = $derived(others.filter((o) => o.evidence.span.lineText.toLowerCase().includes(filter.trim().toLowerCase())))

  // An occurrence is one scene's heading; the scene id keys it within the read.
  /** @param {HeadingOccurrence} o */
  const key = (o) => o.evidence.sceneId
  /** @type {string | null} */
  let hereKey = $state(null)
  /** @type {string | null} */
  let thereKey = $state(null)
  const here = $derived(view?.occurrences.find((o) => key(o) === hereKey) ?? null)
  const there = $derived(others.find((o) => key(o) === thereKey) ?? null)
  let confirming = $state(false)
  /** @type {HeadingDecision | null} */
  let splitting = $state(null)

  /** @param {{ span: { lineNumber: number } }} o */
  const line = (o) => `Line ${o.span.lineNumber}`

  /** The other side of a pair, from this place's point of view. @param {HeadingDecision} d */
  const otherSide = (d) => (d.canonicalId === locationId ? d.retired : d.canonical)

  async function confirmSplit() {
    const target = splitting
    if (target && (await onSplit?.(target)) !== false) splitting = null
  }

  async function confirm() {
    const a = here
    const b = there
    if (!a || !b) return
    if ((await onKeepApart?.(a, b)) !== false) {
      thereKey = null
      confirming = false
    }
  }
</script>

{#if read.kind === 'failed'}
  <EmptyState title="Headings not read" description={read.message} icon="warning" />
{:else if view === null}
  <EmptyState title="Reading the headings…" icon="circle-notch" />
{:else}
  <SectionHeader title="Headings here" eyebrow="from the screenplay" />
  {#if view.occurrences.length === 0}
    <EmptyState title="No headings" description="No scene heading resolves to this location." icon="map-pin" />
  {:else}
    <div class="ui-location-headings__list" role="group" aria-label="Headings here">
      {#each view.occurrences as o (key(o))}
        <SelectableRow
          title={o.evidence.span.lineText}
          subtitle={line(o.evidence)}
          selected={hereKey === key(o)}
          onclick={() => (hereKey = hereKey === key(o) ? null : key(o))} />
      {/each}
    </div>
  {/if}

  {#if view.merges.length > 0}
    <SectionHeader title="Merged into this place" eyebrow={`${view.merges.length}`} />
    <div class="ui-location-headings__list">
      {#each view.merges as d (d.decisionSeq)}
        <div class="ui-location-headings__merge">
          <SelectableRow
            title={d.retired.span.lineText}
            subtitle={d.state === 'declaredSame' ? 'Declared the same place' : `Merged with “${d.canonical.span.lineText}”`} />
          <Button variant="secondary" disabled={busy} onclick={() => (splitting = d)}>Split{' '}<span class="visually-hidden">{d.retired.span.lineText}</span></Button>
        </div>
      {/each}
    </div>
  {/if}

  {#if view.keptApart.length > 0}
    <SectionHeader title="Kept apart" eyebrow={`${view.keptApart.length}`} />
    <div class="ui-location-headings__list">
      {#each view.keptApart as d (d.decisionSeq)}
        <SelectableRow title={otherSide(d).span.lineText} subtitle="A different place, by your declaration" />
      {/each}
    </div>
  {/if}

  <SectionHeader title="Keep apart" eyebrow="different places" />
  <p class="note">
    Choose one of this location’s headings above, then the heading it must never be merged with.
    It applies on the next rerun or re-import; nothing is split now.
  </p>
  <FilterField
    label="Filter other headings"
    placeholder="Filter headings…"
    value={filter}
    shown={Math.min(matches.length, SHOWN)}
    total={others.length}
    oninput={(/** @type {string} */ value) => (filter = value)} />
  <div class="ui-location-headings__list" role="group" aria-label="Other headings">
    {#each matches.slice(0, SHOWN) as o (key(o))}
      <SelectableRow
        title={o.evidence.span.lineText}
        subtitle={line(o.evidence)}
        selected={thereKey === key(o)}
        onclick={() => (thereKey = thereKey === key(o) ? null : key(o))} />
    {/each}
  </div>
  <div class="ui-location-headings__act">
    <Button variant="primary" disabled={!here || !there || busy} onclick={() => (confirming = true)}>
      {busy ? 'Keeping apart…' : 'These are different places'}
    </Button>
  </div>
{/if}

{#if splitting}
  <ConfirmDialog
    open
    target={`“${splitting.retired.span.lineText}”`}
    action="Split"
    tone="default"
    confirmLabel="Split"
    cancelLabel="Cancel"
    description={`Makes it its own location again, apart from “${splitting.canonical.span.lineText}”, and keeps it from being merged back automatically. This takes effect now.`}
    onConfirm={() => void confirmSplit()}
    onCancel={() => (splitting = null)}
    onOpenChange={(/** @type {boolean} */ open) => { if (!open) splitting = null }} />
{/if}

{#if confirming && here && there}
  <ConfirmDialog
    open
    target={`“${here.evidence.span.lineText}” and “${there.evidence.span.lineText}”`}
    action="Keep apart"
    tone="default"
    confirmLabel="Keep apart"
    cancelLabel="Cancel"
    description="Records your declaration that these are different places, so they are never merged automatically. It takes effect on the next rerun or re-import, and survives a re-import. Nothing is split now."
    onConfirm={() => void confirm()}
    onCancel={() => (confirming = false)}
    onOpenChange={(/** @type {boolean} */ open) => (confirming = open)} />
{/if}

<style>
  .ui-location-headings__list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    margin-bottom: var(--spacing-md);
  }

  .ui-location-headings__merge {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .ui-location-headings__merge > :global(:first-child) {
    flex: 1;
    min-width: 0;
  }

  .ui-location-headings__act {
    margin-top: var(--spacing-sm);
  }
</style>

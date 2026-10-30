<script>
  // A place's working document: an Analysis | Cast | Headings | Images | Areas switch. Analysis is
  // the engine's Stage 2 place analysis; Cast is the engine's count of who plays here, which needs
  // no analysis; Headings are the scene headings that resolve here; Images are the place's
  // committed images; Areas are the areas the engine's place builder prepares, which hold for
  // every state. A view chosen is reported, so the host reads what it shows only when it opens.
  // Moved from Khaos App (catalog app-coverage plan, T4).
  import AnalysisStale from './AnalysisStale.svelte'
  import BarChart from './BarChart.svelte'
  import EmptyState from './EmptyState.svelte'
  import LocationHeadings from './LocationHeadings.svelte'
  import PlaceAnalysis from './PlaceAnalysis.svelte'
  import PlaceAreas from './PlaceAreas.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  import SubjectImages from './SubjectImages.svelte'
  import { placeAnalysisView } from './lib/place-analysis.js'
  import { placeCastBars } from './lib/places.js'

  /** @typedef {import('./lib/places.js').PlaceRecord} PlaceRecord */
  /** @typedef {import('./lib/places.js').HeadingDecision} HeadingDecision */
  /** @typedef {import('./lib/places.js').HeadingOccurrence} HeadingOccurrence */
  /** @typedef {'analysis' | 'cast' | 'headings' | 'images' | 'areas'} PlaceView */

  /**
   * The place's detail read: `idle` before one is asked for.
   * @typedef {{ kind: 'idle' } | { kind: 'loading' } | { kind: 'failed', message?: string } | { kind: 'loaded', analysis: Record<string, unknown> | null, graphContext?: Record<string, unknown> | null }} PlaceDetailRead
   */

  /**
   * @typedef {Object} Props
   * @property {PlaceRecord | null} [place] The selected place's row; null when none is selected.
   * @property {PlaceDetailRead} [detail] The place's detail read, which carries its analysis and graph context.
   * @property {{ state: string, reasons: readonly string[], details: readonly string[] } | undefined} [standing] The engine's standing for the place's analysis.
   * @property {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded', read: import('./lib/places.js').HeadingLocations }} [headings] The project's headings read.
   * @property {boolean} [headingsBusy] A headings change is being written.
   * @property {(merge: HeadingDecision) => boolean | void | Promise<boolean | void>} [onSplit] Reports a confirmed split.
   * @property {(here: HeadingOccurrence, there: HeadingOccurrence) => boolean | void | Promise<boolean | void>} [onKeepApart] Reports a confirmed declaration.
   * @property {import('./lib/types.js').SubjectImagesRead} [images] The place's images read.
   * @property {Readonly<Record<string, string>>} [imageUrls] Resolved image URLs by reference id.
   * @property {(referenceId: string) => void} [onRevealImage] Reports an activated image.
   * @property {import('./lib/places.js').PlaceAreasRead} [areas] The place's areas read.
   * @property {(view: PlaceView) => void} [onview] Reports the view chosen.
   */

  /** @type {Props} */
  let {
    place = null,
    detail = { kind: 'idle' },
    standing = undefined,
    headings = { kind: 'loading' },
    headingsBusy = false,
    onSplit = undefined,
    onKeepApart = undefined,
    images = { kind: 'loading' },
    imageUrls = {},
    onRevealImage = undefined,
    areas = { kind: 'loading' },
    onview = undefined,
  } = $props()

  /** @type {PlaceView} */
  let tab = $state('analysis')

  const analysis = $derived(detail.kind === 'loaded' ? detail.analysis : null)
  const view = $derived(placeAnalysisView(analysis))
  const castBars = $derived(placeCastBars(detail.kind === 'loaded' ? detail.graphContext : null))
  const VIEWS = [
    { value: 'analysis', label: 'Analysis' },
    { value: 'cast', label: 'Cast' },
    { value: 'headings', label: 'Headings' },
    { value: 'images', label: 'Images' },
    { value: 'areas', label: 'Areas' },
  ]
</script>

{#if !place}
  <EmptyState title="No place selected" description="Select a place in the table. ↑ and ↓ move the selection; it is kept when you switch away." icon="map-pin" />
{:else}
  <div class="ui-place-detail">
    <header class="ui-place-detail__head">
      <SegmentedControl
        label="Place view"
        value={tab}
        items={VIEWS}
        onselect={(/** @type {string} */ v) => {
          tab = /** @type {PlaceView} */ (v)
          onview?.(tab)
        }} />
    </header>
    <div class="ui-place-detail__body">
      {#if tab === 'areas'}
        <PlaceAreas read={areas} />
      {:else if tab === 'images'}
        <SubjectImages read={images} urls={imageUrls} kind="location" {onRevealImage} />
      {:else if tab === 'headings'}
        {#key place.id}<LocationHeadings read={headings} locationId={place.id} busy={headingsBusy} {onSplit} {onKeepApart} />{/key}
      {:else if tab === 'cast'}
        <BarChart data={castBars} caption="Scenes each character plays here, as the engine counts them." emptyLabel="The engine measured no characters in this location’s scenes." />
      {:else if detail.kind === 'loading'}
        <EmptyState title="Reading the analysis…" icon="circle-notch" />
      {:else if view}
        <AnalysisStale {standing} />
        <PlaceAnalysis {analysis} />
      {:else if detail.kind === 'loaded'}
        <EmptyState title="Analysed by an older process" description="The analysis the engine holds for {place.name} is in a shape it no longer writes. Analyse Place in the toolbar replaces it." icon="sparkle" />
      {:else}
        <EmptyState title="Not analysed yet" description="The engine holds no place analysis for {place.name}. Analyse Place in the toolbar runs it." icon="sparkle" />
      {/if}
    </div>
  </div>
{/if}

<style>
  .ui-place-detail {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .ui-place-detail__head {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex: none;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }
  /* The view switch is the header: it takes the full width, one equal segment per view. */
  .ui-place-detail__head :global(.ui-segmented) {
    display: flex;
  }
  .ui-place-detail__head :global(.ui-segmented__item) {
    flex: 1;
    text-align: center;
  }
  .ui-place-detail__body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: var(--spacing-sm);
  }
</style>

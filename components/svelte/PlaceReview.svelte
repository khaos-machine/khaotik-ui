<script>
  // Khaos App's place review screen, its presentational half (place-build plan V-A, viewer
  // frame §5 and §6). It lays out the built model, the plan, and the whole design sheet once with
  // each sheet panel camera's line art beside it, labelled by panel number, with the review and
  // the operator's edit draft beside them. Nothing crops the sheet: a panel is named by its
  // number, not by a crop (viewer rulings, Gap 1). It
  // fetches nothing: the app's binder reads khaosd's place definition routes, passes what they
  // serve in, and acts on the intents reported back. On Basic it draws only the "needs
  // Advanced" state (K's "Advanced only for now"). three.js reaches this screen only through
  // PlaceViewer's lazy import (D94).
  import Button from './Button.svelte'
  import EmptyState from './EmptyState.svelte'
  import PlacePlan from './PlacePlan.svelte'
  import PlaceViewer from './PlaceViewer.svelte'
  import StatusPill from './StatusPill.svelte'
  import { moveCamera } from './lib/place-plan.js'

  /**
   * @typedef {import('./lib/place-plan.js').PlaceDefinition & {
   *   id?: string,
   *   designRevisionIds: string[],
   *   cameras: { id: string, position: number[], target: number[], lensMm: number, purpose?: string, sheet?: { designRevisionId: string, panel: number } }[],
   *   panelChecks?: { cameraId: string, verdict: string, mismatches?: string[] }[],
   *   review?: { state: string, notes: string },
   * }} ReviewedPlaceDefinition
   */

  /**
   * @typedef {Object} Props
   * @property {boolean} [advanced] Whether the app is on Advanced. On Basic the screen says place building needs Advanced and shows nothing else.
   * @property {boolean} [loading] The definition is being read.
   * @property {string} [error] Why the definition could not be read, in the writer's words, or ''.
   * @property {ReviewedPlaceDefinition | null} [definition] The saved place definition, as khaosd's `GET /api/places/definitions/{id}` returns it.
   * @property {Uint8Array | null} [model] The built model of `definition`: the bytes of khaosd's `.../{id}/model.glb`, or null when there is none.
   * @property {Record<string, string>} [lineArt] Each sheet panel camera's line art URL by camera id: khaosd's `.../{id}/guides/{cameraId}/lineart.png`.
   * @property {Record<string, string>} [sheets] Whole sheet image URLs by design revision id, read with `.../{id}/sheet?designRevisionId=`.
   * @property {Record<string, string>} [sheetLabels] The engine's display labels for referenced sheets, when known.
   * @property {string} [selected] The selected element's id (a room, opening, fixture or camera), or ''.
   * @property {ReviewedPlaceDefinition | null} [draft] The operator's unsaved edit of `definition`, or null when there is none. The plan draws it and the model is seen through its cameras; the model itself stays the saved build.
   * @property {'' | 'stale' | 'building'} [conflict] Why khaosd refused the last write with a 409: `stale` when another revision became the head, `building` while a Build runs; '' when none. Edits wait while it is set.
   * @property {boolean} [saving] A save or review is being written; their actions and edits wait.
   * @property {boolean} [blenderAvailable] Blender was found and is the pinned version, so the working blend can open in it.
   * @property {(id: string) => void} [onselect] Reports an element chosen in the plan or the model.
   * @property {(names: string[]) => void} [onload] Reports the loaded model's node names.
   * @property {(state: 'reviewed' | 'rejected', notes: string) => void} [onreview] Records a review of `definition`: khaosd's `POST .../{id}/review`.
   * @property {(draft: ReviewedPlaceDefinition | null) => void} [onedit] Reports the whole edited definition, or null to discard the draft.
   * @property {() => void} [onsave] Saves `draft` with `definition` as its parent: khaosd's `POST /api/places/definitions`.
   * @property {() => void} [onreload] Reloads the definition's head after a conflict.
   * @property {() => void} [onopenblender] Opens the working blend in Blender: khaosd's `.../{id}/work.blend`.
   */

  /** @type {Props} */
  let {
    advanced = false,
    loading = false,
    error = '',
    definition = null,
    model = null,
    lineArt = {},
    sheets = {},
    sheetLabels = {},
    selected = '',
    draft = null,
    conflict = '',
    saving = false,
    blenderAvailable = false,
    onselect = () => {},
    onload = () => {},
    onreview = () => {},
    onedit = () => {},
    onsave = () => {},
    onreload = () => {},
    onopenblender = () => {},
  } = $props()

  const LISTS = /** @type {const} */ (['rooms', 'openings', 'fixtures', 'cameras'])
  const AXES = ['x', 'y', 'z']
  const REVIEW = {
    unreviewed: { text: 'Not reviewed', tone: 'neutral' },
    reviewed: { text: 'Reviewed', tone: 'success' },
    rejected: { text: 'Rejected', tone: 'danger' },
  }
  const CONFLICT = {
    stale: 'This place changed since you opened it. Reload to see the latest version.',
    building: "This place is being built, so it can't change now. Reload when the build finishes.",
  }

  // Edits wait while a save is written or khaosd refused the last one (a Build runs under `building`).
  const locked = $derived(saving || !!conflict)
  // A camera mid-drag: drawn by the plan and looked through by the viewer, reported once on release.
  // It holds only over the draft it started from, and never while edits wait, so a drag cut off by
  // a lock or a new draft leaves nothing behind.
  /** @type {{ base: ReviewedPlaceDefinition, next: ReviewedPlaceDefinition } | null} */
  let moving = $state.raw(null)
  const reported = $derived(draft ?? definition)
  const working = $derived(moving && !locked && moving.base === reported ? moving.next : reported)
  const camera = $derived(definition?.cameras.some((c) => c.id === selected) ? selected : '')

  /**
   * Applies a camera move from the plan to the draft; one drag is one edit, reported on release.
   * @param {string} id
   * @param {{ position: number[], target: number[] }} pose
   * @param {boolean} done
   */
  function movecamera(id, pose, done) {
    const base = reported
    if (locked || !base) return
    const next = moveCamera(/** @type {ReviewedPlaceDefinition} */ ($state.snapshot(base)), id, pose)
    moving = done ? null : { base, next }
    if (done) onedit(next)
  }
  const sheetGroups = $derived(
    (definition?.designRevisionIds ?? []).map((id) => ({
      id,
      panels: (definition?.cameras ?? [])
        .flatMap((c) => c.sheet?.designRevisionId === id
          ? [{ camera: c, panel: c.sheet.panel, check: definition?.panelChecks?.find((p) => p.cameraId === c.id) }]
          : [])
        .sort((a, b) => a.panel - b.panel),
    })),
  )
  const review = $derived(REVIEW[/** @type {keyof typeof REVIEW} */ (definition?.review?.state ?? 'unreviewed')] ?? REVIEW.unreviewed)
  // Writable: seeded from the saved notes, then typed into; a new definition reseeds it.
  let notes = $derived(definition?.review?.notes ?? '')

  /** The selected element of the working definition, with the list it sits in. */
  const element = $derived.by(() => {
    if (!working || !selected) return null
    for (const list of LISTS) {
      const found = /** @type {Record<string, unknown>[]} */ (working[list] ?? []).find((e) => e.id === selected)
      if (found) return { list, value: found }
    }
    return null
  })

  // ponytail: numbers and number triples only; outlines, fixture parts and kinds are not editable here.
  const fields = $derived(
    element
      ? Object.entries(element.value).flatMap(([key, v]) =>
          typeof v === 'number'
            ? [{ label: key, key, index: -1, value: v }]
            : Array.isArray(v) && v.length <= 3 && v.every((n) => typeof n === 'number')
              ? v.map((n, index) => ({ label: `${key} ${AXES[index]}`, key, index, value: n }))
              : [],
        )
      : [],
  )

  /**
   * Reports the working definition with one number of the selected element changed.
   * @param {string} key
   * @param {number} index -1 for a plain number, else the coordinate.
   * @param {Event & { currentTarget: HTMLInputElement }} event
   */
  function edit(key, index, event) {
    const value = Number(event.currentTarget.value)
    if (locked || !working || !element || event.currentTarget.value === '' || Number.isNaN(value)) return
    const next = structuredClone($state.snapshot(working))
    const target = /** @type {Record<string, any>} */ (next[element.list].find((/** @type {{ id: string }} */ e) => e.id === selected))
    if (index < 0) target[key] = value
    else target[key][index] = value
    onedit(next)
  }
</script>

{#if !advanced}
  <EmptyState
    title="Building places needs Advanced."
    description="Choose Advanced in Settings › Providers to build, view and review places."
    icon="lock-simple"
  />
{:else if loading}
  <EmptyState title="Loading the place…" icon="circle-notch" />
{:else if error}
  <EmptyState title="This place can't be shown." description={error} icon="warning" />
{:else if !definition}
  <EmptyState title="This place has no build yet." description="Once it's built, you can review it here." icon="map-trifold" />
{:else}
  <div class="place-review">
    {#if conflict}
      <div class="place-review__notice" role="alert">
        <p>{CONFLICT[conflict]}</p>
        <Button variant="secondary" icon="arrow-clockwise" onclick={onreload}>Reload</Button>
      </div>
    {/if}

    <div class="place-review__views">
      <section class="place-review__view" aria-label="Model">
        <PlaceViewer definition={working} {model} {camera} {onselect} {onload} />
      </section>
      <section class="place-review__view" aria-label="Plan">
        <PlacePlan definition={working} {selected} {onselect} onmovecamera={locked ? undefined : movecamera} />
      </section>
    </div>

    <aside class="place-review__side">
      <section class="place-review__block" aria-labelledby="place-review-review">
        <div class="place-review__heading">
          <h3 id="place-review-review">Review</h3>
          <StatusPill text={review.text} tone={review.tone} />
        </div>
        <label class="place-review__field">
          <span>Notes</span>
          <textarea rows="3" bind:value={notes}></textarea>
        </label>
        {#if draft}
          <p id="place-review-held" class="place-review__hint">Save or discard your edits before reviewing.</p>
        {/if}
        <div class="place-review__actions">
          <Button variant="primary" icon="check" disabled={!!draft || saving} describedby={draft ? 'place-review-held' : undefined} onclick={() => onreview('reviewed', notes)}>Mark as reviewed</Button>
          <Button variant="secondary" icon="x" disabled={!!draft || saving} describedby={draft ? 'place-review-held' : undefined} onclick={() => onreview('rejected', notes)}>Reject</Button>
        </div>
        {#if blenderAvailable}
          <Button variant="secondary" icon="cube" onclick={onopenblender}>Open in Blender</Button>
        {/if}
      </section>

      <section class="place-review__block" aria-labelledby="place-review-edit">
        <h3 id="place-review-edit">{element ? `Edit ${selected}` : 'Edit'}</h3>
        {#if !element}
          <p class="place-review__hint">Select a room, opening, fixture or camera in the plan to edit it.</p>
        {:else}
          <div class="place-review__fields">
            {#each fields as f (f.label)}
              <label class="place-review__field">
                <span>{f.label}</span>
                <input type="number" step="0.01" value={f.value} disabled={locked} oninput={(event) => edit(f.key, f.index, event)} />
              </label>
            {/each}
          </div>
        {/if}
        {#if draft}
          <div class="place-review__actions">
            <Button variant="primary" icon="floppy-disk" disabled={saving} onclick={onsave}>Save edits</Button>
            <Button variant="secondary" onclick={() => onedit(null)}>Discard</Button>
          </div>
        {/if}
      </section>
    </aside>

    {#if sheetGroups.length}
      <section class="place-review__sheets" aria-label="Sheet and panels">
        {#each sheetGroups as group (group.id)}
          <div class="place-review__sheet" role="group" aria-label="Sheet {group.id}">
            <h3>{sheetLabels[group.id] ?? 'Sheet and panels'}</h3>
            {#if sheets[group.id]}
              <img src={sheets[group.id]} alt="The design sheet" />
            {:else}
              <p class="place-review__missing">No sheet image.</p>
            {/if}
            <div class="place-review__panels">
              {#each group.panels as { camera: c, panel, check } (c.id)}
                <div class="place-review__panel" role="group" aria-label="Panel {panel}, camera {c.id}">
                  <span class="place-review__label">Panel {panel}</span>
                  {#if lineArt[c.id]}
                    <img src={lineArt[c.id]} alt="Line art from camera {c.id}" />
                  {:else}
                    <p class="place-review__missing">No line art yet.</p>
                  {/if}
                  {#if check}
                    <div class="place-review__check">
                      <StatusPill
                        text={check.verdict === 'differs' ? 'Differs from the sheet' : 'Matches the sheet'}
                        tone={check.verdict === 'differs' ? 'warning' : 'success'}
                      />
                      {#if check.mismatches?.length}
                        <ul>
                          {#each check.mismatches as m (m)}<li>{m}</li>{/each}
                        </ul>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </section>
    {/if}
  </div>
{/if}

<style>
  .place-review {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 18rem;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    color: var(--text-primary);
  }
  .place-review__notice {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--tone-warning);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
  }
  .place-review__notice p {
    margin: 0;
  }
  .place-review__views {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
    min-height: 20rem;
  }
  .place-review__view {
    min-width: 0;
    border: 1px solid var(--border-hairline);
  }
  .place-review__side {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  .place-review__block {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  .place-review__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  h3 {
    margin: 0;
    font-size: var(--label-md-size);
    font-weight: 600;
  }
  .place-review__field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }
  .place-review__fields {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--spacing-sm);
  }
  .place-review__field :is(input, textarea) {
    font: inherit;
    color: var(--text-primary);
    background: var(--surface-raised);
    border: 1px solid var(--border-hairline);
    border-radius: var(--radius-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  .place-review__actions {
    display: flex;
    gap: var(--spacing-sm);
  }
  .place-review__hint,
  .place-review__missing {
    margin: 0;
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }
  .place-review__sheets {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  /* Each sheet once, whole and uncropped, beside only the cameras that reference it. */
  .place-review__sheet {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: var(--spacing-sm) var(--spacing-md);
    align-items: start;
  }
  .place-review__sheet h3 {
    grid-column: 1 / -1;
  }
  .place-review__panels {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  .place-review__panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 12rem;
    gap: var(--spacing-xs) var(--spacing-md);
    align-items: start;
  }
  .place-review__label {
    grid-column: 1 / -1;
    font-size: var(--caption-size);
    font-weight: 600;
  }
  .place-review__sheet img {
    width: 100%;
    display: block;
    border: 1px solid var(--border-hairline);
  }
  .place-review__check ul {
    margin: var(--spacing-xs) 0 0;
    padding-left: 1.2em;
    font-size: var(--caption-size);
  }
</style>

<script>
  // One dialogue line's voice takes: play each, choose one, delete one, and
  // generate another (khaos-app#185; #216).
  //
  // A PURE VIEW. Props in, callbacks out. Which take is chosen, whether a delete
  // is confirmed and what a generation returns all belong to the app, which
  // re-reads the engine after every write and passes the answer back in. So
  // nothing here is optimistic: a click reports intent and changes no row.
  //
  // NO CONFIRMATION INSIDE. `onDelete` fires on the click. The app owns the
  // confirmation through `ConfirmDialog`, because khaos-app's ADR-0007 is the
  // record of which writes need one and what it must name, and a shared library
  // that confirmed internally would move that policy somewhere that does not
  // read it (architecture frame, amendment 1 §E).
  import AudioPlayback from './AudioPlayback.svelte'
  import Icon from './Icon.svelte'
  import RenderMark from './RenderMark.svelte'
  import StatusPill from './StatusPill.svelte'

  /**
   * @typedef {Object} Take
   * @property {string} id The engine's take id. Passed back to `onChoose` / `onDelete` / `onDownload` unchanged.
   * @property {string} label The take's name, e.g. "Take 2". Also names the row's controls for assistive tech.
   * @property {string} createdAt When the take was recorded, as an ISO 8601 timestamp. Rendered in the reader's locale; a value that does not parse is shown as given.
   * @property {string} voiceName The voice the engine resolved from the character's casting.
   * @property {string} [src] Playable audio — an http(s) URL or an object URL. Without it the row's player is disabled.
   * @property {'stale'} [state] The engine's render state for this take: `stale` once the line it reads has changed since (a RenderMark). Absent means current.
   * @property {{version: number, channels: number, sample_rate: number, samples_per_pixel: number, bits: number, length: number, data: number[]} | null} [peaks] The take's waveform peaks as khaosd serves them. Given, its player draws them behind the scrubber.
   * @property {string} [peaksError] The engine's message for a failed read of this take's peaks, **verbatim**. The take stays whole: its player plays, the message stands where the waveform would be, and the row offers no Try again. An `error` outranks it.
   * @property {string} [error] The engine's message for this take, **verbatim** — e.g. a `STORY_DATA_CONFLICT` from reading its audio. Replaces the row's player. Blank or whitespace-only means no error; an `Error` renders by its `message`.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly Take[]} [takes] The line's takes, in the order the engine returned them.
   * @property {string} [chosenId] The chosen take's `id`. That row, and only that row, shows a "Chosen" badge and no "Use this take". Absent means none is chosen — no row is promoted.
   * @property {boolean} [generating] A generation is in flight. Generate is disabled and the list says so. Consumer-set, never inferred. A `disabledReason` outranks it: the status and Generate's label then follow the reason.
   * @property {string} [disabledReason] Why a take cannot be generated — the engine's message, verbatim (an uncast speaker, or a package that cannot hold takes). Generate is disabled and the reason is shown and announced. Blank or whitespace-only means none.
   * @property {(direction: string) => void} [onGenerate] Asks for a new take, with the direction typed for it (`''` when none, or when there is no direction field). Without it Generate is disabled, not inert.
   * @property {string} [directionLabel] Given, a direction field sits before Generate under this label ("Direction"), and its text goes with the request. The host says in each take's `voiceName` how the engine applied it. D80.
   * @property {string} [generateLabel] Generate's label. Defaults to "Generate take"; a scene's reads say "Read scene".
   * @property {(id: string) => void} [onChoose] Reports "Use this take" with the take's `id`. Without it no row offers the action (D80): a dimmed button on every row, with nowhere to say why, reads as broken.
   * @property {(id: string) => void} [onDelete] Reports a delete request with the take's `id`. **It confirms nothing** — confirming is the app's. Without it no Delete renders: a destructive verb hides rather than dims.
   * @property {string} [progress] How far the generation in flight has got, in the host's words ("Sentence 2 of 3"). Shown in place of "Generating a take…" while `generating` (D87).
   * @property {(id: string) => void} [onDownload] Reports a download request with the take's `id` (#273). The host owns the save dialog, the file write and the outcome. Without it no Download renders. Never offered on a row with an `error`: there is no audio to save.
   * @property {string} [downloadingId] The `id` of the take whose download the host has started and is waiting on. That row's Download renders `aria-busy`, a spinner and "Downloading…", and is disabled until it clears. **Consumer-driven, never inferred**, the same contract as `SpeakerPicker.pendingId`.
   * @property {(id: string) => void} [onOpen] Asks to show the take in a timeline, receiving its `id`. Without it no row offers "Open in timeline" (D80).
   * @property {(id: string) => void} [onRetry] Asks for a failed take again, receiving its `id` (D85). Offered only on a row with an `error`. Without it no Try again renders.
   * @property {boolean} [compact] Inspector density: each take's name, marks and time on one line above its player, the small primary Generate, and every part wrapping rather than scrolling sideways at a narrow pane width.
   * @property {boolean} [toolbar] Defaults to true. False drops the Generate bar, for a host whose own form generates (VoiceStudio, D79): two Generate buttons for one action is one too many. Nothing else changes.
   */

  /** @type {Props} */
  let {
    takes = [],
    chosenId = undefined,
    generating = false,
    disabledReason = '',
    onGenerate = undefined,
    onChoose = undefined,
    onDelete = undefined,
    onRetry = undefined,
    onOpen = undefined,
    onDownload = undefined,
    downloadingId = '',
    progress = '',
    toolbar = true,
    compact = false,
    directionLabel = '',
    generateLabel = 'Generate take',
  } = $props()

  let direction = $state('')

  const statusId = $props.id()
  const unavailable = 'Not available in this app'

  // Typed string, but an untyped caller can pass the Error it caught — the same
  // tolerance a casting error has always needed (#211). A blank message
  // is no message: an error state with no reason states a failure and withholds it.
  const messageOf = (value) => {
    const text = String(value instanceof Error ? value.message : (value ?? ''))
    return text.trim() ? text : ''
  }

  const reason = $derived(messageOf(disabledReason))
  const generateDisabled = $derived(!onGenerate || generating || Boolean(reason))
  // The reason outranks "generating": it is why Generate cannot be pressed at all.
  // The label follows the same winner, so the button never reads "Generating…"
  // beside a reason saying generation is impossible (#217 review, S5).
  const showGenerating = $derived(generating && !reason)
  const status = $derived(reason || (showGenerating ? String(progress ?? '').trim() || 'Generating a take…' : ''))
  const isChosen = (take) => Boolean(chosenId) && take.id === chosenId

  // `disabled` alone is not trusted (D68): jsdom delivers a click to a disabled
  // button's onclick where a browser would not, so the gate is restated here.
  function generate() {
    if (!generateDisabled) onGenerate?.(direction.trim())
  }

  /** @param {string} id */
  const isDownloading = (id) => Boolean(downloadingId) && id === downloadingId

  /** @param {string} iso */
  function when(iso) {
    const date = new Date(iso)
    if (!iso || Number.isNaN(date.getTime())) return iso ?? ''
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
  }
</script>

<div class="takes" class:takes--compact={compact}>
  {#if toolbar}
  <div class="takes__bar">
    {#if directionLabel}
      <label class="takes__direction" for={`${statusId}-direction`}>
        <span class="takes__direction-label">{directionLabel}</span>
        <input
          id={`${statusId}-direction`}
          class="takes__direction-input"
          type="text"
          bind:value={direction}
          placeholder="quiet, furious"
          autocomplete="off"
          onkeydown={(event) => {
            if (event.key === 'Enter') generate()
          }} />
      </label>
    {/if}
    <!-- The kit's rule for a missing handler (WelcomeWindow's rail): a primary affordance
         dims, a destructive verb hides. -->
    <button
      class="takes__btn takes__btn--primary"
      class:takes__btn--small={compact}
      type="button"
      onclick={generate}
      disabled={generateDisabled}
      aria-describedby={statusId}
      title={reason || (onGenerate ? undefined : unavailable)}
    >
      <Icon name="waveform" /> {showGenerating ? 'Generating…' : generateLabel}
    </button>
    <!-- Present from the first render, and only its content changes, so a new
         reason or a generation starting is announced (SetupProgress's pattern).
         Visible as well: the reason is for sighted readers too. -->
    <p id={statusId} class="takes__status" role="status">{status}</p>
  </div>
  {/if}

  {#if takes.length}
    <ul class="takes__list">
      <!-- Index-keyed: a Go producer sends "" for an absent id, and a bare `.id`
           key then throws each_key_duplicate (#94, list-row-keys.test.js). -->
      {#each takes as take, i (i)}
        {@const chosen = isChosen(take)}
        {@const error = messageOf(take.error)}
        <li class="takes__row" data-chosen={chosen ? 'true' : undefined}>
          <div class="takes__identity">
            <span class="takes__label">{take.label}</span>
            {#if chosen}
              <StatusPill text="Chosen" tone="success" icon="check-circle" />
            {/if}
            {#if take.state === 'stale'}<RenderMark state="stale" />{/if}
            <span class="takes__meta">
              {take.voiceName}
              <span aria-hidden="true">·</span>
              <time datetime={take.createdAt}>{when(take.createdAt)}</time>
            </span>
          </div>

          {#if error}
            <p class="takes__error">
              <Icon name="warning-circle" weight="fill" />
              <span>{error}</span>
            </p>
          {:else}
            <AudioPlayback src={take.src} label={take.label} peaks={take.peaks ?? null} peaksError={messageOf(take.peaksError)} />
          {/if}

          <div class="takes__actions">
            {#if error && onRetry}
              <button
                class="takes__btn"
                type="button"
                aria-label={`Try again: ${take.label}`}
                disabled={generating}
                onclick={() => onRetry(take.id)}
              >
                <Icon name="arrow-clockwise" /> Try again
              </button>
            {/if}
            {#if onOpen && !error}
              <button
                class="takes__btn"
                type="button"
                aria-label={`Open ${take.label} in timeline`}
                onclick={() => onOpen(take.id)}
              >
                <Icon name="waveform" /> Open in timeline
              </button>
            {/if}
            <!-- Only where the host can choose (D80): a dimmed "Use this take" on every row
                 with nowhere to say why reads as broken, not as unavailable. -->
            {#if !chosen && onChoose}
              <button
                class="takes__btn"
                type="button"
                aria-label={`Use this take: ${take.label}`}
                onclick={() => onChoose?.(take.id)}
                disabled={!onChoose}
                title={onChoose ? undefined : unavailable}
              >
                Use this take
              </button>
            {/if}
            {#if onDownload && !error}
              {@const downloading = isDownloading(take.id)}
              <button
                class="takes__btn"
                type="button"
                aria-label={`${downloading ? 'Downloading' : 'Download'} ${take.label}`}
                aria-busy={downloading ? 'true' : undefined}
                disabled={downloading}
                onclick={() => {
                  if (!downloading) onDownload(take.id)
                }}
              >
                {#if downloading}
                  <span class="takes__spinner" aria-hidden="true"></span> Downloading…
                {:else}
                  <Icon name="download-simple" /> Download
                {/if}
              </button>
            {/if}
            {#if onDelete}
              <button
                class="takes__btn"
                type="button"
                aria-label={`Delete ${take.label}`}
                onclick={() => onDelete(take.id)}
              >
                <Icon name="trash" /> Delete
              </button>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {:else if !reason}
    <!-- With a reason there is nothing to add: "no takes yet" beside "this
         package cannot hold takes" promises what the reason rules out. -->
    <p class="takes__empty">No takes yet.</p>
  {/if}
</div>

<style>
  .takes {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  .takes__bar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--spacing-sm);
  }

  .takes__direction {
    display: flex;
    flex: 1 1 14rem;
    flex-direction: column;
    gap: var(--spacing-2xs);
    min-width: 0;
  }

  .takes__direction-label {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
  }

  .takes__direction-input {
    padding: 4px var(--spacing-sm);
    font: inherit;
    font-size: var(--body-md-size);
    color: var(--text-primary);
    caret-color: var(--action-primary);
    background: var(--surface-base);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
  }

  .takes__direction-input::placeholder {
    color: var(--text-secondary);
  }

  .takes__direction-input:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 0;
  }

  .takes__status {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
  }

  .takes__list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .takes__row {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) 0;
    border-top: 1px solid var(--border-hairline);
  }

  .takes__row:first-child {
    border-top: none;
  }

  .takes__identity {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-xs);
    min-width: 0;
  }

  .takes__label {
    font-size: var(--body-md-size);
    color: var(--text-primary);
  }

  .takes__meta {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
  }

  .takes__error {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-xs);
    margin: 0;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--tone-warning);
    background: color-mix(in oklab, var(--tone-warning) 12%, transparent);
    overflow-wrap: anywhere;
  }

  .takes__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .takes__btn {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: 4px 10px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    font: inherit;
    font-size: var(--body-md-size);
    color: var(--text-secondary);
    cursor: pointer;
  }

  .takes__btn:hover:not(:disabled) {
    color: var(--text-primary);
  }

  .takes__btn:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .takes__btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .takes__spinner {
    flex: none;
    width: 11px;
    height: 11px;
    border: var(--size-stroke-focus) solid var(--border-default);
    border-top-color: var(--tone-info);
    border-radius: 50%;
    animation: takes-spin 0.9s linear infinite;
  }

  @keyframes takes-spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .takes__spinner { animation: none; }
  }

  .takes__btn--primary {
    border-color: var(--action-primary-border);
    background: var(--action-primary);
    color: var(--action-on-primary);
  }

  .takes__btn--primary:hover:not(:disabled) {
    color: var(--action-on-primary);
    background: var(--action-primary-pressed);
  }

  /* Compact: an inspector's density, and nothing wider than the pane at its minimum. */
  .takes--compact {
    gap: var(--spacing-xs);
  }
  .takes--compact .takes__bar {
    gap: var(--spacing-xs);
  }
  .takes--compact .takes__direction {
    flex-basis: 100%;
  }
  .takes--compact .takes__direction-input {
    font-size: var(--data-md-size);
  }
  .takes--compact .takes__row {
    gap: var(--spacing-2xs);
    padding: var(--spacing-xs) 0;
  }
  .takes--compact .takes__label {
    font-size: var(--data-md-size);
    font-weight: 600;
  }
  .takes--compact .takes__meta {
    overflow-wrap: anywhere;
  }
  .takes--compact .takes__btn {
    font-size: var(--caption-size);
    padding: 2px 8px;
  }
  .takes__btn--small {
    padding: 2px 8px;
    font-size: var(--caption-size);
  }

  .takes__empty {
    margin: 0;
    font-size: var(--body-md-size);
    color: var(--text-secondary);
  }
</style>

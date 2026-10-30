<script>
  // Things a machine can have installed, as a desktop checklist lists them.
  //
  // One line each: a state mark, the name, what it gives you, its version, and on the
  // right edge either a finished state or a button. A system tool, an on-device engine
  // and a model weight read the same way, because to the person looking they are the
  // same question: do I have it, what does it give me, and how do I get it.
  //
  // WHY NOT THE STORE ANY MORE. This was an App Store list (D77): a coloured icon tile,
  // two lines, a capsule. Design review did not receive it well (operator, 2026-10-12),
  // and on a Setup page of eighteen items it spent three screens saying "installed"
  // eighteen times in eighteen colours, so the one missing required tool did not stand
  // out. A checklist is scanned, not browsed: colour is spent only on what needs you.
  //
  // WHAT THE EARLIER REJECTIONS STILL RULE. K rejected a status list for having "no
  // clear indicators of anything.. is it read-only, interactive?" and a grid of bordered
  // cards. So every row leads with a mark that IS its state (installed, missing and
  // required, missing and optional, not checked, installing), there are no boxes, and
  // the right edge is never empty: a row that cannot be acted on still shows its button,
  // disabled, with the host's reason under it. An inert row must not look like a broken
  // one.
  //
  // IT EXECUTES NOTHING AND KNOWS NOTHING ABOUT WHAT CAN BE INSTALLED. The host
  // projects its engine's answer onto `state`, names the rows it can act on in
  // `installable`, confirms, asks its engine, and marks the ones installing.
  import Icon from './Icon.svelte'

  /**
   * One installable thing, as the host projects it.
   *
   * DEFINED HERE, NOT IN `lib/types.js`: that file is for shapes more than one
   * component reads, and this is the only reader.
   *
   * @typedef {Object} InstallItem
   * @property {string} id The engine's own id. What `installable` and `onInstall` speak in, and what seeds the icon's colour, so an item keeps its colour when its name changes.
   * @property {string} [name] Display name. Falls back to `id`.
   * @property {string} [icon] A Phosphor icon name drawn small beside the name. The host's: this component keeps no table from an id to a glyph. Absent draws nothing; the row's leading mark is its state, not its identity.
   * @property {string} [tagline] One short line under the name: what having it gives you. The host picks the engine's words for it. One line, truncated: a row is not where a sentence is read.
   * @property {'installed'|'available'|'update'|'unknown'} state `installed` is present. `available` is not present. `update` is present and older than it must be. `unknown` means the engine could not establish an answer — NOT a pass, and never drawn as one. Anything else renders as `unknown`.
   * @property {boolean} [required] The product cannot run without it. Absent means OPTIONAL here, the opposite default from `Requirement.optional`: a store row that called itself required by omission would cry wolf.
   * @property {string} [caption] A few words under the capsule — a version, a size, or why the capsule is disabled. Host-set: this component owns no units and no reasons.
   * @property {boolean} [installing] An install of this item is running. **Host-set, never inferred here.** Names the verb in flight, and while any row is installing every capsule is disabled.
   * @property {string} [verb] The action's word, which says what pressing it does — "Download" for a model the engine fetches. Default "Install". "Retry" after a failure and "Update" for an outdated item replace it.
   * @property {string} [busyVerb] The word while it runs, matching `verb` — "Downloading". Default "Installing".
   * @property {string} [failure] Why the last install of this item failed, in the engine's own words. Present turns the action into Retry and shows the reason in full; it is never truncated.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly InstallItem[]} [items] The rows, in the host's order.
   * @property {readonly string[]} [installable] The ids the host can install on request. **Host-set and never inferred**: whether something can be acquired from a button is the engine's knowledge. A row not named here gets a disabled capsule.
   * @property {(item: InstallItem) => void} [onInstall] Called when a capsule is pressed. **Omit it and every capsule renders DISABLED**, the contract `ServiceStatusList` uses. It reports INTENT: the host confirms before it acts.
   * @property {string} [label] Accessible name for the list — what these rows are ("Models").
   * @property {string} [emptyLabel] Shown when there are no rows. The default states this component's ignorance, not the machine's inventory.
   */

  /** @type {Props} */
  let {
    items = [],
    installable = [],
    onInstall = undefined,
    label = 'Installable items',
    emptyLabel = 'Nothing has been reported.',
  } = $props()

  const STATES = ['installed', 'available', 'update', 'unknown']
  const stateOf = (item) => (STATES.includes(item?.state) ? item.state : 'unknown')

  // What the right edge holds. Exactly one of these per row, always.
  //   done     — installed, nothing to do: a quiet check.
  //   action   — something to acquire and the host can: the capsule.
  //   blocked  — something to acquire and the host cannot: a disabled capsule.
  //   unknown  — the engine could not say. NEUTRAL, and never a check.
  const slotOf = (item) => {
    const state = stateOf(item)
    if (state === 'unknown') return 'unknown'
    if (state === 'installed') return 'done'
    return installable.includes(item.id) ? 'action' : 'blocked'
  }

  // The verb says what pressing does. "Get" did not: a person new to the app asked what it
  // would do (operator, 2026-10-12). The host names the action when it knows it better.
  const verbFor = (item) => (item.failure ? 'Retry' : stateOf(item) === 'update' ? 'Update' : item.verb || 'Install')
  const busyVerbFor = (item) => (stateOf(item) === 'update' ? 'Updating' : item.busyVerb || 'Installing')

  // A failure or a missing REQUIRED item is the only alarm; a missing optional one is
  // just something not yet chosen, and `unknown` is nobody's fault.
  const markOf = (item) => {
    const state = stateOf(item)
    if (item.failure || (item.required === true && (state === 'available' || state === 'update'))) return 'alarm'
    if (state === 'installed') return 'done'
    if (state === 'unknown') return 'unknown'
    if (state === 'update') return 'update'
    return 'missing'
  }
  const MARK_ICONS = { done: 'check', alarm: 'warning-circle', unknown: 'question', update: 'arrow-circle-up', missing: 'circle-dashed' }

  const rows = $derived(
    items.map((item) => ({
      ...item,
      slot: slotOf(item),
      pending: item.installing === true,
      mark: markOf(item),
      // A missing REQUIRED item is the only alarm. A missing optional one is just
      // something not yet chosen, and `unknown` is nobody's fault.
      alarm: item.required === true && stateOf(item) !== 'installed' && stateOf(item) !== 'unknown',
    })),
  )

  const anyInstalling = $derived(rows.some((row) => row.pending))
</script>

{#if rows.length}
  <ul class="store" aria-label={label}>
    <!-- Index-keyed, as every list in the kit is: an engine that sends an empty id
         must cost one odd row, not the whole render. -->
    {#each rows as item, i (i)}
      <li class="store__row" data-slot={item.slot} aria-busy={item.pending ? 'true' : undefined}>
        <!-- The mark IS the state: the first thing read, and the only colour a row
             that needs nothing from you spends. -->
        <span class="store__mark" data-mark={item.mark} aria-hidden="true">
          {#if item.pending}<span class="store__spinner"></span>{:else}<Icon name={MARK_ICONS[item.mark]} weight={item.mark === 'done' ? 'bold' : 'fill'} />{/if}
        </span>

        <div class="store__body">
          <div class="store__text">
            <span class="store__name">
              {#if item.icon}<Icon name={item.icon} />{/if}
              {item.name || item.id}
              {#if item.alarm}<span class="store__required">Required</span>{/if}
            </span>
            {#if item.tagline}
              <span class="store__tagline">{item.tagline}</span>
            {/if}
            {#if item.failure}
              <!-- The engine's own words, never truncated: an ellipsis in the middle
                   of a failure leaves the reader with nothing. -->
              <span class="store__failure" role="status">{item.failure}</span>
            {/if}
          </div>

          <div class="store__action">
            {#if item.slot === 'done'}
              <span class="store__done">Installed</span>
            {:else if item.slot === 'unknown'}
              <!-- In words, and neutral: a row that read as ready because nothing
                   established otherwise would be worse than no row. -->
              <span class="store__unknown">Not checked</span>
            {:else}
              <!-- WHILE ONE INSTALL IS IN FLIGHT, EVERY CAPSULE IS DISABLED: package
                   managers and downloads serialise, so a second click is a queued
                   surprise or a failure. The accessible name carries the item,
                   because five buttons announcing "Install" say nothing about which. -->
              <button
                type="button"
                class="store__get"
                aria-label="{item.pending ? busyVerbFor(item) : verbFor(item)} {item.name || item.id}"
                disabled={item.slot === 'blocked' || !onInstall || anyInstalling}
                onclick={() => onInstall?.(item)}
              >
                {item.pending ? busyVerbFor(item) : verbFor(item)}
              </button>
            {/if}
            {#if item.caption}
              <span class="store__caption">{item.caption}</span>
            {/if}
          </div>
        </div>
      </li>
    {/each}
  </ul>
{:else}
  <p class="store__empty">
    <Icon name="package" />
    {emptyLabel}
  </p>
{/if}

<style>
  /* One column of single-line rows, divided by hairlines: a checklist scanned top to
     bottom. Columns: mark · name · what it gives you · version · action. */
  .store {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: var(--body-md-size);
  }

  .store__row {
    display: grid;
    grid-template-columns: 16px minmax(0, 1fr);
    align-items: center;
    column-gap: var(--spacing-xs);
    min-height: 32px;
    padding: 4px 0;
    border-bottom: 1px solid var(--border-subtle, var(--border-default));
  }

  .store__mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .store__mark[data-mark='done'] { color: var(--tone-success); }
  .store__mark[data-mark='alarm'] { color: var(--tone-danger); }
  .store__mark[data-mark='update'] { color: var(--tone-warning); }

  .store__body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: var(--spacing-sm);
    min-width: 0;
  }

  .store__text {
    display: grid;
    grid-template-columns: minmax(120px, 30%) minmax(0, 1fr);
    align-items: baseline;
    column-gap: var(--spacing-sm);
    min-width: 0;
  }

  .store__name {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: var(--text-primary);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .store__required {
    padding: 0 6px;
    border-radius: var(--radius-sm);
    background: color-mix(in oklab, var(--tone-danger) 14%, transparent);
    color: var(--tone-danger);
    font-size: var(--caption-size);
    font-weight: 600;
  }

  .store__tagline {
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* The engine's own words, in full, on a line of their own under the row. */
  .store__failure {
    grid-column: 1 / -1;
    color: var(--tone-danger);
    font-size: var(--caption-size);
    white-space: normal;
  }

  /* Version, then the action or the finished state, at fixed widths so every row's
     right edge lines up. */
  .store__action {
    display: grid;
    grid-template-columns: 72px 96px;
    align-items: center;
    justify-items: end;
    column-gap: var(--spacing-xs);
  }

  .store__caption {
    grid-column: 1;
    grid-row: 1;
    color: var(--text-secondary);
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .store__get,
  .store__done,
  .store__unknown {
    grid-column: 2;
    grid-row: 1;
  }

  .store__get {
    min-height: 22px;
    padding: 0 var(--spacing-xs);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: var(--text-primary);
    font: inherit;
    font-size: var(--caption-size);
    font-weight: 600;
    cursor: pointer;
  }

  .store__get:hover:not(:disabled) {
    background: color-mix(in oklab, var(--text-primary) 8%, var(--surface-raised));
  }

  .store__get:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .store__get:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 1px;
  }

  .store__done,
  .store__unknown {
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }

  .store__spinner {
    width: 12px;
    height: 12px;
    border: 2px solid color-mix(in oklab, var(--text-primary) 25%, transparent);
    border-top-color: var(--text-primary);
    border-radius: 50%;
    animation: store-spin 0.8s linear infinite;
  }

  @keyframes store-spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .store__spinner { animation: none; }
  }

  .store__empty {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
</style>

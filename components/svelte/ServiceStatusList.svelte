<script>
  // The on-device engines, as `GET /api/services` reports them.
  //
  // Built against the live payload rather than the issue's description, because
  // the shape changed the day the issue was filed: khaosd 0.6.2 added `name` and
  // `description` (khaos-manager#147), which is what makes this component
  // possible without a label table. khaos.machine.x carries one — "MLX Audio —
  // Kokoro & MLX voices" — and a shared component library is the worst place for
  // that: it would be wrong for every consumer at once the moment a service is
  // renamed.
  //
  // So `name` renders unconditionally. The daemon guarantees it is populated
  // (falling back to the id on its own side) precisely so no client needs
  // `if (!name) show id`, which is the label table back in miniature.
  import Icon from './Icon.svelte'
  import StatusPill from './StatusPill.svelte'
  import Toggle from './Toggle.svelte'
  import { readService, NOT_INSTALLED } from './lib/services.js'

  /** @typedef {import('./lib/types.js').StatusTone} StatusTone */

  /** @typedef {import('./lib/types.js').Service} Service */

  /**
   * What `onStart` / `onStop` receive: the service, plus the two values this
   * component derives from it.
   * @typedef {Service & { tone: StatusTone, needsSetup: boolean, usable: boolean, pending: boolean }} ServiceRow
   */

  /**
   * @typedef {Object} Props
   * @property {readonly Service[]} [services] `GET /api/services`, near enough verbatim: `{ id, name, description?, state, port?, provisioned? }`. `name` is rendered unconditionally — the daemon guarantees it is populated, falling back to the id on its own side, so no client needs `if (!name) show id`.
   * @property {(service: ServiceRow) => void} [onStart] **Omit it and Start renders disabled** rather than absent. A missing control reads as "the product cannot do this"; a disabled one reads as "not for you right now", and only the second is true while a consumer is read-only (khaos-app ADR-0007).
   * @property {(service: ServiceRow) => void} [onStop] Same contract as `onStart`, offered instead of it when a service is running.
   * @property {(service: ServiceRow) => void} [onSetup] Provisions an engine that is not installed. Same contract as `onStart` — omit it and Setup renders disabled, not absent. It reports **intent**, not completion: setup installs packages onto the operator's machine and the daemon holds the connection for up to five minutes, so the consumer is expected to confirm before it acts, exactly as `ConfirmDialog`'s `onConfirm` does (#49).
   * @property {(service: ServiceRow, on: boolean) => void} [onStartWithKhaos] The per-engine "Start with Khaos" switch, checked from the row's `start_with_khaos` (khaosd's served value). Same contract as `onStart` — omit it and the switch renders disabled, not absent. Reports intent; the host writes the opt-in and re-reads the rows.
   * @property {string} [pendingId] The `id` of the service whose action the consumer has sent and is waiting on. Disables that row's actions and names the verb in flight. **Consumer-driven, never inferred here** — `starting` and `stopping` are the engine's own states, observable whenever anything else drives the daemon, so a component that rendered one because a request had been sent would be asserting something it never observed.
   * @property {string} [emptyLabel] Shown when nothing is registered.
   */

  /** @type {Props} */
  let {
    // `[{ id, name, description?, state, port?, provisioned?, ready_to_use? }]`
    services = [],
    // Every action is rendered DISABLED by default and is opt-in. A control that
    // is absent reads as a product that cannot do the thing; a disabled one reads
    // as a product that will not do it for you right now, which is the truth.
    //
    // This used to say khaos-app "is not permitted to call them yet, ADR-0007".
    // That expired: ADR-0007 amendment 3 (2026-08-18) permits start, stop AND
    // setup. Disabled-by-default is still right — a consumer that has not been
    // granted the capability, or has nowhere to mount it, still wants the control
    // visible and inert — but the reason is no longer prohibition (#49).
    onStart = undefined,
    onStop = undefined,
    onSetup = undefined,
    onStartWithKhaos = undefined,
    pendingId = '',
    emptyLabel = 'No on-device engines registered.',
  } = $props()

  // `tone`, `needsSetup` and `usable` come from `lib/services.js`, the one
  // reading the engines plate shares — the two surfaces disagreed about the
  // same payload while each derived its own (#43).
  //
  // `pending` stays here: it is derived from a PROP and the service together
  // (`!!pendingId && s.id === pendingId`), so it cannot move into a function
  // that receives only the service.
  const rows = $derived(
    services.map((s) => ({
      ...s,
      ...readService(s),
      pending: !!pendingId && s.id === pendingId,
    })),
  )
</script>

{#if rows.length}
  <ul class="services">
    <!-- Index-keyed: khaosd sends empty-string ids, and a bare `.id` key has no
               fallback at all, so every row keys the same and the block throws. -->
    {#each rows as service, i (i)}
      <li class="services__row" aria-busy={service.pending ? 'true' : undefined}>
        <span class="services__dot" data-tone={service.tone} aria-hidden="true"></span>

        <div class="services__identity">
          <span class="services__name">{service.name || service.id}</span>
          {#if service.description}
            <span class="services__description">{service.description}</span>
          {/if}
        </div>

        <div class="services__meta">
          {#if service.port}
            <!-- The port is operator information: it is what you curl when the
                 health check disagrees with the state. Monospace, because it is
                 a value to be read exactly. -->
            <span class="services__port">:{service.port}</span>
          {/if}
          <StatusPill text={service.needsSetup ? NOT_INSTALLED : service.state} tone={service.needsSetup ? 'warning' : service.tone} />
        </div>

        <!-- WHY THE FAILED ROW FAILED, BEFORE THE ACTIONS IN DOM ORDER.
             Reading order follows DOM order, so a screen-reader user reaches
             the sentence explaining the failure before Start/Stop rather than
             after it; the row places the actions explicitly so the layout is
             unchanged. khaosd populates both fields only inside
             `if info.State == StateError` (lifecycle.go:273-283) and both are
             `omitempty`, so keying the guard on the fields cannot fire on a
             healthy row.

             EACH LINE IS GUARDED ON ITS OWN. `Reason` is set only when the
             service-map lookup succeeds (lifecycle.go:275-277) while `LogPath`
             is unconditional at :280, so a log path with no reason is
             reachable — one wrapper around two unguarded lines would ship a
             bare `Reason:` with nothing after it. -->
        {#if service.reason || service.log_path}
          <div class="services__detail">
            {#if service.reason}
              <span class="services__reason">
                <span class="services__detail-label">Reason:</span>
                <span class="services__detail-value">{service.reason}</span>
              </span>
            {/if}
            <!-- `log_path` is CONSTRUCTED, not probed: lifecycle.go:280 joins
                 `~/.khaos/logs/<id>.log` with no stat, and on the
                 Apple-silicon precheck path the service enters StateError
                 before anything launches (:42-45), so there may be no file at
                 all. Labelled as the location it is expected at — never as
                 "the crash output".

                 And it renders only when the daemon's own sentence does not
                 already end in it: lifecycle.go:152's format string closes
                 with `; see %s`, so on the commonest error path a second
                 labelled copy invites the reader to wonder whether they are
                 two different paths. An exact substring test, no parsing — if
                 the daemon's wording changes the check stops matching and the
                 line renders, which is the safe direction. -->
            {#if service.log_path && !service.reason?.includes(service.log_path)}
              <span class="services__log">
                <span class="services__detail-label">Log (expected at):</span>
                <span class="services__detail-value">{service.log_path}</span>
              </span>
            {/if}
          </div>
        {/if}

        <!-- WHILE ONE ACTION IS IN FLIGHT, EVERY ACTION ON THE ROW IS DISABLED.
             These calls are synchronous and the daemon holds the connection —
             90s for start, five minutes for setup — emitting nothing in between,
             so an untouched row looks inert and invites a second click that is a
             real concurrent request rather than a no-op (#49). The verb is named
             in the label; the state pill is left alone, because that reports what
             the ENGINE said and this reports what the CONSUMER did. -->
        <div class="services__actions">
          {#if service.needsSetup}
            <!-- Setup is primary: it is the action that clears the state the row
                 is in. Start stays visible and disabled behind it rather than
                 vanishing, so the sequence is legible — install, then run. -->
            <button
              type="button"
              class="services__action services__action--primary"
              disabled={!onSetup || service.pending}
              onclick={() => onSetup?.(service)}
            >{service.pending ? 'Setting up…' : 'Setup'}</button>
            <button type="button" class="services__action" disabled>Start</button>
          {:else if service.state === 'running'}
            <button
              type="button"
              class="services__action"
              disabled={!onStop || service.pending}
              onclick={() => onStop?.(service)}
            >{service.pending ? 'Stopping…' : 'Stop'}</button>
          {:else if service.state === 'starting' || service.state === 'stopping'}
            <!-- The two TRANSIENT states, and they need their own branch because
                 the `{:else}` below is a two-way switch over a five-state
                 vocabulary. khaosd reports `stopped`, `starting`, `running`,
                 `stopping`, `error` (localservices/manager.go:20-24); before
                 this, `starting` and `stopping` both fell through and rendered
                 an ENABLED Start — inviting a second start against an engine
                 already coming up, and a start against one shutting down.
                 `starting` is in the shipped union and reachable by any consumer
                 today; no type change was needed to hit it.
                 The control is disabled and names what the ENGINE said, not what
                 this consumer did. That distinction is why `pending` exists
                 separately: a row can be mid-transition because anything else
                 drove the daemon, and rendering the consumer's verb there would
                 assert something never observed. -->
            <button type="button" class="services__action" disabled
            >{service.state === 'starting' ? 'Starting…' : 'Stopping…'}</button>
          {:else}
            <!-- `stopped` and `error`. Start is correct for both — a failed
                 engine is retried, not blocked. -->
            <button
              type="button"
              class="services__action"
              disabled={!onStart || service.pending}
              onclick={() => onStart?.(service)}
            >{service.pending ? 'Starting…' : 'Start'}</button>
          {/if}
          <Toggle
            label="Start with Khaos"
            checked={service.start_with_khaos === true}
            disabled={!onStartWithKhaos || service.pending}
            onchange={(on) => onStartWithKhaos?.(service, on)}
          />
        </div>
      </li>
    {/each}
  </ul>
{:else}
  <p class="services__empty">
    <Icon name="plugs" />
    {emptyLabel}
  </p>
{/if}

<style>
  /* The primary action is WEIGHTED, not coloured: `needsSetup` already spends the
     row's one warning tone on the pill, and a second accent beside it would make
     two things compete to be the thing you look at.
     Weight alone, and no border colour — the obvious `--border-strong` is a token
     the kit has never shipped (ProjectCard.svelte:190 records the same mistake),
     and an unknown custom property resolves to nothing rather than erroring. */
  .services__action--primary {
    font-weight: var(--label-md-weight);
  }

  .services {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .services__row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
  }

  .services__row:hover {
    background: color-mix(in oklab, var(--text-primary) 4%, transparent);
  }

  .services__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--tone-neutral);
  }

  .services__dot[data-tone='success'] { background: var(--tone-success); }
  .services__dot[data-tone='info'] { background: var(--tone-info); }
  .services__dot[data-tone='danger'] { background: var(--tone-danger); }

  .services__identity {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .services__name {
    font-size: var(--body-md-size);
    color: var(--text-primary);
  }

  /* One line, because this is a list and the descriptions vary in length —
     the full text stays available as the row's title attribute is NOT used;
     truncation here loses nothing actionable, unlike an engine error. */
  .services__description {
    font-size: var(--caption-size);
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .services__meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .services__port {
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }

  /* The detail sits on its own row beneath the identity, and the actions are
     pinned to row 1 explicitly. Without that pin, a full-width child placed
     BEFORE the actions in DOM order would push them onto a third row — the
     layout cost of the reading order this component wants. */
  .services__actions {
    grid-column: 4;
    grid-row: 1;
  }

  /* Monospace, wrapping, NOT truncated — the same treatment OutcomeBanner
     settled on for the same class of text (OutcomeBanner.svelte:124-135): an
     ellipsis in the middle of an engine's failure sentence leaves the reader
     with nothing.

     `overflow-wrap` and `white-space` here are LOAD-BEARING, not decorative.
     The row's `minmax(0, 1fr)` guard constrains column 2 only and does not
     cover this spanning child, so an unbreakable 60-character path would blow
     out the grid track without them. */
  .services__detail {
    grid-column: 1 / -1;
    grid-row: 2;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    margin-top: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-left: 2px solid var(--tone-danger);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .services__detail-label {
    color: var(--text-secondary);
  }

  .services__action {
    padding: 3px 10px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-primary);
    font: inherit;
    font-size: var(--caption-size);
    cursor: pointer;
  }

  .services__action:hover:not(:disabled) {
    background: color-mix(in oklab, var(--text-primary) 8%, transparent);
  }

  /* Visibly disabled, not hidden. The capability exists; this consumer is not
     permitted to use it yet. */
  .services__action:disabled {
    color: var(--action-on-disabled);
    border-color: color-mix(in oklab, var(--border-default) 60%, transparent);
    cursor: default;
  }

  .services__action:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .services__empty {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin: 0;
    padding: var(--spacing-sm);
    font-size: var(--body-md-size);
    color: var(--text-secondary);
  }
</style>

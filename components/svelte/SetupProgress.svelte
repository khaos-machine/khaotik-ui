<script>
  // The surface for a long-running verb.
  //
  // `POST /api/services/{id}/setup` blocks for up to five minutes
  // (khaos-manager `internal/api/services.go:131`) while `Manager.Setup` writes
  // a streamed provision log and emits `service.setup-step` events. Before this
  // component the kit rendered none of it: `ServiceStatusList.pendingId`
  // disabled one row, named a verb, and that was the entire surface.
  //
  // INDETERMINATE BY CONSTRUCTION. khaosd emits discrete steps, not a byte
  // count, so there is no percentage to show and one would be invented. The
  // honest copy in `note` carries what a progress bar would have claimed
  // falsely: a surface that does not know must say so.
  //
  // IT OWNS NO ORCHESTRATION AND NO VIEWPORT. `busy` is consumer-set, never
  // inferred. `variant: 'surface'` drops the card chrome so a host can mount
  // this full-window, but the TAKEOVER is the host's — there is no
  // fixed-position branch, no focus trap, no `aria-modal`, no escape semantics
  // and no scroll locking. That is a deliberate narrowing of #63's "a mode, not
  // a panel", ruled by the operator and recorded as D73; if a takeover is
  // wanted it belongs to the shell that mounts this.
  //
  // The two `$effect`s below read one element this component owns and one prop
  // it was handed. They fetch nothing, subscribe to nothing and advance
  // nothing, so they are not orchestration, which the kit leaves to its host —
  // `StoryPlayer.svelte:133` is the precedent.
  import StatusPill from './StatusPill.svelte'
  import { shouldFollow } from './lib/tail-follow.js'

  /** @typedef {import('./lib/types.js').StatusTone} StatusTone */

  /**
   * One provisioning step, as `service.setup-step` reports it
   * (khaos-manager `internal/localservices/manager.go:267-273`; the state
   * vocabulary is `StepState` at `manager.go:30-35`).
   *
   * DEFINED HERE, NOT IN `lib/types.js`. That file is for shapes MORE THAN ONE
   * component reads, and says so — `ServiceStatusList` does not read this one.
   * (`Service` in `lib/types.js` has no `setup_steps` property today even
   * though `GET /api/services` sends one; that is a real gap, filed separately,
   * and closing it here would be adding a shared type for a single reader.)
   *
   * @typedef {Object} SetupStep
   * @property {string} name The step khaosd names — `python`, `venv`, `apple_silicon`, `packages`, `weights`. Rendered verbatim; there is no display-name table, because inventing one means guessing at a vocabulary the daemon owns.
   * @property {string} [state] Typed `string`, with the four `StepState` members named in this docblock and NOWHERE ELSE IN THE TYPE — `pending`, `passed`, `failed`, `skipped`. Absent, or unrecognised, renders NEUTRAL: neither a pass nor a failure has been reported. `string` and not a closed union because `StepState` is open at the producer — khaos-manager can add a member and this client receives it unfiltered — and not `(string & {})` because that intersection measures as `string` anyway through this package, so the named members never reach a consumer's editor. Pinned by `scripts/check-consumer.mjs`; see the `package_stage` measurement at `lib/types.js:127-143`.
   * @property {string} [detail] The step's own sentence — a resolved interpreter path, a venv location, a failure reason. Rendered verbatim and never truncated, as `OutcomeBanner`'s detail is (`OutcomeBanner.svelte:126-135`).
   */

  /**
   * @typedef {Object} Props
   * @property {string} [title] What is being provisioned — "Provisioning MLX Audio". The subject, supplied by the host; this component does not know which service it is looking at.
   * @property {string} [note] The honest copy that carries what a percentage would have claimed falsely — "This may take a few minutes. Do not close the app." Absent renders nothing rather than a default sentence, because how long a host's work takes is not a fact this component holds. It is NOT the accessible carrier of `busy` — see `busyLabel`.
   * @property {boolean} [busy] Work is in flight. CONSUMER-SET AND NEVER INFERRED, the same contract as `ServiceStatusList.pendingId`: output arriving is not proof work is still running, and a component that spun because lines appeared would be asserting something it never observed. Defaults `false`, so a caller that says nothing produces no claim.
   * @property {string} [busyLabel] The accessible equivalent of the spinner, rendered in a `.visually-hidden` span whenever `busy` is set. Defaults to `'Working…'` — a DEFAULT AND NOT AN EMPTY STRING, because the spinner is `aria-hidden` and without this a screen-reader user is told nothing at all while five minutes of provisioning runs.
   * @property {readonly SetupStep[]} [steps] The step feed. Empty means NOBODY HAS REPORTED A STEP, which is not the same as no steps existing — the empty copy says so.
   * @property {readonly string[]} [lines] The provisioning transcript, rendered VERBATIM — never rewritten, reformatted or "fixed", the rule `InstallScript.svelte:19` already holds. Joined with newlines into one text node so the operator can select and copy exactly what khaosd wrote.
   * @property {boolean} [open] Whether the transcript disclosure is expanded. Collapsed by default: collapsed the operator gets a calm screen, expanded they get proof.
   * @property {(open: boolean) => void} [onToggle] Called with the state being requested. **Omit it and the disclosure control renders DISABLED rather than absent** — the house contract `InstallScript.onCopy` and `ServiceStatusList`'s row actions both use. A host that renders a transcript it will not let anyone open should have that visible.
   * @property {string} [label] The disclosure's word while COLLAPSED.
   * @property {string} [openLabel] The disclosure's word while EXPANDED. Two props, not one: a control that still reads "Show setup details" over an open panel is a false statement, which is the defect class D71 and D72 both turn on.
   * @property {string} [emptyLabel] Shown inside the open disclosure when nothing has been emitted yet — which is NOT the same as finished, and the copy must not let the two be read as one. Renders as a sibling of the `<pre>`, never inside it.
   * @property {'card'|'surface'} [variant] `card` (default) keeps the border and radius that separate this from its siblings in a gallery. `surface` drops them for a full-window mount, so a host does not reach into component internals for a layout the component should offer. The full-window TAKEOVER is the host's — this component owns no viewport and starts no mode.
   */

  /** @type {Props} */
  let {
    title = '',
    note = '',
    busy = false,
    busyLabel = 'Working…',
    steps = [],
    lines = [],
    open = false,
    onToggle = undefined,
    label = 'Show setup details',
    openLabel = 'Hide setup details',
    emptyLabel = 'No output yet.',
    variant = 'card',
  } = $props()

  // The four `StepState` members mapped onto the kit's seven-way StatusTone.
  //
  // `pending` and anything unrecognised are NEUTRAL. Rendering `pending` as
  // success is the failure this surface exists to prevent, and it is not danger
  // either — nothing is known to be wrong.
  //
  // `skipped` is why the kit's StatusTone is seven-way rather than five
  // (lib/types.js); mapping it to neutral is the defect that put it there.
  const TONES = { passed: 'success', failed: 'danger', skipped: 'skipped' }

  /** @param {SetupStep} s */
  const toneFor = (s) => TONES[s?.state] ?? 'neutral'

  const transcript = $derived(lines.join('\n'))

  /** @type {HTMLElement | null} */
  let logEl = $state(null)
  let follow = $state(true)

  // Recomputed from the element on every scroll — the operator's position is
  // the only input, and it is read, never remembered from a wheel event. Note
  // this can set `follow` back to TRUE: scrolling back down within the
  // threshold RESUMES following.
  const onLogScroll = () => { follow = shouldFollow(logEl) }

  // Reopening the disclosure resumes following — on THE TRANSITION and on
  // mount, and never on a new line.
  //
  // `wasOpen` is a plain `let` and not `$state`, so it is neither a dependency
  // nor a trigger; the effect's only dependency is `open`. The guard is not
  // ceremony. An effect body of `if (open) follow = true` re-runs whenever the
  // `open` PROP SIGNAL is invalidated, which is not the same as `open` changing
  // value: a host that spreads its props, and @testing-library/svelte's
  // `rerender`, both replace the props object wholesale, so every arriving line
  // re-ran it and reset `follow` to true. Following could then never be
  // stopped — the operator scrolls up to read an error and the next line yanks
  // them back. Measured 2026-09-04, re-run against the unguarded form: THREE
  // of the four wiring assertions in SetupProgress.test.js fail — `stops
  // following…`, `RESUMES following…` and `does NOT resume just outside the
  // band`. The fourth, `follows the tail by default`, passes either way,
  // because `follow` starts `true` and that case never needed it cleared. This
  // comment said "the four … all failed", which was wrong by one and is
  // corrected here.
  let wasOpen = false
  $effect(() => {
    if (open && !wasOpen) follow = true
    wasOpen = open
  })

  // Follow the tail. `lines.length` is the dependency; the guard is the
  // operator's position. A panel that yanks itself to the bottom while someone
  // is reading an error is worse than one that never scrolls.
  //
  // `scrollTop = scrollHeight` rather than `scrollTo({ behavior: 'smooth' })`
  // deliberately. StoryPlayer.svelte:129-133 records the lesson — jsdom does
  // not implement `scrollTo`, and a component that throws from an effect on a
  // missing convenience API takes the whole surface down. A property
  // assignment cannot throw, so the feature detection StoryPlayer needs is not
  // needed here.
  $effect(() => {
    void lines.length
    const el = logEl
    if (!el || !open || !follow) return
    el.scrollTop = el.scrollHeight
  })
</script>

<section class="setup" data-variant={variant}>
  <!-- `role="status"` on the headline block: it changes rarely and it is where
       the state actually is. One of three deliberately different answers — the
       step feed is a polite live region, and the transcript is silent. -->
  <header class="setup__head" role="status">
    <div class="setup__headline">
      {#if title}
        <h2 class="setup__title">{title}</h2>
      {/if}
      {#if busy}
        <!-- D52's shape: the visual is decorative, the text is the accessible
             content. `busyLabel` and NOT `note` carries the claim — `note`
             defaults to `''`, so `busy: true` with no `note` would render an
             aria-hidden ring and nothing else, telling a screen-reader user
             nothing at all for the five minutes the work runs. -->
        <span class="setup__spinner" aria-hidden="true"></span>
        <span class="visually-hidden">{busyLabel}</span>
      {/if}
    </div>

    <!-- No percentage, and no bar. khaosd emits discrete steps, not a byte
         count, so any number here would be invented. This sentence is what the
         host knows instead. -->
    {#if note}
      <p class="setup__note note">{note}</p>
    {/if}
  </header>

  {#if steps.length}
    <!-- The step feed IS announced. The rows are discrete, few (khaosd emits
         five: python, venv, apple_silicon, packages, weights) and change
         infrequently — the textbook case for a polite live region, and the
         library's first.

         `aria-relevant="additions text"` and not `all`: a removal is not news,
         and `removals` on a list that re-keys is a source of spurious
         announcements. -->
    <ul class="setup__steps" aria-live="polite" aria-relevant="additions text" aria-label="Setup steps">
      <!-- Index-keyed per #95/#96: khaosd sends empty-string ids and a bare
           `.id` key aborts the whole render. -->
      {#each steps as step, i (i)}
        <li class="setup__step">
          <span class="setup__dot" data-tone={toneFor(step)} aria-hidden="true"></span>
          <div class="setup__identity">
            <span class="setup__name">{step.name}</span>
            {#if step.detail}
              <!-- Verbatim and never truncated, as OutcomeBanner's detail is. A
                   failure reason clipped mid-sentence reads as complete. -->
              <span class="setup__detail">{step.detail}</span>
            {/if}
          </div>
          <StatusPill text={step.state || 'not reported'} tone={toneFor(step)} />
        </li>
      {/each}
    </ul>
  {/if}

  <div class="setup__disclosure">
    <button
      type="button"
      class="setup__toggle"
      disabled={!onToggle}
      aria-expanded={open}
      onclick={() => onToggle?.(!open)}
    >
      {open ? openLabel : label}
    </button>

    {#if open}
      {#if lines.length}
        <!-- NOT `role="log"`, NOT `aria-live`. `role="log"` carries an implicit
             `aria-live="polite"`, and a five-minute `uv pip` transcript
             announced line by line is not an accessibility win — it is a denial
             of service. The step feed above is what gets announced.

             ONE TEXT NODE. The join happens in the script so the operator can
             select and copy exactly what khaosd wrote; two elements would put a
             boundary in the middle of a paste. -->
        <pre class="setup__log" data-testid="setup-progress-log" bind:this={logEl} onscroll={onLogScroll}>{transcript}</pre>
      {:else}
        <!-- Nothing emitted is NOT finished, and the copy must not let the two
             be read as one. A SIBLING of the `<pre>`, never inside it: the
             testid element's text content is the transcript and nothing else. -->
        <p class="setup__empty note">{emptyLabel}</p>
      {/if}
    {/if}
  </div>
</section>

<style>
  .setup {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    width: 100%;
    padding: var(--spacing-lg);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-md);
    background: var(--surface-base);
  }

  /* Full-window: no card chrome, for a host mounting this as the whole window
     rather than as one item in a gallery. The chrome is dropped; the viewport
     is NOT seized — that is the host's. */
  .setup[data-variant='surface'] {
    border: 0;
    border-radius: 0;
  }

  .setup__head {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
  }

  .setup__headline {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .setup__title {
    margin: 0;
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    font-weight: var(--heading-md-weight);
    letter-spacing: var(--heading-md-track);
    color: var(--text-primary);
  }

  .setup__note {
    margin: 0;
  }

  /* The kit ships no motion token — no `--duration-*`, no `--motion-*` — so the
     timing is a CSS literal. That is legitimate: `token-refs` gates
     `var(--…)` references, not literals. Nobody should invent
     `--duration-slow` to make this look tidier. */
  .setup__spinner {
    flex: none;
    width: 14px;
    height: 14px;
    border: var(--size-stroke-focus) solid var(--border-default);
    border-top-color: var(--tone-info);
    border-radius: 50%;
    animation: setup-spin 0.9s linear infinite;
  }

  @keyframes setup-spin {
    to { transform: rotate(360deg); }
  }

  /* The library's first `@keyframes`, so it is also the library's first
     reduced-motion guard. There is no house precedent to copy — the only
     animation in the workspace is catalog-side (shell/Updater.svelte:114) and
     carries no guard at all. The next component copies this one. */
  @media (prefers-reduced-motion: reduce) {
    .setup__spinner { animation: none; }
  }

  .setup__steps {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .setup__step {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
  }

  .setup__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--tone-neutral);
  }

  .setup__dot[data-tone='success'] { background: var(--tone-success); }
  .setup__dot[data-tone='danger'] { background: var(--tone-danger); }
  .setup__dot[data-tone='skipped'] { background: var(--tone-skipped); }

  .setup__identity {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .setup__name {
    font-family: var(--font-mono);
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    font-weight: var(--body-md-weight);
    color: var(--text-primary);
  }

  /* `overflow-wrap: anywhere`, no truncation: a venv path has no spaces to
     break at, and a detail clipped mid-path is one you cannot compare against
     the one you expected. */
  .setup__detail {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-weight: var(--caption-weight);
    color: var(--text-secondary);
    overflow-wrap: anywhere;
  }

  .setup__disclosure {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    align-items: flex-start;
  }

  /* `--size-stroke-hairline` in the width slot, NOT `--border-hairline`.
     `--border-hairline` is a COLOUR (tokens/tokens.css:178, :241) and the
     shorthand then reads *colour solid colour*, which is invalid at
     computed-value time — the whole declaration is discarded and this control
     ships with no border at all (measured: width=0px style=none), which also
     makes the `:disabled` border-color below a no-op it can never paint. The
     eight components writing `1px solid var(--border-hairline)` put the colour
     in the colour slot; this file's own `.setup__spinner` uses
     `var(--size-stroke-focus)` for the width. Both are correct. Mixing them is
     the bug. Gated by the border-width source read in SetupProgress.test.js. */
  .setup__toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: 3px 10px;
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-primary);
    font: inherit;
    font-size: var(--label-md-size);
    line-height: var(--label-md-line);
    font-weight: var(--label-md-weight);
    cursor: pointer;
  }

  .setup__toggle:hover:not(:disabled) {
    background: color-mix(in oklab, var(--text-primary) 8%, transparent);
  }

  /* Present and inert, not absent — a host that renders a transcript it will
     not let anyone open should have that visible.

     `--text-secondary` AND NOT `--action-on-disabled`, deliberately, and this
     is not a token the next person should "correct" toward the house one.
     `--action-on-disabled` exists, and measured against `--surface-base` it is
     3.61:1 dark / 4.09:1 light — it FAILS WCAG AA 4.5:1 in both themes.
     `--text-secondary` measures 7.53:1 / 7.44:1. The disabled control is still
     text a person has to read; dimming it below contrast is not a state, it is
     a defect. */
  .setup__toggle:disabled {
    color: var(--text-secondary);
    border-color: color-mix(in oklab, var(--border-default) 60%, transparent);
    cursor: default;
  }

  .setup__toggle:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
    outline-offset: 2px;
  }

  /* THE LOG RULE. Four declarations, none of them optional, and none of them
     visible to any rendered test — jsdom resolves no stylesheets, so a
     rendered assertion passes whether or not any of this is here. The source
     read in SetupProgress.test.js is the gate, with a must-red mutation per
     declaration.

     `max-height` + `overflow-y: auto`: the log is bounded and scrolls inside
     its bound. `max-height: none` bounds nothing and the gate rejects it by
     value.

     NO `justify-content: center` AND NO `align-items: center` HERE, or in any
     other scroll container in this file. #63's second comment corrects its
     first: the reference's `max-h-28 overflow-auto` was right, and the clipping
     came from `flex-1 items-center justify-center` inside an `overflow-y-auto`
     parent — a flex container that centres content it cannot fit clips the
     overflowing end instead of letting it scroll.

     `white-space: pre-wrap` is NOT the `<pre>` default. A bare `<pre>` is
     `white-space: pre`, so a 200-character `uv` resolution line would scroll
     this region sideways instead of wrapping. `pre-wrap` and not `pre-line`
     deliberately: `pre-line` collapses runs of spaces, and a provisioning
     log's column alignment is part of what khaosd wrote.

     `overflow-wrap: anywhere` so a path with no spaces still breaks. */
  .setup__log {
    max-height: 11rem;
    overflow-y: auto;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    width: 100%;
    margin: 0;
    padding: var(--spacing-sm);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-primary);
  }

  .setup__empty {
    margin: 0;
  }
</style>

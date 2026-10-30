<script>
  // Setup: everything this machine needs, as a desktop checklist, and the onboarding steps
  // where the engine serves an inference preference. Moved from Khaos App's src/ui/Setup.svelte
  // (catalog app-coverage plan, T9). It probes nothing, judges nothing and runs nothing: every
  // state is the host's, and every button reports intent for the host to confirm and carry out.
  import Checkbox from './Checkbox.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import Icon from './Icon.svelte'
  import InstallList from './InstallList.svelte'
  import InstallScript from './InstallScript.svelte'
  import OutcomeBanner from './OutcomeBanner.svelte'
  import RadioChoiceList from './RadioChoiceList.svelte'
  import SegmentedControl from './SegmentedControl.svelte'

  /** @typedef {import('./InstallList.svelte').InstallItem} InstallItem */
  /** @typedef {{ value: string, title: string, caption: string }} Choice */
  /** @typedef {{ id: string, title: string, items: readonly InstallItem[], installable?: readonly string[], emptyLabel?: string }} SetupSection */
  /** @typedef {{ id: string, title: string, purpose: string, status: string, settled: boolean, ready: number, total: number }} DigestRow */
  /**
   * What the install confirmation asks. `bulk` is the header's Install required, several items at once.
   * @typedef {{ target: string, description: string, bulk: boolean, methods?: readonly { id: string, label: string }[], method?: string | null }} SetupConfirm
   */
  /**
   * The onboarding steps, as the host's flow serves them. A null section is a step not offered.
   * @typedef {Object} SetupOnboarding
   * @property {'path' | 'configuration' | 'preference' | 'features' | 'connect' | 'summary'} view
   * @property {boolean} changing A step opened from the summary, not the first walk through.
   * @property {number} stepAt
   * @property {number} stepCount
   * @property {string | null} refusal What the engine said when it refused to save, in its words.
   * @property {boolean} saving
   * @property {{ choice: string, options: readonly Choice[] } | null} path
   * @property {{ choice: string, options: readonly (Choice & { detailedCaption: string })[] } | null} configuration Each option's caption, and the longer one Show details asks for.
   * @property {{ choice: string, options: readonly Choice[], note: string, because: readonly string[] }} preference
   * @property {readonly { id: string, title: string, caption: string, locked: boolean, checked: boolean, cloudOnly: boolean }[]} features
   * @property {{ pathTitle: string | null, canChangePath: boolean, preferenceTitle: string | null, turnedOn: string, connections: string, deviceTitle: string, device: string }} summary `preferenceTitle` null hides the row: under Basic the location is not asked.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly SetupSection[]} [sections] The full checklist, shown under Show details.
   * @property {string} [installScript] A script to run by hand, shown and copied, never run here; '' for none.
   * @property {(sectionId: string, itemId: string) => void} [onInstall] An install asked for from the checklist.
   * @property {() => void} [onCopyScript] Copies the script; the host owns the clipboard.
   * @property {SetupConfirm | null} [confirm] The install confirmation, or null when nothing is asked.
   * @property {() => void} [onConfirm] The install was agreed to.
   * @property {() => void} [onCancel] The confirmation was turned down or closed.
   * @property {(methodId: string) => void} [onChooseMethod] Another way to install it, which changes the command agreed to.
   * @property {number} [ready] The simple view's count of ready items.
   * @property {number} [total] How many items the count is out of.
   * @property {boolean} [requiredMissing] Something required is missing: the count reads as an alarm.
   * @property {string} [standing] A sentence beside the count when the check itself did not happen; '' for none.
   * @property {string} [probedLabel] When the engine last checked, in the reader's time; '' for none.
   * @property {boolean} [canProbe] Whether Check system again has anything to check.
   * @property {boolean} [probing] A check is running.
   * @property {boolean} [installRequired] Offers Install required: the engine reports required items it can install.
   * @property {string} [refusal] What the engine said when it refused an install; '' for none.
   * @property {readonly DigestRow[]} [digest] The simple view: one plain row per section.
   * @property {() => void} [onProbe] Check system again.
   * @property {() => void} [onInstallRequired] Install required: every required item at once, after one confirmation.
   * @property {() => void} [onDismissRefusal] The refusal was read.
   * @property {SetupOnboarding | null} [onboarding] The onboarding steps, or null for the simple view.
   * @property {(value: string) => void} [onChoosePath] A path was chosen; nothing is saved until Continue.
   * @property {(value: string) => void} [onChooseConfiguration] A configuration was chosen; nothing is saved until Continue.
   * @property {(value: string) => void} [onChoosePreference] How to run AI was chosen; nothing is saved until Continue.
   * @property {(featureId: string, on: boolean) => void} [onToggleFeature] A feature was turned on or off.
   * @property {(view: 'path' | 'preference' | 'features') => void} [onChangeStep] A summary row's Change….
   * @property {() => void} [onManage] The Connections row's Manage….
   * @property {() => void} [onBack] The step before.
   * @property {() => void} [onCancelChange] Cancel on a step opened from the summary.
   * @property {() => void} [onSkip] Skip for now.
   * @property {() => void} [onContinue] Saves this step and goes to the next.
   * @property {() => void} [onConnectDone] Done on the connect step: what is still to connect waits on the summary.
   * @property {() => void} [onDone] Done on the summary: closes the window.
   * @property {import('svelte').Snippet | undefined} [connect] The connect step, drawn by the host.
   */

  /** @type {Props} */
  let {
    sections = [],
    installScript = '',
    onInstall = undefined,
    onCopyScript = undefined,
    confirm = null,
    onConfirm = undefined,
    onCancel = undefined,
    onChooseMethod = undefined,
    ready = 0,
    total = 0,
    requiredMissing = false,
    standing = '',
    probedLabel = '',
    canProbe = false,
    probing = false,
    installRequired = false,
    refusal = '',
    digest = [],
    onProbe = undefined,
    onInstallRequired = undefined,
    onDismissRefusal = undefined,
    onboarding = null,
    onChoosePath = undefined,
    onChooseConfiguration = undefined,
    onChoosePreference = undefined,
    onToggleFeature = undefined,
    onChangeStep = undefined,
    onManage = undefined,
    onBack = undefined,
    onCancelChange = undefined,
    onSkip = undefined,
    onContinue = undefined,
    onConnectDone = undefined,
    onDone = undefined,
    connect = undefined,
  } = $props()

  // The simple view is the default; the full checklist is one click away for whoever wants
  // every tool, version and command.
  let showDetails = $state(false)
  /** @param {DigestRow} row */
  const markOf = (row) => (row.total === 0 ? 'unknown' : row.settled ? 'done' : row.id === 'required' ? 'alarm' : 'missing')
  /** @type {Record<string, string>} */
  const MARKS = { done: 'check', alarm: 'warning-circle', missing: 'circle-dashed', unknown: 'question' }

  // Each step's question takes focus when the step changes.
  /** @type {HTMLElement | null} */
  let question = $state(null)
  $effect(() => {
    void onboarding?.view
    question?.focus()
  })
</script>

{#snippet checklist()}
  <div id="setup-details" class="ui-setup__details">
    {#each sections as section (section.title)}
      <section class="ui-setup__section">
        {#if section.title}<h2 class="ui-setup__heading">{section.title}</h2>{/if}
        <InstallList
          label={section.title}
          items={section.items}
          installable={section.installable}
          emptyLabel={section.emptyLabel}
          onInstall={(item) => onInstall?.(section.id, item.id)} />
      </section>
    {/each}

    {#if installScript}
      <!-- For whoever would rather run it by hand. Shown and copied, never run from here. -->
      <details class="ui-setup__byhand">
        <summary>Install by hand</summary>
        <InstallScript script={installScript} onCopy={() => onCopyScript?.()} />
      </details>
    {/if}
  </div>
{/snippet}

{#snippet detailsToggle()}
  <button
    type="button"
    class="ui-setup__toggle"
    aria-expanded={showDetails}
    aria-controls="setup-details"
    onclick={() => (showDetails = !showDetails)}>
    <Icon name={showDetails ? 'caret-down' : 'caret-right'} />
    {showDetails ? 'Hide details' : 'Show details'}
  </button>
{/snippet}

{#if onboarding}
<!-- Onboarding: one question per screen, and the summary every later visit opens on. Fixed
     header, scrolling body, fixed footer; the full checklist stays one click away. -->
<div class="ui-setup">
  <header class="ui-setup__bar">
    <div class="ui-setup__standing">
      <!-- A step opened from the summary is part of Setup, not the first walk through. -->
      <h1 class="ui-setup__title">{onboarding.view === 'summary' || onboarding.changing ? 'Setup' : 'Get started'}</h1>
    </div>
    {#if onboarding.view !== 'summary' && !onboarding.changing}
      <span class="ui-setup__checked">Step {onboarding.stepAt} of {onboarding.stepCount}</span>
    {/if}
  </header>

  <div class="ui-setup__body">
    {#if onboarding.refusal}
      <!-- The engine's words, and the step and the selection stay. -->
      <OutcomeBanner tone="error" title="khaosd did not save that" detail={onboarding.refusal} />
    {/if}

    {#if onboarding.view === 'path' && onboarding.path}
      <div class="ui-setup__step">
        <h2 class="ui-setup__question" tabindex="-1" bind:this={question}>How do you want to set up Khaos?</h2>
        <p class="ui-setup__lead">You can switch in Settings any time.</p>
        <RadioChoiceList
          label="How do you want to set up Khaos?"
          value={onboarding.path.choice}
          options={onboarding.path.options}
          disabled={onboarding.saving}
          uiId="setup.path"
          onchange={(value) => onChoosePath?.(value)} />
      </div>
    {:else if onboarding.view === 'configuration' && onboarding.configuration}
      <div class="ui-setup__step">
        <h2 class="ui-setup__question" tabindex="-1" bind:this={question}>Which configuration do you want?</h2>
        <p class="ui-setup__lead">Each one is a ready-made set of AI services. You can change it in Settings.</p>
        <RadioChoiceList
          label="Which configuration do you want?"
          value={onboarding.configuration.choice}
          options={onboarding.configuration.options.map((option) => ({ value: option.value, title: option.title, caption: showDetails ? option.detailedCaption : option.caption }))}
          disabled={onboarding.saving}
          uiId="setup.configuration"
          onchange={(value) => onChooseConfiguration?.(value)} />
      </div>
    {:else if onboarding.view === 'preference'}
      <div class="ui-setup__step">
        <h2 class="ui-setup__question" tabindex="-1" bind:this={question}>How do you want to run AI?</h2>
        <p class="ui-setup__lead">You can change this any time.</p>
        <RadioChoiceList
          label="How do you want to run AI?"
          value={onboarding.preference.choice}
          options={onboarding.preference.options}
          note={onboarding.preference.note}
          disabled={onboarding.saving}
          uiId="setup.preference"
          onchange={(value) => onChoosePreference?.(value)} />
        {#if onboarding.preference.because.length > 0}
          <!-- Simple first, details on demand: the engine can give many reasons. -->
          <details class="ui-setup__byhand">
            <summary>Why this suggestion?</summary>
            <ul class="ui-setup__reasons">
              {#each onboarding.preference.because as reason, i (i)}<li>{reason}</li>{/each}
            </ul>
          </details>
        {/if}
      </div>
    {:else if onboarding.view === 'features'}
      <div class="ui-setup__step">
        <h2 class="ui-setup__question" tabindex="-1" bind:this={question}>What do you want to do?</h2>
        <p class="ui-setup__lead">Choose what to turn on. You can add more later.</p>
        <ul class="ui-setup__features" aria-label="Features">
          {#each onboarding.features as feature (feature.id)}
            <li class="ui-setup__feature">
              <Checkbox
                label={feature.title}
                checked={feature.checked}
                disabled={feature.locked || onboarding.saving}
                uiId={`setup.feature.${feature.id}`}
                onchange={(on) => onToggleFeature?.(feature.id, on)} />
              {#if feature.cloudOnly}
                <span class="ui-setup__note">Cloud only</span>
              {/if}
              <span class="ui-setup__caption"
                >{feature.caption}{feature.locked ? ' Always on: this is what Khaos is for.' : ''}</span>
            </li>
          {/each}
        </ul>
      </div>
    {:else if onboarding.view === 'connect'}
      <div class="ui-setup__step">
        <h2 class="ui-setup__question" tabindex="-1" bind:this={question}>Connect what you need</h2>
        {@render connect?.()}
      </div>
    {:else}
      {@const summary = onboarding.summary}
      <ul class="ui-setup__digest" aria-label="Your setup">
        {#if summary.pathTitle}
          <li class="ui-setup__summary-row">
            <span class="ui-setup__digest-title">Setup</span>
            <span class="ui-setup__digest-status">{summary.pathTitle}</span>
            {#if summary.canChangePath}
              <button type="button" class="ui-setup__again" onclick={() => onChangeStep?.('path')}>Change…</button>
            {/if}
          </li>
        {/if}
        {#if summary.preferenceTitle !== null}
          <li class="ui-setup__summary-row">
            <span class="ui-setup__digest-title">How you run AI</span>
            <span class="ui-setup__digest-status">{summary.preferenceTitle}</span>
            <button type="button" class="ui-setup__again" onclick={() => onChangeStep?.('preference')}>Change…</button>
          </li>
        {/if}
        <li class="ui-setup__summary-row">
          <span class="ui-setup__digest-title">Turned on</span>
          <span class="ui-setup__digest-status">{summary.turnedOn || 'Nothing yet'}</span>
          <button type="button" class="ui-setup__again" onclick={() => onChangeStep?.('features')}>Change…</button>
        </li>
        <li class="ui-setup__summary-row">
          <span class="ui-setup__digest-title">Connections</span>
          <span class="ui-setup__digest-status">{summary.connections || 'Nothing to connect'}</span>
          <button type="button" class="ui-setup__again" onclick={() => onManage?.()}>Manage…</button>
        </li>
        <li class="ui-setup__summary-row">
          <span class="ui-setup__digest-title">{summary.deviceTitle}</span>
          <!-- Its details are the footer's Show details: one control, not two. -->
          <span class="ui-setup__digest-status">{summary.device}</span>
        </li>
      </ul>
    {/if}

    {#if showDetails}{@render checklist()}{/if}
  </div>

  <footer class="ui-setup__foot">
    {@render detailsToggle()}
    <span class="ui-setup__spacer"></span>
    {#if onboarding.view === 'summary'}
      <button type="button" class="ui-setup__primary" onclick={() => onDone?.()}>Done</button>
    {:else}
      {#if onboarding.stepAt > 1 && !onboarding.changing}
        <button type="button" class="ui-setup__again" disabled={onboarding.saving} onclick={() => onBack?.()}>Back</button>
      {/if}
      {#if onboarding.changing}
        <button type="button" class="ui-setup__again" disabled={onboarding.saving} onclick={() => onCancelChange?.()}>Cancel</button>
      {:else}
        <button type="button" class="ui-setup__again" disabled={onboarding.saving} onclick={() => onSkip?.()}>Skip for now</button>
      {/if}
      {#if onboarding.view === 'connect'}
        <!-- Available at once: rows still to connect wait on the summary. -->
        <button type="button" class="ui-setup__primary" onclick={() => onConnectDone?.()}>Done</button>
      {:else}
        <button type="button" class="ui-setup__primary" disabled={onboarding.saving} onclick={() => onContinue?.()}>Continue</button>
      {/if}
    {/if}
  </footer>
</div>
{:else}
<div class="ui-setup">
  <header class="ui-setup__bar">
    <div class="ui-setup__standing">
      <h1 class="ui-setup__title">Setup</h1>
      <p class="ui-setup__stat" class:ui-setup__stat--alarm={requiredMissing}>
        <strong>{ready} of {total} ready</strong>
        {#if standing}<span aria-hidden="true">·</span> {standing}{/if}
      </p>
    </div>
    <div class="ui-setup__actions">
      {#if probedLabel}<span class="ui-setup__checked">{probedLabel}</span>{/if}
      <!-- Named apart from the offline banner's "Check again", which retries the engine itself:
           on the offline startup screen both are in view. -->
      <button type="button" class="ui-setup__again" disabled={!canProbe || probing} onclick={() => onProbe?.()}
        >{probing ? 'Checking…' : 'Check system again'}</button>
      <!-- The one primary action, shown only when the engine reports required items it can
           install: a newcomer's one obvious next step, and nothing to read past otherwise. -->
      {#if installRequired}
        <button type="button" class="ui-setup__primary" onclick={() => onInstallRequired?.()}>Install required</button>
      {/if}
    </div>
  </header>

  <div class="ui-setup__body">
    {#if refusal}
      <OutcomeBanner tone="error" title="khaosd did not start that" detail={refusal} dismissible onDismiss={() => onDismissRefusal?.()} />
    {/if}

    <!-- The simple view: one plain row per section, what it is for, and where it stands. -->
    <ul class="ui-setup__digest" aria-label="Summary">
      {#each digest as row (row.id)}
        {@const mark = markOf(row)}
        <li class="ui-setup__digest-row">
          <span class="ui-setup__mark" data-mark={mark} aria-hidden="true"
            ><Icon name={MARKS[mark] ?? 'question'} weight={mark === 'done' ? 'bold' : 'fill'} /></span>
          <span class="ui-setup__digest-text">
            <span class="ui-setup__digest-title">{row.title}</span>
            <span class="ui-setup__digest-purpose">{row.purpose}</span>
          </span>
          <span class="ui-setup__digest-status" data-mark={mark}>
            {row.status}{#if row.total > 0 && !row.settled && row.id !== 'optional'}&nbsp;· {row.ready} of {row.total}{/if}
          </span>
          {#if !row.settled && row.id !== 'required'}
            <button type="button" class="ui-setup__again" onclick={() => (showDetails = true)}
              >{row.id === 'engines' ? 'Set up…' : 'Choose…'}</button>
          {/if}
        </li>
      {/each}
    </ul>

    {@render detailsToggle()}

    {#if showDetails}{@render checklist()}{/if}
  </div>
</div>
{/if}

<!-- One click, one confirmation. The dialog names what will be installed and shows the
     engine's command, so nothing runs that was not seen first. -->
<ConfirmDialog
  open={confirm !== null}
  target={confirm?.target ?? ''}
  action="Install"
  confirmLabel={confirm?.bulk ? 'Install all' : 'Install'}
  cancelLabel={confirm?.bulk ? 'Not now' : 'Cancel'}
  tone="default"
  description={confirm?.description ?? ''}
  onConfirm={() => onConfirm?.()}
  onCancel={() => onCancel?.()}
  onOpenChange={(open) => { if (!open) onCancel?.() }}>
  <!-- More than one way to install it: the choice sits inside the confirmation because it
       changes the command being agreed to. -->
  {#if confirm?.methods && confirm.methods.length > 1}
    <SegmentedControl
      label="Install with"
      value={confirm.method ?? ''}
      items={confirm.methods.map((method) => ({ value: method.id, label: method.label }))}
      onselect={(id) => onChooseMethod?.(id)} />
  {/if}
</ConfirmDialog>

<style>
  /* A desktop window: a fixed header bar, and only the checklist under it scrolls. */
  .ui-setup {
    display: flex;
    flex-direction: column;
    height: 100vh;
    color: var(--text-primary);
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
  }

  .ui-setup__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-bottom: 1px solid var(--border-default);
  }

  .ui-setup__standing {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  .ui-setup__title {
    margin: 0;
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    font-weight: var(--heading-md-weight);
  }

  .ui-setup__stat {
    display: flex;
    gap: 6px;
    margin: 0;
    min-width: 0;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ui-setup__stat strong {
    color: var(--text-primary);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  /* Something required is missing: the one sentence in the header that needs you. */
  .ui-setup__stat--alarm,
  .ui-setup__stat--alarm strong {
    color: var(--tone-danger);
  }

  .ui-setup__actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex: none;
  }

  .ui-setup__checked {
    margin-right: var(--spacing-xs);
    color: var(--text-secondary);
    font-size: var(--caption-size);
    font-variant-numeric: tabular-nums;
  }

  .ui-setup__primary,
  .ui-setup__again {
    min-height: 26px;
    padding: 0 var(--spacing-sm);
    border-radius: var(--radius-sm);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .ui-setup__primary {
    border: 1px solid var(--action-primary-border);
    background: var(--action-primary);
    color: var(--action-on-primary);
  }

  .ui-setup__primary:active:not(:disabled) {
    background: var(--action-primary-pressed);
  }

  /* Nothing to install: the primary action steps back rather than shouting disabled. */
  .ui-setup__primary:disabled {
    border-color: var(--border-default);
    background: transparent;
    color: var(--text-secondary);
    opacity: 0.6;
    cursor: default;
  }

  .ui-setup__again {
    border: 1px solid var(--border-default);
    background: var(--surface-raised);
    color: var(--text-primary);
  }

  .ui-setup__again:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .ui-setup__primary:focus-visible,
  .ui-setup__again:focus-visible,
  .ui-setup__byhand summary:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-setup__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
  }

  .ui-setup__digest {
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid var(--border-default);
  }

  .ui-setup__digest-row {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto auto;
    align-items: center;
    column-gap: var(--spacing-sm);
    min-height: 48px;
    padding: 6px 0;
    border-bottom: 1px solid var(--border-default);
  }

  .ui-setup__mark {
    display: inline-flex;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 16px;
  }

  .ui-setup__mark[data-mark='done'] { color: var(--tone-success); }
  .ui-setup__mark[data-mark='alarm'] { color: var(--tone-danger); }

  .ui-setup__digest-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .ui-setup__digest-title {
    font-weight: 600;
  }

  .ui-setup__digest-purpose {
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  .ui-setup__digest-status {
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .ui-setup__digest-status[data-mark='alarm'] {
    color: var(--tone-danger);
    font-weight: 600;
  }

  .ui-setup__toggle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    align-self: flex-start;
    padding: 2px 0;
    border: 0;
    background: none;
    color: var(--text-secondary);
    font: inherit;
    font-size: var(--caption-size);
    cursor: pointer;
  }

  .ui-setup__toggle:hover {
    color: var(--text-primary);
  }

  .ui-setup__toggle:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-setup__details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .ui-setup__section {
    display: flex;
    flex-direction: column;
  }

  .ui-setup__heading {
    margin: 0;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border-default);
    color: var(--text-secondary);
    font-size: var(--caption-size);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ui-setup__byhand summary {
    color: var(--text-secondary);
    font-size: var(--caption-size);
    cursor: pointer;
  }

  /* Onboarding: one question per screen, rows of one line plus a caption. */
  .ui-setup__step {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .ui-setup__question {
    margin: 0;
    font-size: var(--heading-md-size);
    font-weight: 600;
  }

  .ui-setup__question:focus {
    outline: none;
  }

  .ui-setup__lead,
  .ui-setup__caption,
  .ui-setup__note {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  .ui-setup__reasons {
    margin: var(--spacing-xs) 0 0;
    padding-left: var(--spacing-lg);
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }

  .ui-setup__features {
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid var(--border-default);
  }

  .ui-setup__feature {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: var(--spacing-sm);
    padding: 6px 0;
    border-bottom: 1px solid var(--border-default);
  }

  .ui-setup__feature .ui-setup__caption {
    grid-column: 1 / -1;
    padding-left: 24px;
  }

  .ui-setup__summary-row {
    display: grid;
    grid-template-columns: 9rem minmax(0, 1fr) auto;
    align-items: center;
    column-gap: var(--spacing-sm);
    min-height: 40px;
    border-bottom: 1px solid var(--border-default);
  }

  .ui-setup__summary-row .ui-setup__digest-status {
    white-space: normal;
  }

  .ui-setup__foot {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-top: 1px solid var(--border-default);
  }

  .ui-setup__spacer {
    flex: 1;
  }
</style>

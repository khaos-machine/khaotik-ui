<script>
  // The Settings window: the kit's Settings frame with a pane per category. Moved from Khaos
  // App's src/ui/Settings.svelte (catalog app-coverage plan, T9). Every value is the host's and
  // every control reports intent; the host saves, and the pane shows what the engine answered.
  // Providers and Models are the host's own views, passed in as snippets.
  import { tick } from 'svelte'
  import Button from './Button.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import EmptyState from './EmptyState.svelte'
  import InstallList from './InstallList.svelte'
  import OutcomeBanner from './OutcomeBanner.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import ProviderBadge from './ProviderBadge.svelte'
  import RadioChoiceList from './RadioChoiceList.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  import Settings from './Settings.svelte'
  import ServiceStatusList from './ServiceStatusList.svelte'
  import SetupProgress from './SetupProgress.svelte'
  import StatusPill from './StatusPill.svelte'
  import Toggle from './Toggle.svelte'

  /** @typedef {import('./InstallList.svelte').InstallItem} InstallItem */
  /** @typedef {import('./ServiceStatusList.svelte').Service} Service */
  /** @typedef {{ value: string, title: string, caption: string }} Choice */
  /**
   * The Basic-or-Advanced chooser and, under Advanced, its switches and what they need here.
   * @typedef {{ path: string | null, options: readonly Choice[], advancedCaption: string, saving: boolean, error: string, advanced: boolean, history: boolean, gitSync: boolean, featureSaving: boolean, featureError: string, needed: readonly InstallItem[], installable: readonly string[] }} SettingsPath
   */
  /**
   * The configurations khaosd offers. Under Basic one is the routes; under Advanced each is a starting point.
   * @typedef {{ basic: boolean, options: readonly { id: string, title: string, caption: string, applied: boolean }[], saving: boolean, canShare: boolean, notice: string, error: string }} SettingsConfigurations
   */
  /**
   * One capability's row in Routing. `control` names what the row draws: one grouped picker,
   * the older provider-then-model pair, or nothing.
   * @typedef {{ kind: 'grouped', groups: readonly { title: string, options: readonly { key: string, label: string, disabled: boolean }[] }[], selectedKey: string } | { kind: 'two-select', providers: readonly { id: string, title: string, disabled: boolean }[], provider: string, models: readonly { id: string, title: string, recommended?: boolean }[], model: string, busy: boolean } | { kind: 'read-only' } | { kind: 'invalid' }} RoutingControl
   */
  /** @typedef {{ id: string, label: string, enabled: boolean, providerTitle: string, modelLabel: string, routeLabel: string, tone: import('./lib/types.js').StatusTone, quietModel: boolean, note: string, error: string, control: RoutingControl }} RoutingRow */
  /** @typedef {{ kind: 'preflight', id: string, name: string, steps: readonly { name: string, state?: string, detail?: string }[] } | { kind: 'run', id: string, name: string, busy: boolean }} SetupCard */

  /**
   * @typedef {Object} Props
   * @property {readonly { id: string, label: string, icon?: string }[]} [panes] The categories, in order.
   * @property {string} [pane] The pane being shown.
   * @property {(id: string) => void} [onSelectPane] A category was chosen.
   * @property {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded' }} [status] The engine's settings read; a failure is the engine's own words. Not `state`: a prop by that name turns every $state(...) here into a store read.
   * @property {SettingsPath | null} [path] Providers' Basic or Advanced chooser, or null when only one is offered.
   * @property {(path: string) => void} [onChoosePath] A path was chosen; switching to Advanced is confirmed first.
   * @property {() => void} [onConfirmAdvanced] Switching to Advanced was agreed to.
   * @property {() => void} [onCancelPath] Switching to Advanced was turned down.
   * @property {boolean} [confirmingAdvanced] The switch to Advanced is being asked.
   * @property {(feature: 'history' | 'gitSync', on: boolean) => void} [onToggleFeature] An Advanced switch was turned.
   * @property {(itemId: string) => void} [onInstallNeeded] An install asked for from what the switches need.
   * @property {SettingsConfigurations | null} [configurations] The configurations offered, or null when none are served.
   * @property {(id: string, start: boolean) => Promise<boolean> | boolean} [onApplyConfiguration] Applies one; `start` under Advanced. Resolves true once saved.
   * @property {(name: string) => void} [onExportConfiguration] Export… with the name typed; the engine builds the record.
   * @property {() => void} [onImportConfiguration] Import…; the engine judges what is imported.
   * @property {import('svelte').Snippet | undefined} [providers] The host's providers view, under the path and configuration.
   * @property {readonly { id: string, title: string, rows: readonly RoutingRow[] }[]} [routing] Routing's rows, by kind; a group with no title has no heading.
   * @property {boolean} [routingSaving] A routing save is in flight: every picker waits.
   * @property {(capabilityId: string, key: string) => Promise<void> | void} [onChooseRoute] A grouped row's choice, which is the save.
   * @property {(capabilityId: string, providerId: string) => void} [onChooseProvider] The older pair's provider was chosen.
   * @property {(capabilityId: string, modelId: string) => void} [onChooseModel] The older pair's model was chosen, which is the save.
   * @property {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded', rows: readonly Service[] }} [engines] On-device engines, as the engine lists them.
   * @property {readonly SetupCard[]} [setupCards] Checks before a setup, and the setup in flight.
   * @property {string} [pendingId] The engine whose action is in flight.
   * @property {string} [pendingMessage] What the wait means, beside the row in flight; '' for none.
   * @property {string} [actionError] What the engine said when an action failed; '' for none.
   * @property {boolean} [provisionNote] Some engines are not installed: say what setting one up costs.
   * @property {(id: string) => void} [onStartEngine] Start an engine.
   * @property {(id: string) => void} [onStopEngine] Stop an engine.
   * @property {(id: string) => void} [onProvisionEngine] Set up was agreed to, after the confirmation here.
   * @property {(id: string, on: boolean) => void} [onStartWithKhaos] An engine's Start with Khaos switch was turned.
   * @property {import('svelte').Snippet | undefined} [models] The host's models view.
   * @property {{ version: string, host: string, port: number | string, pid: number | string, uptime: string }} [engine] The engine this window talks to; uptime '' when it cannot be told.
   * @property {readonly { value: string, label: string }[]} [appearances] The appearances General offers.
   * @property {string} [appearance] This window's appearance.
   * @property {(value: string) => void} [onAppearance] An appearance was chosen, for every window.
   * @property {string} [appVersion] The app's own version.
   * @property {{ name: string, description: string } | null} [confirmTool] A tool install being asked, or null.
   * @property {() => void} [onConfirmTool] The tool install was agreed to.
   * @property {() => void} [onCancelTool] The tool install was turned down.
   */

  /** @type {Props} */
  let {
    panes = [],
    pane = '',
    onSelectPane = undefined,
    status = { kind: 'loaded' },
    path = null,
    onChoosePath = undefined,
    onConfirmAdvanced = undefined,
    onCancelPath = undefined,
    confirmingAdvanced = false,
    onToggleFeature = undefined,
    onInstallNeeded = undefined,
    configurations = null,
    onApplyConfiguration = undefined,
    onExportConfiguration = undefined,
    onImportConfiguration = undefined,
    providers = undefined,
    routing = [],
    routingSaving = false,
    onChooseRoute = undefined,
    onChooseProvider = undefined,
    onChooseModel = undefined,
    engines = { kind: 'loaded', rows: [] },
    setupCards = [],
    pendingId = '',
    pendingMessage = '',
    actionError = '',
    provisionNote = false,
    onStartEngine = undefined,
    onStopEngine = undefined,
    onProvisionEngine = undefined,
    onStartWithKhaos = undefined,
    models = undefined,
    engine = { version: '', host: '', port: '', pid: '', uptime: '' },
    appearances = [],
    appearance = '',
    onAppearance = undefined,
    appVersion = '',
    confirmTool = null,
    onConfirmTool = undefined,
    onCancelTool = undefined,
  } = $props()

  /** Basic's Change: the configuration list is open. */
  let changingConfiguration = $state(false)
  /** The title an export carries. */
  let exportName = $state('')
  /**
   * The engine awaiting an answer about setting it up. Held here so there is no path from the
   * row's button to the install that does not pass through the confirmation.
   * @type {{ id: string, name: string } | null}
   */
  let setupTarget = $state(null)
  /** The run card's transcript disclosure. */
  let setupTranscriptOpen = $state(false)

  /**
   * A grouped row's choice, which is the save. Saving disables the picker, and a disabled
   * control can drop focus to the document; so focus goes back to it once the save settles,
   * if it held focus when the save began.
   * @param {string} capabilityId @param {HTMLSelectElement} picker
   */
  async function chooseRoute(capabilityId, picker) {
    const focused = document.activeElement === picker
    await onChooseRoute?.(capabilityId, picker.value)
    await tick()
    if (focused && picker.isConnected) picker.focus()
  }

  /** @param {string} id @param {boolean} start */
  async function applyConfiguration(id, start) {
    if ((await onApplyConfiguration?.(id, start)) && !start) changingConfiguration = false
  }

  function confirmSetup() {
    const target = setupTarget
    setupTarget = null
    if (target) onProvisionEngine?.(target.id)
  }
</script>

<main class="ui-settings-window">
  <Settings categories={panes} selected={pane} onSelect={(id) => onSelectPane?.(id)}>
    {#if status.kind === 'loading'}
      <EmptyState title="Reading the engine's settings…" icon="circle-notch" />
    {:else if status.kind === 'failed'}
      <!-- The engine's own words, never a message this window invented. -->
      <EmptyState title="Could not read the engine's settings" description={status.message} icon="warning" />
    {:else if pane === 'providers'}
      {#if path}
        <!-- Basic or Advanced, switchable any time. The engine's path is the value; Advanced
             states its needs in its caption and again before anything is written. -->
        <div>
          <RadioChoiceList
            label="Basic or Advanced"
            value={path.path ?? ''}
            options={path.options}
            disabled={path.saving}
            uiId="settings.path"
            onchange={(value) => onChoosePath?.(value)} />
          {#if path.error}
            <OutcomeBanner tone="error" title="khaosd did not save that" detail={path.error} />
          {/if}
          {#if path.advanced}
            <!-- The Advanced switches, with the engine's effective values. Git is named only
                 here, under Advanced, and says what it is for. -->
            <div role="group" aria-label="Advanced features">
              <Toggle
                label="Project history"
                hint="Save versions of a project so you can go back. Uses git and Git LFS on this Mac."
                checked={path.history}
                disabled={path.featureSaving}
                onchange={(on) => onToggleFeature?.('history', on)} />
              <Toggle
                label="Git sync"
                hint="Push a project to a Git remote and clone one. Needs project history."
                checked={path.gitSync}
                disabled={path.featureSaving}
                onchange={(on) => onToggleFeature?.('gitSync', on)} />
            </div>
            {#if path.featureError}
              <OutcomeBanner tone="error" title="khaosd did not save that" detail={path.featureError} />
            {/if}
            {#if (path.history || path.gitSync) && path.needed.length > 0}
              <InstallList
                label="Needed on this Mac"
                items={path.needed}
                installable={path.installable}
                onInstall={(item) => onInstallNeeded?.(item.id)} />
            {/if}
          {/if}
        </div>
      {/if}
      {#if configurations}
        {@const applied = configurations.options.find((c) => c.applied) ?? null}
        <!-- A configuration is a named set of routes. Under Basic it is the route source; under
             Advanced it is a starting point for the route editor. -->
        <section aria-label="Configuration">
          {#if configurations.basic}
            {#if applied && !changingConfiguration}
              <p>
                Your configuration: <strong>{applied.title}</strong>
                <Button variant="text" onclick={() => (changingConfiguration = true)}>Change</Button>
              </p>
            {:else}
              <p>{applied ? 'Choose another configuration' : 'Choose a configuration'}</p>
              <RadioChoiceList
                label="Configuration"
                value={applied?.id ?? ''}
                options={configurations.options.map((c) => ({ value: c.id, title: c.title, caption: c.caption }))}
                disabled={configurations.saving}
                uiId="settings.configuration"
                onchange={(value) => void applyConfiguration(value, false)} />
            {/if}
          {:else}
            <p>Start from a configuration, then change any route.</p>
            <ul class="ui-settings-window__configuration-list">
              {#each configurations.options as c (c.id)}
                <li>
                  <Button disabled={configurations.saving} onclick={() => void applyConfiguration(c.id, true)}
                    >Start from {c.title}</Button>
                  <span class="ui-settings-window__configuration-summary">{c.caption}</span>
                </li>
              {/each}
            </ul>
          {/if}
          {#if configurations.canShare}
            <!-- Share: the engine builds the record and judges an import; never credentials. -->
            <div class="ui-settings-window__configuration-share">
              <label class="ui-settings-window__configuration-name">
                <span>Name for this configuration</span>
                <input type="text" bind:value={exportName} disabled={configurations.saving} />
              </label>
              <Button
                disabled={configurations.saving || exportName.trim() === ''}
                onclick={() => onExportConfiguration?.(exportName.trim())}>Export…</Button>
              <Button disabled={configurations.saving} onclick={() => onImportConfiguration?.()}>Import…</Button>
            </div>
            {#if configurations.notice}<p class="ui-settings-window__note">{configurations.notice}</p>{/if}
          {/if}
          {#if configurations.error}
            <OutcomeBanner tone="error" title="khaosd did not save that" detail={configurations.error} />
          {/if}
        </section>
      {/if}
      {@render providers?.()}
    {:else if pane === 'routing'}
      <div class="ui-settings-window__table-head" aria-hidden="true">
        <span>Capability</span><span>Provider</span><span>Model</span>
      </div>
      {#each routing as group (group.id)}
        <section class="ui-settings-window__group" aria-label={group.title || undefined}>
          {#if group.title}<h2 class="ui-settings-window__group-title">{group.title}</h2>{/if}
          <ul class="ui-settings-window__rows">
            {#each group.rows as route (route.id)}
              <li class="ui-settings-window__row" class:ui-settings-window__row--disabled={!route.enabled}>
                <div class="ui-settings-window__row-head">
                  <span class="ui-settings-window__cap">{route.label}</span>
                  <!-- A routed row splits in two: the provider as a badge, the model alone in
                       the pill. The unrouted row's label is the whole sentence. -->
                  {#if route.providerTitle}
                    <ProviderBadge provider={route.providerTitle} />
                    {#if !route.quietModel}
                      <StatusPill text={route.modelLabel} tone={route.tone} />
                    {/if}
                  {:else}
                    <StatusPill text={route.routeLabel} tone={route.tone} />
                  {/if}
                </div>
                <!-- One sentence about the row as a whole, above its controls: where the fix lives. -->
                {#if route.note}
                  <p class="ui-settings-window__note">{route.note}</p>
                {/if}
                {#if route.control.kind === 'grouped'}
                  {@const control = route.control}
                  <!-- One native picker, a group per provider, not-ready options disabled with the
                       reason in their text. The placeholder exists only while unrouted. -->
                  <label class="ui-settings-window__control">
                    <span>Model</span>
                    <select
                      aria-label="{route.label} route"
                      value={control.selectedKey}
                      disabled={routingSaving || control.groups.length === 0}
                      aria-busy={routingSaving}
                      onchange={(event) => void chooseRoute(route.id, event.currentTarget)}>
                      {#if control.selectedKey === ''}
                        <option value="" disabled selected>Choose Model</option>
                      {/if}
                      {#each control.groups as group, index (index)}
                        <optgroup label={group.title}>
                          {#each group.options as option (option.key)}
                            <option value={option.key} disabled={option.disabled}>{option.label}</option>
                          {/each}
                        </optgroup>
                      {/each}
                    </select>
                  </label>
                  {#if route.error}
                    <p class="ui-settings-window__error" role="alert">{route.error}</p>
                  {/if}
                {:else if route.control.kind === 'two-select'}
                  {@const control = route.control}
                  <!-- The capability is in each name: two comboboxes both called "Provider"
                       leave a screen reader unable to say which model is about to be pinned. -->
                  <label class="ui-settings-window__control">
                    <span>Provider</span>
                    <select
                      aria-label="{route.label} provider"
                      value={control.provider}
                      disabled={control.busy || routingSaving}
                      onchange={(event) => onChooseProvider?.(route.id, event.currentTarget.value)}>
                      <option value="">Choose Provider</option>
                      {#each control.providers as provider (provider.id)}
                        <option value={provider.id} disabled={provider.disabled}>{provider.title}</option>
                      {/each}
                    </select>
                  </label>
                  <label class="ui-settings-window__control">
                    <span>Model</span>
                    <select
                      aria-label="{route.label} model"
                      value={control.model}
                      disabled={control.busy || routingSaving || !control.provider || control.models.length === 0}
                      onchange={(event) => onChooseModel?.(route.id, event.currentTarget.value)}>
                      <option value="">Choose Model</option>
                      {#each control.models as model (model.id)}
                        <option value={model.id}>{model.title}{model.recommended ? ' · Recommended' : ''}</option>
                      {/each}
                    </select>
                  </label>
                  {#if route.error}
                    <p class="ui-settings-window__error" role="alert">{route.error}</p>
                  {/if}
                {/if}
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    {:else if pane === 'engines'}
      <!-- No heading of its own: the frame already titles every pane. -->
      <p class="ui-settings-window__note">
        Model runners khaosd supervises on this Mac. Starting one can take up to 90 seconds.
      </p>
      <!-- Checks before a setup, and the setup in flight, under the list. Rendered after a failed
           read too, because the run card belongs to the run, not to the list. -->
      {#snippet cards()}
        {#each setupCards as card (card.kind + card.id)}
          {#if card.kind === 'preflight'}
            <SetupProgress title={`${card.name} · before setup`} steps={card.steps} label="No setup transcript for these checks" />
          {:else}
            <SetupProgress
              title={`Setting up ${card.name}`}
              busy={card.busy}
              note="khaosd holds this request for up to five minutes and reports no progress until it finishes."
              emptyLabel="khaosd does not stream the setup transcript; only its step reports reach this window."
              open={setupTranscriptOpen}
              onToggle={(open) => (setupTranscriptOpen = open)} />
          {/if}
        {/each}
      {/snippet}
      {#if engines.kind === 'loading'}
        <EmptyState title="Reading the on-device engines…" icon="circle-notch" />
      {:else if engines.kind === 'failed'}
        <!-- Its own failure, deliberately: it must not blank the panes that did load. -->
        <EmptyState title="Could not read the on-device engines" description={engines.message} icon="warning" />
        {@render cards()}
      {:else}
        <ServiceStatusList
          services={engines.rows}
          onStart={(service) => onStartEngine?.(service.id)}
          onStop={(service) => onStopEngine?.(service.id)}
          onSetup={(service) => (setupTarget = { id: service.id, name: service.name })}
          onStartWithKhaos={(service, on) => onStartWithKhaos?.(service.id, on)}
          {pendingId}
          emptyLabel="No on-device engines are registered." />
        {@render cards()}
        {#if pendingMessage}
          <p class="ui-settings-window__note" role="status">{pendingMessage}</p>
        {/if}
        <!-- A failure is the engine's message. Success is not banner-worthy: the row already
             shows the condition the engine reported. -->
        {#if actionError}
          <OutcomeBanner tone="error" title="The engine could not complete that" detail={actionError} dismissible={false} />
        {/if}
        {#if provisionNote}
          <p class="ui-settings-window__note">
            These engines have no virtual environment on disk, so starting them is not one
            action away. Provisioning installs their packages onto this machine.
          </p>
        {/if}
      {/if}
    {:else if pane === 'models'}
      {@render models?.()}
    {:else if pane === 'engine'}
      <p class="ui-settings-window__note">The khaosd this window is talking to.</p>
      <div class="ui-settings-window__props">
        <PropertyRow label="Version"><span class="ui-settings-window__mono">{engine.version}</span></PropertyRow>
        <PropertyRow label="Address"><span class="ui-settings-window__mono">{engine.host || '127.0.0.1'}</span></PropertyRow>
        <PropertyRow label="Port"><span class="ui-settings-window__mono">{engine.port}</span></PropertyRow>
        <PropertyRow label="Process"><span class="ui-settings-window__mono">pid {engine.pid}</span></PropertyRow>
        <!-- Omitted when it cannot be told, rather than a dash with a number behind it. -->
        {#if engine.uptime}
          <PropertyRow label="Uptime"><span class="ui-settings-window__mono">{engine.uptime}</span></PropertyRow>
        {/if}
      </div>
    {:else}
      <div class="ui-settings-window__props">
        <PropertyRow label="Appearance">
          <SegmentedControl label="Appearance" items={appearances} value={appearance} onselect={(value) => onAppearance?.(value)} />
        </PropertyRow>
        <PropertyRow label="Khaos App"><span class="ui-settings-window__mono">{appVersion}</span></PropertyRow>
      </div>
      <p class="ui-settings-window__note">Updates are in the Khaos App menu.</p>
    {/if}
  </Settings>

  <!-- Each confirmation is kept out of the DOM until it is wanted: mounted unconditionally,
       Ark's dialog machine logs `derived_inert` on every teardown. -->
  {#if confirmTool}
    <ConfirmDialog
      open
      target={confirmTool.name}
      action="Install"
      confirmLabel="Install"
      cancelLabel="Cancel"
      tone="default"
      description={confirmTool.description}
      onConfirm={() => onConfirmTool?.()}
      onCancel={() => onCancelTool?.()} />
  {/if}

  {#if confirmingAdvanced && path}
    <ConfirmDialog
      open
      target="Advanced"
      action="Switch to"
      confirmLabel="Switch to Advanced"
      cancelLabel="Cancel"
      tone="default"
      description={path.advancedCaption}
      onConfirm={() => onConfirmAdvanced?.()}
      onCancel={() => onCancelPath?.()} />
  {/if}

  <!-- Not a destructive confirmation, so the tone is default: it exists because setting an
       engine up installs packages onto the machine and occupies the engine for minutes, and
       neither is undone. The description says both, in that order. -->
  {#if setupTarget}
    <ConfirmDialog
      open
      target={setupTarget.name}
      action="Set up"
      confirmLabel="Install packages"
      cancelLabel="Cancel"
      tone="default"
      description={`Provisioning ${setupTarget.name} creates a Python virtual environment and ` +
        `installs its packages onto this machine. The engine holds the request for up to five ` +
        `minutes and reports no progress until it finishes. Nothing is removed, and there is ` +
        `no undo.`}
      onConfirm={confirmSetup}
      onCancel={() => (setupTarget = null)}
      onOpenChange={(open) => {
        if (!open) setupTarget = null
      }} />
  {/if}
</main>

<style>
  /* Desktop preferences density: the kit's 13px body, row dividers rather than cards, and
     notes that read as captions. The Settings shell owns the window's padding. */
  .ui-settings-window {
    height: 100vh;
    background: var(--surface-base, transparent);
    color: var(--text-primary);
  }

  .ui-settings-window__note {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    max-width: 72ch;
  }

  /* Configurations (CR-A2): one line under Basic, a short list of starting points under
     Advanced, each button beside khaosd's summary. */
  .ui-settings-window__configuration-list {
    list-style: none;
    margin: var(--spacing-xs) 0 0;
    padding: 0;
    display: grid;
    gap: var(--spacing-xs);
  }

  .ui-settings-window__configuration-list li {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-sm);
  }

  .ui-settings-window__configuration-share {
    display: flex;
    align-items: flex-end;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
  }

  .ui-settings-window__configuration-name {
    display: grid;
    gap: var(--spacing-xs);
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }

  .ui-settings-window__configuration-summary {
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }

  .ui-settings-window__group + .ui-settings-window__group {
    margin-top: var(--spacing-sm);
  }

  .ui-settings-window__group-title {
    margin: 0 0 var(--spacing-xs);
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-weight: 600;
  }

  /* Routing reads as a table: Capability · Provider · Model · status. */
  .ui-settings-window__table-head,
  .ui-settings-window__row {
    display: grid;
    grid-template-columns: 136px 168px minmax(0, 1fr) auto;
    column-gap: var(--spacing-sm);
    align-items: center;
  }

  .ui-settings-window__table-head {
    padding: 0 0 var(--spacing-xs);
    border-bottom: 1px solid var(--border-default);
    color: var(--text-secondary);
    font-size: var(--caption-size);
    font-weight: 600;
  }

  .ui-settings-window__rows {
    list-style: none;
    margin: calc(-1 * var(--spacing-md)) 0 0;
    padding: 0;
  }

  .ui-settings-window__row {
    row-gap: 4px;
    min-height: 40px;
    padding: 6px 0;
    border-bottom: 1px solid var(--border-default);
  }

  /* The head's three parts are cells of the row's grid, not a box of their own. */
  .ui-settings-window__row-head {
    display: contents;
  }

  .ui-settings-window__row-head > :global(:nth-child(2)) {
    grid-column: 2;
    justify-self: start;
  }

  .ui-settings-window__row-head > :global(:nth-child(3)) {
    grid-column: 4;
  }

  .ui-settings-window__cap {
    grid-column: 1;
    font-weight: 600;
  }

  .ui-settings-window__row .ui-settings-window__control {
    grid-column: 3;
    grid-row: 1;
  }

  .ui-settings-window__row .ui-settings-window__note,
  .ui-settings-window__row .ui-settings-window__error {
    grid-column: 2 / -1;
  }

  /*
    The dimming stops at the head, and that is load-bearing rather than tidy: `opacity` on
    the row composites the whole subtree and a child CANNOT undo it, so a read-only row
    carrying an explanation would render that explanation at 0.42 — unreadable, which is
    worse than not saying it.
  */
  .ui-settings-window__row--disabled .ui-settings-window__row-head > :global(*) {
    opacity: 0.42;
  }

  /* Each picker carries its own aria-label; the column header names it for the eye. */
  .ui-settings-window__control {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .ui-settings-window__control > span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .ui-settings-window__control select {
    width: 100%;
    max-width: 360px;
    min-height: 24px;
    padding: 2px 6px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    background: var(--surface-raised);
    font: inherit;
  }

  .ui-settings-window__error {
    margin: 0;
    color: var(--tone-danger);
    font-size: var(--caption-size);
  }

  .ui-settings-window__props {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-width: 480px;
  }

  /* The daemon's mask and the engine's own identifiers read as data, not as prose. */
  .ui-settings-window__mono {
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--data-md-size);
  }
</style>

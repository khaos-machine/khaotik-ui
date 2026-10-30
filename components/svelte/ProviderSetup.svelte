<script>
  // Providers: the services Khaos uses, grouped by kind, each with its connection, and the sheet
  // that connects one (a key, a browser or device sign-in, or a check) and shows what khaosd says
  // about it. Every read and write is the host's provider model's; this holds only the sheet's
  // own state: whether it is open, what is being typed, and which attempt is current, so a slow
  // answer for a closed sheet changes nothing. Moved from Khaos App (catalog app-coverage plan, T9).
  import { DialogBackdrop, DialogCloseTrigger, DialogContent, Positioner as DialogPositioner, Root as DialogRoot, Title as DialogTitle } from '@ark-ui/svelte/dialog'
  import EmptyState from './EmptyState.svelte'
  import Icon from './Icon.svelte'
  import LabeledField from './LabeledField.svelte'
  import ProviderMark from './ProviderMark.svelte'
  import SectionHeader from './SectionHeader.svelte'
  import StatusPill from './StatusPill.svelte'
  import { providerRowStatus } from './lib/providers.js'

  /** @typedef {import('./lib/providers.js').ProviderSetupOption} ProviderSetupOption */
  /** @typedef {{ id: string, label: string, sensitive: boolean, required: boolean }} ProviderSetupInput */
  /**
   * One step of khaosd's setup plan for a provider, in the fields the sheet reads.
   * @typedef {{ kind: string, state: 'pending' | 'available' | 'running' | 'ready' | 'blocked' | 'failed', title: string, reason?: string, cause?: 'client_not_registered', inputs?: readonly ProviderSetupInput[] }} ProviderSetupStep
   */
  /** @typedef {{ id: string, label: string, providers: readonly ProviderSetupOption[] }} ProviderGroup */

  /**
   * @typedef {Object} Props
   * @property {boolean} [embedded] Inside Settings, whose frame titles the pane: no second title.
   * @property {readonly ProviderSetupOption[]} [providers] Every provider khaosd knows, for the sheet.
   * @property {readonly ProviderSetupOption[]} [configuredProviders] The ones added.
   * @property {readonly ProviderGroup[]} [configuredProviderGroups] The added ones, by kind; a group with no label has no heading.
   * @property {readonly ProviderSetupOption[]} [availableProviders] The ones that can be added.
   * @property {readonly ProviderGroup[]} [availableProviderGroups] The same, by kind, for Add provider.
   * @property {boolean} [loadingProviders] The list is being read.
   * @property {string | null} [selectedProviderId] The provider whose sheet is open; null closes it.
   * @property {boolean} [loadingSelection] Its setup plan is being read.
   * @property {{ steps: readonly ProviderSetupStep[], credentialScope?: { kind: 'shared', providers: readonly { id: string, title: string }[] } } | null} [plan] khaosd's setup plan for it.
   * @property {string | null} [busyKind] The step kind being run, or null.
   * @property {'idle' | 'callback' | 'code-paste' | 'device'} [oauthFlow] The sign-in under way.
   * @property {string | null} [userCode] A device sign-in's code.
   * @property {string} [copyCodeLabel] The copy button's words ("Copy code", then "Copied").
   * @property {boolean} [canReopenSignIn] The browser tab was closed too soon: offer it again.
   * @property {readonly { id: string, title: string, uses: readonly string[] }[] | null} [installedModels] A local server's models, or null when it is not one.
   * @property {{ providerId: string, title: string, text: string } | null} [pendingDisclosure] khaosd's disclosure, shown before a sign-in starts.
   * @property {string} [notice] What khaosd last said, or ''.
   * @property {string} [error] What went wrong, or ''.
   * @property {string | null} [completedProviderId] A provider whose setup just finished.
   * @property {{ kind: string, preference?: string | null }} [onboarding] How Khaos runs AI, as khaosd serves it; only `served` carries a preference.
   * @property {{ kind: string, path?: string | null }} [pathSetup] The Basic or Advanced path; only `served` carries one, and it is null until chosen.
   * @property {(step: ProviderSetupStep) => boolean} [isActionable] Whether khaosd would run this step now.
   * @property {(providerId: string) => Promise<void> | void} [onChoose] Opens a provider's setup.
   * @property {() => void} [onDismiss] The sheet was closed: the host clears its selection.
   * @property {(providerId: string, step: ProviderSetupStep, value: string) => Promise<boolean>} [onSaveApiKey] Saves a key; resolves true once custody holds it.
   * @property {(providerId: string, step: ProviderSetupStep) => Promise<void> | void} [onVerify] Checks a saved connection with the provider.
   * @property {(providerId: string, step: ProviderSetupStep) => Promise<void> | void} [onStartOAuth] Starts a browser sign-in.
   * @property {(providerId: string, code: string) => Promise<unknown> | void} [onCompleteOAuth] Finishes a code-paste sign-in.
   * @property {(providerId: string) => Promise<void> | void} [onSignOut] Removes the account from custody.
   * @property {() => void} [onReopenSignIn] Opens the sign-in page again.
   * @property {() => void} [onCopyUserCode] Copies a device sign-in's code.
   * @property {() => void} [onCancelDisclosure] Turns down the sign-in after reading the disclosure.
   * @property {() => void} [onContinueDisclosure] Goes on to sign in after reading the disclosure.
   * @property {(providerId: string, which: 'setup') => void} [onOpenGuidance] Opens the setup page khaosd served for it.
   * @property {(providerId: string) => boolean} [onCompleted] A setup finished: the host enables the provider; true closes the sheet.
   * @property {(() => void) | undefined} [onShowEngines] Switches to On-device Engines; the hint shows only when set.
   * @property {(() => void) | undefined} [onOpenSetup] Getting started's Change…; the line shows only when set.
   */

  /** @type {Props} */
  let {
    embedded = false,
    providers = [],
    configuredProviders = [],
    configuredProviderGroups = [],
    availableProviders = [],
    availableProviderGroups = [],
    loadingProviders = false,
    selectedProviderId = null,
    loadingSelection = false,
    plan = null,
    busyKind = null,
    oauthFlow = 'idle',
    userCode = null,
    copyCodeLabel = 'Copy code',
    canReopenSignIn = false,
    installedModels = null,
    pendingDisclosure = null,
    notice = '',
    error = '',
    completedProviderId = null,
    onboarding = { kind: 'unserved' },
    pathSetup = { kind: 'unserved' },
    isActionable = () => false,
    onChoose = undefined,
    onDismiss = undefined,
    onSaveApiKey = async () => false,
    onVerify = undefined,
    onStartOAuth = undefined,
    onCompleteOAuth = undefined,
    onSignOut = undefined,
    onReopenSignIn = undefined,
    onCopyUserCode = undefined,
    onCancelDisclosure = undefined,
    onContinueDisclosure = undefined,
    onOpenGuidance = undefined,
    onCompleted = () => false,
    onShowEngines = undefined,
    onOpenSetup = undefined,
  } = $props()

  /** "Running in the cloud", from khaosd's preference; absent where khaosd serves none. */
  /** @type {Record<string, string>} */
  const PREFERENCE_WORDS = {
    cloud: 'Running in the cloud',
    local: 'Running on this Mac',
    hybrid: 'Running in the cloud and on this Mac',
  }
  const preferenceWords = $derived(
    onboarding.kind === 'served' ? ((onboarding.preference ? PREFERENCE_WORDS[onboarding.preference] : null) ?? 'How Khaos runs AI is not chosen yet') : null,
  )
  // The path leads once khaosd serves one: Basic is always the cloud, so it says only that;
  // Advanced keeps the location, which is Advanced's question.
  const path = $derived(pathSetup.kind === 'served' ? pathSetup.path : null)
  const gettingStarted = $derived(
    preferenceWords === null
      ? null
      : path === 'basic'
        ? 'Basic: running in the cloud'
        : path === 'advanced'
          ? `Advanced: ${preferenceWords.charAt(0).toLowerCase()}${preferenceWords.slice(1)}`
          : preferenceWords,
  )
  // The host owns the selection, so the sheet is open exactly while one is held: onDismiss clears it.
  const sheetOpen = $derived(selectedProviderId !== null)
  /** @type {Record<string, string>} */
  let apiInputs = $state({})
  let oauthCode = $state('')
  let replacingKey = $state(false)
  let setupAttempt = 0
  // First focus is the credential input. The dialog's initialFocusEl runs when it opens, often
  // before the plan arrives, so the input focuses itself when it mounts instead.
  const focusOnMount = (/** @type {HTMLElement} */ node) => node.focus()

  const selectedProvider = $derived(providers.find((provider) => provider.id === selectedProviderId))
  const setupSteps = $derived(plan?.steps.filter((step) => ['authenticate.oauth', 'authenticate.apiKey', 'service.verify'].includes(step.kind)) ?? [])
  const oauthStep = $derived(setupSteps.find((step) => step.kind === 'authenticate.oauth'))
  const apiKeyStep = $derived(setupSteps.find((step) => step.kind === 'authenticate.apiKey'))
  const verificationStep = $derived(setupSteps.find((step) => step.kind === 'service.verify'))
  const selectedProviderConfigured = $derived(Boolean(selectedProvider && configuredProviders.some((provider) => provider.id === selectedProvider.id)))
  // A sign-in reads Reconnect only once a credential has been held: being in the enabled list is
  // not having been connected. These states all follow from custody holding the credential.
  const HELD_CONNECTIONS = new Set(['configured', 'connected', 'needs-update', 'refresh-failed'])
  const selectedCredentialHeld = $derived(Boolean(selectedProvider && HELD_CONNECTIONS.has(selectedProvider.connection)))
  const configuredAuthStep = $derived(
    selectedProviderConfigured ? (oauthStep?.state === 'ready' ? oauthStep : apiKeyStep?.state === 'ready' ? apiKeyStep : undefined) : undefined,
  )
  const activeSetupStep = $derived(
    (replacingKey && apiKeyStep?.state === 'ready' ? apiKeyStep : configuredAuthStep) ??
      (oauthStep && oauthStep.state !== 'ready'
        ? oauthStep
        : apiKeyStep && apiKeyStep.state !== 'ready'
          ? apiKeyStep
          : verificationStep && isActionable(verificationStep)
            ? verificationStep
            : undefined),
  )
  const sharedCredentialProviders = $derived(plan?.credentialScope?.providers.filter((provider) => provider.id !== selectedProviderId) ?? [])
  const connectionMethod = $derived(
    // From the engine's `local`, never from the id.
    selectedProvider?.local
      ? 'On this computer'
      : activeSetupStep?.kind === 'authenticate.oauth'
        ? oauthConnectionMethod(selectedProvider?.id)
        : activeSetupStep?.kind === 'authenticate.apiKey'
          ? 'API key'
          : oauthStep?.state === 'ready'
            ? oauthConnectionMethod(selectedProvider?.id)
            : apiKeyStep?.state === 'ready'
              ? 'Saved API key'
              : 'Provider account',
  )

  $effect(() => {
    const completed = completedProviderId
    if (!sheetOpen || !completed || completed !== selectedProvider?.id) return
    if (onCompleted(completed)) closeSheet()
  })

  /** @param {string} providerId */
  async function openSetup(providerId) {
    setupAttempt += 1
    apiInputs = {}
    replacingKey = false
    oauthCode = ''
    await onChoose?.(providerId)
  }

  function closeSheet() {
    setupAttempt += 1
    apiInputs = {}
    replacingKey = false
    oauthCode = ''
    onDismiss?.()
  }

  /** @param {string | undefined} providerId */
  function oauthConnectionMethod(providerId) {
    if (providerId === 'claude-ai') return 'Claude.ai subscription'
    if (providerId === 'openai-codex') return 'ChatGPT subscription'
    return 'Browser sign-in'
  }

  /** @param {ProviderSetupStep} step */
  function inputValue(step) {
    return apiInputs[step.inputs?.[0]?.id ?? ''] ?? ''
  }

  /** @param {string} providerId @param {number} attempt */
  function isCurrentSetup(providerId, attempt) {
    return sheetOpen && setupAttempt === attempt && selectedProviderId === providerId
  }

  /** @param {string} providerId @param {number} attempt */
  async function verifyConnection(providerId, attempt) {
    if (!isCurrentSetup(providerId, attempt)) return
    const verification = verificationStep
    if (!verification || !isActionable(verification)) return
    await onVerify?.(providerId, verification)
  }

  /** @param {ProviderSetupStep} step */
  async function connectApiKey(step) {
    const providerId = selectedProviderId
    const attempt = setupAttempt
    if (!providerId) return
    try {
      if (await onSaveApiKey(providerId, step, inputValue(step))) await verifyConnection(providerId, attempt)
    } finally {
      apiInputs = {}
    }
  }

  /** @param {ProviderSetupStep} step */
  async function startOAuth(step) {
    if (selectedProviderId) await onStartOAuth?.(selectedProviderId, step)
  }

  // An account connected by signing in, holding its credential: signing out is offered.
  const signedIn = $derived(Boolean(oauthStep) && ['connected', 'configured', 'needs-update'].includes(selectedProvider?.connection ?? ''))
  let signingOut = $state(false)

  async function signOut() {
    if (!selectedProviderId) return
    signingOut = true
    await onSignOut?.(selectedProviderId)
    signingOut = false
  }

  async function completeOAuth() {
    if (!selectedProviderId) return
    try {
      await onCompleteOAuth?.(selectedProviderId, oauthCode)
    } finally {
      oauthCode = ''
    }
  }
</script>
<!-- A group the engine files under no capability has no heading, so its options sit
     directly in the select beside the grouped ones. Native `<select>` allows that. -->
{#snippet options(/** @type {readonly import('./lib/providers.js').ProviderSetupOption[]} */ providers)}
  {#each providers as provider (provider.id)}
    <option value={provider.id}>{provider.title}</option>
  {/each}
{/snippet}

<div
  class:ui-provider-setup--embedded={embedded}
  class="ui-provider-setup">
  {#if gettingStarted !== null && onOpenSetup}
    <div class="ui-provider-setup__getting-started" role="group" aria-label="Getting started">
      <span>{gettingStarted}</span>
      <span aria-hidden="true">·</span>
      <button type="button" class="ui-provider-setup__getting-started-change" onclick={onOpenSetup}>Change…</button>
    </div>
  {/if}
  <section class="ui-provider-setup__provider-list" aria-label="Configured providers">
    <header class="ui-provider-setup__toolbar">
      <!-- Embedded in Settings, whose frame already titles the pane: no second title. -->
      {#if !embedded}<h1>Providers</h1>{/if}
      <label class="ui-provider-setup__provider-picker">
        <span>Add provider</span>
        <select
          aria-label="Add provider"
          value=""
          disabled={availableProviders.length === 0}
          onchange={(event) => {
            const providerId = event.currentTarget.value
            event.currentTarget.value = ''
            if (providerId) void openSetup(providerId)
          }}>
          <option value="">Choose provider</option>
          {#each availableProviderGroups as group (group.id)}
            {#if group.label}
              <optgroup label={group.label}>{@render options(group.providers)}</optgroup>
            {:else}
              {@render options(group.providers)}
            {/if}
          {/each}
        </select>
      </label>
    </header>
    {#if onShowEngines}
      <!-- ADR-0013 amendments 1 and 2: bound engines are not in Add provider, so this line
           says where they are, on its own below the toolbar (design R-2). Worded for speech
           engines because local model servers are set up here now (ADR-0017, ruling Q1).
           Shell markup with semantic tokens only: nothing published renders an inline
           action (khaotik-ui#237). -->
      <p class="ui-provider-setup__engines-hint">
        Speech engines that run on this computer are set up in <button type="button" onclick={onShowEngines}>On-device Engines</button>
      </p>
    {/if}

    {#if loadingProviders}
      <p class="ui-provider-setup__surface-status" role="status">Loading…</p>
    {:else if configuredProviders.length === 0}
      <p class="ui-provider-setup__empty-state">No providers added.</p>
    {:else}
      <!-- Grouped by khaosd's kinds (operator ruling 2026-10-16, "Five kinds, not services"),
           each a grid of flat tiles, as many columns as the pane holds: mark, name, and a
           status dot whose word is the tooltip and the accessible text (operator, 2026-10-12).
           Providers filed under no kind sit in a group with no heading. -->
      {#each configuredProviderGroups as group (group.id)}
        <section class="ui-provider-setup__provider-group" aria-label={group.label || undefined}>
          {#if group.label}<h2 class="ui-provider-setup__provider-group-title">{group.label}</h2>{/if}
          <ul class="ui-provider-setup__provider-rows">
            {#each group.providers as provider (provider.id)}
              {@const status = providerRowStatus(provider)}
              <li>
                <button
                  type="button"
                  class="ui-provider-setup__provider-tile"
                  class:ui-provider-setup__provider-tile--on={sheetOpen && selectedProviderId === provider.id}
                  aria-pressed={sheetOpen && selectedProviderId === provider.id}
                  title="{provider.title} · {status.text}"
                  aria-labelledby="provider-tile-{provider.id}-name"
                  aria-describedby="provider-tile-{provider.id}-status"
                  onclick={() => void openSetup(provider.id)}>
                  <ProviderMark providerId={provider.id} local={provider.local ?? false} />
                  <span class="ui-provider-setup__provider-tile-name" id="provider-tile-{provider.id}-name">{provider.title}</span>
                  <span class="ui-provider-setup__provider-tile-dot ui-provider-setup__provider-tile-dot--{status.tone}" aria-hidden="true"></span>
                  <span class="ui-provider-setup__provider-tile-status" id="provider-tile-{provider.id}-status">{status.text}</span>
                </button>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    {/if}

    {#if error && !sheetOpen}
      <p class="ui-provider-setup__surface-error" role="alert">{error}</p>
    {/if}
  </section>
</div>

{#if sheetOpen && selectedProvider}
  <DialogRoot
    open
    lazyMount
    unmountOnExit
    initialFocusEl={() =>
      document.querySelector('.ui-provider-setup__provider-dialog-footer input') ??
      document.querySelector('.ui-provider-setup__provider-dialog .ui-provider-setup__verify-action') ??
      document.querySelector('.ui-provider-setup__provider-dialog .ui-provider-setup__cancel-action')}
    onOpenChange={(details) => {
      if (!details.open && sheetOpen) closeSheet()
    }}>
    <DialogBackdrop class="ui-provider-setup__provider-dialog-backdrop" />
    <DialogPositioner class="ui-provider-setup__provider-dialog-positioner">
      <!-- Operator, 2026-10-16: content length varies per provider and buried the fields
           below the fold. Three regions: the header (mark, title, how it connects) and the
           footer (the fields the writer fills, what happened, and the actions) are pinned;
           only the body between them scrolls. Window-attached, like the kit's Sheet
           (desktop audit 1.14), so the sheet has the window's full height to give. -->
      <DialogContent class="ui-provider-setup__provider-dialog">
        <header class="ui-provider-setup__provider-dialog-header">
          <ProviderMark providerId={selectedProvider.id} local={selectedProvider.local ?? false} />
          <div class="ui-provider-setup__provider-dialog-heading">
            <DialogTitle class="ui-provider-setup__provider-dialog-title">{selectedProvider.title}</DialogTitle>
            <dl class="ui-provider-setup__connection-method">
              <dt>Connection</dt>
              <dd>{connectionMethod}</dd>
              {#if selectedProvider.local && selectedProvider.baseUrl}
                <!-- ADR-0017 rule 3: the served address, shown and never edited. -->
                <dt>Address</dt>
                <dd>{selectedProvider.baseUrl}</dd>
              {/if}
            </dl>
          </div>
        </header>

        <div class="ui-provider-setup__provider-dialog-body">
          {#if pendingDisclosure}
            <!-- CR-A5: khaosd's disclosure, verbatim, inside the sheet the sign-in started from,
                 so it cannot open behind it. Cancel starts no login. -->
            <div class="ui-provider-setup__provider-dialog-disclosure" role="alert" aria-label="Before you sign in">
              <p>{pendingDisclosure.text}</p>
            </div>
          {/if}
          {#if selectedProvider.local}
            <p class="ui-provider-setup__provider-summary">Runs on this computer. No API key or account.</p>
          {/if}
          {#if selectedProvider.description && selectedProvider.description !== connectionMethod}
            <p class="ui-provider-setup__provider-summary">{selectedProvider.description}</p>
          {/if}

          <!-- D7: the engine's setup words, verbatim; an absent field renders nothing. They are
               writer text by the catalog's own rule (khaos-tools remediation_audience_test).
               Developer notes — tips and the documentation link — are never shown (operator
               ruling 2026-10-16, "Remove them"). The link opens through the model, which opens
               only the URL the engine served for this provider. -->
          {#if selectedProvider.setupInstructions}
            <p>{selectedProvider.setupInstructions}</p>
          {/if}
          {#if selectedProvider.setupUrl}
            <!-- R-3: the inline-action style of khaotik-ui#237, which publishes no inline link. -->
            <div class="ui-provider-setup__guidance-links">
              <a
                href={selectedProvider.setupUrl}
                onclick={(event) => {
                  event.preventDefault()
                  void onOpenGuidance?.(selectedProvider.id, 'setup')
                }}>Setup page <Icon name="arrow-square-out" /></a>
            </div>
          {/if}

          {#if installedModels}
            <!-- Design D1: read-only, and "Not used here" in words, not only a tint. -->
            <SectionHeader title="Installed models" />
            {#if installedModels.length === 0}
              <EmptyState title={`${selectedProvider.title} reports no installed models.`} />
            {:else}
              {#each installedModels as installed (installed.id)}
                <LabeledField
                  label={installed.title === installed.id
                    ? installed.id
                    : `${installed.title} · ${installed.id}`}>
                  {#if installed.uses.length}
                    {installed.uses.join(' · ')}
                  {:else}
                    <StatusPill text="Not used here" tone="neutral" />
                  {/if}
                </LabeledField>
              {/each}
            {/if}
          {/if}
        </div>

        <footer class="ui-provider-setup__provider-dialog-footer">
          {#if !loadingSelection && apiKeyStep?.state === 'ready' && !replacingKey && !selectedProviderConfigured}
            <button
              type="button"
              class="ui-provider-setup__secondary-action ui-provider-setup__replace-action"
              disabled={busyKind !== null}
              onclick={() => {
                apiInputs = {}
                replacingKey = true
              }}>Replace key</button>
          {/if}
          {#if loadingSelection}
            <p class="ui-provider-setup__surface-status" role="status">Loading…</p>
          {:else if activeSetupStep?.kind === 'authenticate.oauth'}
            {#if activeSetupStep.cause === 'client_not_registered'}
              <!-- The engine's own sentence: no sign-in clears this, so none is offered. -->
              <p class="ui-provider-setup__surface-status" role="status">{activeSetupStep.reason}</p>
            {:else if oauthFlow === 'device' && userCode}
              <!-- E7: the code the writer enters on the provider's page. Words approved by the
                   operator, 2026-10-16. -->
              <p class="ui-provider-setup__device-code-label" id="device-code-label">Your code</p>
              <p class="ui-provider-setup__device-code" aria-labelledby="device-code-label">{userCode}</p>
              <button type="button" class="ui-provider-setup__secondary-action" onclick={() => void onCopyUserCode?.()}
                >{copyCodeLabel}</button>
            {:else if oauthFlow === 'code-paste'}
              <label for="oauth-code">Authorization code</label>
              <input
                id="oauth-code"
                {@attach focusOnMount}
                type="password"
                autocomplete="off"
                value={oauthCode}
                oninput={(event) => {
                  oauthCode = event.currentTarget.value
                }} />
            {/if}
          {:else if activeSetupStep?.kind === 'authenticate.apiKey'}
            <!-- R-6: the replace wording is keyed on the engine's own step state. Being on the
                 list means added, not that custody holds a key. -->
            {@const keyHeld = activeSetupStep.state === 'ready'}
            <p class="ui-provider-setup__credential-note" id="credential-note">
              {keyHeld
                ? 'Enter a new key to replace the one you saved. Your saved key is never shown.'
                : 'Your key is stored safely and never shown again.'}
            </p>
            {#if keyHeld && sharedCredentialProviders.length}
              <p class="ui-provider-setup__credential-note">Replacing this key also affects {sharedCredentialProviders.map((provider) => provider.title).join(', ')}.</p>
            {/if}
            {#each activeSetupStep.inputs as input, index (input.id)}
              <label for={`provider-input-${input.id}`}>
                {keyHeld ? 'New API key' : input.label}
              </label>
              <input
                id={`provider-input-${input.id}`}
                {@attach index === 0 && focusOnMount}
                aria-describedby={keyHeld ? 'credential-note' : undefined}
                type={input.sensitive ? 'password' : 'text'}
                autocomplete="off"
                required={input.required}
                value={apiInputs[input.id] ?? ''}
                oninput={(event) => {
                  apiInputs = { ...apiInputs, [input.id]: event.currentTarget.value }
                }} />
            {/each}
          {/if}

          {#if notice}
            <p class="ui-provider-setup__surface-status" role="status">{notice}</p>
          {/if}
          {#if error}
            <p class="ui-provider-setup__surface-error" role="alert">{error}</p>
          {/if}

          <div class="ui-provider-setup__provider-dialog-actions">
            {#if pendingDisclosure}
              <button class="ui-provider-setup__cancel-action" type="button" onclick={() => onCancelDisclosure?.()}>Cancel</button>
              <button class="ui-provider-setup__primary-action" type="button" onclick={() => void onContinueDisclosure?.()}>Continue</button>
            {:else}
            <DialogCloseTrigger class="ui-provider-setup__cancel-action">Cancel</DialogCloseTrigger>
            {#if signedIn}
              <!-- CR-A6: khaosd removes the held credential; the sheet says what Khaos cannot remove. -->
              <button type="button" class="ui-provider-setup__secondary-action" disabled={busyKind !== null || signingOut} onclick={() => void signOut()}>Sign out</button>
            {/if}
            {#if busyKind === 'service.verify'}
              <button class="ui-provider-setup__primary-action" type="button" disabled>Verifying…</button>
            {:else if activeSetupStep?.kind === 'authenticate.oauth'}
              {#if activeSetupStep.cause === 'client_not_registered'}
                <!-- No action: a sign-in here could only fail. -->
              {:else if oauthFlow === 'code-paste'}
                <button
                  class="ui-provider-setup__primary-action"
                  type="button"
                  disabled={busyKind !== null || oauthCode.trim() === ''}
                  onclick={() => void completeOAuth()}>
                  {busyKind ? 'Connecting…' : 'Connect'}
                </button>
              {:else}
                {#if canReopenSignIn}
                  <!-- A6: the browser tab was closed too soon. The label is the operator's, 2026-10-16. -->
                  <button type="button" class="ui-provider-setup__secondary-action" onclick={() => void onReopenSignIn?.()}
                    >Open the sign-in page again</button>
                {/if}
                <button
                  class="ui-provider-setup__primary-action"
                  type="button"
                  disabled={busyKind !== null || oauthFlow === 'callback' || oauthFlow === 'device' || !isActionable(activeSetupStep)}
                  onclick={() => void startOAuth(activeSetupStep)}>
                  {oauthFlow === 'callback' || oauthFlow === 'device'
                    ? 'Waiting…'
                    : busyKind === activeSetupStep.kind
                    ? 'Connecting…'
                    : selectedProvider.connection === 'needs-update'
                      ? 'Sign in again'
                      : selectedCredentialHeld
                        ? 'Reconnect'
                        : 'Sign in'}
                </button>
              {/if}
            {:else if activeSetupStep?.kind === 'authenticate.apiKey'}
              {#if activeSetupStep.state === 'ready' && verificationStep && isActionable(verificationStep)}
                <button
                  type="button"
                  class="ui-provider-setup__secondary-action"
                  disabled={busyKind !== null}
                  onclick={() => {
                    const providerId = selectedProviderId
                    if (providerId) void verifyConnection(providerId, setupAttempt)
                  }}>Verify</button>
              {/if}
              <button
                class="ui-provider-setup__primary-action"
                type="button"
                disabled={busyKind !== null || !isActionable(activeSetupStep) || inputValue(activeSetupStep).trim() === ''}
                onclick={() => void connectApiKey(activeSetupStep)}>
                {busyKind === activeSetupStep.kind
                  ? 'Connecting…'
                  : activeSetupStep.state === 'ready'
                    ? 'Replace key'
                    : 'Connect'}
              </button>
            {:else if activeSetupStep?.kind === 'service.verify'}
              <!-- With no input, Verify is the dialog's single action and takes first focus
                   (design, "Accessibility"); on mount too, for a plan that arrives late. -->
              <button
                class="ui-provider-setup__primary-action ui-provider-setup__verify-action"
                {@attach focusOnMount}
                type="button"
                disabled={busyKind !== null}
                onclick={() => {
                  const providerId = selectedProviderId
                  if (providerId) void verifyConnection(providerId, setupAttempt)
                }}>
                Verify
              </button>
            {/if}
            {/if}
          </div>
        </footer>
      </DialogContent>
    </DialogPositioner>
  </DialogRoot>
{/if}

<style>
  .ui-provider-setup__provider-dialog-disclosure {
    margin: 0;
    padding: var(--spacing-sm);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
  }

  .ui-provider-setup__provider-dialog-disclosure p {
    margin: 0;
  }

  .ui-provider-setup__getting-started {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: var(--spacing-xs) 0;
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }

  .ui-provider-setup__getting-started-change {
    padding: 0;
    border: 0;
    background: none;
    color: var(--text-primary);
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }

  .ui-provider-setup__getting-started-change:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-provider-setup {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    height: 100vh;
    min-height: 0;
    overflow: hidden;
    color: var(--text-primary);
    background: var(--surface-base);
    font-family: var(--font-sans);
  }

  .ui-provider-setup--embedded {
    height: auto;
    min-height: 0;
    background: transparent;
  }

  .ui-provider-setup__provider-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    min-width: 0;
    padding: var(--spacing-lg);
  }

  .ui-provider-setup--embedded .ui-provider-setup__provider-list {
    padding: 0;
  }

  .ui-provider-setup__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
  }

  h1,
  p {
    margin: 0;
  }

  h1 {
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    font-weight: var(--heading-md-weight);
  }

  button,
  input,
  select {
    font: inherit;
  }

  .ui-provider-setup__guidance-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }

  .ui-provider-setup__guidance-links a {
    font: inherit;
    color: var(--text-primary);
    text-decoration: underline;
    white-space: nowrap;
  }

  .ui-provider-setup__engines-hint {
    text-align: left;
    color: var(--text-secondary);
    font-size: var(--body-md-size);
  }

  .ui-provider-setup__engines-hint button {
    padding: 0;
    border: 0;
    background: none;
    color: var(--text-primary);
    text-decoration: underline;
    white-space: nowrap;
  }

  .ui-provider-setup__provider-picker {
    display: grid;
    grid-template-columns: auto minmax(160px, 220px);
    align-items: center;
    gap: var(--spacing-sm);
    margin-left: auto;
    color: var(--text-secondary);
    font-size: var(--body-md-size);
  }

  .ui-provider-setup__provider-picker select {
    min-height: 32px;
    padding: 4px 8px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: var(--text-primary);
    cursor: pointer;
  }

  .ui-provider-setup__provider-picker select:disabled {
    color: var(--action-on-disabled);
    background: var(--action-disabled);
    cursor: default;
  }

  button:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-provider-setup__provider-group + .ui-provider-setup__provider-group {
    margin-top: var(--spacing-sm);
  }

  .ui-provider-setup__provider-group-title {
    margin: 0 0 2px;
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-weight: 600;
  }

  .ui-provider-setup__provider-rows {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
    gap: 2px var(--spacing-xs);
  }

  .ui-provider-setup__provider-tile {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    width: 100%;
    min-height: 28px;
    padding: 0 var(--spacing-xs);
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-primary);
    font: inherit;
    font-size: var(--body-md-size);
    text-align: left;
    cursor: pointer;
  }

  .ui-provider-setup__provider-tile:hover {
    background: color-mix(in oklab, var(--text-primary) 6%, transparent);
  }

  .ui-provider-setup__provider-tile--on {
    background: color-mix(in oklab, var(--text-primary) 10%, transparent);
  }

  .ui-provider-setup__provider-tile:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: -2px;
  }

  .ui-provider-setup__provider-tile-name {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* The status is a dot to the eye; its word stays in the tile for assistive tech. */
  .ui-provider-setup__provider-tile-dot {
    flex: none;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--tone-neutral);
  }

  .ui-provider-setup__provider-tile-dot--success {
    background: var(--tone-success);
  }

  .ui-provider-setup__provider-tile-dot--warning {
    background: var(--tone-warning);
  }

  .ui-provider-setup__provider-tile-status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .ui-provider-setup__empty-state {
    padding: var(--spacing-lg) var(--spacing-md);
    border: 1px solid var(--border-hairline);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: var(--body-md-size);
    text-align: center;
  }

  /* The sheet's buttons, at the kit Sheet's density: a hairline frame, the label size,
     one filled primary. */
  .ui-provider-setup__primary-action,
  .ui-provider-setup__secondary-action,
  :global(.ui-provider-setup__cancel-action) {
    min-height: 28px;
    padding: var(--spacing-2xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font: inherit;
    font-size: var(--label-md-size);
    line-height: var(--label-md-line);
    cursor: pointer;
  }

  .ui-provider-setup__secondary-action,
  :global(.ui-provider-setup__cancel-action) {
    border: var(--size-stroke-hairline) solid var(--border-default);
    background: none;
    color: var(--text-primary);
  }

  .ui-provider-setup__secondary-action:hover:not(:disabled),
  :global(.ui-provider-setup__cancel-action:hover) {
    background: color-mix(in oklab, var(--text-primary) 6%, transparent);
  }

  .ui-provider-setup__secondary-action:disabled {
    color: var(--text-secondary);
    cursor: default;
  }

  .ui-provider-setup__primary-action {
    border: var(--size-stroke-hairline) solid transparent;
    background: var(--action-primary);
    color: var(--action-on-primary);
  }

  .ui-provider-setup__primary-action:hover:not(:disabled) {
    filter: brightness(1.08);
  }

  .ui-provider-setup__primary-action:disabled {
    background: var(--action-disabled);
    color: var(--action-on-disabled);
    cursor: default;
  }

  :global(.ui-provider-setup__provider-dialog-backdrop) {
    position: fixed;
    z-index: 50;
    inset: 0;
    background: var(--scrim);
  }

  /* Window-attached: the sheet hangs from the top edge of its window (kit Sheet; desktop
     audit 1.14), so it may use the window's full height less one margin at the foot. */
  :global(.ui-provider-setup__provider-dialog-positioner) {
    position: fixed;
    z-index: 51;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 0 var(--spacing-md) var(--spacing-md);
  }

  :global(.ui-provider-setup__provider-dialog) {
    display: flex;
    flex-direction: column;
    width: min(440px, 100%);
    max-height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-top: 0;
    border-radius: 0 0 var(--radius-sm) var(--radius-sm);
    background: var(--surface-raised);
    color: var(--text-primary);
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
  }

  /* Header and footer keep their height; the body takes what is left and scrolls. */
  .ui-provider-setup__provider-dialog-header,
  .ui-provider-setup__provider-dialog-footer {
    flex: none;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .ui-provider-setup__provider-dialog-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    border-bottom: var(--size-stroke-hairline) solid var(--border-hairline);
  }

  .ui-provider-setup__provider-dialog-heading {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  :global(.ui-provider-setup__provider-dialog-title) {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--label-lg-size);
    line-height: var(--label-lg-line);
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  /* One quiet line under the title; a local server's Address sits on the next. */
  .ui-provider-setup__connection-method {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0 var(--spacing-xs);
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--label-sm-size);
    line-height: var(--label-sm-line);
  }

  .ui-provider-setup__connection-method dd {
    margin: 0;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }

  .ui-provider-setup__provider-dialog-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: grid;
    align-content: start;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
  }

  /* A provider with nothing to explain has no body; header and footer meet. */
  .ui-provider-setup__provider-dialog-body:empty {
    display: none;
  }

  .ui-provider-setup__provider-dialog-footer {
    display: grid;
    gap: var(--spacing-xs);
    border-top: var(--size-stroke-hairline) solid var(--border-hairline);
  }

  .ui-provider-setup__device-code-label {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--label-sm-size);
  }

  /* E7: the device sign-in code, large and selectable, in the kit's mono face. */
  .ui-provider-setup__device-code {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--heading-md-size);
    color: var(--text-primary);
    user-select: all;
  }

  .ui-provider-setup__provider-summary,
  .ui-provider-setup__credential-note {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--label-sm-size);
    line-height: var(--label-sm-line);
  }

  .ui-provider-setup__provider-dialog-footer label {
    margin-bottom: -2px;
    color: var(--text-secondary);
    font-size: var(--label-sm-size);
    line-height: var(--label-sm-line);
  }

  .ui-provider-setup__provider-dialog-footer input {
    box-sizing: border-box;
    width: 100%;
    min-height: 28px;
    padding: var(--spacing-2xs) var(--spacing-xs);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    background: var(--surface-base);
  }

  .ui-provider-setup__replace-action {
    justify-self: start;
  }

  .ui-provider-setup__provider-dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-2xs);
  }

  .ui-provider-setup__surface-status,
  .ui-provider-setup__surface-error {
    margin: 0;
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
  }

  .ui-provider-setup__surface-status {
    color: var(--text-secondary);
  }

  .ui-provider-setup__surface-error {
    color: var(--tone-danger);
  }

  @media (max-width: 680px) {
    .ui-provider-setup__provider-picker {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-2xs);
    }
  }
  @container viewport (max-width: 680px) {
    .ui-provider-setup__provider-picker {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-2xs);
    }
  }
</style>

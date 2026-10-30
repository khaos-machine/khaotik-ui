<script>
  // Connect what you need: one row per enabled kind, naming every provider khaosd says it needs,
  // its state in words, and the one action khaosd's `next` names. A row reads Connected only
  // when khaosd says so. The key and the authorization code are typed here and handed to the
  // host, which saves them and is never answered from this side; installs and downloads go
  // through the host's own confirmation. Moved from Khaos App (catalog app-coverage plan, T9).
  import ProviderMark from './ProviderMark.svelte'

  /** @typedef {'connect-key' | 'sign-in' | 'install' | 'download' | 'ready'} FeatureNext */
  /**
   * One kind's row. `acting` is the provider the action is for; `suggested` khaosd's choice.
   * @typedef {Object} ConnectRow
   * @property {{ id: string, title: string, readiness: { ready: boolean, reason?: string } }} kind
   * @property {readonly { id: string, title: string, local?: boolean }[]} providers
   * @property {'connected' | 'finish-setup' | 'action'} state
   * @property {FeatureNext} next
   * @property {string} acting
   * @property {string} actingTitle
   * @property {{ provider: string, model?: string }} suggested
   */

  /**
   * @typedef {Object} Props
   * @property {readonly ConnectRow[]} [rows] One row per enabled kind, as khaosd serves it.
   * @property {string | null} [preference] khaosd's inference preference: `local` says installs ask first.
   * @property {boolean} [basic] The Basic path: khaosd's suggestion only, no "More options".
   * @property {Record<string, string>} [installNames] The name of what an install row installs, by its acting provider.
   * @property {readonly string[]} [signedInKinds] The kinds whose account is signed in, so Sign out is offered.
   * @property {string | null} [codePasteFor] The provider waiting for an authorization code to be pasted.
   * @property {{ providerId: string, text: string } | null} [providerNotice] What the provider sign-in last said.
   * @property {{ settling: boolean } | null} [finishSetup] A finish-setup install the host can run; null offers Check again only.
   * @property {(row: ConnectRow) => Promise<void> | void} [onAct] Runs a row's action other than adding a key: sign in, install, download.
   * @property {(row: ConnectRow, key: string) => Promise<boolean>} [onSaveKey] Saves a key; true closes the form. The key is never kept here.
   * @property {(row: ConnectRow) => Promise<string | null>} [onSignOut] Signs out; resolves to what to tell the person.
   * @property {() => Promise<void> | void} [onRecheck] Reads the connections again.
   * @property {(providerId: string, code: string) => Promise<boolean>} [onCompleteOAuth] Finishes a pasted-code sign-in.
   * @property {() => void} [onRunFinishSetup] Runs the finish-setup install.
   * @property {() => void} [onOpenSettings] More options in Settings…
   * @property {import('svelte').Snippet | undefined} [finish] The host's finish-setup confirmation.
   * @property {import('svelte').Snippet | undefined} [disclosure] The host's provider disclosure.
   */

  /** @type {Props} */
  let {
    rows = [],
    preference = null,
    basic = false,
    installNames = {},
    signedInKinds = [],
    codePasteFor = null,
    providerNotice = null,
    finishSetup = null,
    onAct = undefined,
    onSaveKey = async () => false,
    onSignOut = async () => null,
    onRecheck = undefined,
    onCompleteOAuth = async () => false,
    onRunFinishSetup = undefined,
    onOpenSettings = undefined,
    finish = undefined,
    disclosure = undefined,
  } = $props()

  /** @type {Record<FeatureNext, string>} */
  const NEEDS = {
    'connect-key': 'Needs a key',
    'sign-in': 'Needs sign-in',
    install: 'Not installed',
    download: 'Model not downloaded',
    ready: 'Ready to connect',
  }

  /** @type {string | null} */
  let keyFor = $state(null)
  let key = $state('')
  let code = $state('')
  let busy = $state(false)
  // Shown once under the list: several rows can share the account that was signed out.
  let signedOut = $state('')

  /** @param {ConnectRow} row */
  function actionLabel(row) {
    const other = row.acting !== row.suggested.provider
    switch (row.next) {
      case 'connect-key':
        return other ? `Add ${row.actingTitle} key…` : 'Add key…'
      case 'sign-in':
        return other ? `Sign in to ${row.actingTitle}…` : 'Sign in…'
      case 'install':
        return `Install ${installNames[row.acting] ?? row.actingTitle}…`
      case 'download':
        return 'Download model…'
      case 'ready':
        return ''
    }
  }

  /** @param {ConnectRow} row */
  async function act(row) {
    if (row.next === 'connect-key') {
      keyFor = row.kind.id
      key = ''
      return
    }
    busy = true
    try {
      await onAct?.(row)
    } finally {
      busy = false
    }
  }

  /** @param {ConnectRow} row */
  async function saveKey(row) {
    busy = true
    const saved = await onSaveKey(row, key)
    busy = false
    // The key is never kept here, taken or not.
    key = ''
    if (saved) keyFor = null
  }

  /** @param {ConnectRow} row */
  async function signOut(row) {
    busy = true
    signedOut = (await onSignOut(row)) ?? ''
    busy = false
  }

  async function recheck() {
    busy = true
    await onRecheck?.()
    busy = false
  }
</script>

<p class="ui-setup-connect__lead">
  {preference === 'local'
    ? "Khaos will install and download what's needed. Each step asks first."
    : 'One account can cover several of these. Cloud services bill your account when Khaos uses them.'}
</p>

<ul class="ui-setup-connect" aria-label="Connections">
  {#each rows as row (row.kind.id)}
    <li class="ui-setup-connect__row" data-ui-id={`setup.connect.${row.kind.id}`}>
      <span class="ui-setup-connect__feature">{row.kind.title}</span>
      <span class="ui-setup-connect__providers">
        {#each row.providers as provider (provider.id)}
          <span class="ui-setup-connect__provider">
            <ProviderMark providerId={provider.id} local={provider.local} />
            {provider.title}
          </span>
        {/each}
      </span>
      <span class="ui-setup-connect__state" data-state={row.state}>
        {row.state === 'connected' ? 'Connected' : row.state === 'finish-setup' ? 'Finish setup first' : NEEDS[row.next]}
      </span>
      <span class="ui-setup-connect__actions">
        {#if row.state === 'action' && row.next !== 'ready' && keyFor !== row.kind.id}
          <button type="button" class="ui-setup-connect__button" disabled={busy} onclick={() => void act(row)}
            >{actionLabel(row)}</button>
        {/if}
        {#if row.state === 'finish-setup' && finishSetup}
          <!-- The install may also run from the launcher; Check again reads health either way. -->
          <button type="button" class="ui-setup-connect__button" disabled={busy || finishSetup.settling}
            onclick={() => onRunFinishSetup?.()}>{finishSetup.settling ? 'Installing…' : 'Run it'}</button>
        {/if}
        {#if row.state === 'action' || row.state === 'finish-setup'}
          <button type="button" class="ui-setup-connect__button" disabled={busy || finishSetup?.settling} onclick={() => void recheck()}>Check again</button>
        {/if}
        {#if signedInKinds.includes(row.kind.id)}
          <button type="button" class="ui-setup-connect__button" disabled={busy} onclick={() => void signOut(row)}>Sign out</button>
        {/if}
      </span>
      {#if row.state !== 'connected'}
        <!-- khaosd's reason, verbatim: what is happening, in its words. -->
        <span class="ui-setup-connect__caption">{row.kind.readiness.ready ? '' : row.kind.readiness.reason}</span>
      {/if}
      {#if keyFor === row.kind.id}
        <form class="ui-setup-connect__key" onsubmit={(event) => {
            event.preventDefault()
            void saveKey(row)
          }}>
          <label class="ui-setup-connect__label">
            {row.actingTitle} API key
            <input type="password" autocomplete="off" spellcheck="false" bind:value={key} />
          </label>
          <button type="submit" class="ui-setup-connect__button" disabled={busy || !key.trim()}>Save key</button>
          <button type="button" class="ui-setup-connect__button" disabled={busy} onclick={() => (keyFor = null)}>Cancel</button>
        </form>
      {/if}
      {#if row.next === 'sign-in' && codePasteFor === row.acting}
        <form
          class="ui-setup-connect__key"
          onsubmit={async (event) => {
            event.preventDefault()
            busy = true
            if (await onCompleteOAuth(row.acting, code)) await onRecheck?.()
            code = ''
            busy = false
          }}>
          <label class="ui-setup-connect__label">
            Authorization code
            <input type="password" autocomplete="off" spellcheck="false" bind:value={code} />
          </label>
          <button type="submit" class="ui-setup-connect__button" disabled={busy || !code.trim()}>Finish sign-in</button>
        </form>
      {/if}
      {#if row.next === 'sign-in' && providerNotice?.providerId === row.acting}
        <span class="ui-setup-connect__caption">{providerNotice.text}</span>
      {/if}
      {#if !basic}
        <!-- Basic connects khaosd's suggestion and offers no other (BA-A2): provider choice is Advanced. -->
        <button type="button" class="ui-setup-connect__more" onclick={() => onOpenSettings?.()}>More options in Settings…</button>
      {/if}
    </li>
  {/each}
</ul>

{@render finish?.()}

{#if signedOut}<p class="ui-setup-connect__lead" role="status">{signedOut}</p>{/if}

{@render disclosure?.()}

<style>
  .ui-setup-connect__lead,
  .ui-setup-connect__caption,
  .ui-setup-connect__label {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  .ui-setup-connect {
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid var(--border-default);
  }

  .ui-setup-connect__row {
    display: grid;
    grid-template-columns: minmax(max-content, 1fr) minmax(min-content, max-content) auto auto;
    align-items: center;
    column-gap: var(--spacing-sm);
    row-gap: 2px;
    padding: 6px 0;
    border-bottom: 1px solid var(--border-default);
  }

  .ui-setup-connect__feature {
    font-weight: 600;
  }

  .ui-setup-connect__providers {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .ui-setup-connect__provider {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .ui-setup-connect__state {
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .ui-setup-connect__state[data-state='connected'] {
    color: var(--tone-success);
  }

  .ui-setup-connect__actions {
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--spacing-xs);
  }

  .ui-setup-connect__caption,
  .ui-setup-connect__key,
  .ui-setup-connect__more {
    grid-column: 1 / -1;
  }

  .ui-setup-connect__key {
    display: flex;
    align-items: end;
    gap: var(--spacing-xs);
  }

  .ui-setup-connect__label {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .ui-setup-connect__label input {
    font: inherit;
    padding: 2px var(--spacing-xs);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: var(--text-primary);
  }

  .ui-setup-connect__button {
    min-height: 26px;
    white-space: nowrap;
    padding: 0 var(--spacing-sm);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: var(--text-primary);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .ui-setup-connect__button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .ui-setup-connect__more {
    justify-self: start;
    padding: 0;
    border: 0;
    background: none;
    color: var(--text-secondary);
    font: inherit;
    font-size: var(--caption-size);
    cursor: pointer;
  }

  .ui-setup-connect__button:focus-visible,
  .ui-setup-connect__more:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }
</style>

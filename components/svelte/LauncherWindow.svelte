<script>
  // The launcher window: the welcome window under whatever the engine needs said first —
  // khaosd unreachable, a setup step to finish, what readiness lacks — with the startup
  // screen until the first check settles, the status bar, and the open-from-Git and refusal
  // sheets. Moved from Khaos App's src/ui/App.svelte (catalog app-coverage plan, T9). The host
  // draws the welcome window itself, as a snippet with its props by name, and its own dialogs.
  import Sheet from './Sheet.svelte'
  import Splash from './Splash.svelte'
  import StatusBar from './StatusBar.svelte'

  /**
   * khaosd could not be reached. `key` keeps the banner, and an open Details, across a poll that
   * passes through loading; it changes only when what is said changes.
   * @typedef {{ key: string, headline: string, body: string, details: string, loginItems: boolean }} OfflineBanner
   */
  /**
   * A setup step khaosd needs before any tool can start. `failed` is khaosd's words when the
   * last run did not finish; '' otherwise.
   * @typedef {{ key: string, details: string, failed: string, settling: boolean }} SetupBanner
   */
  /**
   * What the launch check found. `introduce` invites a first choice; `unready` and `blocked`
   * say, in khaosd's words, what is not ready.
   * @typedef {{ kind: 'ready' } | { kind: 'introduce' } | { kind: 'unready', features: readonly { id: string, title: string, reason: string }[], unmet: readonly { id: string, name: string, verdict: string }[] } | { kind: 'blocked', engine: string, unmet: readonly { id: string, name: string, verdict: string }[], blocked: readonly { id: string, label: string, reason: string }[] }} Readiness
   */

  /**
   * @typedef {Object} Props
   * @property {OfflineBanner | null} [offline] khaosd is not reachable, or null.
   * @property {() => void} [onLoginItems] Open Login Items…, offered when khaosd is blocked there.
   * @property {() => void} [onCheckAgain] Reads the engine again.
   * @property {() => void} [onReport] Report a problem…
   * @property {SetupBanner | null} [setup] A setup step to finish, or null.
   * @property {() => void} [onRunSetup] Run it: the host confirms first.
   * @property {boolean} [checking] The first check of the launch has not settled: only the startup screen is drawn.
   * @property {string} [appVersion] For the startup screen.
   * @property {import('svelte').ComponentProps<typeof Splash>['checks']} [checks] For the startup screen.
   * @property {Readiness} [readiness] What the launch check found.
   * @property {() => void} [onGetStarted] Get started…: opens Setup.
   * @property {() => void} [onOpenSetup] Open Setup…
   * @property {boolean} [lookingForEngine] The list is still being read.
   * @property {import('svelte').ComponentProps<typeof StatusBar>['engine']} [statusEngine] The status bar's engine line.
   * @property {import('svelte').ComponentProps<typeof StatusBar>['result']} [statusResult] The status bar's last result.
   * @property {{ message: string, confirmLabel: string } | null} [refusal] A project that did not open, and what it offers.
   * @property {() => void} [onCancelRefusal] The refusal was dismissed.
   * @property {() => void} [onConfirmRefusal] The refusal's action was chosen.
   * @property {boolean} [cloning] Open from Git… is asking for a repository.
   * @property {() => void} [onCancelClone] Open from Git was cancelled.
   * @property {(url: string) => void} [onClone] The repository URL was given; the host asks where it goes.
   * @property {import('svelte').Snippet | undefined} [welcome] The host's welcome window.
   * @property {import('svelte').Snippet | undefined} [dialogs] The host's own confirmations.
   */

  /** @type {Props} */
  let {
    offline = null,
    onLoginItems = undefined,
    onCheckAgain = undefined,
    onReport = undefined,
    setup = null,
    onRunSetup = undefined,
    checking = false,
    appVersion = '',
    checks = [],
    readiness = { kind: 'ready' },
    onGetStarted = undefined,
    onOpenSetup = undefined,
    lookingForEngine = false,
    statusEngine = null,
    statusResult = null,
    refusal = null,
    onCancelRefusal = undefined,
    onConfirmRefusal = undefined,
    cloning = false,
    onCancelClone = undefined,
    onClone = undefined,
    welcome = undefined,
    dialogs = undefined,
  } = $props()

  /** Not now hides the invitation for this launch only. */
  let introductionDeferred = $state(false)
</script>

<div class="ui-launcher-window">
  {#if offline}
    <!-- The reason in plain words, khaosd's own under Details, and a remedy row. -->
    {#key offline.key}
      <div class="ui-launcher-window__banner" role="status">
        <p class="ui-launcher-window__line"><strong>{offline.headline}</strong> {offline.body}</p>
        <details>
          <summary>Details</summary>
          <code>{offline.details}</code>
        </details>
        <div class="ui-launcher-window__remedy">
          {#if offline.loginItems}
            <!-- Only the person can allow khaosd; this takes them to the switch. -->
            <button type="button" onclick={() => onLoginItems?.()}>Open Login Items…</button>
          {/if}
          <button type="button" onclick={() => onCheckAgain?.()}>Check again</button>
          <button type="button" onclick={() => onReport?.()}>Report a problem…</button>
        </div>
      </div>
    {/key}
  {/if}

  {#if setup}
    <!-- One setup state: the step in plain words, khaosd's reason under Details, and Run it,
         which the host confirms first. Above the startup screen and the launcher alike. -->
    {#key setup.key}
      <div class="ui-launcher-window__banner" role="status">
        <p class="ui-launcher-window__line">
          <strong>Finish setting up Khaos.</strong>
          One more step is needed before Khaos can work. Choose Run it to finish.
        </p>
        <details>
          <summary>Details</summary>
          <code>{setup.details}</code>
        </details>
        {#if setup.failed}
          <!-- khaosd's words. The install is safe to repeat, so Run it stays. -->
          <p class="ui-launcher-window__line" role="alert">The install did not finish: {setup.failed}</p>
        {/if}
        <div class="ui-launcher-window__remedy">
          <button type="button" disabled={setup.settling} onclick={() => onRunSetup?.()}>{setup.settling ? 'Installing…' : 'Run it'}</button>
          <button type="button" disabled={setup.settling} onclick={() => onCheckAgain?.()}>Check again</button>
        </div>
      </div>
    {/key}
  {/if}

  {@render dialogs?.()}

  {#if checking}
    <!-- Nothing of the launcher is drawn until the first system check of the launch settles. -->
    <Splash {appVersion} {checks} />
  {:else}
    {#if readiness.kind === 'introduce' && !introductionDeferred}
      <!-- No preference yet: an invitation in a quiet line, never a warning. -->
      <div class="ui-launcher-window__banner" role="status" data-ui-id="launcher.setup-banner">
        <p class="ui-launcher-window__line">Choose how Khaos runs AI to start analysing scripts.</p>
        <div class="ui-launcher-window__remedy">
          <button type="button" onclick={() => onGetStarted?.()}>Get started…</button>
          <button type="button" onclick={() => (introductionDeferred = true)}>Not now</button>
        </div>
      </div>
    {:else if readiness.kind === 'unready'}
      <!-- What the person's answers need and is not ready, in khaosd's words verbatim. -->
      <div class="ui-launcher-window__banner" role="status" data-ui-id="launcher.setup-banner">
        {#each readiness.features as feature (feature.id)}
          <p class="ui-launcher-window__line"><strong>{feature.title} isn't ready:</strong> {feature.reason}</p>
        {/each}
        {#each readiness.unmet as requirement (requirement.id)}
          <p class="ui-launcher-window__line">{requirement.name}: {requirement.verdict}</p>
        {/each}
        <div class="ui-launcher-window__remedy">
          <button type="button" onclick={() => onOpenSetup?.()}>Open Setup…</button>
          <button type="button" onclick={() => onCheckAgain?.()}>Check again</button>
        </div>
      </div>
    {:else if readiness.kind === 'blocked'}
      <!-- What blocks work, said above the stories rather than in place of them. -->
      <div class="ui-launcher-window__banner" role="status" data-ui-id="launcher.setup-banner">
        <p class="ui-launcher-window__line"><strong>Something needs attention.</strong> {readiness.engine}</p>
        {#each readiness.unmet as requirement (requirement.id)}
          <p class="ui-launcher-window__line">{requirement.name}: {requirement.verdict}</p>
        {/each}
        {#each readiness.blocked as capability (capability.id)}
          <p class="ui-launcher-window__line">{capability.label}: {capability.reason}</p>
        {/each}
        <div class="ui-launcher-window__remedy">
          <button type="button" onclick={() => onOpenSetup?.()}>Open Setup…</button>
          <button type="button" onclick={() => onCheckAgain?.()}>Check again</button>
        </div>
      </div>
    {/if}
    <!-- The welcome window fills what is left, edge to edge. -->
    <div class="ui-launcher-window__welcome">{@render welcome?.()}</div>
  {/if}

  {#if lookingForEngine && !checking}
    <p class="ui-launcher-window__hint" role="status">Looking for khaosd…</p>
  {/if}

  <StatusBar engine={statusEngine} result={statusResult} uiId="launcher.status" />

  {#if refusal}
    <Sheet
      title="This project did not open"
      message={refusal.message}
      confirmLabel={refusal.confirmLabel}
      oncancel={() => onCancelRefusal?.()}
      onconfirm={() => onConfirmRefusal?.()} />
  {/if}

  {#if cloning}
    <!-- Open from Git: the URL is typed here; the host then asks where the clone goes. -->
    <Sheet
      title="Open from Git"
      message="Clones the project with its history, images and audio, then opens it."
      confirmLabel="Choose where…"
      input={{ label: 'Repository URL', placeholder: 'https://github.com/you/story.git' }}
      oncancel={() => onCancelClone?.()}
      onconfirm={(url) => onClone?.(url)} />
  {/if}
</div>

<style>
  /* The window is the viewport, with no page padding: the welcome window fills it edge to edge,
     and its rail and its card grid each scroll on their own. */
  .ui-launcher-window {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: var(--surface-base);
    color: var(--text-primary);
  }

  /* A zero basis gives the welcome window a definite height to fill. */
  .ui-launcher-window__welcome {
    flex: 1 1 0;
    min-height: 0;
  }

  .ui-launcher-window__banner {
    margin: var(--spacing-md, 1rem) var(--spacing-md, 1rem) 0;
    padding: var(--spacing-sm, 0.75rem) var(--spacing-md, 1rem);
    border: 1px solid var(--border-default);
    border-left: 3px solid var(--tone-warning, var(--border-default));
    border-radius: var(--radius-sm, 6px);
    background: var(--surface-raised);
    color: var(--text-secondary);
    font-size: var(--body-md-size);
  }

  .ui-launcher-window__banner strong {
    color: var(--text-primary);
  }

  .ui-launcher-window__line {
    margin: 0;
  }

  .ui-launcher-window__banner details {
    margin-top: var(--spacing-xs, 0.5rem);
  }

  .ui-launcher-window__remedy {
    margin-top: var(--spacing-sm, 0.75rem);
  }

  .ui-launcher-window__hint {
    margin: 0 var(--spacing-md, 1rem);
    color: var(--text-secondary);
    font-size: var(--body-md-size);
  }
</style>

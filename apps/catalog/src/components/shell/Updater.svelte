<script>
  import { check } from '@tauri-apps/plugin-updater'

  // The updater only exists inside a Tauri window; in the browser preview and
  // in jsdom tests there is no __TAURI_INTERNALS__ bridge, so we render nothing
  // and never call into the plugin.
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

  let status = $state('idle') // idle | checking | up-to-date | available | downloading | error
  let message = $state('')
  let update = $state(null)

  async function checkForUpdates() {
    if (!isTauri || status === 'checking' || status === 'downloading') return
    status = 'checking'
    message = 'Checking for updates…'
    try {
      update = await check()
      if (update) {
        status = 'available'
        message = `Update available — v${update.version}`
      } else {
        status = 'up-to-date'
        message = 'Up to date'
      }
    } catch (err) {
      status = 'error'
      message = 'Update check failed'
    }
  }

  async function install() {
    if (!update || status === 'downloading') return
    status = 'downloading'
    message = 'Downloading update…'
    try {
      await update.downloadAndInstall()
    } catch (err) {
      status = 'error'
      message = 'Install failed'
    }
  }
</script>

{#if isTauri}
  <div class="updates">
    <div class="updates__status">
      <span
        class="dot"
        class:dot--ok={status === 'up-to-date'}
        class:dot--busy={status === 'checking' || status === 'downloading'}
        class:dot--bad={status === 'error'}
        class:dot--ready={status === 'available'}
      ></span>
      <span class="updates__text">{message || 'Updates are checked on launch'}</span>
    </div>

    {#if status === 'available'}
      <button type="button" class="updates__button hover-fill" onclick={install}>Update now</button>
    {:else}
      <button
        type="button"
        class="updates__button hover-fill"
        onclick={checkForUpdates}
        disabled={status === 'checking' || status === 'downloading'}
      >
        {status === 'checking' ? 'Checking…' : 'Check for updates'}
      </button>
    {/if}
  </div>
{:else}
  <p class="updates__note">Updates are managed in the desktop app.</p>
{/if}

<style>
  .updates {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .updates__status {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    min-height: 16px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-tertiary);
    flex-shrink: 0;
  }

  .dot--ok {
    background: var(--tone-success);
  }

  .dot--busy {
    background: var(--tone-info);
    animation: pulse 1.2s ease-in-out infinite;
  }

  .dot--bad {
    background: var(--tone-danger);
  }

  .dot--ready {
    background: var(--tone-warning);
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }

  .updates__text {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
  }

  .updates__button {
    align-self: flex-start;
    padding: 4px 12px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: none;
    font: inherit;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    cursor: pointer;
    transition: background 150ms ease, color 150ms ease;
  }


  .updates__button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .updates__note {
    margin: 0;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
  }
</style>

<script>
  import Icon from '@khaos-machine/khaotik-ui/components/svelte/Icon.svelte'
  import Updater from './Updater.svelte'

  let { open = false, version = '', onClose = () => {} } = $props()

  $effect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
</script>

{#if open}
  <div class="settings" role="dialog" aria-modal="true" aria-label="Settings">
    <button class="settings__backdrop" type="button" aria-label="Close settings" onclick={onClose}></button>

    <div class="settings__panel">
      <header class="settings__header">
        <h2 class="settings__title">Settings</h2>
        <button class="settings__close hover-fill" type="button" aria-label="Close settings" onclick={onClose}>
          <Icon name="x" />
        </button>
      </header>

      <section class="settings__section">
        <span class="settings__eyebrow">About</span>
        <div class="settings__about">
          <span class="settings__name">Khaotik Component Catalog</span>
          <span class="settings__version">Version {version || '—'}</span>
        </div>
      </section>

      <section class="settings__section">
        <span class="settings__eyebrow">Updates</span>
        <Updater />
      </section>
    </div>
  </div>
{/if}

<style>
  .settings {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    z-index: 100;
  }

  .settings__backdrop {
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 0.4);
    border: 0;
    cursor: default;
  }

  .settings__panel {
    position: relative;
    width: min(400px, calc(100vw - 48px));
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    box-shadow: 0 12px 40px rgb(0 0 0 / 0.35);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }

  .settings__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .settings__title {
    margin: 0;
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    color: var(--text-primary);
  }

  .settings__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-tertiary);
    cursor: pointer;
  }


  .settings__section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--border-hairline);
  }

  .settings__section:first-of-type {
    padding-top: 0;
    border-top: 0;
  }

  .settings__eyebrow {
    font-size: var(--label-sm-size);
    line-height: var(--label-sm-line);
    font-weight: var(--label-sm-weight);
    letter-spacing: var(--label-sm-track);
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .settings__about {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .settings__name {
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-primary);
  }

  .settings__version {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
  }
</style>

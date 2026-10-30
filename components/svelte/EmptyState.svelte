<script>
  import Icon from './Icon.svelte'

  // Mirrors khaos-ui KEmptyState: an icon well over a display title, an
  // optional description, and an optional action.
  /**
   * @typedef {Object} Props
   * @property {string} [title] Display title.
   * @property {string} [description] Optional supporting copy below the title.
   * @property {string} [icon] Optional Phosphor icon name rendered in the well.
   * @property {import('svelte').Snippet} [children] Optional action rendered below the copy, typically a button. Omit it and the well is copy only.
   */

  /** @type {Props} */
  let { title = '', description = '', icon = '', children = undefined } = $props()
</script>

<div class="empty">
  {#if icon}
    <div class="empty__icon"><Icon name={icon} /></div>
  {/if}
  <h3 class="empty__title">{title}</h3>
  {#if description}
    <p class="empty__desc">{description}</p>
  {/if}
  {#if children}
    <div class="empty__action">{@render children()}</div>
  {/if}
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl) var(--spacing-md);
    text-align: center;
  }

  .empty__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-bottom: var(--spacing-md);
    border: 1px solid var(--border-hairline);
    border-radius: var(--radius-md);
    background: var(--surface-base);
    font-size: 24px;
    color: var(--text-secondary);
  }

  .empty__title {
    margin: 0;
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    font-weight: var(--heading-md-weight);
    color: var(--text-primary);
  }

  .empty__desc {
    margin: var(--spacing-xs) 0 0;
    max-width: 420px;
    font-size: var(--body-md-size);
    color: var(--text-secondary);
  }

  .empty__action {
    margin-top: var(--spacing-lg);
  }
</style>

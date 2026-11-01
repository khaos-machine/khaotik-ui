<script>
  // Drawer — a panel that rises over the status bar: a heading, a close
  // button, and a body that fills the rest. The host decides when it shows.

  import Icon from './Icon.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [title] The heading, which also names the region.
   * @property {string} [closeLabel] The close button's accessible name.
   * @property {() => void} [onclose] Called by the close button.
   * @property {import('svelte').Snippet} [children] The body. It fills the drawer and scrolls itself.
   */

  /** @type {Props} */
  let { title = '', closeLabel = 'Close', onclose = undefined, children = undefined } = $props()
</script>

<section class="ui-drawer" aria-label={title}>
  <header class="ui-drawer__head">
    <h2>{title}</h2>
    <button type="button" class="ui-drawer__close" aria-label={closeLabel} title={closeLabel} onclick={() => onclose?.()}><Icon name="x" /></button>
  </header>
  <div class="ui-drawer__body">{@render children?.()}</div>
</section>

<style>
  .ui-drawer {
    flex: none;
    display: flex;
    flex-direction: column;
    height: 40vh;
    min-height: 200px;
    border-top: var(--size-stroke-hairline) solid var(--border-hairline);
    background: var(--surface-base);
  }

  .ui-drawer__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  h2 {
    margin: 0;
    font-size: var(--body-md-size);
    font-weight: 600;
  }

  .ui-drawer__close {
    display: inline-flex;
    padding: var(--spacing-xs);
    border: 0;
    background: none;
    color: var(--text-secondary);
  }

  .ui-drawer__body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
</style>

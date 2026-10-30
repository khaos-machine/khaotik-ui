<script>
  // The stale sheet: a refused analysis in front of the window, in the engine's plain words,
  // with View stale scenes and Resolve…. Moved from Khaos App's src/ui/shell/StaleSheet.svelte
  // (catalog app-coverage plan, T8). Which fixes are offered is the host's.
  import Sheet from './Sheet.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [headline] What was refused, in the engine's plain words.
   * @property {string} [detail] Why, in the engine's plain words.
   * @property {string} [projectTitle] The project it happened in.
   * @property {string} [viewLabel] The view fix's words ("View stale scenes"); '' when there is none.
   * @property {string} [resolveLabel] The resolve fix's words ("Resolve…"); '' when Resolve could not clear the gate.
   * @property {() => void} [onView] View stale scenes.
   * @property {() => void} [onResolve] Resolve…: the host clears what blocks the analysis.
   * @property {() => void} [onCancel] The sheet was closed.
   */

  /** @type {Props} */
  let { headline = '', detail = '', projectTitle = '', viewLabel = '', resolveLabel = '', onView = undefined, onResolve = undefined, onCancel = undefined } = $props()
</script>

{#if resolveLabel}
  <Sheet
    title={headline}
    target="in {projectTitle}"
    message={detail}
    secondaryLabel={viewLabel}
    onsecondary={() => viewLabel && onView?.()}
    confirmLabel={resolveLabel}
    onconfirm={() => onResolve?.()}
    oncancel={() => onCancel?.()}
    uiId="analysis.stale" />
{:else}
  <!-- Without Resolve the one action is the view, so it takes the confirm's place. -->
  <Sheet
    title={headline}
    target="in {projectTitle}"
    message={detail}
    confirmLabel={viewLabel || 'OK'}
    onconfirm={() => (viewLabel ? onView?.() : onCancel?.())}
    oncancel={() => onCancel?.()}
    uiId="analysis.stale" />
{/if}

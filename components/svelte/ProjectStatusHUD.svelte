<script>
  // The data-layer window's status: the status bar, shown only while the window is active and
  // there is a result or a job to show. Moved from Khaos App's src/ui/shell/ProjectStatusHUD.svelte
  // (catalog app-coverage plan, T8).
  import StatusBar from './StatusBar.svelte'

  /**
   * @typedef {Object} Props
   * @property {boolean} [active] The window is in front; a window behind shows no status.
   * @property {import('svelte').ComponentProps<typeof StatusBar>['result']} [result] The last action's result.
   * @property {import('svelte').ComponentProps<typeof StatusBar>['jobs']} [jobs] Running jobs.
   */

  /** @type {Props} */
  let { active = false, result = null, jobs = [] } = $props()
</script>

{#if active && (result || (jobs?.length ?? 0) > 0)}
  <StatusBar {jobs} {result} />
{/if}

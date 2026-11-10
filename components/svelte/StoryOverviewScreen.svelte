<script>
  // The Overview as one screen (operator, 2026-11-10: "let's assemble the full overview screen
  // with sidebar, header and such", placed in the kit: "New kit component"): the strip, then the
  // outline, the document and the side pane, as khaos-app draws them (khaos-app
  // src/ui/shell/Shell.svelte, overviewView). The outline jumps the document to a section; what is
  // selected in the document shows in the side pane. A host mounts it as the Shell's `overview`.
  //
  // The side pane is there only while something is selected (operator, 2026-11-10: "Side pane on
  // demand", as a "Column opens"), so the document has the width otherwise. Close, or Esc from
  // inside the screen, clears the selection, which closes it.
  import Button from './Button.svelte'
  import EmptyState from './EmptyState.svelte'
  import StoryOverview from './StoryOverview.svelte'
  import StoryOverviewOutline from './StoryOverviewOutline.svelte'
  import StoryOverviewSide from './StoryOverviewSide.svelte'
  import StoryOverviewStrip from './StoryOverviewStrip.svelte'

  /** @typedef {import('./lib/story-overview.js').OverviewSelection} OverviewSelection */
  /** @typedef {import('./lib/story-overview.js').OverviewSection} OverviewSection */
  /** @typedef {{ kind: string }} AnyRead */

  /**
   * @typedef {Object} Props
   * @property {string} [title] The story's title, as StoryOverview takes it.
   * @property {import('./lib/story-overview.js').SectionRead<import('./lib/story-overview.js').StoryPremise>} [premise] As StoryOverview takes it.
   * @property {import('./lib/story-overview.js').SectionRead<import('./lib/story-overview.js').StoryStructure>} [structure] As StoryOverview takes it.
   * @property {import('./lib/story-overview.js').SectionRead<Record<string, any>>} [coverage] As StoryOverview takes it.
   * @property {import('./lib/story-overview.js').SectionRead<readonly Record<string, any>[]>} [journeys] As StoryOverview takes it.
   * @property {import('./lib/story-overview.js').SectionRead<readonly Record<string, any>[]>} [relationships] As StoryOverview takes it.
   * @property {boolean} [advanced] Advanced mode, as StoryOverview and StoryOverviewSide take it.
   * @property {import('svelte').ComponentProps<typeof StoryOverviewStrip> | null} [strip] The strip's props; null draws no strip.
   * @property {OverviewSelection | null} [selected] The selected turn, character, journey or relationship. Bindable.
   * @property {(item: OverviewSelection | null) => void} [onselect] Told what was selected; null when the side pane is closed.
   * @property {(sceneId: string) => void} [onRevealScene] As StoryOverviewSide takes it.
   */

  /** @type {Props} */
  let {
    title = '',
    premise = { kind: 'loading' },
    structure = { kind: 'loading' },
    coverage = { kind: 'loading' },
    journeys = { kind: 'loading' },
    relationships = { kind: 'loading' },
    advanced = false,
    strip = null,
    selected = $bindable(null),
    onselect = undefined,
    onRevealScene = undefined,
  } = $props()

  /** The section the outline last jumped to. */
  let current = $state(/** @type {OverviewSection | null} */ (null))
  /** @type {HTMLElement | undefined} */
  let documentPane = $state()

  const reading = $derived([premise, structure, coverage].every((/** @type {AnyRead} */ r) => r.kind === 'loading'))

  /** @param {OverviewSection} section */
  function jump(section) {
    current = section
    documentPane?.querySelector(`[data-ui-id="story.overview.${section}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  /** @param {OverviewSelection | null} item */
  function select(item) {
    selected = item
    onselect?.(item)
  }

  /** @type {HTMLElement | undefined} */
  let root = $state()

  /** @param {KeyboardEvent} event */
  function escape(event) {
    if (event.key === 'Escape' && selected && root?.contains(/** @type {Node} */ (event.target))) select(null)
  }
</script>

<svelte:window onkeydown={escape} />

<div class="ui-story-overview-screen" bind:this={root}>
  {#if strip}<StoryOverviewStrip {...strip} />{/if}
  {#if reading}
    <EmptyState title="Reading this story's analyses…" description="The engine is reading this story's premise, shape and coverage." icon="hourglass" />
  {:else}
    <div class="ui-story-overview-screen__panes" class:ui-story-overview-screen__panes--side={!!selected}>
      <div class="ui-story-overview-screen__outline">
        <StoryOverviewOutline {premise} {structure} {coverage} {journeys} {relationships} {current} onjump={jump} />
      </div>
      <div class="ui-story-overview-screen__document" bind:this={documentPane}>
        <StoryOverview {title} {premise} {structure} {coverage} {journeys} {relationships} {advanced} {selected} onselect={select} />
      </div>
      {#if selected}
        <div class="ui-story-overview-screen__side">
          <div class="ui-story-overview-screen__close"><Button variant="tool" icon="x" onclick={() => select(null)}>Close</Button></div>
          <StoryOverviewSide {structure} {coverage} {journeys} {relationships} {advanced} {selected} {onRevealScene} />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .ui-story-overview-screen {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }
  /* The outline and the side pane keep khaos-app's widths; the document takes the rest. */
  .ui-story-overview-screen__panes {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr);
    border-top: var(--size-stroke-hairline) solid var(--border-default);
  }
  .ui-story-overview-screen__panes--side {
    grid-template-columns: 260px minmax(0, 1fr) 320px;
  }
  .ui-story-overview-screen__panes > div {
    min-height: 0;
    overflow: auto;
  }
  .ui-story-overview-screen__outline {
    border-right: var(--size-stroke-hairline) solid var(--border-default);
  }
  .ui-story-overview-screen__side {
    border-left: var(--size-stroke-hairline) solid var(--border-default);
  }
  .ui-story-overview-screen__close {
    display: flex;
    justify-content: flex-end;
    padding: var(--spacing-xs) var(--spacing-xs) 0;
  }
</style>

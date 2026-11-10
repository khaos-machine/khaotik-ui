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
  //
  // The outline hides (operator, 2026-11-10: "make it hidable"), leaving a rail with the button
  // that brings it back. Project Settings sits at its foot, shown or hidden (operator, 2026-11-10:
  // "might as well make use of the sidebar and add project settings button at the bottom").
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
   * @property {() => void} [onProjectSettings] Opens Project Settings, from the foot of the outline; without it, no button.
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
    onProjectSettings = undefined,
  } = $props()

  let outlineHidden = $state(false)
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
    <div class="ui-story-overview-screen__panes" class:ui-story-overview-screen__panes--side={!!selected} class:ui-story-overview-screen__panes--rail={outlineHidden}>
      <div class="ui-story-overview-screen__outline">
        <div class="ui-story-overview-screen__toggle">
          <Button variant="tool" icon="sidebar-simple" title={outlineHidden ? 'Show outline' : 'Hide outline'} onclick={() => (outlineHidden = !outlineHidden)}><span class="visually-hidden">{outlineHidden ? 'Show outline' : 'Hide outline'}</span></Button>
        </div>
        {#if !outlineHidden}
          <StoryOverviewOutline {premise} {structure} {coverage} {journeys} {relationships} {current} onjump={jump} />
        {/if}
        {#if onProjectSettings}
          <div class="ui-story-overview-screen__foot">
            {#if outlineHidden}
              <Button variant="tool" icon="gear" title="Project Settings" onclick={() => onProjectSettings?.()}><span class="visually-hidden">Project Settings</span></Button>
            {:else}
              <Button variant="tool" icon="gear" onclick={() => onProjectSettings?.()}>Project Settings</Button>
            {/if}
          </div>
        {/if}
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
    /* One row the screen's height: each pane scrolls inside it, so the outline's foot (Project
       Settings) stays in view (operator, 2026-11-10: "height of the sidebar should be fixed to
       assuring the settings button is visible, the content section is what scrolls when
       required"). An auto row would grow to the tallest pane instead. */
    grid-template-rows: minmax(0, 1fr);
    border-top: var(--size-stroke-hairline) solid var(--border-default);
  }
  .ui-story-overview-screen__panes--side {
    grid-template-columns: 260px minmax(0, 1fr) 320px;
  }
  .ui-story-overview-screen__panes--rail {
    grid-template-columns: auto minmax(0, 1fr);
  }
  .ui-story-overview-screen__panes--rail.ui-story-overview-screen__panes--side {
    grid-template-columns: auto minmax(0, 1fr) 320px;
  }
  .ui-story-overview-screen__foot {
    margin-top: auto;
    padding: var(--spacing-xs);
  }
  .ui-story-overview-screen__toggle {
    display: flex;
    justify-content: flex-end;
    padding: var(--spacing-xs) var(--spacing-xs) 0;
  }
  .ui-story-overview-screen__panes > div {
    min-height: 0;
    overflow: auto;
  }
  /* The outline is a column: its toggle, the outline, and Project Settings pinned to the foot. */
  .ui-story-overview-screen__outline {
    display: flex;
    flex-direction: column;
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

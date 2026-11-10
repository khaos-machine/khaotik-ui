<script>
  // The text-preview player: the composition as a three-pane editor, with the beat under the
  // playhead on the stage and the SELECTED scene in the inspector. Two cursors, by design: you
  // read scene 40 while scene 3 plays. The timeline, transport and lanes are StoryPlayer's.
  // Moved from Khaos App's Player (catalog app-coverage plan, T7); the host's model holds the
  // playhead, the selection and the scene text.
  //
  // The panes (operator, 2026-11-10): the inspector is there only while something is selected
  // ("While a scene is selected"), a beat on the timeline included ("inspector opens on even
  // selection in timeline"); Close or Esc clears the selection. Scenes and the timeline toggle
  // from icons in the transport row ("let's may it togglable from the transport like we do with
  // timeline.. we can use icons for these instead of the chevron"): Scenes, a clapperboard, at its
  // left end ("scenes should be clapper icon and moved to left end"), the timeline at its right.
  // Hidden, Scenes is gone and the timeline leaves the transport.
  //
  // By its own width the player is a phone, a tablet or wide (operator, 2026-11-10: "these mobile
  // layouts are pretty useless.. stacking in a list makes no sense"). A phone is "Now Playing +
  // sheets": the stage fills the screen, the transport sits under the thumb, and Scenes and the
  // scene open as bottom sheets; a scene tapped "Opens its detail", with Play from here. A tablet
  // is "Two columns": the stage and one side pane, the scene while one is selected, else Scenes.
  import Button from './Button.svelte'
  import EmptyState from './EmptyState.svelte'
  import Icon from './Icon.svelte'
  import SectionHeader from './SectionHeader.svelte'
  import StatusPill from './StatusPill.svelte'
  import StoryPlayer from './StoryPlayer.svelte'
  import { formatTimecode } from './lib/timeline.js'

  /** @typedef {{ elementId: string, elementType: string, characterName?: string, text?: string, duration: number | null }} TimelineBeat */
  /** @typedef {{ sceneId?: string, sectionId?: string, label: string, duration: number | null, events: readonly TimelineBeat[] }} TimelineScene */

  /**
   * @typedef {Object} Props
   * @property {{ kind: 'loading' } | { kind: 'uncomposed' } | { kind: 'failed', message: string } | { kind: 'loaded' }} [state] The composition read.
   * @property {readonly any[]} [segments] The composition's segments, as StoryPlayer takes them.
   * @property {{ segments: readonly TimelineScene[] }} [timeline] The same segments as `buildTimeline` builds them (lib/timeline.js).
   * @property {number} [currentSceneIndex] The playing scene's position in the timeline, or -1.
   * @property {number} [selectedSceneIndex] The inspected scene's position, or -1.
   * @property {{ elementId: string, elementType: string, characterName?: string, text?: string } | null} [focus] The beat under the playhead, as the composition holds it.
   * @property {TimelineScene | null} [playingScene] The scene under the playhead.
   * @property {TimelineScene | null} [inspected] The selected scene. Null, with no beat selected either, closes the inspector.
   * @property {string} [activeCharacterName] The speaking character, or ''.
   * @property {{ kind: 'idle' } | { kind: 'loading' } | { kind: 'text', text: string } | { kind: 'none' } | { kind: 'failed', message: string }} [sceneText] The selected scene's text; 'none' when the engine has none.
   * @property {number} [currentTime] The playhead, in seconds.
   * @property {number} [total] The composition's length, in seconds.
   * @property {boolean} [playing] Whether the transport is running.
   * @property {number} [scale] The timeline's zoom.
   * @property {string} [selectedElementId] The beat chosen on the timeline, or ''.
   * @property {boolean} [active] Whether the player is on screen; the keyboard waits while it is not.
   * @property {(index: number) => void} [onSelectScene] Reports a scene chosen for the inspector; -1 when Close or Esc clears it.
   * @property {(index: number) => void} [onGoToScene] Asks to move the playhead to a scene (double-click).
   * @property {(elementId: string) => void} [onSelect] Reports a beat chosen; '' when Close or Esc clears it.
   * @property {(seconds: number) => void} [onSeek] Asks to move the playhead.
   * @property {() => void} [onTogglePlay] Asks to play or pause (Space).
   * @property {(scale: number) => void} [onScaleChange] Reports the timeline zoomed.
   * @property {() => void} [onNextBeat] → key.
   * @property {() => void} [onPreviousBeat] ← key.
   * @property {() => void} [onNextScene] ↓ key.
   * @property {() => void} [onPreviousScene] ↑ key.
   * @property {() => void} [onToStart] Home.
   * @property {() => void} [onToEnd] End.
   */

  /** @type {Props} */
  let {
    // Bound as `composition`: a local named `state` would shadow the `$state` rune.
    state: composition = { kind: 'loading' },
    segments = [],
    timeline = { segments: [] },
    currentSceneIndex = -1,
    selectedSceneIndex = -1,
    focus = null,
    playingScene = null,
    inspected = null,
    activeCharacterName = '',
    sceneText = { kind: 'idle' },
    currentTime = 0,
    total = 0,
    playing = false,
    scale = 1,
    selectedElementId = '',
    active = true,
    onSelectScene = undefined,
    onGoToScene = undefined,
    onSelect = undefined,
    onSeek = undefined,
    onTogglePlay = undefined,
    onScaleChange = undefined,
    onNextBeat = undefined,
    onPreviousBeat = undefined,
    onNextScene = undefined,
    onPreviousScene = undefined,
    onToStart = undefined,
    onToEnd = undefined,
  } = $props()

  const timelineSegments = $derived(composition.kind === 'loaded' ? segments : [])

  let scenesHidden = $state(false)
  let timelineHidden = $state(false)
  /** The phone's Scenes sheet. */
  let scenesSheet = $state(false)
  /** @type {HTMLElement | undefined} */
  let root = $state()
  /** The panes' width: the player's content width, which StoryPlayer's phone transport keys on too. */
  let width = $state(0)
  /**
   * 600 is where StoryPlayer's transport turns phone, 900 where three columns stop fitting.
   * ponytail: unmeasured (0) counts as wide, so a host that never lays the player out sees the
   * layout it always had.
   */
  const mode = $derived(width === 0 || width > 900 ? 'wide' : width < 600 ? 'phone' : 'tablet')

  /** The scene the inspector shows: the selected one, else the scene of the beat chosen on the timeline. */
  const shown = $derived(
    inspected ?? (selectedElementId ? (timeline.segments.find((s) => s.events.some((e) => e.elementId === selectedElementId)) ?? null) : null),
  )
  /** Scenes beside the stage: wide while shown, on a tablet only while no scene takes the side. */
  const listInline = $derived(mode === 'wide' ? !scenesHidden : mode === 'tablet' && !shown && !scenesHidden)
  const inspectorInline = $derived(mode !== 'phone' && !!shown)
  /** The phone's open sheet: Scenes over the scene, since Scenes is how another scene is picked. */
  const sheet = $derived(mode !== 'phone' ? null : scenesSheet ? 'scenes' : shown ? 'scene' : null)
  const columns = $derived(
    mode === 'phone'
      ? 'minmax(0, 1fr)'
      : mode === 'tablet'
        ? listInline || inspectorInline ? 'minmax(0, 1fr) minmax(240px, 320px)' : 'minmax(0, 1fr)'
        : [listInline && 'minmax(180px, 240px)', 'minmax(0, 1fr)', inspectorInline && 'minmax(220px, 320px)'].filter(Boolean).join(' '),
  )

  const panes = $derived(
    mode === 'phone'
      ? [
          { id: 'scenes', label: 'Scenes', icon: 'film-slate', shown: sheet === 'scenes', at: /** @type {const} */ ('start') },
          { id: 'scene', label: 'Scene', icon: 'info', shown: sheet === 'scene' },
        ]
      : [
          { id: 'scenes', label: 'Scenes', icon: 'film-slate', shown: listInline, at: /** @type {const} */ ('start') },
          { id: 'timeline', label: 'Timeline', icon: 'film-strip', shown: !timelineHidden },
        ],
  )
  /** @param {string} id */
  function togglePane(id) {
    if (id === 'timeline') timelineHidden = !timelineHidden
    else if (id === 'scene') shown ? closeInspector() : currentSceneIndex >= 0 && onSelectScene?.(currentSceneIndex)
    else if (mode === 'phone') scenesSheet = !scenesSheet
    else if (mode === 'tablet' && shown) {
      // The side pane swaps back to Scenes.
      scenesHidden = false
      closeInspector()
    } else scenesHidden = !scenesHidden
  }

  /** Clears every selection, which closes the inspector. */
  function closeInspector() {
    if (selectedElementId) onSelect?.('')
    onSelectScene?.(-1)
  }

  /** @param {number} index */
  function pickScene(index) {
    onSelectScene?.(index)
    scenesSheet = false
  }

  /** Touch has no double-click, so the scene detail plays from its scene. */
  function playFromHere() {
    if (!shown) return
    const key = shown.sceneId ?? shown.sectionId
    const index = timeline.segments.findIndex((s) => s === shown || (s.sceneId ?? s.sectionId) === key)
    if (index < 0) return
    onGoToScene?.(index)
    if (mode === 'phone') closeInspector()
  }

  function closeSheet() {
    if (scenesSheet) scenesSheet = false
    else closeInspector()
  }

  // A sheet follows the finger down and closes past a short pull.
  const PULL = 64
  let drag = $state(0)
  /** @type {number | null} */
  let dragFrom = null
  /** @param {PointerEvent} event */
  function dragStart(event) {
    dragFrom = event.clientY
    const handle = /** @type {HTMLElement} */ (event.currentTarget)
    handle.setPointerCapture?.(event.pointerId)
  }
  /** @param {PointerEvent} event */
  function dragMove(event) {
    if (dragFrom !== null) drag = Math.max(0, event.clientY - dragFrom)
  }
  function dragEnd() {
    if (dragFrom === null) return
    if (drag > PULL) closeSheet()
    dragFrom = null
    drag = 0
  }

  /** Focus moves into an opened sheet, and back to where it was when the sheet closes. @param {HTMLElement} node */
  function focusIn(node) {
    const before = /** @type {HTMLElement | null} */ (document.activeElement)
    node.querySelector('button')?.focus()
    return () => before?.focus?.()
  }

  /**
   * Dialogue arrives as one string with any parenthetical folded in; the stage shows them apart.
   * Tolerant: an unsplittable line renders whole rather than being dropped.
   * @param {string} text
   */
  function splitDialogue(text) {
    const match = /^\s*\(([^)]*)\)\s*([\s\S]*)$/.exec(text)
    return match ? { parenthetical: match[1] ?? '', line: (match[2] ?? '').trim() } : { parenthetical: '', line: text.trim() }
  }

  /**
   * ←/→ beat, ↑/↓ scene, Home/End, Space play. Ignored while a text field has focus, so typing
   * is not hijacked.
   * @param {KeyboardEvent} event
   */
  function onKey(event) {
    if (!active || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return
    const target = /** @type {HTMLElement | null} */ (event.target)
    const tag = target?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return
    if (event.key === 'Escape') {
      if (!root?.contains(/** @type {Node} */ (target))) return
      if (scenesSheet && mode === 'phone') scenesSheet = false
      else if (shown) closeInspector()
      return
    }
    /** @type {Record<string, (() => void) | undefined>} */
    const handlers = {
      ArrowRight: onNextBeat,
      ArrowLeft: onPreviousBeat,
      ArrowDown: onNextScene,
      ArrowUp: onPreviousScene,
      Home: onToStart,
      End: onToEnd,
      ' ': onTogglePlay,
    }
    const handler = handlers[event.key]
    if (!handler) return
    event.preventDefault()
    handler()
  }
</script>

<!-- SectionHeader takes a `trailing` SNIPPET, not children. Passing a child rendered
     NOTHING — the scene duration was missing from the inspector header and the screenshot
     showed it, but no test could. -->
{#snippet trailing()}
  <StatusPill text={formatTimecode(shown?.duration ?? 0)} tone="neutral" icon="clock" />
{/snippet}

<svelte:window onkeydown={onKey} />

{#snippet sceneList()}
  <nav class="ui-player__pane ui-player__pane--nav" aria-label="Scenes">
    <!-- A plain count of what is here. It used to read "48 of 76" with an explanatory
         sentence under it whenever khaosd reported an omission (#85), and khaosd 0.9.7
         really did report one — a section count and reason, on 8 of 20 corpus projects.
         khaos-manager#297 then removed the key, once RFC 0068 §3 made a short segment
         list structurally unreachable, so no khaosd that serves the current
         `compositionView` sends it and both blocks became dead. The "worse claim than
         the silence it replaces" reasoning recorded here was sound about the notice it
         was written for; it now guards nothing. Removed in khaos-app#114. -->
    <header class="ui-player__pane-head">
      <h2 class="ui-player__pane-title">Scenes</h2>
      <span class="ui-player__pane-count">{timeline.segments.length}</span>
    </header>
    <ul class="ui-player__scenes">
      <!-- Keyed on whichever id the segment actually carries. A sectionSegment has no
           sceneId, so keying on that alone gave 28 of 76 segments the same key and
           aborted this render with each_key_duplicate (#80). Unique by convention and
           not by construction — a segment has no identity in the format, filed as
           KSPD#310. NOT the index: unique by construction and still wrong, since an
           index is stable only until something reorders. -->
      {#each timeline.segments as segment, index (segment.sceneId ?? segment.sectionId)}
        {@const isPlaying = currentSceneIndex === index}
        <li>
          <button
            type="button"
            class="ui-player__scene"
            class:ui-player__scene--selected={selectedSceneIndex === index}
            class:ui-player__scene--playing={isPlaying}
            aria-current={selectedSceneIndex === index ? 'true' : undefined}
            onclick={() => pickScene(index)}
            ondblclick={() => onGoToScene?.(index)}>
            <span class="ui-player__scene-n">{index + 1}</span>
            <span class="ui-player__scene-body">
              <span class="ui-player__scene-label">{segment.label}</span>
              <span class="ui-player__scene-meta">
                {segment.events.length} beats · {formatTimecode(segment.duration)}
              </span>
            </span>
            {#if isPlaying}
              <Icon name="speaker-high" />
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  </nav>
{/snippet}

{#snippet inspector()}
  <aside class="ui-player__pane ui-player__pane--inspector" aria-label="Scene inspector">
    <div class="ui-player__close">
      {#if mode !== 'wide'}<Button variant="tool" icon="play" onclick={playFromHere}>Play from here</Button>{/if}
      <Button variant="tool" icon="x" onclick={closeInspector}>Close</Button>
    </div>
    <SectionHeader title={shown.label} eyebrow="Scene" {trailing} />

    <h3 class="ui-player__inspector-eyebrow">Beats · {shown.events.length}</h3>
    <ul class="ui-player__beats">
      {#each shown.events as beat (beat.elementId)}
        <li>
          <button
            type="button"
            class="ui-player__beat"
            class:ui-player__beat--focus={focus?.elementId === beat.elementId}
            onclick={() => onSelect?.(beat.elementId)}>
            <span class="ui-player__beat-kind" data-kind={beat.elementType}>{beat.elementType}</span>
            <span class="ui-player__beat-text">{beat.characterName ?? beat.text ?? ''}</span>
            <span class="ui-player__beat-dur">{formatTimecode(beat.duration)}</span>
          </button>
        </li>
      {/each}
    </ul>

    {#if sceneText.kind === 'text'}
      <h3 class="ui-player__inspector-eyebrow">Scene text</h3>
      <pre class="ui-player__scene-text">{sceneText.text}</pre>
    {:else if sceneText.kind === 'loading'}
      <p class="ui-player__inspector-note">Loading scene text…</p>
    {:else if sceneText.kind === 'failed'}
      <p class="ui-player__inspector-note">Scene text unavailable — {sceneText.message}</p>
    {/if}
  </aside>
{/snippet}

<div class="ui-player" class:ui-player--phone={mode === 'phone'} class:ui-player--tablet={mode === 'tablet'} bind:this={root}>
  {#if composition.kind === 'loading'}
    <EmptyState title="Loading composition…" icon="circle-notch" />
  {:else if composition.kind === 'uncomposed'}
    <!-- Distinct from "composed to nothing": nothing has composed this project at all. -->
    <EmptyState
      title="No composition yet"
      description="The engine has not composed this project. Run composition from khaos-tui or the existing GUI — khaos-app cannot dispatch composition yet."
      icon="film-strip" />
  {:else if composition.kind === 'failed'}
    <EmptyState title="Could not load the composition" description={composition.message} icon="warning" />
  {:else}
    <div class="ui-player__panes" style:grid-template-columns={columns} bind:clientWidth={width}>
      {#if listInline}{@render sceneList()}{/if}

      <!-- ── Stage: the beat under the playhead, rendered large ────────────── -->
      <section class="ui-player__pane ui-player__pane--stage" aria-label="Stage" inert={sheet !== null}>
        <p class="ui-player__stage-slug">{playingScene?.label ?? '—'}</p>

        <div class="ui-player__stage-monitor">
          {#if !focus}
            <div class="ui-player__stage-idle">
              <Icon name="play-circle" />
              <p>Press play, or click a beat on the timeline.</p>
            </div>
          {:else if focus.elementType === 'dialogue'}
            {@const split = splitDialogue(focus.text ?? '')}
            {#if focus.characterName}
              <p class="ui-player__stage-character">{focus.characterName}</p>
            {/if}
            {#if split.parenthetical}
              <p class="ui-player__stage-paren">({split.parenthetical})</p>
            {/if}
            <p class="ui-player__stage-line">“{split.line}”</p>
          {:else if focus.elementType === 'transition'}
            <p class="ui-player__stage-transition">{(focus.text ?? '').toUpperCase()}</p>
          {:else}
            <p class="ui-player__stage-eyebrow">{focus.elementType}</p>
            <p class="ui-player__stage-action">{focus.text ?? ''}</p>
          {/if}
        </div>

        <!-- Context under the playhead. Each item renders only when it has a value: an
             em-dash would imply the engine considered it and declined to say. -->
        <footer class="ui-player__strip">
          {#if playingScene}
            <span class="ui-player__strip-item">
              <Icon name="film-slate" />
              {playingScene.label}
            </span>
          {/if}
          {#if activeCharacterName}
            <span class="ui-player__strip-item">
              <Icon name="user" />
              {activeCharacterName}
            </span>
          {/if}
          <span class="ui-player__strip-item ui-player__strip-item--time">
            {formatTimecode(currentTime)} / {formatTimecode(total)}
          </span>
        </footer>
      </section>

      <!-- ── Inspector: the SELECTED scene, not the playing one ────────────── -->
      {#if inspectorInline}{@render inspector()}{/if}
    </div>

    <!-- The timeline spans all three panes, as it does in an NLE. -->
    <div class="ui-player__dock" inert={sheet !== null}>
    <StoryPlayer
      segments={timelineSegments}
      currentTime={currentTime}
      playing={playing}
      scale={scale}
      selectedElementId={selectedElementId}
      onSeek={(/** @type {number} */ t) => onSeek?.(t)}
      onSelect={(/** @type {string} */ id) => onSelect?.(id)}
      onTogglePlay={() => onTogglePlay?.()}
      onScaleChange={(/** @type {number} */ s) => onScaleChange?.(s)}
      onPreviousScene={mode === 'wide' ? undefined : onPreviousScene}
      onNextScene={mode === 'wide' ? undefined : onNextScene}
      showInspector={false}
      {timelineHidden}
      {panes}
      onTogglePane={togglePane} />
    </div>

    {#if sheet}
      <!-- A phone's sheet: over the stage, from the bottom, under the thumb. -->
      <!-- The scrim is a pointer's way out; Esc and Close are the keyboard's. -->
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <div class="ui-player__backdrop" onclick={closeSheet}></div>
      <div class="ui-player__sheet" role="dialog" aria-modal="true" aria-label={sheet === 'scenes' ? 'Scenes' : 'Scene'} style:transform={drag ? `translateY(${drag}px)` : undefined} {@attach focusIn}>
        <div class="ui-player__handle" aria-hidden="true" onpointerdown={dragStart} onpointermove={dragMove} onpointerup={dragEnd} onpointercancel={dragEnd}></div>
        {#if sheet === 'scenes'}
          <div class="ui-player__close"><Button variant="tool" icon="x" onclick={closeSheet}>Close</Button></div>
          {@render sceneList()}
        {:else}
          {@render inspector()}
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  /* Fills its container, and the panes take what is left after the timeline. Not 100vh: that is
     the window, and a host pane or a frame shorter than it overflowed (operator, 2026-11-10:
     "Height reads the window"). */
  .ui-player {
    /* The rails stack by this width, not the window's: a host pane, or a catalog frame, can be
       narrower or wider than the window (operator, 2026-11-10: "Fix the rule first"). */
    container: ui-player / inline-size;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.75rem);
    height: 100%;
    min-height: 0;
    overflow: hidden;
    padding: var(--spacing-md, 1rem);
    background: var(--surface-base);
    color: var(--text-primary);
  }

  /* Side by side at every width. The columns come from the script, by width and by what is open,
     so there is one place that says them: a two-class column rule once outranked the stacked
     layout and left the stage 26px wide on a phone (measured 2026-11-10). */
  .ui-player__panes {
    display: grid;
    /* minmax(0, 1fr), not the default `auto`. With `auto` the row sizes to content and
       the panes collapsed to 26px — measured in the running app. */
    grid-template-rows: minmax(0, 1fr);
    gap: var(--spacing-sm, 0.75rem);
    flex: 1 1 auto;
    min-height: 0;
  }
  /* A tablet's side pane is on the stage's right, Scenes included. */
  .ui-player--tablet .ui-player__pane--nav { order: 1; }
  /* StoryPlayer, wrapped only so a sheet can make it inert; the wrapper draws nothing. */
  .ui-player__dock { display: contents; }

  /* ── A phone: the stage is the screen ─────────────────────────────── */
  .ui-player--phone {
    padding: var(--spacing-sm, 0.75rem);
  }
  .ui-player--phone .ui-player__pane--stage {
    border: 0;
    background: none;
  }

  /* The sheet rises from the bottom over a scrim, to three-quarters of the player, and scrolls. */
  .ui-player__backdrop {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: var(--scrim);
  }
  .ui-player__sheet {
    position: absolute;
    inset: auto 0 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs, 0.5rem);
    max-height: 75%;
    padding: 0 var(--spacing-sm, 0.75rem) max(var(--spacing-sm, 0.75rem), env(safe-area-inset-bottom));
    border-radius: var(--radius-lg, 12px) var(--radius-lg, 12px) 0 0;
    background: var(--surface-raised, var(--surface-base));
    transition: transform 200ms ease-out;
  }
  /* In the sheet, the list and the scene are the sheet: no box of their own, and they scroll. */
  .ui-player__sheet > :global(.ui-player__pane) {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    border: 0;
    border-radius: 0;
    background: none;
    padding: 0;
  }
  /* The grab bar, with a target as tall as a thumb. */
  .ui-player__handle {
    flex: none;
    display: flex;
    justify-content: center;
    padding: var(--spacing-xs, 0.5rem) 0;
    min-height: 24px;
    touch-action: none;
    cursor: grab;
  }
  .ui-player__handle::before {
    content: '';
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: var(--border-default);
  }
  @media (prefers-reduced-motion: reduce) {
    .ui-player__sheet { transition: none; }
  }
  .ui-player__close {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--spacing-xs, 0.5rem);
  }

  .ui-player__pane {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    background: var(--surface-raised, var(--surface-base));
    border: 1px solid var(--border-subtle, var(--border-default));
    border-radius: var(--radius-md, 8px);
  }

  .ui-player__pane--nav,
  .ui-player__pane--inspector {
    overflow-y: auto;
  }

  .ui-player__pane--inspector {
    padding: var(--spacing-sm, 0.75rem);
    gap: var(--spacing-xs, 0.5rem);
  }

  /* The inspector SCROLLS; its contents do not compress.
     `.ui-player__pane` is a column flex container, so every child defaults to
     `flex-shrink: 1` and gives up height when the pane runs short. With the
     beats list and the scene text stacked in one scrolling pane, that meant the
     longer the scene, the more the text was squeezed — the length of a scene
     shortening its own display, which is precisely backwards.
     `flex: 0 0 auto` makes each child take the height its content needs, so the
     overflow-y above has something to scroll instead of children absorbing the
     shortfall. Same override already used at `.transport` and `.stage__meta`. */
  .ui-player__pane--nav > *,
  .ui-player__pane--inspector > * {
    flex: 0 0 auto;
  }

  .ui-player__pane-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--spacing-xs, 0.5rem);
    padding: var(--spacing-xs, 0.5rem) var(--spacing-sm, 0.75rem);
    border-bottom: 1px solid var(--border-subtle, var(--border-default));
    position: sticky;
    top: 0;
    background: inherit;
    z-index: 1;
  }

  .ui-player__pane-title {
    margin: 0;
    font-size: var(--body-md-size, 0.95rem);
  }

  .ui-player__pane-count {
    font-variant-numeric: tabular-nums;
    color: var(--text-secondary);
    font-size: var(--caption-size, 0.75rem);
  }

  /* ---- navigator ---- */
  .ui-player__scenes,
  .ui-player__beats {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ui-player__scene {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs, 0.35rem);
    width: 100%;
    padding: var(--spacing-2xs, 0.35rem) var(--spacing-sm, 0.75rem);
    background: none;
    border: 0;
    border-left: 2px solid transparent;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .ui-player__scene:hover {
    background: color-mix(in oklab, var(--text-primary) 5%, transparent);
  }

  .ui-player__scene--selected {
    background: color-mix(in oklab, var(--text-primary) 8%, transparent);
    border-left-color: var(--border-strong, var(--text-secondary));
  }

  /* Playing and selected are DIFFERENT marks, because they are different cursors and are
     routinely on different rows. */
  .ui-player__scene--playing {
    border-left-color: var(--accent-default, var(--text-primary));
  }

  .ui-player__scene-n {
    min-width: 1.5rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-size: var(--caption-size, 0.75rem);
    color: var(--text-secondary);
  }

  .ui-player__scene--playing .ui-player__scene-n {
    color: var(--accent-default, var(--text-primary));
    font-weight: 600;
  }

  .ui-player__scene-body {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .ui-player__scene-label {
    font-size: var(--body-sm-size, 0.875rem);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ui-player__scene-meta {
    font-size: var(--caption-size, 0.75rem);
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
  }

  /* ---- stage ---- */
  .ui-player__pane--stage {
    align-items: stretch;
    text-align: center;
  }

  .ui-player__stage-slug {
    margin: 0;
    padding: var(--spacing-sm, 0.75rem) var(--spacing-sm, 0.75rem) 0;
    font-size: var(--caption-size, 0.75rem);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ui-player__stage-monitor {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs, 0.5rem);
    padding: var(--spacing-lg, 1.5rem);
  }

  .ui-player__stage-idle {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs, 0.5rem);
    color: var(--text-secondary);
  }

  .ui-player__stage-idle p {
    margin: 0;
    font-size: var(--body-sm-size, 0.875rem);
  }

  .ui-player__stage-character {
    margin: 0;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent-default, var(--text-primary));
  }

  .ui-player__stage-paren {
    margin: 0;
    font-style: italic;
    color: var(--text-secondary);
    font-size: var(--body-sm-size, 0.875rem);
  }

  /* Serif italic for spoken lines, as the prototype does — it reads as performance rather
     than as interface text, which is the point of a program monitor. */
  .ui-player__stage-line {
    margin: 0;
    max-width: 46ch;
    font-family: var(--font-serif, Georgia, 'Times New Roman', serif);
    font-style: italic;
    font-size: var(--display-sm-size, 1.35rem);
    line-height: 1.4;
    text-wrap: pretty;
  }

  .ui-player__stage-action {
    margin: 0;
    max-width: 60ch;
    font-size: var(--body-lg-size, 1.05rem);
    line-height: 1.5;
    text-wrap: pretty;
  }

  .ui-player__stage-eyebrow {
    margin: 0;
    font-size: var(--caption-size, 0.75rem);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .ui-player__stage-transition {
    margin: 0;
    font-size: var(--display-sm-size, 1.35rem);
    font-weight: 600;
    letter-spacing: 0.24em;
    color: var(--text-secondary);
  }

  /* ---- context strip ---- */
  .ui-player__strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-sm, 0.75rem);
    padding: var(--spacing-xs, 0.5rem) var(--spacing-sm, 0.75rem);
    border-top: 1px solid var(--border-subtle, var(--border-default));
    font-size: var(--caption-size, 0.75rem);
    color: var(--text-secondary);
  }

  .ui-player__strip-item {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-3xs, 0.25rem);
    min-width: 0;
  }

  .ui-player__strip-item--time {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
  }

  /* ---- inspector ---- */
  .ui-player__inspector-eyebrow {
    margin: var(--spacing-xs, 0.5rem) 0 0;
    font-size: var(--caption-size, 0.75rem);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .ui-player__inspector-note {
    margin: 0;
    font-size: var(--caption-size, 0.75rem);
    color: var(--text-secondary);
  }

  .ui-player__beat {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-2xs, 0.35rem);
    width: 100%;
    padding: var(--spacing-3xs, 0.25rem) var(--spacing-2xs, 0.35rem);
    background: none;
    border: 0;
    border-radius: var(--radius-sm, 4px);
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .ui-player__beat:hover {
    background: color-mix(in oklab, var(--text-primary) 5%, transparent);
  }

  .ui-player__beat--focus {
    background: color-mix(in oklab, var(--accent-default, var(--text-primary)) 14%, transparent);
  }

  .ui-player__beat-kind {
    flex: 0 0 auto;
    width: 5.5rem;
    font-size: var(--caption-size, 0.75rem);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .ui-player__beat-text {
    flex: 1 1 auto;
    min-width: 0;
    font-size: var(--body-sm-size, 0.875rem);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ui-player__beat-dur {
    flex: 0 0 auto;
    font-variant-numeric: tabular-nums;
    font-size: var(--caption-size, 0.75rem);
    color: var(--text-secondary);
  }

  /* Screenplay text is monospace and selectable — it is the source, and people copy it. */
  .ui-player__scene-text {
    margin: 0;
    padding: var(--spacing-xs, 0.5rem);
    background: var(--surface-sunken, color-mix(in oklab, var(--text-primary) 4%, transparent));
    border-radius: var(--radius-sm, 4px);
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--caption-size, 0.75rem);
    line-height: 1.5;
    white-space: pre-wrap;
    overflow-x: auto;
    user-select: text;
  }

  /* The timeline is a DOCK: it takes the height its lanes need, and the panes take the
     rest. `height: auto` is load-bearing — the component carries a fill height of its own,
     so without this override `flex: 0 0 auto` resolved to 617px of a 649px window and the
     three panes were squeezed to ZERO. Measured in the running app; no test could see it.

     `overflow: visible` on the component means a bounded dock does not scroll, it spills
     and gets cut by `.ui-player`. So the dock must be sized to content, never clamped. */
  .ui-player :global(.player) {
    flex: 0 0 auto;
    height: auto;
  }

</style>

<script>
  // The text-preview player: the composition as a three-pane editor, with the beat under the
  // playhead on the stage and the SELECTED scene in the inspector. Two cursors, by design: you
  // read scene 40 while scene 3 plays. The timeline, transport and lanes are StoryPlayer's.
  // Moved from Khaos App's Player (catalog app-coverage plan, T7); the host's model holds the
  // playhead, the selection and the scene text.
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
   * @property {TimelineScene | null} [inspected] The selected scene.
   * @property {string} [activeCharacterName] The speaking character, or ''.
   * @property {{ kind: 'idle' } | { kind: 'loading' } | { kind: 'text', text: string } | { kind: 'none' } | { kind: 'failed', message: string }} [sceneText] The selected scene's text; 'none' when the engine has none.
   * @property {number} [currentTime] The playhead, in seconds.
   * @property {number} [total] The composition's length, in seconds.
   * @property {boolean} [playing] Whether the transport is running.
   * @property {number} [scale] The timeline's zoom.
   * @property {string} [selectedElementId] The beat chosen on the timeline, or ''.
   * @property {boolean} [active] Whether the player is on screen; the keyboard waits while it is not.
   * @property {(index: number) => void} [onSelectScene] Reports a scene chosen for the inspector.
   * @property {(index: number) => void} [onGoToScene] Asks to move the playhead to a scene (double-click).
   * @property {(elementId: string) => void} [onSelect] Reports a beat chosen.
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
    state = { kind: 'loading' },
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

  const timelineSegments = $derived(state.kind === 'loaded' ? segments : [])

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
  <StatusPill text={formatTimecode(inspected?.duration ?? 0)} tone="neutral" icon="clock" />
{/snippet}

<svelte:window onkeydown={onKey} />

<div class="ui-player">
  {#if state.kind === 'loading'}
    <EmptyState title="Loading composition…" icon="circle-notch" />
  {:else if state.kind === 'uncomposed'}
    <!-- Distinct from "composed to nothing": nothing has composed this project at all. -->
    <EmptyState
      title="No composition yet"
      description="The engine has not composed this project. Run composition from khaos-tui or the existing GUI — khaos-app cannot dispatch composition yet."
      icon="film-strip" />
  {:else if state.kind === 'failed'}
    <EmptyState title="Could not load the composition" description={state.message} icon="warning" />
  {:else}
    <div class="ui-player__panes">
      <!-- ── Navigator: every scene, with the playing one marked ───────────── -->
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
                onclick={() => onSelectScene?.(index)}
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

      <!-- ── Stage: the beat under the playhead, rendered large ────────────── -->
      <section class="ui-player__pane ui-player__pane--stage" aria-label="Stage">
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
      <aside class="ui-player__pane ui-player__pane--inspector" aria-label="Scene inspector">
        {#if !inspected}
          <EmptyState title="Select a scene" icon="sidebar" />
        {:else}
          <SectionHeader title={inspected.label} eyebrow="Scene" {trailing} />

          <h3 class="ui-player__inspector-eyebrow">Beats · {inspected.events.length}</h3>
          <ul class="ui-player__beats">
            {#each inspected.events as beat (beat.elementId)}
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
        {/if}
      </aside>
    </div>

    <!-- The timeline spans all three panes, as it does in an NLE. -->
    <StoryPlayer
      segments={timelineSegments}
      currentTime={currentTime}
      playing={playing}
      scale={scale}
      selectedElementId={selectedElementId}
      onSeek={(/** @type {number} */ t) => onSeek?.(t)}
      onSelect={(/** @type {string} */ id) => onSelect?.(id)}
      onTogglePlay={() => onTogglePlay?.()}
      onScaleChange={(/** @type {number} */ s) => onScaleChange?.(s)} />
  {/if}
</div>

<style>
  /* Window-height layout: panes take what is left after the timeline. */
  .ui-player {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.75rem);
    height: 100vh;
    overflow: hidden;
    padding: var(--spacing-md, 1rem);
    background: var(--surface-base);
    color: var(--text-primary);
  }

  .ui-player__panes {
    display: grid;
    /* Fixed rails, fluid stage — the stage is the thing you are watching. */
    grid-template-columns: minmax(180px, 240px) minmax(0, 1fr) minmax(220px, 320px);
    /* minmax(0, 1fr), not the default `auto`. With `auto` the row sizes to content and
       the panes collapsed to 26px — measured in the running app. */
    grid-template-rows: minmax(0, 1fr);
    gap: var(--spacing-sm, 0.75rem);
    flex: 1 1 auto;
    min-height: 0;
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

  /* Below three columns the rails stack under the stage rather than crushing it. The stage row
     keeps a floor: at minmax(0, 1fr) the rails took the whole height and the stage, the beat
     being played, collapsed to 2px. */
  @media (max-width: 900px) {
    .ui-player__panes {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto minmax(160px, 1fr) auto;
    }
  }
  @container viewport (max-width: 900px) {
    .ui-player__panes {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto minmax(160px, 1fr) auto;
    }
  }
</style>

<script>
  // The story player window: the scene navigator, the stage (the scene's cast, and the line under
  // the playhead), the inspector and the timeline, laid out over the Composer's chosen frame when
  // one is showing. The inspector's content, the timeline and the Composer's stage are the
  // host's, bound to its models, and arrive as snippets; this draws everything around them.
  // Moved from Khaos App (catalog app-coverage plan, T7).
  import { fade } from 'svelte/transition'
  import Button from './Button.svelte'
  import EmptyState from './EmptyState.svelte'
  import Icon from './Icon.svelte'
  import Portrait from './Portrait.svelte'
  import { formatTimecode } from './lib/timeline.js'

  /** @typedef {{ id: string, name: string, role: string, portraitReferenceId: string }} PlaybackCharacter */
  /**
   * A scene or a section of the playback, in the fields this draws.
   * @typedef {{ kind: 'scene' | 'section', sceneId?: string, sectionId?: string, label: string, timing?: string, audio?: unknown, reads?: readonly unknown[], context?: { characters: readonly PlaybackCharacter[] } | null }} PlaybackSegment
   */
  /** @typedef {{ state: 'loading' } | { state: 'ready', url: string } | { state: 'failed', message: string }} PlaybackPortrait */

  /**
   * @typedef {Object} Props
   * @property {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded' }} [state] The playback read.
   * @property {readonly PlaybackSegment[]} [segments] Every scene and section, in story order.
   * @property {PlaybackSegment | null} [current] The segment under the playhead.
   * @property {string} [selectedSceneId] The scene the person chose in the navigator, or ''; while set it is marked, not the playing one.
   * @property {{ characterId?: string, characterName?: string, elementType: string, text?: string } | null} [focus] The line under the playhead.
   * @property {Record<string, PlaybackPortrait>} [portraits] Portraits, keyed by reference id.
   * @property {{ id: string, url: string } | null} [frame] The Composer's frame under the playhead, drawn blurred behind everything.
   * @property {boolean} [composing] The Composer is open: the panes float over the frame.
   * @property {boolean} [playing] Whether the transport is running: the playing scene is marked, and the focus transport says Pause.
   * @property {number} [time] The playhead, in seconds, for the focus transport.
   * @property {boolean} [busy] The transport waits.
   * @property {string} [message] A status line under the stage, or ''.
   * @property {boolean} [embedded] Inside another window: it fills its host, not the viewport.
   * @property {boolean} [showSidebar] Shows the scene navigator.
   * @property {boolean} [showInspector] Shows the inspector.
   * @property {boolean} [inspectorOpen] There is something to inspect.
   * @property {boolean} [focusMode] Only the stage shows.
   * @property {(on: boolean) => void} [onFocusModeChange] Reports focus mode toggled.
   * @property {(id: string) => void} [onNavigate] Reports a scene or section chosen in the navigator.
   * @property {(sceneId: string) => void} [onOpenReadings] Asks for the readings of the scene under the playhead.
   * @property {() => void} [onTogglePlay] The focus transport's Play and Pause.
   * @property {() => void} [onPreviewText] Asks for the text preview when read playback cannot open.
   * @property {boolean} [textPreview] Shows the text preview in place of read playback.
   * @property {() => void} [onLeavePreview] Asks to return to read playback.
   * @property {import('svelte').Snippet | undefined} [monitor] The host's stage, in place of the line under the playhead: the Composer's shot.
   * @property {import('svelte').Snippet | undefined} [inspector] The host's inspector content.
   * @property {import('svelte').Snippet | undefined} [timeline] The host's timeline.
   * @property {import('svelte').Snippet | undefined} [preview] The host's text preview.
   */

  /** @type {Props} */
  let {
    state = { kind: 'loading' },
    segments = [],
    current = null,
    selectedSceneId = '',
    focus = null,
    portraits = {},
    frame = null,
    composing = false,
    playing = false,
    time = 0,
    busy = false,
    message = '',
    embedded = false,
    showSidebar = true,
    showInspector = true,
    inspectorOpen = false,
    focusMode = false,
    onFocusModeChange = undefined,
    onNavigate = undefined,
    onOpenReadings = undefined,
    onTogglePlay = undefined,
    onPreviewText = undefined,
    textPreview = false,
    onLeavePreview = undefined,
    monitor = undefined,
    inspector = undefined,
    timeline = undefined,
    preview = undefined,
  } = $props()

  const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const shotTransition = reducedMotion ? 0 : 280
  /** @param {PlaybackSegment} segment */
  const idOf = (segment) => (segment.kind === 'scene' ? segment.sceneId : segment.sectionId) ?? ''
  /** @param {string} referenceId */
  const portraitUrl = (referenceId) => {
    const portrait = portraits[referenceId]
    return portrait?.state === 'ready' ? portrait.url : ''
  }
  /** @param {string} referenceId */
  const portraitStatus = (referenceId) => {
    const portrait = portraits[referenceId]
    return portrait?.state === 'failed' ? `Portrait unavailable: ${portrait.message}` : portrait?.state === 'loading' ? 'Loading portrait…' : ''
  }
  const speaker = $derived(current?.context?.characters.find((character) => character.id === focus?.characterId))
  const speakerImage = $derived(speaker ? portraitUrl(speaker.portraitReferenceId) : '')
  /** @param {PlaybackSegment} segment */
  const status = (segment) => (segment.audio ? 'Read ready' : segment.reads?.length ? 'Reading available' : segment.kind === 'section' ? 'Section' : 'No reading chosen')
</script>

{#if textPreview}
  <div class="ui-story-playback__preview" class:ui-story-playback__preview--embedded={embedded}>
    <header><Button onclick={() => onLeavePreview?.()}><Icon name="arrow-left" /> Read playback</Button><span>Text preview · estimated timing</span></header>
    {@render preview?.()}
  </div>
{:else}
  <main
    class="ui-story-playback"
    class:ui-story-playback--embedded={embedded}
    class:ui-story-playback--composing={composing}
    class:ui-story-playback--has-frame={!!frame}
    class:ui-story-playback--focus-mode={focusMode}
    class:ui-story-playback--sidebar-hidden={!showSidebar}
    class:ui-story-playback--inspector-hidden={!showInspector}>
    {#if frame}
      <div class="ui-story-playback__atmosphere" aria-hidden="true">
        {#key frame.id}<img src={frame.url} alt="" transition:fade={{ duration: shotTransition }} />{/key}
      </div>
    {/if}
    {#if state.kind === 'failed'}
      <div class="ui-story-playback__opening"><EmptyState title="Read playback could not open" description={state.message} icon="warning" /><Button onclick={() => onPreviewText?.()}>Open text preview</Button></div>
    {:else if state.kind === 'loading'}
      <div class="ui-story-playback__opening"><EmptyState title="Opening the story…" icon="circle-notch" /></div>
    {:else}
      <nav class="ui-story-playback__hud ui-story-playback__nav" aria-label="Story scenes" hidden={!showSidebar}>
        <div class="ui-story-playback__heading"><strong>Scenes</strong><span>{segments.length}</span></div>
        <ol class="ui-story-playback__scenes">
          {#each segments as segment, index (idOf(segment))}
            {@const id = idOf(segment)}
            <li><button type="button" class="ui-story-playback__scene" class:ui-story-playback__scene--selected={selectedSceneId ? selectedSceneId === id : current === segment} class:ui-story-playback__scene--playing={current === segment && playing} onclick={() => onNavigate?.(id)}>
              <span class="ui-story-playback__scene-number">{index + 1}</span><span class="ui-story-playback__scene-label">{segment.label}<small>{status(segment)}</small></span>
              {#if segment.audio}<Icon name="speaker-high" />{/if}
            </button></li>
          {/each}
        </ol>
      </nav>

      <section class="ui-story-playback__stage" aria-label="Story preview">
        <div class="ui-story-playback__context" data-ui-id="story.playback.context">{#if !embedded}<span>{current?.label ?? 'Choose a scene'}</span>{/if}<span>{current?.timing === 'read' ? 'Measured read' : 'Estimated scene'}</span></div>
        {#if current?.context?.characters.length}
          <ul class="ui-story-playback__cast" aria-label="Scene cast">
            {#each current.context.characters as character (character.id)}
              <li class:ui-story-playback__cast-member--active={speaker?.id === character.id} class="ui-story-playback__cast-member" title={`${character.name} · ${character.role}${portraitStatus(character.portraitReferenceId) ? ' · ' + portraitStatus(character.portraitReferenceId) : ''}`}>
                <div class="ui-story-playback__avatar"><Portrait src={portraitUrl(character.portraitReferenceId)} name={character.name} identity={character.id} aspect="1" /></div><span>{character.name}</span>
              </li>
            {/each}
          </ul>
        {/if}
        <div class="ui-story-playback__monitor" class:ui-story-playback__monitor--frame={!!frame}>
          {#if monitor}{@render monitor()}{:else}
            {#if speakerImage}<img class="ui-story-playback__ambience" src={speakerImage} alt="" aria-hidden="true" />{/if}
            {#if focus}
              {#if speaker}<div class="ui-story-playback__speaker-portrait"><Portrait src={speakerImage} name={speaker.name} identity={speaker.id} aspect="1" /></div>{/if}
              <span class="ui-story-playback__speaker">{focus.characterName || (focus.elementType === 'action' ? 'Narration' : focus.elementType)}</span>
              <p class="ui-story-playback__line" class:ui-story-playback__line--dialogue={focus.elementType === 'dialogue'}>{focus.text}</p>
            {:else if current?.audio}
              <Icon name="waveform" /><p class="ui-story-playback__line ui-story-playback__line--quiet">{playing ? 'A moment between lines.' : 'Ready to hear this scene.'}</p>
            {:else}
              <Icon name="headphones" /><h1 class="ui-story-playback__prompt">Choose a reading.</h1><p class="ui-story-playback__line ui-story-playback__line--quiet">Audition a saved reading, or generate a new one for this scene.</p>
              <Button onclick={() => { if (current?.kind === 'scene' && current.sceneId) onOpenReadings?.(current.sceneId) }}>Open readings</Button>
            {/if}
          {/if}
          <div class="ui-story-playback__hud ui-story-playback__focus" title={focusMode ? 'Leave focus' : 'Focus artwork'}>
            <Button onclick={() => onFocusModeChange?.(!focusMode)}><Icon name={focusMode ? 'corners-in' : 'corners-out'} /><span class="visually-hidden">{focusMode ? 'Leave focus' : 'Focus'}</span></Button>
          </div>
        </div>
        {#if message}<p class="ui-story-playback__message" role="status">{message}</p>{/if}
      </section>

      {#if inspectorOpen}
        <aside class="ui-story-playback__hud ui-story-playback__inspector" aria-label="Playback inspector" hidden={!showInspector}>
          {@render inspector?.()}
        </aside>
      {/if}

      <section class="ui-story-playback__hud ui-story-playback__timeline" aria-label="Story timeline">
        {@render timeline?.()}
      </section>
      {#if focusMode}<div class="ui-story-playback__hud ui-story-playback__focus-transport" role="group" aria-label="Focus transport"><Button onclick={() => onTogglePlay?.()} disabled={busy}><Icon name={playing ? 'pause' : 'play'} />{playing ? 'Pause' : 'Play'}</Button><span>{formatTimecode(time)}</span></div>{/if}
    {/if}
  </main>
{/if}

<style>
  .ui-story-playback.ui-story-playback--composing { --timeline-height: 300px; isolation: isolate; }
  .ui-story-playback__atmosphere { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
  .ui-story-playback__atmosphere img { position: absolute; inset: -8%; width: 116%; height: 116%; object-fit: cover; filter: blur(42px); opacity: 0.3; }
  .ui-story-playback__atmosphere::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, color-mix(in srgb, var(--surface-base) 15%, transparent), color-mix(in srgb, var(--surface-base) 32%, transparent)); }
  .ui-story-playback--composing .ui-story-playback__hud { background: color-mix(in srgb, var(--surface-base) 64%, transparent); backdrop-filter: blur(22px); }
  .ui-story-playback--composing .ui-story-playback__stage { z-index: 1; }
  .ui-story-playback--composing.ui-story-playback--has-frame .ui-story-playback__stage { inset: 8px calc(var(--inspector-space) + 8px) calc(var(--timeline-height) + 8px) calc(var(--sidebar-space) + 8px); gap: 0; }
  .ui-story-playback--composing.ui-story-playback--has-frame .ui-story-playback__context,
  .ui-story-playback--composing.ui-story-playback--has-frame .ui-story-playback__cast { display: none; }
  .ui-story-playback--composing.ui-story-playback--has-frame .ui-story-playback__monitor { overflow: hidden; }
  .ui-story-playback--composing.ui-story-playback--focus-mode.ui-story-playback--has-frame .ui-story-playback__stage { inset: 16px 16px 72px; }
  .ui-story-playback--composing .ui-story-playback__timeline :global(.player) { height: auto; min-height: 0; background: transparent; }
  .ui-story-playback--composing .ui-story-playback__timeline :global(.player__transport),
  .ui-story-playback--composing .ui-story-playback__timeline :global(.player__track) { background: color-mix(in srgb, var(--surface-base) 28%, transparent); }
  @media (prefers-reduced-transparency: reduce) { .ui-story-playback--composing .ui-story-playback__hud { background: var(--surface-base); backdrop-filter: none; } }
  .ui-story-playback--composing .ui-story-playback__monitor--frame { padding: 0; }
  .ui-story-playback.ui-story-playback--embedded { height: 100%; }
  .ui-story-playback { --sidebar-space: 231px; --inspector-width: 340px; --inspector-space: var(--inspector-width); --timeline-height: 276px; display: block; height: 100vh; overflow: hidden; position: relative; background: var(--surface-base); color: var(--text-primary); }
  .ui-story-playback.ui-story-playback--sidebar-hidden { --sidebar-space: 0px; }
  .ui-story-playback.ui-story-playback--inspector-hidden { --inspector-space: 0px; }
  .ui-story-playback--sidebar-hidden .ui-story-playback__stage { left: 12px; }
  .ui-story-playback--inspector-hidden .ui-story-playback__stage { right: 12px; }
  .ui-story-playback__nav[hidden], .ui-story-playback__inspector[hidden] { display: none; }
  .ui-story-playback__hud { background: color-mix(in srgb, var(--surface-raised) 88%, transparent); backdrop-filter: blur(20px); border: 1px solid var(--border-hairline); border-radius: var(--radius-md, 8px); }
  .ui-story-playback__nav { position: absolute; z-index: 3; top: 12px; left: 12px; bottom: calc(var(--timeline-height) + 26px); width: 215px; overflow: auto; }
  .ui-story-playback__heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 12px; font-size: 12px; border-bottom: 1px solid var(--border-hairline); }
  .ui-story-playback__heading > span { color: var(--text-secondary); }
  .ui-story-playback__scenes { list-style: none; padding: 4px; margin: 0; }
  .ui-story-playback__scene { width: 100%; display: grid; grid-template-columns: 18px minmax(0, 1fr) 14px; align-items: start; gap: 7px; text-align: left; padding: 12px 8px; background: transparent; border: 1px solid transparent; border-radius: 5px; color: var(--text-secondary); cursor: pointer; font: inherit; font-size: 12px; }
  .ui-story-playback__scene:hover { background: var(--surface-raised); color: var(--text-primary); }
  .ui-story-playback__scene--selected { border-color: var(--border-default); background: var(--surface-raised); color: var(--text-primary); }
  .ui-story-playback__scene--playing { border-inline-start-color: var(--border-focus); }
  .ui-story-playback__scene-number { font-family: var(--font-mono); font-size: 11px; opacity: 0.65; min-width: 18px; }
  .ui-story-playback__scene-label { flex: 1; line-height: 1.5; }
  .ui-story-playback__scene-label small { display: block; margin-top: 4px; font-size: 10px; color: var(--text-secondary); }
  .ui-story-playback__stage { position: absolute; inset: 12px calc(var(--inspector-space) + 28px) calc(var(--timeline-height) + 34px) 250px; display: flex; flex-direction: column; gap: 16px; min-height: 0; }
  .ui-story-playback__context { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; color: var(--text-secondary); font-size: 11px; line-height: 1.5; }
  .ui-story-playback__context span:last-child { white-space: nowrap; }
  .ui-story-playback__monitor { flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 16px; padding: 16px; position: relative; isolation: isolate; overflow: auto; }
  .ui-story-playback__monitor > :global(.ph) { font-size: 42px; color: var(--text-secondary); }
  .ui-story-playback__cast { display: flex; flex-wrap: wrap; gap: 12px; list-style: none; padding: 0; margin: 0; }
  .ui-story-playback__cast-member { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 11px; }
  .ui-story-playback__avatar { width: 40px; flex: 0 0 40px; border-radius: 50%; overflow: hidden; border: 2px solid var(--border-default); }
  .ui-story-playback__cast-member--active { color: var(--text-primary); }
  .ui-story-playback__cast-member--active .ui-story-playback__avatar { border-color: var(--border-focus); }
  .ui-story-playback__speaker-portrait { width: 104px; flex-shrink: 0; border-radius: 50%; overflow: hidden; border: 2px solid var(--border-focus); }
  .ui-story-playback__ambience { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(45px); opacity: 0.07; z-index: -1; pointer-events: none; }
  .ui-story-playback__speaker { font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: var(--text-secondary); }
  .ui-story-playback__line { margin: 0; max-width: 42ch; font-size: 1.625rem; line-height: 1.55; text-wrap: pretty; }
  .ui-story-playback__line--dialogue { font-weight: 500; }
  .ui-story-playback__prompt { font-size: 26px; font-weight: 500; margin: 0; }
  .ui-story-playback__line--quiet { color: var(--text-secondary); font-size: 15px; max-width: 38ch; }
  .ui-story-playback__message { position: absolute; bottom: 30px; left: 0; right: 0; padding: 12px; text-align: center; background: var(--surface-raised); border-radius: 6px; font-size: 12px; }
  .ui-story-playback__inspector { position: absolute; z-index: 3; inset: 0 0 0 auto; width: var(--inspector-width); box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden; border: 0; border-left: 1px solid var(--border-default); border-radius: 0; }
  .ui-story-playback__focus { position: absolute; z-index: 5; right: 12px; bottom: 12px; padding: 2px; }
  .ui-story-playback__focus :global(button) { padding: 7px; border: 0; }
  .ui-story-playback__timeline { position: absolute; z-index: 4; left: 12px; right: calc(var(--inspector-space) + 12px); bottom: 12px; height: var(--timeline-height); display: flex; flex-direction: column; overflow: hidden; }
  .ui-story-playback__opening { position: absolute; inset: 100px 20px 20px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 20px; }
  .ui-story-playback--focus-mode .ui-story-playback__nav,
  .ui-story-playback--focus-mode .ui-story-playback__inspector,
  .ui-story-playback--focus-mode .ui-story-playback__timeline { visibility: hidden; pointer-events: none; }
  .ui-story-playback--focus-mode .ui-story-playback__stage { inset: 16px 16px 70px; }
  .ui-story-playback__focus-transport { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 20px; padding: 8px 16px; font-family: var(--font-mono); font-size: 12px; }
  .ui-story-playback__preview.ui-story-playback__preview--embedded { height: 100%; }
  .ui-story-playback__preview { height: 100vh; display: flex; flex-direction: column; }
  .ui-story-playback__preview > header { padding: 8px 16px; display: flex; align-items: center; gap: 16px; font-size: 12px; color: var(--text-secondary); }
  @media (max-width: 1100px) { .ui-story-playback { --inspector-width: 320px; --sidebar-space: 196px; } .ui-story-playback__nav { width: 180px; } .ui-story-playback__stage { left: 210px; } }
  @container viewport (max-width: 1100px) { .ui-story-playback { --inspector-width: 320px; --sidebar-space: 196px; } .ui-story-playback__nav { width: 180px; } .ui-story-playback__stage { left: 210px; } }
  @media (prefers-reduced-motion: no-preference) { .ui-story-playback__hud, .ui-story-playback__stage { transition: opacity 160ms ease; } }
</style>

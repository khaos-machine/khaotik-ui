<script>
  // The composition timeline: scene segments sized by duration, element bars coloured by
  // kind, a transport, and a playhead that sweeps through composition time.
  //
  // Renders as positioned DOM blocks, not canvas and not SVG. That is the approach the
  // khaos-studio/story-player prototype arrived at, and it is the right one here for a
  // reason specific to this surface: **the timeline is static during playback.** Only the
  // playhead moves, so canvas's cheap-full-redraw advantage buys nothing, while DOM gives
  // real hit-testing, keyboard access, and token-driven theming for free.
  //
  // Scale is PIXELS PER SECOND with horizontal scroll — never fit-to-width. Fitting a
  // feature to the viewport puts 70% of a 1,243-element composition under one pixel
  // (measured on Forrest Gump at 1200px). At the default 10 px/s a one-second beat is
  // 10px: visible, clickable, and still exactly proportional.
  //
  // Controlled: the host owns time and playback and this reports intent, matching the
  // rest of the library. That keeps the transport audio-agnostic, so real audio can sit
  // behind the same props later without touching this component.
  import { onDestroy } from 'svelte'
  import Icon from './Icon.svelte'
  import PictureTimelineLane from './internal/PictureTimelineLane.svelte'
  import Waveform from './Waveform.svelte'
  import { buildLanes, buildTimeline, elementAt, formatTimecode, segmentAt } from './lib/timeline.js'

  /**
   * @typedef {Object} CompositionEvent
   * @property {string} elementType
   * @property {string} [elementId]
   * @property {number} [startMs] Integer milliseconds into its segment. A scene read's lines carry it (KSPD RFC 0085 amendment 3), so they sit where the joiner placed them, pauses kept. Without it an event follows the one before.
   * @property {number} [durationMs] Integer milliseconds. Absent on every event of every composition the daemon serves today, which is why its absence is NOT reported as unreadable — it would fire the loud channel on healthy data. An event with no `durationMs` keeps its place in the order and draws as an unmeasured marker.
   * @property {string} [text]
   * @property {string} [characterName]
   * @property {string} [parenthetical]
   * @property {string} [audioUrl]
   * @property {boolean} [hasAudio]
   */

  /**
   * @typedef {Object} CompositionSegment
   * @property {'scene'|'section'} [kind] `section` rows are STRUCTURE — an act or a sequence — and are partitioned out of the track into the band above the ruler. They are not scenes and they are not lanes.
   * @property {string} [sceneId]
   * @property {string} [sectionId] Present on `kind: 'section'` rows; the id `onSelectSection` reports.
   * @property {number} [level] Section depth — 1 is an act, deeper is a sequence. One band row per level.
   * @property {string} [label]
   * @property {number} [startMs] Integer milliseconds. **Required.** Position has no second source since the cursor accumulator was deleted, so an absent `startMs` is reported rather than guessed.
   * @property {number|null} [durationMs] Integer milliseconds, or `null` for *not measured*. **Required by RFC 0069 §3.1.1** — an absent key is reported on the unreadable channel and never inferred from the plausibility of a value. `0` is a real measurement below the model's resolution and is NOT the same fact as `null`.
   * @property {readonly CompositionEvent[]} [events]
   */

  /**
   * A lane is an ELEMENT KIND. Sections are not lanes and never appear here: they arrive
   * on the segment axis (`segment.kind`), lanes reason about the element axis
   * (`event.elementType`), and merging the two axes is what put a phantom `synopsis` lane
   * on the track (D66 — two axes get two items). A genuinely new element kind the engine
   * adds later still gets its own lane; that rule is untouched.
   * @typedef {'scenes'|'action'|'dialogue'|'transition'|'audio'} Lane
   */

  /** @typedef {import('./lib/picture-range.js').PictureClip} PictureClip */
  /**
   * @typedef {Object} Props
   * @property {readonly PictureClip[] | null} [pictures] Optional authored picture clips in composition seconds; null omits the lane. Host owns persistence, reference choice and timing constraints.
   * @property {string} [activePictureId] Engine-resolved picture currently under the playhead, independent of selection.
   * @property {string} [selectedPictureId] Selected authored picture clip.
   * @property {(id:string,source?:'context')=>void} [onSelectPicture] Select a picture; host chooses whether to pause/seek.
   * @property {(id:string,range:{start:number,duration:number})=>void} [onChangePicture] Commit one move/trim; no callback on cancelled gestures. Shift bypasses pointer 0.1s snapping; keyboard arrows edit by 0.1s, Shift+arrows by 1s.
   * @property {(id:string,action:'add'|'insertBefore'|'insertAfter'|'split'|'delete')=>void} [onPictureAction] Explicit picture-track editing intent.
   * @property {import("svelte").Snippet} [tools] Host tools for intentional timeline selection.
   * @property {boolean} [showContext] Show the scene heading in the transport.
   * @property {string} [selectedReadingId] Intentionally selected reading scene id.
   * @property {(sceneId:string)=>void} [onSelectReading] Reading selection, separate from seeking.
   * @property {boolean} [showInspector] Render the built-in text panel. False when the host provides its own inspector.
   * @property {Record<string, {state: 'loading'|'ready'|'failed', peaks?: {version: number, channels: number, sample_rate: number, samples_per_pixel: number, bits: number, length: number, data: number[]}, message?: string}>} [waveforms] Saved read waveforms keyed by scene id. Each recording starts at zero locally; its scene supplies its position on the story timeline. Pending and failed media keep a seekable read block.
   * @property {boolean} [audioEmphasis] Emphasize the recording track with neutral event bars and a brand playhead. Default false preserves the composition view.
   * @property {readonly CompositionSegment[]} [segments] khaosd's enriched composition segments, verbatim, on the **0.11.0 wire**: `{ kind, sceneId?, sectionId?, level?, label, startMs, durationMs, events: [{ elementType, elementId, durationMs?, text?, … }] }`. Times are integer MILLISECONDS on the way in and seconds on the way out. `durationMs` and `startMs` are asserted for PRESENCE — a row missing either is reported to the operator, never sized zero.
   * @property {number} [currentTime] Playhead position in seconds. Controlled — the host owns the clock; this component never advances it.
   * @property {boolean} [playing] Whether the host is playing. Drives the transport icon only; playback itself is the host's.
   * @property {number} [scale] Pixels per second, and the timeline scrolls horizontally. NOT fit-to-width: fitting a feature-length composition to a viewport puts most beats under one pixel. At the default 10, a one-second beat is 10px and still exactly proportional.
   * @property {string} [selectedElementId] Explicitly selected element. Takes precedence over the playhead for the content panel, so reading a beat does not fight the transport.
   * @property {string} [selectedSectionId] Explicitly selected SECTION — an act or a sequence on the band. Its own axis, deliberately: reusing `selectedElementId` for it would merge the segment axis and the element axis that D66 keeps apart. Takes precedence over both the playhead and an element selection, because it is the more explicit act.
   * @property {readonly Lane[]} [lanes] Which typed lanes to draw, in order (#22) — `scenes`, `action`, `dialogue`, `transition`, `audio`. The ruler is always drawn. **Sections are not among them** — they are structure over the ruler, and they never reach this list. The lanes are **derived from `segments`**, not supplied: every one is already recoverable from the composition khaosd returns, so a lane prop carrying its own segment lists would be a second source for the same truth. This chooses and orders; it does not carry data. A lane with no content is omitted, and an element kind the engine adds later appears on its own lane rather than vanishing. **Values must be distinct** — this list is keyed on the lane name, so a duplicate throws `each_key_duplicate` and the timeline does not render. The same rule a `<select>` has always had. The one wrinkle its siblings do not have: empty lanes are dropped (`lib/timeline.js`), so a repeated lane only collides when it actually has content — which makes a duplicate render fine on one composition and abort on the next.
   * @property {(seconds: number) => void} [onSeek] Seconds. Fired by clicking the ruler or a beat.
   * @property {(elementId: string) => void} [onSelect] The clicked element id.
   * @property {(sectionId: string) => void} [onSelectSection] The clicked section id. Fired by the band, and by nothing else — a band click never reports on `onSelect` or moves the playhead, because selecting an act is not seeking to one.
   * @property {() => void} [onTogglePlay] Play/pause pressed.
   * @property {() => void} [onStop] Stop pressed.
   * @property {() => void} [onPreviousScene] Previous scene pressed.
   * @property {() => void} [onNextScene] Next scene pressed.
   * @property {() => void} [onPreviousBeat] Previous beat pressed.
   * @property {() => void} [onNextBeat] Next beat pressed.
   * @property {() => void} [onScrubStart] Pointer scrubbing begins; host may pause its audio clock.
   * @property {() => void} [onScrubEnd] Pointer gesture ends or is cancelled; host may resume playback.
   * @property {(scale: number) => void} [onScaleChange] New pixels-per-second from the zoom control.
   * @property {number} [minScale] The zoom control's lowest pixels-per-second. Defaults to 2.
   * @property {number} [maxScale] The zoom control's highest pixels-per-second. Defaults to 50; a scene read goes to 400.
   * @property {{version: number, channels: number, sample_rate: number, samples_per_pixel: number, bits: number, length: number, data: number[]} | null} [peaks] The recording behind the timeline's clock, as khaosd's audiowaveform v2 peaks — one scene read. Given, each measured block draws its stretch of the waveform inside its button, after its name; the button's name, focus and keys are unchanged. The composition Player passes none.
   */

  /** @type {Props} */
  let {
    // khaosd's enriched composition segments, verbatim.
    segments = [],
    currentTime = 0,
    playing = false,
    // Pixels per second.
    scale = 10,
    selectedElementId = '',
    selectedSectionId = '',
    // Which typed lanes to draw, in order (#22). khaos.machine.x's timeline has
    // six; the ruler is always drawn, and these are the other five.
    //
    // The lanes are DERIVED from `segments` rather than supplied — every one of
    // them is already recoverable from the composition khaosd returns, so a
    // `lanes` prop carrying its own segment lists would be a second source for
    // the same truth and a second chance to disagree with the scene list. This
    // prop chooses and orders; it does not carry data. A lane with no content is
    // omitted, and a kind the engine adds later appears on its own lane rather
    // than vanishing.
    //
    // A LANE IS AN ELEMENT KIND, and a SECTION IS NOT ONE. Sections arrive on the
    // segment axis and are partitioned out in `buildTimeline` before `buildLanes`
    // ever sees them, so an act cannot appear here however deep the composition
    // nests. The `synopsis` lane this used to draw was that partition missing:
    // a segment-axis fact leaking into an element-axis function, appended by the
    // extras rule that exists for a genuinely new element kind. The extras rule
    // is untouched; the leak was upstream of it (D66).
    lanes = ['scenes', 'action', 'dialogue', 'transition', 'audio'],
    onSeek = undefined,
    onSelect = undefined,
    onSelectSection = undefined,
    onTogglePlay = undefined,
    onStop = undefined,
    onPreviousScene = undefined,
    onNextScene = undefined,
    onPreviousBeat = undefined,
    onNextBeat = undefined,
    onScrubStart = undefined,
    onScrubEnd = undefined,
    onScaleChange = undefined,
    minScale = 2,
    maxScale = 50,
    peaks = null,
    waveforms = {},
    audioEmphasis = false,
    pictures = null,
    selectedPictureId = '', activePictureId = '',
    onSelectPicture = undefined,
    onChangePicture = undefined,
    onPictureAction = undefined,
    showInspector = true,
    tools = undefined, showContext = true, selectedReadingId = '', onSelectReading = undefined,
  } = $props()

  // A function declaration, not a const arrow: it is used by $derived above its own
  // position in source order, and only declarations hoist.
  function idOf(event) {
    return event?.elementId ?? ''
  }

  // Presentation for the lane keys. An unknown lane renders its own key rather
  // than being hidden, so a kind added upstream is visible instead of silently
  // absent.
  const LANE_LABELS = {
    scenes: 'Scenes',
    action: 'Action',
    dialogue: 'Dialogue',
    transition: 'Transition',
    audio: 'Audio',
  }

  // One band row per section level: 1 is an act, deeper is a sequence.
  const BAND_LABELS = { 1: 'Acts', 2: 'Sequences' }

  // A `null` duration cannot be drawn proportionally — there is no value to be
  // proportional TO — and `0` is a real measurement the track cannot resolve. Both get a
  // fixed width, and they get DIFFERENT ones, because *unknown* and *shorter than I can
  // measure* are different claims and the whole of #124 is about not merging them.
  const UNMEASURED_PX = 12
  const BELOW_RESOLUTION_PX = 4

  const timeline = $derived(buildTimeline(segments))
  const laneRows = $derived(buildLanes(timeline, lanes))
  const sections = $derived(timeline.sections)
  const unreadable = $derived(timeline.unreadable)
  const total = $derived(timeline.total)
  const clamped = $derived(Math.min(Math.max(currentTime ?? 0, 0), total))

  const bandLevels = $derived([...new Set(sections.map((s) => s.level ?? 1))].sort((a, b) => a - b))
  // Distinct keys, not a joined blob: the operator is told WHICH key the wire stopped
  // sending, which is the difference between "something is wrong" and a diagnosis.
  const unreadableKeys = $derived([...new Set(unreadable.map((u) => u.key))].join(', '))

  const selectedSection = $derived(sections.find((s) => s.sectionId === selectedSectionId) ?? null)
  // 21 of 28 sections on the live project carry no synopsis, so the absent case is the
  // common one and the panel states it rather than rendering an empty box.
  const sectionSynopsis = $derived(
    selectedSection?.events?.find((e) => e.elementType === 'synopsis')?.text ?? '',
  )

  function segmentWidth(duration) {
    if (duration === null) return `${UNMEASURED_PX}px`
    if (duration === 0) return `${BELOW_RESOLUTION_PX}px`
    return `${duration * scale}px`
  }

  function eventWidth(duration) {
    if (duration === null) return `${UNMEASURED_PX}px`
    return `${duration * scale}px`
  }

  // `${event.duration}s` rendered the literal string "nulls" on an unmeasured beat.
  function eventTitle(event) {
    const length = event.duration === null ? 'duration unknown' : `${event.duration}s`
    return `${event.elementType} · ${formatTimecode(event.start)} · ${length}`
  }

  const currentSegment = $derived(segmentAt(timeline, clamped))
  const currentElement = $derived(elementAt(timeline, clamped))

  // What the panel shows: an explicit selection outrides the playhead, so clicking a beat
  // and reading it does not fight the transport.
  const shown = $derived(
    (selectedElementId
      ? timeline.segments.flatMap((s) => s.events).find((e) => idOf(e) === selectedElementId)
      : null) ?? currentElement,
  )
  const shownSegment = $derived(
    shown ? timeline.segments.find((s) => s.events.includes(shown)) ?? currentSegment : currentSegment,
  )

  const trackWidth = $derived(Math.max(total * scale, 1))
  const hasRecordings = $derived(Object.keys(waveforms).length > 0)

  let viewport = $state(null)
  let track = $state(null)
  let scrubbing = $state(false)
  let pointerId = null
  let skipClick = false
  onDestroy(() => { if (scrubbing) onScrubEnd?.() })

  // Keep the playhead in view while it plays. Scrolls only when it actually leaves the
  // viewport, so a user who has scrolled away to read something is not yanked back on
  // every tick.
  // `scrollTo` is feature-detected, not assumed: jsdom does not implement it, and a
  // component that throws from an effect on a missing convenience API takes the whole
  // surface down in any environment that lacks it. Falling back to `scrollLeft` keeps the
  // behaviour; skipping entirely would still be better than throwing.
  $effect(() => {
    if (scrubbing) return
    const x = clamped * scale
    const el = viewport
    if (!el) return
    if (x >= el.scrollLeft && x <= el.scrollLeft + el.clientWidth - 24) return

    const left = Math.max(0, x - el.clientWidth / 2)
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({ left, behavior: 'smooth' })
    } else {
      el.scrollLeft = left
    }
  })

  function pick(event) {
    onSeek?.(event.start)
    onSelect?.(idOf(event))
  }

  function seekRead(event, segment) {
    onSelectReading?.(segment.sceneId)
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.detail === 0 ? 0 : Math.min(Math.max(event.clientX - rect.left, 0), rect.width)
    onSeek?.(Math.min(segment.start + x / scale, segment.start + segment.duration))
  }

  function seekAt(clientX) {
    if (!track) return
    // Its client rectangle already includes horizontal scrolling.
    const x = clientX - track.getBoundingClientRect().left
    onSeek?.(Math.min(Math.max(x / scale, 0), total))
  }
  function seekFromPointer(event) {
    if (skipClick && event.detail !== 0) { skipClick = false; return }
    seekAt(event.clientX)
  }
  function startScrub(event) {
    if (event.button !== 0 || event.isPrimary === false || pointerId !== null) return
    event.preventDefault()
    pointerId = event.pointerId
    scrubbing = true
    skipClick = true
    onScrubStart?.()
    seekAt(event.clientX)
  }
  function moveScrub(event) {
    if (event.pointerId === pointerId && scrubbing) seekAt(event.clientX)
  }
  function endScrub(event) {
    if (!scrubbing || (event && 'pointerId' in event && event.pointerId !== pointerId)) return
    scrubbing = false
    pointerId = null
    onScrubEnd?.()
  }
  function seekByKey(event) {
    const step = event.shiftKey ? 10 : 1
    const time = event.key === 'Home' ? 0 : event.key === 'End' ? total
      : event.key === 'ArrowLeft' ? clamped - step : event.key === 'ArrowRight' ? clamped + step : null
    if (time === null) return
    event.preventDefault()
    event.stopPropagation()
    onSeek?.(Math.min(Math.max(time, 0), total))
  }

  // A tick per minute while that stays legible, then coarser. At 10 px/s a minute is
  // 600px; at the 2 px/s floor it is 120px, and below ~90px the labels collide. Above
  // 50 px/s — a scene read zoomed in — a minute is too far apart, so 5 s from 60 px/s
  // (300px) and 1 s from 200 px/s (200px).
  const tickStep = $derived(scale >= 200 ? 1 : scale >= 60 ? 5 : scale >= 4 ? 60 : scale >= 2 ? 300 : 600)
  const ticks = $derived(
    total > 0 ? Array.from({ length: Math.floor(total / tickStep) + 1 }, (_, i) => i * tickStep) : [],
  )
</script>

<svelte:window onpointermove={moveScrub} onpointerup={endScrub} onpointercancel={endScrub} onblur={endScrub} />

<div class="player" class:player--audio={audioEmphasis}>
  <div class="player__transport" role="group" aria-label="Playback controls">
    <button type="button" aria-label="Go to beginning" title="Go to beginning (Home)" disabled={!total} onclick={() => onSeek?.(0)}><Icon name="caret-line-left" /></button>
    {#if onPreviousScene}<button type="button" aria-label="Previous scene" title="Previous scene" disabled={!total} onclick={onPreviousScene}><Icon name="skip-back" /></button>{/if}
    {#if onPreviousBeat}<button type="button" aria-label="Previous beat" title="Previous beat" disabled={!total} onclick={onPreviousBeat}><Icon name="rewind" /></button>{/if}
    <button
      class="player__play"
      type="button"
      aria-label={playing ? 'Pause' : 'Play'}
      onclick={() => onTogglePlay?.()}>
      <Icon name={playing ? 'pause' : 'play'} weight="fill" />
    </button>

    {#if onStop}<button type="button" aria-label="Stop" title="Stop" onclick={onStop}><Icon name="stop" /></button>{/if}
    {#if onNextBeat}<button type="button" aria-label="Next beat" title="Next beat" disabled={!total} onclick={onNextBeat}><Icon name="fast-forward" /></button>{/if}
    {#if onNextScene}<button type="button" aria-label="Next scene" title="Next scene" disabled={!total} onclick={onNextScene}><Icon name="skip-forward" /></button>{/if}
    <button type="button" aria-label="Go to end" title="Go to end (End)" disabled={!total} onclick={() => onSeek?.(total)}><Icon name="caret-line-right" /></button>
    <span class="player__timecode">{formatTimecode(clamped)} / {formatTimecode(total)}</span>

    <label class="player__zoom">
      <span class="player__zoom-label">Zoom</span>
      <input
        type="range"
        min={minScale}
        max={maxScale}
        step="1"
        value={scale}
        aria-label="Timeline zoom, pixels per second"
        oninput={(e) => onScaleChange?.(Number(e.currentTarget.value))} />
    </label>

    {#if tools}<div class="player__tools" role="toolbar" aria-label="Selected item tools">{@render tools()}</div>{:else if showContext}<span class="player__context">{shownSegment?.label ?? ''}</span>{/if}
  </div>

  <!-- THE LOUD CHANNEL, and it is ordered FIRST deliberately. In the unreadable state
       `total` is 0, so a `{#if total === 0}` branch placed above this would tell the
       operator the project has no composition when it has one this build cannot read —
       the original silent failure, moved up a layer and wearing new copy. The empty
       message is therefore also suppressed while anything is unreadable, and a
       PARTIALLY readable composition still draws the rows it could read. -->
  {#if unreadable.length > 0}
    <p class="player__unreadable" role="status">
      {unreadable.length} of {segments?.length ?? 0} composition rows could not be read: <code>{unreadableKeys}</code>
      missing. A duration is never inferred from the plausibility of a value, so these rows are not drawn.
    </p>
  {/if}

  {#if total === 0 && unreadable.length === 0}
    <p class="player__empty">This project has no composition yet.</p>
  {:else if total > 0}
    <div class="player__stage">
      <!-- The lane labels live BESIDE the track, not inside it. In the track they
           sat on top of the first bar of every lane — a label with a background
           covering the thing it labels — and they scrolled away the moment the
           track was panned, which on a 54-scene composition is immediately. -->
      <div class="player__gutter" aria-hidden="true">
        <!-- The band's own gutter rows, above the ruler spacer, so the band labels line
             up with the band rows exactly as the lane labels line up with the lanes. -->
        {#each bandLevels as level (level)}
          <span class="player__band-gutter">{BAND_LABELS[level] ?? `Level ${level}`}</span>
        {/each}
        <span class="player__gutter-spacer"></span>
        {#if pictures!==null}<span class="player__picture-label">Picture</span>{/if}
        {#if hasRecordings}<span class="player__lane-label player__read-label">Readings</span>{/if}
        {#each laneRows as row (row.lane)}
          <span class="player__lane-label" data-lane={row.lane}>{LANE_LABELS[row.lane] ?? row.lane}</span>
        {/each}
      </div>

    <div class="player__viewport" bind:this={viewport}>
      <div class="player__track" bind:this={track} style:width={`${trackWidth}px`}>
        <!-- The section band sits ABOVE the ruler, one row per level (1 = act, deeper =
             sequence). A synopsis is not a lane and a section is not a lane item, so
             these are drawn here rather than being pushed through `buildLanes`.
             Their width comes from a COMPUTED span, because `durationMs: null` on a
             section is honest — it owns a range of scenes, not a duration. -->
        {#each bandLevels as level (level)}
          <div class="player__band" data-level={level}>
            <!-- Keyed by index, like every other list on this surface: khaosd sends
                 empty-string ids and `??` cannot see them. See list-row-keys.test.js. -->
            {#each sections.filter((s) => (s.level ?? 1) === level) as section, i (i)}
              <button
                class="player__band-item"
                class:player__band-item--on={section.sectionId === selectedSectionId}
                type="button"
                style:left={`${section.start * scale}px`}
                style:width={`${section.span * scale}px`}
                title={section.label}
                onclick={() => onSelectSection?.(section.sectionId)}>
                {section.label}
              </button>
            {/each}
          </div>
        {/each}

        <!-- The ruler doubles as the scrub surface: clicking time is how you seek. -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="player__ruler" onpointerdown={startScrub} onclick={seekFromPointer}>
          {#each ticks as tick (tick)}
            <span class="player__tick" style:left={`${tick * scale}px`}>{formatTimecode(tick)}</span>
          {/each}
        </div>

        {#if pictures!==null}<PictureTimelineLane clips={pictures} {scale} {total} selectedId={selectedPictureId} activeId={activePictureId} onSelect={onSelectPicture} onChange={onChangePicture} onAction={onPictureAction} />{/if}
        {#if hasRecordings}
          <div class="player__read-lane" aria-label="Saved reading waveforms">
            {#each timeline.segments as segment, i (i)}
              {@const wave = waveforms[segment.sceneId]}
              {#if wave && segment.duration !== null}
                <button type="button" class="player__read" class:player__read--on={segment === currentSegment} class:player__read--selected={segment.sceneId === selectedReadingId} aria-pressed={segment.sceneId === selectedReadingId}
                  style:left={`${segment.start * scale}px`} style:width={`${segment.duration * scale}px`}
                  aria-label={`Seek reading: ${segment.label}`} onclick={event => seekRead(event, segment)}>
                  <span class="player__read-name">{segment.label}</span>
                  {#if wave.state === 'ready' && wave.peaks}
                    <Waveform peaks={wave.peaks} from={0} to={segment.duration} />
                  {:else}
                    <span class="player__read-status">{wave.state === 'loading' ? 'Loading waveform…' : wave.message || 'Waveform unavailable'}</span>
                  {/if}
                </button>
              {/if}
            {/each}
          </div>
        {/if}
        {#each laneRows as row (row.lane)}
          <div class="player__lane" data-lane={row.lane}>
            {#if row.lane === 'scenes'}
              <!-- Keyed by index. khaosd sends empty-string ids and `??` cannot
                   see them, so every row keyed the same and the block threw
                   `each_key_duplicate`, aborting the subtree. See list-row-keys.test.js. -->
              {#each row.items as segment, i (i)}
                <!-- THREE render states, not one. `duration * scale` is correct for a
                     measured scene and a lie for the other two: `null * scale` is 0, so
                     a scene the index could not measure asserts it takes no time; and a
                     genuine `0` — shorter than `wordCount × 60 / 250` can express —
                     survives every arithmetic check and still draws as nothing. -->
                <div
                  class="player__segment"
                  class:player__segment--on={segment === currentSegment}
                  class:player__segment--unmeasured={segment.duration === null}
                  class:player__segment--below-resolution={segment.duration === 0}
                  style:left={`${segment.start * scale}px`}
                  style:width={segmentWidth(segment.duration)}
                  title={segment.label}>
                  <span class="player__segment-label">{segment.label}</span>
                  {#if segment.duration === null}
                    <span class="player__sr">This scene has not been measured.</span>
                  {:else if segment.duration === 0}
                    <span class="player__sr">Shorter than the timeline can express.</span>
                  {/if}
                </div>
              {/each}
            {:else}
              <!-- Positioned in ABSOLUTE composition time. In the single-row layout
                   these sat inside their segment and were offset from it; a lane
                   spans the whole track, so segment-relative left would stack every
                   scene's beats on top of each other at the start. -->
              <!-- Index-keyed like the scene lane above. `||` handled the empty id but the
                   fallback was not unique: an event carrying no duration used to read as
                   0, so two of them in one lane shared a `start` and collided on
                   `${row.lane}-0`. They now read as `null`, which is the honest value and
                   an equally poor key. -->
              {#each row.items as event, i (i)}
                <button
                  class="player__event"
                  class:player__event--on={event === currentElement}
                  class:player__event--selected={!!selectedElementId && idOf(event) === selectedElementId}
                  aria-pressed={!!selectedElementId && idOf(event) === selectedElementId}
                  class:player__event--unmeasured={event.duration === null}
                  data-kind={event.elementType}
                  type="button"
                  style:left={`${event.start * scale}px`}
                  style:width={eventWidth(event.duration)}
                  title={eventTitle(event)}
                  onclick={() => pick(event)}>
                  <!-- Named for screen readers and for the library's DOM tests; the bar
                       itself is often too narrow to carry visible text. -->
                  <span class="player__sr">
                    {event.elementType}
                    {event.characterName ?? ''} at {formatTimecode(event.start)}
                    {#if event.duration === null}· duration unknown{/if}
                  </span>
                  {#if audioEmphasis}<span class="player__event-name">{event.characterName || event.elementType}</span>{/if}
                  {#if peaks && event.duration !== null}
                    <Waveform {peaks} from={event.start} to={event.start + event.duration} />
                  {/if}
                </button>
              {/each}
            {/if}
          </div>
        {/each}

        <div class="player__playhead" role="slider" tabindex="0" aria-label="Timeline playhead" aria-valuemin={0} aria-valuemax={total} aria-valuenow={clamped} aria-valuetext={formatTimecode(clamped)} style:transform={`translateX(${clamped * scale}px)`} onpointerdown={startScrub} onkeydown={seekByKey}></div>
      </div>
    </div>
    </div>

    {#if showInspector}<div class="player__panel">
      <!-- The band's synopsis prose lives HERE, never on the track. A selected section
           outrides both the playhead and an element selection: it is the more explicit
           act, and it is the only thing on this surface that can show a synopsis. -->
      {#if selectedSection}
        <p class="player__panel-meta">
          <span class="player__kind" data-kind="section">{selectedSection.label}</span>
          <span class="player__panel-time">
            {formatTimecode(selectedSection.start)} – {formatTimecode(selectedSection.start + selectedSection.span)}
          </span>
        </p>
        {#if sectionSynopsis}
          <p class="player__panel-text">{sectionSynopsis}</p>
        {:else}
          <p class="player__panel-text player__panel-text--muted">There is no synopsis for this section.</p>
        {/if}
      {:else if shown}
        <p class="player__panel-meta">
          <span class="player__kind" data-kind={shown.elementType}>{shown.elementType}</span>
          {#if shown.characterName}<strong>{shown.characterName}</strong>{/if}
          {#if shown.parenthetical}<em>({shown.parenthetical})</em>{/if}
          <!-- `shown.start + shown.duration` is `start + null === start` on an unmeasured
               beat, which renders "1:20 – 1:20" — a claim of zero length, silently. -->
          {#if shown.duration === null}
            <span class="player__panel-time">{formatTimecode(shown.start)} – duration unknown</span>
          {:else}
            <span class="player__panel-time">{formatTimecode(shown.start)} – {formatTimecode(shown.start + shown.duration)}</span>
          {/if}
          {#if shown.hasAudio}<Icon name="speaker-high" />{/if}
        </p>
        <p class="player__panel-text">{shown.text ?? ''}</p>
      {:else}
        <p class="player__panel-text player__panel-text--muted">
          Nothing under the playhead. Pick a beat to read it.
        </p>
      {/if}
    </div>{/if}
  {/if}
</div>

<style>
  /* Fills a bounded parent so the content panel takes the height the timeline does not.
     In an unbounded parent (the catalog) `height: 100%` resolves to auto and nothing
     changes, so existing consumers are unaffected. */
  .player {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    min-width: 0;
    height: 100%;
  }

  .player__transport {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  .player__play {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: var(--text-primary);
    cursor: pointer;
  }

  .player__play:hover {
    background: color-mix(in oklab, var(--text-primary) 6%, transparent);
  }

  .player__timecode {
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: var(--caption-size);
    font-variant-numeric: tabular-nums;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .player__tools { display:flex; align-items:center; justify-content:flex-end; gap:var(--spacing-2xs); flex:1; min-width:0; overflow-x:auto; }
  .player__zoom input { accent-color:var(--text-brand); }
  .player__zoom {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .player__zoom-label,
  .player__context {
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }

  /* The scene label can be long; it yields before the controls do. */
  .player__context {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: right;
  }

  /* Lane heights are declared once and used by BOTH columns — the gutter labels
     and the lanes themselves. Two independent height values would drift apart
     and the labels would slide out of alignment with the rows they name. */
  .player__stage {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    --lane-h: 26px;
    --lane-scenes-h: 56px;
    --ruler-h: 20px;
  }

  .player__gutter {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-default);
    border-right: 0;
    border-radius: var(--radius-md) 0 0 var(--radius-md);
    background: var(--surface-base);
  }

  .player__picture-label {height:60px;display:flex;align-items:center;padding:0 var(--spacing-xs);font-size:var(--caption-size);border-bottom:1px solid var(--border-default);box-sizing:border-box}
  .player__gutter-spacer {
    height: var(--ruler-h);
    border-bottom: 1px solid var(--border-default);
  }

  .player__lane-label {
    display: flex;
    align-items: center;
    height: var(--lane-h);
    padding: 0 var(--spacing-xs);
    border-top: 1px solid color-mix(in oklab, var(--border-default) 50%, transparent);
    font-size: var(--caption-size);
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .player__lane-label[data-lane='scenes'] {
    height: var(--lane-scenes-h);
    border-top: 0;
  }

  .player__viewport {
    flex: 0 0 auto;
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    position: relative;
    overflow-x: auto;
    overflow-y: hidden;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background: var(--surface-base);
  }

  /* Height comes from the lanes rather than being fixed: it was 104px for the
     single-row layout, which clipped every lane after the second. */
  .player__track {
    position: relative;
  }

  /* The section band. Structure over the ruler, one row per level — an act boundary is
     worth a row of its own even on the 21-of-28 sections that carry no synopsis. */
  .player__band {
    position: relative;
    height: var(--lane-h);
    border-bottom: 1px solid color-mix(in oklab, var(--border-default) 50%, transparent);
  }

  .player__band-gutter {
    display: flex;
    align-items: center;
    height: var(--lane-h);
    padding: 0 var(--spacing-xs);
    border-bottom: 1px solid color-mix(in oklab, var(--border-default) 50%, transparent);
    font-size: var(--caption-size);
    color: var(--text-secondary);
    white-space: nowrap;
  }

  /* NOT --tone-accent: a passive structural band is not an accent, and gold is reserved
     for the brand and primary actions. `color-mix` against --text-primary is what
     .player__segment already does, so this is theme-correct by construction and needs no
     [data-theme] rule. */
  .player__band-item {
    position: absolute;
    top: 2px;
    bottom: 2px;
    left: 0;
    padding: 0 var(--spacing-2xs);
    border: 0;
    border-left: 1px solid var(--border-default);
    border-radius:0;
    background: color-mix(in oklab, var(--text-primary) 5%, transparent);
    color: var(--text-secondary);
    font-size: var(--caption-size);
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* A section with a computed span of zero is still selectable, on the same reasoning
       .player__event carries min-width for a sub-second beat. */
    min-width: 1px;
    cursor: pointer;
  }

  .player__band-item--on {
    background: color-mix(in oklab, var(--text-primary) 12%, transparent);
    color: var(--text-primary);
  }

  .player__band-item:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 1px;
  }

  .player__ruler {
    position: relative;
    height: 20px;
    cursor: pointer;
    border-bottom: 1px solid var(--border-default);
  }

  .player__tick {
    position: absolute;
    top: 3px;
    padding-left: 4px;
    border-left: 1px solid var(--border-default);
    font-size: var(--caption-size);
    font-variant-numeric: tabular-nums;
    color: var(--text-secondary);
    /* the label is a ruler marking, not a target */
    pointer-events: none;
    user-select: none;
  }

  /* One row per lane, each with its own height — a scene block needs room for a
     slugline, a beat bar does not. Equal heights would make the timeline read as
     a grid of interchangeable things when the lanes are not interchangeable. */
  .player__lane {
    position: relative;
    height: var(--lane-h);
    border-top: 1px solid color-mix(in oklab, var(--border-default) 50%, transparent);
  }

  .player__lane[data-lane='scenes'] {
    height: var(--lane-scenes-h);
    border-top: 0;
  }


  .player__segment {
    position: absolute;
    top: 0;
    height: 100%;
    border-left: 1px solid var(--border-default);
    background: color-mix(in oklab, var(--text-primary) 3%, transparent);
    overflow: hidden;
  }

  .player__segment--on {
    background: color-mix(in oklab, var(--text-primary) 7%, transparent);
  }

  .player__segment-label {
    position: absolute;
    top: 4px;
    left: 5px;
    right: 4px;
    font-size: var(--caption-size);
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }

  /* A read's waveform fills its block and paints under the block's own focus ring; it
     takes no pointer events, so a click still lands on the button. Its stroke is
     --surface-raised: measured against every tone a block takes, at rest and active, in
     both themes, it is the one surface token that clears 3:1 on all of them (P1-U4;
     --text-secondary gave 1.0–1.2:1 on the dialogue fill, and --surface-base 2.94:1 on a
     transition in light). */
  .player__event :global(.ui-waveform) {
    position: absolute;
    inset: 0;
    min-height: 0;
    color: var(--surface-raised);
  }

  .player__event {
    position: absolute;
    /* Inset from the lane rather than a fixed 44px, which was sized for the old
       84px single row and overflowed every 26px lane into the one below it. */
    top: 3px;
    bottom: 3px;
    padding: 0;
    border: 0;
    border-radius:0;
    cursor: pointer;
    /* A zero- or sub-second beat still has to be findable. This changes how narrow a bar
       may LOOK, never where it starts — position stays exactly proportional. */
    min-width: 1px;
    /* REST LIVES IN THE FILL (P1-U4, P1-Q6 "Change the dimming"). A resting block was
       drawn at opacity 0.55, which faded its waveform with it: no stroke reached 3:1 on a
       resting block in light theme. Now the block and everything in it draw at full
       opacity, and a resting block is its tone mixed toward --text-primary — paler in
       dark, deeper in light, both away from the waveform's stroke. Hover and the active
       block take the tone itself. The tone is set per kind below; the fill is resolved on
       the element, so one mix serves every kind. */
    --event-tone: var(--tone-neutral);
    --event-fill: color-mix(in oklab, var(--event-tone) 60%, var(--text-primary));
    background: var(--event-fill);
  }

  .player__event:hover,
  .player__event--on {
    --event-fill: var(--event-tone);
  }

  .player__event--selected {
    outline: 2px solid var(--border-focus);
    outline-offset: 1px;
  }

  .player__event:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 1px;
  }

  /* Each kind restates `background` so it keeps the specificity it had over the
     unmeasured hatch below: a composition's typed events, every one unmeasured today,
     draw in their kind's colour exactly as before. */
  .player__event[data-kind='action'] { --event-tone: var(--tone-warning); background: var(--event-fill); }
  .player__event[data-kind='dialogue'] { --event-tone: var(--tone-info); background: var(--event-fill); }
  .player__event[data-kind='transition'] { --event-tone: var(--tone-skipped); background: var(--event-fill); }

  .player__event-name { display: block; padding: 0 5px; font-size: var(--caption-size); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .player__read-lane { position: relative; height: 72px; border-bottom: 1px solid var(--border-default); }
  .player__read-label { height: 72px; color: var(--text-primary); }
  .player__read { position: absolute; top: 4px; bottom: 4px; min-width: 1px; overflow: hidden; padding: 0; text-align: left; font: inherit; color: var(--text-primary); background: var(--surface-raised); border: 1px solid var(--border-default); border-radius:0; cursor: pointer; }
  .player__read--on { background: color-mix(in oklab, var(--text-brand) 12%, var(--surface-raised)); }
  .player__read--selected { outline:2px solid var(--border-focus); outline-offset:-2px; }
  .player__read:focus-visible { outline: 2px solid var(--border-focus); outline-offset: -2px; }
  .player__read:hover { background: color-mix(in oklab, var(--text-primary) 8%, var(--surface-raised)); }
  .player__read-name { position: absolute; left: 8px; right: 8px; top: 4px; font-size: var(--caption-size); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .player__read :global(.ui-waveform) { position: absolute; top: 23px; left: 3px; right: 3px; bottom: 3px; min-height: 0; color: var(--text-primary); }
  .player__read-status { position: absolute; left: 8px; top: 30px; font-size: var(--caption-size); color: var(--text-secondary); white-space: nowrap; }
  .player--audio .player__event { --event-tone: var(--text-secondary); --event-fill: color-mix(in oklab, var(--text-primary) 20%, var(--surface-base)); }
  .player--audio .player__event--on { --event-fill: color-mix(in oklab, var(--text-brand) 20%, var(--surface-base)); }


  /* UNMEASURED — `durationMs` is null. The width is fixed because a proportional width
     cannot be drawn from a value that does not exist, and the hatch says so: this is not
     a block, it is a placeholder for one. Ordered AFTER the [data-kind] rules so it wins
     on an event bar; those rules are a kind's colour and this is the absence of a
     measurement, which outranks it. */
  .player__segment--unmeasured,
  .player__event--unmeasured {
    background: repeating-linear-gradient(
      45deg,
      color-mix(in oklab, var(--text-secondary) 20%, transparent),
      color-mix(in oklab, var(--text-secondary) 20%, transparent) 2px,
      transparent 2px,
      transparent 5px
    );
    border-left: 1px dashed var(--border-default);
  }

  /* BELOW RESOLUTION — `durationMs: 0`. A REAL measurement, shorter than
     `wordCount × 60 / 250` can express. Its own rule and not the hatch above, because
     collapsing the two would re-merge in CSS what the projection deliberately holds
     apart: *unknown* and *smaller than I can measure* are different claims. Solid and
     narrow — there is something here — against hatched, which means there might be. */
  .player__segment--below-resolution {
    min-width: 4px;
    border-left: 2px solid var(--border-default);
    background: color-mix(in oklab, var(--text-primary) 10%, transparent);
  }

  .player__transport > button:not(.player__play) { background: transparent; border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-primary); padding: 5px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
  .player__transport > button:not(.player__play):disabled { opacity: .45; cursor: default; }
  .player__transport > button:not(.player__play):focus-visible { outline: 2px solid var(--border-focus); outline-offset: 2px; }
  .player__ruler { touch-action: none; }
  .player__playhead {
    position: absolute;
    top: 0;
    left: 0;
    width: 18px;
    margin-left: -9px;
    height: 100%;
    background: transparent;
    cursor: ew-resize;
    touch-action: none;
    z-index: 3;
    /* transform, not `left`: playback moves this on the compositor rather than reflowing
       the track's ~1,750 blocks sixty times a second. */
    will-change: transform;
  }

  .player__playhead::after { content: ''; position: absolute; inset: 0 auto 0 8px; width: 2px; background: var(--border-focus); }
  .player__playhead::before { content: ''; position: absolute; top: 0; left: 3px; width: 12px; height: 12px; border-radius: 0 0 var(--radius-sm) var(--radius-sm); background: var(--border-focus); }
  .player__playhead:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 1px; }
  /* Takes the remaining height and scrolls: a long action paragraph is the reason this
     panel exists, and clipping it would defeat the point. */
  .player__panel {
    flex: 1 1 auto;
    min-height: 4.5rem;
    overflow-y: auto;
  }

  .player__panel-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
    margin: 0 0 4px;
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }

  .player__kind {
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
  }

  .player__kind[data-kind='action'] { color: var(--tone-warning); }
  .player__kind[data-kind='dialogue'] { color: var(--tone-info); }
  .player__kind[data-kind='transition'] { color: var(--tone-skipped); }

  .player__panel-time {
    font-variant-numeric: tabular-nums;
  }

  .player__panel-text {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--body-md-size);
  }

  .player__panel-text--muted,
  .player__empty {
    color: var(--text-secondary);
  }

  /* The loud channel. Danger, because a composition this build cannot decode is a
     failure and not a quiet absence — the whole point of #124 is that it used to look
     like the latter. */
  .player__unreadable {
    margin: 0;
    font-size: var(--body-md-size);
    color: var(--tone-danger);
  }

  .player__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>

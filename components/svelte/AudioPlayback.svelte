<script>
  // A single audio clip's transport: play/pause, a seekable scrubber, and a
  // current/total readout — what a voice panel needs once it has generated audio
  // it must scrub, rewind, and re-audition in place. Native <audio> works in the Tauri webview and the browser.
  import Icon from './Icon.svelte'
  import Waveform from './Waveform.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [src] Audio source URL — an http(s) URL or a blob/object URL from `URL.createObjectURL`.
   * @property {string} [label] The clip's name, used for the accessible transport names. Defaults to "Audio playback".
   * @property {{version: number, channels: number, sample_rate: number, samples_per_pixel: number, bits: number, length: number, data: number[]} | null} [peaks] The clip's waveform peaks, audiowaveform JSON v2 as khaosd serves them. Given, a Waveform draws behind the scrubber; the scrubber stays the control. Absent, nothing changes.
   * @property {string} [peaksError] khaosd's message for a failed peaks read, **verbatim**. The clip still plays: the transport is untouched, and the message stands where the waveform would be, as a status. No control is added. Blank or whitespace-only means none.
   */

  /** @type {Props} */
  let { src = '', label = 'Audio playback', peaks = null, peaksError = '' } = $props()

  let audio = null
  let playing = $state(false)
  let currentTime = $state(0)
  let duration = $state(0)
  let loading = $state(false)
  let error = $state(false)

  $effect(() => {
    const url = src
    playing = false
    currentTime = 0
    duration = 0
    loading = false
    error = false
    if (!url) return

    const el = new Audio(url)
    el.preload = 'metadata'
    // Every listener is removed before the element is emptied below. Emptying `src`
    // makes the old element fire `error`, and it fires AFTER the next clip's effect has
    // reset the state, so a live listener marked the new clip broken: every clip after
    // the first played nothing (measured in khaos-app's Voice Manager, 2026-09-30).
    const listening = new AbortController()
    const on = (type, handler) => el.addEventListener(type, handler, { signal: listening.signal })
    on('loadedmetadata', () => (duration = el.duration))
    on('durationchange', () => (duration = el.duration))
    on('timeupdate', () => (currentTime = el.currentTime))
    on('play', () => (playing = true))
    on('pause', () => (playing = false))
    on('ended', () => {
      playing = false
      currentTime = 0
    })
    on('waiting', () => (loading = true))
    on('canplay', () => (loading = false))
    on('error', () => {
      error = true
      loading = false
      playing = false
    })
    audio = el

    return () => {
      listening.abort()
      el.pause()
      el.src = ''
      audio = null
    }
  })

  function toggle() {
    if (!audio) return
    if (audio.paused) {
      const p = audio.play()
      if (p) p.catch(() => (error = true))
    } else {
      audio.pause()
    }
  }

  function seek(event) {
    const t = Number(event.currentTarget.value)
    currentTime = t
    if (audio) audio.currentTime = t
  }

  /** @param {number} s Seconds. Returns `m:ss`, or a dash when unknown. */
  function fmt(s) {
    if (!Number.isFinite(s) || s < 0) return '—'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const current = $derived(fmt(currentTime))
  const total = $derived(fmt(duration))
  const disabled = $derived(!src || error)
  // Until the clip reports its duration, the waveform spans the whole of its peaks.
  // A blank message is no message, the same rule TakeList's `error` follows.
  const peaksMessage = $derived(String(peaksError ?? '').trim() ? String(peaksError) : '')
  const peaksSeconds = $derived(peaks ? (peaks.length * peaks.samples_per_pixel) / peaks.sample_rate : 0)
</script>

<div class="ui-audio">
  <button
    class="ui-audio__toggle"
    aria-label={playing ? `Pause ${label}` : `Play ${label}`}
    onclick={toggle}
    disabled={disabled}
  >
    <Icon name={playing ? 'pause' : 'play'} weight="fill" />
  </button>

  {#snippet scrubber()}
    <input
      class="ui-audio__scrubber ui-range"
      type="range"
      min="0"
      max={duration || 0}
      step="0.01"
      value={currentTime}
      oninput={seek}
      aria-label={`Seek ${label}`}
      disabled={disabled || duration === 0}
    />
  {/snippet}

  {#if peaksMessage}
    <!-- A peaks failure is not the clip's: the scrubber stays the control, and the
         waveform's place says what failed. -->
    <div class="ui-audio__track ui-audio__track--failed">
      {@render scrubber()}
      <span class="ui-audio__peaks-error" role="status">{peaksMessage}</span>
    </div>
  {:else if peaks}
    <!-- The waveform is painted first so the range input sits over it and stays the
         one control: same name, same step, same keys. -->
    <div class="ui-audio__track">
      <Waveform {peaks} from={0} to={duration || peaksSeconds} />
      {@render scrubber()}
    </div>
  {:else}
    {@render scrubber()}
  {/if}

  <span class="ui-audio__time" aria-hidden="true">
    {error ? '—' : `${current} / ${total}`}
  </span>
</div>

<style>
  .ui-audio {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  :global(.ui-audio__toggle) {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-default);
    background: var(--surface-raised);
    color: var(--text-primary);
    cursor: pointer;
  }

  :global(.ui-audio__toggle:hover:not(:disabled)) {
    border-color: var(--border-focus);
  }

  :global(.ui-audio__toggle:focus-visible) {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  :global(.ui-audio__toggle:disabled) {
    opacity: 0.5;
    cursor: default;
  }

  :global(.ui-audio__toggle .ph) {
    font-size: var(--body-md-size);
    line-height: 1;
  }

  :global(.ui-audio__scrubber) {
    flex: 1;
    min-width: 0;
    cursor: pointer;
  }

  .ui-audio__track {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    height: 28px;
  }

  .ui-audio__track :global(.ui-waveform) {
    position: absolute;
    inset: 0;
  }

  .ui-audio__track :global(.ui-audio__scrubber) {
    position: relative;
  }

  .ui-audio__track--failed {
    flex-direction: column;
    align-items: stretch;
    height: auto;
  }

  /* In a column, the scrubber's `flex: 1` is a basis of 0 on the vertical axis: it drew
     2px tall in khaos-app's inspector (P1-A6, measured). Its own height, then. */
  .ui-audio__track--failed :global(.ui-audio__scrubber) {
    flex: none;
  }

  .ui-audio__peaks-error {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    overflow-wrap: anywhere;
  }

  :global(.ui-audio__scrubber:disabled) {
    cursor: default;
  }

  .ui-audio__time {
    flex: none;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
</style>

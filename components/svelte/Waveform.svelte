<script>
  // A recording's waveform, drawn from the audiowaveform v2 peaks khaosd serves for it
  // (P1, audio browser plan). Decoration only: it sits inside or behind a control that
  // carries the name, so the canvas is aria-hidden and never focusable, and it replaces
  // no control. Unreadable peaks are said out loud, never drawn as silence.
  import { assertPeaks, peakColumns } from './lib/waveform.js'

  /**
   * @typedef {Object} Props
   * @property {{version: number, channels: number, sample_rate: number, samples_per_pixel: number, bits: number, length: number, data: number[]} | null} [peaks] The recording's peaks, audiowaveform JSON v2 as khaosd serves them. Absent or malformed peaks render "Waveform unreadable".
   * @property {number} [from] Window start, in seconds into the recording. Defaults to 0.
   * @property {number} [to] Window end, in seconds into the recording. Defaults to 0, which draws nothing.
   */

  /** @type {Props} */
  let { peaks = null, from = 0, to = 0 } = $props()

  let canvas = $state(null)

  const readable = $derived.by(() => {
    try {
      assertPeaks(peaks)
      return true
    } catch {
      return false
    }
  })

  function draw() {
    const ctx = canvas?.getContext?.('2d')
    if (!ctx) return
    const ratio = window.devicePixelRatio || 1
    const width = Math.round(canvas.clientWidth * ratio)
    const height = Math.round(canvas.clientHeight * ratio)
    canvas.width = width
    canvas.height = height
    ctx.clearRect(0, 0, width, height)
    if (width === 0 || height === 0 || !(to > from)) return
    // The stroke is the canvas's own computed colour, which its class sets from a
    // semantic token: it follows the theme because it is re-read on every draw.
    ctx.fillStyle = getComputedStyle(canvas).color
    const full = peaks.bits === 8 ? 128 : 32768
    const mid = height / 2
    peakColumns(peaks, from, to, width).forEach((column, x) => {
      if (!column) return
      const top = mid - (column[1] / full) * mid
      const bottom = mid - (column[0] / full) * mid
      ctx.fillRect(x, top, 1, Math.max(1, bottom - top))
    })
  }

  $effect(() => {
    if (!readable || !canvas) return
    // Read the props here so a new window or new peaks redraw.
    void [peaks, from, to]
    draw()
    const resized = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(draw)
    resized?.observe(canvas)
    const themed = new MutationObserver(draw)
    themed.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      resized?.disconnect()
      themed.disconnect()
    }
  })
</script>

{#if readable}
  <canvas class="ui-waveform" aria-hidden="true" bind:this={canvas}></canvas>
{:else}
  <span class="ui-waveform__unreadable" role="status">Waveform unreadable</span>
{/if}

<style>
  .ui-waveform {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 16px;
    color: var(--text-secondary);
    pointer-events: none;
  }

  .ui-waveform__unreadable {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
  }
</style>

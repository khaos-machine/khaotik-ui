<script>
  // The four generation knobs every speech mode shares — temperature, top_k,
  // top_p, repetition_penalty. Controlled: the host owns the values and receives
  // a keyed change event, so a VoiceDesign panel and a Clone panel can mount the
  // same control set without forking it. Ranges are the honest native control:
  // keyboard-accessible, and the value is bounded so no invalid submission exists.
  /**
   * @typedef {Object} Props
   * @property {number} [temperature] Sampling temperature, 0–2. Defaults to 0.9.
   * @property {number} [topK] Top-k sampling, 1–100. Defaults to 50.
   * @property {number} [topP] Top-p (nucleus) sampling, 0–1. Defaults to 1.
   * @property {number} [repetitionPenalty] Repetition penalty, 1–2. Defaults to 1.05.
   * @property {(key: 'temperature' | 'top_k' | 'top_p' | 'repetition_penalty', value: number) => void} [onchange] Called with the changed parameter's key and new value.
   */

  /** @type {Props} */
  let {
    temperature = 0.9,
    topK = 50,
    topP = 1,
    repetitionPenalty = 1.05,
    onchange = undefined,
  } = $props()

  const params = $derived([
    { key: 'temperature', label: 'Temperature', min: 0, max: 2, step: 0.1, value: temperature },
    { key: 'top_k', label: 'Top-K', min: 1, max: 100, step: 1, value: topK },
    { key: 'top_p', label: 'Top-P', min: 0, max: 1, step: 0.01, value: topP },
    { key: 'repetition_penalty', label: 'Repetition penalty', min: 1, max: 2, step: 0.05, value: repetitionPenalty },
  ])
</script>

<div class="ui-speech">
  {#each params as p (p.key)}
    <div class="ui-speech__field">
      <label class="ui-speech__label" for={`ui-speech-${p.key}`}>{p.label}</label>
      <input
        id={`ui-speech-${p.key}`}
        class="ui-speech__slider ui-range"
        type="range"
        min={p.min}
        max={p.max}
        step={p.step}
        value={p.value}
        oninput={(event) => onchange?.(p.key, Number(event.currentTarget.value))}
      />
      <span class="ui-speech__value" aria-hidden="true">{p.value}</span>
    </div>
  {/each}
</div>

<style>
  .ui-speech {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  .ui-speech__field {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  .ui-speech__label {
    flex: none;
    width: 120px;
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    color: var(--text-secondary);
  }

  :global(.ui-speech__slider) {
    flex: 1;
    min-width: 0;
    cursor: pointer;
  }

  :global(.ui-speech__slider:focus-visible) {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-speech__value {
    flex: none;
    min-width: 3ch;
    text-align: right;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }
</style>

<script>
  import { untrack } from 'svelte'
  // A voice-clone form: drop a reference clip, type its transcript and the new
  // line, tune the knobs, generate. The host owns synthesis — this panel collects
  // the spec (ref audio as a data URI, optional transcript) and emits it on
  // Generate, then renders the returned clip through AudioPlayback. Composes
  // SpeechControls; no network or data-file imports.
  import Icon from './Icon.svelte'
  import AudioPlayback from './AudioPlayback.svelte'
  import SpeechControls from './SpeechControls.svelte'
  import LanguagePicker from './LanguagePicker.svelte'
  import SegmentedControl from './SegmentedControl.svelte'

  /**
   * @typedef {Object} GenerateSpec
   * @property {string} text The target text to synthesize.
   * @property {string} refAudio The reference clip as a data URI or URL.
   * @property {string} refText The reference transcript (optional; timbre-only when empty).
   * @property {string} lang The chosen language code, or '' when the host offers none (D88).
   * @property {string} cloneModel The chosen model's id, or '' when the host offers none (D88).
   * @property {number} temperature
   * @property {number} topK
   * @property {number} topP
   * @property {number} repetitionPenalty
   */

  /**
   * @typedef {Object} Result
   * @property {string} src Audio URL of the generated clip.
   * @property {boolean} [generating] True while the host is synthesizing.
   */

  /**
   * @typedef {Object} Props
   * @property {string} [refAudio] Initial reference clip (data URI or URL).
   * @property {string} [refText] Initial reference transcript.
   * @property {string} [text] Initial target text.
   * @property {number} [temperature] 0–2. Defaults to 0.9.
   * @property {number} [topK] 1–100. Defaults to 50.
   * @property {number} [topP] 0–1. Defaults to 1.
   * @property {number} [repetitionPenalty] 1–2. Defaults to 1.05.
   * @property {readonly string[]} [languages] Language codes the engine clones in (D88). Empty hides the picker.
   * @property {readonly {id: string, label: string}[]} [models] The clone models the host can run, best first (D88). Two or more show a choice.
   * @property {Result | null} [result] The generated clip to audition.
   * @property {(spec: GenerateSpec) => void} [ongenerate] Called with the full spec when Generate is pressed.
   */

  /** @type {Props} */
  let {
    refAudio = '',
    refText = '',
    text = '',
    temperature = 0.9,
    topK = 50,
    topP = 1,
    repetitionPenalty = 1.05,
    languages = [],
    models = [],
    result = null,
    ongenerate = undefined,
  } = $props()

  // Drafts, seeded once from the props: edits here are the user's until Generate.
  let _refAudio = $state(untrack(() => refAudio))
  let _refText = $state(untrack(() => refText))
  let _text = $state(untrack(() => text))
  let _temperature = $state(untrack(() => temperature))
  let _topK = $state(untrack(() => topK))
  let _topP = $state(untrack(() => topP))
  let _repetitionPenalty = $state(untrack(() => repetitionPenalty))
  let _lang = $state('')
  let _model = $state('')
  // Either list can arrive after mount: a choice no longer offered falls back to the default.
  const lang = $derived(languages.includes(_lang) ? _lang : languages.includes('auto') ? 'auto' : (languages[0] ?? ''))
  const cloneModel = $derived(models.some((m) => m.id === _model) ? _model : (models[0]?.id ?? ''))

  function onfile(event) {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => (_refAudio = /** @type {string} */ (reader.result))
    reader.readAsDataURL(file)
  }

  function onparam(key, value) {
    if (key === 'temperature') _temperature = value
    else if (key === 'top_k') _topK = value
    else if (key === 'top_p') _topP = value
    else if (key === 'repetition_penalty') _repetitionPenalty = value
  }

  function generate() {
    ongenerate?.({
      text: _text,
      refAudio: _refAudio,
      refText: _refText,
      lang,
      cloneModel,
      temperature: _temperature,
      topK: _topK,
      topP: _topP,
      repetitionPenalty: _repetitionPenalty,
    })
  }
</script>

<div class="ui-voice-clone">
  <label class="ui-voice-clone__field">
    <span class="ui-voice-clone__label">Reference audio</span>
    <input class="ui-voice-clone__file" type="file" accept="audio/*" onchange={onfile} />
  </label>

  <label class="ui-voice-clone__field">
    <span class="ui-voice-clone__label">Reference transcript</span>
    <textarea
      class="ui-voice-clone__textarea"
      bind:value={_refText}
      rows="2"
      placeholder="What the reference clip says…"
    ></textarea>
  </label>

  <label class="ui-voice-clone__field">
    <span class="ui-voice-clone__label">Text</span>
    <textarea
      class="ui-voice-clone__textarea"
      bind:value={_text}
      rows="2"
      placeholder="The line to speak…"
    ></textarea>
  </label>

  <LanguagePicker {languages} value={lang} onselect={(code) => (_lang = code)} />

  {#if models.length > 1}
    <SegmentedControl
      label="Model"
      value={cloneModel}
      items={models.map((m) => ({ value: m.id, label: m.label }))}
      onselect={(id) => (_model = id)} />
  {/if}

  <SpeechControls
    temperature={_temperature}
    topK={_topK}
    topP={_topP}
    repetitionPenalty={_repetitionPenalty}
    onchange={onparam}
  />

  <button
    class="ui-voice-clone__generate"
    type="button"
    onclick={generate}
    disabled={!_text || !_refAudio || (result?.generating ?? false)}
  >
    <Icon name="sparkle" weight="fill" /> {result?.generating ? 'Generating…' : 'Generate'}
  </button>

  {#if result?.src}
    <AudioPlayback src={result.src} label="Generated speech" />
  {/if}
</div>

<style>
  .ui-voice-clone {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  .ui-voice-clone__field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    min-width: 0;
  }

  .ui-voice-clone__label {
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    color: var(--text-secondary);
  }

  .ui-voice-clone__file {
    font: inherit;
    font-size: var(--data-md-size);
    color: var(--text-secondary);
  }

  .ui-voice-clone__textarea {
    background: var(--surface-base);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: 3px var(--spacing-xs);
    font: inherit;
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    color: var(--text-primary);
    resize: vertical;
    min-height: 40px;
  }

  .ui-voice-clone__textarea:focus {
    outline: 2px solid var(--border-focus);
    outline-offset: 0;
  }

  .ui-voice-clone__textarea::placeholder {
    color: var(--text-secondary);
  }

  .ui-voice-clone__generate {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: 4px 10px;
    border: 1px solid var(--action-primary-border);
    border-radius: var(--radius-sm);
    background: var(--action-primary);
    font: inherit;
    font-size: var(--data-md-size);
    font-weight: 600;
    color: var(--action-on-primary);
    cursor: pointer;
  }

  .ui-voice-clone__generate:hover:not(:disabled) {
    background: var(--action-primary-pressed);
  }

  .ui-voice-clone__generate:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-voice-clone__generate:disabled {
    background: var(--action-disabled);
    color: var(--action-on-disabled);
    cursor: default;
  }
</style>

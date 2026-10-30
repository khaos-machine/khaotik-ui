<script>
  import { untrack } from 'svelte'
  // A voice-design form: describe the voice, type the line, tune the four knobs,
  // generate. The host owns the actual synthesis — this panel collects the spec
  // and emits it on Generate, then renders the returned clip through
  // AudioPlayback. Composes SpeechControls; no network or data-file imports.
  import Icon from './Icon.svelte'
  import AudioPlayback from './AudioPlayback.svelte'
  import SpeechControls from './SpeechControls.svelte'
  import LanguagePicker from './LanguagePicker.svelte'

  /**
   * @typedef {Object} GenerateSpec
   * @property {string} text The target text to synthesize.
   * @property {string} instruct The natural-language voice description.
   * @property {string} direction How to say this line, apart from who is saying it (D88). '' for none.
   * @property {string} lang The chosen language code, or '' when the host offers none (D88).
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
   * @property {string} [text] Initial target text.
   * @property {string} [instruct] Initial voice description.
   * @property {number} [temperature] 0–2. Defaults to 0.9.
   * @property {number} [topK] 1–100. Defaults to 50.
   * @property {number} [topP] 0–1. Defaults to 1.
   * @property {number} [repetitionPenalty] 1–2. Defaults to 1.05.
   * @property {readonly string[]} [languages] Language codes the engine designs in (D88). Empty hides the picker.
   * @property {Result | null} [result] The generated clip to audition.
   * @property {(spec: GenerateSpec) => void} [ongenerate] Called with the full spec when Generate is pressed.
   * @property {boolean} [readonlyDescription] The description is `instruct` and cannot be edited, so the line is where the work starts: the Text field takes focus on open (D90).
   */

  /** @type {Props} */
  let {
    text = '',
    instruct = '',
    temperature = 0.9,
    topK = 50,
    topP = 1,
    repetitionPenalty = 1.05,
    languages = [],
    result = null,
    ongenerate = undefined,
    readonlyDescription = false,
  } = $props()

  // Drafts, seeded once from the props: edits here are the user's until Generate.
  let _text = $state(untrack(() => text))
  let _instruct = $state(untrack(() => instruct))
  // A fixed description follows the host, which may read it after mount.
  const description = $derived(readonlyDescription ? instruct : _instruct)
  let _temperature = $state(untrack(() => temperature))
  let _topK = $state(untrack(() => topK))
  let _topP = $state(untrack(() => topP))
  let _repetitionPenalty = $state(untrack(() => repetitionPenalty))
  let _direction = $state('')
  let _lang = $state('')
  // The list can arrive after mount: a choice no longer offered falls back to detecting.
  const lang = $derived(languages.includes(_lang) ? _lang : languages.includes('auto') ? 'auto' : (languages[0] ?? ''))

  function onparam(key, value) {
    if (key === 'temperature') _temperature = value
    else if (key === 'top_k') _topK = value
    else if (key === 'top_p') _topP = value
    else if (key === 'repetition_penalty') _repetitionPenalty = value
  }

  function generate() {
    ongenerate?.({
      text: _text,
      instruct: description,
      direction: _direction.trim(),
      lang,
      temperature: _temperature,
      topK: _topK,
      topP: _topP,
      repetitionPenalty: _repetitionPenalty,
    })
  }
</script>

<div class="ui-voice-design">
  <label class="ui-voice-design__field">
    <span class="ui-voice-design__label">Voice description</span>
    {#if readonlyDescription}
      <textarea class="ui-voice-design__textarea" value={description} rows="2" readonly></textarea>
    {:else}
      <textarea
        class="ui-voice-design__textarea"
        bind:value={_instruct}
        rows="2"
        placeholder="A warm, grounded voice with a quiet confidence…"
      ></textarea>
    {/if}
  </label>

  <label class="ui-voice-design__field">
    <span class="ui-voice-design__label">Direction</span>
    <textarea
      class="ui-voice-design__textarea"
      bind:value={_direction}
      rows="1"
      placeholder="How to say this line: whispered, out of breath…"
    ></textarea>
  </label>

  <label class="ui-voice-design__field">
    <span class="ui-voice-design__label">Text</span>
    <!-- Lock mode (#268): the description is fixed, so the only thing to write is the line;
         focus goes there. Off lock mode nothing is focused on open. -->
    <!-- svelte-ignore a11y_autofocus -->
    <textarea
      class="ui-voice-design__textarea"
      bind:value={_text}
      rows="2"
      autofocus={readonlyDescription}
      placeholder="The line to speak…"
    ></textarea>
  </label>

  <LanguagePicker {languages} value={lang} onselect={(code) => (_lang = code)} />

  <SpeechControls
    temperature={_temperature}
    topK={_topK}
    topP={_topP}
    repetitionPenalty={_repetitionPenalty}
    onchange={onparam}
  />

  <button
    class="ui-voice-design__generate"
    type="button"
    onclick={generate}
    disabled={!_text || (result?.generating ?? false)}
  >
    <Icon name="sparkle" weight="fill" /> {result?.generating ? 'Generating…' : 'Generate'}
  </button>

  {#if result?.src}
    <AudioPlayback src={result.src} label="Generated speech" />
  {/if}
</div>

<style>
  .ui-voice-design {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  .ui-voice-design__field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    min-width: 0;
  }

  .ui-voice-design__label {
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    color: var(--text-secondary);
  }

  .ui-voice-design__textarea {
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

  .ui-voice-design__textarea:focus {
    outline: 2px solid var(--border-focus);
    outline-offset: 0;
  }

  /* The voice's own description, shown and not edited (D90). */
  .ui-voice-design__textarea[readonly] {
    background: var(--surface-raised);
    border-color: var(--border-hairline);
    resize: none;
  }

  .ui-voice-design__textarea::placeholder {
    color: var(--text-secondary);
  }

  .ui-voice-design__generate {
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

  .ui-voice-design__generate:hover:not(:disabled) {
    background: var(--action-primary-pressed);
  }

  .ui-voice-design__generate:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-voice-design__generate:disabled {
    background: var(--action-disabled);
    color: var(--action-on-disabled);
    cursor: default;
  }
</style>

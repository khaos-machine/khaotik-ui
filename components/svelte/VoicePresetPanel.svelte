<script>
  // A preset voice with a style direction (D86): pick one of the engine's speakers, say how
  // it should sound, type the line, tune, generate. The reference ComfyUI-Qwen-TTS "Custom
  // Voice" node's shape: `speaker` plus `instruct`. The host owns synthesis and the speaker
  // list; with no speakers it says why, and Generate stays disabled. Composes SpeakerPicker
  // and SpeechControls; no network or data-file imports.
  import Icon from './Icon.svelte'
  import SpeakerPicker from './SpeakerPicker.svelte'
  import SpeechControls from './SpeechControls.svelte'
  import LanguagePicker from './LanguagePicker.svelte'

  /**
   * @typedef {Object} Speaker
   * @property {string} id The speaker id the engine takes.
   * @property {string} name The display name.
   */

  /**
   * @typedef {Object} GenerateSpec
   * @property {string} speaker The chosen speaker's id.
   * @property {string} instruct The style direction, or '' for none.
   * @property {string} text The line to speak.
   * @property {string} lang The chosen language code, or '' when the host offers none (D88).
   * @property {number} temperature
   * @property {number} topK
   * @property {number} topP
   * @property {number} repetitionPenalty
   */

  /**
   * @typedef {Object} Result
   * @property {string} src Audio URL of the generated clip. Empty hides the player.
   * @property {boolean} [generating] True while the host is synthesizing.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly Speaker[]} [speakers] The engine's preset speakers.
   * @property {string} [speakersReason] Why there are no speakers to choose from, in the host's words. Shown in place of the picker.
   * @property {readonly string[]} [languages] Language codes the preset speakers speak (D88). Empty hides the picker.
   * @property {Result | null} [result] The generating flag; a workbench host passes an empty `src`.
   * @property {(spec: GenerateSpec) => void} [ongenerate] Called with the full spec when Generate is pressed.
   */

  /** @type {Props} */
  let { speakers = [], speakersReason = '', languages = [], result = null, ongenerate = undefined } = $props()

  let speaker = $state('')
  let instruct = $state('')
  let text = $state('')
  let temperature = $state(0.9)
  let topK = $state(50)
  let topP = $state(1)
  let repetitionPenalty = $state(1.05)
  let _lang = $state('')
  const lang = $derived(languages.includes(_lang) ? _lang : languages.includes('auto') ? 'auto' : (languages[0] ?? ''))

  const reason = $derived(String(speakersReason ?? '').trim())
  const canGenerate = $derived(
    Boolean(ongenerate) && speakers.some((s) => s.id === speaker) && text.trim() !== '' && !(result?.generating ?? false),
  )

  function onparam(key, value) {
    if (key === 'temperature') temperature = value
    else if (key === 'top_k') topK = value
    else if (key === 'top_p') topP = value
    else if (key === 'repetition_penalty') repetitionPenalty = value
  }

  function generate() {
    if (!canGenerate) return
    ongenerate?.({ speaker, instruct: instruct.trim(), text, lang, temperature, topK, topP, repetitionPenalty })
  }
</script>

<div class="ui-voice-preset">
  <div class="ui-voice-preset__field">
    <span class="ui-voice-preset__label">Speaker</span>
    {#if speakers.length > 0}
      <SpeakerPicker {speakers} selected={speaker} onselect={(id) => (speaker = id)} label="Speaker" />
    {:else}
      <p class="ui-voice-preset__reason" role="status">{reason || 'No speakers to choose from.'}</p>
    {/if}
  </div>

  <label class="ui-voice-preset__field">
    <span class="ui-voice-preset__label">Style direction</span>
    <textarea
      class="ui-voice-preset__textarea"
      bind:value={instruct}
      rows="2"
      placeholder="Warm and unhurried, as if telling a secret"></textarea>
  </label>

  <label class="ui-voice-preset__field">
    <span class="ui-voice-preset__label">Text</span>
    <textarea class="ui-voice-preset__textarea" bind:value={text} rows="2" placeholder="The line to speak…"></textarea>
  </label>

  <LanguagePicker {languages} value={lang} onselect={(code) => (_lang = code)} />

  <SpeechControls {temperature} {topK} {topP} {repetitionPenalty} onchange={onparam} />

  <button class="ui-voice-preset__generate" type="button" onclick={generate} disabled={!canGenerate}>
    <Icon name="sparkle" weight="fill" /> {result?.generating ? 'Generating…' : 'Generate'}
  </button>
</div>

<style>
  .ui-voice-preset {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  .ui-voice-preset__field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    min-width: 0;
  }

  .ui-voice-preset__label {
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    color: var(--text-secondary);
  }

  .ui-voice-preset__reason {
    margin: 0;
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    color: var(--text-secondary);
  }

  .ui-voice-preset__textarea {
    background: var(--surface-base);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: 3px var(--spacing-xs);
    font: inherit;
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    color: var(--text-primary);
    caret-color: var(--action-primary);
    resize: vertical;
    min-height: 40px;
  }

  .ui-voice-preset__textarea::placeholder {
    color: var(--text-secondary);
  }

  .ui-voice-preset__textarea:focus {
    outline: 2px solid var(--border-focus);
    outline-offset: 0;
  }

  .ui-voice-preset__generate {
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

  .ui-voice-preset__generate:hover:not(:disabled) {
    background: var(--action-primary-pressed);
  }

  .ui-voice-preset__generate:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-voice-preset__generate:disabled {
    background: var(--action-disabled);
    border-color: transparent;
    color: var(--action-on-disabled);
    cursor: default;
  }
</style>

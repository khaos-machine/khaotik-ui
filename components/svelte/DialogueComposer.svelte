<script>
  import { untrack } from 'svelte'
  // A multi-role dialogue form: write the scene as "Name: line" pairs, set the
  // pause between lines, generate. The host owns synthesis and role→voice
  // resolution — this panel collects the script and pause, emits them on
  // Generate, then renders the merged clip through AudioPlayback. Composes
  // AudioPlayback; no network or data-file imports.
  import Icon from './Icon.svelte'
  import AudioPlayback from './AudioPlayback.svelte'

  /**
   * @typedef {Object} GenerateSpec
   * @property {string} script The dialogue as `Name: line` pairs, one per line.
   * @property {number} pauseSeconds Silence between lines, in seconds.
   */

  /**
   * @typedef {Object} Result
   * @property {string} src Audio URL of the merged clip.
   * @property {boolean} [generating] True while the host is synthesizing.
   */

  /**
   * @typedef {Object} Props
   * @property {string} [script] Initial `Name: line` script.
   * @property {number} [pauseSeconds] Initial pause, 0–3 seconds. Defaults to 0.
   * @property {Result | null} [result] The merged clip to audition.
   * @property {(spec: GenerateSpec) => void} [ongenerate] Called with the script and pause when Generate is pressed.
   */

  /** @type {Props} */
  let {
    script = '',
    pauseSeconds = 0,
    result = null,
    ongenerate = undefined,
  } = $props()

  // Drafts, seeded once from the props: edits here are the user's until Generate.
  let _script = $state(untrack(() => script))
  let _pauseSeconds = $state(untrack(() => pauseSeconds))

  function generate() {
    ongenerate?.({ script: _script, pauseSeconds: _pauseSeconds })
  }
</script>

<div class="ui-dialogue">
  <label class="ui-dialogue__field">
    <span class="ui-dialogue__label">Script</span>
    <textarea
      class="ui-dialogue__textarea"
      bind:value={_script}
      rows="6"
      placeholder={'Desmond: I can\u2019t keep doing this.\nJetta: Then stop.'}
    ></textarea>
  </label>

  <label class="ui-dialogue__field">
    <span class="ui-dialogue__label">Pause between lines</span>
    <div class="ui-dialogue__pause">
      <input
        class="ui-dialogue__slider ui-range"
        type="range"
        min="0"
        max="3"
        step="0.1"
        value={_pauseSeconds}
        oninput={(event) => (_pauseSeconds = Number(event.currentTarget.value))}
      />
      <span class="ui-dialogue__value" aria-hidden="true">{_pauseSeconds.toFixed(1)}s</span>
    </div>
  </label>

  <button
    class="ui-dialogue__generate"
    type="button"
    onclick={generate}
    disabled={!_script.trim() || (result?.generating ?? false)}
  >
    <Icon name="sparkle" weight="fill" /> {result?.generating ? 'Generating…' : 'Generate'}
  </button>

  {#if result?.src}
    <AudioPlayback src={result.src} label="Dialogue" />
  {/if}
</div>

<style>
  .ui-dialogue {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  .ui-dialogue__field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    min-width: 0;
  }

  .ui-dialogue__label {
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    color: var(--text-secondary);
  }

  .ui-dialogue__textarea {
    background: var(--surface-base);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: 3px var(--spacing-xs);
    font: inherit;
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    color: var(--text-primary);
    resize: vertical;
    min-height: 72px;
  }

  .ui-dialogue__textarea:focus {
    outline: 2px solid var(--border-focus);
    outline-offset: 0;
  }

  .ui-dialogue__textarea::placeholder {
    color: var(--text-secondary);
  }

  .ui-dialogue__pause {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  .ui-dialogue__slider {
    flex: 1;
    min-width: 0;
    cursor: pointer;
  }

  .ui-dialogue__slider:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-dialogue__value {
    flex: none;
    min-width: 3ch;
    text-align: right;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }

  .ui-dialogue__generate {
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

  .ui-dialogue__generate:hover:not(:disabled) {
    background: var(--action-primary-pressed);
  }

  .ui-dialogue__generate:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-dialogue__generate:disabled {
    background: var(--action-disabled);
    color: var(--action-on-disabled);
    cursor: default;
  }
</style>

<script>
  // The language a line is spoken in (D88). A native select of the codes the host
  // passes, each named in words (Intl.DisplayNames) so "de" reads "German". `auto` is
  // the engine's "detect it from the text". Controlled: the host owns the value.
  // Renders nothing for an empty list, so a host that has no languages shows no picker.

  /**
   * @typedef {Object} Props
   * @property {readonly string[]} [languages] Language codes to offer, in order (`auto`, `en`, `de`, …).
   * @property {string} [value] The chosen code.
   * @property {(code: string) => void} [onselect] Called with the chosen code.
   * @property {string} [label] The visible label. Defaults to "Language".
   */

  /** @type {Props} */
  let { languages = [], value = '', onselect = undefined, label = 'Language' } = $props()

  const names = new Intl.DisplayNames(['en'], { type: 'language' })

  function nameOf(code) {
    if (code === 'auto') return 'Detect from the text'
    try {
      return names.of(code) ?? code
    } catch {
      return code
    }
  }
</script>

{#if languages.length > 0}
  <label class="ui-language-picker">
    <span class="ui-language-picker__label">{label}</span>
    <select class="ui-language-picker__select" {value} onchange={(event) => onselect?.(event.currentTarget.value)}>
      {#each languages as code (code)}
        <option value={code}>{nameOf(code)}</option>
      {/each}
    </select>
  </label>
{/if}

<style>
  .ui-language-picker {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    min-width: 0;
  }

  .ui-language-picker__label {
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-secondary);
  }

  .ui-language-picker__select {
    align-self: flex-start;
    background: var(--surface-base);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: 4px var(--spacing-sm);
    font: inherit;
    font-size: var(--body-md-size);
    color: var(--text-primary);
  }

  .ui-language-picker__select:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 0;
  }
</style>

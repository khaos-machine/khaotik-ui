<script>
  // TokenField — a list of short values as tokens, with an inline add (data-layer plan
  // K8; audit §1.5, §4.1). Built for a character's aliases.
  //
  // The host is the source of truth (khaos-app directive 4: the engine is). Enter ASKS to
  // add through `onadd` and clears the input; the token appears only when the host passes
  // it back in `tokens`. A token is a button: a click, Backspace or Delete asks to remove
  // it. Backspace in an empty input moves to the last token, as a native token field does.
  /**
   * @typedef {Object} Props
   * @property {readonly string[]} [tokens] The current tokens, as the host holds them.
   * @property {string} [label] What the tokens are ("Aliases"); names the group and the add field.
   * @property {string} [placeholder] The add field's placeholder.
   * @property {(token: string) => void} [onadd] Asked with a trimmed, new, non-empty token.
   * @property {(token: string) => void} [onremove] Asked with a token to remove.
   * @property {boolean} [readonly] Tokens only: no add field and no remove.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let {
    tokens = [],
    label = 'Tokens',
    placeholder = 'Add…',
    onadd = undefined,
    onremove = undefined,
    readonly = false,
    uiId = 'tokens',
  } = $props()

  let draft = $state('')
  /** @type {HTMLButtonElement[]} */
  const buttons = []

  /** @param {KeyboardEvent} e */
  function inputKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const token = draft.trim()
      if (!token || tokens.includes(token)) return
      onadd?.(token)
      draft = ''
    } else if (e.key === 'Backspace' && draft === '' && tokens.length) {
      e.preventDefault()
      buttons[tokens.length - 1]?.focus()
    }
  }

  /** @param {KeyboardEvent} e @param {string} token */
  function tokenKey(e, token) {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      onremove?.(token)
    }
  }
</script>

<div class="tokens" role="group" aria-label={label} data-ui-id={uiId}>
  {#each tokens as token, i (token)}
    {#if readonly}
      <span class="tokens__token">{token}</span>
    {:else}
      <button
        bind:this={buttons[i]}
        type="button"
        class="tokens__token"
        aria-label="{token}, remove"
        data-ui-id="{uiId}.token.{token}"
        onclick={() => onremove?.(token)}
        onkeydown={(e) => tokenKey(e, token)}>
        <span>{token}</span><span class="tokens__x" aria-hidden="true">×</span>
      </button>
    {/if}
  {/each}
  {#if !readonly}
    <input
      class="tokens__input"
      type="text"
      aria-label="Add to {label.toLowerCase()}"
      {placeholder}
      bind:value={draft}
      data-ui-id="{uiId}.add"
      onkeydown={inputKey} />
  {/if}
</div>

<style>
  .tokens {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-2xs);
    min-height: 24px;
    font-size: var(--data-md-size);
  }
  .tokens__token {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: 0 var(--spacing-xs);
    height: 20px;
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: var(--text-primary);
    font: inherit;
    cursor: default;
  }
  .tokens__token:focus-visible,
  .tokens__input:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
  }
  .tokens__x {
    color: var(--text-secondary);
  }
  .tokens__input {
    flex: 1;
    min-width: 80px;
    border: 0;
    background: none;
    color: var(--text-primary);
    font: inherit;
  }
</style>

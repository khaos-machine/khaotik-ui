<script>
  // ScreenplayText — a scene's text, formatted as a screenplay, each element a selectable
  // line (data-layer plan K9; audit §1.6, §4.1).
  //
  // A listbox: each element is an option holding exactly its own text, so what a reader
  // copies is what was written; the screenplay layout (indents, capitals already in the
  // text) is CSS. The host owns the selection: a click or ↑ ↓ Home End ASKS with the
  // element's id. Copy with no text selected copies the selected line as written.
  /**
   * @typedef {Object} ScreenplayElement
   * @property {string} id The element's id, as the engine serves it.
   * @property {'slugline' | 'action' | 'character' | 'parenthetical' | 'dialogue' | 'transition' | string} kind
   * @property {string} text The element's text, as written.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly ScreenplayElement[]} [elements] The scene's elements, in order.
   * @property {string} [selected] The selected element's id.
   * @property {(id: string) => void} [onselect] Asked with an element's id.
   * @property {string} [label] The listbox's accessible name.
   * @property {string} [empty] What an empty scene says.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let { elements = [], selected = '', onselect = undefined, label = 'Screenplay', empty = 'No text.', uiId = 'screenplay' } = $props()

  /** @type {HTMLElement[]} */
  const lines = []
  const at = $derived(elements.findIndex((e) => e.id === selected))

  /** @param {number} i */
  function ask(i) {
    const el = elements[i]
    if (!el) return
    if (el.id !== selected) onselect?.(el.id)
    lines[i]?.focus()
  }

  /** @param {KeyboardEvent} e */
  function key(e) {
    const to =
      e.key === 'ArrowDown' ? Math.min(elements.length - 1, at + 1)
      : e.key === 'ArrowUp' ? Math.max(0, at - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? elements.length - 1
      : null
    if (to === null) return
    e.preventDefault()
    ask(to)
  }

  /** @param {ClipboardEvent} e */
  function copy(e) {
    if (String(globalThis.getSelection?.() ?? '') !== '') return
    const el = elements[at]
    if (!el || !e.clipboardData) return
    e.preventDefault()
    e.clipboardData.setData('text/plain', el.text)
  }
</script>

{#if elements.length === 0}
  <p class="script__empty">{empty}</p>
{:else}
  <div class="script" role="listbox" aria-label={label} tabindex="-1" data-ui-id={uiId} onkeydown={key} oncopy={copy}>
    {#each elements as el, i (el.id)}
      <!-- svelte-ignore a11y_click_events_have_key_events -- the listbox handles the keys for every option -->
      <div
        bind:this={lines[i]}
        class="script__line"
        role="option"
        data-kind={el.kind}
        aria-selected={el.id === selected}
        tabindex={i === (at < 0 ? 0 : at) ? 0 : -1}
        data-ui-id="{uiId}.line.{el.id}"
        onclick={() => ask(i)}>{el.text}</div>
    {/each}
  </div>
{/if}

<style>
  .script {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-sm) 0;
    font-family: var(--font-mono);
    font-size: var(--data-md-size);
    line-height: 1.5;
    color: var(--text-primary);
    user-select: text;
    outline: none;
  }
  .script__line {
    padding: 0 var(--spacing-sm);
    white-space: pre-wrap;
    border-left: var(--size-stroke-focus) solid transparent;
    outline: none;
  }
  .script__line[aria-selected='true'] {
    background: var(--surface-raised);
  }
  .script__line:focus-visible {
    border-left-color: var(--border-focus);
  }
  .script__line[data-kind='slugline'] {
    font-weight: 600;
    margin-top: var(--spacing-xs);
  }
  .script__line[data-kind='action'] {
    margin: var(--spacing-xs) 0;
  }
  .script__line[data-kind='character'] {
    padding-left: 40%;
    margin-top: var(--spacing-xs);
  }
  .script__line[data-kind='parenthetical'] {
    padding-left: 32%;
  }
  .script__line[data-kind='dialogue'] {
    padding-left: 20%;
    padding-right: 20%;
  }
  .script__line[data-kind='transition'] {
    text-align: end;
    margin: var(--spacing-xs) 0;
  }
  .script__empty {
    margin: 0;
    padding: var(--spacing-sm);
    color: var(--text-secondary);
  }
</style>

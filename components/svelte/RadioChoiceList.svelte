<script>
  // RadioChoiceList — one choice among a few, where each option's caption is part of what is
  // being chosen (khaos-app design 2026-10-12, onboarding step 1). Adopted on Ark UI's Radio
  // Group: the radiogroup role, the native radios and their labels come from the primitive.
  // SelectableRow is not this: it marks its choice with `aria-current` and hides its subtitle.
  //
  // Controlled, like Checkbox: a click or an arrow key asks `onchange` for the new value and
  // changes nothing itself, so the host's state is the only truth. Arrow keys are handled here
  // rather than left to the browser, because a native radio checks itself as focus moves,
  // which is a change the host never agreed to.
  import {
    RadioGroupItem,
    RadioGroupItemControl,
    RadioGroupItemHiddenInput,
    RadioGroupItemText,
    RadioGroupRootProvider,
    useRadioGroup,
  } from '@ark-ui/svelte/radio-group'

  /**
   * @typedef {Object} RadioChoice
   * @property {string} value Reported to `onchange`, and matched against `value`. **Values must be distinct.**
   * @property {string} title The option's name.
   * @property {string} caption One line under the title; the option's accessible description.
   */

  /**
   * @typedef {Object} Props
   * @property {string} [value] Controlled; the selected option's `value`.
   * @property {readonly RadioChoice[]} [options] The options, in order.
   * @property {string} [label] Names the choice; the group's accessible name.
   * @property {string} [note] One line under the group, such as why an option is suggested.
   * @property {boolean} [disabled] Dimmed, and asks nothing.
   * @property {(value: string) => void} [onchange] Asked with the newly chosen value.
   * @property {string} [uiId] The `data-ui-id` (audit §3.14).
   */

  /** @type {Props} */
  let { value = '', options = [], label = '', note = undefined, disabled = false, onchange = undefined, uiId = undefined } = $props()

  const uid = $props.id()
  // The machine is built here, not by RadioGroupRoot: Root writes a chosen value back into
  // its own copy of `value`, which would draw a choice the host has not accepted.
  const group = useRadioGroup(() => ({
    id: uid,
    value,
    disabled,
    orientation: 'vertical',
    onValueChange: (details) => ask(details.value),
  }))
  /** @type {HTMLElement | undefined} */
  let root = $state()

  const inputs = () => /** @type {HTMLInputElement[]} */ ([...(root?.querySelectorAll('input[type="radio"]') ?? [])])

  /** Puts every native radio back to the host's value: a click checked one by itself. */
  function redraw() {
    for (const input of inputs()) input.checked = input.value === value
  }

  /** @param {string | null} next */
  function ask(next) {
    redraw()
    if (!disabled && next != null && next !== value) onchange?.(next)
  }

  /** @param {KeyboardEvent} event */
  function onkeydown(event) {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
    if (!step || options.length === 0) return
    event.preventDefault()
    if (disabled) return
    const all = inputs()
    const from = all.indexOf(/** @type {HTMLInputElement} */ (event.target))
    const to = (Math.max(from, 0) + step + all.length) % all.length
    all[to]?.focus()
    ask(options[to].value)
  }
</script>

<div class="radio-choice-list" data-ui-id={uiId} bind:this={root}>
  <!-- Classes on an Ark component are forwarded to the rendered element, so Svelte scopes
       them as unused — they are styled :global below (catalog/AGENTS.md, "Svelte 5 gotchas"). -->
  <RadioGroupRootProvider value={group} aria-label={label} {onkeydown} class="ui-radio-choice">
    {#each options as option (option.value)}
      <RadioGroupItem value={option.value} class="ui-radio-choice__item">
        <RadioGroupItemControl class="ui-radio-choice__control" />
        <span class="ui-radio-choice__body">
          <RadioGroupItemText class="ui-radio-choice__title">{option.title}</RadioGroupItemText>
          <span id="{uid}-{option.value}-caption" class="ui-radio-choice__caption">{option.caption}</span>
        </span>
        <RadioGroupItemHiddenInput aria-describedby="{uid}-{option.value}-caption" />
      </RadioGroupItem>
    {/each}
  </RadioGroupRootProvider>
  {#if note}
    <p class="radio-choice-list__note">{note}</p>
  {/if}
</div>

<style>
  .radio-choice-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  :global(.ui-radio-choice) {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  :global(.ui-radio-choice__item) {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) 0;
    cursor: pointer;
  }

  :global(.ui-radio-choice__item[data-disabled]) {
    opacity: 0.4;
    cursor: default;
  }

  :global(.ui-radio-choice__control) {
    flex: none;
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    margin-top: 2px;
    border: 1px solid var(--border-default);
    border-radius: 50%;
  }

  :global(.ui-radio-choice__control[data-state='checked']) {
    border: 4px solid var(--action-primary);
  }

  :global(.ui-radio-choice__control[data-focus-visible]) {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  :global(.ui-radio-choice__body) {
    display: flex;
    flex-direction: column;
  }

  :global(.ui-radio-choice__title) {
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    color: var(--text-primary);
  }

  :global(.ui-radio-choice__caption),
  .radio-choice-list__note {
    font-size: var(--label-md-size);
    line-height: var(--label-md-line);
    color: var(--text-secondary);
  }

  .radio-choice-list__note {
    margin: 0;
  }
</style>

<script>
  // A selected or followed line, wherever it is. A dialogue line is the host's dialogue
  // inspector, passed in as the `dialogue` snippet; anything else is the event view here. A
  // line the composition does not hold says so; the pane is never empty.
  import Button from './Button.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import TakeList from './TakeList.svelte'

  /**
   * @typedef {Object} LineEvent
   * @property {string} elementType The screenplay element: `action`, `dialogue`, `transition`, …
   * @property {string} [text] The event's text. khaosd omits it for an event with none.
   * @property {string} [characterName] The speaker's name, for a line.
   * @property {string} [characterId] The speaker's id, for a line.
   * @property {string} [parenthetical] The line's direction.
   */

  /**
   * @typedef {Object} Props
   * @property {LineEvent | null} [event] The event, or null when the composition does not hold it.
   * @property {import('svelte').Snippet} [dialogue] The host's dialogue inspector, rendered in place of the event view for a dialogue line.
   * @property {string} [backLabel] What Back says: where it returns to.
   * @property {() => void} [onclear] Reports Back, or Esc outside a dialogue line.
   * @property {(characterId: string) => void} [onRevealCharacter] Reports the speaker to show.
   */

  /** @type {Props} */
  let { event = null, dialogue = undefined, backLabel = 'Back', onclear = undefined, onRevealCharacter = undefined } = $props()

  /** Esc goes back, unless a dialog, menu or list box has the key. The dialogue inspector handles its own. */
  function escape(keyEvent) {
    if (dialogue || keyEvent.key !== 'Escape' || keyEvent.defaultPrevented) return
    const target = keyEvent.target instanceof Element ? keyEvent.target : null
    if (target?.closest('[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]')) return
    onclear?.()
  }
</script>

<svelte:window onkeydown={escape} />

{#if !event}
  <p class="line-inspector__status" role="status">This line is not in the composition khaosd served, so it cannot be shown here.</p>
{:else if dialogue}
  {@render dialogue()}
{:else}
  <InspectorSection title={event.elementType} uiId="story.inspector.line">
    {#if event.characterName}
      <PropertyRow label="Speaker">
        <Button variant="secondary" onclick={() => event.characterId && onRevealCharacter?.(event.characterId)}>{event.characterName}</Button>
      </PropertyRow>
    {/if}
    {#if event.parenthetical}<PropertyRow label="Direction" value={event.parenthetical} />{/if}
    <p class="line-inspector__text">{event.text ?? ''}</p>
    {#if event.elementType === 'action'}
      <!-- An action line is read in the narrator's voice, and only the engine may say so
           (khaos-manager#499). -->
      <TakeList
        takes={[]}
        generateLabel="Hear in the narrator's voice"
        disabledReason="khaosd cannot voice a single action line yet; a table read of the scene does. Requested." />
    {/if}
  </InspectorSection>
{/if}
<div class="line-inspector__actions"><Button variant="secondary" onclick={() => onclear?.()}>{backLabel}</Button></div>

<style>
  .line-inspector__status {
    margin: var(--spacing-sm);
    color: var(--text-secondary);
    font-size: var(--body-md-size);
  }
  .line-inspector__text {
    margin: var(--spacing-xs) 0;
    font-size: var(--data-md-size);
  }
  .line-inspector__actions {
    padding: var(--spacing-xs) 0;
  }
</style>

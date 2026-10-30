<script>
  // A character's mentions (khaos-manager#700), rendered beside its aliases: one row per
  // wording its bound references name it by, with its count and scene count, as khaosd's
  // `/api/v1/dashboard/character-mentions` groups them. Choosing a row is reported; choosing
  // the selected one again reports null. Read-only: a mention is bound in Review. Moved from
  // Khaos App (catalog app-coverage plan, T2).
  import InspectorSection from './InspectorSection.svelte'
  import SelectableRow from './SelectableRow.svelte'

  /** @typedef {import('./lib/types.js').MentionsRead} MentionsRead */

  /**
   * @typedef {Object} Props
   * @property {MentionsRead} [read] Where the read is. Loading until the host says otherwise.
   * @property {string} [characterName] Whose mentions, for the list's label and its empty line.
   * @property {string | null} [selected] The chosen wording, or null.
   * @property {(wording: string | null) => void} [onselect] Reports a chosen wording; null when the chosen one is chosen again.
   */

  /** @type {Props} */
  let { read = { kind: 'loading' }, characterName = '', selected = null, onselect = undefined } = $props()

  const rows = $derived(read.kind === 'loaded' ? read.mentions : [])
  /** @param {number} n @param {string} one @param {string} many */
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`
</script>

<InspectorSection title="Mentions" count={rows.length} uiId="story.inspector.mentions">
  {#if read.kind === 'failed'}
    <p class="ui-character-mentions__note">The mentions could not be read: {read.message}</p>
  {:else if read.kind !== 'loaded'}
    <p class="ui-character-mentions__note">Reading the mentions…</p>
  {:else if rows.length === 0}
    <p class="ui-character-mentions__note">No line names {characterName} through a bound mention yet. Pending ones wait in Review.</p>
  {:else}
    <ul class="ui-character-mentions__list" aria-label="Mentions of {characterName}">
      {#each rows as m (m.wording)}
        <li>
          <SelectableRow
            title={m.wording}
            subtitle="{plural(m.count, 'mention', 'mentions')} · {plural(m.sceneIds.length, 'scene', 'scenes')}"
            selected={selected === m.wording}
            onclick={() => onselect?.(selected === m.wording ? null : m.wording)} />
        </li>
      {/each}
    </ul>
  {/if}
</InspectorSection>

<style>
  .ui-character-mentions__note {
    margin: var(--spacing-2xs) 0;
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
  .ui-character-mentions__list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>

<script>
  // Characters, as a table: Name, Lines, Scenes, voice readiness and analysis standing. The
  // Narrator is pinned above the header. Selection is the host's; Return opens nothing further,
  // since the detail is already beside the table. Moved from Khaos App (catalog app-coverage
  // plan, T2).
  import DataTable from './DataTable.svelte'
  import Icon from './Icon.svelte'
  import Portrait from './Portrait.svelte'
  import RenderMark from './RenderMark.svelte'
  import { NARRATOR, analysisMark, appearanceLabel, characterRows } from './lib/characters.js'

  /** @typedef {import('./lib/characters.js').CharacterRecord} CharacterRecord */
  /** @typedef {import('./lib/characters.js').CharacterCasting} CharacterCasting */
  /** @typedef {import('./lib/characters.js').CharacterRow} CharacterRow */

  /**
   * A voice's readiness to read: `ready`, `limited`, `unavailable`, `missing` or `unknown`, with its reason.
   * @typedef {{ state: string, label: string }} VoiceReadiness
   */

  /**
   * @typedef {Object} Props
   * @property {readonly CharacterRecord[]} [characters] khaosd's character rows.
   * @property {readonly CharacterCasting[] | null} [castings] The cast; null while it is unread.
   * @property {string} [narratorCast] The narrator's voice name, or "Not set".
   * @property {Readonly<Record<string, VoiceReadiness>>} [readiness] Each character's voice readiness by id, the narrator's under `@narrator`. A missing one reads as unknown.
   * @property {Readonly<Record<string, { state: string }>>} [standings] Each character's analysis standing by id.
   * @property {Readonly<Record<string, string>> | null} [appearance] Each character's appearance state by id; a missing one is `none`. Null when the host reads no images.
   * @property {Readonly<Record<string, string>>} [portraits] Resolved headshot URLs by character id.
   * @property {string} [selected] The selected row's id.
   * @property {string} [filter] Narrows the rows by text.
   * @property {(id: string) => void} [onselect] Reports a selected row.
   * @property {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded' }} [status] The characters' read: a failed or unfinished read is said, never shown as an empty story.
   * @property {() => void} [onretry] Try again after a failed read.
   */

  /** @type {Props} */
  let {
    characters = [],
    castings = null,
    narratorCast = '',
    readiness = {},
    standings = {},
    appearance = null,
    portraits = {},
    selected = '',
    filter = '',
    onselect = undefined,
    status = { kind: 'loaded' },
    onretry = undefined,
  } = $props()

  const rows = $derived(characterRows(characters, castings))
  // The Narrator is pinned above the header (khaos-app#617), so a story with no characters reads
  // the empty state in the body under it, not a body holding only the Narrator.
  const pinned = $derived(
    'narrator'.includes(filter.trim().toLowerCase())
      ? [{ id: NARRATOR, name: 'Narrator', lines: 0, scenes: 0, share: null, cast: narratorCast }]
      : [],
  )

  /** @param {string} id @returns {VoiceReadiness} */
  const ready = (id) => readiness[id] ?? { state: 'unknown', label: 'Voice readiness is unknown' }
  /** @param {string} id */
  const stateOf = (id) => (appearance ? (appearance[id] ?? 'none') : 'unknown')
  /** @param {string} id */
  const mark = (id) => analysisMark(standings[id])
  /** A character without a headshot: what the engine holds of its appearance. @param {string} state */
  const avatarIcon = (state) => (['artwork', 'portrait'].includes(state) ? 'image' : ['record', 'direction'].includes(state) ? 'user-focus' : 'user')
  /** @param {string} state */
  const voiceIcon = (state) =>
    state === 'ready' ? 'speaker-high' : state === 'limited' ? 'speaker-low' : state === 'unavailable' ? 'speaker-slash' : state === 'missing' ? 'speaker-none' : 'question'

  const columns = [
    { key: 'name', label: 'Name', width: 'minmax(180px, 2fr)', value: (/** @type {CharacterRow} */ r) => r.name, cell: nameCell },
    { key: 'lines', label: 'Lines', width: '44px', align: /** @type {const} */ ('end'), value: (/** @type {CharacterRow} */ r) => (r.id === NARRATOR ? null : r.lines) },
    { key: 'scenes', label: 'Sc', width: '44px', align: /** @type {const} */ ('end'), value: (/** @type {CharacterRow} */ r) => (r.id === NARRATOR ? null : r.scenes) },
    { key: 'voice', label: 'Voice', width: '44px', value: (/** @type {CharacterRow} */ r) => ready(r.id).state, cell: voiceCell },
    { key: 'analysis', label: 'An', width: '32px', value: (/** @type {CharacterRow} */ r) => mark(r.id) ?? '', cell: analysisCell },
  ]
</script>

{#snippet nameCell(/** @type {CharacterRow} */ row)}
  {@const state = stateOf(row.id)}
  {@const label = appearance ? appearanceLabel(state) : appearanceLabel('unknown')}
  <span class="ui-character-table__name">
    {#if row.id !== NARRATOR}
      <span class="ui-character-table__avatar" class:ui-character-table__avatar--available={!['none', 'unread', 'unknown'].includes(state)} role="img" aria-label={label} title={label}>
        {#if portraits[row.id]}
          <Portrait src={portraits[row.id] ?? ''} name={row.name} identity={row.id} aspect="1 / 1" />
        {:else}
          <Icon name={avatarIcon(state)} />
        {/if}
      </span>
    {/if}{row.name}
  </span>
{/snippet}

{#snippet analysisCell(/** @type {CharacterRow} */ row)}
  {@const m = mark(row.id)}
  <RenderMark state={m} label={m === 'stale' ? 'Analysis stale' : 'Analysis current'} compact />
{/snippet}

{#snippet voiceCell(/** @type {CharacterRow} */ row)}
  {@const voice = ready(row.id)}
  <span class="ui-character-table__voice" data-state={voice.state} role="img" aria-label={voice.label} title={voice.label}>
    <Icon name={voiceIcon(voice.state)} weight={voice.state === 'ready' ? 'fill' : 'regular'} />
  </span>
{/snippet}

<DataTable
  {rows}
  {pinned}
  {columns}
  rowKey={(/** @type {CharacterRow} */ r) => r.id}
  label="Characters"
  {selected}
  {filter}
  {onselect}
  {status}
  {onretry}
  loadingLabel="Reading characters…"
  empty="This story has no characters."
  wrap
  uiId="story.characters" />

<style>
  .ui-character-table__name { min-width: 0; display: flex; align-items: center; gap: var(--spacing-xs); }
  .ui-character-table__avatar { display: flex; justify-content: center; align-items: center; width: 28px; height: 28px; flex: none; border-radius: var(--radius-full); overflow: hidden; border: 1px dashed var(--border-default); color: var(--text-tertiary); }
  .ui-character-table__avatar--available { border: 1px solid var(--text-secondary); color: var(--text-primary); background: var(--surface-raised); }
  .ui-character-table__voice { display: inline-flex; color: var(--text-secondary); }
  .ui-character-table__voice[data-state='ready'] { color: var(--text-primary); }
  .ui-character-table__voice[data-state='missing'] { color: var(--text-tertiary); }
</style>

<script>
  // A character's aliases (RFC 0097): who asserted each, adding one, removing or rejecting
  // one, and moving the mentions still matched through a removed alias. Every change is
  // reported; the host writes it and answers with the next state. Moved from Khaos App
  // (catalog app-coverage plan, T2).
  import Button from './Button.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import EditableField from './EditableField.svelte'
  import LabeledPill from './LabeledPill.svelte'
  import Menu from './Menu.svelte'
  import SectionHeader from './SectionHeader.svelte'
  import Toggle from './Toggle.svelte'
  import { aliasGroups } from './lib/character-aliases.js'

  /** @typedef {import('./lib/character-aliases.js').NamedCharacter} NamedCharacter */

  /** @typedef {import('./lib/types.js').Stranded} Stranded */
  /** @typedef {import('./lib/types.js').BindTarget} BindTarget */

  /**
   * @typedef {Object} Props
   * @property {NamedCharacter} [character] The character's row from khaosd.
   * @property {readonly { id: string, name: string }[]} [characters] The story's characters: where a wrongly matched mention can be moved.
   * @property {Stranded | null} [stranded] Mentions left bound through a removed alias; shown only when they are this character's.
   * @property {boolean} [busy] A change is being written: every control waits.
   * @property {(sceneId: string) => number | null} [sceneNumber] A scene's 1-based number, or null when the host does not hold it. Never invented.
   * @property {(alias: string) => void} [onAdd] Reports an alias to add.
   * @property {(alias: string, origin: 'authored' | 'introduced') => boolean | void | Promise<boolean | void>} [onRemove] Reports a confirmed removal or rejection. The confirmation stays open when it answers false.
   * @property {(mentionIds: string[], to: BindTarget, destinationName: string) => void | Promise<void>} [onMove] Reports a confirmed move.
   * @property {() => void} [onLeave] Reports leaving the stranded mentions where they are.
   */

  /** @type {Props} */
  let {
    character = { id: '', name: '' },
    characters = [],
    stranded = null,
    busy = false,
    sceneNumber = () => null,
    onAdd = undefined,
    onRemove = undefined,
    onMove = undefined,
    onLeave = undefined,
  } = $props()

  const NEW = 'new'
  const name = $derived(character.name ?? '')
  const groups = $derived(aliasGroups(character))
  const mine = $derived(stranded && stranded.characterId === character.id ? stranded : null)
  const destinations = $derived([
    { value: NEW, label: 'A new character' },
    ...characters.filter((c) => c.id !== character.id).map((c) => ({ value: c.id, label: c.name, group: 'In the story' })),
  ])

  /** @type {{ alias: string, origin: 'authored' | 'introduced' } | null} */
  let retiring = $state(null)
  /** @type {string | null} */
  let destination = $state(null)
  let moving = $state(false)
  // The mentions chosen for the next move. A moved mention leaves the list, so only ids still
  // listed count.
  /** @type {string[]} */
  let chosen = $state([])
  const selected = $derived(chosen.filter((id) => mine?.mentions.some((m) => m.id === id)))
  /** @param {string} sceneId @param {number} lineNumber */
  const where = (sceneId, lineNumber) => {
    const n = sceneNumber(sceneId)
    return `${n !== null ? `Scene S${n} · ` : ''}line ${lineNumber}`
  }
  const destinationName = $derived(destination === NEW ? 'a new character' : (characters.find((c) => c.id === destination)?.name ?? ''))
  /** @param {number} n */
  const count = (n) => `${n} ${n === 1 ? 'mention' : 'mentions'}`

  async function retire() {
    const target = retiring
    if (target && (await onRemove?.(target.alias, target.origin)) !== false) retiring = null
  }

  async function move() {
    if (!destination) return
    /** @type {BindTarget} */
    const to = destination === NEW ? { kind: 'new' } : { kind: 'existing', characterId: destination }
    const ids = selected
    const toName = destinationName
    moving = false
    chosen = []
    await onMove?.(ids, to, toName)
  }
</script>

<section class="ui-character-aliases" aria-label="Aliases">
  <SectionHeader title="Aliases" />
  <p class="ui-character-aliases__note">Stage 1 matches a mention of any of these names to {name}.</p>

  {#if groups.authored.length || groups.introduced.length || groups.other.length}
    <ul class="ui-character-aliases__list">
      {#each groups.authored as alias (alias)}
        <li class="ui-character-aliases__item">
          <LabeledPill label="Added by you" value={alias} tone="accent" />
          <Button variant="text" disabled={busy} onclick={() => (retiring = { alias, origin: 'authored' })}>
            Remove <span class="visually-hidden">“{alias}”</span>
          </Button>
        </li>
      {/each}
      {#each groups.introduced as alias (alias)}
        <li class="ui-character-aliases__item">
          <LabeledPill label="Introduced in the script" value={alias} tone="info" />
          <Button variant="text" disabled={busy} onclick={() => (retiring = { alias, origin: 'introduced' })}>
            Not this character<span class="visually-hidden">: “{alias}”</span>
          </Button>
        </li>
      {/each}
      {#each groups.other as alias (alias)}
        <li class="ui-character-aliases__item">
          <LabeledPill label="From the story" value={alias} />
        </li>
      {/each}
    </ul>
  {/if}

  <EditableField label="Add an alias" placeholder={`Another name for ${name}`} value="" onsave={(/** @type {string} */ value) => onAdd?.(value)} />

  {#if mine}
    <div class="ui-character-aliases__stranded">
      <SectionHeader title={`Mentions matched through “${mine.alias}”`} />
      <p class="ui-character-aliases__note">
        {count(mine.mentions.length)} {mine.mentions.length === 1 ? 'is' : 'are'} still with {mine.characterName}.
        Choose the ones that are someone else, then who they are.
      </p>
      <div class="ui-character-aliases__mentions" role="group" aria-label={`Mentions matched through “${mine.alias}”`}>
        <!-- A Toggle per mention, so each announces its checked state by its line. The kit has
             no multi-select row (#279); SelectableRow's aria-current names the one chosen row
             and is wrong for picking several. -->
        {#each mine.mentions as m (m.id)}
          <Toggle
            label={m.lineText}
            hint={`“${m.name}” · ${where(m.sceneId, m.lineNumber)}`}
            checked={selected.includes(m.id)}
            disabled={busy}
            onchange={(/** @type {boolean} */ on) => (chosen = on ? [...chosen.filter((c) => c !== m.id), m.id] : chosen.filter((c) => c !== m.id))} />
        {/each}
      </div>
      <div class="ui-character-aliases__move">
        <Button variant="text" disabled={busy} onclick={() => (chosen = mine.mentions.map((m) => m.id))}>Select all</Button>
        <Menu
          label="Move to"
          value={destination ?? ''}
          items={destinations}
          currentLabel="Choose…"
          disabled={busy}
          onselect={(/** @type {string} */ value) => (destination = value)} />
        <Button variant="primary" disabled={busy || !destination || selected.length === 0} onclick={() => (moving = true)}>
          Move {count(selected.length)}
        </Button>
        <Button variant="secondary" disabled={busy} onclick={() => onLeave?.()}>Leave them</Button>
      </div>
    </div>
  {/if}
</section>

{#if retiring}
  <ConfirmDialog
    open
    target={retiring.origin === 'authored' ? `“${retiring.alias}” from ${name}` : `“${retiring.alias}” as a name for ${name}`}
    action={retiring.origin === 'authored' ? 'Remove' : 'Reject'}
    tone="default"
    confirmLabel={retiring.origin === 'authored' ? 'Remove' : 'Not this character'}
    description={retiring.origin === 'authored'
      ? `Stage 1 stops matching “${retiring.alias}” to ${name}. Mentions already matched stay matched, and you can move them afterwards. You can add it again at any time.`
      : `The screenplay introduces ${name} by this name, but it is someone else. Stage 1 stops matching it, and a re-import will not bring it back. Mentions already matched stay matched, and you can move them afterwards.`}
    onConfirm={() => void retire()}
    onCancel={() => (retiring = null)}
    onOpenChange={(/** @type {boolean} */ open) => { if (!open) retiring = null }} />
{/if}

{#if moving && mine && destination && selected.length}
  <ConfirmDialog
    open
    target={`${count(selected.length)} of “${mine.alias}” to ${destinationName}`}
    action="Move"
    tone="default"
    confirmLabel="Move"
    description={`Each is taken from ${mine.characterName} and given to ${destinationName}, and the correction is recorded. ${mine.characterName}’s other appearances are untouched.`}
    onConfirm={() => void move()}
    onCancel={() => (moving = false)}
    onOpenChange={(/** @type {boolean} */ open) => (moving = open)} />
{/if}

<style>
  .ui-character-aliases {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .ui-character-aliases__note {
    margin: 0;
    font-size: var(--body-md-size);
    color: var(--text-secondary);
  }

  .ui-character-aliases__list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm) var(--spacing-md);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ui-character-aliases__item {
    display: flex;
    align-items: flex-end;
    gap: var(--spacing-2xs);
  }

  .ui-character-aliases__stranded {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .ui-character-aliases__mentions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
  }

  .ui-character-aliases__move {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-sm);
  }
</style>

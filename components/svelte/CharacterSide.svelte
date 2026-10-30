<script>
  // The Characters inspector: Identity, Casting through the Voice pop-up (the same-named voice
  // first), Aliases as tokens, Mentions and Appears with. A selected line shows here instead,
  // through the host's dialogue inspector passed as the `dialogue` snippet. The narrator's row
  // shows the narrator's casting. Every change is reported. Moved from Khaos App (catalog
  // app-coverage plan, T2).
  import AudioPlayback from './AudioPlayback.svelte'
  import BarChart from './BarChart.svelte'
  import VoiceBrief from './VoiceBrief.svelte'
  import Button from './Button.svelte'
  import CharacterAliases from './CharacterAliases.svelte'
  import CharacterMentions from './CharacterMentions.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import Popover from './Popover.svelte'
  import Portrait from './Portrait.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import Sheet from './Sheet.svelte'
  import TokenField from './TokenField.svelte'
  import { aliasGroups } from './lib/character-aliases.js'
  import { NARRATOR, characterIdentity, coAppearanceBars, voiceChoices } from './lib/characters.js'

  /** @typedef {import('./lib/characters.js').CharacterRecord} CharacterRecord */
  /** @typedef {import('./lib/characters.js').CastableVoice} CastableVoice */
  /** @typedef {import('./lib/types.js').Stranded} Stranded */
  /** @typedef {import('./lib/types.js').BindTarget} BindTarget */

  /**
   * @typedef {Object} Props
   * @property {CharacterRecord | null} [character] The selected character's row, or null.
   * @property {boolean} [narrator] The narrator's row is selected.
   * @property {import('svelte').Snippet | undefined} [dialogue] The host's dialogue inspector, rendered in place of everything else while a line is selected; undefined while none is.
   * @property {string} [portrait] The character's resolved headshot URL.
   * @property {readonly CastableVoice[]} [castable] The voices a character or the narrator can be cast to.
   * @property {string} [castLabel] The Voice pop-up's text: the cast voice, "Not cast", or the read's state.
   * @property {boolean} [cast] The character is cast, so no voice is suggested.
   * @property {string} [narratorLabel] The narrator's voice name, or "Not set".
   * @property {{ kind: 'none' } | { kind: 'making' } | { kind: 'ready', src: string } | { kind: 'failed', message: string } | null} [narratorPreview] Hearing the narrator's voice in place: `none` offers Preview voice, `making` while the host makes the clip, `ready` plays it, `failed` says why and offers it again. Null, with no voice set, draws nothing.
   * @property {() => void} [onPreviewNarrator] Preview voice was pressed: make the narrator's preview clip.
   * @property {string} [castDisabledReason] Why casting is unavailable now; empty when it is.
   * @property {{ name: string, profileId: string } | null} [castUnlocked] The character's own cast voice, when it is not locked yet.
   * @property {(profileId: string) => void} [onCast] Reports a voice picked for the selection.
   * @property {(profileId: string) => void} [onLockVoice] Reports Lock… on the unlocked cast voice.
   * @property {(characterId: string, characterName: string) => void} [onDesignVoice] Reports Design a voice….
   * @property {import('svelte').ComponentProps<typeof VoiceBrief>['read']} [voiceBrief] The selection's voice brief, shown under the voice picker; absent shows none.
   * @property {readonly { id: string, name: string }[]} [characters] The story's characters: where stranded mentions can be moved.
   * @property {Stranded | null} [stranded] Mentions left bound through a removed alias.
   * @property {boolean} [aliasBusy] An alias change is being written.
   * @property {(alias: string) => void} [onAddAlias] Reports an alias to add.
   * @property {(alias: string, origin: 'authored' | 'introduced') => boolean | void | Promise<boolean | void>} [onRemoveAlias] Reports an alias to remove or reject.
   * @property {(mentionIds: string[], to: BindTarget, destinationName: string) => void | Promise<void>} [onMoveMentions] Reports a move of stranded mentions.
   * @property {() => void} [onLeaveMentions] Reports leaving stranded mentions.
   * @property {(sceneId: string) => number | null} [sceneNumber] A scene's 1-based number, or null.
   * @property {import('./lib/types.js').MentionsRead} [mentions] The character's mention wordings.
   * @property {string | null} [selectedMention] The chosen wording.
   * @property {(wording: string | null) => void} [onSelectMention] Reports a chosen wording, or null.
   * @property {Record<string, unknown> | null} [graphContext] The character's detail's `graph_context`, for Appears with.
   * @property {boolean} [deletable] Offers Delete….
   * @property {boolean} [deleteBusy] A deletion is being written.
   * @property {string} [restoreNote] Appended to the deletion's confirmation: how it can be undone.
   * @property {() => void} [onDelete] Reports a confirmed deletion.
   */

  /** @type {Props} */
  let {
    character = null,
    narrator = false,
    dialogue = undefined,
    portrait = '',
    castable = [],
    castLabel = '',
    cast = false,
    narratorLabel = '',
    narratorPreview = null,
    onPreviewNarrator = undefined,
    castDisabledReason = '',
    castUnlocked = null,
    onCast = undefined,
    onLockVoice = undefined,
    onDesignVoice = undefined,
    voiceBrief = undefined,
    characters = [],
    stranded = null,
    aliasBusy = false,
    onAddAlias = undefined,
    onRemoveAlias = undefined,
    onMoveMentions = undefined,
    onLeaveMentions = undefined,
    sceneNumber = () => null,
    mentions = { kind: 'loading' },
    selectedMention = null,
    onSelectMention = undefined,
    graphContext = null,
    deletable = false,
    deleteBusy = false,
    restoreNote = '',
    onDelete = undefined,
  } = $props()

  let deleting = $state(false)

  const choices = $derived(voiceChoices(narrator ? 'Narrator' : (character?.name ?? 'Narrator'), castable))
  const groups = $derived(character ? aliasGroups(character) : null)
  const coBars = $derived(coAppearanceBars(graphContext))

  /** @param {string} alias */
  function removeAlias(alias) {
    if (!groups) return
    void onRemoveAlias?.(alias, groups.introduced.includes(alias) ? 'introduced' : 'authored')
  }
</script>

{#if dialogue}
  {@render dialogue()}
{:else if narrator}
  <!-- The character inspector's layout and controls (khaos-app#620; K: "the narrator inspect
       should match the other character inspectors visually"). Only what is the Narrator's
       alone differs: what it reads, and no aliases, mentions or deletion. -->
  <InspectorSection title="Identity" uiId="story.inspector.identity">
    <PropertyRow label="Name" value="Narrator" />
    <PropertyRow label="Reads" value="Every action line" />
  </InspectorSection>

  <InspectorSection title="Casting" uiId="story.inspector.casting">
    <PropertyRow label="Voice">
      <Popover label="Voice" value={narratorLabel} items={choices.items} onpick={onCast} disabledReason={castDisabledReason} uiId="story.inspector.narrator-voice" />
    </PropertyRow>
    {#if narratorPreview}
      <div class="ui-character-side__preview" data-ui-id="story.inspector.narrator-preview">
        {#if narratorPreview.kind === 'ready'}
          <AudioPlayback src={narratorPreview.src} label="Narrator voice preview" />
        {:else if narratorPreview.kind === 'making'}
          <p class="ui-character-side__note" role="status">Making a preview…</p>
        {:else}
          {#if narratorPreview.kind === 'failed'}<p class="ui-character-side__note" role="alert">{narratorPreview.message}</p>{/if}
          <Button variant="secondary" icon="play" onclick={() => onPreviewNarrator?.()}>Preview voice</Button>
        {/if}
      </div>
    {/if}
    <p class="ui-character-side__note">The narrator reads action and scene description.</p>
    {#if voiceBrief}<VoiceBrief name="Narrator" read={voiceBrief} />{/if}
    <div class="ui-character-side__actions"><Button variant="secondary" onclick={() => onDesignVoice?.(NARRATOR, 'Narrator')}>Design a voice for Narrator…</Button></div>
  </InspectorSection>
{:else if character}
  {#if portrait}<div class="ui-character-side__portrait" aria-label={`${character.name} headshot`}><Portrait src={portrait} name={character.name} identity={character.id} aspect="1 / 1" /></div>{/if}
  <InspectorSection title="Identity" uiId="story.inspector.identity">
    <PropertyRow label="Name" value={character.name} source={character.origin ?? ''} />
    {#each characterIdentity(character) as [label, value] (label)}<PropertyRow {label} {value} />{/each}
  </InspectorSection>

  <InspectorSection title="Casting" uiId="story.inspector.casting">
    <PropertyRow label="Voice">
      <Popover
        label="Voice"
        value={castLabel}
        items={choices.items}
        suggested={cast ? '' : choices.suggested}
        onpick={onCast}
        disabledReason={castDisabledReason}
        uiId="story.inspector.voice" />
    </PropertyRow>
    {#if castUnlocked}
      <!-- Only this character's own voice, when it is cast but not locked yet: its lines will
           not read until it is. Other designs are not this character's business. -->
      <p class="ui-character-side__note"><strong>{castUnlocked.name}</strong> is not locked yet, so {character.name}'s lines will not read.</p>
      <Button variant="secondary" onclick={() => onLockVoice?.(castUnlocked.profileId)}>Lock {castUnlocked.name}…</Button>
    {/if}
    {#if voiceBrief}<VoiceBrief name={character.name} read={voiceBrief} />{/if}
    <div class="ui-character-side__actions"><Button variant="secondary" onclick={() => onDesignVoice?.(character.id, character.name)}>Design a voice for {character.name}…</Button></div>
  </InspectorSection>

  {#if groups}
    <InspectorSection title="Aliases" count={groups.authored.length + groups.introduced.length} uiId="story.inspector.aliases">
      <TokenField
        tokens={[...groups.introduced, ...groups.authored]}
        label="Aliases"
        placeholder="Add an alias"
        onadd={onAddAlias}
        onremove={removeAlias}
        uiId="story.inspector.alias" />
      {#if groups.other.length}<TokenField tokens={groups.other} label="Also matched" readonly />{/if}
      {#if stranded?.characterId === character.id}
        <!-- Mentions left bound through a removed alias: the move flow. -->
        <CharacterAliases
          {character}
          {characters}
          {stranded}
          busy={aliasBusy}
          {sceneNumber}
          onAdd={onAddAlias}
          onRemove={onRemoveAlias}
          onMove={onMoveMentions}
          onLeave={onLeaveMentions} />
      {/if}
    </InspectorSection>
  {/if}

  <CharacterMentions read={mentions} characterName={character.name} selected={selectedMention} onselect={onSelectMention} />

  <InspectorSection title="Appears with" count={coBars.length} uiId="story.inspector.appears">
    <BarChart data={coBars} caption="Scenes shared with each character, as the engine counts them." emptyLabel="The engine measured no scenes shared with another character." />
  </InspectorSection>

  {#if deletable}
    <div class="ui-character-side__actions">
      <Button variant="secondary" disabled={deleteBusy} onclick={() => (deleting = true)}>Delete {character.name}…</Button>
    </div>
  {/if}
  {#if deleting}
    <Sheet
      title="Delete {character.name}?"
      target={character.name}
      message="Their bio, details and aliases are removed.{restoreNote}"
      confirmLabel="Delete"
      tone="danger"
      oncancel={() => (deleting = false)}
      onconfirm={() => {
        deleting = false
        onDelete?.()
      }} />
  {/if}
{/if}

<style>
  .ui-character-side__portrait { width: min(160px, 100%); margin: 0 auto var(--spacing-md); }
  .ui-character-side__note {
    margin: var(--spacing-2xs) 0;
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
  .ui-character-side__actions {
    padding: var(--spacing-sm);
  }
  .ui-character-side__preview {
    margin: var(--spacing-2xs) 0;
  }
</style>

<script>
  // A character's working document: a compact identity header, then a Lines | Scenes |
  // Analysis | Images | Recordings switch with nothing below it but its body. Lines are
  // virtualised and grouped by scene, with no pages. A mention chosen in the inspector shows its
  // lines here in place of the view, until a view is chosen again. The host reads; a view
  // chosen is reported, so the host can read what that view shows only when it is opened.
  // Moved from Khaos App (catalog app-coverage plan, T2).
  import AnalysisStale from './AnalysisStale.svelte'
  import Button from './Button.svelte'
  import CharacterAnalysis from './CharacterAnalysis.svelte'
  import CharacterRecordings from './CharacterRecordings.svelte'
  import DataTable from './DataTable.svelte'
  import EmptyState from './EmptyState.svelte'
  import Portrait from './Portrait.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  import SubjectImages from './SubjectImages.svelte'
  import { characterAnalysisView } from './lib/character-analysis.js'

  /** @typedef {import('./lib/characters.js').CharacterRecord} CharacterRecord */
  /** @typedef {'lines' | 'scenes' | 'analysis' | 'images' | 'recordings'} CharacterView */

  /**
   * A scene as the dashboard lists it.
   * @typedef {Object} SceneSummary
   * @property {string} id
   * @property {number} [index] 0-based place in the story.
   * @property {string} [slugline]
   */

  /**
   * One line the character speaks, as khaosd's dialogues list it.
   * @typedef {Object} DialogueLine
   * @property {string} element_id
   * @property {string} scene_slugline
   * @property {string} text
   * @property {string} [parenthetical]
   */

  /**
   * A line a chosen mention is said on.
   * @typedef {Object} MentionLine
   * @property {string} referenceId
   * @property {string} sceneId
   * @property {number} lineNumber 1-based.
   * @property {string} lineText
   */

  /**
   * @typedef {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded', lines: readonly DialogueLine[] }} DialoguesRead
   */

  /**
   * The character's detail read: `idle` before one is asked for.
   * @typedef {{ kind: 'idle' } | { kind: 'loading' } | { kind: 'failed', message?: string } | { kind: 'loaded', analysis: Record<string, unknown> | null }} DetailRead
   */

  /**
   * @typedef {Object} Props
   * @property {CharacterRecord | null} [character] The selected character's row; null when none is selected.
   * @property {readonly SceneSummary[]} [scenes] The story's scenes, for the Scenes view and the mention lines' headings.
   * @property {DialoguesRead} [dialogues] The character's lines.
   * @property {string} [selectedLine] The selected line's element id.
   * @property {(elementId: string) => void} [onSelectLine] Reports a selected line.
   * @property {{ wording: string, occurrences: readonly MentionLine[] } | null} [mention] A mention chosen in the inspector; its lines replace the view.
   * @property {() => void} [onClearMention] Reports a view chosen while a mention shows.
   * @property {DetailRead} [detail] The character's detail read, which carries its analysis.
   * @property {{ state: string, reasons?: readonly string[], details?: readonly unknown[] } | undefined} [standing] The engine's standing for this character's analysis: why a stale one is stale; undefined for a character with no analysis.
   * @property {import('./lib/types.js').SubjectImagesRead} [images] The character's images read.
   * @property {Readonly<Record<string, string>>} [imageUrls] Resolved image URLs by reference id.
   * @property {(referenceId: string) => void} [onRevealImage] Reports an activated image.
   * @property {import('./lib/types.js').RecordingsRead} [recordings] The character's recordings read.
   * @property {(id: string) => void} [onRevealRecording] Reports an activated recording.
   * @property {string} [portrait] The character's resolved headshot URL.
   * @property {((characterId: string) => void) | undefined} [onBuildAppearance] Offers Build appearance… when set; undefined where the host has no builder.
   * @property {(view: CharacterView) => void} [onview] Reports the view chosen.
   */

  /** @type {Props} */
  let {
    character = null,
    scenes = [],
    dialogues = { kind: 'loading' },
    selectedLine = '',
    onSelectLine = undefined,
    mention = null,
    onClearMention = undefined,
    detail = { kind: 'idle' },
    standing = undefined,
    images = { kind: 'loading' },
    imageUrls = {},
    onRevealImage = undefined,
    recordings = { kind: 'loading' },
    onRevealRecording = undefined,
    portrait = '',
    onBuildAppearance = undefined,
    onview = undefined,
  } = $props()

  /** @type {CharacterView} */
  let tab = $state('lines')

  const lines = $derived(dialogues.kind === 'loaded' ? dialogues.lines : [])
  const castScenes = $derived(
    /** @type {SceneSummary[]} */ ((character?.scenes ?? []).map((id) => scenes.find((s) => s.id === id)).filter(Boolean)),
  )
  const analysis = $derived(detail.kind === 'loaded' ? detail.analysis : null)
  const view = $derived(characterAnalysisView(analysis))
  /** @param {string} sceneId */
  const sceneHeading = (sceneId) => {
    const scene = scenes.find((s) => s.id === sceneId)
    if (!scene) return sceneId
    return `${scene.index === undefined ? '' : `S${scene.index + 1} · `}${scene.slugline ?? scene.id}`
  }

  const lineColumns = [
    { key: 'text', label: 'Line', width: 'minmax(200px, 1fr)', value: (/** @type {DialogueLine} */ l) => (l.parenthetical ? `${l.parenthetical} ${l.text}` : l.text) },
  ]
  const mentionColumns = [
    { key: 'n', label: 'Ln', width: '56px', align: /** @type {const} */ ('end'), value: (/** @type {MentionLine} */ l) => l.lineNumber },
    { key: 'text', label: 'Line', width: 'minmax(200px, 1fr)', value: (/** @type {MentionLine} */ l) => l.lineText },
  ]
  const sceneColumns = [
    { key: 'n', label: 'Sc', width: '44px', align: /** @type {const} */ ('end'), value: (/** @type {SceneSummary} */ s) => (s.index === undefined ? null : s.index + 1) },
    { key: 'slugline', label: 'Scene', width: 'minmax(200px, 1fr)', value: (/** @type {SceneSummary} */ s) => s.slugline ?? s.id },
  ]
  const VIEWS = [
    { value: 'lines', label: 'Lines' },
    { value: 'scenes', label: 'Scenes' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'images', label: 'Images' },
    { value: 'recordings', label: 'Recordings' },
  ]
</script>

{#if !character}
  <EmptyState title="No character selected" description="Select a character in the table. ↑ and ↓ move the selection; it is kept when you switch away." icon="user" />
{:else}
  <div class="ui-character-detail">
    <header class="ui-character-detail__head">
      {#if onBuildAppearance}
        <div class="ui-character-detail__appearance">
          {#if portrait}<span class="ui-character-detail__portrait"><Portrait src={portrait} name={character.name} identity={character.id} aspect="1 / 1" /></span>{/if}
          <Button icon="user-focus" onclick={() => onBuildAppearance(character.id)}>Build appearance…</Button>
        </div>
      {/if}
      <SegmentedControl
        label="Character view"
        value={mention ? '' : tab}
        items={VIEWS}
        onselect={(/** @type {string} */ v) => {
          tab = /** @type {CharacterView} */ (v)
          onClearMention?.()
          onview?.(tab)
        }} />
    </header>
    <div class="ui-character-detail__body">
      {#if mention}
        <DataTable
          rows={mention.occurrences}
          columns={mentionColumns}
          rowKey={(/** @type {MentionLine} */ l) => l.referenceId}
          label="Lines that say “{mention.wording}”"
          groupBy={(/** @type {MentionLine} */ l) => sceneHeading(l.sceneId)}
          wrap
          uiId="story.character.mention-lines" />
      {:else if tab === 'lines'}
        {#if dialogues.kind === 'failed'}
          <EmptyState title="Could not read the lines" description={dialogues.message} icon="warning" />
        {:else if dialogues.kind === 'loading'}
          <EmptyState title="Reading the lines…" icon="circle-notch" />
        {:else}
          <DataTable
            rows={lines}
            columns={lineColumns}
            rowKey={(/** @type {DialogueLine} */ l) => l.element_id}
            label="Lines of {character.name}"
            groupBy={(/** @type {DialogueLine} */ l) => l.scene_slugline}
            selected={selectedLine}
            onselect={onSelectLine}
            empty="{character.name} speaks no lines."
            wrap
            uiId="story.character.lines" />
        {/if}
      {:else if tab === 'scenes'}
        <DataTable rows={castScenes} columns={sceneColumns} rowKey={(/** @type {SceneSummary} */ s) => s.id} label="Scenes with {character.name}" empty="The engine lists no scene for {character.name}." uiId="story.character.scenes" />
      {:else if tab === 'images'}
        <div class="ui-character-detail__images"><SubjectImages read={images} urls={imageUrls} kind="character" {onRevealImage} /></div>
      {:else if tab === 'recordings'}
        <CharacterRecordings read={recordings} characterName={character.name} {onRevealRecording} />
      {:else if detail.kind === 'loading'}
        <EmptyState title="Reading the analysis…" icon="circle-notch" />
      {:else if view}
        <div class="ui-character-detail__analysis"><AnalysisStale {standing} /><CharacterAnalysis {analysis} /></div>
      {:else if detail.kind === 'loaded'}
        <EmptyState title="Analysed by an older process" description="The analysis the engine holds for {character.name} is in a shape it no longer writes. Analyse Character in the toolbar replaces it." icon="sparkle" />
      {:else}
        <EmptyState title="Not analysed yet" description="The engine holds no character analysis for {character.name}. Analyse Character in the toolbar runs it." icon="sparkle" />
      {/if}
    </div>
  </div>
{/if}

<style>
  .ui-character-detail__portrait { display: block; width: 48px; }
  .ui-character-detail__appearance { display: flex; justify-content: flex-end; padding-bottom: var(--spacing-xs); }
  .ui-character-detail {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .ui-character-detail__head {
    flex: none;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }
  /* The view switch is the header: it takes the full width, one equal segment per view. */
  .ui-character-detail__head :global(.ui-segmented) {
    display: flex;
  }
  .ui-character-detail__head :global(.ui-segmented__item) {
    flex: 1;
    text-align: center;
  }
  .ui-character-detail__body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .ui-character-detail__analysis {
    overflow: auto;
  }
  .ui-character-detail__images {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: var(--spacing-sm);
  }
</style>

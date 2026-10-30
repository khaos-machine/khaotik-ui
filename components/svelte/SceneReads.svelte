<script>
  // A scene's reads: Read scene, the engine's reads with choose, delete, download and play,
  // the workflows reading now, the approval a read waits on, the narrator hint, what a refusal
  // offers, and what the engine left unread. The host owns the reads model and its lifecycle;
  // this takes its state as values, confirms destructive steps itself, and reports intent.
  import Button from './Button.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import GenerationFailureDetails from './GenerationFailureDetails.svelte'
  import Icon from './Icon.svelte'
  import RefusalOffer from './RefusalOffer.svelte'
  import SceneReadStatus from './SceneReadStatus.svelte'
  import TakeList from './TakeList.svelte'

  /**
   * @typedef {Object} SceneReadWorkflow
   * @property {string} id The workflow's id.
   * @property {string} state khaosd's workflow state: `running`, `partial`, `completed`, `retired`, …
   * @property {{ generation: any }} [failure] A provider failure, shown with its details.
   */

  /**
   * @typedef {Object} Narrator
   * @property {'unknown' | 'unset' | 'notListed' | 'unavailable' | 'notLocked' | 'usable' | string} status What the app knows of the narrator voice.
   * @property {string} [name] The narrator voice's name.
   * @property {string} [voiceProfileId] Its profile id, for Lock.
   * @property {string} [reason] Why it is unavailable, in the engine's words.
   */

  /**
   * @typedef {Object} Props
   * @property {string} [sceneHeading] The scene's heading, for the confirmations.
   * @property {'inline' | 'hosted'} [playback] Inline players in the rows, or a host transport that owns auditions.
   * @property {readonly any[]} [takes] The scene's reads, as TakeList takes them; each carries its `label` and `voiceName`.
   * @property {string} [chosenId] The chosen read's id.
   * @property {boolean} [generating] A read is being prepared or made.
   * @property {boolean} [mutating] A choose, delete or prune is in flight.
   * @property {string} [progress] How far the read in flight has got.
   * @property {boolean} [canDownload] Whether reads can be saved to a file.
   * @property {string} [downloadingId] The read being saved.
   * @property {readonly SceneReadWorkflow[]} [workflows] The workflows reading this scene, as SceneReadStatus takes them.
   * @property {{ id: string, state: string, reason: string } | null} [unadmitted] A prepared workflow the engine has not admitted, with its reason.
   * @property {boolean} [resuming] A resume is being admitted.
   * @property {string} [recoveringId] A workflow this window can attach to and follow.
   * @property {boolean} [observing] Attaching to it is in flight.
   * @property {readonly string[]} [unchosenIds] The reads that are not chosen.
   * @property {Narrator} [narrator] The narrator voice, for the hint before reading.
   * @property {boolean} [canChooseNarrator] Whether the narrator's voice can be chosen from here.
   * @property {{ code: string, voices?: readonly { voiceProfileId: string, voiceName: string }[] } | null} [outcome] The last refusal, by the engine's code.
   * @property {import('./lib/types.js').Refusal | null} [offer] What the refusal offers.
   * @property {readonly { element: string, kind: string }[] | null} [skipped] What the engine left unread; null before a read.
   * @property {() => void} [onRead] Reports Read scene.
   * @property {(id: string) => void} [onChoose] Reports a read chosen.
   * @property {(id: string) => void} [onDelete] Reports a confirmed delete, or a confirmed retire of a workflow.
   * @property {(id: string) => void} [onDownload] Reports a read to save.
   * @property {(id: string) => void} [onOpen] Reports a read to open on its timeline. Without it no row offers it.
   * @property {(id: string) => void} [onResume] Reports a workflow to resume.
   * @property {() => void} [onObserve] Reports Observe existing scene read.
   * @property {(ids: readonly string[]) => void} [onRemoveUnchosen] Reports a confirmed prune, with the ids counted when it was asked.
   * @property {() => void} [onChooseNarrator] Reports Choose the narrator's voice.
   * @property {(voiceProfileId: string) => void} [onLockVoice] Reports a voice to lock. Without it no Lock is offered.
   * @property {(fix: any) => void} [onFix] Reports a refusal fix.
   * @property {() => void} [onReport] Reports Report a Problem….
   */

  /** @type {Props} */
  let {
    sceneHeading = '', playback = 'inline', takes = [], chosenId = '', generating = false, mutating = false, progress = '',
    canDownload = false, downloadingId = '', workflows = [], unadmitted = null, resuming = false, recoveringId = '', observing = false,
    unchosenIds = [], narrator = { status: 'unknown' }, canChooseNarrator = false, outcome = null, offer = null, skipped = null,
    onRead = undefined, onChoose = undefined, onDelete = undefined, onDownload = undefined, onOpen = undefined, onResume = undefined,
    onObserve = undefined, onRemoveUnchosen = undefined, onChooseNarrator = undefined,
    onLockVoice = undefined, onFix = undefined, onReport = undefined,
  } = $props()

  // The read or workflow a Delete or Retire was pressed on, until the confirmation answers.
  let deleting = $state(/** @type {string | null} */ (null))
  // Remove unchosen takes: the ids counted when the confirmation opened are the ids sent.
  // Raw, because it is replaced, never mutated, and the host must receive a plain array.
  let pruning = $state.raw(/** @type {readonly string[] | null} */ (null))

  /** A workflow still reading or resumable is retired, not deleted; a finished read is deleted. */
  const retirable = (id) => {
    const workflow = unadmitted?.id === id ? unadmitted : workflows.find((w) => w.id === id)
    return workflow !== undefined && workflow !== null && workflow.state !== 'completed' && workflow.state !== 'retired'
  }
  const labelOf = (id) => takes.find((t) => t.id === id)?.label ?? id
</script>

{#snippet lockButton(voiceProfileId, name)}
  {#if onLockVoice}
    <Button onclick={() => onLockVoice?.(voiceProfileId)}>Lock {name}…</Button>
  {/if}
{/snippet}

<section class="scene-reads" aria-label="Scene reads">
  <div class="scene-reads__controls">
  {#if playback === 'inline'}
    <TakeList
      {takes}
      {chosenId}
      {generating}
      progress={mutating ? '' : progress}
      generateLabel="Read scene"
      onGenerate={() => onRead?.()}
      onChoose={(id) => onChoose?.(id)}
      onDelete={(id) => (deleting = id)}
      {...canDownload ? { onDownload: (id) => onDownload?.(id) } : {}}
      {downloadingId}
      {...onOpen ? { onOpen } : {}} />
  {:else}
    <Button variant="primary" disabled={generating} onclick={() => onRead?.()}><Icon name="waveform" />{generating ? 'Generating…' : 'Read scene'}</Button>
    {#if progress && !mutating}<p class="scene-reads__hint" role="status">{progress}</p>{/if}
    <ul class="scene-reads__hosted" aria-label="Saved readings">
      {#each takes as row (row.id)}
        <li>
          <strong>{row.label}{chosenId === row.id ? ' · Chosen' : ''}</strong>
          <p class="scene-reads__hint">{row.voiceName}</p>
          <div class="scene-reads__hosted-actions">
            <Button disabled={!onOpen} onclick={() => onOpen?.(row.id)}>Audition {row.label}</Button>
            {#if chosenId !== row.id}<Button disabled={mutating} onclick={() => onChoose?.(row.id)}>Use this reading</Button>{/if}
            <Button disabled={mutating} onclick={() => (deleting = row.id)}>Delete</Button>
            {#if canDownload}<Button disabled={downloadingId !== ''} onclick={() => onDownload?.(row.id)}>Download</Button>{/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
  </div>
  {#if mutating}<p class="scene-reads__hint" role="status">{progress}</p>{/if}
  {#each workflows as workflow (workflow.id)}
    <SceneReadStatus {workflow} {resuming} onResume={(id) => onResume?.(id)} />
    {#if workflow.failure}<GenerationFailureDetails generation={workflow.failure.generation} />{/if}
    {#if workflow.state !== 'completed' && workflow.state !== 'retired'}
      <Button disabled={mutating || workflow.state === 'running'} onclick={() => (deleting = workflow.id)}>Retire scene read</Button>
      {#if workflow.state === 'running'}<p class="scene-reads__hint">Wait for this reading to stop before retiring it.</p>{/if}
    {/if}
  {/each}
  {#if unadmitted}
    <p class="scene-reads__hint">{unadmitted.reason}</p>
    {#if unadmitted.state === 'prepared'}
      <Button disabled={mutating} onclick={() => (deleting = unadmitted.id)}>Retire scene read</Button>
    {/if}
  {/if}
  {#if recoveringId}
    <Button disabled={observing} onclick={() => onObserve?.()}>Observe existing scene read</Button>
  {/if}
  {#if unchosenIds.length}
    <!-- The scene's reads only; a line's takes are pruned from the line. -->
    <Button disabled={mutating} onclick={() => (pruning = [...unchosenIds])}>Remove unchosen takes</Button>
  {/if}
  <!-- Said before Read scene is pressed, only as far as the host knows: the engine refuses
       only a scene with action, so Read scene stays enabled. -->
  {#if narrator.status === 'unset' || narrator.status === 'notListed'}
    <p class="scene-reads__hint">This project has no narrator voice, so a scene with action lines will not read.</p>
    <Button onclick={() => onChooseNarrator?.()}>Choose the narrator's voice</Button>
  {:else if narrator.status === 'unavailable'}
    <p class="scene-reads__hint">Action lines are set to <strong>{narrator.name}</strong>, which is unavailable. {narrator.reason ?? ''}</p>
    <Button onclick={() => onChooseNarrator?.()}>Choose the narrator's voice</Button>
  {:else if narrator.status === 'notLocked'}
    <!-- The narrator only: characters are not checked before a read. The refusal covers them. -->
    <p class="scene-reads__hint">
      Action lines are set to <strong>{narrator.name}</strong>, which is not locked yet, so a scene with action lines will not read.
    </p>
    {#if narrator.voiceProfileId}{@render lockButton(narrator.voiceProfileId, narrator.name ?? '')}{/if}
  {/if}
  {#if outcome}
    <!-- Chosen by the engine's CODE, never by matching its words. -->
    {#if canChooseNarrator && outcome.code === 'NO_NARRATOR_VOICE'}
      <Button onclick={() => onChooseNarrator?.()}>Choose the narrator's voice</Button>
    {/if}
    {#if outcome.code === 'VOICE_NOT_LOCKED'}
      {#each outcome.voices ?? [] as voice (voice.voiceProfileId)}
        {@render lockButton(voice.voiceProfileId, voice.voiceName || voice.voiceProfileId)}
      {/each}
    {/if}
  {/if}
  {#if offer}
    <RefusalOffer {offer} onFix={(fix) => onFix?.(fix)} onReport={() => onReport?.()} />
  {/if}
  <!-- What a read skipped stays a plain list until the kit renders skipped elements (#222). -->
  {#if skipped?.length}
    <ul class="scene-reads__lines" aria-label="Not read aloud">
      {#each skipped as element (element.element)}
        <li>{element.kind} · Not spoken</li>
      {/each}
    </ul>
  {:else if skipped}
    <p class="scene-reads__hint">The engine left nothing in this scene unread.</p>
  {/if}
</section>
{#if pruning}
  {@const ids = pruning}
  <ConfirmDialog
    open
    target={`${ids.length} unchosen reads of ${sceneHeading}`}
    action="Remove"
    description={chosenId
      ? 'Their joined audio is removed from the project. The chosen read and every line take stay.'
      : 'No read is chosen, so every read is removed.'}
    onConfirm={() => {
      // Read before clearing: the {@const} follows `pruning`.
      const sent = ids
      pruning = null
      onRemoveUnchosen?.(sent)
    }}
    onCancel={() => (pruning = null)}
    onOpenChange={(next) => {
      if (!next) pruning = null
    }} />
{/if}
{#if deleting}
  {@const id = deleting}
  <ConfirmDialog
    open
    target={`${retirable(id) ? 'this reading attempt' : labelOf(id)} of ${sceneHeading}`}
    action={retirable(id) ? 'Retire' : 'Delete'}
    description={retirable(id)
      ? 'Retiring this attempt keeps its completed line takes and prevents it from resuming.'
      : `Its joined audio is removed from the project. The line takes it made stay with their lines.${
      chosenId === id ? ' It is the chosen read; no read will be chosen.' : ''
    }`}
    onConfirm={() => {
      // Read before clearing: the {@const} follows `deleting`.
      const target = id
      deleting = null
      onDelete?.(target)
    }}
    onCancel={() => (deleting = null)}
    onOpenChange={(next) => {
      if (!next) deleting = null
    }} />
{/if}

<style>
  .scene-reads__hosted { list-style: none; margin: 16px 0; padding: 0; }
  .scene-reads__hosted li { border-top: 1px solid var(--border-hairline); padding: 16px 0; font-size: 13px; }
  .scene-reads__hosted-actions { display: flex; gap: 6px; flex-wrap: wrap; }
  .scene-reads__lines {
    margin: 0;
    padding-left: 1.25rem;
    display: grid;
    gap: 0.35rem;
    font-size: var(--body-md-size);
  }
  .scene-reads__hint {
    color: var(--text-secondary);
    font-size: var(--body-md-size);
  }
</style>

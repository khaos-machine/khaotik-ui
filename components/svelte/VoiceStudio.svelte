<script>
 import VoiceDesignTraits from './VoiceDesignTraits.svelte'
  // The voice workspace: Design, Clone and Dialogue behind one tab bar, each
  // mounting its Level-1/2 panel and forwarding its generate to a single
  // ongenerate(kind, spec). The host owns synthesis and returns the shared
  // `result`, which every panel renders through its AudioPlayback. Composes the
  // three panels; no network or data-file imports.
  //
  // D79: given `takes`, the studio is a workbench. A designed or cloned voice is
  // found by hearing it more than once, so every audition stays in a takes column
  // beside the form instead of the last one overwriting the one before, and the
  // work ends in keeping the voice: a name and Save, under both. The host decides
  // whether a save can happen and says why not in `saveReason`; the studio only
  // refuses an empty name. Without `takes` it renders exactly as before.
  //
  // D90: given `lockVoice`, the studio is opened on an existing designed voice to lock it
  // to one take (khaos-app design "Locking a designed voice", K1). The Design tab alone, the
  // voice's own description read-only, and one Lock button in place of the name and the keep
  // choice. Locking is the host's, as saving is: the studio reports the take.
  import { TabContent, TabList, TabsRoot, TabTrigger } from '@ark-ui/svelte/tabs'
  import { onDestroy, untrack } from 'svelte'
  import VoiceDesignPanel from './VoiceDesignPanel.svelte'
  import VoiceClonePanel from './VoiceClonePanel.svelte'
  import VoicePresetPanel from './VoicePresetPanel.svelte'
  import DialogueComposer from './DialogueComposer.svelte'
  import TakeList from './TakeList.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  import Icon from './Icon.svelte'
  import AudioPlayback from './AudioPlayback.svelte'
  import Checkbox from './Checkbox.svelte'
  import RefusalOffer from './RefusalOffer.svelte'

  /** @typedef {'Design' | 'Clone' | 'Preset' | 'Dialogue'} Mode */
  const ALL_MODES = /** @type {const} */ (['Design', 'Clone', 'Dialogue'])

  /**
   * @typedef {Object} Result
   * @property {string} src Audio URL of the generated clip.
   * @property {boolean} [generating] True while the host is synthesizing.
   */

  /**
   * @typedef {Object} Take
   * @property {string} id The engine's generation id. Passed back to `onChooseTake`.
   * @property {string} label The take's name, e.g. "Take 2".
   * @property {string} createdAt When it was generated, as an ISO 8601 timestamp.
   * @property {string} voiceName What made it, in words: the description, or what the reference clip says.
   * @property {string} [src] Playable audio. Without it the take's player is disabled.
   * @property {string} [error] The engine's message for a take that failed, verbatim.
   * @property {string} [text] The words the take speaks. In lock mode a take of more than one sentence is warned about before it is locked (D90).
   */

  /**
   * @typedef {Object} LockVoice
   * @property {string} name The voice's name, as the storyteller knows it.
   * @property {string} description The voice's description, read from the engine. Takes are generated from it and it is not edited here.
   * @property {boolean} locked Whether the voice is already locked to a take. Then the button reads "Change the take…".
   */

  /**
   * @typedef {Object} HostedCloneRequirements
   * @property {string} consentStatement Mandatory words supplied by the host's reviewed provider profile.
   * @property {string} consentLocale Locale of that statement.
   * @property {string} documentationUrl Provider's official recording guide.
   * @property {string} sourceInstructions Recording guidance supplied by the reviewed provider profile.
   * @property {string} consentInstructions How the same speaker records the required consent.
   * @property {number} sourceMinSeconds
   * @property {number} sourceMaxSeconds
   * @property {string} mimeType
   * @property {number} sampleRate
   * @property {number} channels
   * @property {number} bitsPerSample
   */

  /**
   * @typedef {Object} HostedChoice
   * @property {string} id Host-owned stable choice identity.
   * @property {string} [profile] Reviewed execution profile revision, part of consent scope.
   * @property {string} label Provider and model label from the host.
   * @property {'voice.design' | 'voice.clone'} operation
   * @property {HostedCloneRequirements} [cloneRequirements] Required for replication, supplied by the host.
   * @property {boolean} ready Host readiness, never inferred from catalogue membership.
   * @property {string} [reason] Host reason for unavailability.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly HostedChoice[]} [hostedChoices] Given, renders provider identity creation instead of local speech sampling.
   * @property {string} [hostedChoiceId] Controlled provider/model choice.
   * @property {(id:string) => void} [onHostedChoice] Reports a choice; host owns selection.
   * @property {(spec:{name:string,description:string,traits?:{age?:string,gender?:string,languageCode?:string,regionCode?:string,accent?:string,pitch?:string,timbre?:string,persona?:string,context?:string,delivery?:string}}) => void} [onHostedDesign] Paid identity creation, admitted by the story budget and separate from acceptance.
   * @property {(description:string,signal:AbortSignal,traits?:{age?:string,gender?:string,languageCode?:string,regionCode?:string,accent?:string,pitch?:string,timbre?:string,persona?:string,context?:string,delivery?:string}) => Promise<{description:string,notes:readonly string[]}>} [onRefineDescription] Optional host-owned text generation. Returns a reviewable proposal; never creates a voice or replaces the editable description automatically.
   * @property {(error: unknown) => { offer: import('./lib/types.js').Refusal, onFix?: (fix: import('./lib/types.js').RefusalFix) => void, onReport?: () => void } | null} [refinementRefusal] Maps a refused refinement to the fixes it offers (such as Set budget… for an unbudgeted story), drawn with Report a Problem…. The host chooses them from the engine's fields; null, or no mapper, shows the error's message.
   * @property {(spec:{name:string,source:File,recording:File,subjectOrAuthority:string,allowedUses:string,capturedAt:string,sourceDescription:string,expiresAt:string,attested:true}) => void} [onHostedClone] Adult-human replication with separate real source and provider consent recordings. The host validates, bounds and submits.
   * @property {{id:string,name:string,src:string}} [hostedCandidate] Captured candidate preview; it is never a local reference.
   * @property {(id:string) => void} [onHostedAccept] Accept and lock the provider identity after audition.
   * @property {string} [hostedStatus] Host lifecycle or unresolved-operation message.
   * @property {{ offer: import('./lib/types.js').Refusal, onFix?: (fix: import('./lib/types.js').RefusalFix) => void, onReport?: () => void } | null} [hostedRefusal] A refused creation or clone and the fixes it offers (such as Set budget… for an unbudgeted story), drawn with Report a Problem… in place of `hostedStatus`. The host chooses them from the engine's fields.
   * @property {boolean} [hostedBlocked] An unresolved operation blocks further creation.
   * @property {boolean} [hostedAccepted] Host confirmed durable acceptance.
   * @property {Result | null} [result] The latest generated clip, shared across tabs. Ignored for playback when `takes` is given: the takes column plays them.
   * @property {readonly {id: string, name: string}[]} [speakers] The engine's preset speakers, for the Preset tab (D86).
   * @property {string} [speakersReason] Why the Preset tab has no speakers, in the host's words.
   * @property {{design?: readonly string[], clone?: readonly string[], preset?: readonly string[]}} [languages] Language codes each tab offers, as the engine lists them (D88). A tab with none shows no picker.
   * @property {readonly {id: string, label: string}[]} [cloneModels] The clone models the host can run, best first (D88).
   * @property {(kind: 'design' | 'clone' | 'preset' | 'dialogue', spec: any) => void} [ongenerate] Called with the mode and its spec when a panel generates.
   * @property {readonly Mode[]} [modes] Which tabs to offer, in this order. Defaults to all three. A host that cannot serve a mode leaves it out rather than offering a tab that only refuses.
   * @property {readonly Take[]} [takes] Every audition the host kept, newest first. Given, the studio shows them beside the form (D79).
   * @property {boolean} [generating] A generation is in flight. Disables Generate. Consumer-set, never inferred.
   * @property {(save: { kind: 'design' | 'clone' | 'preset', name: string, lock: boolean }) => void} [onSave] Keep the voice under this name. `lock` is the storyteller's choice on the Design tab: true locks the voice to the chosen take, false keeps the take as a sample and the voice stays designed. Always false for a clone. Reports intent: the host saves, re-reads and says how it went.
   * @property {string} [saveReason] Why the voice cannot be kept right now, in the host's words. Disables Save and is shown under it. Blank means none.
   * @property {boolean} [saving] A save is in flight.
   * @property {string} [chosenTakeId] The take the voice will be kept from. That row shows "Chosen".
   * @property {(id: string) => void} [onChooseTake] Reports "Use this take". Without it takes cannot be chosen.
   * @property {(id: string) => void} [onRetryTake] Asks for a failed take again (D85).
   * @property {string} [progress] How far the take in flight has got, in the host's words (D87).
   * @property {string} [saveHint] One line under "Keep this voice" saying what Save keeps, in the host's words.
   * @property {LockVoice} [lockVoice] Opens the studio on this designed voice to lock it to a take (D90): the Design tab alone, its description read-only, and one Lock button in place of the name and the keep choice. `saveReason` and `saving` apply to the lock.
   * @property {{name?: string, description?: string, text?: string}} [seed] Starting values, such as a character's voice brief: the name a voice is kept under, the description on the Design tab and the hosted form, and the line the Design tab speaks. Read once on mount; key the studio to start it again.
   * @property {(takeId: string) => void} [onLock] Lock mode: lock the voice to this take, the chosen one, else the newest that plays. Reports intent: the host locks, re-reads and says how it went. For a voice already `locked` it is a change of take, which the host confirms before it makes it.
   */

  /** @type {Props} */
  let {
    hostedChoices = undefined,
    hostedChoiceId = '',
    onHostedChoice = undefined,
    onHostedDesign = undefined,
    onRefineDescription = undefined,
    refinementRefusal = undefined,
    onHostedClone = undefined,
    hostedCandidate = undefined,
    onHostedAccept = undefined,
    hostedStatus = '',
    hostedRefusal = null,
    hostedBlocked = false,
    hostedAccepted = false,
    result = null,
    ongenerate = undefined,
    modes = ALL_MODES,
    takes = undefined,
    generating = false,
    onSave = undefined,
    saveReason = '',
    saving = false,
    chosenTakeId = undefined,
    onChooseTake = undefined,
    saveHint = '',
    onRetryTake = undefined,
    progress = '',
    speakers = [],
    speakersReason = '',
    languages = {},
    cloneModels = [],
    lockVoice = undefined,
    onLock = undefined,
    seed = undefined,
  } = $props()

  const tabs = $derived(lockVoice ? /** @type {const} */ (['Design']) : modes)
  let activeTab = $state(untrack(() => lockVoice ? 'Design' : (modes[0] ?? 'Design')))
  let name = $state(untrack(() => seed?.name ?? ''))
  /** @type {{age?:string,gender?:string,languageCode?:string,regionCode?:string,accent?:string,pitch?:string,timbre?:string,persona?:string,context?:string,delivery?:string}} */
 let traits=$state({})
 let hostedDescription = $state(untrack(() => seed?.description ?? ''))
  let refining = $state(false)
  let refinementError = $state('')
  /** @type {ReturnType<NonNullable<typeof refinementRefusal>>} */
  let refinementRefused = $state(null)
  let refinementSource = $state('')
  let refinementProposal = $state(/** @type {{description:string,notes:readonly string[]} | null} */ (null))
  /** @type {AbortController | undefined} */
  let refinementController
  onDestroy(() => refinementController?.abort())

  async function refineDescription() {
    if (!onRefineDescription || refining || generating || saving || hostedCandidate) return
    const controller = new AbortController()
    refinementController = controller
    const source = hostedDescription
    refining = true
    refinementError = ''
    refinementRefused = null
    try {
      const proposal = Object.keys(traits).length ? await onRefineDescription(source, controller.signal,{...traits}) : await onRefineDescription(source,controller.signal)
      if (!controller.signal.aborted) {
        refinementSource = source
        refinementProposal = proposal
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        refinementRefused = refinementRefusal?.(error) ?? null
        if (!refinementRefused) refinementError = error instanceof Error ? error.message : String(error)
      }
    } finally {
      if (!controller.signal.aborted) refining = false
      if (refinementController === controller) refinementController = undefined
    }
  }
  let sourceRecording = $state(/** @type {File | undefined} */ (undefined))
  let consentRecording = $state(/** @type {File | undefined} */ (undefined))
  let subjectOrAuthority = $state('')
  let allowedUses = $state('')
  let capturedAt = $state('')
  let sourceDescription = $state('')
  let expiresAt = $state('')
  let humanAttestation = $state(false)
  const hostedChoice = $derived(hostedChoices?.find((choice) => choice.id === hostedChoiceId))
  const hostedConsentScope = $derived(JSON.stringify([hostedChoiceId, hostedChoice?.profile, hostedChoice?.cloneRequirements]))
  let previousHostedConsentScope
  $effect(() => {
    const scope = hostedConsentScope
    if (scope !== previousHostedConsentScope) {
      previousHostedConsentScope = scope
      humanAttestation = false
      consentRecording = undefined
    }
  })
  const canCloneHosted = $derived(Boolean(hostedChoice?.ready && onHostedClone && hostedChoice.operation === 'voice.clone' && hostedChoice.cloneRequirements && !hostedBlocked && !hostedCandidate && !generating && !saving && name.trim() && sourceRecording && consentRecording && subjectOrAuthority.trim() && allowedUses.trim() && capturedAt && sourceDescription.trim() && humanAttestation))
  const canCreateHosted = $derived(Boolean(hostedChoice?.ready && onHostedDesign && hostedChoice.operation === 'voice.design' && !hostedBlocked && !hostedCandidate && !generating && !saving && !refining && !refinementProposal && name.trim() && hostedDescription.trim()))
  // The storyteller's choice for a designed voice (operator ruling 2026-09-30, relayed): keep
  // the take as a sample and stay designed, or lock the voice to the take. Never decided for them.
  let keepAs = $state('sample')
  const KEEP_CHOICES = [
    { value: 'sample', label: 'Keep take as a sample' },
    { value: 'lock', label: 'Lock voice to the take' },
  ]
  const KEEP_HINTS = {
    sample:
      'Stays designed: each line is designed anew from the description, and the take is kept with it. It cannot be cast until it is locked.',
    lock: 'Sounds like the take on every line. The description stays on the voice.',
  }

  const workbench = $derived(takes !== undefined || Boolean(lockVoice))
  const takeList = $derived(takes ?? [])
  // In a workbench the panels keep their form and Generate, and the takes column plays
  // the clips: an empty `src` hides the panel's own player, `generating` still gates it.
  const panelResult = $derived(workbench ? { src: '', generating } : result)
  const reason = $derived(String(saveReason ?? '').trim())
  const kind = $derived(activeTab === 'Clone' ? 'clone' : activeTab === 'Preset' ? 'preset' : 'design')
  const canSave = $derived(Boolean(onSave) && !saving && !reason && name.trim() !== '' && activeTab !== 'Dialogue')

  function save(event) {
    event.preventDefault()
    if (canSave) onSave?.({ kind, name: name.trim(), lock: kind === 'design' && keepAs === 'lock' })
  }

  // Lock mode (D90). The take is the host's rule for a save: the chosen one, else the newest that plays.
  const lockTake = $derived(takeList.find((take) => take.id === chosenTakeId) ?? takeList.find((take) => take.src))
  const canLock = $derived(Boolean(onLock) && !saving && !reason && Boolean(lockTake?.src))
  const lockLabel = $derived(
    saving
      ? 'Locking…'
      : lockVoice?.locked
        ? 'Change the take…'
        : lockTake
          ? `Lock ${lockVoice?.name} to ${lockTake.label}`
          : `Lock ${lockVoice?.name}`,
  )
  const lockStatus = $derived(
    reason ||
      (!lockTake
        ? `Generate a take, then choose the one ${lockVoice?.name} should sound like.`
        : saving
          ? `Locking ${lockVoice?.name} to ${lockTake.label}…`
          : ''),
  )
  // E4, operator-ruled "Warn": the speech server designs each sentence anew, so a take of
  // several is several designs joined. Locking it is allowed; the studio says so first.
  // ponytail: Intl.Segmenter can split on an abbreviation ("Dr. Ray"), which only over-warns.
  const severalSentences = $derived(
    [...new Intl.Segmenter(undefined, { granularity: 'sentence' }).segment(lockTake?.text ?? '')].filter((part) =>
      part.segment.trim(),
    ).length > 1,
  )

  function lock(event) {
    event.preventDefault()
    if (canLock && lockTake) onLock?.(lockTake.id)
  }
</script>

{#if hostedChoices !== undefined}
  <div class="ui-voice-studio ui-voice-studio__hosted">
    <label class="ui-voice-studio__name">
      <span class="ui-voice-studio__label">Provider and model</span>
      <select value={hostedChoiceId} disabled={generating || saving || hostedBlocked || Boolean(hostedCandidate)} onchange={(event) => { onHostedChoice?.(event.currentTarget.value) }}>
        <option value="">Choose provider and model</option>
        <!-- A choice the host cannot run is listed, so its absence is not a mystery, and cannot be picked. -->
        {#each hostedChoices as choice (choice.id)}<option value={choice.id} disabled={!choice.ready}>{choice.ready ? choice.label : `${choice.label} · not available`}</option>{/each}
      </select>
    </label>
    {#if hostedChoice?.reason}<p class="ui-voice-studio__hint">{hostedChoice.reason}</p>{/if}
    <label class="ui-voice-studio__name"><span class="ui-voice-studio__label">Voice name</span><input bind:value={name} disabled={generating || saving || hostedBlocked || Boolean(hostedCandidate)} /></label>
    {#if hostedChoice?.operation === 'voice.clone'}
      <p class="ui-voice-studio__hint">Replication is for an adult human voice with a real source recording and the provider-required consent recording. Locally generated voices cannot be replicated through this action.</p>
      {#if hostedChoice.cloneRequirements}
        <p class="ui-voice-studio__hint">Source recording: {hostedChoice.cloneRequirements.sourceMinSeconds}–{hostedChoice.cloneRequirements.sourceMaxSeconds} seconds.</p>
        <p class="ui-voice-studio__hint">{hostedChoice.cloneRequirements.sourceInstructions}</p>
        <p class="ui-voice-studio__hint">{hostedChoice.cloneRequirements.consentInstructions}</p>
        <p class="ui-voice-studio__hint">Record the same speaker clearly saying this mandatory consent statement ({hostedChoice.cloneRequirements.consentLocale}):</p>
        <blockquote>{hostedChoice.cloneRequirements.consentStatement}</blockquote>
        <p class="ui-voice-studio__hint">Recording format: {hostedChoice.cloneRequirements.mimeType}, {hostedChoice.cloneRequirements.sampleRate} Hz, {hostedChoice.cloneRequirements.channels} channel, {hostedChoice.cloneRequirements.bitsPerSample} bit.</p>
        <a href={hostedChoice.cloneRequirements.documentationUrl} target="_blank" rel="noopener noreferrer">Provider recording requirements</a>
      {:else}
        <p class="ui-voice-studio__hint" role="status">Provider recording requirements are unavailable.</p>
      {/if}
      <label class="ui-voice-studio__name"><span class="ui-voice-studio__label">Adult human source recording</span><input type="file" accept="audio/wav,.wav" disabled={generating || saving || hostedBlocked || Boolean(hostedCandidate)} onchange={(event) => (sourceRecording = event.currentTarget.files?.[0])} /></label>
      {#key hostedConsentScope}
      <label class="ui-voice-studio__name"><span class="ui-voice-studio__label">Provider consent recording</span><input type="file" accept="audio/wav,.wav" disabled={generating || saving || hostedBlocked || Boolean(hostedCandidate)} onchange={(event) => (consentRecording = event.currentTarget.files?.[0])} /></label>
      {/key}
      <label class="ui-voice-studio__name"><span class="ui-voice-studio__label">Subject or authorized representative</span><input bind:value={subjectOrAuthority} /></label>
      <label class="ui-voice-studio__name"><span class="ui-voice-studio__label">Allowed uses, separated by commas</span><input bind:value={allowedUses} /></label>
      <label class="ui-voice-studio__name"><span class="ui-voice-studio__label">Consent recorded at</span><input type="datetime-local" bind:value={capturedAt} /></label>
      <label class="ui-voice-studio__name"><span class="ui-voice-studio__label">Recording source</span><input bind:value={sourceDescription} /></label>
      <label class="ui-voice-studio__name"><span class="ui-voice-studio__label">Consent expiry, optional</span><input type="datetime-local" bind:value={expiresAt} /></label>
      <Checkbox checked={humanAttestation} label="I am the adult human subject or have authority for these recordings and uses" onchange={(checked) => (humanAttestation = checked)} />
    {:else}
    <label class="ui-voice-studio__name"><span class="ui-voice-studio__label">Voice description</span><textarea bind:value={hostedDescription} disabled={generating || saving || Boolean(hostedCandidate)} rows="3"></textarea></label>
    <VoiceDesignTraits value={traits} disabled={refining||generating||saving||Boolean(hostedCandidate)} onchange={patch=>{traits={...traits,...patch};refinementProposal=null}} />
    {#if onRefineDescription}
      <section class="ui-voice-studio__refinement" aria-label="Optional voice design refinement" aria-busy={refining}>
        <div class="ui-voice-studio__refinement-actions">
          <button type="button" disabled={refining || generating || saving || Boolean(hostedCandidate)} onclick={() => void refineDescription()}>
            {refining ? 'Preparing draft…' : refinementProposal ? 'Regenerate draft' : hostedDescription.trim() ? 'Refine for voice design' : 'Generate voice description'}
          </button>
          <span class="ui-voice-studio__hint">Optional · uses your configured text model and may incur text-generation charges.</span>
        </div>
        {#if refinementProposal}
          <div class="ui-voice-studio__proposal">
            <strong>Suggested voice description</strong>
            <p>{refinementProposal.description}</p>
            {#if refinementProposal.notes.length}
              <ul>{#each refinementProposal.notes as note, i (i)}<li>{note}</li>{/each}</ul>
            {/if}
            {#if hostedDescription !== refinementSource}<p class="ui-voice-studio__hint">Your description changed while this draft was prepared. Applying it replaces the current text.</p>{/if}
            <div class="ui-voice-studio__refinement-actions">
              <button type="button" disabled={refining || generating || saving || Boolean(hostedCandidate)} onclick={() => {
                if (refinementProposal) hostedDescription = refinementProposal.description
                refinementProposal = null
                refinementError = ''; refinementRefused = null
              }}>Use this description</button>
              <button type="button" disabled={refining} onclick={() => { refinementProposal = null; refinementError = ''; refinementRefused = null }}>Keep my description</button>
            </div>
          </div>
        {/if}
        {#if refinementRefused}
          {@const refused = refinementRefused}
          <RefusalOffer offer={refused.offer} onFix={(fix) => refused.onFix?.(fix)} onReport={() => refused.onReport?.()} />
        {:else if refinementError}<p role="alert" class="ui-voice-studio__reason">{refinementError}</p>{/if}
        <span role="status" class="ui-voice-studio__hint">{refining ? 'Preparing a description. Your current text stays editable.' : refinementProposal ? 'Choose which description to use before creating a voice candidate.' : 'Review and edit the description before creating a voice candidate.'}</span>
      </section>
    {/if}
    {/if}
    <p class="ui-voice-studio__hint">The provider bills for creating a candidate, with no price limit, and keeps the voice so it can be used again.</p>
    {#if hostedChoice?.operation === 'voice.clone'}
      <button type="button" class="ui-voice-studio__save" disabled={!canCloneHosted} onclick={() => {
        if (canCloneHosted && sourceRecording && consentRecording) {
          onHostedClone?.({name:name.trim(),source:sourceRecording,recording:consentRecording,subjectOrAuthority:subjectOrAuthority.trim(),allowedUses:allowedUses.trim(),capturedAt,sourceDescription:sourceDescription.trim(),expiresAt,attested:true})
        }
      }}>Create human clone candidate</button>
    {:else}
    <button type="button" class="ui-voice-studio__save" disabled={!canCreateHosted} onclick={() => { if (canCreateHosted) { onHostedDesign?.({name:name.trim(),description:hostedDescription.trim(),...(Object.keys(traits).length?{traits:{...traits}}:{})}) } }}>Create candidate</button>
    {/if}
    {#if hostedRefusal}
      {@const refused = hostedRefusal}
      <RefusalOffer offer={refused.offer} onFix={(fix) => refused.onFix?.(fix)} onReport={() => refused.onReport?.()} />
    {:else if hostedStatus}<p class="ui-voice-studio__hint" role="status">{hostedStatus}</p>{/if}
    {#if hostedCandidate}
      <AudioPlayback src={hostedCandidate.src} label={`${hostedCandidate.name} candidate`} />
      <p class="ui-voice-studio__hint">Accepting locks this provider identity for casting and future speech. The preview remains a recording, not a clone reference.</p>
      <button type="button" class="ui-voice-studio__save" disabled={!onHostedAccept || saving || hostedAccepted || hostedBlocked} onclick={() => onHostedAccept?.(hostedCandidate.id)}>{hostedAccepted ? `Accepted ${hostedCandidate.name}` : `Accept and lock ${hostedCandidate.name}`}</button>
    {/if}
  </div>
{:else}
<div class="ui-voice-studio" data-workbench={workbench ? '' : undefined}>
  <TabsRoot value={activeTab} onValueChange={(details) => (activeTab = details.value)}>
    <TabList class="ui-voice-studio__tabs" aria-label="Voice modes">
      {#each tabs as tab (tab)}
        <TabTrigger value={tab} class="ui-voice-studio__tab">{tab}</TabTrigger>
      {/each}
    </TabList>

    <div class="ui-voice-studio__work">
      <div class="ui-voice-studio__compose">
        {#if tabs.includes('Design')}
          <TabContent value="Design" class="ui-voice-studio__body">
            <VoiceDesignPanel
              languages={languages.design ?? []}
              result={panelResult}
              instruct={lockVoice?.description ?? seed?.description ?? ''}
              text={lockVoice ? '' : (seed?.text ?? '')}
              readonlyDescription={Boolean(lockVoice)}
              ongenerate={(spec) => ongenerate?.('design', spec)} />
          </TabContent>
        {/if}
        {#if tabs.includes('Clone')}
          <TabContent value="Clone" class="ui-voice-studio__body">
            <VoiceClonePanel languages={languages.clone ?? []} models={cloneModels} result={panelResult} ongenerate={(spec) => ongenerate?.('clone', spec)} />
          </TabContent>
        {/if}
        {#if tabs.includes('Preset')}
          <TabContent value="Preset" class="ui-voice-studio__body">
            <VoicePresetPanel {speakers} {speakersReason} languages={languages.preset ?? []} result={panelResult} ongenerate={(spec) => ongenerate?.('preset', spec)} />
          </TabContent>
        {/if}
        {#if tabs.includes('Dialogue')}
          <TabContent value="Dialogue" class="ui-voice-studio__body">
            <DialogueComposer result={panelResult} ongenerate={(spec) => ongenerate?.('dialogue', spec)} />
          </TabContent>
        {/if}
      </div>

      {#if workbench}
        <section class="ui-voice-studio__takes" aria-labelledby="ui-voice-studio-takes">
          <h3 id="ui-voice-studio-takes" class="ui-voice-studio__heading">Takes</h3>
          {#if takeList.length > 0 || generating}
            {#if generating}
              <p class="ui-voice-studio__pending" role="status">
                <Icon name="waveform" /> {String(progress ?? '').trim() || 'Generating a take…'}
              </p>
            {/if}
            <TakeList takes={takeList} {generating} toolbar={false} compact chosenId={chosenTakeId} onChoose={onChooseTake} onRetry={onRetryTake} />
          {:else}
            <p class="ui-voice-studio__empty">
              Each take you generate stays here, so you can hear a description more than once and
              compare before you keep the voice.
            </p>
          {/if}
        </section>
      {/if}
    </div>

    {#if lockVoice}
      <form class="ui-voice-studio__keep" aria-label={`Lock ${lockVoice.name}`} onsubmit={lock}>
        <div class="ui-voice-studio__keep-text">
          <p class="ui-voice-studio__hint">
            Every line {lockVoice.name} speaks will sound like this take. Audition with one sentence: each sentence is designed
            anew, so a longer take can change voice partway, and the lock keeps that.
          </p>
          <p class="ui-voice-studio__hint ui-voice-studio__warning" role="status">
            {#if severalSentences && lockTake}
              <Icon name="warning" /> {lockTake.label} is more than one sentence, so it may not be one consistent voice.
            {/if}
          </p>
        </div>
        <button class="ui-voice-studio__save" type="submit" disabled={!canLock} aria-busy={saving ? 'true' : undefined}>
          <Icon name="lock" /> {lockLabel}
        </button>
        <p class="ui-voice-studio__reason" role="status">{lockStatus}</p>
      </form>
    {:else if workbench && activeTab !== 'Dialogue'}
      <form class="ui-voice-studio__keep" onsubmit={save}>
        <div class="ui-voice-studio__keep-text">
          <h3 class="ui-voice-studio__heading">Keep this voice</h3>
          <p class="ui-voice-studio__hint">
            {saveHint ||
              (kind === 'clone'
                ? 'Saves the reference clip and transcript you last generated with.'
                : kind === 'preset'
                  ? 'Saves the speaker you last generated with.'
                  : 'Saves the description you last generated with.')}
          </p>
          {#if kind === 'design'}
            <div class="ui-voice-studio__keep-as">
              <SegmentedControl
                label="How to keep the take"
                value={keepAs}
                items={KEEP_CHOICES}
                onselect={(value) => (keepAs = value)} />
              <p class="ui-voice-studio__hint">{KEEP_HINTS[keepAs]}</p>
            </div>
          {/if}
        </div>
        <label class="ui-voice-studio__name">
          <span class="ui-voice-studio__label">Name</span>
          <input
            class="ui-voice-studio__input"
            type="text"
            bind:value={name}
            placeholder="Jetta, older and tired"
            autocomplete="off"
            spellcheck="false" />
        </label>
        <button class="ui-voice-studio__save" type="submit" disabled={!canSave}>
          <Icon name="floppy-disk" /> {saving ? 'Saving…' : 'Save voice'}
        </button>
        <p class="ui-voice-studio__reason" role="status">{reason}</p>
      </form>
    {/if}
  </TabsRoot>
</div>

{/if}

<style>
  .ui-voice-studio__refinement {
    display: grid;
    gap: var(--spacing-xs);
    padding-block: var(--spacing-xs);
    border-block: 1px solid var(--border-default);
    font-size: var(--data-md-size);
    color: var(--text-secondary);
  }
  .ui-voice-studio__refinement-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-xs);
  }
  .ui-voice-studio__refinement button {
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: 3px 10px;
    background: transparent;
    color: var(--text-primary);
    font: inherit;
    cursor: pointer;
  }
  .ui-voice-studio__refinement button:disabled { color: var(--action-on-disabled); cursor: default; }
  .ui-voice-studio__refinement button:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 2px; }
  .ui-voice-studio__proposal {
    display: grid;
    gap: var(--spacing-xs);
    color: var(--text-primary);
  }
  .ui-voice-studio__proposal p, .ui-voice-studio__proposal ul { margin: 0; }
  .ui-voice-studio__proposal ul { padding-inline-start: var(--spacing-md); color: var(--text-secondary); }
  /* A desktop form: one column at reading width, fields at the data scale, and a button
     the size of its label. It was a full-width touch form. */
  .ui-voice-studio__hosted {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    max-width: 560px;
  }
  .ui-voice-studio__hosted :is(input:not([type="checkbox"]):not([type="file"]), textarea, select) {
    background: var(--surface-base);
    color: var(--text-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: 3px var(--spacing-xs);
    font: inherit;
    font-size: var(--data-md-size);
  }
  .ui-voice-studio__hosted textarea {
    resize: vertical;
  }
  .ui-voice-studio__hosted .ui-voice-studio__save {
    align-self: flex-start;
    padding: 3px 10px;
    font-size: var(--data-md-size);
  }
  .ui-voice-studio__hosted .ui-voice-studio__hint {
    margin: 0;
    font-size: var(--data-md-size);
  }
  .ui-voice-studio__hosted :is(input:not([type="checkbox"]):not([type="file"]), textarea, select):focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  :global(.ui-voice-studio__tabs) {
    display: flex;
    gap: var(--spacing-2xs);
    border-bottom: 1px solid var(--border-default);
  }

  :global(.ui-voice-studio__tab) {
    padding: 3px 10px;
    border: 0;
    background: none;
    font: inherit;
    font-size: var(--data-md-size);
    color: var(--text-secondary);
    cursor: pointer;
    border-bottom: 1px solid transparent;
    margin-bottom: -1px;
  }

  :global(.ui-voice-studio__tab:hover) {
    color: var(--text-primary);
  }

  :global(.ui-voice-studio__tab[data-selected]) {
    color: var(--text-primary);
    font-weight: 600;
    border-bottom-color: var(--action-primary);
  }

  :global(.ui-voice-studio__tab:focus-visible) {
    outline: 2px solid var(--border-focus);
    outline-offset: -2px;
  }

  :global(.ui-voice-studio__body:not([hidden])) {
    padding-top: var(--spacing-sm);
  }

  /* Workbench (D79): the form and the takes side by side, the keep bar across both. */
  .ui-voice-studio__work {
    display: block;
  }

  [data-workbench] .ui-voice-studio__work {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--spacing-lg);
    align-items: start;
  }

  .ui-voice-studio__takes {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    min-width: 0;
    padding-top: var(--spacing-sm);
  }

  .ui-voice-studio__heading {
    margin: 0;
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    font-weight: 600;
    color: var(--text-primary);
  }

  .ui-voice-studio__empty,
  .ui-voice-studio__hint,
  .ui-voice-studio__pending {
    margin: 0;
    max-width: 44ch;
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    color: var(--text-secondary);
  }

  .ui-voice-studio__warning {
    color: var(--text-primary);
  }

  .ui-voice-studio__pending {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-primary);
  }

  .ui-voice-studio__keep {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(12rem, 18rem) auto;
    grid-template-areas:
      'text name save'
      'text reason reason';
    align-items: end;
    column-gap: var(--spacing-md);
    row-gap: var(--spacing-2xs);
    margin-top: var(--spacing-xl);
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--border-hairline);
  }

  .ui-voice-studio__keep-text {
    grid-area: text;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    align-self: start;
  }

  .ui-voice-studio__keep-as {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-sm);
  }

  .ui-voice-studio__name {
    grid-area: name;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
  }

  .ui-voice-studio__label {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
  }

  .ui-voice-studio__input {
    padding: 3px var(--spacing-xs);
    font: inherit;
    font-size: var(--data-md-size);
    color: var(--text-primary);
    caret-color: var(--action-primary);
    background: var(--surface-base);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
  }

  .ui-voice-studio__input::placeholder {
    color: var(--text-secondary);
  }

  .ui-voice-studio__input:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 0;
  }

  .ui-voice-studio__save {
    grid-area: save;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: 3px 10px;
    border: 1px solid var(--action-primary-border);
    border-radius: var(--radius-sm);
    background: var(--action-primary);
    font: inherit;
    font-size: var(--data-md-size);
    font-weight: 600;
    color: var(--action-on-primary);
    cursor: pointer;
  }

  .ui-voice-studio__save:hover:not(:disabled) {
    background: var(--action-primary-pressed);
  }

  .ui-voice-studio__save:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-voice-studio__save:disabled {
    background: var(--action-disabled);
    border-color: transparent;
    color: var(--action-on-disabled);
    cursor: default;
  }

  .ui-voice-studio__reason {
    grid-area: reason;
    margin: 0;
    min-height: var(--caption-line);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    overflow-wrap: anywhere;
  }
</style>

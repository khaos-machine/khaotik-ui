<script>
  // The Voice Manager window: speak a line, your voices, the voice studio and sound, behind one
  // sidebar. Moved from Khaos App's src/ui/Voices.svelte (catalog app-coverage plan, T9). Every
  // pane stays mounted and the inactive ones are hidden, so a half-written line, a studio
  // description and a generated clip all survive a trip to another view. Which pane is open and
  // which voices are chosen are the host's, because the host opens panes too. The host renders
  // the studios themselves, VoiceStudio and SoundStudio, as snippets with their props by name.
  import AudioPlayback from './AudioPlayback.svelte'
  import VoiceBrief from './VoiceBrief.svelte'
  import Button from './Button.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import EmptyState from './EmptyState.svelte'
  import FilterField from './FilterField.svelte'
  import GenerationFailureDetails from './GenerationFailureDetails.svelte'
  import LabeledField from './LabeledField.svelte'
  import Menu from './Menu.svelte'
  import OutcomeBanner from './OutcomeBanner.svelte'
  import RefusalOffer from './RefusalOffer.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  import SourceList from './SourceList.svelte'
  import SpeechControls from './SpeechControls.svelte'
  import VoiceRow from './VoiceRow.svelte'

  /** @typedef {'profiles' | 'speak' | 'studio' | 'sound'} VoicesView */
  /** @typedef {'preset' | 'design' | 'clone'} VoiceGroup */
  /**
   * One voice as the lists show it. `group` is where it is listed: a design locked to a take is
   * still listed with the designed voices.
   * @typedef {{ id: string, name: string, language: string, source: string, notLocked: boolean, group: VoiceGroup }} VoiceChoice
   */
  /**
   * A banner the engine's outcome asks for, whichever control asked. `offer` adds the fix and
   * Report a Problem… a refusal offers.
   * @typedef {{ key: string, tone: import('svelte').ComponentProps<typeof OutcomeBanner>['tone'], title: string, detail: string, onDismiss?: () => void, offer?: import('./lib/types.js').Refusal, onFix?: (fix: import('./lib/types.js').RefusalFix) => void, onReport?: () => void }} VoicesOutcome
   */
  /**
   * The chosen voice in Your voices. `removal` is what the provider deletion last said; `remove`
   * offers deleting the provider voice, or removing a profile the provider already deleted.
   * @typedef {{ id: string, name: string, kind: string, language: string, notLocked: boolean, removal: string, remove: { deleted: boolean, disabled: boolean } | null, lock: 'lock' | 'change' | null }} OwnVoice
   */
  /** @typedef {{ kind: 'unread' } | { kind: 'failed', message: string } | { kind: 'undeclared', description: string } | { kind: 'loading' } | { kind: 'loaded' }} ListState */
  /**
   * The voice picked for a line. `hosted` is a provider voice, which bills for each request;
   * `directionReason` stands in the direction field's place for a voice that takes none.
   * @typedef {{ name: string, directionReason: string, hosted: { ready: boolean, reason: string, active: boolean } | null }} PickedVoice
   */
  /** @typedef {{ temperature: number, topK: number, topP: number, repetitionPenalty: number }} SpeechParams */
  /**
   * The voice brief a character's "Design a voice…" started the studio from.
   * @typedef {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'narrator' } | { kind: 'silent' } | { kind: 'brief', suggested: readonly { detail: string, restsOn: string }[], auditionLines: readonly { line: string, scene: string }[] }} CharacterBrief
   */
  /**
   * What the studio pane shows around the host's studio: hosted, local, or lock mode on one designed
   * voice and its states. `failure` is a hosted generation's provider evidence.
   * @typedef {{ kind: 'hosted', readError: string, failure: { generation: import('svelte').ComponentProps<typeof GenerationFailureDetails>['generation'], copy?: (text: string) => Promise<void> } | null, next: 'discard' | 'another' | null } | { kind: 'local' } | { kind: 'lock-reading', name: string } | { kind: 'lock-failed', name: string, message: string } | { kind: 'lock-not-design', name: string } | { kind: 'lock', name: string }} Studio
   */

  /**
   * @typedef {Object} Props
   * @property {VoicesView} [view] The pane shown.
   * @property {(view: VoicesView) => void} [onView] A pane was chosen in the sidebar.
   * @property {number | undefined} [voiceCount] Your voices' count in the sidebar; absent where the list is not read.
   * @property {readonly VoicesOutcome[]} [outcomes] What the engine last said, above every pane.
   * @property {{ choices: readonly { id: string, label: string }[], chosen: string, reason: string, fixed: boolean } | null} [story] The story hosted voice work is paid from (khaos-app#615): the open stories, most recent first, by path and title; the one chosen; why none can be, when no story is open; and `fixed` when the window was opened from a character, whose story it shows without a choice. Stories sharing a title are told apart by their file name. Null draws nothing.
   * @property {(id: string) => void} [onStory] Another open story was chosen to pay.
   * @property {ListState} [own] Whether Your voices can be read: undeclared shows one state and nothing else.
   * @property {readonly VoiceChoice[]} [voices] Every voice the synth lists.
   * @property {string} [ownId] The voice chosen in Your voices.
   * @property {(id: string) => void} [onOwn] A voice was chosen in Your voices.
   * @property {OwnVoice | null} [ownVoice] The chosen voice's details.
   * @property {(id: string) => void} [onRemove] Delete or remove was agreed to, after the confirmation here.
   * @property {(id: string) => void} [onLock] Lock a designed voice, or change the take it is locked to.
   * @property {ListState} [speak] Whether the synth's voices can be read for Speak a line.
   * @property {string} [emptyTitle] What Speak a line says when the synth lists no voice.
   * @property {string} [profileId] The voice picked to speak a line in.
   * @property {(id: string) => void} [onProfile] A voice was picked, here or with Speak a line in this voice.
   * @property {PickedVoice | null} [picked] The voice picked to speak a line in, or null.
   * @property {string} [line] The line to speak.
   * @property {(value: string) => void} [onLine] The line was typed.
   * @property {string} [direction] How to say it.
   * @property {(value: string) => void} [onDirection] The direction was typed.
   * @property {SpeechParams} [params] The local synth's tuning.
   * @property {(key: 'temperature' | 'top_k' | 'top_p' | 'repetition_penalty', value: number) => void} [onParam] A tuning control moved.
   * @property {boolean} [canSpeak] Whether Speak with profile can be pressed now.
   * @property {boolean} [submitted] A line is with the engine.
   * @property {boolean} [directionNotApplied] The engine did not apply the direction to this voice.
   * @property {(() => void) | undefined} [onSpeak] Speak with profile.
   * @property {{ src: string, peaks: import('svelte').ComponentProps<typeof AudioPlayback>['peaks'], peaksError: string } | null} [clip] The spoken line.
   * @property {{ name: string, brief: CharacterBrief, kept: { name: string } | null, casting: boolean, outcome: { title: string, detail: string } | null } | null} [character] Designing a voice for one character, or null.
   * @property {() => void} [onCloseCharacter] Done with designing a voice for the character.
   * @property {() => void} [onCast] Cast the character as the voice kept for them.
   * @property {boolean} [newVoiceDisabled] A provider candidate is waiting, or the studio is busy.
   * @property {() => void} [onNewVoice] Start the studio afresh.
   * @property {string | null} [source] Where the voice is made, 'local' or 'hosted'; null offers no choice.
   * @property {(value: string) => void} [onSource] Local or hosted was chosen.
   * @property {string} [lockNote] What the last lock said, in the app's words; '' for none.
   * @property {Studio} [studio] Which studio is shown, and the states around it.
   * @property {import('svelte').Snippet | undefined} [voiceStudio] The host's VoiceStudio for the studio shown.
   * @property {() => void} [onDiscardCandidate] Discard the provider candidate.
   * @property {() => void} [onAnotherCandidate] Start another provider candidate.
   * @property {{ voice: string, take: string } | null} [changingTake] Changing a locked voice's take is being asked.
   * @property {() => void} [onConfirmChange] Changing the locked take was agreed to.
   * @property {() => void} [onCancelChange] Changing the locked take was turned down.
   * @property {import('svelte').Snippet | undefined} [sound] The host's SoundStudio; absent, Sound is not offered.
   */

  /** @type {Props} */
  let {
    view = 'speak',
    onView = undefined,
    voiceCount = undefined,
    outcomes = [],
    story = null,
    onStory = undefined,
    own = { kind: 'loaded' },
    voices = [],
    ownId = '',
    onOwn = undefined,
    ownVoice = null,
    onRemove = undefined,
    onLock = undefined,
    speak = { kind: 'loaded' },
    emptyTitle = 'No voice to speak with yet',
    profileId = '',
    onProfile = undefined,
    picked = null,
    line = '',
    onLine = undefined,
    direction = '',
    onDirection = undefined,
    params = { temperature: 0.9, topK: 50, topP: 1, repetitionPenalty: 1.05 },
    onParam = undefined,
    canSpeak = false,
    submitted = false,
    directionNotApplied = false,
    onSpeak = undefined,
    clip = null,
    character = null,
    onCloseCharacter = undefined,
    onCast = undefined,
    newVoiceDisabled = false,
    onNewVoice = undefined,
    source = null,
    onSource = undefined,
    lockNote = '',
    studio = { kind: 'local' },
    voiceStudio = undefined,
    onDiscardCandidate = undefined,
    onAnotherCandidate = undefined,
    changingTake = null,
    onConfirmChange = undefined,
    onCancelChange = undefined,
    sound = undefined,
  } = $props()

  // The roster: every voice the synth lists, grouped by kind and narrowed by name. A list rather
  // than a cluster of chips, because the listing grows with every model and profile.
  /** @type {readonly { kind: VoiceGroup, label: string }[]} */
  const GROUPS = [
    { kind: 'preset', label: 'Presets' },
    { kind: 'design', label: 'Designed' },
    { kind: 'clone', label: 'Clones' },
  ]
  // Your voices: the storyteller's own kinds first.
  /** @type {readonly { kind: VoiceGroup, label: string }[]} */
  const OWN_ORDER = [
    { kind: 'design', label: 'Designed' },
    { kind: 'clone', label: 'Clones' },
    { kind: 'preset', label: 'Presets' },
  ]
  let filter = $state('')
  const shown = $derived(voices.filter((v) => v.name.toLowerCase().includes(filter.trim().toLowerCase())))
  const groups = $derived(GROUPS.map((g) => ({ ...g, voices: shown.filter((v) => v.group === g.kind) })).filter((g) => g.voices.length > 0))
  const ownGroups = $derived(OWN_ORDER.map((g) => ({ ...g, voices: voices.filter((v) => v.group === g.kind) })).filter((g) => g.voices.length > 0))

  /** @type {{ id: string, name: string, deleted: boolean } | null} */
  let removing = $state(null)

  // The voices first, then what makes them. A count only where the list itself is shown.
  const navSections = $derived([
    {
      id: 'voices',
      label: 'Voices',
      items: [
        { id: 'speak', label: 'Speak a line', icon: 'chat-text' },
        { id: 'profiles', label: 'Your voices', icon: 'user-sound', ...(voiceCount !== undefined ? { count: voiceCount } : {}) },
      ],
    },
    {
      id: 'make',
      label: 'Make',
      items: [{ id: 'studio', label: 'Voice studio', icon: 'magic-wand' }, ...(sound ? [{ id: 'sound', label: 'Sound', icon: 'music-notes' }] : [])],
    },
  ])

  /** @type {Record<'temperature' | 'top_k' | 'top_p' | 'repetition_penalty', 'temperature' | 'topK' | 'topP' | 'repetitionPenalty'>} */
  const PARAM_KEYS = { temperature: 'temperature', top_k: 'topK', top_p: 'topP', repetition_penalty: 'repetitionPenalty' }

  // Stories sharing a title are told apart by their file name (K: "titles can match across
  // projects we should display project path to differentiate").
  /** @param {string} path */
  const fileName = (path) => (path.split('/').pop() ?? path).replace(/\.kspd$/, '')
  const storyItems = $derived(
    (story?.choices ?? []).map((c, _, all) => ({
      value: c.id,
      label: all.filter((o) => o.label === c.label).length > 1 ? `${c.label} — ${fileName(c.id)}` : c.label,
    })),
  )
</script>

{#snippet roster(/** @type {readonly { kind: VoiceGroup, label: string, voices: readonly VoiceChoice[] }[]} */ list, /** @type {string} */ selected, /** @type {(id: string) => void} */ choose)}
  {#each list as group (group.kind)}
    <span class="eyebrow ui-voices__label">{group.label} · {group.voices.length}</span>
    {#each group.voices as voice (voice.id)}
      <VoiceRow
        name={voice.name}
        language={voice.language}
        source={voice.source}
        status={voice.notLocked ? 'not locked' : ''}
        selected={voice.id === selected}
        onclick={() => choose(voice.id)} />
    {/each}
  {:else}
    <p class="note">No voice matches that filter.</p>
  {/each}
{/snippet}

<main class="ui-voices">
  <div class="ui-voices__nav">
    <SourceList
      sections={navSections}
      active={view}
      onselect={(id) => onView?.(/** @type {VoicesView} */ (id))}
      label="Voice Manager views"
      uiId="voices.source" />
  </div>

  <div class="ui-voices__main">
    <!-- The story hosted voice work is paid from, for every pane that spends it. -->
    {#if story}
      <div class="ui-voices__story" data-ui-id="voices.story">
        {#if story.reason}
          <p class="note">{story.reason}</p>
        {:else}
          <span class="ui-voices__story-label">Paid from</span>
          {#if story.fixed}
            <strong>{storyItems.find((i) => i.value === story.chosen)?.label ?? ''}</strong>
          {:else}
            <Menu label="Story that pays" value={story.chosen} items={storyItems} onselect={(id) => onStory?.(id)} />
          {/if}
        {/if}
      </div>
    {/if}

    <!-- The engine's outcome, whichever control asked. -->
    {#each outcomes as outcome (outcome.key)}
      <div class="ui-voices__outcome">
        <OutcomeBanner tone={outcome.tone} title={outcome.title} detail={outcome.detail} dismissible onDismiss={() => outcome.onDismiss?.()} />
        {#if outcome.offer}
          <RefusalOffer offer={outcome.offer} onFix={(fix) => outcome.onFix?.(fix)} onReport={() => outcome.onReport?.()} />
        {/if}
      </div>
    {/each}

    <section class="ui-voices__pane ui-voices__profiles" aria-label="Your voices" hidden={view !== 'profiles'}>
      {#if own.kind === 'unread'}
        <div class="ui-voices__fill"><EmptyState title="Asking khaosd about your voices…" icon="circle-notch" /></div>
      {:else if own.kind === 'failed'}
        <div class="ui-voices__fill">
          <EmptyState title="Cannot tell whether khaosd holds your voices" description={own.message} icon="warning" />
        </div>
      {:else if own.kind === 'undeclared'}
        <!-- One state, and nothing else. No list, no pane, no note. -->
        <div class="ui-voices__fill">
          <EmptyState title="Your voices can't be shown with this khaosd" description={own.description} icon="info" />
        </div>
      {:else if speak.kind === 'loading'}
        <div class="ui-voices__fill"><EmptyState title="Reading your voices…" icon="circle-notch" /></div>
      {:else if speak.kind === 'failed'}
        <div class="ui-voices__fill"><EmptyState title="Cannot read your voices" description={speak.message} icon="warning" /></div>
      {:else if voices.length === 0}
        <div class="ui-voices__fill">
          <EmptyState
            title="No voices yet"
            description="Design or clone one in the Voice studio, and keep it. It will be listed here."
            icon="microphone-stage" />
        </div>
      {:else}
        <div class="ui-voices__split">
          <div class="ui-voices__list" role="group" aria-label="Your voices">
            {@render roster(ownGroups, ownId, (id) => onOwn?.(id))}
          </div>
          <div class="ui-voices__detail">
            {#if ownVoice}
              <h2 class="ui-voices__voice">{ownVoice.name}</h2>
              <div class="ui-voices__facts">
                <LabeledField label="Kind">{ownVoice.kind}</LabeledField>
                <LabeledField label="Language">{ownVoice.language}</LabeledField>
              </div>
              <!-- A designed voice leads to its lock. Speaking it stays, locked or not. -->
              {#if ownVoice.notLocked}
                <p class="note">
                  {ownVoice.name} is designed anew on every line, so it sounds a little different each time, and it cannot be cast. Lock it
                  to one take and every line sounds like that take.
                </p>
              {/if}
              {#if ownVoice.removal}<p class="note" role="status">{ownVoice.removal}</p>{/if}
              <div class="ui-voices__actions">
                {#if ownVoice.remove}
                  {@const remove = ownVoice.remove}
                  <Button disabled={remove.disabled} onclick={() => ownVoice && (removing = { id: ownVoice.id, name: ownVoice.name, deleted: remove.deleted })}
                    >{remove.deleted ? 'Remove deleted profile…' : 'Delete provider voice…'}</Button>
                {/if}
                {#if ownVoice.lock === 'lock'}
                  <Button onclick={() => ownVoice && onLock?.(ownVoice.id)}>Lock {ownVoice.name}…</Button>
                {:else if ownVoice.lock === 'change'}
                  <Button onclick={() => ownVoice && onLock?.(ownVoice.id)}>Change the take…</Button>
                {/if}
                <button type="button" class="ui-voices__speak" onclick={() => { if (ownVoice) { onProfile?.(ownVoice.id); onView?.('speak') } }}
                  >Speak a line in this voice</button>
              </div>
            {:else}
              <div class="ui-voices__fill"><EmptyState title="Choose a voice to see it and speak in it." icon="user-sound" /></div>
            {/if}
          </div>
        </div>
      {/if}
    </section>

    <section class="ui-voices__pane" aria-label="Speak a line" hidden={view !== 'speak'}>
      <!-- The profiles the synth reports, as it listed them. A failed or empty listing is said in
           words, never drawn as an empty picker. -->
      {#if speak.kind === 'loading'}
        <div class="ui-voices__fill"><EmptyState title="Reading the synth's voices…" icon="circle-notch" /></div>
      {:else if speak.kind === 'failed'}
        <div class="ui-voices__fill"><EmptyState title="Cannot speak by profile" description={speak.message} icon="warning" /></div>
      {:else if voices.length === 0}
        <div class="ui-voices__fill">
          <EmptyState title={emptyTitle} description="The engine lists no voice profile that its synth can voice." icon="microphone-stage" />
        </div>
      {:else}
        <div class="ui-voices__bench">
          <div class="ui-voices__voices">
            <FilterField
              value={filter}
              label="Filter voices"
              placeholder="Filter voices…"
              shown={shown.length}
              total={voices.length}
              oninput={(value) => (filter = value)} />
            <div class="ui-voices__roster" role="group" aria-label="Voice profiles">
              {@render roster(groups, profileId, (id) => onProfile?.(id))}
            </div>
          </div>
          <div class="ui-voices__take">
            {#if picked}
              <h2 class="ui-voices__voice">{picked.name}</h2>
              <label class="ui-voices__field">
                <span class="eyebrow">Line to speak</span>
                <textarea value={line} oninput={(event) => onLine?.(event.currentTarget.value)}></textarea>
              </label>
              {#if picked.directionReason}
                <p class="note">{picked.directionReason}</p>
              {:else}
                <label class="ui-voices__direction">
                  <span class="eyebrow">Direction</span>
                  <input type="text" value={direction} placeholder="quiet, furious" oninput={(event) => onDirection?.(event.currentTarget.value)} />
                </label>
              {/if}
              {#if picked.hosted}
                {#if !picked.hosted.ready}<p class="note">{picked.hosted.reason}</p>{/if}
                <p class="note">The provider bills for this speech request, with no price limit.</p>
              {:else}
                <div class="ui-voices__tuning">
                  <SpeechControls
                    temperature={params.temperature}
                    topK={params.topK}
                    topP={params.topP}
                    repetitionPenalty={params.repetitionPenalty}
                    onchange={(key, value) => onParam?.(key, value)} />
                </div>
              {/if}
              <div class="ui-voices__actions">
                <button type="button" class="ui-voices__speak" disabled={!canSpeak} onclick={() => onSpeak?.()}>Speak with profile</button>
                {#if submitted}
                  <p class="note">Submitted to the engine.</p>
                {:else if directionNotApplied}
                  <p class="note">khaosd did not apply the direction to this voice.</p>
                {/if}
              </div>
              {#if clip}
                <AudioPlayback src={clip.src} label="Generated speech" peaks={clip.peaks} peaksError={clip.peaksError} />
              {/if}
            {:else}
              <div class="ui-voices__fill"><EmptyState title="Choose a voice to speak a line." icon="microphone-stage" /></div>
            {/if}
          </div>
        </div>
      {/if}
    </section>

    {#if sound}
      <section class="ui-voices__pane" aria-label="Sound" hidden={view !== 'sound'}>
        <div class="ui-voices__studio">{@render sound()}</div>
      </section>
    {/if}

    <ConfirmDialog
      open={removing !== null}
      action={removing?.deleted ? 'Remove the deleted voice profile' : 'Delete the provider voice'}
      target={removing?.name ?? ''}
      description={removing?.deleted
        ? 'This removes the suite profile whose provider identity has already been confirmed deleted.'
        : 'This removes the reusable identity at the provider and blocks future speech in every project using it. A failed or uncertain deletion remains unresolved.'}
      confirmLabel={removing?.deleted ? 'Remove deleted profile' : 'Delete provider voice'}
      onConfirm={() => { const target = removing; removing = null; if (target) onRemove?.(target.id) }}
      onCancel={() => (removing = null)}
      onOpenChange={(open) => { if (!open) removing = null }} />

    <section class="ui-voices__pane" aria-label="Voice studio" hidden={view !== 'studio'}>
      <div class="ui-voices__studio">
        <div class="ui-voices__for-head"><h2>Voice studio</h2><Button disabled={newVoiceDisabled} onclick={() => onNewVoice?.()}>New voice</Button></div>
        {#if character && !studio.kind.startsWith('lock')}
          {@const who = character.name}
          <div class="ui-voices__for" data-ui-id="voices.studio.for-character">
            <div class="ui-voices__for-head">
              <h2 class="eyebrow">Designing a voice for {who}</h2>
              <Button variant="text" onclick={() => onCloseCharacter?.()}>Done</Button>
            </div>
            {#if character.brief.kind === 'loading'}
              <p class="note">Reading {who}'s analysis…</p>
            {:else if character.brief.kind === 'failed'}
              <p class="note" role="alert">{character.brief.message}</p>
            {:else if character.brief.kind === 'narrator'}
              <p class="note">Create the voice that reads this story’s action and scene description. Generate a draft from the story context, or write your own direction.</p>
            {:else if character.brief.kind === 'silent'}
              <p class="note">{who} has no lines, so there is nothing to design a voice from.</p>
            {:else}
              <p class="note">Started from {who}'s character analysis: what the script states, and one of {who}'s lines.</p>
              <!-- The description and the first line are in the studio's own fields, so the brief shows the rest. -->
              <VoiceBrief name={who} read={{ kind: 'ready', brief: { speaks: true, description: '', auditionLines: character.brief.auditionLines, suggested: character.brief.suggested } }} description={false} linesFrom={1} />
            {/if}
            {#if character.kept}
              <div class="ui-voices__for-cast">
                <Button variant="primary" disabled={character.casting} onclick={() => onCast?.()}>Cast {who} as {character.kept.name}</Button>
              </div>
            {/if}
            {#if character.outcome}
              <p class="note" role="status"><strong>{character.outcome.title}.</strong> {character.outcome.detail}</p>
            {/if}
          </div>
        {/if}
        {#if source !== null}
          <div class="ui-voices__source">
            <SegmentedControl
              label="Where the voice is made"
              value={source}
              items={[{ value: 'local', label: 'Local voices' }, { value: 'hosted', label: 'Hosted voices' }]}
              onselect={(value) => onSource?.(value)} />
          </div>
        {/if}
        {#if studio.kind === 'hosted'}
          {#if studio.readError}<p class="note" role="alert">{studio.readError}</p>{/if}
          {@render voiceStudio?.()}
          {#if studio.failure}<GenerationFailureDetails generation={studio.failure.generation} copy={studio.failure.copy} />{/if}
          {#if studio.next === 'discard'}
            <Button onclick={() => onDiscardCandidate?.()}>Discard provider candidate</Button>
          {:else if studio.next === 'another'}
            <Button onclick={() => onAnotherCandidate?.()}>Start another candidate</Button>
          {/if}
        {:else}
          {#if lockNote}
            <!-- The app's words, no code and no warning sign; the re-read listing decides. -->
            <p class="note" role="status">{lockNote}</p>
          {/if}
          {#if studio.kind === 'lock-reading'}
            <EmptyState title={`Reading ${studio.name}…`} icon="circle-notch" />
          {:else if studio.kind === 'lock-failed'}
            <EmptyState title={`${studio.name} could not be read`} description={studio.message} icon="warning" />
          {:else if studio.kind === 'lock-not-design'}
            <EmptyState title={`${studio.name} is not a designed voice, so there is nothing to lock.`} icon="info" />
          {:else if studio.kind === 'lock'}
            {@render voiceStudio?.()}
            <ConfirmDialog
              open={changingTake !== null}
              action="Change the take"
              target={`${studio.name} is locked to`}
              description={`${studio.name} will sound like ${changingTake?.take ?? ''} on every line, in every project cast with it. The take it is locked to now is replaced, and it cannot be brought back.`}
              confirmLabel={`Lock to ${changingTake?.take ?? ''}`}
              onConfirm={() => onConfirmChange?.()}
              onCancel={() => onCancelChange?.()}
              onOpenChange={(open) => { if (!open) onCancelChange?.() }} />
          {:else}
            {@render voiceStudio?.()}
          {/if}
        {/if}
      </div>
    </section>
  </div>
</main>

<style>
  /* The character a voice is being designed for: a quiet header above the studio. */
  .ui-voices__for {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    padding-bottom: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--border-hairline);
    font-size: var(--data-md-size);
  }
  .ui-voices__for-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .ui-voices__for-head .eyebrow {
    margin: 0;
  }
  .ui-voices__for-cast {
    padding-top: var(--spacing-xs);
  }

  /* A window, not a page: the frame is the viewport and only a pane's own content scrolls. */
  .ui-voices {
    height: 100vh;
    display: grid;
    /* 200px: the project window's source list. */
    grid-template-columns: 200px minmax(0, 1fr);
    overflow: hidden;
    background: var(--surface-base);
    color: var(--text-primary);
    scrollbar-color: var(--border-default) transparent;
    scrollbar-width: thin;
  }

  .ui-voices__nav {
    min-height: 0;
    padding: var(--spacing-xs) 0;
    background: var(--surface-raised);
    border-right: 1px solid var(--border-hairline);
    overflow-y: auto;
  }

  .ui-voices__main {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .ui-voices__outcome {
    padding: var(--spacing-md) var(--spacing-xl) 0;
  }

  .ui-voices__story {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-xl);
    border-bottom: 1px solid var(--border-hairline);
  }

  .ui-voices__story .note {
    margin: 0;
  }

  .ui-voices__story-label {
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .ui-voices__pane {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--spacing-sm) var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .ui-voices__pane[hidden] {
    display: none;
  }

  /* A state with nothing beside it sits in the middle of the pane, not at the top of a page. */
  .ui-voices__fill {
    flex: 1;
    display: grid;
    place-content: center;
  }

  .ui-voices__split {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 340px minmax(0, 1fr);
    gap: var(--spacing-md);
  }

  .ui-voices__list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .ui-voices__detail {
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding-left: var(--spacing-md);
    border-left: 1px solid var(--border-hairline);
  }

  .ui-voices__facts {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .ui-voices__bench {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 340px minmax(0, 1fr);
    gap: var(--spacing-md);
  }

  .ui-voices__voices {
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .ui-voices__roster {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .ui-voices__label {
    padding: var(--spacing-xs) var(--spacing-xs) var(--spacing-2xs);
  }

  .ui-voices__source {
    align-self: flex-start;
  }

  .ui-voices__take {
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding-left: var(--spacing-md);
    border-left: 1px solid var(--border-hairline);
  }

  /* The selected voice's name: a pane title at the data scale, not a page heading. */
  .ui-voices__voice {
    margin: 0;
    font-size: var(--data-md-size);
    font-weight: 600;
  }

  .ui-voices__direction {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    max-width: 460px;
  }

  .ui-voices__direction input {
    font: inherit;
    color: var(--text-primary);
    caret-color: var(--action-primary);
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: 3px var(--spacing-xs);
    font-size: var(--data-md-size);
  }

  .ui-voices__direction input::placeholder {
    color: var(--text-secondary);
  }

  .ui-voices__direction input:focus-visible {
    outline: none;
    border-color: var(--border-focus);
  }

  .ui-voices__tuning {
    max-width: 460px;
  }

  .ui-voices__field {
    height: 96px;
    max-width: 640px;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .ui-voices__field textarea {
    flex: 1;
    resize: none;
    font: inherit;
    color: var(--text-primary);
    caret-color: var(--action-primary);
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: var(--spacing-xs);
    font-size: var(--data-md-size);
  }

  .ui-voices__field textarea:focus-visible {
    outline: none;
    border-color: var(--border-focus);
  }

  .ui-voices__actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .ui-voices__speak {
    font: inherit;
    font-size: var(--data-md-size);
    font-weight: 600;
    padding: 3px 10px;
    color: var(--action-on-primary);
    background: var(--action-primary);
    border: 1px solid var(--action-primary-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .ui-voices__speak:active {
    background: var(--action-primary-pressed);
  }

  .ui-voices__speak:disabled {
    color: var(--action-on-disabled);
    background: var(--action-disabled);
    border-color: transparent;
    cursor: default;
  }

  .ui-voices__speak:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-voices__studio {
    max-width: 1080px;
  }
</style>

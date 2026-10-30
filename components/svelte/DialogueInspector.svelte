<script>
  // The Line inspector: the line's text in its own block, then Speaker, Scene (a way to the
  // scene) and Position; then its Takes, with Generate the pane's one primary command, a
  // direction field only where the cast voice takes one, and the refusal, progress, billing
  // note and Lock paths. Selection drives it: there is no Close, and Esc reports a dismissal.
  //
  // The host owns the voice preview; this takes its state as values and reports intent. No
  // per-take charge ask: the story budget admits paid work (K: "Budget is consent").
  import Button from './Button.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import RefusalOffer from './RefusalOffer.svelte'
  import TakeList from './TakeList.svelte'

  /**
   * @typedef {Object} DialogueLine
   * @property {string} element_id The line's element id.
   * @property {string} text The line.
   * @property {string} [parenthetical] Its direction.
   * @property {string} scene_id Its scene's id.
   * @property {string} scene_slugline Its scene's heading.
   */

  /**
   * @typedef {Object} Props
   * @property {DialogueLine} [line] The line being inspected.
   * @property {string} [speaker] The speaker's name.
   * @property {{ n: number, of: number } | null} [position] Where it sits among its speaker's lines in the scene; null when unknown.
   * @property {boolean} [takesOffered] Whether this line can be voiced here. Without it there is no Takes section.
   * @property {readonly any[]} [takes] The line's takes, as TakeList takes them.
   * @property {boolean} [generating] A take of this line is in flight.
   * @property {string} [refusal] Why this line cannot be spoken now; empty when it can.
   * @property {string} [directionReason] Why the cast voice takes no direction; empty when it takes one.
   * @property {string} [progress] How far the take in flight has got.
   * @property {string} [billedBy] The provider that bills for a take ("Gemini TTS"); empty when the voice runs on this machine.
   * @property {readonly { voiceProfileId: string, voiceName?: string }[]} [lockVoices] Voices a refusal says are not locked. Each gets a Lock button when `onLockVoice` is given.
   * @property {import('./lib/types.js').Refusal | null} [offer] A refused take's fixes.
   * @property {() => void} [onDismiss] Reports Esc.
   * @property {(sceneId: string) => void} [onOpenScene] Reports the scene to show.
   * @property {(direction: string) => void} [onTake] Reports Generate, with the direction.
   * @property {(takeId: string) => void} [onRetry] Reports a retried take.
   * @property {(voiceProfileId: string) => void} [onLockVoice] Reports a voice to lock.
   * @property {(fix: any) => void} [onFix] Reports a refusal fix.
   * @property {() => void} [onReport] Reports Report a Problem….
   */

  /** @type {Props} */
  let {
    line = { element_id: '', text: '', scene_id: '', scene_slugline: '' }, speaker = '', position = null,
    takesOffered = false, takes = [], generating = false, refusal = '', directionReason = '', progress = '', billedBy = '',
    lockVoices = [], offer = null,
    onDismiss = undefined, onOpenScene = undefined, onTake = undefined, onRetry = undefined, onLockVoice = undefined, onFix = undefined, onReport = undefined,
  } = $props()

  /** Esc deselects, unless a dialog, menu or list box open above has the key. */
  function escape(event) {
    if (event.key !== 'Escape' || event.defaultPrevented) return
    const target = event.target instanceof Element ? event.target : null
    if (target?.closest('[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]')) return
    onDismiss?.()
  }
</script>

<svelte:window onkeydown={escape} />

<InspectorSection title="Line" uiId="story.inspector.line">
  <div class="line__text">
    {#if line.parenthetical}<p class="line__direction">{line.parenthetical}</p>{/if}
    <p class="line__words">{line.text}</p>
  </div>
  <PropertyRow label="Speaker" value={speaker} />
  <PropertyRow label="Scene">
    <Button variant="text" onclick={() => onOpenScene?.(line.scene_id)}>{line.scene_slugline}</Button>
  </PropertyRow>
  {#if position}<PropertyRow label="Position" value="{position.n} of {position.of} in this scene" />{/if}
</InspectorSection>

{#if takesOffered}
  <!-- Each take is kept beside the others, so a line can be heard with one direction and
       then another. -->
  <InspectorSection title="Takes" count={takes.length} uiId="story.inspector.takes">
    <TakeList
      compact
      {takes}
      {generating}
      disabledReason={refusal}
      directionLabel={directionReason ? '' : 'Direction'}
      {progress}
      onGenerate={(direction) => onTake?.(direction)}
      onRetry={(id) => onRetry?.(id)} />
    {#if billedBy && !refusal}<p class="line__note">This voice runs on {billedBy}, which bills for each take with no price limit.</p>{/if}
    <!-- No direction field for a voice whose engine takes none; this says why. -->
    {#if directionReason && !refusal}<p class="line__note">{directionReason}</p>{/if}
    {#if onLockVoice && lockVoices.length}
      <div class="line__actions">
        {#each lockVoices as voice (voice.voiceProfileId)}
          <Button variant="secondary" onclick={() => onLockVoice?.(voice.voiceProfileId)}>Lock {voice.voiceName || voice.voiceProfileId}…</Button>
        {/each}
      </div>
    {/if}
    {#if offer}
      <RefusalOffer {offer} onFix={(fix) => onFix?.(fix)} onReport={() => onReport?.()} />
    {/if}
  </InspectorSection>
{/if}

<style>
  .line__text {
    margin: 0 0 var(--spacing-xs);
    min-width: 0;
  }
  .line__direction {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--caption-size);
    font-style: italic;
  }
  .line__words {
    margin: 0;
    font-size: var(--body-md-size);
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .line__note {
    margin: var(--spacing-2xs) 0 0;
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
  .line__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-xs);
  }
</style>

<script>
  // Whether a reading can start: the inspected scene's line, then the whole story under "All
  // scenes", collapsed, with only the voices that need attention (khaos.machine
  // docs/designs/2026-10-24-stage3-analysis-display.md, item 3). Every count is the engine's, as
  // sent. Read-only but for Lock voice…, Recast… and Download models…, which the host answers. A
  // voice blocked from rendering (khaos-manager#1091) is shown above the collapsed section, with
  // its action, so the block is never hidden. An engine that does not serve the
  // route draws nothing, so the panel is exactly what it was.
  import Button from './Button.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import OutcomeBanner from './OutcomeBanner.svelte'

  /**
   * @typedef {Object} SceneReadiness
   * @property {string} sceneId
   * @property {boolean} ready
   * @property {string} [refusal] The engine's reason, verbatim; present exactly when not ready.
   * @property {number} lines
   * @property {number} newHosted
   * @property {number} newLocal
   * @property {number} reused
   */

  /**
   * @typedef {Object} VoiceReadiness
   * @property {string} voiceProfileId
   * @property {string} name
   * @property {boolean} [narrator] Absent when false: khaosd omits it.
   * @property {boolean} locked
   * @property {boolean} providerAvailable
   * @property {string} [problem] Why the voice cannot be used, verbatim.
   * @property {RenderBlock} [blocked] Why the voice cannot render on this Mac (khaos-manager#1091).
   */

  /**
   * A model a voice needs that is not on this Mac, by its Settings › Models id.
   * @typedef {{ id: string, name: string, repoId: string }} MissingModel
   */

  /**
   * What stops a voice rendering, as khaosd sends it (internal/api/casting_voice.go): its engine
   * is not enabled (`VOICE_ENGINE_NOT_ENABLED`), or its models are not downloaded (`MODELS_MISSING`).
   * @typedef {{ code: string, message: string, models?: readonly MissingModel[] }} RenderBlock
   */

  /**
   * @typedef {{ scenes: readonly SceneReadiness[], totals: { scenes: number, ready: number, refused: number, lines: number, newHosted: number, newLocal: number, reused: number }, voices: readonly VoiceReadiness[], modelsMissing?: readonly MissingModel[] | null }} Readiness
   */

  /**
   * @typedef {{ kind: 'loading' } | { kind: 'loaded', readiness: Readiness } | { kind: 'failed', message: string } | { kind: 'unserved' }} ReadingReadinessRead
   */

  /**
   * @typedef {Object} Props
   * @property {ReadingReadinessRead} [readiness] The engine's readiness read; `unserved` when the engine has no such route.
   * @property {string} [sceneId] The inspected scene.
   * @property {boolean} [advanced] Adds the on-this-Mac and already-made counts.
   * @property {(voiceProfileId: string) => void} [onLockVoice] Asked to lock an unlocked voice.
   * @property {(voiceProfileId: string, narrator: boolean) => void} [onRecast] Asked to recast a voice whose engine is not enabled.
   * @property {() => void} [onDownloadModels] Asked to download the models the story's voices need.
   */

  /** @type {Props} */
  let { readiness = { kind: 'loading' }, sceneId = '', advanced = false, onLockVoice = undefined, onRecast = undefined, onDownloadModels = undefined } = $props()

  const loaded = $derived(readiness.kind === 'loaded' ? readiness.readiness : null)
  const scene = $derived(loaded?.scenes.find((s) => s.sceneId === sceneId))
  // A voice whose engine is not enabled needs a recast: an action, so it is shown with the
  // models' download above the collapsed section rather than inside it.
  const recast = $derived(loaded?.voices.filter((v) => v.blocked?.code === 'VOICE_ENGINE_NOT_ENABLED') ?? [])
  const attention = $derived(loaded?.voices.filter((v) => !recast.includes(v) && (!v.locked || !v.providerAvailable || v.blocked)) ?? [])
  // Every missing model, once: the story's list, and any a blocked voice names. Go sends a nil
  // list as null. One Download models… covers them all, so no voice repeats it.
  const missing = $derived.by(() => {
    const byId = new Map()
    for (const m of [...(loaded?.modelsMissing ?? []), ...(loaded?.voices ?? []).flatMap((v) => (v.blocked?.code === 'MODELS_MISSING' ? (v.blocked.models ?? []) : []))]) byId.set(m.id, m)
    return [...byId.values()]
  })
  const modelsBlock = $derived(missing.length > 0 || !!loaded?.voices.some((v) => v.blocked?.code === 'MODELS_MISSING'))

  /** @param {VoiceReadiness} voice */
  const said = (voice) =>
    voice.blocked ? `${voice.name}: ${voice.blocked.message}` : voice.problem ? `${voice.name}: ${voice.problem}` : !voice.locked ? `${voice.name} isn't locked yet.` : voice.name

  /** @param {number} n */
  const count = (n) => n.toLocaleString()
</script>

{#if readiness.kind === 'loading'}
  <p class="ui-readiness__line">Checking this story's voices…</p>
{:else if readiness.kind === 'failed'}
  <p class="ui-readiness__line">Khaos couldn't check whether this scene is ready to read.</p>
{:else if loaded}
  <div class="ui-readiness" data-ui-id="readings.readiness">
    {#if scene?.ready}
      <p class="ui-readiness__line">
        Ready to read. {count(scene.lines)} lines: {count(scene.newHosted)} new with your hosted voices.{advanced ? ` · ${count(scene.newLocal)} new on this Mac · ${count(scene.reused)} already made` : ''}
      </p>
    {:else if scene}
      <OutcomeBanner tone="error" title="This scene can't be read yet." detail={scene.refusal} dismissible={false} />
    {/if}
    {#if modelsBlock}
      <div class="ui-readiness__action" data-ui-id="readings.readiness.models">
        <p class="ui-readiness__line">
          {missing.length ? `Voice models aren't on this Mac yet: ${missing.map((m) => m.name).join(', ')}.` : "Voice models aren't on this Mac yet."}
        </p>
        <Button onclick={() => onDownloadModels?.()}>Download models…</Button>
      </div>
    {/if}
    {#if recast.length}
      <ul class="ui-readiness__voices" data-ui-id="readings.readiness.recast">
        {#each recast as voice (voice.voiceProfileId)}
          <li>
            <span>{said(voice)}</span>
            <Button onclick={() => onRecast?.(voice.voiceProfileId, !!voice.narrator)}>Recast…</Button>
          </li>
        {/each}
      </ul>
    {/if}
    <InspectorSection title="All scenes" collapsed uiId="readings.readiness.all">
      <p class="ui-readiness__line">{count(loaded.totals.ready)} of {count(loaded.totals.scenes)} scenes are ready to read. {count(loaded.totals.lines)} lines in all.</p>
      {#if loaded.totals.refused > 0}<p class="ui-readiness__line">{count(loaded.totals.refused)} scenes can't be read yet.</p>{/if}
      {#if attention.length}
        <p class="ui-readiness__heading">Voices that need attention</p>
        <ul class="ui-readiness__voices">
          {#each attention as voice (voice.voiceProfileId)}
            <li>
              <span>{said(voice)}</span>
              {#if !voice.locked}<Button variant="text" onclick={() => onLockVoice?.(voice.voiceProfileId)}>Lock voice…</Button>{/if}
            </li>
          {/each}
        </ul>
      {:else}
        <p class="ui-readiness__line">All {count(loaded.voices.length)} voices are ready.</p>
      {/if}
    </InspectorSection>
  </div>
{/if}

<style>
  .ui-readiness {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  .ui-readiness__line {
    margin: 0;
    padding: var(--spacing-xs) 0;
    color: var(--text-secondary);
    font-size: var(--body-md-size);
  }
  .ui-readiness__action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }
  .ui-readiness__heading {
    margin: var(--spacing-sm) 0 var(--spacing-xs);
    color: var(--text-primary);
    font-size: var(--label-sm-size);
    font-weight: 600;
  }
  .ui-readiness__voices {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: var(--body-md-size);
    color: var(--text-secondary);
  }
  .ui-readiness__voices li {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }
</style>

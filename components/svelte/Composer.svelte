<script>
  // The Composer: one part of the shot workspace, as the player places it. `stage` draws the shot
  // under the playhead in its `view`: `previs`, the 3D previs of its blocking, or `rendered`, its
  // frame; `planning` the scene's shot planner; `scene` the planner as the scene's
  // inspector, with timing review; `tools` the shot inspector, with timing review, the image
  // filtering choice and progress. Every child's props are the host's, from its composer model,
  // passed whole. Moved from Khaos App (catalog app-coverage plan, T7).
  import { fade } from 'svelte/transition'
  import PictureTimingReview from './PictureTimingReview.svelte'
  import SceneShotPlanner from './SceneShotPlanner.svelte'
  import ShotInspector from './ShotInspector.svelte'
  import ShotPreview from './ShotPreview.svelte'
  import ShotPrevis from './ShotPrevis.svelte'

  /**
   * @typedef {Object} Props
   * @property {'stage' | 'tools' | 'planning' | 'scene'} [part] Which part to draw.
   * @property {'previs' | 'rendered'} [view] How the stage draws the shot under the playhead: `previs`, its 3D previs, or `rendered`, its frame.
   * @property {Record<string, any> | null} [timing] PictureTimingReview's props, for `scene` and `tools`.
   * @property {{ key: string, shot: any, imageUrl?: string, review?: string, event?: { label: string, text: string } | null } | null} [stage] The shot under the playhead and its frame, for the `rendered` view; null draws nothing.
   * @property {{ shot: import('./lib/shot-scene.js').PrevisShot | null, definition: import('./lib/place-plan.js').PlaceDefinition | null, place: Uint8Array | null, figures: Record<string, Uint8Array>, objects: Record<string, Uint8Array>, oncamera?: (camera: import('./lib/shot-scene.js').ShotCamera) => void, onload?: (names: string[]) => void } | null} [previs] ShotPrevis's props, for the `previs` view: the shot under the playhead from the scene's previs read, and the scene's models; null draws nothing.
   * @property {Record<string, any> | null} [planner] SceneShotPlanner's props, for `planning` and `scene`.
   * @property {Record<string, any> | null} [inspector] ShotInspector's props, for `tools`.
   * @property {{ value: 'auto' | 'low', disabled?: boolean, onchange?: (value: 'auto' | 'low') => void } | null} [moderation] The image filtering choice, for `tools`.
   * @property {string} [phase] What a running operation is doing, or ''.
   */

  /** @type {Props} */
  let { part = 'stage', view = 'previs', timing = null, stage = null, planner = null, inspector = null, moderation = null, phase = '', previs = null } = $props()

  const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const shotTransition = reducedMotion ? 0 : 240
</script>

{#if (part === 'scene' || part === 'tools') && timing}
  <PictureTimingReview {...timing} />
{/if}
{#if part === 'stage' && view === 'previs'}
  {#if previs}
    <div class="ui-composer__stage">
      <ShotPrevis
        shot={previs.shot}
        definition={previs.definition}
        place={previs.place}
        figures={previs.figures}
        objects={previs.objects}
        oncamera={previs.oncamera}
        onload={previs.onload}
      />
    </div>
  {/if}
{:else if part === 'stage'}
  {#if stage}
    {#key stage.key}<div class="ui-composer__stage" transition:fade={{ duration: shotTransition }}>
        <ShotPreview shot={stage.shot} imageUrl={stage.imageUrl ?? ''} review={stage.review ?? ''} event={stage.event ?? null} />
      </div>{/key}
  {/if}
{:else if (part === 'planning' || part === 'scene') && planner}
  <SceneShotPlanner {...planner} />
{:else if part === 'tools'}
  {#if moderation}
    <div class="ui-composer__settings">
      <label
        >OpenAI filtering<select
          aria-label="OpenAI image filtering"
          value={moderation.value}
          disabled={moderation.disabled}
          onchange={(event) => {
            const value = event.currentTarget.value
            if (value === 'auto' || value === 'low') moderation.onchange?.(value)
          }}><option value="auto">Standard</option><option value="low">Less restrictive</option></select
        ></label>
      <small>Fictional film context accompanies each request. OpenAI’s content policies still apply.</small>
    </div>
  {/if}
  {#if phase}<div class="ui-composer__progress" role="status" aria-live="polite">{phase}</div>{/if}
  {#if inspector}<ShotInspector {...inspector} />{/if}
{/if}

<style>
  .ui-composer__settings {
    padding: 4px 10px;
    border-bottom: 1px solid var(--border-hairline);
    font-size: 12px;
  }
  .ui-composer__settings label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .ui-composer__settings select {
    max-width: 58%;
    font: inherit;
    color: inherit;
    background: transparent;
    border: 1px solid var(--border-hairline);
    border-radius: 2px;
    padding: 2px 4px;
    height: 24px;
  }
  .ui-composer__settings small {
    display: block;
    margin-top: 3px;
    font-size: 11px;
    line-height: 1.35;
    color: var(--text-secondary);
  }
  .ui-composer__progress {
    padding: 8px 12px;
    font-size: 12px;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-hairline);
  }
  .ui-composer__stage {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    isolation: isolate;
    overflow: hidden;
  }
</style>

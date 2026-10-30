<script>
  import Button from './Button.svelte'
  import Icon from './Icon.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  import SceneShotSequence from './internal/SceneShotSequence.svelte'
  import ContextualDialog from './internal/ContextualDialog.svelte'
  import { tick } from 'svelte'
  /** @typedef {{title:string,intent:string,direction:string,framing:string,startMs:number,durationMs:number,continuity:string,beatIndices:readonly number[],sourceEventIds:readonly string[],proposals:readonly string[]}} PlannedShot */
  /** @typedef {{title?:string,intent?:string,direction?:string,framing?:string,startMs?:number,durationMs?:number,continuity?:string}} ShotEdit */
  /**
   * @typedef {Object} Props
   * @property {{summary:string,warnings:readonly string[],shots:readonly PlannedShot[]}|null} [plan] Reviewable engine proposal.
   * @property {string} [brief] Storyteller’s planning direction.
   * @property {'rough_blocking'|'detailed_pencil'} [style] Drawing treatment for future frames.
   * @property {boolean} [busy] A request is pending.
   * @property {boolean} [disabled] Planning is unavailable.
   * @property {number} [beatCount] Number of scene analysis beats.
   * @property {string} [phase] Visible request progress.
   * @property {string} [error] Preserved request failure.
   * @property {(value:string)=>void} [onbrief] Edit planning direction.
   * @property {(value:'rough_blocking'|'detailed_pencil')=>void} [onstyle] Choose drawing treatment.
   * @property {()=>void} [onplan] Request a new proposal.
   * @property {()=>void|Promise<void>} [onapply] Save proposed shots without images. Resolve after the host updates the plan or error.
   * @property {()=>void} [ondiscard] Discard this proposal.
   * @property {(index:number,patch:ShotEdit)=>void} [onchange] Edit a proposed shot.
   * @property {readonly import('./lib/shot-coverage.js').CoverageItem[]} [coverage] Existing shots and host-reported frame readiness.
   * @property {string} [selectedShotId] Intentional selection, independent of playback.
   * @property {string} [activeShotId] Shot at the playhead.
   * @property {(id:string)=>void} [onselect] Inspect an existing shot; does not seek.
   * @property {string} [sceneLabel] Context named by the planning workspace.
   * @property {boolean} [modal] Keep the panel compact and open planning in a focused workspace.
   * @property {string} [unavailableReason] Why the host cannot start planning.
  * @property {boolean} [inspector] Show scene properties and render tools instead of the coverage list.
 * @property {{location:string,timing:string,duration:string,characters:readonly string[],references:readonly string[]}|null} [sceneInfo] Host-projected scene facts.
 * @property {{running:boolean,total:number,completed:number,stopping:boolean,error:string}|null} [batch] Scene generation progress.
 * @property {boolean} [generationReady] Image generation is available.
 * @property {string} [generationReason] Why image generation is blocked.
 * @property {{missing:readonly {id:string,title:string}[],all:readonly {id:string,title:string}[]}|null} [frameQueue] Host-resolved shots per generation mode; null while the host is resolving them.
 * @property {(mode:'all'|'missing',shotIds:readonly string[])=>void} [ongeneratescene] Explicitly generate the confirmed scene queue, with the ids the dialog listed.
 * @property {()=>void} [onstopgeneration] Stop after the current frame.
 * @property {()=>void} [onreadings] Open this scene's readings.
 * @property {()=>void} [ondata] Open this scene in the data view.
 * @property {()=>void} [onopen] Freeze the host's playback context before opening planning.
   */
  /** @type {Props} */
  let {plan=null,brief='',style='detailed_pencil',busy=false,disabled=false,beatCount=0,phase='',error='',onbrief=undefined,onstyle=undefined,onplan=undefined,onapply=undefined,ondiscard=undefined,onchange=undefined,coverage=[],selectedShotId='',activeShotId='',onselect=undefined,sceneLabel='',modal=false,unavailableReason='',onopen=undefined,inspector=false,sceneInfo=null,batch=null,generationReady=false,generationReason='',frameQueue=null,ongeneratescene=undefined,onstopgeneration=undefined,onreadings=undefined,ondata=undefined}=$props()
  let expanded=$state(0)
  let planningOpen=$state(false)
  let generationOpen=$state(false)
  let renderMode=$state('missing')
  const renderQueue=$derived(frameQueue?(renderMode==='all'?frameQueue.all:frameQueue.missing):[])
  const renderCount=$derived(renderQueue.length)
  const frameNoun=$derived(renderCount===1?'frame':'frames')
  const renderGate=$derived(batch?.running?'Scene generation is running.':disabled?unavailableReason||'Wait for the current operation.':!generationReady?generationReason||'Choose an image connection in Settings.':!coverage.length?'Plan or add shots before generating frames.':'')
  const id=$props.id()
  const blockedReason=$derived(busy?'Shot planning is running.':disabled?unavailableReason||'Planning is not available for this scene.':'')
  /** @type {HTMLElement|null} */
  let opener=null
  /** @param {MouseEvent} event */
  function openPlanning(event){opener=event.currentTarget instanceof HTMLElement?event.currentTarget:null;onopen?.();planningOpen=true}
  const editIndex=$derived(plan?.shots[expanded]?expanded:0)
  async function apply(){await onapply?.();await tick();if(!plan&&!error)planningOpen=false}
  function discard(){ondiscard?.();planningOpen=false}
</script>

{#snippet shotEditor(/** @type {PlannedShot} */ shot,/** @type {number} */ index)}
<fieldset disabled={busy}>
              <label>Shot name<input aria-label={`Planned shot ${index+1} name`} value={shot.title} oninput={event=>onchange?.(index,{title:event.currentTarget.value})} /></label>
              <p class="scene-plan__intent">{shot.intent}</p>
              <label>Visual direction<textarea aria-label={`Planned shot ${index+1} direction`} rows="6" value={shot.direction} oninput={event=>onchange?.(index,{direction:event.currentTarget.value})}></textarea></label>
              <label>Framing<select aria-label={`Planned shot ${index+1} framing`} value={shot.framing} onchange={event=>onchange?.(index,{framing:event.currentTarget.value})}>{#if !['Wide shot','Medium shot','Close-up','Detail insert','Over the shoulder'].includes(shot.framing)}<option value={shot.framing}>{shot.framing}</option>{/if}<option>Wide shot</option><option>Medium shot</option><option>Close-up</option><option>Detail insert</option><option>Over the shoulder</option></select></label>
              <div class="scene-plan__timing"><label>Start · seconds<input aria-label={`Planned shot ${index+1} starts`} type="number" min="0" step="0.1" value={shot.startMs/1000} onchange={event=>onchange?.(index,{startMs:Math.round(Number(event.currentTarget.value)*1000)})} /></label><label>Hold · seconds<input aria-label={`Planned shot ${index+1} hold`} type="number" min="0.1" step="0.1" value={shot.durationMs/1000} onchange={event=>onchange?.(index,{durationMs:Math.round(Number(event.currentTarget.value)*1000)})} /></label></div>
              <details><summary>Continuity and source</summary><label>Continuity<textarea aria-label={`Planned shot ${index+1} continuity`} rows="3" value={shot.continuity} oninput={event=>onchange?.(index,{continuity:event.currentTarget.value})}></textarea></label><small>Analysis beats {shot.beatIndices.map(beat=>beat+1).join(', ')||'—'} · {shot.sourceEventIds.length} source events</small>{#each shot.proposals as proposal,i (i)}<p class="scene-plan__note">{proposal}</p>{/each}</details>
            </fieldset>
{/snippet}

{#snippet planningContent()}
<section class="scene-plan" class:workspace={modal} aria-label="Scene shot planning" aria-busy={busy}>
  <div class="scene-plan__heading"><span>Scene coverage</span><span>{beatCount} analysis beats</span></div>
  {#if error}<p class="scene-plan__error" role="alert">{error}</p>{:else if phase}<p class="scene-plan__note" role="status">{phase}</p>{/if}
  {#if !plan}
    <p>Plan this scene’s shots from its script and analysis. Review the timing and direction before adding them to the picture track.</p>
    <details><summary>Direct the plan</summary><label>Creative direction<textarea aria-label="Scene planning direction" rows="3" value={brief} disabled={busy} oninput={event=>onbrief?.(event.currentTarget.value)} placeholder="Coverage, pacing or moments you want to emphasize…"></textarea></label></details>
    <Button variant="primary" disabled={busy||disabled} describedby={blockedReason?`${id}-blocked`:undefined} onclick={()=>onplan?.()}><Icon name={busy?'circle-notch':'sparkle'} />{busy?'Planning scene shots…':'Plan scene shots'}</Button>
    {#if blockedReason}<small id="{id}-blocked">{blockedReason}</small>{/if}
    <small>Uses your text AI connection. Images are generated separately.</small>
  {:else}
    <div class="scene-plan__result"><strong>{plan.shots.length} proposed shots</strong><p>{plan.summary}</p></div>
    {#each plan.warnings as warning,index (index)}<p class="scene-plan__warning">{warning}</p>{/each}
    <p class="scene-plan__note">Suggested cuts · adjust to the reading. Existing shots are preserved.</p>
    {#if modal}
      <div class="scene-plan__workspace">
        <ol class="scene-plan__shots" aria-label="Proposed shots">
          {#each plan.shots as shot,index (index)}
            <li><button class="scene-plan__shot" class:current={editIndex===index} type="button" aria-pressed={editIndex===index} onclick={()=>expanded=index}><span class="scene-plan__number">{index+1}</span><span><strong>{shot.title}</strong><small>{shot.framing} · {(shot.startMs/1000).toFixed(1)}–{((shot.startMs+shot.durationMs)/1000).toFixed(1)}s</small></span></button></li>
          {/each}
        </ol>
        <div class="scene-plan__editor">{#if plan.shots[editIndex]}{@render shotEditor(plan.shots[editIndex],editIndex)}{/if}</div>
      </div>
    {:else}
    <ol class="scene-plan__shots">
      {#each plan.shots as shot,index (index)}
        <li class:expanded={expanded===index}>
          <button class="scene-plan__shot" type="button" aria-expanded={expanded===index} onclick={()=>expanded=expanded===index?-1:index}>
            <span class="scene-plan__number">{index+1}</span><span><strong>{shot.title}</strong><small>{shot.framing} · {(shot.startMs/1000).toFixed(1)}–{((shot.startMs+shot.durationMs)/1000).toFixed(1)}s</small></span><Icon name={expanded===index?'caret-up':'caret-down'} />
          </button>
          {#if expanded===index}
            {@render shotEditor(shot,index)}
          {/if}
        </li>
      {/each}
    </ol>
    {/if}
    <SegmentedControl label="Planned frame drawing style" value={style} items={[{value:'rough_blocking',label:'Rough'},{value:'detailed_pencil',label:'Pencil'}]} onselect={value=>{if(value==='rough_blocking'||value==='detailed_pencil')onstyle?.(value)}} />
    <div class="scene-plan__actions"><Button variant="primary" disabled={busy||!plan.shots.length} onclick={()=>void apply()}>{busy?'Applying shots…':'Apply shots'}</Button><Button disabled={busy} onclick={discard}>Discard plan</Button></div>
    <small>Apply saves the shot data. It does not generate images.</small>
  {/if}
</section>
{/snippet}

{#if modal}
  <section class="scene-coverage" aria-label="Scene coverage">
    {#if inspector}
      <header class="ui-scene-shot-planner__properties"><span class="scene-coverage__note">Selected scene</span><h3>{sceneLabel}</h3></header>
      {#if sceneInfo}<dl class="ui-scene-shot-planner__facts"><div><dt>Location</dt><dd>{sceneInfo.location||'Not set'}</dd></div><div><dt>Duration</dt><dd>{sceneInfo.duration}</dd></div><div><dt>Timing</dt><dd>{sceneInfo.timing}</dd></div><div><dt>Coverage</dt><dd>{coverage.length} shots · {beatCount} beats</dd></div></dl>{/if}
      <div class="ui-scene-shot-planner__tools"><Button variant="tool" icon="queue" onclick={openPlanning}>{plan?'Review planned shots…':busy?'Planning progress…':'Plan scene shots…'}</Button><Button variant="tool" icon="sparkle" disabled={!!renderGate} title={renderGate||'Generate frames for this scene'} onclick={()=>{onopen?.();generationOpen=true}}>Generate scene frames…</Button></div>
      {#if renderGate}<p class="scene-coverage__note">{renderGate}</p>{/if}
      {#if sceneInfo?.characters.length}<details open><summary>Cast · {sceneInfo.characters.length}</summary><p>{sceneInfo.characters.join(', ')}</p></details>{/if}
      {#if sceneInfo?.references.length}<details><summary>Current references · {sceneInfo.references.length}</summary><ul>{#each sceneInfo.references as name,i (i)}<li>{name}</li>{/each}</ul></details>{/if}
      <div class="ui-scene-shot-planner__tools"><Button variant="tool" icon="waveform" onclick={()=>onreadings?.()}>Manage readings</Button><Button variant="tool" icon="table" onclick={()=>ondata?.()}>Open in Data</Button></div>
    {:else}
    <div class="scene-coverage__heading"><strong>{coverage.length} {coverage.length===1?'shot':'shots'}</strong><Button variant="tool" icon="queue" onclick={openPlanning}>{plan?'Review planned shots…':busy?'Planning progress…':'Plan scene shots…'}</Button></div>
    {#if coverage.length}<SceneShotSequence items={coverage} selectedId={selectedShotId} activeId={activeShotId} {onselect} />
    {:else}<p class="scene-coverage__note">Plan a timed sequence or add shots at the playhead. Frames can be generated afterward.</p>{/if}
    {/if}
    {#if !planningOpen}
      {#if error}<p class="scene-plan__error" role="alert">{error}</p>{:else if phase}<p class="scene-coverage__note" role="status">{phase}</p>{/if}
    {/if}
  </section>
  {#if batch}<div class="ui-scene-shot-planner__batch" role="status"><strong>{batch.running?'Generating scene frames':batch.stopping?'Scene generation stopped':batch.error?'Scene generation stopped':'Scene frames complete'}</strong><span>{batch.completed} of {batch.total} saved for review</span>{#if batch.error}<p role="alert">{batch.error}</p>{/if}{#if batch.running}<Button variant="tool" icon="stop" disabled={batch.stopping} onclick={()=>onstopgeneration?.()}>{batch.stopping?'Stopping after this frame…':'Stop after current frame'}</Button>{/if}</div>{/if}
  <ContextualDialog open={generationOpen} title="Generate scene frames" target={sceneLabel} closeLabel="Close scene generation" onclose={()=>generationOpen=false}>
    <div class="ui-scene-shot-planner__generation">
      <p>Generate one frame per shot using its direction and current references. Existing artwork is kept. Review and choose the results separately.</p>
      <SegmentedControl label="Frames to generate" value={renderMode} items={[{value:'missing',label:'Missing frames'},{value:'all',label:'All shots'}]} onselect={value=>{renderMode=value}} />
      {#if frameQueue}<ol>{#each renderQueue as shot (shot.id)}<li>{shot.title}</li>{/each}</ol>
      <p>{renderCount} {frameNoun}, generated one at a time. Stops on the first failure, without automatic retries.</p>{:else}<p role="status">Checking which shots need frames…</p>{/if}
      <Button variant="primary" icon="sparkle" disabled={!frameQueue||!renderCount||!!renderGate} onclick={()=>{if(frameQueue&&(renderMode==='all'||renderMode==='missing')){ongeneratescene?.(renderMode,renderQueue.map(shot=>shot.id));generationOpen=false}}}>{frameQueue?`Generate ${renderCount} ${frameNoun}`:'Generate frames'}</Button>
    </div>
  </ContextualDialog>
  <ContextualDialog returnFocus={()=>opener} open={planningOpen} target={sceneLabel} onclose={()=>planningOpen=false}>{@render planningContent()}</ContextualDialog>
{:else}{@render planningContent()}{/if}
<style>
  .ui-scene-shot-planner__properties h3 {font-size:var(--data-lg-size,14px);line-height:1.5;margin:4px 0 8px;}
  .ui-scene-shot-planner__facts {margin:0;display:grid;gap:6px;font-size:12px;padding-bottom:12px;border-bottom:1px solid var(--border-hairline);}
  .ui-scene-shot-planner__facts>div {display:flex;justify-content:space-between;gap:12px;}
  .ui-scene-shot-planner__facts dt {color:var(--text-secondary);}.ui-scene-shot-planner__facts dd {margin:0;text-align:right;}
  .ui-scene-shot-planner__tools {display:flex;flex-wrap:wrap;gap:6px;}
  .ui-scene-shot-planner__generation,.ui-scene-shot-planner__batch {display:flex;flex-direction:column;gap:12px;}
  .ui-scene-shot-planner__generation ol {max-height:240px;overflow:auto;font-size:12px;line-height:1.8;}
  .ui-scene-shot-planner__batch {padding:10px 0;border-top:1px solid var(--border-hairline);font-size:12px;}

  .scene-plan__workspace {display:grid;grid-template-columns:minmax(180px,1fr) minmax(0,2fr);gap:var(--spacing-md);min-height:0;}
  .scene-plan__editor {min-width:0;}
  .scene-plan__shot.current {background:color-mix(in oklab,var(--text-primary) 8%,transparent);}
  .scene-plan.workspace {border-bottom:0;padding-bottom:0;}
  @media(max-width:620px) {.scene-plan__workspace {grid-template-columns:1fr;}}
  @container viewport (max-width:620px){.scene-plan__workspace {grid-template-columns:1fr;}}
  .scene-coverage {display:flex;flex-direction:column;gap:var(--spacing-xs);}
  .scene-coverage__heading {display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-xs);font-size:var(--data-md-size);}
  .scene-coverage__note {margin:0;font-size:var(--caption-size);line-height:1.5;color:var(--text-secondary);}
  .scene-plan {display:flex;flex-direction:column;gap:12px;padding-bottom:18px;border-bottom:1px solid var(--border-default);color:var(--text-primary)}
  .scene-plan__heading {display:flex;justify-content:space-between;gap:10px;font-size:11px;color:var(--text-secondary)}
  p {margin:0;font-size:12px;line-height:1.65} small,.scene-plan__note {font-size:11px;line-height:1.6;color:var(--text-secondary)}
  label {display:flex;flex-direction:column;gap:6px;font-size:11px;color:var(--text-secondary)}
  input,textarea,select {box-sizing:border-box;width:100%;padding:7px 8px;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:color-mix(in srgb,var(--surface-base) 45%,transparent);color:var(--text-primary);font:inherit;font-size:12px;line-height:1.6}
  textarea {resize:vertical} summary {cursor:pointer;font-size:11px;color:var(--text-secondary);padding:5px 0} details label {margin-top:8px}
  input:focus-visible,textarea:focus-visible,select:focus-visible,button:focus-visible {outline:2px solid var(--border-focus);outline-offset:2px}
  .scene-plan__result {display:flex;flex-direction:column;gap:8px}.scene-plan__result strong {font-size:16px;font-weight:500}
  .scene-plan__shots {list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:5px}.scene-plan__shots>li {border:1px solid var(--border-hairline);border-radius:var(--radius-sm)}
  .scene-plan__shots>li.expanded {border-color:var(--border-default)}
  .scene-plan__shot {display:flex;align-items:center;gap:10px;width:100%;padding:10px 8px;background:transparent;border:0;text-align:left;color:inherit;cursor:pointer}.scene-plan__shot>span:nth-child(2) {flex:1;min-width:0}.scene-plan__shot strong {display:block;font-size:12px;font-weight:500}.scene-plan__shot small {display:block;font-size:10px}
  .scene-plan__number {font-size:11px;color:var(--text-secondary);font-variant-numeric:tabular-nums}.scene-plan__intent {font-size:11px;color:var(--text-secondary)}
  fieldset {display:flex;flex-direction:column;gap:11px;border:0;padding:2px 10px 12px;margin:0;min-width:0}.scene-plan__timing {display:grid;grid-template-columns:1fr 1fr;gap:10px}.scene-plan__actions {display:flex;gap:8px}.scene-plan__error {color:var(--tone-danger);white-space:pre-wrap;overflow-wrap:anywhere}.scene-plan__warning {color:var(--text-secondary)}
</style>

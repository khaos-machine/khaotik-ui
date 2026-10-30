<script>
  import ProjectReferencePicker from './internal/ProjectReferencePicker.svelte'
  import ContextualDialog from './internal/ContextualDialog.svelte'
  import Button from './Button.svelte'
  import GenerationSteps from './internal/GenerationSteps.svelte'
  import Icon from './Icon.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  /**
   * @typedef {Object} Frame
   * @property {string} id Stable frame identity.
   * @property {string} url Resolved image URL.
   * @property {'ready'|'loading'|'failed'|'missing'} [imageState] Host media readiness.
   * @property {'unreviewed'|'reviewed'|'rejected'} review Explicit review state.
   * @property {boolean} [canChoose] Engine eligibility for a new playback choice.
   */
  /**
   * @typedef {Object} Shot
   * @property {string} id Stable shot identity.
   * @property {string} title Authored shot name.
   * @property {string} direction Authored visual direction.
   * @property {'rough_blocking'|'detailed_pencil'} style Drawing treatment, independent of provider quality.
   * @property {string} framing Authored camera framing.
   * @property {number|null} start Resolved composition seconds; null when unresolved.
   * @property {number} hold Authored duration in seconds.
   * @property {string} timingStatus Engine timing resolution status.
   * @property {string} sourceText Source event supplied by the engine.
   * @property {readonly Frame[]} frames Candidate images in creation order.
   * @property {string} chosenId Explicit playback choice.
   * @property {readonly string[]} [warnings] Engine explanations about saved source, read or appearance lineage.
   */
  /**
   * @typedef {Object} ShotEdits
   * @property {string} [title] Edited shot name.
   * @property {string} [direction] Edited direction.
   * @property {'rough_blocking'|'detailed_pencil'} [style] Edited treatment.
   * @property {string} [framing] Edited framing.
   * @property {number} [start] Edited composition start in seconds.
   * @property {number} [hold] Edited duration in seconds.
   */
  /**
   * @typedef {Object} Props
   * @property {()=>void} [onreviewopen] Pause the host context before full-frame review.
   * @property {string} [sceneLabel] Scene context for the selected shot.
   * @property {readonly {id:string,title:string}[]} [reviewShots] Ordered shots with frames in the current scene.
   * @property {(id:string)=>void} [onreviewshot] Select a shot while keeping the review open.
   * @property {readonly {id:string,label:string,subjectName?:string,subject?:{kind:string},roles?:readonly string[]}[]} [projectReferences] Available project designs for explicit attachment.
   * @property {Record<string,string>} [referenceImages] Loaded project image previews by reference ID.
   * @property {(id:string)=>void} [oninspectreference] Load a project reference for inspection.
   * @property {(id:string,role:string)=>void} [onaddreference] Add the chosen reference to the shot draft.
   * @property {boolean} [reviewWorkspace] Open full-frame review in a contextual workspace.
   * @property {Shot|null} [shot] Controlled authored shot; null shows the start action.
   * @property {string} [previewId] Candidate being inspected, separate from playback choice.
   * @property {readonly {referenceId:string,name:string,visibility:string,purpose?:string,imageUrl?:string,imageState?:'ready'|'loading'|'failed'|'missing'}[]} [references] Exact engine reference inventory.
   * @property {readonly string[]} [beats] Engine-provided scene analysis beats.
   * @property {readonly {id:string,text:string,kind:string}[]} [events] Engine source inventory for an authored shot.
   * @property {string} [sourceEventId] Selected source event.
   * @property {(id:string)=>void} [onsource] Explicit source selection.
   * @property {boolean} [deletePending] Show explicit deletion confirmation.
   * @property {(action:'insertBefore'|'insertAfter'|'split'|'delete')=>void} [onaction] Picture edit intent.
   * @property {()=>void} [ondeleteconfirm] Remove the shot after confirmation.
   * @property {()=>void} [ondeletecancel] Keep the shot.
   * @property {boolean} [approveOnUse] Host records approval and selection together when Use is activated.
   * @property {boolean} [generating] Only frame preparation/generation is running.
   * @property {string} [generationPhase] Status of that generation, never an unrelated command.
   * @property {boolean} [busy] A command is in flight; prevents duplicate actions.
   * @property {boolean} [canAdd] Source context is loaded for adding a shot.
   * @property {boolean} [dirty] Authored edits need saving before generation.
   * @property {boolean} [generationReady] Engine provider readiness.
   * @property {string} [generationReason] Engine readiness explanation.
   * @property {string} [phase] Current operation status.
   * @property {string} [error] Preserved command failure detail.
   * @property {string} [errorDetails] Exact engine error category and detail.
   * @property {{operation:string,httpStatus:number,message?:string,responseBody?:string,requestId?:string,truncated:boolean,expiresAt:string}|null} [diagnostic] Retained redacted provider evidence; the host owns expiry.
   * @property {string} [correction] Requested change to the previewed frame.
   * @property {readonly {id:string,label:string}[]} [recoverableJobs] Completed jobs awaiting explicit publication.
   * @property {(patch:ShotEdits)=>void} [onchange] Authored edits; host owns the draft.
   * @property {()=>void} [onadd] Add a shot at the playhead.
   * @property {(id:string,visibility:'visible'|'offscreen'|'omit')=>void} [onreference] Edit explicit reference visibility or omit it.
   * @property {boolean} [canUpdateReferences] New chosen designs are available for this shot.
   * @property {()=>void} [oncurrentreferences] Explicitly update the shot's saved image inputs.
   * @property {()=>void} [onplace] Place a shot with unresolved timing at the playhead.
   * @property {()=>void} [onsave] Persist the authored direction and placement.
   * @property {(id:string)=>void} [onpreview] Inspect a candidate without choosing it.
   * @property {(state:'reviewed'|'rejected')=>void} [onreview] Explicitly review the previewed frame.
   * @property {()=>void} [onchoose] Choose the reviewed frame for playback.
   * @property {(value:string)=>void} [oncorrection] Edit the correction instruction.
   * @property {()=>void} [ongenerate] Request one frame; never implicitly retries.
   * @property {(id:string)=>void} [onrecover] Publish an already completed job without generation.
   */
  /** @type {Props} */
  let {reviewShots=[],onreviewshot=undefined,projectReferences=[],referenceImages={},oninspectreference=undefined,onaddreference=undefined,reviewWorkspace=false,sceneLabel='',onreviewopen=undefined,approveOnUse=false,generating=false,generationPhase='',events=[],sourceEventId='',onsource=undefined,deletePending=false,onaction=undefined,ondeleteconfirm=undefined,ondeletecancel=undefined,shot=null,previewId='',references=[],beats=[],busy=false,canAdd=true,dirty=false,generationReady=false,generationReason='',phase='',error='',errorDetails='',diagnostic=null,correction='',recoverableJobs=[],onchange=undefined,onadd=undefined,onreference=undefined,canUpdateReferences=false,oncurrentreferences=undefined,onplace=undefined,onsave=undefined,onpreview=undefined,onreview=undefined,onchoose=undefined,oncorrection=undefined,ongenerate=undefined,onrecover=undefined}=$props()
  let referencePickerOpen=$state(false)
  const reviewIndex=$derived(reviewShots.findIndex(item=>item.id===shot?.id))
  const navigationBlocked=$derived(busy||dirty||!!correction.trim())
  function navigateReview(index){const next=reviewShots[index];if(!next||navigationBlocked)return;revising=false;onreviewshot?.(next.id)}
  let reviewOpen=$state(false)
  let revising=$state(false)
  let failedPreview=$state('')
  /** @type {HTMLElement|null} */
  let reviewOpener=null
  /** @param {MouseEvent} event */
  function openReview(event){reviewOpener=event.currentTarget instanceof HTMLElement?event.currentTarget:null;onreviewopen?.();revising=!!correction.trim();reviewOpen=true}
  const uid=$props.id()
  const preview=$derived(shot?.frames.find(frame=>frame.id===previewId)??null)
  const step=$derived(!shot||!shot.direction.trim()||!shot.title.trim()?'direct':generating||dirty||correction.trim()||!preview||preview.review==='rejected'||(preview.review==='reviewed'&&preview.canChoose===false&&preview.id!==shot.chosenId)?'generate':preview.id===shot.chosenId?'use':'review')
  const generationGate=$derived(busy?(generating?generationPhase||'Generating frame…':'Wait for the current operation to finish.'):!shot?.title.trim()?'Give this shot a name.':!shot?.direction.trim()?'Describe what the frame should show.':shot.start===null?'Place this shot on the timeline first.':!generationReady?generationReason||'Choose an image connection in Settings.':'')
  const revisionGate=$derived(!preview?'Choose a frame to revise.':!correction.trim()&&!busy?'Describe what should change.':generationGate)
  const useGate=$derived(busy?'Wait for the current operation to finish.':dirty?'Generate a frame for the edited direction before using it.':!preview?'Choose a frame to review.':preview.review==='rejected'?'Choose another frame or generate a correction.':preview.id===shot?.chosenId?'This frame is used in playback.':preview.review==='unreviewed'&&!approveOnUse?'Approve this frame before using it.':preview.review==='reviewed'&&preview.canChoose===false?'This frame is not available for the current shot direction.':'')

</script>

{#snippet correctionField()}
      <label>Refine this frame<textarea aria-label="Frame correction" rows="2" value={correction} disabled={busy} oninput={event=>oncorrection?.(event.currentTarget.value)} placeholder="Describe what should change…"></textarea></label>
{/snippet}

{#snippet generationControls(/** @type {string} */ scope)}
    <section class="ui-shot__render" aria-label="Frame generation">
    <Button variant={scope==='revision'&&!!correction.trim()||step==='direct'||step==='generate'?'primary':'secondary'} describedby={`${uid}-${scope}-generation-reason`} disabled={!!(scope==='revision'?revisionGate:generationGate)} onclick={()=>ongenerate?.()}><Icon name="sparkle" />{generating?generationPhase||'Generating frame…':scope==='revision'||correction.trim()&&preview?'Generate correction':'Generate frame'}</Button>
    <p class="ui-shot__muted" id={`${uid}-${scope}-generation-reason`}>{(scope==='revision'?revisionGate:generationGate)||(dirty?'Your direction edits will be saved first.':'Creates a new frame for review.')}</p>

    </section>
{/snippet}

{#snippet frameVersions()}
{#if shot}      <div class="ui-shot__versions" aria-label="Frame versions">{#each shot.frames as candidate,index (candidate.id)}<button type="button" aria-pressed={candidate.id===previewId} aria-label={`Frame ${index+1} · ${candidate.id===shot.chosenId?'In playback':candidate.review==='unreviewed'?'Needs review':candidate.review==='rejected'?'Rejected':'Approved'}`} class:ui-shot__chosen={candidate.id===shot.chosenId} class:ui-shot__preview={candidate.id===previewId} disabled={busy} onclick={()=>onpreview?.(candidate.id)} title={`Frame ${index+1} · ${candidate.review}`}><span class="ui-shot__thumbnail">{#if candidate.url}<img src={candidate.url} alt={`Frame ${index+1}`} />{:else}<Icon name={candidate.imageState==='failed'?'warning':'circle-notch'} /><small>{candidate.imageState==='failed'?'Image unavailable':candidate.imageState==='missing'?'No image':'Loading image…'}</small>{/if}</span><span>{index+1}{candidate.id===shot.chosenId?' · chosen':''}</span></button>{/each}</div>
{/if}
{/snippet}

{#snippet reviewActions()}
      <div class="ui-shot__review-actions"><Button disabled={busy||!preview||preview.review==='rejected'} onclick={()=>onreview?.('rejected')}>Reject</Button><Button disabled={busy||!preview||preview.review==='reviewed'} onclick={()=>onreview?.('reviewed')}>Approve</Button><Button variant={(step==='review'||step==='use')&&!(reviewWorkspace&&revising&&correction.trim())?'primary':'secondary'} title={useGate||'Approve and use this frame in playback'} describedby={`${uid}-use-reason`} disabled={!!useGate} onclick={()=>onchoose?.()}>Use frame</Button></div>
      <p class="ui-shot__muted" id={`${uid}-use-reason`}>{useGate|| (approveOnUse?'Approves this frame and uses it in playback.':'Uses this frame in playback.')}</p>

{/snippet}

{#snippet providerDetails()}
  {#if diagnostic||errorDetails}
    <details class="ui-shot__diagnostic"><summary>Provider details</summary>
      {#if errorDetails}<pre>{errorDetails}</pre>{/if}
      {#if diagnostic}
        <p>HTTP {diagnostic.httpStatus} · {diagnostic.operation}</p>
        {#if diagnostic.message}<p>{diagnostic.message}</p>{/if}
        {#if diagnostic.responseBody}<pre>{diagnostic.responseBody}</pre>{/if}
        {#if diagnostic.truncated}<p>The retained response was truncated.</p>{/if}
        {#if diagnostic.requestId}<p>Request ID: {diagnostic.requestId}</p>{/if}
        <p>Evidence expires: {diagnostic.expiresAt}</p>
      {/if}
    </details>
  {/if}
{/snippet}

<div class="ui-shot" class:ui-shot--compact={reviewWorkspace} aria-busy={busy}>
  <GenerationSteps {step} />
  <div class="ui-shot__tool-intro"><span><Icon name="film-strip" /> Shot</span>{#if reviewWorkspace&&shot?.frames.length}<Button variant="tool" icon="arrows-out" onclick={openReview}>Review frames…</Button>{/if}<Button variant="tool" title="Add shot at playhead" onclick={()=>onadd?.()} disabled={busy||!canAdd}><Icon name="plus" /> Add shot</Button></div>
  {#if recoverableJobs.length}
    <details><summary>Frames awaiting publication</summary>
      {#each recoverableJobs as job (job.id)}<Button disabled={busy} onclick={()=>onrecover?.(job.id)}>{job.label}</Button>{/each}
    </details>
  {/if}
  {#if shot}
    {#if deletePending}<div class="ui-shot__delete-confirm" role="group" aria-label="Delete shot confirmation"><strong>Delete {shot.title}?</strong><p>The shot leaves the picture track. Its frame history is retained.</p><div class="ui-shot__review-actions"><Button disabled={busy} onclick={()=>ondeletecancel?.()}>Cancel</Button><Button disabled={busy||dirty} onclick={()=>ondeleteconfirm?.()}>Delete shot</Button></div></div>{/if}
    {#if shot.id&&onaction}<div class="ui-shot__edit-actions"><Button disabled={busy||dirty} onclick={()=>onaction?.('insertBefore')}>Insert before</Button><Button disabled={busy||dirty} onclick={()=>onaction?.('insertAfter')}>Insert after</Button><Button disabled={busy||dirty} onclick={()=>onaction?.('split')}><Icon name="scissors" />Split</Button><Button variant="text" disabled={busy||dirty} onclick={()=>onaction?.('delete')}><Icon name="trash" />Delete</Button></div>{/if}
    {#each shot.warnings??[] as warning,index (index)}<p class="ui-shot__warning">{warning}</p>{/each}
    <fieldset disabled={busy}>
      <label class="ui-shot__title-field">Shot name<input aria-label="Shot name" value={shot.title} oninput={event=>onchange?.({title:event.currentTarget.value})} /></label>
      <fieldset class="ui-shot__property-section"><legend><Icon name="timer" /> Timing</legend>
      <div class="ui-shot__range"><label>Starts<input aria-label="Shot starts at seconds" type="number" min="0" step="0.1" value={shot.start??''} disabled={shot.start===null} onchange={event=>onchange?.({start:Number(event.currentTarget.value)})} /></label><label>Hold · seconds<input aria-label="Shot hold in seconds" type="number" min="0.1" step="0.1" value={shot.hold} onchange={event=>onchange?.({hold:Number(event.currentTarget.value)})} /></label></div>
      {#if shot.timingStatus!=='resolved'}<p class="ui-shot__warning">Resolve this shot’s timing for the current reading.</p><Button onclick={()=>onplace?.()}>Place at playhead</Button>{/if}
      </fieldset>
      <fieldset class="ui-shot__property-section"><legend><Icon name="camera" /> Camera &amp; direction</legend>
      <label>Direction<textarea aria-label="Shot direction" rows={reviewWorkspace?4:5} value={shot.direction} oninput={event=>onchange?.({direction:event.currentTarget.value})} placeholder="What should we see and feel in this shot?"></textarea></label>
      <div class="ui-shot__camera-row"><label>Framing<select aria-label="Shot framing" value={shot.framing} onchange={event=>onchange?.({framing:event.currentTarget.value})}>{#if !['Wide shot','Medium shot','Close-up','Detail insert','Over the shoulder'].includes(shot.framing)}<option value={shot.framing}>{shot.framing}</option>{/if}<option>Wide shot</option><option>Medium shot</option><option>Close-up</option><option>Detail insert</option><option>Over the shoulder</option></select></label>
      <div class="ui-shot__treatment"><span>Treatment</span><SegmentedControl label="Frame drawing style" value={shot.style} items={[{value:'rough_blocking',label:'Rough'},{value:'detailed_pencil',label:'Pencil'}]} onselect={value=>{if(value==='rough_blocking'||value==='detailed_pencil')onchange?.({style:value})}} /></div></div>
      </fieldset>
      <div class="ui-shot__save"><span>{dirty?'Unsaved changes':'Saved direction'}</span><Button icon="floppy-disk" disabled={!dirty||!shot.direction.trim()||!shot.title.trim()} onclick={()=>onsave?.()}>Save shot</Button></div>
    </fieldset>
    <details><summary>Source and analysis</summary>
      {#if onsource&&events.length}<label>Source event<select aria-label="Shot source event" value={sourceEventId} disabled={busy} onchange={event=>onsource?.(event.currentTarget.value)}><option value="">Choose source event…</option>{#each events as event (event.id)}<option value={event.id}>{event.kind} · {event.text}</option>{/each}</select></label>{/if}
      <p class="ui-shot__source">{shot.sourceText}</p>
      <p class="ui-shot__muted">{beats.length} analysis beats available</p>
      <ol class="ui-shot__beats">{#each beats as beat,index (index)}<li>{beat}</li>{/each}</ol>
    </details>
    {#if references.length||canUpdateReferences||onaddreference}<section class="ui-shot__property-section" aria-label="Shot references"><h3><Icon name="identification-card" /> References <span>{references.length}</span></h3>{#if onaddreference}<Button variant="tool" icon="plus" disabled={busy} onclick={()=>referencePickerOpen=true}>Add reference…</Button>{/if}{#if canUpdateReferences}<Button variant="secondary" icon="arrows-clockwise" disabled={busy} onclick={()=>oncurrentreferences?.()}>Use current designs</Button><p class="ui-shot__muted">Updates this shot’s character, place and prop inputs. Previous frames are kept.</p>{/if}
      {#each references as reference (reference.referenceId)}
        <div class="ui-shot__reference">
          <div class="ui-shot__reference-image">{#if reference.imageUrl&&reference.imageState==='ready'}<img src={reference.imageUrl} alt={`${reference.name} reference`} />{:else}<Icon name={reference.imageState==='loading'?'circle-notch':'image'} />{/if}</div>
          <span>{reference.name}<small>{reference.purpose==='headshot'?'Profile':reference.purpose==='characterSheet'?'Character sheet':reference.purpose==='locationSheet'?'Place sheet':reference.purpose==='objectSheet'?'Prop sheet':'Reference'} · {reference.imageState==='ready'?'Ready':reference.imageState==='loading'?'Loading…':reference.imageState==='failed'?'Unavailable':'No image'}</small></span>
          <label><span class="ui-shot__sr">Visibility for {reference.name}</span><select aria-label={`Visibility for ${reference.name}`} value={reference.visibility} disabled={busy} onchange={event=>{const value=event.currentTarget.value;if(value==='visible'||value==='offscreen'||value==='omit')onreference?.(reference.referenceId,value)}}><option value="visible">Visible</option><option value="offscreen">Offscreen</option><option value="omit">Not in shot</option></select></label>
        </div>
      {/each}
    </section>{/if}
    {#if shot.frames.length}
      <section class="ui-shot__property-section" aria-label="Frame review"><h3><Icon name="images" /> Frame review <span>{shot.frames.length}</span></h3>
      {@render frameVersions()}
      {#if !reviewWorkspace}{@render reviewActions()}{/if}
      {#if !reviewWorkspace}{@render correctionField()}{/if}
      </section>
    {/if}
    {@render generationControls('panel')}
  {:else}
    <div class="ui-shot__empty-shot"><Icon name="film-strip" /><h3>Direct the moment.</h3><p>Start a shot at the playhead. Shape its framing and direction, then generate a frame to watch with the reading.</p><Button disabled={busy||!canAdd} onclick={()=>onadd?.()}>Add shot</Button></div>
  {/if}
  {#if error}<p class="ui-shot__error" role="alert">{error}</p>{:else if phase}<p class="ui-shot__muted" role="status">{phase}</p>{/if}
  {@render providerDetails()}
  {#if !generationReady && generationReason}<p class="ui-shot__warning">{generationReason}</p>{/if}
</div>
{#if referencePickerOpen}<ProjectReferencePicker references={projectReferences} selected={references.map(ref=>({referenceId:ref.referenceId,role:''}))} imageURLs={referenceImages} oninspect={oninspectreference} onchoose={(id,role)=>{onaddreference?.(id,role);referencePickerOpen=false}} onclose={()=>referencePickerOpen=false} />{/if}
{#if reviewWorkspace&&shot}
  <ContextualDialog open={reviewOpen} title="Review shot frames" target={shot.title} closeLabel="Close frame review" media returnFocus={()=>reviewOpener} onclose={()=>reviewOpen=false}>
    <section class="ui-shot__review-workspace" aria-label="Shot frame review" aria-busy={busy}>
      <div class="ui-shot__review-image">
        <section class="ui-shot__context-hud" aria-label="Shot context">
          {#if sceneLabel}<strong>{sceneLabel}</strong>{/if}
          <div class="ui-shot__context-meta"><span>{shot.framing} · {shot.hold.toFixed(1)}s</span><span>{preview?`Frame ${shot.frames.findIndex(frame=>frame.id===preview.id)+1} · ${preview.id===shot.chosenId?'In playback':preview.review==='unreviewed'?'Needs review':preview.review==='rejected'?'Rejected':'Approved'}`:'No frame selected'}</span></div>
          <details><summary><span>{shot.direction}</span><Icon name="caret-down" /></summary><p><strong>Source</strong> {shot.sourceText||'No source text available.'}</p>{#if shot.warnings?.length}{#each shot.warnings as warning,index (index)}<p>{warning}</p>{/each}{/if}</details>
        </section>

        {#if preview?.url&&failedPreview!==preview.url}
          <img src={preview.url} alt={`${shot.title} · frame ${shot.frames.findIndex(frame=>frame.id===preview.id)+1}`} onerror={()=>failedPreview=preview.url} />
        {:else}<div class="ui-shot__preview-state"><Icon name={preview?.imageState==='loading'?'circle-notch':'image'} /><p>{failedPreview===preview?.url||preview?.imageState==='failed'?'Preview unavailable':preview?.imageState==='loading'?'Loading frame…':'Choose a frame to review.'}</p></div>{/if}
      </div>
      {#if reviewShots.length>1}<nav class="ui-shot__review-navigation" aria-label="Shot review navigation"><Button variant="tool" icon="caret-left" disabled={navigationBlocked||reviewIndex<=0} onclick={()=>navigateReview(reviewIndex-1)}>Previous shot</Button><span aria-live="polite">Shot {reviewIndex+1} of {reviewShots.length}</span><Button variant="tool" icon="caret-right" disabled={navigationBlocked||reviewIndex<0||reviewIndex>=reviewShots.length-1} onclick={()=>navigateReview(reviewIndex+1)}>Next shot</Button>{#if dirty||correction.trim()}<small>Save edits or clear the correction before changing shots.</small>{/if}</nav>{/if}
      <div class="ui-shot__review-footer">
        {@render frameVersions()}
        <div class="ui-shot__review-decisions"><Button variant="tool" icon="pencil-simple" onclick={()=>revising=!revising}>{revising?'Hide revision':'Revise frame…'}</Button>{@render reviewActions()}</div>
      </div>
      {#if revising}<div class="ui-shot__revision" aria-label="Frame revision">{@render correctionField()}{@render generationControls('revision')}</div>{/if}
      {#if error}<p class="ui-shot__error" role="alert">{error}</p>{:else if phase}<p class="ui-shot__muted" role="status">{phase}</p>{/if}
      {@render providerDetails()}

    </section>
  </ContextualDialog>
{/if}
<style>

  .ui-shot__review-navigation{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:var(--data-md-size);}.ui-shot__review-navigation small{color:var(--text-secondary);}
  .ui-shot__review-workspace {display:flex;flex:1;flex-direction:column;gap:var(--spacing-sm);min-width:0;min-height:0;}
  .ui-shot__review-image {position:relative;display:grid;place-items:center;flex:1;min-height:180px;background:color-mix(in oklab,var(--surface-base) 55%,transparent);overflow:hidden;border-radius:var(--radius-sm);}
  .ui-shot__review-image>img {display:block;width:100%;height:100%;min-height:0;object-fit:contain;}
  .ui-shot__preview-state {text-align:center;color:var(--text-secondary);font-size:var(--data-md-size);}
  .ui-shot__review-footer {display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-md);min-width:0;}
  .ui-shot__review-decisions {flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-end;gap:var(--spacing-2xs);max-width:360px;}
  .ui-shot__revision {display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,300px);gap:var(--spacing-md);flex:0 0 auto;border-top:1px solid var(--border-hairline);padding-top:var(--spacing-sm);}
  .ui-shot__revision .ui-shot__render {border:0;padding:0;}
  .ui-shot__context-hud {position:absolute;z-index:1;top:var(--spacing-sm);left:var(--spacing-sm);width:min(460px,calc(100% - 2 * var(--spacing-sm)));box-sizing:border-box;padding:var(--spacing-sm);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:color-mix(in oklab,var(--surface-raised) 94%,transparent);backdrop-filter:blur(16px);color:var(--text-primary);font-size:var(--body-md-size);max-height:45%;overflow:auto;}
  .ui-shot__context-meta {display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--spacing-xs);color:var(--text-secondary);font-size:var(--body-md-size);}
  .ui-shot__context-hud details {border:0;padding:var(--spacing-2xs) 0 0;}
  .ui-shot__context-hud summary {display:flex;align-items:flex-start;justify-content:space-between;gap:var(--spacing-sm);line-height:1.5;}
  .ui-shot__context-hud summary>span {display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;}
  .ui-shot__context-hud details[open] summary>span {-webkit-line-clamp:unset;}
  .ui-shot__context-hud p {font-size:var(--body-md-size);line-height:1.5;margin:var(--spacing-sm) 0 0;}
  @media(max-width:760px) {.ui-shot__review-footer {flex-direction:column;align-items:stretch;}.ui-shot__revision {grid-template-columns:1fr;}.ui-shot__review-decisions {flex:auto;align-items:flex-start;max-width:none;}}
  @container viewport (max-width:760px){.ui-shot__review-footer {flex-direction:column;align-items:stretch;}.ui-shot__revision {grid-template-columns:1fr;}.ui-shot__review-decisions {flex:auto;align-items:flex-start;max-width:none;}}
  .ui-shot,fieldset
 { display:flex; flex-direction:column; gap:12px; min-width:0; }
  fieldset { margin:0; padding:0; border:0; }
  .ui-shot__property-section { border-top:1px solid var(--border-hairline); padding-top:10px; display:flex; flex-direction:column; gap:10px; }
  .ui-shot__property-section legend,.ui-shot__property-section h3 { display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:var(--text-secondary);margin:0;padding:0 6px 0 0; }
  .ui-shot__property-section h3 span { margin-left:auto;font-weight:400; }
  .ui-shot__camera-row {display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:end;}
  .ui-shot__treatment {display:flex;flex-direction:column;gap:6px;font-size:11px;color:var(--text-secondary);}
  .ui-shot__save {display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:11px;color:var(--text-secondary);}
  .ui-shot__render {display:flex;flex-direction:column;gap:10px;padding-top:10px;border-top:1px solid var(--border-hairline);}
  .ui-shot__tool-intro>span {display:flex;align-items:center;gap:6px;}
  .ui-shot__tool-intro { display:flex; align-items:center; justify-content:space-between; color:var(--text-secondary); font-size:11px; }
  label { display:flex; flex-direction:column; gap:6px; font-size:11px; color:var(--text-secondary); }
  input:not([type=checkbox]),textarea,select { box-sizing:border-box; width:100%; font:inherit; font-size:12px; line-height:1.5; color:var(--text-primary); background:color-mix(in srgb,var(--surface-base) 50%,transparent); border:1px solid var(--border-default); border-radius:var(--radius-sm); padding:7px 8px; }
  textarea { resize:vertical; min-height:62px; }
  input:focus-visible,textarea:focus-visible,select:focus-visible,button:focus-visible { outline:2px solid var(--border-focus); outline-offset:2px; }
  input:disabled,textarea:disabled,select:disabled { opacity:.6; }
  .ui-shot__title-field input { font-weight:500; }
  .ui-shot__range { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  details { font-size:12px; border-block:1px solid var(--border-hairline); padding:10px 0; }
  summary { cursor:pointer; color:var(--text-primary); }
  .ui-shot__diagnostic pre { white-space:pre-wrap; overflow-wrap:anywhere; font-size:11px; line-height:1.5; }
  .ui-shot__sr { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
  .ui-shot__reference-image {width:38px;height:38px;flex:0 0 38px;display:grid;place-items:center;overflow:hidden;border-radius:var(--radius-sm);background:var(--surface-base);}
  .ui-shot__reference-image img {width:100%;height:100%;object-fit:contain;}
  .ui-shot__reference>span {min-width:0;flex:1;}
  .ui-shot__reference small { display:block; color:var(--text-secondary); font-size:10px; }
  .ui-shot__reference label { margin-left:auto; max-width:120px; }
  .ui-shot__source { line-height:1.6; } .ui-shot__reference { display:flex; gap:7px; padding:4px 0; }
  .ui-shot__muted,.ui-shot__beats { margin:0; color:var(--text-secondary); font-size:11px; line-height:1.6; } .ui-shot__beats { padding-left:18px; }
  .ui-shot__empty-shot { display:flex; flex-direction:column; align-items:flex-start; gap:14px; padding:18px 0; } .ui-shot__empty-shot :global(.ph) { font-size:28px; color:var(--text-secondary); } .ui-shot__empty-shot h3,.ui-shot__empty-shot p { margin:0; } .ui-shot__empty-shot h3 { font-size:17px; font-weight:500; } .ui-shot__empty-shot p { font-size:13px; line-height:1.7; color:var(--text-secondary); }
  .ui-shot__thumbnail {display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:56px;}
  .ui-shot__thumbnail small {font-size:9px;line-height:1.2;}
  .ui-shot__versions { display:flex; gap:6px; overflow:auto; } .ui-shot__versions button { background:transparent; color:var(--text-secondary); border:1px solid var(--border-default); border-radius:var(--radius-sm); padding:3px; min-width:88px; width:88px; cursor:pointer; } .ui-shot__versions button.ui-shot__preview { border-color:var(--border-focus); } .ui-shot__versions img { display:block; width:100%; height:56px; object-fit:contain; } .ui-shot__versions span { font-size:10px; }
  .ui-shot__review-actions { display:flex; flex-wrap:wrap; gap:6px; } .ui-shot__error,.ui-shot__warning { font-size:12px; line-height:1.6; margin:0; white-space:pre-wrap; overflow-wrap:anywhere; } .ui-shot__error { color:var(--tone-danger); } .ui-shot__warning { color:var(--text-secondary); }
.ui-shot__edit-actions {display:flex;flex-wrap:wrap;gap:5px}.ui-shot__delete-confirm {display:flex;flex-direction:column;gap:10px;padding:12px;border:1px solid var(--border-default);border-radius:var(--radius-sm);font-size:12px}.ui-shot__delete-confirm p {margin:0;line-height:1.6;color:var(--text-secondary)}
  .ui-shot--compact {gap:6px;}
  .ui-shot--compact>fieldset {gap:8px;}
  .ui-shot--compact .ui-shot__property-section {gap:6px;padding-top:6px;}
  .ui-shot--compact label {gap:3px;}
  .ui-shot--compact input:not([type=checkbox]),.ui-shot--compact select,.ui-shot--compact textarea {padding:2px 6px;border-radius:2px;font-size:12px;line-height:18px;}
  .ui-shot--compact input:not([type=checkbox]),.ui-shot--compact select {height:24px;}
  .ui-shot--compact .ui-shot__title-field {display:grid;grid-template-columns:65px minmax(0,1fr);align-items:center;}
  .ui-shot--compact .ui-shot__range label {display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:5px;}
  .ui-shot--compact details {padding:6px 0;}
  .ui-shot--compact .ui-shot__render {gap:6px;padding-top:6px;}
  .ui-shot--compact .ui-shot__warning {font-size:11px;line-height:1.4;}
</style>

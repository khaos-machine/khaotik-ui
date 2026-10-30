<script>
  import ContextualDialog from './internal/ContextualDialog.svelte'
  import ProjectReferencePicker from './internal/ProjectReferencePicker.svelte'
  import ArtworkWorkspace from './internal/ArtworkWorkspace.svelte'
  import AppearanceGenerationStatus from './internal/AppearanceGenerationStatus.svelte'
  import Button from './Button.svelte'
  import EmptyState from './EmptyState.svelte'
  import Icon from './Icon.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  import StatusPill from './StatusPill.svelte'
  /** @typedef {import('./lib/place-workbench.js').PlaceWorkspace} PlaceWorkspace */
  /** @typedef {import('./lib/place-workbench.js').PlaceBrief} PlaceBrief */
  /**
   * @typedef {Object} Props
   * @property {()=>void} [onbuild] Explicitly submit or retry the retained Build intent; the engine builds from the approved floor plan.
   * @property {()=>void} [oncancelbuild] Explicitly request cancellation.
   * @property {()=>void} [onloadbuild] Load an available result without discarding a draft.
   * @property {boolean} [building] An acknowledged job is queued or running.
   * @property {boolean} [buildBusy] Submission, status or result read is pending.
   * @property {boolean} [retryBuild] Original submission outcome is uncertain; the action retries it.
   * @property {boolean} [cancelRequested] Cancellation acknowledged, not yet terminal.
   * @property {string} [buildStatus] Host-formatted engine status, rounds and decimal USD spend.
   * @property {string} [buildError] Retained generation failure.
   * @property {'structure'|'design'|'build'|'render'} [mode] Active Place Builder mode; defaults to Design.
   * @property {(mode:'structure'|'design'|'build'|'render')=>void} [onmode] Reports deliberate mode navigation; never starts generation.
   * @property {import('svelte').Snippet} [structure] The same Place's floor plan workspace, first on the rail; absent for a place with no structure, such as an exterior or a vehicle.
   * @property {import('svelte').Snippet} [build] The same Place's complete Build workspace.
   * @property {string} [refinementFeedback] Changes requested for the next suggestion.
   * @property {(value:string)=>void} [onfeedback] Edit revision feedback without saving.
   * @property {()=>void} [ondiscardsuggestion] Explicitly start over without changing direction.
   * @property {{brief:PlaceBrief,notes:readonly string[]}|null} [suggestion] Reviewable text proposal.
   * @property {boolean} [refining] One text request is in progress.
   * @property {string} [refinementError] Retained text request failure.
   * @property {boolean} [canApplySuggestion] Proposal still matches its input draft.
   * @property {()=>void} [onrefine] Request one suggestion explicitly.
   * @property {()=>boolean} [onapplysuggestion] Load a suggestion into the draft without saving.
   * @property {(index:number)=>void} [onarea] Load one cited area into the draft.
   * @property {PlaceWorkspace|null} [workspace] Complete engine-owned place artwork read model.
   * @property {PlaceBrief|null} [brief] Persistent host-owned direction draft.
   * @property {readonly {referenceId:string,role:string}[]} [references] Authored image input roles.
   * @property {string} [candidateId] Candidate being viewed, independently of adoption.
   * @property {string} [inspectingId] Reference being viewed, empty returns to design.
   * @property {Record<string,string>} [imageURLs] Authenticated image URLs keyed by reference.
   * @property {string} [mediaUrl] Main contained artwork.
   * @property {boolean} [mediaLoading] Main artwork read is pending.
   * @property {string} [mediaError] Retained media-read failure.
   * @property {string} [correction] Revision instruction for this candidate.
   * @property {string} [notes] Candidate review notes.
   * @property {string} [treatment] Authored visual treatment, separate from script facts.
   * @property {boolean} [dirty] Direction changes await saving.
   * @property {boolean} [busy] Prevent overlapping operations.
   * @property {string} [error] Retained operation error.
   * @property {string} [notice] Explicit operation feedback.
   * @property {string} [generationRequestId] Current explicit image request.
   * @property {string} [generationError] Retained submission failure.
   * @property {string} [returnLabel] Contextual return destination.
   * @property {()=>void} [onback] Return to the prior Data or Atlas context.
   * @property {(field:'spatialDescription'|'dressing'|'lighting'|'treatment',value:string)=>void} [onchange] Change authored direction.
   * @property {(values:string[])=>void} [onfeatures] Edit fixed features for this set.
   * @property {()=>void} [onsave] Persist the current brief.
   * @property {()=>void} [onrevert] Explicitly discard unsaved direction edits.
   * @property {(correcting:boolean)=>void} [ongenerate] Save edits then request one image.
   * @property {(id:string)=>void} [onpreview] View artwork without approval or selection.
   * @property {(id:string)=>void} [oninspect] Inspect a reference, or return with an empty ID.
   * @property {(id:string,role:string)=>void} [onreference] Change a reference role.
   * @property {(files:File[])=>void} [onupload] Upload reference imagery.
   * @property {(value:string)=>void} [oncorrection] Edit the correction draft.
   * @property {(value:string)=>void} [onnotes] Edit review notes.
   * @property {(state:'reviewed'|'rejected')=>void} [onreview] Review without adopting artwork.
   * @property {()=>void} [onuse] Approve and select in one command.
   * @property {(id:string)=>void} [onpublish] Save returned artwork without provider retry.
   * @property {string} [stateLabel] The engine label of the place state being designed, such as "Interior · Day"; named in the header.
   */
  /** @type {Props} */
  let {onbuild=undefined,oncancelbuild=undefined,onloadbuild=undefined,building=false,buildBusy=false,retryBuild=false,cancelRequested=false,buildStatus='',buildError='',mode=$bindable('design'),onmode=undefined,structure=undefined,build=undefined,stateLabel='',refinementFeedback='',onfeedback=undefined,ondiscardsuggestion=undefined,suggestion=null,refining=false,refinementError='',canApplySuggestion=true,onrefine=undefined,onapplysuggestion=undefined,onarea=undefined,workspace=null,brief=null,references=[],candidateId='',inspectingId='',imageURLs={},mediaUrl='',mediaLoading=false,mediaError='',correction='',notes='',treatment='',dirty=false,busy=false,error='',notice='',generationRequestId='',generationError='',returnLabel='Back to places',onback=undefined,onchange=undefined,onfeatures=undefined,onsave=undefined,onrevert=undefined,ongenerate=undefined,onpreview=undefined,oninspect=undefined,onreference=undefined,onupload=undefined,oncorrection=undefined,onnotes=undefined,onreview=undefined,onuse=undefined,onpublish=undefined}=$props()
  let refinementOpen=$state(false),area=$state('0')
  /** @type {HTMLElement|null} */
  let refinementOpener=null
  let referencePickerOpen=$state(false)
  let tab=$state('space'),feature=$state(''),toolsOpen=$state(true),focused=$state(false)
  const candidate=$derived(workspace?.candidates.find(c=>c.revision.id===candidateId))
  const inspected=$derived([...workspace?.references??[],...workspace?.renders??[],...workspace?.styleReferences??[],...workspace?.projectReferences??[]].find(r=>r.id===inspectingId))
  // The place's own references, and its Build renders (khaosd records each as a "set" reference),
  // are always listed; a project image only while it is in use. Each once.
  const owned=$derived([...workspace?.references??[],...workspace?.renders??[]])
  const listed=$derived([...owned,...workspace?.projectReferences??[]].filter((ref,index,all)=>all.findIndex(r=>r.id===ref.id)===index&&(owned.some(o=>o.id===ref.id)||references.some(use=>use.referenceId===ref.id))))
  /** @type {Record<string,string>} */
  const roleLabels={identity:'Match identity',detail:'Details',style:'Style',set:'Match the 3D model'}
  const fromModel=$derived(references.filter(r=>r.role==='set').length)
  const job=$derived(generationRequestId?workspace?.jobs.find(j=>j.requestId===generationRequestId):workspace?.jobs.find(j=>j.revisionId===candidateId))
  const jobCandidate=$derived(workspace?.candidates.find(c=>c.revision.id===job?.revisionId))
  const correcting=$derived(!!candidate&&!!correction.trim())
  const gate=$derived(busy?'Wait for the current operation to finish.':workspace?.hasActiveJobs?'Artwork is being generated or saved.':inspected?'Return to the design to generate artwork.':!workspace?.generationReady?workspace?.generationReason||'Image generation is unavailable.':!brief?.spatialDescription.trim()?'Describe the place and the area you want to design.':'')
  const reviewLabel=$derived(candidate?.selected?'In use':candidate?.revision.review.state==='reviewed'?'Approved':candidate?.revision.review.state==='rejected'?'Rejected':'Needs review')
  const uid=$props.id()
  function editTool(value){tab=value;toolsOpen=true}
  function addFeature(value){const item=value.trim();if(item&&brief&&!brief.fixedFeatures.includes(item)){onfeatures?.([...brief.fixedFeatures,item]);feature=''}}
</script>
{#snippet modeNavigation()}
  <SegmentedControl label="Place Builder mode" value={mode} items={[...(structure?[{value:'structure',label:'Structure'}]:[]),{value:'build',label:'Build'},{value:'design',label:'Design'},{value:'render',label:'Render'}]} onselect={value=>{if(value==='structure'||value==='design'||value==='build'||value==='render'){mode=value;onmode?.(value)}}} />
{/snippet}
{#snippet modeContent()}
  {#if mode==='structure'}
    <div class="ui-place__build-workspace">{@render structure?.()}</div>
  {:else if mode==='build'}
    <div class="ui-place__build">
      <div class="ui-place__build-toolbar" role="group" aria-label="Build">
        <Button icon="cube" disabled={!onbuild||buildBusy||building} onclick={()=>onbuild?.()}>{retryBuild?'Retry Build':'Build Place'}</Button>
        {#if building&&oncancelbuild}<Button variant="secondary" disabled={buildBusy||cancelRequested} onclick={()=>oncancelbuild?.()}>{cancelRequested?'Cancel requested':'Cancel Build'}</Button>{/if}
        {#if onloadbuild}<Button variant="secondary" icon="arrow-clockwise" disabled={buildBusy} onclick={()=>onloadbuild?.()}>Load result</Button>{/if}
        <span role="status">{buildStatus}</span>
      </div>
      {#if buildError}<p class="ui-place__status-error" role="alert">{buildError}</p>{/if}
      <div class="ui-place__build-workspace">{#if build}{@render build()}{:else}<EmptyState title="Build" icon="cube" />{/if}</div>
    </div>
  {:else}<EmptyState title="Render" icon="camera" />{/if}
{/snippet}
{#snippet emptyView()}
  <div class="ui-place__place-stage"><Icon name="map-pin" size="lg" /><span>PLACE STUDY{stateLabel?` · ${stateLabel}`:''}</span><h2>{workspace?.name??'Design a place'}</h2><p>{brief?.spatialDescription||'Define a space, keep its landmarks consistent, then explore it from different angles.'}</p><small>Establishing view + three alternate angles</small>{#if workspace?.preparation.evidence.length}<Button variant="tool" icon="text-align-left" onclick={()=>editTool('space')}>{workspace.preparation.evidence.length} cited setting details</Button>{/if}</div>
{/snippet}
{#snippet mediaHud()}
  {#if inspected}<div class="ui-place__place-hud"><strong>{inspected.label}</strong><Button variant="tool" icon="arrow-left" onclick={()=>oninspect?.('')}>Back to design</Button></div>
  {:else if generationRequestId||job}<AppearanceGenerationStatus {job} requested={!!generationRequestId} requestError={generationError} version={jobCandidate?.label??'Place sheet'} purpose="place sheet" onreview={job?.publication==='saved'&&job.revisionId!==candidateId?()=>onpreview?.(job.revisionId):undefined} />
  {:else if candidate}<div class="ui-place__place-hud"><strong>{candidate.label}</strong><StatusPill text={reviewLabel} tone="neutral" /></div>{/if}
{/snippet}
{#snippet selectionHud()}
  {#if brief&&!inspected}<div class="ui-place__place-hud ui-place__place-hud--summary"><span>{dirty?'Next generation · unsaved direction':workspace?.draft?'Next generation · saved direction':'Next generation · proposed direction'}</span><div><Button variant="tool" icon="cube" onclick={()=>editTool('space')}>{brief.fixedFeatures.length} fixed features</Button><Button variant="tool" icon="sun" title={brief.lighting} onclick={()=>editTool('light')}>{brief.lighting||'Set lighting'}</Button><Button variant="tool" icon="images" onclick={()=>editTool('references')}>{references.length} image references</Button><Button variant="tool" icon="paint-brush" title={treatment} onclick={()=>editTool('dressing')}>{treatment||'Visual treatment'}</Button></div></div>{/if}
{/snippet}
{#snippet designTools()}
  <div class="ui-place__place-tools">
    <SegmentedControl label="Place design tools" value={tab} items={[{value:'space',label:'Space'},{value:'dressing',label:'Dressing'},{value:'light',label:'Light'},{value:'references',label:'References'}]} onselect={value=>tab=value} />
    {#if brief&&workspace}
      {#if tab==='space'}
        <section><h3>Architecture and layout</h3>
        <Button variant="tool" icon="sparkle" disabled={busy} onclick={e=>{refinementOpener=e.currentTarget;refinementOpen=true}}>Refine direction…</Button>
        {#if workspace.preparation.areas?.length}<label>Analysed area<select aria-label="Analysed area" bind:value={area} disabled={busy||refining}>{#each workspace.preparation.areas as item,index (index)}<option value={String(index)}>{item.name}</option>{/each}</select></label><Button variant="tool" icon="map-pin" disabled={busy||refining} onclick={()=>onarea?.(Number(area))}>Use area direction</Button><p class="ui-place__hint">Loads one area’s cited details into your draft. Other areas stay separate.</p>{/if}<label>Space to design<textarea aria-label="Space to design" rows="5" value={brief.spatialDescription} disabled={busy} oninput={e=>onchange?.('spatialDescription',e.currentTarget.value)}></textarea></label><p class="ui-place__hint">Define the area shown in this study. Rooms mentioned in different scenes do not imply one shared space.</p></section>
        <section><h3>Fixed features</h3><div class="ui-place__feature-list">{#each brief.fixedFeatures as value (value)}<div><span>{value}</span><Button variant="tool" icon="x" title={`Remove ${value}`} disabled={busy} onclick={()=>onfeatures?.(brief.fixedFeatures.filter(item=>item!==value))} /></div>{/each}</div><form onsubmit={e=>{e.preventDefault();addFeature(feature)}}><input aria-label="New fixed feature" placeholder="A landmark to keep in every view" bind:value={feature} disabled={busy} /><Button icon="plus" title="Add fixed feature" type="submit" disabled={busy||!feature.trim()} /></form></section>
        <details open><summary>From the screenplay · {workspace.preparation.evidence.length}</summary><p class="ui-place__hint">Include only details that belong to the area being designed.</p>{#each workspace.preparation.evidence as evidence,index (index)}<div class="ui-place__evidence"><span>{evidence.detail}<small>Scene {evidence.sceneNumbers.join(', ')}</small></span><Button variant="tool" icon={brief.fixedFeatures.includes(evidence.detail)?'check':'plus'} title={`Include ${evidence.detail}`} disabled={busy||brief.fixedFeatures.includes(evidence.detail)} onclick={()=>addFeature(evidence.detail)} /></div>{/each}</details>
      {:else if tab==='dressing'}
        <section><h3>Set dressing</h3><label>Materials, furniture and objects<textarea aria-label="Set dressing" rows="5" value={brief.dressing} disabled={busy} oninput={e=>onchange?.('dressing',e.currentTarget.value)}></textarea></label><p class="ui-place__hint">Describe what belongs in the space. These are design choices when the script leaves them open.</p></section>
        <section><h3>Visual treatment</h3><div class="ui-place__presets">{#each ['Illustrated','Cinematic photograph','Stylized 3D','Ink sketch'] as value (value)}<Button variant="tool" disabled={busy} onclick={()=>onchange?.('treatment',value)}>{value}</Button>{/each}</div><label>Art direction<textarea aria-label="Visual treatment" rows="3" value={treatment} disabled={busy} oninput={e=>onchange?.('treatment',e.currentTarget.value)}></textarea></label></section>
      {:else if tab==='light'}
        <section><h3>Light and atmosphere</h3><div class="ui-place__presets">{#each ['Soft daylight','Overcast daylight','Warm practical lights','Night lighting'] as value (value)}<Button variant="tool" disabled={busy} onclick={()=>onchange?.('lighting',value)}>{value}</Button>{/each}</div><label>Lighting direction<textarea aria-label="Lighting direction" rows="5" value={brief.lighting} disabled={busy} oninput={e=>onchange?.('lighting',e.currentTarget.value)}></textarea></label></section>
        {#if workspace.preparation.atmosphere}<section><h3>Analysis suggests</h3><p>{workspace.preparation.atmosphere}</p><small>Interpretation, not a script-stated fact.</small></section>{/if}
      {:else}
        <section><h3>Reference images</h3><Button variant="secondary" icon="images" onclick={()=>referencePickerOpen=true}>Browse project images…</Button><label class="ui-place__upload"><span>Add references</span><input aria-label="Upload place reference images" type="file" accept="image/png,image/jpeg" multiple disabled={busy} onchange={e=>{if(e.currentTarget.files?.length){onupload?.(Array.from(e.currentTarget.files));e.currentTarget.value=''}}} /></label></section>
        {#each listed as ref (ref.id)}<div class="ui-place__reference"><button type="button" aria-label={`Inspect ${ref.label}`} onclick={()=>oninspect?.(ref.id)}>{#if imageURLs[ref.id]}<img src={imageURLs[ref.id]} alt="" />{:else}<Icon name="image" />{/if}</button><span>{ref.label}</span><select aria-label={`Role for ${ref.label}`} disabled={busy} value={references.find(r=>r.referenceId===ref.id)?.role??''} onchange={e=>onreference?.(ref.id,e.currentTarget.value)}><option value="">Exclude</option>{#each ref.roles??['identity','detail','style'] as role (role)}<option value={role}>{roleLabels[role]??'Layout'}</option>{/each}</select></div>{/each}
      {/if}
      <div class="ui-place__save-state"><small>{dirty?'Unsaved direction':workspace.draft?'Saved in project':'Proposed direction'}</small><Button variant="tool" icon="arrow-counter-clockwise" disabled={busy||!dirty} onclick={()=>onrevert?.()}>Revert</Button><Button variant="tool" icon="floppy-disk" disabled={busy||(!dirty&&!!workspace.draft)} onclick={()=>onsave?.()}>Save</Button></div>
      <details open={!!workspace.preparation.context?.length}><summary>Story context</summary>{#each workspace.preparation.context??[] as item,index (index)}<p>{item.detail}<small>Spoken in scene {item.sceneNumbers.join(', ')}</small></p>{/each}<p>{workspace.preparation.summary||'No place analysis is available. You can still author this design.'}</p>{#each workspace.preparation.changes as change,index (index)}<p>{change.detail}<small>Scene {change.sceneNumbers.join(', ')}</small></p>{/each}</details>
    {/if}
  </div>
{/snippet}
{#snippet designCommands()}
  <div class="ui-place__commands">
  {#if candidate&&!inspected}<section aria-label="Revise place artwork"><h3>Revision</h3><label>Change this artwork<textarea aria-label="Correction direction" rows="2" value={correction} disabled={busy} oninput={e=>oncorrection?.(e.currentTarget.value)}></textarea></label><details><summary>Review notes</summary><label>Notes<textarea aria-label="Review notes" rows="2" value={notes} disabled={busy} oninput={e=>onnotes?.(e.currentTarget.value)}></textarea></label></details></section>{/if}
<Button variant={candidate&&!correcting?'secondary':'primary'} icon="sparkle" disabled={!!gate} describedby={`${uid}-generation`} onclick={()=>ongenerate?.(correcting)}>{busy?'Working…':correcting?'Generate correction':'Generate place sheet'}</Button><p class="ui-place__hint" id={`${uid}-generation`}>{gate||(dirty?'Saves your direction first. OpenAI bills your connected account.':'Uses OpenAI and saves artwork for your review.')}</p><p class="ui-place__hint" aria-label="Generation image inputs">{references.length?`${references.length} image references · ${references.filter(r=>r.role==='identity').length} matching identity${fromModel?` · ${fromModel} from the 3D model`:''}`:'No image references selected. Uses direction only.'}</p>
  {#if candidate&&!inspected}<div class="ui-place__review-actions"><Button icon="x" disabled={busy||candidate.selected||candidate.revision.review.state==='rejected'} onclick={()=>onreview?.('rejected')}>Reject</Button><Button icon="check" disabled={busy||candidate.revision.review.state==='reviewed'} onclick={()=>onreview?.('reviewed')}>Approve</Button></div><Button variant={correcting?'secondary':'primary'} icon="check-circle" disabled={busy||candidate.selected||candidate.revision.review.state==='rejected'} onclick={()=>onuse?.()}>Use this design</Button><p class="ui-place__hint">{candidate.selected?'This place design is in use.':'Approves and uses this artwork in one action.'}</p>{/if}</div>
{/snippet}
{#snippet versionsView()}
  <nav aria-label="Place design versions">{#each workspace?.candidates??[] as item (item.revision.id)}<button type="button" aria-pressed={candidateId===item.revision.id&&!inspected} disabled={busy} onclick={()=>onpreview?.(item.revision.id)}>{#if item.images[0]&&imageURLs[item.images[0].id]}<img src={imageURLs[item.images[0].id]} alt="" />{:else}<Icon name="image" />{/if}<span>{item.label}<small>{item.selected?'In use':item.revision.review.state==='reviewed'?'Approved':item.revision.review.state==='rejected'?'Rejected':'Needs review'}</small></span></button>{/each}</nav>
{/snippet}
{#snippet statusView()}
  {#if error}<p class="ui-place__status-error" role="alert">{error}</p>{:else}<p role="status">{busy?'Working…':notice}</p>{/if}{#each workspace?.jobs.filter(j=>j.publication==='pending')??[] as pending (pending.id)}<Button icon="floppy-disk" disabled={busy} onclick={()=>onpublish?.(pending.id)}>Save returned artwork</Button>{/each}
{/snippet}
<ArtworkWorkspace toolbar={modeNavigation} content={mode==='design'?undefined:modeContent} name={workspace?.name??'Place'} {returnLabel} {mediaUrl} {mediaLoading} {mediaError} mediaAlt={`${workspace?.name??'Place'} ${inspected?'reference':'design sheet'}`} toolsTitle="Place design tools" dataUiId="place.appearance" bind:toolsOpen bind:focused {onback} empty={emptyView} hud={mediaHud} selection={selectionHud} tools={designTools} commands={designCommands} versions={versionsView} status={statusView} />
{#if referencePickerOpen}<ProjectReferencePicker references={workspace?.projectReferences??[]} selected={references} {imageURLs} oninspect={id=>oninspect?.(id)} onchoose={(id,role)=>{onreference?.(id,role);referencePickerOpen=false;oninspect?.('')}} onclose={()=>{referencePickerOpen=false;oninspect?.('')}} />{/if}
{#if refinementOpen}
<ContextualDialog open title="Refine place direction" target={workspace?.name??'Place'} closeLabel="Close place refinement" returnFocus={()=>refinementOpener} onclose={()=>refinementOpen=false}>
  <div class="ui-place__refinement">
    <p>Turn the selected area, screenplay evidence and your current direction into an editable design brief. Artwork and saved direction stay as they are.</p>
    <label>Area to refine<textarea aria-label="Area to refine" rows="3" value={brief?.spatialDescription??''} disabled={busy||refining} oninput={e=>onchange?.('spatialDescription',e.currentTarget.value)}></textarea></label><p class="ui-place__hint">Choose one reusable set, such as the terminal interior or exterior parking area. Editing this changes your unsaved direction.</p>
    <details><summary>Current direction and story evidence</summary><p>{brief?.spatialDescription}</p><p>{workspace?.preparation.summary}</p>{#each workspace?.preparation.context??[] as item,index (index)}<p>{item.detail}<small>Spoken in scene {item.sceneNumbers.join(', ')}</small></p>{/each}{#each workspace?.preparation.evidence??[] as item,index (index)}<p>{item.detail}<small>Scene {item.sceneNumbers.join(', ')}</small></p>{/each}</details>
    <label>What should change?<textarea aria-label="What should change?" rows="3" value={refinementFeedback} disabled={busy||refining} placeholder="Describe what to keep, change or avoid in the next suggestion" oninput={e=>onfeedback?.(e.currentTarget.value)}></textarea></label>
    <div class="ui-place__revision-tools"><Button variant="secondary" icon="sparkle" disabled={busy||refining} onclick={()=>onrefine?.()}>{refining?'Suggesting direction…':!suggestion?'Suggest direction':refinementFeedback.trim()?'Revise suggestion':'Try another suggestion'}</Button>{#if suggestion}<Button variant="tool" icon="x" disabled={busy||refining} onclick={()=>ondiscardsuggestion?.()}>Discard suggestion</Button>{/if}</div>
    <small>Uses your text AI connection. No images are generated.</small>
    {#if refinementError}<p class="ui-place__status-error" role="alert">{refinementError}</p>{/if}
    {#if suggestion}
      <section aria-label="Suggested place direction"><h3>Suggested direction</h3><dl class="ui-place__proposal"><dt>Space</dt><dd>{suggestion.brief.spatialDescription}</dd><dt>Fixed features</dt><dd>{suggestion.brief.fixedFeatures.join('; ')||'None specified'}</dd><dt>Dressing</dt><dd>{suggestion.brief.dressing||'Open'}</dd><dt>Lighting</dt><dd>{suggestion.brief.lighting||'Open'}</dd></dl></section>
      {#if suggestion.brief.unknowns.length}<details><summary>Proposed design choices</summary>{#each suggestion.brief.unknowns as item,index (index)}<p>{item.detail}</p>{/each}</details>{/if}
      {#each suggestion.notes as note,index (index)}<p class="ui-place__hint">{note}</p>{/each}
      
      {#if !canApplySuggestion}<p role="status">Your direction, references or feedback changed. Request a new suggestion to include those edits.</p>{/if}
      <Button icon="check" disabled={busy||refining||!canApplySuggestion} onclick={()=>{if(onapplysuggestion?.())refinementOpen=false}}>Use suggested direction</Button>
      <small>Loads the suggestion into your draft. Edit it before saving or generating.</small>
    {/if}
  </div>
</ContextualDialog>
{/if}

<style>
  .ui-place__revision-tools{display:flex;flex-wrap:wrap;gap:var(--spacing-xs);}
  .ui-place__refinement{display:flex;flex-direction:column;gap:var(--spacing-sm);}.ui-place__proposal{display:grid;grid-template-columns:100px minmax(0,1fr);gap:var(--spacing-sm);margin:0;font-size:var(--body-md-size);line-height:1.5;}.ui-place__proposal dt{color:var(--text-secondary);}.ui-place__proposal dd{margin:0;overflow-wrap:anywhere;}
  .ui-place__place-stage{max-width:620px;padding:var(--spacing-lg);display:flex;flex-direction:column;align-items:center;text-align:center;gap:var(--spacing-md);}.ui-place__place-stage>span{font-size:var(--caption-size);letter-spacing:.1em;color:var(--text-secondary);}h2{font-size:var(--heading-md-size);margin:0;}h3{font-size:var(--label-md-size);margin:0;}p{font-size:var(--body-md-size);line-height:1.5;margin:0;}small,.ui-place__hint{font-size:var(--caption-size);line-height:1.5;color:var(--text-secondary);}small{display:block;}
  .ui-place__place-hud{display:flex;align-items:center;gap:var(--spacing-sm);width:max-content;max-width:100%;padding:var(--spacing-xs) var(--spacing-sm);background:color-mix(in oklab,var(--surface-raised) 86%,transparent);backdrop-filter:blur(20px);border:1px solid var(--border-default);border-radius:var(--radius-sm);font-size:var(--caption-size);}.ui-place__place-hud--summary{display:flex;flex-direction:column;align-items:flex-start;gap:var(--spacing-xs);}.ui-place__place-hud--summary>span{color:var(--text-secondary);}.ui-place__place-hud--summary>div :global(button){max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;}.ui-place__place-hud--summary>div{display:flex;gap:var(--spacing-xs);max-width:100%;overflow:hidden;}
  .ui-place__place-tools{display:flex;flex-direction:column;gap:var(--spacing-md);}section{display:flex;flex-direction:column;gap:var(--spacing-sm);}section+section,details{padding-top:var(--spacing-sm);border-top:1px solid var(--border-hairline);}label{display:flex;flex-direction:column;gap:var(--spacing-xs);font-size:var(--caption-size);color:var(--text-secondary);}textarea,input:not([type=file]),select{box-sizing:border-box;min-width:0;width:100%;font:inherit;font-size:var(--body-md-size);color:var(--text-primary);background:color-mix(in oklab,var(--surface-base) 55%,transparent);border:1px solid var(--border-default);border-radius:var(--radius-sm);padding:var(--spacing-xs) var(--spacing-sm);}textarea{resize:vertical;line-height:1.5;}input[type=file]{max-width:100%;font-size:var(--caption-size);}textarea:focus-visible,input:focus-visible,select:focus-visible,button:focus-visible{outline:2px solid var(--border-focus);outline-offset:2px;}
  form,.ui-place__save-state,.ui-place__evidence,.ui-place__feature-list>div,.ui-place__reference,.ui-place__review-actions{display:flex;align-items:center;gap:var(--spacing-xs);}form input,.ui-place__save-state small,.ui-place__evidence>span,.ui-place__reference>span,.ui-place__feature-list span{flex:1;min-width:0;}summary{cursor:pointer;font-size:var(--body-md-size);}.ui-place__evidence,.ui-place__feature-list>div{padding:var(--spacing-xs) 0;font-size:var(--body-md-size);}.ui-place__evidence small{margin-top:2px;}.ui-place__presets{display:flex;flex-wrap:wrap;gap:var(--spacing-xs);}.ui-place__commands{display:flex;flex-direction:column;gap:var(--spacing-sm);}.ui-place__upload{padding:var(--spacing-sm);border:1px solid var(--border-default);border-radius:var(--radius-sm);}
  .ui-place__reference{padding:var(--spacing-xs) 0;font-size:var(--caption-size);}.ui-place__reference>button{display:grid;place-items:center;width:48px;height:36px;flex:none;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:transparent;color:var(--text-secondary);cursor:pointer;}.ui-place__reference img{width:100%;height:100%;object-fit:contain;}.ui-place__reference select{width:104px;}
  nav{display:flex;gap:var(--spacing-xs);padding:var(--spacing-sm);overflow:auto;}nav button{display:flex;align-items:center;gap:var(--spacing-xs);flex:none;padding:var(--spacing-xs);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:color-mix(in oklab,var(--surface-raised) 85%,transparent);color:var(--text-primary);font-size:var(--caption-size);cursor:pointer;}nav button[aria-pressed=true]{border-color:var(--border-focus);}nav img{width:80px;height:54px;object-fit:contain;}.ui-place__status-error{color:var(--tone-danger);}
  .ui-place__build{height:100%;min-height:0;display:flex;flex-direction:column;}
  .ui-place__build-toolbar{display:flex;align-items:center;gap:var(--spacing-sm);padding:var(--spacing-xs) var(--spacing-sm);border-bottom:1px solid var(--border-default);}
  .ui-place__build-toolbar>span{font-size:var(--caption-size);color:var(--text-secondary);}
  .ui-place__build-workspace{flex:1;min-height:0;overflow:auto;}
</style>

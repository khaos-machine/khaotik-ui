<script>
  import ProjectReferencePicker from './internal/ProjectReferencePicker.svelte'
  import ArtworkWorkspace from './internal/ArtworkWorkspace.svelte'
  import AppearanceGenerationStatus from './internal/AppearanceGenerationStatus.svelte'
  import Button from './Button.svelte'
  import Icon from './Icon.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  import StatusPill from './StatusPill.svelte'
  /** @typedef {import('./lib/object-workbench.js').ObjectWorkspace} ObjectWorkspace */
  /** @typedef {import('./lib/object-workbench.js').ObjectBrief} ObjectBrief */
  /**
   * @typedef {Object} Props
   * @property {ObjectWorkspace|null} [workspace] Complete engine-owned object artwork read model.
   * @property {ObjectBrief|null} [brief] Persistent host-owned direction draft.
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
   * @property {(field:'form'|'materials'|'state'|'authoredScale'|'treatment',value:string)=>void} [onchange] Change authored direction.
   * @property {(values:string[])=>void} [ondetails] Edit distinctive details for this set.
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
   */
  /** @type {Props} */
  let {workspace=null,brief=null,references=[],candidateId='',inspectingId='',imageURLs={},mediaUrl='',mediaLoading=false,mediaError='',correction='',notes='',treatment='',dirty=false,busy=false,error='',notice='',generationRequestId='',generationError='',returnLabel='Back to objects',onback=undefined,onchange=undefined,ondetails=undefined,onsave=undefined,onrevert=undefined,ongenerate=undefined,onpreview=undefined,oninspect=undefined,onreference=undefined,onupload=undefined,oncorrection=undefined,onnotes=undefined,onreview=undefined,onuse=undefined,onpublish=undefined}=$props()
  let referencePickerOpen=$state(false)
  let tab=$state('form'),feature=$state(''),toolsOpen=$state(true),focused=$state(false)
  const candidate=$derived(workspace?.candidates.find(c=>c.revision.id===candidateId))
  const inspected=$derived([...workspace?.references??[],...workspace?.styleReferences??[],...workspace?.projectReferences??[]].find(r=>r.id===inspectingId))
  const job=$derived(generationRequestId?workspace?.jobs.find(j=>j.requestId===generationRequestId):workspace?.jobs.find(j=>j.revisionId===candidateId))
  const jobCandidate=$derived(workspace?.candidates.find(c=>c.revision.id===job?.revisionId))
  const correcting=$derived(!!candidate&&!!correction.trim())
  const gate=$derived(busy?'Wait for the current operation to finish.':workspace?.hasActiveJobs?'Artwork is being generated or saved.':inspected?'Return to the design to generate artwork.':!workspace?.generationReady?workspace?.generationReason||'Image generation is unavailable.':!brief?.form.trim()?'Describe the object and the area you want to design.':'')
  const stateLabel=$derived(candidate?.selected?'In use':candidate?.revision.review.state==='reviewed'?'Approved':candidate?.revision.review.state==='rejected'?'Rejected':'Needs review')
  const uid=$props.id()
  function editTool(value){tab=value;toolsOpen=true}
  function addFeature(value){const item=value.trim();if(item&&brief&&!brief.distinguishingDetails.includes(item)){ondetails?.([...brief.distinguishingDetails,item]);feature=''}}
</script>
{#snippet emptyView()}
 <div class="ui-object__object-stage"><Icon name="cube" /><span>PROP STUDY</span><h2>{workspace?.name??'Design an object'}</h2><p>{brief?.form||'Shape a distinctive prop, its materials and its condition.'}</p><small>Three-quarter hero + front, side, back and detail views</small>{#if workspace?.preparation.evidence.length}<Button variant="tool" icon="text-align-left" onclick={()=>editTool('form')}>{workspace.preparation.evidence.length} script excerpts</Button>{/if}</div>
{/snippet}

{#snippet mediaHud()}
  {#if inspected}<div class="ui-object__object-hud"><strong>{inspected.label}</strong><Button variant="tool" icon="arrow-left" onclick={()=>oninspect?.('')}>Back to design</Button></div>
  {:else if generationRequestId||job}<AppearanceGenerationStatus {job} requested={!!generationRequestId} requestError={generationError} version={jobCandidate?.label??'Object sheet'} purpose="object sheet" onreview={job?.publication==='saved'&&job.revisionId!==candidateId?()=>onpreview?.(job.revisionId):undefined} />
  {:else if candidate}<div class="ui-object__object-hud"><strong>{candidate.label}</strong><StatusPill text={stateLabel} tone="neutral" /></div>{/if}
{/snippet}
{#snippet selectionHud()}
  {#if brief&&!inspected}<div class="ui-object__object-hud ui-object__object-hud--summary"><span>{dirty?'Next generation · unsaved direction':workspace?.draft?'Next generation · saved direction':'Next generation · proposed direction'}</span><div><Button variant="tool" icon="cube" onclick={()=>editTool('form')}>{brief.distinguishingDetails.length} distinctive details</Button><Button variant="tool" icon="cube" title={brief.state} onclick={()=>editTool('details')}>{brief.state||'Set condition'}</Button><Button variant="tool" icon="images" onclick={()=>editTool('references')}>{references.length} image references</Button><Button variant="tool" icon="paint-brush" title={treatment} onclick={()=>editTool('materials')}>{treatment||'Visual treatment'}</Button></div></div>{/if}
{/snippet}
{#snippet designTools()}
 <div class="ui-object__object-tools">
  <SegmentedControl label="Object design tools" value={tab} items={[{value:'form',label:'Form'},{value:'materials',label:'Materials'},{value:'details',label:'Details'},{value:'references',label:'References'}]} onselect={value=>tab=value} />
  {#if brief&&workspace}
   {#if tab==='form'}
    <section><h3>Form and silhouette</h3><label>Object or collection<textarea aria-label="Object form" rows="5" value={brief.form} disabled={busy} oninput={e=>onchange?.('form',e.currentTarget.value)}></textarea></label><p class="ui-object__hint">Keep a collection distinct from an individual item. Shape and construction are design choices unless the script states them.</p></section>
    <details open><summary>Script context · {workspace.preparation.evidence.length}</summary><p class="ui-object__hint">Exact excerpts from the object’s recorded scenes. Context does not establish unstated materials or dimensions.</p>{#each workspace.preparation.evidence as evidence,index (index)}<div class="ui-object__evidence"><span>{evidence.detail}<small>Scene {evidence.sceneNumbers.join(', ')}</small></span></div>{/each}</details>
   {:else if tab==='materials'}
    <section><h3>Materials and finish</h3><div class="ui-object__presets">{#each ['Brushed metal','Worn wood','Matte plastic','Clear glass','Woven fabric','Weathered stone'] as value (value)}<Button variant="tool" disabled={busy} onclick={()=>onchange?.('materials',value)}>{value}</Button>{/each}</div><label>Materials<textarea aria-label="Materials and finish" rows="4" value={brief.materials} disabled={busy} oninput={e=>onchange?.('materials',e.currentTarget.value)}></textarea></label></section>
    <section><h3>Visual treatment</h3><div class="ui-object__presets">{#each ['Illustrated','Cinematic photograph','Stylized 3D','Ink sketch'] as value (value)}<Button variant="tool" disabled={busy} onclick={()=>onchange?.('treatment',value)}>{value}</Button>{/each}</div><label>Art direction<textarea aria-label="Visual treatment" rows="3" value={treatment} disabled={busy} oninput={e=>onchange?.('treatment',e.currentTarget.value)}></textarea></label></section>
   {:else if tab==='details'}
    <section><h3>Distinguishing details</h3><div class="ui-object__feature-list">{#each brief.distinguishingDetails as value (value)}<div><span>{value}</span><Button variant="tool" icon="x" title={`Remove ${value}`} disabled={busy} onclick={()=>ondetails?.(brief.distinguishingDetails.filter(item=>item!==value))} /></div>{/each}</div><form onsubmit={e=>{e.preventDefault();addFeature(feature)}}><input aria-label="New distinguishing detail" placeholder="A feature that makes this prop recognizable" bind:value={feature} disabled={busy} /><Button icon="plus" title="Add distinguishing detail" type="submit" disabled={busy||!feature.trim()} /></form></section>
    <section><h3>Condition and scale</h3><label>Current condition<textarea aria-label="Object condition" rows="3" value={brief.state} disabled={busy} oninput={e=>onchange?.('state',e.currentTarget.value)}></textarea></label><label>Authored scale<input aria-label="Authored scale" value={brief.authoredScale} disabled={busy} placeholder="For example, handheld or tabletop" oninput={e=>onchange?.('authoredScale',e.currentTarget.value)} /></label><p class="ui-object__hint">Scale stays unspecified until you choose it. No measurements are inferred.</p></section>
   {:else}
    <section><h3>Reference images</h3><Button variant="secondary" icon="images" onclick={()=>referencePickerOpen=true}>Browse project images…</Button><label class="ui-object__upload"><span>Add references</span><input aria-label="Upload object reference images" type="file" accept="image/png,image/jpeg" multiple disabled={busy} onchange={e=>{if(e.currentTarget.files?.length){onupload?.(Array.from(e.currentTarget.files));e.currentTarget.value=''}}} /></label></section>
    {#each [...workspace.references,...workspace.projectReferences??[]].filter(ref=>workspace.references.some(owned=>owned.id===ref.id)||references.some(use=>use.referenceId===ref.id)) as ref (ref.id)}<div class="ui-object__reference"><button type="button" aria-label={`Inspect ${ref.label}`} onclick={()=>oninspect?.(ref.id)}>{#if imageURLs[ref.id]}<img src={imageURLs[ref.id]} alt="" />{:else}<Icon name="image" />{/if}</button><span>{ref.label}</span><select aria-label={`Role for ${ref.label}`} disabled={busy} value={references.find(r=>r.referenceId===ref.id)?.role??''} onchange={e=>onreference?.(ref.id,e.currentTarget.value)}><option value="">Exclude</option>{#each ref.roles??['identity','detail','style'] as role (role)}<option value={role}>{role==='identity'?'Match identity':role==='detail'?'Details':role==='style'?'Style':'Layout'}</option>{/each}</select></div>{/each}
   {/if}
   <div class="ui-object__save-state"><small>{dirty?'Unsaved direction':workspace.draft?'Saved in project':'Proposed direction'}</small><Button variant="tool" icon="arrow-counter-clockwise" disabled={busy||!dirty} onclick={()=>onrevert?.()}>Revert</Button><Button variant="tool" icon="floppy-disk" disabled={busy||(!dirty&&!!workspace.draft)} onclick={()=>onsave?.()}>Save</Button></div>
   <details><summary>Story context</summary><p>{workspace.preparation.summary||'No context available. Author this design directly.'}</p></details>
  {/if}
 </div>
{/snippet}

{#snippet designCommands()}
  <div class="ui-object__commands">
  {#if candidate&&!inspected}<section aria-label="Revise object artwork"><h3>Revision</h3><label>Change this artwork<textarea aria-label="Correction direction" rows="2" value={correction} disabled={busy} oninput={e=>oncorrection?.(e.currentTarget.value)}></textarea></label><details><summary>Review notes</summary><label>Notes<textarea aria-label="Review notes" rows="2" value={notes} disabled={busy} oninput={e=>onnotes?.(e.currentTarget.value)}></textarea></label></details></section>{/if}
<Button variant={candidate&&!correcting?'secondary':'primary'} icon="sparkle" disabled={!!gate} describedby={`${uid}-generation`} onclick={()=>ongenerate?.(correcting)}>{busy?'Working…':correcting?'Generate correction':'Generate object sheet'}</Button><p class="ui-object__hint" id={`${uid}-generation`}>{gate||(dirty?'Saves your direction first. OpenAI bills your connected account.':'Uses OpenAI and saves artwork for your review.')}</p><p class="ui-object__hint" aria-label="Generation image inputs">{references.length?`${references.length} image references · ${references.filter(r=>r.role==='identity').length} matching identity`:'No image references selected. Uses direction only.'}</p>
  {#if candidate&&!inspected}<div class="ui-object__review-actions"><Button icon="x" disabled={busy||candidate.selected||candidate.revision.review.state==='rejected'} onclick={()=>onreview?.('rejected')}>Reject</Button><Button icon="check" disabled={busy||candidate.revision.review.state==='reviewed'} onclick={()=>onreview?.('reviewed')}>Approve</Button></div><Button variant={correcting?'secondary':'primary'} icon="check-circle" disabled={busy||candidate.selected||candidate.revision.review.state==='rejected'} onclick={()=>onuse?.()}>Use this design</Button><p class="ui-object__hint">{candidate.selected?'This object design is in use.':'Approves and uses this artwork in one action.'}</p>{/if}</div>
{/snippet}
{#snippet versionsView()}
  <nav aria-label="Object design versions">{#each workspace?.candidates??[] as item (item.revision.id)}<button type="button" aria-pressed={candidateId===item.revision.id&&!inspected} disabled={busy} onclick={()=>onpreview?.(item.revision.id)}>{#if item.images[0]&&imageURLs[item.images[0].id]}<img src={imageURLs[item.images[0].id]} alt="" />{:else}<Icon name="image" />{/if}<span>{item.label}<small>{item.selected?'In use':item.revision.review.state==='reviewed'?'Approved':item.revision.review.state==='rejected'?'Rejected':'Needs review'}</small></span></button>{/each}</nav>
{/snippet}
{#snippet statusView()}
  {#if error}<p class="ui-object__status-error" role="alert">{error}</p>{:else}<p role="status">{busy?'Working…':notice}</p>{/if}{#each workspace?.jobs.filter(j=>j.publication==='pending')??[] as pending (pending.id)}<Button icon="floppy-disk" disabled={busy} onclick={()=>onpublish?.(pending.id)}>Save returned artwork</Button>{/each}
{/snippet}
<ArtworkWorkspace name={workspace?.name??'Object'} {returnLabel} {mediaUrl} {mediaLoading} {mediaError} mediaAlt={`${workspace?.name??'Object'} ${inspected?'reference':'design sheet'}`} toolsTitle="Object design tools" dataUiId="object.appearance" bind:toolsOpen bind:focused {onback} empty={emptyView} hud={mediaHud} selection={selectionHud} tools={designTools} commands={designCommands} versions={versionsView} status={statusView} />
{#if referencePickerOpen}<ProjectReferencePicker references={workspace?.projectReferences??[]} selected={references} {imageURLs} oninspect={id=>oninspect?.(id)} onchoose={(id,role)=>{onreference?.(id,role);referencePickerOpen=false;oninspect?.('')}} onclose={()=>{referencePickerOpen=false;oninspect?.('')}} />{/if}
<style>
  .ui-object__object-stage{max-width:620px;padding:var(--spacing-lg);display:flex;flex-direction:column;align-items:center;text-align:center;gap:var(--spacing-md);}.ui-object__object-stage>span{font-size:var(--caption-size);letter-spacing:.1em;color:var(--text-secondary);}h2{font-size:var(--heading-md-size);margin:0;}h3{font-size:var(--label-md-size);margin:0;}p{font-size:var(--body-md-size);line-height:1.5;margin:0;}small,.ui-object__hint{font-size:var(--caption-size);line-height:1.5;color:var(--text-secondary);}small{display:block;}
  .ui-object__object-hud{display:flex;align-items:center;gap:var(--spacing-sm);width:max-content;max-width:100%;padding:var(--spacing-xs) var(--spacing-sm);background:color-mix(in oklab,var(--surface-raised) 86%,transparent);backdrop-filter:blur(20px);border:1px solid var(--border-default);border-radius:var(--radius-sm);font-size:var(--caption-size);}.ui-object__object-hud--summary{display:flex;flex-direction:column;align-items:flex-start;gap:var(--spacing-xs);}.ui-object__object-hud--summary>span{color:var(--text-secondary);}.ui-object__object-hud--summary>div :global(button){max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;}.ui-object__object-hud--summary>div{display:flex;gap:var(--spacing-xs);max-width:100%;overflow:hidden;}
  .ui-object__object-tools{display:flex;flex-direction:column;gap:var(--spacing-md);}section{display:flex;flex-direction:column;gap:var(--spacing-sm);}section+section,details{padding-top:var(--spacing-sm);border-top:1px solid var(--border-hairline);}label{display:flex;flex-direction:column;gap:var(--spacing-xs);font-size:var(--caption-size);color:var(--text-secondary);}textarea,input:not([type=file]),select{box-sizing:border-box;min-width:0;width:100%;font:inherit;font-size:var(--body-md-size);color:var(--text-primary);background:color-mix(in oklab,var(--surface-base) 55%,transparent);border:1px solid var(--border-default);border-radius:var(--radius-sm);padding:var(--spacing-xs) var(--spacing-sm);}textarea{resize:vertical;line-height:1.5;}input[type=file]{max-width:100%;font-size:var(--caption-size);}textarea:focus-visible,input:focus-visible,select:focus-visible,button:focus-visible{outline:2px solid var(--border-focus);outline-offset:2px;}
  form,.ui-object__save-state,.ui-object__evidence,.ui-object__feature-list>div,.ui-object__reference,.ui-object__review-actions{display:flex;align-items:center;gap:var(--spacing-xs);}form input,.ui-object__save-state small,.ui-object__evidence>span,.ui-object__reference>span,.ui-object__feature-list span{flex:1;min-width:0;}summary{cursor:pointer;font-size:var(--body-md-size);}.ui-object__evidence,.ui-object__feature-list>div{padding:var(--spacing-xs) 0;font-size:var(--body-md-size);}.ui-object__evidence small{margin-top:2px;}.ui-object__presets{display:flex;flex-wrap:wrap;gap:var(--spacing-xs);}.ui-object__commands{display:flex;flex-direction:column;gap:var(--spacing-sm);}.ui-object__upload{padding:var(--spacing-sm);border:1px solid var(--border-default);border-radius:var(--radius-sm);}
  .ui-object__reference{padding:var(--spacing-xs) 0;font-size:var(--caption-size);}.ui-object__reference>button{display:grid;object-items:center;width:48px;height:36px;flex:none;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:transparent;color:var(--text-secondary);cursor:pointer;}.ui-object__reference img{width:100%;height:100%;object-fit:contain;}.ui-object__reference select{width:104px;}
  nav{display:flex;gap:var(--spacing-xs);padding:var(--spacing-sm);overflow:auto;}nav button{display:flex;align-items:center;gap:var(--spacing-xs);flex:none;padding:var(--spacing-xs);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:color-mix(in oklab,var(--surface-raised) 85%,transparent);color:var(--text-primary);font-size:var(--caption-size);cursor:pointer;}nav button[aria-pressed=true]{border-color:var(--border-focus);}nav img{width:80px;height:54px;object-fit:contain;}.ui-object__status-error{color:var(--tone-danger);}
</style>

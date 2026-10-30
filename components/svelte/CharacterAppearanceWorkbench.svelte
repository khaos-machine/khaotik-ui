<script>
  import ArtworkWorkspace from './internal/ArtworkWorkspace.svelte'
  import AppearanceSelectionHUD from './internal/AppearanceSelectionHUD.svelte'
  import {appearanceCategory} from './lib/appearance-palette.js'
  import AppearanceControls from './internal/AppearanceControls.svelte'
  import AppearanceGenerationStatus from './internal/AppearanceGenerationStatus.svelte'
  import Button from './Button.svelte'
  import Icon from './Icon.svelte'
  import EmptyState from './EmptyState.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  import StatusPill from './StatusPill.svelte'
  /** @typedef {import('./lib/appearance-workbench.js').AppearanceWorkspace} AppearanceWorkspace */
  /** @typedef {import('./lib/appearance-workbench.js').AppearanceBrief} AppearanceBrief */
  /**
   * @typedef {Object} Props
   * @property {{features:readonly {key:string,label:string,options:readonly string[],randomizable?:boolean}[],choices:Record<string,string>}|null} [look] Engine-offered editable visual proposals.
   * @property {Record<string,boolean>} [lookLocks] Choices protected from randomization.
   * @property {(key?:string,value?:string)=>void} [onlook] Edit one choice or randomize unlocked choices; never generates artwork.
   * @property {(key:string,locked:boolean)=>void} [onlooklock] Keep a choice during randomization.
   * @property {string} [generationRequestId] Current explicit generation request.
   * @property {string} [generationError] Retained submission failure.
   * @property {string} [generationPurpose] Purpose of that request.
   * @property {AppearanceWorkspace|null} [workspace] Exact host appearance workspace.
   * @property {AppearanceBrief|null} [brief] Host-owned direction draft.
   * @property {readonly {referenceId:string,role:string}[]} [references] Authored input roles.
   * @property {string} [purpose] Current sheet or headshot mode.
   * @property {string} [candidateId] Explicit candidate being viewed.
   * @property {string} [sourceSheetId] Headshot identity source.
   * @property {string} [sourceReferenceId] Existing image used directly as source.
   * @property {string} [inspectingId] Reference being inspected; empty returns to candidate.
   * @property {Record<string,string>} [imageURLs] Authenticated media keyed by reference identity.
   * @property {string} [mediaUrl] Resolved main image.
   * @property {boolean} [mediaLoading] Main image is being resolved.
   * @property {string} [mediaError] Image-read failure.
   * @property {string} [correction] Revision draft for the current candidate.
   * @property {string} [notes] Current review notes.
   * @property {boolean} [dirty] Appearance edits await saving.
   * @property {boolean} [busy] Prevent overlapping commands.
   * @property {string} [error] Retained operation failure.
   * @property {string} [notice] Operation feedback.
   * @property {string} [returnLabel] Back navigation label.
   * @property {()=>void} [onback] Return to character context.
   * @property {(purpose:'characterSheet'|'headshot')=>void} [onpurpose] Switch media without discarding drafts.
   * @property {(field:'identityLock'|'wardrobeLock',value:string)=>void} [onchange] Direct draft edits.
   * @property {()=>void} [onrevert] Explicitly discard unsaved appearance edits, never review drafts.
   * @property {()=>void} [onsave] Explicit optional draft save.
   * @property {(id:string,role:string)=>void} [onreference] Change an input role; empty excludes it.
   * @property {(id:string)=>void} [oninspect] Inspect a reference, or empty returns to the candidate.
   * @property {(id:string)=>void} [onsource] Choose a sheet as identity source.
   * @property {(id:string)=>void} [onusesource] Prepare a reference as a portrait source; never generates.
   * @property {(id:string)=>void} [onusesheet] Explicitly adopt existing artwork as a sheet.
   * @property {(correcting:boolean)=>void} [ongenerate] Generate once, saving edits first in the host.
   * @property {(state:'reviewed'|'rejected')=>void} [onreview] Review without changing the viewed candidate.
   * @property {()=>void} [onuse] Approve and select the current artwork through the engine.
   * @property {(value:string)=>void} [onnotes] Edit review notes.
   * @property {(value:string)=>void} [oncorrection] Edit revision instruction.
   * @property {(id:string)=>void} [onpreview] View a candidate without choosing it.
   * @property {(id:string)=>void} [onpublish] Save already returned artwork.
   * @property {(files:File[])=>void} [onupload] Import references without generating.
   */
  /** @type {Props} */
  let {look=null,lookLocks={},onlook=undefined,onlooklock=undefined,workspace=null,brief=null,references=[],purpose='characterSheet',candidateId='',sourceSheetId='',sourceReferenceId='',inspectingId='',imageURLs={},mediaUrl='',mediaLoading=false,mediaError='',correction='',notes='',dirty=false,busy=false,error='',notice='',returnLabel='Back to characters',onback=undefined,onpurpose=undefined,onchange=undefined,onrevert=undefined,onsave=undefined,onreference=undefined,oninspect=undefined,onsource=undefined,onusesource=undefined,onusesheet=undefined,ongenerate=undefined,onreview=undefined,onuse=undefined,onnotes=undefined,oncorrection=undefined,onpreview=undefined,onpublish=undefined,onupload=undefined,generationRequestId='',generationError='',generationPurpose='characterSheet'}=$props()
  let toolsOpen=$state(true),focused=$state(false),lookOpen=$state(true),lookCategory=$state('shape'),lookHairFeature=$state('hair')
  function editSelection(key){toolsOpen=true;lookOpen=true;lookCategory=appearanceCategory(key,look?.choices.form);lookHairFeature=key}
  const uid=$props.id()
  const generationJob=$derived(generationRequestId?workspace?.jobs.find(job=>job.requestId===generationRequestId):workspace?.jobs.find(job=>job.revisionId===candidateId))
  const showGeneration=$derived(!inspected&&(generationRequestId?generationPurpose===purpose:!!generationJob))
  const resultIndex=$derived(candidates.findIndex(item=>item.revision.id===generationJob?.revisionId))
  const resultName=$derived(resultIndex>=0?`${purpose==='headshot'?'Portrait':'Sheet'} ${candidates.length-resultIndex}`:'Artwork')
  const candidates=$derived(workspace?.candidates.filter(c=>c.revision.pages.some(p=>p.purpose===purpose))??[])
  const candidate=$derived(candidates.find(c=>c.revision.id===candidateId))
  const inspected=$derived([...workspace?.references??[],...workspace?.styleReferences??[]].find(r=>r.id===inspectingId))
  const correcting=$derived(!!candidate&&!!correction.trim()&&!dirty)
  const gate=$derived(busy?'Wait for the current operation to finish.':workspace?.hasActiveJobs?'Artwork is being generated.':!workspace?.generationReady?workspace?.generationReason||'Image generation is unavailable.':purpose==='headshot'&&!sourceSheetId&&!sourceReferenceId?'Choose a source sheet for this portrait.':purpose==='characterSheet'&&!brief?.identityLock.trim()?'Describe the character’s appearance.':'')
  const stateLabel=$derived(candidate?.selected?'In use':candidate?.revision.review.state==='reviewed'?'Approved':candidate?.revision.review.state==='rejected'?'Rejected':'Needs review')
</script>
{#snippet mode()}<SegmentedControl label="Character artwork" value={purpose} items={[{value:'characterSheet',label:'Sheet'},{value:'headshot',label:'Headshot'}]} onselect={value=>{if(!busy){onpurpose?.(value==='headshot'?'headshot':'characterSheet')}}} />{/snippet}
{#snippet emptyView()}<EmptyState title={workspace?.hasActiveJobs?'Creating artwork…':'Shape this character’s look'} description="Edit the appearance or add reference images, then generate artwork to review." icon="user-focus" />{/snippet}
{#snippet mediaHud()}    {#if showGeneration}<AppearanceGenerationStatus job={generationJob} requested={!!generationRequestId} requestError={generationError} version={resultName} purpose={purpose==='headshot'?'headshot':'character sheet'} onreview={generationJob?.publication==='saved'&&resultIndex>=0&&generationJob.revisionId!==candidateId?()=>onpreview?.(generationJob.revisionId):undefined} />{/if}
    {#if inspected}<div class="ui-appearance__media-hud"><strong>{inspected.label}</strong><Button variant="tool" icon="arrow-left" onclick={()=>oninspect?.('')}>Back to design</Button></div>
    {:else if candidate&&!showGeneration}<div class="ui-appearance__media-hud"><strong>{candidate.revision.name}</strong><StatusPill text={stateLabel} tone="neutral" /></div>{/if}
{/snippet}
{#snippet selectionHud()}    {#if look&&purpose==='characterSheet'&&!inspected&&!focused}<AppearanceSelectionHUD {look} {dirty} persisted={!!workspace?.draft} onedit={editSelection} />{/if}
{/snippet}
{#snippet designTools()}    {#if workspace&&brief}<div class="ui-appearance__tool-content">
      {#if inspected}<section><h3>Reference image</h3><p>{inspected.label}</p><div class="ui-appearance__actions">{#if inspected.canUseAsSheet}<Button disabled={busy} onclick={()=>onusesheet?.(inspected.id)}>Use as character sheet</Button>{/if}<Button disabled={busy} onclick={()=>onusesource?.(inspected.id)}>Use as portrait source</Button></div></section>{/if}
      {#if purpose==='characterSheet'}
        <section><h3>Appearance</h3>
          <label>Appearance direction<textarea aria-label="Appearance direction" rows="5" value={brief.identityLock} disabled={busy} oninput={event=>onchange?.('identityLock',event.currentTarget.value)}></textarea></label>
          <p class="ui-appearance__hint">Define face shape, hair texture, cut and hairline, complexion, body proportions and posture. Details absent from the script are design choices.</p>
          {#if look}<div class="ui-appearance__look-editor"><Button variant="tool" icon={lookOpen?'caret-down':'caret-right'} onclick={()=>lookOpen=!lookOpen}>Explore a look</Button>{#if lookOpen}<AppearanceControls {look} locks={lookLocks} {busy} bind:category={lookCategory} bind:hairFeature={lookHairFeature} onchange={onlook} onlock={onlooklock} />{/if}</div>{/if}
          <label>Wardrobe and details<textarea aria-label="Wardrobe and details" rows="2" value={brief.wardrobeLock} disabled={busy} oninput={event=>onchange?.('wardrobeLock',event.currentTarget.value)}></textarea></label>
          <div class="ui-appearance__save"><span>{dirty?'Unsaved changes':workspace.draft?'Saved in project':'Proposed appearance'}</span><Button variant="tool" title="Revert appearance edits" icon="arrow-counter-clockwise" disabled={busy||!dirty} onclick={()=>onrevert?.()}>Revert</Button><Button variant="tool" icon="floppy-disk" disabled={busy||(!dirty&&!!workspace.draft)} onclick={()=>onsave?.()}>Save appearance</Button></div>
        </section>
      {:else}<section><h3>Portrait source</h3><label>Source sheet<select aria-label="Source sheet" disabled={busy} value={sourceSheetId} onchange={event=>onsource?.(event.currentTarget.value)}><option value="">{sourceReferenceId?'Using reference image':'Choose a sheet'}</option>{#each workspace.candidates.filter(c=>c.canSourceHeadshot) as c (c.revision.id)}<option value={c.revision.id}>{c.revision.name}{c.selected?' · In use':''}</option>{/each}</select></label><p class="ui-appearance__hint">The portrait keeps this sheet’s face, hair and proportions.</p></section>{/if}
      {#if candidate&&!inspected}<section aria-label="Revise artwork"><h3>Revision</h3><label>Change this artwork<textarea aria-label="Correction direction" rows="3" value={correction} disabled={busy} oninput={event=>oncorrection?.(event.currentTarget.value)} placeholder="What should change? Everything else stays the same."></textarea></label><details><summary>Review notes</summary><textarea aria-label="Review notes" rows="2" value={notes} disabled={busy} oninput={event=>onnotes?.(event.currentTarget.value)}></textarea></details></section>{/if}
      <details><summary>Character context</summary>{#if workspace.preparation.summary}<p>{workspace.preparation.summary}</p>{/if}{#each workspace.preparation.evidence as fact,index (index)}<p>{fact.detail}<small>{fact.sceneNumbers.map(n=>`Scene ${n}`).join(', ')}</small></p>{/each}{#each brief.unknowns as unknown,index (index)}<p class="ui-appearance__hint">{unknown.detail}</p>{/each}</details>
      <details><summary>Reference images · {workspace.references.length}</summary>
        {#if onupload}<label class="ui-appearance__upload"><Icon name="upload-simple" /> Add reference images<input aria-label="Add reference images" type="file" accept="image/png,image/jpeg" multiple disabled={busy} onchange={event=>{const files=Array.from(event.currentTarget.files??[]);if(files.length)onupload?.(files);event.currentTarget.value=''}} /></label>{/if}
        <p class="ui-appearance__hint">Identity keeps this person’s features. Style uses only the illustration treatment.</p>
        {#each workspace.references as ref (ref.id)}<div class="ui-appearance__reference"><button class="ui-appearance__thumbnail" type="button" aria-label={`Inspect ${ref.label}`} onclick={()=>oninspect?.(ref.id)}>{#if imageURLs[ref.id]}<img src={imageURLs[ref.id]} alt="" />{:else}<Icon name="image" />{/if}</button><span>{ref.label}</span><select aria-label={`Role for ${ref.label}`} disabled={busy} value={references.find(r=>r.referenceId===ref.id)?.role??''} onchange={event=>onreference?.(ref.id,event.currentTarget.value)}><option value="">Exclude</option><option value="identity">Identity</option><option value="detail">Concept / details</option><option value="wardrobe">Wardrobe</option><option value="style">Style</option></select></div>{/each}
        {#if workspace.styleReferences.length}<details><summary>Style from other characters</summary><p class="ui-appearance__hint">Use drawing style without borrowing the other person’s face, hair or body.</p>{#each workspace.styleReferences as ref (ref.id)}<div class="ui-appearance__reference"><button class="ui-appearance__thumbnail" type="button" aria-label={`Inspect ${ref.label}`} onclick={()=>oninspect?.(ref.id)}>{#if imageURLs[ref.id]}<img src={imageURLs[ref.id]} alt="" />{:else}<Icon name="image" />{/if}</button><span>{ref.label}</span><Button variant="tool" disabled={busy} onclick={()=>onreference?.(ref.id,references.some(r=>r.referenceId===ref.id)?'':'style')}>{references.some(r=>r.referenceId===ref.id)?'Remove':'Use style'}</Button></div>{/each}</details>{/if}
      </details>
</div>{/if}{/snippet}
{#snippet designCommands()}{#if workspace&&brief}<div class="ui-appearance__commands">
      <section class="ui-appearance__generate" aria-label="Artwork generation">
        <Button variant={candidate&&!correcting?'secondary':'primary'} icon="sparkle" disabled={!!gate} describedby={`${uid}-generation`} onclick={()=>ongenerate?.(correcting)}>{busy?'Working…':correcting?'Generate correction':purpose==='headshot'?'Generate headshot':'Generate character sheet'}</Button>
        <p class="ui-appearance__hint" id={`${uid}-generation`}>{gate|| (dirty?'Saves your changes first. OpenAI bills your connected account.':'Uses OpenAI and bills your connected account. Artwork is saved for review.')}</p>
      </section>
      {#if candidate&&!inspected}<section aria-label="Review artwork"><div class="ui-appearance__actions"><Button disabled={busy||candidate.revision.review.state==='rejected'} onclick={()=>onreview?.('rejected')}>Reject</Button><Button disabled={busy||candidate.revision.review.state==='reviewed'} onclick={()=>onreview?.('reviewed')}>Approve</Button></div><Button variant={correcting?'secondary':'primary'} disabled={busy||candidate.selected||candidate.revision.review.state==='rejected'} onclick={()=>onuse?.()}>{purpose==='headshot'?'Use as portrait':'Use this design'}</Button><p class="ui-appearance__hint">{candidate.selected?'This artwork is in use.':candidate.revision.review.state==='rejected'?'Approve this artwork or revise it before using it.':'Approves and uses this artwork in one action.'}</p></section>{/if}
</div>
    {/if}{/snippet}
{#snippet versionsView()}<nav class="ui-appearance__versions" aria-label="Design versions">{#each candidates as item,index (item.revision.id)}<button type="button" aria-pressed={candidateId===item.revision.id&&!inspected} disabled={busy} onclick={()=>{onpreview?.(item.revision.id)}}>{#if item.images[0]&&imageURLs[item.images[0].id]}<img src={imageURLs[item.images[0].id]} alt="" />{:else}<Icon name="image" />{/if}<span>{purpose==='headshot'?'Portrait':'Sheet'} {candidates.length-index}<small>{item.selected?'In use':item.revision.review.state==='reviewed'?'Approved':item.revision.review.state==='rejected'?'Rejected':'Needs review'}</small></span></button>{/each}{#if !candidates.length}{#each workspace?.references??[] as ref (ref.id)}<button type="button" aria-pressed={inspectingId===ref.id} onclick={()=>oninspect?.(ref.id)}>{#if imageURLs[ref.id]}<img src={imageURLs[ref.id]} alt="" />{/if}<span>{ref.label}</span></button>{/each}{/if}</nav>{/snippet}
{#snippet statusView()}<div class="ui-appearance__status">{#if error}<p role="alert">{error}</p>{:else if !showGeneration}<p role="status">{busy?'Working…':notice}</p>{/if}{#each workspace?.jobs.filter(job=>job.publication==='pending')??[] as job (job.id)}<Button disabled={busy} onclick={()=>onpublish?.(job.id)}>Save returned artwork</Button>{/each}</div>{/snippet}
<ArtworkWorkspace name={workspace?.name??'Character'} {returnLabel} {mediaUrl} {mediaLoading} {mediaError} mediaAlt={`${workspace?.name??'Character'} ${inspected?'reference':purpose==='headshot'?'headshot':'character sheet'}`} toolsTitle="Character design tools" dataUiId="character.appearance" bind:toolsOpen bind:focused {onback} toolbar={mode} empty={emptyView} hud={mediaHud} selection={selectionHud} tools={designTools} commands={designCommands} versions={versionsView} status={statusView} />
<style>
.ui-appearance__media-hud{position:absolute;top:var(--spacing-md);left:var(--spacing-md);display:flex;align-items:center;gap:var(--spacing-sm);max-width:calc(100% - 32px);padding:var(--spacing-xs) var(--spacing-sm);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:color-mix(in oklab,var(--surface-raised) 90%,transparent);backdrop-filter:blur(20px);font-size:var(--body-md-size);}
section{display:flex;flex-direction:column;gap:var(--spacing-sm);}
section+section{border-top:1px solid var(--border-hairline);padding-top:var(--spacing-sm);}
h3{font-size:var(--label-md-size);font-weight:600;margin:0;}
label{display:flex;flex-direction:column;gap:var(--spacing-xs);font-size:var(--caption-size);color:var(--text-secondary);}
textarea,select{box-sizing:border-box;max-width:100%;width:100%;font:inherit;font-size:var(--body-md-size);color:var(--text-primary);background:color-mix(in oklab,var(--surface-base) 55%,transparent);border:1px solid var(--border-default);border-radius:var(--radius-sm);padding:var(--spacing-xs) var(--spacing-sm);}
textarea{resize:vertical;line-height:1.5;min-height:52px;}
textarea:focus-visible,select:focus-visible,button:focus-visible{outline:2px solid var(--border-focus);outline-offset:2px;}
p{font-size:var(--body-md-size);line-height:1.55;margin:0;}
.ui-appearance__hint,.ui-appearance__save{font-size:var(--caption-size);color:var(--text-secondary);}
.ui-appearance__save,.ui-appearance__actions{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-xs);}
.ui-appearance__actions{justify-content:flex-start;}
.ui-appearance__tool-content details{font-size:var(--body-md-size);border-top:1px solid var(--border-hairline);padding-top:var(--spacing-sm);}
.ui-appearance__tool-content summary{cursor:pointer;}
.ui-appearance__tool-content details>p,.ui-appearance__tool-content details>textarea{margin-top:var(--spacing-sm);}
.ui-appearance__tool-content small{display:block;color:var(--text-secondary);}
.ui-appearance__look-editor{order:-1;}
section>h3{order:-2;}
.ui-appearance__look-editor{display:flex;flex-direction:column;gap:var(--spacing-sm);}
.ui-appearance__tool-content{flex:1;min-height:0;overflow:auto;padding:var(--spacing-md);display:flex;flex-direction:column;gap:var(--spacing-md);}
.ui-appearance__commands{flex:0 0 auto;display:flex;flex-direction:column;gap:var(--spacing-sm);padding:var(--spacing-sm) var(--spacing-md);border-top:1px solid var(--border-default);background:color-mix(in oklab,var(--surface-raised) 94%,transparent);}
.ui-appearance__commands .ui-appearance__hint{line-height:1.4;}
.ui-appearance__reference{display:flex;align-items:center;gap:var(--spacing-xs);padding:var(--spacing-xs) 0;}
.ui-appearance__reference>span{flex:1;min-width:0;font-size:var(--caption-size);overflow-wrap:anywhere;}
.ui-appearance__reference select{width:100px;}
.ui-appearance__thumbnail{display:grid;place-items:center;width:44px;height:44px;flex:0 0 44px;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:transparent;color:var(--text-secondary);cursor:pointer;}
.ui-appearance__thumbnail img{width:100%;height:100%;object-fit:contain;}
.ui-appearance__upload{margin-top:var(--spacing-sm);padding:var(--spacing-sm);border:1px solid var(--border-default);border-radius:var(--radius-sm);}
.ui-appearance__upload input{max-width:100%;font-size:var(--caption-size);}
.ui-appearance__versions{grid-column:1;display:flex;gap:var(--spacing-xs);overflow:auto;min-width:0;padding:var(--spacing-sm);}
.ui-appearance__versions button{display:flex;align-items:center;gap:var(--spacing-xs);flex:0 0 auto;max-width:220px;padding:var(--spacing-xs);background:color-mix(in oklab,var(--surface-raised) 85%,transparent);border:1px solid var(--border-default);border-radius:var(--radius-sm);color:var(--text-primary);cursor:pointer;font-size:var(--caption-size);}
.ui-appearance__versions button[aria-pressed=true]{border-color:var(--border-focus);}
.ui-appearance__versions img{width:72px;height:48px;object-fit:contain;}
.ui-appearance__versions small{display:block;color:var(--text-secondary);}
.ui-appearance__status{grid-column:1/-1;display:flex;align-items:center;gap:var(--spacing-sm);min-height:28px;padding:var(--spacing-xs) var(--spacing-sm);border-top:1px solid var(--border-default);}
.ui-appearance__status p{font-size:var(--caption-size);color:var(--text-secondary);}
.ui-appearance__status [role=alert]{color:var(--tone-danger);}
.ui-appearance__media-hud{position:static;width:max-content;max-width:100%;}
.ui-appearance__tool-content{overflow:visible;min-height:auto;padding:0;}
.ui-appearance__commands{padding:0;border:0;background:transparent;}
.ui-appearance__status{padding:0;border:0;min-height:0;}
</style>

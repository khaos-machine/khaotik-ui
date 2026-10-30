<script>
  import ContextualDialog from './internal/ContextualDialog.svelte'
  import Button from './Button.svelte'
  import Icon from './Icon.svelte'
  import { formatTimecode } from './lib/timeline.js'
  /** @typedef {{id:string,name:string,ready:boolean,reason:string}} ExportFormat */
  /** @typedef {{name:string,durationMs:number,scenes:number,pictures:number,readings:number}} Summary */
  /** @typedef {{scenes:readonly {id:string,name:string,number:number}[],ready:boolean,summary:Summary|null,formats:readonly ExportFormat[],warnings:readonly {sceneId:string,kind:string,message:string}[],refusals:readonly string[]}} Preflight */
  /** @typedef {{name:string,status:string,current:string,completed:number|null,total:number|null,error:string,result:{directory:string,file:string,manifest:string}|null}} ExportJob */
  /**
   * @typedef {Object} Props
   * @property {boolean} [open] Show the contextual export workspace.
   * @property {string} [target] Scene selected when export opens.
   * @property {string} [scope] Scene or whole-story scope.
   * @property {readonly string[]} [sceneIds] Chosen scene identifiers, in any selection order.
   * @property {(id:string,selected:boolean)=>void} [onscene] Change a scene selection.
   * @property {string} [format] Engine-owned output format identifier.
   * @property {string} [rate] Rational output frame rate.
   * @property {boolean} [drafts] Explicitly permit draft cards for missing chosen frames.
   * @property {string} [destination] New export folder path.
   * @property {boolean} [loading] Preflight is being read.
   * @property {boolean} [starting] An export submission is awaiting admission.
   * @property {Preflight|null} [preflight] Engine-owned counts, warnings and refusals.
   * @property {ExportJob|null} [job] Retained job state, independent of dialog visibility.
   * @property {string} [error] Preserved operation failure.
   * @property {(key:'scope'|'format'|'rate',value:string)=>void} [onoption] Change an export option.
   * @property {(value:boolean)=>void} [ondrafts] Choose placeholder handling.
   * @property {(value:string)=>void} [ondestination] Edit destination.
   * @property {()=>void} [onchoose] Ask the host for a new folder destination.
   * @property {()=>void} [onexport] Start this reviewed local export.
   * @property {()=>void} [oncancel] Cancel the active export.
   * @property {()=>void} [onretry] Check job status after a transport failure.
   * @property {()=>void} [onreveal] Reveal the completed export folder.
   * @property {()=>void} [onclose] Hide this dialog without canceling a job.
   */
  /** @type {Props} */
  let {open=false,target='',scope='scene',sceneIds=[],onscene=undefined,format='premiere',rate='24',drafts=false,destination='',loading=false,starting=false,preflight=null,job=null,error='',onoption=undefined,ondrafts=undefined,ondestination=undefined,onchoose=undefined,onexport=undefined,oncancel=undefined,onretry=undefined,onreveal=undefined,onclose=undefined}=$props()
  const busy=$derived(starting||job?.status==='queued'||job?.status==='running')
  const canExport=$derived(!!preflight?.ready&&!busy&&!loading)
  const needsDestination=$derived(!destination.trim()||destination===job?.result?.directory)
  const visualOnly=$derived(format==='storyboard-pdf'||format==='storyboard-png'||format==='frames')
  const summary=$derived(preflight?.summary)
  const id=$props.id()
</script>

<ContextualDialog {open} {target} title="Export Composer" closeLabel="Close Composer export" {onclose}>
  <div class="composer-export__export-grid">
    <section class="composer-export__settings" aria-label="Export settings">
      <label for={id+'-format'}>Format</label>
      <select id={id+'-format'} bind:value={()=>format,value=>onoption?.('format',value)} disabled={busy}>
        {#if preflight?.formats.length}{#each preflight.formats as choice (choice.id)}<option value={choice.id}>{choice.name}</option>{/each}{:else}<option value={format}>{loading?'Reading export formats…':'Choose a project to see export formats'}</option>{/if}
      </select>
      <label for={id+'-scope'}>Range</label>
      <select id={id+'-scope'} bind:value={()=>scope,value=>onoption?.('scope',value)} disabled={busy}><option value="scene">Current scene</option><option value="selected">Selected scenes</option><option value="story">Whole story</option></select>
      {#if scope==='selected'}
        <fieldset class="composer-export__scenes" disabled={busy}><legend>Scenes · {sceneIds.length} selected</legend><div class="composer-export__scene-list">{#each preflight?.scenes??[] as scene (scene.id)}<label><input type="checkbox" checked={sceneIds.includes(scene.id)} onchange={e=>onscene?.(scene.id,e.currentTarget.checked)} /><span class="composer-export__scene-number">{scene.number}</span><span>{scene.name}</span></label>{/each}</div><p class="composer-export__note">Exported consecutively in story order.</p></fieldset>
      {/if}
      {#if format!=='wav'&&!visualOnly}
        <label for={id+'-rate'}>Frame rate</label>
        <select id={id+'-rate'} bind:value={()=>rate,value=>onoption?.('rate',value)} disabled={busy}><option value="24">24 fps</option><option value="24000/1001">23.976 fps</option><option value="25">25 fps</option><option value="30">30 fps</option><option value="30000/1001">29.97 fps</option></select>
      {/if}
      {#if format!=='wav'}
        <label class="composer-export__drafts"><input type="checkbox" checked={drafts} disabled={busy} onchange={e=>ondrafts?.(e.currentTarget.checked)} />Include draft cards for missing frames</label>
      {/if}
      <div class="composer-export__destination"><label for={id+'-destination'}>New export folder</label><div class="composer-export__path"><input id={id+'-destination'} value={destination} placeholder="Choose where this export goes" disabled={busy} oninput={e=>ondestination?.(e.currentTarget.value)} /><Button icon="folder-open" disabled={busy} onclick={onchoose}>Choose…</Button></div></div>
      <p class="composer-export__note">Existing folders are kept. Each export creates a new folder with its media and source manifest.</p>
    </section>
    <section class="composer-export__review" aria-label="Export preflight" aria-busy={loading}>
      <div class="composer-export__review-heading"><Icon name={format==='wav'?'waveform':format==='after-effects'?'stack':'film-strip'} /><strong>{visualOnly?(format==='frames'?'Frame images':'Storyboard'):format==='wav'?'Audio reading':format==='mp4'?'Story playback':'Editable timeline'}</strong><span>{visualOnly?(format==='frames'?'Original resolution · numbered in story order':'A4 landscape · six panels · grayscale · 216 dpi'):format==='wav'?'48 kHz · stereo PCM':'1920 × 1080 · uncropped'}</span></div>
      {#if loading}<p role="status">Checking the chosen media and timing…</p>{/if}
      {#if summary}<h3>{summary.name}</h3><dl>{#if !visualOnly}<div><dt>Duration</dt><dd>{formatTimecode(summary.durationMs/1000)}</dd></div>{/if}<div><dt>Scenes</dt><dd>{summary.scenes}</dd></div>{#if format!=='wav'}<div><dt>{visualOnly?'Shots':'Picture clips'}</dt><dd>{summary.pictures}</dd></div>{/if}{#if !visualOnly}<div><dt>Chosen readings</dt><dd>{summary.readings}</dd></div>{/if}</dl>{/if}
      <p class="composer-export__note">{visualOnly?(format==='frames'?'Collects one chosen image per authored shot, in story order. Original resolution and image bytes are preserved. Source identities and directions are kept in the manifest.':'Uses one chosen frame per authored shot, including shots awaiting timing. Each scene starts on a new page. Full directions are kept in the manifest.'):'Uses chosen frames and readings. Review candidates are kept in the project; they are not chosen automatically.'}</p>
      {#if preflight?.refusals.length}<div class="composer-export__refusals" role="alert">{#each preflight.refusals as refusal,i (i)}<p>{refusal}</p>{/each}</div>{/if}
      {#if preflight?.warnings.length}<details><summary>{preflight.warnings.length} export notes</summary><ul>{#each preflight.warnings as warning,i (i)}<li>{warning.message}</li>{/each}</ul></details>{/if}
      {#if format==='premiere'}<p class="composer-export__note">Import timeline.xml in Premiere Pro. Keep its collected media folder beside the timeline.</p>{:else if format==='final-cut'}<p class="composer-export__note">In Final Cut Pro, use File → Import → XML and choose timeline.fcpxml. Keep the media folder beside it.</p>{:else if format==='resolve'}<p class="composer-export__note">In DaVinci Resolve, use File → Import → Timeline and choose timeline.xml. Import the collected source clips when prompted.</p>{:else if format==='blender'}<p class="composer-export__note">Blender 4.4 or newer: open composer.py in the Text Editor and Run Script. Adds a new Video Sequencer scene; your existing scenes are kept.</p>{:else if format==='after-effects'}<p class="composer-export__note">In After Effects, run composition.jsx through File → Scripts → Run Script File.</p>{/if}
    </section>
  </div>
  {#if job}<section class="composer-export__job" aria-label="Export progress" aria-live="polite">
    <div><strong>{job.status==='completed'?'Last export completed':job.status==='failed'?'Export failed':job.status==='canceled'?'Export cancelled':'Exporting…'}</strong><span>{job.name} · {job.current}</span></div>
    {#if busy}<progress max={job.total??undefined} value={job.completed??undefined} aria-label="Export progress"></progress><Button icon="stop" onclick={oncancel}>Cancel export</Button><small>Export continues if you close this dialog.</small>{/if}
    {#if job.result}<p class="composer-export__output-path">{job.result.file}</p><Button icon="folder-open" onclick={onreveal}>Show export folder</Button>{#if destination===job.result.directory}<p class="composer-export__note">Export… will ask for a new folder. This export is kept.</p>{/if}{/if}
    {#if job.error}<p class="composer-export__error" role="alert">{job.error}</p>{/if}
  </section>{/if}
  {#if error}<p class="composer-export__error" role="alert">{error}</p>{#if busy}<Button icon="arrow-clockwise" onclick={onretry}>Check export status</Button>{:else}<Button icon="arrow-clockwise" onclick={onretry}>Check again</Button>{/if}{/if}
  <footer><span id={id+'-export-state'}>{needsDestination?'Export… opens the destination dialog.':'Local export · no generation'}</span><Button onclick={onclose}>Close</Button><Button variant="primary" icon="export" describedby={id+'-export-state'} disabled={!canExport} onclick={onexport}>{busy?'Exporting…':needsDestination?'Export…':'Export'}</Button></footer>
</ContextualDialog>

<style>
  .composer-export__export-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--spacing-lg);font-size:var(--data-md-size);}
  .composer-export__settings{display:grid;align-content:start;grid-template-columns:90px minmax(0,1fr);align-items:center;gap:var(--spacing-sm);}
  select,input:not([type='checkbox']){box-sizing:border-box;width:100%;min-width:0;background:var(--surface-base);color:var(--text-primary);border:1px solid var(--border-default);border-radius:var(--radius-sm);padding:6px 8px;font:inherit;}
  select:focus-visible,input:focus-visible{outline:2px solid var(--border-focus);outline-offset:2px;}
  .composer-export__drafts,.composer-export__destination,.composer-export__settings>.composer-export__note{grid-column:1/-1;}.composer-export__drafts{display:flex;gap:var(--spacing-xs);align-items:center;margin:var(--spacing-xs) 0;}.composer-export__drafts input{accent-color:var(--action-primary);}
  .composer-export__scenes{grid-column:1/-1;min-width:0;margin:0;border:1px solid var(--border-default);border-radius:var(--radius-sm);padding:var(--spacing-sm);}.composer-export__scene-list{max-height:200px;overflow:auto;}.composer-export__scene-list label{display:flex;align-items:baseline;gap:var(--spacing-xs);padding:5px 0;}.composer-export__scene-list input{accent-color:var(--action-primary);}.composer-export__scene-number{min-width:2ch;color:var(--text-secondary);font-variant-numeric:tabular-nums;}
  .composer-export__destination>label{display:block;margin-bottom:var(--spacing-xs);}.composer-export__path{display:flex;gap:var(--spacing-xs);}.composer-export__path input{flex:1;}
  .composer-export__review{border-left:1px solid var(--border-default);padding-left:var(--spacing-lg);min-width:0;}.composer-export__review-heading{display:flex;gap:var(--spacing-xs);flex-wrap:wrap;align-items:center;}.composer-export__review-heading span{flex-basis:100%;color:var(--text-secondary);font-size:var(--caption-size);}
  h3{font-size:var(--body-md-size);line-height:1.4;margin:var(--spacing-md) 0;}.composer-export__note{color:var(--text-secondary);line-height:1.5;margin:var(--spacing-sm) 0;}.composer-export__review dl{display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-sm);}.composer-export__review dl>div{display:flex;justify-content:space-between;gap:var(--spacing-sm);}.composer-export__review dt{color:var(--text-secondary);}.composer-export__review dd{margin:0;font-variant-numeric:tabular-nums;}
  .composer-export__refusals{color:var(--tone-warning);line-height:1.5;}.composer-export__error{color:var(--tone-danger);overflow-wrap:anywhere;}.composer-export__refusals p{margin:var(--spacing-xs) 0;}details{margin:var(--spacing-md) 0;}details ul{padding-left:var(--spacing-md);line-height:1.5;max-height:160px;overflow:auto;}
  .composer-export__job{border-top:1px solid var(--border-default);margin-top:var(--spacing-md);padding-top:var(--spacing-md);font-size:var(--data-md-size);}.composer-export__job>div{display:flex;gap:var(--spacing-sm);align-items:center;}.composer-export__job span,.composer-export__job small{color:var(--text-secondary);}.composer-export__job small{display:block;margin-top:var(--spacing-xs);}progress{width:100%;height:6px;accent-color:var(--action-primary);margin:var(--spacing-sm) 0;}.composer-export__output-path{overflow-wrap:anywhere;user-select:text;color:var(--text-secondary);}
  footer{display:flex;justify-content:flex-end;align-items:center;gap:var(--spacing-sm);margin-top:var(--spacing-lg);padding-top:var(--spacing-md);border-top:1px solid var(--border-default);font-size:var(--caption-size);}footer>span{margin-right:auto;color:var(--text-secondary);}
  @media(max-width:680px){.composer-export__export-grid{grid-template-columns:1fr;}.composer-export__review{border-left:0;border-top:1px solid var(--border-default);padding:var(--spacing-md) 0 0;}}
  @container viewport (max-width:680px){.composer-export__export-grid{grid-template-columns:1fr;}.composer-export__review{border-left:0;border-top:1px solid var(--border-default);padding:var(--spacing-md) 0 0;}}
</style>

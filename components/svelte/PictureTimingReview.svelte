<script>
 import {tick} from 'svelte'
 import Icon from './Icon.svelte'
 import Button from './Button.svelte'
 import ContextualDialog from './internal/ContextualDialog.svelte'
 /** @typedef {{startMs:number,durationMs:number}} Range */
 /**
  * @typedef {Object} Props
  * @property {{kind?:string,unresolvedCount?:number,revision:string,sceneId:string,canApply:boolean,reason:string,changes:readonly {shotId:string,title:string,before:Range,after:Range|null}[]}|null} [repair] Revision-bound engine repair preview.
  * @property {string} [sceneLabel] Scene being repaired.
  * @property {boolean} [busy] An edit is pending.
  * @property {boolean} [dirty] A shot has unsaved changes.
  * @property {string} [error] Full command failure.
  * @property {(revision:string)=>Promise<void>} [onapply] Apply exactly this reviewed timing repair.
  * @property {()=>void} [onopen] Pause playback before review.
  */
 /** @type {Props} */
 let {repair=null,sceneLabel='',busy=false,dirty=false,error='',onapply=undefined,onopen=undefined}=$props()
 let open=$state(false)
 /** @type {Props['repair']} */
 let reviewed=$state.raw(null)
 const count=$derived(Math.max(repair?.changes.length??0,repair?.unresolvedCount??0))
 const reading=$derived(repair?.kind==='reading')
 const blocked=$derived(open&&reviewed?.revision!==repair?.revision?'The story changed. Close and review the latest timing before applying.':busy?'An edit is running.':dirty?'Save or discard shot changes before repairing timing.':repair?.reason||'')
 /** @param {Range} value */
 const range=value=>`${(value.startMs/1000).toFixed(3)}–${((value.startMs+value.durationMs)/1000).toFixed(3)} s`
 async function apply(){if(reviewed)await onapply?.(reviewed.revision);await tick();if(!repair?.changes.length)open=false}
</script>
{#if count}
 <section class="picture-timing__timing-notice" aria-label="Picture timing conflicts">
  <span><Icon name="warning" /> {count} {(repair?.unresolvedCount??0)>0?'shots need timing review':count===1?'overlapping shot':'overlapping shots'}</span>
  <Button variant="tool" icon="scissors" onclick={()=>{onopen?.();reviewed=repair;open=true}} title="Review shot timing"><span aria-hidden="true">Review</span><span class="picture-timing__sr">Review shot timing…</span></Button>
 </section>
{/if}
<ContextualDialog {open} title="Review shot timing" target={sceneLabel} closeLabel="Close timing review" onclose={()=>open=false}>
 {#if reading}<p>The reading changed. Shots and chosen artwork are retained. Proposed ranges follow matching action and dialogue timings, including pauses. Review these changes before using the shots with this reading.</p>{:else if (repair?.unresolvedCount??0)>0}<p>These shots are retained but need ranges for current playback. Select them in Coverage to set their timing.</p>{:else}<p>Match the picture track to current playback. Later shots start when the earlier shot ends. The scene reading and total duration stay unchanged.</p>{/if}
 <table><thead><tr><th>Shot</th><th>Current range</th><th>Proposed range</th></tr></thead><tbody>
 {#each reviewed?.changes??[] as change (change.shotId)}<tr><th scope="row">{change.title}</th><td>{range(change.before)}</td><td>{change.after?range(change.after):'Remove from track · fully hidden'}</td></tr>{/each}
 </tbody></table>
 <p class="picture-timing__note">Artwork and revision history are retained{reading?'':', including shots removed from the track'}. Nothing changes until you apply this repair.</p>
 {#if blocked}<p role="status">{blocked}</p>{/if}
 {#if error}<p class="picture-timing__error" role="alert">{error}</p>{/if}
 <footer><Button disabled={busy} onclick={()=>open=false}>Cancel</Button><Button variant="primary" disabled={!!blocked||!repair?.canApply} onclick={()=>void apply()}>{busy?'Applying…':'Apply timing repair'}</Button></footer>
</ContextualDialog>
<style>
 .picture-timing__timing-notice{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:28px;padding:2px 10px;border-bottom:1px solid var(--border-default);font-size:var(--data-md-size);}.picture-timing__timing-notice>span{white-space:nowrap;display:flex;align-items:center;gap:5px;color:var(--text-secondary);}.picture-timing__note{color:var(--text-secondary);}
 p{font-size:var(--data-md-size);line-height:1.5;}table{width:100%;border-collapse:collapse;font-size:var(--data-md-size);}th,td{text-align:left;padding:var(--spacing-sm);border-bottom:1px solid var(--border-default);}thead th{color:var(--text-secondary);font-weight:500;}td{font-variant-numeric:tabular-nums;white-space:nowrap;}footer{display:flex;justify-content:flex-end;gap:var(--spacing-sm);margin-top:var(--spacing-lg);}.picture-timing__error{color:var(--tone-danger);}
 .picture-timing__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}
</style>

<script>
  import Button from '../Button.svelte'
  import Icon from '../Icon.svelte'
  /** @type {{job?:{id:string,state?:string,publication:string,error?:string,revisionId?:string}|null,requested?:boolean,requestError?:string,version?:string,purpose?:string,onreview?:()=>void}} */
  let {job=null,requested=false,requestError='',version='',purpose='character sheet',onreview=undefined}=$props()
  const failed=$derived(!!requestError||!!job?.error||['failed','cancelled','expired','indeterminate'].includes(job?.state??''))
  const saved=$derived(job?.publication==='saved')
  const saving=$derived(job?.state==='succeeded'&&!saved)
  const title=$derived(failed?'Artwork was not completed':saved?`${version||'Artwork'} is ready to review`:saving?'Saving artwork to the project':job?.state==='running'?`Generating ${purpose}`:job?'Generation queued':requested?'Submitting generation request':'')
  const message=$derived(requestError||job?.error||(job?.state==='indeterminate'?'The provider result is unknown. This request will not be retried automatically.':failed?'Review the operation details before trying again.':saved?'Saved in the project. Your previous versions are kept.':saving?'Generation finished. Waiting for project publication.':'The new version will appear here when it has been generated and saved.'))
</script>
<div class="ui-appearance-generation" class:ui-appearance-generation--failed={failed} role={failed?'alert':'status'} aria-live="polite" aria-atomic="true">
  <div class="ui-appearance-generation__heading"><Icon name={failed?'warning':saved?'check-circle':'circle-notch'} /><strong>{title}</strong>{#if saved&&onreview}<Button variant="tool" icon="image" onclick={onreview}>Review {version||'artwork'}</Button>{/if}</div>
  <p>{message}</p>
  {#if !failed}<ol aria-label="Artwork progress"><li class:complete={saving||saved} class:current={!saving&&!saved}>Generate</li><li class:complete={saved} class:current={saving}>Save</li><li class:current={saved}>Review</li></ol>{/if}
  {#if job?.id}<details><summary>Operation details</summary><code>{job.id}</code><span>{job.state} · {job.publication}</span></details>{/if}
</div>
<style>
  .ui-appearance-generation{max-width:440px;padding:var(--spacing-sm) var(--spacing-md);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:color-mix(in oklab,var(--surface-raised) 92%,transparent);backdrop-filter:blur(16px);color:var(--text-primary);font-size:var(--caption-size);}
  .ui-appearance-generation__heading{display:flex;align-items:center;gap:var(--spacing-xs);}.ui-appearance-generation__heading strong{font-size:var(--label-md-size);}.ui-appearance-generation p{margin:var(--spacing-xs) 0;line-height:1.45;color:var(--text-secondary);}
  ol{display:flex;list-style:none;padding:0;margin:var(--spacing-sm) 0;gap:var(--spacing-md);color:var(--text-secondary);counter-reset:step;}li{counter-increment:step;display:flex;align-items:center;gap:var(--spacing-xs);}li::before{content:counter(step);display:grid;place-items:center;width:18px;height:18px;border:1px solid var(--border-default);border-radius:var(--radius-full);font-size:var(--caption-size);}.complete::before{content:'✓';}.current{color:var(--text-primary);font-weight:600;}.current::before{border-color:var(--text-primary);background:var(--surface-base);}
  details{font-size:var(--caption-size);color:var(--text-secondary);}summary{cursor:pointer;}code{display:block;overflow-wrap:anywhere;margin-top:var(--spacing-xs);}.ui-appearance-generation--failed{border-color:var(--tone-danger);}
</style>

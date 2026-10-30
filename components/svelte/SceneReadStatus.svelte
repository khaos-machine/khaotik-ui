<script>
  import Button from './Button.svelte'
  import StatusPill from './StatusPill.svelte'
  /** @typedef {{allowed:true}|{allowed:false,reason:string}} ResumeEligibility */
  /** @typedef {{id:string,state:'running'|'partial'|'indeterminate'|'completed'|'retired',counts:{total:number,reused:number,completed:number,remaining:number},resume:ResumeEligibility,message?:string}} SceneWorkflow */
  /**
   * @typedef {Object} Props
   * @property {SceneWorkflow} [workflow] Host-declared scene workflow status and retained counts. Counts never imply permission to retry.
   * @property {boolean} [resuming] Host-controlled resume admission in progress.
   * @property {(workflowId:string)=>void} [onResume] Explicit intent to resume this existing workflow, only when host eligibility permits. No new-read or execution behavior.
   */
  /** @type {Props} */
  let { workflow = undefined, resuming = false, onResume = undefined } = $props()
  let requested = $state(false)
  const scope = $derived(JSON.stringify([workflow?.id, workflow?.state, workflow?.resume, resuming]))
  $effect(() => { scope; requested = false })
  const canResume = $derived(Boolean(workflow?.id && workflow.resume.allowed && !resuming && !requested && onResume))
  const stateLabel = $derived(workflow?.state === 'running' ? 'Reading' : workflow?.state === 'partial' ? 'Partially complete' : workflow?.state === 'indeterminate' ? 'Indeterminate' : workflow?.state === 'completed' ? 'Complete' : workflow?.state === 'retired' ? 'Retired' : '')
  // The stop message and the resume reason can be the same sentence (khaosd serves one for ADVANCED_ONLY); say it once.
  const resumeReason = $derived(workflow && !workflow.resume.allowed ? workflow.resume.reason.trim() || 'No resume eligibility reason reported.' : '')
  const shownReason = $derived(resumeReason === workflow?.message?.trim() ? '' : resumeReason)
  const statusId = $props.id()
  function resume() { if (canResume && workflow) { requested = true; onResume?.(workflow.id) } }
</script>
<div class="ui-scene-read-status" role="status">
  {#if workflow}
    <StatusPill text={stateLabel} tone={workflow.state === 'completed' ? 'success' : 'neutral'} />
    <p class="ui-scene-read-status__counts">{workflow.counts.completed} completed lines kept · {workflow.counts.reused} reused · {workflow.counts.remaining} remaining</p>
    {#if workflow.message}<p>{workflow.message}</p>{/if}
    <p id={statusId}>{shownReason}</p>
    {#if workflow.resume.allowed}
      <Button disabled={!canResume} describedby={statusId} onclick={resume}>{resuming ? 'Resuming scene read…' : 'Resume scene read'}</Button>
    {/if}
  {:else}
    <p>No scene read workflow reported.</p>
  {/if}
</div>
<style>
  .ui-scene-read-status { display: flex; flex-direction: column; align-items: flex-start; gap: var(--spacing-xs); color: var(--text-primary); font-size: var(--body-md-size); line-height: var(--body-md-line); }
  .ui-scene-read-status__counts { font-variant-numeric: tabular-nums; }
  p { margin: 0; overflow-wrap: anywhere; }
</style>

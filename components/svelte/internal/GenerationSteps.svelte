<script>
  import Icon from '../Icon.svelte'
  /** @type {{step?:'direct'|'generate'|'review'|'use'}} */
  let {step='direct'}=$props()
  const steps=[{id:'direct',label:'Direct'},{id:'generate',label:'Generate'},{id:'review',label:'Review'},{id:'use',label:'Use'}]
</script>
<ol class="generation-steps" aria-label="Frame workflow">
  {#each steps as item,index (item.id)}
    <li aria-current={step===item.id?'step':undefined}><span>{item.label}</span>{#if index<3}<Icon name="caret-right" />{/if}</li>
  {/each}
</ol>
<style>
  .generation-steps {position:sticky;top:0;z-index:2;background:color-mix(in oklab,var(--surface-raised) 90%,transparent);backdrop-filter:blur(10px);display:flex;list-style:none;margin:0;padding:var(--spacing-xs) 0;gap:var(--spacing-2xs);border-bottom:1px solid var(--border-hairline);font-size:var(--caption-size);color:var(--text-secondary);}
  li {display:flex;flex:1;align-items:center;justify-content:space-between;gap:var(--spacing-2xs);}
  li:last-child {flex:0 0 auto;}
  li[aria-current=step] span {color:var(--text-primary);font-weight:600;}
  li :global(.ph) {font-size:10px;color:var(--text-secondary);}
</style>

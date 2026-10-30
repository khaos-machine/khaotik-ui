<script>
  import Icon from '../Icon.svelte'
  import { coverageLabels } from '../lib/shot-coverage.js'
  import { formatTimecode } from '../lib/timeline.js'
  /** @type {{items?:readonly import('../lib/shot-coverage.js').CoverageItem[],selectedId?:string,activeId?:string,onselect?:(id:string)=>void}} */
  let {items=[],selectedId='',activeId='',onselect=undefined}=$props()
  let failed=$state(/** @type {Record<string,boolean>} */({}))
  /** @param {KeyboardEvent} event @param {number} index */
  function move(event,index){
    const next=event.key==='ArrowDown'?Math.min(items.length-1,index+1):event.key==='ArrowUp'?Math.max(0,index-1):event.key==='Home'?0:event.key==='End'?items.length-1:-1
    if(next<0)return
    event.preventDefault();event.stopPropagation()
    const item=items[next];if(!item)return
    const button=/** @type {HTMLButtonElement} */(event.currentTarget)
    const buttons=button.closest('ol')?.querySelectorAll('button')
    const target=/** @type {HTMLElement|undefined} */(buttons?.[next])
    target?.focus()
    onselect?.(item.id)
  }
</script>
<ol class="shot-sequence" aria-label="Scene shots">
  {#each items as item,index (item.id)}
    <li>
      <button type="button" aria-label={`${index+1}. ${item.title}, ${coverageLabels[item.status]}`} aria-pressed={selectedId===item.id} aria-current={activeId===item.id?'true':undefined} onclick={()=>onselect?.(item.id)} onkeydown={event=>move(event,index)}>
        <span class="shot-sequence__image" aria-hidden="true">
          {#if item.imageUrl&&item.imageState==='ready'&&!failed[item.imageUrl]}
            <img src={item.imageUrl} alt="" onerror={()=>failed[item.imageUrl]=true} />
          {:else}<Icon name={item.imageState==='loading'?'circle-notch':item.imageState==='failed'||failed[item.imageUrl]?'image-broken':'frame-corners'} />{/if}
          <span class="shot-sequence__number">{String(index+1).padStart(2,'0')}</span>
        </span>
        <span class="shot-sequence__body"><strong>{item.title}</strong><span class="shot-sequence__status">{coverageLabels[item.status]}</span><small>{`${item.timingStatus==='resolved'&&item.start!==null?`${formatTimecode(item.start)} · ${item.hold.toFixed(1)}s`:'Set timing'}${item.framing?` · ${item.framing}`:''}`}</small>
          {#if item.imageState==='failed'||failed[item.imageUrl]}<small class="shot-sequence__failure">Preview unavailable</small>{/if}
        </span>
      </button>
    </li>
  {/each}
</ol>
<style>
  .shot-sequence {display:flex;flex-direction:column;list-style:none;margin:0;padding:0;gap:var(--spacing-2xs);}
  button {width:100%;display:flex;align-items:center;gap:var(--spacing-sm);padding:var(--spacing-xs);text-align:left;border:1px solid transparent;border-radius:var(--radius-sm);background:transparent;color:var(--text-primary);font:inherit;cursor:pointer;}
  button:hover {background:color-mix(in oklab,var(--text-primary) 5%,transparent);}
  button[aria-current=true] {background:color-mix(in oklab,var(--text-primary) 10%,transparent);}
  button[aria-pressed=true] {border-color:var(--border-focus);}
  button:focus-visible {outline:2px solid var(--border-focus);outline-offset:1px;}
  .shot-sequence__image {position:relative;display:grid;place-items:center;flex:0 0 88px;aspect-ratio:16/9;overflow:hidden;border-radius:var(--radius-sm);background:color-mix(in oklab,var(--surface-base) 60%,transparent);color:var(--text-secondary);}
  img {height:100%;width:100%;object-fit:contain;}
  .shot-sequence__number {position:absolute;bottom:0;left:0;background:var(--surface-raised);padding:1px var(--spacing-2xs);font-size:var(--caption-size);font-variant-numeric:tabular-nums;}
  .shot-sequence__body {display:flex;flex-direction:column;min-width:0;gap:2px;}
  strong {font-size:var(--data-md-size);font-weight:600;overflow-wrap:anywhere;}
  .shot-sequence__status,small {font-size:var(--caption-size);line-height:1.4;color:var(--text-secondary);}
  .shot-sequence__failure {color:var(--text-primary);}
</style>

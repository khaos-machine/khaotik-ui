<script>
  import Icon from '../Icon.svelte'
 import {MenuRoot,MenuContextTrigger,MenuPositioner,MenuContent,MenuItem} from '@ark-ui/svelte/menu'
 import {Portal} from '@ark-ui/svelte/portal'
  import { formatTimecode } from '../lib/timeline.js'
  import { pictureRange } from '../lib/picture-range.js'
  /** @typedef {import('../lib/picture-range.js').PictureClip} PictureClip */
  /** @typedef {import('../lib/picture-range.js').PictureEdit} PictureEdit */
  /** @type {{clips?:readonly PictureClip[],scale?:number,total?:number,selectedId?:string,activeId?:string,onSelect?:(id:string,source?:'context')=>void,onAction?:(id:string,action:'add'|'insertBefore'|'insertAfter'|'split'|'delete')=>void,onChange?:(id:string,range:{start:number,duration:number})=>void}} */
  let { clips=[], scale=10, total=0, selectedId='', activeId='', onSelect=undefined, onAction=undefined, onChange=undefined }=$props()
  /** @type {{pointerId:number,x:number,scale:number,clip:PictureClip,edit:PictureEdit,range:{start:number,duration:number},moved:boolean}|null} */
  let gesture=$state(null)
  function begin(event,clip,edit) {
    if(clip.readOnly){onSelect?.(clip.id);return}
    if(gesture||!onChange||event.button!==0||event.isPrimary===false)return
    event.preventDefault();event.stopPropagation()
    onSelect?.(clip.id)
    gesture={pointerId:event.pointerId,x:event.clientX,scale,clip:{...clip},edit,range:{start:clip.start,duration:clip.duration},moved:false}
  }
  function move(event){
    if(!gesture||event.pointerId!==gesture.pointerId)return
    const delta=event.clientX-gesture.x
    if(Math.abs(delta)>3)gesture.moved=true
    gesture.range=pictureRange(gesture.clip,delta/gesture.scale,gesture.edit,total,!event.shiftKey)
  }
  function finish(event){
    if(!gesture||event.pointerId!==gesture.pointerId)return
    move(event)
    const finished=gesture;gesture=null
    if(finished.moved&&(finished.range.start!==finished.clip.start||finished.range.duration!==finished.clip.duration))onChange?.(finished.clip.id,finished.range)
  }
  function cancel(event){if(gesture&&event?.pointerId!==undefined&&event.pointerId!==gesture.pointerId)return;gesture=null}
  function key(event,clip,edit){
    if(clip.readOnly)return
    if(edit==='move'&&onAction&&['Delete','Backspace','s'].includes(event.key)){event.preventDefault();event.stopPropagation();onAction(clip.id,event.key==='s'?'split':'delete');return}
    if(!onChange||!['ArrowLeft','ArrowRight'].includes(event.key))return
    event.preventDefault();event.stopPropagation()
    onSelect?.(clip.id)
    const delta=(event.key==='ArrowLeft'?-1:1)*(event.shiftKey?1:0.1)
    onChange(clip.id,pictureRange(clip,delta,edit,total))
  }
</script>

<svelte:window onpointermove={move} onpointerup={finish} onpointercancel={cancel} onblur={cancel} onkeydown={event=>{if(event.key==='Escape')cancel(event)}} />
<div class="picture-lane" aria-label="Picture clips">
  {#each clips as clip (clip.id)}
    {@const range=gesture?.clip.id===clip.id?gesture.range:clip}
    <MenuRoot onSelect={details=>{const action=details.value;if(action==='add'||action==='insertBefore'||action==='insertAfter'||action==='split'||action==='delete')onAction?.(clip.id,action)}}>
    <MenuContextTrigger class={`picture-lane__clip ${clip.id===selectedId?'selected':''} ${gesture?.clip.id===clip.id?'editing':''} ${clip.warning?'warning':''} ${clip.id===activeId?'active':''}`}
      style={`left:${range.start*scale}px;width:${range.duration*scale}px`} data-picture-id={clip.id} oncontextmenu={()=>onSelect?.(clip.id,'context')}>
      <button class="picture-lane__body" type="button" aria-label={`${clip.label} at ${formatTimecode(range.start)}${clip.warning?' · '+clip.warning:''}`}  aria-pressed={clip.id===selectedId} aria-current={clip.id===activeId?'true':undefined}
        onpointerdown={event=>begin(event,clip,'move')} onkeydown={event=>key(event,clip,'move')}
        onclick={event=>{if(!onChange||event.detail===0)onSelect?.(clip.id)}}
        title={`${clip.label} · ${range.start.toFixed(1)}–${(range.start+range.duration).toFixed(1)}s${clip.chosen?'':' · draft'}${clip.warning?' · '+clip.warning:''}`}
        >
        {#if clip.imageUrl}
          <span class="picture-lane__frames" aria-hidden="true" style:background-image={'url('+JSON.stringify(clip.imageUrl)+')'}></span>
        {:else}<span class="picture-lane__empty" aria-hidden="true"><Icon name="image" /><span>No frame</span></span>{/if}
        <span class="picture-lane__caption" aria-hidden="true">{#if clip.warning}<Icon name="warning" />{/if}<strong>{clip.label}</strong><small>{range.duration.toFixed(1)}s{clip.chosen?'':' · draft'}</small></span>
      </button>
      {#if onChange&&!clip.readOnly}
        <button class="picture-lane__trim picture-lane__trim-start" type="button" aria-label={`Trim start of ${clip.label}`} title="Trim start · arrows 0.1s · Shift+arrows 1s"
          onpointerdown={event=>begin(event,clip,'start')} onkeydown={event=>key(event,clip,'start')}></button>
        <button class="picture-lane__trim picture-lane__trim-end" type="button" aria-label={`Trim end of ${clip.label}`} title="Trim end · arrows 0.1s · Shift+arrows 1s"
          onpointerdown={event=>begin(event,clip,'end')} onkeydown={event=>key(event,clip,'end')}></button>
      {/if}
    </MenuContextTrigger>
    <Portal><MenuPositioner><MenuContent class="picture-menu" aria-label={`Shot actions for ${clip.label}`}>
      {#each [{value:'add',label:'Add shot at playhead'},{value:'insertBefore',label:'Insert shot before'},{value:'insertAfter',label:'Insert shot after'},{value:'split',label:'Split at playhead'},{value:'delete',label:'Delete shot'}] as action (action.value)}<MenuItem value={action.value} disabled={!onAction||clip.readOnly&&action.value!=='delete'} class="picture-menu__item">{action.label}</MenuItem>{/each}
    </MenuContent></MenuPositioner></Portal>
    </MenuRoot>
  {/each}
</div>

<style>
  .picture-lane {position:relative;height:60px;box-sizing:border-box;border-bottom:1px solid var(--border-default)}
  :global(.picture-lane__clip) {position:absolute;top:1px;bottom:1px;box-sizing:border-box;border:1px solid var(--border-default);border-radius:0;background:var(--surface-base);overflow:hidden;min-width:1px;container-type:inline-size}
  :global(.picture-lane__clip.selected) {border-color:var(--border-focus);z-index:2}
  :global(.picture-lane__clip.editing) {outline:1px solid var(--border-focus);outline-offset:-1px;z-index:3}
  .picture-lane__body {position:relative;display:block;width:100%;height:100%;padding:0;border:0;border-radius:0;background:transparent;color:var(--text-primary);text-align:left;cursor:grab;touch-action:none;overflow:hidden}
  .picture-lane__body:active {cursor:grabbing}
  .picture-lane__frames {position:absolute;inset:0;background-repeat:repeat-x;background-position:left center;background-size:auto 100%;pointer-events:none}
  .picture-lane__empty {position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:4px;color:var(--text-secondary);font-size:var(--caption-size);pointer-events:none}
  .picture-lane__caption {position:absolute;bottom:0;left:0;right:0;height:15px;display:flex;align-items:center;gap:4px;padding:0 5px;box-sizing:border-box;background:color-mix(in srgb,var(--surface-base) 88%,transparent);color:var(--text-primary);pointer-events:none}
  :global(.picture-lane__clip.active) .picture-lane__caption {background:var(--surface-raised)}
  .picture-lane__caption strong {min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--caption-size);font-weight:500;line-height:1}
  .picture-lane__caption small {flex-shrink:0;color:var(--text-secondary);white-space:nowrap;font-size:var(--caption-size);font-variant-numeric:tabular-nums}
  .picture-lane__trim {position:absolute;top:0;bottom:0;width:8px;border:0;border-radius:0;padding:0;background:transparent;cursor:ew-resize;touch-action:none;opacity:0}
  .picture-lane__trim::after {content:'';position:absolute;top:50%;left:3px;width:2px;height:14px;transform:translateY(-50%);background:var(--text-primary)}
  .picture-lane__trim-start {left:0}.picture-lane__trim-end {right:0}
  :global(.picture-lane__clip:hover) .picture-lane__trim,:global(.picture-lane__clip.selected) .picture-lane__trim,.picture-lane__trim:focus-visible {opacity:1;background:color-mix(in srgb,var(--surface-base) 72%,transparent)}
  button:focus-visible {outline:1px solid var(--border-focus);outline-offset:-1px}
  @container (max-width:140px){.picture-lane__caption small{display:none}}
  @container (max-width:54px){.picture-lane__caption{display:none}.picture-lane__empty>span{display:none}}
  :global(.picture-menu) {min-width:190px;padding:4px;z-index:10000;color:var(--text-primary);background:var(--surface-raised);border:1px solid var(--border-default);border-radius:var(--radius-sm);outline:none}
  :global(.picture-menu__item) {font-size:12px;padding:5px 8px;cursor:pointer;outline:none}
  :global(.picture-menu__item[data-highlighted]) {background:var(--surface-raised)}
</style>

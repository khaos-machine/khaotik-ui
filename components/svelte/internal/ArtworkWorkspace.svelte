<script>
  import Button from '../Button.svelte'
  import EmptyState from '../EmptyState.svelte'
  /** @type {{name?:string,returnLabel?:string,mediaUrl?:string,mediaLoading?:boolean,mediaError?:string,mediaAlt?:string,toolsTitle?:string,dataUiId?:string,toolsOpen?:boolean,focused?:boolean,onback?:()=>void,toolbar?:import('svelte').Snippet,content?:import('svelte').Snippet,hud?:import('svelte').Snippet,selection?:import('svelte').Snippet,tools?:import('svelte').Snippet,commands?:import('svelte').Snippet,versions?:import('svelte').Snippet,status?:import('svelte').Snippet,empty?:import('svelte').Snippet}} */
  let {name='',returnLabel='Back',mediaUrl='',mediaLoading=false,mediaError='',mediaAlt='Artwork',toolsTitle='Design tools',dataUiId='artwork.workspace',toolsOpen=$bindable(true),focused=$bindable(false),onback=undefined,toolbar=undefined,content=undefined,hud=undefined,selection=undefined,tools=undefined,commands=undefined,versions=undefined,status=undefined,empty=undefined}=$props()
</script>
<svelte:window onkeydown={event=>{if(event.key==='Escape'&&focused){focused=false;event.preventDefault()}}} />
<div class="ui-artwork" class:ui-artwork--focused={focused&&!content} class:ui-artwork--tools-hidden={!toolsOpen} class:ui-artwork--content={!!content} data-ui-id={dataUiId}>
  {#if mediaUrl&&!content}<div class="ui-artwork__backdrop" aria-hidden="true"><img src={mediaUrl} alt="" /></div>{/if}
  <header class="ui-artwork__toolbar">
    <div class="ui-artwork__identity"><Button icon="arrow-left" onclick={()=>onback?.()}>{returnLabel}</Button><strong>{name}</strong></div>
    <div class="ui-artwork__mode">{@render toolbar?.()}</div>
    <div class="ui-artwork__actions">{#if !content}<Button variant="tool" icon="sidebar-simple" onclick={()=>toolsOpen=!toolsOpen}>{toolsOpen?'Hide tools':'Show tools'}</Button>{/if}</div>
  </header>
  {#if content}
    <main class="ui-artwork__content">{@render content()}</main>
  {:else}
  <main class="ui-artwork__viewer" aria-label={mediaAlt}>
    {#if mediaUrl}<img class="ui-artwork__image" src={mediaUrl} alt={mediaAlt} />
    {:else if mediaError}<EmptyState title="Artwork could not be read" description={mediaError} icon="warning" />
    {:else if mediaLoading}<EmptyState title="Reading artwork…" icon="circle-notch" />
    {:else}{@render empty?.()}{/if}
    <div class="ui-artwork__hud">{@render hud?.()}</div>
    {#if !focused}<div class="ui-artwork__selection">{@render selection?.()}</div>{/if}
    <div class="ui-artwork__focus"><Button variant="tool" icon={focused?'arrows-in':'arrows-out'} onclick={()=>focused=!focused}>{focused?'Show controls':'Focus artwork'}</Button></div>
  </main>
  <aside class="ui-artwork__tools" aria-label={toolsTitle} hidden={!toolsOpen||focused} inert={!toolsOpen||focused}>
    <div class="ui-artwork__tool-content">{@render tools?.()}</div>
    <div class="ui-artwork__commands">{@render commands?.()}</div>
  </aside>
  <div class="ui-artwork__versions">{@render versions?.()}</div>
  <footer class="ui-artwork__status">{@render status?.()}</footer>
  {/if}
</div>
<style>
  .ui-artwork{height:100%;position:relative;isolation:isolate;display:grid;grid-template-columns:minmax(0,1fr) 350px;grid-template-rows:auto minmax(0,1fr) auto auto;background:var(--surface-base);color:var(--text-primary);overflow:hidden;}
  .ui-artwork__backdrop{position:absolute;inset:-48px;z-index:-1;pointer-events:none;}.ui-artwork__backdrop img{width:100%;height:100%;object-fit:cover;filter:blur(48px);opacity:.14;}
  .ui-artwork__toolbar{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:var(--spacing-sm);padding:var(--spacing-sm);border-bottom:1px solid var(--border-default);background:color-mix(in oklab,var(--surface-raised) 85%,transparent);backdrop-filter:blur(20px);}.ui-artwork__identity{display:flex;align-items:center;gap:var(--spacing-sm);min-width:0;}.ui-artwork__identity strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .ui-artwork__viewer{position:relative;min-width:0;min-height:0;display:grid;place-items:center;padding:var(--spacing-sm);}.ui-artwork__image{display:block;width:100%;height:100%;min-height:0;object-fit:contain;}
  .ui-artwork__hud{position:absolute;inset:var(--spacing-md) var(--spacing-md) auto;pointer-events:none;}.ui-artwork__hud :global(button),.ui-artwork__hud :global(details),.ui-artwork__hud :global(.ui-appearance-generation){pointer-events:auto;}
  .ui-artwork__selection{position:absolute;bottom:var(--spacing-sm);left:var(--spacing-sm);right:150px;pointer-events:none;}.ui-artwork__selection :global(button){pointer-events:auto;}
  .ui-artwork__focus{position:absolute;right:var(--spacing-sm);bottom:var(--spacing-sm);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:color-mix(in oklab,var(--surface-raised) 94%,transparent);backdrop-filter:blur(16px);}
  .ui-artwork__tools{grid-column:2;grid-row:2/4;min-height:0;display:flex;flex-direction:column;border-left:1px solid var(--border-default);background:color-mix(in oklab,var(--surface-raised) 85%,transparent);backdrop-filter:blur(20px);}.ui-artwork__tools[hidden]{display:none;}.ui-artwork__tool-content{flex:1;min-height:0;overflow:auto;padding:var(--spacing-md);}.ui-artwork__commands{flex:none;padding:var(--spacing-sm) var(--spacing-md);border-top:1px solid var(--border-default);background:color-mix(in oklab,var(--surface-raised) 94%,transparent);}
  .ui-artwork__versions{grid-column:1;min-width:0;overflow:auto;}.ui-artwork__status{grid-column:1/-1;display:flex;align-items:center;gap:var(--spacing-sm);min-height:28px;padding:var(--spacing-xs) var(--spacing-sm);border-top:1px solid var(--border-default);}
  .ui-artwork--tools-hidden{grid-template-columns:minmax(0,1fr);}.ui-artwork--focused{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr);}.ui-artwork--focused .ui-artwork__toolbar,.ui-artwork--focused .ui-artwork__versions,.ui-artwork--focused .ui-artwork__status{display:none;}.ui-artwork--focused .ui-artwork__viewer{grid-column:1;grid-row:1;}
  @media(max-width:1000px){.ui-artwork{grid-template-columns:minmax(0,1fr) 310px;}.ui-artwork__toolbar{flex-wrap:wrap;}.ui-artwork--tools-hidden,.ui-artwork--focused{grid-template-columns:minmax(0,1fr);}}
  @container viewport (max-width:1000px){.ui-artwork{grid-template-columns:minmax(0,1fr) 310px;}.ui-artwork__toolbar{flex-wrap:wrap;}.ui-artwork--tools-hidden,.ui-artwork--focused{grid-template-columns:minmax(0,1fr);}}
  .ui-artwork__mode{justify-self:center;}.ui-artwork__actions{justify-self:end;}
  .ui-artwork--content{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);}
  .ui-artwork__content{grid-column:1/-1;min-width:0;min-height:0;overflow:auto;}
</style>

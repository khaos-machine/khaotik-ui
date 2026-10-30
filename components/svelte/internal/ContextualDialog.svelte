<script>
  import {DialogBackdrop,DialogContent,DialogCloseTrigger,DialogDescription,Positioner as DialogPositioner,Root as DialogRoot,Title as DialogTitle} from '@ark-ui/svelte/dialog'
  import { Portal } from '@ark-ui/svelte/portal'
  import Icon from '../Icon.svelte'
  /** @type {{open?:boolean,target?:string,title?:string,closeLabel?:string,media?:boolean,onclose?:()=>void,returnFocus?:()=>HTMLElement|null,children?:import('svelte').Snippet}} */
  let {open=false,target='',title='Plan scene shots',closeLabel='Close shot planning',media=false,onclose=undefined,returnFocus=undefined,children=undefined}=$props()
</script>
<DialogRoot {open} finalFocusEl={returnFocus} lazyMount unmountOnExit closeOnInteractOutside={false} onOpenChange={details=>{if(!details.open)onclose?.()}}>
  <Portal>
    <DialogBackdrop class="ui-planning-backdrop" />
    <DialogPositioner class="ui-planning-positioner">
      <DialogContent class="ui-planning-dialog" data-media={media}>
        <header class="ui-planning-header"><div><DialogTitle class="ui-planning-title">{title}</DialogTitle><DialogDescription class="ui-planning-target">{target||'Current scene'}</DialogDescription></div><DialogCloseTrigger class="ui-planning-close" aria-label={closeLabel}><Icon name="x" /></DialogCloseTrigger></header>
        <div class="ui-planning-content">{@render children?.()}</div>
      </DialogContent>
    </DialogPositioner>
  </Portal>
</DialogRoot>
<style>
  :global(.ui-planning-backdrop) {position:fixed;inset:0;z-index:40;background:var(--scrim);}
  :global(.ui-planning-positioner) {position:fixed;inset:0;z-index:40;display:grid;place-items:center;padding:var(--spacing-lg);pointer-events:none;}
  :global(.ui-planning-dialog) {pointer-events:auto;display:flex;flex-direction:column;width:min(920px,100%);max-height:calc(100dvh - 2 * var(--spacing-lg));border:1px solid var(--border-default);border-radius:var(--radius-lg);background:color-mix(in oklab,var(--surface-raised) 94%,transparent);backdrop-filter:blur(18px);color:var(--text-primary);}
  :global(.ui-planning-dialog[data-media='true']) {width:min(1200px,100%);height:calc(100dvh - 2 * var(--spacing-lg));}
  :global(.ui-planning-dialog[data-media='true']) .ui-planning-content {display:flex;flex:1;flex-direction:column;}
  .ui-planning-header {display:flex;align-items:flex-start;justify-content:space-between;gap:var(--spacing-md);padding:var(--spacing-md);border-bottom:1px solid var(--border-default);}
  :global(.ui-planning-title) {font-size:var(--heading-md-size);font-weight:600;margin:0;}
  :global(.ui-planning-target) {font-size:var(--data-md-size);color:var(--text-secondary);margin:var(--spacing-2xs) 0 0;overflow-wrap:anywhere;}
  :global(.ui-planning-close) {display:grid;place-items:center;flex:0 0 28px;width:28px;height:28px;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:transparent;color:var(--text-primary);cursor:pointer;}
  :global(.ui-planning-close:focus-visible) {outline:2px solid var(--border-focus);outline-offset:2px;}
  .ui-planning-content {min-height:0;overflow:auto;padding:var(--spacing-md);}
</style>

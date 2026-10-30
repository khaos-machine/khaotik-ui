<script>
  import Button from './Button.svelte'
  import Icon from './Icon.svelte'
  import Sheet from './Sheet.svelte'

  /**
   * @typedef {{id:string,kind:string,text:string,speaker:string,parenthetical:string,centered:boolean,simultaneous:boolean,editable:boolean}} Block
   * @typedef {{id:string,heading:string,blocks:readonly Block[]}} Scene
   * @typedef {{title:string,scenes:readonly Scene[]}} ScreenplayDocument
   * @typedef {Object} Props
   * @property {ScreenplayDocument|null} [document] Current story values, keyed by stable event identities.
   * @property {string} [title] Draft title-page title.
   * @property {Readonly<Record<string,string>>} [page] Draft title-page metadata.
   * @property {readonly string[]} [fields] Ordered metadata fields.
   * @property {Readonly<Record<string,string>>} [texts] Draft event values keyed by identity.
   * @property {string} [selected] Scene identity or title-page.
   * @property {boolean} [loading] Opening the story projection.
   * @property {boolean} [saving] Saving authored values.
   * @property {number} [dirty] Unsaved value count.
   * @property {string} [error] Actionable failure shown with the draft retained.
   * @property {string} [notice] Last completed operation.
   * @property {boolean} [canUndo] Whether a prior draft is available.
   * @property {boolean} [canRedo] Whether an undone draft is available.
   * @property {(id:string)=>void} [onselect] Select a scene or the title page.
   * @property {(text:string)=>void} [ontitle] Change the draft title.
   * @property {(key:string,value:string)=>void} [onpage] Change one title-page field.
   * @property {(id:string,value:string)=>void} [ontext] Change an existing event value by identity.
   * @property {()=>void} [onsave] Commit the current draft.
   * @property {()=>void} [onundo] Restore the preceding draft.
   * @property {()=>void} [onredo] Restore an undone draft.
   * @property {()=>void} [ondiscard] Discard local changes after confirmation.
   * @property {()=>void} [onretry] Retry opening the story projection.
   */
  /** @type {Props} */
  let {document=null,title='',page={},fields=[],texts={},selected='title-page',loading=false,saving=false,dirty=0,error='',notice='',canUndo=false,canRedo=false,
    onselect=undefined,ontitle=undefined,onpage=undefined,ontext=undefined,onsave=undefined,onundo=undefined,onredo=undefined,ondiscard=undefined,onretry=undefined}=$props()
  const scene=$derived(document?.scenes.find(scene=>scene.id===selected))
  let discarding=$state(false)
  /** @type {HTMLElement|undefined} */
  let root=$state()
  /** @type {Record<string,string>} */
  const labels={author:'Author',credit:'Credit',source:'Based on',draftDate:'Draft date',contact:'Contact',copyright:'Copyright'}
  /** @param {HTMLTextAreaElement} element */
  function fit(element){element.style.height='auto';element.style.height=`${element.scrollHeight}px`}
  /** @param {string} _value @returns {import('svelte/attachments').Attachment<HTMLTextAreaElement>} */
  function resize(_value){
    return element=>{
      let width=-1
      const observer=new ResizeObserver(()=>{if(width!==element.clientWidth){width=element.clientWidth;fit(element)}})
      observer.observe(element);fit(element)
      return ()=>observer.disconnect()
    }
  }
  /** @param {KeyboardEvent} event */
  function keyboard(event){
    if(!(event.target instanceof Node)||!root?.contains(event.target))return
    if(!(event.metaKey||event.ctrlKey)||event.altKey)return
    if(event.key.toLowerCase()==='s'){event.preventDefault();if(dirty&&!saving)onsave?.()}
    if(event.key.toLowerCase()==='z'){event.preventDefault();if(event.shiftKey)onredo?.();else onundo?.()}
  }
</script>

<svelte:window onkeydown={keyboard} />
<section class="screenplay-editor__writer" bind:this={root} aria-label="Screenplay editor">
  <nav class="screenplay-editor__outline" aria-label="Screenplay outline">
    <h2>Screenplay</h2>
    <button class:screenplay-editor__chosen={selected==='title-page'} onclick={()=>onselect?.('title-page')} aria-current={selected==='title-page'?'page':undefined}><Icon name="file-text" />Title page</button>
    <h3>Scenes <span>{document?.scenes.length??''}</span></h3>
    {#each document?.scenes??[] as row,i (row.id)}
      <button class:screenplay-editor__chosen={selected===row.id} onclick={()=>onselect?.(row.id)} aria-current={selected===row.id?'page':undefined}><span class="screenplay-editor__ordinal">{i+1}</span><span>{row.heading}</span></button>
    {/each}
  </nav>
  <div class="screenplay-editor__workspace">
    <header>
      <span class="screenplay-editor__heading">{scene?.heading??'Title page'}</span>
      <Button variant="tool" icon="arrow-u-up-left" title="Undo (⌘Z)" disabled={!canUndo||saving} onclick={onundo}>Undo</Button>
      <Button variant="tool" icon="arrow-u-up-right" title="Redo (⇧⌘Z)" disabled={!canRedo||saving} onclick={onredo}>Redo</Button>
      <Button icon="arrow-counter-clockwise" disabled={!dirty||saving} onclick={()=>discarding=true}>Discard…</Button>
      <Button variant="primary" icon="floppy-disk" disabled={!dirty||saving} onclick={onsave}>{saving?'Saving…':'Save'}</Button>
    </header>
    {#if loading && !document}<p class="screenplay-editor__message" role="status">Opening screenplay…</p>
    {:else if !document}<div class="screenplay-editor__message"><p role="alert">{error||'The screenplay could not open.'}</p><Button icon="arrow-clockwise" onclick={onretry}>Try again</Button></div>
    {:else}
      <div class="screenplay-editor__paper-scroll">
        {#if selected==='title-page'}
          <article class="screenplay-editor__paper screenplay-editor__title-page" aria-label="Title page">
            <label class="screenplay-editor__title"><span>Title</span><textarea {@attach resize(title)} value={title} disabled={saving} aria-label="Screenplay title" rows="1" oninput={e=>{fit(e.currentTarget);ontitle?.(e.currentTarget.value)}} spellcheck="true"></textarea></label>
            {#each fields as key (key)}
              <label class:screenplay-editor__contact={key==='contact'}><span>{labels[key]??key}</span><textarea {@attach resize(page[key]??'')} value={page[key]??''} disabled={saving} aria-label={labels[key]??key} placeholder={key==='credit'?'Written by':labels[key]??key} rows="1" oninput={e=>{fit(e.currentTarget);onpage?.(key,e.currentTarget.value)}} spellcheck="true"></textarea></label>
            {/each}
          </article>
        {:else if scene}
          {#key scene.id}
          <article class="screenplay-editor__paper screenplay-editor__scene" aria-label={scene.heading}>
            <h1>{scene.heading}</h1>
            {#each scene.blocks as block (block.id)}
              <div class="screenplay-editor__block" class:screenplay-editor__dialogue={block.kind==='dialogue'} class:screenplay-editor__changed={texts[block.id]!==block.text} class:screenplay-editor__centered={block.centered} data-event-id={block.id}>
                {#if block.speaker}<p class="screenplay-editor__cue">{block.speaker}{block.simultaneous?' ^':''}</p>{/if}
                {#if block.parenthetical}<p class="screenplay-editor__parenthetical">({block.parenthetical})</p>{/if}
                {#if block.editable}
                  <textarea {@attach resize(texts[block.id]??block.text)} value={texts[block.id]??block.text} disabled={saving} aria-label={`${block.kind==='dialogue'?block.speaker+' dialogue':'Action'} ${scene.blocks.indexOf(block)+1}`} rows="1" oninput={e=>{fit(e.currentTarget);ontext?.(block.id,e.currentTarget.value)}} spellcheck="true"></textarea>
                {:else}<p class:screenplay-editor__transition={block.kind==='transition'}>{block.text}</p>{/if}
              </div>
            {/each}
          </article>
          {/key}
        {/if}
      </div>
      <footer aria-live="polite">
        {#if error}<span class="screenplay-editor__error" role="alert">{error}</span>
        {:else}<span>{saving?'Saving screenplay…':dirty?`${dirty} unsaved ${dirty===1?'change':'changes'}`:notice||'Saved screenplay'}</span>{/if}
        <span>Existing recordings and artwork are kept</span>
      </footer>
    {/if}
  </div>
</section>
{#if discarding}<Sheet title="Discard screenplay changes?" message="Your saved screenplay and existing media will be kept." confirmLabel="Discard changes" tone="danger" oncancel={()=>discarding=false} onconfirm={()=>{ondiscard?.();discarding=false}} />{/if}

<style>
  .screenplay-editor__writer{display:grid;grid-template-columns:236px minmax(0,1fr);height:100%;min-height:0;background:var(--surface-base);color:var(--text-primary)}
  .screenplay-editor__outline{overflow:auto;border-right:1px solid var(--border-hairline);background:color-mix(in oklab,var(--surface-base),var(--surface-raised) 35%);padding:8px}
  .screenplay-editor__outline h2,.screenplay-editor__outline h3{font:600 12px system-ui;color:var(--text-secondary);margin:8px 6px 12px;display:flex;justify-content:space-between}
  .screenplay-editor__outline h3{margin-top:20px}.screenplay-editor__outline button{display:flex;gap:10px;align-items:baseline;text-align:left;width:100%;padding:9px 8px;border:1px solid transparent;border-radius:2px;background:transparent;color:var(--text-secondary);font:inherit;font-size:12px;line-height:1.5;cursor:pointer}
  .screenplay-editor__outline button:hover{background:var(--surface-raised)}.screenplay-editor__outline button.screenplay-editor__chosen{background:var(--surface-raised);border-color:var(--border-default);color:var(--text-primary)}
  .screenplay-editor__ordinal{flex:0 0 16px;color:var(--text-secondary);font-variant-numeric:tabular-nums}
  .screenplay-editor__workspace{display:flex;flex-direction:column;min-width:0;min-height:0}
  header{display:flex;gap:6px;align-items:center;padding:6px 12px;border-bottom:1px solid var(--border-hairline);background:var(--surface-base);flex:none}
  .screenplay-editor__heading{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--text-secondary)}
  .screenplay-editor__paper-scroll{flex:1;overflow:auto;min-height:0;padding:32px 24px 80px;scrollbar-gutter:stable}
  .screenplay-editor__paper{max-width:760px;margin:0 auto;font:15px/1.65 'Courier Prime','Courier New',monospace;min-height:700px}
  h1{font:700 15px/1.65 'Courier Prime','Courier New',monospace;margin:0 0 24px}
  textarea{display:block;box-sizing:border-box;width:100%;resize:none;overflow:hidden;min-height:1.65em;border:1px solid transparent;border-radius:0;padding:4px 8px;margin:0 -8px;background:transparent;color:var(--text-primary);font:inherit;line-height:inherit;outline-offset:2px}
  textarea:hover{background:color-mix(in oklab,var(--surface-base),var(--surface-raised) 40%)}textarea:focus{background:var(--surface-base);border-color:var(--border-focus);outline:1px solid var(--border-focus)}textarea:disabled{opacity:.75}
  .screenplay-editor__block{position:relative;margin:0 0 20px;padding-left:2px}.screenplay-editor__block.screenplay-editor__changed::before{content:'';position:absolute;inset:4px auto 4px -14px;width:2px;background:var(--action-primary)}
  .screenplay-editor__dialogue{margin-left:21%;margin-right:18%}.screenplay-editor__cue{margin:0 0 0 26%;white-space:pre-wrap}.screenplay-editor__parenthetical{margin:0 0 0 12%;white-space:pre-wrap}.screenplay-editor__centered{text-align:center}.screenplay-editor__centered textarea{text-align:center}
  .screenplay-editor__block p{white-space:pre-wrap}.screenplay-editor__transition{text-align:right}
  .screenplay-editor__title-page{padding-top:72px}.screenplay-editor__title-page label{position:relative;display:block;max-width:460px;margin:0 auto 12px;text-align:center}.screenplay-editor__title-page label span{position:absolute;left:-92px;top:8px;width:80px;text-align:right;font:11px system-ui;color:var(--text-secondary);opacity:0}.screenplay-editor__title-page label:focus-within span,.screenplay-editor__title-page label:hover span{opacity:1}.screenplay-editor__title-page textarea{text-align:center}.screenplay-editor__title-page textarea::placeholder{color:var(--text-secondary);font-size:12px;font-family:system-ui}.screenplay-editor__title-page .screenplay-editor__title textarea{font-size:24px;font-weight:700;text-transform:none}.screenplay-editor__title-page .screenplay-editor__title{margin-bottom:36px}.screenplay-editor__title-page .screenplay-editor__contact{margin-top:72px}.screenplay-editor__title-page .screenplay-editor__contact textarea{text-align:left}
  footer{display:flex;justify-content:space-between;gap:16px;padding:7px 12px;border-top:1px solid var(--border-hairline);font-size:11px;color:var(--text-secondary);background:var(--surface-base);flex:none}footer .screenplay-editor__error{color:var(--status-alarm-fg)}.screenplay-editor__message{padding:24px}
</style>

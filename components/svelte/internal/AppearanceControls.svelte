<script>
  import Button from '../Button.svelte'
  import SegmentedControl from '../SegmentedControl.svelte'
  import AppearancePresetIcon from './AppearancePresetIcon.svelte'
  import {appearanceSwatch,appearanceCategory} from '../lib/appearance-palette.js'
  /** @type {{look:{features:readonly {key:string,label:string,options:readonly string[],randomizable?:boolean}[],choices:Record<string,string>}|null,locks?:Record<string,boolean>,busy?:boolean,onchange?:(key?:string,value?:string)=>void,onlock?:(key:string,value:boolean)=>void,category?:string,hairFeature?:string}} */
  let {look,locks={},busy=false,onchange=undefined,onlock=undefined,category=$bindable('identity'),hairFeature=$bindable('hair')}=$props()
  const categories=[{value:'identity',label:'Identity'},{value:'body',label:'Body'},{value:'face',label:'Face'},{value:'hair',label:'Hair'},{value:'surface',label:'Surface'}]
  // Picker machines can read their inputs while the host clears and unmounts them.
  const catalog=$derived(look?.features??[]),choices=$derived(look?.choices??{})
  const group=key=>appearanceCategory(key,choices.form)
  const available=$derived(categories.filter(c=>catalog.some(f=>group(f.key)===c.value)))
  const active=$derived(available.some(c=>c.value===category)?category:available[0]?.value??'identity')
  const features=$derived(catalog.filter(f=>group(f.key)===active))
  const hairItems=$derived(features.map(f=>({value:f.key,label:({hair:'Style',hairTexture:'Texture',hairColor:'Color',facialHair:'Facial hair'})[f.key]??f.label})))
  const activeHair=$derived(hairItems.some(f=>f.value===hairFeature)?hairFeature:hairItems[0]?.value??'hair')
  const visible=$derived(active==='hair'?features.filter(f=>f.key===activeHair):features)
  const proportionKeys=['shoulders','waist','hips','proportions']
  const proportions=$derived(visible.filter(f=>proportionKeys.includes(f.key)))
  const primary=$derived(visible.filter(f=>!proportionKeys.includes(f.key)))
  const uid=$props.id()
  const options=feature=>['',...new Set([...feature.options,...(choices[feature.key]&&!feature.options.includes(choices[feature.key])?[choices[feature.key]]:[])])]
  const color=(key,value)=>appearanceSwatch(key,value)
</script>
{#snippet featureControl(feature)}
    {@const value=choices[feature.key]??''}
    {@const gallery=feature.key==='hair'||feature.key==='facialHair'||(feature.key==='body'&&(!choices.form||choices.form==='human-like'))}
    {@const palette=feature.key==='hairColor'||feature.key==='complexion'}
    <div class="ui-appearance-controls__feature">
      <div class="ui-appearance-controls__heading">{#if gallery||palette}<span>{feature.label}</span>{:else}<label for={`${uid}-${feature.key}`}>{feature.label}</label>{/if}{#if feature.randomizable!==false}<label class="ui-appearance-controls__lock"><input type="checkbox" aria-label={`Keep ${feature.label.toLowerCase()}`} checked={locks[feature.key]??false} disabled={busy} onchange={event=>onlock?.(feature.key,event.currentTarget.checked)} />Keep</label>{/if}</div>
      {#if palette}<p class="ui-appearance-controls__hint">{value||'Unspecified'}</p>{/if}
      {#if gallery||palette}
        <div class="ui-appearance-controls__options" class:ui-appearance-controls__options--palette={palette} role="group" aria-label={feature.label} id={`${uid}-${feature.key}`}>
          {#each options(feature) as option (option)}
            <button type="button" class:ui-appearance-controls__option--empty={!option} aria-label={`${feature.label}: ${option||'Unspecified'}`} aria-pressed={value===option} disabled={busy} onclick={()=>{if(!busy)onchange?.(feature.key,option)}} title={option||'Unspecified'}>
              {#if palette}<span class="ui-appearance-controls__swatch" class:ui-appearance-controls__swatch--empty={!option} style:--appearance-color={option?color(feature.key,option):'transparent'} aria-hidden="true"></span>{:else if option}<AppearancePresetIcon feature={feature.key} value={option} {choices} />{/if}
              <span class:ui-appearance-controls__sr={palette&&!!option&&!!color(feature.key,option)}>{feature.key==='body'?option.split(' — ')[0]||'Unspecified':option||'Unspecified'}</span>
            </button>
          {/each}
        </div>
      {:else}
        <select id={`${uid}-${feature.key}`} aria-label={feature.label} {value} disabled={busy} onchange={event=>onchange?.(feature.key,event.currentTarget.value)}>{#each options(feature) as option (option)}<option value={option}>{option||'Unspecified'}</option>{/each}</select>
      {/if}
    </div>
{/snippet}
{#if look}<div class="ui-appearance-controls">
  <div class="ui-appearance-controls__toolbar"><span>Local design</span><Button variant="tool" icon="shuffle" disabled={busy} onclick={()=>onchange?.()}>Randomize unlocked</Button></div>
  <SegmentedControl label="Appearance categories" value={active} items={available} onselect={value=>category=value} />
  <p class="ui-appearance-controls__hint">Design proposals. Identity and locked choices stay when you randomize.</p>
  {#if active==='surface'}<p class="ui-appearance-controls__hint">Applies to skin, fur, scales or feathers. Set clothing separately in Wardrobe and details.</p>{/if}
  {#if active==='hair'&&hairItems.length>1}<SegmentedControl label="Hair features" value={activeHair} items={hairItems} onselect={value=>hairFeature=value} />{/if}
  {#each primary as feature (feature.key)}{@render featureControl(feature)}{/each}
  {#if proportions.length}<details><summary>Proportions</summary><div class="ui-appearance-controls__proportions">{#each proportions as feature (feature.key)}{@render featureControl(feature)}{/each}</div></details>{/if}
  <p class="ui-appearance-controls__hint">Selections guide generation. Unspecified leaves the feature open.</p>
</div>{/if}
<style>
  .ui-appearance-controls{display:flex;flex-direction:column;gap:var(--spacing-sm);font-size:var(--caption-size);}
  .ui-appearance-controls__toolbar,.ui-appearance-controls__heading{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-xs);}
  .ui-appearance-controls__toolbar>span,.ui-appearance-controls__heading>label,.ui-appearance-controls__heading>span{font-weight:600;color:var(--text-primary);}
  .ui-appearance-controls__hint{margin:0;color:var(--text-secondary);font-size:var(--caption-size);line-height:1.45;}
  .ui-appearance-controls__feature{display:flex;flex-direction:column;gap:var(--spacing-xs);padding-block:var(--spacing-xs);}
  summary{cursor:pointer;color:var(--text-primary);font-weight:600;padding-block:var(--spacing-xs);}.ui-appearance-controls__proportions{display:flex;flex-direction:column;gap:var(--spacing-xs);}
  .ui-appearance-controls__lock{display:flex;align-items:center;gap:var(--spacing-xs);white-space:nowrap;color:var(--text-secondary);}.ui-appearance-controls__lock input{accent-color:var(--action-primary);margin:0;}
  select{width:100%;height:30px;box-sizing:border-box;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--surface-base);color:var(--text-primary);padding:var(--spacing-xs);font:inherit;}
  .ui-appearance-controls__options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--spacing-xs);}
  .ui-appearance-controls__options button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--spacing-xs);min-width:0;min-height:80px;padding:var(--spacing-xs);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--surface-base);color:var(--text-primary);font:inherit;font-size:var(--caption-size);text-align:center;line-height:1.3;cursor:pointer;overflow-wrap:anywhere;}
  .ui-appearance-controls__options button:hover:not(:disabled){background:var(--surface-raised);border-color:var(--border-default);}.ui-appearance-controls__options button[aria-pressed=true]{border-color:var(--border-focus);background:var(--surface-raised);}.ui-appearance-controls__options button:disabled{opacity:.5;cursor:default;}
  .ui-appearance-controls__options button.ui-appearance-controls__option--empty{min-height:30px;grid-column:1/-1;flex-direction:row;}
  .ui-appearance-controls__options--palette{grid-template-columns:repeat(6,minmax(0,1fr));}.ui-appearance-controls__options--palette button{min-height:36px;padding:var(--spacing-2xs);}
  .ui-appearance-controls__sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}
  .ui-appearance-controls__swatch{display:block;width:28px;height:20px;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--appearance-color);}.ui-appearance-controls__swatch--empty{display:none;}
  .ui-appearance-controls__options--palette .ui-appearance-controls__swatch{width:100%;height:24px;box-sizing:border-box;}
  button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--border-focus);outline-offset:2px;}
</style>

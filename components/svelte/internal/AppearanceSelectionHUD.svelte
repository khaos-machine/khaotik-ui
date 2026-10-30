<script>
  import {appearanceSwatch} from '../lib/appearance-palette.js'
  /** @type {{look:{features:readonly {key:string,label:string,options:readonly string[]}[],choices:Record<string,string>},dirty?:boolean,persisted?:boolean,onedit?:(key:string)=>void}} */
  let {look,dirty=false,persisted=false,onedit=undefined}=$props()
  const keys=['gender','hair','hairColor','texture','complexion','head','body']
  const selected=$derived(keys.flatMap(key=>{
    const feature=look.features.find(f=>f.key===key),value=look.choices[key]||(key==='gender'?'Unspecified':'')
    return feature&&value?[{...feature,value}]:[]
  }))
  const labels={gender:'Gender',hair:'Hair',hairColor:'Hair color',texture:'Covering',complexion:'Body color',head:'Head',body:'Body'}
</script>
<section class="ui-appearance-selection" aria-label="Appearance selections">
  <div class="ui-appearance-selection__heading"><strong>Next generation</strong><span>{dirty?'Unsaved edits':persisted?'Saved direction':'Proposed direction'}</span></div>
  {#if selected.length}
    <div class="ui-appearance-selection__choices">
      {#each selected as feature (feature.key)}
        {@const swatch=appearanceSwatch(feature.key,feature.value)}
        <button type="button" aria-label={`Edit ${feature.label.toLowerCase()}: ${feature.value}`} title={`${feature.label}: ${feature.value}`} onclick={()=>onedit?.(feature.key)}>
          {#if swatch}<span class="ui-appearance-selection__swatch" style:--appearance-color={swatch} aria-hidden="true"></span>{/if}
          <span class="ui-appearance-selection__label">{labels[feature.key]}</span><span class="ui-appearance-selection__value">{feature.value}</span>
        </button>
      {/each}
    </div>
  {:else}<button type="button" onclick={()=>onedit?.('head')}>Choose appearance details</button>{/if}
</section>
<style>
  .ui-appearance-selection{max-width:620px;display:flex;flex-direction:column;gap:var(--spacing-2xs);padding:var(--spacing-xs);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:color-mix(in oklab,var(--surface-raised) 84%,transparent);backdrop-filter:blur(18px);color:var(--text-primary);font-size:var(--caption-size);}
  .ui-appearance-selection__heading{display:flex;align-items:center;gap:var(--spacing-sm);font-size:var(--caption-size);}.ui-appearance-selection__heading strong{font-weight:600;}.ui-appearance-selection__heading>span{color:var(--text-secondary);}
  .ui-appearance-selection__choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:var(--spacing-2xs);}
  button{display:inline-flex;align-items:center;gap:var(--spacing-2xs);min-width:0;padding:var(--spacing-2xs);border:1px solid transparent;border-radius:var(--radius-sm);background:transparent;color:var(--text-primary);font:inherit;font-size:var(--caption-size);text-align:left;cursor:pointer;}
  button:hover{border-color:var(--border-default);background:var(--surface-base);}button:focus-visible{outline:2px solid var(--border-focus);outline-offset:1px;}
  .ui-appearance-selection__label{color:var(--text-secondary);white-space:nowrap;}.ui-appearance-selection__value{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .ui-appearance-selection__swatch{width:16px;height:16px;flex:0 0 16px;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--appearance-color);}
</style>

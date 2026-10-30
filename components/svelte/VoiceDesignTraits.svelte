<script>
/** @typedef {{age?:string,gender?:string,languageCode?:string,regionCode?:string,accent?:string,pitch?:string,timbre?:string,persona?:string,context?:string,delivery?:string}} VoiceTraits */
/**
 * @typedef {Object} Props
 * @property {VoiceTraits} [value] Explicit creative traits.
 * @property {boolean} [disabled] A request prevents edits.
 * @property {(patch:VoiceTraits)=>void} [onchange] Edit traits without generating audio.
 */
/** @type {Props} */
let {value={},disabled=false,onchange=undefined}=$props()
</script>
<details class="voice-traits"><summary>Voice traits · language and accent</summary>
<p>Optional creative direction. Leave a trait open when you have no preference.</p>
<fieldset {disabled}>
<label>Starting point<select aria-label="Voice design starting point" onchange={event=>{const key=event.currentTarget.value;if(key==='audiobook')onchange?.({persona:'Storyteller',context:'Audiobook',delivery:'Intimate and clear, with a steady baseline cadence'});if(key==='documentary')onchange?.({persona:'Observer',context:'Documentary narration',delivery:'Measured and clear, with restrained authority'});if(key==='character')onchange?.({persona:'Character',context:'Dramatic dialogue',delivery:'Natural conversational baseline'})}}><option value="">Choose a starting point…</option><option value="audiobook">Intimate storyteller</option><option value="documentary">Clear observer</option><option value="character">Conversational character</option></select></label>
<div class="voice-traits__grid">
<label>Age impression<input aria-label="Voice age impression" placeholder="e.g. late 40s" value={value.age??''} oninput={event=>onchange?.({age:event.currentTarget.value})} /></label>
<label>Gender presentation<select aria-label="Voice gender presentation" value={value.gender??''} onchange={event=>onchange?.({gender:event.currentTarget.value})}><option value="">Unspecified</option><option value="female">Female</option><option value="male">Male</option><option value="neutral">Neutral</option></select></label>
<label>Spoken language / locale<input aria-label="Voice language code" placeholder="e.g. en-US, es-MX" value={value.languageCode??''} oninput={event=>onchange?.({languageCode:event.currentTarget.value})} /></label>
<label>Region<input aria-label="Voice region code" placeholder="e.g. US, GB, MX, 001" value={value.regionCode??''} oninput={event=>onchange?.({regionCode:event.currentTarget.value.toUpperCase()})} /></label>
</div>
<label>Regional accent / dialect<input aria-label="Voice regional accent" placeholder="e.g. New York English, Mexico City Spanish" value={value.accent??''} oninput={event=>onchange?.({accent:event.currentTarget.value})} /></label>
<div class="voice-traits__grid"><label>Pitch<select aria-label="Voice pitch" value={value.pitch??''} onchange={event=>onchange?.({pitch:event.currentTarget.value})}><option value="">Unspecified</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Timbre / texture<input aria-label="Voice timbre" placeholder="e.g. warm, lightly textured" value={value.timbre??''} oninput={event=>onchange?.({timbre:event.currentTarget.value})} /></label></div>
<label>Persona<input aria-label="Voice persona" value={value.persona??''} oninput={event=>onchange?.({persona:event.currentTarget.value})} /></label><label>Intended use<input aria-label="Voice context" value={value.context??''} oninput={event=>onchange?.({context:event.currentTarget.value})} /></label><label>Baseline delivery<input aria-label="Voice baseline delivery" placeholder="A reusable manner; direct individual lines separately" value={value.delivery??''} oninput={event=>onchange?.({delivery:event.currentTarget.value})} /></label>
</fieldset><p>Language uses a BCP-47 tag. Region uses a two-letter country or three-digit region code. Accent adds local detail within that language.</p>
</details>
<style>.voice-traits{border-block:1px solid var(--border-hairline);padding:10px 0}summary{cursor:pointer;color:var(--text-primary);font-size:12px}p{font-size:11px;line-height:1.6;color:var(--text-secondary)}fieldset{border:0;margin:0;padding:0;display:flex;flex-direction:column;gap:12px;min-width:0}label{display:flex;flex-direction:column;gap:5px;color:var(--text-secondary);font-size:12px}.voice-traits__grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}input,select{box-sizing:border-box;min-width:0;width:100%;padding:7px 9px;border:1px solid var(--border-default);border-radius:var(--radius-sm);color:var(--text-primary);background:var(--surface-base);font:inherit}input:focus-visible,select:focus-visible{outline:2px solid var(--border-focus);outline-offset:2px}</style>

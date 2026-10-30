const colors={
  'very deep brown':'#38231e','deep brown':'#633f32','medium brown':'#976744',
  'warm tan':'#bd946b',olive:'#a1956b','light brown':'#c59a75',
  'light with warm undertones':'#e1b994','very light with cool undertones':'#ebcec2',
  ivory:'#e5ddc8',charcoal:'#494746','rust red':'#a95b44','slate blue':'#6f849e',
  'golden yellow':'#d8b562','muted violet':'#9d86a2',
}
const hairColors={'black':'#292725','deep brown':'#49332b','light brown':'#956747',auburn:'#7b3b2c','copper red':'#b85f34','golden blond':'#c8a258','platinum blond':'#e5d6ae','salt and pepper':'#797572','silver gray':'#b1aca4',white:'#ece7df','dyed violet':'#836084'}

/** Color samples describe authored appearance, independently of app-theme tokens. */
export function appearanceSwatch(key,value){
  if(key!=='hairColor'&&key!=='complexion')return null
  const palette=key==='hairColor'?hairColors:colors
  if(Object.hasOwn(palette,value))return palette[value]
  return typeof value==='string'?value.match(/\((#[0-9a-f]{6})\)$/i)?.[1]??null:null
}
export function appearancePalette(choices){return {color:appearanceSwatch('complexion',choices.complexion)??'#b6afa2',hairColor:appearanceSwatch('hairColor',choices.hairColor)??'#302b28'}}
export function appearanceCategory(key,form){
  if(['body','stature','build','musculature','shoulders','waist','hips','proportions'].includes(key))return 'body'
  if(['head','jaw','nose','eyes'].includes(key))return 'face'
  if(['hair','hairTexture','hairColor','facialHair'].includes(key))return 'hair'
  if(key==='texture')return 'surface'
  return key==='complexion'?'surface':'identity'
}

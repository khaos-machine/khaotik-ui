import {it,expect,vi} from 'vitest'
import {render,screen,fireEvent} from '@testing-library/svelte'
import AppearanceControls from '@khaos-machine/khaotik-ui/components/svelte/internal/AppearanceControls.svelte'
import AppearanceGenerationStatus from '@khaos-machine/khaotik-ui/components/svelte/internal/AppearanceGenerationStatus.svelte'
const look={features:[{key:'form',label:'Character form',options:['human-like','creature'],randomizable:false},{key:'head',label:'Head',options:['broad','narrow']},{key:'hair',label:'Hair / crest',options:['shaved head','long twists pulled back']},{key:'hairColor',label:'Hair color',options:['black','copper red']},{key:'facialHair',label:'Facial hair',options:['clean-shaven','mustache']},{key:'complexion',label:'Base color',options:['deep brown','light brown']}],choices:{form:'human-like',hair:'shaved head',facialHair:'clean-shaven',hairColor:'copper red'}}
it('releases picker state safely when the host clears its look',async()=>{
 const {rerender,unmount}=render(AppearanceControls,{look})
 await fireEvent.click(screen.getByRole('radio',{name:'Hair',exact:true}))
 await rerender({look:null})
 expect(screen.queryByRole('radio',{name:'Hair',exact:true})).not.toBeInTheDocument()
 await unmount()
})
it('keeps identity separate from body shapes and named exact surface colors',async()=>{
 const color='deep neutral brown (#4b3932)',body='triangle / pear — hips wider than shoulders'
 const extended={features:[...look.features,{key:'gender',label:'Gender / presentation',options:['male','female','nonbinary'],randomizable:false},{key:'body',label:'Body silhouette',options:[body]},{key:'build',label:'Build',options:['full build']},{key:'hips',label:'Hip / lower-body width',options:['wide hips']}],choices:{...look.choices,gender:'male',complexion:color}}
 const onchange=vi.fn()
 render(AppearanceControls,{look:extended,onchange})
 expect(screen.getByRole('combobox',{name:'Gender / presentation'})).toHaveValue('male')
 expect(screen.queryByRole('checkbox',{name:'Keep gender / presentation'})).not.toBeInTheDocument()
 await fireEvent.click(screen.getByRole('radio',{name:'Body',exact:true}))
 await fireEvent.click(screen.getByRole('button',{name:`Body silhouette: ${body}`}))
 expect(onchange).toHaveBeenLastCalledWith('body',body)
 await fireEvent.click(screen.getByText('Proportions'))
 await fireEvent.change(screen.getByRole('combobox',{name:'Hip / lower-body width'}),{target:{value:'wide hips'}})
 expect(onchange).toHaveBeenLastCalledWith('hips','wide hips')
 await fireEvent.click(screen.getByRole('radio',{name:'Surface',exact:true}))
 const swatch=screen.getByRole('button',{name:`Base color: ${color}`})
 expect(swatch).toHaveAttribute('aria-pressed','true')
 expect(swatch.querySelector('.ui-appearance-controls__swatch')).toHaveAttribute('style',expect.stringContaining('#4b3932'))
 expect(onchange).toHaveBeenCalledTimes(2)
})
it('switches categories without changing appearance and distinguishes unspecified from explicit grooming',async()=>{
 const onchange=vi.fn(),onlock=vi.fn()
 const {rerender}=render(AppearanceControls,{look,locks:{hair:true},onchange,onlock})
 expect(screen.queryByRole('checkbox',{name:'Keep character form'})).not.toBeInTheDocument()
 await fireEvent.click(screen.getByRole('radio',{name:'Hair',exact:true}))
 expect(onchange).not.toHaveBeenCalled()
 expect(screen.getByRole('button',{name:'Hair / crest: shaved head'})).toHaveAttribute('aria-pressed','true')
 expect(screen.getByRole('button',{name:'Hair / crest: Unspecified'})).toHaveAttribute('aria-pressed','false')
 expect(screen.getByRole('checkbox',{name:'Keep hair / crest'})).toBeChecked()
 await fireEvent.click(screen.getByRole('button',{name:'Hair / crest: long twists pulled back'}))
 expect(onchange).toHaveBeenLastCalledWith('hair','long twists pulled back')
 await fireEvent.click(screen.getByRole('radio',{name:'Facial hair',exact:true}))
 await fireEvent.click(screen.getByRole('button',{name:'Facial hair: mustache'}))
 expect(onchange).toHaveBeenLastCalledWith('facialHair','mustache')
 await fireEvent.click(screen.getByRole('radio',{name:'Color',exact:true}))
 await fireEvent.click(screen.getByRole('button',{name:'Hair color: black'}))
 expect(onchange).toHaveBeenLastCalledWith('hairColor','black')
 await rerender({look,locks:{hair:true},onchange,onlock,busy:true})
 await fireEvent.click(screen.getByRole('radio',{name:'Facial hair',exact:true}))
 expect(screen.getByRole('button',{name:'Facial hair: mustache'})).toBeDisabled()
 await fireEvent.click(screen.getByRole('button',{name:'Facial hair: mustache'}))
 expect(onchange).toHaveBeenCalledTimes(3)
})
it.each([
 ['queued','waiting','Generation queued'],['running','waiting','Generating character sheet'],['succeeded','pending','Saving artwork to the project'],['succeeded','saved','Sheet 5 is ready to review'],
])('presents actual generation/publication state %s/%s',async(state,publication,title)=>{
 const review=vi.fn()
 render(AppearanceGenerationStatus,{job:{id:'job',state,publication},version:'Sheet 5',onreview:review})
 expect(screen.getByRole('status')).toHaveTextContent(title)
 if(publication==='saved'){await fireEvent.click(screen.getByRole('button',{name:'Review Sheet 5'}));expect(review).toHaveBeenCalledOnce()}
 else expect(screen.queryByRole('button',{name:'Review Sheet 5'})).not.toBeInTheDocument()
})
it('keeps the actual failure and operation identity available without offering an automatic retry',async()=>{
 render(AppearanceGenerationStatus,{job:{id:'generation-receipt',state:'failed',publication:'waiting',error:'Provider rejected this request: retained diagnostic'}})
 expect(screen.getByRole('alert')).toHaveTextContent('Provider rejected this request: retained diagnostic')
 await fireEvent.click(screen.getByText('Operation details'))
 expect(screen.getByText('generation-receipt')).toBeVisible()
 expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
it('edits alien surfaces independently from hair texture and mohawk style',async()=>{
 const blue='electric blue (#3478f6)',purple='amethyst purple (#9966cc)'
 const expanded={features:[...look.features,{key:'texture',label:'Skin / covering',options:['short soft fur','small overlapping scales','layered feathers']},{key:'hairTexture',label:'Hair texture',options:['tightly coiled','wavy']}].map(f=>f.key==='complexion'?{...f,label:'Skin / covering color',options:[blue,purple]}:f.key==='hair'?{...f,options:[...f.options,'tall mohawk with shaved sides']}:f),choices:{...look.choices,texture:'short soft fur',hairTexture:'tightly coiled',complexion:blue}}
 const onchange=vi.fn()
 render(AppearanceControls,{look:expanded,onchange})
 await fireEvent.click(screen.getByRole('radio',{name:'Surface',exact:true}))
 expect(screen.getByRole('combobox',{name:'Skin / covering'})).toHaveValue('short soft fur')
 await fireEvent.change(screen.getByRole('combobox',{name:'Skin / covering'}),{target:{value:'layered feathers'}})
 expect(onchange).toHaveBeenLastCalledWith('texture','layered feathers')
 await fireEvent.click(screen.getByRole('button',{name:`Skin / covering color: ${purple}`}))
 expect(onchange).toHaveBeenLastCalledWith('complexion',purple)
 await fireEvent.click(screen.getByRole('radio',{name:'Hair',exact:true}))
 await fireEvent.click(screen.getByRole('radio',{name:'Texture',exact:true}))
 expect(screen.getByRole('combobox',{name:'Hair texture'})).toHaveValue('tightly coiled')
 await fireEvent.click(screen.getByRole('radio',{name:'Style',exact:true}))
 await fireEvent.click(screen.getByRole('button',{name:'Hair / crest: tall mohawk with shaved sides'}))
 expect(onchange).toHaveBeenLastCalledWith('hair','tall mohawk with shaved sides')
})

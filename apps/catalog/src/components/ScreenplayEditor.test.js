import {it,expect,vi,afterEach} from 'vitest'
import {render,screen,fireEvent} from '@testing-library/svelte'
import ScreenplayEditor from '@khaos-machine/khaotik-ui/components/svelte/ScreenplayEditor.svelte'
import composition from '../data/composition.json'
const segment=composition.segments.find(segment=>segment.sceneId&&segment.events.some(event=>event.elementType==='action'))
const event=segment.events.find(event=>event.elementType==='action')
const document={title:'BROKEN IN 4 PLACES',scenes:[{id:segment.sceneId,heading:segment.label,blocks:[{id:event.elementId,kind:'action',text:event.text,speaker:'',parenthetical:'',centered:false,simultaneous:false,editable:true}]}]}
afterEach(()=>vi.unstubAllGlobals())
function mount(props={}){vi.stubGlobal('ResizeObserver',class{observe(){} disconnect(){}});return render(ScreenplayEditor,{document,selected:segment.sceneId,...props})}
it('edits the existing action identity and saves from its screenplay field',async()=>{
 const ontext=vi.fn(),onsave=vi.fn()
 mount({ontext,onsave,dirty:1})
 const field=screen.getByRole('textbox',{name:'Action 1'})
 expect(field.value).toBe(event.text)
 await fireEvent.input(field,{target:{value:event.text+' '}})
 expect(ontext).toHaveBeenCalledWith(event.elementId,event.text+' ')
 field.focus();await fireEvent.keyDown(field,{key:'s',metaKey:true})
 expect(onsave).toHaveBeenCalledTimes(1)
})
it('shows unfamiliar title-page fields without dropping them and requires discard confirmation',async()=>{
 const onpage=vi.fn(),ondiscard=vi.fn()
 mount({selected:'title-page',fields:['custom'],page:{custom:'Retain this value'},onpage,ondiscard,dirty:1})
 expect(screen.getByRole('textbox',{name:'custom'}).value).toBe('Retain this value')
 await fireEvent.input(screen.getByRole('textbox',{name:'custom'}),{target:{value:'Updated'}})
 expect(onpage).toHaveBeenCalledWith('custom','Updated')
 await fireEvent.click(screen.getByRole('button',{name:'Discard…'}))
 expect(ondiscard).not.toHaveBeenCalled()
 await fireEvent.click(screen.getByRole('button',{name:'Discard changes',exact:true}))
 expect(ondiscard).toHaveBeenCalledTimes(1)
})

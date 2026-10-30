import {it,expect,vi} from 'vitest'
import {render,screen,fireEvent,waitFor} from '@testing-library/svelte'
import PictureTimelineLane from '@khaos-machine/khaotik-ui/components/svelte/internal/PictureTimelineLane.svelte'
it('selects a clip for its context menu without seeking, then emits a split intent',async()=>{
 const onSelect=vi.fn(),onAction=vi.fn()
 render(PictureTimelineLane,{clips:[{id:'one',label:'The wait',start:10,duration:5,minStart:0,maxEnd:30,chosen:false}],scale:10,total:30,onSelect,onAction})
 await fireEvent.contextMenu(screen.getByRole('button',{name:'The wait at 0:10'}),{clientX:120,clientY:40})
 await waitFor(()=>expect(onSelect).toHaveBeenCalledWith('one','context'))
 const item=await screen.findByRole('menuitem',{name:'Split at playhead'})
 await fireEvent.pointerMove(item,{pointerType:'mouse',clientX:130,clientY:80})
 await fireEvent.pointerDown(item,{pointerType:'mouse'})
 await fireEvent.click(item)
 await waitFor(()=>expect(onAction).toHaveBeenCalledExactlyOnceWith('one','split'))
})
it('shows retained read timing previews as selectable artwork without trim or keyboard edits',async()=>{
 const onSelect=vi.fn(),onChange=vi.fn(),onAction=vi.fn()
 render(PictureTimelineLane,{clips:[{id:'retained',label:'Grief at the Coffin',start:10,duration:5,imageUrl:'/frame.png',readOnly:true,warning:'Reading changed · timing preview'}],scale:10,total:30,onSelect,onChange,onAction})
 const clip=screen.getByRole('button',{name:/Grief at the Coffin at 0:10/})
 await fireEvent.pointerDown(clip,{button:0,isPrimary:true})
 await fireEvent.keyDown(clip,{key:'ArrowRight'})
 await fireEvent.keyDown(clip,{key:'s'})
 expect(onSelect).toHaveBeenCalledWith('retained')
 expect(onChange).not.toHaveBeenCalled();expect(onAction).not.toHaveBeenCalled()
 expect(screen.queryByRole('button',{name:'Trim start of Grief at the Coffin'})).toBeNull()
})

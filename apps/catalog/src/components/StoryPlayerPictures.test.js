import fs from 'node:fs'
import path from 'node:path'
import { expect,it,vi } from 'vitest'
import { fireEvent,render,screen } from '@testing-library/svelte'
import StoryPlayer from '@khaos-machine/khaotik-ui/components/svelte/StoryPlayer.svelte'
import { pictureRange } from '@khaos-machine/khaotik-ui/components/svelte/lib/picture-range.js'
const segments=[{kind:'scene',sceneId:'one',label:'Scene',startMs:0,durationMs:40000,events:[]}]
const clip={id:'picture-one',label:'Arrival',start:5,duration:10,imageUrl:'data:image/png;base64,AA==',minStart:0,maxEnd:30}
function pointer(target,type,clientX,pointerId=7){const event=new Event(type,{bubbles:true,cancelable:true});Object.assign(event,{clientX,pointerId,button:0,isPrimary:true});return fireEvent(target,event)}
it('shares composition scale and playhead, and can omit its own inspector',()=>{
 const {container}=render(StoryPlayer,{segments,scale:20,pictures:[clip],selectedPictureId:clip.id,showInspector:false})
 const element=container.querySelector('[data-picture-id="picture-one"]')
 expect(element.style.left).toBe('100px');expect(element.style.width).toBe('200px')
 expect(element.closest('.player__track')).toContainElement(screen.getByRole('slider',{name:'Timeline playhead'}))
 expect(container.querySelector('.player__panel')).toBeNull()
})
it('does not add a picture lane for existing consumers',()=>{
 const {container}=render(StoryPlayer,{segments})
 expect(container.querySelector('.picture-lane')).toBeNull()
 expect(container.querySelector('.player__panel')).not.toBeNull()
})
it('commits one bounded move and discards a cancelled trim',async()=>{
 const onChangePicture=vi.fn(),onSelectPicture=vi.fn()
 render(StoryPlayer,{segments,scale:10,pictures:[clip],onChangePicture,onSelectPicture})
 const body=screen.getByRole('button',{name:'Arrival at 0:05'})
 await pointer(body,'pointerdown',100)
 await pointer(window,'pointermove',150,99)
 expect(onChangePicture).not.toHaveBeenCalled()
 await pointer(window,'pointermove',150)
 expect(document.querySelector('[data-picture-id]').style.left).toBe('100px')
 await pointer(window,'pointerup',150)
 expect(onChangePicture).toHaveBeenCalledExactlyOnceWith('picture-one',{start:10,duration:10})
 await pointer(screen.getByRole('button',{name:'Trim end of Arrival'}),'pointerdown',200)
 await pointer(window,'pointermove',900)
 await pointer(window,'pointercancel',900)
 expect(onChangePicture).toHaveBeenCalledTimes(1)
})
it('provides bounded keyboard trimming and leaves the opposite edge fixed',async()=>{
 const onChangePicture=vi.fn()
 render(StoryPlayer,{segments,scale:10,pictures:[clip],onChangePicture})
 await fireEvent.keyDown(screen.getByRole('button',{name:'Trim start of Arrival'}),{key:'ArrowRight',shiftKey:true})
 expect(onChangePicture).toHaveBeenLastCalledWith('picture-one',{start:6,duration:9})
 expect(pictureRange(clip,-100,'move',40)).toEqual({start:0,duration:10})
 expect(pictureRange(clip,100,'end',40)).toEqual({start:5,duration:25})
 expect(pictureRange(clip,100,'start',40).duration).toBeCloseTo(.1)
})

it('keeps the original pointer owner until completion even across another pointerdown',async()=>{
 const onChangePicture=vi.fn()
 render(StoryPlayer,{segments,scale:10,pictures:[clip],onChangePicture})
 const body=screen.getByRole('button',{name:'Arrival at 0:05'})
 await pointer(body,'pointerdown',100,7)
 await pointer(body,'pointerdown',300,99)
 await pointer(window,'pointerup',500,99)
 expect(onChangePicture).not.toHaveBeenCalled()
 await pointer(window,'pointermove',120,7)
 await pointer(window,'pointercancel',120,99)
 await pointer(window,'pointerup',120,7)
 expect(onChangePicture).toHaveBeenCalledExactlyOnceWith('picture-one',{start:7,duration:10})
})
it('keeps the picture gutter and lane at the same outer height without a consumer reset',()=>{
 const root=path.resolve(import.meta.dirname,'../../../../components/svelte')
 const lane=fs.readFileSync(path.join(root,'internal/PictureTimelineLane.svelte'),'utf8')
 const player=fs.readFileSync(path.join(root,'StoryPlayer.svelte'),'utf8')
 for(const [source,selector] of [[lane,'picture-lane'],[player,'player__picture-label']]){
  const rule=source.match(new RegExp('\\.'+selector+' \\{([^}]+)\\}'))?.[1]
  expect(rule).toContain('height:60px')
  expect(rule).toContain('box-sizing:border-box')
 }
})

it('distinguishes the picture under the playhead from the explicitly selected picture',()=>{
 const {container}=render(StoryPlayer,{segments,scale:20,pictures:[clip,{...clip,id:'second',label:'Reaction',start:15}],selectedPictureId:'second',activePictureId:clip.id})
 const active=container.querySelector('[data-picture-id="picture-one"]')
 const selected=container.querySelector('[data-picture-id="second"]')
 expect(active).toHaveClass('active')
 expect(active.querySelector('button')).toHaveAttribute('aria-pressed','false')
 expect(selected).toHaveClass('selected')
 expect(selected).not.toHaveClass('active')
 expect(selected.querySelector('button')).toHaveAttribute('aria-pressed','true')
})

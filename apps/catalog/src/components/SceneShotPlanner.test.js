import {it,expect,vi} from 'vitest'
import {render,screen,fireEvent,waitFor} from '@testing-library/svelte'
import SceneShotPlanner from '@khaos-machine/khaotik-ui/components/svelte/SceneShotPlanner.svelte'
import ShotPreview from '@khaos-machine/khaotik-ui/components/svelte/ShotPreview.svelte'
import { within } from '@testing-library/svelte'
const shot={title:'Locked out',intent:'Reveal the obstacle',direction:'Hold on the chain across the door.',framing:'Detail insert',startMs:4000,durationMs:3000,continuity:'Same door',beatIndices:[1],sourceEventIds:['event-one'],proposals:[]}
it('shows existing shot coverage and opens a shot without requesting a new plan',async()=>{
 const onselect=vi.fn(),onplan=vi.fn()
 const coverage=[{id:'one',title:'Arrival',framing:'Wide shot',start:0,hold:4,timingStatus:'resolved',status:'used',imageUrl:'/arrival.png',imageState:'ready'},
 {id:'two',title:'The locked door',framing:'Detail insert',start:null,hold:3,timingStatus:'unresolved',status:'missing',imageUrl:'',imageState:'missing'}]
 render(SceneShotPlanner,{modal:true,coverage,selectedShotId:'two',activeShotId:'one',onselect,onplan})
 const sequence=within(screen.getByRole('list',{name:'Scene shots'}))
 expect(sequence.getByRole('button',{name:/Arrival/})).toHaveAttribute('aria-current','true')
 expect(sequence.getByRole('button',{name:/The locked door/})).toHaveAttribute('aria-pressed','true')
 expect(sequence.getByText(/Set timing/)).toBeVisible()
 expect(screen.queryByRole('button',{name:'Plan scene shots'})).not.toBeInTheDocument()
 await fireEvent.click(sequence.getByRole('button',{name:/The locked door/}))
 expect(onselect).toHaveBeenCalledExactlyOnceWith('two');expect(onplan).not.toHaveBeenCalled()
 await fireEvent.click(screen.getByRole('button',{name:'Plan scene shots…'}))
 expect(screen.getByRole('button',{name:'Plan scene shots'})).toBeVisible()
})
it('keeps a planning proposal after closing the workspace and does not dispatch while opening it',async()=>{
 const onplan=vi.fn(),onapply=vi.fn()
 render(SceneShotPlanner,{modal:true,sceneLabel:'INT. STUDIO - DAY',plan:{summary:'Reveal and reaction',warnings:[],shots:[shot]},onplan,onapply})
 await fireEvent.click(screen.getByRole('button',{name:'Review planned shots…'}))
 const dialog=screen.getByRole('dialog',{name:'Plan scene shots'})
 expect(dialog).toHaveTextContent('INT. STUDIO - DAY')
 expect(within(dialog).getByRole('textbox',{name:'Planned shot 1 direction'})).toHaveValue(shot.direction)
 await waitFor(()=>expect(dialog.contains(document.activeElement)).toBe(true))
 await fireEvent.click(within(dialog).getByRole('button',{name:'Close shot planning'}))
 await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull())
 await waitFor(()=>expect(screen.getByRole('button',{name:'Review planned shots…'})).toHaveFocus())
 await fireEvent.click(screen.getByRole('button',{name:'Review planned shots…'}))
 expect(screen.getByRole('textbox',{name:'Planned shot 1 direction'})).toHaveValue(shot.direction)
 expect(onplan).not.toHaveBeenCalled();expect(onapply).not.toHaveBeenCalled()
})
it('keeps keyboard selection and failed previews usable without generating artwork',async()=>{
 const onselect=vi.fn(),onplan=vi.fn()
 const item={framing:'Wide shot',start:0,hold:4,timingStatus:'resolved',status:'unreviewed',imageUrl:'/preview.png',imageState:'ready'}
 render(SceneShotPlanner,{modal:true,coverage:[{...item,id:'one',title:'Arrival'},{...item,id:'two',title:'Locked out'}],onselect,onplan})
 const sequence=within(screen.getByRole('list',{name:'Scene shots'}))
 const first=sequence.getByRole('button',{name:/Arrival/}),second=sequence.getByRole('button',{name:/Locked out/})
 await fireEvent.keyDown(first,{key:'ArrowDown'})
 expect(second).toHaveFocus();expect(onselect).toHaveBeenLastCalledWith('two')
 await fireEvent.error(first.querySelector('img'))
 expect(within(first).getByText('Preview unavailable')).toBeVisible()
 await fireEvent.click(first);expect(onselect).toHaveBeenLastCalledWith('one');expect(onplan).not.toHaveBeenCalled()
})
it('reviews and edits a timed proposal before explicit application',async()=>{
 const onapply=vi.fn(),onchange=vi.fn(),onplan=vi.fn()
 render(SceneShotPlanner,{plan:{summary:'Reveal and reaction',warnings:[],shots:[shot]},onapply,onchange,onplan})
 expect(screen.getByText('Detail insert · 4.0–7.0s')).toBeVisible()
 expect(onapply).not.toHaveBeenCalled();expect(onplan).not.toHaveBeenCalled()
 await fireEvent.input(screen.getByRole('textbox',{name:'Planned shot 1 direction'}),{target:{value:'Move closer to the padlock.'}})
 expect(onchange).toHaveBeenCalledWith(0,{direction:'Move closer to the padlock.'})
 expect(shot.direction).toBe('Hold on the chain across the door.')
 await fireEvent.click(screen.getByRole('button',{name:'Apply shots'}));expect(onapply).toHaveBeenCalledOnce()
})
it('shows unrendered direction alongside the current story event and updates on the next cut',async()=>{
 const {rerender}=render(ShotPreview,{shot,event:{label:'Dialogue · Madison',text:'Jason, pick up.'}})
 expect(screen.getByRole('region',{name:'Active shot direction'})).toHaveTextContent(shot.direction)
 expect(screen.getByRole('region',{name:'Current story event'})).toHaveTextContent('Jason, pick up.')
 expect(screen.queryByRole('img')).not.toBeInTheDocument()
 await rerender({shot:{...shot,title:'The call',direction:'Close on her face.'},event:{label:'Transition',text:'CUT TO:'}})
 expect(screen.getByRole('heading',{name:'The call'})).toBeVisible()
 expect(screen.getByRole('region',{name:'Current story event'})).toHaveTextContent('CUT TO:')
})
it('waits for apply acknowledgement and retains a failed proposal',async()=>{
 let finish
 const onapply=vi.fn(()=>new Promise(resolve=>{finish=resolve}))
 const proposal={summary:'Reveal and reaction',warnings:[],shots:[shot]}
 const {rerender}=render(SceneShotPlanner,{modal:true,plan:proposal,onapply})
 await fireEvent.click(screen.getByRole('button',{name:'Review planned shots…'}))
 await fireEvent.click(screen.getByRole('button',{name:'Apply shots'}))
 expect(screen.getByRole('dialog')).toBeVisible()
 await rerender({modal:true,plan:proposal,onapply,error:'Could not save the shots.'})
 finish();await Promise.resolve()
 expect(screen.getByRole('dialog')).toHaveTextContent('Could not save the shots.')
 await fireEvent.click(screen.getByRole('button',{name:'Apply shots'}))
 await rerender({modal:true,plan:null,onapply,error:''})
 finish()
 await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull())
 expect(onapply).toHaveBeenCalledTimes(2)
})

const missingItem=(id,title)=>({id,title,framing:'Wide shot',start:0,hold:4,timingStatus:'resolved',status:'missing',imageUrl:'',imageState:'missing'})
const sceneInfo={location:'Apartment',duration:'0:54',timing:'Measured read',characters:['Madison'],references:['Madison','Keys']}
it('keeps scene generation in a scene workspace with no charge ask, listing the host queue instead of coverage',async()=>{
 const ongeneratescene=vi.fn(),onplan=vi.fn()
 const coverage=[missingItem('one','Arrival'),missingItem('two','The locked door'),missingItem('three','Keys')]
 const frameQueue={missing:[{id:'one',title:'Arrival'},{id:'three',title:'Keys'}],all:[{id:'one',title:'Arrival'},{id:'two',title:'The locked door'},{id:'three',title:'Keys'}]}
 render(SceneShotPlanner,{modal:true,inspector:true,sceneLabel:'Apartment',sceneInfo,coverage,frameQueue,generationReady:true,ongeneratescene,onplan})
 expect(screen.getByText('Selected scene')).toBeVisible()
 expect(screen.queryByRole('list',{name:'Scene shots'})).toBeNull()
 await fireEvent.click(screen.getByRole('button',{name:'Generate scene frames…'}))
 const dialog=within(await screen.findByRole('dialog',{name:'Generate scene frames'}))
 const queued=dialog.getAllByRole('listitem').map(item=>item.textContent)
 expect(queued).toEqual(['Arrival','Keys'])
 expect(dialog.queryByRole('checkbox')).toBeNull()
 expect(ongeneratescene).not.toHaveBeenCalled();expect(onplan).not.toHaveBeenCalled()
 await fireEvent.click(dialog.getByRole('button',{name:'Generate 2 frames'}))
 expect(ongeneratescene).toHaveBeenCalledExactlyOnceWith('missing',['one','three'])
})
it('keeps Generate disabled until the host has resolved the frame queue',async()=>{
 const ongeneratescene=vi.fn()
 render(SceneShotPlanner,{modal:true,inspector:true,sceneLabel:'Apartment',sceneInfo,coverage:[missingItem('one','Arrival')],frameQueue:null,generationReady:true,ongeneratescene})
 await fireEvent.click(screen.getByRole('button',{name:'Generate scene frames…'}))
 const dialog=within(await screen.findByRole('dialog',{name:'Generate scene frames'}))
 expect(dialog.getByText('Checking which shots need frames…')).toBeVisible()
 expect(dialog.queryAllByRole('listitem')).toEqual([])
 const generate=dialog.getByRole('button',{name:/^Generate/})
 expect(generate).toHaveAttribute('aria-disabled','true')
 await fireEvent.click(generate)
 expect(ongeneratescene).not.toHaveBeenCalled()
})

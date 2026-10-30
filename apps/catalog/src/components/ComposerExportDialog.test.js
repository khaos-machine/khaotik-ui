import {it,expect,vi} from 'vitest'
import {render,screen,fireEvent} from '@testing-library/svelte'
import ComposerExportDialog from '@khaos-machine/khaotik-ui/components/svelte/ComposerExportDialog.svelte'

it('lists named scenes and reports selection without starting an export',async()=>{
 const onscene=vi.fn(),onexport=vi.fn()
 render(ComposerExportDialog,{props:{open:true,scope:'selected',sceneIds:['first'],onscene,onexport,preflight:{ready:false,summary:null,formats:[],warnings:[],refusals:['Choose scenes'],scenes:[{id:'first',name:'First scene',number:1},{id:'third',name:'Third scene',number:3}]}}})
 expect(await screen.findByRole('checkbox',{name:/1\s*First scene/})).toBeChecked()
 await fireEvent.click(screen.getByRole('checkbox',{name:/3\s*Third scene/}))
 expect(onscene).toHaveBeenCalledWith('third',true)
 expect(onexport).not.toHaveBeenCalled()
 expect(screen.getByRole('button',{name:/^Export/ })).toHaveAttribute('aria-disabled','true')
})

it.each(['premiere','after-effects'])('lets %s export choose a new destination after an earlier MP4',async(format)=>{
 const onexport=vi.fn()
 const previous={name:'Story',status:'completed',current:'Export ready',completed:1,total:1,error:'',result:{directory:'/exports/movie',file:'/exports/movie/story.mp4',manifest:'/exports/movie/manifest.json'}}
 render(ComposerExportDialog,{props:{open:true,format,destination:'/exports/movie',job:previous,onexport,preflight:{ready:true,summary:null,scenes:[],formats:[],warnings:[],refusals:[]}}})
 const button=await screen.findByRole('button',{name:'Export…'})
 expect(button).not.toHaveAttribute('aria-disabled','true')
 expect(screen.getByText('Last export completed')).toBeVisible()
 await fireEvent.click(button)
 expect(onexport).toHaveBeenCalledOnce()
})

it.each([
 ['final-cut','timeline.fcpxml'],['resolve','Import → Timeline'],['blender','composer.py']
])('shows %s import instructions without hiding the scene picker',async(format,instruction)=>{
 render(ComposerExportDialog,{props:{open:true,format,scope:'selected',sceneIds:['one'],preflight:{ready:true,summary:null,formats:[{id:format,name:format,ready:true,reason:''}],warnings:[],refusals:[],scenes:[{id:'one',name:'First scene',number:1}]}}})
 expect(await screen.findByText(new RegExp(instruction))).toBeVisible()
 expect(screen.getByRole('checkbox',{name:/First scene/})).toBeChecked()
 expect(screen.getByRole('combobox',{name:'Format'})).toHaveValue(format)
})

it('retains the controlled target when preflight replaces the format catalog',async()=>{
 const data={ready:true,summary:null,scenes:[],formats:[{id:'premiere',name:'Premiere',ready:true,reason:''},{id:'blender',name:'Blender',ready:true,reason:''}],warnings:[],refusals:[]}
 const view=render(ComposerExportDialog,{props:{open:true,format:'premiere',preflight:data}})
 const menu=await screen.findByRole('combobox',{name:'Format'})
 await fireEvent.change(menu,{target:{value:'blender'}})
 await view.rerender({open:true,format:'blender',preflight:data})
 expect(menu).toHaveValue('blender')
 await view.rerender({open:true,format:'blender',preflight:{...data,formats:data.formats.map(f=>({...f}))}})
 expect(screen.getByRole('combobox',{name:'Format'})).toHaveValue('blender')
})

it.each(['storyboard-pdf','storyboard-png','frames'])('shows visual-only controls for %s',async(format)=>{
 render(ComposerExportDialog,{props:{open:true,format,preflight:{ready:true,summary:{name:'Story',durationMs:1000,scenes:1,pictures:6,readings:1},scenes:[],formats:[{id:format,name:format,ready:true,reason:''}],warnings:[],refusals:[]}}})
 expect(await screen.findByRole('combobox',{name:'Format'})).toHaveValue(format)
 expect(screen.queryByRole('combobox',{name:'Frame rate'})).toBeNull()
 expect(screen.queryByText('Chosen readings')).toBeNull()
 expect(screen.getByText('Shots')).toBeVisible()
 expect(screen.getByRole('checkbox',{name:'Include draft cards for missing frames'})).toBeVisible()
})

import {it,expect,vi} from 'vitest'
import {render,screen,fireEvent} from '@testing-library/svelte'
import ObjectAppearanceWorkbench from '@khaos-machine/khaotik-ui/components/svelte/ObjectAppearanceWorkbench.svelte'
const brief={form:'A large metal paint can',materials:'',distinguishingDetails:[],state:'',authoredScale:'',unknowns:[]}
const candidate={label:'Sheet 1',selected:false,images:[],revision:{id:'sheet',designId:'prop',name:'Paint can',createdAt:'2026-10-20T00:00:00Z',review:{state:'unreviewed',notes:''},pages:[{referenceId:'image',purpose:'objectSheet'}]}}
const workspace={objectId:'can',name:'Paint can',draft:{id:'draft'},preparation:{summary:'A prop described in scene 2.',atmosphere:'',evidence:[{detail:'She opens a large can of paint.',sceneNumbers:[2]}],changes:[]},references:[],styleReferences:[],candidates:[candidate],jobs:[],generationReady:true,generationReason:'',hasActiveJobs:false}
it('edits materials, condition and authored scale without losing revision controls',async()=>{
 const onchange=vi.fn(),ondetails=vi.fn(),ongenerate=vi.fn(),onuse=vi.fn()
 render(ObjectAppearanceWorkbench,{workspace,brief,candidateId:'sheet',correction:'Make the handle red',onchange,ondetails,ongenerate,onuse,mediaUrl:'/prop.png'})
 expect(screen.getByLabelText('Object form')).toHaveValue(brief.form)
 expect(screen.getByText('She opens a large can of paint.')).toBeVisible()
 await fireEvent.click(screen.getByLabelText('Materials'));await fireEvent.click(screen.getByRole('button',{name:'Brushed metal'}));expect(onchange).toHaveBeenCalledWith('materials','Brushed metal')
 await fireEvent.click(screen.getByLabelText('Details'));await fireEvent.input(screen.getByLabelText('Authored scale'),{target:{value:'Handheld can'}});expect(onchange).toHaveBeenCalledWith('authoredScale','Handheld can')
 await fireEvent.input(screen.getByLabelText('New distinguishing detail'),{target:{value:'Red handle'}});await fireEvent.click(screen.getByTitle('Add distinguishing detail'));expect(ondetails).toHaveBeenCalledWith(['Red handle'])
 expect(screen.getByLabelText('Correction direction')).toHaveValue('Make the handle red');await fireEvent.click(screen.getByRole('button',{name:'Generate correction'}));expect(ongenerate).toHaveBeenCalledWith(true)
 await fireEvent.click(screen.getByRole('button',{name:'Use this design'}));expect(onuse).toHaveBeenCalledOnce()
})

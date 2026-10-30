import {it,expect,vi} from 'vitest'
import {createRawSnippet} from 'svelte'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {render,screen,fireEvent,within} from '@testing-library/svelte'
import PlaceAppearanceWorkbench from '@khaos-machine/khaotik-ui/components/svelte/PlaceAppearanceWorkbench.svelte'
const brief={spatialDescription:'Loft living area',fixedFeatures:[],dressing:'',lighting:'',unknowns:[]}
const candidate={label:'Sheet 1',selected:false,images:[],revision:{id:'sheet',designId:'set',name:'Loft sheet',createdAt:'2026-10-20T00:00:00Z',review:{state:'unreviewed',notes:''},pages:[{referenceId:'image',purpose:'locationSheet'}]}}
const workspace={locationId:'loft',name:'Fifth’s loft',draft:{id:'draft'},preparation:{summary:'Fifth lives here.',atmosphere:'Warm and intimate.',evidence:[{detail:'a chalk board near the kitchen',sceneNumbers:[39]}],changes:[]},references:[],styleReferences:[],candidates:[candidate],jobs:[],generationReady:true,generationReason:'',hasActiveJobs:false}
it('keeps direction, revision and review together as artwork arrives',async()=>{
 const onchange=vi.fn(),onfeatures=vi.fn(),ongenerate=vi.fn(),onuse=vi.fn()
 const {rerender}=render(PlaceAppearanceWorkbench,{workspace:{...workspace,candidates:[]},brief,onchange,onfeatures,ongenerate,onuse})
 await fireEvent.input(screen.getByLabelText('Space to design'),{target:{value:'Kitchen and its window'}})
 expect(onchange).toHaveBeenCalledWith('spatialDescription','Kitchen and its window')
 await fireEvent.click(screen.getByTitle('Include a chalk board near the kitchen'))
 expect(onfeatures).toHaveBeenCalledWith(['a chalk board near the kitchen'])
 await rerender({workspace,brief,candidateId:'sheet',correction:'Make the window taller',dirty:true,onchange,onfeatures,ongenerate,onuse,mediaUrl:'/sheet.png'})
 expect(screen.getByLabelText('Space to design')).toBeVisible()
 expect(screen.getByLabelText('Correction direction')).toHaveValue('Make the window taller')
 expect(screen.getByRole('button',{name:'Use this design'})).toBeVisible()
 await fireEvent.click(screen.getByRole('button',{name:'Generate correction'}))
 expect(ongenerate).toHaveBeenCalledWith(true)
 await fireEvent.click(screen.getByRole('button',{name:'Use this design'}))
 expect(onuse).toHaveBeenCalledOnce()
 expect(screen.getByRole('img',{name:'Fifth’s loft design sheet'})).toBeVisible()
})
it('shows generation refusal details and returned artwork recovery',async()=>{
 const ongenerate=vi.fn()
 render(PlaceAppearanceWorkbench,{workspace:{...workspace,generationReady:false,generationReason:'Connect OpenAI in Settings.',jobs:[{id:'returned',state:'succeeded',publication:'pending',revisionId:'sheet'}]},brief,ongenerate})
 expect(screen.getByRole('button',{name:'Generate place sheet'})).toHaveAttribute('aria-disabled','true')
 await fireEvent.click(screen.getByRole('button',{name:'Generate place sheet'}))
 expect(ongenerate).not.toHaveBeenCalled()
 expect(screen.getByText('Connect OpenAI in Settings.')).toBeVisible()
 expect(screen.getByRole('button',{name:'Save returned artwork'})).toBeVisible()
})
it('browses unselected object artwork and explicitly reuses its identity in a place',async()=>{
 const onreference=vi.fn(),oninspect=vi.fn()
 const car={id:'car-sheet',label:'Cadi exterior sheet',subjectName:'Cadi',subject:{kind:'object'},roles:['identity','detail','style'],imageUrl:'/car.png'}
 render(PlaceAppearanceWorkbench,{workspace:{...workspace,projectReferences:[car]},brief,onreference,oninspect,imageURLs:{'car-sheet':'/car.png'}})
 await fireEvent.click(screen.getByLabelText('References'))
 await fireEvent.click(screen.getByRole('button',{name:'Browse project images…'}))
 await fireEvent.input(screen.getByRole('searchbox',{name:'Search project image references'}),{target:{value:'Cadi'}})
 await fireEvent.click(screen.getByRole('button',{name:/Cadi exterior sheet/}))
 expect(oninspect).toHaveBeenCalledWith('car-sheet')
 expect(screen.getByRole('img',{name:'Cadi exterior sheet'})).toBeVisible()
 await fireEvent.click(screen.getByRole('button',{name:'Match identity'}))
 expect(onreference).toHaveBeenCalledWith('car-sheet','identity')
})
// khaosd v0.193.0 records each Build render as a place reference whose only role is "set"
// (relayed K ruling: "use the 3D references in the Design stage").
const render1={id:'render-1',label:'Build render 1',imageUrl:'/render-1.png',roles:['set']}
it('lists the Build renders in Design, in use or not, and counts the ones in use',async()=>{
 const onreference=vi.fn(),oninspect=vi.fn()
 const render2={...render1,id:'render-2',label:'Build render 2'}
 render(PlaceAppearanceWorkbench,{workspace:{...workspace,renders:[render1,render2]},brief,references:[{referenceId:'render-1',role:'set'}],onreference,oninspect})
 await fireEvent.click(screen.getByLabelText('References'))
 const role=screen.getByRole('combobox',{name:'Role for Build render 2'})
 expect([...role.options].map(o=>o.textContent)).toEqual(['Exclude','Match the 3D model'])
 expect(screen.getByRole('combobox',{name:'Role for Build render 1'})).toHaveValue('set')
 await fireEvent.change(role,{target:{value:'set'}})
 expect(onreference).toHaveBeenCalledWith('render-2','set')
 await fireEvent.click(screen.getByRole('button',{name:'Inspect Build render 2'}))
 expect(oninspect).toHaveBeenCalledWith('render-2')
 expect(screen.getByLabelText('Generation image inputs')).toHaveTextContent('1 image references · 0 matching identity · 1 from the 3D model')
})
it('shows an inspected Build render as a reference',()=>{
 render(PlaceAppearanceWorkbench,{workspace:{...workspace,renders:[render1]},brief,inspectingId:'render-1'})
 expect(screen.getByRole('button',{name:'Back to design'})).toBeVisible()
})
it('says nothing of the 3D model when no render is in use',()=>{
 render(PlaceAppearanceWorkbench,{workspace:{...workspace,renders:[render1]},brief,references:[{referenceId:'image',role:'identity'}]})
 expect(screen.getByLabelText('Generation image inputs')).toHaveTextContent(/^1 image references · 1 matching identity$/)
})
it('opens refinement without a paid call, then explicitly requests and applies a reviewable suggestion',async()=>{
 const onrefine=vi.fn(),onapplysuggestion=vi.fn(()=>true),onsave=vi.fn(),ongenerate=vi.fn()
 const props={workspace,brief,onrefine,onapplysuggestion,onsave,ongenerate}
 const {rerender}=render(PlaceAppearanceWorkbench,props)
 await fireEvent.click(screen.getByRole('button',{name:'Refine direction…'}))
 expect(onrefine).not.toHaveBeenCalled()
 await fireEvent.click(await screen.findByRole('button',{name:'Suggest direction'}))
 expect(onrefine).toHaveBeenCalledOnce()
 await rerender({...props,suggestion:{brief:{...brief,lighting:'Window daylight'},notes:['Window position is a proposed choice.']},canApplySuggestion:false})
 expect(await screen.findByText('Window daylight')).toBeVisible()
 const apply=screen.getByRole('button',{name:'Use suggested direction'})
 expect(apply).toHaveAttribute('aria-disabled','true')
 await rerender({...props,suggestion:{brief:{...brief,lighting:'Window daylight'},notes:[]},canApplySuggestion:true})
 await fireEvent.click(screen.getByRole('button',{name:'Use suggested direction'}))
 expect(onapplysuggestion).toHaveBeenCalledOnce()
 expect(onsave).not.toHaveBeenCalled();expect(ongenerate).not.toHaveBeenCalled()
 expect(screen.getByLabelText('Space to design')).toHaveValue('Loft living area')
})
it('lets the host apply a distinct analysed area without combining rooms',async()=>{
 const onarea=vi.fn()
 render(PlaceAppearanceWorkbench,{workspace:{...workspace,preparation:{...workspace.preparation,areas:[{name:'Kitchen',brief},{name:'Roof',brief:{...brief,spatialDescription:'Roof terrace'}}]}},brief,onarea})
 await fireEvent.change(screen.getByLabelText('Analysed area'),{target:{value:'1'}})
 await fireEvent.click(screen.getByRole('button',{name:'Use area direction'}))
 expect(onarea).toHaveBeenCalledWith(1)
})
it('shows bound off-site identity context without turning dialogue into a fixed feature',()=>{
 render(PlaceAppearanceWorkbench,{workspace:{...workspace,preparation:{...workspace.preparation,context:[{detail:'I am taking Jetta to JFK',sceneNumbers:[55]}]}},brief})
 expect(screen.getByText('I am taking Jetta to JFK')).toBeVisible();expect(screen.getByText('Spoken in scene 55')).toBeVisible()
 expect(screen.queryByTitle('Include I am taking Jetta to JFK')).not.toBeInTheDocument()
})
it('supports feedback, another suggestion and discard within the refinement dialog',async()=>{
 const onrefine=vi.fn(),onfeedback=vi.fn(),ondiscardsuggestion=vi.fn()
 const props={workspace,brief,suggestion:{brief,notes:[]},onrefine,onfeedback,ondiscardsuggestion}
 const {rerender}=render(PlaceAppearanceWorkbench,props)
 await fireEvent.click(screen.getByRole('button',{name:'Refine direction…'}))
 await fireEvent.click(await screen.findByRole('button',{name:'Try another suggestion'}));expect(onrefine).toHaveBeenCalledOnce()
 await fireEvent.input(screen.getByLabelText('What should change?'),{target:{value:'Keep the kitchen, warmer light'}});expect(onfeedback).toHaveBeenCalledWith('Keep the kitchen, warmer light')
 await rerender({...props,refinementFeedback:'Keep the kitchen, warmer light'})
 await fireEvent.click(screen.getByRole('button',{name:'Revise suggestion'}));expect(onrefine).toHaveBeenCalledTimes(2)
 await fireEvent.click(screen.getByRole('button',{name:'Discard suggestion'}));expect(ondiscardsuggestion).toHaveBeenCalledOnce()
})
it('keeps centered mode tracks and a full content body',()=>{
 const source=readFileSync(resolve(import.meta.dirname,'../../../../components/svelte/internal/ArtworkWorkspace.svelte'),'utf8')
 expect(source).toContain('grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)')
 expect(source).toContain('.ui-artwork--content{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);}')
})
it('defaults to Design and switches to a full Build body without losing Design tools',async()=>{
 const ongenerate=vi.fn()
 const build=createRawSnippet(()=>({render:()=>'<section aria-label="Build workspace">3D place</section>'}))
 render(PlaceAppearanceWorkbench,{workspace,brief:{...brief,dressing:'Keep this dressing'},build,ongenerate})
 expect(screen.getByRole('radio',{name:'Design'})).toBeChecked()
 await fireEvent.click(screen.getByLabelText('Dressing'))
 await fireEvent.click(screen.getByRole('radio',{name:'Build'}))
 expect(screen.getByRole('region',{name:'Build workspace'})).toBeVisible()
 expect(screen.queryByLabelText('Set dressing')).not.toBeInTheDocument()
 await fireEvent.click(screen.getByRole('radio',{name:'Design'}))
 expect(screen.getByLabelText('Set dressing')).toHaveValue('Keep this dressing')
 expect(ongenerate).not.toHaveBeenCalled()
})
// The rail is Structure → Build → Design, Render last (relayed K ruling, khaos-app#589). The
// host composes the floor plan.
const rail=()=>within(screen.getByRole('radiogroup',{name:'Place Builder mode'})).getAllByRole('radio').map(r=>r.getAttribute('value'))
it('puts Structure first when the host gives one, then Build, Design and Render',async()=>{
 const onmode=vi.fn(),ongenerate=vi.fn()
 const structure=createRawSnippet(()=>({render:()=>'<section aria-label="Floor plan">plan</section>'}))
 render(PlaceAppearanceWorkbench,{workspace,brief,structure,onmode,ongenerate})
 expect(rail()).toEqual(['structure','build','design','render'])
 await fireEvent.click(screen.getByRole('radio',{name:'Structure'}))
 expect(onmode).toHaveBeenCalledWith('structure')
 expect(screen.getByRole('region',{name:'Floor plan'})).toBeVisible()
 expect(screen.queryByRole('button',{name:'Generate place sheet'})).not.toBeInTheDocument()
 expect(ongenerate).not.toHaveBeenCalled()
})
it('offers no Structure for a place without one, such as an exterior or a vehicle',()=>{
 render(PlaceAppearanceWorkbench,{workspace,brief})
 expect(rail()).toEqual(['build','design','render'])
})
it('opens on Structure when the host says so',()=>{
 const structure=createRawSnippet(()=>({render:()=>'<section aria-label="Floor plan">plan</section>'}))
 render(PlaceAppearanceWorkbench,{workspace,brief,structure,mode:'structure'})
 expect(screen.getByRole('radio',{name:'Structure'})).toBeChecked()
 expect(screen.getByRole('region',{name:'Floor plan'})).toBeVisible()
})
it('keeps Render a placeholder with the mode navigation available',async()=>{
 render(PlaceAppearanceWorkbench,{workspace,brief})
 await fireEvent.click(screen.getByRole('radio',{name:'Render'}))
 expect(screen.getByRole('heading',{name:'Render'})).toBeVisible()
 expect(screen.getByRole('radio',{name:'Design'})).toBeInTheDocument()
 expect(screen.queryByRole('button',{name:'Generate place sheet'})).not.toBeInTheDocument()
})
// Build makes the 3D place from the approved floor plan, not from sheets (relayed K ruling
// on the paid Build from design sheets: "Remove it"), so it has no sheet choice to wait for.
it('builds on one press, with no sheet choice',async()=>{
 const onbuild=vi.fn()
 render(PlaceAppearanceWorkbench,{workspace,brief,mode:'build',onbuild})
 expect(within(screen.getByRole('group',{name:'Build'})).getByRole('button',{name:'Build Place'})).toBeInTheDocument()
 expect(screen.queryByText(/Design sheets/)).not.toBeInTheDocument()
 expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
 await fireEvent.click(screen.getByRole('button',{name:'Build Place'}))
 expect(onbuild).toHaveBeenCalledOnce()
})
it('holds Build while one runs, and retries an uncertain one',async()=>{
 const onbuild=vi.fn()
 const props={workspace,brief,mode:'build',building:true,buildStatus:'running · 1 round · $0.012345',onbuild}
 const {rerender}=render(PlaceAppearanceWorkbench,props)
 expect(screen.getByRole('button',{name:'Build Place'})).toHaveAttribute('aria-disabled','true')
 expect(screen.getByText(props.buildStatus)).toBeVisible()
 expect(screen.queryByRole('button',{name:'Cancel Build'})).not.toBeInTheDocument()
 await rerender({...props,building:false,retryBuild:true,buildError:'Response lost.'})
 expect(screen.getByText('Response lost.')).toBeVisible()
 await fireEvent.click(screen.getByRole('button',{name:'Retry Build'}))
 expect(onbuild).toHaveBeenCalledOnce()
})
it('offers Cancel Build only when the host can cancel',async()=>{
 const oncancelbuild=vi.fn()
 render(PlaceAppearanceWorkbench,{workspace,brief,mode:'build',building:true,onbuild:()=>{},oncancelbuild})
 await fireEvent.click(screen.getByRole('button',{name:'Cancel Build'}))
 expect(oncancelbuild).toHaveBeenCalledOnce()
})
it('offers no Build without a host to build',async()=>{
 render(PlaceAppearanceWorkbench,{workspace,brief,mode:'build'})
 expect(screen.getByRole('button',{name:'Build Place'})).toHaveAttribute('aria-disabled','true')
})
it('names the place state it designs in the header, and nothing when given none',async()=>{
 const {rerender}=render(PlaceAppearanceWorkbench,{workspace,brief,stateLabel:'Interior · Day'})
 expect(screen.getByText('PLACE STUDY · Interior · Day')).toBeVisible()
 await rerender({workspace,brief,stateLabel:undefined})
 expect(screen.getByText('PLACE STUDY')).toBeVisible()
})

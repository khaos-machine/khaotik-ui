import {it,expect,vi} from 'vitest'
import {render,screen,fireEvent} from '@testing-library/svelte'
import CharacterAppearanceWorkbench from '@khaos-machine/khaotik-ui/components/svelte/CharacterAppearanceWorkbench.svelte'
const brief={identityLock:'A broad face, coily cropped hair and a compact build.',wardrobeLock:'Work jacket',unknowns:[]}
const candidate={canSourceHeadshot:true,selected:false,images:[],revision:{id:'sheet',designId:'main',name:'Sheet one',pages:[{purpose:'characterSheet',referenceId:'image'}],review:{state:'unreviewed',notes:''}}}
const workspace={characterId:'character',name:'Mara',draft:{id:'draft'},preparation:{summary:'',evidence:[]},references:[],styleReferences:[],candidates:[candidate],jobs:[],hasActiveJobs:false,generationReady:true,generationReason:''}
it('keeps direct editing, revision and use available together after artwork arrives',async()=>{
 const onchange=vi.fn(),onuse=vi.fn(),ongenerate=vi.fn()
 const {rerender}=render(CharacterAppearanceWorkbench,{workspace,brief,candidateId:'sheet',onchange,onuse,ongenerate})
 expect(screen.getByRole('textbox',{name:'Appearance direction'})).toBeVisible()
 expect(screen.getByRole('textbox',{name:'Correction direction'})).toBeVisible()
 await fireEvent.input(screen.getByRole('textbox',{name:'Appearance direction'}),{target:{value:'A longer face with a rounded jaw.'}})
 expect(onchange).toHaveBeenCalledWith('identityLock','A longer face with a rounded jaw.')
 await fireEvent.click(screen.getByRole('button',{name:'Use this design'}))
 expect(onuse).toHaveBeenCalledOnce();expect(ongenerate).not.toHaveBeenCalled()
 await rerender({workspace:{...workspace,candidates:[{...candidate,selected:true}]},brief,candidateId:'sheet'})
 expect(screen.getByRole('textbox',{name:'Appearance direction'})).toBeVisible()
 expect(screen.getByRole('textbox',{name:'Correction direction'})).toBeVisible()
})
it('prepares edits and upload without generating on mode or file changes',async()=>{
 const onupload=vi.fn(),onpurpose=vi.fn(),ongenerate=vi.fn()
 render(CharacterAppearanceWorkbench,{workspace,brief,candidateId:'sheet',onupload,onpurpose,ongenerate})
 await fireEvent.click(screen.getByText('Reference images · 0'))
 const file=new File(['image bytes'],'reference.png',{type:'image/png'})
 await fireEvent.change(screen.getByLabelText('Add reference images'),{target:{files:[file]}})
 expect(onupload).toHaveBeenCalledWith([file]);expect(ongenerate).not.toHaveBeenCalled()
 await fireEvent.click(screen.getByLabelText('Headshot'))
 expect(onpurpose).toHaveBeenCalledWith('headshot')
 expect(screen.getByRole('complementary',{name:'Character design tools'})).toBeVisible()
})
it('edits and randomizes proposals without dispatching artwork and exposes per-trait locks',async()=>{
 const onlook=vi.fn(),onlooklock=vi.fn(),ongenerate=vi.fn()
 render(CharacterAppearanceWorkbench,{workspace,brief,look:{features:[{key:'hair',label:'Hair texture',options:['coily','straight']}],choices:{hair:'coily'}},lookLocks:{hair:true},onlook,onlooklock,ongenerate})
 expect(screen.getByRole('checkbox',{name:'Keep hair texture'})).toBeChecked()
 await fireEvent.click(screen.getByRole('radio',{name:'Hair',exact:true}))
 await fireEvent.click(screen.getByRole('button',{name:'Hair texture: straight'}))
 expect(onlook).toHaveBeenCalledWith('hair','straight')
 await fireEvent.click(screen.getByRole('button',{name:'Randomize unlocked'}))
 expect(onlook).toHaveBeenLastCalledWith();expect(ongenerate).not.toHaveBeenCalled()
})

it('names the completed version and lets the person review it without adopting it or crossing purposes',async()=>{
 const onpreview=vi.fn(),onuse=vi.fn(),ongenerate=vi.fn()
 const next={...candidate,revision:{...candidate.revision,id:'next'}}
 const w={...workspace,candidates:[next,candidate],jobs:[{id:'job',requestId:'request',revisionId:'next',state:'succeeded',publication:'saved',error:''}]}
 const props={workspace:w,brief,candidateId:'sheet',generationRequestId:'request',generationPurpose:'characterSheet',onpreview,onuse,ongenerate}
 const {rerender}=render(CharacterAppearanceWorkbench,props)
 expect(screen.getByRole('status')).toHaveTextContent('Sheet 2 is ready to review')
 await fireEvent.click(screen.getByRole('button',{name:'Review Sheet 2'}))
 expect(onpreview).toHaveBeenCalledWith('next');expect(onuse).not.toHaveBeenCalled();expect(ongenerate).not.toHaveBeenCalled()
 await rerender({...props,purpose:'headshot'})
 expect(screen.queryByText('Sheet 2 is ready to review')).not.toBeInTheDocument()
})

import {it,expect,vi} from 'vitest'
import {render,screen,fireEvent} from '@testing-library/svelte'
import CharacterAppearanceWorkbench from '@khaos-machine/khaotik-ui/components/svelte/CharacterAppearanceWorkbench.svelte'
import AppearanceSelectionHUD from '@khaos-machine/khaotik-ui/components/svelte/internal/AppearanceSelectionHUD.svelte'
import {appearanceSwatch} from '@khaos-machine/khaotik-ui/components/svelte/lib/appearance-palette.js'
const look={features:[{key:'hair',label:'Hair / crest',options:['shaved head','long twists pulled back']},{key:'hairColor',label:'Hair color',options:['black','copper red']},{key:'complexion',label:'Base color',options:['light brown']},{key:'head',label:'Head shape',options:['broad and rounded']}],choices:{hair:'long twists pulled back',hairColor:'copper red',complexion:'light brown',head:'broad and rounded'}}
it('keeps an unspecified gender choice visible without inventing a default',async()=>{
 const onedit=vi.fn()
 render(AppearanceSelectionHUD,{look:{features:[{key:'gender',label:'Gender / presentation',options:['male','female']}],choices:{}},onedit})
 await fireEvent.click(screen.getByRole('button',{name:'Edit gender / presentation: Unspecified'}))
 expect(onedit).toHaveBeenCalledWith('gender')
})
it('shows draft intent, named color samples and a direct editing action',async()=>{
 const onedit=vi.fn();const {rerender,container}=render(AppearanceSelectionHUD,{look,dirty:true,onedit})
 expect(screen.getByRole('region',{name:'Appearance selections'})).toHaveTextContent('Next generation')
 expect(screen.getByText('Unsaved edits')).toBeVisible()
 expect(container.querySelectorAll('.ui-appearance-selection__swatch')).toHaveLength(2)
 await fireEvent.click(screen.getByRole('button',{name:'Edit hair color: copper red'}));expect(onedit).toHaveBeenCalledWith('hairColor')
 await rerender({look:{...look,choices:{...look.choices,hairColor:'authored custom palette'}},dirty:false,persisted:true,onedit})
 expect(screen.getByText('Saved direction')).toBeVisible()
 expect(container.querySelectorAll('.ui-appearance-selection__swatch')).toHaveLength(1)
 expect(appearanceSwatch('hairColor','authored custom palette')).toBeNull()
 expect(appearanceSwatch('hairColor','toString')).toBeNull()
 expect(appearanceSwatch('complexion','deep neutral brown (#4b3932)')).toBe('#4b3932')
 expect(appearanceSwatch('complexion','unknown (#fff); color:red')).toBeNull()
 expect(appearanceSwatch('body','body (#4b3932)')).toBeNull()
})
it('keeps artwork and actions available while HUD navigation opens the exact picker without mutation',async()=>{
 const onlook=vi.fn(),ongenerate=vi.fn(),onuse=vi.fn()
 const candidate={canSourceHeadshot:true,selected:false,images:[],revision:{id:'sheet',designId:'design',name:'Existing sheet',pages:[{purpose:'characterSheet',referenceId:'image'}],review:{state:'unreviewed',notes:''}}}
 const workspace={characterId:'mara',name:'Mara',draft:{id:'draft'},preparation:{summary:'',evidence:[]},references:[],styleReferences:[],candidates:[candidate],jobs:[],hasActiveJobs:false,generationReady:true,generationReason:''}
 const {container}=render(CharacterAppearanceWorkbench,{workspace,brief:{identityLock:'Character',wardrobeLock:'',unknowns:[]},candidateId:'sheet',mediaUrl:'/existing-sheet.png',look,onlook,ongenerate,onuse})
 expect(screen.getByRole('img',{name:'Mara character sheet'})).toHaveAttribute('src','/existing-sheet.png')
 expect(screen.queryByRole('button',{name:'Design preview'})).not.toBeInTheDocument();expect(container.querySelector('canvas')).toBeNull()
 await fireEvent.click(screen.getByRole('button',{name:'Hide tools'}))
 await fireEvent.click(screen.getByRole('button',{name:'Edit hair color: copper red'}))
 expect(screen.getByRole('complementary',{name:'Character design tools'})).toBeVisible()
 expect(screen.getByRole('radio',{name:'Color',exact:true})).toBeChecked()
 expect(screen.getByRole('button',{name:'Hair color: copper red'})).toHaveAttribute('aria-pressed','true')
 expect(onlook).not.toHaveBeenCalled();expect(ongenerate).not.toHaveBeenCalled();expect(onuse).not.toHaveBeenCalled()
 expect(screen.getByRole('textbox',{name:'Correction direction'})).toBeVisible()
 expect(screen.getByRole('button',{name:'Generate character sheet'})).toBeVisible()
 await fireEvent.click(screen.getByRole('button',{name:'Focus artwork'}))
 expect(screen.queryByRole('region',{name:'Appearance selections'})).not.toBeInTheDocument()
})
it('clears the appearance workspace while picker machines tear down',async()=>{
 const workspace={characterId:'yuppie',name:'Yuppie',draft:null,preparation:{summary:'',evidence:[]},references:[],styleReferences:[],candidates:[],jobs:[],hasActiveJobs:false,generationReady:false,generationReason:''}
 const {rerender}=render(CharacterAppearanceWorkbench,{look,workspace,brief:{identityLock:'Yuppie',wardrobeLock:'',unknowns:[]}})
 await fireEvent.click(screen.getByRole('radio',{name:'Hair',exact:true}))
 await rerender({look:null,workspace:null,brief:null})
 expect(screen.queryByRole('group',{name:'Appearance categories'})).not.toBeInTheDocument()
 expect(screen.queryByRole('region',{name:'Appearance selections'})).not.toBeInTheDocument()
})
it('keeps an authored surface covering visible and opens its editor',async()=>{
 const onedit=vi.fn()
 render(AppearanceSelectionHUD,{look:{features:[{key:'texture',label:'Surface texture',options:['layered feathers']}],choices:{texture:'layered feathers'}},onedit})
 await fireEvent.click(screen.getByRole('button',{name:'Edit surface texture: layered feathers'}))
 expect(onedit).toHaveBeenCalledWith('texture')
})

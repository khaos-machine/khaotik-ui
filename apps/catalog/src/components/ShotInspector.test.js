import { it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/svelte'
import ShotInspector from '@khaos-machine/khaotik-ui/components/svelte/ShotInspector.svelte'
const shot={id:'shot-one',title:'Arrival',direction:'Madison approaches her locked studio.',style:'detailed_pencil',framing:'Wide shot',start:0,hold:4,timingStatus:'resolved',sourceText:'Madison arrives carrying supplies.',frames:[],chosenId:''}
it('emits authored edits without mutating the controlled shot',async()=>{
 const onchange=vi.fn(),onsave=vi.fn()
 render(ShotInspector,{shot,onchange,onsave,dirty:true})
 await fireEvent.input(screen.getByRole('textbox',{name:'Shot direction'}),{target:{value:'Hold on her reaction.'}})
 expect(onchange).toHaveBeenCalledWith({direction:'Hold on her reaction.'})
 expect(shot.direction).toBe('Madison approaches her locked studio.')
 await fireEvent.click(screen.getByRole('button',{name:'Save shot'}))
 expect(onsave).toHaveBeenCalledOnce()
})
it('needs a reviewed frame, not a charge ask, and separates approval from playback choice',async()=>{
 const ongenerate=vi.fn(),onreview=vi.fn(),onchoose=vi.fn()
 const candidate={id:'frame-one',url:'data:image/png;base64,AA==',review:'unreviewed',prompt:'',parentId:''}
 const {rerender}=render(ShotInspector,{shot:{...shot,frames:[candidate]},previewId:candidate.id,generationReady:true,ongenerate,onreview,onchoose})
 expect(screen.getByRole('button',{name:'Use frame'})).toHaveAttribute('aria-disabled','true')
 await fireEvent.click(screen.getByRole('button',{name:'Approve'}))
 expect(onreview).toHaveBeenCalledWith('reviewed');expect(onchoose).not.toHaveBeenCalled()
 await rerender({shot:{...shot,frames:[{...candidate,review:'reviewed'}]},previewId:candidate.id,generationReady:true,ongenerate,onreview,onchoose})
 await fireEvent.click(screen.getByRole('button',{name:'Generate frame'}))
 expect(ongenerate).toHaveBeenCalledOnce()
 await fireEvent.click(screen.getByRole('button',{name:'Use frame'}))
 expect(onchoose).toHaveBeenCalledOnce()
})
it('exposes unresolved timing without editable numeric zero placeholders',()=>{
 render(ShotInspector,{shot:{...shot,start:null,timingStatus:'unresolved'}})
 expect(screen.getByText('Resolve this shot’s timing for the current reading.')).toBeVisible()
 expect(screen.getByRole('spinbutton',{name:'Shot starts at seconds'})).toBeDisabled()
})

it('collects offscreen reference choices without implicitly generating',async()=>{
 const onreference=vi.fn(),ongenerate=vi.fn()
 render(ShotInspector,{shot,references:[{referenceId:'ref-one',name:'Madison',visibility:'visible'}],onreference,ongenerate})
 await fireEvent.change(screen.getByRole('combobox',{name:'Visibility for Madison'}),{target:{value:'offscreen'}})
 expect(onreference).toHaveBeenCalledWith('ref-one','offscreen');expect(ongenerate).not.toHaveBeenCalled()
})

it('retains exact redacted provider evidence in progressive details',()=>{
 render(ShotInspector,{error:'Provider rejected the request',errorDetails:'provider_rejected: INVALID_ARGUMENT',diagnostic:{operation:'image.generate',httpStatus:400,message:'Invalid size',responseBody:'{"error":{"message":"unsupported size"}}',requestId:'request-evidence',truncated:true,expiresAt:'2026-10-20T00:00:00Z'}})
 expect(screen.getByText('Provider details')).toBeVisible()
 expect(screen.getByText('Request ID: request-evidence')).toBeInTheDocument()
 expect(screen.getByText('{"error":{"message":"unsupported size"}}')).toBeInTheDocument()
 expect(screen.getByText('The retained response was truncated.')).toBeInTheDocument()
})


it('groups shot timing and camera direction into named property sections',()=>{
 render(ShotInspector,{shot})
 expect(screen.getByRole('group',{name:'Timing'})).toContainElement(screen.getByRole('spinbutton',{name:'Shot hold in seconds'}))
 expect(screen.getByRole('group',{name:'Camera & direction'})).toContainElement(screen.getByRole('textbox',{name:'Shot direction'}))
 expect(screen.getByRole('button',{name:'Add shot'})).toHaveAttribute('data-variant','tool')
})

it('preserves an authored framing value outside the suggested list',()=>{
 render(ShotInspector,{shot:{...shot,framing:'Low-angle tracking shot'}})
 expect(screen.getByRole('combobox',{name:'Shot framing'})).toHaveValue('Low-angle tracking shot')
})
it('explains the next generation gate and keeps one primary action while reviewing',()=>{
 const candidate={id:'frame',url:'data:image/png;base64,AA==',review:'unreviewed',canChoose:false}
 const {container}=render(ShotInspector,{shot:{...shot,chosenId:'',frames:[candidate]},previewId:'frame',generationReady:true,approveOnUse:true})
 expect(screen.getByRole('list',{name:'Frame workflow'})).toBeVisible()
 expect(screen.getByRole('button',{name:'Use frame'})).not.toHaveAttribute('aria-disabled')
 expect(container.querySelectorAll('button[data-variant="primary"]')).toHaveLength(1)
 expect(screen.queryByRole('checkbox',{name:/charges/})).toBeNull()
})
it('shows reference artwork and its real loading state without hiding it behind source details',()=>{
 render(ShotInspector,{shot,references:[{referenceId:'ref',name:'Madison',visibility:'visible',imageUrl:'blob:reference',imageState:'ready',purpose:'headshot'}]})
 expect(screen.getByRole('img',{name:'Madison reference'})).toBeVisible()
 expect(screen.getByText('Profile · Ready')).toBeVisible()
})

it('points back to generation when an older approved frame cannot be used',()=>{
 const frame={id:'old',url:'',review:'reviewed',canChoose:false,imageState:'failed'}
 const {container}=render(ShotInspector,{shot:{...shot,frames:[frame]},previewId:'old',generationReady:true,approveOnUse:true})
 expect(container.querySelector('button[data-variant="primary"]')).toHaveTextContent('Generate frame')
 expect(screen.getByText('Image unavailable')).toBeVisible()
 expect(screen.getByRole('button',{name:'Use frame'})).toHaveAccessibleDescription('This frame is not available for the current shot direction.')
})

it('opens full-frame review without choosing or generating and keeps selection controlled',async()=>{
 const onpreview=vi.fn(),onchoose=vi.fn(),ongenerate=vi.fn()
 const frames=[{id:'one',url:'/one.png',review:'reviewed',canChoose:true},{id:'two',url:'/two.png',review:'unreviewed'}]
 const props={reviewWorkspace:true,shot:{...shot,frames,chosenId:'one'},previewId:'one',onpreview,onchoose,ongenerate,approveOnUse:true}
 const {rerender}=render(ShotInspector,props)
 await fireEvent.click(screen.getByRole('button',{name:'Review frames…'}))
 const dialog=screen.getByRole('dialog',{name:'Review shot frames'})
 expect(within(dialog).getByRole('img',{name:'Arrival · frame 1'})).toHaveAttribute('src','/one.png')
 await fireEvent.click(within(dialog).getByRole('button',{name:'Frame 2 · Needs review'}))
 expect(onpreview).toHaveBeenCalledWith('two')
 expect(onchoose).not.toHaveBeenCalled();expect(ongenerate).not.toHaveBeenCalled()
 await rerender({...props,previewId:'two'})
 expect(within(dialog).getByRole('img',{name:'Arrival · frame 2'})).toHaveAttribute('src','/two.png')
 await fireEvent.click(within(dialog).getByRole('button',{name:'Use frame'}))
 expect(onchoose).toHaveBeenCalledOnce()
 await rerender({...props,previewId:'two',error:'Could not use the frame.'})
 expect(within(dialog).getByRole('alert')).toHaveTextContent('Could not use the frame.')
})
it('keeps review usable when the full-frame image cannot load',async()=>{
 render(ShotInspector,{reviewWorkspace:true,shot:{...shot,frames:[{id:'one',url:'/missing.png',review:'unreviewed'}]},previewId:'one'})
 await fireEvent.click(screen.getByRole('button',{name:'Review frames…'}))
 const dialog=screen.getByRole('dialog')
 await fireEvent.error(within(dialog).getByRole('img',{name:'Arrival · frame 1'}))
 expect(within(dialog).getByText('Preview unavailable')).toBeVisible()
 expect(within(dialog).getByRole('button',{name:'Close frame review'})).toBeVisible()
})
it('keeps operation feedback and provider evidence inside review while preventing duplicate commands',async()=>{
 const onreview=vi.fn(),onchoose=vi.fn()
 render(ShotInspector,{reviewWorkspace:true,shot:{...shot,frames:[{id:'one',url:'/one.png',review:'unreviewed'}]},previewId:'one',busy:true,phase:'Saving frame approval…',errorDetails:'retained diagnostic',onreview,onchoose})
 await fireEvent.click(screen.getByRole('button',{name:'Review frames…'}))
 const dialog=screen.getByRole('dialog')
 expect(within(dialog).getByRole('status')).toHaveTextContent('Saving frame approval…')
 expect(within(dialog).getByText('retained diagnostic')).toBeInTheDocument()
 await fireEvent.click(within(dialog).getByRole('button',{name:'Approve'}))
 await fireEvent.click(within(dialog).getByRole('button',{name:'Use frame'}))
 expect(onreview).not.toHaveBeenCalled();expect(onchoose).not.toHaveBeenCalled()
 await waitFor(()=>expect(dialog.contains(document.activeElement)).toBe(true))
 await fireEvent.click(within(dialog).getByRole('button',{name:'Close frame review'}))
 await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull())
 await waitFor(()=>expect(screen.getByRole('button',{name:'Review frames…'})).toHaveFocus())
})
it('revises in the review workspace with shot context and no charge ask',async()=>{
 const oncorrection=vi.fn(),ongenerate=vi.fn()
 const props={reviewWorkspace:true,shot:{...shot,frames:[{id:'one',url:'/one.png',review:'reviewed',canChoose:true}],chosenId:'one'},previewId:'one',generationReady:true,oncorrection,ongenerate}
 const {rerender}=render(ShotInspector,props)
 await fireEvent.click(screen.getByRole('button',{name:'Review frames…'}))
 const dialog=screen.getByRole('dialog')
 const hud=within(dialog).getByRole('region',{name:'Shot context'})
 expect(hud).toHaveTextContent('Wide shot')
 expect(hud).toHaveTextContent(shot.direction)
 expect(hud).toHaveTextContent(shot.sourceText)
 await fireEvent.click(within(dialog).getByRole('button',{name:'Revise frame…'}))
 await fireEvent.input(within(dialog).getByRole('textbox',{name:'Frame correction'}),{target:{value:'Hold farther down the hall.'}})
 expect(oncorrection).toHaveBeenCalledWith('Hold farther down the hall.')
 await rerender({...props,correction:'Hold farther down the hall.'})
 await fireEvent.click(within(dialog).getByRole('button',{name:'Generate correction'}))
 expect(ongenerate).toHaveBeenCalledOnce()
 await rerender({...props,correction:'Hold farther down the hall.',busy:true,generating:true,generationPhase:'Frame queued…'})
 await fireEvent.click(within(dialog).getByRole('button',{name:'Frame queued…'}))
 expect(ongenerate).toHaveBeenCalledOnce()
})

it('offers an explicit current-design update without triggering generation',async()=>{
 const oncurrentreferences=vi.fn(),ongenerate=vi.fn()
 render(ShotInspector,{shot,canUpdateReferences:true,oncurrentreferences,ongenerate,references:[{referenceId:'place',name:'Corridor',visibility:'visible',purpose:'locationSheet'},{referenceId:'prop',name:'Paint supplies',visibility:'visible',purpose:'objectSheet'}]})
 expect(screen.getByText(/Place sheet/)).toBeVisible();expect(screen.getByText(/Prop sheet/)).toBeVisible()
 await fireEvent.click(screen.getByRole('button',{name:'Use current designs'}));expect(oncurrentreferences).toHaveBeenCalledOnce();expect(ongenerate).not.toHaveBeenCalled()
})

it('keeps fresh generation available after existing frames and reference updates',()=>{
 render(ShotInspector,{reviewWorkspace:true,shot:{...shot,frames:[{id:'old',review:'reviewed',url:'',canChoose:false}],chosenId:'old'},previewId:'old',generationReady:true})
 expect(screen.getByRole('button',{name:'Generate frame'})).toBeVisible()
 expect(screen.getByRole('button',{name:'Generate frame'})).not.toHaveAttribute('aria-disabled')
})
it('attaches a project prop through the image picker without triggering generation',async()=>{
 const onaddreference=vi.fn(),ongenerate=vi.fn(),oninspectreference=vi.fn()
 const {container}=render(ShotInspector,{shot,onaddreference,ongenerate,oninspectreference,projectReferences:[{id:'cadillac',label:'Prop sheet',subjectName:"Desmond’s Cadillac",subject:{kind:'object'},roles:['prop','style']}],referenceImages:{cadillac:'/cadillac.png'}})
 await fireEvent.click(screen.getByRole('button',{name:'Add reference…'}))
 const dialog=screen.getByRole('dialog',{name:'Project image references'})
 expect(container).not.toContainElement(dialog)
 await fireEvent.click(within(dialog).getByRole('button',{name:/Desmond’s Cadillac/}))
 expect(oninspectreference).toHaveBeenCalledWith('cadillac')
 expect(within(dialog).getByRole('img',{name:'Prop sheet'})).toHaveAttribute('src','/cadillac.png')
 await fireEvent.click(within(dialog).getByRole('button',{name:'Match prop'}))
 expect(onaddreference).toHaveBeenCalledExactlyOnceWith('cadillac','prop')
 expect(ongenerate).not.toHaveBeenCalled()
})
it('moves through scene shots inside the same review dialog and guards unsaved revisions',async()=>{
 const onreviewshot=vi.fn()
 const first={...shot,id:'first',frames:[{id:'one',url:'/one.png',review:'unreviewed'}]}
 const second={...first,id:'second',title:'The Cadillac',frames:[{id:'two',url:'/two.png',review:'unreviewed'}]}
 const props={reviewWorkspace:true,shot:first,previewId:'one',reviewShots:[{id:'first',title:first.title},{id:'second',title:second.title}],onreviewshot}
 const {rerender}=render(ShotInspector,props)
 await fireEvent.click(screen.getByRole('button',{name:'Review frames…'}))
 const dialog=screen.getByRole('dialog',{name:'Review shot frames'})
 expect(within(dialog).getByText('Shot 1 of 2')).toBeVisible()
 expect(within(dialog).getByRole('button',{name:'Previous shot'})).toHaveAttribute('aria-disabled','true')
 await fireEvent.click(within(dialog).getByRole('button',{name:'Next shot'}))
 expect(onreviewshot).toHaveBeenCalledExactlyOnceWith('second')
 await rerender({...props,shot:second,previewId:'two'})
 expect(screen.getByRole('dialog',{name:'Review shot frames'})).toBe(dialog)
 expect(within(dialog).getByRole('img',{name:'The Cadillac · frame 1'})).toHaveAttribute('src','/two.png')
 expect(within(dialog).getByText('Shot 2 of 2')).toBeVisible()
 expect(within(dialog).getByRole('button',{name:'Next shot'})).toHaveAttribute('aria-disabled','true')
 await rerender({...props,shot:second,previewId:'two',correction:'Keep these edits'})
 expect(within(dialog).getByRole('button',{name:'Previous shot'})).toHaveAttribute('aria-disabled','true')
})

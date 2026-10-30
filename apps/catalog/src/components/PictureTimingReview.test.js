import {it,expect,vi} from 'vitest'
import {render,screen,fireEvent} from '@testing-library/svelte'
import PictureTimingReview from '@khaos-machine/khaotik-ui/components/svelte/PictureTimingReview.svelte'

const repair={revision:'before',sceneId:'scene',canApply:true,reason:'',changes:[{shotId:'later',title:'Two More Days',before:{startMs:900,durationMs:1100},after:{startMs:1000,durationMs:1000}},{shotId:'hidden',title:'Hidden shot',before:{startMs:100,durationMs:200},after:null}]}
it('reviews exact ranges and explicit retirement before requesting a write',async()=>{
 const onapply=vi.fn(async()=>{})
 render(PictureTimingReview,{props:{repair,sceneLabel:'Corridor',onapply}})
 await fireEvent.click(screen.getByRole('button',{name:'Review shot timing…'}))
 expect(await screen.findByRole('dialog',{name:'Review shot timing'})).toHaveTextContent('Two More Days')
 expect(screen.getByText('0.900–2.000 s')).toBeVisible()
 expect(screen.getByText('1.000–2.000 s')).toBeVisible()
 expect(screen.getByText('Remove from track · fully hidden')).toBeVisible()
 expect(onapply).not.toHaveBeenCalled()
 await fireEvent.click(screen.getByRole('button',{name:'Apply timing repair'}))
 expect(onapply).toHaveBeenCalledWith('before')
})
it('freezes the reviewed ranges and blocks applying a changed revision',async()=>{
 const onapply=vi.fn(async()=>{})
 const {rerender}=render(PictureTimingReview,{props:{repair,sceneLabel:'Corridor',onapply}})
 await fireEvent.click(screen.getByRole('button',{name:'Review shot timing…'}))
 await screen.findByRole('dialog',{name:'Review shot timing'})
 await rerender({repair:{...repair,revision:'changed',changes:[]},sceneLabel:'Corridor',onapply})
 expect(screen.getByText('0.900–2.000 s')).toBeVisible()
 expect(screen.getByRole('button',{name:'Apply timing repair'})).toHaveAttribute('aria-disabled','true')
 expect(screen.getByRole('status')).toHaveTextContent('The story changed')
 await fireEvent.click(screen.getByRole('button',{name:'Cancel'}))
 expect(onapply).not.toHaveBeenCalled()
})
it('explains reading changes and requires explicit application',async()=>{
 const onapply=vi.fn(async()=>{})
 render(PictureTimingReview,{repair:{...repair,kind:'reading',unresolvedCount:2,changes:repair.changes.slice(0,1)},onapply})
 expect(screen.getByText('2 shots need timing review')).toBeVisible()
 await fireEvent.click(screen.getByRole('button',{name:'Review shot timing…'}))
 expect(screen.getByText(/Proposed ranges follow matching action and dialogue timings/)).toBeVisible()
 expect(onapply).not.toHaveBeenCalled()
 await fireEvent.click(screen.getByRole('button',{name:'Apply timing repair'}))
 expect(onapply).toHaveBeenCalledWith('before')
})
it('keeps unmatched shots discoverable when no bulk mapping is available',async()=>{
 render(PictureTimingReview,{repair:{...repair,unresolvedCount:3,canApply:false,changes:[],reason:'Select these shots in Coverage to set timing.'}})
 await fireEvent.click(screen.getByRole('button',{name:'Review shot timing…'}))
 expect(screen.getByRole('status')).toHaveTextContent('Select these shots in Coverage')
 expect(screen.getByRole('button',{name:'Apply timing repair'})).toHaveAttribute('aria-disabled','true')
})

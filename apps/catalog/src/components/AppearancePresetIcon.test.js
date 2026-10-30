import {it,expect} from 'vitest'
import {render} from '@testing-library/svelte'
import AppearancePresetIcon from '@khaos-machine/khaotik-ui/components/svelte/internal/AppearancePresetIcon.svelte'
it.each(['short mohawk with shaved sides','tall mohawk with shaved sides','asymmetric cut with one shaved side'])('draws hair for %s rather than treating shaved sides as a bald head',value=>{
 const {container}=render(AppearancePresetIcon,{feature:'hair',value,choices:{hairColor:'black',complexion:'light brown'}})
 expect(container.querySelector('path[fill="#292725"]')).not.toBeNull()
})
it('keeps the shaved-head preset bald',()=>{
 const {container}=render(AppearancePresetIcon,{feature:'hair',value:'shaved head',choices:{hairColor:'black',complexion:'light brown'}})
 expect(container.querySelector('path[fill="#292725"]')).toBeNull()
})

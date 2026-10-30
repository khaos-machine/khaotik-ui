import { expect, it } from 'vitest'
import { createRawSnippet } from 'svelte'
import { render } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import StoryPlayer from '@khaos-machine/khaotik-ui/components/svelte/StoryPlayer.svelte'

const segments = [{kind:'scene',sceneId:'scene',label:'Studio',startMs:0,durationMs:4000,events:[
  {elementId:'first',elementType:'action',text:'Arrival',durationMs:2000},
  {elementId:'second',elementType:'dialogue',text:'Hello',durationMs:2000},
]}]

it('keeps explicit selection separate from the event under the playhead',async()=>{
  const {container,rerender}=render(StoryPlayer,{segments,currentTime:2.5,selectedElementId:'first',audioEmphasis:true})
  const events=container.querySelectorAll('.player__event')
  expect(events[0]).toHaveClass('player__event--selected')
  expect(events[0]).not.toHaveClass('player__event--on')
  expect(events[0]).toHaveAttribute('aria-pressed','true')
  expect(events[1]).toHaveClass('player__event--on')
  expect(events[1]).not.toHaveClass('player__event--selected')
  await rerender({selectedElementId:''})
  expect(container.querySelector('.player__event--selected')).toBeNull()
  expect(events[1]).toHaveClass('player__event--on')
})

it('uses fill for playback activity and reserves the outline for selection or keyboard focus',()=>{
  const source=readFileSync(join(import.meta.dirname,'../../../../components/svelte/StoryPlayer.svelte'),'utf8')
  const css=source.split('<style>')[1].split('</style>')[0].replace(/\/\*[\s\S]*?\*\//g,'')
  const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(match=>({selector:match[1].trim(),body:match[2]}))
  const read=rules.find(rule=>rule.selector==='.player__read--on')
  expect(read?.body).toMatch(/background:/)
  expect(read?.body).not.toMatch(/outline:/)
  const selected=rules.find(rule=>rule.selector==='.player__event--selected')
  expect(selected?.body).toMatch(/outline:\s*2px solid var\(--border-focus\)/)
  const active=rules.filter(rule=>rule.selector.split(',').some(selector=>selector.trim()==='.player__event--on'))
  expect(active.length).toBeGreaterThan(0)
  expect(active.every(rule=>!rule.body.includes('outline:'))).toBe(true)
})

it('selects a reading independently of the current scene',async()=>{
  const {fireEvent}=await import('@testing-library/svelte')
  const {vi}=await import('vitest')
  const onSelectReading=vi.fn(),onSeek=vi.fn()
  const {container}=render(StoryPlayer,{segments,waveforms:{scene:{state:'loading'}},selectedReadingId:'scene',onSelectReading,onSeek})
  const reading=container.querySelector('.player__read')
  expect(reading).toHaveAttribute('aria-pressed','true')
  await fireEvent.click(reading)
  expect(onSelectReading).toHaveBeenCalledWith('scene')
  expect(onSeek).toHaveBeenCalledWith(0)
})

it('lets a host replace the scene context with selected-item tools',()=>{
  const {container}=render(StoryPlayer,{segments,showContext:false})
  expect(container.querySelector('.player__context')).toBeNull()
})


it('renders host editing tools in the transport without the old scene heading',()=>{
 const tools=createRawSnippet(()=>({render:()=>'<button type="button">Split selected shot</button>'}))
 const {getByRole,container}=render(StoryPlayer,{segments,tools,showContext:false})
 expect(getByRole('toolbar',{name:'Selected item tools'})).toContainElement(getByRole('button',{name:'Split selected shot'}))
 expect(container.querySelector('.player__context')).toBeNull()
})

// The composed documents the `Composed` fixture renders.
//
// WHY THEY LIVE HERE AND NOT IN `fixtures.js`. `check-taxonomy` parses the
// registry with regexes, and its flow-stripping pattern is
// `/\{[^{}]*kind:\s*'flow'[^{}]*\}/g` — `[^{}]` cannot cross a nested brace. A
// document literal carrying `root: {…}` would survive that strip, its `name:`
// could then register as a bogus export placement, and the gate would fail — or,
// under its own partial-parse rule, report CANNOT RUN, which is a red rather
// than a message. Documents stay out of the registry file; the registry
// references them.
//
// AUTHORED, AND THAT IS NOT THE SAME AS FABRICATED. The real-data rule is about
// DATA: a scene, a character, a duration. This is a COMPOSITION — the same kind
// of thing a fixture's example props are — and every value in it that is data
// arrives through a `$data` binding onto the captured files. Nothing here states
// a scene or a count of its own.

import * as kit from '@khaos-machine/khaotik-ui/components/svelte'
import { dataMap } from './datasets.js'

/** A component: a scene's number and its analysis state, side by side. */
const sceneCard = {
  schema: 1,
  kind: 'component',
  slug: 'scene-card',
  name: 'Scene card',
  inputs: [
    { name: 'scene', type: 'SceneRecord' },
    { name: 'state', type: 'string', default: 'Analysed' },
    { name: 'tone', type: 'StatusTone', default: 'success' },
  ],
  root: {
    type: 'layout', id: 'n0', layout: 'stack', direction: 'row', gap: 'sm', align: 'center',
    children: [
      // Both readouts come from the bound scene, not from a value typed here.
      { type: 'component', id: 'n1', component: '@MetricCard', props: { value: { $prop: 'scene.analysis_title' }, label: 'Scene', icon: 'film-slate' } },
      { type: 'component', id: 'n2', component: '@StatusPill', props: { text: { $prop: 'state' }, tone: { $prop: 'tone' }, icon: 'check-circle' } },
    ],
  },
}

/** A page: the component above, twice, over a list of real scenes. */
const scenePage = {
  schema: 1,
  kind: 'screen',
  slug: 'scene-triage',
  name: 'Scene triage',
  inputs: [],
  root: {
    type: 'layout', id: 'n0', layout: 'stack', direction: 'column', gap: 'lg', padding: 'md',
    children: [
      { type: 'component', id: 'n1', component: '@SectionHeader', props: { eyebrow: 'Composed page', title: 'Scene triage' } },
      {
        type: 'layout', id: 'n2', layout: 'grid', columns: 2, gap: 'md',
        children: [
          { type: 'component', id: 'n3', component: '@scene-card', props: { scene: { $data: 'scenes', at: 0 }, state: 'Analysed', tone: 'success' } },
          { type: 'component', id: 'n4', component: '@scene-card', props: { scene: { $data: 'scenes', at: 1 }, state: 'Skipped', tone: 'skipped' } },
        ],
      },
      { type: 'component', id: 'n5', component: '@SceneTable', props: { scenes: { $data: 'scenes', slice: [0, 5] } } },
    ],
  },
}

/** A document naming something that is not there — the state the kit must REPORT. */
const brokenPage = {
  schema: 1,
  kind: 'screen',
  slug: 'broken',
  name: 'Unresolved reference',
  inputs: [],
  root: {
    type: 'layout', id: 'n0', layout: 'stack', direction: 'column', gap: 'md', padding: 'md',
    children: [
      { type: 'component', id: 'n1', component: '@MetricCrad', props: {} },
      { type: 'component', id: 'n2', component: '@SceneTable', props: { scenes: { $data: 'scenez' } } },
    ],
  },
}

const documents = { 'scene-card': sceneCard, 'scene-triage': scenePage }

/** What the host supplies: the barrel, the other documents, and the captures. */
const host = { components: kit, documents, data: dataMap }

export const composedExamples = [
  { label: 'Page', props: { document: scenePage, ...host } },
  { label: 'Component', props: { document: sceneCard, ...host, props: { scene: { analysis_title: 'Eviction Notice' } } } },
  // A gap is RENDERED as a gap. A renamed component that drew nothing would read
  // as a layout bug and send someone looking in the wrong place.
  { label: 'Unresolved', props: { document: brokenPage, ...host } },
  { label: 'Empty', props: { document: { schema: 1, kind: 'screen', slug: 'nothing', name: 'Nothing yet' }, ...host } },
]

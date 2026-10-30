import { describe, it, expect } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte'
import { fixtures } from './fixtures.js'

// The state matrices of the components added since catalog 0.18.0: every
// example the catalog shows for them must mount, and the states with a defining
// signal must render it. Nothing else mounts every example, so a broken fixture
// would otherwise first fail on a device.
const BUILDERS = [
  'CharacterAppearanceWorkbench', 'PlaceAppearanceWorkbench', 'ObjectAppearanceWorkbench',
  'ShotInspector', 'SceneShotPlanner', 'ShotPreview', 'VoiceDesignTraits', 'VoiceDesignPanel',
  'VoiceClonePanel', 'DialogueComposer', 'SpeechControls', 'SceneReadStatus', 'CommandPalette', 'RenderStrip',
]

describe('builder state matrices', () => {
  for (const name of BUILDERS) {
    const entry = fixtures.find((f) => f.name === name)
    it(`${name} has a fixture with more than one state`, () => {
      expect(entry, name).toBeTruthy()
      expect(entry.examples.length).toBeGreaterThan(1)
    })
    for (const example of entry?.examples ?? []) {
      it(`${name} · ${example.label} mounts`, () => {
        expect(() => render(entry.component, { props: example.props })).not.toThrow()
        cleanup()
      })
    }
  }

  const example = (name, label) => fixtures.find((f) => f.name === name).examples.find((e) => e.label === label)

  it('the workbench reports a finished version as ready to review', () => {
    const { component, } = fixtures.find((f) => f.name === 'CharacterAppearanceWorkbench')
    render(component, { props: example('CharacterAppearanceWorkbench', 'Version ready to review').props })
    expect(screen.getByRole('status')).toHaveTextContent('Sheet 2 is ready to review')
  })

  it('the workbench shows the engine look options with their locks', async () => {
    const { component } = fixtures.find((f) => f.name === 'CharacterAppearanceWorkbench')
    render(component, { props: example('CharacterAppearanceWorkbench', 'Look proposals with locks').props })
    await fireEvent.click(screen.getByRole('radio', { name: 'Hair', exact: true }))
    expect(screen.getByRole('checkbox', { name: 'Keep hair / crest' })).toBeChecked()
  })

  it('an unplaced shot asks to be placed before it can generate', () => {
    const { component } = fixtures.find((f) => f.name === 'ShotInspector')
    render(component, { props: example('ShotInspector', 'Timing unresolved').props })
    expect(screen.getByText('Resolve this shot’s timing for the current reading.')).toBeVisible()
  })

  it('a retired scene read gives the engine’s reason and offers no resume', () => {
    const { component } = fixtures.find((f) => f.name === 'SceneReadStatus')
    render(component, { props: example('SceneReadStatus', 'Retired').props })
    expect(screen.getByText('This workflow has been retired.')).toBeVisible()
    expect(screen.queryByRole('button', { name: /resume/i })).toBeNull()
  })

  it('an unavailable command says why in the app’s words', () => {
    const { component } = fixtures.find((f) => f.name === 'CommandPalette')
    render(component, { props: example('CommandPalette', 'Some commands unavailable').props })
    expect(screen.getByText('The story is being written')).toBeInTheDocument()
  })

  it('the place builder works on the captured place', () => {
    const props = example('PlaceAppearanceWorkbench', 'Direction for a captured subject').props
    expect(props.workspace.name).toBe("Desmond's Apartment")
    expect(props.workspace.locationId).toMatch(/^location_/)
  })

  it('a proposed plan carries the captured scene action as its direction', () => {
    const plan = example('SceneShotPlanner', 'Proposed plan to review').props.plan
    expect(plan.shots.length).toBe(3)
    expect(plan.shots[0].direction).toMatch(/eviction notice/i)
  })
})

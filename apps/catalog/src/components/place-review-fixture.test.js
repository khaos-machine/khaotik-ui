import { expect, it } from 'vitest'
import { fixtures } from '../fixtures.js'
import conformance from '../data/place-conformance/definition.json'

it('keeps the review example on the current sheet contract without changing captured geometry', () => {
  const fixture = fixtures.find((item) => item.id === 'place-review')
  const definition = fixture.examples[0].props.definition
  expect(definition.designRevisionIds).toHaveLength(1)
  expect(definition).not.toHaveProperty('designRevisionId')
  for (const [index, camera] of definition.cameras.entries()) {
    expect(camera).not.toHaveProperty('sheetPanel')
    expect(camera.sheet).toEqual({ designRevisionId: definition.designRevisionIds[0], panel: index + 1 })
  }
  expect(definition.rooms).toEqual(conformance.rooms)
  expect(definition.openings).toEqual(conformance.openings)
  expect(definition.fixtures).toEqual(conformance.fixtures)
})

it('keeps the unsaved review example separate from its saved geometry', () => {
  const fixture = fixtures.find((item) => item.id === 'place-review')
  const definition = fixture.examples[0].props.definition
  const draft = fixture.examples.find((item) => item.label === 'Unsaved edits').props.draft
  expect(draft.designRevisionIds).toEqual(definition.designRevisionIds)
  expect(draft.openings.find((item) => item.id === 'Doorway').width).toBe(1.1)
  expect(definition.openings.find((item) => item.id === 'Doorway').width).toBe(0.9)
})

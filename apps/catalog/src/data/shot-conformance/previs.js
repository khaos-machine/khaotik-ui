// The kit's conformance shot (shot.json, kit input shape) restated as one shot of khaosd's
// `GET /api/v1/composer/previs` read (khaos-manager docs/api/composer.md, "3D previs"): its head
// blocking as KSPD stores it, and its models. Only the shape changes; every number is the kit's.
import place from './place.json'
import shot from './shot.json'

/** Rover's build key: the kit's figure.Key of the figure rover.glb was built from (README.md). */
export const ROVER_KEY = '622334572a7a2fbca0e5552ba5fa52bb617cf48cc83eb1eb6b15002afc24b15c'

/** The place definition the blocking names, as khaosd serves a definition. */
export const definition = place

/** The Crate's definition, as an object definition carries it. */
export const crateDefinition = shot.objects[0].definition

/** @type {import('@khaos-machine/khaotik-ui/components/svelte/lib/shot-scene.js').ShotBlocking & Record<string, any>} */
export const blocking = {
  id: 'shot_blocking_through',
  frame: shot.frame,
  camera: shot.camera,
  figures: shot.figures.map((f) => ({
    subject: { kind: 'character', id: f.figure },
    position: f.position,
    facingDegrees: f.facingDegrees,
    pose: f.pose,
    heightM: f.heightM,
  })),
  objects: shot.objects.map((o) => ({
    subject: { kind: 'object', id: o.definition.object },
    objectDefinitionId: o.definition.object,
    placement: { floor: o.floor },
  })),
  doors: shot.doors.map((d) => ({ fixture: d.fixture, swingDegrees: d.swingDegrees })),
}

/** One shot of the previs read, ready. */
export const previsShot = {
  shotId: 'shot_through',
  state: 'blocked',
  reasons: [],
  blocking,
  models: {
    place: '',
    figures: [{ subject: { kind: 'character', id: 'Rover' }, buildKey: ROVER_KEY, url: '' }],
    objects: [{ subject: { kind: 'object', id: 'Crate' }, url: '' }],
  },
}

const twin = { ...blocking.figures[0], subject: { kind: 'character', id: 'Twin' }, position: [3, 2, 0] }

/**
 * The same shot with a second figure of Rover's one build key, Twin, and an identity tint on each
 * (shot-kit frame, ruling of 2026-10-24: a multiply in the viewer, from a palette of relative
 * luminance at least 0.6). Constructed here; the kit carries no tints.
 */
export const twinShot = {
  ...previsShot,
  shotId: 'shot_twins',
  blocking: { ...blocking, id: 'shot_blocking_twins', figures: [...blocking.figures, twin] },
  models: {
    ...previsShot.models,
    figures: [
      { ...previsShot.models.figures[0], tint: '#ffc8c8' },
      { subject: twin.subject, buildKey: ROVER_KEY, url: '', tint: '#c8dcff' },
    ],
  },
}

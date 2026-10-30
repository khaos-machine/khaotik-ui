# Shot conformance fixtures

`place.json`, `shot.json` and `projection.json` are copied unchanged from
`github.com/khaos-studio/khaos-previs-kit` **v0.8.0** (tag commit
`aa589d52938ed109f77003293faf0d8beffa744e`), `shot/conformance/`.

- `place.json`: a constructed place of two rooms and a door, with no story
  content.
- `shot.json`: one shot blocked in it, in the kit's input shape: a camera,
  the figure Rover (rig `base`) and the floor object Crate, and the door swung open.
- `projection.json`: where Rover's head joint (COCO-18 `nose`) and the
  Crate's top front-left corner land in the shot's guides, by Blender's own
  projection, in pixels from the top left. The head joint is the bone `Nose`.

The `.glb` files are not published by the kit. Each is the kit's own export,
from the same kit version, run under the pinned Blender 5.2.3
(e13b728c6880), the way khaosd serves them:

- `place.glb`: `place.Build` of `place.json`, then `place.Guides` with a
  `.glb` output. A guide camera was added for the call, since `Guides` needs
  one; the `.glb` carries no camera.
- `rover.glb`: `figure.Build` of Rover (rig `base`, `stand`, 1.7 m) at the origin facing
  0, then `figure.GLB`. Its build key is
  `622334572a7a2fbca0e5552ba5fa52bb617cf48cc83eb1eb6b15002afc24b15c`.
- `crate.glb`: `object.Build` of the Crate's definition, then
  `object.Guides` with a `.glb` output, with a guide camera added as above.

At v0.8.0, `place.glb` and `crate.glb` rebuilt byte-identical to v0.7.0's.
`rover.glb` is the skinned human: 74 bone nodes, and the parts
`FIG_Rover_BodyFront`, `BodyBack`, `HeadFront`, `HeadBack`, `HeadLeft`,
`HeadRight`, `Eyes` and `MarkChestLight`/`Dark`, each with its own tinted
material. `ShotPrevis.test.js` also stands two figures of Rover's one build
key apart, and holds each figure mesh to the material its `.glb` gave it.

`ShotPrevis` places these by the blocking's rigid transforms and projects
the head joint and the corner within 1 px of `projection.json`
(`src/components/ShotPrevis.test.js`). `ShotPlan` holds its pucks and
footprints to the same shot (`src/components/ShotPlan.test.js`). When
khaosd moves to another kit version, copy that version's fixtures and
rebuild the `.glb` files, then change the version above.

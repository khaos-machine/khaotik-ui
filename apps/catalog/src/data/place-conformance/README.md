# Place conformance fixtures

Copied unchanged from `github.com/khaos-studio/khaos-previs-kit` **v0.4.0**
(tag commit `a8bc9db658f358d4ab718ae22120b38b072c12ad`), `place/conformance/`.
That is the kit khaosd builds and serves the place `.glb` from.

- `definition.json`: a constructed place, with no story content.
- `build-report.json`: the kit's build of it, with each fixture's top-down
  footprint measured from the built geometry.
- `projection.json`: where one footprint corner lands in one camera's guides,
  by Blender's own projection, in pixels from the top left.

`model.glb` is not published by the kit. It is the kit's own `.glb` of this
definition: `place.Build` then `place.Guides` with a `.glb` output, from the
same kit version, run under the pinned Blender 5.2.3 (e13b728c6880). That
run's build report equals `build-report.json` in objects and footprints. The
catalog's `PlaceViewer` and `PlaceReview` examples load it as bytes.

`PlacePlan`'s footprints and `PlaceViewer`'s camera are tested against these
(`src/components/PlacePlan.test.js`, `src/components/PlaceViewer.test.js`).
When khaosd moves to another kit version, copy that version's fixtures here
and change the version above. v0.3.0 and v0.4.0 differ in door footprints.

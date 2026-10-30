// The Story Atlas entry: StoryAtlas and its canvas, which load Pixi, kept out of the barrel so a
// barrel import never pulls Pixi into a first chunk. Import this module lazily. It is a `.js` id on
// purpose: a bare import ending in `.svelte` that resolves into node_modules defeats Vite 8's
// dependency scan (Khaos App's kit-imports.test.ts), and this one does not.
export { default as StoryAtlas } from './StoryAtlas.svelte'
export { default as StoryAtlasCanvas } from './StoryAtlasCanvas.svelte'

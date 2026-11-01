// Story Atlas: moved from Khaos App's src/ui/atlas/appearance.js (catalog app-coverage plan, T7).
export const icons = { character: 'user', location: 'map-pin', scene: 'film-slate' }
export const tones = {
  current: 'success',
  stale: 'warning',
  missing: 'neutral',
  failed: 'danger',
  running: 'info',
  unknown: 'neutral',
}
export const stateLabel = {
  current: 'Analysis current',
  stale: 'Analysis stale',
  missing: 'Analysis missing',
  failed: 'Analysis failed',
  running: 'Analysis running',
  unknown: 'State unavailable',
}
export const nodeSize = (node) => node.size ?? 66
// Each kind's hue, mixed lightly into the node's fill so a type reads at a glance. Not a tone:
// tones carry analysis state, which the selected rim shows.
export const kindHues = { character: '--blue-200', location: '--violet-150', scene: '--orange-450' }
export const kindTint = 0.18

/** Draws a node's outline: a character is a circle, a place a diamond, a scene a square. */
export function outline(g, kind, radius) {
  if (kind === 'scene') {
    const half = radius * 0.75
    return g.roundRect(-half, -half, half * 2, half * 2, half * 0.2)
  }
  if (kind === 'location') {
    const tip = radius * 1.2
    return g.poly([0, -tip, tip, 0, 0, tip, -tip, 0])
  }
  return g.circle(0, 0, radius)
}

export const edgeKey = edge => edge ? `${edge.source}:${edge.target}:${edge.kind}` : ""

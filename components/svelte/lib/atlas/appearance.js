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

export const edgeKey = edge => edge ? `${edge.source}:${edge.target}:${edge.kind}` : ""

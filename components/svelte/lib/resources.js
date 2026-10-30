// The engine's resource registry, in the order and words the Resource Library shows it. Moved
// from Khaos App's src/domain/resource.ts (catalog app-coverage plan, T9).

/** The kinds in the order the library lists them; a kind the engine adds follows, sorted. */
export const RESOURCE_KIND_ORDER = ['prompt', 'system_message', 'schema', 'report_template', 'rubric']

/**
 * How many artifacts of each kind, in the display order. Counted from the artifacts rather than
 * from RESOURCE_KIND_ORDER, so a kind the engine added shows with its real count instead of being
 * reported as absent.
 * @param {readonly { kind: string }[]} artifacts @returns {{ kind: string, count: number }[]}
 */
export function artifactsByKind(artifacts) {
  /** @type {Map<string, number>} */
  const counts = new Map()
  for (const artifact of artifacts) counts.set(artifact.kind, (counts.get(artifact.kind) ?? 0) + 1)
  const known = RESOURCE_KIND_ORDER.filter((kind) => counts.has(kind))
  const extra = [...counts.keys()].filter((kind) => !RESOURCE_KIND_ORDER.includes(kind)).sort()
  return [...known, ...extra].map((kind) => ({ kind, count: counts.get(kind) ?? 0 }))
}

/** A kind's heading: its words, capitalised, so a kind the engine adds reads without an edit. @param {string} kind */
export function resourceKindLabel(kind) {
  if (!kind) return 'Other'
  const words = kind.replace(/_/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

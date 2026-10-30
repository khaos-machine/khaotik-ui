// A byte count as a storyteller reads it: decimal units, as Finder shows them, with one decimal
// place from kilobytes up (412.3 KB, 44.7 MB, 4.5 GB). One formatter for every size Khaos App
// and the kit show; moved from Khaos App's `src/domain/bytes.ts` (catalog app-coverage plan, T5),
// where two copies that disagreed had already been made one.

/** @param {number} bytes */
export function formatBytes(bytes) {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`
  return `${bytes} bytes`
}

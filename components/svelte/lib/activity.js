// A story's committed changes (GET /api/projects/kspd-events), as the kit's EventLog lists them.
// Moved from Khaos App's src/app/activity.svelte.ts (catalog app-coverage plan, T9).

/**
 * One committed change. `at` is RFC 3339, kept raw; `changed` the document kinds it touched.
 * @typedef {{ seq: number, at: string, kind: string, actor: string, decision?: { kind: string, targetKind: string, targetId: string }, changed: readonly string[] }} StoryActivity
 */
/** One local day of the feed; `title` is what a reader sees ("Today"). @typedef {{ key: string, title: string, rows: readonly StoryActivity[] }} ActivityDay */
/** One EventLog row. @typedef {{ id: string, day: string, time: string, kind: string, actor: string, change: string }} LogEvent */

/**
 * The days as EventLog's rows: each change under its day, with what it decided and on which
 * record, then the document kinds it changed. `time` formats the timestamp; the day is already
 * the group.
 * @param {readonly ActivityDay[]} days @param {(at: string) => string} time @returns {LogEvent[]}
 */
export function logEvents(days, time) {
  return days.flatMap((day) =>
    day.rows.map((row) => ({
      id: String(row.seq),
      day: day.title,
      time: time(row.at),
      kind: row.kind,
      actor: row.actor,
      change: [row.decision ? `${row.decision.kind} · ${row.decision.targetKind} · ${row.decision.targetId}` : '', ...row.changed].filter(Boolean).join(' · '),
    })),
  )
}

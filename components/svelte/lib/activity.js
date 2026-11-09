// A story's committed changes (GET /api/projects/kspd-events), as the kit's EventLog lists them.
// Moved from Khaos App's src/app/activity.svelte.ts (catalog app-coverage plan, T9).

/**
 * One committed change. `at` is RFC 3339, kept raw; `changed` the document kinds it touched.
 * @typedef {{ seq: number, at: string, kind: string, actor: string, decision?: { kind: string, targetKind: string, targetId: string }, changed: readonly string[] }} StoryActivity
 */
/** One local day of the feed; `title` is what a reader sees ("Today"). @typedef {{ key: string, title: string, rows: readonly StoryActivity[] }} ActivityDay */
/** One EventLog row. @typedef {{ id: string, day: string, time: string, kind: string, actor: string, change: string }} LogEvent */

/**
 * A bounded, server-queried feed (khaotik-ui #40): what the host knows about the rows it has
 * NOT loaded. Every field is optional. The host adapts khaosd's kspd-events response:
 * `hasMore` ← `has_more`, `matchedTotal` ← `matched_total`, `storyTotal` ← `story_total`.
 * `snapshot_seq`, `observed_seq` and `scanned_through_seq` are the host's paging state and are
 * not drawn.
 * @typedef {Object} ActivityFeed
 * @property {boolean} [hasMore] Older changes (matching the query, if any) exist beyond those loaded. False or absent: no Load older.
 * @property {number} [matchedTotal] Changes matching the query across the whole history. Counted only while a query is set.
 * @property {number} [storyTotal] Every committed change in the story.
 * @property {{ kind: 'idle' } | { kind: 'loading' } | { kind: 'failed', message: string }} [older] The older-page read. Loading disables Load older; failed offers it again as a retry.
 * @property {{ kind: 'idle' } | { kind: 'catching-up' } | { kind: 'failed', message: string }} [refresh] The newer-changes read. `catching-up`: more new changes wait beyond the last one read.
 * @property {{ kind: 'idle' } | { kind: 'searching' } | { kind: 'unsupported' } | { kind: 'failed', message: string }} [search] The query's read. `unsupported`: this khaosd cannot search the history, and nothing is filtered locally.
 */

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

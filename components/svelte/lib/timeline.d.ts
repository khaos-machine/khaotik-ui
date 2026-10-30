/**
 * Flatten a composition into absolute-time segments, structural sections, and a report
 * of the rows that could not be read.
 *
 * ```
 * { total, segments, sections, unreadable }
 * ```
 *
 * - **`segments`** — `kind !== 'section'` rows, with `start` and `duration` in SECONDS.
 *   `duration` is `number | null`; `null` is preserved, never coerced.
 * - **`sections`** — the `kind === 'section'` rows, with `start`, `level`, `label` and a
 *   computed `span`. They are partitioned out HERE, before `buildLanes` ever sees them:
 *   a section arrives on the segment axis and a lane is an element-axis fact, so the
 *   synopsis lane was an axis leak and the fix is upstream of the leak (D66).
 * - **`unreadable`** — `{ index, key, kind, label, sceneId?, sectionId? }` per row missing
 *   a required key. The loud channel. A row here does not enter `segments` or `sections`.
 * - **`total`** — the greatest `start + duration` over `segments`, in seconds. Sections do
 *   not contribute: they own a range of scenes, not a duration.
 *
 * Position comes from `startMs` and from nothing else — the `cursor` accumulator that used
 * to compute it is deleted. The two agreed exactly (`durationMs = wordCount × 240` divides
 * without remainder), so this is a pure simplification, and it removes one of the two
 * implementations of cumulative-start maths the header above warns about.
 *
 * **`startMs` is asserted for presence too, which the RFC does not require.** With `cursor`
 * gone, `startMs` stops being a cross-check and becomes the only source of position; a
 * value made load-bearing and left unasserted is the deleted guard wearing a new key.
 */
export function buildTimeline(segments?: any[]): {
    total: any;
    segments: any[];
    sections: any[];
    unreadable: {
        index: number;
        key: string;
        kind: any;
        label: any;
        sceneId: any;
        sectionId: any;
    }[];
};
/**
 * The segment playing at `time`, or null.
 *
 * Half-open [start, start + duration): a boundary belongs to the segment starting there,
 * so a playhead exactly on a cut is inside the new scene rather than the old one.
 *
 * A `null`-duration row is skipped EXPLICITLY. `time < start + null` evaluates to
 * `time < start`, which is already false for every time at or past the start — so the
 * arithmetic gets the right answer for the wrong reason, and a later refactor could lose
 * it without a test noticing.
 */
export function segmentAt(timeline: any, time: any): any;
/**
 * The element playing at `time`, or null.
 *
 * Returns null inside a segment whose elements do not cover `time` — a gap is reported
 * rather than papered over with the nearest neighbour, so a data problem stays visible.
 *
 * **On live data today this returns null for every time**, because no composition event
 * carries a duration and every event is therefore `null`-duration. That is not a
 * regression #124 introduced; it is a fact #124 makes visible, and it was equally true
 * before, when a missing duration was silently read as zero.
 */
export function elementAt(timeline: any, time: any): any;
/**
 * Seconds → `m:ss`, or `h:mm:ss` once there is an hour to show.
 *
 * Compositions here run to five hours, so a fixed `m:ss` would print "311:46" and a fixed
 * `h:mm:ss` would print "0:09:56" for a short film. Neither reads well; the width follows
 * the material.
 *
 * The `Number.isFinite` clamp is NOT the plausibility guard `seconds()` was. This takes a
 * COMPUTED SCALAR, never a JSON field read by key — presence is a property of a key in an
 * object, and an argument has no key, so there is nothing here for a presence assertion to
 * be about. It is a range clamp.
 */
export function formatTimecode(totalSeconds: any): string;
/**
 * The typed lanes of a composition (#22).
 *
 * khaos.machine.x's timeline has six — `ruler, scenes, action, dialogue,
 * transition, audio` — each with its own height, label and tint. The ruler is
 * drawn by the component rather than derived, so this returns the other five.
 *
 * DERIVED from the segments rather than taken as a prop. The issue suggested a
 * `lanes` prop carrying its own segment lists, but every lane is already
 * recoverable from the composition khaosd returns: element kinds live on
 * `event.elementType`, and audio on `audioUrl` / `hasAudio`. Asking a consumer
 * to supply what we can compute would mean two sources for one truth and a
 * second chance to disagree with the scene list — and every existing caller
 * would have had to change to get a feature they already have the data for.
 *
 * A lane with no content is omitted, which is what "as few or as many as it has
 * data for" comes to in practice. Measured on the real composition of BROKEN IN
 * 4 PLACES: action 289, dialogue 1050, transition 46, audio 16 — five lanes with
 * content, and any kind the engine adds later appears on its own lane rather
 * than being dropped.
 *
 * **The extras rule is untouched by #124 and deliberately so.** The synopsis lane it was
 * appending was never an element kind the engine added: it was a SECTION, arriving on the
 * segment axis, leaking into an element-axis function through `timeline.segments`. That is
 * fixed in `buildTimeline` by partitioning sections out, upstream of this. A genuinely new
 * element kind — `sound`, `shot` — still gets its own lane, which is the guarantee this
 * rule was written for.
 */
export function buildLanes(timeline: any, order?: string[]): {
    lane: any;
    items: any;
}[];

// The composition → timeline projection: pure, no DOM, no Svelte.
//
// Exported alongside StoryPlayer rather than hidden inside it because a host needs the
// same arithmetic for playback (which element is under the playhead?) as the component
// needs for layout (where does that element sit?). Two implementations of cumulative-start
// maths is how the highlight and the bar under it drift apart.
//
// Input is khaosd's enriched composition verbatim — `GET /api/dashboard/composition`,
// on the khaosd 0.11.0 wire:
//
//   { segments: [ {
//       kind: 'scene' | 'section',
//       startMs, durationMs,                  // integer milliseconds; durationMs may be null
//       sceneId?, sectionId?, level?, label,
//       events: [ { elementType, elementId, durationMs?, text?, characterName?,
//                   parenthetical?, audioUrl?, hasAudio? } ] } ] }
//
// **This is a DECODER WITH A REPORT, not a reader.** RFC 0069 §3.1.1 is normative:
// a consumer MUST assert that `durationMs` is present and MUST NOT infer a duration
// from the plausibility of a value. `typeof value === 'number'` cannot express presence —
// it gives the same answer for a key renamed away and for a legitimate `null` — so the
// assertion here is `'durationMs' in segment`, and anything that fails it lands in
// `unreadable` rather than being sized zero.
//
// Two comments stood here for months describing a payload that had been retired
// (khaos-manager#287): this block claimed to join composition.json + story.json +
// media.json, and `buildTimeline`'s docblock claimed element durations summed exactly
// to segment duration across nine projects. The second was never true at all — no
// composition event has ever carried a duration field. Both are gone with the fallback
// they justified.

/** A section is structure over the ruler; a scene is a timed row on the track. */
const isSection = (segment) => segment?.kind === 'section'

/**
 * Milliseconds → seconds, preserving `null`.
 *
 * `null` on the wire means *not measured* and stays `null` all the way to the render.
 * It is NOT coerced to `0`: zero is a different fact — a real measurement below the
 * model's resolution — and collapsing the two is the defect #124 exists to remove.
 *
 * **KNOWN GAP — #127. This divides whatever presence let through.** The assertion above is
 * on presence, not type, so a non-numeric `durationMs` reaches this line: `'32'` decodes to
 * 32ms rather than the 32 SECONDS the retired wire meant — a 1000x understatement drawn as
 * a healthy bar, with no `--unmeasured` class and no `unreadable` entry. A non-coercible
 * string yields `NaN`, and `StoryPlayer.svelte:269`/`:271` then render NEITHER the empty
 * message nor the stage: a blank player with no diagnostic, routing around the loud channel
 * #124 built. Left as-is deliberately — `unreadable` is specified as one entry per segment
 * missing a required key, and a wrong-typed key is not a missing one. Do not widen the
 * decode without a ruling; see #127.
 */
const toSeconds = (ms) => (ms === null ? null : ms / 1000)

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
export function buildTimeline(segments = []) {
  const built = []
  const sections = []
  const unreadable = []

  let index = -1
  for (const segment of segments ?? []) {
    index += 1

    // Presence, not plausibility. `durationMs` is checked first so the criterion failure
    // — the 0.11.0 rename — is the one a reader is told about, and a row reports at most
    // one missing key so a malformed row is one entry rather than a pile.
    const missing = !(segment && 'durationMs' in segment)
      ? 'durationMs'
      : !('startMs' in segment)
        ? 'startMs'
        : null

    if (missing) {
      unreadable.push({
        index,
        key: missing,
        kind: segment?.kind,
        label: segment?.label,
        sceneId: segment?.sceneId,
        sectionId: segment?.sectionId,
      })
      continue
    }

    const start = segment.startMs / 1000
    const duration = toSeconds(segment.durationMs)

    // Events keep their CUMULATIVE OFFSET within the segment. This accumulator is not the
    // deleted fallback that used to consume it: without it every event in a segment shares
    // a start, so `elementAt` returns the FIRST event for every time inside the segment —
    // the wrong beat, silently, to khaos-app's Player.
    //
    // An event with no `durationMs` gets `duration: null`, keeps its place at the offset
    // reached so far, and contributes 0. It is NOT an `unreadable` entry: the presence
    // assertion is on segments, the composition model's timed rows. Every one of the 264
    // events on the live payload lacks the key, so asserting it here would put every
    // healthy composition on the loud channel and turn it into noise.
    //
    // An event that carries `startMs` — a scene read's line, placed by the joiner that wrote
    // the audio (KSPD RFC 0085 amendment 3) — sits at the segment start plus its `startMs`,
    // so the pauses between lines are kept. The offset then continues from its end.
    let offset = 0
    const events = []
    for (const event of segment?.events ?? []) {
      const eventDuration = event && 'durationMs' in event ? toSeconds(event.durationMs) : null
      if (event && Number.isFinite(event.startMs)) offset = event.startMs / 1000
      events.push({ ...event, start: start + offset, duration: eventDuration })
      offset += eventDuration ?? 0
    }

    const row = { ...segment, start, duration, events }
    if (isSection(segment)) sections.push(row)
    else built.push(row)
  }

  const total = built.reduce((max, s) => Math.max(max, s.start + (s.duration ?? 0)), 0)

  // A section's span is COMPUTED, because `durationMs: null` on it is honest — it owns a
  // range of scenes, not a duration.
  //
  // The rule: the start of the next section at the same level OR SHALLOWER, minus this
  // section's start; and to `total` if there is none. "Or shallower" is what supplies the
  // missing notion of a parent — a level-2 sequence is terminated by the next level-2
  // sequence or by the next level-1 act, whichever comes first, and the next act IS its
  // parent's end. A same-level-only rule has no parent notion at all, so the last sequence
  // inside ACT I would run through every act that follows it.
  for (let i = 0; i < sections.length; i += 1) {
    const here = sections[i]
    const bound = sections.slice(i + 1).find((s) => (s.level ?? 1) <= (here.level ?? 1))
    here.span = (bound ? bound.start : total) - here.start
  }

  return { total, segments: built, sections, unreadable }
}

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
export function segmentAt(timeline, time) {
  if (!timeline || time < 0) return null
  for (const segment of timeline.segments) {
    if (segment.duration === null) continue
    if (time >= segment.start && time < segment.start + segment.duration) return segment
  }
  return null
}

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
export function elementAt(timeline, time) {
  const segment = segmentAt(timeline, time)
  if (!segment) return null
  for (const event of segment.events) {
    if (event.duration === null) continue
    if (time >= event.start && time < event.start + event.duration) return event
  }
  return null
}

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
export function formatTimecode(totalSeconds) {
  const t = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0))
  const s = t % 60
  const m = Math.floor(t / 60) % 60
  const h = Math.floor(t / 3600)
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

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
export function buildLanes(timeline, order = ['scenes', 'action', 'dialogue', 'transition', 'audio']) {
  const events = (timeline?.segments ?? []).flatMap((s) => s.events ?? [])

  const byKind = new Map()
  for (const event of events) {
    const kind = event.elementType || 'other'
    if (!byKind.has(kind)) byKind.set(kind, [])
    byKind.get(kind).push(event)
  }

  const audio = events.filter((e) => e.audioUrl || e.hasAudio)

  const contentFor = (lane) => {
    if (lane === 'scenes') return timeline?.segments ?? []
    if (lane === 'audio') return audio
    return byKind.get(lane) ?? []
  }

  // Declared order first, then any element kind the engine sent that the order
  // does not mention — appended, never dropped.
  const extras = [...byKind.keys()].filter((k) => !order.includes(k)).sort()

  return [...order, ...extras]
    .map((lane) => ({ lane, items: contentFor(lane) }))
    .filter(({ items }) => items.length > 0)
}

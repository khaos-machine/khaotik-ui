// The Scenes destination, as data: khaosd's scenes and composition in, the table rows, the
// scene text and the scene's accounts out. Pure. Moved from Khaos App's `src/app/scenes.ts` and
// `sceneDialogueBars` in `src/domain/dashboard.ts` (catalog app-coverage plan, T3).

/**
 * The fields of khaosd's scene row (`/api/v1/dashboard/scenes`) the destination reads.
 * @typedef {Object} SceneRecord
 * @property {string} id
 * @property {number} [index] 0-based place in the story.
 * @property {string} [slugline]
 * @property {string} [analysis_title] The title the scene's analysis gave it; '' when it has none.
 * @property {string} [type] INT, EXT…
 * @property {string} [timeOfDay]
 * @property {number} [word_count]
 * @property {number} [line_count]
 * @property {number} [scene_take_count] Reads of the whole scene.
 * @property {number} [line_take_count]
 * @property {string} [locationId]
 * @property {Readonly<Record<string, number>>} [dialogue_counts] Lines spoken, by character id.
 * @property {readonly string[]} [nonSpeaking] Characters present, with no lines.
 * @property {readonly string[]} [mentioned] Characters named, not present.
 * @property {readonly string[]} [mentionedObjects]
 * @property {readonly string[]} [mentionedLocations]
 * @property {readonly string[]} [objects] Props in the scene.
 */

/**
 * One Scenes table row.
 * @typedef {Object} SceneRow
 * @property {string} id
 * @property {number | null} n The scene's 1-based number; null when the engine sent no index. Never invented.
 * @property {string} slugline
 * @property {string} title The title the scene's analysis gave it; '' when it has none.
 * @property {string} setting
 * @property {string} time
 * @property {number} words
 * @property {number} lines
 * @property {'ready' | null} read The Read column's mark: ready once the scene has a read; absent, never "missing", before.
 * @property {number} reads
 * @property {number} takes
 */

/** @param {readonly SceneRecord[]} scenes @returns {SceneRow[]} */
export function sceneRows(scenes) {
  return scenes.map((s) => ({
    id: s.id,
    n: s.index === undefined ? null : s.index + 1,
    slugline: s.slugline ?? '',
    title: s.analysis_title ?? '',
    setting: s.type ?? '',
    time: s.timeOfDay ?? '',
    words: s.word_count ?? 0,
    lines: s.line_count ?? 0,
    // The engine says how many reads a scene has; it does not yet say whether one is stale
    // per scene, so the mark is ready or absent, never claimed stale here.
    read: (s.scene_take_count ?? 0) > 0 ? 'ready' : null,
    reads: s.scene_take_count ?? 0,
    takes: s.line_take_count ?? 0,
  }))
}

/**
 * One event of a composition segment, as khaosd serves it.
 * @typedef {Object} CompositionEvent
 * @property {string} elementId
 * @property {string} elementType
 * @property {string} [text]
 * @property {string} [characterId]
 * @property {string} [characterName]
 * @property {string} [parenthetical]
 */

/**
 * A composition segment (`/api/dashboard/composition`): a scene, or a section of one.
 * @typedef {Object} CompositionSegment
 * @property {string} kind `scene` or `section`.
 * @property {string} [sceneId]
 * @property {string} [sectionId]
 * @property {string} label The slugline or the section's name.
 * @property {readonly CompositionEvent[]} events
 */

/**
 * One line of a scene's text, in ScreenplayText's element shape.
 * @typedef {Object} ScreenplayLine
 * @property {string} id
 * @property {string} kind
 * @property {string} text
 * @property {string} [characterId] The speaker of a dialogue line, as the composition names them.
 */

/**
 * A scene's text from its composition segment: the slugline, then each element as written,
 * with the speaker's cue and the parenthetical before a line of dialogue. The ids are the
 * engine's element ids (cue and parenthetical lines are suffixed), so selecting a line names a
 * real element.
 * @param {CompositionSegment} segment
 * @returns {ScreenplayLine[]}
 */
export function screenplayElements(segment) {
  const key = segment.kind === 'scene' ? segment.sceneId : segment.sectionId
  return [
    { id: `${key}:slugline`, kind: 'slugline', text: segment.label },
    ...segment.events.flatMap((e) => {
      const text = e.text ?? ''
      if (e.elementType !== 'dialogue') return [{ id: e.elementId, kind: e.elementType, text }]
      return [
        ...(e.characterName ? [{ id: `${e.elementId}:cue`, kind: 'character', text: e.characterName }] : []),
        ...(e.parenthetical ? [{ id: `${e.elementId}:paren`, kind: 'parenthetical', text: e.parenthetical }] : []),
        { id: e.elementId, kind: 'dialogue', text, ...(e.characterId ? { characterId: e.characterId } : {}) },
      ]
    }),
  ]
}

/** @typedef {{ id: string, name: string }} Named */

/**
 * What a scene holds besides its speakers, joined from the ids its row serves (RFC 0102).
 * @typedef {Object} SceneAccount
 * @property {string | null} location The location's name; null when the row names none.
 * @property {Named[]} nonSpeaking Present, no lines.
 * @property {Named[]} mentioned Named, not present.
 * @property {Named[]} named Objects, then places, named but not in the action.
 * @property {Named[]} objects Props in the scene.
 */

/**
 * The scene's accounts, joined from the lists the host holds. An id the lists do not hold is
 * dropped: the join is the host's, the fact the engine's.
 * @param {SceneRecord} scene
 * @param {{ characters: readonly Named[], locations: readonly Named[], objects: readonly Named[] }} lists
 * @returns {SceneAccount}
 */
export function sceneAccount(scene, lists) {
  /** @param {readonly string[] | undefined} ids @param {readonly Named[]} from */
  const join = (ids, from) => /** @type {Named[]} */ ((ids ?? []).map((id) => from.find((x) => x.id === id)).filter(Boolean))
  const location = scene.locationId ? (lists.locations.find((l) => l.id === scene.locationId)?.name ?? null) : null
  return {
    location,
    nonSpeaking: join(scene.nonSpeaking, lists.characters),
    mentioned: join(scene.mentioned, lists.characters),
    named: [...join(scene.mentionedObjects, lists.objects), ...join(scene.mentionedLocations, lists.locations)],
    objects: join(scene.objects, lists.objects),
  }
}

/**
 * Who speaks in one scene and how many lines each has, most-first. The counts are the engine's
 * `dialogue_counts`, keyed by character id; a character the list does not hold keeps its id.
 * @param {SceneRecord} scene
 * @param {readonly Named[]} characters
 * @returns {{ label: string, value: number, id: string }[]}
 */
export function sceneDialogueBars(scene, characters) {
  /** @param {string} id */
  const label = (id) => characters.find((c) => c.id === id)?.name || id
  return Object.entries(scene.dialogue_counts ?? {})
    .map(([id, lines]) => ({ label: label(id), value: lines, id }))
    .sort((a, b) => b.value - a.value)
}

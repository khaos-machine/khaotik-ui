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
export function sceneRows(scenes: readonly SceneRecord[]): SceneRow[];
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
export function screenplayElements(segment: CompositionSegment): ScreenplayLine[];
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
export function sceneAccount(scene: SceneRecord, lists: {
    characters: readonly Named[];
    locations: readonly Named[];
    objects: readonly Named[];
}): SceneAccount;
/**
 * Who speaks in one scene and how many lines each has, most-first. The counts are the engine's
 * `dialogue_counts`, keyed by character id; a character the list does not hold keeps its id.
 * @param {SceneRecord} scene
 * @param {readonly Named[]} characters
 * @returns {{ label: string, value: number, id: string }[]}
 */
export function sceneDialogueBars(scene: SceneRecord, characters: readonly Named[]): {
    label: string;
    value: number;
    id: string;
}[];
/**
 * The fields of khaosd's scene row (`/api/v1/dashboard/scenes`) the destination reads.
 */
export type SceneRecord = {
    id: string;
    /**
     * 0-based place in the story.
     */
    index?: number;
    slugline?: string;
    /**
     * The title the scene's analysis gave it; '' when it has none.
     */
    analysis_title?: string;
    /**
     * INT, EXT…
     */
    type?: string;
    timeOfDay?: string;
    word_count?: number;
    line_count?: number;
    /**
     * Reads of the whole scene.
     */
    scene_take_count?: number;
    line_take_count?: number;
    locationId?: string;
    /**
     * Lines spoken, by character id.
     */
    dialogue_counts?: Readonly<Record<string, number>>;
    /**
     * Characters present, with no lines.
     */
    nonSpeaking?: readonly string[];
    /**
     * Characters named, not present.
     */
    mentioned?: readonly string[];
    mentionedObjects?: readonly string[];
    mentionedLocations?: readonly string[];
    /**
     * Props in the scene.
     */
    objects?: readonly string[];
};
/**
 * One Scenes table row.
 */
export type SceneRow = {
    id: string;
    /**
     * The scene's 1-based number; null when the engine sent no index. Never invented.
     */
    n: number | null;
    slugline: string;
    /**
     * The title the scene's analysis gave it; '' when it has none.
     */
    title: string;
    setting: string;
    time: string;
    words: number;
    lines: number;
    /**
     * The Read column's mark: ready once the scene has a read; absent, never "missing", before.
     */
    read: "ready" | null;
    reads: number;
    takes: number;
};
/**
 * One event of a composition segment, as khaosd serves it.
 */
export type CompositionEvent = {
    elementId: string;
    elementType: string;
    text?: string;
    characterId?: string;
    characterName?: string;
    parenthetical?: string;
};
/**
 * A composition segment (`/api/dashboard/composition`): a scene, or a section of one.
 */
export type CompositionSegment = {
    /**
     * `scene` or `section`.
     */
    kind: string;
    sceneId?: string;
    sectionId?: string;
    /**
     * The slugline or the section's name.
     */
    label: string;
    events: readonly CompositionEvent[];
};
/**
 * One line of a scene's text, in ScreenplayText's element shape.
 */
export type ScreenplayLine = {
    id: string;
    kind: string;
    text: string;
    /**
     * The speaker of a dialogue line, as the composition names them.
     */
    characterId?: string;
};
export type Named = {
    id: string;
    name: string;
};
/**
 * What a scene holds besides its speakers, joined from the ids its row serves (RFC 0102).
 */
export type SceneAccount = {
    /**
     * The location's name; null when the row names none.
     */
    location: string | null;
    /**
     * Present, no lines.
     */
    nonSpeaking: Named[];
    /**
     * Named, not present.
     */
    mentioned: Named[];
    /**
     * Objects, then places, named but not in the action.
     */
    named: Named[];
    /**
     * Props in the scene.
     */
    objects: Named[];
};

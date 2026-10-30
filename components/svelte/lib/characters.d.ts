/**
 * The table rows. `castings` null means the cast is not read (yet, or at all), so the column
 * says nothing rather than claiming "Not cast".
 * @param {readonly CharacterRecord[]} characters
 * @param {readonly CharacterCasting[] | null} castings
 * @returns {CharacterRow[]}
 */
export function characterRows(characters: readonly CharacterRecord[], castings: readonly CharacterCasting[] | null): CharacterRow[];
/** A character's Identity stats, as the inspector lists them; the detail repeats none. @param {CharacterRecord} c @returns {[string, string][]} */
export function characterIdentity(c: CharacterRecord): [string, string][];
/**
 * A voice the character can be cast to.
 * @typedef {Object} CastableVoice
 * @property {string} profileId
 * @property {string} name
 * @property {string} [engine]
 */
/**
 * The Voice pop-up's items, with the voice that shares the character's name first and
 * suggested. The match is the whole name, case-insensitive: "Desmond" for DESMOND, never
 * "Des" for DESMOND.
 * @param {string} characterName
 * @param {readonly CastableVoice[]} castable
 * @returns {{ items: { id: string, label: string, detail?: string }[], suggested: string }}
 */
export function voiceChoices(characterName: string, castable: readonly CastableVoice[]): {
    items: {
        id: string;
        label: string;
        detail?: string;
    }[];
    suggested: string;
};
/**
 * Where a line sits among its speaker's lines in the same scene, counted from 1, as the Line
 * inspector's Position row says it; null when the line is not in the list.
 * @param {readonly { element_id: string, scene_id: string }[]} lines
 * @param {string} elementId
 * @returns {{ n: number, of: number } | null}
 */
export function linePosition(lines: readonly {
    element_id: string;
    scene_id: string;
}[], elementId: string): {
    n: number;
    of: number;
} | null;
/** An analysis's mark in a table: ready when current, stale when stale, nothing otherwise. @param {{ state: string } | undefined | null} standing @returns {'ready' | 'stale' | null} */
export function analysisMark(standing: {
    state: string;
} | undefined | null): "ready" | "stale" | null;
/**
 * One of an entity detail's `graph_context` lists (`/api/dashboard/detail`) as bars: one per
 * entry, its value the engine's own `frequency`, ranked most-first. An entry with no name is
 * left out; a missing frequency reads as 0 and keeps its row.
 * @param {unknown} entries
 * @returns {{ label: string, value: number }[]}
 */
export function frequencyBars(entries: unknown): {
    label: string;
    value: number;
}[];
/** The narrator's row id in the table: not a character, and never an id the engine sends. */
export const NARRATOR: "@narrator";
export function formatShare(percent: number): string;
export function appearanceLabel(state: string | undefined): string;
export function coAppearanceBars(graphContext: Record<string, unknown> | null | undefined): {
    label: string;
    value: number;
}[];
/**
 * A voice the character can be cast to.
 */
export type CastableVoice = {
    profileId: string;
    name: string;
    engine?: string;
};
/**
 * The fields of khaosd's character row (`/api/v1/dashboard/characters`) the destination reads.
 * The dialogue measurements are optional because older engines omit them on a character with
 * no dialogue; absent reads as zero.
 */
export type CharacterRecord = {
    id: string;
    name: string;
    dialogue_lines?: number;
    scene_count?: number;
    scenes?: readonly string[];
    /**
     * The share of the screenplay's dialogue lines, as the engine measured it.
     */
    percentage?: number;
    /**
     * Scenes that name the character without it appearing.
     */
    mentionedSceneIds?: readonly string[];
    /**
     * Who asserted the character: `parsed`, `authored`…
     */
    origin?: string;
    aliases?: readonly string[];
    authoredAliases?: readonly string[];
    introducedAliases?: readonly string[];
};
/**
 * A character's cast voice, as khaosd's castings list it.
 */
export type CharacterCasting = {
    characterId: string;
    voiceProfileId: string;
    voiceProfileName?: string;
};
/**
 * One Characters table row.
 */
export type CharacterRow = {
    id: string;
    name: string;
    lines: number;
    scenes: number;
    /**
     * The share of the screenplay's dialogue; null when the engine sent none.
     */
    share: number | null;
    /**
     * The cast voice's name, "Not cast", or '' while the castings are unread.
     */
    cast: string;
};

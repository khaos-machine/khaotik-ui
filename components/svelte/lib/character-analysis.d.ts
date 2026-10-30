/**
 * The view, or null when the record holds neither a story nor a casting reading: an analysis
 * in a shape the engine no longer writes, or none.
 * @param {Dict | undefined | null} analysis
 * @returns {CharacterAnalysisView | null}
 */
export function characterAnalysisView(analysis: Dict | undefined | null): CharacterAnalysisView | null;
export type Dict = import("./analysis-labels.js").Dict;
export type MadeBy = import("./analysis-labels.js").MadeBy;
/**
 * A statement with the scenes that show it, as "Sc 3, Sc 17".
 */
export type Cited = {
    text: string;
    scenes: string;
};
export type Turn = {
    scene: string;
    kind: string;
    change: string;
};
export type Relationship = {
    name: string;
    /**
     * recurring, or pivotal for a character met in one scene.
     */
    basis: string;
    nature: string;
    development: string;
    scenes: string;
};
export type Suggested = {
    detail: string;
    restsOn: string;
};
export type Appearance = {
    castingNote: string;
    stated: Cited[];
    changes: Cited[];
    /**
     * In the note, not in the script.
     */
    suggested: Suggested[];
};
export type VoiceProfile = {
    designNote: string;
    register: string;
    pace: string;
    energy: string;
    talks: string;
    accent: string;
    auditionLines: {
        line: string;
        scene: string;
    }[];
    suggested: Suggested[];
};
export type TieLine = {
    scene: string;
    /**
     * Who says it; empty for the script's own description.
     */
    speaker: string;
    wording: string;
    text: string;
};
export type TiePerson = {
    /**
     * Who the lines mean: a character's name, "Never brought on", or "Cannot tell".
     */
    who: string;
    /**
     * Who settled it: "Review", "Decision model 0.94" or "Analysis".
     */
    decidedBy: string;
    lines: TieLine[];
};
export type Tie = {
    /**
     * "brother", "friend".
     */
    tie: string;
    people: TiePerson[];
};
export type CharacterAnalysisView = {
    summary: string;
    role: {
        weight: string;
        does: string;
    };
    want: {
        goal: string;
        obstacle: string;
        scenes: string;
    };
    arc: {
        shape: string;
        start: Cited;
        end: Cited;
        turns: Turn[];
    };
    relationships: Relationship[];
    appearance: Appearance;
    demographics: {
        gender: string;
        age: string;
    };
    /**
     * How they talk; null when they never speak.
     */
    voice: {
        manner: string;
        habits: string[];
    } | null;
    voiceProfile: VoiceProfile | null;
    /**
     * Who the people the script ties to them are. Suggestions for Review, never applied.
     */
    ties: Tie[];
    /**
     * What the engine's own checks found wrong with an answer, by reading.
     */
    review: {
        reading: string;
        finding: string;
    }[];
    madeBy: MadeBy | null;
};

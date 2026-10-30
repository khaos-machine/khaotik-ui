/**
 * The view, or null when the record holds neither a story nor a setting reading.
 * @param {Dict | undefined | null} analysis
 * @returns {PlaceAnalysisView | null}
 */
export function placeAnalysisView(analysis: Dict | undefined | null): PlaceAnalysisView | null;
export type Dict = import("./analysis-labels.js").Dict;
export type Cited = import("./character-analysis.js").Cited;
export type Suggested = import("./character-analysis.js").Suggested;
/**
 * What the script's loose wording in this place's scenes means.
 */
export type Mention = {
    /**
     * "the kitchen", "his brownstone".
     */
    wording: string;
    /**
     * `means`: "This place", "Part of this place", another place's name, "Elsewhere: the street", "Not a place" or "Cannot tell". `decidedBy`: "Both readers 0.88", "Analysis" or "Review".
     */
    readings: {
        means: string;
        decidedBy: string;
        lines: {
            scene: string;
            text: string;
        }[];
    }[];
};
/**
 * How this place joins another, with the lines that say so.
 */
export type Connection = {
    /**
     * "ROOFTOP is inside FIFTH'S LOFT".
     */
    sentence: string;
    /**
     * "Decision model 0.95", or "Mentions 0.93" for one the mentions imply.
     */
    decidedBy: string;
    evidence: {
        scene: string;
        words: string;
    }[];
};
export type PlaceAnalysisView = {
    summary: string;
    /**
     * True when the place has one scene and the story is that scene's own summary.
     */
    fromScene: boolean;
    role: {
        weight: string;
        does: string;
    };
    events: {
        scene: string;
        what: string;
    }[];
    change: {
        kind: string;
        what: string;
        scenes: string;
        phases: {
            state: string;
            scenes: string;
        }[];
    };
    facts: {
        scenes: number;
        interiorExterior: string;
        timeOfDay: string;
        parts: string[];
        spokenOf: number;
    };
    setting: {
        atmosphere: string;
        stated: Cited[];
        changes: Cited[];
        suggested: Suggested[];
    };
    /**
     * Suggestions for Review, never applied.
     */
    mentions: Mention[];
    /**
     * Suggestions, never applied.
     */
    connections: Connection[];
    review: {
        reading: string;
        finding: string;
    }[];
    madeBy: import("./analysis-labels.js").MadeBy | null;
};

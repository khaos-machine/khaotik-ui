/**
 * A suggestion in words; a bind names its target, by name when the story holds it.
 * @param {string} suggestion
 * @param {string} bindTo
 * @param {ViewLookup['names']} names
 */
export function suggestionWords(suggestion: string, bindTo: string, names: ViewLookup["names"]): string;
/**
 * @param {Record<string, unknown> | undefined | null} analysis
 * @param {ViewLookup} lookup
 * @returns {SceneAnalysisView | null}
 */
export function sceneAnalysisView(analysis: Record<string, unknown> | undefined | null, lookup: ViewLookup): SceneAnalysisView | null;
export type Interaction = {
    from: string;
    to: string;
    type: string;
    valence: string;
    significance: string;
    description: string;
};
export type ArcMoment = {
    character: string;
    type: string;
    milestone: string;
    shift: string;
    description: string;
};
export type SuggestionView = {
    recordId: string;
    kind: string;
    /**
     * The suggestion in words: "bind to lock", "new", "supported".
     */
    words: string;
    /**
     * The engine's verdict on the suggestion: accepted, statement or rejected.
     */
    outcome: string;
    /**
     * Why it was not accepted, in the engine's words; empty when it was.
     */
    reason: string;
    /**
     * The scene lines it cites, or the event's id when the scene does not hold it.
     */
    evidence: string[];
};
export type Provenance = {
    /**
     * The prompt that made it, id and version.
     */
    process: string;
    /**
     * The model that made it and the provider it ran on (`made_by`); null on an analysis from before it was recorded.
     */
    model: string | null;
    /**
     * The Stage 1 ledger change the analysis was shown.
     */
    storyDataChange: string;
    fingerprint: string;
};
export type SceneAnalysisView = {
    title: string;
    summary: string;
    pacing: string;
    tone: string;
    role: string;
    themes: string[];
    beats: string[];
    speakers: {
        name: string;
        goal: string;
        state: string;
    }[];
    interactions: Interaction[];
    arcMoments: ArcMoment[];
    /**
     * Every suggestion the engine reviewed, accepted or not. Suggestions, never decisions.
     */
    suggestions: SuggestionView[];
    provenance: Provenance | null;
};
/**
 * What the view looks up in the host's lists.
 */
export type ViewLookup = {
    /**
     * Characters, objects and places, to name a bind target.
     */
    names: readonly {
        id: string;
        name: string;
    }[];
    /**
     * The scene's event texts by event id, to quote a suggestion's evidence.
     */
    lines: ReadonlyMap<string, string>;
};

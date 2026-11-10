export default StoryOverviewSide;
type StoryOverviewSide = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StoryOverviewSide: import("svelte").Component<{
    /**
     * As StoryOverview takes it.
     */
    structure?: import("./lib/story-overview.js").SectionRead<import("./lib/story-overview.js").StoryStructure>;
    /**
     * As StoryOverview takes it.
     */
    coverage?: import("./lib/story-overview.js").SectionRead<Record<string, any>>;
    /**
     * As StoryOverview takes it.
     */
    journeys?: import("./lib/story-overview.js").SectionRead<readonly Record<string, any>[]>;
    /**
     * As StoryOverview takes it.
     */
    relationships?: import("./lib/story-overview.js").SectionRead<readonly Record<string, any>[]>;
    /**
     * Advanced mode: a relationship's confidence.
     */
    advanced?: boolean;
    /**
     * The selected turn, character, journey or relationship, including skipped pairs.
     */
    selected?: import("./lib/story-overview.js").OverviewSelection | null;
    /**
     * Asked with any selected evidence scene's id.
     */
    onRevealScene?: (sceneId: string) => void;
    /**
     * A selected skipped pair shows its reason and weights. Off: nothing is shown for it, as in 0.178.5.
     */
    showSkippedPairs?: boolean;
    /**
     * Every evidence scene: each journey turning point's and relationship's, and the journey's and relationship's own Evidence scenes. Off: a journey turning point reveals its first scene only.
     */
    showEvidenceScenes?: boolean;
}, {}, "">;
type Props = {
    /**
     * As StoryOverview takes it.
     */
    structure?: import("./lib/story-overview.js").SectionRead<import("./lib/story-overview.js").StoryStructure>;
    /**
     * As StoryOverview takes it.
     */
    coverage?: import("./lib/story-overview.js").SectionRead<Record<string, any>>;
    /**
     * As StoryOverview takes it.
     */
    journeys?: import("./lib/story-overview.js").SectionRead<readonly Record<string, any>[]>;
    /**
     * As StoryOverview takes it.
     */
    relationships?: import("./lib/story-overview.js").SectionRead<readonly Record<string, any>[]>;
    /**
     * Advanced mode: a relationship's confidence.
     */
    advanced?: boolean;
    /**
     * The selected turn, character, journey or relationship, including skipped pairs.
     */
    selected?: import("./lib/story-overview.js").OverviewSelection | null;
    /**
     * Asked with any selected evidence scene's id.
     */
    onRevealScene?: (sceneId: string) => void;
    /**
     * A selected skipped pair shows its reason and weights. Off: nothing is shown for it, as in 0.178.5.
     */
    showSkippedPairs?: boolean;
    /**
     * Every evidence scene: each journey turning point's and relationship's, and the journey's and relationship's own Evidence scenes. Off: a journey turning point reveals its first scene only.
     */
    showEvidenceScenes?: boolean;
};

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
     * The selected turn, character, journey or relationship.| null} [selected] The selected turn or character.
     */
    selected?: import("./lib/story-overview.js").OverviewSelection | null;
    /**
     * Asked with the turn's scene.
     */
    onRevealScene?: (sceneId: string) => void;
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
     * The selected turn, character, journey or relationship.| null} [selected] The selected turn or character.
     */
    selected?: import("./lib/story-overview.js").OverviewSelection | null;
    /**
     * Asked with the turn's scene.
     */
    onRevealScene?: (sceneId: string) => void;
};

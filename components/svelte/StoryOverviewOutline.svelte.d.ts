export default StoryOverviewOutline;
type StoryOverviewOutline = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StoryOverviewOutline: import("svelte").Component<{
    /**
     * As StoryOverview takes it.
     */
    premise?: import("./lib/story-overview.js").SectionRead<import("./lib/story-overview.js").StoryPremise>;
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
     * The section shown.
     */
    current?: ("characters" | "coverage" | "premise" | "shape" | "turns" | "production" | "journeys" | "relationships") | null;
    /**
     * Asked with the section chosen.
     */
    onjump?: (section: "characters" | "coverage" | "premise" | "shape" | "turns" | "production" | "journeys" | "relationships") => void;
}, {}, "">;
type Props = {
    /**
     * As StoryOverview takes it.
     */
    premise?: import("./lib/story-overview.js").SectionRead<import("./lib/story-overview.js").StoryPremise>;
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
     * The section shown.
     */
    current?: ("characters" | "coverage" | "premise" | "shape" | "turns" | "production" | "journeys" | "relationships") | null;
    /**
     * Asked with the section chosen.
     */
    onjump?: (section: "characters" | "coverage" | "premise" | "shape" | "turns" | "production" | "journeys" | "relationships") => void;
};

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
     * Current section runs, as StoryOverview takes them; running overrides a previous result. For journeys and relationships, partial reads Incomplete and failed reads Didn't finish, whatever was saved.
     */
    runs?: {
        premise?: {
            kind: string;
        };
        structure?: {
            kind: string;
        };
        coverage?: {
            kind: string;
        };
        journeys?: {
            kind: string;
        };
        relationships?: {
            kind: string;
        };
    };
    /**
     * The section shown.
     */
    current?: ("characters" | "coverage" | "premise" | "shape" | "turns" | "production" | "journeys" | "relationships") | null;
    /**
     * Asked with the section chosen.
     */
    onjump?: (section: "characters" | "coverage" | "premise" | "shape" | "turns" | "production" | "journeys" | "relationships") => void;
    /**
     * The turns row's title. Defaults to "Where the story turns", as in 0.178.5.
     */
    turnsTitle?: string;
    /**
     * Coverage, Characters and Production read Incomplete when coverage lists unfinished sections. Off: Ready.
     */
    showIncompleteCoverage?: boolean;
    /**
     * A section whose run (`runs`) is running reads Running.
     */
    showRunning?: boolean;
    /**
     * A partial or failed journeys or relationships pass (`runs`) reads Incomplete or Didn't finish, and failed turn naming reads Didn't finish. Off: Not ready.
     */
    showPassStates?: boolean;
    /**
     * Turns named with no points read Ready. Off: Not ready, as in 0.178.5.
     */
    showEmptyResults?: boolean;
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
     * Current section runs, as StoryOverview takes them; running overrides a previous result. For journeys and relationships, partial reads Incomplete and failed reads Didn't finish, whatever was saved.
     */
    runs?: {
        premise?: {
            kind: string;
        };
        structure?: {
            kind: string;
        };
        coverage?: {
            kind: string;
        };
        journeys?: {
            kind: string;
        };
        relationships?: {
            kind: string;
        };
    };
    /**
     * The section shown.
     */
    current?: ("characters" | "coverage" | "premise" | "shape" | "turns" | "production" | "journeys" | "relationships") | null;
    /**
     * Asked with the section chosen.
     */
    onjump?: (section: "characters" | "coverage" | "premise" | "shape" | "turns" | "production" | "journeys" | "relationships") => void;
    /**
     * The turns row's title. Defaults to "Where the story turns", as in 0.178.5.
     */
    turnsTitle?: string;
    /**
     * Coverage, Characters and Production read Incomplete when coverage lists unfinished sections. Off: Ready.
     */
    showIncompleteCoverage?: boolean;
    /**
     * A section whose run (`runs`) is running reads Running.
     */
    showRunning?: boolean;
    /**
     * A partial or failed journeys or relationships pass (`runs`) reads Incomplete or Didn't finish, and failed turn naming reads Didn't finish. Off: Not ready.
     */
    showPassStates?: boolean;
    /**
     * Turns named with no points read Ready. Off: Not ready, as in 0.178.5.
     */
    showEmptyResults?: boolean;
};

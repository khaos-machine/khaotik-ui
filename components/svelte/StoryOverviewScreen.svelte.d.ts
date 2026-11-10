export default StoryOverviewScreen;
type StoryOverviewScreen = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StoryOverviewScreen: import("svelte").Component<{
    /**
     * The story's title, as StoryOverview takes it.
     */
    title?: string;
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
     * Advanced mode, as StoryOverview and StoryOverviewSide take it.
     */
    advanced?: boolean;
    /**
     * The strip's props; null draws no strip.
     */
    strip?: import("svelte").ComponentProps<typeof StoryOverviewStrip> | null;
    /**
     * The selected turn, character, journey or relationship. Bindable.
     */
    selected?: import("./lib/story-overview.js").OverviewSelection | null;
    /**
     * Told what was selected; null when the side pane is closed.
     */
    onselect?: (item: import("./lib/story-overview.js").OverviewSelection | null) => void;
    /**
     * As StoryOverviewSide takes it.
     */
    onRevealScene?: (sceneId: string) => void;
}, {}, "selected">;
type Props = {
    /**
     * The story's title, as StoryOverview takes it.
     */
    title?: string;
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
     * Advanced mode, as StoryOverview and StoryOverviewSide take it.
     */
    advanced?: boolean;
    /**
     * The strip's props; null draws no strip.
     */
    strip?: import("svelte").ComponentProps<typeof StoryOverviewStrip> | null;
    /**
     * The selected turn, character, journey or relationship. Bindable.
     */
    selected?: import("./lib/story-overview.js").OverviewSelection | null;
    /**
     * Told what was selected; null when the side pane is closed.
     */
    onselect?: (item: import("./lib/story-overview.js").OverviewSelection | null) => void;
    /**
     * As StoryOverviewSide takes it.
     */
    onRevealScene?: (sceneId: string) => void;
};
import StoryOverviewStrip from './StoryOverviewStrip.svelte';

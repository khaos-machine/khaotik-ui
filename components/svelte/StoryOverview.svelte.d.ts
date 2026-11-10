export default StoryOverview;
type StoryOverview = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StoryOverview: import("svelte").Component<{
    /**
     * The project's title.
     */
    title?: string;
    /**
     * `GET /api/v1/premise`'s `premise`.
     */
    premise?: import("./lib/story-overview.js").SectionRead<import("./lib/story-overview.js").StoryPremise>;
    /**
     * `GET /api/v1/structure`.
     */
    structure?: import("./lib/story-overview.js").SectionRead<import("./lib/story-overview.js").StoryStructure>;
    /**
     * `GET /api/v1/coverage/report`.
     */
    coverage?: import("./lib/story-overview.js").SectionRead<Record<string, any>>;
    /**
     * `GET /api/v1/journeys`'s `journeys`: each character's journey, in story order.
     */
    journeys?: import("./lib/story-overview.js").SectionRead<readonly Record<string, any>[]>;
    /**
     * `GET /api/v1/relationships`'s `relationships`: each pair, read or skipped.
     */
    relationships?: import("./lib/story-overview.js").SectionRead<readonly Record<string, any>[]>;
    /**
     * Advanced mode: models, confidence, lens scores and warnings.
     */
    advanced?: boolean;
    /**
     * The selected turn, character, journey or relationship, including skipped pairs.
     */
    selected?: import("./lib/story-overview.js").OverviewSelection | null;
    /**
     * Reports the selected entity's original list index.
     */
    onselect?: (item: import("./lib/story-overview.js").OverviewSelection) => void;
    /**
     * Each section's run action, one click each; the story budget bounds paid runs, so nothing asks first. Journeys and relationships have no action: their run only says when the pass is partial or failed, beside whatever was saved.
     */
    runs?: {
        premise?: {
            kind: "none";
        } | ({
            kind: "offer";
        } & {
            paid: boolean;
            maxCalls?: number;
        }) | {
            kind: "needs-budget";
        } | {
            kind: "running";
            paid?: boolean;
            progress?: string;
        } | {
            kind: "blocked";
            reason: string;
        } | {
            kind: "budget-reached";
            usd?: string;
            spentUsd?: string;
            maxCalls?: number;
        } | {
            kind: "failed";
            message: string;
            offer?: {
                paid: boolean;
                maxCalls?: number;
            };
        } | {
            kind: "done";
            totals?: readonly {
                attempts: number;
                provider: string;
                model: string;
            }[];
            maxCalls?: number;
        };
        structure?: {
            kind: "none";
        } | ({
            kind: "offer";
        } & {
            paid: boolean;
            maxCalls?: number;
        }) | {
            kind: "needs-budget";
        } | {
            kind: "running";
            paid?: boolean;
            progress?: string;
        } | {
            kind: "blocked";
            reason: string;
        } | {
            kind: "budget-reached";
            usd?: string;
            spentUsd?: string;
            maxCalls?: number;
        } | {
            kind: "failed";
            message: string;
            offer?: {
                paid: boolean;
                maxCalls?: number;
            };
        } | {
            kind: "done";
            totals?: readonly {
                attempts: number;
                provider: string;
                model: string;
            }[];
            maxCalls?: number;
        };
        coverage?: {
            kind: "none";
        } | ({
            kind: "offer";
        } & {
            paid: boolean;
            maxCalls?: number;
        }) | {
            kind: "needs-budget";
        } | {
            kind: "running";
            paid?: boolean;
            progress?: string;
        } | {
            kind: "blocked";
            reason: string;
        } | {
            kind: "budget-reached";
            usd?: string;
            spentUsd?: string;
            maxCalls?: number;
        } | {
            kind: "failed";
            message: string;
            offer?: {
                paid: boolean;
                maxCalls?: number;
            };
        } | {
            kind: "done";
            totals?: readonly {
                attempts: number;
                provider: string;
                model: string;
            }[];
            maxCalls?: number;
        };
        journeys?: {
            kind: "none";
        } | {
            kind: "running";
        } | {
            kind: "partial";
        } | {
            kind: "failed";
            message?: string;
        };
        relationships?: {
            kind: "none";
        } | {
            kind: "running";
        } | {
            kind: "partial";
        } | {
            kind: "failed";
            message?: string;
        };
    };
    /**
     * Starts a pass: `structure` (free), `structureNaming`, `coverage` or `premise`.
     */
    onrun?: (pass: "structure" | "structureNaming" | "coverage" | "premise") => void;
    /**
     * Opens this story's budget.
     */
    onsetbudget?: () => void;
    /**
     * Skipped pairs as selectable rows with their reasons, outside Advanced. Off: they are listed only under Advanced's Show details, as in 0.178.5.
     */
    showSkippedPairs?: boolean;
    /**
     * The structure's acts in Shape.
     */
    showStructureActs?: boolean;
    /**
     * Coverage's acts.
     */
    showCoverageActs?: boolean;
    /**
     * Coverage's scene entries.
     */
    showSceneEntries?: boolean;
    /**
     * Coverage's Structure measured section.
     */
    showMeasuredStructure?: boolean;
    /**
     * A partial or failed journeys or relationships pass (`runs.journeys`, `runs.relationships`), and failed turn naming, each said in its section.
     */
    showPassStates?: boolean;
    /**
     * Says when nothing was scored or named: "No dimension was scored.", a lens's "Not scored", "No turning points were named.". Off: those parts draw nothing, or "haven't been named yet", as in 0.178.5.
     */
    showEmptyResults?: boolean;
}, {}, "">;
type Props = {
    /**
     * The project's title.
     */
    title?: string;
    /**
     * `GET /api/v1/premise`'s `premise`.
     */
    premise?: import("./lib/story-overview.js").SectionRead<import("./lib/story-overview.js").StoryPremise>;
    /**
     * `GET /api/v1/structure`.
     */
    structure?: import("./lib/story-overview.js").SectionRead<import("./lib/story-overview.js").StoryStructure>;
    /**
     * `GET /api/v1/coverage/report`.
     */
    coverage?: import("./lib/story-overview.js").SectionRead<Record<string, any>>;
    /**
     * `GET /api/v1/journeys`'s `journeys`: each character's journey, in story order.
     */
    journeys?: import("./lib/story-overview.js").SectionRead<readonly Record<string, any>[]>;
    /**
     * `GET /api/v1/relationships`'s `relationships`: each pair, read or skipped.
     */
    relationships?: import("./lib/story-overview.js").SectionRead<readonly Record<string, any>[]>;
    /**
     * Advanced mode: models, confidence, lens scores and warnings.
     */
    advanced?: boolean;
    /**
     * The selected turn, character, journey or relationship, including skipped pairs.
     */
    selected?: import("./lib/story-overview.js").OverviewSelection | null;
    /**
     * Reports the selected entity's original list index.
     */
    onselect?: (item: import("./lib/story-overview.js").OverviewSelection) => void;
    /**
     * Each section's run action, one click each; the story budget bounds paid runs, so nothing asks first. Journeys and relationships have no action: their run only says when the pass is partial or failed, beside whatever was saved.
     */
    runs?: {
        premise?: {
            kind: "none";
        } | ({
            kind: "offer";
        } & {
            paid: boolean;
            maxCalls?: number;
        }) | {
            kind: "needs-budget";
        } | {
            kind: "running";
            paid?: boolean;
            progress?: string;
        } | {
            kind: "blocked";
            reason: string;
        } | {
            kind: "budget-reached";
            usd?: string;
            spentUsd?: string;
            maxCalls?: number;
        } | {
            kind: "failed";
            message: string;
            offer?: {
                paid: boolean;
                maxCalls?: number;
            };
        } | {
            kind: "done";
            totals?: readonly {
                attempts: number;
                provider: string;
                model: string;
            }[];
            maxCalls?: number;
        };
        structure?: {
            kind: "none";
        } | ({
            kind: "offer";
        } & {
            paid: boolean;
            maxCalls?: number;
        }) | {
            kind: "needs-budget";
        } | {
            kind: "running";
            paid?: boolean;
            progress?: string;
        } | {
            kind: "blocked";
            reason: string;
        } | {
            kind: "budget-reached";
            usd?: string;
            spentUsd?: string;
            maxCalls?: number;
        } | {
            kind: "failed";
            message: string;
            offer?: {
                paid: boolean;
                maxCalls?: number;
            };
        } | {
            kind: "done";
            totals?: readonly {
                attempts: number;
                provider: string;
                model: string;
            }[];
            maxCalls?: number;
        };
        coverage?: {
            kind: "none";
        } | ({
            kind: "offer";
        } & {
            paid: boolean;
            maxCalls?: number;
        }) | {
            kind: "needs-budget";
        } | {
            kind: "running";
            paid?: boolean;
            progress?: string;
        } | {
            kind: "blocked";
            reason: string;
        } | {
            kind: "budget-reached";
            usd?: string;
            spentUsd?: string;
            maxCalls?: number;
        } | {
            kind: "failed";
            message: string;
            offer?: {
                paid: boolean;
                maxCalls?: number;
            };
        } | {
            kind: "done";
            totals?: readonly {
                attempts: number;
                provider: string;
                model: string;
            }[];
            maxCalls?: number;
        };
        journeys?: {
            kind: "none";
        } | {
            kind: "running";
        } | {
            kind: "partial";
        } | {
            kind: "failed";
            message?: string;
        };
        relationships?: {
            kind: "none";
        } | {
            kind: "running";
        } | {
            kind: "partial";
        } | {
            kind: "failed";
            message?: string;
        };
    };
    /**
     * Starts a pass: `structure` (free), `structureNaming`, `coverage` or `premise`.
     */
    onrun?: (pass: "structure" | "structureNaming" | "coverage" | "premise") => void;
    /**
     * Opens this story's budget.
     */
    onsetbudget?: () => void;
    /**
     * Skipped pairs as selectable rows with their reasons, outside Advanced. Off: they are listed only under Advanced's Show details, as in 0.178.5.
     */
    showSkippedPairs?: boolean;
    /**
     * The structure's acts in Shape.
     */
    showStructureActs?: boolean;
    /**
     * Coverage's acts.
     */
    showCoverageActs?: boolean;
    /**
     * Coverage's scene entries.
     */
    showSceneEntries?: boolean;
    /**
     * Coverage's Structure measured section.
     */
    showMeasuredStructure?: boolean;
    /**
     * A partial or failed journeys or relationships pass (`runs.journeys`, `runs.relationships`), and failed turn naming, each said in its section.
     */
    showPassStates?: boolean;
    /**
     * Says when nothing was scored or named: "No dimension was scored.", a lens's "Not scored", "No turning points were named.". Off: those parts draw nothing, or "haven't been named yet", as in 0.178.5.
     */
    showEmptyResults?: boolean;
};

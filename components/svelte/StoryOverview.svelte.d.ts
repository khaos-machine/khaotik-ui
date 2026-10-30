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
     * The selected turn or character.
     */
    selected?: import("./lib/story-overview.js").OverviewSelection | null;
    /**
     * Reports a turn or character chosen.
     */
    onselect?: (item: import("./lib/story-overview.js").OverviewSelection) => void;
    /**
     * Each section's run action, one click each; the story budget bounds paid runs, so nothing asks first.
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
    };
    /**
     * Starts a pass: `structure` (free), `structureNaming`, `coverage` or `premise`.
     */
    onrun?: (pass: "structure" | "structureNaming" | "coverage" | "premise") => void;
    /**
     * Opens this story's budget.
     */
    onsetbudget?: () => void;
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
     * The selected turn or character.
     */
    selected?: import("./lib/story-overview.js").OverviewSelection | null;
    /**
     * Reports a turn or character chosen.
     */
    onselect?: (item: import("./lib/story-overview.js").OverviewSelection) => void;
    /**
     * Each section's run action, one click each; the story budget bounds paid runs, so nothing asks first.
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
    };
    /**
     * Starts a pass: `structure` (free), `structureNaming`, `coverage` or `premise`.
     */
    onrun?: (pass: "structure" | "structureNaming" | "coverage" | "premise") => void;
    /**
     * Opens this story's budget.
     */
    onsetbudget?: () => void;
};

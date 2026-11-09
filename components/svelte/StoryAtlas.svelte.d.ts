export default StoryAtlas;
type StoryAtlas = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StoryAtlas: import("svelte").Component<{
    /**
     * khaosd's Story Atlas v1; null until it has been read.
     */
    atlas?: {
        lenses: Record<"scene" | "location" | "character" | "all", {
            nodes: readonly any[];
            edges: readonly any[];
        }>;
        neighborhoods: Record<string, {
            nodes: readonly any[];
            edges: readonly any[];
        }>;
        locationGroups: readonly {
            id: string;
            label: string;
            memberIds: readonly string[];
        }[];
    } | null;
    /**
     * Resolved portrait URLs, keyed by node id.
     */
    portraitUrls?: Record<string, string>;
    /**
     * Why the atlas could not be read, or ''.
     */
    error?: string;
    /**
     * The atlas is being read.
     */
    refreshing?: boolean;
    /**
     * Asks for the atlas again.
     */
    onRetry?: () => void;
    /**
     * Whether the atlas is on screen; the keyboard and renderer wait while it is not.
     */
    active?: boolean;
    /**
     * The lens shown.
     */
    lens?: "scene" | "location" | "character" | "all";
    /**
     * The layout the atlas opens in. The layout picker changes it from there.
     */
    initialLayout?: "location-clusters" | "entity-regions" | "constellation" | "scene-spine" | "neighborhood";
    /**
     * Reports a lens chosen (keys 1 to 4).
     */
    onLensChange?: (lens: "scene" | "location" | "character" | "all") => void;
    /**
     * Changing it returns the camera to the overview.
     */
    cameraKey?: number;
    /**
     * The record the host has selected, or ''.
     */
    selectedRecordId?: string;
    /**
     * Reports a node chosen, as the destination that holds it.
     */
    onSelectRecord?: (at: {
        destination: "characters" | "places" | "scenes";
        select: string;
    }) => void;
    /**
     * Asks to open a node's record.
     */
    onReveal?: (at: {
        destination: "characters" | "places" | "scenes";
        select: string;
    }) => void;
    /**
     * Offered on a character when set.
     */
    onBuildAppearance?: (characterId: string) => void;
    /**
     * Offered on a place when set.
     */
    onDesignPlace?: (placeId: string) => void;
    /**
     * Called once the renderer has started.
     */
    onready?: () => void;
    /**
     * Shows the renderer's diagnostics.
     */
    diagnostics?: boolean;
    /**
     * Shows the activity panel.
     */
    activityOpen?: boolean;
    /**
     * Reports the activity panel opened or closed.
     */
    onActivityChange?: (open: boolean) => void;
    /**
     * Asks for the activity window.
     */
    onOpenActivity?: () => void;
    /**
     * The story's jobs.
     */
    jobs?: readonly {
        id: string;
        type: string;
        status: string;
        progress?: {
            completed: number;
            total: number;
        };
        error?: string;
    }[];
    /**
     * The jobs feed is reconnecting.
     */
    jobsStale?: boolean;
    /**
     * The committed-changes read. `unsupported`: this khaosd cannot read the history a page at a time, with or without a query (#46).
     */
    activity?: {
        kind: "loading";
    } | {
        kind: "missing";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "unsupported";
    } | {
        kind: "loaded";
    };
    /**
     * The committed changes, as EventLog takes them.
     */
    events?: readonly any[];
    /**
     * Pages the committed changes (#40): `events` are the loaded rows, counts come from the feed's totals. Absent: `events` is the whole log, as before.
     */
    activityFeed?: import("./lib/activity.js").ActivityFeed;
    /**
     * The khaosd search the loaded changes answer, or ''.
     */
    activityQuery?: string;
    /**
     * Reports the search typed. Set, the panel draws a search field.
     */
    onActivityQuery?: (query: string) => void;
    /**
     * With `activityFeed`: asks for the next older page, or retries a failed one.
     */
    onActivityLoadOlder?: () => void;
    /**
     * With `activityFeed`: retries a failed read of newer changes.
     */
    onActivityRefresh?: () => void;
}, {}, "">;
type Props = {
    /**
     * khaosd's Story Atlas v1; null until it has been read.
     */
    atlas?: {
        lenses: Record<"scene" | "location" | "character" | "all", {
            nodes: readonly any[];
            edges: readonly any[];
        }>;
        neighborhoods: Record<string, {
            nodes: readonly any[];
            edges: readonly any[];
        }>;
        locationGroups: readonly {
            id: string;
            label: string;
            memberIds: readonly string[];
        }[];
    } | null;
    /**
     * Resolved portrait URLs, keyed by node id.
     */
    portraitUrls?: Record<string, string>;
    /**
     * Why the atlas could not be read, or ''.
     */
    error?: string;
    /**
     * The atlas is being read.
     */
    refreshing?: boolean;
    /**
     * Asks for the atlas again.
     */
    onRetry?: () => void;
    /**
     * Whether the atlas is on screen; the keyboard and renderer wait while it is not.
     */
    active?: boolean;
    /**
     * The lens shown.
     */
    lens?: "scene" | "location" | "character" | "all";
    /**
     * The layout the atlas opens in. The layout picker changes it from there.
     */
    initialLayout?: "location-clusters" | "entity-regions" | "constellation" | "scene-spine" | "neighborhood";
    /**
     * Reports a lens chosen (keys 1 to 4).
     */
    onLensChange?: (lens: "scene" | "location" | "character" | "all") => void;
    /**
     * Changing it returns the camera to the overview.
     */
    cameraKey?: number;
    /**
     * The record the host has selected, or ''.
     */
    selectedRecordId?: string;
    /**
     * Reports a node chosen, as the destination that holds it.
     */
    onSelectRecord?: (at: {
        destination: "characters" | "places" | "scenes";
        select: string;
    }) => void;
    /**
     * Asks to open a node's record.
     */
    onReveal?: (at: {
        destination: "characters" | "places" | "scenes";
        select: string;
    }) => void;
    /**
     * Offered on a character when set.
     */
    onBuildAppearance?: (characterId: string) => void;
    /**
     * Offered on a place when set.
     */
    onDesignPlace?: (placeId: string) => void;
    /**
     * Called once the renderer has started.
     */
    onready?: () => void;
    /**
     * Shows the renderer's diagnostics.
     */
    diagnostics?: boolean;
    /**
     * Shows the activity panel.
     */
    activityOpen?: boolean;
    /**
     * Reports the activity panel opened or closed.
     */
    onActivityChange?: (open: boolean) => void;
    /**
     * Asks for the activity window.
     */
    onOpenActivity?: () => void;
    /**
     * The story's jobs.
     */
    jobs?: readonly {
        id: string;
        type: string;
        status: string;
        progress?: {
            completed: number;
            total: number;
        };
        error?: string;
    }[];
    /**
     * The jobs feed is reconnecting.
     */
    jobsStale?: boolean;
    /**
     * The committed-changes read. `unsupported`: this khaosd cannot read the history a page at a time, with or without a query (#46).
     */
    activity?: {
        kind: "loading";
    } | {
        kind: "missing";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "unsupported";
    } | {
        kind: "loaded";
    };
    /**
     * The committed changes, as EventLog takes them.
     */
    events?: readonly any[];
    /**
     * Pages the committed changes (#40): `events` are the loaded rows, counts come from the feed's totals. Absent: `events` is the whole log, as before.
     */
    activityFeed?: import("./lib/activity.js").ActivityFeed;
    /**
     * The khaosd search the loaded changes answer, or ''.
     */
    activityQuery?: string;
    /**
     * Reports the search typed. Set, the panel draws a search field.
     */
    onActivityQuery?: (query: string) => void;
    /**
     * With `activityFeed`: asks for the next older page, or retries a failed one.
     */
    onActivityLoadOlder?: () => void;
    /**
     * With `activityFeed`: retries a failed read of newer changes.
     */
    onActivityRefresh?: () => void;
};

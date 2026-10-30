export default WelcomeWindow;
type WelcomeWindow = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const WelcomeWindow: import("svelte").Component<{
    /**
     * The engine's readings, as `EngineDetails` takes them.
     */
    engine?: {
        state?: string;
        components?: readonly any[];
        appVersion?: string;
        daemonVersion?: string;
        wflAvailable?: boolean;
    };
    /**
     * The routed capabilities, as `EngineDetails` takes them.
     */
    routes?: readonly any[];
    /**
     * The on-device engines, as `EngineDetails` takes them. **Omit it and the "On-device engines" plate is absent**; an empty list keeps the plate with "No on-device engines" (a host on a path with no local engines omits it).
     */
    services?: readonly any[];
    /**
     * The stories, in the order to list them; an importing one first.
     */
    projects?: readonly import("./lib/types.js").Project[];
    /**
     * The job running on a story, if any.
     */
    jobFor?: (project: import("./lib/types.js").Project) => (import("./lib/types.js").ProjectJob | undefined);
    /**
     * What the host knows of a story's three analyses, as ProjectCard `analyses` takes it.
     */
    analysesFor?: (project: import("./lib/types.js").Project) => (readonly import("./lib/types.js").ProjectAnalysis[] | undefined);
    /**
     * Cover art per story; nothing keeps the card's monogram.
     */
    coverFor?: (project: import("./lib/types.js").Project) => ({
        src?: string;
        srcset?: string;
    } | undefined);
    /**
     * Rail action. Disabled when omitted.
     */
    onImport?: (event: MouseEvent) => void;
    /**
     * Rail action, the browse-for-a-bundle verb. Disabled when omitted.
     */
    onOpen?: (event: MouseEvent) => void;
    /**
     * Rail action. Disabled when omitted.
     */
    onClone?: (event: MouseEvent) => void;
    /**
     * Whether the Clone action is there at all. Default true; **false makes it absent**, not disabled.
     */
    clone?: boolean;
    /**
     * Rail action that opens the host's Settings. **Absent when omitted**, not disabled: a host without a Settings window offers none.
     */
    onSettings?: (event: MouseEvent) => void;
    /**
     * Reloads the list. Hidden when omitted.
     */
    onRefresh?: () => void;
    /**
     * A story card being activated.
     */
    onOpenProject?: (project: import("./lib/types.js").Project) => void;
    /**
     * The card's extraction verb. Hidden when omitted.
     */
    onExtractProject?: (project: import("./lib/types.js").Project) => void;
    /**
     * The card's "initialise a repo" verb, for a story without one. Hidden when omitted.
     */
    onInitGit?: (project: import("./lib/types.js").Project) => void;
    /**
     * The card's **Remove from Recents** verb. It never deletes a project, so it needs no confirmation (project portability plan, D1). Hidden when omitted.
     */
    onRemoveProject?: (project: import("./lib/types.js").Project) => void;
    /**
     * Per-card host content, given that story's project and rendered as its ProjectCard `children`.
     */
    detail?: import("svelte").Snippet<[import("./lib/types.js").Project]>;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The engine's readings, as `EngineDetails` takes them.
     */
    engine?: {
        state?: string;
        components?: readonly any[];
        appVersion?: string;
        daemonVersion?: string;
        wflAvailable?: boolean;
    };
    /**
     * The routed capabilities, as `EngineDetails` takes them.
     */
    routes?: readonly any[];
    /**
     * The on-device engines, as `EngineDetails` takes them. **Omit it and the "On-device engines" plate is absent**; an empty list keeps the plate with "No on-device engines" (a host on a path with no local engines omits it).
     */
    services?: readonly any[];
    /**
     * The stories, in the order to list them; an importing one first.
     */
    projects?: readonly import("./lib/types.js").Project[];
    /**
     * The job running on a story, if any.
     */
    jobFor?: (project: import("./lib/types.js").Project) => (import("./lib/types.js").ProjectJob | undefined);
    /**
     * What the host knows of a story's three analyses, as ProjectCard `analyses` takes it.
     */
    analysesFor?: (project: import("./lib/types.js").Project) => (readonly import("./lib/types.js").ProjectAnalysis[] | undefined);
    /**
     * Cover art per story; nothing keeps the card's monogram.
     */
    coverFor?: (project: import("./lib/types.js").Project) => ({
        src?: string;
        srcset?: string;
    } | undefined);
    /**
     * Rail action. Disabled when omitted.
     */
    onImport?: (event: MouseEvent) => void;
    /**
     * Rail action, the browse-for-a-bundle verb. Disabled when omitted.
     */
    onOpen?: (event: MouseEvent) => void;
    /**
     * Rail action. Disabled when omitted.
     */
    onClone?: (event: MouseEvent) => void;
    /**
     * Whether the Clone action is there at all. Default true; **false makes it absent**, not disabled.
     */
    clone?: boolean;
    /**
     * Rail action that opens the host's Settings. **Absent when omitted**, not disabled: a host without a Settings window offers none.
     */
    onSettings?: (event: MouseEvent) => void;
    /**
     * Reloads the list. Hidden when omitted.
     */
    onRefresh?: () => void;
    /**
     * A story card being activated.
     */
    onOpenProject?: (project: import("./lib/types.js").Project) => void;
    /**
     * The card's extraction verb. Hidden when omitted.
     */
    onExtractProject?: (project: import("./lib/types.js").Project) => void;
    /**
     * The card's "initialise a repo" verb, for a story without one. Hidden when omitted.
     */
    onInitGit?: (project: import("./lib/types.js").Project) => void;
    /**
     * The card's **Remove from Recents** verb. It never deletes a project, so it needs no confirmation (project portability plan, D1). Hidden when omitted.
     */
    onRemoveProject?: (project: import("./lib/types.js").Project) => void;
    /**
     * Per-card host content, given that story's project and rendered as its ProjectCard `children`.
     */
    detail?: import("svelte").Snippet<[import("./lib/types.js").Project]>;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};

export default SettingsWindow;
type SettingsWindow = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SettingsWindow: import("svelte").Component<{
    /**
     * The categories, in order.
     */
    panes?: readonly {
        id: string;
        label: string;
        icon?: string;
    }[];
    /**
     * The pane being shown.
     */
    pane?: string;
    /**
     * A category was chosen.
     */
    onSelectPane?: (id: string) => void;
    /**
     * The engine's settings read; a failure is the engine's own words. Not `state`: a prop by that name turns every $state(...) here into a store read.
     */
    status?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * Providers' Basic or Advanced chooser, or null when only one is offered.
     */
    path?: {
        path: string | null;
        options: readonly {
            value: string;
            title: string;
            caption: string;
        }[];
        advancedCaption: string;
        saving: boolean;
        error: string;
        advanced: boolean;
        history: boolean;
        gitSync: boolean;
        featureSaving: boolean;
        featureError: string;
        needed: readonly any[];
        installable: readonly string[];
    } | null;
    /**
     * A path was chosen; switching to Advanced is confirmed first.
     */
    onChoosePath?: (path: string) => void;
    /**
     * Switching to Advanced was agreed to.
     */
    onConfirmAdvanced?: () => void;
    /**
     * Switching to Advanced was turned down.
     */
    onCancelPath?: () => void;
    /**
     * The switch to Advanced is being asked.
     */
    confirmingAdvanced?: boolean;
    /**
     * An Advanced switch was turned.
     */
    onToggleFeature?: (feature: "history" | "gitSync", on: boolean) => void;
    /**
     * An install asked for from what the switches need.
     */
    onInstallNeeded?: (itemId: string) => void;
    /**
     * The configurations offered, or null when none are served.
     */
    configurations?: {
        basic: boolean;
        options: readonly {
            id: string;
            title: string;
            caption: string;
            applied: boolean;
        }[];
        saving: boolean;
        canShare: boolean;
        notice: string;
        error: string;
    } | null;
    /**
     * Applies one; `start` under Advanced. Resolves true once saved.
     */
    onApplyConfiguration?: (id: string, start: boolean) => Promise<boolean> | boolean;
    /**
     * Export… with the name typed; the engine builds the record.
     */
    onExportConfiguration?: (name: string) => void;
    /**
     * Import…; the engine judges what is imported.
     */
    onImportConfiguration?: () => void;
    /**
     * The host's providers view, under the path and configuration.
     */
    providers?: import("svelte").Snippet | undefined;
    /**
     * Routing's rows, by kind; a group with no title has no heading.
     */
    routing?: readonly {
        id: string;
        title: string;
        rows: readonly {
            id: string;
            label: string;
            enabled: boolean;
            providerTitle: string;
            modelLabel: string;
            routeLabel: string;
            tone: import("./lib/types.js").StatusTone;
            quietModel: boolean;
            note: string;
            error: string;
            control: {
                kind: "grouped";
                groups: readonly {
                    title: string;
                    options: readonly {
                        key: string;
                        label: string;
                        disabled: boolean;
                    }[];
                }[];
                selectedKey: string;
            } | {
                kind: "two-select";
                providers: readonly {
                    id: string;
                    title: string;
                    disabled: boolean;
                }[];
                provider: string;
                models: readonly {
                    id: string;
                    title: string;
                    recommended?: boolean;
                }[];
                model: string;
                busy: boolean;
            } | {
                kind: "read-only";
            } | {
                kind: "invalid";
            };
        }[];
    }[];
    /**
     * A routing save is in flight: every picker waits.
     */
    routingSaving?: boolean;
    /**
     * A grouped row's choice, which is the save.
     */
    onChooseRoute?: (capabilityId: string, key: string) => Promise<void> | void;
    /**
     * The older pair's provider was chosen.
     */
    onChooseProvider?: (capabilityId: string, providerId: string) => void;
    /**
     * The older pair's model was chosen, which is the save.
     */
    onChooseModel?: (capabilityId: string, modelId: string) => void;
    /**
     * On-device engines, as the engine lists them.
     */
    engines?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
        rows: readonly any[];
    };
    /**
     * Checks before a setup, and the setup in flight.
     */
    setupCards?: readonly ({
        kind: "preflight";
        id: string;
        name: string;
        steps: readonly {
            name: string;
            state?: string;
            detail?: string;
        }[];
    } | {
        kind: "run";
        id: string;
        name: string;
        busy: boolean;
    })[];
    /**
     * The engine whose action is in flight.
     */
    pendingId?: string;
    /**
     * What the wait means, beside the row in flight; '' for none.
     */
    pendingMessage?: string;
    /**
     * What the engine said when an action failed; '' for none.
     */
    actionError?: string;
    /**
     * Some engines are not installed: say what setting one up costs.
     */
    provisionNote?: boolean;
    /**
     * Start an engine.
     */
    onStartEngine?: (id: string) => void;
    /**
     * Stop an engine.
     */
    onStopEngine?: (id: string) => void;
    /**
     * Set up was agreed to, after the confirmation here.
     */
    onProvisionEngine?: (id: string) => void;
    /**
     * An engine's Start with Khaos switch was turned.
     */
    onStartWithKhaos?: (id: string, on: boolean) => void;
    /**
     * The host's models view.
     */
    models?: import("svelte").Snippet | undefined;
    /**
     * The engine this window talks to; uptime '' when it cannot be told.
     */
    engine?: {
        version: string;
        host: string;
        port: number | string;
        pid: number | string;
        uptime: string;
    };
    /**
     * The appearances General offers.
     */
    appearances?: readonly {
        value: string;
        label: string;
    }[];
    /**
     * This window's appearance.
     */
    appearance?: string;
    /**
     * An appearance was chosen, for every window.
     */
    onAppearance?: (value: string) => void;
    /**
     * The app's own version.
     */
    appVersion?: string;
    /**
     * A tool install being asked, or null.
     */
    confirmTool?: {
        name: string;
        description: string;
    } | null;
    /**
     * The tool install was agreed to.
     */
    onConfirmTool?: () => void;
    /**
     * The tool install was turned down.
     */
    onCancelTool?: () => void;
}, {}, "">;
type Props = {
    /**
     * The categories, in order.
     */
    panes?: readonly {
        id: string;
        label: string;
        icon?: string;
    }[];
    /**
     * The pane being shown.
     */
    pane?: string;
    /**
     * A category was chosen.
     */
    onSelectPane?: (id: string) => void;
    /**
     * The engine's settings read; a failure is the engine's own words. Not `state`: a prop by that name turns every $state(...) here into a store read.
     */
    status?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * Providers' Basic or Advanced chooser, or null when only one is offered.
     */
    path?: {
        path: string | null;
        options: readonly {
            value: string;
            title: string;
            caption: string;
        }[];
        advancedCaption: string;
        saving: boolean;
        error: string;
        advanced: boolean;
        history: boolean;
        gitSync: boolean;
        featureSaving: boolean;
        featureError: string;
        needed: readonly any[];
        installable: readonly string[];
    } | null;
    /**
     * A path was chosen; switching to Advanced is confirmed first.
     */
    onChoosePath?: (path: string) => void;
    /**
     * Switching to Advanced was agreed to.
     */
    onConfirmAdvanced?: () => void;
    /**
     * Switching to Advanced was turned down.
     */
    onCancelPath?: () => void;
    /**
     * The switch to Advanced is being asked.
     */
    confirmingAdvanced?: boolean;
    /**
     * An Advanced switch was turned.
     */
    onToggleFeature?: (feature: "history" | "gitSync", on: boolean) => void;
    /**
     * An install asked for from what the switches need.
     */
    onInstallNeeded?: (itemId: string) => void;
    /**
     * The configurations offered, or null when none are served.
     */
    configurations?: {
        basic: boolean;
        options: readonly {
            id: string;
            title: string;
            caption: string;
            applied: boolean;
        }[];
        saving: boolean;
        canShare: boolean;
        notice: string;
        error: string;
    } | null;
    /**
     * Applies one; `start` under Advanced. Resolves true once saved.
     */
    onApplyConfiguration?: (id: string, start: boolean) => Promise<boolean> | boolean;
    /**
     * Export… with the name typed; the engine builds the record.
     */
    onExportConfiguration?: (name: string) => void;
    /**
     * Import…; the engine judges what is imported.
     */
    onImportConfiguration?: () => void;
    /**
     * The host's providers view, under the path and configuration.
     */
    providers?: import("svelte").Snippet | undefined;
    /**
     * Routing's rows, by kind; a group with no title has no heading.
     */
    routing?: readonly {
        id: string;
        title: string;
        rows: readonly {
            id: string;
            label: string;
            enabled: boolean;
            providerTitle: string;
            modelLabel: string;
            routeLabel: string;
            tone: import("./lib/types.js").StatusTone;
            quietModel: boolean;
            note: string;
            error: string;
            control: {
                kind: "grouped";
                groups: readonly {
                    title: string;
                    options: readonly {
                        key: string;
                        label: string;
                        disabled: boolean;
                    }[];
                }[];
                selectedKey: string;
            } | {
                kind: "two-select";
                providers: readonly {
                    id: string;
                    title: string;
                    disabled: boolean;
                }[];
                provider: string;
                models: readonly {
                    id: string;
                    title: string;
                    recommended?: boolean;
                }[];
                model: string;
                busy: boolean;
            } | {
                kind: "read-only";
            } | {
                kind: "invalid";
            };
        }[];
    }[];
    /**
     * A routing save is in flight: every picker waits.
     */
    routingSaving?: boolean;
    /**
     * A grouped row's choice, which is the save.
     */
    onChooseRoute?: (capabilityId: string, key: string) => Promise<void> | void;
    /**
     * The older pair's provider was chosen.
     */
    onChooseProvider?: (capabilityId: string, providerId: string) => void;
    /**
     * The older pair's model was chosen, which is the save.
     */
    onChooseModel?: (capabilityId: string, modelId: string) => void;
    /**
     * On-device engines, as the engine lists them.
     */
    engines?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
        rows: readonly any[];
    };
    /**
     * Checks before a setup, and the setup in flight.
     */
    setupCards?: readonly ({
        kind: "preflight";
        id: string;
        name: string;
        steps: readonly {
            name: string;
            state?: string;
            detail?: string;
        }[];
    } | {
        kind: "run";
        id: string;
        name: string;
        busy: boolean;
    })[];
    /**
     * The engine whose action is in flight.
     */
    pendingId?: string;
    /**
     * What the wait means, beside the row in flight; '' for none.
     */
    pendingMessage?: string;
    /**
     * What the engine said when an action failed; '' for none.
     */
    actionError?: string;
    /**
     * Some engines are not installed: say what setting one up costs.
     */
    provisionNote?: boolean;
    /**
     * Start an engine.
     */
    onStartEngine?: (id: string) => void;
    /**
     * Stop an engine.
     */
    onStopEngine?: (id: string) => void;
    /**
     * Set up was agreed to, after the confirmation here.
     */
    onProvisionEngine?: (id: string) => void;
    /**
     * An engine's Start with Khaos switch was turned.
     */
    onStartWithKhaos?: (id: string, on: boolean) => void;
    /**
     * The host's models view.
     */
    models?: import("svelte").Snippet | undefined;
    /**
     * The engine this window talks to; uptime '' when it cannot be told.
     */
    engine?: {
        version: string;
        host: string;
        port: number | string;
        pid: number | string;
        uptime: string;
    };
    /**
     * The appearances General offers.
     */
    appearances?: readonly {
        value: string;
        label: string;
    }[];
    /**
     * This window's appearance.
     */
    appearance?: string;
    /**
     * An appearance was chosen, for every window.
     */
    onAppearance?: (value: string) => void;
    /**
     * The app's own version.
     */
    appVersion?: string;
    /**
     * A tool install being asked, or null.
     */
    confirmTool?: {
        name: string;
        description: string;
    } | null;
    /**
     * The tool install was agreed to.
     */
    onConfirmTool?: () => void;
    /**
     * The tool install was turned down.
     */
    onCancelTool?: () => void;
};

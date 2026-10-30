export default Setup;
type Setup = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Setup: import("svelte").Component<{
    /**
     * The full checklist, shown under Show details.
     */
    sections?: readonly {
        id: string;
        title: string;
        items: readonly any[];
        installable?: readonly string[];
        emptyLabel?: string;
    }[];
    /**
     * A script to run by hand, shown and copied, never run here; '' for none.
     */
    installScript?: string;
    /**
     * An install asked for from the checklist.
     */
    onInstall?: (sectionId: string, itemId: string) => void;
    /**
     * Copies the script; the host owns the clipboard.
     */
    onCopyScript?: () => void;
    /**
     * The install confirmation, or null when nothing is asked.
     */
    confirm?: {
        target: string;
        description: string;
        bulk: boolean;
        methods?: readonly {
            id: string;
            label: string;
        }[];
        method?: string | null;
    } | null;
    /**
     * The install was agreed to.
     */
    onConfirm?: () => void;
    /**
     * The confirmation was turned down or closed.
     */
    onCancel?: () => void;
    /**
     * Another way to install it, which changes the command agreed to.
     */
    onChooseMethod?: (methodId: string) => void;
    /**
     * The simple view's count of ready items.
     */
    ready?: number;
    /**
     * How many items the count is out of.
     */
    total?: number;
    /**
     * Something required is missing: the count reads as an alarm.
     */
    requiredMissing?: boolean;
    /**
     * A sentence beside the count when the check itself did not happen; '' for none.
     */
    standing?: string;
    /**
     * When the engine last checked, in the reader's time; '' for none.
     */
    probedLabel?: string;
    /**
     * Whether Check system again has anything to check.
     */
    canProbe?: boolean;
    /**
     * A check is running.
     */
    probing?: boolean;
    /**
     * Offers Install required: the engine reports required items it can install.
     */
    installRequired?: boolean;
    /**
     * What the engine said when it refused an install; '' for none.
     */
    refusal?: string;
    /**
     * The simple view: one plain row per section.
     */
    digest?: readonly {
        id: string;
        title: string;
        purpose: string;
        status: string;
        settled: boolean;
        ready: number;
        total: number;
    }[];
    /**
     * Check system again.
     */
    onProbe?: () => void;
    /**
     * Install required: every required item at once, after one confirmation.
     */
    onInstallRequired?: () => void;
    /**
     * The refusal was read.
     */
    onDismissRefusal?: () => void;
    /**
     * The onboarding steps, or null for the simple view.
     */
    onboarding?: {
        view: "path" | "configuration" | "preference" | "features" | "connect" | "summary";
        /**
         * A step opened from the summary, not the first walk through.
         */
        changing: boolean;
        stepAt: number;
        stepCount: number;
        /**
         * What the engine said when it refused to save, in its words.
         */
        refusal: string | null;
        saving: boolean;
        path: {
            choice: string;
            options: readonly {
                value: string;
                title: string;
                caption: string;
            }[];
        } | null;
        /**
         * Each option's caption, and the longer one Show details asks for.
         */
        configuration: {
            choice: string;
            options: readonly ({
                value: string;
                title: string;
                caption: string;
            } & {
                detailedCaption: string;
            })[];
        } | null;
        preference: {
            choice: string;
            options: readonly {
                value: string;
                title: string;
                caption: string;
            }[];
            note: string;
            because: readonly string[];
        };
        features: readonly {
            id: string;
            title: string;
            caption: string;
            locked: boolean;
            checked: boolean;
            cloudOnly: boolean;
        }[];
        /**
         * `preferenceTitle` null hides the row: under Basic the location is not asked.
         */
        summary: {
            pathTitle: string | null;
            canChangePath: boolean;
            preferenceTitle: string | null;
            turnedOn: string;
            connections: string;
            deviceTitle: string;
            device: string;
        };
    } | null;
    /**
     * A path was chosen; nothing is saved until Continue.
     */
    onChoosePath?: (value: string) => void;
    /**
     * A configuration was chosen; nothing is saved until Continue.
     */
    onChooseConfiguration?: (value: string) => void;
    /**
     * How to run AI was chosen; nothing is saved until Continue.
     */
    onChoosePreference?: (value: string) => void;
    /**
     * A feature was turned on or off.
     */
    onToggleFeature?: (featureId: string, on: boolean) => void;
    /**
     * A summary row's Change….
     */
    onChangeStep?: (view: "path" | "preference" | "features") => void;
    /**
     * The Connections row's Manage….
     */
    onManage?: () => void;
    /**
     * The step before.
     */
    onBack?: () => void;
    /**
     * Cancel on a step opened from the summary.
     */
    onCancelChange?: () => void;
    /**
     * Skip for now.
     */
    onSkip?: () => void;
    /**
     * Saves this step and goes to the next.
     */
    onContinue?: () => void;
    /**
     * Done on the connect step: what is still to connect waits on the summary.
     */
    onConnectDone?: () => void;
    /**
     * Done on the summary: closes the window.
     */
    onDone?: () => void;
    /**
     * The connect step, drawn by the host.
     */
    connect?: import("svelte").Snippet | undefined;
}, {}, "">;
type Props = {
    /**
     * The full checklist, shown under Show details.
     */
    sections?: readonly {
        id: string;
        title: string;
        items: readonly any[];
        installable?: readonly string[];
        emptyLabel?: string;
    }[];
    /**
     * A script to run by hand, shown and copied, never run here; '' for none.
     */
    installScript?: string;
    /**
     * An install asked for from the checklist.
     */
    onInstall?: (sectionId: string, itemId: string) => void;
    /**
     * Copies the script; the host owns the clipboard.
     */
    onCopyScript?: () => void;
    /**
     * The install confirmation, or null when nothing is asked.
     */
    confirm?: {
        target: string;
        description: string;
        bulk: boolean;
        methods?: readonly {
            id: string;
            label: string;
        }[];
        method?: string | null;
    } | null;
    /**
     * The install was agreed to.
     */
    onConfirm?: () => void;
    /**
     * The confirmation was turned down or closed.
     */
    onCancel?: () => void;
    /**
     * Another way to install it, which changes the command agreed to.
     */
    onChooseMethod?: (methodId: string) => void;
    /**
     * The simple view's count of ready items.
     */
    ready?: number;
    /**
     * How many items the count is out of.
     */
    total?: number;
    /**
     * Something required is missing: the count reads as an alarm.
     */
    requiredMissing?: boolean;
    /**
     * A sentence beside the count when the check itself did not happen; '' for none.
     */
    standing?: string;
    /**
     * When the engine last checked, in the reader's time; '' for none.
     */
    probedLabel?: string;
    /**
     * Whether Check system again has anything to check.
     */
    canProbe?: boolean;
    /**
     * A check is running.
     */
    probing?: boolean;
    /**
     * Offers Install required: the engine reports required items it can install.
     */
    installRequired?: boolean;
    /**
     * What the engine said when it refused an install; '' for none.
     */
    refusal?: string;
    /**
     * The simple view: one plain row per section.
     */
    digest?: readonly {
        id: string;
        title: string;
        purpose: string;
        status: string;
        settled: boolean;
        ready: number;
        total: number;
    }[];
    /**
     * Check system again.
     */
    onProbe?: () => void;
    /**
     * Install required: every required item at once, after one confirmation.
     */
    onInstallRequired?: () => void;
    /**
     * The refusal was read.
     */
    onDismissRefusal?: () => void;
    /**
     * The onboarding steps, or null for the simple view.
     */
    onboarding?: {
        view: "path" | "configuration" | "preference" | "features" | "connect" | "summary";
        /**
         * A step opened from the summary, not the first walk through.
         */
        changing: boolean;
        stepAt: number;
        stepCount: number;
        /**
         * What the engine said when it refused to save, in its words.
         */
        refusal: string | null;
        saving: boolean;
        path: {
            choice: string;
            options: readonly {
                value: string;
                title: string;
                caption: string;
            }[];
        } | null;
        /**
         * Each option's caption, and the longer one Show details asks for.
         */
        configuration: {
            choice: string;
            options: readonly ({
                value: string;
                title: string;
                caption: string;
            } & {
                detailedCaption: string;
            })[];
        } | null;
        preference: {
            choice: string;
            options: readonly {
                value: string;
                title: string;
                caption: string;
            }[];
            note: string;
            because: readonly string[];
        };
        features: readonly {
            id: string;
            title: string;
            caption: string;
            locked: boolean;
            checked: boolean;
            cloudOnly: boolean;
        }[];
        /**
         * `preferenceTitle` null hides the row: under Basic the location is not asked.
         */
        summary: {
            pathTitle: string | null;
            canChangePath: boolean;
            preferenceTitle: string | null;
            turnedOn: string;
            connections: string;
            deviceTitle: string;
            device: string;
        };
    } | null;
    /**
     * A path was chosen; nothing is saved until Continue.
     */
    onChoosePath?: (value: string) => void;
    /**
     * A configuration was chosen; nothing is saved until Continue.
     */
    onChooseConfiguration?: (value: string) => void;
    /**
     * How to run AI was chosen; nothing is saved until Continue.
     */
    onChoosePreference?: (value: string) => void;
    /**
     * A feature was turned on or off.
     */
    onToggleFeature?: (featureId: string, on: boolean) => void;
    /**
     * A summary row's Change….
     */
    onChangeStep?: (view: "path" | "preference" | "features") => void;
    /**
     * The Connections row's Manage….
     */
    onManage?: () => void;
    /**
     * The step before.
     */
    onBack?: () => void;
    /**
     * Cancel on a step opened from the summary.
     */
    onCancelChange?: () => void;
    /**
     * Skip for now.
     */
    onSkip?: () => void;
    /**
     * Saves this step and goes to the next.
     */
    onContinue?: () => void;
    /**
     * Done on the connect step: what is still to connect waits on the summary.
     */
    onConnectDone?: () => void;
    /**
     * Done on the summary: closes the window.
     */
    onDone?: () => void;
    /**
     * The connect step, drawn by the host.
     */
    connect?: import("svelte").Snippet | undefined;
};

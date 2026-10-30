export default InstallList;
type InstallList = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const InstallList: import("svelte").Component<{
    /**
     * The rows, in the host's order.
     */
    items?: readonly {
        /**
         * The engine's own id. What `installable` and `onInstall` speak in, and what seeds the icon's colour, so an item keeps its colour when its name changes.
         */
        id: string;
        /**
         * Display name. Falls back to `id`.
         */
        name?: string;
        /**
         * A Phosphor icon name drawn small beside the name. The host's: this component keeps no table from an id to a glyph. Absent draws nothing; the row's leading mark is its state, not its identity.
         */
        icon?: string;
        /**
         * One short line under the name: what having it gives you. The host picks the engine's words for it. One line, truncated: a row is not where a sentence is read.
         */
        tagline?: string;
        /**
         * `installed` is present. `available` is not present. `update` is present and older than it must be. `unknown` means the engine could not establish an answer — NOT a pass, and never drawn as one. Anything else renders as `unknown`.
         */
        state: "installed" | "available" | "update" | "unknown";
        /**
         * The product cannot run without it. Absent means OPTIONAL here, the opposite default from `Requirement.optional`: a store row that called itself required by omission would cry wolf.
         */
        required?: boolean;
        /**
         * A few words under the capsule — a version, a size, or why the capsule is disabled. Host-set: this component owns no units and no reasons.
         */
        caption?: string;
        /**
         * An install of this item is running. **Host-set, never inferred here.** Names the verb in flight, and while any row is installing every capsule is disabled.
         */
        installing?: boolean;
        /**
         * The action's word, which says what pressing it does — "Download" for a model the engine fetches. Default "Install". "Retry" after a failure and "Update" for an outdated item replace it.
         */
        verb?: string;
        /**
         * The word while it runs, matching `verb` — "Downloading". Default "Installing".
         */
        busyVerb?: string;
        /**
         * Why the last install of this item failed, in the engine's own words. Present turns the action into Retry and shows the reason in full; it is never truncated.
         */
        failure?: string;
    }[];
    /**
     * The ids the host can install on request. **Host-set and never inferred**: whether something can be acquired from a button is the engine's knowledge. A row not named here gets a disabled capsule.
     */
    installable?: readonly string[];
    /**
     * Called when a capsule is pressed. **Omit it and every capsule renders DISABLED**, the contract `ServiceStatusList` uses. It reports INTENT: the host confirms before it acts.
     */
    onInstall?: (item: {
        /**
         * The engine's own id. What `installable` and `onInstall` speak in, and what seeds the icon's colour, so an item keeps its colour when its name changes.
         */
        id: string;
        /**
         * Display name. Falls back to `id`.
         */
        name?: string;
        /**
         * A Phosphor icon name drawn small beside the name. The host's: this component keeps no table from an id to a glyph. Absent draws nothing; the row's leading mark is its state, not its identity.
         */
        icon?: string;
        /**
         * One short line under the name: what having it gives you. The host picks the engine's words for it. One line, truncated: a row is not where a sentence is read.
         */
        tagline?: string;
        /**
         * `installed` is present. `available` is not present. `update` is present and older than it must be. `unknown` means the engine could not establish an answer — NOT a pass, and never drawn as one. Anything else renders as `unknown`.
         */
        state: "installed" | "available" | "update" | "unknown";
        /**
         * The product cannot run without it. Absent means OPTIONAL here, the opposite default from `Requirement.optional`: a store row that called itself required by omission would cry wolf.
         */
        required?: boolean;
        /**
         * A few words under the capsule — a version, a size, or why the capsule is disabled. Host-set: this component owns no units and no reasons.
         */
        caption?: string;
        /**
         * An install of this item is running. **Host-set, never inferred here.** Names the verb in flight, and while any row is installing every capsule is disabled.
         */
        installing?: boolean;
        /**
         * The action's word, which says what pressing it does — "Download" for a model the engine fetches. Default "Install". "Retry" after a failure and "Update" for an outdated item replace it.
         */
        verb?: string;
        /**
         * The word while it runs, matching `verb` — "Downloading". Default "Installing".
         */
        busyVerb?: string;
        /**
         * Why the last install of this item failed, in the engine's own words. Present turns the action into Retry and shows the reason in full; it is never truncated.
         */
        failure?: string;
    }) => void;
    /**
     * Accessible name for the list — what these rows are ("Models").
     */
    label?: string;
    /**
     * Shown when there are no rows. The default states this component's ignorance, not the machine's inventory.
     */
    emptyLabel?: string;
}, {}, "">;
type Props = {
    /**
     * The rows, in the host's order.
     */
    items?: readonly {
        /**
         * The engine's own id. What `installable` and `onInstall` speak in, and what seeds the icon's colour, so an item keeps its colour when its name changes.
         */
        id: string;
        /**
         * Display name. Falls back to `id`.
         */
        name?: string;
        /**
         * A Phosphor icon name drawn small beside the name. The host's: this component keeps no table from an id to a glyph. Absent draws nothing; the row's leading mark is its state, not its identity.
         */
        icon?: string;
        /**
         * One short line under the name: what having it gives you. The host picks the engine's words for it. One line, truncated: a row is not where a sentence is read.
         */
        tagline?: string;
        /**
         * `installed` is present. `available` is not present. `update` is present and older than it must be. `unknown` means the engine could not establish an answer — NOT a pass, and never drawn as one. Anything else renders as `unknown`.
         */
        state: "installed" | "available" | "update" | "unknown";
        /**
         * The product cannot run without it. Absent means OPTIONAL here, the opposite default from `Requirement.optional`: a store row that called itself required by omission would cry wolf.
         */
        required?: boolean;
        /**
         * A few words under the capsule — a version, a size, or why the capsule is disabled. Host-set: this component owns no units and no reasons.
         */
        caption?: string;
        /**
         * An install of this item is running. **Host-set, never inferred here.** Names the verb in flight, and while any row is installing every capsule is disabled.
         */
        installing?: boolean;
        /**
         * The action's word, which says what pressing it does — "Download" for a model the engine fetches. Default "Install". "Retry" after a failure and "Update" for an outdated item replace it.
         */
        verb?: string;
        /**
         * The word while it runs, matching `verb` — "Downloading". Default "Installing".
         */
        busyVerb?: string;
        /**
         * Why the last install of this item failed, in the engine's own words. Present turns the action into Retry and shows the reason in full; it is never truncated.
         */
        failure?: string;
    }[];
    /**
     * The ids the host can install on request. **Host-set and never inferred**: whether something can be acquired from a button is the engine's knowledge. A row not named here gets a disabled capsule.
     */
    installable?: readonly string[];
    /**
     * Called when a capsule is pressed. **Omit it and every capsule renders DISABLED**, the contract `ServiceStatusList` uses. It reports INTENT: the host confirms before it acts.
     */
    onInstall?: (item: {
        /**
         * The engine's own id. What `installable` and `onInstall` speak in, and what seeds the icon's colour, so an item keeps its colour when its name changes.
         */
        id: string;
        /**
         * Display name. Falls back to `id`.
         */
        name?: string;
        /**
         * A Phosphor icon name drawn small beside the name. The host's: this component keeps no table from an id to a glyph. Absent draws nothing; the row's leading mark is its state, not its identity.
         */
        icon?: string;
        /**
         * One short line under the name: what having it gives you. The host picks the engine's words for it. One line, truncated: a row is not where a sentence is read.
         */
        tagline?: string;
        /**
         * `installed` is present. `available` is not present. `update` is present and older than it must be. `unknown` means the engine could not establish an answer — NOT a pass, and never drawn as one. Anything else renders as `unknown`.
         */
        state: "installed" | "available" | "update" | "unknown";
        /**
         * The product cannot run without it. Absent means OPTIONAL here, the opposite default from `Requirement.optional`: a store row that called itself required by omission would cry wolf.
         */
        required?: boolean;
        /**
         * A few words under the capsule — a version, a size, or why the capsule is disabled. Host-set: this component owns no units and no reasons.
         */
        caption?: string;
        /**
         * An install of this item is running. **Host-set, never inferred here.** Names the verb in flight, and while any row is installing every capsule is disabled.
         */
        installing?: boolean;
        /**
         * The action's word, which says what pressing it does — "Download" for a model the engine fetches. Default "Install". "Retry" after a failure and "Update" for an outdated item replace it.
         */
        verb?: string;
        /**
         * The word while it runs, matching `verb` — "Downloading". Default "Installing".
         */
        busyVerb?: string;
        /**
         * Why the last install of this item failed, in the engine's own words. Present turns the action into Retry and shows the reason in full; it is never truncated.
         */
        failure?: string;
    }) => void;
    /**
     * Accessible name for the list — what these rows are ("Models").
     */
    label?: string;
    /**
     * Shown when there are no rows. The default states this component's ignorance, not the machine's inventory.
     */
    emptyLabel?: string;
};

export default ProviderSetup;
type ProviderSetup = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ProviderSetup: import("svelte").Component<{
    /**
     * Inside Settings, whose frame titles the pane: no second title.
     */
    embedded?: boolean;
    /**
     * Every provider khaosd knows, for the sheet.
     */
    providers?: readonly import("./lib/providers.js").ProviderSetupOption[];
    /**
     * The ones added.
     */
    configuredProviders?: readonly import("./lib/providers.js").ProviderSetupOption[];
    /**
     * The added ones, by kind; a group with no label has no heading.
     */
    configuredProviderGroups?: readonly {
        id: string;
        label: string;
        providers: readonly import("./lib/providers.js").ProviderSetupOption[];
    }[];
    /**
     * The ones that can be added.
     */
    availableProviders?: readonly import("./lib/providers.js").ProviderSetupOption[];
    /**
     * The same, by kind, for Add provider.
     */
    availableProviderGroups?: readonly {
        id: string;
        label: string;
        providers: readonly import("./lib/providers.js").ProviderSetupOption[];
    }[];
    /**
     * The list is being read.
     */
    loadingProviders?: boolean;
    /**
     * The provider whose sheet is open; null closes it.
     */
    selectedProviderId?: string | null;
    /**
     * Its setup plan is being read.
     */
    loadingSelection?: boolean;
    /**
     * khaosd's setup plan for it.
     */
    plan?: {
        steps: readonly {
            kind: string;
            state: "pending" | "available" | "running" | "ready" | "blocked" | "failed";
            title: string;
            reason?: string;
            cause?: "client_not_registered";
            inputs?: readonly {
                id: string;
                label: string;
                sensitive: boolean;
                required: boolean;
            }[];
        }[];
        credentialScope?: {
            kind: "shared";
            providers: readonly {
                id: string;
                title: string;
            }[];
        };
    } | null;
    /**
     * The step kind being run, or null.
     */
    busyKind?: string | null;
    /**
     * The sign-in under way.
     */
    oauthFlow?: "idle" | "callback" | "code-paste" | "device";
    /**
     * A device sign-in's code.
     */
    userCode?: string | null;
    /**
     * The copy button's words ("Copy code", then "Copied").
     */
    copyCodeLabel?: string;
    /**
     * The browser tab was closed too soon: offer it again.
     */
    canReopenSignIn?: boolean;
    /**
     * A local server's models, or null when it is not one.
     */
    installedModels?: readonly {
        id: string;
        title: string;
        uses: readonly string[];
    }[] | null;
    /**
     * khaosd's disclosure, shown before a sign-in starts.
     */
    pendingDisclosure?: {
        providerId: string;
        title: string;
        text: string;
    } | null;
    /**
     * What khaosd last said, or ''.
     */
    notice?: string;
    /**
     * What went wrong, or ''.
     */
    error?: string;
    /**
     * A provider whose setup just finished.
     */
    completedProviderId?: string | null;
    /**
     * How Khaos runs AI, as khaosd serves it; only `served` carries a preference.
     */
    onboarding?: {
        kind: string;
        preference?: string | null;
    };
    /**
     * The Basic or Advanced path; only `served` carries one, and it is null until chosen.
     */
    pathSetup?: {
        kind: string;
        path?: string | null;
    };
    /**
     * Whether khaosd would run this step now.
     */
    isActionable?: (step: {
        kind: string;
        state: "pending" | "available" | "running" | "ready" | "blocked" | "failed";
        title: string;
        reason?: string;
        cause?: "client_not_registered";
        inputs?: readonly {
            id: string;
            label: string;
            sensitive: boolean;
            required: boolean;
        }[];
    }) => boolean;
    /**
     * Opens a provider's setup.
     */
    onChoose?: (providerId: string) => Promise<void> | void;
    /**
     * The sheet was closed: the host clears its selection.
     */
    onDismiss?: () => void;
    /**
     * Saves a key; resolves true once custody holds it.
     */
    onSaveApiKey?: (providerId: string, step: {
        kind: string;
        state: "pending" | "available" | "running" | "ready" | "blocked" | "failed";
        title: string;
        reason?: string;
        cause?: "client_not_registered";
        inputs?: readonly {
            id: string;
            label: string;
            sensitive: boolean;
            required: boolean;
        }[];
    }, value: string) => Promise<boolean>;
    /**
     * Checks a saved connection with the provider.
     */
    onVerify?: (providerId: string, step: {
        kind: string;
        state: "pending" | "available" | "running" | "ready" | "blocked" | "failed";
        title: string;
        reason?: string;
        cause?: "client_not_registered";
        inputs?: readonly {
            id: string;
            label: string;
            sensitive: boolean;
            required: boolean;
        }[];
    }) => Promise<void> | void;
    /**
     * Starts a browser sign-in.
     */
    onStartOAuth?: (providerId: string, step: {
        kind: string;
        state: "pending" | "available" | "running" | "ready" | "blocked" | "failed";
        title: string;
        reason?: string;
        cause?: "client_not_registered";
        inputs?: readonly {
            id: string;
            label: string;
            sensitive: boolean;
            required: boolean;
        }[];
    }) => Promise<void> | void;
    /**
     * Finishes a code-paste sign-in.
     */
    onCompleteOAuth?: (providerId: string, code: string) => Promise<unknown> | void;
    /**
     * Removes the account from custody.
     */
    onSignOut?: (providerId: string) => Promise<void> | void;
    /**
     * Opens the sign-in page again.
     */
    onReopenSignIn?: () => void;
    /**
     * Copies a device sign-in's code.
     */
    onCopyUserCode?: () => void;
    /**
     * Turns down the sign-in after reading the disclosure.
     */
    onCancelDisclosure?: () => void;
    /**
     * Goes on to sign in after reading the disclosure.
     */
    onContinueDisclosure?: () => void;
    /**
     * Opens the setup page khaosd served for it.
     */
    onOpenGuidance?: (providerId: string, which: "setup") => void;
    /**
     * A setup finished: the host enables the provider; true closes the sheet.
     */
    onCompleted?: (providerId: string) => boolean;
    /**
     * Switches to On-device Engines; the hint shows only when set.
     */
    onShowEngines?: (() => void) | undefined;
    /**
     * Getting started's Change…; the line shows only when set.
     */
    onOpenSetup?: (() => void) | undefined;
}, {}, "">;
type Props = {
    /**
     * Inside Settings, whose frame titles the pane: no second title.
     */
    embedded?: boolean;
    /**
     * Every provider khaosd knows, for the sheet.
     */
    providers?: readonly import("./lib/providers.js").ProviderSetupOption[];
    /**
     * The ones added.
     */
    configuredProviders?: readonly import("./lib/providers.js").ProviderSetupOption[];
    /**
     * The added ones, by kind; a group with no label has no heading.
     */
    configuredProviderGroups?: readonly {
        id: string;
        label: string;
        providers: readonly import("./lib/providers.js").ProviderSetupOption[];
    }[];
    /**
     * The ones that can be added.
     */
    availableProviders?: readonly import("./lib/providers.js").ProviderSetupOption[];
    /**
     * The same, by kind, for Add provider.
     */
    availableProviderGroups?: readonly {
        id: string;
        label: string;
        providers: readonly import("./lib/providers.js").ProviderSetupOption[];
    }[];
    /**
     * The list is being read.
     */
    loadingProviders?: boolean;
    /**
     * The provider whose sheet is open; null closes it.
     */
    selectedProviderId?: string | null;
    /**
     * Its setup plan is being read.
     */
    loadingSelection?: boolean;
    /**
     * khaosd's setup plan for it.
     */
    plan?: {
        steps: readonly {
            kind: string;
            state: "pending" | "available" | "running" | "ready" | "blocked" | "failed";
            title: string;
            reason?: string;
            cause?: "client_not_registered";
            inputs?: readonly {
                id: string;
                label: string;
                sensitive: boolean;
                required: boolean;
            }[];
        }[];
        credentialScope?: {
            kind: "shared";
            providers: readonly {
                id: string;
                title: string;
            }[];
        };
    } | null;
    /**
     * The step kind being run, or null.
     */
    busyKind?: string | null;
    /**
     * The sign-in under way.
     */
    oauthFlow?: "idle" | "callback" | "code-paste" | "device";
    /**
     * A device sign-in's code.
     */
    userCode?: string | null;
    /**
     * The copy button's words ("Copy code", then "Copied").
     */
    copyCodeLabel?: string;
    /**
     * The browser tab was closed too soon: offer it again.
     */
    canReopenSignIn?: boolean;
    /**
     * A local server's models, or null when it is not one.
     */
    installedModels?: readonly {
        id: string;
        title: string;
        uses: readonly string[];
    }[] | null;
    /**
     * khaosd's disclosure, shown before a sign-in starts.
     */
    pendingDisclosure?: {
        providerId: string;
        title: string;
        text: string;
    } | null;
    /**
     * What khaosd last said, or ''.
     */
    notice?: string;
    /**
     * What went wrong, or ''.
     */
    error?: string;
    /**
     * A provider whose setup just finished.
     */
    completedProviderId?: string | null;
    /**
     * How Khaos runs AI, as khaosd serves it; only `served` carries a preference.
     */
    onboarding?: {
        kind: string;
        preference?: string | null;
    };
    /**
     * The Basic or Advanced path; only `served` carries one, and it is null until chosen.
     */
    pathSetup?: {
        kind: string;
        path?: string | null;
    };
    /**
     * Whether khaosd would run this step now.
     */
    isActionable?: (step: {
        kind: string;
        state: "pending" | "available" | "running" | "ready" | "blocked" | "failed";
        title: string;
        reason?: string;
        cause?: "client_not_registered";
        inputs?: readonly {
            id: string;
            label: string;
            sensitive: boolean;
            required: boolean;
        }[];
    }) => boolean;
    /**
     * Opens a provider's setup.
     */
    onChoose?: (providerId: string) => Promise<void> | void;
    /**
     * The sheet was closed: the host clears its selection.
     */
    onDismiss?: () => void;
    /**
     * Saves a key; resolves true once custody holds it.
     */
    onSaveApiKey?: (providerId: string, step: {
        kind: string;
        state: "pending" | "available" | "running" | "ready" | "blocked" | "failed";
        title: string;
        reason?: string;
        cause?: "client_not_registered";
        inputs?: readonly {
            id: string;
            label: string;
            sensitive: boolean;
            required: boolean;
        }[];
    }, value: string) => Promise<boolean>;
    /**
     * Checks a saved connection with the provider.
     */
    onVerify?: (providerId: string, step: {
        kind: string;
        state: "pending" | "available" | "running" | "ready" | "blocked" | "failed";
        title: string;
        reason?: string;
        cause?: "client_not_registered";
        inputs?: readonly {
            id: string;
            label: string;
            sensitive: boolean;
            required: boolean;
        }[];
    }) => Promise<void> | void;
    /**
     * Starts a browser sign-in.
     */
    onStartOAuth?: (providerId: string, step: {
        kind: string;
        state: "pending" | "available" | "running" | "ready" | "blocked" | "failed";
        title: string;
        reason?: string;
        cause?: "client_not_registered";
        inputs?: readonly {
            id: string;
            label: string;
            sensitive: boolean;
            required: boolean;
        }[];
    }) => Promise<void> | void;
    /**
     * Finishes a code-paste sign-in.
     */
    onCompleteOAuth?: (providerId: string, code: string) => Promise<unknown> | void;
    /**
     * Removes the account from custody.
     */
    onSignOut?: (providerId: string) => Promise<void> | void;
    /**
     * Opens the sign-in page again.
     */
    onReopenSignIn?: () => void;
    /**
     * Copies a device sign-in's code.
     */
    onCopyUserCode?: () => void;
    /**
     * Turns down the sign-in after reading the disclosure.
     */
    onCancelDisclosure?: () => void;
    /**
     * Goes on to sign in after reading the disclosure.
     */
    onContinueDisclosure?: () => void;
    /**
     * Opens the setup page khaosd served for it.
     */
    onOpenGuidance?: (providerId: string, which: "setup") => void;
    /**
     * A setup finished: the host enables the provider; true closes the sheet.
     */
    onCompleted?: (providerId: string) => boolean;
    /**
     * Switches to On-device Engines; the hint shows only when set.
     */
    onShowEngines?: (() => void) | undefined;
    /**
     * Getting started's Change…; the line shows only when set.
     */
    onOpenSetup?: (() => void) | undefined;
};

export default SetupConnect;
type SetupConnect = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SetupConnect: import("svelte").Component<{
    /**
     * One row per enabled kind, as khaosd serves it.
     */
    rows?: readonly {
        kind: {
            id: string;
            title: string;
            readiness: {
                ready: boolean;
                reason?: string;
            };
        };
        providers: readonly {
            id: string;
            title: string;
            local?: boolean;
        }[];
        state: "connected" | "finish-setup" | "action";
        next: "ready" | "connect-key" | "sign-in" | "install" | "download";
        acting: string;
        actingTitle: string;
        suggested: {
            provider: string;
            model?: string;
        };
    }[];
    /**
     * khaosd's inference preference: `local` says installs ask first.
     */
    preference?: string | null;
    /**
     * The Basic path: khaosd's suggestion only, no "More options".
     */
    basic?: boolean;
    /**
     * The name of what an install row installs, by its acting provider.
     */
    installNames?: Record<string, string>;
    /**
     * The kinds whose account is signed in, so Sign out is offered.
     */
    signedInKinds?: readonly string[];
    /**
     * The provider waiting for an authorization code to be pasted.
     */
    codePasteFor?: string | null;
    /**
     * What the provider sign-in last said.
     */
    providerNotice?: {
        providerId: string;
        text: string;
    } | null;
    /**
     * A finish-setup install the host can run; null offers Check again only.
     */
    finishSetup?: {
        settling: boolean;
    } | null;
    /**
     * Runs a row's action other than adding a key: sign in, install, download.
     */
    onAct?: (row: {
        kind: {
            id: string;
            title: string;
            readiness: {
                ready: boolean;
                reason?: string;
            };
        };
        providers: readonly {
            id: string;
            title: string;
            local?: boolean;
        }[];
        state: "connected" | "finish-setup" | "action";
        next: "ready" | "connect-key" | "sign-in" | "install" | "download";
        acting: string;
        actingTitle: string;
        suggested: {
            provider: string;
            model?: string;
        };
    }) => Promise<void> | void;
    /**
     * Saves a key; true closes the form. The key is never kept here.
     */
    onSaveKey?: (row: {
        kind: {
            id: string;
            title: string;
            readiness: {
                ready: boolean;
                reason?: string;
            };
        };
        providers: readonly {
            id: string;
            title: string;
            local?: boolean;
        }[];
        state: "connected" | "finish-setup" | "action";
        next: "ready" | "connect-key" | "sign-in" | "install" | "download";
        acting: string;
        actingTitle: string;
        suggested: {
            provider: string;
            model?: string;
        };
    }, key: string) => Promise<boolean>;
    /**
     * Signs out; resolves to what to tell the person.
     */
    onSignOut?: (row: {
        kind: {
            id: string;
            title: string;
            readiness: {
                ready: boolean;
                reason?: string;
            };
        };
        providers: readonly {
            id: string;
            title: string;
            local?: boolean;
        }[];
        state: "connected" | "finish-setup" | "action";
        next: "ready" | "connect-key" | "sign-in" | "install" | "download";
        acting: string;
        actingTitle: string;
        suggested: {
            provider: string;
            model?: string;
        };
    }) => Promise<string | null>;
    /**
     * Reads the connections again.
     */
    onRecheck?: () => Promise<void> | void;
    /**
     * Finishes a pasted-code sign-in.
     */
    onCompleteOAuth?: (providerId: string, code: string) => Promise<boolean>;
    /**
     * Runs the finish-setup install.
     */
    onRunFinishSetup?: () => void;
    /**
     * More options in Settings…
     */
    onOpenSettings?: () => void;
    /**
     * The host's finish-setup confirmation.
     */
    finish?: import("svelte").Snippet | undefined;
    /**
     * The host's provider disclosure.
     */
    disclosure?: import("svelte").Snippet | undefined;
}, {}, "">;
type Props = {
    /**
     * One row per enabled kind, as khaosd serves it.
     */
    rows?: readonly {
        kind: {
            id: string;
            title: string;
            readiness: {
                ready: boolean;
                reason?: string;
            };
        };
        providers: readonly {
            id: string;
            title: string;
            local?: boolean;
        }[];
        state: "connected" | "finish-setup" | "action";
        next: "ready" | "connect-key" | "sign-in" | "install" | "download";
        acting: string;
        actingTitle: string;
        suggested: {
            provider: string;
            model?: string;
        };
    }[];
    /**
     * khaosd's inference preference: `local` says installs ask first.
     */
    preference?: string | null;
    /**
     * The Basic path: khaosd's suggestion only, no "More options".
     */
    basic?: boolean;
    /**
     * The name of what an install row installs, by its acting provider.
     */
    installNames?: Record<string, string>;
    /**
     * The kinds whose account is signed in, so Sign out is offered.
     */
    signedInKinds?: readonly string[];
    /**
     * The provider waiting for an authorization code to be pasted.
     */
    codePasteFor?: string | null;
    /**
     * What the provider sign-in last said.
     */
    providerNotice?: {
        providerId: string;
        text: string;
    } | null;
    /**
     * A finish-setup install the host can run; null offers Check again only.
     */
    finishSetup?: {
        settling: boolean;
    } | null;
    /**
     * Runs a row's action other than adding a key: sign in, install, download.
     */
    onAct?: (row: {
        kind: {
            id: string;
            title: string;
            readiness: {
                ready: boolean;
                reason?: string;
            };
        };
        providers: readonly {
            id: string;
            title: string;
            local?: boolean;
        }[];
        state: "connected" | "finish-setup" | "action";
        next: "ready" | "connect-key" | "sign-in" | "install" | "download";
        acting: string;
        actingTitle: string;
        suggested: {
            provider: string;
            model?: string;
        };
    }) => Promise<void> | void;
    /**
     * Saves a key; true closes the form. The key is never kept here.
     */
    onSaveKey?: (row: {
        kind: {
            id: string;
            title: string;
            readiness: {
                ready: boolean;
                reason?: string;
            };
        };
        providers: readonly {
            id: string;
            title: string;
            local?: boolean;
        }[];
        state: "connected" | "finish-setup" | "action";
        next: "ready" | "connect-key" | "sign-in" | "install" | "download";
        acting: string;
        actingTitle: string;
        suggested: {
            provider: string;
            model?: string;
        };
    }, key: string) => Promise<boolean>;
    /**
     * Signs out; resolves to what to tell the person.
     */
    onSignOut?: (row: {
        kind: {
            id: string;
            title: string;
            readiness: {
                ready: boolean;
                reason?: string;
            };
        };
        providers: readonly {
            id: string;
            title: string;
            local?: boolean;
        }[];
        state: "connected" | "finish-setup" | "action";
        next: "ready" | "connect-key" | "sign-in" | "install" | "download";
        acting: string;
        actingTitle: string;
        suggested: {
            provider: string;
            model?: string;
        };
    }) => Promise<string | null>;
    /**
     * Reads the connections again.
     */
    onRecheck?: () => Promise<void> | void;
    /**
     * Finishes a pasted-code sign-in.
     */
    onCompleteOAuth?: (providerId: string, code: string) => Promise<boolean>;
    /**
     * Runs the finish-setup install.
     */
    onRunFinishSetup?: () => void;
    /**
     * More options in Settings…
     */
    onOpenSettings?: () => void;
    /**
     * The host's finish-setup confirmation.
     */
    finish?: import("svelte").Snippet | undefined;
    /**
     * The host's provider disclosure.
     */
    disclosure?: import("svelte").Snippet | undefined;
};

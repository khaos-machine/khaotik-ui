export default LauncherWindow;
type LauncherWindow = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const LauncherWindow: import("svelte").Component<{
    /**
     * khaosd is not reachable, or null.
     */
    offline?: {
        key: string;
        headline: string;
        body: string;
        details: string;
        loginItems: boolean;
    } | null;
    /**
     * Open Login Items…, offered when khaosd is blocked there.
     */
    onLoginItems?: () => void;
    /**
     * Reads the engine again.
     */
    onCheckAgain?: () => void;
    /**
     * Report a problem…
     */
    onReport?: () => void;
    /**
     * A setup step to finish, or null.
     */
    setup?: {
        key: string;
        details: string;
        failed: string;
        settling: boolean;
    } | null;
    /**
     * Run it: the host confirms first.
     */
    onRunSetup?: () => void;
    /**
     * The first check of the launch has not settled: only the startup screen is drawn.
     */
    checking?: boolean;
    /**
     * For the startup screen.
     */
    appVersion?: string;
    /**
     * For the startup screen.
     */
    checks?: import("svelte").ComponentProps<typeof Splash>["checks"];
    /**
     * What the launch check found.
     */
    readiness?: {
        kind: "ready";
    } | {
        kind: "introduce";
    } | {
        kind: "unready";
        features: readonly {
            id: string;
            title: string;
            reason: string;
        }[];
        unmet: readonly {
            id: string;
            name: string;
            verdict: string;
        }[];
    } | {
        kind: "blocked";
        engine: string;
        unmet: readonly {
            id: string;
            name: string;
            verdict: string;
        }[];
        blocked: readonly {
            id: string;
            label: string;
            reason: string;
        }[];
    };
    /**
     * Get started…: opens Setup.
     */
    onGetStarted?: () => void;
    /**
     * Open Setup…
     */
    onOpenSetup?: () => void;
    /**
     * The list is still being read.
     */
    lookingForEngine?: boolean;
    /**
     * The status bar's engine line.
     */
    statusEngine?: import("svelte").ComponentProps<typeof StatusBar>["engine"];
    /**
     * The status bar's last result.
     */
    statusResult?: import("svelte").ComponentProps<typeof StatusBar>["result"];
    /**
     * A project that did not open, and what it offers.
     */
    refusal?: {
        message: string;
        confirmLabel: string;
    } | null;
    /**
     * The refusal was dismissed.
     */
    onCancelRefusal?: () => void;
    /**
     * The refusal's action was chosen.
     */
    onConfirmRefusal?: () => void;
    /**
     * Open from Git… is asking for a repository.
     */
    cloning?: boolean;
    /**
     * Open from Git was cancelled.
     */
    onCancelClone?: () => void;
    /**
     * The repository URL was given; the host asks where it goes.
     */
    onClone?: (url: string) => void;
    /**
     * The host's welcome window.
     */
    welcome?: import("svelte").Snippet | undefined;
    /**
     * The host's own confirmations.
     */
    dialogs?: import("svelte").Snippet | undefined;
}, {}, "">;
type Props = {
    /**
     * khaosd is not reachable, or null.
     */
    offline?: {
        key: string;
        headline: string;
        body: string;
        details: string;
        loginItems: boolean;
    } | null;
    /**
     * Open Login Items…, offered when khaosd is blocked there.
     */
    onLoginItems?: () => void;
    /**
     * Reads the engine again.
     */
    onCheckAgain?: () => void;
    /**
     * Report a problem…
     */
    onReport?: () => void;
    /**
     * A setup step to finish, or null.
     */
    setup?: {
        key: string;
        details: string;
        failed: string;
        settling: boolean;
    } | null;
    /**
     * Run it: the host confirms first.
     */
    onRunSetup?: () => void;
    /**
     * The first check of the launch has not settled: only the startup screen is drawn.
     */
    checking?: boolean;
    /**
     * For the startup screen.
     */
    appVersion?: string;
    /**
     * For the startup screen.
     */
    checks?: import("svelte").ComponentProps<typeof Splash>["checks"];
    /**
     * What the launch check found.
     */
    readiness?: {
        kind: "ready";
    } | {
        kind: "introduce";
    } | {
        kind: "unready";
        features: readonly {
            id: string;
            title: string;
            reason: string;
        }[];
        unmet: readonly {
            id: string;
            name: string;
            verdict: string;
        }[];
    } | {
        kind: "blocked";
        engine: string;
        unmet: readonly {
            id: string;
            name: string;
            verdict: string;
        }[];
        blocked: readonly {
            id: string;
            label: string;
            reason: string;
        }[];
    };
    /**
     * Get started…: opens Setup.
     */
    onGetStarted?: () => void;
    /**
     * Open Setup…
     */
    onOpenSetup?: () => void;
    /**
     * The list is still being read.
     */
    lookingForEngine?: boolean;
    /**
     * The status bar's engine line.
     */
    statusEngine?: import("svelte").ComponentProps<typeof StatusBar>["engine"];
    /**
     * The status bar's last result.
     */
    statusResult?: import("svelte").ComponentProps<typeof StatusBar>["result"];
    /**
     * A project that did not open, and what it offers.
     */
    refusal?: {
        message: string;
        confirmLabel: string;
    } | null;
    /**
     * The refusal was dismissed.
     */
    onCancelRefusal?: () => void;
    /**
     * The refusal's action was chosen.
     */
    onConfirmRefusal?: () => void;
    /**
     * Open from Git… is asking for a repository.
     */
    cloning?: boolean;
    /**
     * Open from Git was cancelled.
     */
    onCancelClone?: () => void;
    /**
     * The repository URL was given; the host asks where it goes.
     */
    onClone?: (url: string) => void;
    /**
     * The host's welcome window.
     */
    welcome?: import("svelte").Snippet | undefined;
    /**
     * The host's own confirmations.
     */
    dialogs?: import("svelte").Snippet | undefined;
};
import Splash from './Splash.svelte';
import StatusBar from './StatusBar.svelte';

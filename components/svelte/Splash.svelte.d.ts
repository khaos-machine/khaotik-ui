export default Splash;
type Splash = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Splash: import("svelte").Component<{
    /**
     * The app's version, under the name.
     */
    appVersion?: string;
    /**
     * The startup checks, in the order they run.
     */
    checks?: readonly {
        name: string;
        state: "pending" | "ok" | "failed" | "skipped" | "none";
        detail: string;
    }[];
}, {}, "">;
type Props = {
    /**
     * The app's version, under the name.
     */
    appVersion?: string;
    /**
     * The startup checks, in the order they run.
     */
    checks?: readonly {
        name: string;
        state: "pending" | "ok" | "failed" | "skipped" | "none";
        detail: string;
    }[];
};

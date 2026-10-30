export default StoryOverviewStrip;
type StoryOverviewStrip = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StoryOverviewStrip: import("svelte").Component<{
    /**
     * Coverage's verdict; null before coverage is made.
     */
    coverage?: {
        verdict: "recommend" | "consider" | "pass";
    } | null;
    /**
     * The story budget, as the status bar takes it.
     */
    budget?: any | null;
    /**
     * How many things need review.
     */
    review?: number;
    /**
     * The next step; null draws no fourth figure.
     */
    next?: {
        label: string;
        icon?: string;
    } | null;
    /**
     * Opens coverage.
     */
    oncoverage?: () => void;
    /**
     * Opens the story's budget, to set or change it.
     */
    onbudget?: () => void;
    /**
     * Opens what needs review.
     */
    onreview?: () => void;
    /**
     * Takes the next step.
     */
    onnext?: () => void;
}, {}, "">;
type Props = {
    /**
     * Coverage's verdict; null before coverage is made.
     */
    coverage?: {
        verdict: "recommend" | "consider" | "pass";
    } | null;
    /**
     * The story budget, as the status bar takes it.
     */
    budget?: any | null;
    /**
     * How many things need review.
     */
    review?: number;
    /**
     * The next step; null draws no fourth figure.
     */
    next?: {
        label: string;
        icon?: string;
    } | null;
    /**
     * Opens coverage.
     */
    oncoverage?: () => void;
    /**
     * Opens the story's budget, to set or change it.
     */
    onbudget?: () => void;
    /**
     * Opens what needs review.
     */
    onreview?: () => void;
    /**
     * Takes the next step.
     */
    onnext?: () => void;
};

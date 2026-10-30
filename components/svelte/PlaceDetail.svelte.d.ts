export default PlaceDetail;
type PlaceDetail = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PlaceDetail: import("svelte").Component<{
    /**
     * The selected place's row; null when none is selected.
     */
    place?: import("./lib/places.js").PlaceRecord | null;
    /**
     * The place's detail read, which carries its analysis and graph context.
     */
    detail?: {
        kind: "idle";
    } | {
        kind: "loading";
    } | {
        kind: "failed";
        message?: string;
    } | {
        kind: "loaded";
        analysis: Record<string, unknown> | null;
        graphContext?: Record<string, unknown> | null;
    };
    /**
     * The engine's standing for the place's analysis.
     */
    standing?: {
        state: string;
        reasons: readonly string[];
        details: readonly string[];
    } | undefined;
    /**
     * The project's headings read.
     */
    headings?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
        read: import("./lib/places.js").HeadingLocations;
    };
    /**
     * A headings change is being written.
     */
    headingsBusy?: boolean;
    /**
     * Reports a confirmed split.
     */
    onSplit?: (merge: import("./lib/places.js").HeadingDecision) => boolean | void | Promise<boolean | void>;
    /**
     * Reports a confirmed declaration.
     */
    onKeepApart?: (here: import("./lib/places.js").HeadingOccurrence, there: import("./lib/places.js").HeadingOccurrence) => boolean | void | Promise<boolean | void>;
    /**
     * The place's images read.
     */
    images?: import("./lib/types.js").SubjectImagesRead;
    /**
     * Resolved image URLs by reference id.
     */
    imageUrls?: Readonly<Record<string, string>>;
    /**
     * Reports an activated image.
     */
    onRevealImage?: (referenceId: string) => void;
    /**
     * The place's areas read.
     */
    areas?: import("./lib/places.js").PlaceAreasRead;
    /**
     * Reports the view chosen.
     */
    onview?: (view: "analysis" | "images" | "cast" | "headings" | "areas") => void;
}, {}, "">;
type Props = {
    /**
     * The selected place's row; null when none is selected.
     */
    place?: import("./lib/places.js").PlaceRecord | null;
    /**
     * The place's detail read, which carries its analysis and graph context.
     */
    detail?: {
        kind: "idle";
    } | {
        kind: "loading";
    } | {
        kind: "failed";
        message?: string;
    } | {
        kind: "loaded";
        analysis: Record<string, unknown> | null;
        graphContext?: Record<string, unknown> | null;
    };
    /**
     * The engine's standing for the place's analysis.
     */
    standing?: {
        state: string;
        reasons: readonly string[];
        details: readonly string[];
    } | undefined;
    /**
     * The project's headings read.
     */
    headings?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
        read: import("./lib/places.js").HeadingLocations;
    };
    /**
     * A headings change is being written.
     */
    headingsBusy?: boolean;
    /**
     * Reports a confirmed split.
     */
    onSplit?: (merge: import("./lib/places.js").HeadingDecision) => boolean | void | Promise<boolean | void>;
    /**
     * Reports a confirmed declaration.
     */
    onKeepApart?: (here: import("./lib/places.js").HeadingOccurrence, there: import("./lib/places.js").HeadingOccurrence) => boolean | void | Promise<boolean | void>;
    /**
     * The place's images read.
     */
    images?: import("./lib/types.js").SubjectImagesRead;
    /**
     * Resolved image URLs by reference id.
     */
    imageUrls?: Readonly<Record<string, string>>;
    /**
     * Reports an activated image.
     */
    onRevealImage?: (referenceId: string) => void;
    /**
     * The place's areas read.
     */
    areas?: import("./lib/places.js").PlaceAreasRead;
    /**
     * Reports the view chosen.
     */
    onview?: (view: "analysis" | "images" | "cast" | "headings" | "areas") => void;
};

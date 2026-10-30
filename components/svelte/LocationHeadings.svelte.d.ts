export default LocationHeadings;
type LocationHeadings = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const LocationHeadings: import("svelte").Component<{
    /**
     * The project's headings read. Loading until the host says otherwise.
     */
    read?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
        read: import("./lib/places.js").HeadingLocations;
    };
    /**
     * The place whose view this is.
     */
    locationId?: string;
    /**
     * A change is being written: the actions wait.
     */
    busy?: boolean;
    /**
     * Reports a confirmed split. The confirmation stays open when it answers false.
     */
    onSplit?: (merge: import("./lib/places.js").HeadingDecision) => boolean | void | Promise<boolean | void>;
    /**
     * Reports a confirmed declaration. The confirmation stays open when it answers false.
     */
    onKeepApart?: (here: import("./lib/places.js").HeadingOccurrence, there: import("./lib/places.js").HeadingOccurrence) => boolean | void | Promise<boolean | void>;
}, {}, "">;
type Props = {
    /**
     * The project's headings read. Loading until the host says otherwise.
     */
    read?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
        read: import("./lib/places.js").HeadingLocations;
    };
    /**
     * The place whose view this is.
     */
    locationId?: string;
    /**
     * A change is being written: the actions wait.
     */
    busy?: boolean;
    /**
     * Reports a confirmed split. The confirmation stays open when it answers false.
     */
    onSplit?: (merge: import("./lib/places.js").HeadingDecision) => boolean | void | Promise<boolean | void>;
    /**
     * Reports a confirmed declaration. The confirmation stays open when it answers false.
     */
    onKeepApart?: (here: import("./lib/places.js").HeadingOccurrence, there: import("./lib/places.js").HeadingOccurrence) => boolean | void | Promise<boolean | void>;
};

export default PlaceReview;
type PlaceReview = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PlaceReview: import("svelte").Component<{
    /**
     * Whether the app is on Advanced. On Basic the screen says place building needs Advanced and shows nothing else.
     */
    advanced?: boolean;
    /**
     * The definition is being read.
     */
    loading?: boolean;
    /**
     * Why the definition could not be read, in the writer's words, or ''.
     */
    error?: string;
    /**
     * The saved place definition, as khaosd's `GET /api/places/definitions/{id}` returns it.
     */
    definition?: (import("./lib/place-plan.js").PlaceDefinition & {
        id?: string;
        designRevisionIds: string[];
        cameras: {
            id: string;
            position: number[];
            target: number[];
            lensMm: number;
            purpose?: string;
            sheet?: {
                designRevisionId: string;
                panel: number;
            };
        }[];
        panelChecks?: {
            cameraId: string;
            verdict: string;
            mismatches?: string[];
        }[];
        review?: {
            state: string;
            notes: string;
        };
    }) | null;
    /**
     * The built model of `definition`: the bytes of khaosd's `.../{id}/model.glb`, or null when there is none.
     */
    model?: Uint8Array | null;
    /**
     * Each sheet panel camera's line art URL by camera id: khaosd's `.../{id}/guides/{cameraId}/lineart.png`.
     */
    lineArt?: Record<string, string>;
    /**
     * Whole sheet image URLs by design revision id, read with `.../{id}/sheet?designRevisionId=`.
     */
    sheets?: Record<string, string>;
    /**
     * The engine's display labels for referenced sheets, when known.
     */
    sheetLabels?: Record<string, string>;
    /**
     * The selected element's id (a room, opening, fixture or camera), or ''.
     */
    selected?: string;
    /**
     * The operator's unsaved edit of `definition`, or null when there is none. The plan draws it and the model is seen through its cameras; the model itself stays the saved build.
     */
    draft?: (import("./lib/place-plan.js").PlaceDefinition & {
        id?: string;
        designRevisionIds: string[];
        cameras: {
            id: string;
            position: number[];
            target: number[];
            lensMm: number;
            purpose?: string;
            sheet?: {
                designRevisionId: string;
                panel: number;
            };
        }[];
        panelChecks?: {
            cameraId: string;
            verdict: string;
            mismatches?: string[];
        }[];
        review?: {
            state: string;
            notes: string;
        };
    }) | null;
    /**
     * Why khaosd refused the last write with a 409: `stale` when another revision became the head, `building` while a Build runs; '' when none. Edits wait while it is set.
     */
    conflict?: "" | "stale" | "building";
    /**
     * A save or review is being written; their actions and edits wait.
     */
    saving?: boolean;
    /**
     * Blender was found and is the pinned version, so the working blend can open in it.
     */
    blenderAvailable?: boolean;
    /**
     * Reports an element chosen in the plan or the model.
     */
    onselect?: (id: string) => void;
    /**
     * Reports the loaded model's node names.
     */
    onload?: (names: string[]) => void;
    /**
     * Records a review of `definition`: khaosd's `POST .../{id}/review`.
     */
    onreview?: (state: "reviewed" | "rejected", notes: string) => void;
    /**
     * Reports the whole edited definition, or null to discard the draft.
     */
    onedit?: (draft: (import("./lib/place-plan.js").PlaceDefinition & {
        id?: string;
        designRevisionIds: string[];
        cameras: {
            id: string;
            position: number[];
            target: number[];
            lensMm: number;
            purpose?: string;
            sheet?: {
                designRevisionId: string;
                panel: number;
            };
        }[];
        panelChecks?: {
            cameraId: string;
            verdict: string;
            mismatches?: string[];
        }[];
        review?: {
            state: string;
            notes: string;
        };
    }) | null) => void;
    /**
     * Saves `draft` with `definition` as its parent: khaosd's `POST /api/places/definitions`.
     */
    onsave?: () => void;
    /**
     * Reloads the definition's head after a conflict.
     */
    onreload?: () => void;
    /**
     * Opens the working blend in Blender: khaosd's `.../{id}/work.blend`.
     */
    onopenblender?: () => void;
}, {}, "">;
type Props = {
    /**
     * Whether the app is on Advanced. On Basic the screen says place building needs Advanced and shows nothing else.
     */
    advanced?: boolean;
    /**
     * The definition is being read.
     */
    loading?: boolean;
    /**
     * Why the definition could not be read, in the writer's words, or ''.
     */
    error?: string;
    /**
     * The saved place definition, as khaosd's `GET /api/places/definitions/{id}` returns it.
     */
    definition?: (import("./lib/place-plan.js").PlaceDefinition & {
        id?: string;
        designRevisionIds: string[];
        cameras: {
            id: string;
            position: number[];
            target: number[];
            lensMm: number;
            purpose?: string;
            sheet?: {
                designRevisionId: string;
                panel: number;
            };
        }[];
        panelChecks?: {
            cameraId: string;
            verdict: string;
            mismatches?: string[];
        }[];
        review?: {
            state: string;
            notes: string;
        };
    }) | null;
    /**
     * The built model of `definition`: the bytes of khaosd's `.../{id}/model.glb`, or null when there is none.
     */
    model?: Uint8Array | null;
    /**
     * Each sheet panel camera's line art URL by camera id: khaosd's `.../{id}/guides/{cameraId}/lineart.png`.
     */
    lineArt?: Record<string, string>;
    /**
     * Whole sheet image URLs by design revision id, read with `.../{id}/sheet?designRevisionId=`.
     */
    sheets?: Record<string, string>;
    /**
     * The engine's display labels for referenced sheets, when known.
     */
    sheetLabels?: Record<string, string>;
    /**
     * The selected element's id (a room, opening, fixture or camera), or ''.
     */
    selected?: string;
    /**
     * The operator's unsaved edit of `definition`, or null when there is none. The plan draws it and the model is seen through its cameras; the model itself stays the saved build.
     */
    draft?: (import("./lib/place-plan.js").PlaceDefinition & {
        id?: string;
        designRevisionIds: string[];
        cameras: {
            id: string;
            position: number[];
            target: number[];
            lensMm: number;
            purpose?: string;
            sheet?: {
                designRevisionId: string;
                panel: number;
            };
        }[];
        panelChecks?: {
            cameraId: string;
            verdict: string;
            mismatches?: string[];
        }[];
        review?: {
            state: string;
            notes: string;
        };
    }) | null;
    /**
     * Why khaosd refused the last write with a 409: `stale` when another revision became the head, `building` while a Build runs; '' when none. Edits wait while it is set.
     */
    conflict?: "" | "stale" | "building";
    /**
     * A save or review is being written; their actions and edits wait.
     */
    saving?: boolean;
    /**
     * Blender was found and is the pinned version, so the working blend can open in it.
     */
    blenderAvailable?: boolean;
    /**
     * Reports an element chosen in the plan or the model.
     */
    onselect?: (id: string) => void;
    /**
     * Reports the loaded model's node names.
     */
    onload?: (names: string[]) => void;
    /**
     * Records a review of `definition`: khaosd's `POST .../{id}/review`.
     */
    onreview?: (state: "reviewed" | "rejected", notes: string) => void;
    /**
     * Reports the whole edited definition, or null to discard the draft.
     */
    onedit?: (draft: (import("./lib/place-plan.js").PlaceDefinition & {
        id?: string;
        designRevisionIds: string[];
        cameras: {
            id: string;
            position: number[];
            target: number[];
            lensMm: number;
            purpose?: string;
            sheet?: {
                designRevisionId: string;
                panel: number;
            };
        }[];
        panelChecks?: {
            cameraId: string;
            verdict: string;
            mismatches?: string[];
        }[];
        review?: {
            state: string;
            notes: string;
        };
    }) | null) => void;
    /**
     * Saves `draft` with `definition` as its parent: khaosd's `POST /api/places/definitions`.
     */
    onsave?: () => void;
    /**
     * Reloads the definition's head after a conflict.
     */
    onreload?: () => void;
    /**
     * Opens the working blend in Blender: khaosd's `.../{id}/work.blend`.
     */
    onopenblender?: () => void;
};

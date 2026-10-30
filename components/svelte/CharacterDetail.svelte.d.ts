export default CharacterDetail;
type CharacterDetail = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const CharacterDetail: import("svelte").Component<{
    /**
     * The selected character's row; null when none is selected.
     */
    character?: import("./lib/characters.js").CharacterRecord | null;
    /**
     * The story's scenes, for the Scenes view and the mention lines' headings.
     */
    scenes?: readonly {
        id: string;
        /**
         * 0-based place in the story.
         */
        index?: number;
        slugline?: string;
    }[];
    /**
     * The character's lines.
     */
    dialogues?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
        lines: readonly {
            element_id: string;
            scene_slugline: string;
            text: string;
            parenthetical?: string;
        }[];
    };
    /**
     * The selected line's element id.
     */
    selectedLine?: string;
    /**
     * Reports a selected line.
     */
    onSelectLine?: (elementId: string) => void;
    /**
     * A mention chosen in the inspector; its lines replace the view.
     */
    mention?: {
        wording: string;
        occurrences: readonly {
            referenceId: string;
            sceneId: string;
            /**
             * 1-based.
             */
            lineNumber: number;
            lineText: string;
        }[];
    } | null;
    /**
     * Reports a view chosen while a mention shows.
     */
    onClearMention?: () => void;
    /**
     * The character's detail read, which carries its analysis.
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
    };
    /**
     * The engine's standing for this character's analysis: why a stale one is stale; undefined for a character with no analysis.
     */
    standing?: {
        state: string;
        reasons?: readonly string[];
        details?: readonly unknown[];
    } | undefined;
    /**
     * The character's images read.
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
     * The character's recordings read.
     */
    recordings?: import("./lib/types.js").RecordingsRead;
    /**
     * Reports an activated recording.
     */
    onRevealRecording?: (id: string) => void;
    /**
     * The character's resolved headshot URL.
     */
    portrait?: string;
    /**
     * Offers Build appearance… when set; undefined where the host has no builder.
     */
    onBuildAppearance?: ((characterId: string) => void) | undefined;
    /**
     * Reports the view chosen.
     */
    onview?: (view: "lines" | "scenes" | "analysis" | "images" | "recordings") => void;
}, {}, "">;
type Props = {
    /**
     * The selected character's row; null when none is selected.
     */
    character?: import("./lib/characters.js").CharacterRecord | null;
    /**
     * The story's scenes, for the Scenes view and the mention lines' headings.
     */
    scenes?: readonly {
        id: string;
        /**
         * 0-based place in the story.
         */
        index?: number;
        slugline?: string;
    }[];
    /**
     * The character's lines.
     */
    dialogues?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
        lines: readonly {
            element_id: string;
            scene_slugline: string;
            text: string;
            parenthetical?: string;
        }[];
    };
    /**
     * The selected line's element id.
     */
    selectedLine?: string;
    /**
     * Reports a selected line.
     */
    onSelectLine?: (elementId: string) => void;
    /**
     * A mention chosen in the inspector; its lines replace the view.
     */
    mention?: {
        wording: string;
        occurrences: readonly {
            referenceId: string;
            sceneId: string;
            /**
             * 1-based.
             */
            lineNumber: number;
            lineText: string;
        }[];
    } | null;
    /**
     * Reports a view chosen while a mention shows.
     */
    onClearMention?: () => void;
    /**
     * The character's detail read, which carries its analysis.
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
    };
    /**
     * The engine's standing for this character's analysis: why a stale one is stale; undefined for a character with no analysis.
     */
    standing?: {
        state: string;
        reasons?: readonly string[];
        details?: readonly unknown[];
    } | undefined;
    /**
     * The character's images read.
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
     * The character's recordings read.
     */
    recordings?: import("./lib/types.js").RecordingsRead;
    /**
     * Reports an activated recording.
     */
    onRevealRecording?: (id: string) => void;
    /**
     * The character's resolved headshot URL.
     */
    portrait?: string;
    /**
     * Offers Build appearance… when set; undefined where the host has no builder.
     */
    onBuildAppearance?: ((characterId: string) => void) | undefined;
    /**
     * Reports the view chosen.
     */
    onview?: (view: "lines" | "scenes" | "analysis" | "images" | "recordings") => void;
};

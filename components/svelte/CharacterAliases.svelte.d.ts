export default CharacterAliases;
type CharacterAliases = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const CharacterAliases: import("svelte").Component<{
    /**
     * The character's row from khaosd.
     */
    character?: import("./lib/character-aliases.js").NamedCharacter;
    /**
     * The story's characters: where a wrongly matched mention can be moved.
     */
    characters?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * Mentions left bound through a removed alias; shown only when they are this character's.
     */
    stranded?: import("./lib/types.js").Stranded | null;
    /**
     * A change is being written: every control waits.
     */
    busy?: boolean;
    /**
     * A scene's 1-based number, or null when the host does not hold it. Never invented.
     */
    sceneNumber?: (sceneId: string) => number | null;
    /**
     * Reports an alias to add.
     */
    onAdd?: (alias: string) => void;
    /**
     * Reports a confirmed removal or rejection. The confirmation stays open when it answers false.
     */
    onRemove?: (alias: string, origin: "authored" | "introduced") => boolean | void | Promise<boolean | void>;
    /**
     * Reports a confirmed move.
     */
    onMove?: (mentionIds: string[], to: import("./lib/types.js").BindTarget, destinationName: string) => void | Promise<void>;
    /**
     * Reports leaving the stranded mentions where they are.
     */
    onLeave?: () => void;
}, {}, "">;
type Props = {
    /**
     * The character's row from khaosd.
     */
    character?: import("./lib/character-aliases.js").NamedCharacter;
    /**
     * The story's characters: where a wrongly matched mention can be moved.
     */
    characters?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * Mentions left bound through a removed alias; shown only when they are this character's.
     */
    stranded?: import("./lib/types.js").Stranded | null;
    /**
     * A change is being written: every control waits.
     */
    busy?: boolean;
    /**
     * A scene's 1-based number, or null when the host does not hold it. Never invented.
     */
    sceneNumber?: (sceneId: string) => number | null;
    /**
     * Reports an alias to add.
     */
    onAdd?: (alias: string) => void;
    /**
     * Reports a confirmed removal or rejection. The confirmation stays open when it answers false.
     */
    onRemove?: (alias: string, origin: "authored" | "introduced") => boolean | void | Promise<boolean | void>;
    /**
     * Reports a confirmed move.
     */
    onMove?: (mentionIds: string[], to: import("./lib/types.js").BindTarget, destinationName: string) => void | Promise<void>;
    /**
     * Reports leaving the stranded mentions where they are.
     */
    onLeave?: () => void;
};

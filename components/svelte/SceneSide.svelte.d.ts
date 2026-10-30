export default SceneSide;
type SceneSide = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SceneSide: import("svelte").Component<{
    /**
     * The selected scene's row; null when none is selected.
     */
    scene?: import("./lib/scenes.js").SceneRecord | null;
    /**
     * The story's characters, to name who speaks and who is present.
     */
    characters?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * The story's places, to name the scene's location and the places it names.
     */
    locations?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * The story's objects.
     */
    objects?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * The host's line inspector, rendered in place of everything else while a line is selected.
     */
    line?: import("svelte").Snippet | undefined;
    /**
     * The host's scene reads, under Scene reads; the section is left out without it.
     */
    reads?: import("svelte").Snippet | undefined;
}, {}, "">;
type Props = {
    /**
     * The selected scene's row; null when none is selected.
     */
    scene?: import("./lib/scenes.js").SceneRecord | null;
    /**
     * The story's characters, to name who speaks and who is present.
     */
    characters?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * The story's places, to name the scene's location and the places it names.
     */
    locations?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * The story's objects.
     */
    objects?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * The host's line inspector, rendered in place of everything else while a line is selected.
     */
    line?: import("svelte").Snippet | undefined;
    /**
     * The host's scene reads, under Scene reads; the section is left out without it.
     */
    reads?: import("svelte").Snippet | undefined;
};

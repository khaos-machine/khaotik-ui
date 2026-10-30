export default ProjectWindow;
type ProjectWindow = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ProjectWindow: import("svelte").Component<{
    /**
     * The window's title: the project's name.
     */
    projectTitle?: string;
    /**
     * The project's read; a failure is the engine's own words.
     */
    status?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * One card per section, in the host's order.
     */
    overview?: readonly {
        section: string;
        total: number;
        analyzed: number | null;
    }[];
    /**
     * The category control's entries, in the host's order.
     */
    categories?: readonly {
        value: string;
        label: string;
    }[];
    /**
     * A category was chosen; the host opens it in the data-layer window.
     */
    onCategory?: (value: string) => void;
    /**
     * Story Player, in its own window.
     */
    onOpenPlayer?: () => void;
    /**
     * Activity, in its own window.
     */
    onOpenActivity?: () => void;
    /**
     * The project's history, below the control; absent, the window says where the story is.
     */
    history?: import("svelte").Snippet | undefined;
}, {}, "">;
type Props = {
    /**
     * The window's title: the project's name.
     */
    projectTitle?: string;
    /**
     * The project's read; a failure is the engine's own words.
     */
    status?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * One card per section, in the host's order.
     */
    overview?: readonly {
        section: string;
        total: number;
        analyzed: number | null;
    }[];
    /**
     * The category control's entries, in the host's order.
     */
    categories?: readonly {
        value: string;
        label: string;
    }[];
    /**
     * A category was chosen; the host opens it in the data-layer window.
     */
    onCategory?: (value: string) => void;
    /**
     * Story Player, in its own window.
     */
    onOpenPlayer?: () => void;
    /**
     * Activity, in its own window.
     */
    onOpenActivity?: () => void;
    /**
     * The project's history, below the control; absent, the window says where the story is.
     */
    history?: import("svelte").Snippet | undefined;
};

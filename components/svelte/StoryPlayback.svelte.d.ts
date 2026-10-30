export default StoryPlayback;
type StoryPlayback = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StoryPlayback: import("svelte").Component<{
    /**
     * The playback read.
     */
    state?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * Every scene and section, in story order.
     */
    segments?: readonly {
        kind: "scene" | "section";
        sceneId?: string;
        sectionId?: string;
        label: string;
        timing?: string;
        audio?: unknown;
        reads?: readonly unknown[];
        context?: {
            characters: readonly {
                id: string;
                name: string;
                role: string;
                portraitReferenceId: string;
            }[];
        } | null;
    }[];
    /**
     * The segment under the playhead.
     */
    current?: {
        kind: "scene" | "section";
        sceneId?: string;
        sectionId?: string;
        label: string;
        timing?: string;
        audio?: unknown;
        reads?: readonly unknown[];
        context?: {
            characters: readonly {
                id: string;
                name: string;
                role: string;
                portraitReferenceId: string;
            }[];
        } | null;
    } | null;
    /**
     * The scene the person chose in the navigator, or ''; while set it is marked, not the playing one.
     */
    selectedSceneId?: string;
    /**
     * The line under the playhead.
     */
    focus?: {
        characterId?: string;
        characterName?: string;
        elementType: string;
        text?: string;
    } | null;
    /**
     * Portraits, keyed by reference id.
     */
    portraits?: Record<string, {
        state: "loading";
    } | {
        state: "ready";
        url: string;
    } | {
        state: "failed";
        message: string;
    }>;
    /**
     * The Composer's frame under the playhead, drawn blurred behind everything.
     */
    frame?: {
        id: string;
        url: string;
    } | null;
    /**
     * The Composer is open: the panes float over the frame.
     */
    composing?: boolean;
    /**
     * Whether the transport is running: the playing scene is marked, and the focus transport says Pause.
     */
    playing?: boolean;
    /**
     * The playhead, in seconds, for the focus transport.
     */
    time?: number;
    /**
     * The transport waits.
     */
    busy?: boolean;
    /**
     * A status line under the stage, or ''.
     */
    message?: string;
    /**
     * Inside another window: it fills its host, not the viewport.
     */
    embedded?: boolean;
    /**
     * Shows the scene navigator.
     */
    showSidebar?: boolean;
    /**
     * Shows the inspector.
     */
    showInspector?: boolean;
    /**
     * There is something to inspect.
     */
    inspectorOpen?: boolean;
    /**
     * Only the stage shows.
     */
    focusMode?: boolean;
    /**
     * Reports focus mode toggled.
     */
    onFocusModeChange?: (on: boolean) => void;
    /**
     * Reports a scene or section chosen in the navigator.
     */
    onNavigate?: (id: string) => void;
    /**
     * Asks for the readings of the scene under the playhead.
     */
    onOpenReadings?: (sceneId: string) => void;
    /**
     * The focus transport's Play and Pause.
     */
    onTogglePlay?: () => void;
    /**
     * Asks for the text preview when read playback cannot open.
     */
    onPreviewText?: () => void;
    /**
     * Shows the text preview in place of read playback.
     */
    textPreview?: boolean;
    /**
     * Asks to return to read playback.
     */
    onLeavePreview?: () => void;
    /**
     * The host's stage, in place of the line under the playhead: the Composer's shot.
     */
    monitor?: import("svelte").Snippet | undefined;
    /**
     * The host's inspector content.
     */
    inspector?: import("svelte").Snippet | undefined;
    /**
     * The host's timeline.
     */
    timeline?: import("svelte").Snippet | undefined;
    /**
     * The host's text preview.
     */
    preview?: import("svelte").Snippet | undefined;
}, {}, "">;
type Props = {
    /**
     * The playback read.
     */
    state?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * Every scene and section, in story order.
     */
    segments?: readonly {
        kind: "scene" | "section";
        sceneId?: string;
        sectionId?: string;
        label: string;
        timing?: string;
        audio?: unknown;
        reads?: readonly unknown[];
        context?: {
            characters: readonly {
                id: string;
                name: string;
                role: string;
                portraitReferenceId: string;
            }[];
        } | null;
    }[];
    /**
     * The segment under the playhead.
     */
    current?: {
        kind: "scene" | "section";
        sceneId?: string;
        sectionId?: string;
        label: string;
        timing?: string;
        audio?: unknown;
        reads?: readonly unknown[];
        context?: {
            characters: readonly {
                id: string;
                name: string;
                role: string;
                portraitReferenceId: string;
            }[];
        } | null;
    } | null;
    /**
     * The scene the person chose in the navigator, or ''; while set it is marked, not the playing one.
     */
    selectedSceneId?: string;
    /**
     * The line under the playhead.
     */
    focus?: {
        characterId?: string;
        characterName?: string;
        elementType: string;
        text?: string;
    } | null;
    /**
     * Portraits, keyed by reference id.
     */
    portraits?: Record<string, {
        state: "loading";
    } | {
        state: "ready";
        url: string;
    } | {
        state: "failed";
        message: string;
    }>;
    /**
     * The Composer's frame under the playhead, drawn blurred behind everything.
     */
    frame?: {
        id: string;
        url: string;
    } | null;
    /**
     * The Composer is open: the panes float over the frame.
     */
    composing?: boolean;
    /**
     * Whether the transport is running: the playing scene is marked, and the focus transport says Pause.
     */
    playing?: boolean;
    /**
     * The playhead, in seconds, for the focus transport.
     */
    time?: number;
    /**
     * The transport waits.
     */
    busy?: boolean;
    /**
     * A status line under the stage, or ''.
     */
    message?: string;
    /**
     * Inside another window: it fills its host, not the viewport.
     */
    embedded?: boolean;
    /**
     * Shows the scene navigator.
     */
    showSidebar?: boolean;
    /**
     * Shows the inspector.
     */
    showInspector?: boolean;
    /**
     * There is something to inspect.
     */
    inspectorOpen?: boolean;
    /**
     * Only the stage shows.
     */
    focusMode?: boolean;
    /**
     * Reports focus mode toggled.
     */
    onFocusModeChange?: (on: boolean) => void;
    /**
     * Reports a scene or section chosen in the navigator.
     */
    onNavigate?: (id: string) => void;
    /**
     * Asks for the readings of the scene under the playhead.
     */
    onOpenReadings?: (sceneId: string) => void;
    /**
     * The focus transport's Play and Pause.
     */
    onTogglePlay?: () => void;
    /**
     * Asks for the text preview when read playback cannot open.
     */
    onPreviewText?: () => void;
    /**
     * Shows the text preview in place of read playback.
     */
    textPreview?: boolean;
    /**
     * Asks to return to read playback.
     */
    onLeavePreview?: () => void;
    /**
     * The host's stage, in place of the line under the playhead: the Composer's shot.
     */
    monitor?: import("svelte").Snippet | undefined;
    /**
     * The host's inspector content.
     */
    inspector?: import("svelte").Snippet | undefined;
    /**
     * The host's timeline.
     */
    timeline?: import("svelte").Snippet | undefined;
    /**
     * The host's text preview.
     */
    preview?: import("svelte").Snippet | undefined;
};

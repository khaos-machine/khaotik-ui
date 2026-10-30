export default Player;
type Player = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Player: import("svelte").Component<{
    /**
     * The composition read.
     */
    state?: {
        kind: "loading";
    } | {
        kind: "uncomposed";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * The composition's segments, as StoryPlayer takes them.
     */
    segments?: readonly any[];
    /**
     * The same segments as `buildTimeline` builds them (lib/timeline.js).
     */
    timeline?: {
        segments: readonly {
            sceneId?: string;
            sectionId?: string;
            label: string;
            duration: number | null;
            events: readonly {
                elementId: string;
                elementType: string;
                characterName?: string;
                text?: string;
                duration: number | null;
            }[];
        }[];
    };
    /**
     * The playing scene's position in the timeline, or -1.
     */
    currentSceneIndex?: number;
    /**
     * The inspected scene's position, or -1.
     */
    selectedSceneIndex?: number;
    /**
     * The beat under the playhead, as the composition holds it.
     */
    focus?: {
        elementId: string;
        elementType: string;
        characterName?: string;
        text?: string;
    } | null;
    /**
     * The scene under the playhead.
     */
    playingScene?: {
        sceneId?: string;
        sectionId?: string;
        label: string;
        duration: number | null;
        events: readonly {
            elementId: string;
            elementType: string;
            characterName?: string;
            text?: string;
            duration: number | null;
        }[];
    } | null;
    /**
     * The selected scene.
     */
    inspected?: {
        sceneId?: string;
        sectionId?: string;
        label: string;
        duration: number | null;
        events: readonly {
            elementId: string;
            elementType: string;
            characterName?: string;
            text?: string;
            duration: number | null;
        }[];
    } | null;
    /**
     * The speaking character, or ''.
     */
    activeCharacterName?: string;
    /**
     * The selected scene's text; 'none' when the engine has none.
     */
    sceneText?: {
        kind: "idle";
    } | {
        kind: "loading";
    } | {
        kind: "text";
        text: string;
    } | {
        kind: "none";
    } | {
        kind: "failed";
        message: string;
    };
    /**
     * The playhead, in seconds.
     */
    currentTime?: number;
    /**
     * The composition's length, in seconds.
     */
    total?: number;
    /**
     * Whether the transport is running.
     */
    playing?: boolean;
    /**
     * The timeline's zoom.
     */
    scale?: number;
    /**
     * The beat chosen on the timeline, or ''.
     */
    selectedElementId?: string;
    /**
     * Whether the player is on screen; the keyboard waits while it is not.
     */
    active?: boolean;
    /**
     * Reports a scene chosen for the inspector.
     */
    onSelectScene?: (index: number) => void;
    /**
     * Asks to move the playhead to a scene (double-click).
     */
    onGoToScene?: (index: number) => void;
    /**
     * Reports a beat chosen.
     */
    onSelect?: (elementId: string) => void;
    /**
     * Asks to move the playhead.
     */
    onSeek?: (seconds: number) => void;
    /**
     * Asks to play or pause (Space).
     */
    onTogglePlay?: () => void;
    /**
     * Reports the timeline zoomed.
     */
    onScaleChange?: (scale: number) => void;
    /**
     * → key.
     */
    onNextBeat?: () => void;
    /**
     * ← key.
     */
    onPreviousBeat?: () => void;
    /**
     * ↓ key.
     */
    onNextScene?: () => void;
    /**
     * ↑ key.
     */
    onPreviousScene?: () => void;
    /**
     * Home.
     */
    onToStart?: () => void;
    /**
     * End.
     */
    onToEnd?: () => void;
}, {}, "">;
type Props = {
    /**
     * The composition read.
     */
    state?: {
        kind: "loading";
    } | {
        kind: "uncomposed";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * The composition's segments, as StoryPlayer takes them.
     */
    segments?: readonly any[];
    /**
     * The same segments as `buildTimeline` builds them (lib/timeline.js).
     */
    timeline?: {
        segments: readonly {
            sceneId?: string;
            sectionId?: string;
            label: string;
            duration: number | null;
            events: readonly {
                elementId: string;
                elementType: string;
                characterName?: string;
                text?: string;
                duration: number | null;
            }[];
        }[];
    };
    /**
     * The playing scene's position in the timeline, or -1.
     */
    currentSceneIndex?: number;
    /**
     * The inspected scene's position, or -1.
     */
    selectedSceneIndex?: number;
    /**
     * The beat under the playhead, as the composition holds it.
     */
    focus?: {
        elementId: string;
        elementType: string;
        characterName?: string;
        text?: string;
    } | null;
    /**
     * The scene under the playhead.
     */
    playingScene?: {
        sceneId?: string;
        sectionId?: string;
        label: string;
        duration: number | null;
        events: readonly {
            elementId: string;
            elementType: string;
            characterName?: string;
            text?: string;
            duration: number | null;
        }[];
    } | null;
    /**
     * The selected scene.
     */
    inspected?: {
        sceneId?: string;
        sectionId?: string;
        label: string;
        duration: number | null;
        events: readonly {
            elementId: string;
            elementType: string;
            characterName?: string;
            text?: string;
            duration: number | null;
        }[];
    } | null;
    /**
     * The speaking character, or ''.
     */
    activeCharacterName?: string;
    /**
     * The selected scene's text; 'none' when the engine has none.
     */
    sceneText?: {
        kind: "idle";
    } | {
        kind: "loading";
    } | {
        kind: "text";
        text: string;
    } | {
        kind: "none";
    } | {
        kind: "failed";
        message: string;
    };
    /**
     * The playhead, in seconds.
     */
    currentTime?: number;
    /**
     * The composition's length, in seconds.
     */
    total?: number;
    /**
     * Whether the transport is running.
     */
    playing?: boolean;
    /**
     * The timeline's zoom.
     */
    scale?: number;
    /**
     * The beat chosen on the timeline, or ''.
     */
    selectedElementId?: string;
    /**
     * Whether the player is on screen; the keyboard waits while it is not.
     */
    active?: boolean;
    /**
     * Reports a scene chosen for the inspector.
     */
    onSelectScene?: (index: number) => void;
    /**
     * Asks to move the playhead to a scene (double-click).
     */
    onGoToScene?: (index: number) => void;
    /**
     * Reports a beat chosen.
     */
    onSelect?: (elementId: string) => void;
    /**
     * Asks to move the playhead.
     */
    onSeek?: (seconds: number) => void;
    /**
     * Asks to play or pause (Space).
     */
    onTogglePlay?: () => void;
    /**
     * Reports the timeline zoomed.
     */
    onScaleChange?: (scale: number) => void;
    /**
     * → key.
     */
    onNextBeat?: () => void;
    /**
     * ← key.
     */
    onPreviousBeat?: () => void;
    /**
     * ↓ key.
     */
    onNextScene?: () => void;
    /**
     * ↑ key.
     */
    onPreviousScene?: () => void;
    /**
     * Home.
     */
    onToStart?: () => void;
    /**
     * End.
     */
    onToEnd?: () => void;
};

export default PlaybackEventInspector;
type PlaybackEventInspector = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PlaybackEventInspector: import("svelte").Component<{
    /**
     * The scene under the playhead. Defaults to a scene with no readings.
     */
    scene?: {
        /**
         * The segment kind; only a scene manages readings.
         */
        kind: "scene" | string;
        /**
         * Whether the timing is a measured read or estimated.
         */
        timing: "read" | "estimated" | string;
        /**
         * The scene's readings.
         */
        reads: readonly {
            /**
             * The reading's id.
             */
            id: string;
            /**
             * Whether it is the scene's chosen reading.
             */
            chosen?: boolean;
            /**
             * When it was made, as an ISO timestamp.
             */
            createdAt?: string;
        }[];
        /**
         * The reading supplying the audio, if one is chosen.
         */
        audio?: {
            takeId: string;
            stale?: boolean | null;
        } | null;
    };
    /**
     * The event under the playhead; null between events.
     */
    event?: {
        /**
         * The screenplay element: `dialogue`, `action`, …
         */
        elementType: string;
        /**
         * The speaker's name as the script gives it.
         */
        characterName?: string;
        /**
         * The line's direction, if any.
         */
        parenthetical?: string;
        /**
         * The event's text. khaosd omits it for an event with none.
         */
        text?: string;
        /**
         * Where it starts, in seconds.
         */
        start: number;
        /**
         * How long it runs, in seconds; null when unknown.
         */
        duration: number | null;
    } | null;
    /**
     * The speaking character, when the event is a line.
     */
    character?: {
        id: string;
        name: string;
    } | undefined;
    /**
     * The speaker's portrait URL.
     */
    portrait?: string;
    /**
     * Whether the audio is an audition rather than the chosen reading.
     */
    auditioning?: boolean;
    /**
     * Reports Manage readings.
     */
    onReadings?: () => void;
    /**
     * Reports Go to event.
     */
    onSeek?: () => void;
    /**
     * Reports Open in Data.
     */
    onData?: () => void;
    /**
     * Reports Add shot for event. Without it the action is absent.
     */
    onAddShot?: () => void;
    /**
     * Reports Inspect covering shot. Without it the action is absent.
     */
    onShot?: () => void;
}, {}, "">;
type Props = {
    /**
     * The scene under the playhead. Defaults to a scene with no readings.
     */
    scene?: {
        /**
         * The segment kind; only a scene manages readings.
         */
        kind: "scene" | string;
        /**
         * Whether the timing is a measured read or estimated.
         */
        timing: "read" | "estimated" | string;
        /**
         * The scene's readings.
         */
        reads: readonly {
            /**
             * The reading's id.
             */
            id: string;
            /**
             * Whether it is the scene's chosen reading.
             */
            chosen?: boolean;
            /**
             * When it was made, as an ISO timestamp.
             */
            createdAt?: string;
        }[];
        /**
         * The reading supplying the audio, if one is chosen.
         */
        audio?: {
            takeId: string;
            stale?: boolean | null;
        } | null;
    };
    /**
     * The event under the playhead; null between events.
     */
    event?: {
        /**
         * The screenplay element: `dialogue`, `action`, …
         */
        elementType: string;
        /**
         * The speaker's name as the script gives it.
         */
        characterName?: string;
        /**
         * The line's direction, if any.
         */
        parenthetical?: string;
        /**
         * The event's text. khaosd omits it for an event with none.
         */
        text?: string;
        /**
         * Where it starts, in seconds.
         */
        start: number;
        /**
         * How long it runs, in seconds; null when unknown.
         */
        duration: number | null;
    } | null;
    /**
     * The speaking character, when the event is a line.
     */
    character?: {
        id: string;
        name: string;
    } | undefined;
    /**
     * The speaker's portrait URL.
     */
    portrait?: string;
    /**
     * Whether the audio is an audition rather than the chosen reading.
     */
    auditioning?: boolean;
    /**
     * Reports Manage readings.
     */
    onReadings?: () => void;
    /**
     * Reports Go to event.
     */
    onSeek?: () => void;
    /**
     * Reports Open in Data.
     */
    onData?: () => void;
    /**
     * Reports Add shot for event. Without it the action is absent.
     */
    onAddShot?: () => void;
    /**
     * Reports Inspect covering shot. Without it the action is absent.
     */
    onShot?: () => void;
};

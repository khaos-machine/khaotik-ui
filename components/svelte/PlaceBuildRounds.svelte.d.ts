export default PlaceBuildRounds;
type PlaceBuildRounds = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PlaceBuildRounds: import("svelte").Component<{
    /**
     * The rounds written so far, oldest first.
     */
    rounds?: readonly {
        /**
         * The round's number, from 1.
         */
        round: number;
        /**
         * A render round, the submitted one, or the draft written when the job stopped.
         */
        kind: "draft" | "submitted" | "final";
        /**
         * How many camera problems its placement report has.
         */
        problems: number;
        /**
         * The round's line art, as a URL the host resolved.
         */
        thumbnail?: string;
        /**
         * The thumbnail is on its way.
         */
        loading?: boolean;
    }[];
    /**
     * The job is queued or running: a pending tile follows the rounds.
     */
    running?: boolean;
    /**
     * The spend so far, formatted, e.g. "$0.04".
     */
    spend?: string;
    /**
     * '' while running; once the job ends, a plain line saying how.
     */
    outcome?: string;
    /**
     * The selected round's number; the newest when absent.
     */
    selected?: number;
    /**
     * Asked with a round's number.
     */
    onselect?: (round: number) => void;
    /**
     * The selected round's views.
     */
    detail?: {
        /**
         * The selected round's camera views.
         */
        cameras: readonly {
            /**
             * The camera's id.
             */
            id: string;
            /**
             * What to call it; the id when absent.
             */
            label?: string;
            /**
             * Its line art, as a URL the host resolved.
             */
            url?: string;
            /**
             * The line art is on its way.
             */
            loading?: boolean;
            /**
             * Its placement problems, as sentences.
             */
            problems: readonly string[];
        }[];
        /**
         * The rooms no camera sees, by name.
         */
        unseenRooms: readonly string[];
    } | null;
}, {}, "">;
type Props = {
    /**
     * The rounds written so far, oldest first.
     */
    rounds?: readonly {
        /**
         * The round's number, from 1.
         */
        round: number;
        /**
         * A render round, the submitted one, or the draft written when the job stopped.
         */
        kind: "draft" | "submitted" | "final";
        /**
         * How many camera problems its placement report has.
         */
        problems: number;
        /**
         * The round's line art, as a URL the host resolved.
         */
        thumbnail?: string;
        /**
         * The thumbnail is on its way.
         */
        loading?: boolean;
    }[];
    /**
     * The job is queued or running: a pending tile follows the rounds.
     */
    running?: boolean;
    /**
     * The spend so far, formatted, e.g. "$0.04".
     */
    spend?: string;
    /**
     * '' while running; once the job ends, a plain line saying how.
     */
    outcome?: string;
    /**
     * The selected round's number; the newest when absent.
     */
    selected?: number;
    /**
     * Asked with a round's number.
     */
    onselect?: (round: number) => void;
    /**
     * The selected round's views.
     */
    detail?: {
        /**
         * The selected round's camera views.
         */
        cameras: readonly {
            /**
             * The camera's id.
             */
            id: string;
            /**
             * What to call it; the id when absent.
             */
            label?: string;
            /**
             * Its line art, as a URL the host resolved.
             */
            url?: string;
            /**
             * The line art is on its way.
             */
            loading?: boolean;
            /**
             * Its placement problems, as sentences.
             */
            problems: readonly string[];
        }[];
        /**
         * The rooms no camera sees, by name.
         */
        unseenRooms: readonly string[];
    } | null;
};

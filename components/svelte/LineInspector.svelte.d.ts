export default LineInspector;
type LineInspector = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const LineInspector: import("svelte").Component<{
    /**
     * The event, or null when the composition does not hold it.
     */
    event?: {
        /**
         * The screenplay element: `action`, `dialogue`, `transition`, …
         */
        elementType: string;
        /**
         * The event's text. khaosd omits it for an event with none.
         */
        text?: string;
        /**
         * The speaker's name, for a line.
         */
        characterName?: string;
        /**
         * The speaker's id, for a line.
         */
        characterId?: string;
        /**
         * The line's direction.
         */
        parenthetical?: string;
    } | null;
    /**
     * The host's dialogue inspector, rendered in place of the event view for a dialogue line.
     */
    dialogue?: import("svelte").Snippet;
    /**
     * What Back says: where it returns to.
     */
    backLabel?: string;
    /**
     * Reports Back, or Esc outside a dialogue line.
     */
    onclear?: () => void;
    /**
     * Reports the speaker to show.
     */
    onRevealCharacter?: (characterId: string) => void;
}, {}, "">;
type Props = {
    /**
     * The event, or null when the composition does not hold it.
     */
    event?: {
        /**
         * The screenplay element: `action`, `dialogue`, `transition`, …
         */
        elementType: string;
        /**
         * The event's text. khaosd omits it for an event with none.
         */
        text?: string;
        /**
         * The speaker's name, for a line.
         */
        characterName?: string;
        /**
         * The speaker's id, for a line.
         */
        characterId?: string;
        /**
         * The line's direction.
         */
        parenthetical?: string;
    } | null;
    /**
     * The host's dialogue inspector, rendered in place of the event view for a dialogue line.
     */
    dialogue?: import("svelte").Snippet;
    /**
     * What Back says: where it returns to.
     */
    backLabel?: string;
    /**
     * Reports Back, or Esc outside a dialogue line.
     */
    onclear?: () => void;
    /**
     * Reports the speaker to show.
     */
    onRevealCharacter?: (characterId: string) => void;
};

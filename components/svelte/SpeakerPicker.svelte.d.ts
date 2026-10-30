export default SpeakerPicker;
type SpeakerPicker = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SpeakerPicker: import("svelte").Component<{
    /**
     * The speakers to choose from.
     */
    speakers?: readonly {
        /**
         * The speaker id (e.g. `aiden`).
         */
        id: string;
        /**
         * The display name (e.g. `Aiden`).
         */
        name: string;
    }[];
    /**
     * The selected speaker id.
     */
    selected?: string;
    /**
     * Called with the chosen speaker id.
     */
    onselect?: (id: string) => void;
    /**
     * Accessible name for the group. Defaults to "Speakers".
     */
    label?: string;
    /**
     * Every chip renders `aria-disabled="true"`, stays focusable, and never calls `onselect`. The selection stays drawn.
     */
    disabled?: boolean;
    /**
     * The id of the speaker whose choice the host has sent and is waiting on. That chip renders `aria-busy` and a spinner, and the picker takes no other choice until it clears. **Consumer-driven, never inferred**, the same contract as `ServiceStatusList.pendingId`.
     */
    pendingId?: string;
}, {}, "">;
type Props = {
    /**
     * The speakers to choose from.
     */
    speakers?: readonly {
        /**
         * The speaker id (e.g. `aiden`).
         */
        id: string;
        /**
         * The display name (e.g. `Aiden`).
         */
        name: string;
    }[];
    /**
     * The selected speaker id.
     */
    selected?: string;
    /**
     * Called with the chosen speaker id.
     */
    onselect?: (id: string) => void;
    /**
     * Accessible name for the group. Defaults to "Speakers".
     */
    label?: string;
    /**
     * Every chip renders `aria-disabled="true"`, stays focusable, and never calls `onselect`. The selection stays drawn.
     */
    disabled?: boolean;
    /**
     * The id of the speaker whose choice the host has sent and is waiting on. That chip renders `aria-busy` and a spinner, and the picker takes no other choice until it clears. **Consumer-driven, never inferred**, the same contract as `ServiceStatusList.pendingId`.
     */
    pendingId?: string;
};

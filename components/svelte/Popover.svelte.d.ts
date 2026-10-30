export default Popover;
type Popover = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Popover: import("svelte").Component<{
    /**
     * What is being picked ("Voice"); names the trigger, the panel and the search.
     */
    label?: string;
    /**
     * The trigger's text: the current choice, in the host's words.
     */
    value?: string;
    /**
     * What can be picked, in order; the suggested item is moved first.
     */
    items?: readonly import("./lib/picker.js").PickerItem[];
    /**
     * The id listed first and marked as suggested.
     */
    suggested?: string;
    /**
     * Asked with the picked item's id.
     */
    onpick?: (id: string) => void;
    /**
     * Present when picking is unavailable; the trigger carries it.
     */
    disabledReason?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * What is being picked ("Voice"); names the trigger, the panel and the search.
     */
    label?: string;
    /**
     * The trigger's text: the current choice, in the host's words.
     */
    value?: string;
    /**
     * What can be picked, in order; the suggested item is moved first.
     */
    items?: readonly import("./lib/picker.js").PickerItem[];
    /**
     * The id listed first and marked as suggested.
     */
    suggested?: string;
    /**
     * Asked with the picked item's id.
     */
    onpick?: (id: string) => void;
    /**
     * Present when picking is unavailable; the trigger carries it.
     */
    disabledReason?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};

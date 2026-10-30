export default Menu;
type Menu = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Menu: import("svelte").Component<{
    /**
     * Names what is being chosen ("Workspace"); prefixes the trigger `aria-label`, so the trigger announces both the control and its current value.
     */
    label?: string;
    /**
     * Selected item `value`; may match no item (see `currentLabel`). Controlled: choosing calls `onselect` and moves nothing until the caller updates `value`.
     */
    value?: string;
    /**
     * See MenuItem.
     */
    items?: readonly {
        /**
         * Matched against `value`. **Unique across the whole list, groups included** — Menu throws naming the duplicate; compose `provider/id` when groups share an id. `""` is legitimate and never truth-tested.
         */
        value: string;
        /**
         * Visible text; also what typeahead matches.
         */
        label: string;
        /**
         * Heading the item sits under; groups render in first-appearance order. Absent: the unlabelled group.
         */
        group?: string;
        /**
         * Provider id for a `ProviderMark` beside the heading, read from the group's first item. The heading text carries the name; the mark is `aria-hidden` (ProviderMark.svelte:23-24).
         */
        groupMark?: string;
        /**
         * Shown, reachable by arrow keys and typeahead, announced — never selected: choosing it keeps the menu open and calls nothing.
         */
        unavailable?: boolean;
        /**
         * Why it is unavailable; rendered under the label and announced via `aria-describedby`. Ignored unless `unavailable`.
         */
        reason?: string;
    }[];
    /**
     * What the trigger shows when `value` matches no item (a stored value nothing serves). A matching item's `label` wins.
     */
    currentLabel?: string;
    /**
     * The whole control, e.g. while a save is in flight: the trigger stays focusable and is announced disabled, cannot open, and no selection is accepted.
     */
    disabled?: boolean;
    /**
     * Called with the new `value` when an item is chosen.
     */
    onselect?: (value: string) => void;
}, {}, "">;
type Props = {
    /**
     * Names what is being chosen ("Workspace"); prefixes the trigger `aria-label`, so the trigger announces both the control and its current value.
     */
    label?: string;
    /**
     * Selected item `value`; may match no item (see `currentLabel`). Controlled: choosing calls `onselect` and moves nothing until the caller updates `value`.
     */
    value?: string;
    /**
     * See MenuItem.
     */
    items?: readonly {
        /**
         * Matched against `value`. **Unique across the whole list, groups included** — Menu throws naming the duplicate; compose `provider/id` when groups share an id. `""` is legitimate and never truth-tested.
         */
        value: string;
        /**
         * Visible text; also what typeahead matches.
         */
        label: string;
        /**
         * Heading the item sits under; groups render in first-appearance order. Absent: the unlabelled group.
         */
        group?: string;
        /**
         * Provider id for a `ProviderMark` beside the heading, read from the group's first item. The heading text carries the name; the mark is `aria-hidden` (ProviderMark.svelte:23-24).
         */
        groupMark?: string;
        /**
         * Shown, reachable by arrow keys and typeahead, announced — never selected: choosing it keeps the menu open and calls nothing.
         */
        unavailable?: boolean;
        /**
         * Why it is unavailable; rendered under the label and announced via `aria-describedby`. Ignored unless `unavailable`.
         */
        reason?: string;
    }[];
    /**
     * What the trigger shows when `value` matches no item (a stored value nothing serves). A matching item's `label` wins.
     */
    currentLabel?: string;
    /**
     * The whole control, e.g. while a save is in flight: the trigger stays focusable and is announced disabled, cannot open, and no selection is accepted.
     */
    disabled?: boolean;
    /**
     * Called with the new `value` when an item is chosen.
     */
    onselect?: (value: string) => void;
};

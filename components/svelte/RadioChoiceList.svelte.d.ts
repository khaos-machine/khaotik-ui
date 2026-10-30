export default RadioChoiceList;
type RadioChoiceList = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const RadioChoiceList: import("svelte").Component<{
    /**
     * Controlled; the selected option's `value`.
     */
    value?: string;
    /**
     * The options, in order.
     */
    options?: readonly {
        /**
         * Reported to `onchange`, and matched against `value`. **Values must be distinct.**
         */
        value: string;
        /**
         * The option's name.
         */
        title: string;
        /**
         * One line under the title; the option's accessible description.
         */
        caption: string;
    }[];
    /**
     * Names the choice; the group's accessible name.
     */
    label?: string;
    /**
     * One line under the group, such as why an option is suggested.
     */
    note?: string;
    /**
     * Dimmed, and asks nothing.
     */
    disabled?: boolean;
    /**
     * Asked with the newly chosen value.
     */
    onchange?: (value: string) => void;
    /**
     * The `data-ui-id` (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * Controlled; the selected option's `value`.
     */
    value?: string;
    /**
     * The options, in order.
     */
    options?: readonly {
        /**
         * Reported to `onchange`, and matched against `value`. **Values must be distinct.**
         */
        value: string;
        /**
         * The option's name.
         */
        title: string;
        /**
         * One line under the title; the option's accessible description.
         */
        caption: string;
    }[];
    /**
     * Names the choice; the group's accessible name.
     */
    label?: string;
    /**
     * One line under the group, such as why an option is suggested.
     */
    note?: string;
    /**
     * Dimmed, and asks nothing.
     */
    disabled?: boolean;
    /**
     * Asked with the newly chosen value.
     */
    onchange?: (value: string) => void;
    /**
     * The `data-ui-id` (audit §3.14).
     */
    uiId?: string;
};

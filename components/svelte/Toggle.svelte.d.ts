export default Toggle;
type Toggle = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Toggle: import("svelte").Component<{
    /**
     * What the setting is.
     */
    label?: string;
    /**
     * Supporting line under the label, for a setting whose consequence is not obvious from its name. Not a tooltip — that would hide it from the person reading the settings screen to find out.
     */
    hint?: string;
    /**
     * Controlled — the host owns the value.
     */
    checked?: boolean;
    /**
     * Renders dimmed and ignores input.
     */
    disabled?: boolean;
    /**
     * Called with the new boolean.
     */
    onchange?: (checked: boolean) => void;
}, {}, "">;
type Props = {
    /**
     * What the setting is.
     */
    label?: string;
    /**
     * Supporting line under the label, for a setting whose consequence is not obvious from its name. Not a tooltip — that would hide it from the person reading the settings screen to find out.
     */
    hint?: string;
    /**
     * Controlled — the host owns the value.
     */
    checked?: boolean;
    /**
     * Renders dimmed and ignores input.
     */
    disabled?: boolean;
    /**
     * Called with the new boolean.
     */
    onchange?: (checked: boolean) => void;
};

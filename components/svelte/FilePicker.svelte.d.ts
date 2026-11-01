export default FilePicker;
type FilePicker = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const FilePicker: import("svelte").Component<{
    /**
     * The button's text, which also names the hidden file input.
     */
    label?: string;
    /**
     * The input's `accept`: a hint to the picker, not a check.
     */
    accept?: string;
    /**
     * Turns the button off, so nothing can be picked.
     */
    disabled?: boolean;
    /**
     * A quiet text button with no icon, in place of the secondary button with an upload icon.
     */
    quiet?: boolean;
    /**
     * Called with the file chosen.
     */
    onfile?: (file: File) => void;
}, {}, "">;
type Props = {
    /**
     * The button's text, which also names the hidden file input.
     */
    label?: string;
    /**
     * The input's `accept`: a hint to the picker, not a check.
     */
    accept?: string;
    /**
     * Turns the button off, so nothing can be picked.
     */
    disabled?: boolean;
    /**
     * A quiet text button with no icon, in place of the secondary button with an upload icon.
     */
    quiet?: boolean;
    /**
     * Called with the file chosen.
     */
    onfile?: (file: File) => void;
};

export default EditableField;
type EditableField = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const EditableField: import("svelte").Component<{
    /**
     * The prose value shown read-only; `—` when empty.
     */
    value?: string;
    /**
     * The field caption (right-aligned). Also disambiguates the Edit and Copy buttons' accessible names, so two fields on one page do not both read "Edit".
     */
    label?: string;
    /**
     * Textarea placeholder while editing.
     */
    placeholder?: string;
    /**
     * Called with the edited value on Save, and on click-away — Ark's default commits a blur rather than discarding it.
     */
    onsave?: (value: string) => void;
    /**
     * Called on Cancel and on Escape. NOT called for click-away: leaving the field commits the draft, it does not destroy it.
     */
    oncancel?: () => void;
}, {}, "">;
type Props = {
    /**
     * The prose value shown read-only; `—` when empty.
     */
    value?: string;
    /**
     * The field caption (right-aligned). Also disambiguates the Edit and Copy buttons' accessible names, so two fields on one page do not both read "Edit".
     */
    label?: string;
    /**
     * Textarea placeholder while editing.
     */
    placeholder?: string;
    /**
     * Called with the edited value on Save, and on click-away — Ark's default commits a blur rather than discarding it.
     */
    onsave?: (value: string) => void;
    /**
     * Called on Cancel and on Escape. NOT called for click-away: leaving the field commits the draft, it does not destroy it.
     */
    oncancel?: () => void;
};

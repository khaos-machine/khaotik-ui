export default Button;
type Button = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Button: import("svelte").Component<{
    /**
     * `primary` is the one amber action on a screen; `secondary` is every other action; `text` is the inline link look, for an action inside a sentence or a banner.
     */
    variant?: "primary" | "secondary" | "text" | "tool";
    /**
     * Tooltip for compact tools and unavailable-action explanations.
     */
    title?: string;
    /**
     * Renders `aria-disabled="true"`, stays focusable, and never calls `onclick`.
     */
    disabled?: boolean;
    /**
     * Leading Phosphor glyph name (kebab-case), `aria-hidden`.
     */
    icon?: string;
    /**
     * The native button type.
     */
    type?: "button" | "submit";
    /**
     * Passed through as `aria-describedby` — the id of the line that explains this action, or why it is unavailable.
     */
    describedby?: string;
    /**
     * Called on activation, unless disabled.
     */
    onclick?: (event: MouseEvent) => void;
    /**
     * The label, and the accessible name. Always pass one: optional only in type, like every prop in the kit (props-optionality.test.js).
     */
    children?: import("svelte").Snippet;
}, {}, "">;
type Props = {
    /**
     * `primary` is the one amber action on a screen; `secondary` is every other action; `text` is the inline link look, for an action inside a sentence or a banner.
     */
    variant?: "primary" | "secondary" | "text" | "tool";
    /**
     * Tooltip for compact tools and unavailable-action explanations.
     */
    title?: string;
    /**
     * Renders `aria-disabled="true"`, stays focusable, and never calls `onclick`.
     */
    disabled?: boolean;
    /**
     * Leading Phosphor glyph name (kebab-case), `aria-hidden`.
     */
    icon?: string;
    /**
     * The native button type.
     */
    type?: "button" | "submit";
    /**
     * Passed through as `aria-describedby` — the id of the line that explains this action, or why it is unavailable.
     */
    describedby?: string;
    /**
     * Called on activation, unless disabled.
     */
    onclick?: (event: MouseEvent) => void;
    /**
     * The label, and the accessible name. Always pass one: optional only in type, like every prop in the kit (props-optionality.test.js).
     */
    children?: import("svelte").Snippet;
};

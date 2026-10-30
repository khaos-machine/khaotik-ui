export default SelectableRow;
type SelectableRow = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SelectableRow: import("svelte").Component<{
    /**
     * Row title, and the accessible name of the button (D52).
     */
    title?: string;
    /**
     * Optional second line, `aria-hidden`.
     */
    subtitle?: string;
    /**
     * Optional tabular prefix rendered before the subtitle — `S1`, `S2`.
     */
    subtitlePrefix?: string;
    /**
     * Optional leading Phosphor icon name (fill weight).
     */
    icon?: string;
    /**
     * Draws the selected border and background, and sets `aria-current` so a screen-reader user can tell which row is chosen. D52 names the row; it does not excuse dropping state.
     */
    selected?: boolean;
    /**
     * Entity name for a leading square `Portrait` thumbnail, instead of `icon`.
     */
    thumb?: string;
    /**
     * Which template glyph the thumbnail falls back to.
     */
    thumbKind?: "object" | "scene" | "person" | "location" | "relation";
    /**
     * Stable entity key (an id) seeding the thumbnail colour. Without it the colour derives from `thumb`, so it changes whenever the label does and two entities sharing a name share a colour.
     */
    thumbIdentity?: string;
    /**
     * Called when the row is activated. Optional — an unwired row renders and does nothing.
     */
    onclick?: (event: MouseEvent) => void;
    /**
     * Snippet rendered in the leading slot, INSTEAD of `thumb` or `icon`. For marks the kit cannot name as a Phosphor glyph — a provider's artwork, a brand lozenge, a custom badge.
     *
     * Added for #179, reported from khaos-app: a provider row wants the provider's mark beside a title that is already the provider's name. `thumb` takes a `Portrait` and `icon` takes a Phosphor glyph name, so neither could carry it — and passing a glyph name would mean inventing a provider-to-glyph table, which both repositories refuse.
     *
     * `aria-hidden` like the other decorations: the row's accessible name is `title` (D52), so anything here is seen and never announced. A caller whose mark carries information the title does not has the wrong component.
     */
    leading?: import("svelte").Snippet;
    /**
     * Snippet rendered at the end of the title line (counts, status). `aria-hidden`.
     */
    trailing?: import("svelte").Snippet;
    /**
     * Snippet rendered below the subtitle, inside the row's body.
     */
    children?: import("svelte").Snippet;
}, {}, "">;
type Props = {
    /**
     * Row title, and the accessible name of the button (D52).
     */
    title?: string;
    /**
     * Optional second line, `aria-hidden`.
     */
    subtitle?: string;
    /**
     * Optional tabular prefix rendered before the subtitle — `S1`, `S2`.
     */
    subtitlePrefix?: string;
    /**
     * Optional leading Phosphor icon name (fill weight).
     */
    icon?: string;
    /**
     * Draws the selected border and background, and sets `aria-current` so a screen-reader user can tell which row is chosen. D52 names the row; it does not excuse dropping state.
     */
    selected?: boolean;
    /**
     * Entity name for a leading square `Portrait` thumbnail, instead of `icon`.
     */
    thumb?: string;
    /**
     * Which template glyph the thumbnail falls back to.
     */
    thumbKind?: "object" | "scene" | "person" | "location" | "relation";
    /**
     * Stable entity key (an id) seeding the thumbnail colour. Without it the colour derives from `thumb`, so it changes whenever the label does and two entities sharing a name share a colour.
     */
    thumbIdentity?: string;
    /**
     * Called when the row is activated. Optional — an unwired row renders and does nothing.
     */
    onclick?: (event: MouseEvent) => void;
    /**
     * Snippet rendered in the leading slot, INSTEAD of `thumb` or `icon`. For marks the kit cannot name as a Phosphor glyph — a provider's artwork, a brand lozenge, a custom badge.
     *
     * Added for #179, reported from khaos-app: a provider row wants the provider's mark beside a title that is already the provider's name. `thumb` takes a `Portrait` and `icon` takes a Phosphor glyph name, so neither could carry it — and passing a glyph name would mean inventing a provider-to-glyph table, which both repositories refuse.
     *
     * `aria-hidden` like the other decorations: the row's accessible name is `title` (D52), so anything here is seen and never announced. A caller whose mark carries information the title does not has the wrong component.
     */
    leading?: import("svelte").Snippet;
    /**
     * Snippet rendered at the end of the title line (counts, status). `aria-hidden`.
     */
    trailing?: import("svelte").Snippet;
    /**
     * Snippet rendered below the subtitle, inside the row's body.
     */
    children?: import("svelte").Snippet;
};

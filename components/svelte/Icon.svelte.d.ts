export default Icon;
type Icon = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Icon: import("svelte").Component<{
    /**
     * Phosphor icon name (kebab-case), e.g. `sparkle`, `film-slate`.
     */
    name?: string;
    /**
     * Phosphor glyph weight; `regular` emits the bare `ph` class.
     */
    weight?: "regular" | "thin" | "light" | "bold" | "fill" | "duotone";
}, {}, "">;
type Props = {
    /**
     * Phosphor icon name (kebab-case), e.g. `sparkle`, `film-slate`.
     */
    name?: string;
    /**
     * Phosphor glyph weight; `regular` emits the bare `ph` class.
     */
    weight?: "regular" | "thin" | "light" | "bold" | "fill" | "duotone";
};

export default SectionHeader;
type SectionHeader = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SectionHeader: import("svelte").Component<{
    /**
     * Uppercase caption above the title (the `.eyebrow` utility).
     */
    eyebrow?: string;
    /**
     * The section title. Rendered as an `h2`; the kit declares exactly one `h1` and it is the screen's.
     */
    title?: string;
    /**
     * Snippet rendered opposite the title — actions, counts, a filter.
     */
    trailing?: import("svelte").Snippet;
}, {}, "">;
type Props = {
    /**
     * Uppercase caption above the title (the `.eyebrow` utility).
     */
    eyebrow?: string;
    /**
     * The section title. Rendered as an `h2`; the kit declares exactly one `h1` and it is the screen's.
     */
    title?: string;
    /**
     * Snippet rendered opposite the title — actions, counts, a filter.
     */
    trailing?: import("svelte").Snippet;
};

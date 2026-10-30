export default MetaStrip;
type MetaStrip = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const MetaStrip: import("svelte").Component<{
    /**
     * The run, in order. Empty renders nothing at all.
     */
    items?: {
        /**
         * The value to show — short, a phrase at most.
         */
        text: string;
        /**
         * Phosphor icon name (kebab-case), e.g. `film-slate`. Decorative; pair it with `label`.
         */
        icon?: string;
        /**
         * What the GLYPH means — a category, not the whole
         * reading: `characters`, not `27 characters`. It is announced through the
         * `.visually-hidden` utility and sits BEFORE `text`, so the item is heard as
         * "characters 27". Putting the complete phrase here instead makes a screen
         * reader say "27 characters 27", which is how this was first written.
         */
        label?: string;
        /**
         * The pointer's tooltip — the COMPLETE reading,
         * `27 characters`. Defaults to `label`, which is right whenever the category
         * alone is the whole story. It is separate from `label` because the two are
         * genuinely different jobs: one names the glyph for someone who cannot see
         * it, the other spells out the row for someone who can see it and does not
         * recognise the glyph.
         */
        title?: string;
        /**
         * Tabular figures, for a value that updates in place and must not jitter.
         */
        numeric?: boolean;
    }[];
}, {}, "">;
type Props = {
    /**
     * The run, in order. Empty renders nothing at all.
     */
    items?: {
        /**
         * The value to show — short, a phrase at most.
         */
        text: string;
        /**
         * Phosphor icon name (kebab-case), e.g. `film-slate`. Decorative; pair it with `label`.
         */
        icon?: string;
        /**
         * What the GLYPH means — a category, not the whole
         * reading: `characters`, not `27 characters`. It is announced through the
         * `.visually-hidden` utility and sits BEFORE `text`, so the item is heard as
         * "characters 27". Putting the complete phrase here instead makes a screen
         * reader say "27 characters 27", which is how this was first written.
         */
        label?: string;
        /**
         * The pointer's tooltip — the COMPLETE reading,
         * `27 characters`. Defaults to `label`, which is right whenever the category
         * alone is the whole story. It is separate from `label` because the two are
         * genuinely different jobs: one names the glyph for someone who cannot see
         * it, the other spells out the row for someone who can see it and does not
         * recognise the glyph.
         */
        title?: string;
        /**
         * Tabular figures, for a value that updates in place and must not jitter.
         */
        numeric?: boolean;
    }[];
};

export default Portrait;
type Portrait = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Portrait: import("svelte").Component<{
    /**
     * Optional image URL; replaces the template. **Wins over `figureFor`** — real artwork must not be second-guessed by a placeholder resolver.
     */
    src?: string;
    /**
     * Optional 1x/2x candidates. Omitted rather than emitted empty when unset, since an empty srcset is a candidate list a browser can fail to resolve.
     */
    srcset?: string;
    /**
     * Entity name. Used as the alt text, and as the colour seed only when `identity` is absent.
     */
    name?: string;
    /**
     * What the template colour is derived from. Pass a **stable entity key** (an id) where one exists — seeding from the name ties the colour to a label, so it changes whenever the label does and two entities sharing a name share a colour. Falls back to `name`.
     */
    identity?: string;
    /**
     * CSS aspect-ratio (e.g. `3 / 4`, `16 / 9`).
     */
    aspect?: string;
    /**
     * `person` takes a silhouette from the kit's placeholder set; `scene`, `location`, `object` and `relation` take a glyph (`film-slate` / `map-pin` / `cube` / `arrows-left-right`), since a human figure would be worse than the glyph it replaced.
     */
    kind?: "object" | "scene" | "person" | "location" | "relation";
    /**
     * Template glyph size (CSS length).
     */
    iconSize?: string;
    /**
     * Demographic passed to `figureFor`. Rendered by nothing on its own — this component draws no gendered figure, and does not decide what one looks like. It does select the kit's own silhouette bucket: female | male | nonbinary | anything else → unknown.
     */
    gender?: string;
    /**
     * Demographic passed to `figureFor`, alongside `gender`. Buckets for the kit's own silhouettes as young | adult | senior | anything else → adult; both demographics empty is the COMMON case and lands on unknown/adult, a real figure rather than a degraded one.
     */
    age?: string;
    /**
     * Resolves the fallback figure: `({ gender, age, name, identity, kind }) => ({ src, srcset }) | string | null`. Returning nothing is normal and falls through to the glyph.
     *
     * A resolver rather than bundled artwork, following `coverFor` on WelcomeWindow. Figure sets are **pre-production placeholders** that get replaced by user-supplied or generated images, and that replacement must be a change in the consuming app rather than a release of this library. Because the engine returns real art per character, placeholders and real images appear in the same list — which is why `src` wins per Portrait rather than there being one global mode.
     */
    figureFor?: (request: {
        gender: string;
        age: string;
        name: string;
        identity: string;
        kind: "object" | "scene" | "person" | "location" | "relation";
    }) => {
        src: string;
        srcset?: string;
    } | string | null | undefined;
}, {}, "">;
type Props = {
    /**
     * Optional image URL; replaces the template. **Wins over `figureFor`** — real artwork must not be second-guessed by a placeholder resolver.
     */
    src?: string;
    /**
     * Optional 1x/2x candidates. Omitted rather than emitted empty when unset, since an empty srcset is a candidate list a browser can fail to resolve.
     */
    srcset?: string;
    /**
     * Entity name. Used as the alt text, and as the colour seed only when `identity` is absent.
     */
    name?: string;
    /**
     * What the template colour is derived from. Pass a **stable entity key** (an id) where one exists — seeding from the name ties the colour to a label, so it changes whenever the label does and two entities sharing a name share a colour. Falls back to `name`.
     */
    identity?: string;
    /**
     * CSS aspect-ratio (e.g. `3 / 4`, `16 / 9`).
     */
    aspect?: string;
    /**
     * `person` takes a silhouette from the kit's placeholder set; `scene`, `location`, `object` and `relation` take a glyph (`film-slate` / `map-pin` / `cube` / `arrows-left-right`), since a human figure would be worse than the glyph it replaced.
     */
    kind?: "object" | "scene" | "person" | "location" | "relation";
    /**
     * Template glyph size (CSS length).
     */
    iconSize?: string;
    /**
     * Demographic passed to `figureFor`. Rendered by nothing on its own — this component draws no gendered figure, and does not decide what one looks like. It does select the kit's own silhouette bucket: female | male | nonbinary | anything else → unknown.
     */
    gender?: string;
    /**
     * Demographic passed to `figureFor`, alongside `gender`. Buckets for the kit's own silhouettes as young | adult | senior | anything else → adult; both demographics empty is the COMMON case and lands on unknown/adult, a real figure rather than a degraded one.
     */
    age?: string;
    /**
     * Resolves the fallback figure: `({ gender, age, name, identity, kind }) => ({ src, srcset }) | string | null`. Returning nothing is normal and falls through to the glyph.
     *
     * A resolver rather than bundled artwork, following `coverFor` on WelcomeWindow. Figure sets are **pre-production placeholders** that get replaced by user-supplied or generated images, and that replacement must be a change in the consuming app rather than a release of this library. Because the engine returns real art per character, placeholders and real images appear in the same list — which is why `src` wins per Portrait rather than there being one global mode.
     */
    figureFor?: (request: {
        gender: string;
        age: string;
        name: string;
        identity: string;
        kind: "object" | "scene" | "person" | "location" | "relation";
    }) => {
        src: string;
        srcset?: string;
    } | string | null | undefined;
};

/**
 * Reading a composed document: the parts that are the same wherever it renders.
 *
 * A composed document is JSON — a tree of layout nodes and component references
 * with token names for its dimensions and symbolic references for its data. Two
 * surfaces render one: `Composed.svelte` here, which is what a consuming app
 * mounts, and the catalog's editor, which draws the same tree with selection
 * chrome around every node.
 *
 * THIS MODULE IS WHY THERE IS ONE OF THEM AND NOT TWO. Left to themselves the
 * two renderers would each carry their own copy of "what `gap: 'lg'` means" and
 * "how a `$prop` resolves", and this repo has the scar from exactly that shape:
 * `tokens/parse.js` exists because the token parser lived twice, the copies
 * drifted, and the drift shipped a crash. The pattern that replaced it is the
 * one used here — one implementation, each surface points it at itself.
 *
 * IT IS PURE, AND IT HAS TO BE. It ships inside the library, so it is evaluated
 * in every consumer that imports it. No bundler-specific module globbing, no raw
 * text imports, no filesystem, no framework — `icon-inventory.js`'s header
 * records what happens otherwise: a Vite-only construct bundles clean under
 * esbuild and throws in the consumer's browser, a defect class the build cannot
 * see. (`check-consumer` greps for those constructs as text, so naming them
 * literally here would trip it; that it cannot tell a comment from code is a
 * small gap in the gate, noted rather than worked around further.)
 *
 * WHAT IS DELIBERATELY NOT HERE: anything that resolves a slug to a COMPONENT,
 * or a dataset id to ROWS. Both are host questions. The catalog answers them
 * from its barrel and its captures; an app answers them from its own imports and
 * its own live data. Baking either in would make a document mean "the catalog's
 * scenes" rather than "the scenes", which is the difference between a portable
 * format and a catalog file format.
 */
/** Depth-first, parents before children. The one traversal both renderers use. */
export function walk(node: any): any;
/** Every slug a tree references, deduplicated. */
export function slugsIn(root: any): any[];
/**
 * One prop value, resolved.
 *
 * THREE KINDS, and the split is the no-fabrication rule made structural:
 *
 *   a scalar      'Runtime', 42, true — a label is not fabricated data
 *   { $data }     a named collection the HOST supplies
 *   { $prop }     an input of the enclosing document
 *
 * There is deliberately no fourth. A literal array or object in a prop slot is
 * invented data with no provenance, and it is refused rather than rendered.
 *
 * A MISS IS REPORTED, not resolved to undefined: a component handed `undefined`
 * falls back to its own default and draws its empty state, which reads as a
 * design decision rather than a broken binding.
 *
 * @param {unknown} value
 * @param {{inputs?: object, data?: object}} context
 * @returns {{value: unknown} | {missing: string}}
 */
export function resolveValue(value: unknown, { inputs, data }?: {
    inputs?: object;
    data?: object;
}): {
    value: unknown;
} | {
    missing: string;
};
/**
 * Every prop of a node.
 *
 * A prop that misses is OMITTED and named in `missing`, so the component falls
 * back to its own default while the renderer still has something to report.
 *
 * @returns {{props: object, missing: string[]}}
 */
export function resolveProps(props: any, context?: {}): {
    props: object;
    missing: string[];
};
/**
 * The inputs a composed component is invoked with, filled in from its own
 * declared defaults where the call site said nothing.
 *
 * Its OWN declaration, because a composed document has no component to fall back
 * to — that declaration is the only place one of its defaults can live.
 */
export function withDefaults(declared: any, given?: {}): {};
/**
 * A slug -> what it names, given what the host has.
 *
 * The host supplies both maps. `components` is name -> component (a barrel
 * namespace object does); `documents` is slug -> authored document.
 *
 * Returns `{missing}` rather than throwing — the contract `resolveFlowSteps`
 * already sets in this repo. A renamed component should surface as a named gap
 * the author can act on, not as an empty box that reads as a layout bug.
 */
export function resolveComponent(slug: any, { components, documents }?: {
    components?: {} | undefined;
    documents?: {} | undefined;
}): {
    kind: string;
    slug: any;
    component: any;
    missing?: never;
    document?: never;
} | {
    missing: any;
    kind?: never;
    slug?: never;
    component?: never;
    document?: never;
} | {
    kind: string;
    slug: any;
    document: any;
    component?: never;
    missing?: never;
};
export function isSlug(value: any): boolean;
export function bareSlug(slug: any): any;
export function isLibrarySlug(slug: any): boolean;
export function spaceVar(name: any): string | null;
export namespace ALIGN {
    let start: string;
    let center: string;
    let end: string;
    let stretch: string;
}
export function alignFor(node: any): any;
export function layoutStyle(node: any): string;

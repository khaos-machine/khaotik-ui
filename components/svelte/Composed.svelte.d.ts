export default Composed;
type Composed = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Composed: import("svelte").Component<{
    /**
     * The composed document to render.
     */
    document?: object;
    /**
     * Values for the document's declared inputs.
     */
    props?: object;
    /**
     * Export name to component. Pass the barrel namespace.
     */
    components?: object;
    /**
     * Slug to composed document, for nested references.
     */
    documents?: object;
    /**
     * Dataset id to rows, for `$data` bindings.
     */
    data?: object;
    /**
     * INTERNAL. The node to render; recursion sets it.
     */
    node?: object;
    /**
     * INTERNAL. Recursion guard; never set by a caller.
     */
    depth?: number;
}, {}, "">;
type Props = {
    /**
     * The composed document to render.
     */
    document?: object;
    /**
     * Values for the document's declared inputs.
     */
    props?: object;
    /**
     * Export name to component. Pass the barrel namespace.
     */
    components?: object;
    /**
     * Slug to composed document, for nested references.
     */
    documents?: object;
    /**
     * Dataset id to rows, for `$data` bindings.
     */
    data?: object;
    /**
     * INTERNAL. The node to render; recursion sets it.
     */
    node?: object;
    /**
     * INTERNAL. Recursion guard; never set by a caller.
     */
    depth?: number;
};

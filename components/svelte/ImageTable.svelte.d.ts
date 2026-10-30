export default ImageTable;
type ImageTable = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ImageTable: import("svelte").Component<{
    /**
     * One row per committed image; `imageRows` in `lib/images.js` builds them from khaosd's subjects.
     */
    rows?: readonly import("./lib/images.js").ImageRow[];
    /**
     * Resolved thumbnail URLs by reference id.
     */
    urls?: Readonly<Record<string, string>>;
    /**
     * Asked for a row's thumbnail once its cell renders without one.
     */
    onthumb?: (referenceId: string) => void;
    /**
     * The selected row's reference id.
     */
    selected?: string;
    /**
     * Narrows the rows by text.
     */
    filter?: string;
    /**
     * Reports a selected row.
     */
    onselect?: (referenceId: string) => void;
}, {}, "">;
type Props = {
    /**
     * One row per committed image; `imageRows` in `lib/images.js` builds them from khaosd's subjects.
     */
    rows?: readonly import("./lib/images.js").ImageRow[];
    /**
     * Resolved thumbnail URLs by reference id.
     */
    urls?: Readonly<Record<string, string>>;
    /**
     * Asked for a row's thumbnail once its cell renders without one.
     */
    onthumb?: (referenceId: string) => void;
    /**
     * The selected row's reference id.
     */
    selected?: string;
    /**
     * Narrows the rows by text.
     */
    filter?: string;
    /**
     * Reports a selected row.
     */
    onselect?: (referenceId: string) => void;
};

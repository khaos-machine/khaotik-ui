export default ResourceCatalog;
type ResourceCatalog = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ResourceCatalog: import("svelte").Component<{
    /**
     * `GET /api/catalog/prompts`, verbatim. **One endpoint returns every kind**, so the grouping is derived here.
     */
    artifacts?: readonly {
        id: string;
        kind: string;
        domain?: string;
        version?: string;
        description?: string;
        hash?: string;
        source?: string;
        status?: string;
        /**
         * A prompt's system message, by catalog id.
         */
        systemMessageId?: string;
        /**
         * A prompt's schema, by catalog id.
         */
        schemaId?: string;
        /**
         * The current prompt a prompt belongs to; its own id when current.
         */
        family?: string;
        /**
         * A historical contract kept for provenance; no new run uses it.
         */
        retained?: boolean;
        /**
         * The registry's note on the entry, verbatim — on a retained prompt, what replaced it and why.
         */
        notes?: string;
        /**
         * On a system message or schema: the prompts that use it, current first.
         */
        usedBy?: readonly string[];
        /**
         * On a prompt: the names of the engine's jobs that run it, from the engine's own declared table (khaos-tools #1122). Empty means no job runs it.
         */
        usedFor?: readonly string[];
        /**
         * On a prompt: its version history as the registry declares it, newest first.
         */
        versions?: readonly {
            version: string;
            released?: string;
            deprecated?: boolean;
        }[];
    }[];
    /**
     * Controlled selection, like the rest of the library.
     */
    selectedId?: string;
    /**
     * The selection's kind. Ids are unique only within a kind; without it the first artifact with the id is taken.
     */
    selectedKind?: string;
    /**
     * A past version of the selected prompt, when one is chosen from its history. Empty means the current version.
     */
    selectedVersion?: string;
    /**
     * Called with the whole artifact — and, for a past version from a prompt's history, that version — so the host can fetch the right body without a second lookup.
     */
    onSelect?: (artifact: {
        id: string;
        kind: string;
        domain?: string;
        version?: string;
        description?: string;
        hash?: string;
        source?: string;
        status?: string;
        /**
         * A prompt's system message, by catalog id.
         */
        systemMessageId?: string;
        /**
         * A prompt's schema, by catalog id.
         */
        schemaId?: string;
        /**
         * The current prompt a prompt belongs to; its own id when current.
         */
        family?: string;
        /**
         * A historical contract kept for provenance; no new run uses it.
         */
        retained?: boolean;
        /**
         * The registry's note on the entry, verbatim — on a retained prompt, what replaced it and why.
         */
        notes?: string;
        /**
         * On a system message or schema: the prompts that use it, current first.
         */
        usedBy?: readonly string[];
        /**
         * On a prompt: the names of the engine's jobs that run it, from the engine's own declared table (khaos-tools #1122). Empty means no job runs it.
         */
        usedFor?: readonly string[];
        /**
         * On a prompt: its version history as the registry declares it, newest first.
         */
        versions?: readonly {
            version: string;
            released?: string;
            deprecated?: boolean;
        }[];
    }, version?: string) => void;
    /**
     * The selected artifact's body, fetched by the host — this component does no I/O.
     */
    body?: string;
    /**
     * The version, source and hash of the body the host fetched. Shown in place of the listed entry's — and for a past version, the listed entry's source and hash (which are the CURRENT version's) are never shown in their stead.
     */
    bodyMeta?: {
        version?: string;
        source?: string;
        hash?: string;
    };
    /**
     * Why there is no body, when there is none. Renders the **listed, not previewable** state, deliberately not an error. Empty means "nothing fetched yet".
     */
    bodyUnavailable?: string;
    /**
     * Order for the sections of resources that are not part of a job (report templates, rubrics, eval fixtures). A kind not listed is appended rather than dropped.
     */
    kindOrder?: readonly string[];
}, {}, "">;
type Props = {
    /**
     * `GET /api/catalog/prompts`, verbatim. **One endpoint returns every kind**, so the grouping is derived here.
     */
    artifacts?: readonly {
        id: string;
        kind: string;
        domain?: string;
        version?: string;
        description?: string;
        hash?: string;
        source?: string;
        status?: string;
        /**
         * A prompt's system message, by catalog id.
         */
        systemMessageId?: string;
        /**
         * A prompt's schema, by catalog id.
         */
        schemaId?: string;
        /**
         * The current prompt a prompt belongs to; its own id when current.
         */
        family?: string;
        /**
         * A historical contract kept for provenance; no new run uses it.
         */
        retained?: boolean;
        /**
         * The registry's note on the entry, verbatim — on a retained prompt, what replaced it and why.
         */
        notes?: string;
        /**
         * On a system message or schema: the prompts that use it, current first.
         */
        usedBy?: readonly string[];
        /**
         * On a prompt: the names of the engine's jobs that run it, from the engine's own declared table (khaos-tools #1122). Empty means no job runs it.
         */
        usedFor?: readonly string[];
        /**
         * On a prompt: its version history as the registry declares it, newest first.
         */
        versions?: readonly {
            version: string;
            released?: string;
            deprecated?: boolean;
        }[];
    }[];
    /**
     * Controlled selection, like the rest of the library.
     */
    selectedId?: string;
    /**
     * The selection's kind. Ids are unique only within a kind; without it the first artifact with the id is taken.
     */
    selectedKind?: string;
    /**
     * A past version of the selected prompt, when one is chosen from its history. Empty means the current version.
     */
    selectedVersion?: string;
    /**
     * Called with the whole artifact — and, for a past version from a prompt's history, that version — so the host can fetch the right body without a second lookup.
     */
    onSelect?: (artifact: {
        id: string;
        kind: string;
        domain?: string;
        version?: string;
        description?: string;
        hash?: string;
        source?: string;
        status?: string;
        /**
         * A prompt's system message, by catalog id.
         */
        systemMessageId?: string;
        /**
         * A prompt's schema, by catalog id.
         */
        schemaId?: string;
        /**
         * The current prompt a prompt belongs to; its own id when current.
         */
        family?: string;
        /**
         * A historical contract kept for provenance; no new run uses it.
         */
        retained?: boolean;
        /**
         * The registry's note on the entry, verbatim — on a retained prompt, what replaced it and why.
         */
        notes?: string;
        /**
         * On a system message or schema: the prompts that use it, current first.
         */
        usedBy?: readonly string[];
        /**
         * On a prompt: the names of the engine's jobs that run it, from the engine's own declared table (khaos-tools #1122). Empty means no job runs it.
         */
        usedFor?: readonly string[];
        /**
         * On a prompt: its version history as the registry declares it, newest first.
         */
        versions?: readonly {
            version: string;
            released?: string;
            deprecated?: boolean;
        }[];
    }, version?: string) => void;
    /**
     * The selected artifact's body, fetched by the host — this component does no I/O.
     */
    body?: string;
    /**
     * The version, source and hash of the body the host fetched. Shown in place of the listed entry's — and for a past version, the listed entry's source and hash (which are the CURRENT version's) are never shown in their stead.
     */
    bodyMeta?: {
        version?: string;
        source?: string;
        hash?: string;
    };
    /**
     * Why there is no body, when there is none. Renders the **listed, not previewable** state, deliberately not an error. Empty means "nothing fetched yet".
     */
    bodyUnavailable?: string;
    /**
     * Order for the sections of resources that are not part of a job (report templates, rubrics, eval fixtures). A kind not listed is appended rather than dropped.
     */
    kindOrder?: readonly string[];
};

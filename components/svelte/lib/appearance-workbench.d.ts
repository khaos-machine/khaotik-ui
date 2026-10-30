export type ArtworkReference = {
    id: string;
    label: string;
    imageUrl: string;
    canUseAsSheet?: boolean;
};
export type AppearanceBrief = {
    identityLock: string;
    wardrobeLock: string;
    unknowns: readonly {
        detail: string;
        treatment: string;
    }[];
};
export type DesignRevision = {
    id: string;
    designId: string;
    name: string;
    review: {
        state: "unreviewed" | "reviewed" | "rejected";
        notes: string;
    };
    pages: readonly {
        purpose: string;
        referenceId: string;
    }[];
};
export type DesignCandidate = {
    canSourceHeadshot: boolean;
    revision: DesignRevision;
    images: readonly ArtworkReference[];
    selected: boolean;
};
export type AppearanceWorkspace = {
    characterId: string;
    name: string;
    draft: {
        id: string;
    } | null;
    preparation: {
        summary: string;
        evidence: readonly {
            detail: string;
            sceneNumbers: readonly number[];
        }[];
    };
    references: readonly ArtworkReference[];
    styleReferences: readonly ArtworkReference[];
    candidates: readonly DesignCandidate[];
    jobs: readonly {
        id: string;
        publication: string;
        requestId?: string;
        state?: string;
        revisionId?: string;
        error?: string;
    }[];
    hasActiveJobs: boolean;
    generationReady: boolean;
    generationReason: string;
};

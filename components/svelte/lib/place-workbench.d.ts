export type PlaceBrief = {
    spatialDescription: string;
    fixedFeatures: readonly string[];
    dressing: string;
    lighting: string;
    unknowns: readonly {
        detail: string;
        treatment: string;
    }[];
};
export type PlaceReference = {
    id: string;
    label: string;
    imageUrl: string;
    subjectName?: string;
    subject?: {
        kind: string;
    };
    roles?: readonly string[];
};
export type PlaceRevision = {
    id: string;
    designId: string;
    name: string;
    createdAt: string;
    review: {
        state: "unreviewed" | "reviewed" | "rejected";
        notes: string;
    };
    pages: readonly {
        purpose: string;
        referenceId: string;
    }[];
};
export type PlaceCandidate = {
    label: string;
    revision: PlaceRevision;
    images: readonly PlaceReference[];
    selected: boolean;
};
export type PlaceJob = {
    id: string;
    requestId: string;
    state: string;
    publication: string;
    revisionId: string;
    error: string;
};
export type PlaceWorkspace = {
    locationId: string;
    name: string;
    draft: {
        id: string;
    } | null;
    preparation: {
        context?: readonly {
            detail: string;
            sceneNumbers: readonly number[];
        }[];
        areas?: readonly {
            name: string;
            brief: PlaceBrief;
        }[];
        summary: string;
        atmosphere: string;
        evidence: readonly {
            detail: string;
            sceneNumbers: readonly number[];
        }[];
        changes: readonly {
            detail: string;
            sceneNumbers: readonly number[];
        }[];
    };
    references: readonly PlaceReference[];
    renders?: readonly PlaceReference[];
    styleReferences: readonly PlaceReference[];
    projectReferences?: readonly PlaceReference[];
    candidates: readonly PlaceCandidate[];
    jobs: readonly PlaceJob[];
    generationReady: boolean;
    generationReason: string;
    hasActiveJobs: boolean;
};

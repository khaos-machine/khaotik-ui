/** @param {readonly SubjectImageSet[]} subjects @returns {ImageRow[]} */
export function imageRows(subjects: readonly SubjectImageSet[]): ImageRow[];
export function formatName(mimeType: string): string;
export type SubjectKind = "character" | "location" | "object";
export type RecipeRef<R> = {
    id: string;
    revision: R;
};
/**
 * What made a generated image, exactly as the engine recorded it.
 */
export type GenerationProvenance = {
    generationId: string;
    providerId: string;
    modelId: string;
    modelRevision?: string;
    promptDigest: string;
    inputDigests: readonly string[];
    profile?: RecipeRef<string>;
    style?: RecipeRef<number>;
    template?: RecipeRef<number>;
};
/**
 * One committed image of a subject.
 */
export type VisualReference = {
    id: string;
    label: string;
    origin: "uploaded" | "generated" | string;
    image: {
        width: number;
        height: number;
        sizeBytes: number;
        mimeType: string;
        sha256: string;
    };
    createdAt: string;
    /**
     * A generated image's recipe.
     */
    provenance?: GenerationProvenance;
};
/**
 * A subject and its committed images.
 */
export type SubjectImageSet = {
    subject: {
        kind: SubjectKind;
        id: string;
    };
    /**
     * The engine's name for the subject.
     */
    name?: string;
    references: readonly VisualReference[];
};
/**
 * One Images table row.
 */
export type ImageRow = {
    referenceId: string;
    label: string;
    subject: {
        kind: SubjectKind;
        id: string;
    };
    /**
     * The engine's name for the subject, or its id when the engine sent none.
     */
    subjectName: string;
    subjectKind: SubjectKind;
    origin: string;
    width: number;
    height: number;
    sizeBytes: number;
    mimeType: string;
    sha256: string;
    createdAt: string;
    /**
     * Present for a generated image only, exactly as the engine sent it.
     */
    provenance?: GenerationProvenance;
};

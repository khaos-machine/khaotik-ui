// A project's images, as the Images destination shows them: one row per committed reference,
// grouped by its subject. Pure. Moved from Khaos App's `src/app/visual-assets.svelte.ts`
// (catalog app-coverage plan, T5). The subjects are the ones khaosd serves on
// `/api/v1/visual/assets`, as Khaos App holds them once read: a generated image's recipe grouped
// as `profile`, `style` and `template`, each with its revision.

/** @typedef {'character' | 'location' | 'object'} SubjectKind */

/**
 * @template R
 * @typedef {{ id: string, revision: R }} RecipeRef
 */

/**
 * What made a generated image, exactly as the engine recorded it.
 * @typedef {Object} GenerationProvenance
 * @property {string} generationId
 * @property {string} providerId
 * @property {string} modelId
 * @property {string} [modelRevision]
 * @property {string} promptDigest
 * @property {readonly string[]} inputDigests
 * @property {RecipeRef<string>} [profile]
 * @property {RecipeRef<number>} [style]
 * @property {RecipeRef<number>} [template]
 */

/**
 * One committed image of a subject.
 * @typedef {Object} VisualReference
 * @property {string} id
 * @property {string} label
 * @property {'uploaded' | 'generated' | string} origin
 * @property {{ width: number, height: number, sizeBytes: number, mimeType: string, sha256: string }} image
 * @property {string} createdAt
 * @property {GenerationProvenance} [provenance] A generated image's recipe.
 */

/**
 * A subject and its committed images.
 * @typedef {Object} SubjectImageSet
 * @property {{ kind: SubjectKind, id: string }} subject
 * @property {string} [name] The engine's name for the subject.
 * @property {readonly VisualReference[]} references
 */

/**
 * One Images table row.
 * @typedef {Object} ImageRow
 * @property {string} referenceId
 * @property {string} label
 * @property {{ kind: SubjectKind, id: string }} subject
 * @property {string} subjectName The engine's name for the subject, or its id when the engine sent none.
 * @property {SubjectKind} subjectKind
 * @property {string} origin
 * @property {number} width
 * @property {number} height
 * @property {number} sizeBytes
 * @property {string} mimeType
 * @property {string} sha256
 * @property {string} createdAt
 * @property {GenerationProvenance} [provenance] Present for a generated image only, exactly as the engine sent it.
 */

/** "image/png" as "PNG". @param {string} mimeType */
export const formatName = (mimeType) => (mimeType.split('/')[1] ?? mimeType).toUpperCase()

/** @param {readonly SubjectImageSet[]} subjects @returns {ImageRow[]} */
export function imageRows(subjects) {
  return subjects.flatMap((entry) =>
    entry.references.map((reference) => ({
      referenceId: reference.id,
      label: reference.label,
      subject: entry.subject,
      subjectName: entry.name ?? entry.subject.id,
      subjectKind: entry.subject.kind,
      origin: reference.origin,
      width: reference.image.width,
      height: reference.image.height,
      sizeBytes: reference.image.sizeBytes,
      mimeType: reference.image.mimeType,
      sha256: reference.image.sha256,
      createdAt: reference.createdAt,
      ...(reference.origin === 'generated' && reference.provenance ? { provenance: reference.provenance } : {}),
    })),
  )
}

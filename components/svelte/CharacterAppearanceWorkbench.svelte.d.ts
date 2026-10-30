export default CharacterAppearanceWorkbench;
type CharacterAppearanceWorkbench = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const CharacterAppearanceWorkbench: import("svelte").Component<{
    /**
     * Engine-offered editable visual proposals.
     */
    look?: {
        features: readonly {
            key: string;
            label: string;
            options: readonly string[];
            randomizable?: boolean;
        }[];
        choices: Record<string, string>;
    } | null;
    /**
     * Choices protected from randomization.
     */
    lookLocks?: Record<string, boolean>;
    /**
     * Edit one choice or randomize unlocked choices; never generates artwork.
     */
    onlook?: (key?: string, value?: string) => void;
    /**
     * Keep a choice during randomization.
     */
    onlooklock?: (key: string, locked: boolean) => void;
    /**
     * Current explicit generation request.
     */
    generationRequestId?: string;
    /**
     * Retained submission failure.
     */
    generationError?: string;
    /**
     * Purpose of that request.
     */
    generationPurpose?: string;
    /**
     * Exact host appearance workspace.
     */
    workspace?: import("./lib/appearance-workbench.js").AppearanceWorkspace | null;
    /**
     * Host-owned direction draft.
     */
    brief?: import("./lib/appearance-workbench.js").AppearanceBrief | null;
    /**
     * Authored input roles.
     */
    references?: readonly {
        referenceId: string;
        role: string;
    }[];
    /**
     * Current sheet or headshot mode.
     */
    purpose?: string;
    /**
     * Explicit candidate being viewed.
     */
    candidateId?: string;
    /**
     * Headshot identity source.
     */
    sourceSheetId?: string;
    /**
     * Existing image used directly as source.
     */
    sourceReferenceId?: string;
    /**
     * Reference being inspected; empty returns to candidate.
     */
    inspectingId?: string;
    /**
     * Authenticated media keyed by reference identity.
     */
    imageURLs?: Record<string, string>;
    /**
     * Resolved main image.
     */
    mediaUrl?: string;
    /**
     * Main image is being resolved.
     */
    mediaLoading?: boolean;
    /**
     * Image-read failure.
     */
    mediaError?: string;
    /**
     * Revision draft for the current candidate.
     */
    correction?: string;
    /**
     * Current review notes.
     */
    notes?: string;
    /**
     * Appearance edits await saving.
     */
    dirty?: boolean;
    /**
     * Prevent overlapping commands.
     */
    busy?: boolean;
    /**
     * Retained operation failure.
     */
    error?: string;
    /**
     * Operation feedback.
     */
    notice?: string;
    /**
     * Back navigation label.
     */
    returnLabel?: string;
    /**
     * Return to character context.
     */
    onback?: () => void;
    /**
     * Switch media without discarding drafts.
     */
    onpurpose?: (purpose: "characterSheet" | "headshot") => void;
    /**
     * Direct draft edits.
     */
    onchange?: (field: "identityLock" | "wardrobeLock", value: string) => void;
    /**
     * Explicitly discard unsaved appearance edits, never review drafts.
     */
    onrevert?: () => void;
    /**
     * Explicit optional draft save.
     */
    onsave?: () => void;
    /**
     * Change an input role; empty excludes it.
     */
    onreference?: (id: string, role: string) => void;
    /**
     * Inspect a reference, or empty returns to the candidate.
     */
    oninspect?: (id: string) => void;
    /**
     * Choose a sheet as identity source.
     */
    onsource?: (id: string) => void;
    /**
     * Prepare a reference as a portrait source; never generates.
     */
    onusesource?: (id: string) => void;
    /**
     * Explicitly adopt existing artwork as a sheet.
     */
    onusesheet?: (id: string) => void;
    /**
     * Generate once, saving edits first in the host.
     */
    ongenerate?: (correcting: boolean) => void;
    /**
     * Review without changing the viewed candidate.
     */
    onreview?: (state: "reviewed" | "rejected") => void;
    /**
     * Approve and select the current artwork through the engine.
     */
    onuse?: () => void;
    /**
     * Edit review notes.
     */
    onnotes?: (value: string) => void;
    /**
     * Edit revision instruction.
     */
    oncorrection?: (value: string) => void;
    /**
     * View a candidate without choosing it.
     */
    onpreview?: (id: string) => void;
    /**
     * Save already returned artwork.
     */
    onpublish?: (id: string) => void;
    /**
     * Import references without generating.
     */
    onupload?: (files: File[]) => void;
}, {}, "">;
type Props = {
    /**
     * Engine-offered editable visual proposals.
     */
    look?: {
        features: readonly {
            key: string;
            label: string;
            options: readonly string[];
            randomizable?: boolean;
        }[];
        choices: Record<string, string>;
    } | null;
    /**
     * Choices protected from randomization.
     */
    lookLocks?: Record<string, boolean>;
    /**
     * Edit one choice or randomize unlocked choices; never generates artwork.
     */
    onlook?: (key?: string, value?: string) => void;
    /**
     * Keep a choice during randomization.
     */
    onlooklock?: (key: string, locked: boolean) => void;
    /**
     * Current explicit generation request.
     */
    generationRequestId?: string;
    /**
     * Retained submission failure.
     */
    generationError?: string;
    /**
     * Purpose of that request.
     */
    generationPurpose?: string;
    /**
     * Exact host appearance workspace.
     */
    workspace?: import("./lib/appearance-workbench.js").AppearanceWorkspace | null;
    /**
     * Host-owned direction draft.
     */
    brief?: import("./lib/appearance-workbench.js").AppearanceBrief | null;
    /**
     * Authored input roles.
     */
    references?: readonly {
        referenceId: string;
        role: string;
    }[];
    /**
     * Current sheet or headshot mode.
     */
    purpose?: string;
    /**
     * Explicit candidate being viewed.
     */
    candidateId?: string;
    /**
     * Headshot identity source.
     */
    sourceSheetId?: string;
    /**
     * Existing image used directly as source.
     */
    sourceReferenceId?: string;
    /**
     * Reference being inspected; empty returns to candidate.
     */
    inspectingId?: string;
    /**
     * Authenticated media keyed by reference identity.
     */
    imageURLs?: Record<string, string>;
    /**
     * Resolved main image.
     */
    mediaUrl?: string;
    /**
     * Main image is being resolved.
     */
    mediaLoading?: boolean;
    /**
     * Image-read failure.
     */
    mediaError?: string;
    /**
     * Revision draft for the current candidate.
     */
    correction?: string;
    /**
     * Current review notes.
     */
    notes?: string;
    /**
     * Appearance edits await saving.
     */
    dirty?: boolean;
    /**
     * Prevent overlapping commands.
     */
    busy?: boolean;
    /**
     * Retained operation failure.
     */
    error?: string;
    /**
     * Operation feedback.
     */
    notice?: string;
    /**
     * Back navigation label.
     */
    returnLabel?: string;
    /**
     * Return to character context.
     */
    onback?: () => void;
    /**
     * Switch media without discarding drafts.
     */
    onpurpose?: (purpose: "characterSheet" | "headshot") => void;
    /**
     * Direct draft edits.
     */
    onchange?: (field: "identityLock" | "wardrobeLock", value: string) => void;
    /**
     * Explicitly discard unsaved appearance edits, never review drafts.
     */
    onrevert?: () => void;
    /**
     * Explicit optional draft save.
     */
    onsave?: () => void;
    /**
     * Change an input role; empty excludes it.
     */
    onreference?: (id: string, role: string) => void;
    /**
     * Inspect a reference, or empty returns to the candidate.
     */
    oninspect?: (id: string) => void;
    /**
     * Choose a sheet as identity source.
     */
    onsource?: (id: string) => void;
    /**
     * Prepare a reference as a portrait source; never generates.
     */
    onusesource?: (id: string) => void;
    /**
     * Explicitly adopt existing artwork as a sheet.
     */
    onusesheet?: (id: string) => void;
    /**
     * Generate once, saving edits first in the host.
     */
    ongenerate?: (correcting: boolean) => void;
    /**
     * Review without changing the viewed candidate.
     */
    onreview?: (state: "reviewed" | "rejected") => void;
    /**
     * Approve and select the current artwork through the engine.
     */
    onuse?: () => void;
    /**
     * Edit review notes.
     */
    onnotes?: (value: string) => void;
    /**
     * Edit revision instruction.
     */
    oncorrection?: (value: string) => void;
    /**
     * View a candidate without choosing it.
     */
    onpreview?: (id: string) => void;
    /**
     * Save already returned artwork.
     */
    onpublish?: (id: string) => void;
    /**
     * Import references without generating.
     */
    onupload?: (files: File[]) => void;
};

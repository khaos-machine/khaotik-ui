export default ObjectAppearanceWorkbench;
type ObjectAppearanceWorkbench = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ObjectAppearanceWorkbench: import("svelte").Component<{
    /**
     * Complete engine-owned object artwork read model.
     */
    workspace?: import("./lib/object-workbench.js").ObjectWorkspace | null;
    /**
     * Persistent host-owned direction draft.
     */
    brief?: import("./lib/object-workbench.js").ObjectBrief | null;
    /**
     * Authored image input roles.
     */
    references?: readonly {
        referenceId: string;
        role: string;
    }[];
    /**
     * Candidate being viewed, independently of adoption.
     */
    candidateId?: string;
    /**
     * Reference being viewed, empty returns to design.
     */
    inspectingId?: string;
    /**
     * Authenticated image URLs keyed by reference.
     */
    imageURLs?: Record<string, string>;
    /**
     * Main contained artwork.
     */
    mediaUrl?: string;
    /**
     * Main artwork read is pending.
     */
    mediaLoading?: boolean;
    /**
     * Retained media-read failure.
     */
    mediaError?: string;
    /**
     * Revision instruction for this candidate.
     */
    correction?: string;
    /**
     * Candidate review notes.
     */
    notes?: string;
    /**
     * Authored visual treatment, separate from script facts.
     */
    treatment?: string;
    /**
     * Direction changes await saving.
     */
    dirty?: boolean;
    /**
     * Prevent overlapping operations.
     */
    busy?: boolean;
    /**
     * Retained operation error.
     */
    error?: string;
    /**
     * Explicit operation feedback.
     */
    notice?: string;
    /**
     * Current explicit image request.
     */
    generationRequestId?: string;
    /**
     * Retained submission failure.
     */
    generationError?: string;
    /**
     * Contextual return destination.
     */
    returnLabel?: string;
    /**
     * Return to the prior Data or Atlas context.
     */
    onback?: () => void;
    /**
     * Change authored direction.
     */
    onchange?: (field: "form" | "materials" | "state" | "authoredScale" | "treatment", value: string) => void;
    /**
     * Edit distinctive details for this set.
     */
    ondetails?: (values: string[]) => void;
    /**
     * Persist the current brief.
     */
    onsave?: () => void;
    /**
     * Explicitly discard unsaved direction edits.
     */
    onrevert?: () => void;
    /**
     * Save edits then request one image.
     */
    ongenerate?: (correcting: boolean) => void;
    /**
     * View artwork without approval or selection.
     */
    onpreview?: (id: string) => void;
    /**
     * Inspect a reference, or return with an empty ID.
     */
    oninspect?: (id: string) => void;
    /**
     * Change a reference role.
     */
    onreference?: (id: string, role: string) => void;
    /**
     * Upload reference imagery.
     */
    onupload?: (files: File[]) => void;
    /**
     * Edit the correction draft.
     */
    oncorrection?: (value: string) => void;
    /**
     * Edit review notes.
     */
    onnotes?: (value: string) => void;
    /**
     * Review without adopting artwork.
     */
    onreview?: (state: "reviewed" | "rejected") => void;
    /**
     * Approve and select in one command.
     */
    onuse?: () => void;
    /**
     * Save returned artwork without provider retry.
     */
    onpublish?: (id: string) => void;
}, {}, "">;
type Props = {
    /**
     * Complete engine-owned object artwork read model.
     */
    workspace?: import("./lib/object-workbench.js").ObjectWorkspace | null;
    /**
     * Persistent host-owned direction draft.
     */
    brief?: import("./lib/object-workbench.js").ObjectBrief | null;
    /**
     * Authored image input roles.
     */
    references?: readonly {
        referenceId: string;
        role: string;
    }[];
    /**
     * Candidate being viewed, independently of adoption.
     */
    candidateId?: string;
    /**
     * Reference being viewed, empty returns to design.
     */
    inspectingId?: string;
    /**
     * Authenticated image URLs keyed by reference.
     */
    imageURLs?: Record<string, string>;
    /**
     * Main contained artwork.
     */
    mediaUrl?: string;
    /**
     * Main artwork read is pending.
     */
    mediaLoading?: boolean;
    /**
     * Retained media-read failure.
     */
    mediaError?: string;
    /**
     * Revision instruction for this candidate.
     */
    correction?: string;
    /**
     * Candidate review notes.
     */
    notes?: string;
    /**
     * Authored visual treatment, separate from script facts.
     */
    treatment?: string;
    /**
     * Direction changes await saving.
     */
    dirty?: boolean;
    /**
     * Prevent overlapping operations.
     */
    busy?: boolean;
    /**
     * Retained operation error.
     */
    error?: string;
    /**
     * Explicit operation feedback.
     */
    notice?: string;
    /**
     * Current explicit image request.
     */
    generationRequestId?: string;
    /**
     * Retained submission failure.
     */
    generationError?: string;
    /**
     * Contextual return destination.
     */
    returnLabel?: string;
    /**
     * Return to the prior Data or Atlas context.
     */
    onback?: () => void;
    /**
     * Change authored direction.
     */
    onchange?: (field: "form" | "materials" | "state" | "authoredScale" | "treatment", value: string) => void;
    /**
     * Edit distinctive details for this set.
     */
    ondetails?: (values: string[]) => void;
    /**
     * Persist the current brief.
     */
    onsave?: () => void;
    /**
     * Explicitly discard unsaved direction edits.
     */
    onrevert?: () => void;
    /**
     * Save edits then request one image.
     */
    ongenerate?: (correcting: boolean) => void;
    /**
     * View artwork without approval or selection.
     */
    onpreview?: (id: string) => void;
    /**
     * Inspect a reference, or return with an empty ID.
     */
    oninspect?: (id: string) => void;
    /**
     * Change a reference role.
     */
    onreference?: (id: string, role: string) => void;
    /**
     * Upload reference imagery.
     */
    onupload?: (files: File[]) => void;
    /**
     * Edit the correction draft.
     */
    oncorrection?: (value: string) => void;
    /**
     * Edit review notes.
     */
    onnotes?: (value: string) => void;
    /**
     * Review without adopting artwork.
     */
    onreview?: (state: "reviewed" | "rejected") => void;
    /**
     * Approve and select in one command.
     */
    onuse?: () => void;
    /**
     * Save returned artwork without provider retry.
     */
    onpublish?: (id: string) => void;
};

/**
 * The fields of khaosd's place row (`/api/v1/dashboard/locations`) the destination reads.
 * @typedef {Object} PlaceRecord
 * @property {string} id
 * @property {string} name
 * @property {number} [scene_count]
 * @property {number} [page_count]
 * @property {readonly string[]} [mentionedSceneIds] Scenes that only name the place (RFC 0102).
 * @property {string} [origin]
 */
/**
 * @typedef {Object} PlaceRow
 * @property {string} id
 * @property {string} name
 * @property {number} scenes
 * @property {number} pages
 * @property {number} named Scenes that only name the place, apart from the scenes set there.
 * @property {string} origin
 */
/** @param {readonly PlaceRecord[]} places @returns {PlaceRow[]} */
export function placeRows(places: readonly PlaceRecord[]): PlaceRow[];
/**
 * The fields of khaosd's object row (`/api/v1/dashboard/objects`) the destination reads.
 * @typedef {Object} ObjectRecord
 * @property {string} id
 * @property {string} name
 * @property {number} [scene_count]
 * @property {readonly string[]} [mentionedSceneIds]
 * @property {'individual' | 'group' | string} [identityKind]
 * @property {readonly string[]} [members] A group's members, by id.
 * @property {readonly string[]} [memberOf] The groups an object belongs to, by id.
 * @property {readonly { sceneId: string }[]} [appearances]
 */
/**
 * @typedef {Object} ObjectRow
 * @property {string} id
 * @property {string} name
 * @property {number} scenes
 * @property {number} named
 * @property {string} group "group of 2", "one of glasses" (RFC 0078 §3.1), or '' for a plain object.
 */
/** @param {readonly ObjectRecord[]} objects @returns {ObjectRow[]} */
export function objectRows(objects: readonly ObjectRecord[]): ObjectRow[];
/**
 * Where a heading sits in the screenplay, as khaosd read it.
 * @typedef {Object} HeadingSpan
 * @property {number} lineNumber
 * @property {string} lineText
 * @property {number} startByte
 * @property {number} endByte
 * @property {string} sourcePhrase
 */
/**
 * One scene's heading and the place the engine resolved it to.
 * @typedef {Object} HeadingOccurrence
 * @property {string} locationId
 * @property {string} sourceHash The screenplay revision it was read from; a declaration sends it back as read.
 * @property {{ sceneId: string, span: HeadingSpan }} evidence
 */
/**
 * A landed decision between two headings: a merge, or a declaration.
 * @typedef {Object} HeadingDecision
 * @property {'merged' | 'declaredSame' | 'declaredDifferent' | 'split'} state
 * @property {number} decisionSeq
 * @property {string} canonicalId
 * @property {string} retiredId
 * @property {string} sourceHash
 * @property {{ sceneId: string, span: HeadingSpan }} canonical
 * @property {{ sceneId: string, span: HeadingSpan }} retired
 * @property {boolean} inEffect
 * @property {number} [mergeSeq] For a split: the merge it undid.
 */
/**
 * The project's headings as khaosd serves them (`/api/v1/locations/headings`).
 * @typedef {Object} HeadingLocations
 * @property {string} sourceHash
 * @property {readonly HeadingOccurrence[]} occurrences
 * @property {readonly HeadingDecision[]} decisions
 */
/**
 * What a place's Headings view shows.
 * @typedef {Object} PlaceHeadings
 * @property {HeadingOccurrence[]} occurrences This place's headings, in scene order.
 * @property {HeadingDecision[]} merges Merges into this place that are in effect: the headings it absorbed.
 * @property {HeadingDecision[]} keptApart Declarations in effect that keep this place apart from another.
 */
/**
 * A screenplay line the place builder cites for an area.
 * @typedef {Object} AreaCitation
 * @property {'space' | 'fixedFeature' | 'dressing' | 'lighting'} field The part of the brief it supports.
 * @property {string} detail The engine's sentence.
 * @property {readonly number[]} [sceneNumbers] The scenes it comes from; absent until the engine sends them.
 */
/**
 * An area of a place, as the place builder prepares it (`preparation.areas[]`).
 * @typedef {Object} PlaceArea
 * @property {string} name
 * @property {{ spatialDescription: string, fixedFeatures: readonly string[], dressing: string, lighting: string, unknowns: readonly string[] }} brief
 * @property {readonly AreaCitation[]} cited
 */
/** @typedef {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded', areas?: readonly PlaceArea[] }} PlaceAreasRead */
/** @param {HeadingLocations} read @param {string} locationId @returns {PlaceHeadings} */
export function headingsFor(read: HeadingLocations, locationId: string): PlaceHeadings;
export function placeCastBars(graphContext: Record<string, unknown> | null | undefined): {
    label: string;
    value: number;
}[];
export function headingsOtherThan(read: HeadingLocations, locationId: string): HeadingOccurrence[];
/**
 * The fields of khaosd's place row (`/api/v1/dashboard/locations`) the destination reads.
 */
export type PlaceRecord = {
    id: string;
    name: string;
    scene_count?: number;
    page_count?: number;
    /**
     * Scenes that only name the place (RFC 0102).
     */
    mentionedSceneIds?: readonly string[];
    origin?: string;
};
export type PlaceRow = {
    id: string;
    name: string;
    scenes: number;
    pages: number;
    /**
     * Scenes that only name the place, apart from the scenes set there.
     */
    named: number;
    origin: string;
};
/**
 * The fields of khaosd's object row (`/api/v1/dashboard/objects`) the destination reads.
 */
export type ObjectRecord = {
    id: string;
    name: string;
    scene_count?: number;
    mentionedSceneIds?: readonly string[];
    identityKind?: "individual" | "group" | string;
    /**
     * A group's members, by id.
     */
    members?: readonly string[];
    /**
     * The groups an object belongs to, by id.
     */
    memberOf?: readonly string[];
    appearances?: readonly {
        sceneId: string;
    }[];
};
export type ObjectRow = {
    id: string;
    name: string;
    scenes: number;
    named: number;
    /**
     * "group of 2", "one of glasses" (RFC 0078 §3.1), or '' for a plain object.
     */
    group: string;
};
/**
 * Where a heading sits in the screenplay, as khaosd read it.
 */
export type HeadingSpan = {
    lineNumber: number;
    lineText: string;
    startByte: number;
    endByte: number;
    sourcePhrase: string;
};
/**
 * One scene's heading and the place the engine resolved it to.
 */
export type HeadingOccurrence = {
    locationId: string;
    /**
     * The screenplay revision it was read from; a declaration sends it back as read.
     */
    sourceHash: string;
    evidence: {
        sceneId: string;
        span: HeadingSpan;
    };
};
/**
 * A landed decision between two headings: a merge, or a declaration.
 */
export type HeadingDecision = {
    state: "merged" | "declaredSame" | "declaredDifferent" | "split";
    decisionSeq: number;
    canonicalId: string;
    retiredId: string;
    sourceHash: string;
    canonical: {
        sceneId: string;
        span: HeadingSpan;
    };
    retired: {
        sceneId: string;
        span: HeadingSpan;
    };
    inEffect: boolean;
    /**
     * For a split: the merge it undid.
     */
    mergeSeq?: number;
};
/**
 * The project's headings as khaosd serves them (`/api/v1/locations/headings`).
 */
export type HeadingLocations = {
    sourceHash: string;
    occurrences: readonly HeadingOccurrence[];
    decisions: readonly HeadingDecision[];
};
/**
 * What a place's Headings view shows.
 */
export type PlaceHeadings = {
    /**
     * This place's headings, in scene order.
     */
    occurrences: HeadingOccurrence[];
    /**
     * Merges into this place that are in effect: the headings it absorbed.
     */
    merges: HeadingDecision[];
    /**
     * Declarations in effect that keep this place apart from another.
     */
    keptApart: HeadingDecision[];
};
/**
 * A screenplay line the place builder cites for an area.
 */
export type AreaCitation = {
    /**
     * The part of the brief it supports.
     */
    field: "space" | "fixedFeature" | "dressing" | "lighting";
    /**
     * The engine's sentence.
     */
    detail: string;
    /**
     * The scenes it comes from; absent until the engine sends them.
     */
    sceneNumbers?: readonly number[];
};
/**
 * An area of a place, as the place builder prepares it (`preparation.areas[]`).
 */
export type PlaceArea = {
    name: string;
    brief: {
        spatialDescription: string;
        fixedFeatures: readonly string[];
        dressing: string;
        lighting: string;
        unknowns: readonly string[];
    };
    cited: readonly AreaCitation[];
};
export type PlaceAreasRead = {
    kind: "loading";
} | {
    kind: "failed";
    message: string;
} | {
    kind: "loaded";
    areas?: readonly PlaceArea[];
};

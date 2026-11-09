/**
 * The production flags raised, labelled, and the contained-location share; null when a flag is
 * one the map has no label for, or is not a boolean, which fails the Production section only.
 * @param {Record<string, any> | null} r
 * @returns {{ raised: string[], contained: Sourced | undefined } | null}
 */
export function productionFlags(r: Record<string, any> | null): {
    raised: string[];
    contained: Sourced | undefined;
} | null;
/**
 * A value the engine sends with where it came from.
 * @typedef {{ value: any, source: 'llm' | 'deterministic' | 'derived' | 'none', confidence: string, model?: string, evidence?: readonly { ref: string, citation: string }[] }} Sourced
 */
/**
 * One section's read.
 * @template T
 * @typedef {{ kind: 'loading' } | { kind: 'missing', reason?: string } | { kind: 'failed', message: string } | { kind: 'loaded', data: T }} SectionRead
 */
/** @typedef {{ sceneId: string, name: string, turn: string }} TurnPoint */
/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/analysis/structure.schema.json:432 ($defs.act).
 * Indices are zero-based and endIndex is inclusive; fraction is the share of story words.
 * @typedef {{ name: string, startIndex: number, endIndex: number, fraction: number }} StructureAct
 */
/** @typedef {{ fit: { outcome: string, reason: string, lenses: readonly { id: string, score: number, p: number }[] }, names?: { state: string, points: readonly TurnPoint[] }, acts?: readonly StructureAct[], _provenance?: { made_by?: { model?: string } } }} StoryStructure */
/** @typedef {{ logline: Sourced, synopsis: Sourced }} StoryPremise */
/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/coverage-report.schema.json:379, :422.
 * Only name is required in actSummary; absent measures must stay absent.
 * @typedef {{ name: string, percentage?: number, sceneCount?: number, durationMs?: number }} CoverageAct
 */
/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/coverage-report.schema.json:61, :450 ($defs.sceneCard).
 * @typedef {{ index?: number, slugline: string, summary: Omit<Sourced, 'value'> & { value: string }, narrativeRole: Omit<Sourced, 'value'> & { value: string }, characters?: readonly string[], durationMs: Omit<Sourced, 'value'> & { value: number } }} CoverageScene
 */
/**
 * The coverage fields these panes render. Optional acts and scenes are schema projections;
 * existing reports without them continue to render their other results.
 * @typedef {Object} StoryCoverage
 * @property {string} [generatedAt]
 * @property {Sourced} logline
 * @property {Sourced} synopsis
 * @property {Sourced} genre
 * @property {Sourced} tone
 * @property {{ verdict: Sourced, dimensions: readonly { name: string, score: Sourced, summary?: Sourced }[] }} rubric
 * @property {{ estimatedRuntimeMs: Sourced, pageCount: Sourced, sceneCount: Sourced, pacingNotes?: Sourced, acts?: readonly CoverageAct[] }} structure
 * @property {readonly CoverageScene[]} [scenes]
 * @property {readonly { name: string, importance: Sourced, arcSummary: Sourced, dialogueWeight: Sourced, sceneCount?: number, strengths: Sourced, concerns: Sourced }[]} [characters]
 * @property {{ uniqueLocations?: number, castSize?: number, speakingRoles?: number, complexityTier: Sourced, productionFlags: { containedLocationPct: Sourced, extrasOrCrowdScenes: boolean, actionHeavyScenes: boolean, vfxOrStuntsSignals: boolean, periodSetting: boolean, childRoles: boolean, animalRoles: boolean } }} viability
 * @property {{ strengths: Sourced, concerns: Sourced, notes: Sourced }} assessment
 * @property {readonly string[]} [incompleteSections]
 * @property {readonly string[]} [warnings]
 */
/**
 * What the Overview selects: a turning point, a coverage character, a journey or a relationship, by
 * index in the engine's list.
 * @typedef {{ kind: 'turn' | 'character' | 'journey' | 'relationship', index: number }} OverviewSelection
 */
/** @type {Readonly<Record<string, string>>} */
export const OUTCOMES: Readonly<Record<string, string>>;
/** The empty verdict is the engine's when no dimension was scored (KSPD coverage-report, source none). */
/** @type {Readonly<Record<string, { text: string, tone: 'success' | 'warning' | 'danger' | 'neutral' }>>} */
export const VERDICTS: Readonly<Record<string, {
    text: string;
    tone: "success" | "warning" | "danger" | "neutral";
}>>;
/**
 * The coverage section names KSPD declares and their labels (RFC 0128, "The names"). Unlike the other
 * maps this one is open: the RFC has a client show a name it does not know exactly as sent and still
 * show the report, so a name missing here is printed as is rather than failing Coverage.
 * @type {Readonly<Record<string, string>>}
 */
export const INCOMPLETE: Readonly<Record<string, string>>;
export function incompleteLabel(s: string): string;
/** @type {Readonly<Record<string, string>>} */
export const FLAGS: Readonly<Record<string, string>>;
export function namedPoints(s: StoryStructure | null): readonly TurnPoint[] | null;
export function shapeReads(s: StoryStructure | null): boolean;
export function coverageReads(r: Record<string, any> | null): any;
/**
 * A character as khaosd names it beside a journey or a relationship: the story's display name,
 * null when the story no longer has that character (khaos-manager#1058).
 * @typedef {{ id: string, name: string | null }} NamedCharacter
 */
/** A journey's arc quality (KSPD RFC 0118), labelled. @type {Readonly<Record<string, string>>} */
export const ARCS: Readonly<Record<string, string>>;
export function characterName(c: NamedCharacter): string;
export function journeyName(c: NamedCharacter): string;
export function pairName(pair: readonly NamedCharacter[]): string;
export function journeysRead(list: unknown): boolean;
export function relationshipsRead(list: unknown): boolean;
/**
 * A value the engine sends with where it came from.
 */
export type Sourced = {
    value: any;
    source: "llm" | "deterministic" | "derived" | "none";
    confidence: string;
    model?: string;
    evidence?: readonly {
        ref: string;
        citation: string;
    }[];
};
/**
 * One section's read.
 */
export type SectionRead<T> = {
    kind: "loading";
} | {
    kind: "missing";
    reason?: string;
} | {
    kind: "failed";
    message: string;
} | {
    kind: "loaded";
    data: T;
};
export type TurnPoint = {
    sceneId: string;
    name: string;
    turn: string;
};
/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/analysis/structure.schema.json:432 ($defs.act).
 * Indices are zero-based and endIndex is inclusive; fraction is the share of story words.
 */
export type StructureAct = {
    name: string;
    startIndex: number;
    endIndex: number;
    fraction: number;
};
export type StoryStructure = {
    fit: {
        outcome: string;
        reason: string;
        lenses: readonly {
            id: string;
            score: number;
            p: number;
        }[];
    };
    names?: {
        state: string;
        points: readonly TurnPoint[];
    };
    acts?: readonly StructureAct[];
    _provenance?: {
        made_by?: {
            model?: string;
        };
    };
};
export type StoryPremise = {
    logline: Sourced;
    synopsis: Sourced;
};
/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/coverage-report.schema.json:379, :422.
 * Only name is required in actSummary; absent measures must stay absent.
 */
export type CoverageAct = {
    name: string;
    percentage?: number;
    sceneCount?: number;
    durationMs?: number;
};
/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/coverage-report.schema.json:61, :450 ($defs.sceneCard).
 */
export type CoverageScene = {
    index?: number;
    slugline: string;
    summary: Omit<Sourced, "value"> & {
        value: string;
    };
    narrativeRole: Omit<Sourced, "value"> & {
        value: string;
    };
    characters?: readonly string[];
    durationMs: Omit<Sourced, "value"> & {
        value: number;
    };
};
/**
 * The coverage fields these panes render. Optional acts and scenes are schema projections;
 * existing reports without them continue to render their other results.
 */
export type StoryCoverage = {
    generatedAt?: string;
    logline: Sourced;
    synopsis: Sourced;
    genre: Sourced;
    tone: Sourced;
    rubric: {
        verdict: Sourced;
        dimensions: readonly {
            name: string;
            score: Sourced;
            summary?: Sourced;
        }[];
    };
    structure: {
        estimatedRuntimeMs: Sourced;
        pageCount: Sourced;
        sceneCount: Sourced;
        pacingNotes?: Sourced;
        acts?: readonly CoverageAct[];
    };
    scenes?: readonly CoverageScene[];
    characters?: readonly {
        name: string;
        importance: Sourced;
        arcSummary: Sourced;
        dialogueWeight: Sourced;
        sceneCount?: number;
        strengths: Sourced;
        concerns: Sourced;
    }[];
    viability: {
        uniqueLocations?: number;
        castSize?: number;
        speakingRoles?: number;
        complexityTier: Sourced;
        productionFlags: {
            containedLocationPct: Sourced;
            extrasOrCrowdScenes: boolean;
            actionHeavyScenes: boolean;
            vfxOrStuntsSignals: boolean;
            periodSetting: boolean;
            childRoles: boolean;
            animalRoles: boolean;
        };
    };
    assessment: {
        strengths: Sourced;
        concerns: Sourced;
        notes: Sourced;
    };
    incompleteSections?: readonly string[];
    warnings?: readonly string[];
};
/**
 * What the Overview selects: a turning point, a coverage character, a journey or a relationship, by
 * index in the engine's list.
 */
export type OverviewSelection = {
    kind: "turn" | "character" | "journey" | "relationship";
    index: number;
};
/**
 * A character as khaosd names it beside a journey or a relationship: the story's display name,
 * null when the story no longer has that character (khaos-manager#1058).
 */
export type NamedCharacter = {
    id: string;
    name: string | null;
};

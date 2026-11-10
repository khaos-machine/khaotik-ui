/**
 * The structure's turns in story order, placed by its profile; null when there is no profile to
 * place them by. Heights are relative to the strongest turn because strength has no upper bound.
 * @param {StoryStructure | null} s
 * @returns {TimelineTurn[] | null}
 */
export function timelineTurns(s: StoryStructure | null): TimelineTurn[] | null;
/**
 * The structures whose expected beats the timeline draws: the primary when one fit (RFC 0111 §3.4,
 * inferred); when the fit is ambiguous the protocol names no set, so the top two scored lenses by
 * excess (operator, 2026-11-10: "Top two by excess"); none otherwise, since nothing fit.
 * @param {StoryStructure | null} s
 * @returns {{ id: string, name: string, beats: { name: string, position: number }[] }[]}
 */
export function fittingLenses(s: StoryStructure | null): {
    id: string;
    name: string;
    beats: {
        name: string;
        position: number;
    }[];
}[];
/**
 * Where the story's turns cluster: a density per twentieth of the story (the count within a fifth
 * around it, against the densest), and the busiest and quietest fifth, the earlier on a tie. Null
 * with fewer than two turns, when there is no pacing to speak of.
 * @param {readonly TimelineTurn[] | null} turns
 * @returns {{ density: number[], busy: { from: number, to: number }, quiet: { from: number, to: number } } | null}
 */
export function pacing(turns: readonly TimelineTurn[] | null): {
    density: number[];
    busy: {
        from: number;
        to: number;
    };
    quiet: {
        from: number;
        to: number;
    };
} | null;
/** @typedef {{ name: string, score: number | null, x: number, y: number, spokeX: number, spokeY: number, labelX: number, labelY: number, side: 'start' | 'middle' | 'end' }} RadarSpoke */
/**
 * The coverage rubric as a radar (operator, 2026-11-10: "Radar"): one spoke per dimension,
 * clockwise from the top, a score its tenth of the way out. An unscored dimension
 * (score.source "none") keeps its spoke and has no point. `side` says which way a label reads
 * from its anchor: right of the centre "start", left "end", top and bottom "middle".
 * @param {readonly { name: string, score: { value: number, source: string } }[]} dimensions
 * @returns {RadarSpoke[]}
 */
export function rubricRadar(dimensions: readonly {
    name: string;
    score: {
        value: number;
        source: string;
    };
}[]): RadarSpoke[];
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
 * The structure lenses' names. Open: the lens catalog can grow, so an id missing here is shown as
 * sent rather than failing the timeline.
 * @type {Readonly<Record<string, string>>}
 */
export const LENSES: Readonly<Record<string, string>>;
export function lensName(id: string): string;
/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/coverage-report.schema.json:391 ($defs.measuredStructure).
 * document is absent when not-measured.
 * @typedef {{ outcome: string, reason: string, document?: string }} MeasuredStructure
 */
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
 * @property {{ verdict: Sourced, dimensions?: readonly { name: string, score: Sourced, summary?: Sourced }[] }} rubric Only verdict is required (:312).
 * @property {{ estimatedRuntimeMs: Sourced, pageCount: Sourced, sceneCount: Sourced, measured?: MeasuredStructure, pacingNotes?: Sourced, acts?: readonly CoverageAct[] }} structure measured is required by KSPD but read as optional, so older reports still render.
 * @property {readonly CoverageScene[]} [scenes]
 * @property {readonly { name: string, importance: Sourced, arcSummary: Sourced, dialogueWeight: Sourced, sceneCount?: number, strengths: Sourced, concerns: Sourced }[]} [characters]
 * @property {{ uniqueLocations?: number, castSize?: number, speakingRoles?: number, complexityTier: Sourced, productionFlags: { containedLocationPct: Sourced, extrasOrCrowdScenes: boolean, actionHeavyScenes: boolean, vfxOrStuntsSignals: boolean, periodSetting: boolean, childRoles: boolean, animalRoles: boolean } }} viability
 * @property {{ strengths: Sourced, concerns: Sourced, notes: Sourced }} assessment strengths and concerns may carry a null value (:280).
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
/**
 * What coverage's structure.measured found: the shape outcomes, plus absence (KSPD
 * go/kspdprotocol/v0.136.1 coverage-report.schema.json:391, $defs.measuredStructure). Closed: an
 * outcome outside it fails only the measured block.
 * @type {Readonly<Record<string, string>>}
 */
export const MEASURED: Readonly<Record<string, string>>;
export function namedPoints(s: StoryStructure | null): readonly TurnPoint[] | null;
/** The radar's full-score radius, in percent of its square box; the labels sit outside it. */
export const RADAR_RADIUS: 30;
export function listItems(f: {
    value?: readonly string[] | null;
} | null | undefined): readonly string[];
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
export type RadarSpoke = {
    name: string;
    score: number | null;
    x: number;
    y: number;
    spokeX: number;
    spokeY: number;
    labelX: number;
    labelY: number;
    side: "start" | "middle" | "end";
};
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
/**
 * A place in the story where it turns. KSPD go/kspdprotocol/v0.136.1
 * schemas/KSPD/analysis/structure.schema.json:193 ($defs.inflectionPoint): index is zero-based
 * story order, position the share of the story's words before the scene, and strength only
 * bounded below (:217).
 */
export type InflectionPoint = {
    sceneId: string;
    index: number;
    position: number;
    strength: number;
    contributors: readonly {
        thread: string;
        ref: string;
        weight: number;
        kind: string;
    }[];
};
/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/analysis/structure.schema.json: a lens's score and p are
 * absent when not scored (:371, :379); names.points is optional (:387). profile is required (:10)
 * and read as optional, so a read without it still renders.
 * A lens carries its beats as used (:330) and, when scored, its excess over the rotation null (:377).
 */
export type StoryStructure = {
    fit: {
        outcome: string;
        reason: string;
        primary?: string;
        lenses: readonly {
            id: string;
            beats?: readonly {
                name: string;
                position: number;
            }[];
            score?: number;
            excess?: number;
            p?: number;
        }[];
    };
    names?: {
        state: string;
        points?: readonly TurnPoint[];
    };
    profile?: {
        scenes: readonly InflectionPoint[];
    };
    acts?: readonly StructureAct[];
    _provenance?: {
        made_by?: {
            model?: string;
        };
    };
};
/**
 * A turn on the story timeline: where it falls (0–1), its height against the story's strongest
 * turn (0–1], the named point it stands for by index, -1 and no name when it is not named, and
 * whether it is one of the big turns the chart names.
 */
export type TimelineTurn = {
    sceneId: string;
    position: number;
    height: number;
    point: number;
    name: string | null;
    label: boolean;
};
/**
 * KSPD go/kspdprotocol/v0.136.1 schemas/KSPD/coverage-report.schema.json:391 ($defs.measuredStructure).
 * document is absent when not-measured.
 */
export type MeasuredStructure = {
    outcome: string;
    reason: string;
    document?: string;
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
    /**
     * Only verdict is required (:312).
     */
    rubric: {
        verdict: Sourced;
        dimensions?: readonly {
            name: string;
            score: Sourced;
            summary?: Sourced;
        }[];
    };
    /**
     * measured is required by KSPD but read as optional, so older reports still render.
     */
    structure: {
        estimatedRuntimeMs: Sourced;
        pageCount: Sourced;
        sceneCount: Sourced;
        measured?: MeasuredStructure;
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
    /**
     * strengths and concerns may carry a null value (:280).
     */
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

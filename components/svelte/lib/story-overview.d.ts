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
/** @typedef {{ fit: { outcome: string, reason: string, lenses: readonly { id: string, score: number, p: number }[] }, names?: { state: string, points: readonly TurnPoint[] }, _provenance?: { made_by?: { model?: string } } }} StoryStructure */
/** @typedef {{ logline: Sourced, synopsis: Sourced }} StoryPremise */
/**
 * What the Overview selects: a turning point, a coverage character, a journey or a relationship, by
 * index in the engine's list.
 * @typedef {{ kind: 'turn' | 'character' | 'journey' | 'relationship', index: number }} OverviewSelection
 */
/** @type {Readonly<Record<string, string>>} */
export const OUTCOMES: Readonly<Record<string, string>>;
/** @type {Readonly<Record<string, { text: string, tone: 'success' | 'warning' | 'danger' }>>} */
export const VERDICTS: Readonly<Record<string, {
    text: string;
    tone: "success" | "warning" | "danger";
}>>;
/** @type {Readonly<Record<string, string>>} */
export const INCOMPLETE: Readonly<Record<string, string>>;
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

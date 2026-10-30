/**
 * How many artifacts of each kind, in the display order. Counted from the artifacts rather than
 * from RESOURCE_KIND_ORDER, so a kind the engine added shows with its real count instead of being
 * reported as absent.
 * @param {readonly { kind: string }[]} artifacts @returns {{ kind: string, count: number }[]}
 */
export function artifactsByKind(artifacts: readonly {
    kind: string;
}[]): {
    kind: string;
    count: number;
}[];
/** A kind's heading: its words, capitalised, so a kind the engine adds reads without an edit. @param {string} kind */
export function resourceKindLabel(kind: string): string;
/** The kinds in the order the library lists them; a kind the engine adds follows, sorted. */
export const RESOURCE_KIND_ORDER: string[];

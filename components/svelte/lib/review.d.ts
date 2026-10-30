/**
 * The character a name already names, by its name or an alias, ignoring case and spacing; null
 * when none does. Only for what review offers: khaosd still judges a create.
 * @param {string} name @param {readonly Named[]} characters @returns {Named | null}
 */
export function characterNamed(name: string, characters: readonly Named[]): Named | null;
/** A record's title. @param {ReviewItem} item @returns {string} */
export function reviewTitle(item: ReviewItem): string;
/**
 * Every identity of the reference's kind the story holds: a binding may name any of them. The
 * engine's proposal and candidates lead, each listed once.
 * @param {Reference} record @param {ReviewStory} story @returns {{ value: string, label: string, group: string }[]}
 */
export function referentChoices(record: Reference, story: ReviewStory): {
    value: string;
    label: string;
    group: string;
}[];
/**
 * The line above the answer that says which occurrences it decides: none for a single mention
 * or a relation, which are never grouped.
 * @param {MentionGroup | null} group @returns {string}
 */
export function groupNote(group: MentionGroup | null): string;
export function namesACharacter(item: ReviewItem): boolean;
export function reviewPhrase(item: ReviewItem): string;
export function nameIn(list: readonly Named[], id: string): string;
export function endpointName(story: ReviewStory, id: string): string;
export function referentKindCopy(kind: ReferentKind): {
    list: "characters" | "objects" | "locations";
    plural: string;
    label: string;
    question: string;
};
/**
 * Where in the committed source a record quotes. `lineNumber` is 1-based.
 */
export type ExtractionSource = {
    id: string;
    sceneId: string;
    lineNumber: number;
    lineText: string;
    sourcePhrase: string;
};
export type EntityKind = "individual" | "group" | "non_person";
export type ReferentKind = "entity" | "object" | "location";
export type EntityAppearance = ExtractionSource & {
    name: string;
    entityKind: EntityKind;
};
export type ObjectAppearance = ExtractionSource & {
    displayNoun: string;
    candidateObjectIds: readonly string[];
    proposedObjectId?: string;
};
export type LocationAppearance = ExtractionSource & {
    candidateLocationIds: readonly string[];
    proposedLocationId?: string;
    proposedDisplayName?: string;
};
/**
 * A mention of someone or something not present. `speakerCharacterId` is the character speaking
 * the line, when the mention is in dialogue.
 */
export type Reference = ExtractionSource & {
    speakerCharacterId?: string;
    referentKind: ReferentKind;
    name: string;
    entityKind?: EntityKind;
    candidateIds: readonly string[];
    proposedId?: string;
};
export type RelationSpan = {
    lineNumber: number;
    lineText: string;
    sourcePhrase: string;
};
/**
 * A relation the producer extracted and no one has ruled on (RFC 0080 §2): `from label to`.
 * An endpoint is settled when `fromId` or `toId` is served.
 */
export type RelationCandidate = ExtractionSource & {
    label: string;
    fromPhrase: string;
    toPhrase: string;
    spans: readonly RelationSpan[];
    fromSpanIndex: number;
    toSpanIndex: number;
    candidateFromIds: readonly string[];
    candidateToIds: readonly string[];
    fromId?: string;
    toId?: string;
};
/**
 * One pending record. `classifiedAs`: KSPD's typed claims for a non_person refusal, and what
 * they name (RFC 0101 §5). A relation's `offers` are the engine's, passed back unchanged.
 */
export type ReviewItem = {
    kind: "entityAppearance";
    record: EntityAppearance;
    classifiedAs?: {
        ids: readonly string[];
        label: string;
    };
} | {
    kind: "objectAppearance";
    record: ObjectAppearance;
} | {
    kind: "locationAppearance";
    record: LocationAppearance;
} | {
    kind: "reference";
    record: Reference;
} | {
    kind: "relation";
    record: RelationCandidate;
    offers: readonly unknown[];
};
/**
 * A character, object or place the story holds. `aliases` are a character's other names.
 */
export type Named = {
    id: string;
    name: string;
    aliases?: readonly string[];
};
/**
 * The identities the story already holds. `groups` are the objects that are groups.
 */
export type ReviewStory = {
    characters: readonly Named[];
    objects: readonly Named[];
    groups: readonly Named[];
    locations: readonly Named[];
};
/**
 * One group of identical mentions, in screenplay order; `scenes` is how many scenes they are
 * in. `included`, on the chosen group, holds the occurrences its decision still applies to.
 */
export type MentionGroup = {
    key: string;
    kind: ReviewItem["kind"];
    label: string;
    items: readonly ReviewItem[];
    scenes: number;
    included?: readonly ReviewItem[];
};
/**
 * What the person has said so far: a single-choice answer, and a menu pick.
 */
export type ReviewChoice = {
    answer: string | null;
    pick: string | null;
};
export type Answer = {
    key: string;
    title: string;
    subtitle: string;
};
/**
 * One verdict the record offers. `decision` is the host's, sent back unchanged; null draws the
 * button disabled until the answer it needs is given.
 */
export type VerdictButton = {
    verdict: "bound" | "refused" | "unresolved" | "link";
    label: string;
    primary: boolean;
    decision: unknown;
};
/**
 * The identity a person may create, then bind the record to. `identityKind` null: an object
 * whose kind the person is asked. `sameName`: an object the name already names.
 */
export type CreateOffer = {
    kind: "character" | "object" | "location";
    name: string;
    identityKind: "individual" | "group" | null;
    sameName: Named | null;
};
/**
 * What a record offers for the person's choice so far, and the line that explains it.
 */
export type Decisions = {
    kind: "decidable";
    buttons: readonly VerdictButton[];
    hint: string;
    create: CreateOffer | null;
};
/**
 * "Always match": the mention's name becomes the character's alias (RFC 0097).
 */
export type AlwaysMatch = {
    characterId: string;
    characterName: string;
    alias: string;
};
/**
 * One scene analysis's reading of one pending record (khaosd `pending-suggestions`).
 */
export type PendingSuggestion = {
    sceneId: string;
    recordId: string;
    suggestion: string;
    bindTo?: string;
    outcome: "accepted" | "statement" | "rejected";
    reason?: string;
    dismissed: boolean;
};
/**
 * A suggestion as the host offers it: in words, what may be accepted (each with the host's
 * decision, sent back unchanged), and why nothing can be when `accepts` is empty.
 */
export type SuggestionOffer = {
    says: string;
    accepts: readonly {
        label: string;
        decision: unknown;
    }[];
    needs: string;
};

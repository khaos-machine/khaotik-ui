// Review's records as khaosd serves them (`GET /api/dashboard/pending-extraction`, RFC 0089 and
// RFC 0080), and how the Review destination names them. What a person may decide, and the
// decision that reaches khaosd, stay the host's: they arrive as props, opaque here. Moved from
// Khaos App's `src/app/extraction-review.svelte.ts` (catalog app-coverage plan, T6).

/**
 * Where in the committed source a record quotes. `lineNumber` is 1-based.
 * @typedef {Object} ExtractionSource
 * @property {string} id
 * @property {string} sceneId
 * @property {number} lineNumber
 * @property {string} lineText
 * @property {string} sourcePhrase
 */

/** @typedef {'individual' | 'group' | 'non_person'} EntityKind */
/** @typedef {'entity' | 'object' | 'location'} ReferentKind */

/** @typedef {ExtractionSource & { name: string, entityKind: EntityKind }} EntityAppearance */
/** @typedef {ExtractionSource & { displayNoun: string, candidateObjectIds: readonly string[], proposedObjectId?: string }} ObjectAppearance */
/** @typedef {ExtractionSource & { candidateLocationIds: readonly string[], proposedLocationId?: string, proposedDisplayName?: string }} LocationAppearance */
/**
 * A mention of someone or something not present. `speakerCharacterId` is the character speaking
 * the line, when the mention is in dialogue.
 * @typedef {ExtractionSource & { speakerCharacterId?: string, referentKind: ReferentKind, name: string, entityKind?: EntityKind, candidateIds: readonly string[], proposedId?: string }} Reference
 */
/** @typedef {{ lineNumber: number, lineText: string, sourcePhrase: string }} RelationSpan */
/**
 * A relation the producer extracted and no one has ruled on (RFC 0080 §2): `from label to`.
 * An endpoint is settled when `fromId` or `toId` is served.
 * @typedef {ExtractionSource & { label: string, fromPhrase: string, toPhrase: string, spans: readonly RelationSpan[], fromSpanIndex: number, toSpanIndex: number, candidateFromIds: readonly string[], candidateToIds: readonly string[], fromId?: string, toId?: string }} RelationCandidate
 */

/**
 * One pending record. `classifiedAs`: KSPD's typed claims for a non_person refusal, and what
 * they name (RFC 0101 §5). A relation's `offers` are the engine's, passed back unchanged.
 * @typedef {{ kind: 'entityAppearance', record: EntityAppearance, classifiedAs?: { ids: readonly string[], label: string } }
 *   | { kind: 'objectAppearance', record: ObjectAppearance }
 *   | { kind: 'locationAppearance', record: LocationAppearance }
 *   | { kind: 'reference', record: Reference }
 *   | { kind: 'relation', record: RelationCandidate, offers: readonly unknown[] }} ReviewItem
 */

/**
 * A character, object or place the story holds. `aliases` are a character's other names.
 * @typedef {Object} Named
 * @property {string} id
 * @property {string} name
 * @property {readonly string[]} [aliases]
 */

/**
 * The identities the story already holds. `groups` are the objects that are groups.
 * @typedef {Object} ReviewStory
 * @property {readonly Named[]} characters
 * @property {readonly Named[]} objects
 * @property {readonly Named[]} groups
 * @property {readonly Named[]} locations
 */

/**
 * One group of identical mentions, in screenplay order; `scenes` is how many scenes they are
 * in. `included`, on the chosen group, holds the occurrences its decision still applies to.
 * @typedef {Object} MentionGroup
 * @property {string} key
 * @property {ReviewItem['kind']} kind
 * @property {string} label
 * @property {readonly ReviewItem[]} items
 * @property {number} scenes
 * @property {readonly ReviewItem[]} [included]
 */

/** What the person has said so far: a single-choice answer, and a menu pick. @typedef {{ answer: string | null, pick: string | null }} ReviewChoice */
/** @typedef {{ key: string, title: string, subtitle: string }} Answer */

/**
 * One verdict the record offers. `decision` is the host's, sent back unchanged; null draws the
 * button disabled until the answer it needs is given.
 * @typedef {Object} VerdictButton
 * @property {'bound' | 'refused' | 'unresolved' | 'link'} verdict
 * @property {string} label
 * @property {boolean} primary
 * @property {unknown} decision
 */

/**
 * The identity a person may create, then bind the record to. `identityKind` null: an object
 * whose kind the person is asked. `sameName`: an object the name already names.
 * @typedef {Object} CreateOffer
 * @property {'character' | 'object' | 'location'} kind
 * @property {string} name
 * @property {'individual' | 'group' | null} identityKind
 * @property {Named | null} sameName
 */

/**
 * What a record offers for the person's choice so far, and the line that explains it.
 * @typedef {Object} Decisions
 * @property {'decidable'} kind
 * @property {readonly VerdictButton[]} buttons
 * @property {string} hint
 * @property {CreateOffer | null} create
 */

/** "Always match": the mention's name becomes the character's alias (RFC 0097). @typedef {{ characterId: string, characterName: string, alias: string }} AlwaysMatch */

/**
 * One scene analysis's reading of one pending record (khaosd `pending-suggestions`).
 * @typedef {Object} PendingSuggestion
 * @property {string} sceneId
 * @property {string} recordId
 * @property {string} suggestion
 * @property {string} [bindTo]
 * @property {'accepted' | 'statement' | 'rejected'} outcome
 * @property {string} [reason]
 * @property {boolean} dismissed
 */

/**
 * A suggestion as the host offers it: in words, what may be accepted (each with the host's
 * decision, sent back unchanged), and why nothing can be when `accepts` is empty.
 * @typedef {{ says: string, accepts: readonly { label: string, decision: unknown }[], needs: string }} SuggestionOffer
 */

const nameKey = (/** @type {string} */ name) => name.trim().replace(/\s+/g, ' ').toLowerCase()

/**
 * The character a name already names, by its name or an alias, ignoring case and spacing; null
 * when none does. Only for what review offers: khaosd still judges a create.
 * @param {string} name @param {readonly Named[]} characters @returns {Named | null}
 */
export function characterNamed(name, characters) {
  const key = nameKey(name)
  if (!key) return null
  return characters.find((c) => [c.name, ...(c.aliases ?? [])].some((n) => nameKey(n) === key)) ?? null
}

/** A mention that can be bound to a character already in the story. @param {ReviewItem} item */
export const namesACharacter = (item) =>
  item.kind === 'entityAppearance' || (item.kind === 'reference' && item.record.referentKind === 'entity')

/** A record's title. @param {ReviewItem} item @returns {string} */
export function reviewTitle(item) {
  switch (item.kind) {
    case 'entityAppearance':
    case 'reference':
      return item.record.name
    case 'objectAppearance':
      return item.record.displayNoun
    case 'locationAppearance':
      return item.record.proposedDisplayName ?? item.record.sourcePhrase
    case 'relation':
      return `${item.record.fromPhrase} ${item.record.label} ${item.record.toPhrase}`
  }
}

/** The words a record quotes, as a decision names it. @param {ReviewItem} item */
export const reviewPhrase = (item) => (item.kind === 'relation' ? reviewTitle(item) : item.record.sourcePhrase || reviewTitle(item))

/** @param {readonly Named[]} list @param {string} id */
export const nameIn = (list, id) => list.find((n) => n.id === id)?.name ?? id

/** A relation endpoint's name: a character, an object or a place. @param {ReviewStory} story @param {string} id */
export const endpointName = (story, id) => nameIn([...story.characters, ...story.objects, ...story.locations], id)

/** @type {Record<ReferentKind, { list: 'characters' | 'objects' | 'locations', plural: string, label: string, question: string }>} */
const KIND_IDENTITIES = {
  entity: { list: 'characters', plural: 'characters', label: 'Character', question: 'Who is named?' },
  location: { list: 'locations', plural: 'places', label: 'Place', question: 'Which place is named?' },
  object: { list: 'objects', plural: 'objects', label: 'Object', question: 'Which object is named?' },
}

/** The list, plural, menu label and question for a reference's referent kind. @param {ReferentKind} kind */
export const referentKindCopy = (kind) => KIND_IDENTITIES[kind]

/**
 * Every identity of the reference's kind the story holds: a binding may name any of them. The
 * engine's proposal and candidates lead, each listed once.
 * @param {Reference} record @param {ReviewStory} story @returns {{ value: string, label: string, group: string }[]}
 */
export function referentChoices(record, story) {
  const pool = story[KIND_IDENTITIES[record.referentKind].list]
  const suggested = [...new Set([...(record.proposedId ? [record.proposedId] : []), ...record.candidateIds])]
  return [
    ...suggested.map((id) => ({ value: id, label: nameIn(pool, id), group: 'Suggested' })),
    ...pool.filter((n) => !suggested.includes(n.id)).map((n) => ({ value: n.id, label: n.name, group: 'In the story' })),
  ]
}

/**
 * The line above the answer that says which occurrences it decides: none for a single mention
 * or a relation, which are never grouped.
 * @param {MentionGroup | null} group @returns {string}
 */
export function groupNote(group) {
  if (!group || group.items.length < 2 || group.kind === 'relation') return ''
  const included = group.included?.length ?? group.items.length
  return included === group.items.length
    ? `Your answer applies to all ${group.items.length} lines. Uncheck any that differ.`
    : `Your answer applies to ${included} of ${group.items.length} lines. The unchecked ones stay for later.`
}

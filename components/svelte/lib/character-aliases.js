// A character's names by who asserted them, from the row khaosd serves on
// /api/v1/dashboard/characters (RFC 0097). An **authored** alias is a person's ("Des" for
// DESMOND); an **introduced** alias is the parser's, from the screenplay introducing a
// character by a longer name. Moved from Khaos App's `src/app/character-aliases.svelte.ts`
// (catalog app-coverage plan, T2).

/**
 * The fields of khaosd's character row that name it.
 * @typedef {Object} NamedCharacter
 * @property {string} [id]
 * @property {string} [name]
 * @property {readonly string[]} [aliases] Every name the registry resolves to the character.
 * @property {readonly string[]} [authoredAliases]
 * @property {readonly string[]} [introducedAliases]
 */

/**
 * @typedef {Object} AliasGroups
 * @property {readonly string[]} authored A person's aliases: removable.
 * @property {readonly string[]} introduced The screenplay's introductions: rejectable.
 * @property {readonly string[]} other Every other name the registry resolves to the character: the cue and one-off binds.
 */

/** @param {string} name */
const key = (name) => name.trim().toLowerCase()

/** The row's names by who asserted them. The character's own name is its heading, not an alias. @param {NamedCharacter} character @returns {AliasGroups} */
export function aliasGroups(character) {
  const authored = character.authoredAliases ?? []
  const introduced = character.introducedAliases ?? []
  const asserted = new Set([...authored, ...introduced, character.name ?? ''].map(key))
  return { authored, introduced, other: (character.aliases ?? []).filter((n) => !asserted.has(key(n))) }
}

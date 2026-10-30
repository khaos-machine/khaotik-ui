/** The row's names by who asserted them. The character's own name is its heading, not an alias. @param {NamedCharacter} character @returns {AliasGroups} */
export function aliasGroups(character: NamedCharacter): AliasGroups;
/**
 * The fields of khaosd's character row that name it.
 */
export type NamedCharacter = {
    id?: string;
    name?: string;
    /**
     * Every name the registry resolves to the character.
     */
    aliases?: readonly string[];
    authoredAliases?: readonly string[];
    introducedAliases?: readonly string[];
};
export type AliasGroups = {
    /**
     * A person's aliases: removable.
     */
    authored: readonly string[];
    /**
     * The screenplay's introductions: rejectable.
     */
    introduced: readonly string[];
    /**
     * Every other name the registry resolves to the character: the cue and one-off binds.
     */
    other: readonly string[];
};

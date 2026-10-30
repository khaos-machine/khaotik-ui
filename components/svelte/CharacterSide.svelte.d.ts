export default CharacterSide;
type CharacterSide = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const CharacterSide: import("svelte").Component<{
    /**
     * The selected character's row, or null.
     */
    character?: import("./lib/characters.js").CharacterRecord | null;
    /**
     * The narrator's row is selected.
     */
    narrator?: boolean;
    /**
     * The host's dialogue inspector, rendered in place of everything else while a line is selected; undefined while none is.
     */
    dialogue?: import("svelte").Snippet | undefined;
    /**
     * The character's resolved headshot URL.
     */
    portrait?: string;
    /**
     * The voices a character or the narrator can be cast to.
     */
    castable?: readonly import("./lib/characters.js").CastableVoice[];
    /**
     * The Voice pop-up's text: the cast voice, "Not cast", or the read's state.
     */
    castLabel?: string;
    /**
     * The character is cast, so no voice is suggested.
     */
    cast?: boolean;
    /**
     * The narrator's voice name, or "Not set".
     */
    narratorLabel?: string;
    /**
     * Hearing the narrator's voice in place: `none` offers Preview voice, `making` while the host makes the clip, `ready` plays it, `failed` says why and offers it again. Null, with no voice set, draws nothing.
     */
    narratorPreview?: {
        kind: "none";
    } | {
        kind: "making";
    } | {
        kind: "ready";
        src: string;
    } | {
        kind: "failed";
        message: string;
    } | null;
    /**
     * Preview voice was pressed: make the narrator's preview clip.
     */
    onPreviewNarrator?: () => void;
    /**
     * Why casting is unavailable now; empty when it is.
     */
    castDisabledReason?: string;
    /**
     * The character's own cast voice, when it is not locked yet.
     */
    castUnlocked?: {
        name: string;
        profileId: string;
    } | null;
    /**
     * Reports a voice picked for the selection.
     */
    onCast?: (profileId: string) => void;
    /**
     * Reports Lock… on the unlocked cast voice.
     */
    onLockVoice?: (profileId: string) => void;
    /**
     * Reports Design a voice….
     */
    onDesignVoice?: (characterId: string, characterName: string) => void;
    /**
     * The selection's voice brief, shown under the voice picker; absent shows none.
     */
    voiceBrief?: import("svelte").ComponentProps<typeof VoiceBrief>["read"];
    /**
     * The story's characters: where stranded mentions can be moved.
     */
    characters?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * Mentions left bound through a removed alias.
     */
    stranded?: import("./lib/types.js").Stranded | null;
    /**
     * An alias change is being written.
     */
    aliasBusy?: boolean;
    /**
     * Reports an alias to add.
     */
    onAddAlias?: (alias: string) => void;
    /**
     * Reports an alias to remove or reject.
     */
    onRemoveAlias?: (alias: string, origin: "authored" | "introduced") => boolean | void | Promise<boolean | void>;
    /**
     * Reports a move of stranded mentions.
     */
    onMoveMentions?: (mentionIds: string[], to: import("./lib/types.js").BindTarget, destinationName: string) => void | Promise<void>;
    /**
     * Reports leaving stranded mentions.
     */
    onLeaveMentions?: () => void;
    /**
     * A scene's 1-based number, or null.
     */
    sceneNumber?: (sceneId: string) => number | null;
    /**
     * The character's mention wordings.
     */
    mentions?: import("./lib/types.js").MentionsRead;
    /**
     * The chosen wording.
     */
    selectedMention?: string | null;
    /**
     * Reports a chosen wording, or null.
     */
    onSelectMention?: (wording: string | null) => void;
    /**
     * The character's detail's `graph_context`, for Appears with.
     */
    graphContext?: Record<string, unknown> | null;
    /**
     * Offers Delete….
     */
    deletable?: boolean;
    /**
     * A deletion is being written.
     */
    deleteBusy?: boolean;
    /**
     * Appended to the deletion's confirmation: how it can be undone.
     */
    restoreNote?: string;
    /**
     * Reports a confirmed deletion.
     */
    onDelete?: () => void;
}, {}, "">;
type Props = {
    /**
     * The selected character's row, or null.
     */
    character?: import("./lib/characters.js").CharacterRecord | null;
    /**
     * The narrator's row is selected.
     */
    narrator?: boolean;
    /**
     * The host's dialogue inspector, rendered in place of everything else while a line is selected; undefined while none is.
     */
    dialogue?: import("svelte").Snippet | undefined;
    /**
     * The character's resolved headshot URL.
     */
    portrait?: string;
    /**
     * The voices a character or the narrator can be cast to.
     */
    castable?: readonly import("./lib/characters.js").CastableVoice[];
    /**
     * The Voice pop-up's text: the cast voice, "Not cast", or the read's state.
     */
    castLabel?: string;
    /**
     * The character is cast, so no voice is suggested.
     */
    cast?: boolean;
    /**
     * The narrator's voice name, or "Not set".
     */
    narratorLabel?: string;
    /**
     * Hearing the narrator's voice in place: `none` offers Preview voice, `making` while the host makes the clip, `ready` plays it, `failed` says why and offers it again. Null, with no voice set, draws nothing.
     */
    narratorPreview?: {
        kind: "none";
    } | {
        kind: "making";
    } | {
        kind: "ready";
        src: string;
    } | {
        kind: "failed";
        message: string;
    } | null;
    /**
     * Preview voice was pressed: make the narrator's preview clip.
     */
    onPreviewNarrator?: () => void;
    /**
     * Why casting is unavailable now; empty when it is.
     */
    castDisabledReason?: string;
    /**
     * The character's own cast voice, when it is not locked yet.
     */
    castUnlocked?: {
        name: string;
        profileId: string;
    } | null;
    /**
     * Reports a voice picked for the selection.
     */
    onCast?: (profileId: string) => void;
    /**
     * Reports Lock… on the unlocked cast voice.
     */
    onLockVoice?: (profileId: string) => void;
    /**
     * Reports Design a voice….
     */
    onDesignVoice?: (characterId: string, characterName: string) => void;
    /**
     * The selection's voice brief, shown under the voice picker; absent shows none.
     */
    voiceBrief?: import("svelte").ComponentProps<typeof VoiceBrief>["read"];
    /**
     * The story's characters: where stranded mentions can be moved.
     */
    characters?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * Mentions left bound through a removed alias.
     */
    stranded?: import("./lib/types.js").Stranded | null;
    /**
     * An alias change is being written.
     */
    aliasBusy?: boolean;
    /**
     * Reports an alias to add.
     */
    onAddAlias?: (alias: string) => void;
    /**
     * Reports an alias to remove or reject.
     */
    onRemoveAlias?: (alias: string, origin: "authored" | "introduced") => boolean | void | Promise<boolean | void>;
    /**
     * Reports a move of stranded mentions.
     */
    onMoveMentions?: (mentionIds: string[], to: import("./lib/types.js").BindTarget, destinationName: string) => void | Promise<void>;
    /**
     * Reports leaving stranded mentions.
     */
    onLeaveMentions?: () => void;
    /**
     * A scene's 1-based number, or null.
     */
    sceneNumber?: (sceneId: string) => number | null;
    /**
     * The character's mention wordings.
     */
    mentions?: import("./lib/types.js").MentionsRead;
    /**
     * The chosen wording.
     */
    selectedMention?: string | null;
    /**
     * Reports a chosen wording, or null.
     */
    onSelectMention?: (wording: string | null) => void;
    /**
     * The character's detail's `graph_context`, for Appears with.
     */
    graphContext?: Record<string, unknown> | null;
    /**
     * Offers Delete….
     */
    deletable?: boolean;
    /**
     * A deletion is being written.
     */
    deleteBusy?: boolean;
    /**
     * Appended to the deletion's confirmation: how it can be undone.
     */
    restoreNote?: string;
    /**
     * Reports a confirmed deletion.
     */
    onDelete?: () => void;
};
import VoiceBrief from './VoiceBrief.svelte';

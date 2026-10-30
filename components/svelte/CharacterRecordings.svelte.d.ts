export default CharacterRecordings;
type CharacterRecordings = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const CharacterRecordings: import("svelte").Component<{
    /**
     * Where the read is. Loading until the host says otherwise.
     */
    read?: import("./lib/types.js").RecordingsRead;
    /**
     * Whose recordings, for the table's label and its empty line.
     */
    characterName?: string;
    /**
     * Reports an activated recording.
     */
    onRevealRecording?: (id: string) => void;
}, {}, "">;
type Props = {
    /**
     * Where the read is. Loading until the host says otherwise.
     */
    read?: import("./lib/types.js").RecordingsRead;
    /**
     * Whose recordings, for the table's label and its empty line.
     */
    characterName?: string;
    /**
     * Reports an activated recording.
     */
    onRevealRecording?: (id: string) => void;
};

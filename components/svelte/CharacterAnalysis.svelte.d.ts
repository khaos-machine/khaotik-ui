export default CharacterAnalysis;
type CharacterAnalysis = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const CharacterAnalysis: import("svelte").Component<{
    /**
     * The analysis record from khaosd's `/api/dashboard/detail` (`.analysis`). Null, or a record with neither a story nor a casting reading, draws nothing.
     */
    analysis?: Record<string, unknown> | null;
}, {}, "">;
type Props = {
    /**
     * The analysis record from khaosd's `/api/dashboard/detail` (`.analysis`). Null, or a record with neither a story nor a casting reading, draws nothing.
     */
    analysis?: Record<string, unknown> | null;
};

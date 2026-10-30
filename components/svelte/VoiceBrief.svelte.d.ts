export default VoiceBrief;
type VoiceBrief = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const VoiceBrief: import("svelte").Component<{
    /**
     * Whose brief: a character's name, or "Narrator".
     */
    name?: string;
    /**
     * The brief, as far as the host has read it.
     */
    read?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "ready";
        brief: {
            /**
             * False for a character with no lines: there is nothing to design a voice from.
             */
            speaks: boolean;
            /**
             * What the voice is designed from, built from the script.
             */
            description: string;
            /**
             * Lines to audition a voice on, each with its scene.
             */
            auditionLines: readonly {
                line: string;
                scene: string;
            }[];
            /**
             * What the analysis suggests beyond the script, with what each rests on. The narrator's brief has none.
             */
            suggested?: readonly {
                detail: string;
                restsOn: string;
            }[];
            /**
             * What the narrator's brief could not say (`genre`, `premise`). A character's brief has none.
             */
            gaps?: readonly string[];
        };
    };
    /**
     * Shows the description. Off where the host already shows it, as the voice studio's own field.
     */
    description?: boolean;
    /**
     * The first audition line shown, 0-based. 1 where the host already shows the first.
     */
    linesFrom?: number;
}, {}, "">;
type Props = {
    /**
     * Whose brief: a character's name, or "Narrator".
     */
    name?: string;
    /**
     * The brief, as far as the host has read it.
     */
    read?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "ready";
        brief: {
            /**
             * False for a character with no lines: there is nothing to design a voice from.
             */
            speaks: boolean;
            /**
             * What the voice is designed from, built from the script.
             */
            description: string;
            /**
             * Lines to audition a voice on, each with its scene.
             */
            auditionLines: readonly {
                line: string;
                scene: string;
            }[];
            /**
             * What the analysis suggests beyond the script, with what each rests on. The narrator's brief has none.
             */
            suggested?: readonly {
                detail: string;
                restsOn: string;
            }[];
            /**
             * What the narrator's brief could not say (`genre`, `premise`). A character's brief has none.
             */
            gaps?: readonly string[];
        };
    };
    /**
     * Shows the description. Off where the host already shows it, as the voice studio's own field.
     */
    description?: boolean;
    /**
     * The first audition line shown, 0-based. 1 where the host already shows the first.
     */
    linesFrom?: number;
};

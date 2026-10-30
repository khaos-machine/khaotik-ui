export default StatusPill;
type StatusPill = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StatusPill: import("svelte").Component<{
    /**
     * The pill label.
     */
    text?: string;
    /**
     * Maps to `--tone-*`. A value outside the seven renders with no tint rather than falling back.
     */
    tone?: import("./lib/types.js").StatusTone;
    /**
     * Optional leading Phosphor icon name (fill weight).
     */
    icon?: string;
}, {}, "">;
type Props = {
    /**
     * The pill label.
     */
    text?: string;
    /**
     * Maps to `--tone-*`. A value outside the seven renders with no tint rather than falling back.
     */
    tone?: import("./lib/types.js").StatusTone;
    /**
     * Optional leading Phosphor icon name (fill weight).
     */
    icon?: string;
};

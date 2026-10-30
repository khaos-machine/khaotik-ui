export default KhaosLogo;
type KhaosLogo = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const KhaosLogo: import("svelte").Component<{
    /**
     * Width/height in px; tinted with `currentColor`.
     */
    size?: number;
}, {}, "">;
type Props = {
    /**
     * Width/height in px; tinted with `currentColor`.
     */
    size?: number;
};

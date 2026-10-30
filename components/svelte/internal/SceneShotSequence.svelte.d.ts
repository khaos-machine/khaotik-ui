export default SceneShotSequence;
type SceneShotSequence = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const SceneShotSequence: import("svelte").Component<{
    items?: readonly import("../lib/shot-coverage.js").CoverageItem[];
    selectedId?: string;
    activeId?: string;
    onselect?: (id: string) => void;
}, {}, "">;
type $$ComponentProps = {
    items?: readonly import("../lib/shot-coverage.js").CoverageItem[];
    selectedId?: string;
    activeId?: string;
    onselect?: (id: string) => void;
};

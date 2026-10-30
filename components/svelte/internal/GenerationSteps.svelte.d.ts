export default GenerationSteps;
type GenerationSteps = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const GenerationSteps: import("svelte").Component<{
    step?: "direct" | "generate" | "review" | "use";
}, {}, "">;
type $$ComponentProps = {
    step?: "direct" | "generate" | "review" | "use";
};

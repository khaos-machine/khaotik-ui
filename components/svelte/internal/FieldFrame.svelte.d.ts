export default FieldFrame;
type FieldFrame = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const FieldFrame: import("svelte").Component<{
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: any;
}, {}, "">;
type $$ComponentProps = {
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: any;
};

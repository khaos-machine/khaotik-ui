export default AppearancePresetIcon;
type AppearancePresetIcon = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const AppearancePresetIcon: import("svelte").Component<{
    feature: string;
    value: string;
    choices: Record<string, string>;
}, {}, "">;
type $$ComponentProps = {
    feature: string;
    value: string;
    choices: Record<string, string>;
};

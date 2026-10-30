export default AppearanceSelectionHUD;
type AppearanceSelectionHUD = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const AppearanceSelectionHUD: import("svelte").Component<{
    look: {
        features: readonly {
            key: string;
            label: string;
            options: readonly string[];
        }[];
        choices: Record<string, string>;
    };
    dirty?: boolean;
    persisted?: boolean;
    onedit?: (key: string) => void;
}, {}, "">;
type $$ComponentProps = {
    look: {
        features: readonly {
            key: string;
            label: string;
            options: readonly string[];
        }[];
        choices: Record<string, string>;
    };
    dirty?: boolean;
    persisted?: boolean;
    onedit?: (key: string) => void;
};

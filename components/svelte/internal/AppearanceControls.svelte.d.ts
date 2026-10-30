export default AppearanceControls;
type AppearanceControls = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const AppearanceControls: import("svelte").Component<{
    look: {
        features: readonly {
            key: string;
            label: string;
            options: readonly string[];
            randomizable?: boolean;
        }[];
        choices: Record<string, string>;
    } | null;
    locks?: Record<string, boolean>;
    busy?: boolean;
    onchange?: (key?: string, value?: string) => void;
    onlock?: (key: string, value: boolean) => void;
    category?: string;
    hairFeature?: string;
}, {}, "category" | "hairFeature">;
type $$ComponentProps = {
    look: {
        features: readonly {
            key: string;
            label: string;
            options: readonly string[];
            randomizable?: boolean;
        }[];
        choices: Record<string, string>;
    } | null;
    locks?: Record<string, boolean>;
    busy?: boolean;
    onchange?: (key?: string, value?: string) => void;
    onlock?: (key: string, value: boolean) => void;
    category?: string;
    hairFeature?: string;
};

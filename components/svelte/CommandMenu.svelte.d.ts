export default CommandMenu;
type CommandMenu = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const CommandMenu: import("svelte").Component<{
    /**
     * The commands it offers, in order.
     */
    commands?: readonly import("./lib/commands.js").Command[];
    /**
     * Asked with an enabled command's id.
     */
    onrun?: (id: string) => void;
    /**
     * The trigger's accessible name and tooltip.
     */
    label?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The commands it offers, in order.
     */
    commands?: readonly import("./lib/commands.js").Command[];
    /**
     * Asked with an enabled command's id.
     */
    onrun?: (id: string) => void;
    /**
     * The trigger's accessible name and tooltip.
     */
    label?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};

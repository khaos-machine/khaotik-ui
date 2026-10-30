export default CommandPalette;
type CommandPalette = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const CommandPalette: import("svelte").Component<{
    /**
     * Every command the host offers, enabled or not.
     */
    commands?: readonly import("./lib/commands.js").Command[];
    /**
     * Asked with an enabled command's id.
     */
    onrun?: (id: string) => void;
    /**
     * Asked on Esc, and after a command runs.
     */
    onclose?: () => void;
    /**
     * The search field's placeholder.
     */
    placeholder?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * Every command the host offers, enabled or not.
     */
    commands?: readonly import("./lib/commands.js").Command[];
    /**
     * Asked with an enabled command's id.
     */
    onrun?: (id: string) => void;
    /**
     * Asked on Esc, and after a command runs.
     */
    onclose?: () => void;
    /**
     * The search field's placeholder.
     */
    placeholder?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};

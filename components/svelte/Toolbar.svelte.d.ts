export default Toolbar;
type Toolbar = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Toolbar: import("svelte").Component<{
    /**
     * Current document/scene context, right aligned before pane toggles.
     */
    context?: string;
    /**
     * The window's title: the story's name.
     */
    title?: string;
    /**
     * The workspaces, for the switcher. None hides it.
     */
    modes?: {
        value: string;
        label: string;
    }[];
    /**
     * The current workspace.
     */
    mode?: string;
    /**
     * Asked with a workspace.
     */
    onmode?: (mode: string) => void;
    /**
     * The toolbar's command buttons, in order.
     */
    commands?: import("./lib/commands.js").Command[];
    /**
     * Asked with an enabled command's id.
     */
    onrun?: (id: string) => void;
    /**
     * The pane toggles, in order.
     */
    panes?: {
        id: string;
        /**
         * The toggle's accessible name.
         */
        label: string;
        /**
         * Phosphor icon name.
         */
        icon?: string;
        /**
         * Whether the pane is shown now.
         */
        shown: boolean;
    }[];
    /**
     * Asked with a pane's id.
     */
    ontogglepane?: (id: string) => void;
    /**
     * The filter text. `null` hides the field.
     */
    filter?: string | null;
    /**
     * The filter's accessible name: name the list it filters.
     */
    filterLabel?: string;
    /**
     * Called with the new filter text.
     */
    onfilter?: (value: string) => void;
    /**
     * The toolbar's width in px. 0 measures it.
     */
    width?: number;
    /**
     * Below this width the switcher becomes a pop-up button.
     */
    compactBelow?: number;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
    /**
     * More of where you are, right after the switcher: a workspace switch.
     */
    lead?: import("svelte").Snippet;
    /**
     * More of what you can do, after the pane toggles.
     */
    tools?: import("svelte").Snippet;
    /**
     * Status at the trailing edge, before the settings gear: a failure and its Retry.
     */
    status?: import("svelte").Snippet;
    /**
     * Opens settings. Absent, no gear is drawn.
     */
    onsettings?: () => void;
    /**
     * The gear's accessible name and tooltip.
     */
    settingsLabel?: string;
}, {}, "">;
type Props = {
    /**
     * Current document/scene context, right aligned before pane toggles.
     */
    context?: string;
    /**
     * The window's title: the story's name.
     */
    title?: string;
    /**
     * The workspaces, for the switcher. None hides it.
     */
    modes?: {
        value: string;
        label: string;
    }[];
    /**
     * The current workspace.
     */
    mode?: string;
    /**
     * Asked with a workspace.
     */
    onmode?: (mode: string) => void;
    /**
     * The toolbar's command buttons, in order.
     */
    commands?: import("./lib/commands.js").Command[];
    /**
     * Asked with an enabled command's id.
     */
    onrun?: (id: string) => void;
    /**
     * The pane toggles, in order.
     */
    panes?: {
        id: string;
        /**
         * The toggle's accessible name.
         */
        label: string;
        /**
         * Phosphor icon name.
         */
        icon?: string;
        /**
         * Whether the pane is shown now.
         */
        shown: boolean;
    }[];
    /**
     * Asked with a pane's id.
     */
    ontogglepane?: (id: string) => void;
    /**
     * The filter text. `null` hides the field.
     */
    filter?: string | null;
    /**
     * The filter's accessible name: name the list it filters.
     */
    filterLabel?: string;
    /**
     * Called with the new filter text.
     */
    onfilter?: (value: string) => void;
    /**
     * The toolbar's width in px. 0 measures it.
     */
    width?: number;
    /**
     * Below this width the switcher becomes a pop-up button.
     */
    compactBelow?: number;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
    /**
     * More of where you are, right after the switcher: a workspace switch.
     */
    lead?: import("svelte").Snippet;
    /**
     * More of what you can do, after the pane toggles.
     */
    tools?: import("svelte").Snippet;
    /**
     * Status at the trailing edge, before the settings gear: a failure and its Retry.
     */
    status?: import("svelte").Snippet;
    /**
     * Opens settings. Absent, no gear is drawn.
     */
    onsettings?: () => void;
    /**
     * The gear's accessible name and tooltip.
     */
    settingsLabel?: string;
};

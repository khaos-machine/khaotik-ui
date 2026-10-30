export default WorkspaceSwitcher;
type WorkspaceSwitcher = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const WorkspaceSwitcher: import("svelte").Component<{
    /**
     * The workspaces, in order. Their positions are the ⌃⌘ digits.
     */
    modes?: readonly {
        value: string;
        label: string;
    }[];
    /**
     * The current workspace.
     */
    value?: string;
    /**
     * Asked with a workspace's `value`.
     */
    onselect?: (value: string) => void;
    /**
     * The width in px the host gives the switcher. 0 means unmeasured.
     */
    width?: number;
    /**
     * Below this width the switcher is a pop-up button.
     */
    compactBelow?: number;
    /**
     * Bind ⌃⌘1 to ⌃⌘n. Off where the host's menu owns them.
     */
    shortcuts?: boolean;
    /**
     * The control's accessible name.
     */
    label?: string;
    /**
     * The `data-ui-id` (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The workspaces, in order. Their positions are the ⌃⌘ digits.
     */
    modes?: readonly {
        value: string;
        label: string;
    }[];
    /**
     * The current workspace.
     */
    value?: string;
    /**
     * Asked with a workspace's `value`.
     */
    onselect?: (value: string) => void;
    /**
     * The width in px the host gives the switcher. 0 means unmeasured.
     */
    width?: number;
    /**
     * Below this width the switcher is a pop-up button.
     */
    compactBelow?: number;
    /**
     * Bind ⌃⌘1 to ⌃⌘n. Off where the host's menu owns them.
     */
    shortcuts?: boolean;
    /**
     * The control's accessible name.
     */
    label?: string;
    /**
     * The `data-ui-id` (audit §3.14).
     */
    uiId?: string;
};

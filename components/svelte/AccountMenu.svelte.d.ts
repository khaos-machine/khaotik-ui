export default AccountMenu;
type AccountMenu = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const AccountMenu: import("svelte").Component<{
    /**
     * The signed-in person's name, or '' when they have not given one.
     */
    name?: string;
    /**
     * Their email, shown under the name, or alone when there is no name.
     */
    email?: string;
    /**
     * Names the trigger and the panel.
     */
    label?: string;
    /**
     * The panel's links, in order.
     */
    places?: readonly {
        label: string;
        href: string;
        /**
         * A Phosphor glyph name.
         */
        icon?: string;
    }[];
    /**
     * The Sign out button's text.
     */
    signOutLabel?: string;
    /**
     * Called by Sign out, after the panel closes.
     */
    onsignout?: () => void;
}, {}, "">;
type Props = {
    /**
     * The signed-in person's name, or '' when they have not given one.
     */
    name?: string;
    /**
     * Their email, shown under the name, or alone when there is no name.
     */
    email?: string;
    /**
     * Names the trigger and the panel.
     */
    label?: string;
    /**
     * The panel's links, in order.
     */
    places?: readonly {
        label: string;
        href: string;
        /**
         * A Phosphor glyph name.
         */
        icon?: string;
    }[];
    /**
     * The Sign out button's text.
     */
    signOutLabel?: string;
    /**
     * Called by Sign out, after the panel closes.
     */
    onsignout?: () => void;
};

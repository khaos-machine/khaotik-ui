export default IdentitySide;
type IdentitySide = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const IdentitySide: import("svelte").Component<{
    /**
     * Which inspector this is.
     */
    kind?: "location" | "object";
    /**
     * The selected identity. Nothing renders without one.
     */
    item?: {
        /**
         * The engine's id.
         */
        id: string;
        /**
         * Its name.
         */
        name: string;
        /**
         * Where the name came from (`parsed`, …), shown as the row's source.
         */
        origin?: string;
        /**
         * How many scenes it is in.
         */
        scene_count?: number;
        /**
         * A place's page count.
         */
        page_count?: number;
        /**
         * `group` for an object that groups others.
         */
        identityKind?: "group" | string;
    } | null;
    /**
     * The scenes it is only named in, each with its heading.
     */
    named?: readonly {
        id: string;
        label: string;
    }[];
    /**
     * A group's members, by name.
     */
    members?: readonly string[];
    /**
     * The groups it is one of, by name.
     */
    memberOf?: readonly string[];
    /**
     * Whether the engine allows deleting it. Without it no Delete is offered.
     */
    deletable?: boolean;
    /**
     * What the confirmation says deleting it does.
     */
    deleteMessage?: string;
    /**
     * A delete is in flight; Delete is disabled.
     */
    busy?: boolean;
    /**
     * Reports a scene to show.
     */
    onRevealScene?: (sceneId: string) => void;
    /**
     * Reports a confirmed delete.
     */
    onDelete?: () => void;
}, {}, "">;
type Props = {
    /**
     * Which inspector this is.
     */
    kind?: "location" | "object";
    /**
     * The selected identity. Nothing renders without one.
     */
    item?: {
        /**
         * The engine's id.
         */
        id: string;
        /**
         * Its name.
         */
        name: string;
        /**
         * Where the name came from (`parsed`, …), shown as the row's source.
         */
        origin?: string;
        /**
         * How many scenes it is in.
         */
        scene_count?: number;
        /**
         * A place's page count.
         */
        page_count?: number;
        /**
         * `group` for an object that groups others.
         */
        identityKind?: "group" | string;
    } | null;
    /**
     * The scenes it is only named in, each with its heading.
     */
    named?: readonly {
        id: string;
        label: string;
    }[];
    /**
     * A group's members, by name.
     */
    members?: readonly string[];
    /**
     * The groups it is one of, by name.
     */
    memberOf?: readonly string[];
    /**
     * Whether the engine allows deleting it. Without it no Delete is offered.
     */
    deletable?: boolean;
    /**
     * What the confirmation says deleting it does.
     */
    deleteMessage?: string;
    /**
     * A delete is in flight; Delete is disabled.
     */
    busy?: boolean;
    /**
     * Reports a scene to show.
     */
    onRevealScene?: (sceneId: string) => void;
    /**
     * Reports a confirmed delete.
     */
    onDelete?: () => void;
};

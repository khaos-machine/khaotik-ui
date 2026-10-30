export default PlaceStructure;
type PlaceStructure = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PlaceStructure: import("svelte").Component<{
    /**
     * The sizes the engine offers.
     */
    presets?: readonly {
        value: string;
        label: string;
    }[];
    /**
     * The chosen size; '' when none is chosen.
     */
    preset?: string;
    /**
     * Asked to choose a size.
     */
    onpreset?: (value: string) => void;
    /**
     * The kinds of building the engine lays out.
     */
    places?: readonly string[];
    /**
     * The chosen building.
     */
    place?: string;
    /**
     * Asked to choose a building.
     */
    onplace?: (value: string) => void;
    /**
     * Asked to lay out a plan, or another one.
     */
    onlayout?: () => void;
    /**
     * Nothing is laid out yet, so laying out is the primary action.
     */
    first?: boolean;
    /**
     * A plan exists; the action lays out another.
     */
    another?: boolean;
    /**
     * The host can lay out with what is chosen.
     */
    canLayOut?: boolean;
    /**
     * A layout is in progress.
     */
    busy?: boolean;
    /**
     * The place's analysed areas.
     */
    areas?: readonly {
        id: string;
        label: string;
    }[];
    /**
     * The room kinds an area can be.
     */
    kinds?: readonly string[];
    /**
     * Each area's kind by id; absent or '' is none.
     */
    areaKinds?: Record<string, string>;
    /**
     * Asked to set an area's kind; '' clears it.
     */
    onkind?: (areaId: string, kind: string) => void;
    /**
     * What stops or limits the layout, in the host's words.
     */
    problems?: readonly string[];
    /**
     * The plan's review, below the controls.
     */
    children?: import("svelte").Snippet;
}, {}, "">;
type Props = {
    /**
     * The sizes the engine offers.
     */
    presets?: readonly {
        value: string;
        label: string;
    }[];
    /**
     * The chosen size; '' when none is chosen.
     */
    preset?: string;
    /**
     * Asked to choose a size.
     */
    onpreset?: (value: string) => void;
    /**
     * The kinds of building the engine lays out.
     */
    places?: readonly string[];
    /**
     * The chosen building.
     */
    place?: string;
    /**
     * Asked to choose a building.
     */
    onplace?: (value: string) => void;
    /**
     * Asked to lay out a plan, or another one.
     */
    onlayout?: () => void;
    /**
     * Nothing is laid out yet, so laying out is the primary action.
     */
    first?: boolean;
    /**
     * A plan exists; the action lays out another.
     */
    another?: boolean;
    /**
     * The host can lay out with what is chosen.
     */
    canLayOut?: boolean;
    /**
     * A layout is in progress.
     */
    busy?: boolean;
    /**
     * The place's analysed areas.
     */
    areas?: readonly {
        id: string;
        label: string;
    }[];
    /**
     * The room kinds an area can be.
     */
    kinds?: readonly string[];
    /**
     * Each area's kind by id; absent or '' is none.
     */
    areaKinds?: Record<string, string>;
    /**
     * Asked to set an area's kind; '' clears it.
     */
    onkind?: (areaId: string, kind: string) => void;
    /**
     * What stops or limits the layout, in the host's words.
     */
    problems?: readonly string[];
    /**
     * The plan's review, below the controls.
     */
    children?: import("svelte").Snippet;
};

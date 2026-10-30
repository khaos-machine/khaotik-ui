export default PlacePlan;
type PlacePlan = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PlacePlan: import("svelte").Component<{
    /**
     * The place definition: rooms, openings, fixtures and cameras, as khaosd's `GET /api/places/definitions/{id}` returns it.
     */
    definition?: import("./lib/place-plan.js").PlaceDefinition | null;
    /**
     * The selected element's id (a room, opening, fixture or camera), or ''.
     */
    selected?: string;
    /**
     * Reports an element chosen by click or keyboard.
     */
    onselect?: (id: string) => void;
    /**
     * Cameras can be moved: dragging a camera moves its position, dragging the selected camera's target handle moves where it looks, and with a camera focused the arrow keys nudge its position by 0.1 m (with Shift, its target). Reports the plan pose, x and y in metres, as it moves; `done` is true once per drag, on release, and on every nudge. Absent, cameras only select.
     */
    onmovecamera?: (id: string, pose: {
        position: number[];
        target: number[];
    }, done: boolean) => void;
    /**
     * Drawn over the place, in the definition's frame (metres, +y north): how a shot's plan puts its figures, props and camera on it.
     */
    children?: import("svelte").Snippet;
}, {}, "">;
type Props = {
    /**
     * The place definition: rooms, openings, fixtures and cameras, as khaosd's `GET /api/places/definitions/{id}` returns it.
     */
    definition?: import("./lib/place-plan.js").PlaceDefinition | null;
    /**
     * The selected element's id (a room, opening, fixture or camera), or ''.
     */
    selected?: string;
    /**
     * Reports an element chosen by click or keyboard.
     */
    onselect?: (id: string) => void;
    /**
     * Cameras can be moved: dragging a camera moves its position, dragging the selected camera's target handle moves where it looks, and with a camera focused the arrow keys nudge its position by 0.1 m (with Shift, its target). Reports the plan pose, x and y in metres, as it moves; `done` is true once per drag, on release, and on every nudge. Absent, cameras only select.
     */
    onmovecamera?: (id: string, pose: {
        position: number[];
        target: number[];
    }, done: boolean) => void;
    /**
     * Drawn over the place, in the definition's frame (metres, +y north): how a shot's plan puts its figures, props and camera on it.
     */
    children?: import("svelte").Snippet;
};

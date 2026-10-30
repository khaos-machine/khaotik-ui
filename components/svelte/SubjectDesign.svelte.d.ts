export default SubjectDesign;
type SubjectDesign = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SubjectDesign: import("svelte").Component<{
    /**
     * Which designer this is.
     */
    kind?: "location" | "object";
    /**
     * The subject's name, for the image's alternative text.
     */
    name?: string;
    /**
     * Where the design stands.
     */
    design?: import("./lib/types.js").DesignState;
    /**
     * What the designer is doing now, while a job runs; empty otherwise.
     */
    activity?: string;
    /**
     * The designer's last error; empty when there is none.
     */
    error?: string;
    /**
     * Opens the designer; the action is left out without it.
     */
    ondesign?: (() => void) | undefined;
    /**
     * Names which version of the subject the design is for, such as a place state; nothing when empty.
     */
    caption?: string;
}, {}, "">;
type Props = {
    /**
     * Which designer this is.
     */
    kind?: "location" | "object";
    /**
     * The subject's name, for the image's alternative text.
     */
    name?: string;
    /**
     * Where the design stands.
     */
    design?: import("./lib/types.js").DesignState;
    /**
     * What the designer is doing now, while a job runs; empty otherwise.
     */
    activity?: string;
    /**
     * The designer's last error; empty when there is none.
     */
    error?: string;
    /**
     * Opens the designer; the action is left out without it.
     */
    ondesign?: (() => void) | undefined;
    /**
     * Names which version of the subject the design is for, such as a place state; nothing when empty.
     */
    caption?: string;
};

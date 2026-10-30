export default ProjectStatusHUD;
type ProjectStatusHUD = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ProjectStatusHUD: import("svelte").Component<{
    /**
     * The window is in front; a window behind shows no status.
     */
    active?: boolean;
    /**
     * The last action's result.
     */
    result?: import("svelte").ComponentProps<typeof StatusBar>["result"];
    /**
     * Running jobs.
     */
    jobs?: import("svelte").ComponentProps<typeof StatusBar>["jobs"];
}, {}, "">;
type Props = {
    /**
     * The window is in front; a window behind shows no status.
     */
    active?: boolean;
    /**
     * The last action's result.
     */
    result?: import("svelte").ComponentProps<typeof StatusBar>["result"];
    /**
     * Running jobs.
     */
    jobs?: import("svelte").ComponentProps<typeof StatusBar>["jobs"];
};
import StatusBar from './StatusBar.svelte';

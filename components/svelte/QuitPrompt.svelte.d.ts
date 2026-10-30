export default QuitPrompt;
type QuitPrompt = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const QuitPrompt: import("svelte").Component<{
    /**
     * Whether the prompt is asking.
     */
    open?: boolean;
    /**
     * What is still running, as the host words it.
     */
    sentence?: string;
    /**
     * A choice is being carried out; Let It Finish is disabled and a dismissal is ignored.
     */
    busy?: boolean;
    /**
     * Reports Stop and Quit.
     */
    onStopAndQuit?: () => void;
    /**
     * Reports Quit and Let It Finish.
     */
    onLetFinish?: () => void;
    /**
     * Reports Cancel, or a dismissal while not busy.
     */
    onDismiss?: () => void;
}, {}, "">;
type Props = {
    /**
     * Whether the prompt is asking.
     */
    open?: boolean;
    /**
     * What is still running, as the host words it.
     */
    sentence?: string;
    /**
     * A choice is being carried out; Let It Finish is disabled and a dismissal is ignored.
     */
    busy?: boolean;
    /**
     * Reports Stop and Quit.
     */
    onStopAndQuit?: () => void;
    /**
     * Reports Quit and Let It Finish.
     */
    onLetFinish?: () => void;
    /**
     * Reports Cancel, or a dismissal while not busy.
     */
    onDismiss?: () => void;
};

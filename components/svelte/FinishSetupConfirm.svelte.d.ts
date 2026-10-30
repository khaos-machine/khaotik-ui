export default FinishSetupConfirm;
type FinishSetupConfirm = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const FinishSetupConfirm: import("svelte").Component<{
    /**
     * Whether the confirmation is asking.
     */
    open?: boolean;
    /**
     * Whether khaosd says the setup path is Basic, which picks the wording.
     */
    basic?: boolean;
    /**
     * Reports Install. Running it is yours.
     */
    onConfirm?: () => void;
    /**
     * Reports Cancel, or a dismissal. Nothing is sent.
     */
    onCancel?: () => void;
}, {}, "">;
type Props = {
    /**
     * Whether the confirmation is asking.
     */
    open?: boolean;
    /**
     * Whether khaosd says the setup path is Basic, which picks the wording.
     */
    basic?: boolean;
    /**
     * Reports Install. Running it is yours.
     */
    onConfirm?: () => void;
    /**
     * Reports Cancel, or a dismissal. Nothing is sent.
     */
    onCancel?: () => void;
};

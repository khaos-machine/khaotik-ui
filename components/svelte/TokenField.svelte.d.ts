export default TokenField;
type TokenField = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const TokenField: import("svelte").Component<{
    /**
     * The current tokens, as the host holds them.
     */
    tokens?: readonly string[];
    /**
     * What the tokens are ("Aliases"); names the group and the add field.
     */
    label?: string;
    /**
     * The add field's placeholder.
     */
    placeholder?: string;
    /**
     * Asked with a trimmed, new, non-empty token.
     */
    onadd?: (token: string) => void;
    /**
     * Asked with a token to remove.
     */
    onremove?: (token: string) => void;
    /**
     * Tokens only: no add field and no remove.
     */
    readonly?: boolean;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The current tokens, as the host holds them.
     */
    tokens?: readonly string[];
    /**
     * What the tokens are ("Aliases"); names the group and the add field.
     */
    label?: string;
    /**
     * The add field's placeholder.
     */
    placeholder?: string;
    /**
     * Asked with a trimmed, new, non-empty token.
     */
    onadd?: (token: string) => void;
    /**
     * Asked with a token to remove.
     */
    onremove?: (token: string) => void;
    /**
     * Tokens only: no add field and no remove.
     */
    readonly?: boolean;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};

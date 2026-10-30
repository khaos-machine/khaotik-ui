export default EngineDetails;
type EngineDetails = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const EngineDetails: import("svelte").Component<{
    /**
     * The engine's readings: its state, and each installed component (or the three legacy version fields).
     */
    engine?: {
        state?: string;
        components?: readonly {
            name: string;
            version?: string;
            status?: string;
            update?: {
                label?: string;
                icon?: string;
                tone?: string;
                detail?: string;
            };
        }[];
        appVersion?: string;
        daemonVersion?: string;
        wflAvailable?: boolean;
    };
    /**
     * The routed capabilities, each with the label the engine gives it.
     */
    routes?: readonly {
        capability: string;
        label: string;
        provider: string;
        model: string;
        local?: boolean;
        icon?: string;
    }[];
    /**
     * The on-device engines, as khaosd's /api/services reports them. **Omit it and the section is absent**; an empty list renders "No on-device engines".
     */
    services?: readonly {
        name: string;
        label?: string;
        state: string;
        provisioned?: boolean;
        ready_to_use?: boolean;
    }[];
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The engine's readings: its state, and each installed component (or the three legacy version fields).
     */
    engine?: {
        state?: string;
        components?: readonly {
            name: string;
            version?: string;
            status?: string;
            update?: {
                label?: string;
                icon?: string;
                tone?: string;
                detail?: string;
            };
        }[];
        appVersion?: string;
        daemonVersion?: string;
        wflAvailable?: boolean;
    };
    /**
     * The routed capabilities, each with the label the engine gives it.
     */
    routes?: readonly {
        capability: string;
        label: string;
        provider: string;
        model: string;
        local?: boolean;
        icon?: string;
    }[];
    /**
     * The on-device engines, as khaosd's /api/services reports them. **Omit it and the section is absent**; an empty list renders "No on-device engines".
     */
    services?: readonly {
        name: string;
        label?: string;
        state: string;
        provisioned?: boolean;
        ready_to_use?: boolean;
    }[];
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};

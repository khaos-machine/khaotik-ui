export default ServiceStatusList;
type ServiceStatusList = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ServiceStatusList: import("svelte").Component<{
    /**
     * `GET /api/services`, near enough verbatim: `{ id, name, description?, state, port?, provisioned? }`. `name` is rendered unconditionally — the daemon guarantees it is populated, falling back to the id on its own side, so no client needs `if (!name) show id`.
     */
    services?: readonly import("./lib/types.js").Service[];
    /**
     * **Omit it and Start renders disabled** rather than absent. A missing control reads as "the product cannot do this"; a disabled one reads as "not for you right now", and only the second is true while a consumer is read-only (khaos-app ADR-0007).
     */
    onStart?: (service: import("./lib/types.js").Service & {
        tone: import("./lib/types.js").StatusTone;
        needsSetup: boolean;
        usable: boolean;
        pending: boolean;
    }) => void;
    /**
     * Same contract as `onStart`, offered instead of it when a service is running.
     */
    onStop?: (service: import("./lib/types.js").Service & {
        tone: import("./lib/types.js").StatusTone;
        needsSetup: boolean;
        usable: boolean;
        pending: boolean;
    }) => void;
    /**
     * Provisions an engine that is not installed. Same contract as `onStart` — omit it and Setup renders disabled, not absent. It reports **intent**, not completion: setup installs packages onto the operator's machine and the daemon holds the connection for up to five minutes, so the consumer is expected to confirm before it acts, exactly as `ConfirmDialog`'s `onConfirm` does (#49).
     */
    onSetup?: (service: import("./lib/types.js").Service & {
        tone: import("./lib/types.js").StatusTone;
        needsSetup: boolean;
        usable: boolean;
        pending: boolean;
    }) => void;
    /**
     * The per-engine "Start with Khaos" switch, checked from the row's `start_with_khaos` (khaosd's served value). Same contract as `onStart` — omit it and the switch renders disabled, not absent. Reports intent; the host writes the opt-in and re-reads the rows.
     */
    onStartWithKhaos?: (service: import("./lib/types.js").Service & {
        tone: import("./lib/types.js").StatusTone;
        needsSetup: boolean;
        usable: boolean;
        pending: boolean;
    }, on: boolean) => void;
    /**
     * The `id` of the service whose action the consumer has sent and is waiting on. Disables that row's actions and names the verb in flight. **Consumer-driven, never inferred here** — `starting` and `stopping` are the engine's own states, observable whenever anything else drives the daemon, so a component that rendered one because a request had been sent would be asserting something it never observed.
     */
    pendingId?: string;
    /**
     * Shown when nothing is registered.
     */
    emptyLabel?: string;
}, {}, "">;
type Props = {
    /**
     * `GET /api/services`, near enough verbatim: `{ id, name, description?, state, port?, provisioned? }`. `name` is rendered unconditionally — the daemon guarantees it is populated, falling back to the id on its own side, so no client needs `if (!name) show id`.
     */
    services?: readonly import("./lib/types.js").Service[];
    /**
     * **Omit it and Start renders disabled** rather than absent. A missing control reads as "the product cannot do this"; a disabled one reads as "not for you right now", and only the second is true while a consumer is read-only (khaos-app ADR-0007).
     */
    onStart?: (service: import("./lib/types.js").Service & {
        tone: import("./lib/types.js").StatusTone;
        needsSetup: boolean;
        usable: boolean;
        pending: boolean;
    }) => void;
    /**
     * Same contract as `onStart`, offered instead of it when a service is running.
     */
    onStop?: (service: import("./lib/types.js").Service & {
        tone: import("./lib/types.js").StatusTone;
        needsSetup: boolean;
        usable: boolean;
        pending: boolean;
    }) => void;
    /**
     * Provisions an engine that is not installed. Same contract as `onStart` — omit it and Setup renders disabled, not absent. It reports **intent**, not completion: setup installs packages onto the operator's machine and the daemon holds the connection for up to five minutes, so the consumer is expected to confirm before it acts, exactly as `ConfirmDialog`'s `onConfirm` does (#49).
     */
    onSetup?: (service: import("./lib/types.js").Service & {
        tone: import("./lib/types.js").StatusTone;
        needsSetup: boolean;
        usable: boolean;
        pending: boolean;
    }) => void;
    /**
     * The per-engine "Start with Khaos" switch, checked from the row's `start_with_khaos` (khaosd's served value). Same contract as `onStart` — omit it and the switch renders disabled, not absent. Reports intent; the host writes the opt-in and re-reads the rows.
     */
    onStartWithKhaos?: (service: import("./lib/types.js").Service & {
        tone: import("./lib/types.js").StatusTone;
        needsSetup: boolean;
        usable: boolean;
        pending: boolean;
    }, on: boolean) => void;
    /**
     * The `id` of the service whose action the consumer has sent and is waiting on. Disables that row's actions and names the verb in flight. **Consumer-driven, never inferred here** — `starting` and `stopping` are the engine's own states, observable whenever anything else drives the daemon, so a component that rendered one because a request had been sent would be asserting something it never observed.
     */
    pendingId?: string;
    /**
     * Shown when nothing is registered.
     */
    emptyLabel?: string;
};

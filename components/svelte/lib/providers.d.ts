/**
 * khaosd's connection state for a provider: what custody holds joined with the engine's
 * readiness. `running`/`not-running` are a local model server's.
 * @typedef {'connected' | 'configured' | 'needs-update' | 'not-connected' | 'not-required' | 'running' | 'not-running' | 'not-defined' | 'refresh-failed' | 'not-configured' | 'client-not-registered' | 'unknown'} ProviderConnectionState
 */
/**
 * One provider as the Providers pane lists it. `modelCount`: the probe's count, present only
 * while the engine reports it ready. `signIn`: khaosd's plan offers a browser sign-in for it.
 * @typedef {Object} ProviderSetupOption
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {ProviderConnectionState} connection
 * @property {number} [modelCount]
 * @property {string} baseUrl
 * @property {true} [signIn]
 * @property {true} [local]
 * @property {string} setupUrl
 * @property {string} docsUrl
 * @property {string} setupInstructions
 */
/** @param {ProviderConnectionState} connection @returns {string} */
export function providerConnectionLabel(connection: ProviderConnectionState): string;
/** @param {ProviderConnectionState} connection @returns {'success' | 'warning' | 'neutral'} */
export function providerConnectionTone(connection: ProviderConnectionState): "success" | "warning" | "neutral";
/**
 * The Providers row's pill. A running local model server says how many models it holds,
 * and holding none is a warning, because nothing can be routed to it (design D1).
 * @param {ProviderSetupOption} provider @returns {{ text: string, tone: 'success' | 'warning' | 'neutral' }}
 */
export function providerRowStatus(provider: ProviderSetupOption): {
    text: string;
    tone: "success" | "warning" | "neutral";
};
/**
 * khaosd's connection state for a provider: what custody holds joined with the engine's
 * readiness. `running`/`not-running` are a local model server's.
 */
export type ProviderConnectionState = "connected" | "configured" | "needs-update" | "not-connected" | "not-required" | "running" | "not-running" | "not-defined" | "refresh-failed" | "not-configured" | "client-not-registered" | "unknown";
/**
 * One provider as the Providers pane lists it. `modelCount`: the probe's count, present only
 * while the engine reports it ready. `signIn`: khaosd's plan offers a browser sign-in for it.
 */
export type ProviderSetupOption = {
    id: string;
    title: string;
    description: string;
    connection: ProviderConnectionState;
    modelCount?: number;
    baseUrl: string;
    signIn?: true;
    local?: true;
    setupUrl: string;
    docsUrl: string;
    setupInstructions: string;
};

// A provider's connection, in words and a tone, as the Providers pane and Settings show it.
// Moved from Khaos App's src/app/provider-setup.svelte.ts (catalog app-coverage plan, T9).

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
export function providerConnectionLabel(connection) {
  switch (connection) {
    case 'connected':
      return 'Connected'
    case 'configured':
      return 'Configured, not verified'
    case 'needs-update':
      return 'Needs update'
    case 'not-required':
      return 'No sign-in required'
    case 'running':
      return 'Running'
    case 'not-running':
      return 'Not running'
    case 'not-connected':
      return 'Not connected'
    case 'not-defined':
      return 'No account defined — run khaos-tools providers install'
    case 'refresh-failed':
      return 'Token refresh refused'
    case 'not-configured':
      return 'Not configured'
    case 'client-not-registered':
      return 'Sign-in not available'
    case 'unknown':
      return 'Status unavailable'
  }
}

/** @param {ProviderConnectionState} connection @returns {'success' | 'warning' | 'neutral'} */
export function providerConnectionTone(connection) {
  switch (connection) {
    case 'connected':
    case 'not-required':
    case 'running':
      return 'success'
    // Warning, not neutral: the operator can fix it by starting the server (design D1).
    case 'not-running':
    case 'configured':
    case 'needs-update':
    case 'not-defined':
    case 'refresh-failed':
      return 'warning'
    case 'not-connected':
    case 'not-configured':
    case 'client-not-registered':
    case 'unknown':
      return 'neutral'
  }
}

/**
 * The Providers row's pill. A running local model server says how many models it holds,
 * and holding none is a warning, because nothing can be routed to it (design D1).
 * @param {ProviderSetupOption} provider @returns {{ text: string, tone: 'success' | 'warning' | 'neutral' }}
 */
export function providerRowStatus(provider) {
  if (provider.connection === 'running') {
    const count = provider.modelCount ?? 0
    return count > 0
      ? { text: `Running · ${count} model${count === 1 ? '' : 's'}`, tone: 'success' }
      : { text: 'Running · no models', tone: 'warning' }
  }
  // A refused key on an account connected by signing in: the way back is the sign-in.
  if (provider.connection === 'needs-update' && provider.signIn) return { text: 'Sign in again', tone: 'warning' }
  return {
    text: providerConnectionLabel(provider.connection),
    tone: providerConnectionTone(provider.connection),
  }
}

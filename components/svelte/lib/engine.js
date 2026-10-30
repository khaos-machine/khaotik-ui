// The engine readings EngineDetails shows in the desktop WelcomeWindow: one place for the state pill, the component rows and a route's model name.

/**
 * The engine's state pill, by state. `setup` (#260, D89) shares Starting's tone; its wrench and
 * `detail` tell them apart without colour. An unknown state reads Offline.
 */
export const ENGINE_PILLS = {
  ready: { text: 'Ready', tone: 'success', icon: 'lightning' },
  starting: { text: 'Starting', tone: 'warning', icon: '' },
  setup: { text: 'Setup', tone: 'warning', icon: 'wrench', detail: 'Setup needed' },
  offline: { text: 'Offline', tone: 'danger', icon: '' },
}

/**
 * The installed components, one row each: `engine.components` when the host passes them, else
 * the three legacy fields in the same shape.
 *
 * @param {{ components?: readonly any[], appVersion?: string, daemonVersion?: string, wflAvailable?: boolean }} engine
 */
export function engineComponents(engine) {
  if (Array.isArray(engine.components) && engine.components.length) return engine.components
  return [
    engine.appVersion ? { name: 'App', version: engine.appVersion } : null,
    engine.daemonVersion ? { name: 'Daemon', version: engine.daemonVersion } : null,
    { name: 'WFL', status: engine.wflAvailable ? 'ready' : '—' },
  ].filter(Boolean)
}

/**
 * The engine's state: the host's, else ready when a daemon version is known (learning one takes
 * a successful handshake). `||`, not `??`: khaosd sends `state: ""`, which means none.
 *
 * @param {{ state?: string, daemonVersion?: string, components?: readonly any[] }} engine
 */
export function engineState(engine) {
  const daemon = engine.daemonVersion || engineComponents(engine).find((c) => c.name === 'Daemon')?.version
  return engine.state || (daemon ? 'ready' : 'offline')
}

/** An exact release version, as opposed to a development build or a status-only row. @param {unknown} version */
export const hasExactReleaseVersion = (version) => typeof version === 'string' && /^v?\d+\.\d+\.\d+$/.test(version)

/** A route's model by its own name, without the vendor prefix. @param {{ model: string }} route */
export const modelName = (route) => (route.model.includes('/') ? route.model.slice(route.model.lastIndexOf('/') + 1) : route.model)

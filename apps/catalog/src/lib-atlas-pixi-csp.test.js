// Moved from Khaos App's src/ui/atlas/pixi-csp.test.js (catalog app-coverage plan, T7), assertions unchanged.
import { expect, it, vi } from 'vitest'
import { AbstractRenderer, GlUniformGroupSystem, UniformGroup } from 'pixi.js'
import '@khaos-machine/khaotik-ui/components/svelte/lib/atlas/pixi-atlas.js'

it('initializes Atlas shader uniforms when the shipped CSP blocks dynamic code', () => {
  const blockedFunction = new Proxy(Function, {
    construct() {
      throw new EvalError('Dynamic code generation blocked by CSP')
    },
    apply() {
      throw new EvalError('Dynamic code generation blocked by CSP')
    },
  })
  vi.stubGlobal('Function', blockedFunction)
  let uploaded
  try {
    // Positive control: the capability Pixi normally relies on really is unavailable.
    expect(() => new Function('return true')).toThrow(EvalError)
    AbstractRenderer.prototype._unsafeEvalCheck()
    const uniforms = new UniformGroup({ uAlpha: { value: 0.5, type: 'f32' } })
    const system = new GlUniformGroupSystem(null)
    const sync = system._generateUniformsSync(uniforms, {
      uAlpha: { type: 'float', size: 1, isArray: false },
    })
    const data = { uAlpha: { location: null, value: 0 } }
    sync(
      data,
      uniforms.uniforms,
      { gl: { uniform1f: (_location, value) => { uploaded = value } } },
      { textureCount: 0 },
    )
  } finally {
    vi.unstubAllGlobals()
  }
  expect(uploaded).toBe(0.5)
})

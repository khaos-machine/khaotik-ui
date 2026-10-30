import { mount } from 'svelte'
import '@khaos-machine/khaotik-ui/tokens/tokens.css'
import '@khaos-machine/khaotik-ui/tokens/tokens-extra.css'
import '@khaos-machine/khaotik-ui/tokens/utilities.css'
// The layout a composed document describes. Shipped as a sheet rather than as
// scoped styles because TWO renderers emit these classes — the library's
// `Composed.svelte` for a consuming app, and the editor here — and scoped styles
// would give each its own copy of what `gap` means. Same arrangement, and the
// same reason, as utilities.css above.
import '@khaos-machine/khaotik-ui/components/svelte/lib/compose.css'
import './app.css'
// The BrandKit's shared rules. Global because a rule shared BETWEEN Svelte
// components cannot live inside any one of their scoped <style> blocks.
import './lib/brand.css'
import './lib/controls.css'
// Phosphor — the org's icon set (khaos-ui uses @phosphor-icons/vue; the web
// webfont is the framework-agnostic equivalent). regular + fill cover the
// SF Symbol → Phosphor map the components need.
import '@phosphor-icons/web/regular'
import '@phosphor-icons/web/fill'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app

import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const PUBLISHED = path.join(REPO, 'components/composed')

/**
 * Publishing a composed document to the repo.
 *
 * WHY A DEV-SERVER PLUGIN. Publishing writes a file, and a browser cannot. The
 * two alternatives were worse: Tauri's filesystem plugin would make the whole
 * feature vanish from the static web build at khaotik-catalog.loswf.com and
 * would need a capability widened from `core:default`, and a download hands
 * someone a file they then have to move into the repo themselves.
 *
 * `apply: 'serve'` — it exists under `npm run dev`, which is where authoring
 * happens, and nowhere else. In the built app the publish control says so and
 * offers the JSON to copy instead. Publishing to a git repo from a CDN is not a
 * thing that was going to work anyway.
 *
 * THE SLUG IS VALIDATED AS A NAME, NOT SANITISED AS A PATH. Kebab-case only, no
 * dots and no separators, so there is no traversal to defend against rather than
 * a traversal that is defended against — the file is always
 * `components/composed/<slug>.json`.
 */
function publishComposed() {
  return {
    name: 'khaotik:publish-composed',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__publish', (req, res) => {
        const reply = (code, body) => {
          res.statusCode = code
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(body))
        }
        if (req.method !== 'POST') return reply(405, { error: 'POST a document to publish it.' })

        let raw = ''
        req.on('data', (chunk) => { raw += chunk })
        req.on('end', async () => {
          let doc
          try {
            doc = JSON.parse(raw)
          } catch {
            return reply(400, { error: 'That was not JSON.' })
          }
          if (!/^[a-z][a-z0-9-]*$/.test(doc?.slug ?? '')) {
            return reply(400, { error: `\`${doc?.slug}\` is not a slug. Kebab-case, starting with a letter.` })
          }
          const file = path.join(PUBLISHED, `${doc.slug}.json`)
          try {
            await mkdir(PUBLISHED, { recursive: true })
            await writeFile(file, `${JSON.stringify(doc, null, 2)}\n`)
          } catch (error) {
            return reply(500, { error: error.message })
          }
          reply(200, { path: path.relative(REPO, file) })
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), publishComposed()],
  // A .glb is an asset Vite does not know by default. Declared, `model.glb?inline` gives the
  // catalog the conformance model's bytes to pass PlaceViewer, which parses and never fetches.
  assetsInclude: ['**/*.glb'],
  resolve: {
    conditions: ['browser'],
  },
  // The Tauri shell loads devUrl, http://localhost:5173 (src-tauri/tauri.conf.json). With
  // 5173 taken, Vite would move to 5174 and the window would load whatever holds 5173, with
  // no error; another app's dev server was shown as the catalog that way. Fail instead.
  server: { port: 5173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/vitest-setup.js'],
    // Vitest stubs every .css import — even with a ?raw query — as an empty
    // module by default. Processing CSS makes `tokens.css?raw` (tokens/parse.js)
    // return its actual text under test, matching the Vite app.
    css: true,
    // Headroom, not a fix. The suite passes at vitest's 5s default on an idle
    // machine (measured, 285/285) — but App.test.js renders the whole shell 32
    // times and its nav sweep walks every section, so it is the longest test
    // here and the one with the least margin. Under load it exceeded 5s and
    // went red; the run that surfaced it had competing vitest processes.
    //
    // The margin matters more than it did: catalog-release.yml now gates
    // signing on this suite, and `loswf-mini` is a shared runner. A timeout
    // flake there blocks a release for a reason that is not a defect, and
    // teaches whoever hits it to re-run rather than to read. A test that
    // genuinely hangs still fails — five seconds later.
    testTimeout: 10000,
  },
})

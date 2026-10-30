import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { icons, callerSupplied, weights, harvest, index } from './icon-inventory.js'

const LIB = join(import.meta.dirname, '../../..', 'components/svelte')

// The icon sheet reads the components rather than transcribing them, for the
// reason tokens/parse.js exists: a second copy of a fact goes stale silently.
// But a harvester can be confidently wrong in a way a list cannot, and this one
// was — it took EVERY quoted string out of a ternary, so `tone === 'error'` put
// an `error` glyph on the sheet and `kind === 'location'` put a `location` one.
// Three phantoms rendered as empty cells. Nothing failed; the sheet just lied.
describe('the icon inventory harvests what the kit actually renders', () => {
  it('finds the set, and nothing that is not an icon', () => {
    expect(icons.length).toBeGreaterThan(20)

    const names = icons.map((i) => i.name)
    // Comparison operands, not glyphs. These were on the sheet.
    for (const phantom of ['error', 'location', 'scene', 'person', 'regular', 'fill']) {
      expect(names, `"${phantom}" is a value being tested, not an icon`).not.toContain(phantom)
    }
  })

  it('resolves both branches of a ternary, not just the literal attributes', () => {
    const names = icons.map((i) => i.name)
    // a builder: {playing ? 'stop' : 'play'} / {playing ? 'pause' : 'play'}
    expect(names).toEqual(expect.arrayContaining(['play', 'pause', 'stop']))
    // OutcomeBanner and Portrait resolve theirs in the script block instead.
    expect(names).toEqual(expect.arrayContaining(['warning-circle', 'check-circle']))
    expect(names).toEqual(expect.arrayContaining(['film-slate', 'map-pin', 'user']))
  })

  // The guarantee the sheet makes in its own lede: a name cannot appear without
  // a component using it. Checked against the sources rather than against the
  // harvester's own bookkeeping, or it would only be testing itself.
  it('attributes every icon to a component whose source contains it', () => {
    const sources = Object.fromEntries(
      readdirSync(LIB)
        .filter((f) => f.endsWith('.svelte'))
        .map((f) => [f.replace('.svelte', ''), readFileSync(join(LIB, f), 'utf8')]),
    )

    for (const { name, usedBy } of icons) {
      expect(usedBy.length, `${name} is attributed to nothing`).toBeGreaterThan(0)
      for (const component of usedBy) {
        expect(sources[component], `${component} is not a library component`).toBeDefined()
        expect(
          sources[component].includes(`'${name}'`) || sources[component].includes(`"${name}"`),
          `${component} is credited with ${name} but does not contain it`,
        ).toBe(true)
      }
    }
  })

  // Stated on the sheet, so it has to be right: these take the name from the
  // caller and their glyphs are not the kit's to list. StatusPill declares
  // `icon = ''` last in its destructure and was missed while the detection
  // required a trailing comma.
  it('names the components that take the icon as a prop', () => {
    // `toEqual`, not `arrayContaining`. Under `arrayContaining` a component
    // that stopped being detected still passed, and two were in fact missing:
    // MetaStrip and Settings both take the glyph inside a collection prop, so
    // neither has a destructured `icon` for the old filter to find. An
    // exact list reds in both directions — a new caller-supplied component
    // that goes undetected, and one that drifts into the band wrongly.
    expect(callerSupplied).toEqual([
      // Button joined with #237: `icon` is the host's leading Phosphor glyph.
      'Button',
      'EmptyState',
      // EngineDetails took Launcher's place with its retirement (K-final): a route's `icon` is
      // the host's Phosphor name for a provider's mark, falling back to a placeholder. It
      // arrives inside the `routes` collection prop, so the kit cannot list what a consumer
      // will pass.
      'EngineDetails',
      // InstallList joined with D77: `InstallItem.icon` is the host's Phosphor name
      // for a row's icon, inside a collection prop, falling back to the name's letter.
      'InstallList',
      'MetaStrip',
      'MetricCard',
      'SelectableRow',
      'Settings',
      // SettingsWindow passes the host's pane glyphs through to Settings, in `panes`.
      'SettingsWindow',
      // SourceList joined with the data-layer plan's K2: `SourceItem.icon` is the host's
      // Phosphor name for a destination, inside the `sections` collection prop.
      'SourceList',
      'StatusPill',
      // StoryOverviewStrip joined with khaos-app#617: `next.icon` is the host's Phosphor name
      // for the next step's button.
      'StoryOverviewStrip',
      // Toolbar joined with the data-layer plan's K4: `Command.icon` and `ToolbarPane.icon`
      // are host Phosphor names inside the `commands` and `panes` collection props.
      'Toolbar',
    ])
  })

  // The second band exists because four components take the icon as a PROP, so
  // everything entering through that seam is invisible to the library's own
  // scan. The parser is exported for a consumer to run over itself — the kit
  // cannot glob its consumers, and could only ever see the one it shipped with.
  it('reads the two shapes a surface hands an icon in, which the kit never uses', () => {
    // a fixture prop, and a lookup keyed by something else (the rail's rail)
    const found = harvest(`
      const SECTION_ICONS = { brandkit: 'palette', screens: 'browsers' }
      export const rows = [{ id: 'engine', icon: 'cpu' }]
    `)
    expect([...found].sort()).toEqual(['browsers', 'cpu', 'palette'])
  })

  it('does not let those shapes move the kit\'s own band', () => {
    // The library declares `icon = ''` and takes the name from the caller; it
    // has no `icon: 'x'` and no *_ICONS map. If that changes, the count moves
    // and this is the test that says so.
    expect(icons.map((i) => i.name)).not.toContain('cpu')
    expect(icons.map((i) => i.name)).not.toContain('palette')
  })

  it('indexes a set of sources by name, attributing each to its file', () => {
    const built = index({
      '/a/Alpha.svelte': `<Icon name="check" />`,
      '/b/Beta.js': `const X = [{ icon: 'check' }, { icon: 'clock' }]`,
    })
    expect(built.map((i) => i.name)).toEqual(['check', 'clock'])
    expect(built.find((i) => i.name === 'check').usedBy).toEqual(['Alpha', 'Beta'])
  })

  it('offers the weights Icon actually accepts', () => {
    const iconSource = readFileSync(join(LIB, 'Icon.svelte'), 'utf8')
    for (const weight of weights) {
      expect(iconSource).toContain(weight)
    }
  })
})

// DIRECTION B, which nothing tested. The module's lede promises both halves —
// "a glyph cannot appear here without a component rendering it, and cannot be
// rendered without appearing here" — but every assertion above tests the first.
//
// The second was false. `ICON_MAP` required a prefix before `ICONS`, so
// ResourceCatalog's bare `const ICONS = {…}` was skipped and five glyphs the
// kit genuinely renders were missing from the sheet; `ICON_PROP` wanted a bare
// literal, so the `?? 'file'` fallback — what every unrecognised kind actually
// renders — was missing too. Six in total, all real Phosphor names, all
// rendered in production, none on the sheet that claimed to be complete.
describe('nothing the kit renders is missing from the sheet', () => {
  const named = new Set(icons.map((i) => i.name))

  it.each([
    ['ResourceCatalog', 'film-slate'],
    ['ResourceCatalog', 'user'],
    ['ResourceCatalog', 'map-pin'],
    ['ResourceCatalog', 'graph'],
    ['ResourceCatalog', 'chart-bar'],
    ['ResourceCatalog', 'circles-three'],
    ['ResourceCatalog', 'file-text'],
    ['ResourceCatalog', 'ruler'],
    ['ResourceCatalog', 'flask'],
    ['ResourceCatalog', 'file'],
    ['ResourceCatalog', 'archive'],
  ])('%s renders %s, so the sheet carries it', (_component, glyph) => {
    expect(named.has(glyph)).toBe(true)
  })

  it('harvests a bare `const ICONS` map, not only a prefixed one', () => {
    const bare = harvest("const ICONS = { a: 'chat-text', b: 'gear' }")
    expect([...bare]).toEqual(expect.arrayContaining(['chat-text', 'gear']))
  })

  it('harvests an icon prop whose value is an expression, not a literal', () => {
    const fallback = harvest("icon: ICONS[kind] ?? 'file',")
    expect([...fallback]).toContain('file')
  })
})

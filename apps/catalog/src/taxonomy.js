// The catalog's navigation taxonomy: sections, groups, their labels and order.
//
// A plain module with no imports, so the taxonomy gate (scripts/check-taxonomy.mjs)
// imports it rather than reading fixtures.js as text. fixtures.js imports .svelte,
// which Node cannot load, and a regex over source can only see literal lists — a
// computed list such as APP_GROUPS was invisible to it. fixtures.js re-exports
// everything here, so nothing that imports the registry changes.

// ---- navigation structure ---------------------------------------------------
//
// ONE level. The rail picks a SECTION; inside a section the fixtures are
// bucketed into GROUPS.
//
// There was a WORKSPACE level above this — System / Screens / Flows /
// Playground, as a segmented bar in the banner. It is gone. Of its four
// entries one held everything and three held almost nothing, so its whole job
// was choosing between a populated branch and three sparse ones; and its
// members sat at a different depth from the sections while being the same kind
// of thing to a reader looking for a component. Screens and Flows are now
// peers of the System sections, which is what they always were in use.
//
// Playground went with it, and was deleted rather than hidden — a shelf you
// cannot see is indistinguishable from one that does not exist, so leaving it
// declared-but-unrendered would have been the worse half of both options.
//
// Placement is carried per fixture as `section` — never derived from `group`.
// A group→section map cannot express "this group is ours-generic but this one
// member is not", and that is not hypothetical: KhaosLogo is brand content that
// sat in `atoms`. Judging by the group is the D46 error (judge per item, per
// row), and it is why this is a field.

export const SECTION_ORDER = ['brandkit', 'foundation', 'components', 'screens', 'flows']

// There used to be a second export here — `COMPOSE_HIDES` / `sectionsFor` —
// that excluded BrandKit from the rail while composing, because most of its
// screens (Color, Type, Shape, Layout, Tokens) are catalog-local documentation
// with nothing to insert. That excluded the wrong thing: the SECTION, when the
// actual distinction is per ROW — KhaosLogo is a real export sitting right
// beside them. The rail and this section list render identically in every
// mode now; whether a given row's insert control does anything is a fact about
// that row (does it correspond to a real export or document), computed once in
// App.svelte, the same in every mode. See SidebarNav.svelte's `insert` snippet.

export const SECTION_LABELS = {
  brandkit: 'BrandKit',
  foundation: 'Foundation',
  components: 'Components',
  screens: 'Screens',
  flows: 'Flows',
}

// Khaos App's windows and panes, as Screens-section groups (catalog app-coverage
// plan, choice 4).
export const APP_GROUP_LABELS = {
  launcherWindow: 'Launcher window',
  splashWindow: 'Splash',
  setupWindow: 'Setup window',
  settingsWindow: 'Settings window',
  projectSettingsWindow: 'Project Settings window',
  voicesWindow: 'Voice Manager',
  resourcesWindow: 'Resource Library',
  activityWindow: 'Analysis Activity',
  problemReportWindow: 'Report a Problem',
  projectWindow: 'Project window (legacy)',
  dataLayer: 'Data layer · Window',
  storyAtlas: 'Story · Atlas',
  storyPlayer: 'Story · Player',
  storyScreenplay: 'Story · Screenplay',
  characters: 'Story · Characters',
  scenes: 'Story · Scenes',
  places: 'Story · Places',
  objects: 'Story · Objects',
  images: 'Story · Images',
  audio: 'Story · Audio',
  review: 'Review',
}
// The groups that stand for something Khaos App renders: every app group, now that each
// screen the app stopped rendering has retired (catalog app-coverage plan, K-final).
export const APP_GROUPS_IN_APP = Object.keys(APP_GROUP_LABELS)
const APP_GROUPS = [...Object.keys(APP_GROUP_LABELS), 'drafts']

// The rail is the four-layer model the product is built on, minus the layer
// that is not a place:
//
//   BrandKit    layer 1 — the theming: colour, type, iconography, the mark.
//   Foundation  layer 2 — the commoditised UI. A button is a button. We do not
//                         build these; we adopt them and apply the brand kit.
//   Components  layer 3 — the organisms, and the ONLY layer where this product
//   Screens     layer 3   differentiates. A card is different here than in a
//   Flows       layer 3   fitness app because the information is different.
//
// Layer 4 is the compilation step (one source of truth out to macOS, web, iOS).
// It is a function, not a destination, so it is not railed.
//
// WHAT THIS FIXED: Foundation had become the default shelf — 18 of 46 exports,
// more than Components and Screens combined — because "looks generic" was being
// used as the test. That is not the test. Layer 2 is what we DID NOT BUILD:
// today, four Ark UI wrappers (`adopted`) and one Phosphor wrapper (`icons`).
// Everything else on that shelf was hand-authored, which makes it layer 3 by
// definition, however primitive it looks. StatusPill, SectionHeader, MetricCard
// and EmptyState are ours; that is what puts them in Components.
//
// USING a primitive is not the same as BEING one. Layer 2 means the component
// IS the adopted thing dressed in our tokens, so the test is what carries the
// behaviour — not whether an Ark import appears in the file. Three worked cases:
//
//   VoiceStudio       imports Ark Tabs, is a Screen. The tabs are one control
//                     inside a surface that is overwhelmingly ours.
//   Portrait          imports Ark Avatar for its load-status machine, stays a
//                     Component. Avatar has no notion of a four-level artwork
//                     precedence, a shipped silhouette set, or an identity hue.
//   EditableField     IS Ark's Editable, dressed, plus a Copy button — so it
//                     moved from Components onto the `adopted` shelf. The
//                     closest call of the three, and why this note exists.
//
// Components subdivides in two halves, ordered simple-to-composed. The first
// four groups are the building blocks — what the thing DOES:
//
//   labels    name or annotate a value          StatusPill, SectionHeader
//   fields    take input                        FilterField, EditableField
//   media     imagery                           Portrait, Gallery
//   feedback  what a surface says INSTEAD of    EmptyState, OutcomeBanner
//             content, or after an action
//
// The last five are the composed surfaces — what SHAPE the thing is:
//
//   cards · rows · lists · charts · inspectors
//
// Two of these came out of `elements` rather than being invented: `rows` was
// hiding inside `lists` (SelectableRow was the base the four lists shared, and
// SceneRow wrapped it — a row and a collection are different call sites), and
// MetricCard was a card all along.
//
// The four building-block groups are small — two to five each — and that is the
// point. `elements` was fifteen things that shared only their provenance, which
// is a fact about where they came from, not a way to find one.
//
// A section holding one group renders no group heading — it would only repeat
// the rail entry beside it, and two identically-named controls with different
// effects is an accessibility defect.
//
// `flows` is declared with no groups: it is a real destination with nothing in
// it yet, and it renders explicit empty copy rather than an empty pane.
export const SECTION_GROUPS = {
  brandkit: ['brand', 'assets'],
  // One group, so no heading renders — and none is wanted. The section IS the
  // adopted tier, and this product's foundations are Ark UI throughout, so
  // "Adopted (Ark UI)" would classify a set with nothing to distinguish it from.
  foundation: ['adopted'],
  // `drafts` is where a newly composed component lands before it has been filed.
  // NOT a shelf for everything authored here — a variant nests under the thing it
  // is a variant of, and a draft that has been given a group sits in that group
  // beside its peers. Comparing a card against the other cards is what the
  // catalog is for, and a permanent Drafts room would put it somewhere else.
  components: ['labels', 'fields', 'media', 'feedback', 'cards', 'rows', 'lists', 'charts', 'inspectors', 'composition', 'shell', 'drafts'],
  // Khaos App's own structure, in the order a user meets it: the windows, then
  // the data-layer window, its Story presentations and destinations, and Review.
  // Each label carries the path because the registry is one level by design.
  // `drafts` is where a composed screen waits before it is filed.
  screens: APP_GROUPS,
  // Filled when FlowStrip got a caller. Leaving it `[]` also WORKS —
  // SidebarNav.groupsIn appends any group a fixture claims that the section did
  // not declare — but that fallback exists to make a misfiling visible, and
  // relying on it would make the normal state look like a defect.
  flows: ['flows'],
}

// Empty-section copy. Stated, not hidden — same reason as `adopted`.
export const SECTION_EMPTY = {
  flows: 'No flows yet. A flow is a sequence of screens — switch to Compose to build one.',
}

// Sidebar grouping: display label + canonical order for the fixture registry.
// `adopted` is the Ark UI shelf D50 calls for (`docs/decisions.md:131`). It was
// declared empty and has since filled — Menu, SegmentedControl, Toggle and
// ConfirmDialog — so its GROUP_EMPTY copy no longer renders; it stays for the
// same reason the shelf did, as the honest state when nothing is on it.
export const GROUP_LABELS = { brand: 'Brand', assets: 'Brand assets', adopted: 'Adopted (Ark UI)', labels: 'Labels', fields: 'Fields', media: 'Media', feedback: 'Feedback', cards: 'Cards', rows: 'Rows', lists: 'Lists', charts: 'Charts', inspectors: 'Inspectors', composition: 'Composition', shell: 'Desktop shell', drafts: 'Drafts', ...APP_GROUP_LABELS, flows: 'Flows' }
export const GROUP_ORDER = ['brand', 'assets', 'adopted', 'labels', 'fields', 'media', 'feedback', 'cards', 'rows', 'lists', 'charts', 'inspectors', 'composition', 'shell', 'drafts', ...Object.keys(APP_GROUP_LABELS), 'flows']

/**
 * Which sections you can add to, and what the addition is called.
 *
 * ONE MAPPING, read by two surfaces: the sidebar's title row while browsing, and
 * the app bar while composing. It moved here rather than staying local to
 * Sidebar.svelte the moment a second surface needed it — a taxonomy fact copied
 * into two components is the drift `tokens/parse.js` exists to prevent, one
 * scale smaller.
 */
export const CREATABLE_IN = {
  components: { kind: 'component', label: 'New component' },
  screens: { kind: 'screen', label: 'New screen' },
  flows: { kind: 'flow', label: 'New flow' },
}
export const GROUP_EMPTY = { adopted: 'Nothing adopted yet — the Foundation tier is Ark UI (D50).' }

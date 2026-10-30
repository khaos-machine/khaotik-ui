# Khaos Machine token requirements → Khaotik (BrandKit)

**Date:** 2026-08-13
**For:** Andrew (BrandKit direction)
**Source:** `khaos.machine.x` → `code/Apps/KM/KM/DesignSystem.swift` (the
current SwiftUI app, "Quiet Pro" design system). Supersedes the earlier
khaos-gui token harvest (khaos-gui is deprecated).

The current design system consumes tokens the BrandKit does not yet define. This
is the routing document: what maps cleanly, and what needs Andrew's definition
before the catalog can render these fixtures faithfully.

## Direct maps (no action needed)

| Khaos Machine token | Value | BrandKit |
|---|---|---|
| `DS.Space.xs/s/m/l/xl/xxl/huge` | 4/8/12/16/24/32/48 | `--spacing-2xs/xs/sm/md/lg/xl/2xl` (identical scale) |
| `DS.Radius.card` | 16 | `--radius-md` (16) |
| `DS.Radius.pill` | 999 | `--radius-full` |
| `DS.Motion.snappy` | 0.22s | `--motion-fast` |
| `StatusTone.success` | green | `--status-normal-fg` |
| `StatusTone.warning` | orange | `--status-warning-fg` |
| `StatusTone.danger` | red | `--status-alarm-fg` |

## Palette direction (2026-08-14)

The Quiet-Pro app has **moved off the indigo/eggplant surface palette**. The
BrandKit's semantic surfaces (`--surface-base/raised`, `--text-*`) map onto the
indigo family, which reads purple. The current direction is:

- **Dark mode** — a warm **pro-gray** near-black base (the Swift "Quiet Pro"
  material), not indigo. Example: base `#161618`, raised `#1f1f22`.
- **Light mode** — a **silver** base (light neutral gray), not the cool
  `grey-50`. Example: base `#e9e9ec`, raised `#f5f5f7`.
- **Accent discipline** — `DS.accent` (`#ffcc00` gold) stays the brand accent,
  but is reserved for the logo and **primary actions only**. It must **not** be
  used for selected/hover/navigation states — that overuse collides with the
  warning orange. Selected/hover are neutral gray, and the sidebar's active
  state uses a thin gold left-bar, not a full gold fill.

This supersedes the earlier "indigo is the Khaos Studio brand" assumption in
**BrandKit `DECISIONS.md` D-004** — Andrew's register in
`khaos-studio/khaotik-3`, not this repo's `docs/decisions.md`, which numbers its
rows `D1`…`D57` without a hyphen — for the **app surface palette** (the
indigo/gold primitives
stay for the brand mark; they no longer tint the surfaces/text). The warm-gray
palette now lives in the BrandKit's `tokens.json` as the `warm` family; the
catalog consumes it directly.

## Gaps — need Andrew's definition

1. **`StatusTone` is seven-way, the BrandKit is four-way.** The current design
   system has `success / warning / danger / info / neutral / accent / skipped`,
   each a foreground + `0.15` background + `0.25` border triple. The BrandKit
   ships `status-normal / warning / alarm / offline`. Missing: **`info`**
   (blue), **`accent`** (amber = the accent), **`skipped`** (a calm slate-blue
   `#7d879e`, "known, intentionally passed over"), and a `neutral`↔`normal`
   naming decision.

2. **Two radius tiers have no BrandKit token.** `DS.Radius.inner = 12` and
   `DS.Radius.tile = 10` sit between `--radius-sm` (8) and `--radius-md` (16).
   The `Surface` component's double-bezel is `inner` (12) inside `card` (16).

3. **`DS.accentMuted`** — a solid muted amber `rgb(0.52, 0.42, 0.0)` used for
   list-selection tint. No BrandKit equivalent; it is the *solid* companion to
   the accent (a `.opacity()` on the accent crashes SwiftUI's selection
   materials, so it is defined as its own colour).

4. **`DS.shadow` elevation** — `black @ 0.18`, radius 12, offset y 6 (the
   `Surface` card). The BrandKit has no explicit elevation/shadow token family;
   a `shadow` or `elevation` primitive would carry this.

5. **No type step below `--caption-size` (11px).** The relationship graph's
   edge label must read as subordinate to the node name it sits under, and
   caption is the smallest scale the kit declares — so
   `RelationshipGraph.svelte` holds a literal `10px` rather than flatten the
   two labels to one size. Every other type size in the library resolves to a
   token; this is the one that cannot. A `label-xs` (or equivalent) step would
   close it. Recorded 2026-08-15.

6. **`DS.Motion.spring`** — a spring curve (`response 0.34, dampingFraction
   0.86`), not expressible as a CSS `cubic-bezier`. The `motion` root has no
   spring representation; the format's `motion` token needs a spring form if
   the catalog is to honour this motion language.

7. **D57's two numeral tokens were decided and never landed.** `docs/decisions.md`
   D57 (2026-08-14) rules that numerals enter stage 1 as *two* tokens — figures
   for tabular data (columns, readouts, timers, which must not jitter) and
   figures for prose (running text and headings, proportional). Nothing in
   `tokens/tokens.json` matches `numer|figure|tabular`, so neither exists.
   Meanwhile the kit holds **twenty** `font-variant-numeric: tabular-nums`
   literals, and `MetaStrip`'s `numeric` item adds a twenty-first with D57 named
   at the call site (`components/svelte/MetaStrip.svelte`, the numeric rule's
   comment). A `--numeral-tabular` / `--numeral-proportional` pair — or whatever
   shape Andrew wants — would let those become token references. Reported, not
   minted: D63 declines to invent a token name the decision did not give.
   Recorded 2026-08-22.

8. **The type ladder owes a third text step — mode-aware, clearing AA at 11px,
   quieter than `--text-secondary`.** Tracked as **#75**; the decision is D64.
   `--text-tertiary` is `var(--warm-400)` in *both* theme blocks
   (`tokens/tokens.css:169`, `:232`) — **one value against four grounds** —
   while every other member of the semantic text tier flips with the mode. At
   11px, where the bar is 4.5:1, it measures 3.29 (dark raised) / 3.61 (dark
   base) / 4.56 (light raised) / 4.09 (light base), failing three of four, so
   #66 moved 65 rules in 29 components to `--text-secondary` (6.86 / 7.53 /
   8.29 / 7.44). **That compresses the hierarchy from three steps to two across
   most of the library at once**, and the third step is owed back.

   The envelope is **reported, not minted — the value is Andrew's**:

   - **mode-aware: two values, not a better single one.** A single value
     reproduces the exact bug, because the defect is a primitive wearing a
     semantic name rather than a grey that happened to be too light.
   - clears **4.5:1 at 11px** on **both** `--surface-base` and
     `--surface-raised` in its own theme.
   - **visibly quieter** than `--text-secondary`.
   - measured windows: **dark `L ∈ [0.2371, 0.3875)`** (wide);
     **light `L ∈ (0.0652, 0.1406]`** (thin). `--warm-400` misses the light bar
     by **≈0.019 of luminance**, which is how it survived review.
   - **it must be decided against the derivations that read from it.** A
     mode-aware step composes twice inside a `color-mix` against a mode-aware
     ground, so every derived token taking the old mono-value as input moves in
     *both* themes. Today that is `--illustration-ink` alone
     (`tokens/tokens.css:288`), consumed by no component, so nothing renders
     differently on the day the step lands — but whether it should read from the
     new step, from `--text-secondary`, or from a primitive is part of this
     decision rather than a consequence of it. **Note the live possibility that
     it was built on `--text-tertiary` *because* that token was mode-invariant**
     — a deliberately stable ink. The record does not say, and it is not to be
     inferred.

   Where the compression bites hardest, as input to the decision: `LabeledField`
   (label `:46-50` was tertiary, value `:61` secondary — now one colour, and the
   `dl`/`dt`/`dd` structure is all that still carries the term/description
   distinction), `RequirementList` (name primary / description + path + version
   all secondary), `ServiceStatusList` (name primary / description + port +
   detail-label secondary), `MetricCard` (value primary / label + sub secondary),
   `ResourceCatalog` (title primary / count + domain + meta-dt secondary) and
   `SelectableRow` (title primary / subtitle + trailing secondary).
   Recorded 2026-08-22.

   **`--text-tertiary` is not deprecated by any of this.** It stays legitimate
   above the 24px large-text threshold, on genuinely decorative content, under
   the SC 1.4.3 exemption for inactive controls, and as a `color-mix` input to a
   derived token. Eight rules keep it; they are listed in
   `apps/catalog/src/data/contrast-allow.json`.

9. **No row-height token for desktop tables.** The data-layer shell (khaos-app
   `docs/design/desktop-gui-audit-2026-10-09.md` §4.3) proposes `size.row` =
   **24px**: the `data-md` line (16px) with `--spacing-2xs` (4px) above and
   below. `DataTable`, `PropertyRow`, `EventLog` and `StatusBar` hold `24px` as
   a commented literal until a value is decided. Recorded 2026-10-09.

10. **No dock tab-strip height.** Proposed `size.tab` = **32px**: the
    `label-md` line (16px) with `--spacing-xs` (8px) above and below. Used only
    by `Dock`'s tab strip, which holds the literal meanwhile. Recorded
    2026-10-09.

11. **No toolbar height.** Proposed `size.toolbar` = **52px**, the unified
    window toolbar in the audit's direction (§3.3). `Toolbar` holds the literal
    meanwhile. Recorded 2026-10-09.

12. **No neutral selection surface.** Proposed `surface-selected`, semantic and
    mode-aware, for a selected row in a table or source list. Gold stays the
    brand and the primary action and is never the selection (audit §3.1
    principle 11). This overlaps gap 3 (`DS.accentMuted`, which is amber):
    **which one, if either, is Andrew's call.** Meanwhile the kit uses the
    existing `--surface-raised` for a selected row. Recorded 2026-10-09.

13. **No alternate-row surface.** Proposed `surface-row-alt`, semantic and
    mode-aware, for optional zebra striping at 24px. **Whether tables stripe at
    all is Andrew's call.** Meanwhile the kit does not stripe. Recorded
    2026-10-09.

14. **No pane-collapse motion.** Workspace `DESIGN.md` specifies 150ms ease-out
    for a pane collapsing and notes that it has no token. `Dock` holds the
    literal meanwhile. Recorded 2026-10-09.

15. **Elevation for desktop panes, from the `minimalist-ui` principles.**
    Docked panes sit flush, with hairline dividers and no shadow. Overlays (a
    `Popover`, a `Sheet`, the inspector shown as an overlay at narrow widths)
    get an ultra-diffuse shadow below `0.05` opacity. Gap 4's `DS.shadow`
    (`black @ 0.18`) is far heavier. Raised as a principle for Andrew, not a
    value. Meanwhile the kit draws hairline borders and no new shadow. Recorded
    2026-10-09.

The D57 numeral pair (gap 7) is needed by `DataTable` and `ScrubNumber` as
well; it is not repeated here.

## What khaotik-ui does meanwhile

The catalog components are built against the tokens that exist today; the gaps
above are reported (routed to Andrew) and never guessed. No token is fabricated.

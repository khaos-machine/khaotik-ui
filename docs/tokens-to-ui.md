# Tokens to UI — where the design lives

The design lives in the library. `tokens.json` is the source of truth for the
values; the Svelte components are the source of truth for the structure. There
is no intermediate spec and no generator — the path from design to dev is
direct, and the same library is shared by the catalog and every Khaos app.

## The chain

```
tokens.json      "warm.950 = #171615" · "heading-md = 16/20/600"
   │  build-tokens.py
tokens.css       --warm-950: #171615   --heading-md-size: 16px
   │              ├─ tokens-extra.css   the seven-way --tone-* bridge
   │              ├─ utilities.css      .eyebrow / .surface, rendered BY the atoms
   │              └─ parse.js           reads tokens.css back, for the palette views
   │  components reference only the semantic vars
components       Icon, StatusPill, ProjectCard … use var(--surface-raised), --tone-*
   │  imported
views            apps/catalog (compositions) · stories (atoms) · external apps
```

- **Tokens** = the values (colour, space, radius, type), defined once in
  `tokens/tokens.json` and generated to `tokens/tokens.css` (never hand-edited).
- **Utilities** = `utilities.css`, the two classes the atoms render themselves
  (`.eyebrow`, `.surface`). They ship from the kit because a consumer that
  imports a component gets markup referencing them; when they lived in the
  catalog app instead, every eyebrow rendered as plain body text everywhere else.
- **Components** = the structure (atoms + compositions), hand-authored in
  `components/svelte/`, referencing only semantic tokens.
- **Views** = the catalog (`apps/catalog/`), which previews the components;
  external apps import the same package.
- **`parse.js`** closes the loop: the palette screens document the tokens by
  parsing the generated CSS, so the screen and the documentation of the screen
  cannot disagree. There were two copies of this parser once; they drifted, and
  the drift shipped a crash to the then-published Storybook.

## Why tokens carry the design

Components never state a raw colour or size. They reference semantic tokens —
`var(--text-primary)`, `var(--radius-sm)`, `var(--tone-warning)` — so a palette
or density change is one edit in `tokens.json` and everything follows: the
catalog, and every app that imports the library.

The warm-gray palette is **BrandKit `DECISIONS.md` D-005** — Andrew's own
register in `khaos-studio/khaotik-3`, which is where the hyphenated `D-00N`
numbers come from and which is not part of this repo. The dense native
type/radii are **D53–D57** in `decisions.md` (this repo's register, numbered
`D1`…`D57` without a hyphen). The token gaps still owed to Andrew live in
`harvest-khaos-machine-tokens.md`.

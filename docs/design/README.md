# khaotik-ui for designers

For designers who shape Khaos apps through Claude Code or Codex. This page
explains how the kit works and where things live. Your agent does the coding;
point it here and at the pages linked below.

## What the kit is

`@khaos-machine/khaotik-ui` is the Khaos design system as code: design tokens,
Svelte 5 components and the artwork they ship with. Every Khaos app installs it
from npm at an exact version and draws its screens from it. The kit is written
by hand. Nothing is generated from a design file, so a change to how the apps
look is a change made here.

These docs ship inside the package. In an app that installs the kit, your agent
reads the copy at `node_modules/@khaos-machine/khaotik-ui/docs/design/`, which
matches the version that app pins.

## See it: the catalog

The catalog shows every component, rendered with the real tokens against real
story data, in light and dark:

<https://khaos-machine.github.io/khaotik-ui/>

It is republished with every kit release and names the kit version it was built
from.

To see work that is not released yet, run the catalog from a clone of the kit
([github.com/khaos-machine/khaotik-ui](https://github.com/khaos-machine/khaotik-ui)).
Ask your agent to run, from the repository root:

```sh
npm ci
npm run dev --workspace apps/catalog
```

Then open <http://localhost:5173>. The server holds port 5173 and stops with an
error if something else already has it.

## Where things live

| What | Where | Notes |
| --- | --- | --- |
| Tokens (colour, type, spacing, radii) | `tokens/tokens.json` | The source. `tokens/tokens.css` is generated from it and never edited by hand. |
| Components | `components/svelte/` | One `.svelte` file per component. Its props are documented in the file and show on hover in an editor. |
| Placeholder artwork | `assets/placeholders/` | What a component shows before real art exists. |
| Catalog entries | [`apps/catalog/src/fixtures.js`](https://github.com/khaos-machine/khaotik-ui/blob/main/apps/catalog/src/fixtures.js) | Where each component's examples are declared and filed in the catalog's sidebar. |
| Design decisions | [`docs/decisions.md`](https://github.com/khaos-machine/khaotik-ui/blob/main/docs/decisions.md) | Why the kit is the way it is. A new design value needs a row here. |

## The design rules

Each rule has one home. This table is the index; follow the link for the rule
itself.

| Rule | Home |
| --- | --- |
| Use semantic tokens (`--surface-*`, `--text-*`, ...), never primitives like `--warm-950` | [Using the library, §3 Theming](../using-the-library.md#3-theming) |
| The conventions that will bite you: selection by id, optional callbacks, the D52 accessibility encoding | [Using the library, §5](../using-the-library.md#5-the-conventions-that-will-bite-you) |
| What is in the box: every component, grouped | [Using the library, §4](../using-the-library.md#4-what-is-in-the-box) |
| The design-system invariants: warm-gray theme, gold for brand and primary actions only, seven status tones, tight radii, no new design value without a decision | [`RULES.md`, "Design-system invariants"](https://github.com/khaos-machine/khaotik-ui/blob/main/RULES.md#design-system-invariants) |
| Accessibility and component rules | [`RULES.md`, "Component and accessibility rules"](https://github.com/khaos-machine/khaotik-ui/blob/main/RULES.md#component-and-accessibility-rules) |
| Whether a change is a token, an atom, a composition or a screen | [The `design-iteration` skill](https://github.com/khaos-machine/khaotik-ui/blob/main/.claude/skills/design-iteration/SKILL.md) |
| Working from a Claude Design project: the kit is upstream, the project mirrors it | [The `claude-design` skill](https://github.com/khaos-machine/khaotik-ui/blob/main/.claude/skills/claude-design/SKILL.md) |
| A token a design needs that the kit does not have | [Token gaps](https://github.com/khaos-machine/khaotik-ui/blob/main/docs/harvest-khaos-machine-tokens.md): report it, never invent a value |

## Changing the kit

Anyone may propose and make a kit change. [Changing the kit](changing-the-kit.md)
walks through it, from the brief to an app running the new version.

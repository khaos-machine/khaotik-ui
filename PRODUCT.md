# Product

<!-- impeccable:product-schema 1 -->

Product truth for design work on the kit. Confirmed by K on 2026-11-10 ("read
the latest documentation and plans at the Khaos Machine workspace"); Andrew
Gatto owns product (`USER.md`) and is to review it. Each fact below is drawn
from the workspace document named beside it, one level up in `khaos.machine`.
**That document wins** when the two disagree; this file is the bug. Workspace
documents are cited by section name, never by line.

## Platform

web

Svelte 5 components, rendered by Khaos App inside a Tauri desktop window and,
through Khaos Cloud, in a browser. A native wrapper around a web view is still
`web`.

## Users

Storytellers. The beachhead is narrow on purpose: screenwriters, film students,
indie filmmakers, and collaborators reacting to shared playback (workspace
VISION, "The audio-first wedge"). Basic is meant to serve non-technical
storytellers without provider, model or git setup (workspace VISION, "Basic,
Advanced and the cloud milestone"). Advanced serves those who want local
generation, provider control and integrations with production tools.

## Product Purpose

Khaos Machine is a story-intelligence platform. It treats a story as structured
data, not a static document, so creation, playback, production and distribution
all work from one narrative source of truth (workspace VISION, "One-paragraph
summary").

The near-term product proof is the audio-first wedge: _upload a screenplay →
press play → hear a story-aware performance grounded in character, scene,
timing, and composition context_. Success is repeat usage and small-circle
sharing, not broad reach (workspace VISION, "The audio-first wedge").

This kit exists so every Khaos app draws its screens from one hand-authored
design system (`AGENTS.md`, `docs/design/README.md`).

## Positioning

Story-aware performance built on structured narrative context — KSPD character
and scene structure, composition timing, voice casting — rather than generic
screenplay-to-audio, which already exists elsewhere (workspace VISION, "The
audio-first wedge"; "Strategic position").

## Operating Context

The creator journey runs IMAGINE → CAPTURE → CREATE → PERFORM → VISUALIZE →
PRODUCE → DISTRIBUTE → MONETIZE; its honest per-stage status is in workspace
VISION, "The creator journey".

Two interface layers (workspace product note, "Two interface layers",
2026-10-09):

- **The data layer** — the desktop shell: panes, tables, inspectors, command
  palette, review by group. It makes the data and the functions over it clear,
  and is not expected to give the storyteller a guided path.
- **Storyteller layers above it** — story building, character building, story
  playback, world building, and the iterative processes that support
  storytellers. What each is, how a storyteller moves between layers, and their
  order are **undecided** and belong to product.

## Capabilities and Constraints

- Khaos is **not an editing suite** and not a rendering engine: NLEs edit,
  Blender and Unreal render; Khaos supplies the story data and timeline exports
  (workspace VISION, "What the platform is not").
- Demo and catalog data are real, fetched from the khaosd daemon; gaps are
  reported, never fabricated (`AGENTS.md`, Conventions).

## Brand Commitments

- **A desktop pro app, leaning NLE.** Operator, 2026-11-10, on a large amber
  button in the Player: "big webby CTA buttons! this is desktop pro app and
  we're leaning way more NLE than whatever that is." On phone and tablet as
  well: **"Dense everywhere"** — desktop density, no touch-sized controls.
- Rulings per surface are recorded in
  `.claude/skills/desktop-experience/SKILL.md`; the design-system invariants are
  `RULES.md`'s.

## Evidence on Hand

Real stories as KSPD data captured from khaosd, rendered in the catalog
(<https://khaos-machine.github.io/khaotik-ui/>). No testimonials, customers or
usage figures exist here; none may be invented.

## Product Principles

1. **The story is the data.** Every surface shows the one narrative source of
   truth; nothing is fabricated or papered over.
2. **A pro tool, not a web page.** Dense, quiet and precise, in the manner of an
   NLE, on every screen size.
3. **Hear the story first.** Playback is the product proof; surfaces serve
   press-play-and-react.
4. **Integrate, don't replace.** Hand off to editing and rendering tools; don't
   imitate them.

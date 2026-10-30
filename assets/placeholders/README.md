# Placeholder artwork

Pre-production art the kit ships so its components have something honest to
render before real imagery exists. **These are placeholders, not final art.**
The engine generates and stores real images per entity — `/api/characters/
appearance` already returns them for some characters — and every component here
prefers real artwork over anything in this directory.

They live in the library, rather than in each app, for the reason
`tokens/utilities.css` does: five apps hand-rolling the same fallback is five
copies that drift, and the fallback is part of how a component looks. An app
that wants its own set overrides it per component (`figureFor`, `cover`) without
touching the kit.

| | |
| --- | --- |
| `silhouettes/` | Twelve character figures — `{female, male, nonbinary, unknown} × {young, adult, senior}`. `Portrait` picks one from the `gender` / `age` it is given. |
| `project-cover.webp`, `project-cover@2x.webp` | The story cover `ProjectCard` tints per project. |

## Rules

- **WebP, and check the size.** These ship to every consumer of the library. The
  silhouettes were 188 KB of PNG and are 108 KB as WebP at q82; the cover was a
  1.8 MB source PNG and is 28 KB at 2×. A card hero is exactly where an
  unoptimised asset hides.
- **No entity-specific art here.** Anything that depicts a particular character,
  scene or location belongs to the project that owns it, not to the kit.
- **Adding a bucket is an API change.** `Portrait` maps demographics onto these
  filenames, so a new one needs the mapping and its story and fixture, not just
  a file drop.

Source: `khaos-app/src/assets`, produced 2026-08.

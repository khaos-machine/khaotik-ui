---
name: desktop-experience
description: How khaotik-ui surfaces give a desktop-class experience on the web as well as in khaos-app — one-screen overviews, visuals over lists, detail on demand. Use before designing or reshaping any overview, dashboard or analysis surface in the kit (StoryOverview first), alongside `dataviz` for chart form and `information-architecture` for what goes above the fold.
---

# Desktop experience

Written as the operator decides it, one ruling at a time. Every rule cites the
operator's words and the date. Nothing here is inferred; a rule with no ruling
behind it does not belong here.

## Rulings

| Date | Surface | Ruling (verbatim) |
| --- | --- | --- |
| 2026-11-10 | StoryOverview | The problem: "it's one massive list that no one is ever going to read and has no visualizations. everything is a list/bullets." |
| 2026-11-10 | StoryOverview | Shape: **one-screen dashboard** — panels that fit one screen; clicking a panel opens its detail. |
| 2026-11-10 | StoryOverview | First visual: **the story timeline** — the turns placed where they fall in the story. |
| 2026-11-10 | StoryOverview | Turn positions come from the **structure profile** (`structure.profile.scenes`), which the Overview already receives. No new prop. |
| 2026-11-10 | StoryOverview | **Mark height = strength**: a stronger turn draws taller, so the big turns stand out. |
| 2026-11-10 | StoryOverview | On the bare timeline: "is this better? did we make anything clearer? because i don't know what to get from the graph". It was not: a visual must answer a question the writer has, or it is the list again, harder to read. |
| 2026-11-10 | StoryOverview | The timeline answers **"Where my big turns are"**, **"Beats a structure expects"** and **"Pacing"** — reworked, not dropped. |
| 2026-11-10 | StoryOverview | Beats: **"Every structure that fits"**, one row each. When the outcome is ambiguous the protocol names no fit set, so: **"Top two by excess"**. |
| 2026-11-10 | StoryOverview | Pacing: **"Both"** — a shaded density band, and words naming the quietest and busiest stretch. |
| 2026-11-10 | StoryOverview | Reworked timeline, asked "Does it now tell you something?": **"Yes, keep going"**. |
| 2026-11-10 | StoryOverview | The turns list under the timeline: **"Fold it"**. |
| 2026-11-10 | StoryOverview | Rollout: **"On for everyone"** — part of the component, no opt-in prop. |
| 2026-11-10 | StoryOverview | Next: **"Dashboard layout"** — arrange the one screen before adding panels. |
| 2026-11-10 | StoryOverview | Layout: **"Header, band, grid"** — verdict in the header, premise and Shape as full-width bands, the rest as summary panels in a grid. |
| 2026-11-10 | StoryOverview | A panel's full list: **"Expand in place"** — "Show all" opens it beneath the grid, one panel at a time. |
| 2026-11-10 | StoryOverview | **"Build it"**. |
| 2026-11-10 | StoryOverview | On the dashboard preview: "The current preview was incomplete, especially relative to character journeys". The Journeys panel answers **"Who changes"**, **"Where they turn"** and **"Who's connected"** — **"Wait for real data"** before building them. |
| 2026-11-10 | StoryOverview | Placing a journey's turning points: **"Pass all positions"** — every scene's word position comes in as an input, on Shape's axis. |
| 2026-11-10 | StoryOverview | Next: **"Characters as a chart"** — dialogue-share bars, the lead filling the track; asked if it works: **"Works, commit it"**. |
| 2026-11-10 | StoryOverview | Next: **"Coverage as a chart"**. Bars first, answered: "boring. making it indiffernt from Characters panel." — two panels must not share a form. Then **"Radar"**; asked if it works: **"Works, commit it"**. |
| 2026-11-10 | StoryOverview | "let's assemble the full overview screen with sidebar, header and such for review in catalog" — in the kit, **"New kit component"** (StoryOverviewScreen), not a catalog-only copy of khaos-app's layout; asked if it works: **"Works, commit it"**. |
| 2026-11-10 | StoryOverviewScreen | "let's improve the StoryOverviewScreen itself": **Side pane on demand**, **Outline less listy**, **Strip hierarchy**. The strip: **"Figures lead, step beside"**; asked if it works: **"Works, commit it"**. |
| 2026-11-10 | StoryOverviewScreen | Side pane on demand: **"Column opens"** — a selection opens it, Close or Esc closes it; asked if it works: **"Works, commit it"**. Outline: **"Grouped by question"**. |

## Working rules — proposed, not yet ruled

Drawn from the rulings above by the agent. Each is **unconfirmed** until the
operator rules on it; move it into the table above when they do.

1. **A visual replaces a list; it does not sit on top of one.** The list a visual
   replaces is the visual's detail, reached by selecting in the visual.
2. **Draw from what the engine already sends.** Before asking for a new input,
   read the whole payload the surface already receives — the turn positions were
   in `structure.profile` all along, deleted by the catalog's capture.
3. **Scale to the data, not to an assumed range.** `strength` is only bounded
   below (KSPD `structure.schema.json`, `$defs.inflectionPoint`), so heights are
   relative to the story's strongest turn.
4. **Every mark is a control.** A point in a visual that stands for an entity is
   a button named for it, so the visual is reachable by keyboard and screen
   reader, and selecting it drives the same `onselect` the list did.
5. **Name the question before drawing the chart.** Write down what the writer will
   learn from it; if the answer is "where things are", it needs labels and a
   reference to compare against, not just marks.
6. **When the protocol is silent, say so and route it.** A visual that needs a
   fact the payload only states in prose (the ambiguous fit set) gets an operator
   ruling for the stand-in rule, recorded above, never a quiet inference.

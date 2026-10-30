# Changelog

All notable changes to the **`@khaos-machine/khaotik-ui` library** are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and
the library follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This file tracks the **library**, which ships under the `lib-*` tag prefix. The
**catalog** desktop app versions independently under `v*` — see
[AGENTS.md](AGENTS.md). Keep the prefixes apart: a `v*` tag ships a signed,
notarized catalog release whether or not one was intended.

**Consumers should pin a `lib-*` tag, not a bare SHA.** A version in a
dependency string is something a human can read. `khaos-app` once pinned a bare
SHA and was 24 commits and two minor versions stale before anyone noticed, so
D58's break and D59's shipped `.d.ts` had never reached the client. It pins a
`lib-*` tag now — measured 2026-09-22 — so that sentence is history, not a
description of a live consumer.

## [Unreleased]

## [0.165.0] — 2026-10-30

### Added

- `TextAreaField`: a labelled multiline input on Ark UI's Field textarea, with the same API as `TextField` (`label`, `name`, `value` with `oninput`, `required`, `hint`, `error`) plus `rows`. It grows to fit its text. Enter opens a line, and Cmd+Enter (Ctrl+Enter off Apple) calls `onsubmit` with the text.

## [0.164.1] — 2026-10-30

### Fixed

- A fresh install builds again. `@ark-ui/svelte` was a range (`^5.23.0`), so new consumers got 5.25.0, which ships SvelteKit `$lib/` imports that no bundler resolves, and `vite build` failed. Every dependency is now an exact version (`@ark-ui/svelte` 5.24.3, `@phosphor-icons/web` 2.1.2), and `check-consumer` installs the packed tarball into an empty Vite app with no lockfile and builds it.

## [0.164.0] — 2026-10-30

### Added

- `TextField`, `PasswordField` and `CodeField`: labelled inputs on Ark UI's Field, PasswordInput and PinInput. The hint and the error are read out through `aria-describedby`, an error sets `aria-invalid`, and `autocomplete` is passed through (`current-password` by default, `one-time-code` on `CodeField`). Values are controlled: the consumer passes `value` and receives `oninput`. `PasswordField`'s show/hide toggle is a toggle button named "Show password" with `aria-pressed`, reachable with Tab and operated with Enter and Space (WCAG 2.1.1).
- `FormStack`: a one-column form with a form-level `message`, the fields and the `actions`. Submitting calls `onsubmit` without reloading the page.
- `assets/icons/phosphor.css`: Phosphor's `regular` and `fill` weights as woff2 only. Import it in place of `@phosphor-icons/web/regular` and `/fill`, which also bring woff, ttf and svg into a build: 279 KB of font in place of 7.5 MB. `npm run check-icons` fails when it drifts from the installed Phosphor.

### Changed

- The README is cut to install, use, develop and release.

## [0.163.0] — 2026-10-30

### Changed

- **Breaking:** the package is `@khaos-machine/khaotik-ui`, published on npm. Replace every `@khaos/khaotik-ui` import and the git dependency with `"@khaos-machine/khaotik-ui": "0.163.0"`.
- Licensed Apache-2.0. The package ships only `components/`, `tokens/` and `assets/`.
- The repository moved to the public `khaos-machine/khaotik-ui`, and CI runs on GitHub-hosted runners. `lib-publish.yml` publishes each `lib-*` tag with npm trusted publishing.

## [0.162.0] — 2026-10-28

### Added

- `PlaceAppearanceWorkbench` uses a place's Build renders in Design. K's words, relayed: "use the 3D references in the Design stage".
  - khaosd v0.193.0 records each render as a place reference whose only role is `set`. The workspace type's new `renders` has the same shape as `references`.
  - The References list shows every render, whether it's in use or not, and each can be inspected like any other reference.
  - The role is labelled "Match the 3D model". It used to fall through to "Layout". "3D" is there because elsewhere in the app "model" means an AI model.
  - When renders are in use, the image-input hint adds "· N from the 3D model".

## [0.161.1] — 2026-10-28

### Fixed

- A click on a `PlacePlan` camera no longer reports a camera move. App Lead's live pass (khaos-app#634) found a click near the plan writing a 3D-edit draft nobody dragged, and that draft blocks Build ("Save or discard 3D edits before building."). Any `pointermove` set the pose, so a move in place, or a pixel of jitter, reported `onmovecamera(..., done=true)` on release. A press is now a drag only once the pointer travels 3 screen pixels; below that it is a click, and it moves nothing.
- `PlaceAppearanceWorkbench`'s Build toolbar group is named "Build", not "Build inputs". It has held no inputs since 0.161.0.

## [0.161.0] — 2026-10-28

### Changed

- `PlaceAppearanceWorkbench`'s mode rail is now Structure (when given), Build, Design, Render. Before, it was Structure, Design, Build, Render. This follows K's ruling "Structure→Build→Design", relayed by App Lead (khaos-app#589).
- Build makes the 3D place from the approved floor plan, so Build Place is disabled only when there is no `onbuild`, or while `buildBusy` or `building`. `oncancelbuild` is still optional, and Cancel Build shows only when the host passes it.

### Removed

- **Breaking.** The Build toolbar's "Design sheets" picker, and its `buildSheets`, `buildSheetIds` and `onbuildsheets` props. K's ruling on the paid Build from design sheets, relayed by App Lead: "Remove it".

## [0.160.1] — 2026-10-27

### Fixed

- `PlaceStructure`'s size row is one line again. App Lead's live pass at a 1440px window (khaos-app#628) found the Building menu filling the pane at 1399px wide, with Lay out wrapping below it. `Menu`'s trigger fills its container, and in a wrapping row that takes a whole line. Each menu in the size and area rows is now as wide as its value. `Menu` itself is unchanged.
- Each area's name now shows beside its menu. Before, it was only in the trigger's accessible name, so a sighted writer saw a row of "—" with nothing to tell the areas apart. The visible name is `aria-hidden` because the trigger already announces it ("Kitchen: —").

## [0.160.0] — 2026-10-27

### Added

- `PlaceStructure`, the Structure step of the Place Builder (khaos-manager#1072, khaos-app#589). It draws, top to bottom:
  - a size row: a Size `SegmentedControl` (`presets`, `preset`, `onpreset`); a Building menu (`places`, `place`, `onplace`), disabled until a size is chosen; and one button (`onlayout`), labelled "Another layout" when `another`, otherwise "Lay out". The button is disabled when `canLayOut` is false or while `busy`, and is primary when `first`;
  - an area row, only when `areas` is not empty: one menu per area, labelled with the area, offering "—" and then `kinds`. It shows `areaKinds[id]` and reports `onkind(areaId, kind)`; "—" sends `''`;
  - `problems`, in a status list, only when there are any;
  - `children` below, where the host renders the plan's review.

  The host owns every value and all copy apart from those labels.

## [0.159.0] — 2026-10-27

### Added

- `PlaceAppearanceWorkbench` takes a Structure mode, for "Structure, then sheets" (khaos-manager#1072, khaos-app#589). `mode` and `onmode` take `'structure'`. A new `structure` snippet holds the place's floor plan workspace, which the host composes. When it is given, Structure is the first item on the mode rail. A place without one, such as an exterior or a vehicle, shows no Structure item.

## [0.158.0] — 2026-10-26

### Added

- `ReadingReadiness` acts on a voice khaosd says can't render (khaos-manager#1091). Its readiness type takes `voices[].blocked: { code, message, models? }` and a top-level `modelsMissing: [{ id, name, repoId }]` (null is read as none). Both actions sit above the collapsed "All scenes" section, so a block is never hidden:
  - `VOICE_ENGINE_NOT_ENABLED`: the voice's message, verbatim, with Recast…, which calls `onRecast(voiceProfileId, narrator)`;
  - `MODELS_MISSING`, or any `modelsMissing`: one line naming every missing model once, with Download models…, which calls `onDownloadModels()`.

  `narrator` is now optional, as khaosd omits it when false.

## [0.157.0] — 2026-10-26

### Fixed

- A failed story read no longer shows as an empty story. On Brick & Steel the atlas read failed (`ATLAS_READ_FAILED`), and the Characters table said "This story has no characters." `CharacterTable`, `SceneTable`, `PlaceTable` and `ObjectTable` take the read, `status: { kind: 'loading' } | { kind: 'failed', message } | { kind: 'loaded' }`, and `onretry`, as `ProjectWindow` takes it:
  - a table still reading says so ("Reading characters…");
  - a failed read shows the host's message and Try again;
  - only a loaded read says its empty text.

  The guard is in `DataTable`, which every table draws through: it takes `status`, `onretry` and `loadingLabel`. Rows already shown stay while a re-read runs. If the re-read fails, the rows stay and the failure is said under them.

## [0.156.0] — 2026-10-26

### Fixed

- `Toolbar` folds command labels one at a time, from the last command, only until the row fits; 0.155.0 folded every label at once. In khaos-app's project window at 1440px, with five modes and three commands, every label folded and freed about 450px where about 150 were needed (#617 live pass). Measured again with the same row: only the last label folds. The filter, then the title, still give way only after every label has folded.

### Changed

- `CharacterSide` draws the narrator in the character inspector's sections, Identity and Casting, with the same Voice pop-up and the same secondary "Design a voice for Narrator…" button, in place of the link-style one (khaos-app#620; K: "the narrator inspect should match the other character inspectors visually").

### Added

- `CharacterSide` previews the narrator's voice in place (K: "no way of previewing without launching voice manager"). It takes `narratorPreview: { kind: 'none' | 'making' | 'ready', src } | { kind: 'failed', message } | null` and `onPreviewNarrator()`:
  - `none` offers Preview voice;
  - `making` says so;
  - `ready` plays the clip in an `AudioPlayback`;
  - `failed` shows the host's message and offers Preview voice again;
  - null draws nothing.

## [0.155.0] — 2026-10-26

The project window's Overview landing and toolbar regroup (khaos-app#617; K: "that works for now. build and ship", relayed).

### Added

- `Shell` takes an `overview` presentation: a new `overview` snippet is a layer under the toolbar. One `StatusBar`, with its budget item, sits under both the overview and the data; it is no longer inside the data layer.
- `Shell` takes `onProjectSettings`. When it is set, a gear (`gear-six`, "Project Settings…" as its name and tooltip) closes the toolbar's trailing edge.
- `StoryOverviewStrip`: four figures in a row, built on `MetricCard`. They show coverage's verdict (through `VERDICTS`, or "Not made"), the budget's "$spent of $limit" (or "No budget set" with "Set budget…"), the review count, and the next step. Each opens through its own callback. With `next` null, no fourth figure is drawn.
- `DataTable` takes `pinned`: rows above the header, set off by a hairline, never sorted, filtered or counted with the body. Up from the first row, or Home, walks into them.
- `lib/budget.js` exports `budgetText` and `budgetSpent`, shared by the status bar and the strip.

### Changed

- `Toolbar` falls into three groups:
  - where you are: the title, the switcher and a new `lead` snippet;
  - what you can do: commands, the filter, the panes and a new `tools` snippet;
  - status: a new `status` snippet and `onsettings`/`settingsLabel`, at the trailing edge behind a hairline.

  The status group sits outside the part that takes any overflow, so it never clips. When the row overflows, command labels fold to their icons (each label stays the button's name and tooltip), then the filter narrows to 96px, then the title truncates. Nothing else in the row shrinks.
- `Shell` puts the Story/Review switch right after the modes. The atlas lens tools go after the panes, and "Story update failed" with Retry goes in the status group, at caption size.
- `CharacterTable` pins the Narrator above the header. A story with no characters shows "This story has no characters." in the body, under the header.

## [0.154.1] — 2026-10-26

### Fixed

- The `Voices` "Paid from" label stays on one line. Beside the full-width story menu it wrapped to "Paid" / "from" (khaos-app#616 live pass).

## [0.154.0] — 2026-10-26

### Added

- `Voices` shows which story pays for hosted voice work (khaos-app#615; K: "Pick the story"). It takes an optional `story: { choices, chosen, reason, fixed } | null` and `onStory(id)`. A bar at the top of the window, above every pane, reads "Paid from", followed by one of three things:
  - a menu of the open stories, most recent first;
  - the character's story, with no choice, when `fixed`;
  - the host's `reason` when no story is open.
  Stories sharing a title are told apart by their file name. Null draws nothing, as before.

## [0.153.0] — 2026-10-26

### Fixed

- A refused hosted voice creation or clone can now offer its fixes. `VoiceStudio` takes an optional `hostedRefusal: { offer, onFix?, onReport? } | null`. When it's set, `RefusalOffer` is drawn in place of the `hostedStatus` line, so an unbudgeted story offers "Set budget…" and Report a Problem…. Before, the refusal showed only as a status string. With `hostedRefusal` null, the status line shows as before.

## [0.152.0] — 2026-10-26

### Fixed

- A refused voice description refinement can now offer its fixes. `VoiceStudio` takes an optional `refinementRefusal(error)` that maps the host's failure to a refusal offer, for example "Set budget…" for an unbudgeted story (khaosd `cause: "budget_not_set"`). The offer is drawn with `RefusalOffer`, so Report a Problem… is always there. Before, the refusal printed only the raw message, `BUDGET_NOT_SET: …`. Without the mapper, or when it returns null, the message shows as before.

## [0.151.0] — 2026-10-26

### Fixed

- `Shell` shows its `notice` on its own layer above the builders and every presentation, so a refused builder or Composer frame shows its fix. It sat inside the data layer and was hidden whenever a builder or another presentation was open (khaos-manager#1080).

## [0.150.0] — 2026-10-26

### Removed

- Per-request paid-consent asks (K on khaos-manager#1075: "Budget is consent"; extended to scene reads and hosted voices, khaos-app). The story budget admits paid work, so the kit no longer asks for it each time.
  - `SceneReadApproval` is gone, and `SceneReads` drops `review`, `onApprove` and `onCancelReview`. A read starts when the host admits it.
  - `VoiceStudio` drops the "Allow provider charges without a price ceiling" checkbox. `onHostedDesign` and `onHostedClone` specs no longer carry `unpricedConsent`. The adult-human attestation and the provider consent recording for a clone stay.
  - K, "Remove all four": `ShotInspector` drops its frame charge checkbox and the `consent` and `onconsent` props. `SceneShotPlanner` drops its frames charge checkbox. `DialogueInspector` drops the per-take charge checkbox, and `onTake` reports only the direction. `Voices` drops the speech-request checkbox and the `allowCharges` and `onAllowCharges` props. A billed voice still says that its provider bills with no price limit.

## [0.149.0] — 2026-10-26

### Added

- Cameras move on the plan (khaos-app#588). `PlacePlan` takes an optional `onmovecamera(id, { position, target }, done)`. Dragging a camera moves its position and leaves its target alone, so the cone re-aims. The selected camera has a target handle at the end of a dashed aim line. With a camera focused, the arrow keys nudge its position by 0.1 m, and Shift with the arrow keys nudges its target. `done` is true once per drag, on release, and on every nudge. Without the callback, cameras only select, as before.
- `moveCamera(definition, id, pose)` in `lib/place-plan.js` returns a copy of the definition with one camera moved to the centimetre, each z kept.

### Changed

- `PlaceReview` applies camera moves itself and reports one `onedit` per drag or nudge, so hosts need no new props. While a drag is in progress, the plan draws the moved camera and the model view looks through it. `PlaceViewer` now receives the working definition, so it also looks through cameras edited in the fields.
- `PlaceReview` holds its edit fields and camera moves under one rule: locked while `saving` or a `conflict` is set, including `building`. The fields used to stay editable during a save or a conflict.

## [0.148.0] — 2026-10-26

### Added

- `PlaceBuildRounds` shows a Place Build round by round (khaos-app#587). A filmstrip shows each round's line art, number and state: an accent check for the submitted round, a flag for the draft written when the job stopped, and a warning count for camera problems. While the job runs, a pending tile follows the rounds. Below the strip are the selected round's camera views. A view with problems has a warning edge, and its sentences open per camera. The rooms no camera sees are listed as chips. Arrow keys, Home and End move between rounds. The strip holds 24 rounds and keeps the selected round in view. The host formats every string and picks the selected round.

## [0.147.0] — 2026-10-26

### Removed

- **Breaking:** `ProblemReport` drops Copy report and the Advanced-only GitHub issue, with their `onCopy`, `onFileIssue` and `advanced` props (khaos-app#590). Email report… and Save a file… remain, and the host makes both deliver one zip of the full current logs. The intro now says so.

## [0.146.0] — 2026-10-25

### Added

- `PlaceAppearanceWorkbench` has centered Design, Build and Render modes. Design remains the default; Build accepts a full host workspace and controlled sheet selection, submission, retry, cancel and result actions. Render is a placeholder. Navigation does not generate work.

### Changed

- **Breaking:** `PlaceReview` uses revision-keyed `sheets` and optional `sheetLabels` instead of `sheet`. Definitions use ordered `designRevisionIds`; camera panels use `sheet: { designRevisionId, panel }`. This matches manager 0.185.0. Repeated panel numbers on different sheets stay distinct; legacy references are not adapted.

## [0.145.0] — 2026-10-25

### Added

- `StoryOverview` shows the story's character journeys and relationships, each as its own section after Coverage, and `StoryOverviewOutline` and `StoryOverviewSide` carry them. They read khaosd's `GET /api/journeys` and `GET /api/relationships` as sent, with the engine's name for each character. `OverviewSelection` adds `journey` and `relationship`.

## [0.144.0] — 2026-10-24

### Fixed

- `StoryOverview` shows coverage notes as prose. khaosd sends `assessment.notes.value` as one string, and the overview listed it a character to a bullet.

## [0.143.0] — 2026-10-24

### Changed

- **Breaking:** the story budget is one dollar limit (K, 2026-10-24: "one fucking number ($USD) as MAX spend. THAT'S IT! user can increase or reset. no count caps!!!"; khaos-manager #1032). A loaded budget is `{ usd, spentUsd, remainingUsd }`, and a missing one suggests `{ usd: string[] }`.
  - `BudgetPane` is one grouped form. It has a spending limit with Save, the spend against the limit with Reset spend, and, for a story with no budget, the suggested amounts as choices. It takes `reset` and `onreset`, and `onsave` gets the limit as a decimal string. The `title` prop and the `no-story` state are gone.
  - The `StatusBar` budget item reads "$1.23 of $5.00" and opens the story's budget. It has no popover.
  - `StoryOverview`'s `budget-reached` run carries `usd` and `spentUsd` instead of calls by medium, and an offer has no `remaining`.
  - `lib/budget.js` keeps only `dollars`.
- `Settings` draws no rail for a single category, because there is nothing to choose.

### Removed

- The explanatory sentences in `BudgetPane` ("Paid AI work on this story stops…", the suggestion and no-budget lines, the unreported-cost and not-counted caveats) and the unreported-cost line in the `StatusBar` budget popover. K, 2026-10-24: "don't put stupid fucking messages on my UI" and "this isn't a fucking website". Every spend is accounted for. `unreported` is gone from `lib/budget.js`.

## [0.142.0] — 2026-10-24

### Added

- `ProjectSettings`, a story's own settings window (khaos.machine stage 3 display plan A6), framed like `SettingsWindow`, with `BudgetPane` as its one pane. K, 2026-10-24: "nothing project level should go into app settings". Catalog group "Project Settings window"; `BudgetPane` moves there.

### Removed

- `SettingsWindow`'s `budget` snippet (0.140.0). A story's budget is project-level and belongs in `ProjectSettings`, not the app-wide Settings window.

### Fixed

- `Settings` no longer scrolls the whole window as well as the pane. Its pane scroller is now the containing block for positioned content, so a visually hidden label (ProviderSetup's tile status) can't escape it and stretch the document. Measured in khaos-app Settings: the document was 1103px in a 589px window, and is 589px with this rule.

## [0.141.0] — 2026-10-24

### Changed

- `BudgetPane` heads with the story's title alone. Settings already titles the pane "Budget", and a pane repeating its frame's title reads as a double header (operator, 2026-09-30).

## [0.140.0] — 2026-10-24

### Added

- `SettingsWindow` takes a `budget` snippet, drawn on the Budget pane like Providers and Models (khaos.machine stage 3 display plan A6.7).
- `BudgetPane` starts a story with no budget from the engine's suggestion (`budget.suggested`; K: "Engine-suggested"), says so, and offers Save for it unchanged. With no suggestion it says paid AI work waits until a budget is saved.

## [0.139.0] — 2026-10-24

### Added

- `BudgetPane`, Settings › Budget (khaos.machine stage 3 display plan K6): one story's call limits per medium and its spending limit in dollars, which every budget carries. Each field shows what is used (and what is left, when served) and its own error once edited. Save sends every limit with the dollars, and is offered only for a valid change. A refused, failed or unread budget is shown with the engine's message; with no story open the pane says so. `lib/budget.js` now holds the budget wording the status bar and the pane share.
- `StatusBar` shows the story budget (khaos.machine stage 3 display plan K5): `budget` and `onchangebudget`, passed through by `Shell`. One item gives the spend per medium and takes the warning tone when a medium has none left. It opens a panel with each medium's use (and what is left, when served), the dollars spent (against a dollar limit, when set), the calls that reported no cost, what the budget doesn't count yet, and "Change budget…" or "Set budget…". The panel is Ark UI's Popover, adopted. The catalog captures b4p's budget (`project-budget.json`).

### Changed

- `StoryOverview` takes one-click run actions (khaos.machine stage 3 display plan K3.3b-K3.5b): `runs` per section, `onrun(pass)` and `onsetbudget()`. A paid pass shows its call count, and what is left of the story budget when the host passes it; no dialog or checkbox is drawn, since the story budget bounds paid runs. Each section draws its offer, the needs-budget and budget-reached states, running, blocked, failed (offered again), and a done line per provider entry, never summed.

## [0.138.0] — 2026-10-24

### Added

- A figure in the previs read (`ShotFigureModel`) takes an optional `tint`, its identity colour as sRGB hex. `ShotPrevis` multiplies each part's colour as built by it, per figure instance, so two figures of one build key can carry different tints. A multiply, never a replace, keeps the parts' lightness steps that show which way the figure faces (ruling of 2026-10-24). With no tint, a figure shows as built. The catalog's ShotPrevis gains "Two figures of one build key, tinted apart".

### Changed

- `ShotPrevis` draws khaos-previs-kit v0.8.0's skinned human (B-U1d).
  - Two figures of one build key now stand apart. A second use is cloned with three.js's `SkeletonUtils.clone`, so its meshes draw on its own bones; a plain clone drew them on the first figure's, in the first figure's place.
  - A figure keeps the materials its `.glb` carries, so the kit's part tints and chest mark show. The place and objects stay matte.
  - The shot conformance fixture is refreshed from kit v0.8.0: `shot.json`, `projection.json` and a rebuilt `rover.glb`. `place.glb` and `crate.glb` rebuilt byte-identical. The head joint is now the bone `Nose`, and the figure's parts are `FIG_<id>_BodyFront`, `BodyBack`, `HeadFront`, `HeadBack`, `HeadLeft`, `HeadRight`, `Eyes` and `MarkChest*`.

## [0.137.0] — 2026-10-24

### Added

- `ReadingReadiness` shows whether a reading can start (closes #471). It takes `readiness` (`loading`, `loaded` with the engine's `{scenes, totals, voices}`, `failed`, or `unserved`), `sceneId`, `advanced` and `onLockVoice`.
  - The inspected scene reads "Ready to read. 7 lines: 7 new with your hosted voices." Advanced adds " · 0 new on this Mac · 0 already made".
  - A refused scene gets an error `OutcomeBanner`, "This scene can't be read yet.", with the engine's refusal verbatim.
  - "All scenes", collapsed, gives the totals and the refused count. It lists only the voices that are unlocked or unavailable, with "Lock voice…" for an unlocked one, or says "All 28 voices are ready."
  - Loading reads "Checking this story's voices…". Failed reads "Khaos couldn't check whether this scene is ready to read." `unserved` draws nothing.
  - The catalog's data is b4p's answer, captured by `fetch-kspd.sh`.

## [0.136.0] — 2026-10-24

### Added

- `PlaceSide` lists how a place appears: `states` (`{key, label, sceneNumbers}`, the engine's place states), `state`, `stateError` and `onstate`. A place with more than one state gets a "How it appears" section, drawn from `InspectorSection` and `RadioChoiceList` in the engine's order. Each row is captioned "Scene 19" or "Scenes 20, 27, 29". Choosing a row asks `onstate` and changes nothing itself. With `stateError`, the section says "This version of the place couldn't be read." with the engine's message, and keeps its rows.
- `SubjectDesign` gains `caption`, which names the version shown under the design. `PlaceSide` passes the shown state's label to it.
- `PlaceAppearanceWorkbench` gains `stateLabel`, named in its header as "PLACE STUDY · Interior · Day".
- `PlaceAreas` draws the areas the engine's place builder prepares (`read`: loading, failed, or loaded with `areas`). Each area gets one `InspectorSection`, in the engine's order, headed by its name and citation count. Sections start open with three or fewer areas and collapsed with more. The brief comes first as rows: Space, Fixed features, Dressing, Lighting, and "Still open" when the engine lists unknowns. Below it, "From the screenplay" groups the cited lines by field in that same order, with "Scene 20" or "Scenes 20, 22" when a citation carries `sceneNumbers`. Empty copy is "No separate areas were found for this place." and "No screenplay lines are cited for this area." The types `PlaceArea`, `AreaCitation` and `PlaceAreasRead` live in `lib/places.js`.
- `PlaceDetail` gains an Areas view and an `areas` prop. Choosing it reports `onview('areas')`.
- `StoryOverview` draws the story-wide analyses as one document: the premise, the Shape section with its turning points, and coverage. Each section takes its own read (`loading`, `missing` with an optional reason, `failed`, or `loaded`), so one failing never blanks the others.
  - Labels come from closed maps in `lib/story-overview.js`: the structure outcome, the coverage verdict, incomplete sections and production flags. A value outside a map fails its section. An unlabelled production flag fails only Production.
  - Source pills read "AI" (with the confidence in Advanced) or "Counted". Lens scores and coverage warnings show under "Show details" in Advanced.
  - It has no run actions yet.
- `StoryOverviewOutline` (table pane) lists the Overview's sections with a "Ready", "Missing" or "Couldn't read" pill each. Choosing a row reports `onjump`.
- `StoryOverviewSide` (inspector pane) shows the selected turning point with "Show in Scenes" (`onRevealScene`), or the selected coverage character's importance, arc, strengths and concerns.

## [0.135.0] — 2026-10-24

### Added

- `ShotPrevis` gains `onload: (names: string[]) => void`, default a no-op, reporting every node name in the scene's place, figure and object models once the viewer is made, as `PlaceViewer`'s `onload` does (#470). It reports once per loaded scene; a cut does not report again. `Composer`'s `previs` prop carries `onload` and passes it to `ShotPrevis` by name.

## [0.134.0] — 2026-10-23

### Changed

- **Breaking:** `Composer`'s stage gains `view: 'previs' | 'rendered'`, defaulting to `previs` (shot-kit plan B-U1c, frame §7.4). `previs` draws `ShotPrevis` from the new `previs` prop, passed to it by name. `rendered` is today's stage, unchanged: `ShotPreview` from `stage`, held by a snapshot written before `view` existed. A host that passes only `stage` now passes `view: 'rendered'` to keep its frames. The `part` enum is unchanged, and the `planning` part is untouched, held by a snapshot of its own.

### Added

- `VoiceBrief`: what a voice is designed from, as khaosd's voice brief serves it: what the script says, what the analysis suggests beyond it (kept apart), lines to audition, and what the narrator's story doesn't give. `CharacterSide` takes it as `voiceBrief` and shows it under the voice picker, for a character and for the narrator. `Voices` draws its studio brief through it, so the two cannot drift.
- `ShotPrevis`: the Composer's 3D previs of one shot (shot-kit plan B-U1a, shot-kit frame §7). It shows the place's `.glb` with each figure's and each floor object's `.glb` placed by the blocking's rigid transforms, each door leaf's `FIX_<leaf>_Hinge` turned to the shot's swing, and the shot camera built from its numbers and letterboxed to the blocking's frame. Models arrive as bytes, once per scene (`place`, `figures` by build key, `objects` by object definition id), and are parsed with `parseAsync`; a cut changes only the camera and transforms, with no parse and no fetch (M-B3: the per-scene loader). A shot that is not `blocked` draws a plain state with readiness's reasons. The camera orbits about its target (drag), dollies (Shift-drag) and scrubs its lens, and `oncamera` reports the whole camera once, on release. three.js loads by dynamic import through `lib/shot-scene.js` (D94).
- `ShotPlan`: the plan of one shot (shot-kit plan B-U1b, shot-kit frame §7.3). It draws the place as `PlacePlan` does, with the shot's door swings and without the place's own cameras. Over the place it draws each figure as a puck with a facing handle, each floor prop as its footprint, and the shot camera as a lens cone. Dragging a puck moves its figure and dragging the handle turns it, live. Arrow keys do the same, in 0.1 m and 5 degree steps. `onfigure` reports the whole figure once, on release. Its `inspector` part holds the selected figure's pose picker, with RFC 0115's seven poses. `lib/shot-plan.js` holds the facing convention (front −y at 0, counter-clockwise), prop footprints and pointer mapping. Against the kit's conformance shot, the puck is within 1 cm of the blocking and the handle within 1 degree of the kit's own facing.
- `PlacePlan` takes a `children` snippet, drawn over the place in the definition's frame. `lib/place-plan.js` exports `lensCone`, which `planOf` now uses.
- `lib/place-plan.js` exports `hingeYaw`, a door leaf's yaw at a given swing, which the previs uses for the shot's doors.
- The catalog carries the kit's shot conformance fixture from khaos-previs-kit v0.7.0, with the kit's own place, figure and object `.glb` of it. The head joint and the object corner project within 1 px of the kit's. The D94 eager-path test now covers the barrel and `ShotPrevis` as well as `PlaceReview`, and follows re-exports.

## [0.133.0] — 2026-10-23

### Changed

- **Breaking:** `PlaceViewer`'s `src: string` is replaced by `model: Uint8Array | null`, the `.glb`'s bytes, and `PlaceReview`'s `modelUrl` by `model`. `lib/place-scene.js` parses the bytes with `GLTFLoader.parseAsync` in place of `loadAsync`, so the kit makes no request for the model and needs no URL. The host reads khaosd's `model.glb` over its own byte transport and passes the bytes in (place viewer rulings, Gap 5). A test spies on `fetch` and on `GLTFLoader`'s `load` and `loadAsync` while the conformance `.glb` loads from bytes, including from a view at an offset into a larger buffer.
- **Breaking:** `PlaceReview`'s `sheetPanels: Record<string, string>` is replaced by `sheet: string`, the whole design sheet's image URL. The sheet is drawn once, uncropped, with each sheet panel camera's line art beside it, labelled with its panel number; a panel is named by its number, not by a crop (place viewer rulings, Gap 1). With no sheet it says "No sheet image."
- PNG props stay URL strings. Khaos App passes `blob:` object URLs.

### Added

- `PlaceReview` takes `onload: (names: string[]) => void` and passes it to `PlaceViewer` by name, so the app hears the loaded model's node names (place viewer rulings, Gap 4).

## [0.132.0] — 2026-10-23

### Added

- `PlaceReview`: the presentational half of Khaos App's place review screen (place-build plan V-A, viewer frame §5 and §6). It composes `PlaceViewer` and `PlacePlan`, and shows each sheet panel camera's line art beside its sheet panel with the agent's panel check. Beside them sit the review (state, notes, Mark as reviewed, Reject) and the operator's edit draft (the selected element's numbers, Save edits, Discard). It also shows the 409 conflict notice with Reload, for a stale parent or a running Build, and Open in Blender, offered only when `blenderAvailable` is true. It covers loading, error and empty states. On Basic it shows only "Building places needs Advanced." It fetches nothing: the app's binder passes khaosd's place definition routes' data in and acts on the intents reported back. three.js reaches it only through `PlaceViewer`'s lazy import (D94), and a test walks its static import graph to hold that.

## [0.131.0] — 2026-10-23

### Added

- `PlacePlan`: the top-down plan of a place definition, drawn as SVG from the definition's own numbers. It shows rooms, openings, each door leaf's swing, fixture footprints and each camera's lens cone. Each element is selectable by click or keyboard (place-build plan V-U).
- `PlaceViewer`: the kit's built `.glb` of a place, seen through one of the definition's cameras. The vertical field of view is `2·atan(18 / (lensMm · aspect))`, and the view is letterboxed to the guides' aspect with a passepartout. A click reports the room or fixture under it. three.js **0.186.1** (pinned exactly, no wrapper) loads by dynamic import from `lib/place-scene.js`, so it stays out of a host's first chunk.
- The kit's conformance place, copied from `khaos-previs-kit` v0.4.0, with the kit's `.glb` of it, in `apps/catalog/src/data/place-conformance/`. Every `PlacePlan` footprint is held to within 1 cm of the kit's build report. `PlaceViewer`'s projection of the fixture corner is held to within 1 px of Blender's.

## [0.130.0] — 2026-10-23

### Removed

- **Breaking:** `Launcher`, `Readiness`, `RequirementList`, `Dashboard`, `SceneList`, `SceneRow` and `CharacterList`, which Khaos App no longer renders (catalog app-coverage plan, K-final). Their survivors: `LauncherWindow` and `WelcomeWindow` with `EngineDetails`, `ProjectWindow`, `Shell`, `SceneTable` and `CharacterTable`. The `Scene` and `Requirement` types went with them. The catalog's first-run flow is now Splash → LauncherWindow → Shell, cited from Khaos App's source, and the Composed demo's scene list is a `SceneTable` bound to the khaosd scene rows.

### Fixed

- `DataTable` threw `each_key_duplicate` on rows whose ids repeat, including the empty id a Go producer sends for a missing one: every story table aborted its render. A repeated key now takes an occurrence suffix. With empty ids every row also read as selected; an empty `selected` now selects nothing.
- A disabled action in `WelcomeWindow`'s rail says why on hover ("Not available in this app"), as the launcher's rail did.
- An `EngineDetails` update verdict no longer wraps mid-phrase or shrinks (#149, lost in the move from the launcher's plate).

### Added

- `Shell`, Khaos App's data-layer window frame (catalog app-coverage plan, T8): the toolbar row, the docked panes with the source list, the status bar and the command palette, with the atlas, player, screenplay and subject builders layered over the data. Every pane, layer and dialog is the host's own view, passed as a snippet. Its catalog fixture shows one example per destination, each pane its own captured fixture.

### Fixed

- The shipped declarations kept `null` only where a type was written out: one typed by reference (`ComponentProps<typeof StatusBar>['result']`) lost it, so a consumer passing `null` was refused. Declarations are now emitted under strict null checks and exact optional property types. One existing declaration changes, `lib/compose`, where it is inferred: a defaulted field reads `T | undefined`, and a member an inferred union leaves out reads `never` rather than `undefined`.

## [0.128.0] — 2026-10-23

### Added

- `StaleSheet` and `ProjectStatusHUD`, from Khaos App's data-layer window (catalog app-coverage plan, T8): the sheet a refused analysis opens, with View stale scenes and Resolve…, and the window's status bar while it is active and has something to show. Which fixes are offered is the host's.

## [0.127.0] — 2026-10-23

### Added

- `LauncherWindow`, Khaos App's launcher (catalog app-coverage plan, T9): the banners for khaosd unreachable, a setup step to finish and what readiness lacks; the startup screen until the first check settles; the status bar; and the open-from-Git and refusal sheets. The host draws `WelcomeWindow` and its own confirmations as snippets, with their props by name.
- The catalog's `FixtureView` renders a `welcome` snippet.

### Fixed

- In the moved `LauncherWindow`: the banners and the hint read `--body-sm-size`, which no theme defines (0.875rem drew); they read `--body-md-size`, 1px smaller. The window sized the welcome window by reaching into its private `.welcome` class; it now wraps it in its own region, which gives it the height to fill.

## [0.126.0] — 2026-10-22

### Added

- `ProjectWindow`, Khaos App's project window (catalog app-coverage plan, T9): the project's totals, a category control that hands each section to the data-layer window, and Story Player and Activity. The host passes the totals and the categories in its order, and the project's history as a snippet.
- The catalog's `FixtureView` renders a `history` snippet.

### Fixed

- In the moved `ProjectWindow`, two names no theme defines: the title read `--display-sm-size` (its 1.35rem fallback drew) and the buttons `--body-sm-size` (0.875rem drew). The title now reads `--heading-md-size`, as every other window title does, so it is smaller; the buttons read `--label-md-size`, 1px smaller.
- In the moved `ProjectWindow`, Story Player sat mid-window: both buttons pushed with `margin-left: auto`, which splits the free space between them. The title takes the space now, so the two sit together at the end.

## [0.125.0] — 2026-10-22

### Changed

- `Voices` takes the studio and Sound as snippets, `voiceStudio` and `sound`: the host renders `VoiceStudio` and `SoundStudio` with their props by name. 0.124.0 took each studio's props as one computed object and spread it into the component; that hid what the studios take, and in Khaos App a hosted provider choice stopped reaching the studio. `studio` now carries only what the pane shows around the studio.
- The catalog's `FixtureView` renders a `voiceStudio` snippet.

## [0.124.0] — 2026-10-22

### Added

- `Voices`, Khaos App's Voice Manager window (catalog app-coverage plan, T9): Speak a line, Your voices, the voice studio (local, hosted and lock mode, and the for-a-character brief) and Sound, behind one sidebar, with the provider-voice and change-the-take confirmations. Which pane is open and which voices are chosen are the host's, because the host opens panes too; the studios are `VoiceStudio` and `SoundStudio` with the props the host computes.

### Fixed

- In the moved `Voices`: a voice's name read `--data-lg-size`, which no theme defines, before falling back to `--data-md-size`; it names `--data-md-size`, which is what drew.

## [0.123.0] — 2026-10-22

### Added

- `SettingsWindow`, Khaos App's Settings window (catalog app-coverage plan, T9), on the kit's `Settings` frame: Providers' path and configurations, Routing, On-device Engines, Engine and General, and the three confirmations. The host passes rows and words, and draws Providers and Models as snippets; every read and save stays with the host.

### Fixed

- A routing error read `--status-danger`, which no theme defines, so it was never red; it reads `--tone-danger`.
- `Setup` and `SettingsWindow` named `--border-subtle`, which no theme defines, before falling back to `--border-default`; they name `--border-default`, which is what drew.

## [0.122.0] — 2026-10-22

### Added

- `Setup`, Khaos App's Setup window (catalog app-coverage plan, T9): the simple checklist, the onboarding steps where the engine serves an inference preference, and the install confirmation. The host passes rows and words and draws the connect step as a snippet; every read, decision and install stays with the host.

## [0.121.0] — 2026-10-22

### Added

- Khaos App's provider views (catalog app-coverage plan, T9, second batch): `ProviderSetup`, the Providers pane with its connect sheet, and `SetupConnect`, Setup's "Connect what you need" step. Each takes plain props and hands each step or row back to the host unchanged; the host's models keep every read and write.
- `lib/providers.js` (`providerConnectionLabel`, `providerConnectionTone`, `providerRowStatus`), moved from Khaos App with its test.

### Changed

- `ProviderSetup`'s sheet is open exactly while the host holds a `selectedProviderId`; closing it calls `onDismiss`, which clears the selection. In the app it was private state set by a click, so the catalog could never show the key form, the sign-in or the disclosure.

### Fixed

- In the moved `SetupConnect`: at narrow widths the feature name's column collapsed to nothing and the provider drew over it ("Voices" under "ElevenLabs"), and the action buttons broke their labels across two lines. The name keeps its width, the provider list wraps to its widest name, and the buttons wrap whole.

## [0.120.0] — 2026-10-22

### Added

- Khaos App's smaller windows (catalog app-coverage plan, T9, first batch): `Splash`, `VoiceRow`, `Activity`, `Resources`, `ProblemReport`, `ProjectHistory` and `ModelsPane`. Each takes plain props and reports what the person does; the host's models keep every read and write.
- `lib/models.js` (the model table's rows, groups, folder and size), `lib/resources.js` (the registry's kind order, counts and headings), `lib/project-history.js` (the history's line, times and confirmation wording) and `lib/activity.js` (`logEvents`), moved from Khaos App with their tests.

### Fixed

- In the moved views: the activity title and a checkpoint's time read `--display-sm-size` and `--text-tertiary`. The first is not a kit token (its fallback always applied); the second fails contrast. They read `--heading-md-size` and `--text-secondary`. A model's download error read `--status-danger`, and the table's rules `--border-subtle`, neither defined, so errors were never red; they read `--tone-danger` and `--border-hairline`.

## [0.119.0] — 2026-10-22

### Added

- Khaos App's story player window, `StoryPlayback` (catalog app-coverage plan, T7): the scene navigator, the stage (the scene's cast and the line under the playhead, or the host's Composer shot as the `monitor` snippet), focus mode with its transport, and the Composer's frame behind everything. The inspector's content, the timeline and the text preview are the host's, bound to its models, as `inspector`, `timeline` and `preview` snippets; focus mode is the host's state, so its Escape can leave focus before it drops the selection.

## [0.118.0] — 2026-10-22

### Added

- Khaos App's text-preview `Player` and its `Composer` (catalog app-coverage plan, T7). `Player` is the three-pane editor over the kit's `StoryPlayer`, taking the timeline `buildTimeline` builds and the host's playhead, selection and scene text; `Composer` lays out one part of the shot workspace (stage, planning, scene, tools) and takes each child's props whole from the host.

### Fixed

- In `Player`, below 900px the rails stacked over a stage row of `minmax(0, 1fr)`, so the stage — the beat being played — collapsed to 2px; its row keeps a 160px floor. The idle hint read `--text-tertiary`, which fails contrast; it reads `--text-secondary`.

## [0.117.0] — 2026-10-22

### Added

- Khaos App's Story Atlas (catalog app-coverage plan, T7): `StoryAtlas` and its Pixi canvas, `StoryAtlasCanvas`, with the layouts and drawing in `lib/atlas/`. Both load Pixi, so neither is in the barrel: import them from `components/svelte/story-atlas.js`, lazily, to keep Pixi out of a first chunk. `pixi.js` 8.22.0 and `pixi-viewport` 6.0.3 are now dependencies. A connection selected in the atlas is shown by `StoryAtlasRelationship`.

### Changed

- `StoryAtlasToolbar` names its location lens "Places", as Khaos App does, and draws Recenter only when the host passes `onRecenter`, for a host whose canvas has its own.

### Fixed

- `check-catalog` matched exports and fixtures by their exact spacing, so it never saw `PlaceAppearanceWorkbench` and `ObjectAppearanceWorkbench`, which are written without spaces; it reads either spacing now.

## [0.116.0] — 2026-10-22

### Added

- Khaos App's Review destination (catalog app-coverage plan, T6): `ReviewQueue`, `ReviewOccurrences`, `ReviewSide`, `ExtractionReview` and `ReviewSuggestions`. What a record offers for the person's choice, and the decision each verdict or suggestion sends, stay the host's: `ExtractionReview` takes `answers` and `decisionsFor` and reports the decision back through `ondecide` and `oncreate`; `ReviewSuggestions` takes the host's offers; `ReviewSide` takes the answer pane as an `answer` snippet.
- `lib/review.js`: the pending records as khaosd serves them, typed, and how Review names them (`reviewTitle`, `reviewPhrase`, `endpointName`, `characterNamed`, `namesACharacter`, `referentKindCopy`, `referentChoices`, `groupNote`), moved from Khaos App.

## [0.115.0] — 2026-10-22

### Added

- `AudioDetail` draws a recording assembled from other takes (KSPD v0.106.0, RFC 0112 §3.4): its Media section says how many takes it was assembled from and names no provider. `RecordingMedia` in `lib/recordings.js` types both shapes; `takesLabel` counts the takes.

## [0.114.0] — 2026-10-21

### Added

- Khaos App's Images and Audio destinations (catalog app-coverage plan, T5): `ImageTable`, `ImageDetail` and `ImageSide`; `AudioTable`, `AudioDetail`, `AudioSide` and `RefusedTakes`. The tables ask the host for a row's thumbnail or waveform peaks once its cell renders, so only the rows in view are fetched; a scene read's timeline and a followed line are the host's, as `read` and `line` snippets.
- `lib/bytes.js` (`formatBytes`, the one byte formatter Khaos App now shares with the kit), `lib/images.js` (`imageRows`, `formatName`), `linesLabel`, `recordingText` and `refusalText` in `lib/recordings.js`, and `peaksSeconds` in `lib/waveform.js`, moved from Khaos App.

### Fixed

- In the moved views, spacing read `--space-2` and `--space-3`, and a type size read `--body-sm-size`: none is a kit token, so a hard-coded fallback always applied. They use the kit's own steps now.

## [0.113.0] — 2026-10-21

### Added

- Khaos App's Places and Objects destinations (catalog app-coverage plan, T4): `PlaceTable` and `ObjectTable` take khaosd's rows; `PlaceAnalysis` takes the analysis record khaosd serves on a place's detail; `LocationHeadings` takes the project's headings and reports a confirmed split or keep-apart; `PlaceDetail` and `ObjectDetail` compose their views and report the one chosen, so the host reads headings and images only when they open; `PlaceSide` and `ObjectSide` take the host's identity section as an `identity` snippet.
- `SubjectDesign`, the design panel at the head of the Places and Objects inspectors, which Khaos App drew twice.
- `lib/places.js` (place and object rows, a place's cast, its headings) and `lib/place-analysis.js`, moved from Khaos App; `frequencyBars` in `lib/characters.js`, which `coAppearanceBars` and the place cast share. `DesignState` in `lib/types.js`.

### Changed

- `LocationHeadings` uses the kit's `Button` for Split and "These are different places", where Khaos App drew native buttons while the kit had none (#237, closed).

## [0.112.0] — 2026-10-21

### Added

- Khaos App's Scenes destination (catalog app-coverage plan, T3): `SceneTable` takes khaosd's scene rows, each scene's analysis standing and the read counts the host holds newer than the rows; `SceneAnalysis` takes the analysis record khaosd serves on a scene's detail; `SceneDetail` composes the screenplay, analysis and read views, taking the host's read timeline as a `read` snippet and opening it when a read does; `SceneSide` composes the scene's identity, reads, who speaks and who is present, taking the host's line inspector and reads as `line` and `reads` snippets.
- `lib/scenes.js` (the table rows, the scene text, a scene's accounts and who speaks in it) and `lib/scene-analysis.js` (an analysis read into what the view shows, and a suggestion in words), moved from Khaos App. `SceneStanding` in `lib/types.js`.

## [0.111.1] — 2026-10-21

### Fixed

- `CharacterDetail` takes an undefined `standing` and `onBuildAppearance`, and `CharacterSide` an undefined `dialogue`, so Khaos App can pass what its models hold under `exactOptionalPropertyTypes` without converting it.

## [0.111.0] — 2026-10-21

### Added

- Four of Khaos App's Characters panes, with their markup and styles unchanged (catalog app-coverage plan, T2): `CharacterAnalysis` takes the analysis record khaosd serves on a character's detail; `CharacterRecordings` and `CharacterMentions` take a read of the character's recordings and mention wordings; `CharacterAliases` takes the character's row and reports an alias added, removed or rejected, and a move or leave of the mentions a removed alias stranded.
- `lib/character-analysis.js` and `lib/analysis-labels.js` read a Stage 2 analysis into what the view shows, with its scene labels as the script's numbers; `lib/character-aliases.js` groups a character's names by who asserted them; `lib/recordings.js` groups and names recordings. All moved from Khaos App.
- The rest of the Characters destination: `CharacterTable` takes khaosd's character rows, the cast, and per-character voice readiness, analysis standing and appearance; `CharacterDetail` composes the lines, scenes, analysis, images and recordings views and reports the view chosen so the host can read what it shows only when it opens; `CharacterSide` composes Identity, Casting, Aliases, Mentions and Appears with, taking the host's dialogue inspector as a `dialogue` snippet. `lib/characters.js` holds their projections, moved from Khaos App: the table rows, Identity rows, the Voice pop-up's choices, a line's position, the analysis mark, appearance labels and co-appearance bars.
- The Characters reads (`SubjectImagesRead`, `RecordingsRead`, `MentionsRead`) and the alias correction types (`Stranded`, `BoundMention`, `BindTarget`) are exported from `lib/types.js`, so the composites' published declarations resolve them.

### Fixed

- The kit compiles without warnings. `VoiceClonePanel`, `VoiceDesignPanel`, `DialogueComposer` and `Dock` say that their drafts are seeded once from props (`untrack`), as `VoiceStudio` already did; `SelectableRow` gives a `div` row no click handler at all; `DataTable` records that its grid owns the keyboard; `VoiceDesignPanel` records why lock mode focuses the line; and `ProjectCard` drops a style rule no element used.

## [0.110.1] — 2026-10-21

### Fixed

- The T1 panes take records in the shape khaosd serves, so Khaos App can pass its own without converting them. An event's `text` and a speaker may be absent, a reading's `stale` may be null, an analysis's standing may be undefined, and a voice a refusal names may have no name (`PlaybackEventInspector`, `LineInspector`, `AnalysisStale`, `DialogueInspector`).

## [0.110.0] — 2026-10-21

### Added

- Nine of Khaos App's shared panes, so the catalog can show them: `AnalysisStale`, `FinishSetupConfirm`, `GenerationFailureDetails`, `ImageThumb`, `PlaybackEventInspector`, `ProviderDisclosure`, `QuitPrompt`, `RefusalOffer` and `SubjectImages`. Each takes plain values and reports intent; the app keeps its models and binds them.
- Five more of Khaos App's panes: `DialogueInspector`, `IdentitySide`, `LineInspector`, `ReadTimeline` and `SceneReads`. As with the first nine, the app keeps its models and binds them. `LineInspector` renders a dialogue line through a `dialogue` snippet the host supplies. `SceneReads` and `IdentitySide` confirm destructive steps themselves and report only a confirmed one.
- `Refusal` and `RefusalFix` in `lib/types.js`, shared by `RefusalOffer`, `DialogueInspector` and `SceneReads`.

### Removed

- `lib/voice-audio.svelte.js`, the shared voice player, which nothing uses since 0.109.0.

## [0.109.0] — 2026-10-21

### Removed

- **Breaking:** 17 exports Khaos App no longer renders, and nothing else in the workspace imports: `AnalysisCard`, `CharacterBuilder`, `CharacterInspector`, `CharacterWorkspace`, `DialogueList`, `DialogueRow`, `LocationInspector`, `LocationList`, `LocationWorkspace`, `PacingChart`, `RelationshipGraph`, `SceneInspector`, `SceneWorkspace`, `SegmentTimeline`, `StoryGraph`, `VoiceCatalog` and `VoiceProfileCard`. The app replaced them with its data-layer window, the welcome window and its own Voice Manager. Their catalog fixtures go with them.
- `lib/graph.js`, `lib/series.js` and `lib/voice-availability.js`, which only those components used.

### Fixed

- `ComposerExportDialog`, `SceneShotPlanner`, `ShotInspector`, `ShotPreview` and the artwork workspace inside the appearance workbenches now collapse in the catalog's device frame as they do in a narrow window. Each width rule had no matching `@container viewport` rule, and the check that requires one never found them because they were written on one line.
- `ShotPreview` sizes and positions its own box instead of filling the nearest positioned ancestor. Without one it covered the whole window and blocked the catalog's navigation.
- `ageBucket` places a stated age (`15`, `36`, `60`) by its number. The engine now sends what the script states instead of decade bands, and a bare number fell to the `adult` default by accident.
- The catalog's capture script works again against current khaosd. It reads characters, locations and scenes from `/api/v1/dashboard/*` instead of the retired `khaos-tools parser query`, takes dialogue from each scene's detail, maps the engine's current analysis model (a field with no counterpart stays empty), keeps the committed coverage capture when the project has none, and defaults to `~/khaos/projects/broken-in-4-places.kspd`. A duplicate `write_json` that crashed the run is gone. The captured data is refreshed from Broken in 4 Places (#83, #123).

## [0.108.0] — 2026-10-21

### Changed

- **Breaking:** `SceneShotPlanner`'s scene-frame dialog lists, counts and asks consent for the host's `frameQueue` (`{ missing, all }`) instead of filtering `coverage` itself. `ongeneratescene` is now `(mode, shotIds)`, passing the ids the dialog listed. While `frameQueue` is `null`, Generate stays disabled and the dialog says it is checking which shots need frames (#415).

## [0.107.1] — 2026-10-21

### Fixed

- Retain shot thumbnails during reading-timing review and keep proposed ranges read-only until applied.
- Open project reference selection as a window-level asset browser with a large, uncropped preview and compact searchable rows.
- Move between a scene’s shots inside frame review without closing the dialog; keep unsaved edits and pending actions protected.

## [0.107.0] — 2026-10-21

### Added

- A story-bound Screenplay editor with title-page fields, scene outline, action/dialogue editing, draft undo/redo, save feedback and discard confirmation.
- Catalog coverage for editing, saving and failure states, with captured story data.

## [0.106.0] — 2026-10-21

### Added

- Storyboard PDF, grayscale PNG-page and original-frame options in Composer export.
- Visual-only export guidance and shot counts, without video-rate or reading controls.

## [0.105.0] — 2026-10-20

### Added

- Composer export dialog with scene selection, editable NLE targets, media export,
  progress, cancellation and retained results.
- Explicit review of proposed single-track timing repairs.

### Changed

- Picture clips use square cut boundaries and height-fitted, repeating filmstrip
  thumbnails, with distinct playback activity and intentional selection.
- Composer shot properties use compact desktop controls.


## [0.104.0] — 2026-10-20

### Added

- In-dialog place suggestion feedback, revision, alternative and discard controls,
  without replacing the authored draft until explicit application.
- Reviewable place-direction refinement and scene-cited story context, with explicit
  application to an editable draft and separate analysed area selection.
- Immersive Places and Objects artwork builders with shared reference selection,
  revision controls and media-first review.
- Scene properties, current-design references and frame generation queue controls
  in Composer, keeping selected shots distinct from playback activity.

### Fixed

- Keep fresh artwork and revisions visible beside their authored direction.
- Show available reference inputs before generation and constrain artwork HUDs.


## [0.103.0] — 2026-10-19

### Added

- Separate skin/body covering controls from hair texture, with body-color swatches
  and direct editing from the appearance HUD.
- Distinct hairstyle diagrams for mohawks, spikes, fades and asymmetric cuts.

### Fixed

- Keep mohawks visible when their sides are shaved.
- Clarify that skin/covering colors apply to the body, while clothing is directed
  separately in Wardrobe and details.

## [0.102.0] — 2026-10-19

### Added

- Character appearance workbench with contained artwork, persistent design
  tools, reference upload/roles, local proposal pickers and a compact selections HUD.
- Explicit gender/presentation, visual body-shape presets and independent build,
  stature and proportion controls; compact named skin/surface color swatches.
- Contextual scene-planning and full-frame review workspaces with revision
  controls, shot context and explicit generation/review/use feedback.
- Desktop tool buttons, contextual toolbar content and selected-item timeline actions.

### Fixed

- Keep playback activity separate from intentional timeline selection, with
  explicit selection and inspector controls supplied by the host.
- Explain unavailable generation and adoption actions without hiding their context.
- Release appearance picker machines safely when their host clears the workspace.

## [0.101.1] — 2026-10-19

### Fixed

- Distinguish timeline playback activity from intentional selection. The active
  event and reading use a fill; only the selected event or keyboard focus gets
  the selection outline. Moving the playhead preserves the selected event.

## [0.101.0] — 2026-10-18

### Added

- Review and edit timed scene coverage with SceneShotPlanner; preview unrendered
  shot direction and the current story event with ShotPreview.
- Add picture-track context actions and inspector controls for inserting,
  splitting and removing shots, plus source-event selection.
- Expose optional voice identity traits and reviewable description generation
  for narrator and standalone voice design.

## [0.100.0] — 2026-10-18

### Added

- Controlled picture clips share StoryPlayer’s timeline scale, scrolling and playhead,
  with move/trim gestures, keyboard editing, cancellation and host-supplied bounds.
- ShotInspector collects authored shot direction and framing, drawing treatment,
  explicit frame review and playback choice, and consent for single-frame generation.
- Hosts may suppress StoryPlayer’s built-in inspector when composing their own pane.


## [0.99.0] — 2026-10-18

### Added

- StoryPlayer transport intents for stop, previous/next scene and beat, and
  beginning/end controls. Hosts may pause/resume audio around pointer scrubbing.
- A wider, keyboard-accessible timeline playhead with arrow and boundary seeking.

### Fixed

- Timeline seeking uses the track’s screen position exactly once after horizontal
  scrolling. Pointer drags continue outside the playhead and stop on release,
  cancellation or blur (khaotik-ui #389).

## [0.98.0] — 2026-10-18

### Added

- Optional host-owned voice-description refinement in Voice Studio, with editable
  drafts, explicit proposal review, regeneration and cancellation on close.
- Candidate creation waits for a pending draft choice. Applying a suggestion
  resets generation charge consent without dispatching a voice request.

## [0.97.0] — 2026-10-17

### Added

- `StoryPlayer` accepts per-scene `waveforms` with explicit loading, ready and
  failed states. The read lane places saved recordings at their scene offsets,
  renders peaks in recording-local time, and supports pointer/keyboard seeking.
- Optional `audioEmphasis` uses neutral event fills, primary foreground waveforms
  and the brand playhead/selection colors for readable light and dark timelines.
- A captured audio-led timeline example and regression tests cover clip offsets,
  seeking, missing media and waveform contrast.

## [0.96.0] — 2026-10-17

### Added

- Adds optional Story Atlas toolbar and relationship inspector components.

## [0.95.0] — 2026-10-16

### Added

- **`WelcomeWindow` can offer Settings.** A new optional `onSettings` rail action renders "Settings…" (the label approved by the operator, 2026-10-16) and is absent, not disabled, when the host gives none. For Khaos App's "Settings everywhere" (first-run fixes K1).

### Fixed

- **`ConfirmDialog` sits above the cards and sheets it confirms over.** Its backdrop and positioner declared no z-index, so a positioned `ProjectCard` (layers at 1–2) painted over the dialog and its scrim. Both are now at 40, above `Sheet` (30). A source-read regression test holds the order.

## [0.94.1] — 2026-10-16

### Fixed

- **Catalog voice auditions play again** (operator ruling 2026-10-16, "Replace
  samples"). The catalog now hosts its own three audition clips in
  `apps/catalog/public/samples/` (female, male and neutral, about 19 KB each,
  made on-device with macOS `say`). `fetch-voices.sh` points each voice at
  the clip for its gender, so the 371 committed voices, the TakeList plate and
  the AudioPlayer plate have playable audio again. `voice-samples.test.js`
  fails if any voice points at a clip that is not committed.

## [0.94.0] — 2026-10-14

### Removed

- **Vokda** (operator ruling 2026-10-16). `isVoiceAvailable` no longer
  treats a ready `vokda` provider as making every voice castable; a voice is
  available only when its own provider is ready. The component docs no longer
  describe the voice catalog as Vokda's. In the catalog app, the committed
  provider status drops `vokda`, the 371 committed voices drop their
  `vokda.iksnae.com` sample URLs (their audition buttons are disabled, and the
  TakeList and AudioPlayer plates that borrowed a voice sample have no audio),
  and `fetch-voices.sh` no longer rewrites Vokda hosts.
- **AgencyX.** `.agencyx/`, the `onboarder` agent, and the AgencyX citations
  in the catalog release script and workflow.

## [0.93.0] — 2026-10-14

### Fixed

- **`SceneReadStatus` says a sentence once.** When a read's `message` (why it
  stopped) and `resume.reason` (why it cannot resume) are the same sentence —
  khaosd serves one for an `ADVANCED_ONLY` stop under Basic — the reason is
  not drawn a second time. Different sentences still both show.

## [0.92.0] — 2026-10-14

### Added

- **`WelcomeWindow`'s Clone action can be absent.** New optional prop
  `clone` (default `true`): `clone: false` removes Clone Repository from the
  rail rather than disabling it, for a host where cloning is not a feature on
  the person's path (khaos-app under Basic). Omitting `onClone` still renders
  it disabled.

## [0.91.0] — 2026-10-14

### Added

- **`ServiceStatusList` carries a per-engine "Start with Khaos" switch**
  (khaos.machine onboarding plan, BA-R11a). New optional prop
  `onStartWithKhaos(service, on)` and row field `start_with_khaos`, which
  khaosd serves on each `/api/services` row. Like `onStart`, the switch
  renders disabled, not absent, without a handler, and is disabled while the
  row's action is pending.

### Changed

- **The "On-device engines" plate can be absent** (BA-R4b). `WelcomeWindow`
  and `EngineDetails` no longer default `services` to `[]`: omit it and the
  section is not drawn; pass `[]` and it reads "No on-device engines" as
  before. A host on a path with no local engines (khaos-app under Basic)
  omits it.

### Fixed

- **`Launcher` forwards `onInitGit` only when it is given** (BA-K1,
  khaotik-ui#57, the `onInitGit` half). It passed a wrapper to every card,
  so every card without a repository offered git-init even when the host
  had no handler.

## [0.90.0] — 2026-10-14

### Added

- **DeepSeek has a provider mark.** `ProviderMark`, `ProviderBadge` and the
  `Launcher` routing plate now draw the DeepSeek whale instead of the
  placeholder, under both `deepseek` (engine and analysis id) and `DeepSeek`
  (catalog title). Source: `assets/providers/deepseek.svg`, the operator's
  vector logo with its background and colour removed so it paints in
  `currentColor`.

## [0.89.1] — 2026-10-14

### Fixed

- **`AudioPlayback` with `peaksError` drew its scrubber 2px tall** (P1-U4,
  found in khaos-app's P1-A6 live pass). In the failed track's column, the
  scrubber's `flex: 1` became a basis of 0 on the vertical axis. It now keeps
  its own height.

## [0.89.0] — 2026-10-14

### Added

- **`StatusBar` result takes `dismiss`.** A result the host can withdraw gets a
  Dismiss button that asks the host, as Undo does. Without it, nothing changes.
  The launcher moves its notices into the bar, and one stayed on screen with
  nothing to clear it (operator, 2026-10-14).
- **`ProjectAnalysis` state `partial`: some analysed, nothing running.** The card
  labels it with what is done (`Scenes analyzed`, `1/53`, neutral tone), and its
  rail segment shows the fraction without the running shimmer. `in-progress` now
  means only that an analysis is running. Before this, a story with one scene of
  53 analysed and no job running read `Analyzing scenes 1/53`
  (Breaking Even, 2026-10-14).

## [0.88.0] — 2026-10-14

### Changed

- **A resting timeline block is marked by its fill, not by fading it**
  (audio browser plan, P1-U4; operator answer to P1-Q6, "Change the dimming").
  - `StoryPlayer` drew a resting block at `opacity: 0.55`, which faded its
    waveform with its fill. No stroke reached 3:1 on a resting block in light
    theme.
  - A resting block is now its kind's tone mixed 60% toward `--text-primary`.
    Hover and the active block take the tone itself, and the active block keeps
    its focus outline. Nothing in a block is drawn below full opacity.
  - The waveform inside a block is drawn in `--surface-raised`. It clears 3:1
    against every block tone, at rest and active, in both themes.
  - Every `StoryPlayer` changes, the composition Player included.

### Added

- **`peaksError` on `AudioPlayback` and on a `TakeList` take** (P1-U4).
  - A failed peaks read is not the take's failure. The player stays and plays.
  - khaosd's message is shown verbatim where the waveform would be, as a
    `role="status"`.
  - No control is added. A `TakeList` row with `peaksError` offers no Try
    again, even when `onRetry` is given. A take's `error` outranks it.

## [0.87.0] — 2026-10-14

### Added

- **`Waveform` draws a recording's peaks** (#352; audio browser plan, P1-U1).
  - It takes the audiowaveform v2 peaks khaosd serves (`peaks`) and a window in
    seconds (`from`, `to`).
  - It draws one min and max per pixel column on a canvas that is `aria-hidden`
    and never focusable.
  - The stroke is `--text-secondary`, read at draw time, so it follows the
    theme. It redraws on resize and theme change, at device pixel ratio.
  - Absent or malformed peaks render a visible `role="status"` "Waveform
    unreadable" and draw nothing.
  - `lib/waveform.js` exports the projection, `peakColumns`, and the shape
    check, `assertPeaks`.
- **`AudioPlayback` and `TakeList` draw waveforms** (#352; P1-U2).
  - `AudioPlayback` takes optional `peaks` and draws a `Waveform` behind its
    scrubber.
  - The range input stays the only scrubber, with the same name, step and
    keys. Without `peaks`, the DOM is unchanged.
  - A `TakeList` take's `peaks` reach its player.
  - `onOpen(id)` adds an "Open in timeline" button to each row, named
    `Open <label> in timeline`. Without `onOpen` there is no button (D80).
- **`StoryPlayer` plays one scene read** (#352; P1-U3).
  - An event carrying `startMs` sits at its segment's start plus `startMs`,
    so the pauses between a read's lines are kept. Events without `startMs`
    keep the cumulative placement.
  - `minScale` and `maxScale` bound the zoom; they default to 2 and 50.
  - Ticks are unchanged at 50 px/s and below. Above that they fall every 5 s
    from 60 px/s, and every 1 s from 200 px/s.
  - Given `peaks`, each measured block draws its stretch of the waveform
    inside its button, after its screen-reader name. The button's name, tab
    order and Enter or Space behaviour are unchanged. Without `peaks`, no
    canvas renders.

## [0.86.0] — 2026-10-13

### Changed

- **Breaking: a project card removes a recent; it never deletes a project**
  (project portability plan, D1). `ProjectCard`'s `onDelete` is now `onRemove`,
  drawn as **Remove from Recents** (`Remove <title> from Recents`) with a
  non-destructive `x` icon instead of `trash`. `Launcher` and `WelcomeWindow`
  forward `onRemoveProject` in place of `onDeleteProject`; the control is
  hidden when the host does not wire it. A person deletes a project in the
  Finder. Rename the prop at the consumer.

## [0.85.0] — 2026-10-13

### Added

- **`Gallery` images can be activated** (#346) — an entry takes an optional `id`, and the
  gallery an optional `onactivate(id)`. With both, the entry is a native button named by its
  caption (or the gallery's `name`), so click, Return and Space reach it and it takes focus.
  Without them the gallery draws exactly as before. `kind` gains `"object"`, which
  `Portrait` already drew as the cube glyph. khaos-app uses it for a subject's images.

## [0.84.0] — 2026-10-13

### Added

- **`DataTable` columns take a `subtitle`** — `(row) => string | null`, a second, quieter
  line under the cell's value for the rows that have one. A row without one draws exactly
  as before. A table with a subtitle column measures its rows as `wrap` does, without
  wrapping its cells, and the filter matches subtitles too. The cell's text holds both
  lines, so the row's accessible name does. khaos-app uses it for an analysed scene: its
  analysis title above its scene heading.

## [0.83.0] — 2026-10-13

### Added

- **`ProjectCard` takes host content below the footer** — `children`. It renders whatever the
  job, above the card's activate overlay so its controls take the click, and outside the
  `aria-hidden` footer so they are announced; without it the card draws no slot. `Launcher`
  and `WelcomeWindow` forward a per-card `detail` snippet, given that card's project.
  khaos-app uses it for a failed extraction's fix and Report a Problem… (#341, #343).

## [0.82.0] — 2026-10-13

### Added

- **`Sheet` takes an optional second action** — `secondaryLabel` and `onsecondary`. It sits
  between Cancel and confirm, calls only `onsecondary`, and is a Tab stop; the focus still
  starts on Cancel. Without `secondaryLabel` the sheet renders exactly as before. khaos-app's
  stale-scenes alert uses it for View stale scenes beside Resolve… (#339).

## [0.81.0] — 2026-10-13

### Added

- **`RadioChoiceList`** — one choice among a few, where each option's caption is part of
  what is being chosen (khaos-app's onboarding step 1, "How do you want to run AI?"). A
  `role="radiogroup"` on Ark UI's Radio Group; each caption is its option's accessible
  description, not `aria-hidden` as `SelectableRow`'s subtitle is; arrow keys move focus
  and ask for the next value, wrapping at the ends; an optional `note` line under the
  group. Controlled like `Checkbox`: a click or an arrow key asks `onchange` and changes
  nothing until the host passes the new `value`.

## [0.80.0] — 2026-10-12

### Fixed

- **`ResourceCatalog` names eval fixtures.** The engine serves an `eval_fixture` kind the
  catalogue had no label or icon for, so its section read "EVAL_FIXTURE". It reads "Eval
  fixtures", with a flask.

### Changed

- **`ResourceCatalog` lists jobs, not files.** By kind, the registry read as three long lists
  of filenames and four versions of one prompt sat side by side with nothing saying which ran.
  The index now lists each job once, by its current prompt, grouped by what it analyses
  (Scenes, Characters, Places, Relationships, Coverage), then report templates, rubrics and
  eval fixtures, then "Not in use". A job's detail shows the prompt, the system message and
  the schema it runs with as tabs, marked Active, and its past versions under "Older
  versions"; a past version reads "Retired version". Every link is the engine's
  (khaos-tools #1120); nothing is inferred from an id. Selection is by id and kind
  (`selectedKind`), and `onSelect` passes a past version (`selectedVersion`), so the host
  fetches the right body. The live capture in the catalog's data was refreshed.
- **`InstallList` is a desktop checklist, not a store.** Design review did not receive the
  App Store list well, and on Setup's eighteen items it spent three screens and eighteen
  colours saying "installed", so a missing required tool did not stand out. Each item is now
  one line: a leading mark that is its state (installed, required and missing, optional and
  missing, not checked, update, installing), the name, what it gives you, its version, and
  the action or finished state on a right edge that is never empty. Colour is spent only on
  what needs you. The identity tile and its letter fallback are gone; a host `icon` draws
  small beside the name.


## [0.79.0] — 2026-10-12

### Fixed

- **`SegmentedControl` shows its selection.** The sliding indicator was 0px wide — the
  primitive hands its width over as `--width` and the stylesheet never used it — and its
  `--surface-raised` fill was invisible on the dark ground, so the selected segment read
  only as bold text. Each segment also drew a one-pixel dot: WebKit paints the clipped
  hidden radio. The indicator now takes the primitive's geometry and a tint that reads in
  both themes, and the hidden input is never painted.
- **`InstallList`'s button says what it does.** It read "Get" for everything, and a person
  new to the app asked what Get would do. It now reads "Install" by default, and an item
  can name its own action with `verb` and `busyVerb` ("Download", "Downloading").
- **`Settings` is a desktop preferences window.** Its pane met the window's top and right
  edges, and its text fell back to the browser's 16px. The pane now has padding on every
  side inside its scroller, a title header with a rule under it (the "Settings" eyebrow
  is gone: the window is already titled Settings), the kit's 13px body size for
  everything the host puts in it, and a source-list rail with 28px rows.
- **`SceneReadApproval` reads a long scene.** It listed every planned line in one
  unbounded block, so a 41-line scene pushed Approve out of the dialog. It now
  shows one row per voice (voice, engine, new and reused counts, billed voices
  first), keeps every line behind a collapsed "All N lines" list, and scrolls its
  body between a fixed summary and a fixed footer, so Approve is always in view.
- **A `Checkbox` its host ticked was drawn unticked.** It cancelled the click and asked the
  host for the new value; the browser undoes a cancelled checkbox click after the click's
  handlers run, so the host's tick was drawn and then reverted, and the box showed empty
  while the host held it checked. It now reports the change and puts the box back to the
  host's value, and the host's answer draws the new one.
- **Native controls were drawn in their light style on dark surfaces.** `tokens/utilities.css`
  declares `color-scheme`: dark by default and light under `html[data-theme="light"]`, so a
  checkbox, a select's menu and a scrollbar follow the theme.

## [0.78.0] — 2026-10-12

### Added

- **`VoiceStudio` takes a `seed`**: starting values for the voice's name, the description on the
  Design tab and the hosted form, and the line the Design tab speaks. A host starts the studio from
  a character's voice brief with it. Read once on mount.

### Fixed

- **A checkbox in `VoiceStudio`'s hosted form looked unticked when it was ticked.** The
  form's field styles reached the checkbox's hidden input and drew it as an empty box over
  the real control. They apply to text fields and selects only.

## [0.77.0] — 2026-10-12

### Added

- **`.ui-range`**, a drawn range input in `tokens/utilities.css`: a hairline track and a
  small thumb. `accent-color` alone left WebKit's own track, a tall white bar on a dark
  surface. `SpeechControls`, `AudioPlayback` and `DialogueComposer` carry it.

### Changed

- **The voice and sound studios are at desktop density.** `VoiceStudio`'s local modes
  (`VoiceDesignPanel`, `VoiceClonePanel`, `VoicePresetPanel`, `DialogueComposer`),
  `SoundStudio` and `SpeechControls` use the data type scale, 3px field padding, shorter
  text areas and tighter gaps, and their take lists are the compact ones.

## [0.76.0] — 2026-10-12

### Added

- **`VoiceStudio`** can design a voice with a hosted provider, beside the local studio.
  Given `hostedChoices`, it shows one compact form: provider and model, name, description,
  explicit permission for the provider's charge, then the candidate's sample and a separate
  accept. A choice the host cannot run is listed as not available and cannot be picked.
  Human replication has its own fields for the two recordings and the consent record.
- **`SceneReadApproval`** shows a scene read's plan before it runs: how many lines are
  reused, new on this machine and new on a hosted provider, and asks for permission where a
  line is billed.
- **`SceneReadStatus`** shows a read that was interrupted: what it kept, and whether the
  host says it can resume.

## [0.75.0] — 2026-10-11

### Changed

- **`StatusBar`** shows a running job as a progress bar pinned to its right edge: the
  label, done/total, elapsed and time left, and the job's Cancel when the host passes one.
  With several jobs the first is shown and the rest are a `+N` whose tooltip and
  accessible name list them. The bar is determinate only with a real count, indeterminate
  otherwise, and still under reduced motion. It is a `progressbar` with
  `aria-valuemin`/`max`/`now`/`valuetext`, outside the live region so the clock is never
  announced; the live region names the running jobs once.
- **Breaking:** `StatusJob.progress` is now `{ completed, total }` (as on `ProjectJob`),
  not a host-worded string, and `StatusJob` gains `elapsedMs` and `remainingMs`. The bar
  formats them with the card's `lib/duration.js`; time left is still the host's projection.
  The `Running` list is gone, and only the shown job offers Cancel.

## [0.74.0] — 2026-10-11

### Changed

- **`ProjectCard`'s status label reads `analyses`**, the same reports the rail
  draws (D93). B4P's card read `Analyzing 56/118` while its rail read 56 of 57;
  it now reads `Analyzing scenes 56/57`. All three analyses done reads
  `Complete`; otherwise the first analysis in rail order that is in progress or
  failed names the label with its own count. One not started or not reported
  makes no claim and the stage speaks. A parsed package with nothing else known
  reads `Parsed` rather than `Unknown`.

### Removed

- **`Project.analyzed_status`, `analyzed_complete_count` and
  `analyzed_total_count`.** khaosd no longer sends them (they summed scenes,
  characters and locations into one count of analysis files). Breaking for a
  consumer that sets them; pass `analyses` instead.

## [0.73.1] — 2026-10-10

### Fixed

- **`ProjectCard`**'s rail was invisible in 0.73.0. Its 4px hover padding sat inside the
  kit's border-box `height: 3px`, leaving every segment 0px tall. The rail is now
  `content-box`, so the padding adds to the bar instead of eating it.

## [0.73.0] — 2026-10-10

### Added

- **`ProjectCard`**'s rail is six segments: import, parse, index, analyze scenes, analyze
  characters, analyze places. The first three behave as before. The last three come from a
  new `analyses` prop (`ProjectAnalysis`: `kind`, `state` of `not-started` | `in-progress` |
  `done` | `failed`, optional `progress`); an analysis the host does not report is drawn
  empty and titled "not reported". `ProjectJob.kind` gains `analyze-scenes`,
  `analyze-characters` and `analyze-places`, each filling its own segment live as
  extraction fills index. Every segment carries a hover title naming it and its count.
  `Launcher` and `WelcomeWindow` take `analysesFor`.

## [0.72.0] - 2026-10-10

### Added

- **`StatusBar`** jobs take an optional `cancel`. A job that has one gets a Cancel button,
  named "Cancel <label>", which asks the host. The host passes it only where the engine can
  stop that job, as with Undo; a job without one draws no Cancel.

## [0.71.0] - 2026-10-09

### Added

- **`InspectorSection`** takes an optional `meta` snippet, a reading drawn at the end of its
  header, such as a status pill.

### Changed

- **`EngineDetails`** draws the engine pill and the running count in the plate heads, and
  lists the first three on-device engines with the rest counted ("+3 more"), as `Launcher`'s
  plates did. Measured in khaos-app against a running khaosd with six engines: the rail's
  actions and every plate now fit whole at 1000x680 (620px of 648); 0.70.0 needed 716px and
  clipped the last plate. At 720x480 the rail scrolls on its own.

## [0.70.0] - 2026-10-09

### Changed

- **`WelcomeWindow`** shows the engine plates again, always visible under the action rail
  (operator: "want to see these and not have them buried as they are the first indicator of
  the state of the workspace"): `EngineDetails` renders in the rail, which scrolls on its own
  when the window is too short. The status line and its Details popover are gone; every fact
  they carried is on the plates. The rail is 236px, the plates' width in `Launcher`.
- **`EngineDetails`** carries every fact `Launcher`'s plates showed: the engine pill and the
  running count as `PropertyRow`s, a version that is not an exact release marked as a warning
  (`data-release="false"`) and a presence word as a state, each on-device engine's state dot
  beside its state word (and beside "not installed"), and one-line model names that truncate
  with the full id on hover. The services section is titled "On-device engines" again.

## [0.69.0] - 2026-10-09

### Changed

- **`WelcomeWindow`** shows the stories as `ProjectCard`s again (operator: "bring back the
  cards but adjust to fit"): a grid of 220px-minimum columns that fills the pane beside
  the rail and is the only scroll region, each card with its own cover, stage chip,
  counts, job and progress rows, and its own Open, Extract, Initialise and Delete.
  `coverFor` is taken as `Launcher` takes it; the table, `openedFor`, `onShowInFinder` and
  `viewportHeight` are gone. The rail and the status line with its Details are unchanged.

## [0.68.0] - 2026-10-09

### Fixed

- **`EngineDetails`** keeps each component's update verdict beside its version, its
  detail as the accessible name and the hover, and the Setup pill's "Setup needed", as
  `Launcher`'s Engine plate did.

## [0.67.0] - 2026-10-09

### Added

- **`WelcomeWindow`** (data-layer plan A11; audit §3.9). The desktop welcome window: an
  action rail (Import Screenplay, Open, Clone Repository), the recent stories as a
  `DataTable` (Title, Stage, Ch, Sc, Pl, Opened) with the selected story's actions above
  it, an import or extraction shown as its row's stage with phase and elapsed time, and
  one `StatusBar` line whose Details open `EngineDetails`. Only the table scrolls.
- **`EngineDetails`** (data-layer plan A11). The engine's components and versions, its
  routing by model, and the on-device engines, as three inspector sections. The
  readings it shares with `Launcher` now live in `lib/engine.js`, which `Launcher` uses.

## [0.66.0] - 2026-10-09

### Added

- **`Checkbox`** (data-layer plan A6). One include/exclude mark, controlled: a click
  asks `onchange` for the other value and changes nothing itself. `hideLabel` keeps the
  label for assistive technology only, for a checkbox in a table row.

## [0.63.0] - 2026-10-09

### Fixed

- **`Popover` stays inside the window.** A trigger at the window's right edge (the
  inspector's Voice pop-up) opened its 280px panel off-screen. The panel now opens
  leftward to keep 8px clear of the edge, and it gets shorter near the bottom instead
  of running past it. Reported live by the operator on the data-layer window.
- **`DataTable`'s group header** separates its count from the group's name, so
  "INT. FUNERAL HOME - DAY 1" no longer reads as part of the slugline.

## [0.62.0] - 2026-10-09

### Added

- **`EventLog`** (data-layer plan K16; audit §1.10, §4.1). The Activity window's
  table. Each committed change is one row, with time, kind, actor and change, in the
  order given and grouped under the reader's day with a count. It runs on DataTable's
  virtualised row window, so B4P's 695 changes put a viewport's worth of rows in the
  DOM instead of all of them. The host formats the time and the day.

## [0.61.0] - 2026-10-09

### Added

- **`RenderStrip`** (data-layer plan K15; audit §3.6, §4.1). One cell per scene or
  segment, coloured by its RenderMark state and named with that state in its
  accessible name, never by colour alone. A cell with no state is absent: it has no
  tone and no state in its name, so it is never "missing". A click asks the host
  through `onselect`, and the selected cell is `aria-pressed`.

## [0.60.0] - 2026-10-09

### Added

- **`Sheet`** (data-layer plan K14; audit §1.14, §3.15 "Confirmations", §4.1). A
  window-attached modal that names what it acts on: its title and target are its
  accessible name, and its message is its description. The host mounts it to open it.
  While mounted it holds the focus. It takes the focus (the field of a text-input
  sheet, otherwise Cancel), Tab and ⇧Tab cycle inside it, and on unmount the focus
  returns to where it was. Esc asks to cancel. A text-input sheet (`input`, the Clone
  URL sheet of khaotik-ui#46) keeps confirm disabled until the field holds text, and
  Return in the field confirms with the trimmed text.

## [0.59.0] - 2026-10-09

### Added

- **`Popover`** (data-layer plan K13; audit §3.1 principle 8, §3.7, §3.15, §4.1). An
  anchored, searchable picker: a trigger showing the current value, and a
  fixed-position panel under it, so nothing in the document flow moves. The panel
  has a search field and a list with the suggested item first, marked "Suggested"
  (`lib/picker.js` `pickerOrder`). ↑, ↓ and Return pick. Esc, a pick or a click
  outside closes it, and the focus returns to the trigger. Picking asks through
  `onpick`. `disabledReason` makes the trigger unavailable and carries the reason.

## [0.58.0] - 2026-10-09

### Added

- **`StatusBar`** (data-layer plan K12; audit §1.15, §3.15, §3.16, §4.1). The
  window's bottom line: the engine's state, the running jobs with their progress, and
  the last action's result, in a `role="status"` live region. Undo renders only when
  the host passes `result.undo`, because a host offers Undo only where the engine can
  reverse the write (khaos-manager #688). `ondetails` adds a Details button. The bar
  is 24px, a literal pending harvest gap 9.

## [0.57.0] - 2026-10-09

### Added

- **`CommandPalette`** (data-layer plan K11; audit §3.11, §3.16). The ⌘K palette.
  It takes the host's commands as props (the `Command` shape from `lib/commands.js`)
  and searches label and group with the new `matchCommands`, carried from the
  khaos-app prototype. It asks the host to run one by id. A disabled command is
  listed, with its reason as text and as its accessible description, and never runs.
  The palette is a combobox controlling a listbox, with the active option as
  `aria-activedescendant`. ↑ and ↓ move, Return runs, and Esc asks to close. The input
  takes the focus on mount, and the focus returns to where it was on unmount.

## [0.56.0] - 2026-10-09

### Added

- **`ScrubNumber`** (data-layer plan K10; audit §3.12, §3.15, §3.16). A number you
  drag to scrub or click to type. It is a `spinbutton` with its bounds, and dragging is
  never the only way to change it. ↑ and ↓ step it, PageUp and PageDown step ten, and
  Home and End go to the bounds. ⇧ makes a key or a drag ten times coarser, and ⌥ makes
  a drag ten times finer. A click opens a text field that commits on Return or blur and
  reverts on Esc. Every value is snapped to the step and held inside [min, max] before it
  is emitted (`lib/scrub.js` `clampStep`), so a value outside the range never reaches the
  host. A value equal to the current one is not emitted.

## [0.55.0] - 2026-10-09

### Added

- **`ScreenplayText`** (data-layer plan K9; audit §1.6, §4.1). A scene's text,
  formatted as a screenplay, with each element as a selectable line. It is a listbox
  whose options hold exactly their element's text: the layout is CSS, so copying
  copies what was written, and a copy with nothing selected copies the selected line.
  The host owns the selection. A click, ↑, ↓, Home or End asks with the element's id.
  An empty scene says so.

## [0.54.0] - 2026-10-09

### Added

- **`TokenField`** (data-layer plan K8; audit §1.5, §4.1). Short values as tokens
  with an inline add, built for a character's aliases. The host is the source of
  truth. Return asks through `onadd` with a trimmed, new, non-empty token and clears
  the input, and the token appears only when the host passes it back. A token is a
  button: a click, Backspace or Delete asks through `onremove`. Backspace in an empty
  input focuses the last token. `readonly` shows the tokens with no add field and no
  remove.

## [0.53.0] - 2026-10-09

### Added

- **`RenderMark`** (data-layer plan K7; audit §3.13, §4.1). Shows whether a thing is
  rendered: `ready`, `stale` or `missing`, as a glyph and a label, never by colour
  alone. With no state, or with an unknown one, it renders nothing. Absent is never
  drawn as "missing", because the engine not saying is not the engine saying there is
  nothing. `label` takes the host's own wording. `compact` hides the label visually
  and keeps it for assistive technology and as the tooltip.

## [0.52.0] - 2026-10-09

### Added

- **`PropertyRow`** (data-layer plan K6; audit §3.12). The inspector's label-value
  row. It sits on one line and never wraps. A long value truncates with an ellipsis,
  and its full text stays in the DOM, as the tooltip and as the row's accessible
  description. An optional `source` column says where the value came from, and a
  control (`children`) can take the value's place.
- **`InspectorSection`** (data-layer plan K6; audit §3.12). A named, collapsible
  inspector section with an optional count. It is a disclosure button with
  `aria-expanded` over a named region. It starts from the host's `collapsed` and
  reports every change through `oncollapse`.

## [0.51.0] - 2026-10-09

### Added

- **`DataTable`** (data-layer plan K5; audit §2 item 2, §3.16, §4.1). The desktop
  collection. It is virtualised: only the rows in the viewport, plus `overscan` (8)
  on each side, are in the DOM, and `aria-rowcount` and `aria-rowindex` stay true to
  the whole set. At 1,912 rows and a 480px viewport it renders at most 36. It has
  sortable headers with `aria-sort`, grouping with a count header row
  (`groupBy`), and a filter over every column. It keeps one persistent selection,
  owned by the host. A click, ↑, ↓, PageUp, PageDown, Home, End and type-ahead ask
  for a row through `onselect`, Return and double-click ask through `onopen`, and the
  grid is one tab stop. A column may draw its cell with a `cell` snippet. An empty
  table says so (`empty`). The pure parts, `visibleRows`, `rowWindow` and
  `flattenGroups`, are in `lib/table.js`, carried from the khaos-app prototype's
  `table.ts`. Rows are 24px, a literal pending harvest gap 9.

## [0.50.0] - 2026-10-09

### Added

- **`Toolbar`** (data-layer plan K4; audit §1.4, §4.1). The window's one bar. It
  holds the title, a `WorkspaceSwitcher` (a pop-up button below `compactBelow`,
  960px by default), command buttons, the filter field, pane toggles and drag regions.
  Commands are props in the shape of the new `lib/commands.js` `Command` typedef, and
  a button asks the host by id through `onrun`. A disabled command stays focusable
  through `aria-disabled`, carries its `disabledReason` as its accessible description
  and its tooltip, and never runs. The drag regions hold the title and empty space
  only. The bar is 52px, a literal pending harvest gap 11.

## [0.49.0] - 2026-10-09

### Added

- **`WorkspaceSwitcher`** (data-layer plan K3; audit §3.2, §3.15). The toolbar's mode
  control. At full width it is the adopted `SegmentedControl`. Below `compactBelow`
  (360px by default) the same modes render as a pop-up button, a native `<select>`,
  and the selection is kept. The modes are props. ⌃⌘1 to ⌃⌘n select a mode by
  position, and `shortcuts={false}` unbinds them where the host's menu owns those
  keys. An unmeasured `width` of 0 renders at full width.

## [0.48.0] - 2026-10-09

### Added

- **`SourceList`** (data-layer plan K2; audit §4.1). The window's sidebar: sections of
  destinations, each with an icon and an optional count. A count renders exactly as
  given, including zero, and is absent when no count is given. The host owns the
  active row. A click, ↑, ↓, Home or End asks for a row through `onselect`, and the
  arrow keys cross section boundaries. The active row is the list's only tab stop and
  the only row with `aria-current="page"`, marked by the thin gold bar on a neutral
  surface. Rows are 24px, a literal pending harvest gap 9.

## [0.47.0] - 2026-10-09

### Added

- **`Dock`** (data-layer plan K1; audit §3.2, §4.1). It draws a split-or-tab-group tree
  of panels. The layout is plain data (`lib/dock.js`): a split holds one side at a
  fixed size and the other fills, and a group lists panel ids and its active one.
  Gutters are `role="separator"` controls. The arrow keys resize (⇧ for coarse steps),
  Enter collapses and restores, and pointer drags resize. A pane dragged more than
  40px below its minimum collapses instead of shrinking. A split marked `overlay`
  floats its fixed side over the other side when there is too little room for both.
  A tab strip is drawn only for a group of two or more panels. Every change reaches
  `onlayoutchange` as the whole new tree. `parseLayout` reads a stored layout back,
  or returns `null` when the layout does not decode or names a panel the build does
  not have.
- **A `shell` group in the catalog** for the desktop window's chrome.

## [0.46.0] - 2026-10-09

### Changed — breaking

- **`ProjectCard` takes one `job` prop.** `job: { kind: 'import' | 'extract',
  phase, progress?, elapsedMs?, remainingMs? }` replaces `extractionState`,
  `extractionProgress` and `extractionTiming`, which are **removed with no
  aliases**. The `extracting` state is now `{ kind: 'extract', phase:
  'running' }`. `Launcher` takes `jobFor(project)` in place of
  `extractionStateFor`, `extractionProgressFor` and `extractionTimingFor`.
  The type is `ProjectJob` in `lib/types.js`. D92.
- **The card's footer is four rows, in a fixed order:** the status line, the
  stage rail with its count at the end, elapsed and remaining time, and the
  meta strip. The count left the status line, and the `22ch` cap now sits on
  the label alone, so `Extracting entities from scenes` is never ellipsised.
- **A card shows an import.** Downloading, starting, queued, running and
  failed each have their own status line. An import card has no meta row and
  no actions, and its rail places the import on segments 1 and 2. A job
  outranks the stage chip whatever the stage is, and an unknown kind or phase
  falls back to the chip.
- **`Launcher` keys cards by identity:** by `path`, then `id`, then position.
  A card stays one instance from a pending import to the parsed project. A
  repeated key takes an occurrence suffix instead of throwing.

### Added

- The activate button is described by a visually hidden status line, such as
  "Extracting entities from scenes, 2 of 57", which carries no times.
- Queued segments are static and dimmed, and failed ones render in danger. A
  finalizing extraction shimmers over its last count, and elapsed time shows
  through finalizing.

## [0.45.0] - 2026-10-09

### Added

- **Extraction times on the project card.** `ProjectCard` takes
  `extractionTiming: { elapsedMs, remainingMs? }`, and `Launcher` takes
  `extractionTimingFor(project)`. While a card is extracting, the footer shows
  elapsed time exactly (`2:30`) and remaining time without false precision
  (`about 12 min left`), and the remaining part only when it is given. A value
  that is not a duration renders nothing. The footer is `aria-hidden`, so a
  value that ticks every second is never announced.
- **`lib/duration.js`.** `formatElapsed(ms)` and `formatRemaining(ms)` give a
  host the same wording wherever it has no timing prop. Both return `''` for
  NaN, Infinity and negative values. `formatRemaining` also returns `''` for
  zero, never "almost done".
- **A row slot on `SceneList` and `CharacterList`.** Both take
  `subtitleFor(item)`, plus `trailing` and `detail` snippets that receive the
  row's item, so a host fills the kit's own rows instead of composing its own.
  `SceneRow` takes the per-row `subtitle`, `trailing` and `detail` that
  `SceneList` hands it. Without them, every list renders exactly as before; a
  snapshot test pins the markup.

## [0.44.0] - 2026-10-09

### Added

- **`Portrait` kinds `object` and `relation`.** `object` draws `cube` and
  `relation` draws `arrows-left-right`, in the same frame and identity colour
  as `location`. Review can now tell a character, a place, an object and a
  relationship apart at a glance.

### Changed

- **Breaking: `SelectableRow` `thumbKind` is exactly `Portrait`'s kind.**
  `'place'` is removed. Portrait never drew it, so every place row rendered a
  person. Use `'location'`. The default is now `'person'`. The consumer gate
  pins the two types equal.

## [0.43.0] - 2026-10-07

### Added

- **`TakeList` Download** (#273, D91). Given `onDownload(id)`, each take's row
  offers Download beside Use this take and Delete, named "Download {take}". The
  `downloadingId` row's button is disabled, `aria-busy`, and reads
  "Downloading…" with a spinner until the host clears it. A row with an `error`
  offers none. The host owns the save dialog, the file write and the outcome.

## [0.42.0] - 2026-10-07

### Added

- **`VoiceStudio` lock mode** (#267, D90). Given `lockVoice` (`name`,
  `description`, `locked`), the studio opens on that designed voice: the Design
  tab alone, its description read-only, focus on the line field, and one button,
  "Lock {voice} to {take}", in place of the name and the keep choice. The take is
  the chosen one, else the newest that plays. A voice already locked reads
  "Change the take…" for the host to confirm. A take of more than one sentence
  is warned about before the lock. It reports `onLock(takeId)`; the host locks,
  re-reads and says how it went. `Take` gains `text`; `VoiceDesignPanel` gains
  `readonlyDescription`.

### Changed

- **`VoiceStudio` sample hint** (#267). Keeping a new design's take as a sample
  now says "It cannot be cast until it is locked." The sample stays the default.

## [0.41.0] - 2026-10-06

### Added

- **`SpeakerPicker` disabled and a choice in flight** (#264). `disabled` renders
  every chip `aria-disabled`, keeps it focusable and the selection drawn, and
  never calls `onselect` — on click, Enter or Space. `pendingId` marks the chip
  being written `aria-busy` with a spinner and holds the picker until it clears;
  the host sets it, the kit infers nothing. A host can keep the picker visible
  during a write instead of hiding it.

## [0.40.0] - 2026-10-06

### Added

- **A Setup state for the `Launcher` engine pill** (#260, D89). `engine.state`
  accepts `'setup'`: the pill reads Setup in the warning tone with a wrench
  glyph, and "Setup needed" is its accessible name and hover text. For a daemon
  that answers but whose setup is unfinished (khaosd health `ok: false`, custody
  unavailable). The host decides when to pass it. Unknown states still read
  Offline.

## [0.39.0] - 2026-10-06

### Added

- **`Button`** (#256, #237): `primary`, `secondary` and `text` variants. `disabled`
  renders `aria-disabled` so the button stays focusable, and one click guard
  covers click, Enter and Space, including a disabled `type="submit"`.

### Changed

- **Breaking: `SoundStudio` music contract** (#255, #254). `onMusic` receives
  `{caption, instrumental, lyrics, duration, steps?, seed?}`; the `[instrumental]`
  sentinel is gone. A new optional `musicLimits` prop
  (`{maxDurationSeconds, maxSteps}`) replaces the hard-coded 360 and 30, and a
  music submit waits for it.

## [0.38.0] - 2026-09-30

### Added

- **`LanguagePicker`** (#249, D88): a native select of language codes, named in
  words; `auto` reads "Detect from the text". Renders nothing for an empty list.
- **Languages, clone models and a line direction in the voice panels** (#249,
  D88). `VoiceDesignPanel`, `VoiceClonePanel` and `VoicePresetPanel` take
  `languages` and send `lang`. The design panel sends a `direction` beside its
  `instruct`. The clone panel takes `models` and sends `cloneModel`, with a
  Model choice for two or more. `VoiceStudio` passes `languages` per tab and
  `cloneModels` through.

## [0.37.0] - 2026-09-30

### Added

- **`SoundStudio`** (#246, D81): sound effects and music, each a form beside its
  takes.
- **`VoicePresetPanel`** and a `Preset` mode in `VoiceStudio` (#247, D86): a
  speaker with a style direction. The host serves the speakers.
- **Try again on a failed take** (#247, D85): `TakeList` `onRetry`, passed
  through as `onRetryTake` by `VoiceStudio` and `SoundStudio`.
- **Progress while generating** (#247, D87): `progress` on `TakeList`,
  `VoiceStudio` and `SoundStudio`.
- **`ProviderMark` `local`** (#247, D84): a desktop glyph for a provider the
  engine marks local. `Launcher` routes carry `local`.

### Changed

- **`Launcher` routing rows are one line per capability** (#247, D83): the
  capability, then the provider mark and the model's own name, with the full
  id on hover.
- **`SoundStudio` sends music `steps` only when typed** (#247). A pre-filled 8
  produced noise.

## [0.36.0] - 2026-09-30

### Added

- **`VoiceStudio` workbench** (#244, D79). Given `takes`, every audition stays
  beside the form, one can be chosen, and the studio ends in a name and Save.
  - New props: `modes`, `takes`, `generating`, `onSave`, `saveReason`,
    `saving`, `chosenTakeId`, `onChooseTake`, `saveHint`.
  - On the Design tab the keep bar asks whether to keep the take as a sample
    or lock the voice to it. `onSave` reports the choice as `lock`.
  - Without `takes` it renders as before.
- **`TakeList` direction and label** (#244, D80). `directionLabel` adds a
  Direction field whose text `onGenerate` receives. `generateLabel` names the
  button. `toolbar={false}` drops the Generate bar.

### Changed

- **`TakeList` hides "Use this take" without `onChoose`** (#244, D80). It used
  to show a dimmed button on every row.

### Fixed

- **`AudioPlayback` keeps every clip after the first playable** (#243). The
  previous clip's element set an error on the new one when it was emptied.

## [0.35.0] - 2026-09-30

### Added

- **`InstallList`** (#241, D77): anything installable as an app-store row, for
  khaos-app's Setup.
  - Each row has an icon (the name's first letter on `identityColor(id)`, or a
    host `icon`), a name, one truncated `tagline`, and a capsule on the right.
  - The capsule reads Get, Update, Retry or Installing. An installed row reads a
    quiet Installed. A row not in `installable` shows the capsule disabled with
    the host's `caption` under it.
  - It runs nothing: `onInstall` reports intent for the host to confirm.
- **`ConfirmDialog` takes a `children` snippet** (#241, D78), rendered between
  the description and the buttons, for a choice that changes what is being
  agreed to. Optional: without one the dialog renders as before.

## [0.34.0] - 2026-09-29

### Added

- **`Menu` groups, unavailable items, and a current value outside the items**
  (#233, fixes #223). All additions are optional, so existing callers render
  as before.
  - Items take four new fields:
    - `group`: a heading over the items that share it.
    - `groupMark`: a provider id, for a `ProviderMark` beside the heading.
    - `unavailable`: the item is shown but cannot be chosen.
    - `reason`: a second line explaining why the item is unavailable.
  - The menu takes two new props:
    - `currentLabel`: what the trigger shows when `value` matches no item.
    - `disabled`: disables the whole control, for example while a save is in
      flight.
  - The open list is capped to the space left in the window, and scrolls.
- **`TakeList`** (#217): one dialogue line's voice takes, built on
  `AudioPlayback`. It is a pure view: props go in, callbacks come out.
  - It shows which take is chosen and has a delete action.
  - Generate is disabled while a take is generating, or when a
    `disabledReason` is given.
  - When a take fails, it shows the engine's error message in place of the
    player.

### Changed

- **`Menu`'s `value` is controlled** (#233). Choosing an item calls `onselect`.
  The checkmark does not move until the caller passes the new `value` back.
  Values must be unique across the whole list, and `Menu` throws if they are
  not.
- **Light-theme success and warning ink is deeper** (#220, fixes #218).
  - `status-normal-fg` is now `#03623c`.
  - `status-warning-fg` is now `#8a4300`.
  - In the worst case (11px text on a tinted surface) they reach 5.09:1 and
    4.99:1.
  - A catalog test now checks tone-on-tint contrast across both themes.
  - Dark is unchanged.

## [0.33.0] - 2026-09-28

### Added

- **`CharacterBuilder` casting states** (#211, fixes #210). Two optional props,
  both scoped to the Casting tab. Before this, `casting: null` rendered
  Unassigned whether the casting was loading or could not be read.
  - `isCastingLoading` shows a Loading pill and a "Loading casting…" line.
  - `castingError` shows an Unreadable pill and a `role="alert"` block with the
    message verbatim. An empty, whitespace-only or `null` value means no error.
  - While either holds, a `casting` or `voice` passed alongside is treated as
    stale and hidden. If both are set, loading wins.
  - A `role="status"` live region is present from the first render and only its
    text changes, so the state change is announced.

### Changed

- **`CharacterBuilder` actions without a handler no longer render live** (#211).
  Audition, Re-analyze, Analyze, AI cast and Pick voice are disabled and titled
  "Not available in this app". Clear renders only when `onClearCasting` is
  supplied.
- **`CharacterBuilder` does not act on an unknown casting** (#211). While the
  casting is loading or unreadable, AI cast, Pick voice, Clear and starting a
  Casting-tab audition are disabled even when handlers are supplied, and their
  title gives the reason. Stop stays enabled, so an audition already playing
  can always be stopped.
- A cast with an empty voice name reads "Cast to an unnamed voice" rather than
  "No voice assigned" (#211).

Both new props are optional and backward compatible: a caller passing only
`casting` renders as before. The visible change is for a caller that supplies
no action handlers, which now sees disabled actions and no Clear instead of
buttons that did nothing.

### Known

- `npm run check-citations` checks only that a cited line exists, not what is
  on it (#212).
- `SpeakerPicker` does not show a voice's kind or language (#209).
- The timeline assumes events carry no `durationMs`; the wire serves it (#213).

## [0.32.0] - 2026-09-28

### Added

- **Voice and audio components** — `AudioPlayback` and `SpeechControls` atoms
  (#202), the `SpeakerPicker` atom (#203), `VoiceDesignPanel` and
  `VoiceClonePanel` (#204), `DialogueComposer` (#205), and `VoiceStudio` (#206).

### Fixed

- `SpeakerPicker` chips use a BEM class (#207).

## [0.31.0] - 2026-09-27

### Added

- **`Launcher` update-verdict icons** — the update badge now accepts an `icon`
  (a Phosphor glyph name, rendered `weight="fill"`) beside the version, with
  `detail` carrying the accessible name. `label` still renders text-only badges,
  so existing hosts are unchanged.

## [0.30.0] - 2026-09-26

### Added

- **`SegmentTimeline`** — the read-only composition timeline as a standalone
  component, extracted from `StoryPlayer` so a host can render a scene's event
  sequence without the player's transport
  ([#198](https://github.com/khaos-studio/khaotik-ui/issues/198)).

- **`SegmentTimeline` `fit` mode** — events sized as a share of the events'
  own span, with no ruler, section band, playhead or scroll
  ([#199](https://github.com/khaos-studio/khaotik-ui/issues/199)).

### Fixed

- **`CharacterBuilder` tabs** — inactive tabs were all rendered because the
  visibility selector matched the wrong element
  ([#197](https://github.com/khaos-studio/khaotik-ui/issues/197)).

- **`DialogueList` and `SceneList` pagination** — pages only above 100 rows,
  and the pager is rendered only then
  ([#197](https://github.com/khaos-studio/khaotik-ui/issues/197)).

## [0.29.0] - 2026-09-25

**The first release on an annotated tag.** Every tag this repository ever
shipped was lightweight, because `gh release create` writes the ref straight at
the commit. A lightweight tag is indistinguishable from an annotated one in
`gh release view` and in the web UI — only the ref's object type tells them
apart — so `scripts/release-lib.sh` now creates the tag object itself and then
**asserts** the type rather than assuming it held. Forward-only: nothing is
retagged, because retagging moves refs consumers may have pinned.

### Added

- **`ProviderMark`** — the provider artwork alone, as an exported atom
  ([#179](https://github.com/khaos-studio/khaotik-ui/issues/179)). `aria-hidden`
  by contract: the mark is decoration beside a name, and a host that needs it
  announced labels the row, not the glyph. `ProviderBadge` composes it, so the
  two cannot drift.

- **`SelectableRow` takes a `leading` snippet**, which wins over `thumb` and
  `icon`. The slot a provider row needs to put a mark where a thumbnail would
  go.

- **`Character.origin` and `Location.origin`** (`'parsed' | 'authored' |
  'observed'`) and **`Character.percentage`**. `origin` is **provenance, not
  confidence** — where the record came from, never how sure anything is about
  it. How a row *marks* it is deliberately not shipped here
  ([#189](https://github.com/khaos-studio/khaotik-ui/issues/189) tracks the
  design).

- **A singular `analysis` prop on `CharacterWorkspace`, `LocationWorkspace` and
  `SceneWorkspace`**, taking precedence over the `analyses` map. A host holding
  one record no longer has to synthesise a map keyed on a name it has to guess.
  This is what `khaos-app#152` was blocked on.

- **`--warm-350` and `--warm-450`**, and `--text-tertiary` repointed at them per
  theme ([#75](https://github.com/khaos-studio/khaotik-ui/issues/75),
  [#80](https://github.com/khaos-studio/khaotik-ui/issues/80)). Andrew's third
  text step. The warm ramp had a 21.7 L\* gap between 300 and 400, which is why
  the step needed a new primitive rather than an existing one. Measured from the
  shipped CSS: **4.78 dark, 5.12 light** — exactly his figures.

### Fixed

- **`ProviderBadge` separates the label from the lookup key**
  ([#178](https://github.com/khaos-studio/khaotik-ui/issues/178)). `providerId`
  resolves the artwork; `provider` prints. They were one prop, so a host with a
  display name and an id had to pick which one to be wrong about. Four reports
  (#157, #163, #165, #178) were each one spelling arriving without artwork; this
  closes the class at the root rather than adding a fifth alias.

- **A `SelectableRow` is a control only when it can act**
  ([#193](https://github.com/khaos-studio/khaotik-ui/issues/193)). The root is a
  `<button>` when `onclick` is set and a `<div>` when it is not, so a read-only
  row no longer announces a control that does nothing.

## [0.28.0] - 2026-09-24

### Changed

- **Characters lead, not scenes, where a surface lists the story's entities**
  ([#180](https://github.com/khaos-studio/khaotik-ui/pull/180),
  [#181](https://github.com/khaos-studio/khaotik-ui/pull/181), **D76**).
  Operator direction: the perspective of storybuilding is character-centric.
  A writer is building people; scenes are the evidence.

  **`ProjectCard`'s meta strip** read `54 scenes · 27 characters · 26 locations`
  on the launcher's project list — the most-read surface the kit ships. It now
  reads `27 characters · 54 scenes · 26 locations`. That order was never
  decided; it was the order the counts happened to be written in.

  **The order is conditional and always was**, which the sentence above reads
  past: `characters` and `locations` render only when non-zero, `scenes`
  always. So a project with no cast reads `54 scenes` rather than leading with
  an absence. Only the position moved; the conditionality is untouched.
  Clarified after khaos-app read the entry as a claim that all three always
  render.

  **`Dashboard` leads with the cast.** Its only entity content was a
  `SceneList`, so scene-first was its *structure* rather than its ordering —
  which is why D76 recorded it as an open consequence and why it took a
  separate ruling rather than a reorder.

  **What the principle does NOT reach**, stated so it is not over-applied:
  `scene_count, character_count, location_count` in payloads mirrors khaosd's
  own field order and is not this repository's to reorder; barrel ordering is
  alphabetical and carries no claim; a surface whose subject genuinely is the
  scene — a reader, a timeline, a pacing series — is untouched. D76 orders
  entities where a surface has a free choice. It does not rename what a surface
  is about.

### Added

- **`Dashboard` takes `characters`, `selectedCharacterKey` and
  `onSelectCharacter`** ([#181](https://github.com/khaos-studio/khaotik-ui/pull/181)).
  Additive: a host that passes no `characters` gets exactly the previous
  render, including no section heading — with one list there is nothing to tell
  apart, and labelling it would be chrome the dashboard never carried.

  The selection props are named apart from `selectedId`/`onSelect` because the
  dashboard now holds two selectable lists and one handler could not say which
  was picked. The `Key`/`Id` split is D58's distinction: `CharacterList`
  matches a name, `SceneList` matches an id.

  **The cast section carries no heading of its own.** `CharacterList` renders
  `27 characters` as its own header, so an eyebrow above it named the section
  twice. The scenes do get one, because `SceneList` carries no self-label — the
  goal is each section named exactly once, not each named the same way.

### Known

- **A dashboard handed a full cast pushes its scene list below the fold.** 27
  characters at `CharacterList`'s portrait row height is a wall on a surface
  whose job is overview. The host controls what it passes, so the component is
  not wrong, but the honest reading of a real project is long. `MeasureTable`
  would carry the same cast in a fraction of the height. Recorded rather than
  decided: it is a question about what a dashboard's cast section *is*.

## [0.27.0] - 2026-09-24

### Added

- **`MeasureTable` — several measures for many items, in one screen**
  ([#176](https://github.com/khaos-studio/khaotik-ui/pull/176)). `BarChart`
  takes one measure per item, so three measures across 27 characters meant
  three charts and vertical scrolling. Past roughly seven items that all carry
  meaning, the readable form for several measures is a table with the chart
  inside the cells.

  **Every column is scaled against itself**, and that is why it is a component
  rather than a wide `BarChart`. Measured on the live capture: word counts run
  to 4024 while scene counts run to 29. On one shared scale every scene bar is
  under a pixel and the column reads as empty — a chart reporting "no data"
  about data it was handed. Two measures of different scale never share an
  axis; this is that rule applied inside a table.

  A bar is therefore honest **down** a column and meaningless **across** a row.

  **Absent is not zero.** A row missing a measure renders an em dash and sorts
  last in both directions — ranking it among the real zeroes would claim a
  measurement nobody took. A measured `0` renders as an empty track; any
  non-zero value gets a 3px floor, so a small quantity reads as small rather
  than as a rendering fault.

  Sorting and selection are controlled-or-uncontrolled, and `''` is a real
  value meaning the rows' own order rather than the uncontrolled signal.

- **The three Workspaces let the host own selection**
  ([#175](https://github.com/khaos-studio/khaotik-ui/pull/175),
  [#171](https://github.com/khaos-studio/khaotik-ui/issues/171)).
  `SceneWorkspace` takes `selectedId`; `CharacterWorkspace` and
  `LocationWorkspace` take `selectedKey`; all three take `onSelect`.

  Selection was private `$state` with no way in or out, so a host could not
  know which entity was selected until **after** the workspace had rendered it.
  The inspector pane wants that entity's analysis, so the only way to have it
  ready was to prefetch every one — **226 requests on a single project**, which
  khaos-app's ADR-0005 forbids. They hand-composed list-plus-inspector across
  529 lines instead, and this composition went unused.

  What made it a defect rather than a design choice: `SceneList`,
  `CharacterList` and `LocationList` have each taken a selection prop and
  `onSelect` since D58. The compositions built **out of them** took neither.

  **Additive** — pass neither prop and behaviour is unchanged. The spellings
  are deliberately not uniform: D58 ruled `selectedId` where the match is
  genuinely an id and `selectedKey` where it is not, and flattening the
  wrappers would reintroduce the lie D58 was a breaking change to remove.

## [0.26.0] - 2026-09-24

### Breaking

- **`Character.dialogue_count` is now `dialogue_lines`**
  ([#170](https://github.com/khaos-studio/khaotik-ui/pull/170),
  [#165](https://github.com/khaos-studio/khaotik-ui/issues/165)). Affects
  `CharacterList` and `CharacterWorkspace`.

  khaosd serves `dialogue_lines` on **both** endpoints. Measured by khaos-app
  against a live khaosd 0.20.0 across four projects and 247 character rows: the
  old name appears **zero** times. So the pill was empty for every consumer, on
  every endpoint, and nothing reported it — an absent optional value and a wrong
  field name render identically.

  **No host can have been using the old name successfully**, since nothing
  serves it. No fallback is provided: one spelling on both endpoints means a
  fallback would be dead the day it was written and would hide which name is
  real.

  **This repository could not have caught it.** Its capture is from 2026-08-15
  and predates the rename; `story-graph.json`, captured one day later, already
  carries `dialogue_lines`. The two straddle it, so a disagreement and a rename
  looked identical from inside.

### Changed

- **A measured zero is a fact, not an absence**
  ([#170](https://github.com/khaos-studio/khaotik-ui/pull/170)). A character
  with `dialogue_lines: 0` renders `0 lines`; one with the field absent renders
  nothing. It was a falsy check, which conflated them.

  `CharacterList` takes its rows from whatever host supplies them, so absence
  means *this host did not say* — not *this character does not speak*.
  Discarding a `0` it was handed would be the component deciding a measured fact
  is not worth showing.

  No visible change today: khaosd's `omitempty` means no row on the current wire
  carries a zero. It becomes correct when khaos-manager removes it, after which
  a non-speaker arrives as `0` and a blank pill would start hiding a fact while
  looking exactly like the not-measured case it used to mean.

### Fixed

- **`StoryGraph`'s accessible list counted relationships the graph discards**
  ([#169](https://github.com/khaos-studio/khaotik-ui/pull/169),
  [#168](https://github.com/khaos-studio/khaotik-ui/issues/168)). `ringLayout`
  built its degree map over the full edge array, then dropped edges whose
  endpoints were not both in the node list — so `degree` described a graph that
  was never drawn.

  **Worse than an off-by-N.** `StoryGraph` renders the SVG `aria-hidden` and
  puts this number in `.storygraph__alt`, the list that carries the graph to
  anyone who cannot see the drawing. The two views were not disagreeing — the
  **accessible** view was the wrong one, and it is the only one a screen-reader
  user receives.

  It also reached the seating: `ranked` sorts on the same map, so a character
  could take a prominent seat for ties that are never drawn. Fixed by dropping
  first and counting second; the drop itself is unchanged and still right.

  Not reproduced on live data, and the catalog renders identically before and
  after. That is the argument **for** the test rather than against the fix — an
  unreachable guard that is wrong becomes a wrong guard the day it is reached.

- **A prose export count that drifts now reds**
  ([#173](https://github.com/khaos-studio/khaotik-ui/pull/173),
  [#128](https://github.com/khaos-studio/khaotik-ui/issues/128)). `README.md`
  claimed **48 exports** in two places against a barrel of **52**, with no gate
  reading either. `scripts/check-export-count.mjs` runs in `check-coverage`.

  README's numbers are **deleted rather than corrected**, which is what
  `CURRENT.md`'s own rule asks for: *"No counts and no run tallies… Record the
  command that answers it."*

  The gate's first version matched `components` as well as `exports` and was
  wrong on half its hits, flagging two accurate historical counts. Narrowed
  before shipping; the trade is recorded at the pattern.

- **`docs/decisions.md` D60 said `/api/story/graph` has no component**
  ([#172](https://github.com/khaos-studio/khaotik-ui/pull/172)), while
  `StoryGraph` is exported. khaos-app read the row and filed an issue **against
  themselves** for not consuming an endpoint a shipped component already
  accepts. Annotated rather than rewritten — the register records decisions as
  taken, and a silent rewrite would hide that the drift happened.

## [0.25.0] - 2026-09-23

### Fixed

- **Three more provider ids drew the placeholder while the kit shipped their
  artwork** ([#163](https://github.com/khaos-studio/khaotik-ui/pull/163),
  [#157](https://github.com/khaos-studio/khaotik-ui/issues/157)).
  `aws-polly`, `gcp-tts` and `gemini-tts` are the `providerId` column of
  `voices.json` — the next column of the file the earlier fixes were built on,
  and the file their test already imported. Fixed by alias.

  **A test asserted `markFor('aws-polly')` is `undefined`.** That is a literal
  value in the capture imported six lines above it, so the test recorded a live
  defect as intentional.

  The captures carry **four** columns of provider spelling between them, and
  each pass read one: engine id, display name, voice id, analysis id. The count
  went two to three to four across a single day.

- **The test was a pin, not a property, and is now a property.** Its catching
  assertions hardcoded the ids already known broken, and its one general
  assertion ran keys → vocabulary only. The reverse is the entire defect class —
  a spelling khaosd serves, for which artwork exists, resolving to nothing.

  It now asserts that for every provider the **capture** spells two ways, the
  spellings agree about whether artwork exists. The equivalence is derived from
  the capture rather than from the alias table, or it would only prove the table
  agrees with itself. A sixteenth provider entering the capture reds it with
  nobody editing the test.

- **Two generator hazards, both probed.** A capital in an artwork filename made
  a mark unreachable through **every** spelling at exit 0. An alias key naming
  no file was silently ignored while inflating the headline count — *an alias
  that does nothing, announced as success*, which is the #157 failure mode
  inside the fix for #157. Both exit 2 now.

- **Assertions that could not fail.** Two found by review, removed. A third,
  written during the repair, found by applying the same method to it — a
  map-size check implied by the loop above it. Named in place rather than
  quietly deleted, because the shape recurs and reads like extra rigour.

- **`ProviderSheet` was blind to the column it exists to report.** It read only
  `.provider`, so the sheet whose purpose is showing which providers have no
  mark could not see the column where three were missing.

### Changed

- **`gcp-tts.svg` is the canonical Google file.** A claim that stood in the
  generator, in the test, and in a shipped CHANGELOG — *that khaosd serves no
  `google` provider at any spelling* — was **false**. The assertion encoding it
  passed because it filtered for the substring `google`, which `gcp-tts` does
  not contain: true in its mechanics, wrong in its reasoning.

- **`gemini` is not TTS-only**, correcting the 0.24.0 entry. khaosd lists it on
  `analysis.text`, `chat.project`, `chat.character` and `media.image` as well as
  `media.voice`, and this repository's own capture said so while the claim
  stood. No code was affected; the harm was routing advice telling a consumer
  that seeing `gemini` on a prompt trace was worth filing against another team.

### Note

Everything from `lib-0.21.0` to `lib-0.24.0` shipped self-reviewed, author and
verifier the same agent. **This release is the first to carry an independent
pass** — khaos-app's reviewer read the #157 commit from the consumer seat and
rejected it on coverage. Every finding above except the third assertion is
theirs.

## [0.24.0] - 2026-09-23

### Fixed

- **Two provider ids drew the placeholder while the kit shipped their exact
  artwork** ([#160](https://github.com/khaos-studio/khaotik-ui/pull/160)).
  `openai-codex` and `claude-ai` are distinct ids from `openai` and
  `anthropic`, so a table keyed on the parent brands never matched them. Fixed
  by alias.

  This is [#157](https://github.com/khaos-studio/khaotik-ui/issues/157) again,
  two ids over, and it was invisible for the same reason: `markFor` is an exact
  lookup, so an unrecognised spelling is never *asked for* and the caller falls
  back to the same neutral placeholder a provider with genuinely no artwork
  gets. Nothing errors. The failing state and the honest empty state are the
  same pixels.

  Found by measuring this table against the reachable analysis-provider set
  after khaos-tools answered
  [khaos-tools#763](https://github.com/khaos-studio/khaos-tools/issues/763).
  Their lead flagged both unprompted as the two a parent-brand table would
  miss, and declined to make the read so it would be made here.

### Changed

- **A third provider vocabulary is documented, and it is a different DOMAIN
  rather than a third spelling.** `data.provider` on a prompt trace reaches
  `ProviderBadge` through a consumer's activity surface. It carries an
  analysis/LLM provider id — `ollama`, `openai`, `openai-codex`, `anthropic`,
  `claude-ai`, `mistral`, `groq`, `lmstudio`, `deepseek`, `openrouter`, `mock`.

  `polly` **cannot appear there**: it is `media.voice` only.

  > **Corrected after 0.24.0 was tagged.** This entry also claimed `gemini`
  > cannot appear on a prompt trace. That is **false** — khaosd lists it on
  > `analysis.text`, `chat.project`, `chat.character` and `media.image` as well
  > as `media.voice`, and this repository's own capture
  > (`apps/catalog/src/data/provider-status.json`) said so the whole time.
  > Refuted by khaos-app against a live khaosd 0.20.0, then confirmed here from
  > that file. **No code was affected** — `gemini` is keyed by engine id and has
  > always resolved. What was wrong was the prose, and the routing advice
  > attached to it: readers were told that seeing `gemini` on a prompt trace
  > was a khaos-tools defect worth filing. It is ordinary behaviour. The text
  > at the `lib-0.24.0` tag still carries the error; this is the correction.

  The earlier statement that the ledger might be "a third spelling of the same
  vocabulary" was wrong in its premise, not merely unverified — that part
  stands.

  Six of the eleven have no artwork here and correctly render the placeholder.
  **`mock` is reachable on a real ledger via `--provider mock` and is a
  legitimate placeholder, not a gap** — an alias added to shorten that list
  would be fabrication.

- **`apps/catalog/src/provider-marks.test.js` asserts both halves** — the ids
  that must resolve, and the six that must **not**. It carries one transcribed
  constant, labelled as the only transcribed thing in a file whose header
  argues against transcription, with the reason it cannot be captured (**no
  prompt trace exists on any machine available to this project**, so there is
  nothing to read) and the event that deletes it.

- **`CURRENT.md` records a decoy beside the limit.** Ledger events carry a
  top-level `producer` of `{"tool": "khaos-tools", "version": "…"}` — the
  writing tool, not the model provider, and a different field from
  `data.provider`. Grep a ledger dump for `provider` and it surfaces first,
  reads as the answer, and is wrong with no error to say so.

## [0.23.0] - 2026-09-23

### Added

- **`Launcher`'s update verdict can be short without becoming unreadable**
  ([#156](https://github.com/khaos-studio/khaotik-ui/issues/156)).
  `update` gains an optional `detail`: supply it and `label` becomes visual
  only, while `detail` is what a screen reader announces and what hovering
  reveals. Omit it and `label` is the accessible name exactly as before, so no
  existing host changes behaviour.

  Reported from khaos-app against a running window. The plate is 177px and
  three of their four verdicts do not fit — `Version 0.24.1 could not be
  compared` is 36 characters. Since #149 made the badge unshrinkable so a
  truncated verdict could not read as a *different* verdict, a long badge
  consumes the row and the **version** disappears instead.

  Shortening the label was the obvious fix and they declined to do it locally,
  correctly: `label` was the only carrier, so a word or a mark would have
  shipped a status with no accessible name. This component already holds that
  position one block down about provider marks — the glyph cannot be the only
  carrier — and `detail` is what makes a short badge non-lossy rather than
  contradicting it.

  Both strings stay the host's, preserving why `update` was host-computed:
  khaosd has three paths to `update_available: false` and only one of them
  means "current".

  The carrier is a `.visually-hidden` span, not `aria-label`. That is the house
  convention (`SetupProgress`, `MetaStrip`) and the correct one — `aria-label`
  is specified as ignored on a generic element, so on a bare `span` it is a
  name that may never be announced.

### Fixed

- **A provider mark now answers to every spelling khaosd uses for it**
  ([#158](https://github.com/khaos-studio/khaotik-ui/pull/158),
  [#157](https://github.com/khaos-studio/khaotik-ui/issues/157)). The kit had
  one spelling per mark; khaosd has two vocabularies and both are its own —
  engine ids on `/api/v1/settings` (`polly`, `gemini`) and display names in the
  voice catalogue (`AWS Polly`, `Gemini TTS`). `Launcher` looks marks up by id
  and `ProviderBadge` by display name, so three of eight marks never drew on
  the routing plate.

  The filename is now the canonical key and is the engine id wherever khaosd
  serves one, because an id is an API contract while a display name is a UI
  string that can be reworded. The generator carries a small alias table and
  refuses a collision rather than letting sort order pick a winner.

  **Narrower than first reported**, and the correction is recorded because it
  changes what was at risk: three marks were unreachable *by engine id*, not
  unreachable outright. `aws polly`, `gemini tts` and `google cloud tts` were
  serving `ProviderBadge` correctly throughout. `google cloud tts` keeps a
  display-name key because khaosd serves no `google` provider at any spelling.

  > **Corrected after the fact.** That last clause is **false**. khaosd serves
  > `gcp-tts`, on every Google voice row of `voices.json` — an id, in khaosd's
  > own response, which is this fix's own criterion. The assertion encoding the
  > claim passed because it filtered for the substring `google`, which
  > `gcp-tts` does not contain: **true in its mechanics, wrong in its
  > reasoning.** `gcp-tts.svg` is now the canonical file and `google cloud tts`
  > is its alias. Found by khaos-app's reviewer.

  **A known limit, stated rather than implied:** khaos-app feeds
  `ProviderBadge` from a THIRD source — `prompt.provider` off the events
  ledger, a raw passthrough that is neither capture. If the ledger emits a
  spelling in neither vocabulary, that surface still falls to the placeholder
  and the new test will not see it. Unverified: their probe found no ledger
  entry carrying a provider. `khaos-manager` owns the ledger.

- **Why no gate saw #157, and what now would.** `markFor` is an exact lookup
  after lowercasing, so a key nothing spells is never *asked for* — the caller
  falls back to the same placeholder an unmarked provider gets. Artwork
  degrading silently to "no artwork" is invisible to a build, and the only
  routing fixture used `openrouter`, an id that already matched, so the catalog
  never exercised the broken path either.

  `apps/catalog/src/provider-marks.test.js` measures the table against both
  live captures, asserts the captures are non-empty *first* so it cannot pass
  by examining nothing, and was mutation-checked. Its broadest assertion —
  *is this key spelled anywhere* — **passes** under that mutation, because
  `aws polly` is a genuine display name; two specific assertions do the
  catching.

- **The `routes[].icon` prose documented the opposite of the behaviour**
  ([#157](https://github.com/khaos-studio/khaotik-ui/issues/157)). It said the
  kit carries no provider-to-glyph table, in the same package that ships one,
  and promised every provider renders the placeholder until a host passes a
  mark. khaos-app briefed a builder off that paragraph and nearly built the
  display-name table the prop exists to prevent. Resolution order is now
  stated: the kit's mark for `provider`, then `icon`, then the placeholder.

- **The update verdicts had no fixture**, so the catalog demonstrated the plate
  with every verdict absent and #156 was found in a consumer's window rather
  than in the catalog. `Launcher` gains an `Update verdicts` example carrying
  all four of khaosd's, label-only and with `detail`, so the two shapes can be
  read against each other.

- **`ProviderSheet` listed spellings, not artwork**, so the alias keys would
  have drawn the same logo twice and collided the `{#each}` key. It groups by
  artwork and shows the alternate spellings a mark answers to.

## [0.22.0] - 2026-09-23

### Added

- **The kit ships real provider artwork, and a place to look at it**
  ([#154](https://github.com/khaos-studio/khaotik-ui/pull/154),
  [#153](https://github.com/khaos-studio/khaotik-ui/pull/153)). Eight marks
  under `assets/providers/`, compiled to `components/svelte/lib/provider-marks.js`
  by `scripts/build-provider-marks.mjs`, and resolved case-insensitively by
  `markFor(provider)`. A provider with no mark renders the `plugs-connected`
  glyph rather than an invented one.

  They are rendered as **inline path data**, not as an `<img>` and not as a CSS
  mask. An SVG loaded as an image resolves `currentColor` against its own root
  and paints black, which is invisible on the dark default; four attempts at the
  mask route failed the same way before this was measured.

  The catalog gains a `BrandKit -> Provider marks` sheet listing what ships
  **and what does not** — the second half is the point, since 15 providers
  appear in the live voice capture and the kit has artwork for eight.

  One known limit, shipped deliberately: **the AWS smile draws 3.5px tall** in
  the 1em chip slot. It is a 4.5:1 wordmark in a square icon box and no CSS
  fixes that — widening the slot makes it wider and equally short. Every other
  mark lands between 11 and 16px. A square AWS icon would resolve it.

- **`Launcher` shows what each capability is routed to**
  ([#153](https://github.com/khaos-studio/khaotik-ui/pull/153),
  [#150](https://github.com/khaos-studio/khaotik-ui/issues/150)). A `routes`
  prop renders a plate of capability -> provider -> model, with the provider's
  mark where one exists. Provider and model take their own rows: at plate width
  a single row wrapped mid-name, which reads as a different model.

### Changed

- **`ProviderBadge` no longer invents a brand identity**
  ([#154](https://github.com/khaos-studio/khaotik-ui/pull/154)). Every chip used
  to be tinted by `providerHue()` — a djb2 hash of the provider's name, mod 360.
  Two things were wrong with it. It **bypassed the token system**: every other
  colour in this kit resolves from `tokens.json`, which D44/D49 make Andrew's
  register, while this one generated raw `hsl()` at runtime. And the hue was
  decoration doing a job the text already does — the chip renders the provider's
  name, and `elevenlabs` and `cartesia` were never told apart by their colour.

  The chip is now a neutral token surface and the mark carries the brand.

- **`qualityTier` renders as quiet text, not a gold sparkle**
  ([#154](https://github.com/khaos-studio/khaotik-ui/pull/154)). The prop is
  unchanged and every caller keeps working. The sparkle was wrong three ways:
  `AGENTS.md` reserves gold for the brand and primary actions and a tier is
  neither; it marked 324 of the 371 voices in the live capture, so a
  distinguishing mark distinguished nothing and the 47 without it read as
  *missing* something; and a sparkle means nothing to a reader who has not been
  told what it means.

- **`MetaStrip` separates the glyph's category from its full reading**
  ([#153](https://github.com/khaos-studio/khaotik-ui/pull/153)). `label` is the
  category a screen reader announces before the value, `title` the complete
  phrase shown on hover. They were one field, so the accessible name read
  "54 scenes 54".

- **`ProjectCard`'s stage rail fills by extraction progress**
  ([#153](https://github.com/khaos-studio/khaotik-ui/pull/153)). The active step
  fills to `completed / total` where the host supplies both, and keeps the
  indeterminate shimmer where it does not. Under `prefers-reduced-motion` the
  track remains, so the state is still legible without animation.

### Fixed

- **`build-provider-marks.mjs` refuses artwork it would silently corrupt**
  ([#154](https://github.com/khaos-studio/khaotik-ui/pull/154)). It flattens a
  source SVG to one path, so a multi-shape file used to ship as a fragment of
  the intended logo while the generator exited 0. It now exits 2 on more than
  one `<path>` or on any `<rect>`/`<circle>`/`<ellipse>`/`<polygon>`/
  `<polyline>`/`<line>`.

  The hazard it guards is real and was measured: **subpaths beginning with a
  lowercase `m` are relative**, so concatenating them chains each off the
  previous subpath's endpoint. A hand-flattened Amazon mark landed at 187% x
  267% of its viewBox this way. No shipped mark is affected — all eight were
  audited, and the two that are concatenations use absolute `M`.

## [0.21.0] - 2026-09-23

### Fixed

- **`Launcher`'s engine plate wrapped the moment a host supplied `update`**
  ([#151](https://github.com/khaos-studio/khaotik-ui/pull/151),
  [#149](https://github.com/khaos-studio/khaotik-ui/issues/149)). Rows with a
  verdict badge broke mid-phrase — "Up to / date" — while rows without one
  rendered on a single line each.

  `.launcher__readings dd` held the version and the badge together with
  `text-overflow: ellipsis` and **no `white-space: nowrap`**. Ellipsis needs a
  line that cannot break, so the declaration was inert from the day it was
  written and the content wrapped instead of truncating. It was invisible while
  the only content was a short version string.

  `dd` is now a flex row; the reading is its own `.launcher__version` element
  carrying the truncation, the monospace and the `--state` / `--warning`
  modifiers, and `.launcher__update` is `flex: none; white-space: nowrap`. The
  version yields first under pressure, because a truncated version still reads
  as a version while a truncated verdict reads as a different verdict.

### Changed

- **A minor, not a patch, and no prop moved.** `check-types` reports no
  declaration drift and no consumer has to change a line. The internal DOM
  shape did move: `.launcher__readings dd` is a row rather than the reading, so
  a consumer that reached past the public API to style `dd` is now targeting a
  container. Nothing in this repository or in khaos-app does — khaos-app
  confirmed it adds no CSS to this component — but the version says so rather
  than letting a patch imply the internals held still.

  Verifiable:

  ```sh
  git diff lib-0.20.3..lib-0.21.0 -- components/svelte/*.d.ts components/svelte/index.js
  ```

## [0.20.3] - 2026-09-22

### Changed

- **No library change ships in this release**, for the third release running.
  Everything since 0.20.2 is repository tooling and documentation: two gates
  and their self-checks, a release script, and the current-state document.

  Verified rather than asserted — this diff is empty:

  ```sh
  git diff lib-0.20.2..lib-0.20.3 -- components/ tokens/
  ```

  The published surface is byte-identical to 0.20.2, 0.20.1 and 0.20.0.

  **What it carries, and why a marker at all.** `releases/latest` had been a
  library marker with no installable build six times; `scripts/release-lib.sh`
  ([#141](https://github.com/khaos-studio/khaotik-ui/pull/141)) guards the
  release path and `scripts/check-latest-release.mjs`
  ([#144](https://github.com/khaos-studio/khaotik-ui/pull/144)) watches the
  artifact on every release event, which covers the hand-typed path a script
  cannot. `scripts/check-issue-refs.mjs`
  ([#146](https://github.com/khaos-studio/khaotik-ui/pull/146)) stops
  `CURRENT.md` describing closed issues as blocking. None of it is in the
  package you install; the version moves so the workspace has a published
  release to pin rather than a bare SHA.

## [0.20.2] - 2026-09-22

### Changed

- **No library change ships in this release**, for the second release running.
  The three commits since 0.20.1 are documentation and capture tooling:
  [#137](https://github.com/khaos-studio/khaotik-ui/pull/137) (attribution
  rules), [#138](https://github.com/khaos-studio/khaotik-ui/pull/138)
  (`CURRENT.md`, `MEMORY.md`, `AGENTS.md`) and
  [#139](https://github.com/khaos-studio/khaotik-ui/pull/139)
  (`apps/catalog/scripts/`). No token, component, export or type is touched,
  and the published surface is byte-identical to 0.20.1 and to 0.20.0.

  Verified rather than asserted — this diff is empty:

  ```sh
  git diff lib-0.20.1..lib-0.20.2 -- components/ tokens/ package.json
  ```

  The version moves anyway because consumers pin a `lib-*` tag, which is the
  same reason 0.20.1 moved. A consumer reading their dependency string should
  see a number that advances with the repository rather than a SHA nobody can
  date.

  **What #139 fixes is real, but it is not shipped to you.**
  `apps/catalog/scripts/fetch-kspd.sh` truncated a committed fixture to zero
  bytes whenever a capture failed, because `>` opens its target before the
  producer runs. That script is catalog tooling and is not part of the
  published package.

## [0.20.1] - 2026-09-22

### Changed

- **No library change ships in this release.** The only commit since 0.20.0
  ([#135](https://github.com/khaos-studio/khaotik-ui/pull/135)) rewrites one
  comment block in `justfile` so it no longer describes recipes that were
  never in this file. No token, component, export or type is touched, and the
  published surface is byte-identical to 0.20.0.

  The version moves anyway because consumers pin a `lib-*` tag: without a tag
  there is no name for this commit, and the alternative is a bare SHA, which
  is the pin style that went 24 commits stale unnoticed.

## [0.20.0] - 2026-09-21

### Changed

- **`--text-tertiary` is withdrawn from text below the 24px large-text
  threshold: 65 rules across 29 components now use `--text-secondary`**
  ([#66](https://github.com/khaos-studio/khaotik-ui/issues/66), D64).

  **Colour only.** No DOM, size, spacing or reading-order change — every rule
  keeps its selector and all its other declarations. Consumers should expect
  rendered colour to change across most of the library at once.

  **The defect is a tier violation, not dimness.** `tokens/tokens.css:169` and
  `:232` both set `--text-tertiary: var(--warm-400)` — **one value against four
  grounds** — while every other member of the semantic text tier flips with the
  theme. At 11px, where the WCAG SC 1.4.3 bar is 4.5:1, it measures **3.29**
  (dark raised) / **3.61** (dark base) / **4.56** (light raised) / **4.09**
  (light base), failing three of four. `--text-secondary` measures 6.86 / 7.53 /
  8.29 / 7.44 and clears everywhere.

  **Direction of travel is not uniform.** In light mode `--text-secondary` is
  `--warm-500`, which is *darker* than the `--warm-400` it replaces, so some
  light-theme surfaces read **heavier** rather than quieter. That is expected.

  `RelationshipGraph.svelte:147` is called out: at **10px** it is the smallest
  text in the changed set and takes the same 4.5:1 bar with less margin than
  anything else. Its `10px` literal **stays** — the kit's smallest step is 11px
  and inventing a `--label-xs` would fabricate a token; only the colour moves.

  **`--text-tertiary` is NOT deprecated.** It remains supported above the 24px
  threshold, on genuinely decorative content, under the SC 1.4.3 exemption for
  inactive controls, and as a `color-mix` input to a derived token
  (`--illustration-ink`). Eight rules keep it, listed with their computed sizes
  and reasons in `apps/catalog/src/data/contrast-allow.json`.

  **A third text step is owed.** The hierarchy compresses from three rungs to two
  across most of the library; the sharpest casualty is `LabeledField`, whose
  tertiary label and secondary value are now one colour (the `dl`/`dt`/`dd`
  structure still carries the relationship for assistive technology). The
  replacement step must be **mode-aware — two values, since a single one
  reproduces this bug** — must clear 4.5:1 at 11px on both `--surface-base` and
  `--surface-raised` in its own theme, and must be visibly quieter than
  `--text-secondary`. Reported, **not minted**: the value is Andrew's. Tracked as
  [#75](https://github.com/khaos-studio/khaotik-ui/issues/75) and recorded in
  `docs/harvest-khaos-machine-tokens.md`.

- **The `derived` token comment in `tokens/tokens.json` is corrected.** It said
  *"illustration-ink points at SEMANTIC tokens, so it flips with the mode"* —
  true of the ground, false of the ink. `--illustration-ink` flips through
  `--surface-base` only, because 45% of the mix is a `--text-tertiary` that is
  identical in both theme blocks. Edited in `tokens.json` and rebuilt with
  `python3 tokens/build-tokens.py`; `tokens.css` is generated and is never
  hand-edited. No rendered output changes — no component consumes
  `--illustration-ink`.

### Added

- **Project activation is gated on a three-stage readiness rail, and entity
  extraction becomes a card action**
  ([#133](https://github.com/khaos-studio/khaotik-ui/pull/133)).

  `ProjectCard.svelte` renders an **Imported -> Parsed -> Indexed** rail beneath
  the pipeline badge, driven by a `step` field added to the existing
  `PACKAGE_STAGE_NO_CONTENT` and `PACKAGE_STAGE_LABELS` maps so label, tone and
  rail position still come from one source. `enriched` shares `indexed`'s third
  step: enrichment is a later capability, not a fourth prerequisite.

  **Activation follows the rail.** The activate control is `disabled` and the
  cover takes `filter: grayscale(1)` unless the stage is `indexed` or
  `enriched`, so a parsed project cannot be opened as though it were ready.

  **A parsed project gains an extraction action.** It is disabled throughout
  `starting`, `queued`, `extracting` and `finalizing`, and re-enabled only on
  `failed`, where it becomes a retry with its own icon - retry for failure, not
  a second way to re-issue work already in flight.

  **Progress counts are shown only when coherent.** A `completed`/`total`
  figure renders when both are integers, `total` is positive and
  `completed <= total`; a partial emission renders nothing rather than
  something wrong. The active rail segment animates, with a
  `prefers-reduced-motion` fallback.

  **Three new `Launcher.svelte` props** - `extractionStateFor`,
  `extractionProgressFor` and `onExtractProject` - are threaded through as
  per-project resolvers. Consumers on `lib-0.19.0` or earlier do not have
  them: `khaos-app` must pin `lib-0.20.0` to use the extraction surface.

- **An engine component reading is flagged when its version is not an exact
  release.** `hasExactReleaseVersion()` and `.launcher__reading--warning` mark a
  reading whose version does not match `^v?\d+\.\d+\.\d+$`, so a `-dirty`
  or status-only reading is visibly provisional rather than reading as a
  release.

- **A contrast calculator and a regression guard**
  (`apps/catalog/src/contrast.test.js`, `apps/catalog/src/contrast-guard.test.js`).
  The calculator reproduces D63's eight published ratios from the shipped tokens
  and asserts the large-text decision rule at its boundaries. The guard fails if
  any rule under `components/svelte/` declares `--text-tertiary` outside the
  hand-authored allow list, or if an allow-listed rule quietly stops declaring
  it. It is keyed by component + selector + occurrence ordinal, and its four
  cases — green, plus three mutations — are executed, not documented.

- **`apps/catalog/src/data/contrast-audit.json`** — the runtime measurement
  record: computed size, paint property, resolved ground and ratio for all 75
  split-selector keys, in both themes against both grounds. Measurement only;
  the guard never reads it.

- **`apps/catalog/src/data/contrast-allow.json`** — the eight rules that keep
  `--text-tertiary`, each with a reviewed reason. Hand-authored, **no
  generator**.

## Earlier releases

Releases before this file are recorded in the
[GitHub releases](https://github.com/khaos-studio/khaotik-ui/releases) and in
`docs/decisions.md`. Per-version sections in this file begin at `0.20.0`; releases `0.11.0` through
`0.19.0` are recorded only in the GitHub releases. `0.2.0` was the first
deliberate break (D58).

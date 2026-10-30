/**
 * Shared prop shapes — the types more than one component describes.
 *
 * When the API reference moved onto the components, eight shapes ended up
 * defined in twenty-five places: `StatusTone` seven times, `Scene` five,
 * `DialogueLine` three. That is not a tidiness complaint. Two of the
 * twenty-five had already drifted before the commit landed — the launcher component then typed
 * `analyzed_status` as `'complete'|'partial'|'unknown'|string`, which
 * TypeScript collapses to plain `string`, while `ProjectCard` typed the same
 * field correctly and receives those very objects; and `Voice.gender` was
 * `string` in one component and a five-value union in another. Both were caught
 * by a script comparing the copies, which is a bad way to find out.
 *
 * AGENTS.md records the precedent: there were two token parsers, they drifted,
 * and the drift shipped a crash. One definition, imported.
 *
 * And consolidating did not by itself make the surviving copy right. The
 * paragraph above names `ProjectCard` as the one that typed `analyzed_status`
 * correctly — then the canonical shape below was written with LAUNCHER's union,
 * `'complete'|'partial'|'unknown'`, and shipped that way through 0.11.0. A
 * `unknown` the producer cannot emit, and no `pending`, which is the state every
 * pre-LLM package is actually in. One definition is necessary and not
 * sufficient: it also has to be checked against the producer. (khaosd has since
 * removed the field; analysis now arrives per kind as `ProjectAnalysis`.)
 *
 * TYPES ONLY. This module has no runtime export and must never gain one — it is
 * reachable as a deep import, so anything evaluated here is evaluated in every
 * consumer. The `export {}` is what makes it a module rather than a script.
 *
 * Referenced from a component as:
 *
 *   @property {import('./lib/types.js').Scene} [scene]
 *
 * `build-types` emits `types.d.ts` beside this file the same way it does for
 * every other `lib/*.js`, so a consumer following that path lands on real
 * declarations rather than `any`. `check-types` fails if this file and the
 * generated one disagree.
 *
 * A shape used by ONE component stays in that component. This file is for the
 * shared ones, and adding a single-use type here moves it away from the code
 * that gives it meaning.
 */

/**
 * The kit's status vocabulary, seven-way. Not a subset of Bootstrap's five —
 * `accent` and `skipped` carry meaning the other five cannot express, and
 * `skipped` was added to `MetricCard` precisely because a skipped step had been
 * rendering as neutral grey. Maps to `--tone-*` in `tokens-extra.css`.
 * @typedef {'neutral'|'success'|'warning'|'danger'|'info'|'accent'|'skipped'} StatusTone
 */

/**
 * A background job running on a project, as the host knows it
 * (docs/design/project-card-progress.md, "Interface contract").
 * @typedef {Object} ProjectJob
 * @property {'import'|'extract'|'analyze-scenes'|'analyze-characters'|'analyze-places'} kind An analysis kind fills its own rail segment.
 * @property {'downloading'|'starting'|'queued'|'running'|'finalizing'|'failed'} phase `downloading` is import-only; `finalizing` is for extraction and analysis.
 * @property {{ readonly completed: number, readonly total: number }} [progress] Real counts only. Omit when the process has not emitted them.
 * @property {number} [elapsedMs] Measured from when the operator started the job.
 * @property {number} [remainingMs] A projection. Omit until there is one.
 */

/**
 * One analysis of a project as the host knows it — the `ProjectCard` rail's
 * last three segments. Report only what the engine says; an analysis the
 * engine does not report is omitted, not sent as `not-started`.
 * @typedef {Object} ProjectAnalysis
 * @property {'scenes'|'characters'|'places'} kind
 * @property {'not-started'|'partial'|'in-progress'|'done'|'failed'} state `partial`: some analysed, nothing running. `in-progress`: an analysis is running.
 * @property {{ readonly completed: number, readonly total: number }} [progress] Real counts only, e.g. scenes analysed of scenes in the story.
 */

/**
 * A project/story row, read verbatim by `ProjectCard` — the fields below are
 * the ones it renders. One `.kspd` is one story, so the project IS the story.
 * @typedef {Object} Project
 * @property {string} [id] Seeds the card's tint. Keyed on the id, never the title — a colour derived from a label moves whenever the label does, and two projects sharing a title share a colour.
 * @property {string} [path] Filesystem path to the `.kspd`; the tint's fallback key.
 * @property {string} [title]
 * @property {string} [logline]
 * @property {string} [summary] Used as the logline when there is no `logline`.
 * @property {string} [monogram] Overrides the monogram derived from the title.
 * @property {number} [scene_count]
 * @property {number} [character_count]
 * @property {number} [location_count]
 * @property {boolean} [needs_migration]
 * @property {boolean} [parsed]
 * @property {boolean} [ingested]
 * @property {string} [package_stage]
 * How far the package has been PROCESSED, which is a different axis from
 * analysis (`ProjectCard`'s `analyses`) and precedes it. RFC 0067 §2 (KSPD) defines the five
 * members and their total order, `empty < imported < parsed < indexed <
 * enriched`; the Go constants are `kspdprotocol.PackageStage*` in
 * `go/kspdprotocol/package_stage.go:37-49`, tagged `go/kspdprotocol/v0.24.0`.
 *
 * `empty` carries no screenplay content · `imported` has source text and no
 * parse projection · `parsed` has a projection with at least one element ·
 * `indexed` has entities reachable BY ID · `enriched` has had deterministic
 * enrichment run over them. All five are PRE-LLM: none of them says anything
 * about analysis, which `ProjectCard`'s `analyses` reports.
 *
 * **The union is OPEN, and that is not laxity — a closed one would be false
 * about the wire.** Two values reach a consumer that five members cannot
 * express.
 *
 * **The empty string, and this is the one that decides it.** `StageForPackage`
 * returns the zero `Stage` at four sites, two of which return a nil error and so
 * reach khaos-manager's assignment; the field carries **no `omitempty`** — deliberately, so a client
 * can distinguish "the daemon reported no claim" from "the daemon did not
 * report". Its own docblock: *"The empty string means NO CLAIM and is NOT the
 * `empty` member, which is a positive assertion that the package carries no
 * screenplay content."*
 *
 * RFC 0067 **§8 clause 2** is the governing text: *"A consumer MUST tolerate
 * its absence and MUST NOT treat absence as `empty`. Absence means unrecorded;
 * `empty` is a positive claim."* It establishes that unrecorded and `empty` are
 * different states a consumer may not merge — and `''` is how unrecorded
 * ARRIVES, since the producer sends the key regardless.
 *
 * Be exact about what that does and does not prove, because an earlier version
 * of this sentence overreached. Clause 2 forbids treating ABSENCE as `empty`; a
 * closed OPTIONAL union still offers `undefined` as an absence seat, so it does
 * not force the forbidden conflation outright. What it does is make the wire's
 * actual representation of absence — `''` — unrepresentable, which is a defect
 * of a different kind and is why the decision rests on the wire measurements
 * beside it rather than on the clause alone.
 *
 * And `''` is the COMMON pre-LLM case, not an edge: every package the reader
 * cannot place arrives that way.
 *
 * A reader must therefore test the VALUE, not its presence: `'package_stage' in
 * project` is true for `''`.
 *
 * **A future member** is the second reason and the weaker one:
 * `StageForPackage` returns `record.PackageStage` straight from decoded JSON
 * with no parse step (`package_stage.go:297`), so one arrives unfiltered.
 *
 * **Not §8.3.** An earlier version of this paragraph rested the type shape on
 * §8.3, which reads *"a consumer pinned to an older client must degrade rather
 * than fail"* — a RUNTIME obligation that says nothing about type shape, and
 * which states in the same breath that the vocabulary is closed today. It was
 * cited across three repositories before anyone read it against the claim it was
 * being used to support. Clause 2 and the wire measurements are the support;
 * §8.3 governs the component's runtime branch and belongs there.
 *
 * **Typed `string`, with the five members named in this docblock and nowhere
 * else in the type.** That is the honest shape, arrived at by measurement after
 * two wrong answers.
 *
 * A closed union was tried first and is wrong: it would be FALSE about the wire,
 * which carries both a future member and `''`. The
 * `'empty'|...|'enriched'|(string & {})` trick was tried second, on the usual
 * claim that it opens the type while editors keep suggesting the five. Through
 * this package it does neither of the useful things:
 * `Extract<Project['package_stage'], 'empty'>` resolves to `never` from a
 * consumer's side, so the members do not survive to the people the trick exists
 * to help. Measured non-vacuously — an earlier check asserted
 * `const x: Extract<…> = e`, which PASSES when the extract is `never`, because
 * `never` is assignable to everything. A tuple assignment is the form that can
 * fail, and it did.
 *
 * So the intersection would have bought a false sentence in this docblock and
 * nothing else. `string` says exactly what is true: any string may arrive, and
 * the five below are the ones this build knows.
 *
 * There is nothing for a type to reject here in any case, and the reason is the
 * wire rather than a clause: values outside the five genuinely arrive — `''`
 * (see the four sites above; two return a nil error and so reach the
 * assignment), and an unrecognised member unfiltered. A type that rejected them
 * would be rejecting reality.
 *
 * Cross-referenced rather than restated. This sentence carried its own copy of
 * that count, said "three", and survived the round that corrected the number
 * sixty lines up — one fact written twice drifts at the first edit, which is the
 * same defect `lib/types.js` exists to prevent one level down.
 *
 * The guarantee therefore lives in the reading component's runtime branch,
 * which renders an unrecognised member as itself in the neutral tone and treats
 * `''` as no claim. That branch is tested directly and mutation-proven, and it
 * is where §8.3's degrade-rather-than-fail obligation actually applies.
 *
 * This is NOT the defect W-12 named at khaos-app's `engine-project.ts` (since
 * fixed). That one's mistake was a `| string` arm concealing NAMED MEMBERS THAT
 * WERE WRONG on a field whose complete set the producer defines. Here the
 * producer does not define the complete set, and no member is claimed in the
 * type at all.
 *
 * **The stage regresses** (RFC 0067 §2). Re-importing a new draft legitimately
 * returns a package to `parsed`, so this field moving backwards is correct
 * behaviour and not a producer bug.
 *
 * Named `package_stage` rather than `stage` deliberately: RFC 0067 §2.1 —
 * `events/event.schema.json` already defines `data.stage` as the RFC 0004
 * First-Pass Stage id, a workflow step rather than a package's progress.
 * @property {boolean} [git_repo]
 * @property {boolean} [git_has_remote]
 * @property {boolean} [git_has_upstream]
 * @property {number} [git_ahead_count] Optional, and khaosd 0.4.11 does not return it. With both counts absent the git chip renders nothing rather than claiming `synced`, which would be a fabricated value.
 * @property {number} [git_behind_count] See `git_ahead_count`.
 * @property {number} [modified] Unix seconds; drives the recency line.
 */

/**
 * One engine, as `GET /api/services` reports it.
 * @typedef {Object} Service
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [label] The product name where the caller has one. khaosd's
 *   /api/services does not send it; a host that has resolved one passes it and the
 *   plate renders it in place of the identifier (`EngineDetails`). Never
 *   invented by the library — absent means the identifier shows.
 * @property {'running'|'starting'|'stopping'|'stopped'|'error'|(string & {})} state The five states khaosd emits (manager.go:20-24), plus a documented tail. The five are named because naming them is the point — `stopping` folded to `running` claims an engine is up while it is shutting down, and folded to `stopped` claims it is already down (#51). The tail carries a state string newer than this client verbatim rather than guessing at it.
 * @property {number} [port]
 * @property {boolean} [provisioned]
 * @property {boolean} [ready_to_use]
 * @property {boolean} [start_with_khaos] khaosd's per-engine "start with Khaos" opt-in (BA-R9), served on each `/api/services` row under Advanced. Absent when the daemon does not send it.
 * @property {string} [reason] The engine's own failure sentence. Sent only when `state` is `error` (lifecycle.go:273). Rendered verbatim and never truncated.
 * @property {string} [log_path] Where khaosd expects this service's log to be — `~/.khaos/logs/<id>.log`, CONSTRUCTED, not probed (lifecycle.go:280). The daemon does not check that the file exists, and on a pre-launch failure it does not. Render it as the conventional location, never as "the crash output".
 */

/**
 * A casting profile from the host's catalog slice.
 * @typedef {Object} Voice
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [language]
 * @property {'male'|'female'|'neutral'|'variable'|''} [gender] The values the gender filter offers; anything else never matches a filter other than "All".
 * @property {string} [ageRange] Underscored values are prettified for display — `middle_aged` renders as "Middle aged".
 * @property {string} [tone]
 * @property {string} [accent]
 * @property {readonly string[]} [personalityTags] Rendered as chips in the detail pane, and searched.
 * @property {readonly string[]} [tags] Searched, not rendered.
 * @property {string} [provider] Display name; also what the provider filter groups by.
 * @property {string} [providerId] Matched against `providerStatus` to resolve render-readiness.
 * @property {string} [qualityTier] `premium` (compared case-insensitively) marks the voice premium; anything else reads as standard.
 * @property {string} [sampleURL] Without it the audition button renders disabled.
 */

/**
 * A character, as the lists render them. The counts are the real pipeline
 * figures — without them a character view has no Lines/Words/Scenes counts
 * to show.
 * @typedef {Object} Character
 * @property {string} [id]
 * @property {string} name Also the key into an `analyses` map.
 * @property {number} [dialogue_lines]
 * @property {number} [word_count]
 * @property {number} [scene_count]
 * @property {number} [percentage] This character's share of the dialogue, as khaosd serves it. A number, not a formatted string — the caller decides precision and suffix.
 * @property {'parsed'|'authored'|'observed'} [origin] WHERE THIS ENTITY CAME FROM, and khaosd serves it: `parsed` was lifted from the screenplay text, `authored` was written by a person, `observed` was inferred by the machine from context.
 *
 *   **It is provenance, not confidence, and the difference is the whole point.** On any package minted before khaos-tools#764, `authored` is ALSO a machine's word and can no longer be corrected — so a surface that renders this as trustworthy-versus-not is making a claim the data does not support. Render where a name came from; let the reader draw the conclusion.
 *
 *   A member this build does not recognise renders as itself, making no claim, the same way `package_stage` does on `ProjectCard`. Absent means the producer said nothing, which is not the same as `authored`.

 * @property {readonly {src?: string, caption?: string, gender?: string, age?: string}[]} [images]
 */

/**
 * A dialogue line, as the engine serves it.
 * @typedef {Object} DialogueLine
 * @property {string} [element_id] Stable line id — the row key.
 * @property {string} [scene_id] The scene the line belongs to; rows group by it.
 * @property {string} [scene_slugline] The group heading.
 * @property {string} [text] The spoken line.
 * @property {string} [parenthetical] The line's parenthetical direction, if any.
 */

/**
 * A location, as the lists render them.
 * @typedef {Object} Location
 * @property {string} [id] Stable entity key — the row key and the thumbnail's identity seed.
 * @property {string} [name] The location's name; also the key into `analyses`.
 * @property {string} [type] Optional row subtitle.
 * @property {number} [scene_count] Renders as the row's trailing count.
 * @property {'parsed'|'authored'|'observed'} [origin] WHERE THIS ENTITY CAME FROM, and khaosd serves it: `parsed` was lifted from the screenplay text, `authored` was written by a person, `observed` was inferred by the machine from context.
 *
 *   **It is provenance, not confidence, and the difference is the whole point.** On any package minted before khaos-tools#764, `authored` is ALSO a machine's word and can no longer be corrected — so a surface that renders this as trustworthy-versus-not is making a claim the data does not support. Render where a name came from; let the reader draw the conclusion.
 *
 *   A member this build does not recognise renders as itself, making no claim, the same way `package_stage` does on `ProjectCard`. Absent means the producer said nothing, which is not the same as `authored`.
 * @property {readonly any[]} [images] Feeds the inspector's gallery for the selected location.
 */

export {}

/**
 * A fix a refused action offers.
 * @typedef {Object} RefusalFix
 * @property {string} kind A stable key for the fix; reported back unchanged.
 * @property {string} label What the button says.
 */

/**
 * A refused action and the fixes it offers, as RefusalOffer draws it.
 * @typedef {Object} Refusal
 * @property {string} headline What was refused, in a line.
 * @property {string} [detail] khaosd's reason, verbatim.
 * @property {readonly RefusalFix[]} fixes The fixes on offer, in order. May be empty.
 */

/**
 * One committed image of a subject.
 * @typedef {Object} SubjectImage
 * @property {string} referenceId The image's reference id; reported on activation.
 * @property {string} label Its caption.
 */

/**
 * Where a subject's images read is.
 * @typedef {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded', rows: readonly SubjectImage[] }} SubjectImagesRead
 */

/**
 * Where a character's recordings read is (`/api/v1/audio/assets?characterId`).
 * @typedef {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded', recordings: readonly import('./recordings.js').Recording[] }} RecordingsRead
 */

/**
 * One wording a character is named by through its bound references, as khaosd groups them
 * (`/api/v1/dashboard/character-mentions`).
 * @typedef {Object} CharacterMention
 * @property {string} wording
 * @property {number} count
 * @property {readonly string[]} sceneIds
 */

/**
 * Where a character's mentions read is.
 * @typedef {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded', mentions: readonly CharacterMention[] }} MentionsRead
 */

/**
 * A mention still bound through an alias that was removed or rejected.
 * @typedef {Object} BoundMention
 * @property {string} id
 * @property {string} name
 * @property {string} sceneId
 * @property {number} lineNumber 1-based.
 * @property {string} lineText
 */

/**
 * Mentions still bound through an alias that was removed or rejected: what a correction moves.
 * @typedef {Object} Stranded
 * @property {string} characterId
 * @property {string} characterName
 * @property {string} alias
 * @property {readonly BoundMention[]} mentions
 */

/**
 * Where a corrected bind goes: a character the story holds, or a new one khaosd mints.
 * @typedef {{ kind: 'existing', characterId: string } | { kind: 'new' }} BindTarget
 */

/**
 * The engine's standing for an analysis that may also be refused: a scene's.
 * @typedef {Object} SceneStanding
 * @property {string} state khaosd's analysis state.
 * @property {readonly string[]} [reasons] What changed, for a stale one.
 * @property {readonly string[]} [details] A note under each reason.
 * @property {string} [refusal] Why the engine will not analyse the scene, in its words.
 */

/**
 * Where a place's or object's design stands. `chosen` carries the chosen design's first image:
 * its resolved URL, or why it could not be read; null when the design has no image.
 * @typedef {{ kind: 'reading' } | { kind: 'none' } | { kind: 'awaiting' } | { kind: 'chosen', image: { url: string, error?: string } | null }} DesignState
 */

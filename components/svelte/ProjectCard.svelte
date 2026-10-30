<script module>
  // The five members of RFC 0067 §2. A lookup, not an ordered array: this
  // component needs to LABEL a member, never to compare two, and an array here
  // would be a second copy of a canonical order that Go owns.
  //
  // A Map rather than an object literal, and that is a fix rather than a style
  // choice. `LABELS[project.package_stage]` reaches Object.prototype, so a
  // package_stage of `toString` or `constructor` returned a truthy function, the
  // `??` fallback never fired, and the chip rendered with an EMPTY label and no
  // `data-tone` attribute at all — measured, not theorised. RFC 0067 §8.3
  // requires a consumer to degrade rather than break on a member it does not
  // recognise, and a blank untoned chip is neither the member nor a claim. A Map
  // has no prototype chain to fall through.
  //
  // `<script module>` because it is shared by every instance and never changes;
  // in the instance block it was rebuilt per card.
  // The two members that assert there is NO parsed content. Held apart from the
  // Map below, and that separation is load-bearing rather than tidy: the Map is
  // also the test for "does this member entail a parse projection?", used by the
  // `!parsed` rung. `empty` asserts the exact opposite, so it must never be able
  // to satisfy that guard.
  const PACKAGE_STAGE_NO_CONTENT = new Map([
    ['empty', { label: 'Empty', tone: 'neutral', step: 0 }],
    ['imported', { label: 'Imported', tone: 'neutral', step: 1 }],
  ])

  // The three members that CONCEDE content exists. Membership here means two
  // things at once and deliberately so: this build knows what the member means,
  // and the member entails a parse projection (RFC 0067 §2's order is total, so
  // `indexed` and `enriched` both entail `parsed`). One source for both
  // questions — no second list, no ordinal, nothing to drift.
  const PACKAGE_STAGE_LABELS = new Map([
    ['parsed', { label: 'Parsed', tone: 'info', step: 2 }],
    ['indexed', { label: 'Indexed', tone: 'info', step: 3 }],
    ['enriched', { label: 'Enriched', tone: 'info', step: 3 }],
  ])

  // The rail, in order. Imported → Parsed → Indexed is the complete import
  // flow (enrichment is a later capability, not a fourth prerequisite for
  // opening the project); the three analyses follow it. A segment's index is
  // its position here.
  const RAIL_SEGMENTS = ['Import', 'Parse', 'Index', 'Analyze scenes', 'Analyze characters', 'Analyze places']
  const IMPORT_SEGMENTS = 3

  // An analysis's segment, by the `kind` the host reports it under. A Map, so
  // `toString` finds nothing and the segment makes no claim.
  const ANALYSIS_SEGMENTS = new Map([['scenes', 3], ['characters', 4], ['places', 5]])
  // `partial` is some analysed and nothing running (Breaking Even, 2026-10-14: one scene
  // of 53 read "Analyzing scenes 1/53" with no job); `in-progress` is work running.
  const ANALYSIS_STATES = new Set(['not-started', 'partial', 'in-progress', 'done', 'failed'])

  // An analysis job's kind → [segment, noun].
  const ANALYSIS_JOBS = new Map([
    ['analyze-scenes', [3, 'scene']],
    ['analyze-characters', [4, 'character']],
    ['analyze-places', [5, 'place']],
  ])

  // A job's status line, by kind and then phase (docs/design/
  // project-card-progress.md, "Copy"). Maps for the reason the stage tables
  // are: an unknown kind or phase — including `toString` — finds nothing, so
  // the card renders no job and falls back to the stage chip.
  const JOB_LABELS = new Map([
    ...[...ANALYSIS_JOBS].map(([kind, [, noun]]) => [kind, new Map([
      ['starting', `Starting ${noun} analysis…`],
      ['queued', `${noun[0].toUpperCase()}${noun.slice(1)} analysis queued`],
      ['running', `Analyzing ${noun}s`],
      ['finalizing', `Finalizing ${noun} analysis…`],
      ['failed', `${noun[0].toUpperCase()}${noun.slice(1)} analysis failed`],
    ])]),
    ['import', new Map([
      ['downloading', 'Downloading from iCloud'],
      ['starting', 'Starting import…'],
      ['queued', 'Import queued'],
      ['running', 'Importing screenplay'],
      ['failed', 'Import failed'],
    ])],
    ['extract', new Map([
      ['starting', 'Starting extraction…'],
      ['queued', 'Extraction queued'],
      ['running', 'Extracting entities from scenes'],
      ['finalizing', 'Finalizing extraction…'],
      ['failed', 'Extraction failed'],
    ])],
  ])

  // The extract action's accessible name while an extraction is in flight.
  const EXTRACT_ACTIONS = new Map([
    ['starting', (t) => `Starting extraction for ${t}`],
    ['queued', (t) => `Extraction queued for ${t}`],
    ['running', (t) => `Extracting entities from ${t}`],
    ['finalizing', (t) => `Finalizing extraction for ${t}`],
  ])

  // A `{ completed, total }` pair that can be true, or null. A pair that
  // cannot be — zero total, negative, fractional, more done than exist — is
  // not a smaller number, it is no number.
  function validCount(progress) {
    const completed = progress?.completed
    const total = progress?.total
    if (!Number.isInteger(completed) || !Number.isInteger(total) || completed < 0 || total <= 0 || completed > total) return null
    return { completed, total }
  }

  // The status label's analysis rung, from the analyses by rail index: all
  // three done is `Complete`; otherwise the first analysis in rail order that
  // is not done names the label — in progress or failed, with its own count.
  // One not started or not reported makes no claim, so the stage speaks. The
  // copy is the analysis job's own, so a report and a live job read alike.
  function analysisStatus(byIndex) {
    const segments = [...ANALYSIS_SEGMENTS.values()]
    if (segments.every((i) => byIndex.get(i)?.state === 'done')) return { label: 'Complete', tone: 'success' }
    for (const [kind, i] of ANALYSIS_SEGMENTS) {
      const a = byIndex.get(i)
      if (a?.state === 'done') continue
      const count = validCount(a?.progress)
      const counted = count ? { progress: `${count.completed}/${count.total}` } : {}
      if (a?.state === 'partial') return { label: `${kind[0].toUpperCase()}${kind.slice(1)} analyzed`, tone: 'neutral', ...counted }
      if (a?.state !== 'in-progress' && a?.state !== 'failed') return null
      const failed = a.state === 'failed'
      const label = JOB_LABELS.get(`analyze-${kind}`).get(failed ? 'failed' : 'running')
      return { label, tone: failed ? 'danger' : 'warning', ...counted }
    }
    return null
  }
</script>

<script>
  import MetaStrip from './MetaStrip.svelte'
  import Icon from './Icon.svelte'
  import { identityColor } from './lib/identity.js'
  import { formatElapsed, formatRemaining } from './lib/duration.js'

  // The story/project card (khaos.machine.x LauncherView). A project IS a story
  // in Khaos — one `.kspd` is one story — so this card carries the story identity
  // (monogram cover, title, logline when analysis provides one) and the project
  // state (pipeline status, counts, git, recency) in a single surface.
  /** @typedef {import('./lib/types.js').Project} Project */

  /**
   * @typedef {Object} Props
   * @property {Readonly<Project>} [project] The project/story: `{ title?, logline?, summary?, scene_count?, character_count?, location_count?, monogram?, parsed?, ingested?, needs_migration?, package_stage?, git_repo?, git_has_remote?, git_has_upstream?, git_ahead_count?, git_behind_count?, modified? }`. `package_stage` (RFC 0067 §2, KSPD) is how far the package has been PROCESSED — `empty` | `imported` | `parsed` | `indexed` | `enriched`, and any member a later producer adds. The chip reports the **furthest position known to be true**: `empty` and `imported` outrank even a completed analysis, because they assert there is nothing to analyse and no reader infers them, so a `complete` behind one is stale. `parsed` | `indexed` | `enriched` sit BELOW progressed analysis — they concede content exists, so they cannot contradict a count of work done over it. Analysis progress comes from `analyses`, the same reports the rail draws: all three done reads `Complete`, and otherwise the first analysis in rail order that is in progress or failed names the label with its own count (`Analyzing scenes 56/57`). A member this build does not recognise renders as itself in the neutral tone, making no claim, and sits below analysis too. An empty string is NO CLAIM, not the `empty` member; a parsed package with no stage reads `Parsed`. **The ahead/behind counts are optional and khaosd 0.4.11 does not return them** — with both absent the git chip renders nothing rather than claiming `synced`, which would be a fabricated value.
   * @property {string} [cover] Cover art (1x). With a cover the monogram is replaced and a per-project identity tint is laid over the image, so a grid of cards stays scannable when every project shares placeholder art. Without one, the card keeps its monogram.
   * @property {string} [coverSrcset] Optional srcset for higher-density displays. Omitted entirely when empty — an empty srcset is a candidate list browsers can fail to resolve.
   * @property {(event: MouseEvent) => void} [onOpen] Invoked when the card surface is activated.
   * @property {(event: MouseEvent) => void} [onRemove] When set, shows **Remove from Recents** and binds its invocation. It removes the project from the host's recent list and never deletes it: a person deletes a project in the Finder (project portability plan, D1). Hidden when omitted.
   * @property {(event: MouseEvent) => void} [onInitGit] When set **and the project has no repo**, shows the git-init button and binds its invocation. Not offered once `project.git_repo` is true — there is nothing to initialise. This prop was previously accepted and never used: the card took the handler and dropped it, so a launcher wiring git-init got silence.
   * @property {import('./lib/types.js').ProjectJob} [job] A background job running on this project — an import or an extraction — as the host knows it. Omit when there is none, and the card shows the package stage. It outranks the stage chip whatever the stage is. An unknown `kind` or `phase` renders no job. During an import the meta row and every action are hidden. Durations that are not finite and non-negative render nothing; the timing sits in the `aria-hidden` footer, so a value refreshed every second is never announced.
   * @property {(event: MouseEvent) => void} [onExtract] Invoked by the parsed-package extraction action, offered with no job or a failed extraction.
   * @property {readonly import('./lib/types.js').ProjectAnalysis[]} [analyses] What the host knows of the three analyses — scenes, characters, places — drawn as the rail's last three segments, placed by `kind`. An analysis that is absent, or whose `kind` or `state` this build does not recognise, renders as an empty segment titled "not reported", never as "not started". A live analysis `job` outranks the report for its segment.
   * @property {import('svelte').Snippet} [children] The host's content below the footer — what a failed job offers (a fix, Report a Problem…), which only the host can choose. Rendered whatever the job, raised above the card's activate overlay so its controls take the click, and outside the `aria-hidden` footer so they are announced. Omit it and the card draws no empty slot.
   */

  /** @type {Props} */
  let {
    project = {},
    // Cover art. `cover` is the 1x source; `coverSrcset` is an optional srcset for
    // higher-density displays. With neither, the card keeps its monogram — a consumer with
    // no art must not get a blank hero.
    cover = '',
    coverSrcset = '',
    onOpen = undefined,
    onRemove = undefined,
    onInitGit = undefined,
    job = undefined,
    onExtract = undefined,
    analyses = undefined,
    children = undefined,
  } = $props()

  const describeId = $props.id()

  // The job, if this build knows what it means; null otherwise.
  const activeJob = $derived.by(() => {
    const label = JOB_LABELS.get(job?.kind)?.get(job?.phase)
    return label ? { kind: job.kind, phase: job.phase, label } : null
  })
  const isImport = $derived(activeJob?.kind === 'import')

  // A count is shown where the Copy table says so: a running job, and an
  // extraction's or analysis's finalizing and failed phases, which keep the
  // last value.
  const jobCount = $derived.by(() => {
    if (!activeJob) return null
    const { phase, kind } = activeJob
    const shows = phase === 'running' || (kind !== 'import' && (phase === 'finalizing' || phase === 'failed'))
    return shows ? validCount(job.progress) : null
  })

  // A failed job shows no clock: a frozen one reads as a stalled one.
  const elapsedText = $derived(activeJob && activeJob.phase !== 'failed' ? formatElapsed(job.elapsedMs) : '')
  const remainingText = $derived.by(() => {
    if (activeJob?.phase !== 'running') return ''
    const remaining = formatRemaining(job.remainingMs)
    if (remaining) return `${remaining} left`
    // A figure is coming whenever the count is moving.
    return activeJob.kind !== 'import' && jobCount ? 'estimating time left' : ''
  })

  // What the activate button is described by: the status and the count, never
  // a time. Not a live region, so it is read when the button is reached.
  const jobDescription = $derived(
    activeJob ? activeJob.label + (jobCount ? `, ${jobCount.completed} of ${jobCount.total}` : '') : '',
  )

  // `onInitGit` was accepted and then never used — the card took the handler and
  // dropped it, so the host's `onInitGit={() => onInitGit?.(project)}` reached a
  // component with nothing to fire it. A prop that is read and ignored is worse
  // than a missing one: the consumer's wiring looks done.
  //
  // Offered only where it means something. A project that already has a repo
  // cannot be initialised, and showing the control there would be an action that
  // either no-ops or does something surprising — the same shape as the pipeline
  // badge, which reports the state rather than every state's control.
  const showInitGit = $derived(!!onInitGit && !project.git_repo)
  const canActivate = $derived(project.package_stage === 'indexed' || project.package_stage === 'enriched')

  const title = $derived(project.title ?? 'Untitled story')
  // Offered at `parsed` with no job or a failed extraction; disabled while an
  // extraction is in flight, so a second run cannot be started. An import
  // offers nothing.
  // An analysis job is no extraction: it neither disables nor retries one.
  const extractJob = $derived(activeJob?.kind === 'extract' ? activeJob : null)
  const extractionAction = $derived.by(() => {
    if (project.package_stage !== 'parsed' || isImport) return null
    if (extractJob?.phase === 'failed') return { label: `Retry extraction for ${title}`, disabled: false, retry: true }
    if (extractJob) return { label: EXTRACT_ACTIONS.get(extractJob.phase)(title), disabled: true }
    return { label: `Extract ${title}`, disabled: false }
  })

  // What the host reports per analysis segment, by index. First report of a
  // kind wins; an unknown kind or state reports nothing.
  const reportedAnalyses = $derived.by(() => {
    const byIndex = new Map()
    for (const a of Array.isArray(analyses) ? analyses : []) {
      const index = ANALYSIS_SEGMENTS.get(a?.kind)
      if (index !== undefined && ANALYSIS_STATES.has(a.state) && !byIndex.has(index)) byIndex.set(index, a)
    }
    return byIndex
  })

  // The six segments, each `{ label, done, active, waiting, failed, fraction,
  // title }`, or null when the card knows neither a stage nor a job.
  const rail = $derived.by(() => {
    const key = typeof project.package_stage === 'string' ? project.package_stage.trim() : ''
    const stage = PACKAGE_STAGE_NO_CONTENT.get(key) ?? PACKAGE_STAGE_LABELS.get(key)
    if (!stage && !activeJob) return null

    // A job places its own segment: an import is segment 1, then 2 once the
    // engine runs it; an extraction is segment 3; an analysis is its own. An
    // import or extraction also says how far the import flow got (an import's
    // row has no stage at all, so the job is read first); an analysis job
    // leaves that to the stage.
    //
    // `fraction` is the active segment's own completion, 0..1, and it is the
    // SAME number the count prints as `31/107` — the rail and the count are one
    // fact. Null when nothing is counted, which is a different state from zero:
    // the segment keeps its indeterminate shimmer, which says work is happening
    // and its extent is unknown. Filling it to 0% would claim no progress.
    // Finalizing has no measurable extent, so it shimmers over a frozen count.
    let jobStep = -1
    if (activeJob) {
      const { kind, phase } = activeJob
      jobStep = ANALYSIS_JOBS.get(kind)?.[0] ?? (kind === 'extract' ? 2 : phase === 'running' ? 1 : 0)
    }
    const importDone = jobStep >= 0 && jobStep < IMPORT_SEGMENTS ? jobStep : stage?.step ?? 0
    const fractionOf = (count) => (count ? count.completed / count.total : null)
    const ofCount = (count) => (count ? `, ${count.completed} of ${count.total}` : '')

    return RAIL_SEGMENTS.map((label, i) => {
      const segment = { label, done: false, active: false, waiting: false, failed: false, fraction: null, title: '' }
      if (i === jobStep) {
        const { phase } = activeJob
        const filled = (phase === 'running' || phase === 'failed') && jobCount
        const word = phase === 'queued' ? 'queued' : phase === 'failed' ? 'failed' : 'in progress'
        return {
          ...segment,
          active: true,
          waiting: phase === 'queued',
          failed: phase === 'failed',
          fraction: filled ? fractionOf(jobCount) : null,
          title: `${label}: ${word}${ofCount(jobCount)}`,
        }
      }
      if (i < IMPORT_SEGMENTS) {
        const done = i < importDone
        return { ...segment, done, title: `${label}: ${done ? 'done' : 'not started'}` }
      }
      const reported = reportedAnalyses.get(i)
      if (!reported) return { ...segment, title: `${label}: not reported` }
      const count = validCount(reported.progress)
      switch (reported.state) {
        case 'done':
          return { ...segment, done: true, title: `${label}: done` }
        case 'partial':
          return { ...segment, fraction: fractionOf(count), title: `${label}: partly done${ofCount(count)}` }
        case 'in-progress':
          return { ...segment, active: true, fraction: fractionOf(count), title: `${label}: in progress${ofCount(count)}` }
        case 'failed':
          return { ...segment, active: true, failed: true, fraction: fractionOf(count), title: `${label}: failed${ofCount(count)}` }
        default:
          return { ...segment, title: `${label}: not started` }
      }
    })
  })

  function handleExtract(event) {
    event.stopPropagation()
    onExtract?.(event)
  }
  const logline = $derived(project.logline ?? project.summary ?? '')
  const scenes = $derived(project.scene_count ?? 0)
  const characters = $derived(project.character_count ?? 0)
  const locations = $derived(project.location_count ?? 0)

  // The strip's items. `label` is the COMPLETE phrase rather than a category —
  // it is what a screen reader hears and what the tooltip shows, and a glyph
  // beside a bare number is legible to nobody who does not already know the
  // glyph. Singular and plural are spelled out because "1 characters" is the
  // kind of thing a reader notices and stops trusting the surface over.
  //
  // Every glyph verified present in `@phosphor-icons/web`. D75 records two that
  // were not — `text-bubble` and `text-format`, 0/0 in both sheets — rendering
  // nothing at all in two shipped cards.
  const plural = (n, one, many) => (n === 1 ? one : many)
  // CHARACTERS LEAD (D76). The order was scenes first until 2026-09-24, which
  // was never a decision — it was the order the counts happened to be written
  // in, on the most-read surface the kit ships. K's standing direction is that
  // the perspective of storybuilding is character-centric: a writer is building
  // people, and scenes are the evidence. Where a surface lists the story's
  // entities and has a free choice about order, characters come first.
  //
  // `scenes` still renders unconditionally while `characters` and `locations`
  // are conditional, so a project with no cast reads "54 scenes" rather than
  // leading with an absence.
  const metaItems = $derived([
    ...(characters
      ? [{ text: String(characters), icon: 'users', label: plural(characters, 'character', 'characters'), title: `${characters} ${plural(characters, 'character', 'characters')}`, numeric: true }]
      : []),
    { text: String(scenes), icon: 'film-slate', label: plural(scenes, 'scene', 'scenes'), title: `${scenes} ${plural(scenes, 'scene', 'scenes')}`, numeric: true },
    ...(locations
      ? [{ text: String(locations), icon: 'map-pin', label: plural(locations, 'location', 'locations'), title: `${locations} ${plural(locations, 'location', 'locations')}`, numeric: true }]
      : []),
    ...(relTime ? [{ text: relTime, icon: 'clock', label: 'modified', title: `Modified ${relTime}` }] : []),
  ])

  const monogram = $derived(project.monogram ?? deriveMonogram(title))

  // The per-project tint over the cover. Keyed on the project's ID, never its title:
  // #9 was exactly this bug on Portrait — a colour derived from a label moves whenever the
  // label does, and two projects sharing a title share a colour. Both happen here: the
  // launcher currently lists two projects called "TURTLE ISLAND'S TOP CLASS CLOWN".
  //
  // Without the tint, one shared placeholder makes every card identical and the launcher
  // stops being scannable — the tint is what keeps a grid of ten projects distinguishable.
  const identity = $derived(identityColor(project.id || project.path || title))

  function deriveMonogram(t) {
    const words = t.trim().split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w))
    if (words.length === 0) return '·'
    const first = words[0][0] ?? ''
    const second = words.length > 1 ? words[1][0] ?? '' : ''
    return (first + second).toUpperCase()
  }

  const pipeline = $derived.by(() => {
    // ONE CHIP, THREE AXES, and it reports the furthest position KNOWN TO BE
    // TRUE. `needs_migration` is package format. `package_stage` is how far the
    // package has been PROCESSED (RFC 0067 §2, KSPD): empty < imported < parsed
    // < indexed < enriched, all five pre-LLM. `analyses` is LLM analysis,
    // which by construction happens AFTER processing — so a progressed analysis
    // is a LATER position than any stage and outranks it.
    //
    // The stage speaks where analysis has nothing to say, or where the stage
    // denies there is anything to analyse. That is the whole rule; the ladder
    // below is it, one flat condition per rung.
    //
    // AN EARLIER VERSION LET THE STAGE OWN THE CHIP OUTRIGHT and it was wrong
    // twice over. The stated reason was provenance — the stage record carries
    // Producer/Build.Commit/RecordedAt and a §8.5 reset obligation, while
    // analysis progress has none. That asymmetry is real in the RECORD and
    // absent from the WIRE: `StageForPackage` (package_stage.go:293-316) falls
    // back to inference when no record exists, and khaos-manager's `enrichProject`
    // assigned only `reading.Stage`, dropping `Recorded` — the precise collapse
    // package_stage.go:250-257 warns against, "would let a caller treat the
    // second as the first".
    //
    // STATE OF THAT, WITH REFS, because it differs by ref and an unqualified
    // claim is wrong against at least one of them. The gap is OPEN everywhere
    // that ships: the commit this workspace pins (khaos-manager dc6bc698)
    // predates W-8 and carries no `package_stage` on the wire at all, and their
    // `origin/main` carries the field while dropping `Recorded`. A fix exists
    // only on an unmerged local branch.
    //
    // I first recorded this as "closed at the pin", which was wrong twice over:
    // `git submodule status` prints the CHECKED-OUT sha with a `+` when it
    // differs from the pin, and that submodule has a feature branch checked out.
    // The recorded pin is `git ls-tree HEAD khaos-manager`. Two separate reads
    // made the same mistake, so it is written down here.
    //
    // It does not matter to this ladder either way, and that is the point of the
    // amendment: `recorded` changes CONFIDENCE, not ASSERTION. A stamped
    // `enriched` still only concedes content exists.
    //
    // But it was an error even before that. A value that CANNOT contradict
    // analysis has no standing to silence it, and types.js says so in its own
    // docblock: all five members are pre-LLM and none says anything about
    // analysis. Letting `parsed` silence `Analyzing 31/107` was the bug.
    if (project.needs_migration) return { label: 'Needs Update', tone: 'warning' }

    // ONE normalisation for every rung below, because the rungs disagreed
    // otherwise: `' empty'` matched no rung and fell to the raw-member branch,
    // silently moving a known member from ABOVE the analysis rungs to below
    // them, and `'   '` rendered a pill with no visible text at all.
    //
    // A non-string yields '' — NO CLAIM — rather than being coerced. `Get` does
    // not validate on read (kspdprotocol client.go:170-201 reads and unmarshals
    // with no `Validate` call), so anything JSON can hold reaches this card.
    // `String(['enriched'])` is `'enriched'`, so coercing would let a malformed
    // array render a confident `Enriched`; `String({})` would put
    // `[object Object]` in the chip. §8.3 obliges us to tolerate an unrecognised
    // MEMBER, which is a string. A non-string is not a member, and the honest
    // reading of it is that we know nothing.
    const stageKey =
      typeof project.package_stage === 'string' ? project.package_stage.trim() : ''

    // A job outranks the stage whatever the stage is. An import runs on a row
    // whose stage is `empty` or absent, so the job has to be read first; an
    // extraction advances `parsed` to `indexed`, which is reserved for its
    // result.
    if (activeJob) return { label: activeJob.label, tone: activeJob.phase === 'failed' ? 'danger' : 'warning' }

    // `empty` and `imported` outrank even a completed analysis because of WHAT
    // THEY ASSERT: that the package holds no parsed content. A `complete` behind
    // that assertion is necessarily stale, because there was nothing to analyse.
    //
    // CONTRADICTION, NOT CONFIDENCE. An earlier version of this comment argued
    // that these two win because they are SELF-CERTIFYING — never inferred, so
    // their presence proves a record exists. That is true and it is not the
    // reason: `indexed` and `enriched` are never inferred either, so
    // self-certification is shared by four of the five members and cannot be
    // what separates this rung from the one below. Provenance says how reliably
    // a value was obtained; the ordering turns on what the value CLAIMS.
    //
    // The caveat survives but is differently grounded. This rung's correctness
    // depends on another repository's restraint — not on `empty` being stamped,
    // but on `empty` being TRUE. RFC 0067 §3.2 caps inference at `parsed` and
    // the reader declines to infer these two (package_stage.go:290-292); if a
    // future khaosd ever inferred `empty` from a projection it merely failed to
    // read, the assertion would be false and `Empty` would silence a true
    // `Complete`. There is no consumer-side check for that, which is the point.
    const noContent = PACKAGE_STAGE_NO_CONTENT.get(stageKey)
    if (noContent) return { ...noContent }

    // Conditional on ENTAILMENT, not on the stage merely being present.
    //
    // `parsed` here is `os.Stat(kspd.StoryPath(...)) == nil` — khaos-manager's
    // `enrichProject`, a stat on `story/screenplay.json`.
    //
    // `indexed` and `enriched` reach the wire only from a record (no inference
    // path produces them), and §2's order is total, so either one ENTAILS a
    // parse projection. A failed stat standing against a stamped entailment is a
    // genuine on-disk inconsistency, and resolving it by asserting `Not Parsed`
    // states something the data does not support — the one thing this ladder
    // exists to prevent.
    //
    // `parsed` is the THIRD member in this table and that argument does not
    // reach it, since `parsed` is precisely the member inference CAN produce. It
    // belongs here anyway, by a different route: the inference decodes the same
    // `screenplay.json` the stat failed on, so a failed stat rules the inference
    // out too and `parsed` on the wire implies a record. Stated separately
    // because one sentence covering two members was heading a table of three.
    //
    // Field origin: the architect named `parsed: false` + `'parsed'` as the case
    // it was least sure of, and this is the sentence that settles it.
    //
    // Keyed on the Map, which is why the Map holds only the three. An
    // UNRECOGNISED member does NOT clear this guard, and that is deliberate:
    // `Before` sorts an unknown member ahead of every known one
    // (package_stage.go:99-100) "which keeps a consumer that meets a future
    // member from silently treating it as the most advanced". Letting it through
    // would grant an entailment on a token whose meaning this build does not
    // have. It also fails the plainer test — `Not Parsed` is supported by the
    // stat, while an uninterpretable token asserts nothing and so displaces
    // nothing.
    if (!project.parsed && !PACKAGE_STAGE_LABELS.has(stageKey)) {
      return { label: 'Not Parsed', tone: 'neutral' }
    }

    // Analysis, from the SAME reports the rail's last three segments draw, so
    // the label and the rail are one fact. Above the remaining stage members
    // because `parsed`/`indexed`/`enriched` all CONCEDE that content exists —
    // they cannot contradict a count of work done over it.
    //
    // It used to read khaosd's `analyzed_status` and a count that summed
    // scenes, characters and places into one total of analysis FILES, stale
    // or current: B4P read "Analyzing 56/118" on a 57-scene story while its
    // rail read 56 of 57. khaosd no longer sends those fields.
    const analysis = analysisStatus(reportedAnalyses)
    if (analysis) return analysis

    // The stage, where analysis is silent. `parsed` is the only member whose
    // provenance the wire lost, so it is the only one where "recorded or
    // inferred?" could matter — and it does not, for a reason worth writing down
    // because an earlier version of this comment gave the wrong one.
    //
    // It used to say `Parsed` here was independently licensed by the `!parsed`
    // rung above. Since that rung became conditional on entailment, the stage
    // SUPPRESSES it — so it licenses nothing, and `parsed: false` +
    // `package_stage: 'parsed'` now renders `Parsed` where it once rendered
    // `Not Parsed`. This branch's own test asserts that input.
    //
    // The claim survives on different ground. `parsed` is a stat on
    // `kspd.StoryPath` = `story/screenplay.json` (layout.go:81-83), and
    // `StageForPackage`'s inference path decodes THE SAME FILE (`Get[Story]`)
    // before it can return `parsed`. So a failed stat means the inference could
    // not have produced this value either: `parsed: false` with `parsed` on the
    // wire implies a record in every case but one: the stat and the protocol read
    // happen at different moments in `enrichProject`, so a screenplay written
    // between them yields `parsed: false` with an INFERRED `parsed`. That window
    // does not weaken the rung — in it the file genuinely exists, so `Parsed` is
    // true anyway.
    //
    // Inference is strictly stronger than the stat, never weaker. So there is no
    // input where believing the stage costs us a truth, which is the immunity,
    // and it holds without ever reading `Recorded`.
    //
    // TRUTHINESS, NOT PRESENCE. `package_stage` carries no `omitempty`
    // (khaos-manager projects.go:45), so `""` is on the wire for every package
    // the reader could not place — today a large share of them. `'x' in project`
    // or `!== undefined` is true for `""` and would send a blank chip down the
    // unrecognised branch. `""` must fall through to the legacy rungs below.
    // Trimmed before lookup AND before display. `'   '` is truthy, misses the
    // Map and reached the raw-member rung, rendering a pill with no visible
    // text — the same blank chip the Map was introduced to stop, arriving
    // through a different door, and `' empty'` silently moved a known member
    // from above the analysis rungs to below them. `Get` does not validate on
    // read (kspdprotocol client.go:170-201 reads and unmarshals, no `Validate`
    // call), so a malformed `packageStage` reaches this card unfiltered — the
    // same threat model already accepted for prototype keys and future members.
    const stage = PACKAGE_STAGE_LABELS.get(stageKey)
    if (stage) return { ...stage }

    // An unrecognised member shows itself and makes no claim (RFC 0067 §8.3:
    // degrade, never fail). BELOW analysis deliberately: `Before` sorts an
    // unknown member ahead of every known one (package_stage.go:99-100) "which
    // keeps a consumer that meets a future member from silently treating it as
    // the most advanced" — an instruction to treat an unknown as weak, so it cannot
    // outrank a progressed status.
    //
    // A Map, not an object literal. `LABELS[stage]` reached Object.prototype, so
    // `toString` returned a truthy function and the chip rendered an empty label
    // with no `data-tone` at all. The Map closes that door; the trim above closes
    // the whitespace one. Neither claim should be read as "blank chips are
    // impossible" — an earlier version of this comment said the class was closed
    // and whitespace walked straight through it.
    if (stageKey) return { label: stageKey, tone: 'neutral' }

    // Only a parsed package reaches here — the `Not Parsed` rung returned for
    // every other one with no recognised stage — so `Parsed` is what the stat
    // measured.
    return { label: 'Parsed', tone: 'info' }
  })

  const git = $derived.by(() => {
    if (!project.git_repo) return { label: '', tone: 'neutral' }
    if (!project.git_has_remote) return { label: 'local only', tone: 'neutral' }
    if (!project.git_has_upstream) return { label: 'no upstream', tone: 'neutral' }
    // `synced` is a CLAIM about the working tree, and it may only be made when
    // the counts are actually reported. khaosd 0.4.11 returns neither field, so
    // `?? 0` turned "the engine did not say" into "zero commits either way" into
    // a confident "synced" on every card — a fabricated value, which AGENTS.md
    // rules out. Absent counts now render no chip at all: the honest state is
    // that this component cannot tell.
    const ahead = project.git_ahead_count
    const behind = project.git_behind_count
    if (ahead == null && behind == null) return { label: '', tone: 'neutral' }
    if (ahead > 0 && behind > 0) return { label: `↑${ahead} ↓${behind}`, tone: 'warning' }
    if (ahead > 0) return { label: `↑${ahead}`, tone: 'success' }
    if (behind > 0) return { label: `↓${behind}`, tone: 'danger' }
    return { label: 'synced', tone: 'neutral' }
  })

  const relTime = $derived.by(() => {
    const diff = Date.now() - (project.modified ?? 0) * 1000
    if (diff < 0 || Number.isNaN(diff)) return 'just now'
    const s = Math.floor(diff / 1000)
    if (s < 60) return 'just now'
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 30) return `${d}d ago`
    return `${Math.floor(d / 30)}mo ago`
  })
</script>

<div class="project">
  <button
    class="project__activate"
    type="button"
    aria-label={title}
    aria-describedby={jobDescription ? describeId : undefined}
    disabled={!canActivate}
    onclick={onOpen}
  ></button>
  <!-- The job reaches assistive technology here: the footer below is
       aria-hidden, and an import card has no other control to carry it. -->
  {#if jobDescription}<span id={describeId} class="visually-hidden">{jobDescription}</span>{/if}

  <div
    class="project__cover"
    class:project__cover--art={cover}
    class:project__cover--disabled={!canActivate}
    style:--identity={identity}
    aria-hidden="true"
  >
    {#if cover}
      <img class="project__art" src={cover} srcset={coverSrcset || undefined} alt="" loading="lazy" decoding="async" />
      <span class="project__tint"></span>
    {:else}
      <span class="project__monogram">{monogram}</span>
    {/if}
    <span class="project__scrim"></span>
    <div class="project__overlay">
      <h3 class="project__title">{title}</h3>
      {#if logline}
        <p class="project__logline">{logline}</p>
      {/if}
    </div>
  </div>

  <div class="project__footer" aria-hidden="true">
    <span class="project__status" data-tone={pipeline.tone}>
      <span class="project__dot"></span><span class="project__label">{pipeline.label}</span>
      {#if pipeline.progress}<span class="project__progress">{pipeline.progress}</span>{/if}
    </span>
    <!-- One fact per row, in a fixed order: status, rail with its count,
         timing, meta. A row with nothing to say is left out, never reordered. -->
    {#if rail}
      <span class="project__rail-row">
        <span class="project__stage-rail">
          {#each rail as segment (segment.label)}
            <span
              class="project__stage-step"
              title={segment.title}
              class:project__stage-step--complete={segment.done}
              class:project__stage-step--active={segment.active}
              class:project__stage-step--measured={segment.fraction !== null}
              class:project__stage-step--waiting={segment.waiting}
              class:project__stage-step--failed={segment.failed}
            >{#if segment.fraction !== null}<span
                class="project__stage-fill"
                style="width: {Math.round(segment.fraction * 100)}%"
              ></span>{/if}</span>
          {/each}
        </span>
        {#if jobCount}<span class="project__count">{jobCount.completed}/{jobCount.total}</span>{/if}
      </span>
    {/if}
    {#if elapsedText || remainingText}
      <span class="project__timing">
        {#if elapsedText}<span class="project__elapsed"><Icon name="timer" />{elapsedText}</span>{/if}
        <!-- "estimating time left" keeps --text-secondary, not the design's
             --text-tertiary: tertiary at 11px fails contrast, which the #66 guard
             (D64) exists to stop. Its wording already sets it apart. -->
        {#if remainingText}<span class="project__remaining">{remainingText}</span>{/if}
      </span>
    {/if}
    <!-- The counts move to `MetaStrip`, the atom that already exists for exactly
         this run. Its own docblock named this migration as deferred: each one is
         a visual change to a shipped component, and this is that change.

         `ch` and `loc` are gone. They were abbreviations a reader had to already
         know; a glyph plus the number says as much in less room, and the
         complete phrase — `27 characters` — reaches both a screen reader and a
         pointer, from one string, through `label`.

         The git chip does NOT move in. It carries a tone, and MetaStrip takes no
         tone by D63. It sits beside the strip rather than being forced into an
         atom that would have to grow a concept to hold it. -->
    <!-- Omitted during an import: the package has no counts yet, and
         `scene_count ?? 0` would claim "0 scenes" about a story nobody read. -->
    {#if !isImport}
      <span class="project__meta">
        <MetaStrip items={metaItems} />
        {#if git.label}<span class="project__git" data-tone={git.tone}>{git.label}</span>{/if}
      </span>
    {/if}
  </div>

  {#if children}<div class="project__detail">{@render children()}</div>{/if}

  {#if !isImport && (extractionAction || onRemove || showInitGit)}
    <div class="project__actions">
      {#if extractionAction}
        <button
          class="project__action"
          type="button"
          aria-label={extractionAction.label}
          disabled={extractionAction.disabled}
          onclick={handleExtract}
        >
          <Icon name={extractionAction.retry ? 'arrow-clockwise' : 'sparkle'} />
        </button>
      {/if}
      {#if showInitGit}
        <button
          class="project__action"
          type="button"
          aria-label={`Initialise a git repository in ${title}`}
          onclick={onInitGit}
        >
          <Icon name="git-branch" />
        </button>
      {/if}
      {#if onRemove}
        <button
          class="project__action"
          type="button"
          aria-label={`Remove ${title} from Recents`}
          title="Remove from Recents"
          onclick={onRemove}
        >
          <Icon name="x" />
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .project {
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition: border-color 150ms ease;
  }

  .project:hover {
    /* Was `var(--border-strong)`, a token the kit has never defined. An unknown
       custom property makes the declaration invalid at computed-value time, and
       border-color is not inherited — so it resolved to `currentColor` and the
       hover border took the TEXT colour instead of a stronger grey. The kit has
       no strong-border token; emphasis is expressed as a mix over --text-primary
       (SelectableRow:66), so this follows that. */
    border-color: color-mix(in oklab, var(--text-primary) 24%, transparent);
  }

  .project__activate {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: none;
    border: 0;
    cursor: pointer;
    /* Must sit ABOVE .project__cover and .project__footer. This element is rendered
       first, so with `z-index: 0` those later siblings (both `z-index: auto`) painted
       over it and swallowed every real click — the card was dead to a mouse anywhere on
       its surface. Programmatic .click() bypasses hit-testing, so tests passed while
       users could not open a project. `.project__delete` is raised to 2 to stay above
       this one. */
    z-index: 1;
  }

  .project__art {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* The identity tint, as a wash rising from the bottom rather than a blend over the
     whole image.
     `color-burn` across the full cover was tried first and was badly wrong: it crushed the
     illustration into a lurid, muddy version of itself — it read as a damaged image, not a
     tinted one. This keeps the top of the artwork untouched and puts the colour where the
     card also needs contrast, so one effect does two jobs instead of fighting itself.

     The wash that replaced the burn was still too much: its bottom stop was
     `--identity` at 88% over black, which is opaque — the lower third of the
     artwork was not tinted, it was COVERED, and with the scrim on top the card
     ended in a solid block of colour. Every stop is translucent now, so the art
     reads the whole way down and the colour sits over it rather than instead of
     it. Identity has to be recognisable at a glance across a grid; it does not
     have to be the loudest thing on the card. */
  .project__tint {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      color-mix(in oklab, var(--identity) 52%, transparent) 0%,
      color-mix(in oklab, var(--identity) 26%, transparent) 40%,
      transparent 72%
    );
  }

  .project__cover {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 16 / 9;
    background:
      radial-gradient(120% 120% at 20% 0%, color-mix(in oklab, var(--gold-400) 10%, transparent) 0%, transparent 55%),
      linear-gradient(160deg, color-mix(in oklab, var(--text-secondary) 20%, var(--surface-raised)) 0%, var(--surface-base) 100%);
  }

  .project__cover--disabled {
    filter: grayscale(1);
  }

  .project__monogram {
    font-size: 1.9rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: color-mix(in oklab, var(--text-primary) 30%, transparent);
  }

  .project__scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgb(0 0 0 / 0.62) 0%, rgb(0 0 0 / 0.12) 45%, transparent 70%);
  }

  /* Still lighter than the no-art scrim, because the identity wash adds some of its
     own darkening — but raised from 0.35 now that the wash is translucent. The title
     sits over artwork with its own lettering, and the tint can no longer be relied on
     to hide what is behind it. */
  .project__cover--art .project__scrim {
    background: linear-gradient(to top, rgb(0 0 0 / 0.5) 0%, rgb(0 0 0 / 0.14) 45%, transparent 70%);
  }

  .project__overlay {
    position: absolute;
    inset: auto 0 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    padding: var(--spacing-sm);
  }

  .project__title {
    margin: 0;
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    color: #fff;
    text-shadow: 0 1px 2px rgb(0 0 0 / 0.4);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .project__logline {
    margin: 0;
    font-size: var(--body-md-size);
    color: rgb(255 255 255 / 0.82);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .project__footer {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-sm);
    border-top: 1px solid var(--border-hairline);
  }

  /* The host's content. Above .project__activate (1), like the rail and the
     actions, or the overlay swallows every click on it. No vertical padding:
     a host that renders nothing for this card adds no height. */
  .project__detail {
    position: relative;
    z-index: 2;
    padding: 0 var(--spacing-sm);
  }

  .project__status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    min-width: 0;
  }

  /* Targets the LABEL, which needs to be an element for that to be possible.
     This was `.project__status > :last-child` against a bare text node —
     `:last-child` matches elements only, so it selected the 6x6px dot when there
     was no progress span and the progress span when there was. It never once
     reached the label it was written for, and the container had no `overflow`
     either, so a long member still spilled. A cap without a working truncation
     is worse than neither: it reads as solved.

     The rationale here was also wrong — it claimed an over-long label would
     "push the card's meta row apart". `.project__meta` is a COLUMN-flex sibling
     in `.project__footer`, on its own row below, and was never horizontally
     adjacent. */
  /* The unrecognised-member branch renders a producer string verbatim, and this
     file argues at length that anything JSON can hold reaches this card. Every
     label WE choose fits — `Extracting entities from scenes` is the longest, at
     163px with the system-ui fallback against 214px of content — but a future
     member is not ours to bound, so an over-long one is ellipsised rather than
     allowed to spill out of the card. The cap sits on the label alone: when it
     sat on the whole status row, the count and the timing took its room and
     ellipsised the label to `Extract…` (design, "The problem"). */
  .project__label {
    max-width: 22ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .project__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--tone-neutral);
  }

  .project__status[data-tone='success'] .project__dot { background: var(--tone-success); }
  .project__status[data-tone='warning'] .project__dot { background: var(--tone-warning); }
  .project__status[data-tone='danger']  .project__dot { background: var(--tone-danger); }
  .project__status[data-tone='info']    .project__dot { background: var(--tone-info); }
  .project__status[data-tone='accent']  .project__dot { background: var(--tone-accent); }

  .project__progress,
  .project__count,
  .project__elapsed,
  .project__remaining {
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .project__rail-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  /* Elapsed on the left, remaining on the right, so the ticking value never
     moves the approximate one. */
  .project__timing {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-2xs);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  .project__elapsed {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
  }

  .project__remaining {
    margin-left: auto;
  }

  /* Raised above .project__activate (1) so each segment's title tooltip can be
     hovered; the 4px of padding is a hit area for a 3px bar, cancelled by the
     negative margin so the row keeps its height. `content-box` is what makes
     that true: under the kit's border-box the padding sat INSIDE the 3px and
     left every segment 0px tall (lib-0.73.0, measured in khaos-app). */
  .project__stage-rail {
    box-sizing: content-box;
    position: relative;
    z-index: 2;
    flex: 1;
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 3px;
    height: 3px;
    padding-block: 4px;
    margin-block: -4px;
  }

  .project__stage-step {
    border-radius: 999px;
    background: var(--border-default);
    overflow: hidden;
  }

  .project__stage-step--complete {
    background: var(--tone-info);
  }

  .project__stage-fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--tone-warning);
    transition: width 200ms linear;
  }

  .project__stage-step--active {
    background: linear-gradient(
      90deg,
      color-mix(in oklab, var(--tone-warning) 35%, transparent),
      var(--tone-warning),
      color-mix(in oklab, var(--tone-warning) 35%, transparent)
    );
    background-size: 200% 100%;
    animation: project-stage-active 1.2s linear infinite;
  }
  /* Declared AFTER `--active` so ordinary cascade order wins — equal
     specificity, so source order decides, and declaring it first left the
     shimmer running underneath the fill. The same reasoning this repo already
     applies to a library component never needing `!important`.

     A MEASURED step drops the shimmer: an animation saying "something is
     happening, extent unknown" over a bar that states the extent is the same
     contradiction one layer down. */
  .project__stage-step--measured {
    background: var(--border-default);
    animation: none;
  }

  /* Queued: nothing is working yet, and a shimmer would say otherwise. Static
     and dimmed to 35%, the shimmer's own end stop. Dimmed with `opacity`
     rather than a `color-mix` background: a 3px bar is a fill, not a text
     ground, and the #218 contrast scan reads every tone wash in a background as
     one (contrast.test.js, TINT). */
  .project__stage-step--waiting {
    background: var(--tone-warning);
    opacity: 0.35;
    animation: none;
  }

  /* Failed: static. With no count the whole segment is danger at 35%; with one
     the fill keeps the last fraction in danger, over the ordinary track. */
  .project__stage-step--failed {
    background: var(--tone-danger);
    opacity: 0.35;
    animation: none;
  }

  .project__stage-step--failed.project__stage-step--measured {
    background: var(--border-default);
    opacity: 1;
  }

  .project__stage-step--failed .project__stage-fill {
    background: var(--tone-danger);
  }


  @keyframes project-stage-active {
    to { background-position: -200% 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .project__stage-step--active {
      background: var(--tone-warning);
      animation: none;
    }

    /* A measured step keeps its TRACK here, not a solid fill. Without this the
       reduced-motion rule paints the whole segment amber and the fill inside it
       becomes invisible — a reader who has asked for less motion would be shown
       a step that looks finished while 31 of 107 are done. Reduced motion is a
       request about animation, never a licence to report a different number. */
    .project__stage-step--measured {
      background: var(--border-default);
    }

    /* Static already; restated so the solid `--active` rule above, declared
       later than theirs, does not repaint them. */
    .project__stage-step--waiting {
      background: var(--tone-warning);
    }

    .project__stage-step--failed {
      background: var(--tone-danger);
    }
  }

  .project__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 2px var(--spacing-sm);
    font-size: var(--caption-size);
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
  }

  .project__git[data-tone='success'] { color: var(--tone-success); }
  .project__git[data-tone='warning'] { color: var(--tone-warning); }
  .project__git[data-tone='danger']  { color: var(--tone-danger); }

  /* One corner, however many actions. Positioning lived on the delete button
     itself while it was the only one; a second button pinned to the same corner
     would have sat on top of it. The row owns the placement now and the buttons
     own only their look. */
  .project__actions {
    position: absolute;
    /* Above .project__activate (1), so these affordances still win in their corner. */
    z-index: 2;
    top: var(--spacing-xs);
    right: var(--spacing-xs);
    display: flex;
    gap: var(--spacing-2xs);
  }

  .project__action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: 0;
    border-radius: var(--radius-sm);
    background: rgb(0 0 0 / 0.45);
    color: rgb(255 255 255 / 0.85);
    cursor: pointer;
    opacity: 0;
    transition: opacity 150ms ease, background 150ms ease;
  }

  /* Hover reveals for a mouse; focus-visible reveals for a keyboard. Only the
     first existed, so tabbing to delete moved focus onto a fully transparent
     control — reachable, operable, and invisible. */
  .project:hover .project__action,
  .project__action:focus-visible {
    opacity: 1;
  }

  .project__action:hover {
    background: rgb(0 0 0 / 0.65);
  }

  .project__action:disabled {
    cursor: default;
    opacity: 0.65;
  }

</style>

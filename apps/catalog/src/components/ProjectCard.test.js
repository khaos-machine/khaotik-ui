import { describe, it, expect, vi } from 'vitest'
import { createRawSnippet } from 'svelte'
import { render, screen, fireEvent } from '@testing-library/svelte'
import ProjectCard from '@khaos-machine/khaotik-ui/components/svelte/ProjectCard.svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const project = {
  id: 'p1',
  title: 'Broken in Four Places',
  path: '/projects/broken-in-4-places.kspd',
  scene_count: 12,
  character_count: 5,
  location_count: 3,
}

describe('ProjectCard', () => {
  it('exposes the activate control named by the title (D52)', () => {
    render(ProjectCard, { props: { project } })
    expect(screen.getByRole('button', { name: 'Broken in Four Places' })).toBeInTheDocument()
  })

  // D1 of the project portability plan: the launcher removes a recent; it
  // never deletes a project. A person deletes one in the Finder.
  it('offers Remove from Recents as a separate control, and nothing named Delete', async () => {
    const onRemove = vi.fn()
    render(ProjectCard, { props: { project, onRemove, onInitGit: () => {}, onExtract: () => {} } })
    await fireEvent.click(screen.getByRole('button', { name: 'Remove Broken in Four Places from Recents' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
    for (const control of screen.queryAllByRole('button')) {
      expect(control.getAttribute('aria-label') ?? control.textContent).not.toMatch(/delete/i)
    }
  })

  it('does not draw the remove control with a destructive icon', () => {
    const { container } = render(ProjectCard, { props: { project, onRemove: () => {} } })
    const remove = screen.getByRole('button', { name: /from Recents$/ })
    expect(remove.className).not.toMatch(/danger/)
    expect(container.innerHTML).not.toMatch(/ph-trash/)
  })

  it('shows the git status as compact inline text', () => {
    const { container } = render(ProjectCard, { props: { project: { ...project, git_repo: true, git_has_remote: true, git_has_upstream: true, git_ahead_count: 2 } } })
    expect(container.textContent).toContain('↑2')
  })

  // khaosd 0.4.11 returns neither git_ahead_count nor git_behind_count. `?? 0`
  // turned "the engine did not say" into "zero either way" into a confident
  // "synced" on every card against live data. Our fixtures all set
  // git_has_remote: false, which short-circuits before the counts — which is
  // why Storybook and this suite looked correct while the real launcher did not.
  it('claims nothing when the engine reports no ahead/behind counts', () => {
    const { container } = render(ProjectCard, {
      props: { project: { ...project, git_repo: true, git_has_remote: true, git_has_upstream: true } },
    })
    expect(container.textContent).not.toContain('synced')
  })

  it('still says synced when the counts are present and both zero', () => {
    const { container } = render(ProjectCard, {
      props: {
        project: { ...project, git_repo: true, git_has_remote: true, git_has_upstream: true, git_ahead_count: 0, git_behind_count: 0 },
      },
    })
    expect(container.textContent).toContain('synced')
  })

  // onInitGit was accepted as a prop and never used — the card destructured the
  // handler and dropped it, so Launcher's `onInitGit={() => onInitGit?.(project)}`
  // reached a component with nothing to fire it. The story even documented it as
  // "reserved for the launcher shell", which made the silence look deliberate.
  // A prop that is read and ignored is worse than a missing one: the consumer's
  // wiring looks finished.
  describe('git-init', () => {
    it('offers the action when a handler is given and there is no repo', async () => {
      const onInitGit = vi.fn()
      render(ProjectCard, { props: { project, onInitGit } })

      const button = screen.getByRole('button', {
        name: 'Initialise a git repository in Broken in Four Places',
      })
      await fireEvent.click(button)

      // Bound, not merely rendered — a button that exists and fires nothing is
      // the same defect one layer down.
      expect(onInitGit).toHaveBeenCalledTimes(1)
    })

    it('does not offer it for a project that already has a repo', () => {
      render(ProjectCard, { props: { project: { ...project, git_repo: true }, onInitGit: () => {} } })

      expect(
        screen.queryByRole('button', { name: /Initialise a git repository/ }),
      ).toBeNull()
    })

    it('does not offer it when no handler is given', () => {
      render(ProjectCard, { props: { project } })

      expect(
        screen.queryByRole('button', { name: /Initialise a git repository/ }),
      ).toBeNull()
    })

    it('keeps both actions reachable when both are wired', () => {
      render(ProjectCard, { props: { project, onRemove: () => {}, onInitGit: () => {} } })

      // The reason the two share a row: pinned to the same corner independently,
      // the second would have covered the first.
      expect(screen.getByRole('button', { name: /Initialise a git repository/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /from Recents$/ })).toBeInTheDocument()
    })
  })
  // `ingested` gated the pipeline chain ahead of every analysis branch, and
  // khaosd derived it from a `graph.db` that khaos-tools stopped writing. It
  // was false for every project, so no card ever reached 'Complete' — the most
  // analyzed package in the operator's store (292 analysis artifacts) rendered
  // as 'Parsed'. The catalog fixtures all set `ingested: true`, which is why
  // Storybook and this suite looked correct while the real launcher did not:
  // the same reason the git-counts defect above survived.
  describe('pipeline badge', () => {
    const parsed = { ...project, parsed: true }

    const ALL_DONE = ['scenes', 'characters', 'places'].map((kind) => ({ kind, state: 'done' }))
    const statusBadge = (container) => container.querySelector('.project__status')
    const label = (container) => container.querySelector('.project__label')?.textContent
    const count = (container) => container.querySelector('.project__progress')?.textContent

    it('reports Complete when all three analyses are done', () => {
      const { container } = render(ProjectCard, { props: { project: parsed, analyses: ALL_DONE } })
      expect(label(container)).toBe('Complete')
      expect(statusBadge(container)?.getAttribute('data-tone')).toBe('success')
    })

    // B4P, 2026-10-11: the label read "Analyzing 56/118" — khaosd's count of
    // analysis FILES over scenes + characters + locations (57 + 33 + 28) —
    // while the rail's scenes segment read 56 of 57. The label now reads the
    // rail's own reports, so the two are one fact.
    it('names the active analysis with the count the rail shows', () => {
      const { container } = render(ProjectCard, {
        props: {
          project: { ...parsed, package_stage: 'indexed' },
          analyses: [{ kind: 'scenes', state: 'in-progress', progress: { completed: 56, total: 57 } }],
        },
      })
      expect(label(container)).toBe('Analyzing scenes')
      expect(count(container)).toBe('56/57')
      expect(statusBadge(container)?.getAttribute('data-tone')).toBe('warning')
      const scenes = [...container.querySelectorAll('[title]')].find((el) => el.title.startsWith('Analyze scenes'))
      expect(scenes?.title).toBe('Analyze scenes: in progress, 56 of 57')
    })

    // A daemon that still sends the removed cross-kind fields must not be read.
    it('ignores the removed analyzed_status fields', () => {
      const { container } = render(ProjectCard, {
        props: {
          project: { ...parsed, analyzed_status: 'partial', analyzed_complete_count: 56, analyzed_total_count: 118 },
          analyses: [{ kind: 'scenes', state: 'in-progress', progress: { completed: 56, total: 57 } }],
        },
      })
      expect(container.textContent).not.toContain('118')
      expect(count(container)).toBe('56/57')
    })

    it('names the first analysis in rail order that is not done', () => {
      const { container } = render(ProjectCard, {
        props: {
          project: { ...parsed, package_stage: 'indexed' },
          analyses: [
            { kind: 'places', state: 'in-progress', progress: { completed: 3, total: 28 } },
            { kind: 'characters', state: 'failed', progress: { completed: 12, total: 27 } },
            { kind: 'scenes', state: 'done' },
          ],
        },
      })
      expect(label(container)).toBe('Character analysis failed')
      expect(count(container)).toBe('12/27')
      expect(statusBadge(container)?.getAttribute('data-tone')).toBe('danger')
    })

    // Absence is not "not started", and neither is a claim about progress: the
    // stage speaks. Scenes done with characters unreported is not Complete.
    it.each([
      ['scenes done, characters not reported', [{ kind: 'scenes', state: 'done' }]],
      ['scenes not started', [{ kind: 'scenes', state: 'not-started' }]],
      ['an unrecognised state', [{ kind: 'scenes', state: 'reticulating' }]],
      ['no analyses at all', undefined],
    ])('lets the stage speak when %s', (_, analyses) => {
      const { container } = render(ProjectCard, { props: { project: { ...parsed, package_stage: 'indexed' }, analyses } })
      expect(label(container)).toBe('Indexed')
      expect(count(container)).toBeUndefined()
    })

    // Breaking Even, 2026-10-14: one scene analysed of 53, no job running, and the
    // card read "Analyzing scenes 1/53" — the running verb on a standing fact. A
    // partly analysed story names what is done, in the neutral tone; "Analyzing" is
    // reserved for an analysis the host reports as running.
    it('names a partly analysed story without claiming work is running', () => {
      const { container } = render(ProjectCard, {
        props: {
          project: { ...parsed, package_stage: 'indexed' },
          analyses: [{ kind: 'scenes', state: 'partial', progress: { completed: 1, total: 53 } }],
        },
      })
      expect(label(container)).toBe('Scenes analyzed')
      expect(count(container)).toBe('1/53')
      expect(statusBadge(container)?.getAttribute('data-tone')).toBe('neutral')
      expect(container.textContent).not.toContain('Analyzing')
    })

    it('shows no count for an in-progress analysis that sends none', () => {
      const { container } = render(ProjectCard, {
        props: { project: parsed, analyses: [{ kind: 'scenes', state: 'in-progress' }] },
      })
      expect(label(container)).toBe('Analyzing scenes')
      expect(count(container)).toBeUndefined()
    })

    // khaosd sends no analysis on the row, so a parsed package with no stage
    // and no analyses reads what the stat measured. It used to read `Unknown`.
    it('reports Parsed, not Ready, for a parsed package with nothing else known', () => {
      const { container } = render(ProjectCard, { props: { project: parsed } })
      expect(label(container)).toBe('Parsed')
      expect(container.textContent).not.toContain('Ready')
    })

    it('still reports Not Parsed before parsing', () => {
      const { container } = render(ProjectCard, { props: { project: { ...project, parsed: false } } })
      expect(container.textContent).toContain('Not Parsed')
    })

    it('reaches Complete with no `ingested` field on the payload at all', () => {
      expect('ingested' in parsed).toBe(false)
      const { container } = render(ProjectCard, { props: { project: parsed, analyses: ALL_DONE } })
      expect(label(container)).toBe('Complete')
    })
  })
})

// W-11 — `package_stage`, RFC 0067 (KSPD), tag go/kspdprotocol/v0.24.0.
//
// A SECOND AXIS. `package_stage` is how far the package has been PROCESSED —
// `empty < imported < parsed < indexed < enriched`, all five pre-LLM.
// `analyses` is LLM analysis progress. They are different questions and
// the card has one chip, so one of them has to own it.
//
// The chip reports the FURTHEST POSITION KNOWN TO BE TRUE, and the ordering is
// not symmetric because the two axes are not symmetric.
//
// `empty` and `imported` outrank even a completed analysis. They assert there is
// nothing to analyse, and no reader infers them — `StageForPackage` has one
// inference path returning only `parsed` (package_stage.go:312), may never infer
// `indexed`/`enriched` (:276-288) and declines `empty`/`imported` (:290-292). So
// their presence proves a record exists and a `complete` behind one is stale.
//
// `parsed`, `indexed` and `enriched` sit BELOW progressed analysis.
// Analysis happens after processing, so it is a later position; and a member
// that CONCEDES content exists cannot contradict a count of work done over it.
//
// AN EARLIER VERSION OF THIS FILE ASSERTED THE OPPOSITE — that any recognised
// stage owns the chip, on a provenance argument: the stage record carries
// Producer (package_stage.go:153) / RecordedAt (:151) and a §8.5 reset
// obligation, analysis progress carries
// neither. That asymmetry is real in the RECORD and absent from the WIRE.
// khaos-manager's `enrichProject` assigned only `reading.Stage` and dropped
// `Recorded` — the collapse package_stage.go:250-257 warns against — so an
// inferred `parsed` and a stamped `parsed` were indistinguishable here.
// Believing it would have regressed every analysed project from `Complete` to
// `Parsed`.
//
// STATE OF THAT, BY REF, because it differs by ref: khaos-manager's
// `origin/main` carries `package_stage` and drops `Recorded`. The commit this
// workspace PINS (dc6bc698) predates W-8 and carries no `package_stage` on the
// wire at all. `164a8899` — which does carry the flag at :59 and :310 — is the
// head of an unmerged local branch, on neither.
//
// This sentence named 164a8899 as the pin. That is the THIRD time that error was
// made on this branch, ninety lines from the comment in ProjectCard.svelte
// written to stop it: `git submodule status` prints the CHECKED-OUT sha, with a
// leading `+` when it differs from the pin. The pin is `git ls-tree HEAD <sub>`.
// It changes confidence, not assertion, so this ordering holds against every one
// of those refs — which is the property worth keeping.
//
// It was also wrong on its own terms: a value that cannot contradict analysis
// has no standing to silence it, and all five members are pre-LLM.
describe('ProjectCard package_stage (W-11)', () => {
  const statusBadge = (container) => container.querySelector('.project__status')
  const badgeText = (container) => statusBadge(container)?.textContent?.trim() ?? ''
  const parsed = { ...project, parsed: true }

  it.each([
    ['empty', 0],
    ['imported', 1],
    ['parsed', 2],
    ['indexed', 3],
    ['enriched', 3],
  ])('shows %s as %d completed import stages', (stage, completed) => {
    const { container } = render(ProjectCard, {
      props: { project: { ...parsed, package_stage: stage } },
    })

    expect(container.querySelectorAll('.project__stage-step')).toHaveLength(6)
    expect(container.querySelectorAll('.project__stage-step--complete')).toHaveLength(completed)
    expect(container.querySelector('.project__stage-step--active')).toBeNull()
  })

  it('animates only the indexed transition while a parsed project is extracting entities from scenes', () => {
    const { container } = render(ProjectCard, {
      props: {
        project: { ...parsed, package_stage: 'parsed' },
        job: { kind: 'extract', phase: 'running' },
      },
    })

    const steps = [...container.querySelectorAll('.project__stage-step')]
    expect(steps.filter((step) => step.classList.contains('project__stage-step--complete'))).toHaveLength(2)
    expect(steps.findIndex((step) => step.classList.contains('project__stage-step--active'))).toBe(2)
  })

  it('offers enabled extraction for a parsed package and fires onExtract', async () => {
    const onExtract = vi.fn()
    render(ProjectCard, { props: { project: { ...parsed, package_stage: 'parsed' }, onExtract } })

    const button = screen.getByRole('button', { name: 'Extract Broken in Four Places' })
    expect(button).toBeEnabled()
    await fireEvent.click(button)
    expect(onExtract).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['starting', 'Starting extraction…', 'Starting extraction for Broken in Four Places'],
    ['queued', 'Extraction queued', 'Extraction queued for Broken in Four Places'],
    ['running', 'Extracting entities from scenes', 'Extracting entities from Broken in Four Places'],
    ['finalizing', 'Finalizing extraction…', 'Finalizing extraction for Broken in Four Places'],
  ])('renders %s as a persistent status with a disabled action', (state, label, actionName) => {
    const { container } = render(ProjectCard, {
      props: {
        project: { ...parsed, package_stage: 'parsed' },
        onExtract: vi.fn(),
        job: { kind: 'extract', phase: state },
      },
    })

    expect(badgeText(container)).toBe(label)
    expect(statusBadge(container)?.dataset.tone).toBe('warning')
    expect(screen.getByRole('button', { name: actionName })).toBeDisabled()
  })

  it('shows truthful entity extraction counts when supplied', () => {
    const { container } = render(ProjectCard, {
      props: {
        project: { ...parsed, package_stage: 'parsed' },
        job: { kind: 'extract', phase: 'running', progress: { completed: 12, total: 57 } },
      },
    })

    expect(badgeText(container)).toBe('Extracting entities from scenes')
    expect(container.querySelector('.project__count')?.textContent).toBe('12/57')
  })

  it('offers enabled extraction retry after failure and fires onExtract', async () => {
    const onExtract = vi.fn()
    const { container } = render(ProjectCard, {
      props: {
        project: { ...parsed, package_stage: 'parsed' },
        onExtract,
        job: { kind: 'extract', phase: 'failed' },
      },
    })

    expect(badgeText(container)).toBe('Extraction failed')
    expect(statusBadge(container)?.dataset.tone).toBe('danger')
    const button = screen.getByRole('button', { name: 'Retry extraction for Broken in Four Places' })
    expect(button).toBeEnabled()
    await fireEvent.click(button)
    expect(onExtract).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['parsed', true],
    ['indexed', false],
    ['enriched', false],
  ])('sets title activation correctly for package_stage %s', (stage, disabled) => {
    render(ProjectCard, { props: { project: { ...parsed, package_stage: stage } } })

    const button = screen.getByRole('button', { name: 'Broken in Four Places' })
    expect(button).toHaveProperty('disabled', disabled)
  })

  it.each([
    ['parsed', true],
    ['indexed', false],
    ['enriched', false],
  ])('renders the %s project thumbnail grayscale only while disabled', (stage, grayscale) => {
    const { container } = render(ProjectCard, {
      props: {
        project: { ...parsed, package_stage: stage },
        cover: '/cover.webp',
      },
    })

    expect(
      container.querySelector('.project__cover')?.classList.contains('project__cover--disabled'),
    ).toBe(grayscale)
  })

  // The two tests W-11 names by title.

  it('renders the enriched stage without claiming analysis', () => {
    // A not-started scenes analysis is what the host reports for an enriched,
    // unanalysed package. Seeded so the analysis rung would VISIBLY have fired
    // if it claimed anything from it.
    const { container } = render(ProjectCard, {
      props: {
        project: {
          ...parsed,
          package_stage: 'enriched',
        },
        analyses: [{ kind: 'scenes', state: 'not-started', progress: { completed: 0, total: 12 } }],
      },
    })
    expect(badgeText(container)).toBe('Enriched')
    expect(statusBadge(container)?.getAttribute('data-tone')).toBe('info')

    // The negative half is the load-bearing half: it asserts the analysis chain
    // did not speak. `enriched` is deliberately NOT 'success' and NOT 'accent' —
    // 'success' is what all three analyses done means, and 'accent' is the
    // tone this file already records as reading FINISHED. Enriched is a position
    // on a pre-LLM axis, not a verdict, and its tone must not deliver one.
    // `toBe` on the chip's exact text IS the negative assertion, and it is the
    // falsifiable form. This block previously listed four `not.toContain`
    // claims, of which two could not fail — 'Ready' was deleted from the
    // component in 5a59d32 and no branch emits it, and 'Analyzing' needs an
    // in-progress analysis, which this project never reports. Four
    // negatives read as more coverage than an exact match while asserting less
    // than one. An exact label plus an exact tone excludes every other branch by
    // construction, including ones nobody thought to enumerate.
    expect(container.textContent).not.toContain('Parsed')
  })

  // The inverse of what this file first asserted, and the regression review
  // caught. The original design let any recognised stage own the chip, so this
  // exact project rendered `Parsed` and `Analyzing 31/107` became unreachable
  // for real data. It is the load-bearing test of the amendment: analysis
  // outranks `parsed`/`indexed`/`enriched` because those members CONCEDE that
  // content exists and so cannot contradict a count of work done over it.
  //
  // It also matters that `parsed` is the member involved. It is the only one
  // `StageForPackage` can infer (package_stage.go:312), so it is the only one
  // whose provenance an unflagged wire loses — and khaos-manager sends it for
  // every package with a populated projection.
  it('renders analysis progress for a parsed package', () => {
    const { container } = render(ProjectCard, {
      props: {
        project: {
          ...parsed,
          package_stage: 'parsed',
        },
        analyses: [{ kind: 'scenes', state: 'in-progress', progress: { completed: 31, total: 107 } }],
      },
    })
    expect(badgeText(container)).toContain('Analyzing scenes')
    expect(container.textContent).toContain('31/107')
  })

  // The one place a stage still outranks a progressed analysis, and the only
  // remaining load-bearing use of the provenance argument. `empty` is
  // self-certifying: the reader has exactly one inference path and it returns
  // only `parsed` (package_stage.go:312), declining `empty`/`imported` outright
  // (:290-292). So `empty` on the wire proves a record exists, and a record
  // asserting there is no parsed content makes any `complete` behind it stale.
  // The TWIN of the test below, and it exists because review deleted the
  // `imported` rung and the whole suite stayed green. `imported` was covered
  // only by the it.each table, which reports no analyses — and with
  // analysis silent `imported` renders identically from the Map three rungs
  // lower. So the table pinned the LABEL and pinned no ordering at all, while
  // the component asserts in its own comment that `empty` and `imported` are the
  // two members outranking a completed analysis. Only `empty` was guarded.
  // A SOURCE READ, because this invariant has no rendering consequence today and
  // that is exactly what makes it dangerous. `PACKAGE_STAGE_LABELS` does double
  // duty: it supplies the label AND answers "does this member entail a parse
  // projection?" for the `!parsed` guard. `PACKAGE_STAGE_NO_CONTENT` holds the
  // two members that assert the OPPOSITE.
  //
  // Adding `empty` to the entailment Map is currently invisible — the no-content
  // rung returns first, so nothing renders differently and the mutation passes
  // the whole suite green (measured). It becomes a false claim the moment those
  // rungs are reordered: `empty` would then satisfy a guard meaning "this
  // package has parsed content", which is the exact assertion `empty` denies.
  //
  // No render can see it, so the test reads the source. Same shape and same
  // reason as check-catalog-gate.test.js.
  it('keeps the entailment table and the no-content table disjoint', () => {
    const src = readFileSync(
      join(__dirname, '../../../../components/svelte/ProjectCard.svelte'),
      'utf8',
    )
    const keysOf = (name) => {
      const block = src.slice(src.indexOf(`const ${name} = new Map([`))
      const body = block.slice(0, block.indexOf('])'))
      return [...body.matchAll(/\['([a-z]+)',/g)].map((m) => m[1])
    }
    const entail = keysOf('PACKAGE_STAGE_LABELS')
    const noContent = keysOf('PACKAGE_STAGE_NO_CONTENT')

    // Guard first: with either table unparseable, a disjointness check on two
    // empty arrays is a silent pass.
    expect(entail, 'parsed no entailment members').toEqual(['parsed', 'indexed', 'enriched'])
    expect(noContent, 'parsed no no-content members').toEqual(['empty', 'imported'])
    expect(entail.filter((k) => noContent.includes(k))).toEqual([])
  })

  // H1. `parsed` on the wire is `os.Stat(kspd.StoryPath(...)) == nil` — a stat,
  // in khaos-manager's `enrichProject`. `indexed` and `enriched` reach the wire
  // only from a record, and RFC 0067 §2's order is total, so either ENTAILS a
  // parse projection. A failed stat standing against a stamped entailment is a
  // real on-disk inconsistency, and resolving it by asserting `Not Parsed`
  // states something the data does not support.
  //
  // Reachable rather than theoretical: RFC 0067 §9 records the §8.5 reset
  // obligation as the producing layer's to implement, i.e. nobody does yet.
  it.each([
    ['indexed', 'Indexed'],
    ['enriched', 'Enriched'],
    ['parsed', 'Parsed'],
  ])('lets a recorded %s override a failed parse stat', (stage, label) => {
    const { container } = render(ProjectCard, {
      props: { project: { ...project, parsed: false, package_stage: stage } },
    })
    expect(badgeText(container)).toBe(label)
    expect(container.textContent).not.toContain('Not Parsed')
  })

  // The other half of that ruling, and the reason the guard keys on the label
  // Map rather than on the stage being merely present. An unrecognised member
  // does NOT clear it. `Before` sorts an unknown member ahead of every known one
  // (package_stage.go:99-100) "which keeps a consumer that meets a future member
  // from silently treating it as the most advanced" — letting it through would
  // grant an entailment on a token whose meaning this build does not have.
  //
  // The plainer test says the same: `Not Parsed` is supported by the stat, while
  // an uninterpretable token asserts nothing and so displaces nothing.
  it('keeps Not Parsed in force against an unrecognised member', () => {
    const { container } = render(ProjectCard, {
      props: { project: { ...project, parsed: false, package_stage: 'summarised' } },
    })
    expect(badgeText(container)).toBe('Not Parsed')
  })

  // THE ORDERING THAT REAL DATA DEPENDS ON, and nothing pinned it: a mutant
  // moving `!parsed` above the `empty`/`imported` rungs survived the whole
  // suite green.
  //
  // Not a hypothetical reorder. On the wire `parsed` is
  // `os.Stat(kspd.StoryPath(...)) == nil` (khaos-manager, `enrichProject`), and
  // RFC 0067 §2 defines `empty` as carrying no screenplay content and
  // `imported` as source text with no parse projection. NEITHER HAS A
  // PROJECTION — so every real `empty` or `imported` package arrives with
  // `parsed: false`, and under that mutant all of them render `Not Parsed`
  // while the two rungs W-11 added become dead code for their entire
  // population.
  //
  // It survived because every other test here spreads `parsed` (which sets
  // `parsed: true`), so the two rungs were only ever exercised in the one
  // combination real data will almost never send. Same defect class as the
  // deleted-`imported`-rung mutant from the previous round, one rung to the
  // left.
  it.each([
    ['empty', 'Empty'],
    ['imported', 'Imported'],
  ])('renders %s as %s even though such a package is never parsed', (stage, label) => {
    const { container } = render(ProjectCard, {
      props: { project: { ...project, parsed: false, package_stage: stage } },
    })
    expect(badgeText(container)).toBe(label)
    expect(container.textContent).not.toContain('Not Parsed')
  })

  it('renders an imported package as Imported despite a stale complete', () => {
    const { container } = render(ProjectCard, {
      props: {
        project: { ...parsed, package_stage: 'imported' },
        analyses: ['scenes', 'characters', 'places'].map((kind) => ({ kind, state: 'done' })),
      },
    })
    expect(badgeText(container)).toBe('Imported')
    expect(statusBadge(container)?.getAttribute('data-tone')).toBe('neutral')
    expect(container.textContent).not.toContain('Complete')
  })

  it('renders an empty package as Empty despite a stale complete', () => {
    const { container } = render(ProjectCard, {
      props: {
        project: { ...parsed, package_stage: 'empty' },
        analyses: ['scenes', 'characters', 'places'].map((kind) => ({ kind, state: 'done' })),
      },
    })
    expect(badgeText(container)).toBe('Empty')
    expect(statusBadge(container)?.getAttribute('data-tone')).toBe('neutral')
    expect(container.textContent).not.toContain('Complete')
  })

  // Whitespace, and it is two defects not one. `'   '` is truthy, missed the Map
  // and rendered a pill with NO VISIBLE TEXT — the same blank chip the Map was
  // added to stop, arriving through a different door, in a file whose comment
  // then claimed the class was closed. And `' empty'` silently moved a known
  // member from ABOVE the analysis rungs to below them, which is a wrong
  // ordering rather than a cosmetic one.
  it.each([
    ['   ', 'Parsed'],
    [' empty', 'Empty'],
    ['enriched ', 'Enriched'],
  ])('normalises the stage %j to %s', (stage, label) => {
    const { container } = render(ProjectCard, {
      props: { project: { ...parsed, package_stage: stage } },
    })
    expect(badgeText(container)).toBe(label)
    expect(badgeText(container), 'a chip with no visible text is not a claim').not.toBe('')
  })

  // A non-string is not a member. §8.3 obliges tolerating an unrecognised
  // MEMBER, and a member is a string; anything JSON can hold reaches here
  // because `Get` does not validate on read. Coercing would be worse than
  // useless: `String(['enriched'])` is `'enriched'`, so an array would render a
  // confident `Enriched`, and `String({})` would put `[object Object]` in the
  // chip. These must make no claim at all.
  it.each([[3], [true], [{}], [['enriched']], [null]])(
    'makes no stage claim for the non-string %j',
    (stage) => {
      const { container } = render(ProjectCard, {
        props: { project: { ...parsed, package_stage: stage } },
      })
      // The parse stat speaks; the stage makes no claim.
      expect(badgeText(container)).toBe('Parsed')
      expect(statusBadge(container)?.getAttribute('data-tone')).toBe('info')
    },
  )

  // §8.3 tolerance has to survive keys that are not data. `LABELS[stage]` on an
  // object literal reaches Object.prototype, so `toString` and `constructor`
  // returned a truthy function, the `??` fallback never fired, and the chip
  // rendered an EMPTY label with NO `data-tone` attribute — measured before the
  // fix, not theorised. Neither the member nor a claim, which is exactly what
  // §8.3 forbids. The lookup is a Map now, which has no prototype chain.
  it.each(['toString', 'constructor', 'valueOf', 'hasOwnProperty'])(
    'renders the prototype key %s as itself, not as a blank chip',
    (stage) => {
      const { container } = render(ProjectCard, {
        props: { project: { ...parsed, package_stage: stage } },
      })
      expect(badgeText(container)).toBe(stage)
      expect(statusBadge(container)?.getAttribute('data-tone')).toBe('neutral')
    },
  )

  it('renders an unrecognised package_stage as neutral', () => {
    // RFC 0067 §8.3: a consumer pinned to an older client MUST tolerate a member
    // it does not know rather than fail on it. Tolerating it means showing the
    // raw member and making no claim — not falling through, which would hand the
    // chip to the analysis axis and render the stale 'Complete' below.
    // No analyses at all. An unrecognised member sits BELOW progressed
    // analysis — `Before` sorts an unknown member ahead of every known one
    // (package_stage.go:99-100) precisely so a consumer meeting a future member
    // does not treat it as the most advanced, which makes "treat an unknown as
    // weak" the instruction. Seeding `complete` here would test step 5, not this
    // branch. Without it the branch has to beat the `Parsed` fallthrough, which
    // is the sharper assertion.
    const { container } = render(ProjectCard, {
      props: { project: { ...parsed, package_stage: 'summarised' } },
    })
    expect(badgeText(container)).toBe('summarised')
    expect(statusBadge(container)?.getAttribute('data-tone')).toBe('neutral')
  })

  // This file briefly asserted the opposite — that `package_stage: 'parsed'`
  // with a leftover `analyzed_status: 'complete'` must render `Parsed`, on the
  // grounds that a re-import legitimately regresses the stage (RFC 0067 §2)
  // while the old counts survive. The premise was sound and the conclusion did
  // not follow: the card cannot tell that regressed `parsed` from the `parsed`
  // the reader INFERS for every package with a populated projection, because
  // khaos-manager discards the `Recorded` flag (projects.go:291 on their
  // origin/main; that line is blank at the branch checked out locally). Believing it
  // would have regressed every analysed project from `Complete` to `Parsed` on
  // the next deploy. Fixing the stale-draft case needs `recorded` on the wire,
  // which is upstream's; it is not fixable here and pretending otherwise cost a
  // whole design.
  // All five, with no analyses, so each is read off its own rung.
  // `empty`/`imported` resolve above the analysis branches and the other three
  // below them; with analysis silent every member reaches its label either way,
  // which is what this table pins.
  it.each([
    ['empty', 'Empty', 'neutral'],
    ['imported', 'Imported', 'neutral'],
    ['parsed', 'Parsed', 'info'],
    ['indexed', 'Indexed', 'info'],
    ['enriched', 'Enriched', 'info'],
  ])('renders %s as %s/%s', (stage, label, tone) => {
    const { container } = render(ProjectCard, {
      props: { project: { ...parsed, package_stage: stage } },
    })
    expect(badgeText(container)).toBe(label)
    expect(statusBadge(container)?.getAttribute('data-tone')).toBe(tone)
  })

  // `needs_migration` is a THIRD axis — package format version — and the only
  // branch here that is an instruction to the operator rather than a status
  // report. It also gates correctness: a package needing migration may carry a
  // stage record written against an older layout.
  // `enriched` alone was not enough, and a surviving mutant proved it: moving the
  // no-content rung above `needs_migration` passed all 994 tests. `enriched`
  // resolves three rungs LOWER, so it can never reach `needs_migration` first —
  // the only members that can are `empty` and `imported`, the two that outrank
  // even a completed analysis, and they were the two untested.
  //
  // Third time this exact shape has been caught here (the deleted `imported`
  // rung; `!parsed` above `empty`/`imported`; now this): a table that pins a
  // LABEL is not pinning an ORDER, and the member that proves the order is
  // usually not the convenient one.
  it.each([['enriched'], ['empty'], ['imported'], ['summarised'], ['']])(
    'keeps needs_migration ahead of the stage %j',
    (stage) => {
      const { container } = render(ProjectCard, {
        props: { project: { ...parsed, needs_migration: true, package_stage: stage } },
      })
      expect(badgeText(container)).toBe('Needs Update')
    },
  )

  // Every package on disk today, per RFC 0067 §8.1: "No existing package carries
  // one." The analysis chain is not deleted — it remains the path for all of
  // them, and this asserts the change did not quietly strand it.
  it('falls back to the analysis chain when no stage is recorded', () => {
    const { container } = render(ProjectCard, {
      props: { project: parsed, analyses: ['scenes', 'characters', 'places'].map((kind) => ({ kind, state: 'done' })) },
    })
    expect(badgeText(container)).toBe('Complete')
  })

  it('still says Not Parsed for an unparsed package with no stage record', () => {
    const { container } = render(ProjectCard, {
      props: { project: { ...project, parsed: false } },
    })
    expect(badgeText(container)).toBe('Not Parsed')
  })

  // An empty string is absent, not a member. Go's zero value for a string field
  // arrives as "" rather than null, which is the trap this repo closed across 45
  // keyed blocks in #96 — `??` cannot see it. The stage branch must test
  // truthiness, not nullishness, or every package without a record takes the
  // stage path and renders a blank chip.
  it('treats an empty-string stage as no record at all', () => {
    const { container } = render(ProjectCard, {
      props: { project: { ...parsed, package_stage: '' }, analyses: ['scenes', 'characters', 'places'].map((kind) => ({ kind, state: 'done' })) },
    })
    expect(badgeText(container)).toBe('Complete')
  })

  // The one that actually guards the truthiness test, and review had to point it
  // out: the case above sets `complete`, so it returns THREE RUNGS ABOVE the
  // guard and would pass with presence-testing restored. With analysis silent,
  // `''` has to fall all the way through — and `!== undefined` sends it to the
  // unrecognised branch instead, rendering a chip whose label is the empty
  // string. Same blank-chip shape as the Object.prototype defect, reached by a
  // different door.
  //
  // Not hypothetical: `package_stage` carries no `omitempty`
  // (khaos-manager internal/projects/projects.go:45), deliberately, so `''` is
  // on the wire for every package the reader could not place.
  it('lets an empty-string stage fall through when analysis is silent too', () => {
    const { container } = render(ProjectCard, { props: { project: { ...parsed, package_stage: '' } } })
    expect(badgeText(container)).toBe('Parsed')
    expect(statusBadge(container)?.getAttribute('data-tone')).toBe('info')
  })
})

// The meta row became a MetaStrip: glyph + value, with the complete reading in a
// tooltip. `ch` and `loc` are gone — abbreviations a reader had to already know.
describe('the meta row reads once, and completely', () => {
  const project = {
    title: 'BROKEN IN 4 PLACES',
    scene_count: 54,
    character_count: 27,
    location_count: 26,
    modified: 1782347691,
  }
  const items = (c) => [...c.querySelectorAll('.meta-strip__item')]

  it('shows a glyph and the bare number, not an abbreviation', () => {
    const { container } = render(ProjectCard, { props: { project } })
    // Characters lead since D76. The glyph asserted here is the FIRST item's,
    // so this test also pins the order rather than only the glyph.
    const [characters] = items(container)
    expect(characters.querySelector('[class*="ph-users"]')).not.toBeNull()
    // the old row read `54 scenes 27 ch 26 loc`. Assert the ABBREVIATIONS are
    // gone, not the letters — ' ch' is a substring of ' characters', which is
    // how this assertion first failed against correct output.
    expect(container.textContent).not.toMatch(/\d+\s+ch\b/)
    expect(container.textContent).not.toMatch(/\d+\s+loc\b/)
  })

  // THE DEFECT THIS REPLACED. The first version put the complete phrase in
  // `label`, so a screen reader heard "54 scenes 54" — the hidden label and the
  // visible value both carrying the number. `label` names the GLYPH; `title`
  // carries the reading.
  it('announces the value once, not twice', () => {
    const { container } = render(ProjectCard, { props: { project } })
    const [characters] = items(container)
    expect(characters.textContent.replace(/\s+/g, ' ').trim()).toBe('characters 27')
    expect(characters.getAttribute('title')).toBe('27 characters')
  })

  it('gives a pointer the complete reading, since a glyph alone teaches nobody', () => {
    const { container } = render(ProjectCard, { props: { project } })
    expect(items(container).map((i) => i.getAttribute('title')).slice(0, 3)).toEqual([
      // D76: characters lead. The order is the assertion here, not an
      // incidental consequence of it — a surface listing the story's entities
      // puts the people first, because that is what a writer is building.
      '27 characters',
      '54 scenes',
      '26 locations',
    ])
  })

  it('agrees with itself on singulars', () => {
    const { container } = render(ProjectCard, {
      props: { project: { ...project, scene_count: 1, character_count: 1, location_count: 1 } },
    })
    expect(items(container).map((i) => i.getAttribute('title')).slice(0, 3)).toEqual([
      '1 character',
      '1 scene',
      '1 location',
    ])
  })

  it('omits a count the project does not have rather than showing a zero', () => {
    const { container } = render(ProjectCard, {
      props: { project: { ...project, character_count: 0, location_count: 0 } },
    })
    // scenes and the modified time; the two absent counts are omitted entirely
    // rather than rendering a zero the project does not claim
    expect(items(container).map((i) => i.querySelector('[class*="ph-"]').className)).toEqual([
      'ph ph-film-slate',
      'ph ph-clock',
    ])
  })

  // The git chip carries a tone, and MetaStrip takes none by D63. It stays
  // beside the strip rather than the atom growing a concept to hold it.
  it('leaves the toned git chip outside the strip', () => {
    const { container } = render(ProjectCard, {
      props: { project: { ...project, git_repo: true, git_has_remote: false } },
    })
    const chip = container.querySelector('.project__git')
    expect(chip).not.toBeNull()
    expect(chip.closest('.meta-strip')).toBeNull()
  })
})

// Six extraction states shipped in the prop contract with no catalog example for
// any of them. `check-catalog` asks that every EXPORT has a fixture, not that
// every STATE does, so a whole state machine passed the gate while being
// unrenderable here — #78's class, one component over.
describe('extraction, the active states', () => {
  const parsed = { ...{ title: 'BROKEN IN 4 PLACES', scene_count: 54 }, package_stage: 'parsed' }
  const card = (props) => render(ProjectCard, { props: { project: parsed, onExtract: () => {}, ...props } }).container
  const action = (c) => c.querySelector('.project__action')

  it('offers extraction only at the stage it is possible', () => {
    // `extractionAction` returns null at any other stage, so an example seeded
    // with `indexed` would render the idle card and quietly demo nothing.
    const atIndexed = render(ProjectCard, {
      props: { project: { ...parsed, package_stage: 'indexed' }, onExtract: () => {} },
    }).container
    expect(action(atIndexed)).toBeNull()
    expect(action(card({}))).not.toBeNull()
  })

  it.each([
    ['starting', 'Starting extraction…'],
    ['queued', 'Extraction queued'],
    ['running', 'Extracting entities from scenes'],
    ['finalizing', 'Finalizing extraction…'],
  ])('disables the action while %s, so a second run cannot be started', (state, label) => {
    const c = card({ job: { kind: 'extract', phase: state } })
    expect(action(c).disabled).toBe(true)
    expect(c.textContent).toContain(label)
  })

  // The one state whose action is ENABLED. A failure a user cannot act on is a
  // dead end, so it reads Retry rather than going quiet.
  it('re-enables the action on failure and names it as a retry', () => {
    const c = card({ job: { kind: 'extract', phase: 'failed' } })
    expect(action(c).disabled).toBe(false)
    expect(action(c).getAttribute('aria-label')).toContain('Retry extraction')
    expect(c.textContent).toContain('Extraction failed')
  })

  it('shows a count only where one exists', () => {
    expect(card({ job: { kind: 'extract', phase: 'running', progress: { completed: 31, total: 107 } } })
      .textContent).toContain('31/107')
    // OMITTED, not zeroed. An extractor that reports no progress is not a
    // degraded version of one that does; `0/0` would be a fabricated claim.
    expect(card({ job: { kind: 'extract', phase: 'running' } }).textContent).not.toMatch(/\d+\/\d+/)
  })

  it('refuses a progress pair that cannot be true', () => {
    for (const bad of [{ completed: 5, total: 0 }, { completed: -1, total: 10 }, { completed: 11, total: 10 }]) {
      expect(card({ job: { kind: 'extract', phase: 'running', progress: bad } }).textContent).not.toMatch(/\d+\/\d+/)
    }
  })

  it('marks the stage rail segment that is in flight', () => {
    const c = card({ job: { kind: 'extract', phase: 'running' } })
    const steps = [...c.querySelectorAll('.project__stage-step')]
    expect(steps.findIndex((s) => s.className.includes('--active'))).toBeGreaterThanOrEqual(0)
    // idle parses have no in-flight segment to mark
    const idle = [...card({}).querySelectorAll('.project__stage-step')]
    expect(idle.some((s) => s.className.includes('--active'))).toBe(false)
  })
})

// The rail and the count were two progress readings side by side that could not
// agree: the bar sat at two thirds because the package was at its third stage,
// while the count said 29% because extraction was 31 of 107. A reader had no way
// to tell which one meant "how far". The in-flight segment now fills by the SAME
// number the chip prints.
describe('the rail and the count are one fact', () => {
  const parsed = { title: 'BROKEN IN 4 PLACES', scene_count: 54, package_stage: 'parsed' }
  const card = (props) => render(ProjectCard, { props: { project: parsed, onExtract: () => {}, ...props } }).container

  it('fills the in-flight segment to the fraction the chip reports', () => {
    const c = card({ job: { kind: 'extract', phase: 'running', progress: { completed: 31, total: 107 } } })
    expect(c.textContent).toContain('31/107')
    expect(c.querySelector('.project__stage-fill').style.width).toBe('29%')
  })

  it.each([
    [{ completed: 0, total: 107 }, '0%'],
    [{ completed: 107, total: 107 }, '100%'],
    [{ completed: 54, total: 107 }, '50%'],
  ])('fill tracks the pair %o', (progress, width) => {
    const c = card({ job: { kind: 'extract', phase: 'running', progress: progress } })
    expect(c.querySelector('.project__stage-fill').style.width).toBe(width)
  })

  // An extractor reporting nothing is NOT zero progress. A 0% fill would claim
  // no work had been done; the indeterminate shimmer says work is happening and
  // its extent is unknown, which is the honest reading.
  it('keeps the indeterminate segment when nothing is counted', () => {
    const c = card({ job: { kind: 'extract', phase: 'running' } })
    expect(c.querySelector('.project__stage-fill')).toBeNull()
    expect(c.querySelector('.project__stage-step--measured')).toBeNull()
    expect(c.querySelector('.project__stage-step--active')).not.toBeNull()
  })

  it('does not fill a segment for a state that reports no progress at all', () => {
    for (const state of ['starting', 'queued', 'finalizing', 'failed']) {
      expect(card({ job: { kind: 'extract', phase: state } }).querySelector('.project__stage-fill')).toBeNull()
    }
  })

  // Source-level: jsdom resolves no stylesheets, so a rendered assertion about
  // the cascade passes whether the rule exists or not (#116, #113).
  it('drops the shimmer on a measured step, declared after the rule it overrides', () => {
    const src = readFileSync(
      join(import.meta.dirname, '../../../..', 'components/svelte/ProjectCard.svelte'),
      'utf8',
    )
    const active = src.indexOf('.project__stage-step--active {')
    const measured = src.indexOf('.project__stage-step--measured {')
    expect(measured).toBeGreaterThan(active)
    const block = src.slice(measured, src.indexOf('}', measured))
    expect(block).toMatch(/animation:\s*none/)
    // reduced motion must keep the TRACK, not paint the step solid — otherwise a
    // reader who asked for less motion is shown a step that looks finished
    const rm = src.slice(src.indexOf('prefers-reduced-motion'))
    expect(rm.slice(0, rm.indexOf('\n  }\n'))).toContain('--measured')
  })
})

// khaos-app's failed extraction offers its fix and Report a Problem… on the card
// itself (onboarding A5): the card says "Extraction failed" and had nowhere to put
// what to do about it. The host's content, below the footer, and reachable above
// the card's activate overlay.
describe('ProjectCard carries the host content below the footer', () => {
  it('renders the host snippet after the status, as a control a pointer can reach', async () => {
    const onReport = vi.fn()
    const children = createRawSnippet(() => ({
      render: () => '<div><button type="button">Report a Problem…</button></div>',
      setup: (node) => node.querySelector('button').addEventListener('click', onReport),
    }))
    const { container } = render(ProjectCard, {
      props: { project: { ...project, package_stage: 'parsed', parsed: true }, job: { kind: 'extract', phase: 'failed' }, children },
    })
    const report = screen.getByRole('button', { name: 'Report a Problem…' })
    const status = container.querySelector('.project__status')
    expect(status.compareDocumentPosition(report) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(report.closest('.project__detail')).not.toBeNull()
    expect(report.closest('[aria-hidden="true"]')).toBeNull()
    await fireEvent.click(report)
    expect(onReport).toHaveBeenCalledOnce()
  })

  it('draws no empty slot without one', () => {
    const { container } = render(ProjectCard, { props: { project } })
    expect(container.querySelector('.project__detail')).toBeNull()
  })

  it('raises the slot above the activate overlay, so a click reaches it', () => {
    const css = readFileSync(join(__dirname, '../../../../components/svelte/ProjectCard.svelte'), 'utf8')
    const rule = css.match(/\.project__detail\s*\{[^}]*\}/)?.[0] ?? ''
    expect(rule).toMatch(/position:\s*relative/)
    expect(rule).toMatch(/z-index:\s*2/)
  })
})

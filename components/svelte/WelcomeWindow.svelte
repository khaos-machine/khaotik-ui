<script>
  // WelcomeWindow — the desktop welcome window (data-layer plan A11; audit §3.9, §5.7 "Yes,
  // recents table"; khaos.machine docs/designs/2026-03-24-launcher-and-onboarding.md:171).
  //
  // An action rail with the engine plates under it, and the stories as ProjectCards. The plates
  // (the engine, its routing, the on-device engines) are always visible (operator, 2026-10-09:
  // "want to see these and not have them buried as they are the first indicator of the state
  // of the workspace"); the rail scrolls on its own when the window is too short for them. The
  // cards stay (operator, 2026-10-09: "bring back the cards but adjust to fit"), sized to the
  // pane beside the rail, each with its own job, progress and actions,
  // so an import shows from the moment it is confirmed. The card grid scrolls on its own.
  //
  // A missing rail handler renders the action disabled, saying why on hover; a missing
  // destructive handler hides it. The one exception is opt-in:
  // `clone: false` makes the Clone action absent, for a host where cloning is not a feature at
  // all on the person's path (khaos-app Basic: "Writers do not know git").
  import Button from './Button.svelte'
  import EngineDetails from './EngineDetails.svelte'
  import KhaosLogo from './KhaosLogo.svelte'
  import ProjectCard from './ProjectCard.svelte'

  /** @typedef {import('./lib/types.js').Project} Project */
  /** @typedef {import('./lib/types.js').ProjectJob} ProjectJob */

  /**
   * @typedef {Object} Props
   * @property {{ state?: string, components?: readonly any[], appVersion?: string, daemonVersion?: string, wflAvailable?: boolean }} [engine] The engine's readings, as `EngineDetails` takes them.
   * @property {readonly any[]} [routes] The routed capabilities, as `EngineDetails` takes them.
   * @property {readonly any[]} [services] The on-device engines, as `EngineDetails` takes them. **Omit it and the "On-device engines" plate is absent**; an empty list keeps the plate with "No on-device engines" (a host on a path with no local engines omits it).
   * @property {readonly Project[]} [projects] The stories, in the order to list them; an importing one first.
   * @property {(project: Project) => (ProjectJob | undefined)} [jobFor] The job running on a story, if any.
   * @property {(project: Project) => (readonly import('./lib/types.js').ProjectAnalysis[] | undefined)} [analysesFor] What the host knows of a story's three analyses, as ProjectCard `analyses` takes it.
   * @property {(project: Project) => ({ src?: string, srcset?: string } | undefined)} [coverFor] Cover art per story; nothing keeps the card's monogram.
   * @property {(event: MouseEvent) => void} [onImport] Rail action. Disabled when omitted.
   * @property {(event: MouseEvent) => void} [onOpen] Rail action, the browse-for-a-bundle verb. Disabled when omitted.
   * @property {(event: MouseEvent) => void} [onClone] Rail action. Disabled when omitted.
   * @property {boolean} [clone] Whether the Clone action is there at all. Default true; **false makes it absent**, not disabled.
   * @property {(event: MouseEvent) => void} [onSettings] Rail action that opens the host's Settings. **Absent when omitted**, not disabled: a host without a Settings window offers none.
   * @property {() => void} [onRefresh] Reloads the list. Hidden when omitted.
   * @property {(project: Project) => void} [onOpenProject] A story card being activated.
   * @property {(project: Project) => void} [onExtractProject] The card's extraction verb. Hidden when omitted.
   * @property {(project: Project) => void} [onInitGit] The card's "initialise a repo" verb, for a story without one. Hidden when omitted.
   * @property {(project: Project) => void} [onRemoveProject] The card's **Remove from Recents** verb. It never deletes a project, so it needs no confirmation (project portability plan, D1). Hidden when omitted.
   * @property {import('svelte').Snippet<[Project]>} [detail] Per-card host content, given that story's project and rendered as its ProjectCard `children`.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let {
    engine = {},
    routes = [],
    services = undefined,
    projects = [],
    jobFor = undefined,
    analysesFor = undefined,
    coverFor = undefined,
    onImport = undefined,
    onOpen = undefined,
    onClone = undefined,
    clone = true,
    onSettings = undefined,
    onRefresh = undefined,
    onOpenProject = undefined,
    onExtractProject = undefined,
    onInitGit = undefined,
    onRemoveProject = undefined,
    detail = undefined,
    uiId = 'welcome',
  } = $props()

  /** A rail action the host cannot handle stays, dimmed, and says why on hover. @param {unknown} handler */
  const unavailable = (handler) => (handler ? undefined : 'Not available in this app')

  // The card loop's keys: path first (an import keeps its path while
  // its id changes), then id, then the position; a repeat takes an occurrence suffix.
  const keyed = $derived.by(() => {
    const seen = new Map()
    return projects.map((project, i) => {
      const base = project.path || project.id || `\u0000${i}`
      const n = seen.get(base) ?? 0
      seen.set(base, n + 1)
      return { project, key: n ? `${base}\u0000${n}` : base }
    })
  })
</script>

<div class="welcome" data-ui-id={uiId}>
  <aside class="welcome__rail" aria-label="Actions and engine">
    <div class="welcome__head-rail">
      <div class="welcome__brand">
        <KhaosLogo size={28} />
        <div class="welcome__brand-text">
          <span class="welcome__title">Khaos Machine</span>
          <span class="welcome__subtitle">Storyteller IDE</span>
        </div>
      </div>
      <nav class="welcome__actions" aria-label="Project actions">
        <Button variant="primary" icon="file-plus" disabled={!onImport} title={unavailable(onImport)} onclick={(e) => onImport?.(e)}>Import Screenplay</Button>
        <Button icon="folder-open" disabled={!onOpen} title={unavailable(onOpen)} onclick={(e) => onOpen?.(e)}>Open… ⌘O</Button>
        {#if clone}<Button icon="git-branch" disabled={!onClone} title={unavailable(onClone)} onclick={(e) => onClone?.(e)}>Clone Repository</Button>{/if}
        {#if onSettings}<Button icon="gear" onclick={(e) => onSettings?.(e)}>Settings…</Button>{/if}
      </nav>
    </div>
    <EngineDetails {engine} {routes} {services} uiId="{uiId}.engine" />
  </aside>

  <main class="welcome__main">
    <header class="welcome__head">
      <h1 class="welcome__heading">Stories</h1>
      {#if onRefresh}<Button icon="arrow-clockwise" onclick={() => onRefresh()}>Refresh</Button>{/if}
    </header>
    {#if projects.length}
      <ul class="welcome__cards" aria-label="Stories">
        {#each keyed as { project, key } (key)}
          {@const art = coverFor?.(project)}
          <!-- Declared in the loop so it closes over this card's project. -->
          {#snippet cardDetail()}{@render detail?.(project)}{/snippet}
          <li>
            <ProjectCard
              {project}
              cover={art?.src ?? ''}
              coverSrcset={art?.srcset ?? ''}
              onOpen={() => onOpenProject?.(project)}
              {...(onRemoveProject ? { onRemove: () => onRemoveProject(project) } : {})}
              {...(onInitGit ? { onInitGit: () => onInitGit(project) } : {})}
              job={jobFor?.(project)}
              analyses={analysesFor?.(project)}
              {...(onExtractProject ? { onExtract: () => onExtractProject(project) } : {})}
              {...(detail ? { children: cardDetail } : {})} />
          </li>
        {/each}
      </ul>
    {:else}
      <p class="welcome__none">No stories yet — import a screenplay to begin.</p>
    {/if}
  </main>

</div>

<style>
  .welcome {
    display: grid;
    /* 236px: a version with its update verdict and a model name
       beside its provider mark fit on one row. */
    grid-template-columns: 236px minmax(0, 1fr);
    height: 100%;
    min-height: 0;
    background: var(--surface-base);
    color: var(--text-primary);
  }
  /* Its own scroll region: at 1000x680 the actions and every plate show whole; in a shorter
     window the rail scrolls rather than clipping what does not fit. */
  .welcome__rail {
    display: flex;
    flex-direction: column;
    border-right: var(--size-stroke-hairline) solid var(--border-default);
    min-height: 0;
    overflow-y: auto;
  }
  .welcome__head-rail {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-sm);
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }
  .welcome__brand {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }
  .welcome__brand-text {
    display: flex;
    flex-direction: column;
  }
  .welcome__title {
    font-size: var(--label-md-size);
    font-weight: 600;
  }
  .welcome__subtitle {
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
  .welcome__actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  .welcome__actions :global(button) {
    justify-content: flex-start;
  }
  .welcome__main {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }
  .welcome__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }
  .welcome__heading {
    margin: 0;
    font-size: var(--label-md-size);
    font-weight: 600;
  }
  /* A scroll region of its own, as the rail is. Cards fill the pane beside the rail: as many 220px columns as fit,
     one at 720 wide beside the 236px rail, three at 1000 (measured in khaos-app), stretched so no column of space is left over. */
  .welcome__cards {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    align-content: start;
    gap: var(--spacing-sm);
    margin: 0;
    padding: var(--spacing-sm);
    list-style: none;
  }
  .welcome__none {
    margin: 0;
    padding: var(--spacing-sm);
    color: var(--text-secondary);
    font-size: var(--body-md-size);
  }
</style>

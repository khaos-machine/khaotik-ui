<script>
  // The engine's resource registry, browsable by the JOB each resource does.
  //
  // WHY BY JOB, NOT BY KIND. Listed by kind — 23 prompts, 19 system messages, 20
  // schemas — the registry read as three long lists of filenames, and four versions of
  // one prompt sat beside each other with nothing saying which ran. The operator
  // (2026-10-12): "it's still not clear for anyone but me what we're actually looking
  // at here", and "the prompts with multiple versions should display latest/active".
  // A job is what the engine does — analyse a scene's claims, write a character's
  // story — and it runs with three resources: a PROMPT (what to do), a SYSTEM MESSAGE
  // (how to behave) and a SCHEMA (the shape of the answer). So the index lists jobs,
  // and a job's detail shows those three together, with retired versions behind
  // "Older versions".
  //
  // EVERY LINK IS THE ENGINE'S. `systemMessageId`, `schemaId`, `family`, `retained`
  // and `usedBy` come from khaos-tools' registry through `GET /api/catalog/prompts`
  // (khaos-tools #1120). Nothing here infers a link from an id: a prompt the engine
  // gives no family is its own job, and a system message or schema no current prompt
  // uses goes to "Not in use" rather than being attached by name.
  //
  // ONE ENDPOINT SERVES EVERY KIND, and `kind` discriminates (verified against khaosd
  // 0.6.4, kept since). Ids are unique only within a kind — a prompt and a system
  // message can share one — so selection matches on id AND kind.
  //
  // An unfetchable body reads as "listed, not previewable" rather than as an error,
  // driven by the host telling us, because the registry entry is real either way.
  import Icon from './Icon.svelte'
  import EmptyState from './EmptyState.svelte'

  /**
   * A registry entry, straight from `GET /api/catalog/prompts`. `kind` is a plain
   * string: an unknown kind renders under its own id rather than being dropped.
   * @typedef {Object} CatalogArtifact
   * @property {string} id
   * @property {string} kind
   * @property {string} [domain]
   * @property {string} [version]
   * @property {string} [description]
   * @property {string} [hash]
   * @property {string} [source]
   * @property {string} [status]
   * @property {string} [systemMessageId] A prompt's system message, by catalog id.
   * @property {string} [schemaId] A prompt's schema, by catalog id.
   * @property {string} [family] The current prompt a prompt belongs to; its own id when current.
   * @property {boolean} [retained] A historical contract kept for provenance; no new run uses it.
   * @property {string} [notes] The registry's note on the entry, verbatim — on a retained prompt, what replaced it and why.
   * @property {readonly string[]} [usedBy] On a system message or schema: the prompts that use it, current first.
   * @property {readonly string[]} [usedFor] On a prompt: the names of the engine's jobs that run it, from the engine's own declared table (khaos-tools #1122). Empty means no job runs it.
   * @property {readonly {version: string, released?: string, deprecated?: boolean}[]} [versions] On a prompt: its version history as the registry declares it, newest first.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly CatalogArtifact[]} [artifacts] `GET /api/catalog/prompts`, verbatim. **One endpoint returns every kind**, so the grouping is derived here.
   * @property {string} [selectedId] Controlled selection, like the rest of the library.
   * @property {string} [selectedKind] The selection's kind. Ids are unique only within a kind; without it the first artifact with the id is taken.
   * @property {string} [selectedVersion] A past version of the selected prompt, when one is chosen from its history. Empty means the current version.
   * @property {(artifact: CatalogArtifact, version?: string) => void} [onSelect] Called with the whole artifact — and, for a past version from a prompt's history, that version — so the host can fetch the right body without a second lookup.
   * @property {string} [body] The selected artifact's body, fetched by the host — this component does no I/O.
   * @property {{version?: string, source?: string, hash?: string}} [bodyMeta] The version, source and hash of the body the host fetched. Shown in place of the listed entry's — and for a past version, the listed entry's source and hash (which are the CURRENT version's) are never shown in their stead.
   * @property {string} [bodyUnavailable] Why there is no body, when there is none. Renders the **listed, not previewable** state, deliberately not an error. Empty means "nothing fetched yet".
   * @property {readonly string[]} [kindOrder] Order for the sections of resources that are not part of a job (report templates, rubrics, eval fixtures). A kind not listed is appended rather than dropped.
   */

  /** @type {Props} */
  let {
    artifacts = [],
    selectedId = '',
    selectedKind = '',
    selectedVersion = '',
    onSelect = undefined,
    body = '',
    bodyMeta = undefined,
    bodyUnavailable = '',
    kindOrder = ['report_template', 'rubric', 'eval_fixture'],
  } = $props()

  // Labels for the engine's snake_case words. Presentation only: an unknown word
  // renders as itself, so something added upstream shows up rather than vanishing.
  const KIND_LABELS = {
    prompt: 'Prompts',
    system_message: 'System messages',
    schema: 'Schemas',
    report_template: 'Report templates',
    rubric: 'Rubrics',
    eval_fixture: 'Eval fixtures',
  }
  const KIND_ONE = { prompt: 'Prompt', system_message: 'System message', schema: 'Schema' }
  const KIND_ICONS = {
    report_template: 'file-text',
    rubric: 'ruler',
    eval_fixture: 'flask',
  }
  const DOMAIN_LABELS = {
    scene: 'Scenes',
    character: 'Characters',
    location: 'Places',
    relationship: 'Relationships',
    coverage: 'Coverage',
  }
  const DOMAIN_ORDER = ['scene', 'character', 'location', 'relationship', 'coverage']
  const DOMAIN_ICONS = {
    scene: 'film-slate',
    character: 'user',
    location: 'map-pin',
    relationship: 'graph',
    coverage: 'chart-bar',
  }
  const JOB_KINDS = ['prompt', 'system_message', 'schema']
  const capitalise = (word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : 'Other')

  // Whether the engine reports use at all. When it does, a prompt no job runs is NOT a job
  // here — it is "Not in use" — and a system message or schema counts as used only through
  // a prompt that is. When it does not (an engine before #1122), nothing claims either way.
  const reportsUse = $derived(artifacts.some((a) => a.kind === 'prompt' && (a.usedFor ?? []).length > 0))
  const isInUse = (a) => !reportsUse || (a.usedFor ?? []).length > 0
  const isCurrentPrompt = (a) => a.kind === 'prompt' && !a.retained && isInUse(a)
  const familyOf = (a) => (a.retained ? a.family || '' : a.family || a.id)
  const versionOrder = (a, b) =>
    String(b.version ?? '').localeCompare(String(a.version ?? ''), undefined, { numeric: true })

  /**
   * One job per current prompt, keyed by its family, with its retired versions. A prompt
   * with no id and no family (khaosd has sent `id: ''`) keys by position, so five of them
   * stay five jobs rather than collapsing into one; such a job can never be selected.
   */
  const jobs = $derived.by(() => {
    const byFamily = new Map()
    artifacts.forEach((a, index) => {
      if (!isCurrentPrompt(a)) return
      const family = familyOf(a)
      byFamily.set(family || `\u0000${index}`, { family, prompt: a, older: [] })
    })
    for (const a of artifacts) {
      if (a.kind === 'prompt' && a.retained && a.family && byFamily.has(a.family)) byFamily.get(a.family).older.push(a)
    }
    for (const job of byFamily.values()) job.older.sort(versionOrder)
    return byFamily
  })

  const currentPromptIds = $derived(new Set([...jobs.values()].map((job) => job.prompt.id)))

  /** The index: jobs by what they analyse, then other kinds, then what no job uses. */
  const sections = $derived.by(() => {
    const out = []
    const byDomain = new Map()
    for (const job of jobs.values()) {
      const domain = job.prompt.domain || ''
      if (!byDomain.has(domain)) byDomain.set(domain, [])
      byDomain.get(domain).push(job)
    }
    const domains = [
      ...DOMAIN_ORDER.filter((d) => byDomain.has(d)),
      ...[...byDomain.keys()].filter((d) => !DOMAIN_ORDER.includes(d)).sort(),
    ]
    for (const domain of domains) {
      out.push({
        key: `job:${domain}`,
        label: DOMAIN_LABELS[domain] ?? capitalise(domain),
        icon: DOMAIN_ICONS[domain] ?? 'circles-three',
        rows: byDomain
          .get(domain)
          .slice()
          .sort((a, b) => a.prompt.id.localeCompare(b.prompt.id))
          .map((job) => ({ artifact: job.prompt, family: job.family, older: job.older.length })),
      })
    }

    const others = new Map()
    for (const a of artifacts) {
      if (JOB_KINDS.includes(a.kind)) continue
      if (!others.has(a.kind)) others.set(a.kind, [])
      others.get(a.kind).push(a)
    }
    const kinds = [
      ...kindOrder.filter((k) => others.has(k)),
      ...[...others.keys()].filter((k) => !kindOrder.includes(k)).sort(),
    ]
    for (const kind of kinds) {
      out.push({
        key: `kind:${kind}`,
        label: KIND_LABELS[kind] ?? kind,
        icon: KIND_ICONS[kind] ?? 'file',
        rows: others
          .get(kind)
          .slice()
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((a) => ({ artifact: a, family: '', older: 0 })),
      })
    }

    // A system message or schema no current prompt names, and a retained prompt with
    // no current family: still the engine's, so listed — but not as part of a job.
    const unused = artifacts.filter(
      (a) =>
        ((a.kind === 'system_message' || a.kind === 'schema') &&
          !(a.usedBy ?? []).some((id) => currentPromptIds.has(id))) ||
        (a.kind === 'prompt' && a.retained && !jobs.has(a.family)) ||
        (a.kind === 'prompt' && !a.retained && !isInUse(a)),
    )
    if (unused.length) {
      out.push({
        key: 'unused',
        label: 'Not in use',
        icon: 'archive',
        rows: unused
          .slice()
          .sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id))
          .map((a) => ({ artifact: a, family: '', older: 0 })),
      })
    }
    return out
  })

  // `Boolean(selectedId) &&` because khaosd has sent `id: ''`, and `selectedId`
  // defaults to '' — without it the first artifact would match at rest.
  const selected = $derived.by(() => {
    if (!selectedId) return null
    return (
      artifacts.find((a) => a.id === selectedId && (!selectedKind || a.kind === selectedKind)) ??
      null
    )
  })

  /** The job the selection belongs to, if any: by its own family, or by who uses it. */
  const selectedJob = $derived.by(() => {
    if (!selected) return null
    if (selected.kind === 'prompt') return (familyOf(selected) && jobs.get(familyOf(selected))) || null
    if (selected.kind === 'system_message' || selected.kind === 'schema') {
      const user = (selected.usedBy ?? []).find((id) => currentPromptIds.has(id))
      if (!user) return null
      return [...jobs.values()].find((job) => job.prompt.id === user) ?? null
    }
    return null
  })

  const find = (id, kind) => (id ? (artifacts.find((a) => a.id === id && a.kind === kind) ?? null) : null)

  /** The job's three resources, each present only where the engine links it. */
  const tabs = $derived.by(() => {
    if (!selectedJob) return []
    const prompt = selected?.kind === 'prompt' ? selected : selectedJob.prompt
    return [
      { kind: 'prompt', artifact: prompt },
      { kind: 'system_message', artifact: find(prompt.systemMessageId, 'system_message') },
      { kind: 'schema', artifact: find(prompt.schemaId, 'schema') },
    ].filter((tab) => tab.artifact)
  })

  /** A job's past versions: its own history first, then any retained entries the engine lists. */
  const older = $derived.by(() => {
    if (!selectedJob) return []
    const prompt = selectedJob.prompt
    const history = (prompt.versions ?? [])
      .filter((v) => v.version && v.version !== prompt.version)
      .map((v) => ({ key: `v:${v.version}`, label: `v${v.version}`, line: v.released ? `Released ${v.released}` : '', artifact: prompt, version: v.version }))
    const listed = new Set(history.map((h) => h.version))
    const retained = selectedJob.older
      .filter((a) => !listed.has(a.version))
      .map((a) => ({ key: `a:${a.id}`, label: a.version ? `v${a.version}` : a.id, line: a.notes || a.description || a.id, artifact: a, version: '' }))
    return [...history, ...retained]
  })
  const viewingPast = $derived(
    Boolean(selected) &&
      ((selected.kind === 'prompt' && selected.retained) ||
        (Boolean(selectedVersion) && selected.kind === 'prompt' && selectedVersion !== selected.version)),
  )

  // A past version's own file and hash come only from the body the host fetched: the
  // listed entry describes the CURRENT version, and showing its source beside v8's text
  // would read as correct and be wrong.
  const shownVersion = $derived(bodyMeta?.version || selectedVersion || selected?.version || '')
  const shownSource = $derived(bodyMeta?.source || (selectedVersion ? '' : selected?.source || ''))
  const shownHash = $derived(bodyMeta?.hash || (selectedVersion ? '' : selected?.hash || ''))

  const rowIsOn = (row) =>
    row.family
      ? Boolean(selectedJob) && selectedJob.family === row.family
      : Boolean(selected) && selected.id === row.artifact.id && selected.kind === row.artifact.kind
</script>

<div class="catalog">
  <nav class="catalog__index" aria-label="Catalog resources">
    {#if sections.length}
      {#each sections as section (section.key)}
        <div class="catalog__section">
          <p class="eyebrow catalog__kind">
            <Icon name={section.icon} />
            {section.label}
            <span class="catalog__count">{section.rows.length}</span>
          </p>
          <ul class="catalog__list">
            <!-- Index-keyed: khaosd has sent empty-string ids, and a bare id key
                 would make every such row key the same and throw. -->
            {#each section.rows as row, i (i)}
              <li>
                <button
                  type="button"
                  class="catalog__item"
                  class:catalog__item--on={rowIsOn(row)}
                  aria-current={rowIsOn(row) ? 'true' : undefined}
                  title={row.artifact.description || row.artifact.id}
                  onclick={() => onSelect?.(row.artifact)}
                >
                  <span class="catalog__id">{row.artifact.id}</span>
                  {#if section.key === 'unused'}
                    <span class="catalog__tag">{KIND_ONE[row.artifact.kind] ?? row.artifact.kind}</span>
                  {:else if row.older}
                    <span class="catalog__tag" title="{row.older} older version{row.older === 1 ? '' : 's'}"
                      >+{row.older}</span>
                  {/if}
                  {#if row.artifact.description}
                    <span class="catalog__line">{row.artifact.description}</span>
                  {/if}
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    {:else}
      <EmptyState title="No resources" description="The engine reported an empty catalog." icon="folder-open" />
    {/if}
  </nav>

  <section class="catalog__detail" aria-label="Selected resource">
    {#if selected}
      <header class="catalog__head">
        <p class="eyebrow catalog__eyebrow">
          {#if selectedJob}
            {DOMAIN_LABELS[selectedJob.prompt.domain] ?? capitalise(selectedJob.prompt.domain)}
          {:else}
            {KIND_LABELS[selected.kind] ?? selected.kind}
          {/if}
        </p>
        <h2 class="catalog__title">
          {selectedJob ? selectedJob.prompt.id : selected.id}
          {#if !selectedJob && reportsUse && selected.kind === 'prompt' && !selected.retained}
            <span class="catalog__badge catalog__badge--retained">Not in use</span>
          {/if}
          {#if selectedJob}
            {#if viewingPast}
              <span class="catalog__badge catalog__badge--retained">Retired version</span>
            {:else if reportsUse}
              <span class="catalog__badge catalog__badge--active">In use</span>
            {:else}
              <!-- "Current", not "Active": the registry says which version is current; it
                   says nothing about whether anything runs it (scene-analysis-v2 is
                   current and nothing in the engine calls it). -->
              <span class="catalog__badge catalog__badge--active">Current version</span>
            {/if}
          {/if}
        </h2>
        {#if (selectedJob ? selectedJob.prompt : selected).description}
          <p class="catalog__description">{(selectedJob ? selectedJob.prompt : selected).description}</p>
        {/if}
        {#if selectedJob && (selectedJob.prompt.usedFor ?? []).length}
          <p class="catalog__used-for">Used for: {(selectedJob.prompt.usedFor ?? []).join(' · ')}</p>
        {:else if reportsUse && selected.kind === 'prompt' && !selected.retained}
          <p class="catalog__used-for">No job in the engine runs this prompt.</p>
        {/if}
      </header>

      {#if tabs.length}
        <!-- A job runs with three resources; each tab is one of them, as the engine
             links it. Choosing one selects it, so the host fetches its body. -->
        <div class="catalog__tabs" role="tablist" aria-label="Resources this job runs with">
          {#each tabs as tab (tab.kind)}
            <button
              type="button"
              role="tab"
              class="catalog__tab"
              aria-selected={selected.kind === tab.kind && !(tab.kind === 'prompt' && selectedVersion)}
              onclick={() => onSelect?.(tab.artifact)}
            >
              {KIND_ONE[tab.kind]}
              <span class="catalog__tab-id">{tab.artifact.version ? `v${tab.artifact.version}` : tab.artifact.id}</span>
            </button>
          {/each}
        </div>
      {/if}

      {#if selected.kind === 'prompt' && selected.retained && selected.notes}
        <p class="catalog__note"><Icon name="clock-counter-clockwise" /> {selected.notes}</p>
      {/if}

      <dl class="catalog__meta">
        <dt>Id</dt><dd class="catalog__mono">{selected.id}</dd>
        {#if shownVersion}
          <dt>Version</dt><dd>{shownVersion}</dd>
        {/if}
        {#if shownSource}
          <dt>Source</dt><dd class="catalog__mono">{shownSource}</dd>
        {/if}
        {#if shownHash}
          <!-- The full hash, not a prefix: it is compared against a deployed
               artifact, and half a hash compares to nothing. -->
          <dt>Hash</dt><dd class="catalog__mono catalog__hash">{shownHash}</dd>
        {/if}
        {#if !selectedJob && (selected.usedBy ?? []).length}
          <dt>Used by</dt><dd class="catalog__mono">{(selected.usedBy ?? []).join(', ')}</dd>
        {/if}
      </dl>

      {#if body}
        <pre class="catalog__body"><code>{body}</code></pre>
      {:else if bodyUnavailable}
        <p class="catalog__unavailable">
          <Icon name="eye-slash" />
          <span>Listed, not previewable. <span class="catalog__reason">{bodyUnavailable}</span></span>
        </p>
      {/if}

      {#if older.length}
        <details class="catalog__older" open={viewingPast}>
          <summary>Older versions ({older.length})</summary>
          <ul class="catalog__older-list">
            {#each older as old (old.key)}
              {@const on = old.version
                ? selected.id === old.artifact.id && selectedVersion === old.version
                : selected.id === old.artifact.id && selected.kind === old.artifact.kind}
              <li>
                <button
                  type="button"
                  class="catalog__older-item"
                  aria-current={on ? 'true' : undefined}
                  onclick={() => (old.version ? onSelect?.(old.artifact, old.version) : onSelect?.(old.artifact))}
                >
                  <span class="catalog__mono">{old.label}</span>
                  <span class="catalog__line">{old.line}</span>
                </button>
              </li>
            {/each}
          </ul>
        </details>
      {/if}
    {:else}
      <EmptyState
        title="Nothing selected"
        description="Pick a job to see the prompt, system message and schema it runs with."
        icon="hand-pointing" />
    {/if}
  </section>
</div>

<style>
  .catalog {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: var(--spacing-lg);
    height: 100%;
    min-height: 0;
    font-size: var(--body-md-size);
  }

  .catalog__index {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    min-width: 0;
    padding-right: var(--spacing-sm);
    border-right: 1px solid var(--border-default);
    overflow-y: auto;
  }

  .catalog__kind {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    margin: 0 0 var(--spacing-2xs);
  }

  .catalog__count {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
    color: var(--text-secondary);
  }

  .catalog__list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .catalog__item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: var(--spacing-xs);
    width: 100%;
    padding: 4px 8px;
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-primary);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .catalog__item:hover {
    background: color-mix(in oklab, var(--text-primary) 6%, transparent);
  }

  .catalog__item--on {
    background: color-mix(in oklab, var(--text-primary) 10%, transparent);
  }

  .catalog__item:focus-visible,
  .catalog__tab:focus-visible,
  .catalog__older-item:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: -2px;
  }

  .catalog__id {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
  }

  .catalog__tag {
    color: var(--text-secondary);
    font-size: var(--caption-size);
    font-variant-numeric: tabular-nums;
  }

  .catalog__line {
    grid-column: 1 / -1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  .catalog__detail {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
  }

  .catalog__head {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .catalog__eyebrow {
    margin: 0;
  }

  .catalog__title {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin: 0;
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    font-weight: var(--heading-md-weight);
  }

  .catalog__badge {
    padding: 0 6px;
    border-radius: var(--radius-sm);
    font-size: var(--caption-size);
    font-weight: 600;
  }

  .catalog__badge--active {
    background: color-mix(in oklab, var(--tone-success) 16%, transparent);
    color: var(--tone-success);
  }

  .catalog__badge--retained {
    background: color-mix(in oklab, var(--text-primary) 10%, transparent);
    color: var(--text-secondary);
  }

  .catalog__description {
    margin: 0;
    color: var(--text-secondary);
  }

  .catalog__used-for {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }

  .catalog__tabs {
    display: flex;
    gap: 2px;
    border-bottom: 1px solid var(--border-default);
  }

  .catalog__tab {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 4px var(--spacing-sm);
    border: 0;
    border-bottom: 2px solid transparent;
    background: none;
    color: var(--text-secondary);
    font: inherit;
    cursor: pointer;
  }

  .catalog__tab[aria-selected='true'] {
    border-bottom-color: var(--text-primary);
    color: var(--text-primary);
    font-weight: 600;
  }

  .catalog__tab-id {
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    font-weight: 400;
    color: var(--text-secondary);
  }

  .catalog__note {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-xs);
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }

  .catalog__meta {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 2px var(--spacing-sm);
    margin: 0;
  }

  .catalog__meta dt,
  .catalog__meta dd {
    margin: 0;
    font-size: var(--caption-size);
    color: var(--text-secondary);
    min-width: 0;
  }

  .catalog__mono {
    font-family: var(--font-mono);
  }

  /* Wraps rather than truncates: a hash exists to be compared, and half of one
     compares to nothing. */
  .catalog__hash {
    overflow-wrap: anywhere;
  }

  .catalog__body {
    margin: 0;
    padding: var(--spacing-sm);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-base);
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    overflow-x: auto;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .catalog__unavailable {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin: 0;
    padding: var(--spacing-sm);
    border: 1px dashed var(--border-default);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
  }

  .catalog__reason {
    font-family: var(--font-mono);
    font-size: var(--caption-size);
  }

  .catalog__older summary {
    color: var(--text-secondary);
    font-size: var(--caption-size);
    cursor: pointer;
  }

  .catalog__older-list {
    margin: var(--spacing-xs) 0 0;
    padding: 0;
    list-style: none;
  }

  .catalog__older-item {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    column-gap: var(--spacing-xs);
    width: 100%;
    padding: 4px 0;
    border: 0;
    border-bottom: 1px solid var(--border-subtle, var(--border-default));
    background: none;
    color: var(--text-secondary);
    font: inherit;
    font-size: var(--caption-size);
    text-align: left;
    cursor: pointer;
  }

  .catalog__older-item[aria-current='true'] {
    color: var(--text-primary);
  }

  .catalog__older-item .catalog__line {
    grid-column: auto;
  }
</style>

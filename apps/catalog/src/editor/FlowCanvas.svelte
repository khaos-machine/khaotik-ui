<script>
  // A flow: its strip, and the ordered list of steps that produces it.
  //
  // THE STRIP IS THE EXISTING ONE, unchanged apart from being told which registry
  // to resolve against. It was built, tested and imported by nothing; this is the
  // caller it was waiting for.
  //
  // A FLOW NAMES IDS, NOT COPIES. Change the screen or the page and every flow
  // through it follows — the same reason `parse.js` reads `tokens.css` back
  // rather than restating it. Which is also why the editor below reorders and
  // removes ids and can do nothing else to a step: a caption or an override here
  // would be a second description of a screen, sitting one click from the first.
  import FlowStrip from '../components/shell/FlowStrip.svelte'
  import { isFlowStep, resolveFlowSteps } from '../fixtures.js'
  import PublishButton from './PublishButton.svelte'

  /**
   * @property {object} flow The flow document.
   * @property {object} frame The picker's three-part choice.
   * @property {Array} registry Everything a step may name — screens and composed pages.
   * @property {(next: object) => void} [onChange]
   */
  let { flow, frame, registry = [], onChange = undefined, isPublished = false, onPublish = undefined } = $props()

  // What a step MAY name, in the nav's own order. Filtered through the same
  // predicate the resolver uses, so the picker cannot offer something that would
  // then resolve to nothing.
  const available = $derived(registry.filter(isFlowStep))
  const resolved = $derived(resolveFlowSteps(flow, registry))

  const commit = (steps) => onChange?.({ ...flow, steps, updated: new Date().toISOString() })

  const append = (id) => commit([...(flow.steps ?? []), id])
  const removeAt = (i) => commit(flow.steps.filter((_, n) => n !== i))

  function move(i, delta) {
    const to = i + delta
    if (to < 0 || to >= flow.steps.length) return
    const steps = [...flow.steps]
    const [moved] = steps.splice(i, 1)
    steps.splice(to, 0, moved)
    commit(steps)
  }

  /** A step's display name, or the id when it resolves to nothing. */
  const nameOf = (id) => available.find((f) => f.id === id)?.name ?? id
</script>

<main class="flow-canvas">
  <header class="flow-canvas__chrome">
    <h1>{flow.name}</h1>
    <span class="flow-canvas__slug">@{flow.slug}</span>
    <PublishButton document={flow} {isPublished} {onPublish} />
  </header>

  <div class="flow-canvas__body">
    <div class="flow-canvas__stage">
      {#if flow.steps?.length}
        <FlowStrip {flow} {frame} {registry} />
      {:else}
        <p class="flow-canvas__empty">
          No steps yet. A flow is a sequence of screens and composed pages — add one on the right.
        </p>
      {/if}
    </div>

    <aside class="flow-canvas__side" aria-label="Steps">
      <h3 class="flow-canvas__heading">Steps</h3>

      {#if flow.steps?.length}
        <ol class="steps">
          {#each flow.steps as id, i (`${id}-${i}`)}
            <li class="steps__row" class:steps__row--missing={resolved.missing.includes(id)}>
              <span class="steps__position" aria-hidden="true">{i + 1}</span>
              <span class="steps__name">{nameOf(id)}</span>
              <button type="button" class="chip focus-ring" aria-label={`Move ${nameOf(id)} earlier`} onclick={() => move(i, -1)}>↑</button>
              <button type="button" class="chip focus-ring" aria-label={`Move ${nameOf(id)} later`} onclick={() => move(i, 1)}>↓</button>
              <button type="button" class="chip chip--danger focus-ring" aria-label={`Remove ${nameOf(id)}`} onclick={() => removeAt(i)}>✕</button>
            </li>
          {/each}
        </ol>
      {:else}
        <p class="flow-canvas__note">Nothing in this flow yet.</p>
      {/if}

      <!-- A step that resolves to nothing is REPORTED here as well as in the
           strip. The strip says the sequence is short; this says which id is the
           reason and where in the order it sits. -->
      {#if resolved.missing.length}
        <p class="flow-canvas__missing">
          {resolved.missing.length} step{resolved.missing.length === 1 ? '' : 's'} name
          {resolved.missing.length === 1 ? 'a screen' : 'screens'} that no longer exist:
          {resolved.missing.join(', ')}
        </p>
      {/if}

      <h3 class="flow-canvas__heading">Add a step</h3>
      {#if available.length}
        <div class="add" role="group" aria-label="Add a step">
          {#each available as item (item.id)}
            <button type="button" class="add__item focus-ring" onclick={() => append(item.id)}>
              {item.name}
              <span class="add__kind" aria-hidden="true">{item.kind === 'page' ? 'page' : 'screen'}</span>
            </button>
          {/each}
        </div>
      {:else}
        <p class="flow-canvas__note">No screens or pages to step through yet.</p>
      {/if}
    </aside>
  </div>
</main>

<style>
  .flow-canvas {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: var(--surface-base);
    color: var(--text-primary);
  }

  .flow-canvas__chrome {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-bottom: 1px solid var(--border-default);
    background: var(--surface-raised);
    flex-shrink: 0;
  }

  h1 {
    margin: 0;
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    font-weight: var(--heading-md-weight);
    letter-spacing: var(--heading-md-track);
    color: var(--text-primary);
  }

  .flow-canvas__slug {
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
  }

  .flow-canvas__body {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 268px;
    min-height: 0;
  }

  .flow-canvas__stage {
    overflow: auto;
    padding: var(--spacing-lg);
    background: var(--surface-raised);
  }

  .flow-canvas__side {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
    padding: var(--spacing-xs);
    border-left: 1px solid var(--border-default);
    background: var(--surface-raised);
  }

  .flow-canvas__heading {
    margin: var(--spacing-xs) 0 var(--spacing-2xs);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-weight: var(--label-md-weight);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .flow-canvas__note,
  .flow-canvas__empty {
    margin: 0;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    text-wrap: pretty;
  }

  .flow-canvas__empty {
    padding: var(--spacing-2xl);
    text-align: center;
  }

  .flow-canvas__missing {
    margin: var(--spacing-2xs) 0 0;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--tone-danger);
    text-wrap: pretty;
  }

  .steps {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .steps__row {
    display: grid;
    grid-template-columns: 18px 1fr auto auto auto;
    align-items: center;
    gap: 2px;
    padding: 1px 0;
  }

  .steps__row--missing .steps__name {
    color: var(--tone-danger);
  }

  .steps__position {
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
  }

  .steps__name {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chip {
    width: 20px;
    height: 20px;
    padding: 0;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-base);
    font: inherit;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    cursor: pointer;
  }

  .chip--danger {
    color: var(--tone-danger);
  }

  .add {
    display: flex;
    flex-direction: column;
  }

  .add__item {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--spacing-2xs);
    width: 100%;
    padding: 3px var(--spacing-2xs);
    border: 0;
    background: none;
    font: inherit;
    font-size: var(--caption-size);
    line-height: var(--body-md-line);
    color: var(--text-secondary);
    text-align: left;
    cursor: pointer;
  }

  .add__item:hover {
    background: color-mix(in oklab, var(--text-primary) 6%, transparent);
    color: var(--text-primary);
  }

  .add__kind {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    flex-shrink: 0;
  }
</style>

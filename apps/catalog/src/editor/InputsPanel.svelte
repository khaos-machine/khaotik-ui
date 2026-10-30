<script>
  // The inputs a composed component declares.
  //
  // THIS IS WHAT MAKES IT A COMPONENT rather than a saved arrangement. Without
  // declared inputs a composition renders one fixed thing; with them the same
  // `@scene-card` is used three times on a page with different content, which is
  // the whole reason to build one.
  //
  // A DEFAULT LIVES HERE AND NOWHERE ELSE. A published component falls back to
  // the default in its own source; a composed one has no source to fall back to,
  // so its declaration is the only place a default can be stated.
  import { DATASETS } from './datasets.js'

  let { inputs = [], onAdd = undefined, onRemove = undefined } = $props()

  let name = $state('')
  let type = $state('string')

  // Scalars, then every entity a capture can actually supply. Offering a type
  // nothing can be bound to would declare an input that no prop could ever fill.
  const TYPES = [
    'string', 'number', 'boolean',
    ...[...new Set(DATASETS.map((d) => d.entity).filter(Boolean))].sort(),
  ]

  const submit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd?.({ name: trimmed, type })
    name = ''
  }
</script>

<section class="inputs" aria-label="Inputs">
  <h3 class="inputs__heading">Inputs</h3>

  {#if inputs.length}
    <ul class="inputs__list">
      {#each inputs as input (input.name)}
        <li class="inputs__row">
          <span class="inputs__name">{input.name}</span>
          <span class="inputs__type">{input.type}</span>
          <button type="button" class="inputs__remove focus-ring" aria-label={`Remove input ${input.name}`} onclick={() => onRemove?.(input.name)}>✕</button>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="inputs__empty">No inputs. This renders one fixed thing wherever it is used.</p>
  {/if}

  <form class="inputs__add" onsubmit={submit}>
    <input
      class="inputs__field focus-ring" type="text" placeholder="name" aria-label="New input name"
      value={name} oninput={(e) => (name = e.currentTarget.value)}
    />
    <select class="inputs__field focus-ring" aria-label="New input type" value={type} onchange={(e) => (type = e.currentTarget.value)}>
      {#each TYPES as t (t)}<option value={t}>{t}</option>{/each}
    </select>
    <button type="submit" class="inputs__submit focus-ring">Add</button>
  </form>
</section>

<style>
  .inputs {
    padding: var(--spacing-xs);
    border-bottom: 1px solid var(--border-default);
  }

  .inputs__heading {
    margin: 0 0 var(--spacing-2xs);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-weight: var(--label-md-weight);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .inputs__list {
    margin: 0 0 var(--spacing-2xs);
    padding: 0;
    list-style: none;
  }

  .inputs__row {
    display: grid;
    grid-template-columns: 1fr auto 20px;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: 1px 0;
  }

  .inputs__name {
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .inputs__type {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
  }

  .inputs__remove {
    width: 20px;
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    cursor: pointer;
  }

  .inputs__empty {
    margin: 0 0 var(--spacing-2xs);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    text-wrap: pretty;
  }

  .inputs__add {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: var(--spacing-2xs);
  }

  .inputs__field,
  .inputs__submit {
    min-width: 0;
    padding: 2px var(--spacing-2xs);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-base);
    font: inherit;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-primary);
  }

  .inputs__submit {
    cursor: pointer;
  }
</style>

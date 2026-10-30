<script>
  // The selected node: what it is, what it holds, and how it is laid out.
  //
  // THE PROPS PANEL IS GENERATED, from the same JSDoc typedef that produces the
  // shipped `.d.ts`. Nothing here is hand-listed, so a renamed prop changes the
  // control rather than leaving a stale one behind.
  //
  // THE NO-FABRICATION RULE IS ENFORCED BY WHAT IS OFFERED. A collection or
  // entity prop gets a BINDING PICKER and no text field, so there is no path in
  // this UI that produces a typed-in scene. `validate.js` refuses one that
  // arrives another way; between them, invented data has nowhere to enter.
  import { descriptors } from './descriptors.js'
  import { datasetsFor } from './datasets.js'
  import { SPACE_TOKENS, SPACE_VALUES, GRID_IS_UNDECLARED } from './tokens.js'
  import { bareSlug, isLibrarySlug } from './resolve.js'

  /**
   * @property {object|null} node The selected node.
   * @property {object} document The document being edited — its inputs are bindable.
   * @property {Map<string, object>} [composed]
   */
  let {
    node = null,
    document: doc,
    composed = new Map(),
    onSetProp = undefined,
    onSetLayout = undefined,
    onMove = undefined,
    onDelete = undefined,
  } = $props()

  const descriptor = $derived.by(() => {
    if (node?.type !== 'component') return null
    if (isLibrarySlug(node.component)) return descriptors[bareSlug(node.component)] ?? null
    const authored = composed.get(bareSlug(node.component))
    return authored ? { inputs: authored.inputs ?? [], slug: authored.slug } : null
  })

  const ALIGNMENTS = ['start', 'center', 'end', 'stretch']

  /** A prop value -> the string the one select shows. */
  const encode = (value) => {
    if (value && typeof value === 'object') {
      if ('$data' in value) return `data:${value.$data}`
      if ('$prop' in value) return `prop:${String(value.$prop).split('.')[0]}`
    }
    return ''
  }

  /** …and back. `at: 0` for a single entity, because SceneDetail takes a scene, not scenes. */
  function decode(encoded, control) {
    if (!encoded) return null
    const [kind, name] = encoded.split(':')
    if (kind === 'prop') return { $prop: name }
    return control.kind === 'entity' ? { $data: name, at: 0 } : { $data: name }
  }

  /** The inputs of THIS document that could satisfy a prop. */
  const bindableInputs = $derived(doc?.inputs ?? [])
</script>

<aside class="inspector" aria-label="Inspector">
  {#if !node}
    <p class="inspector__empty">Select something on the canvas to edit it.</p>
  {:else}
    <header class="inspector__head">
      <span class="inspector__kind">{node.type === 'component' ? node.component : `${node.layout} layout`}</span>
      <div class="inspector__actions">
        <button type="button" class="chip focus-ring" onclick={() => onMove?.(-1)} aria-label="Move up">↑</button>
        <button type="button" class="chip focus-ring" onclick={() => onMove?.(1)} aria-label="Move down">↓</button>
        <button type="button" class="chip chip--danger focus-ring" onclick={() => onDelete?.()} aria-label="Delete">✕</button>
      </div>
    </header>

    {#if node.type === 'layout'}
      <section class="panel" aria-label="Layout">
        <h3 class="panel__heading">Layout</h3>

        <label class="field">
          <span class="field__label">Kind</span>
          <select class="field__control focus-ring" value={node.layout} onchange={(e) => onSetLayout?.({ layout: e.currentTarget.value })}>
            <option value="stack">Stack</option>
            <option value="grid">Grid</option>
          </select>
        </label>

        {#if node.layout === 'stack'}
          <label class="field">
            <span class="field__label">Direction</span>
            <select class="field__control focus-ring" value={node.direction ?? 'column'} onchange={(e) => onSetLayout?.({ direction: e.currentTarget.value })}>
              <option value="column">Column</option>
              <option value="row">Row</option>
            </select>
          </label>
          <label class="field">
            <span class="field__label">Align</span>
            <select class="field__control focus-ring" value={node.align ?? 'stretch'} onchange={(e) => onSetLayout?.({ align: e.currentTarget.value })}>
              {#each ALIGNMENTS as a (a)}<option value={a}>{a}</option>{/each}
            </select>
          </label>
        {:else}
          <label class="field">
            <span class="field__label">Columns</span>
            <input
              type="number" min="1" max="12" class="field__control focus-ring"
              value={node.columns ?? 2}
              oninput={(e) => onSetLayout?.({ columns: Number(e.currentTarget.value) || 1 })}
            />
          </label>
        {/if}

        {#each ['gap', 'padding'] as field (field)}
          <label class="field">
            <span class="field__label">{field}</span>
            <!-- TOKEN NAMES, and nothing else. There is no length field here and
                 there is not meant to be: a document stores `lg`, which each
                 target resolves through its own scale, and `validate.js` rejects
                 a raw length that arrives any other way. -->
            <select class="field__control focus-ring" value={node[field] ?? ''} onchange={(e) => onSetLayout?.({ [field]: e.currentTarget.value || null })}>
              <option value="">none</option>
              {#each SPACE_TOKENS as token (token)}
                <option value={token}>{token} · {SPACE_VALUES[token]}</option>
              {/each}
            </select>
          </label>
        {/each}

        {#if node.layout === 'grid'}
          <!-- Stated where the missing controls would be. An absent grid and a
               grid nobody thought to show must not look identical. -->
          <p class="panel__note">{GRID_IS_UNDECLARED}</p>
        {/if}
      </section>
    {:else}
      <section class="panel" aria-label="Props">
        <h3 class="panel__heading">Props</h3>

        {#if !descriptor}
          <p class="panel__note">{node.component} names no component, so it declares no props.</p>
        {:else if !descriptor.inputs.length}
          <p class="panel__note">This component declares no props.</p>
        {:else}
          {#each descriptor.inputs as input (input.name)}
            {@const control = input.control ?? { kind: 'string' }}
            {@const value = node.props?.[input.name]}
            {@const datasets = datasetsFor(control)}
            <div class="field">
              <span class="field__label" id="lbl-{node.id}-{input.name}">{input.name}</span>

              {#if control.kind === 'callback' || control.kind === 'snippet'}
                <!-- Present and inert, not hidden. A page is not a running app;
                     inventing a handler body would be code generation, and
                     leaving the prop out entirely would hide part of the API. -->
                <span class="field__inert">{control.kind} — inert in Compose</span>

              {:else if control.kind === 'boolean'}
                <input
                  type="checkbox" class="field__control focus-ring"
                  aria-labelledby="lbl-{node.id}-{input.name}"
                  checked={value === true}
                  onchange={(e) => onSetProp?.(input.name, e.currentTarget.checked ? true : null)}
                />

              {:else if control.kind === 'enum'}
                <select
                  class="field__control focus-ring"
                  aria-labelledby="lbl-{node.id}-{input.name}"
                  value={typeof value === 'string' ? value : ''}
                  onchange={(e) => onSetProp?.(input.name, e.currentTarget.value || null)}
                >
                  <option value="">default</option>
                  {#each control.values as v (v)}<option value={v}>{v}</option>{/each}
                </select>

              {:else if control.kind === 'string' || control.kind === 'number'}
                {#if encode(value)}
                  {@render binding(input, control, datasets, value)}
                {:else}
                  <input
                    type={control.kind === 'number' ? 'number' : 'text'}
                    class="field__control focus-ring"
                    aria-labelledby="lbl-{node.id}-{input.name}"
                    value={value ?? ''}
                    oninput={(e) => onSetProp?.(input.name, control.kind === 'number' ? Number(e.currentTarget.value) : e.currentTarget.value)}
                  />
                {/if}
                {#if bindableInputs.length}
                  {@render binding(input, control, [], value, 'Or bind')}
                {/if}

              {:else}
                <!-- Collection, entity, or a type with no shape to build a control
                     from. BINDING ONLY: there is no text field here, which is what
                     makes "real data, never fabricated" a property of the tool
                     rather than a rule someone has to remember. -->
                {@render binding(input, control, datasets, value)}
                {#if !datasets.length && !bindableInputs.length}
                  <span class="field__inert">No captured dataset matches <code>{input.type}</code>. Capture one with scripts/fetch-all.sh.</span>
                {/if}
              {/if}
            </div>
          {/each}
        {/if}
      </section>
    {/if}
  {/if}
</aside>

{#snippet binding(input, control, datasets, value, label = 'Bind')}
  <select
    class="field__control focus-ring"
    aria-label={`${label} ${input.name}`}
    value={encode(value)}
    onchange={(e) => onSetProp?.(input.name, decode(e.currentTarget.value, control))}
  >
    <option value="">—</option>
    {#each datasets as d (d.id)}
      <option value={`data:${d.id}`}>{d.label}</option>
    {/each}
    {#each bindableInputs as i (i.name)}
      <option value={`prop:${i.name}`}>input · {i.name}</option>
    {/each}
  </select>
{/snippet}

<style>
  .inspector {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
    border-left: 1px solid var(--border-default);
    background: var(--surface-raised);
  }

  .inspector__empty {
    margin: auto;
    padding: var(--spacing-lg);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    text-align: center;
  }

  .inspector__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-xs);
    padding: var(--spacing-2xs) var(--spacing-xs);
    border-bottom: 1px solid var(--border-default);
  }

  .inspector__kind {
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .inspector__actions {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }

  .chip {
    width: 22px;
    height: 22px;
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

  .panel {
    padding: var(--spacing-xs);
  }

  .panel__heading {
    margin: 0 0 var(--spacing-2xs);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-weight: var(--label-md-weight);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .panel__note {
    margin: var(--spacing-2xs) 0 0;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    text-wrap: pretty;
  }

  .field {
    display: grid;
    grid-template-columns: 84px 1fr;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: 2px 0;
  }

  .field__label {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .field__control {
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

  .field__inert {
    grid-column: 1 / -1;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    text-wrap: pretty;
  }

  code {
    font-family: var(--font-mono);
  }
</style>

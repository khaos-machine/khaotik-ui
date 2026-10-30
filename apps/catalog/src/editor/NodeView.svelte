<script>
  // One node of a document, rendered. Recursive, and the ONLY place a document
  // becomes pixels — the compose canvas, the read-only canvas and the flow strip
  // all mount this, so a composition looks the same in a row of ten as it does
  // on its own. That is the argument FixtureView.svelte already makes for
  // fixtures, applied to documents.
  //
  // THE RECURSION IS THE MODEL. A component node resolves to a library leaf,
  // which is handed to its Svelte implementation, or to a composed document,
  // which re-enters this component with its own root and its own inputs bound
  // from the call site's props. Composed components holding composed components
  // costs nothing here because it is the same branch twice.
  //
  // LAYOUT IS EMITTED FROM TOKEN NAMES, never from lengths carried in the
  // document. `gap: 'lg'` becomes `var(--spacing-lg)` here and would become
  // `VStack(spacing: .lg)` somewhere else; the document never learns which. That
  // is why a px value cannot enter one — validate.js rejects it, and there is no
  // control that could produce it.
  import NodeView from './NodeView.svelte'
  import { resolveComponent } from './resolve.js'
  import { resolveProps, withDefaults } from './bindings.js'
  // Layout mapping comes from the LIBRARY, not from here. `Composed.svelte`
  // renders the same tree for a consuming app, and two copies of what `gap: 'lg'`
  // means is the drift `tokens/parse.js` exists to prevent. This file owns the
  // editing chrome and nothing else about how a node looks.
  import { layoutStyle, alignFor } from '@khaos-machine/khaotik-ui/components/svelte/lib/compose.js'

  /**
   * @property {object} node The node to render.
   * @property {Record<string, unknown>} [inputs] Values for the enclosing document's inputs.
   * @property {Map<string, object>} [composed] Authored documents, by bare slug.
   * @property {number} [depth] Recursion guard. Never set by a caller.
   */
  let {
    node,
    inputs = {},
    composed = new Map(),
    depth = 0,
    editing = false,
    selectedId = null,
    insertAt = null,
    onselect = undefined,
    oninsertat = undefined,
  } = $props()

  /** What a node is called in the editor. A slug says more than "component". */
  const labelFor = (n) =>
    n.type === 'component' ? n.component : n.layout === 'grid' ? `Grid ${n.columns ?? 2}` : `${n.direction === 'row' ? 'Row' : 'Column'} stack`

  const selected = $derived(editing && node?.id === selectedId)
  const shared = $derived({ editing, selectedId, insertAt, onselect, oninsertat, composed })

  // A cycle is caught by validate.js, which is where an author is told about it.
  // This is the second line: a document that arrived some other way must not be
  // able to hang the tab, and a render that stops has to SAY it stopped rather
  // than simply ending.
  const MAX_DEPTH = 32

  const resolved = $derived(node?.type === 'component' ? resolveComponent(node.component, composed) : null)
  const bound = $derived(node?.type === 'component' ? resolveProps(node.props, inputs) : { props: {}, missing: [] })

</script>

{#if depth > MAX_DEPTH}
  <p class="node-gap">Stopped at {MAX_DEPTH} levels — this document references itself.</p>
{:else if node?.type === 'layout'}
  <div class="shell" class:shell--editing={editing} class:shell--selected={selected}>
    {#if editing}
      <!-- A SIBLING overlay, not a wrapper. A <button> around the node's content
           would nest interactive elements inside a button, which is invalid and
           takes the keyboard with it. Absolutely positioned over the node and
           emitted BEFORE the children, so a child's own overlay paints above it
           and a click lands on the deepest node under the pointer while the
           parent still takes clicks on its own padding. -->
      <button
        type="button"
        class="shell__hit"
        aria-label={labelFor(node)}
        aria-pressed={selected}
        onclick={(e) => { e.stopPropagation(); onselect?.(node.id) }}
      ></button>
    {/if}

    <div
      class="node node--{node.layout}"
      class:node--row={node.layout === 'stack' && node.direction === 'row'}
      style={layoutStyle(node)}
      style:align-items={alignFor(node)}
      data-node={node.id}
    >
      {#each node.children ?? [] as child, i (child.id)}
        {#if editing && node.layout === 'stack'}
          {@render caret(node.id, i)}
        {/if}
        <NodeView node={child} {inputs} depth={depth + 1} {...shared} />
      {/each}
      {#if editing && node.layout === 'stack'}
        {@render caret(node.id, (node.children ?? []).length)}
      {/if}
    </div>
  </div>
{:else if node?.type === 'component'}
  <div class="shell" class:shell--editing={editing} class:shell--selected={selected}>
    {#if editing}
      <button
        type="button"
        class="shell__hit"
        aria-label={labelFor(node)}
        aria-pressed={selected}
        onclick={(e) => { e.stopPropagation(); onselect?.(node.id) }}
      ></button>
    {/if}
    <!-- `inert` while editing, and only around the rendered COMPONENT: a stage of
         live components competing for clicks is a row of running apps rather than
         a thing being composed, and it would let a stray click mutate state in
         something you are only arranging. It is the argument FlowStrip already
         makes for its frames. Layout nodes are NOT inert, or their children's
         selection overlays would go with them. -->
    <div class="shell__content" inert={editing || null}>
  {#if resolved?.kind === 'library'}
    {@const Implementation = resolved.component}
    <Implementation {...bound.props} />
  {:else if resolved?.kind === 'composed'}
    <!-- The recursion. The call site's props become the nested document's
         inputs, filled in from its own declared defaults where the call site
         said nothing — a composed document has no component to fall back to, so
         its `inputs` declaration is the only place a default can live. -->
    <!-- A composed child renders READ-ONLY even while the page around it is being
         edited: its nodes belong to that document, not to this one, and offering
         them for selection here would edit a component in a place that does not
         own it. Open it in its own entry to change it — the same rule a flow's
         steps follow. -->
    <NodeView
      node={resolved.document.root}
      inputs={withDefaults(resolved.document.inputs, bound.props)}
      {composed}
      depth={depth + 1}
    />
  {:else}
    <!-- NAMED, never blank. A renamed component that rendered nothing would read
         as a layout bug and send someone looking in the wrong place. -->
    <p class="node-gap">{node.component} names no component.</p>
  {/if}

    </div>

    {#if bound.missing.length}
      <p class="node-gap">
        {bound.missing.length} binding{bound.missing.length === 1 ? '' : 's'} resolved to nothing:
        {bound.missing.join(', ')}
      </p>
    {/if}
  </div>
{:else if node}
  <p class="node-gap">{node.type} is not a node type.</p>
{/if}

{#snippet caret(parentId, index)}
  <!-- STACKS ONLY. In a grid every child is a track item, so a caret between
       cells consumes a slot and a two-column grid renders one cell per row —
       the stage would be showing a layout the document does not describe. A grid
       is filled by selecting a cell and inserting (which lands after it) or by
       selecting the grid itself (which appends).

       CLICK TO INSERT, not drag and drop. jsdom lays nothing out, so every
       drag affordance would be asserted against a fake of the thing being
       tested, while a caret click asserts against the document tree — the real
       artifact. The codebase also has zero DnD today, and every insertion being
       a <button> makes the editor keyboard-operable by construction rather than
       through a second implementation bolted on afterwards.

       Drag stays possible later as an accelerator over `insertNode`/`moveNode`,
       which is the argument for putting those in a pure module first. -->
  <button
    type="button"
    class="caret"
    class:caret--active={insertAt?.parentId === parentId && insertAt?.index === index}
    aria-label={`Insert at position ${index + 1}`}
    onclick={(e) => { e.stopPropagation(); oninsertat?.({ parentId, index }) }}
  ></button>
{/snippet}

<style>
  /* The shell exists only to give the overlay something to be absolute against.
     `display: contents` when not editing, so the read-only render is byte-for-byte
     the tree it was before selection existed — no extra box in the layout. */
  .shell {
    display: contents;
  }

  .shell--editing {
    display: block;
    position: relative;
    min-width: 0;
  }

  .shell__hit {
    position: absolute;
    inset: 0;
    z-index: 1;
    border: var(--size-stroke-hairline) solid transparent;
    border-radius: var(--radius-sm);
    background: none;
    padding: 0;
    cursor: pointer;
  }

  .shell__hit:hover {
    border-color: color-mix(in oklab, var(--action-primary) 45%, transparent);
  }

  .shell--selected > .shell__hit {
    border-color: var(--action-primary);
    background: color-mix(in oklab, var(--action-primary) 8%, transparent);
  }

  .shell__hit:focus-visible {
    outline: var(--size-stroke-focus) solid var(--action-primary);
    outline-offset: var(--size-stroke-hairline);
  }

  /* A caret TAKES NO SPACE. It is zero-sized in flow and clickable through an
     absolutely-positioned pseudo-element, which is a hit area rather than a box.
     The obvious version — a 16px-wide button between each pair of children —
     costs the thing the stage is for: it pushes every sibling apart, so the
     arrangement being composed is not the arrangement that will render. A
     WYSIWYG surface that lies by 16px per gap is not one.
     The ::after is painted by the button, so clicks anywhere in the band are
     attributed to it; the button keeps its own focus ring. */
  .caret {
    flex: none;
    align-self: stretch;
    width: 0;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    position: relative;
    z-index: 2;
  }

  .caret::after {
    content: '';
    position: absolute;
    /* Reaches into the gap on both sides — the band a pointer aims at. */
    inset: 0 calc(-1 * var(--spacing-2xs));
    border-radius: var(--radius-full);
    background: transparent;
  }

  .caret:hover::after,
  .caret--active::after {
    background: var(--action-primary);
    inset: 0 calc(-0.5 * var(--size-stroke-focus));
  }

  .caret:focus-visible {
    outline: var(--size-stroke-focus) solid var(--action-primary);
    outline-offset: calc(-1 * var(--size-stroke-focus));
  }

</style>

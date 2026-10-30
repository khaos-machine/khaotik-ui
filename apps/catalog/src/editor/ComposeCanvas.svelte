<script>
  // Compose: the palette, the stage, and the inspector.
  //
  // THE STAGE IS THE SAME RENDERER the read-only canvas and the flow strip use,
  // inside the same DeviceFrame the viewport picker already drives. So what you
  // arrange here is what you see everywhere else — not an approximation of it —
  // and a page composes at a real device width with `container-type: inline-size`
  // already established, which is what makes a component's own container queries
  // fire against the device rather than the window.
  //
  // EVERY EDIT IS A PURE FUNCTION over the document, applied by handing a new one
  // upward. Nothing here mutates a tree: `$state` tracks reassignment, undo would
  // be a stack of these, and every operation is already tested without a DOM.
  import { untrack } from 'svelte'
  import DeviceFrame from '../components/shell/DeviceFrame.svelte'
  import NodeView from './NodeView.svelte'
  import Inspector from './Inspector.svelte'
  import InputsPanel from './InputsPanel.svelte'
  import PublishButton from './PublishButton.svelte'
  import VariantTabs from './VariantTabs.svelte'
  import {
    componentNode, layoutNode, mintId, findNode, parentOf,
    insertNode, removeNode, moveNode, setProp, setLayout,
  } from './document.js'
  import { validate } from './validate.js'
  import { composedMap } from './registry.js'

  /**
   * @property {object} document The document being edited.
   * @property {object} frame The picker's three-part choice.
   * @property {object[]} [documents] Every authored document, for the palette.
   * @property {(next: object) => void} [onChange]
   */
  let {
    document: doc, frame, documents = [], onChange = undefined,
    isPublished = false, onPublish = undefined,
    variants = [], variantIndex = 0, baseLabel = 'Published',
    canCreateVariant = false, onvariant = undefined, oncreatevariant = undefined,
    // A request to insert something, relayed from a Sidebar row — insertion no
    // longer originates inside this component. See App.svelte's `insertFromRow`.
    insertRequest = null,
    onInsertHandled = undefined,
  } = $props()

  let selectedId = $state(null)
  let insertAt = $state(null)

  const composed = $derived(composedMap(documents))
  const selected = $derived(selectedId ? findNode(doc.root, selectedId) : null)
  const problems = $derived(validate(doc, composed))

  /** Where a new node goes: the caret if one is set, otherwise the end of the selection's parent, otherwise the root. */
  const target = $derived.by(() => {
    if (insertAt) return insertAt
    if (selected?.type === 'layout') return { parentId: selected.id, index: (selected.children ?? []).length }
    if (selected) {
      const parent = parentOf(doc.root, selected.id)
      if (parent) return { parentId: parent.id, index: parent.children.findIndex((c) => c.id === selected.id) + 1 }
    }
    return { parentId: doc.root.id, index: (doc.root.children ?? []).length }
  })

  const commit = (root) => onChange?.({ ...doc, root, updated: new Date().toISOString() })

  function add(node) {
    const id = mintId(doc.root)
    const placed = { ...node, id }
    commit(insertNode(doc.root, placed, target))
    // Selecting what was just inserted is the difference between a tool and a
    // list of buttons: the next thing you want is almost always to configure it.
    selectedId = id
    insertAt = null
  }

  // Insertion arrives as a REQUEST, from a Sidebar row that is not this
  // component's child — App relays it, the same way it relays everything else
  // between siblings in this file. Consumed once and acknowledged, so a second
  // insert of the same thing needs a second click.
  //
  // UNTRACK IS LOAD-BEARING, not tidiness. `add()` reads `target` (which reads
  // `insertAt`/`selected`/`doc`) and WRITES `insertAt`/`selectedId` — and
  // Svelte counts every reactive read made during an effect's execution as that
  // effect's OWN dependency, even ones made inside a function the effect calls.
  // Without `untrack`, this effect ends up depending on the very state `add()`
  // changes, retriggers itself mid-insert, and runs `add()` a second time
  // against the PRE-insert tree — silently overwriting a correct insert at a
  // caret with a second one appended to the stale, two-child snapshot. Found by
  // a test asserting the position, not by the insert failing outright.
  $effect(() => {
    if (!insertRequest) return
    const request = insertRequest
    untrack(() => {
      add(componentNode(request.slug))
      onInsertHandled?.()
    })
  })

  /** The two layout nodes — document metadata, not a registry member, so they
   *  have no row in Sidebar to originate from. Inserted directly, here. */
  const addLayout = (layout) => add(layoutNode({ layout }))

  const setInput = (name, value) => commit(setProp(doc.root, selectedId, name, value))

  function removeSelected() {
    const parent = parentOf(doc.root, selectedId)
    commit(removeNode(doc.root, selectedId))
    // Selection moves to the parent rather than to nothing, so deleting three
    // siblings in a row does not need three re-selections.
    selectedId = parent?.id ?? null
  }

  const addDeclaredInput = (input) =>
    onChange?.({ ...doc, inputs: [...(doc.inputs ?? []), input] })

  const removeDeclaredInput = (name) =>
    onChange?.({ ...doc, inputs: (doc.inputs ?? []).filter((i) => i.name !== name) })
</script>

<main class="compose">
  <header class="compose__chrome">
    <h1>{doc.name}</h1>
    <span class="compose__slug">@{doc.slug}</span>
      <VariantTabs
        {variants}
        index={variantIndex}
        {baseLabel}
        canCreate={canCreateVariant}
        onselect={onvariant}
        oncreate={oncreatevariant}
      />
    <!-- LAYOUT NODES, inserted directly rather than via a Sidebar row: a Stack
         or a Grid is document metadata, not a registry member, so it has no
         published export and no row to originate from. Canvas/function
         territory (this chrome changes per mode already), not chrome. -->
    <div class="compose__layout" role="group" aria-label="Insert layout">
      <button type="button" class="compose__layout-btn focus-ring" onclick={() => addLayout('stack')}>Stack</button>
      <button type="button" class="compose__layout-btn focus-ring" onclick={() => addLayout('grid')}>Grid</button>
    </div>
    <PublishButton document={doc} {isPublished} {onPublish} />

    {#if problems.length}
      <!-- Named, and in the chrome rather than over the stage: a document can be
           worked on while it has a problem, and hiding the work behind the
           report would make the report the thing you have to dismiss to
           continue. -->
      <span class="compose__problems">{problems.length} problem{problems.length === 1 ? '' : 's'}: {problems[0].message}</span>
    {/if}
  </header>

  <div class="compose__body">
    <!-- Clicking the ground clears the selection. Without it the only way out of
         a selection is another selection, and the inspector never shows the
         document again. -->
    <div
      class="compose__stage"
      role="presentation"
      onclick={() => { selectedId = null; insertAt = null }}
    >
      <DeviceFrame {frame} fill={true}>
        <NodeView
          node={doc.root}
          inputs={{}}
          {composed}
          editing
          {selectedId}
          {insertAt}
          onselect={(id) => { selectedId = id; insertAt = null }}
          oninsertat={(at) => { insertAt = at; selectedId = null }}
        />
      </DeviceFrame>
    </div>

    <div class="compose__side">
      <InputsPanel inputs={doc.inputs ?? []} onAdd={addDeclaredInput} onRemove={removeDeclaredInput} />
      <Inspector
        node={selected}
        document={doc}
        {composed}
        onSetProp={setInput}
        onSetLayout={(patch) => commit(setLayout(doc.root, selectedId, patch))}
        onMove={(delta) => commit(moveNode(doc.root, selectedId, delta))}
        onDelete={removeSelected}
      />
    </div>
  </div>
</main>

<style>
  .compose {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: var(--surface-base);
    color: var(--text-primary);
  }

  .compose__chrome {
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

  .compose__slug {
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
  }

  .compose__problems {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--tone-danger);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* stage | inspector. Insertion now originates from Sidebar, an App-level
     sibling of this component — there is no palette column here any more. */
  .compose__body {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 268px;
    min-height: 0;
  }

  .compose__layout {
    display: inline-flex;
    gap: 2px;
    padding: 2px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background: color-mix(in oklab, var(--text-primary) 4%, transparent);
  }

  .compose__layout-btn {
    padding: 3px 10px;
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    font: inherit;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    cursor: pointer;
  }

  .compose__layout-btn:hover {
    background: var(--surface-base);
    color: var(--text-primary);
  }

  /* Raised ground under a base device, the arrangement the read-only canvas
     already uses: the screen reads as cut into a board rather than floating on
     one. */
  .compose__stage {
    overflow: auto;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    align-items: safe center;
    background: var(--surface-raised);
  }

  .compose__side {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
    background: var(--surface-raised);
    border-left: 1px solid var(--border-default);
  }
</style>

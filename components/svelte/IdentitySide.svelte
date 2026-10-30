<script>
  // The Places and Objects inspector: the identity, where it is only named (a way to each
  // scene), its group, and Delete where the engine's checks cannot refuse it, confirmed in a
  // sheet that names it. The host decides whether Delete is offered and what the sheet says.
  import Button from './Button.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import Sheet from './Sheet.svelte'

  /**
   * @typedef {Object} Identity
   * @property {string} id The engine's id.
   * @property {string} name Its name.
   * @property {string} [origin] Where the name came from (`parsed`, …), shown as the row's source.
   * @property {number} [scene_count] How many scenes it is in.
   * @property {number} [page_count] A place's page count.
   * @property {'group' | string} [identityKind] `group` for an object that groups others.
   */

  /**
   * @typedef {Object} Props
   * @property {'location' | 'object'} [kind] Which inspector this is.
   * @property {Identity | null} [item] The selected identity. Nothing renders without one.
   * @property {readonly { id: string, label: string }[]} [named] The scenes it is only named in, each with its heading.
   * @property {readonly string[]} [members] A group's members, by name.
   * @property {readonly string[]} [memberOf] The groups it is one of, by name.
   * @property {boolean} [deletable] Whether the engine allows deleting it. Without it no Delete is offered.
   * @property {string} [deleteMessage] What the confirmation says deleting it does.
   * @property {boolean} [busy] A delete is in flight; Delete is disabled.
   * @property {(sceneId: string) => void} [onRevealScene] Reports a scene to show.
   * @property {() => void} [onDelete] Reports a confirmed delete.
   */

  /** @type {Props} */
  let { kind = 'location', item = null, named = [], members = [], memberOf = [], deletable = false, deleteMessage = '', busy = false, onRevealScene = undefined, onDelete = undefined } = $props()

  let deleting = $state(false)
</script>

{#if item}
  <InspectorSection title={kind === 'object' ? 'Object' : 'Place'} uiId="story.inspector.identity">
    <PropertyRow label="Name" value={item.name} source={item.origin ?? ''} />
    <PropertyRow label="Scenes" value={item.scene_count} />
    {#if kind === 'location' && typeof item.page_count === 'number'}<PropertyRow label="Pages" value={item.page_count.toFixed(1)} />{/if}
    {#if item.identityKind === 'group'}<PropertyRow label="Group of" value={members.length ? members.join(', ') : 'no members recorded yet'} />{/if}
    {#if memberOf.length}<PropertyRow label="One of" value={memberOf.join(', ')} />{/if}
  </InspectorSection>

  {#if named.length}
    <InspectorSection title="Named in" count={named.length} uiId="story.inspector.named">
      <ul class="identity-side__list" aria-label="Named in">
        {#each named as scene (scene.id)}
          <li><Button variant="secondary" onclick={() => onRevealScene?.(scene.id)}>{scene.label}</Button></li>
        {/each}
      </ul>
    </InspectorSection>
  {/if}

  {#if deletable}
    <div class="identity-side__actions">
      <Button variant="secondary" disabled={busy} onclick={() => (deleting = true)}>Delete {item.name}…</Button>
    </div>
  {/if}
  {#if deleting}
    <Sheet
      title="Delete {item.name}?"
      target={item.name}
      message={deleteMessage}
      confirmLabel="Delete"
      tone="danger"
      oncancel={() => (deleting = false)}
      onconfirm={() => {
        deleting = false
        onDelete?.()
      }} />
  {/if}
{/if}

<style>
  .identity-side__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--spacing-2xs);
  }
  .identity-side__actions {
    padding: var(--spacing-sm);
  }
</style>

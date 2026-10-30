<script>
  // The app bar's viewport controls: device, orientation, size. Three controls,
  // because they are three questions of very different weight — see viewports.js.
  //
  // WHY THE APP BAR. The frame deliberately survives a change of fixture — the
  // question a viewport answers is "does this hold up at 390?", asked of one
  // component after another — which makes it a global view mode rather than a
  // property of whatever is selected right now. A control that outlives the
  // thing below it belongs in the region that also outlives it. Zoom is the same
  // shape and sits in the same place in every tool that has one.
  //
  // The rail is the shell's other home for app-level view controls (theme,
  // sort), and it cannot take these: it is 56px and single-file, and this is a
  // row of three grouped controls one of which opens a menu.
  //
  // DEVICE AND ORIENTATION ARE HAND-ROLLED, THE SIZE MENU IS ADOPTED. The two
  // segmented groups are plain buttons — the same thing SectionRail does, and the
  // same thing the canvas's own example tabs do — because they are icon toggles
  // over a fixed three- and two-way axis. The size list is the library's Menu
  // (Ark UI underneath, so roving focus, typeahead, Escape and the ARIA menu
  // pattern come from the primitive). Ark UI is barred from the catalog shell
  // directly (catalog/AGENTS.md); going through the published atom is how the
  // shell is allowed to have it, and it is the route SectionRail takes for Icon.
  import Icon from '@khaos-machine/khaotik-ui/components/svelte/Icon.svelte'
  import Menu from '@khaos-machine/khaotik-ui/components/svelte/Menu.svelte'
  import { DEVICES, findDevice, findSize, frameSummary } from './viewports.js'

  let {
    device = 'web',
    size = 'fill',
    orientation = 'portrait',
    // False on sections with nothing to frame. The controls stay VISIBLE and go
    // inert: removing them from the bar on some sections and not others would
    // move the wordmark and make the bar's shape depend on where you are
    // standing, which is the thing SectionRail's own notes warn against.
    enabled = true,
    ondevice,
    onsize,
    onorientation,
  } = $props()

  const current = $derived(findDevice(device))
  const currentSize = $derived(findSize(device, size))
  const sizeItems = $derived(current.sizes.map((s) => ({ value: s.id, label: s.label })))
  const orientable = $derived(enabled && current.orientable)

  // Orientation is one button, not two cells. It is a two-state axis with an
  // obvious default, which is the same shape as the theme and sort toggles in
  // SectionRail — and it names the state it moves TO, exactly as those do. Their
  // note is the reason: a control reading "Portrait" while portrait is on is
  // ambiguous, because it could be a label or an action, and the two readings
  // imply opposite clicks.
  const next = $derived(orientation === 'landscape' ? 'portrait' : 'landscape')
</script>

<div
  class="vp"
  class:vp--off={!enabled}
  title={enabled
    ? `Viewport · ${current.label} ${currentSize.label} — ${frameSummary({ device, size, orientation })}`
    : 'Viewport — not applicable to this section'}
>
  <!-- Size, device, orientation — left to right.
       Dynamic to the device: the size list is the device's own, so switching
       device replaces it. `currentSize.id` rather than the raw prop, because Menu
       matches its items on the value it is given and a stale id from the previous
       device would leave the trigger blank instead of falling back.
       `inert` rather than Menu's `disabled`: that prop keeps the trigger
       focusable by design (announced disabled, cannot open), and this bar needs
       the control out of the tab order, which only inert does. A
       `pointer-events: none` would still leave it keyboard-reachable, which is
       the version of this that fails silently. -->
  <div class="vp__size" inert={!enabled}>
    <Menu label="Size" value={currentSize.id} items={sizeItems} onselect={(v) => onsize?.(v)} />
  </div>

  <div class="vp__group" role="group" aria-label="Device">
    {#each DEVICES as d (d.id)}
      <button
        type="button"
        class="vp__seg focus-ring focus-ring--inset"
        class:active={enabled && d.id === current.id}
        disabled={!enabled}
        aria-pressed={enabled && d.id === current.id}
        aria-label={d.label}
        title={d.label}
        onclick={() => ondevice?.(d.id)}
      >
        <Icon name={d.icon} />
      </button>
    {/each}
  </div>

  <!-- One glyph, turned on its side when the click would turn the device: there is
       no rotated counterpart in the icon set, and rotating the upright device is
       exactly what the word means, so the button previews its own outcome. -->
  <button
    type="button"
    class="vp__toggle focus-ring focus-ring--inset"
    class:vp__toggle--turned={next === 'landscape'}
    disabled={!orientable}
    aria-label={`Rotate to ${next}`}
    title={orientable ? `Rotate to ${next}` : 'Rotate — only for a device'}
    onclick={() => onorientation?.(next)}
  >
    <Icon name="device-mobile" />
  </button>
</div>

<style>
  .vp {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    /* Placement is the bar's, not this component's — App.svelte gives it the
       middle cell of a three-column grid. A `margin-left: auto` here used to
       push it to the far end, and it would silently fight that grid. */
  }

  /* Inert, not gone. The row holds its width so the bar does not reflow between
     sections; the controls simply stop offering anything. */
  .vp--off {
    opacity: 0.45;
  }

  /* Same shape as the canvas's example-state tabs — a hairline trough with the
     selected cell raised out of it. Reusing the look rather than inventing a
     third segmented idiom for the same job. */
  .vp__group {
    display: inline-flex;
    gap: 2px;
    padding: 2px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background: color-mix(in oklab, var(--text-primary) 4%, transparent);
  }

  .vp__seg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 22px;
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: background 150ms ease, color 150ms ease;
  }

  .vp__seg :global(.ph) {
    font-size: 0.95rem;
  }

  .vp__seg:hover:not(:disabled) {
    color: var(--text-primary);
  }

  /* Bare, like the rail's toggles — no trough, because there is no group for it
     to sit in and a single cell in a trough reads as a segmented control with a
     missing half. */
  .vp__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: border-color 150ms ease, color 150ms ease;
  }

  .vp__toggle :global(.ph) {
    font-size: 0.95rem;
    transition: transform 180ms ease;
  }

  /* The glyph shows what the click will DO, so it lies on its side while the
     button offers landscape and stands up while it offers portrait. */
  .vp__toggle--turned :global(.ph) {
    transform: rotate(90deg);
  }

  .vp__toggle:hover:not(:disabled) {
    border-color: var(--border-default);
    color: var(--text-primary);
  }

  .vp__toggle:disabled {
    cursor: not-allowed;
  }


  .vp__seg.active {
    background: var(--surface-raised);
    color: var(--text-primary);
  }

  .vp__seg:disabled {
    cursor: not-allowed;
  }


  /* Menu's own trigger is drawn for the sidebar — full width, bordered, on a
     raised ground. In an app bar that otherwise holds only a wordmark, that
     reads as a form field parked beside it. These overrides quiet it to a text
     button that gains its edges on hover. Scoped under `.vp` so the atom is
     unchanged everywhere else — the same `:global` route the rail takes to size
     its icons. */
  .vp__size :global(.ui-menu__trigger) {
    width: auto;
    padding: 2px 8px;
    border-color: transparent;
    background: none;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-weight: var(--caption-weight);
    color: var(--text-secondary);
  }

  .vp__size :global(.ui-menu__trigger:hover) {
    border-color: var(--border-default);
    color: var(--text-primary);
  }

  /* Open is a held state and has to look like one, or the bar snaps back to
     resting while the list is still down. */
  .vp__size :global(.ui-menu__trigger[data-state='open']) {
    border-color: var(--border-default);
    background: var(--surface-raised);
    color: var(--text-primary);
  }

  .vp__size :global(.ui-menu__trigger .ph) {
    font-size: 0.85rem;
  }

  /* Tabular figures because every size label ends in a number, and the trigger
     changes width under the pointer without them. */
  .vp__size :global(.ui-menu__value) {
    font-variant-numeric: tabular-nums;
  }
</style>

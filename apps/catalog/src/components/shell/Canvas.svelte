<script>
  // The preview canvas: chrome (identity + example-state tabs) + the rendered
  // component. Selected fixture + example state are passed in.
  //
  // The canvas RENDERS the frame but does not own the controls that set it. The
  // picker sits in the app bar, because the frame survives a change of fixture
  // and so outlives this region's contents — see ViewportPicker. What arrives
  // here is the three-part choice, and all the canvas does is resolve it to a
  // box; whether the section is one that frames at all was decided upstream and
  // arrives as `enabled`.
  import DeviceFrame from './DeviceFrame.svelte'
  import FixtureView from './FixtureView.svelte'
  import { resolveFrame } from './viewports.js'
  import { descriptors } from '../../editor/descriptors.js'
  import ImplementationBadge from '../../editor/ImplementationBadge.svelte'
  import SourcePanel from '../../editor/SourcePanel.svelte'
  import VariantTabs from '../../editor/VariantTabs.svelte'

  let {
    selected,
    active = null,
    exampleIndex = 0,
    onexample,
    frame: request = { device: 'web', size: 'fill', orientation: 'portrait', enabled: true },
    variants = [],
    variantIndex = 0,
    baseLabel = 'Published',
    canCreateVariant = false,
    onvariant = undefined,
    oncreatevariant = undefined,
  } = $props()

  // DeviceFrame draws and sizes the frame. The canvas resolves the same request
  // only to answer a question about ITSELF — whether its column has to scroll —
  // and uses the same function to do it, so the two cannot disagree.
  const sized = $derived(resolveFrame(request).width !== null)

  // JSON IS THE PRIMARY COMPONENT here, and the badge is what says so: a
  // published entry is a JSON descriptor that HAS a Svelte implementation, a
  // composed one is a JSON document that has none yet. The badge only appears
  // where that question has an answer — the BrandKit specimens are catalog-local
  // screens documenting the system, not components of the kit, and labelling
  // them would be claiming something about them that is not being claimed.
  const descriptor = $derived(selected?.name ? (descriptors[selected.name] ?? null) : null)
  const composedDoc = $derived(selected?.document ?? null)
  const describable = $derived(Boolean(descriptor || composedDoc))

  let sourceOpen = $state(false)
  // Closed on a change of selection. A panel that stayed open would show the
  // previous component's code beside the new one's render for the instant before
  // it swapped, which is exactly the wrong thing for a surface whose whole job is
  // to say what backs what.
  $effect(() => {
    void selected
    sourceOpen = false
  })
</script>

<main class="canvas">
  <header class="canvas__chrome">
    <div class="canvas__identity">
      <h1>{selected?.name}</h1>
      <VariantTabs
        {variants}
        index={variantIndex}
        {baseLabel}
        canCreate={canCreateVariant}
        onselect={onvariant}
        oncreate={oncreatevariant}
      />
      {#if describable}
        <ImplementationBadge
          implementations={descriptor?.implementations ?? []}
          expanded={sourceOpen}
          onToggle={() => (sourceOpen = !sourceOpen)}
        />
      {/if}
    </div>

    {#if selected?.examples?.length > 1}
      <div class="examples" role="tablist" aria-label="Example states">
        {#each selected.examples as ex, i}
          <button
            class="example focus-ring focus-ring--inset"
            class:active={i === exampleIndex}
            role="tab"
            aria-selected={i === exampleIndex}
            onclick={() => onexample?.(i)}
          >
            {ex.label}
          </button>
        {/each}
      </div>
    {/if}
  </header>

  <div class="canvas__content" class:canvas__content--framed={sized}>
    <!-- The frame is always present, even at "Fit", where it carries no size and
         no border. Mounting and unmounting a wrapper around the preview would
         remount the component with it, throwing away whatever state the thing
         being playtested had accumulated — which is the opposite of what a
         playtest surface is for. -->
    <!-- A composed PAGE is screen-shaped and fills its frame the way a screen
         does. Without it the frame shrinks to content, and a grid inside collapses
         to zero-width tracks — `minmax(0, 1fr)` has nothing to divide when the
         container has no definite width. `kind` was the screens' word for this
         before pages existed; both answer it now. -->
    <DeviceFrame frame={request} fill={selected?.kind === 'screen' || selected?.kind === 'page'}>
      <FixtureView fixture={selected} example={active} />
    </DeviceFrame>
  </div>

  {#if sourceOpen && describable}
    <SourcePanel component={descriptor ? selected.name : null} document={composedDoc} />
  {/if}
</main>

<style>
  .canvas {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--surface-base);
    color: var(--text-primary);
    overflow: hidden;
  }

  /* Wraps: in a narrow window a fixture with several long example labels would
     otherwise push its tabs over the name. */
  .canvas__chrome {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-bottom: 1px solid var(--border-default);
    background: var(--surface-raised);
    flex-shrink: 0;
  }

  .canvas__identity {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-xs);
    min-width: 0;
  }

  /* The status badge is not part of the selector (D70). This row carries three
     different kinds of thing — the name, the variant SELECTOR, and the
     ImplementationBadge, which reports what BACKS the thing and toggles its
     source. At one uniform gap they read as one run of interchangeable pills,
     which is most of why the create control was unreadable in the middle of
     them. The wider gap is the only thing separating status from selection. */
  .canvas__identity :global(.badge) {
    margin-left: var(--spacing-sm);
  }

  .canvas__content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Framed, the x-axis has to scroll: Web 2xl is 1536px and the canvas column
     is whatever is left after a 56px rail and a 248px list, which on this
     machine is not 1536. Clipping it would show a 1536px layout cropped to
     1100 and call it 1536 — a wrong answer presented as a right one. Scrolling
     is honest, and it is what DevTools does at the same impasse.

     The ground goes raised because the device is base. Both were base, so a
     390px handset sat on a field of its own colour and the border did all the
     work of saying where the device stopped. Raised is LIGHTER than base here,
     so the device reads as the darker thing — a screen cut into a board rather
     than a panel floating on one. It is the arrangement the Rees screen map
     uses: page on raised, phone on base.

     Only when framed. Unsized there is no device to contrast with, and the
     BrandKit screens draw straight onto the canvas. */
  .canvas__content--framed {
    background: var(--surface-raised);
    overflow-x: auto;
    /* `center` would clip the left edge of an overflowing frame beyond reach in
       a scroll container; this centres while it fits and pins to the start once
       it does not. */
    align-items: safe center;
  }


  h1 {
    margin: 0;
    /* The kit declares exactly one heading, and this is the screen's title, so
       it takes it. 1.1rem was 17.6px against heading-md's 20px — the change is
       visible, and it is the scale asserting itself rather than a tuning. */
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    font-weight: var(--heading-md-weight);
    letter-spacing: var(--heading-md-track);
    color: var(--text-primary);
  }

  /* Wraps as well: a fixture's examples can be wider than the canvas on their own. */
  .examples {
    display: inline-flex;
    flex-wrap: wrap;
    max-width: 100%;
    gap: 2px;
    padding: 2px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background: color-mix(in oklab, var(--text-primary) 4%, transparent);
    flex-shrink: 0;
  }

  .example {
    padding: 3px 10px;
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    font: inherit;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    cursor: pointer;
    transition: background 150ms ease, color 150ms ease;
  }

  .example.active {
    background: var(--surface-base);
    color: var(--text-primary);
    font-weight: var(--label-md-weight);
  }


</style>

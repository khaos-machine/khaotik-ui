<script>
  // A flow: its screens, side by side, at the device the picker is set to.
  //
  // The strip runs on ONE AXIS and does not wrap. Flow length is unbounded —
  // Mobbin's carry 2, 4, 6, 12 and 20 screens — so a wrapping grid would turn a
  // sequence into a paragraph and lose the thing a flow is for, which is reading
  // one screen after another. It scrolls instead, which is what Mobbin does at
  // the same impasse and what the canvas already does for an oversized frame.
  //
  // Frames are LIVE but not interactive: real components with real data, pointer
  // events off. A row of ten mounted screens competing for clicks is ten apps,
  // not a map of one journey. It also keeps a stray click from mutating state in
  // a frame the reader is only looking at.
  import DeviceFrame from './DeviceFrame.svelte'
  import FixtureView from './FixtureView.svelte'
  import { resolveFlowSteps } from '../../fixtures.js'

  /**
   * @property {{name?: string, steps?: string[]}} flow The flow fixture.
   * @property {object} frame The picker's three-part choice, passed to every
   *   frame in the strip so one control resizes the whole sequence.
   * @property {boolean} [chassis] Draw the device chassis on each frame.
   * @property {Array} [registry] Entries a step may name. Defaults to the live registry.
   */
  //
  // `registry` is a prop so a flow can step through a COMPOSED PAGE as well as a
  // screen fixture. It defaults to the live registry, which is what every
  // existing caller and test passes nothing for — the strip's contract is
  // unchanged, it just no longer assumes the only things that exist are the ones
  // compiled into `fixtures.js`.
  let { flow, frame, chassis = true, registry = undefined } = $props()

  const resolved = $derived(registry ? resolveFlowSteps(flow, registry) : resolveFlowSteps(flow))

  // A step names a SCREEN, and a screen carries example states. The step names
  // no state, so it gets the first — the same one the canvas opens on, so a
  // screen looks here the way it looks when you select it.
  //
  // A flow that wants a particular state (Empty rather than Populated) cannot
  // say so yet. That is a real limit of the shape rather than an oversight, and
  // it is left as a limit until a flow actually needs it: `steps` holding ids is
  // what keeps a flow from drifting from its screens, and `{id, example}` pairs
  // would be the first thing to trade that away.
  const steps = $derived(
    resolved.steps.map((screen) => ({ screen, example: screen.examples?.[0] ?? null })),
  )
</script>

<section class="flow" aria-label={flow?.name}>
  <div class="flow__strip">
    <!-- KEYED BY POSITION, not by screen id. A journey can revisit a screen —
         launcher, dashboard, settings, dashboard — and two steps naming the same
         id are two duplicate keys, which throws `each_key_duplicate` and aborts
         the strip rather than drawing it twice. The position is what distinguishes
         them, and it is the same fix this repo already applied twice to the
         list family (6d6a8aa, 4c1044b). -->
    {#each steps as { screen, example }, i (i)}
      <div class="flow__step">
        <!-- `inert` rather than pointer-events alone: it takes the frame out of
             the tab order too, so a keyboard reader does not walk through ten
             screens' worth of controls to reach the next thing on the page. -->
        <div class="flow__screen" inert>
          <DeviceFrame {frame} {chassis}>
            <FixtureView fixture={screen} {example} />
          </DeviceFrame>
        </div>
        <span class="flow__position" aria-hidden="true">{i + 1}</span>
      </div>
    {/each}
  </div>

  <!-- Flow-level, not per frame. Mobbin captions the flow and gives each screen
       a position and nothing else; a caption per frame is the thing that goes
       stale against the screen beside it. -->
  <footer class="flow__caption">
    <h2 class="flow__name">{flow?.name}</h2>
    <span class="flow__count">{resolved.steps.length} screens</span>
  </footer>

  <!-- A step that resolves to nothing is REPORTED, not skipped. Dropping it
       silently would render a shorter strip that looks correct, which is how a
       renamed screen would leave a flow quietly wrong. -->
  {#if resolved.missing.length}
    <p class="flow__missing">
      {resolved.missing.length} step{resolved.missing.length === 1 ? '' : 's'} name
      {resolved.missing.length === 1 ? 'a screen' : 'screens'} that no longer exist:
      {resolved.missing.join(', ')}
    </p>
  {/if}
</section>

<style>
  .flow {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  /* One axis, no wrap. `align-items: start` so a strip of frames at different
     heights hangs from one line rather than centring each against the tallest —
     the top edges are what the eye reads along. */
  .flow__strip {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-xl);
    overflow-x: auto;
    padding-bottom: var(--spacing-2xs);
  }

  .flow__step {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2xs);
    flex: none;
  }

  /* The frame is inert, so nothing inside it can be scrolled or focused. Its own
     scrollbars would advertise an affordance that is switched off. */
  .flow__screen {
    display: flex;
    overflow: hidden;
  }

  /* Position, not a caption. It says where in the sequence a frame sits and
     claims nothing about what it shows. */
  .flow__position {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-family: var(--font-mono);
    color: var(--text-tertiary);
  }

  .flow__caption {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-xs);
  }

  .flow__name {
    margin: 0;
    font-size: var(--label-lg-size);
    line-height: var(--label-lg-line);
    font-weight: var(--label-lg-weight);
    letter-spacing: var(--label-lg-track);
    color: var(--text-primary);
  }

  .flow__count {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
  }

  .flow__missing {
    margin: 0;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--tone-danger);
    text-wrap: pretty;
  }
</style>

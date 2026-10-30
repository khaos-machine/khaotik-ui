<script>
  // EngineDetails (data-layer plan A11; audit §3.9): the desktop welcome window's engine plates,
  // always visible under its rail (operator, 2026-10-09: "want to see these and not have them
  // buried as they are the first indicator of the state of the workspace"). What is installed
  // (each component and version), what each routed capability is served by, and what runs on
  // this computer. Three axes, each its own section.
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import Icon from './Icon.svelte'
  import ProviderMark from './ProviderMark.svelte'
  import StatusPill from './StatusPill.svelte'
  import { ENGINE_PILLS, engineComponents, engineState, hasExactReleaseVersion, modelName } from './lib/engine.js'
  import { readService, NOT_INSTALLED } from './lib/services.js'

  /**
   * @typedef {Object} Props
   * @property {{ state?: string, components?: readonly { name: string, version?: string, status?: string, update?: { label?: string, icon?: string, tone?: string, detail?: string } }[], appVersion?: string, daemonVersion?: string, wflAvailable?: boolean }} [engine] The engine's readings: its state, and each installed component (or the three legacy version fields).
   * @property {readonly { capability: string, label: string, provider: string, model: string, local?: boolean, icon?: string }[]} [routes] The routed capabilities, each with the label the engine gives it.
   * @property {readonly { name: string, label?: string, state: string, provisioned?: boolean, ready_to_use?: boolean }[]} [services] The on-device engines, as khaosd's /api/services reports them. **Omit it and the section is absent**; an empty list renders "No on-device engines".
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let { engine = {}, routes = [], services = undefined, uiId = 'engine' } = $props()

  const pill = $derived(ENGINE_PILLS[engineState(engine)] ?? ENGINE_PILLS.offline)
  const components = $derived(engineComponents(engine))
  const rows = $derived((services ?? []).map((s) => ({ ...s, ...readService(s) })))
  const running = $derived(rows.filter((r) => r.usable).length)
</script>

<div class="details" data-ui-id={uiId}>
  <!-- The pill and the running count sit in the section heads: a row each cost the height that keeps the actions and every plate whole at 1000x680. -->
  <InspectorSection title="Engine" uiId="{uiId}.engine">
    {#snippet meta()}
      <span title={pill.detail || null}>
        <StatusPill text={pill.text} tone={pill.tone} icon={pill.icon} />{#if pill.detail}<span class="visually-hidden">{pill.detail}</span>{/if}
      </span>
    {/snippet}
    {#each components as component, i (i)}
      <PropertyRow label={component.name}>
        <span class="details__version">
          <!-- A presence word (git: available) reads as a state; a version that is not an exact
               release (a dirty or dev build) reads as a warning, as the plate showed it. -->
          <span
            class="details__reading"
            data-release={component.version ? String(hasExactReleaseVersion(component.version)) : null}
            >{component.version || component.status || '—'}</span
          >
          <!-- The update verdict, only when the host supplies one: the
               host words it, because current, unlisted and incomparable are engine meaning. -->
          {#if component.update?.icon || component.update?.label}
            <span class="details__update" data-tone={component.update.tone ?? 'neutral'} title={component.update.detail || null}>
              {#if component.update.icon}<Icon name={component.update.icon} weight="fill" />{:else}<span aria-hidden={component.update.detail ? 'true' : undefined}>{component.update.label}</span>{/if}
              {#if component.update.detail}<span class="visually-hidden">{component.update.detail}</span>{/if}
            </span>
          {/if}
        </span>
      </PropertyRow>
    {/each}
  </InspectorSection>

  {#if routes.length}
    <InspectorSection title="Routing" uiId="{uiId}.routing">
      {#each routes as route, i (i)}
        <PropertyRow label={route.label}>
          <span class="details__route" title="{route.provider} · {route.model}">
            <ProviderMark provider={route.provider} local={route.local ?? false} fallbackIcon={route.icon || 'plugs-connected'} />
            <span class="details__route-name">{modelName(route)}</span>
          </span>
        </PropertyRow>
      {/each}
    </InspectorSection>
  {/if}

  <!-- A summary, as the plate was: the first three engines, the rest counted. Absent when the
       host passes no `services` at all (a Basic install has no on-device engines, BA-R4b). -->
  {#if services}
  <InspectorSection title="On-device engines" uiId="{uiId}.services">
    {#snippet meta()}
      {#if rows.length}<StatusPill text={running ? `${running} running` : 'Idle'} tone={running ? 'success' : 'neutral'} />{/if}
    {/snippet}
    {#if rows.length}
      {#each rows.slice(0, 3) as svc, i (i)}
        <!-- `provisioned: false` displaces the state word with "not installed"; the dot keeps
             the state, keyed on the literal state string, as the plate's dot was. -->
        <PropertyRow label={svc.label || svc.name}>
          <span class="details__svc">
            <span class="details__dot" data-state={svc.state} aria-hidden="true"></span>
            <span class="details__svc-state">{svc.needsSetup ? NOT_INSTALLED : svc.state}</span>
          </span>
        </PropertyRow>
      {/each}
      {#if rows.length > 3}<p class="details__none">+{rows.length - 3} more</p>{/if}
    {:else}
      <p class="details__none">No on-device engines</p>
    {/if}
  </InspectorSection>
  {/if}
</div>

<style>
  .details {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .details__route {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    min-width: 0;
  }
  /* One line, as PropertyRow's own value: the model name truncates, its full id and provider
     stay on the hover. */
  .details__route-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .details__version {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    overflow-wrap: anywhere;
  }
  .details__reading:not([data-release]) {
    color: var(--text-secondary);
  }
  .details__reading[data-release='false'] {
    color: var(--tone-warning);
  }
  .details__svc {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    min-width: 0;
  }
  .details__svc-state {
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .details__dot {
    flex: none;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--tone-neutral);
  }
  .details__dot[data-state='running'] { background: var(--tone-success); }
  .details__dot[data-state='starting'] { background: var(--tone-warning); }
  .details__dot[data-state='error'] { background: var(--tone-danger); }
  /* The verdict never wraps or shrinks: a badge broke mid-phrase ("Up to / date", #149). */
  .details__update {
    flex: none;
    white-space: nowrap;
  }
  .details__update[data-tone='warning'] {
    color: var(--tone-warning);
  }
  .details__update[data-tone='success'] {
    color: var(--tone-success);
  }
  .details__update[data-tone='danger'] {
    color: var(--tone-danger);
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .details__none {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--data-md-size);
  }
</style>

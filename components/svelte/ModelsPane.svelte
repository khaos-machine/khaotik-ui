<script>
  // Settings › Models: the AI models the on-device engines run on this Mac, where they come from,
  // where they are kept, and what each is for. One table, grouped by the engine that loads each
  // model, because that is what explains several models of one kind. A download is confirmed
  // here and run by the host. Moved from Khaos App (catalog app-coverage plan, T9).
  import ConfirmDialog from './ConfirmDialog.svelte'
  import Icon from './Icon.svelte'
  import OutcomeBanner from './OutcomeBanner.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import StatusPill from './StatusPill.svelte'
  import { installedSize, modelGroups, storageFolder } from './lib/models.js'

  /**
   * @typedef {Object} Props
   * @property {{ kind: 'unread' } | { kind: 'not-served' } | { kind: 'failed', message: string } | { kind: 'served', models: readonly import('./lib/models.js').LocalModel[] }} [inventory] The models khaosd holds.
   * @property {(service: string) => string} [engineName] An engine's display name from its service id, '' when it is not known.
   * @property {{ text: string, tone: 'success' | 'warning' | 'neutral' } | null} [token] The Hugging Face token's connection; null when there is none.
   * @property {string} [refusal] Why khaosd would not start the last download, or ''.
   * @property {{ name: string, blurb: string } | null} [confirming] The model whose download waits on the person's yes.
   * @property {(id: string) => void} [onDownload] Asks to download (or retry) a model; the host asks for confirmation.
   * @property {() => void} [onConfirm] The download's yes.
   * @property {() => void} [onCancel] The download's no.
   * @property {() => void} [onDismissRefusal] Closes the refusal.
   * @property {() => void} [onProviders] Opens Providers, where the token is enrolled.
   */

  /** @type {Props} */
  let {
    inventory = { kind: 'unread' },
    engineName = () => '',
    token = null,
    refusal = '',
    confirming = null,
    onDownload = undefined,
    onConfirm = undefined,
    onCancel = undefined,
    onDismissRefusal = undefined,
    onProviders = undefined,
  } = $props()

  const models = $derived(inventory.kind === 'served' ? inventory.models : [])
  const groups = $derived(modelGroups(models, engineName))
  const folder = $derived(storageFolder(models))
  const total = $derived(installedSize(models))
  const downloading = $derived(models.some((model) => model.download === 'downloading'))
</script>

<p class="ui-models__intro">
  AI models the on-device engines run on this Mac. khaosd downloads each one from
  Hugging Face{#if folder}&nbsp;and keeps it in <code>{folder}</code>{/if}; using one sends
  nothing off this Mac.
</p>

{#if inventory.kind === 'unread'}
  <p class="ui-models__note" role="status">Reading the models khaosd holds…</p>
{:else if inventory.kind === 'not-served'}
  <p class="ui-models__note">This khaosd serves no model inventory.</p>
{:else if inventory.kind === 'failed'}
  <p class="ui-models__note" role="alert">The model inventory could not be read: {inventory.message}</p>
{:else if models.length === 0}
  <p class="ui-models__note">khaosd reported no models.</p>
{:else}
  <p class="ui-models__summary">
    {models.length} model{models.length === 1 ? '' : 's'}{total ? ` · ${total} on disk` : ''}
  </p>
  <table class="ui-models__table" aria-label="On-device models">
    <thead>
      <tr><th scope="col">Model</th><th scope="col">Used for</th><th scope="col" class="ui-models__num">Size</th><th scope="col"><span class="ui-models__sr">Status</span></th></tr>
    </thead>
    {#each groups as group (group.service)}
      <tbody>
        <tr class="ui-models__group"><th scope="rowgroup" colspan="4">{group.title}</th></tr>
        {#each group.rows as row (row.id)}
          <tr>
            <td>
              <span class="ui-models__name" title={row.name}>{row.name}</span>
              <span class="ui-models__repo" title="Hugging Face: {row.repo}">{row.repo}</span>
            </td>
            <td class="ui-models__used" title={row.usedFor}>{row.usedFor}</td>
            <td class="ui-models__num">{row.size}</td>
            <td class="ui-models__status">
              {#if row.state === 'installed'}
                <span class="ui-models__installed"><Icon name="check" weight="bold" /> On this Mac</span>
              {:else if row.state === 'downloading'}
                <span class="ui-models__busy" role="status">Downloading…</span>
              {:else}
                <!-- One download at a time: khaosd serialises them, so a second press is a
                     queued surprise. The accessible name carries the model. -->
                <button
                  type="button"
                  class="ui-models__action"
                  aria-label="{row.state === 'failed' ? 'Retry' : 'Download'} {row.name}"
                  disabled={downloading}
                  onclick={() => onDownload?.(row.id)}>
                  {row.state === 'failed' ? 'Retry' : 'Download'}
                </button>
              {/if}
            </td>
          </tr>
          {#if row.error}
            <tr class="ui-models__error-row"><td colspan="4"><span role="status">{row.error}</span></td></tr>
          {/if}
        {/each}
      </tbody>
    {/each}
  </table>
{/if}

{#if refusal}
  <OutcomeBanner tone="error" title="khaosd could not start that download" detail={refusal} onDismiss={() => onDismissRefusal?.()} />
{/if}

<div class="ui-models__props">
  <PropertyRow label="Decision models" value="Not reported by khaosd yet (khaos-manager#473)" />
  {#if token}
    <PropertyRow label="Hugging Face token">
      <StatusPill text={token.text} tone={token.tone} />
    </PropertyRow>
  {/if}
</div>
<!-- R-4: Providers is an inline action in the note, in the style of khaotik-ui#237,
     which publishes no inline-action component. -->
<p class="ui-models__note">
  khaosd downloads models with the Hugging Face token. Enrol or change it in
  <button type="button" class="ui-models__inline" onclick={() => onProviders?.()}>Providers</button>.
</p>

{#if confirming}
  <ConfirmDialog
    open
    target={confirming.name}
    action="Download"
    confirmLabel="Download"
    cancelLabel="Cancel"
    tone="default"
    description={[confirming.blurb, folder ? `It is kept in ${folder}.` : ''].filter((part) => part).join(' ')}
    onConfirm={() => onConfirm?.()}
    onCancel={() => onCancel?.()}
    onOpenChange={(/** @type {boolean} */ open) => {
      if (!open) onCancel?.()
    }} />
{/if}

<style>
  .ui-models__intro,
  .ui-models__note,
  .ui-models__summary {
    margin: 0;
    max-width: 72ch;
    color: var(--text-secondary);
  }

  .ui-models__note,
  .ui-models__summary {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  .ui-models__intro code {
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--data-md-size);
    color: var(--text-primary);
  }

  /* Fixed columns, one line per cell: a long name or repo ellipses with its full text in
     the tooltip, so every row is the same height. */
  .ui-models__table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    font-size: var(--body-md-size);
  }

  .ui-models__table thead th:nth-child(1) { width: 38%; }
  .ui-models__table thead th:nth-child(3) { width: 72px; }
  .ui-models__table thead th:nth-child(4) { width: 104px; }

  .ui-models__name,
  .ui-models__repo,
  .ui-models__used {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ui-models__table th,
  .ui-models__table td {
    padding: 5px var(--spacing-xs) 5px 0;
    text-align: left;
    vertical-align: middle;
    border-bottom: 1px solid var(--border-hairline);
  }

  .ui-models__table thead th {
    color: var(--text-secondary);
    font-size: var(--caption-size);
    font-weight: 600;
    border-bottom-color: var(--border-default);
  }

  .ui-models__group th {
    padding-top: var(--spacing-sm);
    color: var(--text-secondary);
    font-size: var(--caption-size);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ui-models__name {
    display: block;
    font-weight: 600;
  }

  .ui-models__repo {
    display: block;
    color: var(--text-secondary);
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--caption-size);
  }

  .ui-models__used {
    color: var(--text-secondary);
  }

  .ui-models__num {
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .ui-models__table td.ui-models__num {
    padding-right: var(--spacing-sm);
  }

  .ui-models__status {
    width: 1%;
    white-space: nowrap;
    text-align: right;
  }

  .ui-models__installed {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--tone-success);
    font-size: var(--caption-size);
  }

  .ui-models__busy {
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }

  .ui-models__action {
    min-height: 22px;
    padding: 0 var(--spacing-xs);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: var(--text-primary);
    font: inherit;
    font-size: var(--caption-size);
    cursor: pointer;
  }

  .ui-models__action:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .ui-models__error-row td {
    color: var(--tone-danger);
    font-size: var(--caption-size);
  }

  .ui-models__props {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-width: 480px;
  }

  .ui-models__inline {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: var(--text-primary);
    text-decoration: underline;
    cursor: pointer;
  }

  .ui-models__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
</style>

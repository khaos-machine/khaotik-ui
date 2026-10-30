<script>
  // A failed generation's provider evidence, for someone reporting it: what was asked, of
  // which provider and model, what came back, and until when khaosd keeps it. Nothing
  // renders for a generation with no provider diagnostic.
  //
  // Copying is a capability the host passes in, because only the host can reach the
  // clipboard; the outcome of a copy is shown here, beside the button that asked for it.

  /**
   * @typedef {Object} ProviderDiagnostic
   * @property {string} operation The provider call that failed.
   * @property {number} httpStatus The provider's HTTP status.
   * @property {string} [message] The provider's message, verbatim.
   * @property {string} [responseBody] The provider's response, verbatim, credentials redacted.
   * @property {string} [requestId] The provider's request id.
   * @property {boolean} truncated Whether the response was cut at khaosd's capture limit.
   * @property {string} expiresAt When khaosd drops this evidence, as an ISO timestamp.
   * @property {string} [retryAt] When the provider says to retry, as an ISO timestamp.
   */

  /**
   * @typedef {Object} Generation
   * @property {string} id The generation's id.
   * @property {string | null} [error] khaosd's error, verbatim.
   * @property {{ provider: string, model: string, profile: string }} [provider] Who was asked.
   * @property {ProviderDiagnostic} [providerDiagnostic] The provider evidence. Nothing renders without it.
   */

  /**
   * @typedef {Object} Props
   * @property {Generation} [generation] The generation, in khaosd's shape. Nothing renders without a provider diagnostic.
   * @property {(text: string) => Promise<void>} [copy] Puts text on the clipboard. Without it no Copy button renders.
   */

  /** @type {Props} */
  let { generation = { id: '' }, copy = undefined } = $props()
  let copyStatus = $state('')
  let copyFailed = $state(false)

  async function copyDetails() {
    try {
      await copy?.(JSON.stringify(generation, null, 2))
      copyFailed = false
      copyStatus = 'Failure details copied.'
    } catch (error) {
      copyFailed = true
      copyStatus = error instanceof Error ? error.message : String(error)
    }
  }
</script>

{#if generation.providerDiagnostic}
  {@const diagnostic = generation.providerDiagnostic}
  <details class="generation-failure__details">
    <summary>Provider failure details</summary>
    <dl>
      <dt>Generation</dt><dd>{generation.id}</dd>
      {#if generation.provider}
        <dt>Provider / model</dt><dd>{generation.provider.provider} · {generation.provider.model}</dd>
        <dt>Profile</dt><dd>{generation.provider.profile}</dd>
      {/if}
      <dt>Operation / status</dt><dd>{diagnostic.operation} · HTTP {diagnostic.httpStatus}</dd>
      {#if diagnostic.requestId}<dt>Request</dt><dd>{diagnostic.requestId}</dd>{/if}
      {#if generation.error}<dt>Error</dt><dd>{generation.error}</dd>{/if}
      {#if diagnostic.message}<dt>Provider message</dt><dd>{diagnostic.message}</dd>{/if}
      {#if diagnostic.retryAt}<dt>Retry after</dt><dd>{new Date(diagnostic.retryAt).toLocaleString()}</dd>{/if}
      <dt>Evidence available until</dt><dd>{new Date(diagnostic.expiresAt).toLocaleString()}</dd>
    </dl>
    {#if diagnostic.responseBody}
      <label>Provider response<textarea readonly value={diagnostic.responseBody} rows="6"></textarea></label>
    {/if}
    {#if diagnostic.truncated}<p>The provider response exceeded the capture limit or could not be read completely.</p>{/if}
    <p>The response may quote your description. Credentials have been redacted.</p>
    {#if copy}<button type="button" onclick={() => void copyDetails()}>Copy failure details</button>{/if}
    {#if copyStatus}<p role={copyFailed ? 'alert' : 'status'}>{copyStatus}</p>{/if}
  </details>
{/if}

<style>
  .generation-failure__details { color: var(--text-secondary); font-size: var(--data-md-size); margin-block: var(--spacing-sm); }
  summary { color: var(--text-primary); cursor: pointer; }
  dl { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: var(--spacing-2xs) var(--spacing-sm); }
  dd { margin: 0; overflow-wrap: anywhere; color: var(--text-primary); }
  label { display: grid; gap: var(--spacing-xs); }
  textarea { width: 100%; box-sizing: border-box; resize: vertical; background: transparent; color: var(--text-primary); border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: var(--spacing-xs); font-family: var(--font-mono); font-size: inherit; }
  textarea:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 2px; }
  button { background: transparent; color: var(--text-primary); border: 1px solid var(--border-default); border-radius: var(--radius-sm); font: inherit; padding: 3px 10px; cursor: pointer; }
  button:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 2px; }
</style>

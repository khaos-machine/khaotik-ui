<script>
  // What a voice is designed from, for one character or the narrator: the engine's voice brief
  // (khaos-manager internal/api/voice_brief.go). What the script states, what the analysis
  // suggests beyond it (kept apart, so nothing suggested reads as stated), lines to audition on,
  // and, for the narrator, what the story does not say. The host reads the brief; this draws it.

  /**
   * @typedef {Object} Brief
   * @property {boolean} speaks False for a character with no lines: there is nothing to design a voice from.
   * @property {string} description What the voice is designed from, built from the script.
   * @property {readonly { line: string, scene: string }[]} auditionLines Lines to audition a voice on, each with its scene.
   * @property {readonly { detail: string, restsOn: string }[]} [suggested] What the analysis suggests beyond the script, with what each rests on. The narrator's brief has none.
   * @property {readonly string[]} [gaps] What the narrator's brief could not say (`genre`, `premise`). A character's brief has none.
   */
  /** @typedef {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'ready', brief: Brief }} BriefRead */

  /**
   * @typedef {Object} Props
   * @property {string} [name] Whose brief: a character's name, or "Narrator".
   * @property {BriefRead} [read] The brief, as far as the host has read it.
   * @property {boolean} [description] Shows the description. Off where the host already shows it, as the voice studio's own field.
   * @property {number} [linesFrom] The first audition line shown, 0-based. 1 where the host already shows the first.
   */

  /** @type {Props} */
  let { name = '', read = { kind: 'loading' }, description = true, linesFrom = 0 } = $props()

  /** How a gap reads in a sentence; one the brief names that this does not know reads as itself. */
  const GAP_WORDS = /** @type {Record<string, string>} */ ({ genre: 'a genre', premise: 'a premise' })
  const missing = $derived(read.kind === 'ready' ? (read.brief.gaps ?? []).map((g) => GAP_WORDS[g] ?? g) : [])
  const lines = $derived(read.kind === 'ready' ? read.brief.auditionLines.slice(linesFrom) : [])
  const suggested = $derived(read.kind === 'ready' ? (read.brief.suggested ?? []) : [])
</script>

<div class="ui-voice-brief" data-ui-id="voice-brief">
  {#if read.kind === 'loading'}
    <p class="ui-voice-brief__note">Reading {name}'s analysis…</p>
  {:else if read.kind === 'failed'}
    <p class="ui-voice-brief__note" role="alert">{read.message}</p>
  {:else if !read.brief.speaks}
    <p class="ui-voice-brief__note">{name} has no lines, so there is nothing to design a voice from.</p>
  {:else}
    {#if description && read.brief.description}
      <p class="ui-voice-brief__label">From the script</p>
      <p class="ui-voice-brief__description">{read.brief.description}</p>
    {/if}
    {#if missing.length}
      <p class="ui-voice-brief__note">The story doesn't give {missing.join(' or ')}.</p>
    {/if}
    {#if suggested.length}
      <p class="ui-voice-brief__label">The analysis also suggests, beyond the script</p>
      <ul class="ui-voice-brief__list">
        {#each suggested as s, i (i)}<li>{s.detail} <span class="ui-voice-brief__why">— {s.restsOn}</span></li>{/each}
      </ul>
    {/if}
    {#if lines.length}
      <p class="ui-voice-brief__label">{linesFrom ? 'More lines to audition' : 'Lines to audition'}</p>
      <ul class="ui-voice-brief__list">
        {#each lines as l, i (i)}<li>{l.line} <span class="ui-voice-brief__why">{l.scene}</span></li>{/each}
      </ul>
    {/if}
  {/if}
</div>

<style>
  .ui-voice-brief {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    min-width: 0;
  }
  .ui-voice-brief p {
    margin: 0;
  }
  .ui-voice-brief__note {
    color: var(--text-secondary);
  }
  .ui-voice-brief__why {
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
  .ui-voice-brief__label {
    margin-top: var(--spacing-xs);
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
  .ui-voice-brief__list {
    margin: 0;
    padding-left: var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
  }
</style>

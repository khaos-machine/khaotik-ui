<script>
  // Sound effects and music, each a form beside its takes (D81). The same workbench the
  // voice studio is (D79): a sound is found by hearing it more than once, so every take
  // stays beside the form instead of the last one replacing it.
  //
  // A PURE VIEW. The host generates, keeps the takes and says how each ended. The form
  // collects what the engine takes and nothing it does not: an SFX prompt and its length; a
  // music caption, lyrics or "instrumental", its length, and, only when opened, steps and a
  // seed. No bounds are invented here: the host supplies the engine's music limits, and music
  // waits for them. Anything else the engine refuses in its own words.
  import { TabContent, TabList, TabsRoot, TabTrigger } from '@ark-ui/svelte/tabs'
  import TakeList from './TakeList.svelte'
  import Icon from './Icon.svelte'

  /**
   * @typedef {Object} Take
   * @property {string} id The engine's generation id.
   * @property {string} label The take's name, e.g. "Take 2".
   * @property {string} createdAt When it was generated, as an ISO 8601 timestamp.
   * @property {string} voiceName What made it, in words: the prompt or caption.
   * @property {string} [src] Playable audio. Without it the take's player is disabled.
   * @property {string} [error] Why the engine made nothing, verbatim.
   */

  /**
   * @typedef {Object} SfxSpec
   * @property {string} prompt A concrete, scene-level description of the sound.
   * @property {number} durationSeconds
   */

  /**
   * @typedef {Object} MusicSpec
   * @property {string} caption What the music is: style, instruments, mood.
   * @property {boolean} instrumental True for music without words.
   * @property {string} lyrics The words, trimmed. Empty when instrumental.
   * @property {number} duration Seconds, up to the supplied `maxDurationSeconds`.
   * @property {number} [steps] 1 to the supplied `maxSteps`. Absent unless the storyteller opened the finer controls.
   * @property {number} [seed] Absent unless set. 0 is a real seed.
   */

  /**
   * @typedef {Object} MusicLimits
   * @property {number} maxDurationSeconds The longest piece the engine makes, in seconds.
   * @property {number} maxSteps The most steps the engine takes.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly Take[]} [sfxTakes] Sound-effect takes, newest first.
   * @property {readonly Take[]} [musicTakes] Music takes, newest first.
   * @property {'sfx' | 'music' | null} [generating] Which kind is generating, if any. Disables both Generates: the host generates one at a time.
   * @property {(kind: 'sfx', spec: SfxSpec) => void} [onSfx] Generate a sound effect. Without it that tab's Generate is disabled.
   * @property {(kind: 'music', spec: MusicSpec) => void} [onMusic] Generate music. Without it that tab's Generate is disabled.
   * @property {string} [sfxReason] Why a sound effect cannot be generated now, in the host's words.
   * @property {string} [musicReason] Why music cannot be generated now, in the host's words.
   * @property {MusicLimits} [musicLimits] The engine's music bounds, as the host has them. Without them music does not generate.
   * @property {(id: string) => void} [onRetryTake] Asks for a failed take again, of either kind (D85).
   * @property {string} [progress] How far the generation in flight has got, in the host's words (D87).
   */

  /** @type {Props} */
  let {
    sfxTakes = [],
    musicTakes = [],
    generating = null,
    onSfx = undefined,
    onMusic = undefined,
    sfxReason = '',
    musicReason = '',
    musicLimits = undefined,
    onRetryTake = undefined,
    progress = '',
  } = $props()

  let tab = $state('SFX')

  let prompt = $state('')
  let sfxSeconds = $state(8)

  let caption = $state('')
  let lyrics = $state('')
  let instrumental = $state(true)
  let musicSeconds = $state(60)
  let finer = $state(false)
  // Blank by default: a number chosen here would be a model setting the kit invented (8 was,
  // and produced noise). Sent only when the storyteller types one.
  let steps = $state(null)
  // A number input binds a number, or null when empty. Blank means a new seed each time.
  let seed = $state(null)

  const busy = $derived(generating !== null)
  const sfxWhy = $derived(String(sfxReason ?? '').trim())
  const musicWhy = $derived(String(musicReason ?? '').trim())
  const canSfx = $derived(Boolean(onSfx) && !busy && !sfxWhy && prompt.trim() !== '' && sfxSeconds > 0)
  const limits = $derived(
    musicLimits && musicLimits.maxDurationSeconds > 0 && musicLimits.maxSteps > 0 ? musicLimits : null,
  )
  const canMusic = $derived(
    Boolean(onMusic) && Boolean(limits) && !busy && !musicWhy && caption.trim() !== '' && (instrumental || lyrics.trim() !== ''),
  )

  function sfx(event) {
    event.preventDefault()
    if (canSfx) onSfx?.('sfx', { prompt: prompt.trim(), durationSeconds: Number(sfxSeconds) })
  }

  function music(event) {
    event.preventDefault()
    if (!canMusic) return
    const seedValue = seed === null || seed === '' ? undefined : Number(seed)
    onMusic?.('music', {
      caption: caption.trim(),
      instrumental,
      lyrics: instrumental ? '' : lyrics.trim(),
      duration: Number(musicSeconds),
      ...(finer && steps !== null && steps !== '' ? { steps: Number(steps) } : {}),
      ...(finer && seedValue !== undefined && Number.isInteger(seedValue) ? { seed: seedValue } : {}),
    })
  }
</script>

<div class="ui-sound-studio">
  <TabsRoot value={tab} onValueChange={(details) => (tab = details.value)}>
    <TabList class="ui-sound-studio__tabs" aria-label="Sound modes">
      <TabTrigger value="SFX" class="ui-sound-studio__tab">SFX</TabTrigger>
      <TabTrigger value="Music" class="ui-sound-studio__tab">Music</TabTrigger>
    </TabList>

    <TabContent value="SFX" class="ui-sound-studio__body">
      <div class="ui-sound-studio__work">
        <form class="ui-sound-studio__form" onsubmit={sfx}>
          <label class="ui-sound-studio__field">
            <span class="ui-sound-studio__label">Describe the sound</span>
            <textarea
              class="ui-sound-studio__text"
              rows="4"
              bind:value={prompt}
              placeholder="A campfire crackling in a quiet forest at night, an owl far off"></textarea>
          </label>
          <p class="ui-sound-studio__hint">Say what is heard in the scene, not a few keywords.</p>
          <label class="ui-sound-studio__field ui-sound-studio__field--short">
            <span class="ui-sound-studio__label">Length, seconds</span>
            <input class="ui-sound-studio__input" type="number" min="1" step="1" bind:value={sfxSeconds} />
          </label>
          <div class="ui-sound-studio__go">
            <button class="ui-sound-studio__generate" type="submit" disabled={!canSfx}>
              <Icon name="waveform" /> {generating === 'sfx' ? 'Generating…' : 'Generate sound'}
            </button>
            <p class="ui-sound-studio__reason" role="status">{generating === 'sfx' ? String(progress ?? '').trim() : sfxWhy}</p>
          </div>
        </form>
        <section class="ui-sound-studio__takes" aria-label="Sound effect takes">
          <h3 class="ui-sound-studio__heading">Takes</h3>
          {#if sfxTakes.length > 0}
            <TakeList takes={sfxTakes} generating={busy} toolbar={false} compact onRetry={onRetryTake} />
          {:else}
            <p class="ui-sound-studio__hint">Each sound you generate stays here to compare.</p>
          {/if}
        </section>
      </div>
    </TabContent>

    <TabContent value="Music" class="ui-sound-studio__body">
      <div class="ui-sound-studio__work">
        <form class="ui-sound-studio__form" onsubmit={music}>
          <label class="ui-sound-studio__field">
            <span class="ui-sound-studio__label">Describe the music</span>
            <textarea
              class="ui-sound-studio__text"
              rows="3"
              bind:value={caption}
              placeholder="A melancholic 70 BPM lo-fi track. Soft felt piano leads, brushed drums stay in the back, rain throughout."></textarea>
          </label>
          <!-- From MiniMax Music 3's own guidance (model card and prompt guide): full sentences
               in the order style, mood, tempo, instruments, with one primary genre. It builds
               in over time, so 30–60 seconds gives it room. -->
          <p class="ui-sound-studio__hint">
            Write it like a producer's brief: genre, mood, tempo, then the instruments and what each does. Give it 30 seconds or more; it takes time to build.
          </p>
          <label class="ui-sound-studio__check">
            <input type="checkbox" bind:checked={instrumental} />
            <span>Instrumental</span>
          </label>
          {#if !instrumental}
            <label class="ui-sound-studio__field">
              <span class="ui-sound-studio__label">Lyrics</span>
              <textarea class="ui-sound-studio__text" rows="5" bind:value={lyrics}></textarea>
            </label>
          {/if}
          <label class="ui-sound-studio__field ui-sound-studio__field--short">
            <span class="ui-sound-studio__label">Length, seconds{limits ? ` (up to ${limits.maxDurationSeconds})` : ''}</span>
            <input class="ui-sound-studio__input" type="number" min="1" max={limits?.maxDurationSeconds} step="1" bind:value={musicSeconds} />
          </label>
          <div class="ui-sound-studio__finer">
            <button
              class="ui-sound-studio__disclose"
              type="button"
              aria-expanded={finer}
              onclick={() => (finer = !finer)}>
              <Icon name={finer ? 'caret-down' : 'caret-right'} /> Finer control
            </button>
            {#if finer}
            <label class="ui-sound-studio__field ui-sound-studio__field--short">
              <span class="ui-sound-studio__label">Steps ({limits ? `1–${limits.maxSteps}, ` : ''}blank for the engine's)</span>
              <input class="ui-sound-studio__input" type="number" min="1" max={limits?.maxSteps} step="1" bind:value={steps} />
            </label>
            <label class="ui-sound-studio__field ui-sound-studio__field--short">
              <span class="ui-sound-studio__label">Seed (blank for a new one)</span>
              <input class="ui-sound-studio__input" type="number" step="1" bind:value={seed} />
            </label>
            {/if}
          </div>
          <div class="ui-sound-studio__go">
            <button class="ui-sound-studio__generate" type="submit" disabled={!canMusic}>
              <Icon name="music-notes" /> {generating === 'music' ? 'Generating…' : 'Generate music'}
            </button>
            <p class="ui-sound-studio__reason" role="status">{generating === 'music' ? String(progress ?? '').trim() : musicWhy}</p>
          </div>
        </form>
        <section class="ui-sound-studio__takes" aria-label="Music takes">
          <h3 class="ui-sound-studio__heading">Takes</h3>
          {#if musicTakes.length > 0}
            <TakeList takes={musicTakes} generating={busy} toolbar={false} compact onRetry={onRetryTake} />
          {:else}
            <p class="ui-sound-studio__hint">Each piece you generate stays here to compare.</p>
          {/if}
        </section>
      </div>
    </TabContent>
  </TabsRoot>
</div>

<style>
  :global(.ui-sound-studio__tabs) {
    display: flex;
    gap: var(--spacing-2xs);
    border-bottom: 1px solid var(--border-default);
  }

  :global(.ui-sound-studio__tab) {
    padding: 3px 10px;
    border: 0;
    border-bottom: 1px solid transparent;
    margin-bottom: -1px;
    background: none;
    font: inherit;
    font-size: var(--data-md-size);
    color: var(--text-secondary);
    cursor: pointer;
  }

  :global(.ui-sound-studio__tab:hover) {
    color: var(--text-primary);
  }

  :global(.ui-sound-studio__tab[data-selected]) {
    color: var(--text-primary);
    font-weight: 600;
    border-bottom-color: var(--action-primary);
  }

  :global(.ui-sound-studio__tab:focus-visible) {
    outline: 2px solid var(--border-focus);
    outline-offset: -2px;
  }

  :global(.ui-sound-studio__body:not([hidden])) {
    padding-top: var(--spacing-sm);
  }

  .ui-sound-studio__work {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--spacing-lg);
    align-items: start;
  }

  .ui-sound-studio__form,
  .ui-sound-studio__takes {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  .ui-sound-studio__takes {
    gap: var(--spacing-sm);
  }

  .ui-sound-studio__heading {
    margin: 0;
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    font-weight: 600;
    color: var(--text-primary);
  }

  .ui-sound-studio__field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    min-width: 0;
  }

  .ui-sound-studio__field--short {
    max-width: 14rem;
  }

  .ui-sound-studio__label {
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    color: var(--text-secondary);
  }

  .ui-sound-studio__hint,
  .ui-sound-studio__reason {
    margin: 0;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
  }

  .ui-sound-studio__reason {
    min-height: var(--caption-line);
    overflow-wrap: anywhere;
  }

  .ui-sound-studio__text,
  .ui-sound-studio__input {
    padding: 3px var(--spacing-xs);
    font: inherit;
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    color: var(--text-primary);
    caret-color: var(--action-primary);
    background: var(--surface-base);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
  }

  .ui-sound-studio__input {
    padding: 3px var(--spacing-xs);
    font-variant-numeric: tabular-nums;
  }

  .ui-sound-studio__text {
    resize: vertical;
  }

  .ui-sound-studio__text::placeholder {
    color: var(--text-secondary);
  }

  .ui-sound-studio__text:focus-visible,
  .ui-sound-studio__input:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 0;
  }

  .ui-sound-studio__check {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--data-md-size);
    color: var(--text-primary);
    accent-color: var(--action-primary);
  }

  .ui-sound-studio__finer {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .ui-sound-studio__disclose {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    font-size: var(--data-md-size);
    color: var(--text-secondary);
    cursor: pointer;
  }

  .ui-sound-studio__disclose:hover {
    color: var(--text-primary);
  }

  .ui-sound-studio__disclose:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-sound-studio__go {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2xs);
  }

  .ui-sound-studio__generate {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: 3px 10px;
    border: 1px solid var(--action-primary-border);
    border-radius: var(--radius-sm);
    background: var(--action-primary);
    font: inherit;
    font-size: var(--data-md-size);
    font-weight: 600;
    color: var(--action-on-primary);
    cursor: pointer;
  }

  .ui-sound-studio__generate:hover:not(:disabled) {
    background: var(--action-primary-pressed);
  }

  .ui-sound-studio__generate:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-sound-studio__generate:disabled {
    background: var(--action-disabled);
    border-color: transparent;
    color: var(--action-on-disabled);
    cursor: default;
  }
</style>

<script>
  // The acquisition script, shown for the operator to run themselves.
  //
  // The settled decision this component exists to serve: WE DO NOT EXECUTE
  // ACQUISITION. The operator picks their package manager, we generate the
  // script, they read it and run it, and we re-probe afterwards to confirm.
  // Installing packages is a privileged, machine-wide act on a machine we do not
  // own, and a product that does it silently on first run has taken a decision
  // that was never offered.
  //
  // So THERE IS NO RUN BUTTON, and its absence is the design rather than a gap.
  // `onCopy` is the only action, because copying is the whole affordance: the
  // operator pastes it into a shell they control, where they can edit it first.
  // A future `onRun` is a product decision, not a missing prop.
  import Icon from './Icon.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [script] The generated shell, verbatim. Rendered exactly as given — this component never rewrites, reformats or "fixes" it, because the text on screen has to be the text that runs.
   * @property {string} [manager] The package manager it targets, e.g. `Homebrew`, `apt`, `dnf`, `pacman`, `zypper`. Shown so the operator can tell at a glance that we detected the right one.
   * @property {() => void} [onCopy] **Omit it and Copy renders disabled** rather than absent, the same contract `ServiceStatusList` uses for its row actions. Copy is also refused — regardless of this prop — when the script contains characters that would make the rendering lie; see `suspect`.
   * @property {string} [emptyLabel] Shown when there is no script, which is the good case: nothing to install.
   */

  /** @type {Props} */
  let {
    script = '',
    manager = '',
    onCopy = undefined,
    emptyLabel = 'Nothing to install — every requirement is satisfied.',
  } = $props()

  // TROJAN SOURCE (CVE-2021-42574) AND FRIENDS.
  //
  // Bidirectional override characters reorder text at RENDER time without
  // changing the bytes. A script can therefore display as one command and run as
  // another — the canonical demonstration renders a comment that is really an
  // executable statement. Zero-width characters are the quieter version: they
  // hide inside an identifier so a package name reads as one you trust.
  //
  // This pane's entire job is to let a human read a script before running it as
  // themselves. A rendering that can be made to lie defeats it completely, so
  // these characters are not a styling concern here — they are the threat.
  //
  // THE HANDLING, AND WHY IT IS NOT SANITISATION: we do not strip them. A
  // stripped script would display one thing and copy another, which is the same
  // defect wearing the opposite mask. Instead the characters are made VISIBLE as
  // their code points, and the copy action is REFUSED. khaosd generates this
  // script from a compiled-in package table, so a bidi control appearing in it
  // means something upstream is wrong; handing it to a shell is not the move.
  const SUSPECT = /[\u061C\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/

  const codePoint = (ch) => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`

  // Split into runs of safe text and individual suspect characters, so the
  // template can render each without `{@html}` — the escapes are markup we
  // control, and the script itself stays a text node that Svelte escapes.
  const segments = $derived.by(() => {
    const out = []
    let safe = ''
    for (const ch of script) {
      if (SUSPECT.test(ch)) {
        if (safe) { out.push({ text: safe, suspect: false }); safe = '' }
        out.push({ text: codePoint(ch), suspect: true })
      } else {
        safe += ch
      }
    }
    if (safe) out.push({ text: safe, suspect: false })
    return out
  })

  const suspectCount = $derived(segments.filter((s) => s.suspect).length)

  // Two separate reasons the button is off, and they are not interchangeable.
  // No `onCopy` means "not wired up here"; a suspect script means "we will not".
  const copyRefused = $derived(suspectCount > 0)
</script>

{#if script}
  <section class="script" aria-label="Install script">
    <header class="script__head">
      <span class="script__eyebrow">Run this yourself</span>
      {#if manager}
        <span class="script__manager">{manager}</span>
      {/if}
      <button
        type="button"
        class="script__copy"
        disabled={!onCopy || copyRefused}
        onclick={() => onCopy?.()}
      >
        <Icon name="copy" />
        Copy
      </button>
    </header>

    {#if copyRefused}
      <!-- Stated in full rather than as a generic error: an operator who cannot
           tell WHY a copy button is dead will paste the script out of the
           terminal transcript instead, which is the exact outcome this
           prevents. -->
      <p class="script__alarm" role="alert">
        <Icon name="warning-octagon" weight="fill" />
        This script contains {suspectCount}
        {suspectCount === 1 ? 'character' : 'characters'} that can change what it appears to say
        without changing what it does. Shown below as code points. Copying is disabled — report this
        rather than running it.
      </p>
    {/if}

    <pre class="script__body"><code>{#each segments as seg}{#if seg.suspect}<mark class="script__suspect">{seg.text}</mark>{:else}{seg.text}{/if}{/each}</code></pre>

    <p class="script__note">
      Read it before you run it. Khaos Machine never installs packages on your behalf.
    </p>
  </section>
{:else}
  <p class="script__empty">
    <Icon name="check-circle" />
    {emptyLabel}
  </p>
{/if}

<style>
  .script {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .script__head {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  /* `.eyebrow` is shipped in utilities.css, but this pane is also mounted by
     consumers that import the component alone, so the type is set here rather
     than depending on a stylesheet that may not be loaded. */
  .script__eyebrow {
    flex: 1;
    font-size: var(--caption-size);
    letter-spacing: var(--caption-track);
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .script__manager {
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }

  .script__copy {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-primary);
    font: inherit;
    font-size: var(--caption-size);
    cursor: pointer;
  }

  .script__copy:hover:not(:disabled) {
    background: color-mix(in oklab, var(--text-primary) 8%, transparent);
  }

  .script__copy:disabled {
    color: var(--action-on-disabled);
    border-color: color-mix(in oklab, var(--border-default) 60%, transparent);
    cursor: default;
  }

  .script__copy:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .script__alarm {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-xs);
    margin: 0;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    background: color-mix(in oklab, var(--tone-danger) 12%, transparent);
    color: var(--tone-danger);
    font-size: var(--caption-size);
  }

  /* `white-space: pre` and no wrapping: a shell line that soft-wraps mid-command
     reads as two commands. It scrolls instead. */
  .script__body {
    margin: 0;
    padding: var(--spacing-sm);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: color-mix(in oklab, var(--text-primary) 4%, transparent);
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: 1.6;
    color: var(--text-primary);
    overflow-x: auto;
  }

  /* Loud on purpose. This is the one thing on the pane that must not be
     mistaken for part of the script. */
  .script__suspect {
    padding: 0 3px;
    border-radius: 3px;
    background: var(--tone-danger);
    /* `--surface-base`, not `--action-on-primary`: that token is the text
       colour for the gold primary fill, and this fill is danger red. The kit
       ships no `--surface-default` — an unknown custom property resolves to
       nothing rather than erroring, so the marker would have rendered
       invisible on red. Caught by `token-refs`, not by a rendered test:
       jsdom resolves no stylesheets. */
    color: var(--surface-base);
    font-weight: 700;
  }

  .script__note {
    margin: 0;
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }

  .script__empty {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin: 0;
    padding: var(--spacing-sm);
    font-size: var(--body-md-size);
    color: var(--tone-success);
  }
</style>

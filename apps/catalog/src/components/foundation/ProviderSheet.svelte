<script>
  import ProviderBadge from '@khaos-machine/khaotik-ui/components/svelte/ProviderBadge.svelte'
  import { PROVIDER_MARKS, markFor } from '@khaos-machine/khaotik-ui/components/svelte/lib/provider-marks.js'
  import voices from '../../data/voices.json'

  // The provider marks the kit ships, on their own sheet rather than only inside
  // a component that happens to render one. Same shelf as KhaosLogo and for the
  // same reason: these are ARTIFACTS the kit ships, not views of it — Color,
  // Type and Tokens are each a predicate over the token parse; a logo is not a
  // predicate over anything.
  //
  // It shows BOTH halves, and the second is the point. A sheet of the eight
  // marks we have would answer "what do we ship" and leave "what does a voice
  // without one look like" to be discovered in a list somewhere. Six providers
  // in the live capture have no mark of their own, so the placeholder is the
  // common case and belongs on the sheet next to the marks, not below a fold.
  //
  // Providers come from the LIVE CAPTURE, not a hand-kept list. A hand-kept one
  // goes stale the first time khaosd serves a new provider, and this sheet would
  // then be confidently wrong about the thing it exists to report.
  // Keys are lowercased for matching, so rendering them raw printed `aws polly`
  // beside `AWS Polly` in the section below — the same provider spelled two ways
  // on one sheet. Where the capture knows a provider, its spelling wins; the
  // rest keep the key, which is all the kit has for them.
  // Reads BOTH spelling columns. It read only `.provider`, so the sheet that
  // exists to make "which providers have no mark" visible was blind to
  // `.providerId` — the column where `aws-polly`, `gcp-tts` and `gemini-tts`
  // were drawing placeholders, in the file imported at the top of this one.
  // An instrument that answers a question about a capture must read the whole
  // capture.
  const displayFor = (key) =>
    (voices ?? [])
      .flatMap((v) => [v?.provider, v?.providerId])
      .find((n) => n && n.toLowerCase() === key) ?? key

  // ONE CELL PER ARTWORK, not per key. Since #157 a mark answers to every
  // spelling khaosd uses for it — `polly` as the engine id, `aws polly` as the
  // voice catalogue's display name — so the table holds more keys than files and
  // a straight `Object.keys` printed the same logo twice. Worse than untidy:
  // both spellings resolve to the same display name, so the `{#each}` key
  // collided.
  //
  // Grouping on path data rather than on a declared alias list keeps this honest
  // — the module ships no record of which key is an alias of which, and reading
  // one out of the generator here would be a second copy of a fact.
  const byArtwork = new Map()
  for (const [key, mark] of Object.entries(PROVIDER_MARKS)) {
    const group = byArtwork.get(mark.d) ?? []
    group.push(key)
    byArtwork.set(mark.d, group)
  }

  // The spelling the capture knows wins, as before; the alternates are shown
  // because the duality is the thing worth seeing. A reader wiring a host needs
  // to know the mark answers to the engine id as well as the pretty name —
  // that was exactly the confusion #157 reported.
  const shipped = [...byArtwork.values()]
    .map((keys) => ({
      name: displayFor(keys.find((k) => displayFor(k) !== k) ?? keys[0]),
      spellings: [...keys].sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const fromCapture = [
    ...new Set((voices ?? []).map((v) => v?.provider).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b))

  // A provider counts as marked if ANY spelling of it resolves. Testing only the
  // display name would report a provider as marked while a host passing its
  // `providerId` still drew the placeholder — the sheet agreeing with the
  // defect instead of showing it.
  const idFor = (name) => voices?.find((v) => v?.provider === name)?.providerId
  const hasMark = (name) => !!(markFor(name) || (idFor(name) && markFor(idFor(name))))
  const marked = fromCapture.filter(hasMark)
  const unmarked = fromCapture.filter((p) => !hasMark(p))
</script>

<div class="psheet">
  <section>
    <h3 class="psheet__head">
      Marks the kit ships <span class="psheet__count">{shipped.length}</span>
    </h3>
    <p class="psheet__note">
      Each is a single path, normalised to <code>currentColor</code>, so one file
      serves light and dark. Sourced from the company's own brand page; none is
      traced or approximated.
    </p>
    <ul class="psheet__grid">
      {#each shipped as mark (mark.spellings[0])}
        <li class="psheet__cell">
          <ProviderBadge provider={mark.name} />
          {#if mark.spellings.length > 1}
            <!-- An {#each}, not a join into markup: Svelte escapes expression
                 output, so tags built inside braces render as literal text. -->
            <p class="psheet__spellings">
              also
              {#each mark.spellings.filter((sp) => sp !== mark.name.toLowerCase()) as sp (sp)}
                <code>{sp}</code>
              {/each}
            </p>
          {/if}
        </li>
      {/each}
    </ul>
  </section>

  <section>
    <h3 class="psheet__head">
      Providers with no mark <span class="psheet__count">{unmarked.length}</span>
    </h3>
    <p class="psheet__note">
      Open-source models with no brand mark of their own, or vendors publishing
      only a multi-colour illustration or a horizontal wordmark. They render the
      neutral placeholder rather than a substituted logo — a parent company's
      mark on a model would be substitution, not attribution.
    </p>
    <ul class="psheet__grid">
      {#each unmarked as name (name)}
        <li class="psheet__cell">
          <ProviderBadge provider={name} />
        </li>
      {/each}
    </ul>
  </section>

  <p class="psheet__foot">
    {marked.length} of {fromCapture.length} providers in the live voice capture
    have a mark. The list is read from that capture, so a provider khaosd starts
    serving appears here without anyone editing this sheet.
  </p>
</div>

<style>
  .psheet {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-md);
  }

  /* The WHOLE quad, not one field of it. `--caption-size` with a hand-set 600
     and a hand-typed 0.06em was half-converted and read as converted — and it
     omitted the leading entirely, which `normal` then decided. `label-sm` is
     this exact style: 12/16/600/0.06em. */
  .psheet__head {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-xs);
    margin: 0 0 var(--spacing-2xs);
    font-size: var(--label-sm-size);
    line-height: var(--label-sm-line);
    font-weight: var(--label-sm-weight);
    letter-spacing: var(--label-sm-track);
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .psheet__count {
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0;
    color: var(--text-secondary);
  }

  .psheet__note,
  .psheet__foot {
    margin: 0 0 var(--spacing-sm);
    max-width: 60ch;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
  }

  .psheet__foot {
    margin: 0;
    border-top: 1px solid var(--border-default);
    padding-top: var(--spacing-sm);
  }

  .psheet__grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* A COLUMN since #157 added the spellings line. The cell was a plain flex row,
     so the alternates rendered on the badge's baseline and pushed the next cell
     along — one run-on line reading "AWS Polly also polly Cartesia" instead of a
     grid. Align to the start so a cell with alternates and one without still
     line their badges up. */
  .psheet__cell {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  /* The alternate spellings a mark answers to. Quiet: it is reference detail for
     someone wiring a host, not part of reading the sheet. */
  .psheet__spellings {
    margin: 4px 0 0;
    /* The caption quad, whole. A raw rem here was caught by the type gate, which
       is the gate working: the scale is Andrew's register and a one-off size
       invented at a call site is the drift it exists to stop. */
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-weight: var(--caption-weight);
    letter-spacing: var(--caption-track);
    color: var(--text-secondary);
  }

  .psheet__spellings code {
    font-size: inherit;
    opacity: 0.85;
  }
</style>

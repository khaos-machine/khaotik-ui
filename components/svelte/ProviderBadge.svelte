<script>
  import ProviderMark from './ProviderMark.svelte'

  // The provider a voice or a capability is served by, as a chip: the brand's own
  // mark where the kit ships one, its name always.
  //
  // `qualityTier` still renders, as QUIET TEXT rather than the gold sparkle it
  // used to draw. Restoring the prop keeps every caller working — removing it
  // was a break for no gain, since the tier is a real fact a caller has and
  // wants shown.
  //
  // The sparkle was wrong three ways. `AGENTS.md`
  // reserves gold for the brand and primary actions, and a tier is neither — the
  // same shape as the hashed hue below, a decision taken outside the design
  // system. It marked 324 of the 371 voices in the live capture, so a
  // distinguishing mark distinguished nothing and the 47 without it read as
  // MISSING something rather than as standard. And a sparkle means nothing to a
  // reader who has not been told what it means.
  //
  // Text costs none of that: it is `--text-secondary`, it says which tier, and a
  // caller that passes nothing renders nothing.
  //
  // IT NO LONGER INVENTS A COLOUR. Every chip used to be tinted by
  // `providerHue()` — a djb2 hash of the provider's name, mod 360 — which gave
  // OpenAI, ElevenLabs and Cartesia arbitrary hues bearing no relation to any of
  // their brands. Two things were wrong with it beyond looking generated:
  //
  //   It bypassed the token system. Every other colour in this kit resolves from
  //   `tokens.json`, which D44/D49 make Andrew's register; this one generated raw
  //   `hsl()` at runtime, so a value no designer chose shipped in a design system.
  //
  //   The hue was decoration doing a job the text already does. The chip renders
  //   the provider's NAME — `elevenlabs` and `cartesia` were never told apart by
  //   their colour. Removing it costs no information.
  //
  // Measured 2026-09-23: 15 providers appear in the live voice capture and the
  // kit ships marks for three, so most chips render the placeholder glyph today.
  // That is the honest state — a real mark arrives when someone sources the
  // artwork, and nothing here invents one meanwhile.

  /**
   * @typedef {Object} Props
   * @property {string} [provider] Provider name. Rendered VERBATIM beside its mark, and — only when `providerId` is absent — matched case-insensitively against the marks the kit ships.
   * @property {string} [providerId] The engine's id for this provider, used to RESOLVE the mark. Absent falls back to `provider`, so every existing caller is unchanged.
   *
   *   **This exists because the label and the lookup key are not the same thing, and treating them as one produced the same defect four times.** khaosd serves a provider under several spellings — an engine id on `/api/v1/settings`, a display name in the voice catalogue, a `providerId` on each voice row, an analysis id on a prompt trace, and a `title` for a Settings pane. #157, #163, #165 and #178 were each one of those spellings arriving without artwork, and each was answered with another alias.
   *
   *   `title` is what broke the pattern: khaosd calls `openai` **"OpenAI Platform"**, which lowercases to a key no table will ever hold unless someone adds it by hand. A host wanting the pane to READ "OpenAI Platform" had to choose between the right label and the right mark.
   *
   *   So it stops being a spelling problem. Pass the id you already have and the label you want; the kit resolves one and prints the other, and a title khaosd invents next month needs no change here.
   * @property {''|'standard'|'premium'} [qualityTier] The tier, rendered as quiet text after the chip. VERBATIM and lowercased by CSS, not by code — `standard` and `premium` are the producer's words. Absent renders nothing. Worth knowing before deciding to pass it: the live capture is 324 `premium` to 47 `standard`, so showing it on every voice tells a reader very little.
   */

  /** @type {Props} */
  let { provider = '', providerId = '', qualityTier = '' } = $props()

  // Resolution lives in `ProviderMark` now; this component's job is the chip,
  // the name and the tier.
</script>

{#if provider || qualityTier}
  <span class="pbadge">
    {#if provider}
      <span class="pbadge__chip">
        <!-- The artwork is `ProviderMark`'s, extracted in #179 because this SVG
             was inlined here AND in the launcher's routing plate. The name is
             rendered right beside it, which is what lets the mark be
             `aria-hidden`. -->
        <ProviderMark {provider} {providerId} />{provider}
      </span>
    {/if}
    {#if qualityTier}<span class="pbadge__tier">{qualityTier}</span>{/if}
  </span>
{/if}

<style>
  .pbadge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  /* Tokens, not generated colour. The chip is a neutral surface and the mark
     carries the brand; nothing here picks a hue on a provider's behalf. */
  .pbadge__chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 1px 7px;
    border-radius: var(--radius-full);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    color: var(--text-secondary);
    background: color-mix(in oklab, var(--text-primary) 8%, transparent);
    border: 1px solid var(--border-default);
  }

  /* Quiet: the tier qualifies the voice, it does not announce it. No gold —
     `AGENTS.md` reserves that for the brand and primary actions, which is
     precisely what the sparkle this replaces was spending it on. */
  .pbadge__tier {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-transform: lowercase;
  }

</style>

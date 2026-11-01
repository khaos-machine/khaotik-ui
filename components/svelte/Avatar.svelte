<script module>
  /**
   * The first letters of the first two words of the name, else the email's
   * first letter, upper-cased.
   * @param {string} name
   * @param {string} email
   */
  export function initials(name, email) {
    const words = name.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w))
    const letters = words.length ? words.slice(0, 2).map((w) => [...w][0]) : [...email.trim()].slice(0, 1)
    return letters.join('').toUpperCase()
  }
</script>

<script>
  // Avatar — a person as a round avatar of their initials. There is no picture
  // of a person anywhere in Khaos Machine yet. Decorative: whatever holds it
  // carries the name.

  /**
   * @typedef {Object} Props
   * @property {string} [name] The person's name; its first two words give the initials.
   * @property {string} [email] Used for the initial when there is no name.
   * @property {number} [size] The diameter in pixels.
   */

  /** @type {Props} */
  let { name = '', email = '', size = 28 } = $props()
</script>

<span class="ui-avatar" style:--size="{size}px" aria-hidden="true">{initials(name, email)}</span>

<style>
  .ui-avatar {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    box-shadow: inset 0 0 0 var(--size-stroke-hairline) color-mix(in oklab, var(--gold-400) 45%, transparent);
    background: color-mix(in oklab, var(--gold-400) 18%, var(--surface-raised));
    color: var(--text-brand);
    font-size: calc(var(--size) * 0.4);
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0.02em;
    user-select: none;
  }
</style>

<script>
  // A label–value row (property-inspector pattern): the label sits in a fixed
  // column, the value aligns to the right of it. Chips wrap within the value.
  /**
   * @typedef {Object} Props
   * @property {string} [label] The field label, right-aligned in a fixed 128px column.
   * @property {import('svelte').Snippet} [children] The value, as slot content — text, or chips that wrap within the value column.
   */

  /** @type {Props} */
  let { label = '', children = undefined } = $props()
</script>

<!-- `dl`/`dt`/`dd`, because that is what this is. It rendered as
     `div`/`span`/`div`, which carries no relationship at all: a screen-reader
     user heard "Mood" and then "Skeptical" as two unrelated runs of text, and
     an inspector is a dozen of those in a column. The term/description pair is
     the one thing the component exists to express.

     ONE pair per list, rather than the whole inspector sharing a `dl`. The
     alternative — this component emitting a bare `dt` + `dd` fragment for a
     parent to wrap — would make it invalid anywhere except inside a `dl`, and
     its parents do not cooperate: a card's slot also takes prose and
     chips, and a catalog groups four of these in a plain div. A component
     that is only valid in one parent is a worse contract than a slightly
     verbose one. The cost is real and small: a screen reader announces a
     one-item list per row. -->
<dl class="labeled-field">
  <dt class="labeled-field__label">{label}</dt>
  <dd class="labeled-field__value">
    {@render children?.()}
  </dd>
</dl>

<style>
  .labeled-field {
    display: grid;
    grid-template-columns: 128px minmax(0, 1fr);
    gap: var(--spacing-md);
    align-items: baseline;
    /* UA default is `margin-block: 1em`, which would space every row apart and
       double up on the gap its parent already sets. */
    margin: 0;
  }

  .labeled-field__label {
    font-size: var(--caption-size);
    color: var(--text-tertiary);
    text-align: right;
  }

  .labeled-field__value {
    /* UA default is `margin-inline-start: 40px` on a `dd` — it would push every
       value out of the grid column the label was measured against. */
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--spacing-xs);
    min-width: 0;
    color: var(--text-secondary);
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
  }
</style>

<script>
  // A stand-in for an app window: three named panes, each rendered only when
  // the host supplies it. Used by FixtureView.test.js.
  let { table, detail, side } = $props()
</script>

<section data-region="table">{@render table?.()}</section>
<section data-region="detail">{@render detail?.()}</section>
<section data-region="side">{@render side?.()}</section>

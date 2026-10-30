# composed

Published composed documents — components, pages and flows authored in the
catalog's Compose mode and committed here as JSON.

**These are the artifact.** A composed component is not compiled into anything;
the file below *is* the component, and `Composed.svelte` is what renders one:

```svelte
<script>
  import * as kit from '@khaos-machine/khaotik-ui/components/svelte'
  import { Composed } from '@khaos-machine/khaotik-ui/components/svelte'
  import '@khaos-machine/khaotik-ui/components/svelte/lib/compose.css'
  import doc from '@khaos-machine/khaotik-ui/components/composed/scene-card.json'
</script>

<Composed document={doc} components={kit} data={{ scenes }} />
```

The three maps are the host's to supply, and that is the whole portability
story. A document says `{ $data: 'scenes' }`, meaning *the scenes collection* —
the catalog binds its captures, an app binds its own query, and the same file
renders both. A document that inlined rows would be a catalog file rather than a
component.

**Written by the editor, not by hand.** Publishing from Compose writes the file
through a dev-server plugin (`apps/catalog/vite.config.js`); a document edited
here by hand is still read, and `validate()` in the catalog reports what is wrong
with it rather than repairing it.

**Empty is a real state, and it is no longer this directory's.** `first-run.json`
is published — the repo's first flow (#60, D72), `readiness → launcher → dashboard`.

It remains true of the *composed component* documents this README describes: none
has been published, and that is a gap to fill rather than a shape to guess at.

The flow is also the exception to "written by the editor, not by hand" above. It
was hand-authored because a `kind: 'flow'` entry in `fixtures.js` reaches no
renderer in either mode, so a flow has nowhere else to live.

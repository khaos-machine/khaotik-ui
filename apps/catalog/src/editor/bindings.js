// Binding a prop value, in the catalog.
//
// The RULE lives in the library — `lib/compose.js` owns the three kinds a prop
// value may be (a scalar, a `$data` reference, a `$prop` reference) and how each
// resolves, because a consuming app resolves them too.
//
// What is catalog-specific is the DATA: `$data` names a collection, and the host
// says what that collection is. The catalog's answer is its captured `src/data`
// files; an app's answer is its own live query. That is the whole portability
// story — the document names the collection, never the rows.

import {
  resolveValue as resolveAgainst,
  resolveProps as resolvePropsAgainst,
  withDefaults,
} from '@khaos-machine/khaotik-ui/components/svelte/lib/compose.js'
import { dataMap } from './datasets.js'

export { withDefaults }

/** One prop value, resolved against the catalog's captures. */
export const resolveValue = (value, inputs = {}) =>
  resolveAgainst(value, { inputs, data: dataMap })

/** Every prop of a node, resolved against the catalog's captures. */
export const resolveProps = (props, inputs = {}) =>
  resolvePropsAgainst(props, { inputs, data: dataMap })

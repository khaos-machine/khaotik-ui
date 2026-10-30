// khaotik-ui#51 — the daemon's state vocabulary, checked the way a consumer
// checks it. This directory's tsconfig includes `*.ts`, so `check-consumer`'s
// tsc pass compiles this file against the shipped declarations.
import type { Service } from '@khaos-machine/khaotik-ui/components/svelte/lib/types.js'

// khaosd's five states — internal/localservices/manager.go:20-24. `stopping`
// is the one that had no name: folded to `running` it claims an engine is up
// while it is shutting down, folded to `stopped` it claims it is already down.
const stopping: Service = { id: 'a', name: 'A', state: 'stopping' }

// A state string newer than this client, carried verbatim rather than guessed
// at — the same refusal khaos-app's domain layer already makes.
const newer: Service = { id: 'a', name: 'A', state: 'future-state-we-have-not-shipped' }

// The tail widens `state`; it must not widen the shape. This proves the type
// still does work.
// @ts-expect-error `state` is required
const noState: Service = { id: 'a', name: 'A' }

// The two error-only fields (#43 gap 3) travel on the same type.
const errored: Service = {
  id: 'a',
  name: 'A',
  state: 'error',
  reason: 'a did not become healthy on port 8500 within 1m30s',
  log_path: '/Users/k/.khaos/logs/a.log',
}

export { stopping, newer, noState, errored }

# Memory

Durable facts learned while maintaining this repository that are not better
owned by another document.

## What belongs here

Add a dated entry only when the fact is durable, actionable, not already owned
by `AGENTS.md`, `RULES.md`, `TOOLS.md`, `WORKSPACE.md`, `SOUL.md`,
`IDENTITY.md`, or `docs/decisions.md`, and not readily recoverable from code or
git history. Put in-flight work in `CURRENT.md`. Explicit requests from K to
remember something always qualify.

Use this format, newest last:

```text
### YYYY-MM-DD — short title

The fact and why it matters.
```

## Entries

### 2026-09-05 — what a decomposition costs, measured on this one

Two things worth keeping from adopting the set, because both recur the next
time documents are split.

**A paragraph with no owner is deleted, not moved.** The draft's `CLAUDE.md`
rewrite removed its gate section on the premise the content had moved. Most
had. The paragraph naming jsdom — *jsdom resolves no stylesheets, so a rendered
assertion about styling passes whether the rule exists or not* — had no owner
among the seven new files; `grep -l jsdom` across them returned nothing. It is
the trap behind #116, filed the day before. **Check every paragraph lands
somewhere before removing the file it lived in.**

**A new file can break a citation that was previously unambiguous.**
`AGENTS.md` cited the workspace root's `RULES.md` by line. Adding a local
`RULES.md` made that resolve to a real 111-line file with no such line — the
citation got *worse* by landing somewhere, because the reader now finds a real
file instead of nothing. Cite a cross-repository document by **section name**,
not by line. `scripts/check-citations.mjs` was written for this.

**And that gate shipped vacuous on its first pass**, which is the more useful
half of the lesson. It checked exactly one citation in the repository and none
at all in the eight documents it was written for: a path that did not exist was
counted as *skipped* rather than as a gap — the exact branch the workspace
`RULES.md` line-citation arrived through — a line one past the end passed on an off-by-one, and a bare
`timeline.js:17-18` was silently dropped because only the repository root was
tried. **A gate written to catch a defect could not catch its own founding
case.** Measure a new gate against the defect that motivated it before trusting
its green.

**And a version written in prose goes stale faster than anyone expects.**
`AGENTS.md`'s "Published now" line has been wrong three times: catalog 0.15.0
against a draft, library 0.12.0 against 0.16.0, library 0.16.0 against 0.18.0 —
the last within hours of being corrected. Record the command, not the number.

### 2026-09-01 — root guidance became a modular document set

The repository's agent guidance was split by ownership. `AGENTS.md` governs and
carries a routing table naming what each file owns — it is not concise, because
it also holds the layout, conventions and release sections that have no other
owner. Policy lives in `RULES.md`, procedures in `TOOLS.md`,
paths in `WORKSPACE.md`, attribution in `IDENTITY.md`, and perishable state in
`CURRENT.md`. `CLAUDE.md` imports `@AGENTS.md` and holds only Claude-specific
information. The set is self-contained in this repository and does not depend
on a parent workspace document.

`apps/catalog/AGENTS.md` remains the authority for its subtree. Root guidance
routes to it instead of copying its detailed Svelte, Tauri, data, testing, and
release notes and allowing two versions to drift.

### 2026-09-22 — I diagnosed a cause from a peer's number without checking its provenance

khaos-app reported that the tag `lib-0.20.0` installs a package whose own
`package.json` says `0.19.0`. I measured our tags from the object database,
found them all correct, and concluded their lockfile must be resolving a stale
commit SHA — then told them so, and told them the consequence was that their
day's test results were run against the wrong version.

**The tags were correct. The lockfile was also correct. The consequence I drew
was false.** Measured from `khaos-app`'s own `origin/main`:

```text
package.json  "@khaos-machine/khaotik-ui": "…#lib-0.20.0"
lockfile      version  = 0.20.0
              resolved = …#3b6c06b97e89a586a427d7346491de8354c83db9   (= lib-0.20.0)
bumped in     e4c4769  2026-09-21  chore: bump @khaos-machine/khaotik-ui to lib-0.20.0
```

Their `0.19.0` came from a `node_modules` directory on their own machine
written three days before the lock moved — a scratch checkout they use for
greps, never for tests. Every result they reported had run in fresh worktrees
against `0.20.0`.

**The lesson is not about npm.** I verified the half of the claim that lived in
my repository, found it sound, and then reasoned about the half that did not.
Half a measurement plus an inference reads exactly like a whole measurement,
and I passed the conclusion back to the person who could have falsified it in
one command — along with a "you must re-run your tests" that would have cost
them a day. **When a peer reports a mismatch between their artifact and mine,
measure BOTH sides or name the unmeasured one as unmeasured.** Their repository
is on disk one directory over; there was no reason to infer anything.

**The mechanism I invoked is real, and is worth keeping on its own footing.**
`npm ci` installs the lockfile, not the ref in `package.json`, so a pin bumped
*without* re-resolving the lock gives a bumped pin, a green build, and the
previous release's code, with no error and no warning. It is not what happened
here, because the lock was re-resolved when the pin moved. If it is ever
suspected again, the command that answers it is the consumer's
`resolved` SHA, not their installed version:

```sh
git show origin/main:package-lock.json | grep -A2 'khaotik-ui'
```

**Its former companion defect is closed.** D75 §9 recorded that khaos-app
type-checked against a hand-written `vite-env.d.ts` shadowing our shipped
`.d.ts`. That shim was deleted in khaos-app#111, landed 2026-09-22; it had
outlived its stated expiry by five weeks and was hiding ten real type errors,
including a `durationMs` that is `number | null` on the wire against a prop
taking `number`. They now type-check against what we ship.

### 2026-09-22 — six instruments read clean by producing nothing, in one day

The recurring failure of this session was not any single defect. It was that
**absence of output kept being read as absence of problem**, by tooling and by
me, six times, and four of the six survived a first look.

| # | The instrument | What it said | What was true |
|---|---|---|---|
| 1 | `cmd \| jq > src/data/x.json` | exited, honest status | `>` truncated the fixture BEFORE the producer ran; data gone (#139) |
| 2 | a gate watcher I wrote | passed instantly, silent | `[...] \| first` on an empty array is `null`, not `""`; the guard was never true |
| 3 | "the run is stuck at 16 minutes" | reported as hung | it was 4 minutes in and passing; I estimated elapsed time instead of reading the clock |
| 4 | `grep '\|\| echo ""'` on merged `main` | "condition not merged" | it matched my own COMMENT describing the removed pattern |
| 5 | a khaos-manager CDN probe | zero hits, reported clean | the API call might have failed; zeros were indistinguishable until byte-counted |
| 6 | a grep for a retired tool's registration line | "STILL PRESENT" | matched the comment EXPLAINING the correction |

**What worked, every time: look at the line, not the count.** Cases 4 and 6
are the same trap — a fix that quotes the string it removes cannot be verified
by grepping for that string. Case 5 is the general form, and the remedy is a
**positive control**: print the byte count and a known-present marker beside
the zero, so "no matches" and "nothing was read" stop looking alike.

**The `>` case is this pattern wearing a shell's clothing**, and it is why
`write_json` asserts the FIXTURE still holds its original bytes rather than
asserting the command failed. Assert the artifact, not the invocation. The
same principle is why `scripts/release-lib.sh` re-reads the `latest` pointer
after publishing instead of trusting that it passed `--latest=false`, and why
`check-latest-release.mjs` exits 2 — never 0 — when it cannot read.

**Two of the six were caught by other people**, not by me: a peer refuted my
lockfile diagnosis, and K asked why I was working on a tool that is not part of Khaos. A
confident wrong answer does not feel different from a right one from the
inside, which is the argument for the reviewer dispatch and for routing
decisions rather than settling them.

### 2026-09-22 — a rule that lives only in prose is followed only by whoever reads it

`AGENTS.md` and `TOOLS.md` both carried the `--latest=false` rule, and the
pointer still came off the catalog six times. `TOOLS.md` even said why the rule
had to live in prose: the `lib-*` path had no script, unlike the catalog path,
which stopped having the problem at #103 by putting the assertion in
`release.sh`.

The general shape, worth applying before writing another careful paragraph:
**if a rule can be expressed as a script or a gate, prose is the wrong home for
it** — and a warning attached to a stale fact does not stop the fact being
read. `AGENTS.md`'s "Published now" line proved that twice over: the paragraph
directly beneath it said *do not read either number from this line* and listed
the commands, and the numbers went stale anyway, four times.

The fix for a fact in prose that no command answers is never a fresher fact.
It is the command — or a gate, when the thing being asserted is an artifact
someone else can change.

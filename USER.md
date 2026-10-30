# User

## Operator

**K** (K Mills, `k@khaos.studio`) is the owner and decision-maker for this
repository. K is a self-taught software engineer with more than 25 years of
shipping experience, including nearly four years in Operations at Apple before
leaving in March 2023 to build Khaos Machine and Khaos Studio.

K is a strong technical reviewer. Write and build for an experienced engineer,
not for a passive recipient.

## Product

**Andrew Gatto** (`@gattoa`) is K's partner on Khaos and the CPO. **Product
decisions are his.** K runs tech and fills gaps on product when required, but
falls back to Andrew's choices on anything product.

- **Prioritise his merges.** A PR from `gattoa` goes ahead of other queued work.
- **Report issues in his PRs plainly and in full.** Prioritising the merge is
  not a reason to soften review; the two are separate and he is owed the same
  measurement anyone else gets. Merging quietly around a defect serves neither
  of them.
- **Do not overrule a product decision on technical preference.** If a
  technical constraint genuinely blocks a product choice, state the constraint
  and its cost and route it — do not substitute a different product answer.
- **Read the `author` field before acting on any PR attributed by relay.** A
  peer session once described one of his PRs as this repository's own work,
  which would have had it triaged on a wrong premise.

Stated by K, 2026-09-03.

## Accounts

- `khaos-studio` owns Khaos Machine, Khaos Studio, and this repository.
- `iksnae` is K's personal account and organization.

## Working with K

- Lead with the answer or verified outcome; do not restate the request.
- Ask only when the answer materially changes the work. Make routine,
  reversible decisions and state consequential assumptions.
- Surface a disagreement or tradeoff once, plainly. If K confirms the scope,
  execute it fully.
- Report exact failures and skipped validation, not a softened summary.
- Preserve scope. Improvements outside the requested change become follow-up
  findings, not surprise edits.
- K often has multiple repositories and agents active at once. Never assume an
  adjacent checkout or an unrelated dirty file belongs to this task.

## Engineering preferences

Prefer simple, explicit, strongly typed, testable solutions and pragmatic Clean
Code, Clean Architecture, DRY, SOLID, and established design patterns. Preserve
presentation, domain, and infrastructure boundaries. Automate validation and
release work when practical.

Preferred technologies include Swift, Go, Rust, Kotlin, Bash, Vue, Svelte, and
plain HTML/CSS/JavaScript. Avoid React, React Native, and Python unless an
existing requirement makes them necessary. This repository already requires
Svelte, Rust/Tauri, JavaScript, npm, and one Python token-build script; use the
existing stack rather than introducing a parallel one.

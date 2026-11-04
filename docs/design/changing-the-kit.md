# Changing the kit

How a change to `@khaos-machine/khaotik-ui` goes from an idea to an app running
it, when an agent does the coding. Start at the [designer start page](README.md)
if you have not used the kit before.

Who does what: you (with your agent) brief, build and open the pull request.
The Khaos Machine Lead reviews and merges it, then cuts the release. You never
merge, tag or publish.

Each step below names its rule's home. Your agent should read that home rather
than this summary. In a clone of the kit, Claude Code and Codex both start from
[`AGENTS.md`](https://github.com/khaos-machine/khaotik-ui/blob/main/AGENTS.md),
which routes to the rest.

## 1. The brief

Say what should change and why, with the catalog page or a screenshot it
concerns. File it as a [GitHub issue](https://github.com/khaos-machine/khaotik-ui/issues)
so the pull request can point at it.

Before building, have your agent settle two things:

- **Where the change belongs**: a token, an atom, a composition or a screen.
  The [`design-iteration` skill](https://github.com/khaos-machine/khaotik-ui/blob/main/.claude/skills/design-iteration/SKILL.md)
  is the guide.
- **Whether it needs a decision.** A new design value (a colour, a size, a
  radius) needs a row in
  [`docs/decisions.md`](https://github.com/khaos-machine/khaotik-ui/blob/main/docs/decisions.md)
  first. See [`RULES.md`, "Design-system invariants"](https://github.com/khaos-machine/khaotik-ui/blob/main/RULES.md#design-system-invariants).

## 2. The catalog entry

Every component the kit exports has examples in the catalog, declared in
[`apps/catalog/src/fixtures.js`](https://github.com/khaos-machine/khaotik-ui/blob/main/apps/catalog/src/fixtures.js)
and filed under a section and group. A new component without one fails the
gates. A change to an existing one gets an example that shows the new state.

Examples use real captured story data, never invented values. The rules are in
[`apps/catalog/AGENTS.md`](https://github.com/khaos-machine/khaotik-ui/blob/main/apps/catalog/AGENTS.md),
"Real data", and [`RULES.md`, "Generated and captured files"](https://github.com/khaos-machine/khaotik-ui/blob/main/RULES.md#generated-and-captured-files).

Run the catalog locally (see the [start page](README.md#see-it-the-catalog))
and look at the change in both themes before going further.

## 3. The failing test first

The agent writes a test that describes the change and fails on the kit as it
is. Then it makes the change, and the test passes. Ask to see both runs: red
before, green after.

Tests live in the catalog's test suite. Some styling facts cannot be seen by a
rendered test and need a test that reads the source instead.
[`RULES.md`, "Testing and delivery"](https://github.com/khaos-machine/khaotik-ui/blob/main/RULES.md#testing-and-delivery)
explains both cases.

## 4. The pull request

`main` is protected: every change arrives by pull request, and the
`gates / gates` check must pass before it can merge. The agent:

- works on a `docs/`, `feature/`, `feat/` or `fix/` branch
  ([`RULES.md`, "Testing and delivery"](https://github.com/khaos-machine/khaotik-ui/blob/main/RULES.md#testing-and-delivery));
- bumps the version in `package.json` and adds a `CHANGELOG.md` entry in the
  same pull request
  ([`TOOLS.md`, "Release and publishing"](https://github.com/khaos-machine/khaotik-ui/blob/main/TOOLS.md#release-and-publishing));
- runs every gate locally first
  ([`TOOLS.md`, "Required validation"](https://github.com/khaos-machine/khaotik-ui/blob/main/TOOLS.md#required-validation));
- writes the pull request body and commits the way
  [`IDENTITY.md`](https://github.com/khaos-machine/khaotik-ui/blob/main/IDENTITY.md)
  sets out, with no agent attribution.

## 5. Review

The Khaos Machine Lead reviews the pull request. Expect questions about the
catalog examples and the tests as much as the component. If `main` moved while
the pull request waited, the gates run again before merge
([`AGENTS.md`, "Releases"](https://github.com/khaos-machine/khaotik-ui/blob/main/AGENTS.md#releases)).

## 6. The release

After merging, the Lead runs `scripts/release-lib.sh`. It pushes a `lib-*` tag,
and that tag publishes the new version to npm through
`.github/workflows/lib-publish.yml` and the catalog to GitHub Pages. The
procedure is in [`TOOLS.md`, "Release and publishing"](https://github.com/khaos-machine/khaotik-ui/blob/main/TOOLS.md#release-and-publishing).

## 7. The app picks it up

An app gets the change only when it moves its pin to the new exact version.
Ask the agent in that app to bump `@khaos-machine/khaotik-ui` to it and run the
app's own checks. Why the pin is exact, and what to read on upgrade:
[Using the library, §7](../using-the-library.md#7-versioning-reality).

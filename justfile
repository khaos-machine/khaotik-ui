
# ============================================================================
# Claude Code Commands
# ============================================================================

system_msg := justfile_directory() / "opus_system_message.md"

# Launch Claude: opus, medium effort, permissions skipped (usage: just cld [extra args...])
cld *args:
  claude --dangerously-skip-permissions --model opus --effort medium \
    --append-system-prompt-file {{quote(system_msg)}} {{args}}

# Claude setup with Opus model (full capabilities)
cld-super:
  claude --model opus --dangerously-skip-permissions --init

# Deterministic workspace setup (fast, CI-friendly)
cld-init:
  claude --model haiku --dangerously-skip-permissions --init

# Deterministic workspace maintenance
cld-maintain:
  claude --model haiku --dangerously-skip-permissions --maintenance

# Agentic workspace setup (with agent analysis)
cld-init-agent:
  claude --model haiku --dangerously-skip-permissions --init "/install"

# Agentic workspace setup (interactive)
cld-init-interactive:
  claude --model haiku --dangerously-skip-permissions --init "/install true"

# Agentic workspace maintenance
cld-maintain-agent:
  claude --model haiku --dangerously-skip-permissions --maintenance "/maintenance"

# ============================================================================
# OpenAI Codex Commands
# ============================================================================

# Codex setup with full autonomy (maximum capability)
cdx-super:
  codex --dangerously-bypass-approvals-and-sandbox

# Deterministic workspace setup (fast, CI-friendly)
cdx-init:
  codex --full-auto "/install"

# Deterministic workspace maintenance
cdx-maintain:
  codex --full-auto "/maintenance"

# Agentic workspace setup (with agent analysis)
cdx-init-agent:
  codex --full-auto "/install"

# Agentic workspace setup (interactive)
cdx-init-interactive:
  codex "/install true"

# Agentic workspace maintenance
cdx-maintain-agent:
  codex --full-auto "/maintenance"

# ============================================================================
# Project Navigation
# ============================================================================

# Open specific project (usage: just open tools)
# open project="":
#   #!/usr/bin/env bash
#   if [ -z "{{project}}" ]; then
#     echo "Usage: just open <project>"
#     echo "Available projects:"
#     ls -d khaos-* KSPD 2>/dev/null | sed 's/^/  /'
#     exit 1
#   fi
#   cd "{{project}}" && pwd

# ============================================================================
# Utility Commands
# ============================================================================

# List all justfile recipes
recipes:
  @just --list

# NO `help` RECIPE HERE, DELIBERATELY. There was one, and it was the
# khaos.machine WORKSPACE menu copied in wholesale: about fifty commands
# advertised, six real. Most of what it listed this file never had, and some
# of it the workspace itself has since dropped. A curated menu in a second
# file is a copy that drifts, so this file curates nothing — `just recipes`
# lists what actually exists, and the library's own interface (gates,
# catalog, tokens) is npm scripts documented in README.md and AGENTS.md, not
# recipes.

# g1

# 1. default pi
pi:
    pi

# 2. Pure focus pi: strip footer and status line entirely
ext-pure-focus:
    pi -e extensions/pure-focus.ts

# 3. Minimal pi: model name + 10-block context meter
ext-minimal:
    pi -e extensions/minimal.ts -e extensions/theme-cycler.ts

# 4. Cross-agent pi: load commands from .claude/, .gemini/, .codex/ dirs
ext-cross-agent:
    pi -e extensions/cross-agent.ts -e extensions/minimal.ts

# 5. Purpose gate pi: declare intent before working, persistent widget, focus the system prompt on the ONE PURPOSE for this agent
ext-purpose-gate:
    pi -e extensions/purpose-gate.ts -e extensions/minimal.ts

# 6. Customized footer pi: Tool counter, model, branch, cwd, cost, etc.
ext-tool-counter:
    pi -e extensions/tool-counter.ts

# 7. Tool counter widget: tool call counts in a below-editor widget
ext-tool-counter-widget:
    pi -e extensions/tool-counter-widget.ts -e extensions/minimal.ts

# 8. Subagent widget: /sub <task> with live streaming progress
ext-subagent-widget:
    pi -e extensions/subagent-widget.ts -e extensions/pure-focus.ts -e extensions/theme-cycler.ts

# 9. TillDone: task-driven discipline — define tasks before working
ext-tilldone:
    pi -e extensions/tilldone.ts -e extensions/theme-cycler.ts

#g2

# 10. Agent team: dispatcher orchestrator with team select and grid dashboard
ext-agent-team:
    pi -e extensions/agent-team.ts -e extensions/theme-cycler.ts

# 11. System select: /system to pick an agent persona as system prompt
ext-system-select:
    pi -e extensions/system-select.ts -e extensions/minimal.ts -e extensions/theme-cycler.ts

# 12. Launch with Damage-Control safety auditing
ext-damage-control:
    pi -e extensions/damage-control.ts -e extensions/minimal.ts -e extensions/theme-cycler.ts

# 13. Agent chain: sequential pipeline orchestrator
ext-agent-chain:
    pi -e extensions/agent-chain.ts -e extensions/theme-cycler.ts

#g3

# 14. Pi Pi: meta-agent that builds Pi agents with parallel expert research
ext-pi-pi:
    pi -e extensions/pi-pi.ts -e extensions/theme-cycler.ts

#ext

# 15. Session Replay: scrollable timeline overlay of session history (legit)
ext-session-replay:
    pi -e extensions/session-replay.ts -e extensions/minimal.ts

# 16. Theme cycler: Ctrl+X forward, Ctrl+Q backward, /theme picker
ext-theme-cycler:
    pi -e extensions/theme-cycler.ts -e extensions/minimal.ts

# utils

# Open pi with one or more stacked extensions in a new terminal: just open minimal tool-counter
open +exts:
    #!/usr/bin/env bash
    args=""
    for ext in {{exts}}; do
        args="$args -e extensions/$ext.ts"
    done
    cmd="cd '{{justfile_directory()}}' && pi$args"
    escaped="${cmd//\\/\\\\}"
    escaped="${escaped//\"/\\\"}"
    osascript -e "tell application \"Terminal\" to do script \"$escaped\""

# Open every extension in its own terminal window
all:
    just open pi
    just open pure-focus 
    just open minimal theme-cycler
    just open cross-agent minimal
    just open purpose-gate minimal
    just open tool-counter
    just open tool-counter-widget minimal
    just open subagent-widget pure-focus theme-cycler
    just open tilldone theme-cycler
    just open agent-team theme-cycler
    just open system-select minimal theme-cycler
    just open damage-control minimal theme-cycler
    just open agent-chain theme-cycler
    just open pi-pi theme-cycler


# Deterministic codebase setup
cldi:
  claude --model opus --effort medium --dangerously-skip-permissions

# Deterministic codebase maintenance
cldm:
  claude --model opus --dangerously-skip-permissions --maintenance

# Agentic codebase setup
cldii:
  claude --model opus --dangerously-skip-permissions --init "/install"

# Agentic codebase setup interactive
cldit:
  claude --model opus --dangerously-skip-permissions --init "/install true"

# Agentic codebase maintenance
cldmm:
  claude --model opus --dangerously-skip-permissions --maintenance "/maintenance"

# ============================================================================
# Library gates — the workspace fan-out's entry points (#58)
# ============================================================================
#
# These exist so `just build` and `just test` at the workspace root stop
# reporting `no 'build' recipe: khaotik-ui`. The fan-out reads `.gitmodules`
# and dispatches to each submodule's own recipe, so each repo keeps owning
# what its commands mean — these two are that ownership, not a wrapper around
# someone else's command.
#
# They are the ONLY curated recipes here. The note above still stands: this
# file advertises no menu, and `just recipes` lists what exists. The library's
# interface is still the npm scripts in README.md and AGENTS.md; these two
# dispatch to them rather than restating them.

# Writes `components/svelte/**/*.svelte.d.ts` from the components (D59).
# `just test` is what checks them for drift without writing.

# Generate the shipped TypeScript declarations
build:
  npm run build-types

# The four gates, the declaration check, and the catalog suite.
#
# The suite is here deliberately. AGENTS.md names it as part of this repo's
# testing expectation, and `check-coverage` does not run vitest — a `test`
# recipe that ran only the gates would report green over a failing suite,
# which is the shape of defect that let catalog-release.yml ship 0.9.0
# through 0.11.0 without running a single test.
#
# Each gate exits 0 clean, 1 on gaps, and 2 when it COULD NOT RUN. `just`
# fails a recipe on any non-zero, so a 2 surfaces as a failure — deliberate,
# not incidental: AGENTS.md is explicit that a 2 is a red, not a pass.

# Run the four gates, the declaration check, and the catalog suite
test:
  npm run check-coverage
  npm run check-types
  npm test --workspace apps/catalog

# Launch a dev agent in THIS repository (usage: just dev [extra args...])
#
# An alias for `cld`. It exists because `just` stops at the first justfile it
# finds walking up, so `just dev` run from inside this repo resolves here and
# never reaches the workspace root's dispatcher. Without it the command fails
# with a missing-recipe error that reads like a broken workspace rather than a
# recipe that lives one directory up.
#
# Launch a dev agent in THIS repository -- alias for cld
dev *args:
  @just cld {{args}}

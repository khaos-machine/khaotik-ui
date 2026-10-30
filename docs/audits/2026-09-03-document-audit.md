# Documentation audit: khaotik-ui

## Verified findings

- `README.md:29-35` says library 0.10.1 and catalog 0.15.0 and says `lib-*` creates no release.
- `AGENTS.md:100-108` says library 0.12.0 and catalog 0.16.0 with a published library release.
- Manifests are library 0.13.0 (`package.json:3`) and catalog 0.17.0 (`apps/catalog/src-tauri/tauri.conf.json:4`); khaos-app pins `lib-0.13.0`.
- README release semantics conflict with AGENTS/CHANGELOG's requirement that consumed library tags be GitHub Releases.
- Khaos App docs and recipes still mention Storybook although the catalog has replaced it.
- Planned modular root documents remain uncommitted.

## Acceptance criteria

- README, AGENTS, changelog, manifests, and release policy agree on current library/catalog versions.
- Library tag-versus-release semantics match the consumer contract.
- Storybook references are removed or historically qualified across producer and consumer docs.
- Modular documents are rebased against current state before landing.

---
created: 2026-09-15
last_updated: 2026-09-25
---

# Contributing

Install the pinned Bun dependencies and create the project Python virtual environment. Author changes in `src/skills`, then run `bun run skills:build` and `bun run validate`. Run `bun run test:install` for packaging changes. Tests must not submit transactions, use real signers, restart validators or require operator credentials.

Each skill's `instructions.md` has Agent Skills frontmatter: a matching lowercase name, a concise trigger description, MIT license, relevant environment requirements and string-valued metadata dates. The generated `skills/<name>/SKILL.md` is its public entrypoint. Keep essential constraints in the entrypoint and task-specific details in linked references. Local references must resolve inside an independently installed skill.

Share source code and procedures under `src/skills/shared`. The publication generator copies the needed components into each skill's own runtime. Update `runtime/package.json` and its lock when runtime dependencies change; root dependencies support development. Generated copies must match their source. Do not add install hooks, operator defaults or implicit production actions.

Review new source files and list them in `release-files.json`; `skills:build` maintains the generated-file entries. The release audit checks names, dates, links, selected secret patterns, exported paths and tracked files omitted from the allowlist. It supplements manual review rather than proving the absence of every secret. Keep credentials, keypairs, private host inventory and raw provider errors out of code, issues and public logs.

Use Conventional Commits and separate unrelated scopes. Preserve Markdown creation dates and update modification dates. Tests should verify observable behavior, failure boundaries and ambiguous results. Mutations need preflight checks before the first side effect; configuration and read-only requests never imply execution approval.

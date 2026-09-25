---
created: 2026-09-15
last_updated: 2026-09-25
---

# Release preparation

```bash
bun install --frozen-lockfile
python3 -m venv .venv
bun run skills:build
bun run validate
bun run test:install
bun tooling/release.ts --output /absolute/path/to/new-release-directory
```

Review the explicit release allowlist, source changes and generated skills. The exporter refuses an existing destination and symlinks, copies only allowlisted files and generates SHA-256 metadata. It excludes Git history, operator data, installed dependencies and environment files. Run the same validation and installation smoke check in the exported tree after installing its dependencies.

## Skills hub distribution

Publish the reviewed Git commit only when publication is requested. The public repository's `skills/<name>` directories are the installation units. Each includes its own local references, runtime dependency closure, lock and MIT license. Development sources use `instructions.md` rather than duplicate `SKILL.md` entrypoints, so discovery exposes only the generated skills.

The supported installer check is `bunx --bun skills@1.7.0 add <repository> --skill <name> --agent <agent>`. The project test installs every skill with copy mode into a temporary Codex project and exercises runtime entrypoints without operator credentials. Other hubs may copy the same folders; their listing/review policies remain separate.

[skills.sh](https://skills.sh/docs) derives its directory and rankings from the skills ecosystem and installation telemetry. There is no package publish command in this repository and no promise of immediate listing. Verification uses telemetry opt-out; do not generate installs just to inflate ranking. Check the public install command and current hub instructions after the approved commit is reachable.

Create a version tag or GitHub release only when requested. Check the current commit's CI, include the reviewed fixes and limitations, and attach the clean export if needed. Do not publish private operator history. A consumer can update its pinned submodule after the public commit is reachable; never push a consumer pin that collaborators cannot fetch.

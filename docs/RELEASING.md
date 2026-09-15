---
created: 2026-09-15
last_updated: 2026-09-15
---

# Preparing a clean release

The existing operator repository may contain private operational history. Export a new tree from an explicit file allowlist; do not push that history to a public remote.

```bash
bun run validate
bun tooling/release.ts --output /absolute/path/to/new-release-directory
```

The destination must not exist. The exporter audits the source allowlist, refuses symlinks, copies only the named files and writes SHA-256 values to `release-manifest.json`. It does not copy `.git`, operator inventory, configs, data, installed dependencies or private environment files. No publishing or remote visibility change occurs.

In the exported directory, run `bun install --frozen-lockfile`, `python3 -m venv .venv`, and `bun run validate`. Inspect the file list and contents manually, then review the hashes against the source artifact. Exercise first-use scenarios without credentials and read-only smoke checks with an explicitly configured environment when available. Never test a claim or restart simply to validate a release.

Check [readiness](OPEN_SOURCE_READINESS.md) for outstanding work. Only publish a reviewed clean tree after the operator requests publication. A new repository can be initialized inside that tree; this is separate from making the original repository public. Dependencies retain their own licenses, and upstream service/client changes may require subsequent maintenance.

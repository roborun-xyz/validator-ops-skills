---
created: 2026-09-15
last_updated: 2026-09-25
---

# Validation scope

`bun run validate` runs Bun regression tests, TypeScript checks, Python SFDP tests, generated-skill consistency checks and the release allowlist audit. The test command is the authority for current counts. Fixtures cover profiles, configuration isolation, RPC redaction, balances/approvals, transaction evidence, missing performance data, incomplete Votex scans, host failures and release export behavior.

`bun run test:install` uses the pinned skills CLI to discover and copy all published skills into an isolated temporary project. It installs each runtime's frozen dependencies, creates project Python environments as needed, runs shipped CLI help and checks onboarding status outside the source checkout. It does not alter global skills. Package/CLI installation needs network access; workflow verification needs no production credentials.

The generator validates Agent Skills names, descriptions, license, compatibility and metadata. Tests verify that document links and relative TypeScript imports resolve inside each installed skill and that onboarding's Python helper is present. The source and generated artifact sets must agree byte-for-byte, including executable bits.

Source files and skill distributions are included in an explicit release allowlist. The exporter refuses symlinks, traversal, selected private paths and recognized secret patterns; it validates local Markdown links/dates and writes SHA-256 metadata. A pattern scanner cannot establish the absence of every possible credential. Review the final diff and file list manually.

No live transaction, validator restart, identity handoff or real signer access is a release test. Offline tests and runbook checks do not certify production mutation behavior. Operators must verify the installed release, actual host role, supervisor, identities and compatible fresh towers for their authorized operation. Upstream APIs and clients can change.

Known dependency advisories and the inspected call paths are recorded in [dependency audit](DEPENDENCY_AUDIT.md). CI runs the same validation and installation checks on Linux; local development uses Bun 1.3.3 and a project Python environment.

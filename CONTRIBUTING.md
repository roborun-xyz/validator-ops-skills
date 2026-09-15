---
created: 2026-09-15
last_updated: 2026-09-15
---

# Contributing

Install the pinned Bun dependencies from the repository root and create a project Python virtual environment. Run `bun run validate` before proposing a change. Tests must not submit transactions, sign with real keys, restart validators, or require operator credentials. Network dependency installation precedes the fixture-based validation suite.

Keep skills focused on their user task. Put shared configuration and safety invariants in `.agents/skills/shared`; keep detailed onboarding in inventory references. New files must be explicitly reviewed and added to `release-files.json`. Run `bun run release:check` to catch missing release links, dates, known credential forms and private paths. This scanner complements manual review; it is not a comprehensive secret detector.

Use public fixtures, environment references for credentials, operator-owned paths, and explicit targets. An example must not select a real operator by default. Preserve Markdown `created` and update `last_updated`. Report UTC and local times for operational events.

Use Conventional Commits. Separate unrelated changes. Explain the concrete behavior change, meaningful tests, and remaining limits. For mutation code, test failure paths and ambiguous results; never infer approval from a profile, config file or read-only task. Release-specific command behavior needs primary-source or installed-CLI evidence.

Do not open an issue containing credentials, private key material, private host inventory or raw RPC URLs. Report a suspected vulnerability to the repository maintainer through a private channel when one is available; avoid posting exploit details publicly before coordination.

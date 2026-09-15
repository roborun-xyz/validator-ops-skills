---
created: 2026-09-15
last_updated: 2026-09-15
---

# Open-source readiness

The complete twelve-skill set has been adapted for other operators: staged onboarding, operator-owned configuration, explicit targets, local signer roles, generic upgrade runbooks, MIT licensing, pinned dependencies, contribution instructions and a clean release exporter are present.

See [validation](VALIDATION.md) for the requirement-by-requirement evidence, first-use scenarios and operational limits. The local gate is `bun run validate`; it covers 45 Bun tests, six Python tests, TypeScript and release-file checks. Run this gate again inside the final exported tree.

[Release preparation](RELEASING.md) creates a new directory from `release-files.json` and generates per-file SHA-256 metadata. Publish only that reviewed tree when publication is explicitly requested. Do not expose the original private repository, inventory, operational records or Git history.

The remaining production conditions are deliberate runtime preflight, not missing operator defaults: the operator supplies their identities, credentials, hosts, paths and signers; checks the installed client's supported commands/tower format; and authorizes specific mutations. No test transaction or failover is required merely to install or inspect this skill set.

This skills repository has a fresh Git history separate from the private operator repository. GitHub Actions validates pushes and pull requests; consult its current run status before releasing a new revision.

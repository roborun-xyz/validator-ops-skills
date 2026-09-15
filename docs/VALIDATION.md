---
created: 2026-09-15
last_updated: 2026-09-15
---

# Release acceptance and validation scope

The release includes all twelve original workflows, generic operator onboarding, MIT licensing, a reproducible dependency installation and a clean export process. This is a reviewed agent skill set, not an unattended fleet controller. Host mutations retain instance-specific preflight and operator authorization.

## Requirement evidence

| Requirement | Implementation and verification |
|---|---|
| Another operator can install | Root pinned Bun workspace, complete shared directory, README commands; independent exported-tree installation and `bun run validate` |
| First use requests necessary information only | Inventory routes chain profiles, SFDP pairs, hosts and local signer roles separately; no SSH/signers required for chain queries |
| Configuration persists without secrets | Onboarding subprocess test verifies mainnet, 0600 file, public fields, status, duplicate/wrong-network/missing-env failures and unchanged file on failure |
| Target selection is explicit | Shared resolver tests cover multiple/default/explicit profiles, invalid keys, inherited names, identity drift and existing zero-stake vote accounts |
| No private fleet default | Skills use operator-owned inventory; BAM alias parsing removed; SFDP reads local fleet JSON; release excludes original private inventory and history |
| Financial execution is gated | BAM requires explicit execution and exact allocation; Marinade requires approval fingerprint/ceiling and rechecks accounts, signers, simulation and balances. CLI negative tests reject missing execution intent and unknown options before signer use |
| Incorrect receipt is not accepted | Shared BAM account checks verify owner/discriminator/claimant/amount. Bond tests reject failed, unrelated, wrong-amount or missing-instruction transactions |
| Invalid modeling is visible | Votex model tests cover dilution/cost, bad bids, nonfinite/negative values and zero denominators. Output discloses mixed-time inputs and constant-match limitation |
| Host failure is retained | DoubleZero fake-SSH tests verify alias rejection before connection and aggregate failure; CLI calls are bounded |
| SFDP does not infer a pass from missing data | Python tests cover exact identity pairs, ambiguous records, malformed fleet, missing requirements/bounds and version comparisons |
| Upgrades remain usable across operators | Three runbooks share host onboarding and scoped lifecycle/rollback rules. No fixed host/user/compiler/path. Supported command/tower behavior must be established for the actual installed release |
| Release can be inspected | Explicit allowlist, symlink/traversal/private-path checks, local Markdown link/date checks and SHA-256 export metadata; exporter tests verify exclusion and refuse existing output |
| Maintenance is reproducible | Contribution/release docs, local combined validation gate and CI with pinned actions; no credentials required for fixture tests |

## First-use scenario review

These are manual instruction-flow reviews, supplemented by the linked code/tests where execution is applicable. They are not claims that a new agent was deployed against production.

| Skill | New-operator input and expected route | Failure boundary reviewed |
|---|---|---|
| inventory | Public vote/identity plus RPC environment name; then optional fleet/host/signer information only for the requested action | Missing/ambiguous fields are requested; credentials and key contents are never requested in chat |
| validator-performance | Profile or explicit public key; return epoch performance | Missing RPC/profile fails; unresolved historical identity requests vote account |
| validator-revenue | Same chain setup; root dependency install | Missing upstream evidence is reported/failed, not proof of receipt; allocation and claim are separate |
| jito-bam-boost | Profile for current validator or explicit historical identity | Query needs no signer; claim needs local matching signer, exact amount, clean pinned CLI and execution intent |
| marinade-bond-sweep | Explicit resolved public keys plus three local signer roles; pinned CLI prerequisite | Read-only preflight precedes execution; partial withdrawal/funding failure stops without automatic duplicate submission |
| sfdp-check | Mainnet/testnet identity pair; empty hosts permitted with API-only | No SSH needed for participation; API-only does not establish live version or health |
| doublezero-status | Explicit aliases or operator-owned verified inventory | No built-in fleet; invalid alias rejected before any connection; incomplete collection is not health |
| votex-status | Requested epoch/current shortcut and RPC when needed | Published data versus bounded transaction-scan fallback are distinguished; partial scan is not a complete history claim |
| votex-roi-sim | Explicit active Vault gauge, bids and optional assumptions | Bad inputs fail; estimates do not automatically authorize bids or assume uncapped SFDP matching |
| upgrade-agave | Selected backup, verified live role/layout and target release | A currently voting backup cannot be stopped under an unstaked-upgrade assumption |
| upgrade-testnet | Selected instance, target release, compatible admin tooling and leader coverage | Unknown next-epoch coverage is not a safe window; shared mainnet processes are not incidental stop targets |
| upgrade-mainnet | Verified compatible primary/backup for the same vote account | Demote, verify, copy fresh tower, require tower, promote; ambiguity stops before retry; backup stays voting during failed primary repair |

## Evidence collected

- Local automated suite: 45 Bun tests and six Python tests, TypeScript checks and release allowlist audit. Test files are shipped and can be rerun with `bun run validate`.
- All twelve skill manifests were validated with the skill-creation validator during development. Release Markdown dates and relative links are also checked by the shipped audit.
- Read-only mainnet onboarding, performance and revenue checks returned expected public-key/row structure after request-layer changes. SFDP API-only checks matched the existing two operator identity pairs and returned four requirements for each cluster.
- Votex ROI ran against a real active gauge and upstream data with explicitly supplied model fixture assumptions. This verified runtime integration, not the economic correctness of those assumptions.
- Local CLI help/version inspection covered validator-bonds 2.6.0 and Solana CLI 3.1.9; the installed package manifest confirms the Node >=20.18.0 prerequisite. Firedancer identity/configuration invariants were checked against its [CLI](https://docs.firedancer.io/api/cli.html) and [initialization documentation](https://docs.firedancer.io/guide/initializing.html).

## Limits retained in the product

No live transaction, validator restart, failover or signer access was performed as a release test. Unit/negative tests and runbook review are not production end-to-end mutation certification. A production operator must still verify their installed release, ledger/tower compatibility, supervisor, live role and authorized action.

The local installation checks ran on macOS with Bun 1.3.3; the Linux CI workflow runs the same validation gate on pushes and pull requests. Check the repository Actions page for the status of the current commit. Remote DoubleZero diagnostics target Linux with systemd/iproute2/GNU timeout. Public APIs can change or become unavailable; errors and source scope remain part of the output contract.

The credential scanner recognizes specific patterns; it does not prove the absence of every possible secret. Manual review and an explicit release allowlist complement it. The private repository's history has not been sanitized and must not be published as this release.

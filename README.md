---
created: 2026-03-11
last_updated: 2026-09-15
---

# Validator Operations Skills

Reusable agent skills for Solana validator monitoring, reward checks, bond funding, and supervised upgrades. Licensed under [MIT](LICENSE). Credentials, host layouts and signer paths belong to the operator and are not distributed as working defaults.

## Install and first use

Use Bun 1.3.3 and clone or unpack the complete skill repository. Keep `.agents/skills/shared` beside the individual skills; copying a single skill directory loses shared code and instructions. Open the repository in an agent that supports project skills.

```bash
git clone https://github.com/roborun-xyz/validator-ops-skills.git
cd validator-ops-skills
bun install --frozen-lockfile
bun run onboard --help
```

Configure `SOLANA_RPC_URL` in the **local execution environment** with your Helius mainnet URL. Do not paste its API key into chat, a tracked file or command output. Then replace the placeholder with your public vote account or validator identity:

```bash
bun run onboard add --profile my-validator --validator <VOTE_OR_IDENTITY> --rpc-env SOLANA_RPC_URL
bun run performance --profile my-validator
bun run revenue --profile my-validator
bun .agents/skills/jito-bam-boost/scripts/check.ts --profile my-validator
```

The inventory skill can guide this interaction: it requests only missing inputs, verifies the mainnet identity relationship, saves a local profile, and resumes the original query. Existing profiles are reused. Multiple profiles require an explicit selection unless a default was chosen. See [profile configuration](.agents/skills/inventory/references/profiles.md).

Profiles are stored at `~/.config/validator-ops/config.json` by default, outside the repository. They hold public keys and an environment-variable name, not RPC credentials or execution approvals. Chain queries do not require SSH or signer access.

## Available workflows

| Skill | Purpose | Additional setup |
|---|---|---|
| `inventory` | First use and operator configuration | Public keys; environment references |
| `validator-performance` | Epoch performance and current status | Mainnet profile/RPC |
| `validator-revenue` | Historical reward, fee and bond cost accounting | Mainnet profile/RPC |
| `jito-bam-boost` | Check allocations; explicitly approved claims | Local identity signer for claims; official CLI build tools |
| `marinade-bond-sweep` | Preflight and approved existing-bond funding | Local signers; Node >=20.18.0, Solana CLI and validator-bonds 2.6.0 |
| `sfdp-check` | Participation and required-version checks | Mainnet/testnet identity pair; optional SSH hosts |
| `doublezero-status` | Read-only host diagnostics | Explicit SSH aliases and installed DoubleZero |
| `votex-status` | Vote-buy status and on-chain fallback | Epoch and Helius RPC when chain lookup is needed |
| `votex-roi-sim` | Bid/ROI estimates with explicit assumptions | Gauge, RPC and model inputs |
| `upgrade-agave` | Upgrade an unstaked Agave backup | Verified host layout and current role |
| `upgrade-testnet` | Upgrade testnet Firedancer | Verified layout and leader maintenance window |
| `upgrade-mainnet` | Firedancer upgrade via Agave failover | Verified compatible primary/backup and fresh towers |

For SFDP, create the project virtual environment and follow [fleet onboarding](.agents/skills/inventory/references/fleet.md):

```bash
python3 -m venv .venv
.venv/bin/python .agents/skills/sfdp-check/scripts/check_sfdp.py --help
```

For upgrade layouts and local signer roles, follow [host onboarding](.agents/skills/inventory/references/hosts.md). There are no default host pairs, key paths, runtime users or supervisors. First-time host discovery and runbook preparation precede execution. Missing host or signer information does not block unrelated read-only queries.

## Operating boundaries

Use mainnet profiles only with Helius. Testnet and process-local RPC checks have explicit network/instance context. Read-only checks never authorize transactions or restarts. Mutation workflows require a concrete reviewed plan and authorization for its accounts, amounts or affected instances; they recheck state before acting.

The upgrade skills are agent-guided runbooks, not unattended upgrade scripts. Validate release-specific CLI behavior and the actual supervisor/layout before using them. Preserve single-instance voting and require the fresh tower from the just-demoted validator during failover. Never use production transactions as installation tests.

Historical figures and ROI estimates depend on upstream data availability and stated valuation assumptions. Report unavailable evidence rather than treating it as zero or a pass. Read each skill's limitations and failure-handling instructions before operating.

## Development

```bash
bun install --frozen-lockfile
bun test
bun run typecheck
python3 -m venv .venv
bun run test:python
```

Run `bun run validate` for the combined gate, including the release allowlist audit. See [release preparation](docs/RELEASING.md) and [contributing](CONTRIBUTING.md).

The automated tests use fixtures and mocked host calls; they do not submit transactions or restart validators. Python SFDP tooling uses only the standard library. Dependencies retain their own licenses.

Release preparation is tracked in [open-source readiness](docs/OPEN_SOURCE_READINESS.md). This repository starts from a clean skills-only history. Keep validator-specific inventory, configuration and operation records in a separate private repository; do not copy private history into this repository.

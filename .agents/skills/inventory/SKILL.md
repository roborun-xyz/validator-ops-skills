---
name: inventory
description: Set up first-use local Solana validator profiles and maintain host inventory. Use when a skill needs a validator target or RPC configuration, or when host roles, identities, paths, or failover relationships need onboarding or refresh.
metadata:
  created: 2026-05-27
  last_updated: 2026-09-15
---

# Validator Inventory

Use this skill to set up local validator profiles for first-time users and maintain host inventory for server operations.

## First-use onboarding: performance and revenue

Performance and revenue scripts use the shared resolver in `../shared/operator-config.ts`. They require a mainnet validator and Helius RPC; they do not require SSH or signer access. Read [profile configuration](references/profiles.md) for commands and the configuration format.

1. Run `bun .agents/skills/inventory/scripts/onboard.ts status` (pass the user's `--config` if supplied). Reuse existing profiles. If several exist without a default, ask which validator the current task concerns.
2. Ask only for missing information: vote account or identity, a short profile name, and the name of an environment variable containing the user's Helius RPC URL. Suggest `SOLANA_RPC_URL`. Do not ask the user to paste credentials or keys into chat; have them set the variable in the local runtime that executes the skill.
3. Run `onboard.ts add --profile NAME --validator PUBKEY --rpc-env ENV_NAME`. It validates the mainnet genesis and resolves the current vote/identity pair through read-only RPC before saving. Add `--default` only when the user has chosen that default; one profile is automatically selectable without a default.
4. Report the verified profile, then resume the original task with `--profile NAME`. Onboarding is not a reason to stop before completing the user's requested check.
5. If `PROFILE_CONFLICT` reports identity drift, explain the changed relationship, investigate it, then use `refresh` when the operator intends that update. Do not silently rewrite it during an ordinary check. Temporary CLI overrides never persist.

Missing credentials block only dependent RPC work. Missing SSH or signers does not block performance/revenue onboarding. Profiles store no execution approvals and do not replace live preflight for mutations.

## SFDP and host-check onboarding

Read [local fleet onboarding](references/fleet.md) for SFDP identity pairs and optional host checks. Validate the file before network calls and resume the requested check. No SSH is needed for participation-only checks.

## Upgrade hosts and local signers

Read [host and signer onboarding](references/hosts.md). Use the operator-selected `VALIDATOR_OPS_HOST_INVENTORY` or `~/.config/validator-ops/hosts.md`. Never default to the private fleet Markdown bundled in an existing operator checkout. Reuse an explicitly selected existing inventory after checking relevance and freshness. Host observations, chain profiles and local signer roles are separate evidence; none establishes the others or grants execution authorization.

## Workflow

1. Read the shared inventory only when the task depends on host layout.
2. Verify relevant facts through user confirmation or read-only SSH/RPC checks before changing them.
3. Ask only for facts that cannot be discovered safely.
4. Update current facts and the check timestamp; remove superseded detail instead of accumulating history.
5. Treat unknown or stale facts as blockers for destructive operations.

## Keep

- Active aliases and roles.
- Cluster, client/version, identity, vote account, RPC, config, ledger, accounts, key paths, and service/screen.
- Failover relationships and safety constraints.
- A short note for unreachable or retired aliases when it prevents misuse.

## Omit

- Private keys, seeds, passwords, API keys, SSH keys, and tokens.
- Full command logs, migration narratives, old hardware snapshots, and per-refresh changelogs.
- Superseded values already recoverable from Git history.

When updating Markdown, preserve `created` and set `last_updated` in frontmatter. Report UTC and local check time.

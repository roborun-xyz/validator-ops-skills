---
name: onboarding
description: Create, repair, or refresh local Solana validator profiles, Helius RPC environment references, and SFDP identity-pair configuration. Use for first setup, adding validators, or missing query configuration; host discovery and layout belong to inventory.
metadata:
  created: 2026-09-16
  last_updated: 2026-09-16
---

# Validator Onboarding

Read [installed bundle and configuration](../shared/runtime.md) before running commands. Resolve paths from this loaded SKILL.md, not the session working directory.

Own task configuration at any stage, including adding validators and repairing existing profiles. Reuse existing configuration and collect only what the requested task needs.

## Chain profiles and RPC configuration

Performance and revenue scripts use the shared resolver in `../shared/operator-config.ts`. They require a mainnet validator and Helius RPC; they do not require SSH or signer access. Read [profile configuration](references/profiles.md) for commands and the configuration format.

1. Run `bun .agents/skills/onboarding/scripts/onboard.ts status` (pass the user's `--config` if supplied). Inspect the resolved paths and per-file status for profiles, fleet and hosts; absent unrelated files do not block the requested workflow. Reuse existing profiles. If several exist without a default, ask which validator the current task concerns.
2. Ask only for missing information: vote account or identity, a short profile name, and the name of an environment variable containing the user's Helius RPC URL. Suggest `SOLANA_RPC_URL`. Do not ask the user to paste credentials or keys into chat; have them set the variable in the local runtime that executes the skill.
3. Run `onboard.ts add --profile NAME --validator PUBKEY --rpc-env ENV_NAME`. It validates the mainnet genesis and resolves the current vote/identity pair through read-only RPC before saving. Add `--default` only when the user has chosen that default; one profile is automatically selectable without a default.
4. Report the verified profile, then resume the original task with `--profile NAME`. Onboarding is not a reason to stop before completing the user's requested check.
5. If `PROFILE_CONFLICT` reports identity drift, explain the changed relationship, investigate it, then use `refresh` when the operator intends that update. Do not silently rewrite it during an ordinary check. Temporary CLI overrides never persist.

Missing credentials block only dependent RPC work. Missing SSH or signers does not block performance/revenue onboarding. Profiles store no execution approvals and do not replace live preflight for mutations.

## SFDP and host-check onboarding

Read [local fleet onboarding](references/fleet.md) for SFDP identity pairs and optional host checks. Validate the file before network calls and resume the requested check. No SSH is needed for participation-only checks.

## Host-dependent configuration

When the task needs host discovery, roles, paths, signer roles, or failover relationships, use [inventory](../inventory/SKILL.md) to establish those facts. For SFDP live checks, map only verified facts into the fleet schema; fleet entries do not replace host inventory. Missing host information blocks only dependent work. Resume the original task after configuration is complete.

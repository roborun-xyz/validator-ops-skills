---
name: validator-performance
description: Fetch Solana validator consensus performance by epoch, including vote credits and percent of max, rank, skip rate, block production, stake, commission, MEV commission, and current delinquency. Use for validator performance reviews; default to the last 30 completed mainnet epochs.
metadata:
  created: 2026-05-28
  last_updated: 2026-09-16
---

# Validator Performance

Read [installed bundle and configuration](../shared/runtime.md) before running commands. Resolve paths from this loaded SKILL.md, not the session working directory.

Run from the resolved bundle root:

```bash
bun .agents/skills/validator-performance/scripts/performance.ts \
  --vote-account <VOTE_ACCOUNT> \
  --epochs 30
```

Use `--validator <VOTE_OR_IDENTITY>` to resolve a current identity through Helius. Add `--include-current` only when in-progress data is requested. Output formats: `markdown`, `csv`, or `json`.

The helper uses the repository Helius mainnet RPC for current epoch/vote state and JPool/SVT for historical epoch metrics. Use the selected profile RPC environment reference, `SOLANA_RPC_URL`, or an explicit `--rpc` Helius URL. No credential is bundled.

Report current state, completed epoch range, per-epoch metrics, totals/averages, and any missing upstream rows. Use `validator-revenue` when the question is about SOL earned.

## Local profiles and first use

Pass `--profile NAME` and optionally `--config PATH` to reuse a verified local validator. Without an explicit account or profile, use the configured default or sole profile. Several profiles without a default require an explicit selection. `--vote-account` / `--validator` override the saved target for this run only; an explicitly selected profile still supplies its RPC environment reference.

If configuration or RPC credentials are missing, follow `../onboarding/SKILL.md` configuration setup or repair, ask only for missing fields, then resume the requested check. SSH and signing keys are unnecessary. `SOLANA_RPC_URL` remains supported for account-only commands; configure it locally rather than pasting API keys into chat. The resolver checks mainnet and the live vote/identity pair; an identity change in a saved profile requires an explicit profile refresh through onboarding. Explicit inputs must resolve to a unique active validator or an existing on-chain vote account. Existing zero-stake vote accounts are supported for historical queries; a retired identity without an active mapping requires its vote account.

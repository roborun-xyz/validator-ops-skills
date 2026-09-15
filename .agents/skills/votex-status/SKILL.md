---
name: votex-status
description: Fetch current or historical Votex/The Vault vote-buy status, including target epoch, USDC bids, bid share, acquired veV when published, and on-chain IncreaseVoteBuy fallback transactions. Use for Vault/Votex epoch and allocation questions.
metadata:
  created: 2026-05-31
  last_updated: 2026-09-15
---

# Votex Status

Set `SOLANA_RPC_URL` in the local runtime to your Helius mainnet URL. No RPC credential is bundled. Run `bun install --frozen-lockfile` from the repository root before first use.

Run from the repository root:

```bash
bun .agents/skills/votex-status/scripts/votex_status.ts <epoch|current>
```

Options: `--epoch-only`, `--json`, `--no-names`, and `--max-pages=N`.

For `current`, read the Vault gaugemeister; the active vote-buy target is `currentRewardsEpoch + 1`. Do not infer it from wall time.

Use VotaFi `tribeca-stats` first. On HTTP 404, scan the epoch window for matching on-chain `IncreaseVoteBuy` transactions. The fallback reports bids/share but cannot calculate acquired veV. No stats and no transactions is a valid zero-bid state.

Report source type, UTC/local epoch window, total bids, sorted rows, and whether veV is unavailable.

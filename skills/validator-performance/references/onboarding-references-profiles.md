---
created: 2026-09-15
last_updated: 2026-09-25
---

# Local operator profiles

Default location: `~/.config/validator-ops/config.json`. Override with `VALIDATOR_OPS_CONFIG` or `--config PATH` (highest priority). Configuration version 1 supports mainnet chain-only checks. It is independent of the existing Markdown host inventory.

RPC URLs remain in environment variables. Configure the variable in the same shell/runtime that runs Bun, without committing it to this repository. The mainnet endpoint must be HTTPS at `mainnet.helius-rpc.com`; the resolver also checks genesis. Saving a profile records the variable name, never its value. Files are written atomically with mode 0600. Do not run simultaneous profile updates against the same file.

```bash
# Inspect local setup without network access; prints public profile fields only.
bun src/skills/onboarding/scripts/onboard.ts status

# Verify and add a profile. No SSH or signing keys required.
bun src/skills/onboarding/scripts/onboard.ts add --profile mine --validator <PUBLIC_KEY> --rpc-env SOLANA_RPC_URL

# Intentionally refresh identity/RPC mapping; optionally choose the default.
bun src/skills/onboarding/scripts/onboard.ts refresh --profile mine --default

# Use a custom location, with a different RPC environment reference.
bun src/skills/onboarding/scripts/onboard.ts add --config /absolute/path/operator.json --profile other --validator <PUBLIC_KEY> --rpc-env OTHER_HELIUS_RPC
```

The public key may be a current vote account or identity. Mainnet `getVoteAccounts` resolves it to a unique pair, including delinquent validators. Unreachable RPC, wrong network or ambiguous/missing accounts prevents saving. Verification of a relationship is not a claim of healthy operation or SFDP eligibility.

Saved shape (illustrative public keys):

```json
{
  "version": 1,
  "defaultProfile": "mine",
  "profiles": {
    "mine": {
      "cluster": "mainnet-beta",
      "voteAccount": "REPLACE_WITH_VERIFIED_VOTE_ACCOUNT",
      "identity": "REPLACE_WITH_VERIFIED_IDENTITY",
      "rpcEnv": "SOLANA_RPC_URL",
      "verification": { "source": "helius-rpc", "checkedAt": "2026-09-15T00:00:00Z" }
    }
  }
}
```

The placeholder public keys must be replaced through onboarding; do not copy this example as a working profile.

The example timestamp is 2026-09-15 00:00 UTC / 08:00 Asia/Shanghai. Actual timestamps are produced by the verifier. Onboarding output includes UTC and the local runtime timezone (override with `LOCAL_TIME_ZONE`). A stored timestamp records the last add/refresh; scripts recheck the relationship rather than treating this as permanent verification.

Selection: explicit public key overrides saved target; `--profile` overrides default; a sole profile is auto-selected. An explicit profile with an explicit public key supplies RPC settings only, so querying another validator never rewrites the profile. Without a selected profile, explicit account commands use `SOLANA_RPC_URL` or `--rpc`. A malformed or explicitly missing config fails clearly instead of falling back to another operator's setup.

Errors are actionable: `ONBOARDING_REQUIRED` means missing target or RPC settings; `PROFILE_REQUIRED` means choose a profile; `PROFILE_CONFLICT` means a saved identity no longer matches the live vote account. Refresh only after resolving the change. No saved profile authorizes a transaction, SSH command or failover.

An existing zero-stake vote account can be resolved through finalized parsed account data when absent from `getVoteAccounts`. A retired identity without an active mapping requires its existing vote account for performance/revenue. BAM additionally accepts an explicit historical claimant identity.

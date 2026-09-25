---
created: 2026-09-25
last_updated: 2026-09-25
---

# Dependency audit

The reviewed lock contains `@solana/web3.js@1.98.4`, which depends on `jayson@4.3.0`. `bun audit --json` reports two moderate transitive advisories. Rerun the audit when updating dependencies; these notes are not a blanket waiver for new advisories or call paths.

| Dependency | Advisory scope | Inspected usage |
|---|---|---|
| stream-json 1.9.1 | [GHSA-528h-pc64-c93x](https://github.com/advisories/GHSA-528h-pc64-c93x): deep-input cost in pick/ignore/filter/replace | Jayson's utility code imports StreamValues and Verifier. The advisory explicitly excludes StreamValues. No affected path-filter call was found in this repository's code. |
| uuid 8.3.2 | [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq): caller-provided buffer bounds in v3/v5/v6 | Jayson's request generators use v4 without a caller-provided buffer. No affected v3/v5/v6 call was found in this repository's code. |

The inspection did not establish an exploitable path from these skills. The locked packages still contain affected code, so the raw audit remains nonzero. Do not force incompatible major dependency overrides merely to silence it; update through a compatible upstream release, recheck the runtime dependency graph and rerun installation/workflow regressions. Reassess this conclusion if the project starts using the affected APIs.

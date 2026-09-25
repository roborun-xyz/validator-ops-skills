---
created: 2026-09-16
last_updated: 2026-09-25
---

# Installed skill and operator configuration

This skill includes its runtime and referenced workflows. It works when copied alone by a skills hub; no sibling skill, Git checkout or private operator repository is required.

## Locate execution paths

Resolve symlinks on the absolute path of the loaded SKILL.md and use its containing directory as SKILL_DIR. The bundled runtime is at SKILL_DIR/scripts/runtime. Verify its package.json has name validator-ops-skills.

```bash
SKILL_DIR="$(dirname "$(realpath /absolute/installed/skill/SKILL.md)")"
BUNDLE_ROOT="$SKILL_DIR/scripts/runtime"
cd "$BUNDLE_ROOT"
bun install --frozen-lockfile
```

Run the relative commands in these instructions with the command tool's working directory set to BUNDLE_ROOT. The runtime contains the referenced src/skills scripts and shared code. Install dependencies only when a Bun command needs them. Python SFDP checks use the standard library: create a project environment with `python3 -m venv "$BUNDLE_ROOT/.venv"` and use `"$BUNDLE_ROOT/.venv/bin/python"`. Bash-only diagnostics do not need Bun or Python.

Resolve user-supplied relative input, output and configuration paths against the original session directory before changing working directory. Never choose configuration or credentials from an arbitrary cwd.

## Discover operator configuration

| Purpose | Default path | Environment override | CLI override |
|---|---|---|---|
| Mainnet profiles | `~/.config/validator-ops/config.json` | `VALIDATOR_OPS_CONFIG` | `--config` on profile-aware commands |
| SFDP identity pairs and optional production host checks | `~/.config/validator-ops/fleet.json` | `VALIDATOR_OPS_FLEET` | SFDP `--fleet`; onboarding status `--fleet` |
| Complete host/instance layout, including backups | `~/.config/validator-ops/hosts.md` | `VALIDATOR_OPS_HOST_INVENTORY` | Explicit operator-selected path; onboarding status `--hosts` |

Precedence is explicit CLI/operator path, then the corresponding environment variable, then the user-level default. `--hosts` on status inspects the file only; it does not persist the selection for later host operations. TypeScript and Python expand `~/`; prefer absolute paths for persistent overrides. Empty overrides are errors, not a request to select the current directory. Do not automatically discover project configs or choose another fleet when a selected file is missing or invalid.

Run onboarding's `onboard.ts status` to inspect all three resolved paths without network calls. It reports profile schema validity and whether referenced RPC variables are set, validates fleet with the SFDP schema when Python is available, and checks host Markdown readability/date fields. Status reports diagnostics even if files are missing or invalid; inspect its per-file statuses rather than treating exit code zero as readiness. No status result proves live identities, host health, backup readiness or permission to mutate.

Read only the configurations needed for the current task, reuse existing entries, and ask only for missing facts. Profiles do not need fleet or hosts. SFDP participation does not need SSH or host inventory. Upgrades require reviewed `hosts.md` plus live preflight; an SFDP fleet entry is insufficient.

Secrets belong in runtime environment variables or an operator-managed secret store. A `.env` in an arbitrary session directory is not a portable credential source: load an operator-designated file explicitly or supply the environment to the process, without printing values or copying it into the installed bundle. Configuration stores public identifiers and environment variable names, never credentials or execution approvals.

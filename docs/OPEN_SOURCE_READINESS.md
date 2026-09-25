---
created: 2026-09-15
last_updated: 2026-09-25
---

# Publication readiness

The repository contains fourteen skills with standard Agent Skills entrypoints, MIT licensing, explicit environment requirements and independently installable runtime/reference contents. Authoring source remains separate from generated publication files. Operator configuration and operational history are not required to install them.

Run the gates in [release preparation](RELEASING.md) against the intended commit and clean exported tree. [Validation scope](VALIDATION.md) describes what the tests establish and their production limits. [Dependency audit](DEPENDENCY_AUDIT.md) records known transitive advisories rather than treating an offline test pass as a clean dependency audit.

Publication to GitHub, creating tags/releases and a hub's decision to list a skill are separate from preparing compatible files. Do not claim that a skill is listed solely because local installation succeeded. Private consumers should pin a published, reviewed revision and retain their own records outside this public source.

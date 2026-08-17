# Deployment failure 32040675721

## Goal

Identify and fix the deployment failure in GitHub Actions run 32040675721.

## Plan

- [x] Capture run/job failure evidence from GitHub.
- [x] Inspect the matching workflow and deployment configuration locally.
- [x] Implement the smallest root-cause fix.
- [x] Run relevant local checks/build.
- [x] Summarize the patch and any remaining remote verification.

## Progress

- GitHub CLI authentication checked: both configured tokens are invalid.
- Falling back to the project-mandated `stealth_fetch` tool and connected GitHub API.
- Run evidence: `Test` failed; `Deploy` was skipped. Install, typecheck, and paper integrity passed.
- Root cause: six content commits after the previous successful deployment left stale tests and cross-artifact metadata.
- Verification: 56 Jest suites / 408 tests passed under Node 22.18.0 with `--runInBand`.
- Verification: typecheck, paper integrity, generated-artifact checks, glossary validation, and Cloudflare production build passed.

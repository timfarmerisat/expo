# Violet Forge release validation

Live application: https://violet-forge-1v1mkh.v2.appdeploy.ai/

Release label: `vf-hardening-2026-09-17`

## Automated merge gates

- [ ] Violet Forge validation workflow passes on the PR head.
- [ ] At least one reviewer approves the PR.
- [ ] The deployed AppDeploy snapshot is recorded with the Git commit SHA.
- [ ] Anonymous requests to readiness, bootstrap, and owner validation return 401.
- [ ] Authenticated readiness confirms database and storage.
- [ ] Two separate test accounts pass tenant-isolation tests.
- [ ] Upload allowlist, decoded-size limit, quota, deletion, and signed-link expiry are tested.
- [ ] Private-network and redirect SSRF cases are rejected.
- [ ] Rollback to the previous AppDeploy version is rehearsed.

## Provider states checked 2026-09-17

- AppDeploy: runtime verified.
- GitHub: repository admin access verified; workflow run pending.
- Google Drive: profile authenticated; file search remains limited by reauthorization loop.
- Gmail: Google account authenticates; Gmail service is not enabled.
- Google Calendar: Google account authenticates; Calendar account is not activated.
- Health: intentionally excluded from this non-medical deployment workflow.

A provider link is not proof of a live integration. Connected status requires a successful resource operation, scope evidence, timestamp, and recovery action.

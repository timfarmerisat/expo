# Violet AI / We-Talk Architecture Gap Register

This register converts architectural gaps into explicit work. It does **not** mark a capability complete until runtime evidence exists.

| Priority | Gap | Evidence observed | Upgrade |
|---|---|---|---|
| P0 | Competing status vocabularies | Violet Forge UI uses Ready/Limited/Setup Required while the registry uses the seven-state connection model | Adopt the canonical seven-state connection model plus separate confidence and release-light fields |
| P0 | Static system inventory | Forge contains a hard-coded deployment list while the connected account currently contains more deployed apps | Populate the registry from live connector/runtime inventory and cache with timestamps |
| P0 | Stale seeded evidence | Registry seed records contain fixed dates/versions that eventually display stale operational truth | Seed only identity/configuration; health and status must be derived from measured evidence |
| P0 | Local runtime not certified | Local master, bridge, interface, persistence, and restart have not all been validated together | Run preflight, backup, restart, persistence, auth, bridge, and restore gates before merge |
| P0 | Provider health can be simulated | Earlier local Microsoft driver returned a synthetic healthy result | Require actual provider handshake, scope verification, expiry/reconnect state, and receipt |
| P1 | Asset lineage is too thin | Existing asset models primarily carry prompt/path/url/createdAt | Use the asset manifest schema: checksum, version, source lineage, derivatives, approvals, accessibility, task/release links |
| P1 | No canonical role-permission matrix | 77 roles are cataloged but permissions are not represented as a reusable contract | Map each role to allowed read/write/execute/approve scopes and department boundaries |
| P1 | No unified event journal | Sister systems can update independently without a shared change receipt | Introduce immutable event IDs, correlation IDs, actor, source, object, action, timestamp, result |
| P1 | Observability is mostly page-level | Health exists in several components but there is no shared SLO/incident model | Add service health aggregation, latency/error-rate history, structured logs, trace/correlation IDs, incident and recovery receipts |
| P1 | Backup does not prove full restore | Database snapshots alone do not guarantee uploaded assets/files can be recovered | Treat database + object/files + configuration + checksums as one restore set and test into a separate destination |
| P1 | Local Bridge transfer ceiling | Current bridge intentionally limits individual transfers to 2 MB | Add chunked transfer, resume, checksum verification, quarantine, and conflict-safe file versioning |
| P1 | No shared design system contract | Multiple command centers use different layouts/status presentation | Use the high-definition interface contract for tokens, page anatomy, responsive behavior, charts, evidence labels, and progressive disclosure |
| P2 | No package/SBOM/signing receipt | Build provenance stops at code/test/runtime evidence | Add dependency lock validation, SBOM, artifact checksum/signature, release manifest and rollback binding |
| P2 | No conflict-aware offline sync contract | Local-first architecture needs deterministic merge behavior | Add per-record version, updatedAt, actor, source device, tombstone, conflict state and explicit operator resolution |
| P2 | Intelligence router lacks explicit quality policy | Multiple local/cloud models can be used but task selection and evaluation are not standardized | Add capability-aware model routing, tool permissions, source grounding, evaluator checks, budget/latency policy and fallback order |

## Completion policy

A gap moves to **Verified** only when its implementation has a current evidence receipt. Documentation, screenshots, static labels, or a successful build alone are insufficient.

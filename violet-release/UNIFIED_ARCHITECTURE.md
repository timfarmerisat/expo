# Violet AI / We-Talk Unified Release Architecture

## Release principle

The production line must be evidence-based: **Git commit -> tests -> packaged artifact -> local runtime -> health -> auth/authorization -> storage persistence -> backup/restore -> deployment receipt**.

PR #2 (Violet Forge) and PR #3 (Local Bridge) stay unmerged until a verified backup exists and the independent local release passes the gate.

## One command surface

Chat is the primary control surface. Every action resolves to one of these states:

Request received -> Understanding -> Planning -> Awaiting Approval -> Executing -> Verifying -> Reporting -> Ready.

No UI may display Connected, Healthy, Online, 100%, or Verified unless it is backed by a current measured check.

## System planes

### Experience plane
Chat-first command surface, high-definition dashboard, mobile quick actions, department pages, voice/live collaboration, assets, evidence, approvals and administration.

### Intelligence plane
Intent routing, context retrieval, planning, tool selection, model selection, execution, verification, evidence recording and reporting. See `INTELLIGENCE_UPGRADE.md`.

### Domain plane
The 11 departments and 77 specialist role profiles defined in `specs/department-registry.json`.

### Integration plane
GitHub, Drive, communications, providers, deployed services, databases, storage and Local Bridge all use one connection-state and evidence contract.

### Data plane
Operational database, files/object storage, search indexes, audit/event journal, evidence records, asset manifests, backups and release receipts.

### Reliability plane
Health aggregation, diagnostics, correlation IDs, incidents, recovery actions, backup/restore, release gates and rollback.

## Shared department page contract

Every department receives its own page but uses one shared data model:

- status light: Green / Yellow / Red
- department purpose and owner
- active tasks and dependencies
- approvals waiting
- assets/files with version + checksum
- connected services and permission state
- chat context and specialist roles
- evidence/source traceability
- recent activity and audit receipts
- blockers, recovery action, and next milestone

### Departments

1. Command & Strategy
2. Research & Intelligence
3. Engineering & Development
4. Creative & Design
5. Content & Media
6. Business & Finance
7. Marketing & Growth
8. Health & Wellness
9. Operations & Management
10. Communications & Media
11. Security & Privacy

System-wide pages: Overview, Chat, Connections, Assets, Evidence, Approvals, Release/QA, Administration.

The complete role/page registry is in `specs/department-registry.json`.

## Connection state model

Disconnected | Permission Required | Connecting | Connected | Limited | Syncing | Error

Connection state is separate from evidence confidence:

Verified | Supported | Stale | Conflicting | Unknown

Each connector must expose: provider, account label, granted scopes, last successful check, last failure, expiry/rotation metadata when applicable, and Reconnect / Why unavailable actions.

The portable registry contract is defined in `specs/system-registry.schema.json`.

## Asset and graphics architecture

Every production image, video, audio, document, model, chart, code package or archive becomes a versioned asset record with:

- source lineage
- SHA-256 or equivalent checksum
- MIME/type and dimensions
- responsive/HD derivatives
- accessibility metadata
- department/task/release relationships
- approval state
- lifecycle/version history
- evidence links

The canonical contract is `specs/asset-manifest.schema.json`; the display and graphics rules are in `HIGH_DEFINITION_INTERFACE.md`.

## Intelligence model

The assistant may use local models and approved cloud providers through adapters. Provider output is not itself evidence. Claims that affect operations, security, finance, health, or release state require source/evidence records.

Operational state must never come from conversational memory alone. It must come from current registry/runtime evidence.


## Assistant, service and action catalog

The pre-install architecture includes a department-aware assistant and service catalog in `specs/assistant-service-catalog.json`.

It distinguishes four separate questions for every capability:

1. Is the capability available?
2. Is the plugin/tool installed?
3. Is the account/service connected and authorized?
4. Has the capability been verified by current evidence?

The interface must never collapse those into one green state.

Every visible operational button follows `specs/action-contract.schema.json` and the no-dead-end rules in `NO_DEAD_ENDS_NAVIGATION.md`.

The action model requires a destination, permission, confirmation level, expected result, next step, unavailable explanation and recovery action. The initial reusable actions are defined in `specs/action-catalog.json`.

Communication options are defined in `specs/communication-channels.json` so chat, live room, voice, email, calendar, team messaging, notifications, file handoff and Local Bridge can each show their real availability and fallback behavior.

## Event and evidence fabric

Every important state change should carry:

- event/receipt ID
- correlation ID
- actor
- source system
- target object
- action
- before/after state when applicable
- timestamp
- result
- evidence/source references
- approval reference when required

This allows chat -> task -> tool -> file -> deployment -> release to be reconstructed without guessing.

## Offline/local-first synchronization

Records intended for local/offline work should support:

- stable ID
- version
- updatedAt
- actor/source device
- tombstone for deletions
- checksum for files
- conflict state
- explicit operator resolution when automatic merge is unsafe

No sync engine should silently overwrite conflicting authoritative records.

## Observability and recovery

The system should aggregate:

- service health
- latency
- error rate
- data freshness
- queue/backlog state
- auth/provider failures
- storage pressure
- backup age
- restore status
- incident/recovery receipts

Self-heal actions are allowed only when pre-approved, reversible, and recorded. Destructive repair is never automatic.

## Release gates

A release is Green only when all are true:

1. Canonical repository and commit SHA recorded.
2. One documented installation/bootstrap command succeeds on the target machine.
3. Automated tests pass.
4. Health endpoints pass after a clean restart.
5. Real storage persists after restart.
6. AuthN and AuthZ negative/positive tests pass.
7. External provider permissions are measured, not simulated.
8. Uploaded files and databases have a tested restore.
9. Local Bridge pairing and command approval boundaries pass.
10. Package checksum, runtime measurements, deployment version, and rollback point are recorded.

A structured receipt for these gates is defined in `specs/release-receipt.schema.json`.

## Architecture validation

`scripts/validate_specs.py` verifies the department count, unique 77-role catalog, canonical connection-state contract, and basic JSON-schema integrity.

The GitHub workflow `.github/workflows/violet-release-hardening.yml` validates:

- preflight shell syntax
- backup shell syntax
- Microsoft connector Python syntax
- architecture specification Python syntax
- department/role contract integrity

## Current integration rule

Do not shut down hosted systems, delete duplicates, or merge PR #2/#3 solely because a UI appears healthy. Hosted systems remain migration/rollback sources until the independent local release passes the gate.

See `ARCHITECTURE_GAP_REGISTER.md` for the prioritized remaining work.

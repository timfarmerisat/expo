# Violet AI / We-Talk Unified Release Architecture

## Release principle

The production line must be evidence-based: **Git commit -> tests -> packaged artifact -> local runtime -> health -> auth/authorization -> storage persistence -> backup/restore -> deployment receipt**.

PR #2 (Violet Forge) and PR #3 (Local Bridge) stay unmerged until a verified backup exists and the independent local release passes the gate.

## One command surface

Chat is the primary control surface. Every action resolves to one of these states:

Request received -> Understanding -> Planning -> Awaiting Approval -> Executing -> Verifying -> Reporting -> Ready.

No UI may display Connected, Healthy, Online, 100%, or Verified unless it is backed by a current measured check.

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

## Connection state model

Disconnected | Permission Required | Connecting | Connected | Limited | Syncing | Error

Each connector must expose: provider, account label, granted scopes, last successful check, last failure, expiry/rotation metadata when applicable, and Reconnect / Why unavailable actions.

## Intelligence model

The assistant may use local models and approved cloud providers through adapters. Provider output is not itself evidence. Claims that affect operations, security, finance, health, or release state require source/evidence records.

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

## Current integration rule

Do not shut down hosted systems, delete duplicates, or merge PR #2/#3 solely because a UI appears healthy. Hosted systems remain migration/rollback sources until the independent local release passes the gate.

# Violet No-Dead-Ends Navigation & Action Standard

## Purpose

The interface may expose many capabilities, but every visible control must produce a useful result or an explicit recovery path. Decorative buttons, silent failures, ambiguous disabled states and links that lead nowhere are prohibited.

## Button anatomy

Every button/action must declare:

- label and short purpose
- destination/action type
- required permission
- required connector/service, when any
- confirmation level
- expected success result
- evidence requirement
- unavailable message
- recovery action
- next action after success

The machine-readable contract is `specs/action-contract.schema.json`.

## Display hierarchy

Do not place every capability at the same visual level.

### Level 1 — primary action bar
Maximum six high-frequency actions for the current department.

### Level 2 — contextual actions
Six or fewer secondary actions relevant to the selected item/task/status.

### Level 3 — tool drawer
Less-frequent specialist tools, connectors, exports and administration.

### Level 4 — command palette
Searchable access to all permitted actions using keyboard or chat.

This preserves capability depth without producing button overload.

## Required unavailable behavior

A button may be shown when a capability is not ready only if the UI explains why.

Examples:

- **Connect Slack** — “Slack is available but not connected.” -> Connect
- **Retry Microsoft** — “Permission expired.” -> Reconnect / Why unavailable
- **Run Local Command** — “Local Bridge is disconnected.” -> Pair computer
- **Publish** — “Approval required.” -> Request approval
- **Open Asset** — “Source file unavailable.” -> Locate source / show lineage

Never show a spinner indefinitely. Every async action must terminate as success, error, cancelled or retryable.

## Status-aware actions

When a status card reports:

- **Green** -> show View evidence / Open / Continue
- **Yellow** -> show Why limited / Fix / Reconnect / Verify
- **Red** -> show Diagnose / Recovery / Create incident
- **Unknown** -> show Check now

## Task channels

Every task should offer:

- Accept
- Assign
- Start
- Request info
- Block
- Send for approval
- Complete
- Verify
- Reopen
- Archive

Task state changes must create an audit/event receipt.

## Suggested-next-step rail

Every major page should show 1–3 ranked next actions based on:

- current blockers
- overdue approvals
- failed connections
- stale evidence
- incomplete release gates
- user-selected objective

Recommendations are suggestions, not automatic execution.

## Direct links

External links must be stored in the system/service registry, not hard-coded in multiple components. Before display, the system should label the destination and whether it is:

- verified internal route
- verified external destination
- provider console
- documentation
- setup/recovery link

## Accessibility and navigation

- keyboard reachable
- visible focus state
- icon + label for operational controls
- minimum comfortable touch target
- screen-reader name
- status not encoded by color alone
- back/breadcrumb path on every nested page
- search/command palette available globally

## Acceptance criteria

A UI build fails QA if any visible button:

1. has no handler/destination,
2. silently does nothing,
3. requires a missing connection but does not explain/recover,
4. implies an action succeeded without a receipt,
5. opens a placeholder destination without labeling it,
6. bypasses required approval,
7. has no accessible name.

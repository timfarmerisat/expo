# Violet Intelligence & Automation Upgrade

## Objective

Turn the system from a collection of AI-enabled pages into one governed intelligence fabric.

## Intelligence plane

1. **Intent router** — classifies the user objective and selects department/capability.
2. **Context builder** — retrieves only permitted project, file, task, evidence and conversation context.
3. **Planner** — creates steps, dependencies, approval points and expected evidence.
4. **Tool router** — selects local or connected tools based on capability and permission.
5. **Model router** — chooses local/cloud model based on task, sensitivity, latency, cost and availability.
6. **Executor** — runs only approved operations.
7. **Verifier** — checks output, persistence, runtime result and source grounding.
8. **Evidence recorder** — binds actions to source, actor, timestamp, commit/task/release where applicable.
9. **Reporter** — summarizes outcome, exceptions, next action and recovery path.

## Smart-brain quality policy

The system should prefer:

- deterministic tools for deterministic facts
- current provider/runtime checks for connection state
- source-backed retrieval for factual claims
- local models for offline/private work when quality is sufficient
- approved cloud intelligence for higher-capability reasoning when permitted
- evaluator/validation passes before high-impact outputs are treated as complete
- explicit uncertainty rather than synthetic certainty

## Memory architecture

Separate memory into:

- session context
- project memory
- durable knowledge/evidence
- user preferences
- operational state
- audit history

Operational state must not be inferred from conversational memory. It must come from the registry/runtime.

## Role permissions

Each of the 77 role profiles should declare:

- departments
- readable resource classes
- writable resource classes
- executable tools
- approval authority
- external-send authority
- sensitive-data restrictions
- allowed automation level

A role label alone grants no permission.

## Automation safety

Automations must have:

- owner
- schedule/trigger
- input scope
- allowed actions
- retry policy
- idempotency key
- timeout
- failure destination
- approval requirement
- last successful receipt
- disable switch

## Recommended advanced additions

- capability graph across tools, roles, departments and providers
- semantic + keyword hybrid search with citations
- change-event bus for sister-system synchronization
- correlation IDs across chat -> task -> tool -> deployment -> evidence
- self-heal playbooks limited to pre-approved reversible actions
- anomaly detection on service health and data freshness
- policy-aware fallback between local and cloud models
- structured experiment registry for product/growth changes
- data-quality checks before analytics/revenue claims

# Violet High-Definition Interface & Graphics Contract

## Goal

Create one coherent visual operating environment across Violet AI, We-Talk, Legend, Forge, Local Bridge and future department pages. The interface should be dense enough for expert operations but use progressive disclosure so it remains readable on laptop, tablet and phone.

## Core layout

- **Primary control:** persistent chat/command surface.
- **Global rail:** Overview, Chat, Departments, Connections, Assets, Evidence, Approvals, Release/QA, Administration.
- **Department pages:** same anatomy and data contract; different domain content.
- **Right context rail:** current evidence, recommendations, next action and recovery.
- **Status bar:** current release light, local/hosted mode, active account context, last verified time.
- **Responsive:** one-column mobile, two-zone tablet, 12-column desktop, wide-screen expansion without stretching readable text.

## Visual truth rules

1. Green means a current measured success, never a design placeholder.
2. Yellow means limited, permission-required, stale, partial, or unverified.
3. Red means failed, blocked, disconnected, or unsafe to continue.
4. Every operational metric must expose its source and observed timestamp.
5. Sample/demo data must be visibly labeled and never mixed with actual financial or health data.
6. A screenshot can be a design reference or evidence artifact, but not live health proof.

## Shared page anatomy

Each department page contains:

1. Department identity, purpose, owner and status.
2. Chat context scoped to that department.
3. Live work queue: active, blocked, awaiting approval, completed.
4. Connections and permission state.
5. Asset/media library with approval and lineage.
6. Evidence/source panel.
7. Metrics with source timestamps.
8. Activity/audit timeline.
9. Blockers and recovery actions.
10. Next milestone and release impact.

## Design tokens

Use semantic tokens instead of component-specific hard-coded colors:

- surface/base, surface/raised, surface/overlay
- text/primary, text/secondary, text/muted
- border/subtle, border/strong
- status/success, status/warning, status/error, status/info
- accent/violet, accent/cyan
- spacing/1..8
- radius/sm, md, lg, xl
- elevation/1..4

Status meaning must never depend on color alone; pair color with icon + text.

## Typography and density

- Executive titles: 28–40 px responsive.
- Section titles: 18–24 px.
- Body: 14–16 px with readable line height.
- Operational metadata: 11–13 px, never below accessibility-safe legibility.
- Tables use sticky headers, row grouping, filters and compact/comfortable density toggles.

## Graphics and media pipeline

A production asset enters the system once and is referenced by asset ID.

Pipeline:

Source -> ingest -> malware/type validation -> checksum -> metadata -> preview/derivatives -> accessibility metadata -> department/task linkage -> approval -> active use -> version/supersede -> archive.

Recommended derivatives:

- thumbnail for lists
- preview for cards
- web-optimized image
- mobile image
- high-DPI/retina image
- 4K presentation/dashboard derivative when the source supports it
- poster frame for video
- waveform for audio

Do not commit large binary masters into the main source repository. Keep source code and manifests in Git; keep binary assets in approved storage and link them through the asset registry.

## Charts

Charts must show:

- metric definition
- unit
- source
- observed time or reporting range
- actual vs projected distinction
- empty/stale/error states
- accessible text/table equivalent when decision-critical

Avoid decorative charts that imply live telemetry.

## High-resolution display modes

- **Executive:** key decisions, risks, milestones, revenue evidence.
- **Operations:** services, queues, incidents, dependencies, recovery.
- **Evidence:** claims, sources, timestamps, confidence, approvals.
- **Immersive:** high-resolution visual references, media, spatial system maps.
- **Mobile:** chat, approvals, alerts, quick actions, file/camera intake.

## Performance contract

High-definition visuals must not block the command surface. Load navigation, chat and status first; defer large imagery and media. Generate responsive image derivatives, lazy-load galleries, virtualize large tables/lists, and keep realtime updates scoped to changed records rather than refreshing whole pages.

import { db, error, json, requireAdminEmailAllowlist, requireAuth, withScopes } from '@appdeploy/sdk';
import type { RouterRoutes } from '@appdeploy/sdk';

type Confidence = 'Verified' | 'Supported' | 'Stale' | 'Conflicting' | 'Unknown';
type ConnectionState = 'Disconnected' | 'Permission Required' | 'Connecting' | 'Connected' | 'Limited' | 'Syncing' | 'Error';
type CredentialState = 'configured' | 'missing' | 'expired' | 'rotating' | 'not-required';

interface SystemNode extends Record<string, unknown> {
  id: string;
  name: string;
  category: 'repository' | 'deployment' | 'api' | 'plugin' | 'device' | 'database' | 'storage' | 'communications';
  provider: string;
  state: ConnectionState;
  confidence: Confidence;
  accountAlias?: string;
  organizationId?: string;
  projectId?: string;
  repository?: string;
  branch?: string;
  commitSha?: string;
  pullRequest?: number;
  appId?: string;
  deploymentVersion?: string;
  runtimeAuthorized: boolean;
  scopesVerified: boolean;
  credentialState: CredentialState;
  lastCheckedAt?: string;
  lastSuccessfulAt?: string;
  lastFailureAt?: string;
  failureReason?: string;
  recoveryAction?: string;
  evidenceSource: string;
  evidenceAt: string;
}

interface EvidenceRecord extends Record<string, unknown> {
  nodeId: string;
  kind: string;
  result: 'success' | 'failure' | 'info';
  source: string;
  detail: string;
  observedAt: string;
  actor: string;
}

interface ApprovalRecord extends Record<string, unknown> {
  action: string;
  scope: string;
  evidence: string;
  decision: 'approved' | 'denied';
  actor: string;
  decidedAt: string;
}

interface FailureRecord extends Record<string, unknown> {
  nodeId: string;
  source: string;
  error: string;
  recoveryAction: string;
  status: 'open' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

const ADMIN_EMAILS = ['timfarmer@somethingdifferent.lol'];
const REGISTRY_TABLE = 'violet_system_registry';
const EVIDENCE_TABLE = 'violet_system_evidence';
const APPROVAL_TABLE = 'violet_approval_ledger';
const FAILURE_TABLE = 'violet_failure_intelligence';
const now = () => new Date().toISOString();
const clean = (value: unknown, max = 500) => String(value || '').trim().slice(0, max);

const seedNodes: SystemNode[] = [
  {
    id: 'github-authoritative-repo',
    name: 'GitHub authoritative repository',
    category: 'repository',
    provider: 'GitHub',
    state: 'Connected',
    confidence: 'Verified',
    accountAlias: 'timfarmerisat',
    repository: 'timfarmerisat/expo',
    branch: 'Aiaware',
    runtimeAuthorized: true,
    scopesVerified: true,
    credentialState: 'not-required',
    evidenceSource: 'GitHub connector verification',
    evidenceAt: '2026-09-19T09:00:00.000Z',
    recoveryAction: 'Reconnect GitHub and re-run repository permission verification.'
  },
  {
    id: 'appdeploy-whole-building',
    name: 'Violet/Legend Whole Building',
    category: 'deployment',
    provider: 'AppDeploy',
    state: 'Limited',
    confidence: 'Supported',
    appId: 'a382240bb730662c71',
    deploymentVersion: '1789803461873',
    runtimeAuthorized: true,
    scopesVerified: true,
    credentialState: 'configured',
    evidenceSource: 'AppDeploy runtime status',
    evidenceAt: '2026-09-19T09:00:00.000Z',
    failureReason: 'daily-revenue-alignment last run returned HTTP 402',
    recoveryAction: 'Re-run the scheduled revenue alignment after platform availability is restored and record a successful receipt.'
  },
  {
    id: 'appdeploy-violet-forge',
    name: 'Violet Forge / Local Bridge control plane',
    category: 'deployment',
    provider: 'AppDeploy',
    state: 'Connected',
    confidence: 'Verified',
    appId: 'violet-forge-1v1mkh',
    deploymentVersion: '1789674591069',
    runtimeAuthorized: true,
    scopesVerified: true,
    credentialState: 'missing',
    evidenceSource: 'AppDeploy runtime status',
    evidenceAt: '2026-09-19T09:00:00.000Z',
    recoveryAction: 'Bind required backend secrets through AppDeploy secure secret entry and verify with a runtime request.'
  },
  {
    id: 'openai-production-project',
    name: 'OpenAI production project',
    category: 'api',
    provider: 'OpenAI',
    state: 'Permission Required',
    confidence: 'Supported',
    organizationId: 'org-BQnqfGscrNg8OolDu69l1lUP',
    projectId: 'proj_zqLvvbNUoJJYhqeYPoUkFDKf',
    runtimeAuthorized: false,
    scopesVerified: false,
    credentialState: 'missing',
    evidenceSource: 'OpenAI Platform target verification',
    evidenceAt: '2026-09-19T09:00:00.000Z',
    recoveryAction: 'Create a project API key and bind it as OPENAI_API_KEY through the secure AppDeploy secret flow.'
  },
  {
    id: 'violet-local-device',
    name: 'Violet Local Bridge paired computer',
    category: 'device',
    provider: 'Violet Local Bridge',
    state: 'Disconnected',
    confidence: 'Unknown',
    runtimeAuthorized: false,
    scopesVerified: false,
    credentialState: 'missing',
    evidenceSource: 'No current heartbeat evidence',
    evidenceAt: '2026-09-19T09:00:00.000Z',
    recoveryAction: 'Pair the computer, verify token issuance, then require a current heartbeat before reporting Connected.'
  }
];

async function ensureSeeded() {
  const existing = await db.list<SystemNode>(REGISTRY_TABLE, { limit: 100 });
  if (existing.items.length) return;
  await db.add(REGISTRY_TABLE, seedNodes);
}

const freshness = (value?: string) => {
  if (!value) return { ageSeconds: null, freshness: 'Unknown' as Confidence };
  const ageSeconds = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 1000));
  if (ageSeconds <= 300) return { ageSeconds, freshness: 'Verified' as Confidence };
  if (ageSeconds <= 3600) return { ageSeconds, freshness: 'Supported' as Confidence };
  return { ageSeconds, freshness: 'Stale' as Confidence };
};

async function snapshot() {
  await ensureSeeded();
  const [nodes, evidence, approvals, failures] = await Promise.all([
    db.list<SystemNode>(REGISTRY_TABLE, { limit: 100 }),
    db.list<EvidenceRecord>(EVIDENCE_TABLE, { limit: 200 }),
    db.list<ApprovalRecord>(APPROVAL_TABLE, { limit: 100 }),
    db.list<FailureRecord>(FAILURE_TABLE, { limit: 100 })
  ]);

  const enriched = nodes.items.map((node) => ({
    ...node,
    freshness: freshness(node.lastSuccessfulAt || node.lastCheckedAt || node.evidenceAt)
  }));

  const releaseChecks = {
    sourceBound: enriched.every((node) => node.category !== 'deployment' || Boolean(node.deploymentVersion)),
    deploymentsHealthy: enriched.filter((node) => node.category === 'deployment').every((node) => node.state === 'Connected'),
    credentialsReady: enriched.every((node) => node.credentialState === 'configured' || node.credentialState === 'not-required'),
    devicesReady: enriched.filter((node) => node.category === 'device').every((node) => node.state === 'Connected'),
    noOpenFailures: failures.items.every((item) => item.status === 'resolved'),
    evidenceFresh: enriched.every((node) => node.freshness.freshness !== 'Stale' && node.freshness.freshness !== 'Unknown')
  };

  const complete = Object.values(releaseChecks).every(Boolean);
  return {
    checkedAt: now(),
    nodes: enriched,
    evidence: evidence.items.sort((a, b) => String(b.observedAt).localeCompare(String(a.observedAt))).slice(0, 100),
    approvals: approvals.items.sort((a, b) => String(b.decidedAt).localeCompare(String(a.decidedAt))).slice(0, 100),
    failures: failures.items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 100),
    releaseGate: { complete, status: complete ? 'Complete' : 'Blocked', checks: releaseChecks }
  };
}

export const systemRegistryRoutes: RouterRoutes = {
  'GET /api/system-registry': [requireAuth(), async () => json(await snapshot())],

  'POST /api/system-registry/evidence': [
    requireAuth(),
    withScopes('email'),
    requireAdminEmailAllowlist(ADMIN_EMAILS),
    async (ctx) => {
      const body = (ctx.body || {}) as Partial<EvidenceRecord> & { state?: ConnectionState; credentialState?: CredentialState; runtimeAuthorized?: boolean; scopesVerified?: boolean };
      const nodeId = clean(body.nodeId, 120);
      if (!nodeId) return error('nodeId is required', 400);
      await ensureSeeded();
      const nodes = await db.list<SystemNode>(REGISTRY_TABLE, { limit: 100 });
      const node = nodes.items.find((item) => item.id === nodeId);
      if (!node) return error('System node not found', 404);
      const observedAt = now();
      const result = body.result === 'failure' || body.result === 'info' ? body.result : 'success';
      const record: EvidenceRecord = {
        nodeId,
        kind: clean(body.kind || 'verification', 80),
        result,
        source: clean(body.source, 180) || 'operator',
        detail: clean(body.detail, 1000),
        observedAt,
        actor: clean(ctx.user!.email || ctx.user!.userId, 180)
      };
      await db.add(EVIDENCE_TABLE, [record]);
      const next: SystemNode = {
        ...node,
        state: body.state || (result === 'success' ? 'Connected' : result === 'failure' ? 'Error' : node.state),
        confidence: result === 'success' ? 'Verified' : result === 'failure' ? 'Conflicting' : node.confidence,
        credentialState: body.credentialState || node.credentialState,
        runtimeAuthorized: typeof body.runtimeAuthorized === 'boolean' ? body.runtimeAuthorized : node.runtimeAuthorized,
        scopesVerified: typeof body.scopesVerified === 'boolean' ? body.scopesVerified : node.scopesVerified,
        lastCheckedAt: observedAt,
        lastSuccessfulAt: result === 'success' ? observedAt : node.lastSuccessfulAt,
        lastFailureAt: result === 'failure' ? observedAt : node.lastFailureAt,
        failureReason: result === 'failure' ? record.detail : node.failureReason,
        evidenceSource: record.source,
        evidenceAt: observedAt
      };
      await db.update(REGISTRY_TABLE, [{ id: node.id, record: next }]);
      if (result === 'failure') {
        await db.add(FAILURE_TABLE, [{
          nodeId,
          source: record.source,
          error: record.detail || 'Verification failed',
          recoveryAction: node.recoveryAction || 'Re-run verification after correcting the provider/runtime issue.',
          status: 'open',
          createdAt: observedAt
        }]);
      }
      return json({ ok: true, record, snapshot: await snapshot() }, 201);
    }
  ],

  'POST /api/system-registry/heartbeat': [
    requireAuth(),
    withScopes('email'),
    requireAdminEmailAllowlist(ADMIN_EMAILS),
    async (ctx) => {
      const body = (ctx.body || {}) as { nodeId?: string; detail?: string };
      const nodeId = clean(body.nodeId, 120);
      if (!nodeId) return error('nodeId is required', 400);
      const nodes = await db.list<SystemNode>(REGISTRY_TABLE, { limit: 100 });
      const node = nodes.items.find((item) => item.id === nodeId);
      if (!node) return error('System node not found', 404);
      const checkedAt = now();
      const next: SystemNode = {
        ...node,
        state: 'Connected',
        confidence: 'Verified',
        lastCheckedAt: checkedAt,
        lastSuccessfulAt: checkedAt,
        failureReason: undefined,
        evidenceSource: clean(body.detail, 300) || 'Heartbeat accepted',
        evidenceAt: checkedAt
      };
      await db.update(REGISTRY_TABLE, [{ id: node.id, record: next }]);
      await db.add(EVIDENCE_TABLE, [{
        nodeId,
        kind: 'heartbeat',
        result: 'success',
        source: 'runtime-heartbeat',
        detail: clean(body.detail, 1000) || 'Successful heartbeat',
        observedAt: checkedAt,
        actor: clean(ctx.user!.email || ctx.user!.userId, 180)
      }]);
      return json({ ok: true, checkedAt });
    }
  ],

  'POST /api/system-registry/approval': [
    requireAuth(),
    withScopes('email'),
    requireAdminEmailAllowlist(ADMIN_EMAILS),
    async (ctx) => {
      const body = (ctx.body || {}) as Partial<ApprovalRecord>;
      const decision = body.decision === 'denied' ? 'denied' : 'approved';
      const record: ApprovalRecord = {
        action: clean(body.action, 240),
        scope: clean(body.scope, 240),
        evidence: clean(body.evidence, 1200),
        decision,
        actor: clean(ctx.user!.email || ctx.user!.userId, 180),
        decidedAt: now()
      };
      if (!record.action || !record.scope) return error('action and scope are required', 400);
      const [id] = await db.add(APPROVAL_TABLE, [record]);
      return json({ id, ...record }, 201);
    }
  ],

  'POST /api/system-registry/failures/:id/resolve': [
    requireAuth(),
    withScopes('email'),
    requireAdminEmailAllowlist(ADMIN_EMAILS),
    async (ctx) => {
      const [existing] = await db.get<FailureRecord>(FAILURE_TABLE, [ctx.params.id]);
      if (!existing) return error('Failure record not found', 404);
      const next: FailureRecord = { ...existing, status: 'resolved', resolvedAt: now() };
      const [ok] = await db.update(FAILURE_TABLE, [{ id: ctx.params.id, record: next }]);
      return ok ? json({ id: ctx.params.id, ...next }) : error('Failure record could not be resolved', 500);
    }
  ],

  'GET /api/release-gate': [requireAuth(), async () => json((await snapshot()).releaseGate)]
};

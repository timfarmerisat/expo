import { ai, db, error, json, requireAuth, storage } from '@appdeploy/sdk';
import type { RouterRoutes } from '@appdeploy/sdk';

interface ProjectRecord extends Record<string, unknown> { name: string; type: string; objective: string; stage: string; createdAt: string }
interface TaskRecord extends Record<string, unknown> { title: string; priority: string; done: boolean; createdAt: string }
interface ResearchRecord extends Record<string, unknown> { url: string; sourceTitle: string; question: string; summary: string; createdAt: string }
interface AssetRecord extends Record<string, unknown> { prompt: string; path: string; createdAt: string }
interface QuoteRecord extends Record<string, unknown> { projectName: string; client: string; price: number; laborHours: number; laborRate: number; tools: number; fees: number; cost: number; profit: number; margin: number; createdAt: string }
interface ResourceRecord extends Record<string, unknown> { name: string; category: string; quantity: number; unitCost: number; owner: string; status: string; createdAt: string }

const table = (kind: string, userId: string) => `violet_forge_${kind}_${userId}`;
const now = () => new Date().toISOString();
const cleanName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 100) || 'file';
const isHttpUrl = (value: string) => { try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:'; } catch { return false; } };

export const routes: RouterRoutes = {
  'GET /api/_healthcheck': [async () => json({ status: 'ready', service: 'Violet Forge' })],
  'GET /api/bootstrap': [requireAuth(), async (ctx) => {
    const userId = ctx.user!.userId;
    const [projects, tasks, research, assets, files, quotes, resources] = await Promise.all([
      db.list<ProjectRecord>(table('projects', userId), { limit: 30 }),
      db.list<TaskRecord>(table('tasks', userId), { limit: 40 }),
      db.list<ResearchRecord>(table('research', userId), { limit: 20 }),
      db.list<AssetRecord>(table('assets', userId), { limit: 12 }),
      storage.list({ prefix: `files/${userId}/`, limit: 30 }),
      db.list<QuoteRecord>(table('quotes', userId), { limit: 30 }),
      db.list<ResourceRecord>(table('resources', userId), { limit: 40 }),
    ]);
    const fileUrls = files.paths.length ? await storage.url(files.paths) : [];
    const assetUrls = assets.items.length ? await storage.url(assets.items.map((item) => String(item.path))) : [];
    return json({ projects: projects.items, tasks: tasks.items, research: research.items, assets: assets.items.map((item, index) => ({ ...item, url: assetUrls[index]?.url || '' })), files: fileUrls.map((item) => ({ ...item, name: item.path.split('/').pop() || item.path })), quotes: quotes.items, resources: resources.items });
  }],
  'POST /api/projects': [requireAuth(), async (ctx) => {
    const body = (ctx.body || {}) as Partial<ProjectRecord>;
    if (!body.name?.trim() || !body.type?.trim()) return error('Project name and type are required', 400);
    const record: ProjectRecord = { name: body.name.trim().slice(0, 100), type: body.type.trim().slice(0, 60), objective: body.objective?.trim().slice(0, 1000) || '', stage: 'Planning', createdAt: now() };
    const [id] = await db.add(table('projects', ctx.user!.userId), [record]);
    if (!id) return error('Project could not be created', 500);
    return json({ id, ...record }, 201);
  }],
  'POST /api/tasks': [requireAuth(), async (ctx) => {
    const body = (ctx.body || {}) as Partial<TaskRecord>;
    if (!body.title?.trim()) return error('Task title is required', 400);
    const record: TaskRecord = { title: body.title.trim().slice(0, 180), priority: body.priority || 'Medium', done: false, createdAt: now() };
    const [id] = await db.add(table('tasks', ctx.user!.userId), [record]);
    if (!id) return error('Task could not be created', 500);
    return json({ id, ...record }, 201);
  }],
  'POST /api/quotes': [requireAuth(), async (ctx) => {
    const body = (ctx.body || {}) as Partial<QuoteRecord>;
    const price = Number(body.price || 0);
    const laborHours = Number(body.laborHours || 0);
    const laborRate = Number(body.laborRate || 0);
    const tools = Number(body.tools || 0);
    const fees = Number(body.fees || 0);
    if (!body.projectName?.trim() || !Number.isFinite(price) || price <= 0) return error('Project name and a positive proposed price are required', 400);
    if ([laborHours, laborRate, tools, fees].some((value) => !Number.isFinite(value) || value < 0)) return error('Cost inputs must be valid non-negative numbers', 400);
    const cost = laborHours * laborRate + tools + fees;
    const profit = price - cost;
    const margin = price ? (profit / price) * 100 : 0;
    const record: QuoteRecord = { projectName: body.projectName.trim().slice(0, 120), client: body.client?.trim().slice(0, 120) || 'Unassigned', price, laborHours, laborRate, tools, fees, cost, profit, margin, createdAt: now() };
    const [id] = await db.add(table('quotes', ctx.user!.userId), [record]);
    if (!id) return error('Quote could not be saved', 500);
    return json({ id, ...record }, 201);
  }],
  'POST /api/resources': [requireAuth(), async (ctx) => {
    const body = (ctx.body || {}) as Partial<ResourceRecord>;
    const quantity = Number(body.quantity || 0);
    const unitCost = Number(body.unitCost || 0);
    if (!body.name?.trim() || !body.category?.trim()) return error('Resource name and category are required', 400);
    if (!Number.isFinite(quantity) || quantity < 0 || !Number.isFinite(unitCost) || unitCost < 0) return error('Quantity and unit cost must be valid non-negative numbers', 400);
    const record: ResourceRecord = { name: body.name.trim().slice(0, 120), category: body.category.trim().slice(0, 80), quantity, unitCost, owner: body.owner?.trim().slice(0, 120) || 'Unassigned', status: body.status?.trim().slice(0, 60) || 'Available', createdAt: now() };
    const [id] = await db.add(table('resources', ctx.user!.userId), [record]);
    if (!id) return error('Resource could not be saved', 500);
    return json({ id, ...record }, 201);
  }],
  'PUT /api/tasks/:id': [requireAuth(), async (ctx) => {
    const [existing] = await db.get<TaskRecord>(table('tasks', ctx.user!.userId), [ctx.params.id]);
    if (!existing) return error('Task not found', 404);
    const body = (ctx.body || {}) as Partial<TaskRecord>;
    const record: TaskRecord = { title: body.title?.trim().slice(0, 180) || existing.title, priority: body.priority || existing.priority, done: typeof body.done === 'boolean' ? body.done : existing.done, createdAt: existing.createdAt };
    const [ok] = await db.update(table('tasks', ctx.user!.userId), [{ id: ctx.params.id, record }]);
    if (!ok) return error('Task could not be updated', 500);
    return json({ id: ctx.params.id, ...record });
  }],
  'DELETE /api/tasks/:id': [requireAuth(), async (ctx) => {
    const [ok] = await db.delete(table('tasks', ctx.user!.userId), [ctx.params.id]);
    return ok ? json({ deleted: true }) : error('Task could not be deleted', 404);
  }],
  'POST /api/command': [requireAuth(), async (ctx) => {
    const body = (ctx.body || {}) as { command?: string; project?: string };
    if (!body.command?.trim()) return error('A build command is required', 400);
    const result = await ai.generate({
      system: 'You are Violet Forge, a senior application architect, product researcher, deployment engineer, marketplace strategist, and IP-aware delivery advisor for Somethingdifferent LLC. Respond with an actionable professional plan. Separate facts, assumptions, evidence needed, build steps, acceptance criteria, risks, store/deployment gates, and next commands. Never invent live market data, revenue, credentials, ownership verification, or provider status. When current facts are needed, require dated source URLs.',
      messages: [{ role: 'user', content: `Project: ${body.project || 'Unassigned'}\nCommand: ${body.command.trim()}` }],
      thinkingMode: 'DEEP', maxTokens: 2200, temperature: 0.35,
    });
    await db.add(table('commands', ctx.user!.userId), [{ command: body.command.trim().slice(0, 4000), project: body.project || '', response: result.text.slice(0, 12000), createdAt: now() }]);
    return json({ response: result.text });
  }],
  'POST /api/research': [requireAuth(), async (ctx) => {
    const body = (ctx.body || {}) as { url?: string; question?: string };
    if (!body.url || !isHttpUrl(body.url)) return error('Enter a valid http or https source URL', 400);
    const scraped = await ai.scrape({ url: body.url });
    if (scraped.status >= 400 || !scraped.text.trim()) return error('The source could not be read. Try a public article or report URL.', 502);
    const question = body.question?.trim() || 'Extract the most useful product, market, competitor, buyer, pricing, and deployment evidence.';
    const analysis = await ai.generate({
      system: 'Analyze only the supplied source text. Do not add unsupported facts. Distinguish direct source evidence from inference. Return: Source findings, Product implications, Competitive opportunities, Risks, Evidence gaps, and Recommended build tasks.',
      messages: [{ role: 'user', content: `Source URL: ${body.url}\nResearch question: ${question}\nSource text:\n${scraped.text.slice(0, 24000)}` }],
      thinkingMode: 'DEEP', maxTokens: 1800, temperature: 0.2,
    });
    const record: ResearchRecord = { url: body.url, sourceTitle: scraped.title || new URL(body.url).hostname, question: question.slice(0, 500), summary: analysis.text.slice(0, 12000), createdAt: now() };
    const [id] = await db.add(table('research', ctx.user!.userId), [record]);
    if (!id) return error('Research completed but could not be saved', 500);
    return json({ id, ...record }, 201);
  }],
  'POST /api/assets/generate': [requireAuth(), async (ctx) => {
    const body = (ctx.body || {}) as { prompt?: string };
    if (!body.prompt?.trim()) return error('An asset prompt is required', 400);
    const prompt = `${body.prompt.trim()}\nProduction constraints: professional application or marketing asset, commercially usable composition, no watermark, no fabricated certification or trademark.`;
    const generated = await ai.imageGen({ prompt, maxOutputBytes: 1000000 });
    const path = `assets/${ctx.user!.userId}/${Date.now()}.png`;
    const [written] = await storage.write([{ path, content: generated.image.data, contentType: generated.image.mimeType }]);
    if (!written) return error('Generated image could not be saved', 500);
    const [recordId] = await db.add(table('assets', ctx.user!.userId), [{ prompt: body.prompt.trim().slice(0, 1000), path, createdAt: now() }]);
    const [{ url }] = await storage.url([path]);
    return json({ id: recordId || path, prompt: body.prompt.trim(), path, url, createdAt: now() }, 201);
  }],
  'POST /api/files': [requireAuth(), async (ctx) => {
    const body = (ctx.body || {}) as { name?: string; content?: string; contentType?: string };
    if (!body.name || !body.content || !body.contentType) return error('File name, content, and type are required', 400);
    if (body.content.length > 2800000) return error('File is too large. Upload a file under 2 MB.', 413);
    const path = `files/${ctx.user!.userId}/${Date.now()}-${cleanName(body.name)}`;
    const [written] = await storage.write([{ path, content: body.content, contentType: body.contentType }]);
    if (!written) return error('File could not be uploaded', 500);
    const [{ url }] = await storage.url([path]);
    return json({ path, url, name: path.split('/').pop() || path }, 201);
  }],
  'DELETE /api/files': [requireAuth(), async (ctx) => {
    const body = (ctx.body || {}) as { path?: string };
    const prefix = `files/${ctx.user!.userId}/`;
    if (!body.path?.startsWith(prefix)) return error('Invalid file path', 400);
    const [deleted] = await storage.delete([body.path]);
    return deleted ? json({ deleted: true }) : error('File could not be deleted', 404);
  }],
};

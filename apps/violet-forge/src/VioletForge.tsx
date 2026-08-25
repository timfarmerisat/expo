import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { api, auth } from '@appdeploy/client';
import { Activity, AppWindow, Archive, BarChart3, Bot, Boxes, BrainCircuit, BriefcaseBusiness, Check, ChevronRight, CircleDollarSign, ClipboardCheck, Cloud, Database, Download, ExternalLink, FileText, FolderOpen, Gamepad2, Github, Globe2, Image, Layers3, Link2, LoaderCircle, LockKeyhole, Menu, MonitorSmartphone, Plus, RadioTower, RefreshCw, Rocket, Search, Send, ShieldCheck, Smartphone, Sparkles, Store, Upload, UserRoundCog, X } from 'lucide-react';
import { Modal } from './components/Modal';
import { Panel, StatusBadge } from './components/Panel';
import { appDeployApps, commandSuggestions, deploymentTargets, marketCategories, projectTypes, upgradeModules } from './data';
import type { AppUser, AssetRecord, BootstrapData, Project, QuoteRecord, ResearchRecord, ResourceRecord, Task, VaultFile } from './types';
import './violet-forge.css';

const emptyData: BootstrapData = { projects: [], tasks: [], research: [], assets: [], files: [], quotes: [], resources: [] };
type ModalName = 'project' | 'research' | 'asset' | 'task' | 'quote' | 'resource' | 'systems' | 'files' | 'reports' | null;
type Toast = { kind: 'success' | 'error'; text: string } | null;

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const shortDate = (value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const errorText = (value: unknown) => value instanceof Error ? value.message : 'The request could not be completed.';

function SignInGate({ onSignIn, onPreview, busy, error }: { onSignIn: () => void; onPreview: () => void; busy: boolean; error: string }) {
  return <main className="signin-shell"><div className="signin-orbit orbit-one" /><div className="signin-orbit orbit-two" /><section className="signin-card"><div className="brand-lockup"><span className="brand-mark"><Layers3 size={26} /></span><div><strong>VIOLET FORGE</strong><small>Somethingdifferent LLC</small></div></div><h1>Build, research, deploy, and grow from one command center.</h1><p>Your private workspace combines AI architecture, sourced market research, assets, files, project history, labor quotes, store readiness, and connected-system launch paths.</p><div className="signin-proof"><span><ShieldCheck size={17} /> Private account workspace</span><span><Github size={17} /> GitHub registry connected</span><span><Cloud size={17} /> AppDeploy registry connected</span></div>{error && <div className="inline-error">{error}</div>}<button className="primary large" onClick={onSignIn} disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : <LockKeyhole size={18} />} Sign in to Violet Forge</button><button className="preview-button" onClick={onPreview}><MonitorSmartphone size={17} /> Explore read-only preview</button><small className="legal-note">Authentication is required so project, file, research, quote, and task records remain private to your account.</small></section></main>;
}

function ActionButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button className="top-action" onClick={onClick}>{icon}<span>{label}</span></button>;
}

function Metric({ label, value, note, tone = 'violet' }: { label: string; value: string; note: string; tone?: string }) {
  return <div className={`metric metric-${tone}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

export default function VioletForge() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authBusy, setAuthBusy] = useState(auth.isSignedIn());
  const [authError, setAuthError] = useState('');
  const [data, setData] = useState<BootstrapData>(emptyData);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalName>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [command, setCommand] = useState('');
  const [answer, setAnswer] = useState('Describe a product, market, application, game, deployment, or business problem. Violet Forge will return a build plan with evidence boundaries, risks, acceptance criteria, and next actions.');
  const [commandBusy, setCommandBusy] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const pipelineRef = useRef<HTMLDivElement>(null);

  const refresh = async () => {
    if (previewMode) return;
    setLoading(true);
    try { const response = await api.get('/api/bootstrap'); setData(response.data as BootstrapData); }
    catch (error) { setToast({ kind: 'error', text: errorText(error) }); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!auth.isSignedIn()) { setAuthBusy(false); return; }
    auth.getUser().then((nextUser) => { setUser(nextUser as AppUser | null); if (nextUser) return refresh(); }).catch(() => setAuthError('Your session could not be restored. Please sign in again.')).finally(() => setAuthBusy(false));
  }, []);

  useEffect(() => { if (!toast) return; const id = window.setTimeout(() => setToast(null), 4200); return () => window.clearTimeout(id); }, [toast]);

  const signIn = async () => {
    setAuthBusy(true); setAuthError(''); setPreviewMode(false);
    try { const result = await auth.signIn(); setUser(result.user as AppUser); await refresh(); }
    catch (error) { const coded = error as { code?: string }; setAuthError(coded.code === 'popup_blocked' ? 'Allow popups for this site, then try again.' : coded.code === 'popup_closed' ? 'Sign-in was cancelled.' : 'Sign-in could not be completed.'); }
    finally { setAuthBusy(false); }
  };

  const signOut = async () => { if (!previewMode) await auth.signOut(); setPreviewMode(false); setUser(null); setData(emptyData); };
  const showToast = (text: string, kind: 'success' | 'error' = 'success') => setToast({ text, kind });
  const requireAccount = () => { if (!previewMode) return true; showToast('Sign in to save records or run live AI and storage actions.', 'error'); return false; };
  const enterPreview = () => {
    setPreviewMode(true);
    setUser({ userId: 'preview', name: 'Read-only preview' });
    setData({ ...emptyData, projects: [{ id: 'preview-project', name: 'Violet Forge Preview', type: 'AI application', objective: 'Explore the command center before sign-in.', stage: 'Planning', createdAt: new Date().toISOString() }], tasks: [{ id: 'preview-task', title: 'Sign in to create private project records', priority: 'Next step', done: false, createdAt: new Date().toISOString() }] });
  };

  const sendCommand = async (nextCommand = command) => {
    if (!nextCommand.trim()) { showToast('Enter a build or research command first.', 'error'); return; }
    if (!requireAccount()) return;
    setCommand(nextCommand); setCommandBusy(true);
    try { const response = await api.post('/api/command', { command: nextCommand, project: data.projects[0]?.name || 'Unassigned workspace' }); setAnswer(response.data.response); }
    catch (error) { showToast(errorText(error), 'error'); }
    finally { setCommandBusy(false); }
  };

  const createProject = async (form: FormData) => {
    if (!requireAccount()) return;
    const response = await api.post('/api/projects', { name: form.get('name'), type: form.get('type'), objective: form.get('objective') });
    setData((current) => ({ ...current, projects: [response.data as Project, ...current.projects] })); setModal(null); showToast('Project created and added to history.');
  };

  const createTask = async (form: FormData) => {
    if (!requireAccount()) return;
    const response = await api.post('/api/tasks', { title: form.get('title'), priority: form.get('priority') });
    setData((current) => ({ ...current, tasks: [response.data as Task, ...current.tasks] })); setModal(null); showToast('Task created.');
  };

  const toggleTask = async (task: Task) => {
    if (!requireAccount()) return;
    const response = await api.put(`/api/tasks/${task.id}`, { done: !task.done });
    setData((current) => ({ ...current, tasks: current.tasks.map((item) => item.id === task.id ? response.data as Task : item) }));
  };

  const runResearch = async (form: FormData) => {
    if (!requireAccount()) return;
    setLoading(true);
    try { const response = await api.post('/api/research', { url: form.get('url'), question: form.get('question') }); setData((current) => ({ ...current, research: [response.data as ResearchRecord, ...current.research] })); setModal(null); showToast('Source analyzed and saved with its URL.'); }
    finally { setLoading(false); }
  };

  const generateAsset = async (form: FormData) => {
    if (!requireAccount()) return;
    setLoading(true);
    try { const response = await api.post('/api/assets/generate', { prompt: form.get('prompt') }); setData((current) => ({ ...current, assets: [response.data as AssetRecord, ...current.assets] })); setModal(null); showToast('Image asset generated and saved.'); }
    finally { setLoading(false); }
  };

  const createQuote = async (form: FormData) => {
    if (!requireAccount()) return;
    const payload = Object.fromEntries(form.entries());
    const response = await api.post('/api/quotes', payload);
    setData((current) => ({ ...current, quotes: [response.data as QuoteRecord, ...current.quotes] })); setModal(null); showToast('Quote and profitability estimate saved.');
  };

  const addResource = async (form: FormData) => {
    if (!requireAccount()) return;
    const payload = Object.fromEntries(form.entries());
    const response = await api.post('/api/resources', payload);
    setData((current) => ({ ...current, resources: [response.data as ResourceRecord, ...current.resources] })); setModal(null); showToast('Resource added to inventory.');
  };

  const uploadFile = async (file: File) => {
    if (!requireAccount()) return;
    if (file.size > 2_000_000) { showToast('Choose a file under 2 MB.', 'error'); return; }
    const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1] || ''); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); });
    const response = await api.post('/api/files', { name: file.name, content: base64, contentType: file.type || 'application/octet-stream' });
    setData((current) => ({ ...current, files: [response.data as VaultFile, ...current.files] })); showToast('File uploaded with a signed access link.');
  };

  const deleteFile = async (file: VaultFile) => {
    if (!requireAccount()) return;
    if (!window.confirm(`Delete ${file.name}?`)) return;
    await api.delete('/api/files', { path: file.path }); setData((current) => ({ ...current, files: current.files.filter((item) => item.path !== file.path) })); showToast('File removed.');
  };

  const metrics = useMemo(() => {
    const revenue = data.quotes.reduce((sum, item) => sum + item.price, 0);
    const cost = data.quotes.reduce((sum, item) => sum + item.cost, 0);
    const profit = revenue - cost;
    const margin = revenue ? (profit / revenue) * 100 : 0;
    return { revenue, cost, profit, margin, profitable: data.quotes.filter((item) => item.profit > 0).length };
  }, [data.quotes]);

  const exportProject = () => {
    const report = { exportedAt: new Date().toISOString(), company: 'Somethingdifferent LLC', product: 'Violet Forge', note: 'Quote values are planning estimates until reconciled with actual payments and expenses.', ...data };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'violet-forge-project-export.json'; link.click(); URL.revokeObjectURL(url); showToast('Project history exported.');
  };

  if (!user) return <SignInGate onSignIn={signIn} onPreview={enterPreview} busy={authBusy} error={authError} />;

  return <div className="app-shell">
    {toast && <div className={`toast toast-${toast.kind}`}>{toast.kind === 'success' ? <Check size={17} /> : <X size={17} />}{toast.text}</div>}
    <header className="topbar"><div className="brand-lockup"><span className="brand-mark"><Layers3 size={24} /></span><div><strong>VIOLET FORGE</strong><small>Somethingdifferent LLC</small></div></div><nav className={mobileNav ? 'top-actions open' : 'top-actions'}><ActionButton icon={<Plus size={16} />} label="New Build" onClick={() => setModal('project')} /><ActionButton icon={<Search size={16} />} label="Research Market" onClick={() => setModal('research')} /><ActionButton icon={<Sparkles size={16} />} label="Generate Assets" onClick={() => setModal('asset')} /><ActionButton icon={<Rocket size={16} />} label="Deploy Release" onClick={() => pipelineRef.current?.scrollIntoView({ behavior: 'smooth' })} /><ActionButton icon={<Link2 size={16} />} label="Link System" onClick={() => setModal('systems')} /><ActionButton icon={<ClipboardCheck size={16} />} label="Create Task" onClick={() => setModal('task')} /><ActionButton icon={<Download size={16} />} label="Export Project" onClick={exportProject} /></nav><button className="mobile-menu icon-button" aria-label="Toggle navigation" onClick={() => setMobileNav((value) => !value)}><Menu size={20} /></button><button className="profile-button" onClick={signOut} title="Sign out">{user.picture ? <img src={user.picture} alt="" /> : <UserRoundCog size={20} />}<span>{user.name || user.email || 'Workspace owner'}</span></button></header>

    {previewMode && <div className="preview-banner"><MonitorSmartphone size={15} /><span>Read-only preview — sign in to run AI, save projects, upload files, generate assets, or change records.</span><button onClick={signIn}>Sign in</button></div>}
    <main className="workspace">
      <Panel title="Build Lab" className="build-lab" action={<button className="mini-link" onClick={refresh}>{loading ? <LoaderCircle className="spin" size={14} /> : <RefreshCw size={14} />} Refresh</button>}>
        <p className="section-label">Project types</p><div className="type-list">{projectTypes.map((item, index) => <button key={item} className={index === 0 ? 'selected' : ''} onClick={() => { setCommand(`Build a production-ready ${item.toLowerCase()} with research, assets, tests, and deployment gates.`); }}><AppWindow size={14} />{item}</button>)}</div>
        <p className="section-label module-heading">Upgrade modules (22)</p><div className="module-list">{upgradeModules.map((item) => <div key={item.id}><span><b>{String(item.id).padStart(2, '0')}.</b>{item.name}</span><StatusBadge value={item.status} /></div>)}</div>
      </Panel>

      <div className="center-stack">
        <Panel title="AI Build Command" action={<span className="online"><i /> AI runtime ready</span>}>
          <div className="context-row"><span>Workspace: {data.projects[0]?.name || 'No project selected'}</span><span>Mode: Deep planning</span><span>Evidence: source-bound</span></div>
          <div className="answer"><div className="answer-label"><Bot size={16} /> Violet Forge</div><div className="answer-copy">{commandBusy ? <span className="thinking"><LoaderCircle className="spin" size={17} /> Architecting the response…</span> : answer}</div></div>
          <div className="source-strip"><div className="strip-title"><span>Sourced research</span><button onClick={() => setModal('research')}>Add source URL <Plus size={13} /></button></div><div className="source-cards">{data.research.slice(0, 4).map((item) => <button key={item.id} onClick={() => { setAnswer(item.summary); }}><Globe2 size={17} /><strong>{item.sourceTitle}</strong><small>{shortDate(item.createdAt)}</small></button>)}{Array.from({ length: Math.max(1, 4 - data.research.slice(0, 4).length) }).map((_, index) => <button className="empty-source" key={index} onClick={() => setModal('research')}><Plus size={18} /><span>Add source URL</span><small>No source analyzed yet</small></button>)}</div></div>
          <div className="suggestions">{commandSuggestions.map((item) => <button key={item} onClick={() => { setCommand(item); void sendCommand(item); }}><BrainCircuit size={14} />{item}</button>)}</div>
          <div className="composer"><textarea value={command} onChange={(event) => setCommand(event.target.value)} placeholder="Command a product build, market review, architecture decision, asset, quote, deployment, task, report, or research plan…" /><div className="composer-foot"><span><ShieldCheck size={14} /> Claims require evidence</span><button className="primary" disabled={commandBusy} onClick={() => void sendCommand()}>{commandBusy ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />} Run command</button></div></div>
        </Panel>
      </div>

      <Panel title="Market & Profit Lab" className="market-lab" action={<button className="mini-link" onClick={() => setModal('research')}><Search size={14} /> Research</button>}>
        <div className="truth-note"><ShieldCheck size={15} /><span>Scores appear only after sourced research. Quote metrics below use your entered planning data.</span></div>
        <p className="section-label">Market watchlist</p><div className="market-list">{marketCategories.map((item) => <button key={item} onClick={() => { setModal('research'); setCommand(`Research current demand, competitors, pricing, and differentiation for ${item}.`); }}><span>{item}</span><small>Source needed</small><ChevronRight size={14} /></button>)}</div>
        <p className="section-label">Quote intelligence</p><div className="metric-grid"><Metric label="Proposed revenue" value={money(metrics.revenue)} note={`${data.quotes.length} saved quotes`} /><Metric label="Estimated cost" value={money(metrics.cost)} note="Labor + tools + fees" tone="blue" /><Metric label="Estimated profit" value={money(metrics.profit)} note={`${metrics.margin.toFixed(1)}% gross margin`} tone={metrics.profit >= 0 ? 'green' : 'red'} /><Metric label="Profitable plans" value={`${metrics.profitable}/${data.quotes.length}`} note="Planning scenarios" tone="amber" /></div>
        <div className="profit-actions"><button onClick={() => setModal('quote')}><CircleDollarSign size={16} /> Build quote</button><button onClick={() => setModal('reports')}><BarChart3 size={16} /> View report</button></div>
        <p className="section-label">Operational evidence</p><div className="evidence-list"><span><b>{data.projects.length}</b> project records</span><span><b>{data.research.length}</b> sourced analyses</span><span><b>{data.tasks.filter((item) => item.done).length}/{data.tasks.length}</b> tasks completed</span><span><b>{data.resources.length}</b> inventory resources</span></div>
      </Panel>

      <div className="deployment-section" ref={pipelineRef}><Panel title="Deployment Pipeline"><div className="pipeline">{deploymentTargets.map((target) => <a key={target.name} href={target.url} target="_blank" rel="noreferrer"><span className="target-icon">{target.name.includes('Apple') ? <Smartphone size={19} /> : target.name.includes('Google') ? <Store size={19} /> : target.name.includes('Microsoft') ? <MonitorSmartphone size={19} /> : target.name.includes('Game') ? <Gamepad2 size={19} /> : target.name === 'GitHub' ? <Github size={19} /> : target.name.includes('DNS') ? <Globe2 size={19} /> : target.name.includes('Payments') ? <CircleDollarSign size={19} /> : <Cloud size={19} />}</span><span><strong>{target.name}</strong><StatusBadge value={target.status} /><small>{target.detail}</small></span><ExternalLink size={13} /></a>)}</div></Panel></div>

      <div className="operations-grid">
        <Panel title="Connected Systems" action={<button className="mini-link" onClick={() => setModal('systems')}>View all <ChevronRight size={14} /></button>}><div className="system-row"><button onClick={() => setModal('systems')}><Cloud size={18} /><span>AppDeploy<strong>9 apps connected</strong></span></button><a href="https://github.com/timfarmerisat/expo" target="_blank" rel="noreferrer"><Github size={18} /><span>GitHub<strong>timfarmerisat/expo</strong></span></a><button onClick={() => setModal('files')}><Archive size={18} /><span>File Vault<strong>{data.files.length} files</strong></span></button><button onClick={() => setModal('resource')}><Boxes size={18} /><span>Resource Inventory<strong>{data.resources.length} records</strong></span></button></div></Panel>
        <Panel title="Task Control" action={<button className="mini-link" onClick={() => setModal('task')}><Plus size={14} /> Add</button>}><div className="task-list">{data.tasks.slice(0, 5).map((task) => <label key={task.id}><input type="checkbox" checked={task.done} onChange={() => void toggleTask(task)} /><span className={task.done ? 'done' : ''}>{task.title}</span><small>{task.priority}</small></label>)}{!data.tasks.length && <button className="empty-row" onClick={() => setModal('task')}>Create the first task</button>}</div></Panel>
        <Panel title="Recent Project History" action={<button className="mini-link" onClick={exportProject}><Download size={14} /> Export</button>}><div className="history-list">{data.projects.slice(0, 4).map((project) => <div key={project.id}><BriefcaseBusiness size={16} /><span><strong>{project.name}</strong><small>{project.type} · {project.stage}</small></span><time>{shortDate(project.createdAt)}</time></div>)}{!data.projects.length && <button className="empty-row" onClick={() => setModal('project')}>Create the first project</button>}</div></Panel>
        <Panel title="Asset Presentation" action={<button className="mini-link" onClick={() => setModal('asset')}><Sparkles size={14} /> Generate</button>}><div className="asset-rail">{data.assets.slice(0, 4).map((asset) => <a key={asset.id} href={asset.url} target="_blank" rel="noreferrer"><img src={asset.url} alt={asset.prompt} /><span>{asset.prompt}</span></a>)}{!data.assets.length && <button className="empty-asset" onClick={() => setModal('asset')}><Image size={24} /><span>Generate the first visual asset</span></button>}</div></Panel>
      </div>
    </main>

    <footer className="statusbar"><span><LockKeyhole size={14} /> {previewMode ? 'Read-only sample data' : 'Private account data'}</span><span><Database size={14} /> Database ready</span><span><RadioTower size={14} /> Refresh-based synchronization</span><span><Activity size={14} /> Health endpoint active</span><button onClick={previewMode ? signIn : refresh}><RefreshCw size={14} /> {previewMode ? 'Sign in' : 'Refresh workspace'}</button></footer>

    {modal === 'project' && <Modal title="Create a new build" onClose={() => setModal(null)}><ActionForm submitLabel="Create project" onSubmit={createProject}><Field label="Project name" name="name" required /><SelectField label="Product type" name="type" values={projectTypes} /><Field label="Objective and customer outcome" name="objective" multiline /></ActionForm></Modal>}
    {modal === 'task' && <Modal title="Create a task" onClose={() => setModal(null)}><ActionForm submitLabel="Create task" onSubmit={createTask}><Field label="Task" name="title" required /><SelectField label="Priority" name="priority" values={['High', 'Medium', 'Low']} /></ActionForm></Modal>}
    {modal === 'research' && <Modal title="Run source-based deep research" onClose={() => setModal(null)}><ActionForm submitLabel="Analyze and save source" onSubmit={runResearch} busy={loading}><Field label="Public source URL" name="url" type="url" placeholder="https://example.com/report" required /><Field label="Research question" name="question" multiline placeholder="What does this prove about buyer demand, competition, pricing, or build requirements?" /><div className="form-note"><Globe2 size={15} /> The analysis is limited to the supplied page and saves the source URL with the result.</div></ActionForm></Modal>}
    {modal === 'asset' && <Modal title="Generate a production image asset" onClose={() => setModal(null)}><ActionForm submitLabel="Generate and save" onSubmit={generateAsset} busy={loading}><Field label="Asset prompt" name="prompt" multiline required placeholder="Describe the app graphic, product visual, marketing concept, store artwork, presentation visual, or game asset…" /><div className="form-note"><Image size={15} /> Generated output is saved to your private asset vault.</div></ActionForm></Modal>}
    {modal === 'quote' && <Modal title="Project quote and profitability plan" onClose={() => setModal(null)}><ActionForm submitLabel="Calculate and save quote" onSubmit={createQuote}><Field label="Project name" name="projectName" required /><Field label="Buyer / client" name="client" /><div className="form-grid"><Field label="Proposed price" name="price" type="number" required /><Field label="Labor hours" name="laborHours" type="number" /><Field label="Hourly labor rate" name="laborRate" type="number" /><Field label="Tools and licenses" name="tools" type="number" /><Field label="Store / delivery fees" name="fees" type="number" /></div><div className="form-note"><BarChart3 size={15} /> Gross margin = (price − estimated labor, tools and fees) ÷ price. This is a planning estimate, not proof of realized profit.</div></ActionForm></Modal>}
    {modal === 'resource' && <Modal title="Add resource or personnel inventory" onClose={() => setModal(null)}><ActionForm submitLabel="Add to inventory" onSubmit={addResource}><Field label="Resource, tool, asset, or role" name="name" required /><SelectField label="Category" name="category" values={['Personnel', 'Software', 'Hardware', 'Creative asset', 'Research data', 'License', 'Other']} /><div className="form-grid"><Field label="Quantity / capacity" name="quantity" type="number" /><Field label="Unit cost" name="unitCost" type="number" /><Field label="Owner / assignee" name="owner" /><SelectField label="Status" name="status" values={['Available', 'Assigned', 'Limited', 'Renewal needed', 'Unavailable']} /></div></ActionForm></Modal>}
    {modal === 'systems' && <SystemsModal onClose={() => setModal(null)} />}
    {modal === 'files' && <FilesModal files={data.files} onClose={() => setModal(null)} onUpload={uploadFile} onDelete={deleteFile} />}
    {modal === 'reports' && <ReportsModal data={data} metrics={metrics} onClose={() => setModal(null)} />}
  </div>;
}

function ActionForm({ onSubmit, submitLabel, busy = false, children }: { onSubmit: (form: FormData) => Promise<void>; submitLabel: string; busy?: boolean; children: ReactNode }) {
  const [error, setError] = useState('');
  return <form className="action-form" onSubmit={async (event) => { event.preventDefault(); setError(''); try { await onSubmit(new FormData(event.currentTarget)); } catch (value) { setError(errorText(value)); } }}>{children}{error && <div className="inline-error">{error}</div>}<button className="primary modal-submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}{submitLabel}</button></form>;
}

function Field({ label, name, type = 'text', required = false, multiline = false, placeholder = '' }: { label: string; name: string; type?: string; required?: boolean; multiline?: boolean; placeholder?: string }) {
  return <label className="field"><span>{label}</span>{multiline ? <textarea name={name} required={required} placeholder={placeholder} /> : <input name={name} type={type} min={type === 'number' ? '0' : undefined} step={type === 'number' ? '0.01' : undefined} required={required} placeholder={placeholder} />}</label>;
}

function SelectField({ label, name, values }: { label: string; name: string; values: string[] }) {
  return <label className="field"><span>{label}</span><select name={name}>{values.map((value) => <option key={value}>{value}</option>)}</select></label>;
}

function SystemsModal({ onClose }: { onClose: () => void }) {
  return <Modal title="Connected apps and deployment systems" onClose={onClose} wide><div className="systems-modal"><div className="verified-banner"><ShieldCheck size={18} /><span><strong>Verified registry access</strong> AppDeploy: 9 owned apps · GitHub: timfarmerisat/expo</span></div><div className="app-link-grid">{appDeployApps.map((app) => <a key={app.url} href={app.url} target="_blank" rel="noreferrer"><Cloud size={18} /><span><strong>{app.name}</strong><small>{app.detail}</small></span><ExternalLink size={14} /></a>)}</div><h3>Provider launch paths</h3><div className="provider-list">{deploymentTargets.map((target) => <a key={target.name} href={target.url} target="_blank" rel="noreferrer"><span>{target.name}<small>{target.detail}</small></span><StatusBadge value={target.status} /><ExternalLink size={14} /></a>)}</div></div></Modal>;
}

function FilesModal({ files, onClose, onUpload, onDelete }: { files: VaultFile[]; onClose: () => void; onUpload: (file: File) => Promise<void>; onDelete: (file: VaultFile) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return <Modal title="Private file vault" onClose={onClose} wide><div className="file-toolbar"><label className="primary"><Upload size={17} /> Upload file<input type="file" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setBusy(true); try { await onUpload(file); } finally { setBusy(false); } }} /></label><span>{busy ? 'Uploading…' : 'Maximum file size: 2 MB'}</span></div><div className="file-list">{files.map((file) => <div key={file.path}><FileText size={18} /><a href={file.url} target="_blank" rel="noreferrer">{file.name}</a><button className="icon-button danger" aria-label={`Delete ${file.name}`} onClick={() => void onDelete(file)}><X size={15} /></button></div>)}{!files.length && <div className="empty-state"><FolderOpen size={30} /><strong>No files uploaded yet</strong><span>Upload requirements, reports, designs, code bundles, or project records.</span></div>}</div></Modal>;
}

function ReportsModal({ data, metrics, onClose }: { data: BootstrapData; metrics: { revenue: number; cost: number; profit: number; margin: number; profitable: number }; onClose: () => void }) {
  const maxPrice = Math.max(1, ...data.quotes.map((item) => item.price));
  return <Modal title="Projects, labor and profitability report" onClose={onClose} wide><div className="report-disclaimer"><ShieldCheck size={16} /> Planning metrics use saved quote inputs. They become proof of actual profit only after reconciliation with payments and expenses.</div><div className="report-metrics"><Metric label="Proposed revenue" value={money(metrics.revenue)} note={`${data.quotes.length} quote scenarios`} /><Metric label="Estimated delivery cost" value={money(metrics.cost)} note="Labor, tools and fees" tone="blue" /><Metric label="Estimated gross profit" value={money(metrics.profit)} note={`${metrics.margin.toFixed(1)}% margin`} tone={metrics.profit >= 0 ? 'green' : 'red'} /><Metric label="Completion" value={`${data.tasks.length ? Math.round(data.tasks.filter((item) => item.done).length / data.tasks.length * 100) : 0}%`} note={`${data.tasks.filter((item) => item.done).length}/${data.tasks.length} tasks`} tone="amber" /></div><div className="report-layout"><section><h3>Quote comparison</h3><div className="quote-chart">{data.quotes.map((quote) => <div key={quote.id}><span>{quote.projectName}</span><div><i style={{ width: `${quote.price / maxPrice * 100}%` }} /><b style={{ width: `${Math.max(0, quote.profit) / maxPrice * 100}%` }} /></div><strong>{money(quote.profit)} · {quote.margin.toFixed(1)}%</strong></div>)}{!data.quotes.length && <div className="empty-state"><BarChart3 size={30} /><strong>No quote data yet</strong><span>Create a quote to generate evidence-based planning charts.</span></div>}</div></section><section><h3>Operations inventory</h3><div className="resource-table"><div className="table-head"><span>Resource</span><span>Owner</span><span>Status</span><span>Value</span></div>{data.resources.map((item) => <div key={item.id}><span>{item.name}<small>{item.category}</small></span><span>{item.owner}</span><span>{item.status}</span><span>{money(item.quantity * item.unitCost)}</span></div>)}{!data.resources.length && <div className="empty-state"><Boxes size={30} /><strong>No resources recorded</strong><span>Add labor, software, assets, hardware, data, and licenses.</span></div>}</div></section></div></Modal>;
}

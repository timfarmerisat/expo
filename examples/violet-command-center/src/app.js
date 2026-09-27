import { categories, innovations } from './catalog.js';
import { generateLocalReply } from './assistant-core.js';

const APP_KEY = 'violet-workspace-v1';
const CHAT_KEY = 'violet-chat-v1';
const TASK_KEY = 'violet-tasks-v1';
const ACTIVITY_KEY = 'violet-activity-v1';
const DB_NAME = 'violet-local-assets-v1';

const navItems = [
  { id: 'overview', title: 'Overview', description: 'System health and key workspaces', icon: 'grid' },
  { id: 'intelligence', title: 'Intelligence', description: 'Local assistant and chat', icon: 'brain' },
  { id: 'innovations', title: 'Innovations', description: '77 installed frontend capabilities', icon: 'lightbulb' },
  { id: 'assets', title: 'Assets', description: 'Files stored on this browser', icon: 'layers' },
  { id: 'connections', title: 'Connections', description: 'Provider readiness and setup', icon: 'nodes' },
  { id: 'activity', title: 'Activity', description: 'Local tasks and change history', icon: 'activity' },
];

const services = [
  { name: 'Command interface', detail: 'Responsive workspace and navigation', state: 'available', icon: 'grid' },
  { name: 'Local assistant', detail: 'Guided rules · no model gateway', state: 'local', icon: 'brain' },
  { name: 'Asset vault', detail: 'IndexedDB · this browser only', state: 'local', icon: 'layers' },
  { name: 'Provider services', detail: 'OAuth authorization not configured', state: 'disconnected', icon: 'nodes' },
];

const providers = [
  { id: 'drive', name: 'Google Drive', summary: 'Documents, source bundles, and project files', icon: 'drive', setup: 'A backend OAuth client, an approved redirect URL, and the provider scopes required for the selected Drive workflow. No Drive account is linked by this local build.' },
  { id: 'microsoft', name: 'Microsoft 365', summary: 'Files, mail, and organization resources', icon: 'microsoft', setup: 'An Entra application registration, approved redirect URL, tenant selection, and consent for the minimum required Graph scopes. Do not paste a client secret into this browser.' },
  { id: 'dropbox', name: 'Dropbox', summary: 'Shared project files and media', icon: 'dropbox', setup: 'A Dropbox app registration, redirect URL, and least-privilege permissions for the chosen workflow. Tokens belong in a secure backend.' },
  { id: 'github', name: 'GitHub', summary: 'Source repository and delivery history', icon: 'github', setup: 'A GitHub App or OAuth app with repository access limited to the intended project. This UI does not have a repository token.' },
  { id: 'model', name: 'AI model gateway', summary: 'Optional hosted model for richer assistant responses', icon: 'sparkles', setup: 'A server-side model integration and secret-managed credential. The local assistant is active without a remote model. Never put an API key in this page or browser storage.' },
  { id: 'bridge', name: 'Local device bridge', summary: 'Bluetooth, Wi-Fi, and paired device health', icon: 'device', setup: 'A signed local bridge or native application with explicit device pairing and permission handling. A normal web page cannot report your Bluetooth or Wi-Fi device state.' },
];

const iconPaths = {
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
  brain: '<path d="M9.1 4.2A3.3 3.3 0 0 0 3.7 7a3.5 3.5 0 0 0 .5 5.7 3.4 3.4 0 0 0 4.9 5.1V5.2M14.9 4.2A3.3 3.3 0 0 1 20.3 7a3.5 3.5 0 0 1-.5 5.7 3.4 3.4 0 0 1-4.9 5.1V5.2M8.9 8.1h2.2m2 4h-2m-2 4h2.2M6.1 7.5l2 1.2m7.8-1.2-2 1.2m-7.8 6.9 2-1.1m7.8 1.1-2-1.1"/>',
  lightbulb: '<path d="M9 18h6m-5 3h4m-2-19a7 7 0 0 0-4.4 12.4c.8.7 1.4 1.5 1.4 2.6h6c0-1.1.6-1.9 1.4-2.6A7 7 0 0 0 12 2Z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  nodes: '<circle cx="12" cy="5" r="2.4"/><circle cx="5.2" cy="17.5" r="2.4"/><circle cx="18.8" cy="17.5" r="2.4"/><path d="m10.8 7.1-4.4 8.1m7-8.1 4.3 8.1M7.7 17.5h8.6"/>',
  activity: '<path d="M3 12h4l2.5-7 4 14 2.5-7h5"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  sparkle: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 12 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 2l.7 2.3L8 5l-2.3.7L5 8l-.7-2.3L2 5l2.3-.7L5 2Z"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  mic: '<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0m-7 7v3m-4 0h8"/>',
  send: '<path d="m21 3-7.2 18-3.5-7.3L3 10.2 21 3Z"/><path d="M10.3 13.7 15 9"/>',
  command: '<path d="M9 7V5.5a2.5 2.5 0 1 0-2.5 2.5H9Zm0 0v10m0 0v1.5a2.5 2.5 0 1 1-2.5-2.5H9Zm0 0h6m0-10h1.5A2.5 2.5 0 1 0 14 5.5V7Zm0 0v10m0 0v1.5a2.5 2.5 0 1 0 2.5-2.5H15Z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m-13 4h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>',
  filter: '<path d="M4 6h16M7 12h10m-7 6h4"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 20h16"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  trash: '<path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M20 20a8 8 0 0 0-8-8H4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6m-10 4H8m8 4H8m8 4H8"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6-.2.1a8 8 0 0 1-1.5.9l-.3.1-.2 1.8h-2.8l-.3-1.8-.3-.1a8 8 0 0 1-1.5-.9l-.2-.1-1.7.6-1.4-2.4 1.4-1.1.1-.3a8 8 0 0 1 0-1.8l-.1-.3-1.4-1.1 1.4-2.4 1.7.6.2-.1a8 8 0 0 1 1.5-.9l.3-.1.3-1.8h2.8l.2 1.8.3.1a8 8 0 0 1 1.5.9l.2.1 1.7-.6 1.4 2.4-1.4 1.1-.1.3a8 8 0 0 1 0 1.8Z"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.3 2c-1.1.9-1.8 1.3-1.8 3m0 3h.01"/>',
  github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-1-2.6c3.3-.4 6.8-1.6 6.8-7.2a5.6 5.6 0 0 0-1.5-3.9A5.2 5.2 0 0 0 19.2 1S18 1 15.6 2.8a13.2 13.2 0 0 0-7.2 0C6 1 4.8 1 4.8 1a5.2 5.2 0 0 0-.1 3.4 5.6 5.6 0 0 0-1.5 3.9c0 5.6 3.5 6.8 6.8 7.2a3.4 3.4 0 0 0-1 2.6V22"/>',
  drive: '<path d="m9 3-7 12 4 6h14l3-6-7-12H9Z"/><path d="m9 3 7 12m-14 0h14m0 0 4 6m-4-6 3-6"/>',
  microsoft: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
  dropbox: '<path d="m7 4-5 3 5 3 5-3-5-3Zm10 0-5 3 5 3 5-3-5-3ZM7 11l-5 3 5 3 5-3-5-3Zm10 0-5 3 5 3 5-3-5-3ZM7 18l5 3 5-3"/>',
  device: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8m-4-4v4M7 9h.01M10 9h.01"/>',
};

const icon = (name, size = 18, extra = '') => `<svg class="icon ${extra}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] ?? iconPaths.sparkle}</svg>`;
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const prettySize = (bytes = 0) => bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;
const dateLabel = (date) => Number.isFinite(new Date(date).getTime()) ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date)) : 'Date unavailable';
const timeLabel = (date) => Number.isFinite(new Date(date).getTime()) ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(date)) : 'Time unavailable';
const relativeLabel = (date) => {
  const diff = new Date(date).getTime() - Date.now();
  if (!Number.isFinite(diff)) return 'Date unavailable';
  const day = Math.round(diff / 86_400_000);
  if (day === 0) return 'Today';
  if (day === 1) return 'Tomorrow';
  if (day === -1) return 'Yesterday';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(date));
};

function readJSON(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key) ?? 'null'); return value ?? fallback; }
  catch { return fallback; }
}

function readArray(key) { const value = readJSON(key, []); return Array.isArray(value) ? value : []; }
function validTimestamp(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }
function normalizedTimestamp(value) { return validTimestamp(value) ? new Date(value).toISOString() : new Date().toISOString(); }
function cleanTask(item) {
  if (!item || typeof item.title !== 'string' || !item.title.trim() || typeof item.done !== 'boolean') return null;
  return { id: typeof item.id === 'string' && /^[\w-]{1,64}$/.test(item.id) ? item.id : crypto.randomUUID(), title: item.title.trim().slice(0, 140), note: typeof item.note === 'string' ? item.note.slice(0, 400) : '', due: typeof item.due === 'string' && Number.isFinite(Date.parse(item.due)) ? item.due : null, priority: ['normal', 'important', 'urgent'].includes(item.priority) ? item.priority : 'normal', done: item.done, createdAt: normalizedTimestamp(item.createdAt) };
}
function cleanMessage(item) {
  if (!item || !['assistant', 'user'].includes(item.role) || typeof item.text !== 'string') return null;
  return { role: item.role, text: item.text.slice(0, 8000), source: typeof item.source === 'string' ? item.source.slice(0, 240) : 'Local workspace data', at: normalizedTimestamp(item.at) };
}
function cleanActivity(item) {
  if (!item || typeof item.title !== 'string' || typeof item.detail !== 'string') return null;
  return { id: typeof item.id === 'string' && /^[\w-]{1,64}$/.test(item.id) ? item.id : crypto.randomUUID(), title: item.title.slice(0, 140), detail: item.detail.slice(0, 400), icon: Object.hasOwn(iconPaths, item.icon) ? item.icon : 'activity', tone: ['green', 'amber', 'cyan', 'blue', 'violet'].includes(item.tone) ? item.tone : 'violet', at: normalizedTimestamp(item.at) };
}

const savedPreferences = readJSON(APP_KEY, {});
const preferences = { theme: 'dark', compact: Boolean(savedPreferences?.compact), reducedMotion: Boolean(savedPreferences?.reducedMotion), fontScale: savedPreferences?.fontScale === 'large' ? 'large' : 'normal' };
const state = {
  page: 'overview',
  category: 'all',
  innovationQuery: '',
  assetQuery: '',
  assetFilter: 'active',
  assetSort: 'newest',
  taskFilter: 'open',
  taskQuery: '',
  tasks: readArray(TASK_KEY).map(cleanTask).filter(Boolean),
  activity: readArray(ACTIVITY_KEY).map(cleanActivity).filter(Boolean),
  chat: readArray(CHAT_KEY).map(cleanMessage).filter(Boolean),
  assets: [],
  health: { ok: false, checkedAt: null },
  preferences,
  installPrompt: null,
  isOnline: navigator.onLine,
};

const appRoot = document.querySelector('#app');
const toastRegion = document.querySelector('#toast-region');
let dbPromise;
let pendingConfirm = null;

function persist(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { toast('Browser storage is full. Export a backup or remove older records.'); return false; }
}

function iconButton(name, label, action, extra = '') {
  return `<button class="icon-button ${extra}" type="button" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}" data-action="${action}">${icon(name, 18)}</button>`;
}

function statusDot(status) { return `<span class="status-dot ${escapeHtml(status)}" aria-hidden="true"></span>`; }

function navMarkup() {
  return `<aside class="sidebar" id="sidebar" aria-label="Primary navigation">
    <div class="sidebar-brand"><span class="brand-mark" aria-hidden="true"><span></span></span><div><strong>VIOLET 1011</strong><small>SOVEREIGN COMMAND CENTER</small></div></div>
    <div class="nav-caption">WORKSPACE</div>
    <nav class="primary-nav">${navItems.map((item) => `<button class="nav-item ${state.page === item.id ? 'active' : ''}" type="button" data-page="${item.id}" aria-current="${state.page === item.id ? 'page' : 'false'}">
      <span class="nav-icon">${icon(item.icon, 19)}</span><span class="nav-copy"><span class="nav-title">${item.title}</span><span class="nav-description">${item.description}</span></span>${state.page === item.id ? '<span class="active-mark" aria-hidden="true"></span>' : ''}
    </button>`).join('')}</nav>
    <div class="sidebar-spacer"></div>
    <div class="sidebar-local"><span class="status-dot green"></span><div><strong>Local workspace</strong><small>Private to this browser</small></div></div>
    <button class="nav-item settings-nav" type="button" data-action="settings"><span class="nav-icon">${icon('settings', 19)}</span><span class="nav-copy"><span class="nav-title">Preferences</span><span class="nav-description">Display, backup, and privacy</span></span></button>
    <div class="sidebar-footer">Violet workspace <span>v1.0.0</span></div>
  </aside>`;
}

function headerMarkup() {
  return `<header class="topbar">
    <button class="mobile-menu icon-button" type="button" aria-label="Open navigation" data-action="toggle-nav">${icon('grid', 19)}</button>
    <button class="global-search" type="button" data-action="open-search" aria-label="Search systems, assets, innovations, or ask Violet">
      ${icon('search', 18)}<span>Search systems, assets, innovations, or ask Violet…</span><kbd>Ctrl K</kbd>
    </button>
    <div class="topbar-actions">
      <span class="mode-badge"><span class="status-dot green"></span><span>LOCAL DEMO</span><span class="mode-divider"></span><span>SAMPLE SIGNALS</span></span>
      <button class="install-button" type="button" data-action="install-app">${icon('download', 15)}<span>Install</span></button>
      <button class="refresh-button" type="button" data-action="refresh">${icon('refresh', 17)}<span>Refresh</span></button>
      ${iconButton('bell', 'Open notices', 'notices', 'notice-button')}
      <button class="profile-button" type="button" data-action="profile"><span class="avatar">V</span><span class="profile-copy"><strong>Local operator</strong><small>Browser session</small></span>${icon('down', 14)}</button>
    </div>
  </header>`;
}

function shellMarkup() {
  return `${headerMarkup()}<div class="workspace-layout">${navMarkup()}<main class="workspace" id="workspace" tabindex="-1">${pageMarkup()}</main>${state.page === 'overview' ? assistantAsideMarkup() : ''}</div>
    <dialog class="modal" id="modal"><div class="modal-frame"><div class="modal-head"><div><p class="modal-kicker" id="modal-kicker">VIOLET WORKSPACE</p><h2 id="modal-title">Details</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Close">${icon('close')}</button></div><div class="modal-content" id="modal-content"></div></div></dialog>
    <dialog class="command-modal" id="command-modal"><div class="command-search-form"><label for="command-query">Search the workspace</label><div class="command-query-wrap">${icon('search')}<input id="command-query" type="search" placeholder="Find a page, feature, asset, or task…" autocomplete="off"><kbd>ESC</kbd></div></div><div id="command-results" class="command-results"></div><div class="command-help">Use ↑ ↓ to move · Enter to open · Esc to close</div></dialog>`;
}

function pageMarkup() {
  if (state.page === 'overview') return overviewPage();
  if (state.page === 'intelligence') return intelligencePage();
  if (state.page === 'innovations') return innovationsPage();
  if (state.page === 'assets') return assetsPage();
  if (state.page === 'connections') return connectionsPage();
  return activityPage();
}

function pageHeader(title, description, actions = '') {
  return `<div class="page-heading"><div><h1>${title}</h1><p>${description}</p></div><div class="page-heading-actions">${actions}</div></div>`;
}

function metricCard(iconName, label, value, detail, tone = 'violet') {
  return `<article class="metric-card"><div class="metric-icon ${tone}">${icon(iconName, 19)}</div><div class="metric-main"><span>${label}</span><strong>${value}</strong><small>${detail}</small></div></article>`;
}

function networkGraphic() {
  const cx = 240, cy = 143, rx = 187, ry = 120;
  const points = [];
  for (let ring = 0; ring < 5; ring += 1) {
    const count = 8 + ring * 3;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i / count) + ring * 0.47;
      const scale = 0.3 + ring * 0.16;
      const x = cx + Math.cos(angle) * rx * scale;
      const y = cy + Math.sin(angle) * ry * scale;
      const depth = Math.sin(angle * 1.4 + ring) * 0.5 + 0.5;
      points.push({ x, y, ring, depth });
    }
  }
  const lines = [];
  points.forEach((point, index) => {
    let nearest = [];
    points.forEach((other, otherIndex) => {
      if (index === otherIndex) return;
      const dx = point.x - other.x;
      const dy = point.y - other.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 70 && distance > 7) nearest.push({ other, otherIndex, distance });
    });
    nearest.sort((a, b) => a.distance - b.distance).slice(0, 3).forEach(({ other, otherIndex }) => {
      if (otherIndex > index) lines.push(`<line x1="${point.x.toFixed(1)}" y1="${point.y.toFixed(1)}" x2="${other.x.toFixed(1)}" y2="${other.y.toFixed(1)}" stroke="url(#network-line)" stroke-width=".8" opacity="${(0.14 + point.depth * .28).toFixed(2)}"/>`);
    });
  });
  return `<svg class="network-svg" viewBox="0 0 480 286" role="img" aria-label="Illustrative neural network graphic; this is not live agent telemetry">
    <defs><radialGradient id="globe" cx="45%" cy="38%"><stop stop-color="#a990ff" stop-opacity=".72"/><stop offset=".53" stop-color="#6652c9" stop-opacity=".3"/><stop offset="1" stop-color="#151b39" stop-opacity=".06"/></radialGradient><linearGradient id="network-line" x1="0" x2="1"><stop stop-color="#8c6fff"/><stop offset=".55" stop-color="#5d9eff"/><stop offset="1" stop-color="#67e2e8"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="2.7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#globe)" stroke="#8270ff" stroke-opacity=".22"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx * .68}" ry="${ry}" fill="none" stroke="#8e7dff" stroke-opacity=".25"/><ellipse cx="${cx}" cy="${cy}" rx="${rx * .35}" ry="${ry}" fill="none" stroke="#8e7dff" stroke-opacity=".18"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry * .34}" fill="none" stroke="#8e7dff" stroke-opacity=".25"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry * .68}" fill="none" stroke="#8e7dff" stroke-opacity=".18"/>
    ${lines.join('')}
    ${points.map((point, index) => `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${index % 9 === 0 ? 2.2 : 1.25}" fill="${index % 4 === 0 ? '#c5b0ff' : index % 4 === 1 ? '#83ccff' : '#9f8cff'}" opacity="${(0.5 + point.depth * .48).toFixed(2)}"/>`).join('')}
    <circle class="network-core" cx="240" cy="143" r="5" fill="#f0e7ff" filter="url(#glow)"/>
  </svg>`;
}

function conversationSteps() {
  const steps = ['Listening', 'Understanding', 'Planning', 'Awaiting approval', 'Executing', 'Verifying', 'Reporting', 'Ready'];
  return `<ol class="state-list">${steps.map((step, i) => `<li class="${i === steps.length - 1 ? 'current' : 'complete'}"><span class="state-marker">${i < steps.length - 1 ? icon('check', 10) : ''}</span><span><strong>${step}</strong><small>${i === steps.length - 1 ? 'Local assistant idle' : 'Available workflow state'}</small></span></li>`).join('')}</ol>`;
}

function serviceRows() {
  return services.map((service) => `<div class="service-row"><span class="service-icon">${icon(service.icon, 15)}</span><div class="service-copy"><strong>${service.name}</strong><small>${service.detail}</small></div><span class="service-state ${service.state}">${service.state === 'available' ? 'Ready' : service.state === 'local' ? 'Local' : 'Not connected'}</span></div>`).join('');
}

function overviewPage() {
  const assetCount = state.assets.filter((asset) => !asset.deletedAt).length;
  const apiLabel = state.health.ok ? 'Ready' : state.health.checkedAt ? 'Unavailable' : 'Checking';
  return `${pageHeader('Violet Intelligence Command Center', 'Observe, understand, and coordinate your Violet workspace.', `<span class="date-block"><strong>${dateLabel(new Date())}</strong><small>${timeLabel(new Date())} · local time</small></span>`)}
    <div class="metric-grid">
      ${metricCard('sparkle', 'Frontend innovations', '77 / 77', 'Installed in this local build', 'violet')}
      ${metricCard('nodes', 'Remote providers', '0 linked', 'Authorization not configured', 'blue')}
      ${metricCard('layers', 'Browser assets', String(assetCount), 'Stored on this device', 'cyan')}
      ${metricCard('activity', 'Local runtime', apiLabel, state.health.checkedAt ? `Checked ${timeLabel(state.health.checkedAt)}` : 'Checking local health route', state.health.ok ? 'green' : 'amber')}
    </div>
    <div class="overview-grid">
      <section class="surface network-panel">
        <div class="surface-heading"><div class="section-icon violet">${icon('nodes', 18)}</div><div><h2>Intelligence network</h2><p>Illustrative system map · no live agent telemetry</p></div><button class="subtle-select" type="button" data-action="network-info">Local view ${icon('down', 14)}</button></div>
        <div class="network-content"><div class="network-readouts"><div><strong>77</strong><span>Interface capabilities</span><div class="mini-track"><i style="width:100%"></i></div></div><div><strong>0</strong><span>External providers</span><div class="mini-track blue"><i style="width:0%"></i></div></div><div><strong>${assetCount}</strong><span>Local assets</span><div class="mini-track cyan"><i style="width:${Math.min(100, assetCount * 10)}%"></i></div></div><div class="network-legend"><span><i class="legend-dot lavender"></i>Interface</span><span><i class="legend-dot cyan"></i>Local data</span><span><i class="legend-dot blue"></i>Optional adapter</span></div></div><div class="network-stage">${networkGraphic()}<span class="network-float float-knowledge">${icon('database', 14)} Local knowledge</span><span class="network-float float-workflow">${icon('nodes', 14)} Workflows</span><span class="network-float float-assets">${icon('layers', 14)} Assets</span></div></div>
        <div class="network-foot"><span>${icon('shield', 15)} No external accounts connected</span><button class="text-button" type="button" data-page="connections">Review connections ${icon('arrow', 14)}</button></div>
      </section>
      <section class="surface conversation-panel"><div class="surface-heading"><div class="section-icon blue">${icon('activity', 18)}</div><div><h2>Conversation state</h2><p>One flow for chat and voice</p></div><span class="idle-pill"><i></i>Ready</span></div>${conversationSteps()}<button class="panel-link" type="button" data-page="intelligence">Open assistant workspace ${icon('arrow', 14)}</button></section>
      <section class="surface telemetry-panel"><div class="surface-heading"><div class="section-icon cyan">${icon('activity', 18)}</div><div><h2>Service telemetry</h2><p>Local checks and provider readiness</p></div>${iconButton('refresh', 'Refresh local service checks', 'refresh')}</div><div class="service-list">${serviceRows()}</div><div class="surface-foot"><span>${statusDot(state.health.ok ? 'green' : 'amber')} ${state.health.ok ? 'Local health endpoint responded' : 'Local health check pending'}</span><span>${state.health.checkedAt ? timeLabel(state.health.checkedAt) : 'No check yet'}</span></div></section>
      <section class="surface readiness-panel"><div class="surface-heading"><div class="section-icon violet">${icon('sparkle', 18)}</div><div><h2>Innovation readiness</h2><p>Front-end installation status</p></div><button class="small-link" type="button" data-page="innovations">View all</button></div><div class="readiness-content"><div class="readiness-ring"><div><strong>77</strong><span>of 77 installed</span></div></div><div class="readiness-copy"><strong>All catalogued interface modules are present.</strong><p>Provider sign-in, remote model access, and device pairing still require their separate services.</p><button class="text-button" type="button" data-page="innovations">Explore innovations ${icon('arrow', 14)}</button></div></div></section>
      <section class="surface rollout-panel"><div class="rollout-title"><div class="section-icon violet">${icon('layers', 18)}</div><div><h2>77-innovation installation</h2><p>All seven departments included in this build.</p></div><span class="rollout-total">77 <small>features</small></span></div><div class="category-progress">${categories.map((category) => { const count = innovations.filter((item) => item.category === category.id).length; return `<button type="button" class="progress-group" data-category="${category.id}" data-page="innovations"><span>${icon(category.icon, 15)}<strong>${category.label}</strong></span><span class="progress-count">${count} installed</span><span class="progress-track"><i class="${category.accent}" style="width:100%"></i></span></button>`; }).join('')}</div></section>
    </div>`;
}

function assistantAsideMarkup() {
  const lastAssistant = [...state.chat].reverse().find((message) => message.role === 'assistant');
  const preview = lastAssistant?.text ?? 'I can summarize local status, search the 77-feature registry, explain connection requirements, and organize your next step.';
  return `<aside class="assistant-aside" aria-label="Violet local assistant"><div class="assistant-head"><div class="assistant-avatar">${icon('sparkle', 19)}</div><div><h2>Violet assistant</h2><p>Guided local assistant</p></div><span class="local-pill">LOCAL</span></div><div class="assistant-intro"><span class="assistant-orb">${icon('sparkle', 20)}</span><div><p class="assistant-label">Violet · local guidance</p><p>${escapeHtml(preview)}</p></div></div><div class="recommendation-block"><div class="recommendation-title">${icon('lightbulb', 16)}<strong>Next useful step</strong></div><button class="recommendation-card" type="button" data-page="connections"><span><strong>Review provider setup</strong><small>Connect real accounts only after secure OAuth is configured.</small></span>${icon('chevron', 17)}</button></div><div class="assistant-prompts"><button type="button" data-prompt="Summarize the local system status">${icon('search', 14)}Summarize local status</button><button type="button" data-prompt="Show innovation status">${icon('sparkle', 14)}Show innovation status</button><button type="button" data-prompt="What needs attention?">${icon('help', 14)}What needs attention?</button></div><form class="assistant-composer compact-composer" data-form="chat"><label class="sr-only" for="aside-chat-input">Ask Violet</label><textarea id="aside-chat-input" name="message" rows="1" placeholder="Ask Violet about this workspace…" required></textarea><button class="send-button" aria-label="Send message">${icon('send', 17)}</button></form><div class="assistant-foot">No remote AI service connected. Chat stays in this browser.</div></aside>`;
}

function intelligencePage() {
  const messages = state.chat.length ? state.chat : [{ role: 'assistant', text: 'Hello. I can help you navigate the installed feature registry, review local assets and tasks, and explain which integrations still need setup.', source: 'Local feature registry', at: new Date().toISOString() }];
  return `${pageHeader('Intelligence workspace', 'Chat and voice share one local conversation. Replies use installed workspace data and guided rules.', `<button class="secondary-button" type="button" data-action="read-last">${icon('activity', 16)} Read latest reply</button><button class="secondary-button" type="button" data-action="export-chat">${icon('download', 16)} Export chat</button>`)}
    <section class="surface intelligence-shell"><div class="intelligence-main"><div class="conversation-toolbar"><div><span class="status-dot green"></span><strong>Local assistant ready</strong><small>Heuristic guidance · remote model not configured</small></div><button class="small-link" type="button" data-action="clear-chat">Clear conversation</button></div><div class="conversation-state-strip">${['Listening', 'Understanding', 'Planning', 'Awaiting approval', 'Executing', 'Verifying', 'Reporting', 'Ready'].map((step, i) => `<span class="state-chip ${i === 7 ? 'current' : ''}">${i === 7 ? statusDot('green') : '<i></i>'}${step}</span>`).join('')}</div><div class="chat-transcript" id="chat-transcript" aria-live="polite">${messages.map(messageMarkup).join('')}</div><div class="quick-prompts">${['Summarize the local system status', 'Show innovation status', 'List local assets', 'What needs attention?'].map((prompt) => `<button type="button" data-prompt="${escapeHtml(prompt)}">${prompt}</button>`).join('')}</div><form class="assistant-composer full-composer" data-form="chat"><label class="sr-only" for="chat-input">Ask Violet</label><textarea id="chat-input" name="message" rows="2" placeholder="Ask about features, local assets, tasks, or connections…" required></textarea><div class="composer-actions"><span>${icon('shield', 14)} Typed text stays local · browser dictation privacy varies</span><div><button class="icon-button" type="button" data-action="dictate" aria-label="Dictate message. Browser speech-service privacy may vary." title="Dictate · browser speech-service privacy may vary">${icon('mic', 18)}</button><button class="send-button" aria-label="Send message">${icon('send', 17)}</button></div></div></form></div><aside class="intelligence-context"><div class="context-head"><div class="section-icon violet">${icon('sparkle', 17)}</div><div><h2>Workspace context</h2><p>Available to local guidance</p></div></div><div class="context-item"><span>${icon('lightbulb', 16)}</span><div><strong>Innovation registry</strong><small>77 installed frontend entries</small></div><button type="button" data-page="innovations" aria-label="Open innovations">${icon('chevron', 15)}</button></div><div class="context-item"><span>${icon('layers', 16)}</span><div><strong>Browser assets</strong><small>${state.assets.filter((asset) => !asset.deletedAt).length} files in local vault</small></div><button type="button" data-page="assets" aria-label="Open assets">${icon('chevron', 15)}</button></div><div class="context-item"><span>${icon('calendar', 16)}</span><div><strong>Open tasks</strong><small>${state.tasks.filter((task) => !task.done).length} local tasks</small></div><button type="button" data-page="activity" aria-label="Open tasks">${icon('chevron', 15)}</button></div><div class="context-separator"></div><div class="attention-card"><span class="attention-icon">${icon('shield', 17)}</span><strong>Remote services are off</strong><p>Provider sign-in, device pairing, and a hosted AI model have not been configured.</p><button type="button" class="text-button" data-page="connections">Review setup ${icon('arrow', 14)}</button></div></aside></section>`;
}

function messageMarkup(message, index) {
  const assistant = message.role === 'assistant';
  return `<article class="message ${assistant ? 'assistant-message' : 'user-message'}"><div class="message-avatar ${assistant ? 'bot' : 'person'}">${assistant ? icon('sparkle', 15) : 'T'}</div><div class="message-body"><div class="message-meta"><strong>${assistant ? 'Violet · local guidance' : 'You'}</strong><time>${timeLabel(message.at ?? new Date())}</time></div><p>${escapeHtml(message.text)}</p>${assistant ? `<div class="message-source">${icon('database', 13)} ${escapeHtml(message.source ?? 'Local workspace data')}<button type="button" class="message-copy" data-action="copy-message" data-index="${index}" aria-label="Copy response">${icon('copy', 14)} Copy</button><button type="button" class="message-speak" data-action="speak-message" data-index="${index}" aria-label="Read response aloud">${icon('activity', 14)} Read</button></div>` : ''}</div></article>`;
}

function innovationsPage() {
  const query = state.innovationQuery.trim().toLowerCase();
  const filtered = innovations.filter((item) => (state.category === 'all' || item.category === state.category) && (!query || `${item.id} ${item.title} ${item.description}`.toLowerCase().includes(query)));
  const selectedCategory = categories.find((category) => category.id === state.category);
  return `${pageHeader('77 installed innovations', 'Every catalogued capability below is included in this local front end. Live account services require separate setup.', `<button class="secondary-button" type="button" data-action="export-innovations">${icon('download', 16)} Export registry</button>`)}
    <section class="surface registry-summary"><div class="registry-count"><div class="registry-count-ring">77</div><div><strong>Installed in this front-end build</strong><p>Grouped across seven departments. Each entry describes an available local control or experience.</p></div></div><div class="registry-meta"><span>${icon('search', 16)} Searchable registry</span><span>${icon('check', 16)} 77 of 77 present</span><span>${icon('shield', 16)} External providers remain disconnected</span></div></section>
    <div class="registry-toolbar"><label class="input-search">${icon('search', 17)}<input id="innovation-query" type="search" value="${escapeHtml(state.innovationQuery)}" placeholder="Find an innovation…" aria-label="Search innovations"></label><button class="filter-button" type="button" data-action="reset-innovation-filter">${icon('filter', 16)} Reset filters</button></div>
    <div class="registry-layout"><aside class="category-list" aria-label="Filter by department"><button type="button" class="category-filter ${state.category === 'all' ? 'selected' : ''}" data-category="all"><span>${icon('grid', 17)}<strong>All departments</strong></span><small>${innovations.length}</small></button>${categories.map((category) => { const count = innovations.filter((item) => item.category === category.id).length; return `<button type="button" class="category-filter ${state.category === category.id ? 'selected' : ''}" data-category="${category.id}"><span>${icon(category.icon, 17)}<strong>${category.label}</strong></span><small>${count}</small></button>`; }).join('')}</aside><section class="innovation-results"><div class="results-header"><div><h2>${selectedCategory ? selectedCategory.label : 'All departments'}</h2><p>${filtered.length} installed ${filtered.length === 1 ? 'capability' : 'capabilities'}</p></div><span class="installed-label"><i></i> Installed in local frontend</span></div><div class="innovation-list">${filtered.length ? filtered.map((item) => `<button type="button" class="innovation-row" data-innovation="${item.id}"><span class="innovation-id">${item.id}</span><span class="innovation-copy"><strong>${item.title}</strong><small>${item.description}</small></span><span class="installed-tag"><span class="status-dot green"></span>Installed</span>${icon('chevron', 16)}</button>`).join('') : `<div class="empty-state">${icon('search', 24)}<strong>No matching innovations</strong><p>Try a different search phrase or clear the department filter.</p></div>`}</div></section></div>`;
}

function assetRow(asset, index) {
  const type = escapeHtml((asset.type || 'File').split('/').pop().toUpperCase().slice(0, 5) || 'FILE');
  return `<tr><td><div class="file-cell"><span class="file-type">${type}</span><span><strong>${escapeHtml(asset.name)}</strong><small>${escapeHtml(asset.id.slice(0, 12))} · ${asset.checksum ? `SHA-256 ${escapeHtml(asset.checksum.slice(0, 12))}…` : 'Checksum pending'}</small></span></div></td><td>${prettySize(asset.size)}</td><td>${dateLabel(asset.addedAt)}</td><td><span class="file-state ${asset.deletedAt ? 'trash-state' : 'saved-state'}">${asset.deletedAt ? 'Recently deleted' : 'On this device'}</span></td><td><div class="row-actions">${asset.deletedAt ? `<button type="button" data-action="restore-asset" data-id="${escapeHtml(asset.id)}" aria-label="Restore ${escapeHtml(asset.name)}">${icon('undo', 16)}</button>` : `<button type="button" data-action="download-asset" data-id="${escapeHtml(asset.id)}" aria-label="Download ${escapeHtml(asset.name)}">${icon('download', 16)}</button><button type="button" data-action="delete-asset" data-id="${escapeHtml(asset.id)}" aria-label="Move ${escapeHtml(asset.name)} to recently deleted">${icon('trash', 16)}</button>`}</div></td></tr>`;
}

function assetsPage() {
  const q = state.assetQuery.trim().toLowerCase();
  let visible = state.assets.filter((asset) => state.assetFilter === 'trash' ? Boolean(asset.deletedAt) : !asset.deletedAt);
  if (q) visible = visible.filter((asset) => `${asset.name} ${asset.type} ${asset.checksum}`.toLowerCase().includes(q));
  if (state.assetSort === 'name') visible.sort((a, b) => a.name.localeCompare(b.name));
  else if (state.assetSort === 'size') visible.sort((a, b) => b.size - a.size);
  else visible.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  const activeCount = state.assets.filter((asset) => !asset.deletedAt).length;
  return `${pageHeader('Asset library', 'Manage files stored privately in this browser profile. Uploads do not leave this device.', `<button class="secondary-button" type="button" data-action="export-assets">${icon('download', 16)} Export metadata</button><button class="secondary-button" type="button" data-action="export-assets-csv">${icon('download', 16)} Export CSV</button><button class="primary-button" type="button" data-action="choose-files">${icon('upload', 16)} Add assets</button>`)}
    <section class="surface asset-notice"><div class="notice-symbol">${icon('shield', 19)}</div><div><strong>Local asset vault</strong><p>Selected files are stored in this browser’s IndexedDB. They are not uploaded or synced to cloud providers.</p></div><span>${icon('database', 15)} ${activeCount} active</span></section>
    <section class="surface asset-table-panel"><div class="asset-toolbar"><label class="input-search">${icon('search', 17)}<input id="asset-query" type="search" value="${escapeHtml(state.assetQuery)}" placeholder="Search files…" aria-label="Search files"></label><div class="asset-tools"><select id="asset-filter" aria-label="Filter assets"><option value="active" ${state.assetFilter === 'active' ? 'selected' : ''}>Active assets</option><option value="trash" ${state.assetFilter === 'trash' ? 'selected' : ''}>Recently deleted</option></select><select id="asset-sort" aria-label="Sort assets"><option value="newest" ${state.assetSort === 'newest' ? 'selected' : ''}>Newest first</option><option value="name" ${state.assetSort === 'name' ? 'selected' : ''}>Name A to Z</option><option value="size" ${state.assetSort === 'size' ? 'selected' : ''}>Largest first</option></select></div></div><div class="table-scroll"><table class="asset-table"><thead><tr><th>Asset</th><th>Size</th><th>Added</th><th>Storage state</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${visible.map(assetRow).join('')}</tbody></table>${visible.length ? '' : `<div class="empty-state asset-empty">${icon(state.assetFilter === 'trash' ? 'trash' : 'layers', 25)}<strong>${state.assetFilter === 'trash' ? 'Recently deleted is clear' : 'No assets in this browser yet'}</strong><p>${state.assetFilter === 'trash' ? 'Files you move to recently deleted will appear here for recovery.' : 'Choose Add assets to store files locally and calculate their checksums.'}</p>${state.assetFilter === 'active' ? `<button type="button" class="secondary-button" data-action="choose-files">${icon('upload', 15)} Add your first asset</button>` : ''}</div>`}</div><div class="asset-table-foot"><span>Showing ${visible.length} ${visible.length === 1 ? 'file' : 'files'} · ${state.assetFilter === 'trash' ? 'Recoverable trash' : 'Browser-local storage'}</span><span>Maximum selected file size: 20 MB</span></div></section><input id="asset-file-picker" class="visually-hidden" type="file" multiple aria-label="Choose files to store in the local asset vault" />`;
}

function connectionsPage() {
  return `${pageHeader('Connections & devices', 'Review provider readiness and the requirements for a secure, real connection.', `<button class="secondary-button" type="button" data-action="copy-setup">${icon('copy', 16)} Copy setup checklist</button>`)}
    <section class="surface connection-summary"><div class="connection-ring"><strong>0</strong><span>connected</span></div><div><h2>No external provider is connected</h2><p>This build shows integration status without claiming an account link. Sign-in belongs in an authorized backend or native bridge.</p><button type="button" class="text-button" data-action="connection-boundary">Review security boundary ${icon('arrow', 14)}</button></div><div class="connection-status-box"><span class="status-dot amber"></span><div><strong>Local demo mode</strong><small>Connections require real authorization</small></div></div></section>
    <div class="provider-grid">${providers.map((provider) => `<article class="surface provider-card"><div class="provider-top"><span class="provider-icon ${provider.id}">${icon(provider.icon, 20)}</span><span class="disconnected-state"><i></i>Not connected</span></div><h2>${provider.name}</h2><p>${provider.summary}</p><div class="provider-meta"><span>${icon('activity', 14)} No live heartbeat</span><span>${icon('shield', 14)} Credentials not stored</span></div><button class="secondary-button full-button" type="button" data-provider="${provider.id}">Review setup ${icon('arrow', 15)}</button></article>`).join('')}</div>
    <section class="surface bridge-note"><div class="section-icon blue">${icon('device', 18)}</div><div><h2>Bluetooth and Wi-Fi device health</h2><p>A web browser cannot reliably inspect paired device state or start a persistent local service. The Local Device Bridge panel stays explicit until a signed native bridge is installed and paired.</p></div><button class="small-link" type="button" data-provider="bridge">Why unavailable? ${icon('chevron', 14)}</button></section>`;
}

function taskRow(task) {
  return `<article class="task-row ${task.done ? 'done' : ''}"><button class="task-check ${task.done ? 'checked' : ''}" type="button" data-action="toggle-task" data-id="${escapeHtml(task.id)}" aria-label="${task.done ? 'Reopen' : 'Complete'} ${escapeHtml(task.title)}">${task.done ? icon('check', 14) : ''}</button><div class="task-main"><strong>${escapeHtml(task.title)}</strong>${task.note ? `<small>${escapeHtml(task.note)}</small>` : ''}<span class="task-meta"><i class="priority-dot ${escapeHtml(task.priority)}"></i>${escapeHtml(task.priority)} priority ${task.due ? `· Due ${relativeLabel(task.due)}` : '· No due date'}</span></div><button class="task-remove" type="button" data-action="delete-task" data-id="${escapeHtml(task.id)}" aria-label="Remove task ${escapeHtml(task.title)}">${icon('trash', 15)}</button></article>`;
}

function activityPage() {
  const q = state.taskQuery.trim().toLowerCase();
  const tasks = state.tasks.filter((task) => state.taskFilter === 'all' || (state.taskFilter === 'open' ? !task.done : task.done)).filter((task) => !q || `${task.title} ${task.note}`.toLowerCase().includes(q)).sort((a, b) => (a.done === b.done ? String(a.due ?? '9999').localeCompare(String(b.due ?? '9999')) : Number(a.done) - Number(b.done)));
  return `${pageHeader('Activity & tasks', 'Keep working notes and next steps in this browser. Nothing here is sent to a task provider.', `<button class="secondary-button" type="button" data-action="export-tasks">${icon('download', 16)} Export tasks</button><button class="secondary-button" type="button" data-action="export-backup">${icon('database', 16)} Backup workspace</button>`)}
    <div class="activity-grid"><section class="surface task-panel"><div class="surface-heading"><div class="section-icon violet">${icon('check', 18)}</div><div><h2>Local task board</h2><p>${state.tasks.filter((task) => !task.done).length} open · ${state.tasks.filter((task) => task.done).length} completed</p></div></div><form class="task-form" data-form="task"><label for="task-title">New task</label><input id="task-title" name="title" maxlength="140" placeholder="Add a clear next action…" required><div class="task-form-row"><input name="due" type="date" aria-label="Optional due date"><select name="priority" aria-label="Priority"><option value="normal">Normal priority</option><option value="important">Important</option><option value="urgent">Urgent</option></select><button class="primary-button" type="submit">${icon('plus', 16)} Add task</button></div><textarea name="note" rows="2" maxlength="400" placeholder="Optional working note"></textarea></form><div class="task-toolbar"><label class="input-search">${icon('search', 16)}<input id="task-query" type="search" value="${escapeHtml(state.taskQuery)}" placeholder="Find a task…" aria-label="Search tasks"></label><select id="task-filter" aria-label="Filter tasks"><option value="open" ${state.taskFilter === 'open' ? 'selected' : ''}>Open tasks</option><option value="done" ${state.taskFilter === 'done' ? 'selected' : ''}>Completed</option><option value="all" ${state.taskFilter === 'all' ? 'selected' : ''}>All tasks</option></select></div><div class="task-list">${tasks.length ? tasks.map(taskRow).join('') : `<div class="empty-state task-empty">${icon('check', 24)}<strong>${state.taskFilter === 'done' ? 'No completed tasks yet' : 'Your task list is clear'}</strong><p>Add a next step here. Tasks remain in this browser profile until exported or cleared.</p></div>`}</div></section><section class="surface activity-feed-panel"><div class="surface-heading"><div class="section-icon cyan">${icon('activity', 18)}</div><div><h2>Local activity</h2><p>Actions recorded by this interface</p></div>${iconButton('download', 'Export activity history', 'export-activity')}</div><div class="activity-feed">${state.activity.length ? state.activity.slice(0, 30).map((entry) => `<div class="activity-entry"><span class="activity-entry-icon ${escapeHtml(entry.tone ?? 'violet')}">${icon(entry.icon ?? 'check', 15)}</span><div><strong>${escapeHtml(entry.title)}</strong><p>${escapeHtml(entry.detail)}</p><time>${dateLabel(entry.at)} · ${timeLabel(entry.at)}</time></div></div>`).join('') : `<div class="empty-state">${icon('activity', 24)}<strong>No changes recorded yet</strong><p>Local actions such as adding a task or asset will appear here.</p></div>`}</div></section></div>`;
}

function render() {
  document.documentElement.dataset.theme = state.preferences.theme;
  document.documentElement.dataset.compact = String(state.preferences.compact);
  document.documentElement.dataset.fontScale = state.preferences.fontScale;
  document.documentElement.dataset.reduceMotion = String(state.preferences.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  appRoot.innerHTML = shellMarkup();
  updateClock();
  if (state.page === 'intelligence') requestAnimationFrame(() => { const transcript = document.querySelector('#chat-transcript'); if (transcript) transcript.scrollTop = transcript.scrollHeight; });
}

function updateClock() {
  const date = document.querySelector('.date-block');
  if (date) date.innerHTML = `<strong>${dateLabel(new Date())}</strong><small>${timeLabel(new Date())} · local time</small>`;
}

function toast(message, tone = 'normal') {
  const item = document.createElement('div');
  item.className = `toast ${tone}`;
  item.innerHTML = `${tone === 'success' ? icon('check', 16) : icon('help', 16)}<span>${escapeHtml(message)}</span>`;
  toastRegion.append(item);
  window.setTimeout(() => item.remove(), 3800);
}

function logActivity(title, detail, iconName = 'check', tone = 'violet') {
  state.activity.unshift({ id: crypto.randomUUID(), title, detail, icon: iconName, tone, at: new Date().toISOString() });
  state.activity = state.activity.slice(0, 100);
  persist(ACTIVITY_KEY, state.activity);
}

function openModal(title, body, kicker = 'VIOLET WORKSPACE') {
  const modal = document.querySelector('#modal');
  if (!modal) return;
  document.querySelector('#modal-title').textContent = title;
  document.querySelector('#modal-kicker').textContent = kicker;
  document.querySelector('#modal-content').innerHTML = body;
  if (!modal.open) modal.showModal();
}

function navigate(page) {
  if (!navItems.some((item) => item.id === page)) return;
  state.page = page;
  document.querySelector('#sidebar')?.classList.remove('nav-open');
  render();
  document.querySelector('#workspace')?.focus({ preventScroll: true });
}

async function checkHealth() {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch('/api/health', { cache: 'no-store' });
    const payload = await response.json();
    state.health = { ok: response.ok && payload.ok === true, checkedAt, payload };
    if (state.health.ok) document.documentElement.dataset.runtime = 'ready';
    else document.documentElement.dataset.runtime = 'error';
  } catch {
    state.health = { ok: false, checkedAt, payload: null };
    document.documentElement.dataset.runtime = 'offline';
  }
  if (state.page === 'overview') render();
}

async function refreshWorkspace() {
  const button = document.querySelector('[data-action="refresh"]');
  button?.classList.add('spinning');
  await checkHealth();
  button?.classList.remove('spinning');
  if (state.page !== 'overview') render();
  toast(state.health.ok ? 'Local runtime checked. Remote providers remain disconnected.' : 'Local runtime did not respond. Browser-local work can continue.', state.health.ok ? 'success' : 'normal');
  logActivity('Local health checked', state.health.ok ? 'The local /api/health endpoint responded.' : 'The local runtime did not respond.', 'activity', state.health.ok ? 'green' : 'amber');
}

function assistantResponse(rawText) {
  return generateLocalReply(rawText, {
    assetCount: state.assets.filter((asset) => !asset.deletedAt).length,
    openTaskCount: state.tasks.filter((task) => !task.done).length,
    healthReady: state.health.ok,
  });
}

function ensureIntro() {
  if (state.chat.length) return;
  state.chat = [{ role: 'assistant', text: 'Hello. I can help you navigate the 77 installed interface innovations, review files and tasks in this browser, or explain what is needed for a real provider connection. My responses use local guidance rules; a hosted AI model is not connected.', source: 'Local assistant setup', at: new Date().toISOString() }];
  persist(CHAT_KEY, state.chat);
}

async function sendChat(text) {
  const value = text.trim();
  if (!value) return;
  ensureIntro();
  state.chat.push({ role: 'user', text: value, at: new Date().toISOString() });
  const response = assistantResponse(value);
  state.chat.push({ role: 'assistant', ...response, at: new Date().toISOString() });
  persist(CHAT_KEY, state.chat);
  logActivity('Local assistant used', `Asked about: ${value.slice(0, 100)}`, 'brain', 'blue');
  if (state.page !== 'overview' && state.page !== 'intelligence') navigate('intelligence');
  else render();
  requestAnimationFrame(() => document.querySelector('#chat-input, #aside-chat-input')?.focus());
}

function runSearch(value) {
  const query = value.trim().toLowerCase();
  if (!query) return [];
  const results = [];
  navItems.forEach((item) => { if (`${item.title} ${item.description}`.toLowerCase().includes(query)) results.push({ title: item.title, detail: item.description, type: 'Workspace', icon: item.icon, page: item.id }); });
  innovations.filter((item) => `${item.title} ${item.description} ${item.id}`.toLowerCase().includes(query)).slice(0, 6).forEach((item) => results.push({ title: item.title, detail: item.description, type: 'Innovation', icon: 'lightbulb', page: 'innovations', id: item.id }));
  state.assets.filter((item) => !item.deletedAt && item.name.toLowerCase().includes(query)).slice(0, 5).forEach((item) => results.push({ title: item.name, detail: `Local asset · ${prettySize(item.size)}`, type: 'Asset', icon: 'file', page: 'assets' }));
  state.tasks.filter((item) => !item.done && item.title.toLowerCase().includes(query)).slice(0, 5).forEach((item) => results.push({ title: item.title, detail: 'Open local task', type: 'Task', icon: 'check', page: 'activity' }));
  providers.filter((item) => `${item.name} ${item.summary}`.toLowerCase().includes(query)).forEach((item) => results.push({ title: item.name, detail: 'Provider setup and readiness', type: 'Connection', icon: item.icon, page: 'connections', provider: item.id }));
  return results.slice(0, 12);
}

function openSearch() {
  const modal = document.querySelector('#command-modal');
  const input = document.querySelector('#command-query');
  document.querySelector('#command-results').innerHTML = `<div class="command-empty">Start typing to search local pages, innovations, files, tasks, and providers.</div>`;
  if (!modal.open) modal.showModal();
  requestAnimationFrame(() => input.focus());
}

function renderSearchResults(query) {
  const results = runSearch(query);
  const output = document.querySelector('#command-results');
  if (!output) return;
  output.innerHTML = results.length ? results.map((item, index) => `<button type="button" class="command-result ${index === 0 ? 'active' : ''}" data-search-result="${index}" data-page="${item.page}" data-provider="${item.provider ?? ''}" data-innovation="${item.id ?? ''}"><span class="command-result-icon">${icon(item.icon, 16)}</span><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></span><span class="command-result-type">${item.type}</span></button>`).join('') : `<div class="command-empty">No local results. Ask Violet in the Intelligence workspace for guided help.</div>`;
  output.dataset.results = JSON.stringify(results);
}

function categoryFilter(category) {
  state.category = category;
  render();
  if (state.page !== 'innovations') navigate('innovations');
}

function featureDialog(id) {
  const item = innovations.find((innovation) => innovation.id === id);
  if (!item) return;
  const category = categories.find((entry) => entry.id === item.category);
  openModal(item.title, `<div class="feature-detail"><div class="feature-detail-id">${item.id}</div><span class="installed-label"><i></i>${item.status}</span><p>${item.description}</p><div class="feature-detail-meta"><span>${icon(category.icon, 15)}${category.label}</span><span>${icon('shield', 15)}Local frontend capability</span></div><p class="fine-print">This entry describes an installed interface feature. It does not assert that a third-party service, account, model, or device is connected.</p><button class="primary-button" type="button" data-page="${category.id === 'assets' ? 'assets' : category.id === 'connections' ? 'connections' : category.id === 'intelligence' ? 'intelligence' : category.id === 'workflow' ? 'activity' : category.id === 'command' ? 'overview' : category.id === 'reliability' ? 'overview' : 'overview'}">Open related workspace ${icon('arrow', 15)}</button></div>`, category.label.toUpperCase());
}

function providerDialog(id) {
  const provider = providers.find((entry) => entry.id === id);
  if (!provider) return;
  openModal(`${provider.name} setup`, `<div class="setup-status"><span class="status-dot amber"></span><strong>Not connected</strong><small>No live heartbeat or authorization is available in this build.</small></div><p>${escapeHtml(provider.setup)}</p><div class="setup-checklist"><strong>Secure setup checklist</strong><ol><li>Choose the exact account and workflow to connect.</li><li>Register the provider app and approved redirect URL.</li><li>Use least-privilege scopes and test against a non-production account first.</li><li>Store access tokens and secrets in a protected backend or native key store.</li><li>Return to the app and verify a real provider health check.</li></ol></div><button class="secondary-button" type="button" data-action="copy-provider-checklist" data-provider="${provider.id}">${icon('copy', 15)} Copy this checklist</button>`, 'CONNECTION READINESS');
}

function settingsDialog() {
  openModal('Preferences & local data', `<div class="settings-list"><label class="setting-row"><span><strong>Compact data density</strong><small>Reduce spacing in feature and asset tables.</small></span><input type="checkbox" data-setting="compact" ${state.preferences.compact ? 'checked' : ''}><i></i></label><label class="setting-row"><span><strong>Reduced motion</strong><small>Minimize decorative transitions and animation.</small></span><input type="checkbox" data-setting="reducedMotion" ${state.preferences.reducedMotion ? 'checked' : ''}><i></i></label><label class="setting-row"><span><strong>Larger interface text</strong><small>Increase text size for long review sessions.</small></span><input type="checkbox" data-setting="fontScale" ${state.preferences.fontScale === 'large' ? 'checked' : ''}><i></i></label><div class="setting-row non-toggle"><span><strong>Color theme</strong><small>This Violet build uses the midnight-violet command theme.</small></span><span class="installed-label"><i></i>Midnight</span></div></div><div class="privacy-callout">${icon('shield', 17)}<span><strong>Local storage boundary</strong><small>Tasks, chat, and preferences use this browser profile. Uploaded file bytes stay in IndexedDB on this device. No credentials are stored by the frontend.</small></span></div><div class="modal-actions"><button class="secondary-button" type="button" data-action="export-backup">${icon('download', 15)} Export backup</button><label class="secondary-button import-button">${icon('upload', 15)} Restore backup<input type="file" accept="application/json,.json" data-action="import-backup" class="visually-hidden"></label><button class="text-button danger-text" type="button" data-action="clear-local-data">Clear local tasks and chat</button></div>`, 'PREFERENCES');
}

function showNotices() {
  openModal('Notices & attention', `<div class="notice-list"><article class="notice-item"><span class="notice-type amber">${icon('nodes', 16)}</span><div><strong>External providers need setup</strong><p>Google Drive, Microsoft, Dropbox, GitHub, and device bridge are not connected.</p><button type="button" class="text-button" data-page="connections">Review connection requirements ${icon('arrow', 13)}</button></div></article><article class="notice-item"><span class="notice-type blue">${icon('brain', 16)}</span><div><strong>Local assistant is active</strong><p>The guided assistant uses this installation's local registry. A remote language model has not been configured.</p><button type="button" class="text-button" data-page="intelligence">Open assistant ${icon('arrow', 13)}</button></div></article><article class="notice-item"><span class="notice-type green">${icon('layers', 16)}</span><div><strong>Asset vault is private to this browser</strong><p>Files are not backed up to another device unless you export them.</p><button type="button" class="text-button" data-page="assets">Open asset library ${icon('arrow', 13)}</button></div></article></div>`, 'LOCAL NOTICES');
}

function confirmDialog(title, message, confirmLabel, callback) {
  pendingConfirm = callback;
  openModal(title, `<p>${escapeHtml(message)}</p><div class="confirm-actions"><button type="button" class="secondary-button" data-action="close-modal">Keep data</button><button type="button" class="danger-button" data-action="confirm-local-action">${icon('trash', 15)}${escapeHtml(confirmLabel)}</button></div>`, 'CONFIRM LOCAL CHANGE');
}

function confirmClearChat() {
  confirmDialog('Clear local conversation?', 'This removes the saved chat transcript from this browser. This action cannot be undone unless you exported a workspace backup.', 'Clear conversation', () => {
    state.chat = [];
    persist(CHAT_KEY, state.chat);
    render();
    toast('Local conversation cleared.');
  });
}

function confirmTaskDelete(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  confirmDialog('Remove this task?', `“${task.title}” will be removed from this browser. Export the task list first if you need a copy.`, 'Remove task', () => deleteTask(id));
}

function confirmClearLocalData() {
  confirmDialog('Clear local tasks and chat?', 'This removes tasks, chat, and activity from this browser. Files in the asset vault and preferences will stay. Export a workspace backup first if you need a copy.', 'Clear local records', clearLocalData);
}

function profileDialog() {
  openModal('Browser session', `<div class="profile-card"><span class="avatar large-avatar">V</span><div><strong>Local operator</strong><small>No signed-in Violet account</small></div></div><div class="profile-facts"><div><span>Session</span><strong>Local browser only</strong></div><div><span>Cloud sync</span><strong>Not configured</strong></div><div><span>Data boundary</span><strong>This device and browser profile</strong></div></div><button class="secondary-button" type="button" data-action="settings">${icon('settings', 15)} Open preferences</button>`, 'SESSION DETAILS');
}

function openFeatureExport() {
  downloadBlob(JSON.stringify({ exportedAt: new Date().toISOString(), count: innovations.length, categories, innovations }, null, 2), 'violet-77-innovation-registry.json', 'application/json');
  toast('Exported the 77-entry innovation registry.', 'success');
}

function downloadBlob(blob, filename, type) {
  const object = blob instanceof Blob ? blob : new Blob([blob], { type });
  const url = URL.createObjectURL(object);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportChat() {
  const transcript = state.chat.map((message) => `[${dateLabel(message.at)} ${timeLabel(message.at)}] ${message.role === 'assistant' ? 'Violet (local)' : 'You'}: ${message.text}`).join('\n\n');
  downloadBlob(transcript || 'No conversation yet.', 'violet-local-conversation.txt', 'text/plain');
  toast('Downloaded the local conversation.', 'success');
}

function exportTasks() {
  downloadBlob(JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), tasks: state.tasks }, null, 2), 'violet-local-tasks.json', 'application/json');
  toast('Downloaded local task records.', 'success');
}

function exportBackup() {
  const backup = { schemaVersion: 1, app: 'Violet Intelligence Command Center', exportedAt: new Date().toISOString(), preferences: state.preferences, tasks: state.tasks, chat: state.chat, activity: state.activity };
  downloadBlob(JSON.stringify(backup, null, 2), `violet-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  toast('Workspace backup downloaded. Asset bytes are not included; export those files individually.', 'success');
  logActivity('Workspace backup exported', 'Tasks, conversation, activity, and preferences were included; file bytes remain in IndexedDB.', 'download', 'cyan');
}

function exportAssets() {
  const assets = state.assets.map(({ blob, ...metadata }) => metadata);
  downloadBlob(JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), assets }, null, 2), 'violet-local-asset-registry.json', 'application/json');
  toast('Downloaded asset metadata. File contents remain in the local vault.', 'success');
}

function exportAssetsCsv() {
  const lines = [['id', 'name', 'type', 'size_bytes', 'added_at', 'sha256', 'deleted_at'], ...state.assets.map((asset) => [asset.id, asset.name, asset.type, asset.size, asset.addedAt, asset.checksum, asset.deletedAt ?? ''])];
  const csv = lines.map((line) => line.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
  downloadBlob(csv, 'violet-local-assets.csv', 'text/csv');
  toast('Downloaded asset metadata as CSV.', 'success');
}

function exportActivity() {
  downloadBlob(JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), activity: state.activity }, null, 2), 'violet-local-activity.json', 'application/json');
  toast('Downloaded local activity history.', 'success');
}

function copyText(text) {
  if (!navigator.clipboard?.writeText) { toast('Clipboard access is unavailable in this browser.'); return; }
  navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard.', 'success')).catch(() => toast('Could not access the clipboard.'));
}

function setupChecklist(providerName = 'provider') {
  return `Secure ${providerName} connection setup:\n1. Select the account and workflow to connect.\n2. Register the provider app and an approved redirect URL.\n3. Choose least-privilege scopes.\n4. Store credentials and tokens in a protected backend or native key store; never in this browser page.\n5. Verify an authenticated health check before reporting Connected.`;
}

function openDb() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('This browser does not support IndexedDB.'));
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains('assets')) database.createObjectStore('assets', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open the local asset vault.'));
  });
  return dbPromise;
}

async function withAssets(mode, operation) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('assets', mode);
    const store = transaction.objectStore('assets');
    const result = operation(store);
    let data;
    if (result && 'onsuccess' in result) {
      result.onsuccess = () => { data = result.result; };
      result.onerror = () => reject(result.error ?? new Error('Asset operation failed.'));
    }
    transaction.oncomplete = () => resolve(data);
    transaction.onerror = () => reject(transaction.error ?? new Error('Asset transaction failed.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Asset transaction aborted.'));
  });
}

async function loadAssets() {
  try {
    const assets = await withAssets('readonly', (store) => store.getAll());
    state.assets = assets ?? [];
  } catch (error) {
    state.assets = [];
    toast(error.message || 'The browser asset vault is unavailable.');
  }
}

async function addFiles(files) {
  const selected = Array.from(files ?? []);
  if (!selected.length) return;
  let added = 0;
  for (const file of selected) {
    if (file.size > 20 * 1024 * 1024) { toast(`${file.name} is over the 20 MB local file limit.`); continue; }
    try {
      const data = await file.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', data);
      const checksum = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
      if (state.assets.some((asset) => asset.checksum === checksum && !asset.deletedAt)) { toast(`${file.name} is already in this vault.`); continue; }
      const asset = { id: crypto.randomUUID(), name: file.name, type: file.type || 'application/octet-stream', size: file.size, addedAt: new Date().toISOString(), checksum, blob: file, deletedAt: null };
      await withAssets('readwrite', (store) => store.put(asset));
      state.assets.push({ ...asset });
      added += 1;
      logActivity('Asset stored locally', `${file.name} · ${prettySize(file.size)} · SHA-256 ${checksum.slice(0, 12)}…`, 'layers', 'cyan');
    } catch (error) {
      toast(error.message || `Could not store ${file.name}.`);
    }
  }
  if (added) toast(`${added} ${added === 1 ? 'asset' : 'assets'} stored in this browser.`, 'success');
  state.page = 'assets';
  render();
}

async function downloadAsset(id) {
  try {
    const asset = await withAssets('readonly', (store) => store.get(id));
    if (!asset?.blob) { toast('Asset file could not be found in this browser.'); return; }
    const digest = await crypto.subtle.digest('SHA-256', await asset.blob.arrayBuffer());
    const checksum = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    if (checksum !== asset.checksum) {
      logActivity('Asset integrity check failed', `${asset.name} was not downloaded because its local bytes do not match the saved checksum.`, 'shield', 'amber');
      toast('Checksum mismatch. Download stopped to protect the local file.');
      return;
    }
    downloadBlob(asset.blob, asset.name, asset.type);
    logActivity('Asset verified and downloaded', `${asset.name} · SHA-256 verified`, 'download', 'cyan');
    toast(`Downloaded ${asset.name}.`, 'success');
  } catch (error) { toast(error.message || 'Asset download failed.'); }
}

async function softDeleteAsset(id) {
  const asset = state.assets.find((item) => item.id === id);
  if (!asset) return;
  asset.deletedAt = new Date().toISOString();
  await withAssets('readwrite', (store) => store.put(asset));
  logActivity('Asset moved to recently deleted', asset.name, 'trash', 'amber');
  state.page = 'assets'; render(); toast('Asset moved to recoverable trash.', 'success');
}

async function restoreAsset(id) {
  const asset = state.assets.find((item) => item.id === id);
  if (!asset) return;
  asset.deletedAt = null;
  await withAssets('readwrite', (store) => store.put(asset));
  logActivity('Asset restored', asset.name, 'undo', 'green');
  state.page = 'assets'; state.assetFilter = 'active'; render(); toast('Asset restored to the active vault.', 'success');
}

function updateSetting(name, checked) {
  if (name === 'fontScale') state.preferences.fontScale = checked ? 'large' : 'normal';
  else state.preferences[name] = checked;
  persist(APP_KEY, state.preferences);
  document.documentElement.dataset.compact = String(state.preferences.compact);
  document.documentElement.dataset.fontScale = state.preferences.fontScale;
  document.documentElement.dataset.reduceMotion = String(state.preferences.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  toast('Preference saved in this browser.', 'success');
}

function validateAndImport(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const backup = JSON.parse(String(reader.result));
      if (backup.schemaVersion !== 1 || !Array.isArray(backup.tasks) || !Array.isArray(backup.chat) || !backup.preferences || typeof backup.preferences !== 'object') throw new Error('This file is not a valid Violet workspace backup.');
      state.tasks = backup.tasks.map(cleanTask).filter(Boolean);
      state.chat = backup.chat.map(cleanMessage).filter(Boolean);
      state.preferences = { theme: 'dark', compact: Boolean(backup.preferences.compact), reducedMotion: Boolean(backup.preferences.reducedMotion), fontScale: backup.preferences.fontScale === 'large' ? 'large' : 'normal' };
      state.activity = Array.isArray(backup.activity) ? backup.activity.map(cleanActivity).filter(Boolean).slice(0, 100) : [];
      persist(TASK_KEY, state.tasks); persist(CHAT_KEY, state.chat); persist(APP_KEY, state.preferences); persist(ACTIVITY_KEY, state.activity);
      logActivity('Workspace backup restored', 'Tasks, chat, activity, and preferences were restored from a validated local JSON backup.', 'database', 'green');
      document.querySelector('#modal')?.close(); render(); toast('Workspace backup restored.', 'success');
    } catch (error) { toast(error.message || 'Could not read this backup file.'); }
  };
  reader.readAsText(file);
}

function escapeKeyHandler(event) {
  if (event.key === 'Escape') {
    document.querySelector('#command-modal')?.close();
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openSearch();
  }
}

function handleClick(event) {
  const nav = event.target.closest('[data-page]');
  const category = event.target.closest('[data-category]');
  const prompt = event.target.closest('[data-prompt]');
  const provider = event.target.closest('[data-provider]');
  const feature = event.target.closest('[data-innovation]');
  const actionTarget = event.target.closest('[data-action]');

  if (nav && nav.dataset.page) {
    event.preventDefault();
    if (nav.dataset.category && nav.dataset.category !== 'all') state.category = nav.dataset.category;
    navigate(nav.dataset.page);
    if (provider) providerDialog(provider.dataset.provider);
    if (feature) featureDialog(feature.dataset.innovation);
    return;
  }
  if (category) { categoryFilter(category.dataset.category); return; }
  if (prompt) { sendChat(prompt.dataset.prompt); return; }
  if (provider && !actionTarget) { providerDialog(provider.dataset.provider); return; }
  if (feature && !actionTarget) { featureDialog(feature.dataset.innovation); return; }
  if (!actionTarget) return;
  const { action, id, index } = actionTarget.dataset;

  if (action === 'open-search') openSearch();
  else if (action === 'toggle-nav') document.querySelector('#sidebar')?.classList.toggle('nav-open');
  else if (action === 'refresh') refreshWorkspace();
  else if (action === 'notices') showNotices();
  else if (action === 'profile') profileDialog();
  else if (action === 'settings') { document.querySelector('#modal')?.close(); settingsDialog(); }
  else if (action === 'close-modal') document.querySelector('#modal')?.close();
  else if (action === 'network-info') openModal('About the intelligence map', `<p>This visual is a decorative map of the local interface architecture. It does not represent live AI agents, online users, request volume, or an external network.</p><div class="privacy-callout">${icon('shield', 17)}<span><strong>Evidence label</strong><small>The live local health endpoint is shown in Service Telemetry. Remote agents and provider metrics are not configured.</small></span></div>`, 'VISUALIZATION DETAILS');
  else if (action === 'choose-files') document.querySelector('#asset-file-picker')?.click();
  else if (action === 'export-innovations') openFeatureExport();
  else if (action === 'export-chat') exportChat();
  else if (action === 'export-tasks') exportTasks();
  else if (action === 'export-backup') exportBackup();
  else if (action === 'export-assets') exportAssets();
  else if (action === 'export-assets-csv') exportAssetsCsv();
  else if (action === 'export-activity') exportActivity();
  else if (action === 'copy-setup') copyText(setupChecklist('Violet providers'));
  else if (action === 'copy-provider-checklist') { const entry = providers.find((item) => item.id === actionTarget.dataset.provider); copyText(setupChecklist(entry?.name ?? 'provider')); }
  else if (action === 'connection-boundary') openModal('Connection security boundary', `<p>This app has no account credentials, OAuth access tokens, or provider sessions. The connection directory is a readiness view only.</p><ul class="plain-list"><li>Use an OAuth authorization flow in an authenticated backend.</li><li>Keep provider tokens in a protected service or native key store.</li><li>Request narrow scopes and verify successful provider requests.</li><li>Report Connected only from current, dated request evidence.</li></ul>`, 'SECURITY AND TRUST');
  else if (action === 'clear-chat') confirmClearChat();
  else if (action === 'copy-message') { const message = state.chat[Number(index)]; if (message) copyText(message.text); }
  else if (action === 'speak-message') { const message = state.chat[Number(index)]; if (message) speak(message.text); }
  else if (action === 'read-last') { const last = [...state.chat].reverse().find((message) => message.role === 'assistant'); if (last) speak(last.text); else toast('There is no assistant response yet.'); }
  else if (action === 'dictate') dictate();
  else if (action === 'export-tasks') exportTasks();
  else if (action === 'export-backup') exportBackup();
  else if (action === 'export-activity') exportActivity();
  else if (action === 'reset-innovation-filter') { state.category = 'all'; state.innovationQuery = ''; render(); }
  else if (action === 'delete-asset') softDeleteAsset(id);
  else if (action === 'restore-asset') restoreAsset(id);
  else if (action === 'download-asset') downloadAsset(id);
  else if (action === 'toggle-task') toggleTask(id);
  else if (action === 'delete-task') confirmTaskDelete(id);
  else if (action === 'clear-local-data') confirmClearLocalData();
  else if (action === 'confirm-local-action') { const confirm = pendingConfirm; pendingConfirm = null; document.querySelector('#modal')?.close(); confirm?.(); }
  else if (action === 'export-csv') exportAssetsCsv();
  else if (action === 'install-app') installApp();
  else if (action === 'search-result') { const results = JSON.parse(document.querySelector('#command-results')?.dataset.results ?? '[]'); const item = results[Number(index)]; if (item) { document.querySelector('#command-modal')?.close(); navigate(item.page); if (item.provider) providerDialog(item.provider); if (item.id) featureDialog(item.id); } }
}

function toggleTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  task.done = !task.done;
  task.updatedAt = new Date().toISOString();
  persist(TASK_KEY, state.tasks);
  logActivity(task.done ? 'Task completed' : 'Task reopened', task.title, task.done ? 'check' : 'undo', task.done ? 'green' : 'amber');
  render();
}

function deleteTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  state.tasks = state.tasks.filter((item) => item.id !== id);
  persist(TASK_KEY, state.tasks);
  logActivity('Local task removed', task.title, 'trash', 'amber');
  render(); toast('Task removed from this browser.', 'success');
}

function clearLocalData() {
  state.tasks = []; state.chat = []; state.activity = [];
  persist(TASK_KEY, []); persist(CHAT_KEY, []); persist(ACTIVITY_KEY, []);
  document.querySelector('#modal')?.close(); render(); toast('Local tasks, chat, and activity were cleared. Assets and preferences were kept.');
}

function speak(text) {
  if (!('speechSynthesis' in window)) { toast('Spoken output is not available in this browser.'); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1; utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  toast('Reading the local response aloud.', 'success');
}

function dictate() {
  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Recognition) { toast('Speech dictation is not supported by this browser. You can still type a message.'); return; }
  const recognition = new Recognition();
  recognition.lang = navigator.language || 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const target = document.querySelector('#chat-input, #aside-chat-input');
    if (target) { target.value = `${target.value} ${event.results[0][0].transcript}`.trim(); target.focus(); }
    toast('Dictation added to the message field.', 'success');
  };
  recognition.onerror = () => toast('Speech input was unavailable or permission was denied. Type your message instead.');
  try { recognition.start(); toast('Listening for one message…'); } catch { toast('Speech input could not start.'); }
}

async function installApp() {
  if (!state.installPrompt) { toast('If your browser supports installation, use its menu and choose “Install Violet”.'); return; }
  state.installPrompt.prompt();
  const result = await state.installPrompt.userChoice;
  toast(result.outcome === 'accepted' ? 'Violet was installed by the browser.' : 'The install prompt was dismissed.');
  state.installPrompt = null;
}

function handleSubmit(event) {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  if (form.dataset.form === 'chat') {
    const input = form.querySelector('[name="message"]');
    const text = input?.value ?? '';
    input.value = '';
    sendChat(text);
  } else if (form.dataset.form === 'task') {
    const values = new FormData(form);
    const title = String(values.get('title') ?? '').trim();
    if (!title) { toast('Enter a task title before saving.'); return; }
    const task = { id: crypto.randomUUID(), title, note: String(values.get('note') ?? '').trim(), due: String(values.get('due') ?? '') || null, priority: String(values.get('priority') ?? 'normal'), done: false, createdAt: new Date().toISOString() };
    state.tasks.unshift(task); persist(TASK_KEY, state.tasks); logActivity('Task created', title, 'plus', 'violet');
    render(); toast('Task added to your local workspace.', 'success');
  }
}

function handleInput(event) {
  if (event.target.id === 'innovation-query') {
    state.innovationQuery = event.target.value;
    const cursor = event.target.selectionStart;
    render();
    const next = document.querySelector('#innovation-query'); next?.focus(); next?.setSelectionRange(cursor, cursor);
  } else if (event.target.id === 'asset-query') {
    state.assetQuery = event.target.value;
    const cursor = event.target.selectionStart;
    render();
    const next = document.querySelector('#asset-query'); next?.focus(); next?.setSelectionRange(cursor, cursor);
  } else if (event.target.id === 'task-query') {
    state.taskQuery = event.target.value;
    const cursor = event.target.selectionStart;
    render();
    const next = document.querySelector('#task-query'); next?.focus(); next?.setSelectionRange(cursor, cursor);
  } else if (event.target.id === 'command-query') renderSearchResults(event.target.value);
}

function handleChange(event) {
  const target = event.target;
  if (target.id === 'asset-file-picker') addFiles(target.files);
  else if (target.id === 'asset-filter') { state.assetFilter = target.value; render(); }
  else if (target.id === 'asset-sort') { state.assetSort = target.value; render(); }
  else if (target.id === 'task-filter') { state.taskFilter = target.value; render(); }
  else if (target.matches('[data-setting]')) updateSetting(target.dataset.setting, target.checked);
  else if (target.matches('[data-action="import-backup"]')) { if (target.files?.[0]) validateAndImport(target.files[0]); }
}

function handleKeydown(event) {
  if (event.target.id === 'command-query' && ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
    const rows = [...document.querySelectorAll('.command-result')];
    if (!rows.length) return;
    event.preventDefault();
    const active = Math.max(0, rows.findIndex((row) => row.classList.contains('active')));
    const nextIndex = event.key === 'ArrowDown' ? (active + 1) % rows.length : event.key === 'ArrowUp' ? (active - 1 + rows.length) % rows.length : active;
    rows.forEach((row, index) => row.classList.toggle('active', index === nextIndex));
    if (event.key === 'Enter') rows[nextIndex].click();
  }
}

appRoot.addEventListener('click', handleClick);
appRoot.addEventListener('submit', handleSubmit);
appRoot.addEventListener('input', handleInput);
appRoot.addEventListener('change', handleChange);
appRoot.addEventListener('keydown', handleKeydown);
document.addEventListener('keydown', escapeKeyHandler);
window.addEventListener('online', () => { state.isOnline = true; toast('Browser is online again.', 'success'); checkHealth(); });
window.addEventListener('offline', () => { state.isOnline = false; toast('Browser is offline. Local tasks and saved assets remain available.'); });
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); state.installPrompt = event; });

ensureIntro();
loadAssets().then(() => { if (state.page === 'overview') render(); });
render();
checkHealth();
window.setInterval(updateClock, 30_000);
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('./sw.js').catch(() => toast('Offline app-shell caching could not start in this browser.'));
}

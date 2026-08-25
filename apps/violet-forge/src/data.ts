import type { Status } from './types';

export const upgradeModules: Array<{ id: number; name: string; status: Status }> = [
  { id: 1, name: 'AI build orchestration', status: 'Ready' },
  { id: 2, name: 'Source URL deep research', status: 'Ready' },
  { id: 3, name: 'Private project database', status: 'Ready' },
  { id: 4, name: 'Task workflow engine', status: 'Ready' },
  { id: 5, name: 'Image asset generation', status: 'Ready' },
  { id: 6, name: 'File vault and signed links', status: 'Ready' },
  { id: 7, name: 'Conversation project memory', status: 'Ready' },
  { id: 8, name: 'GitHub registry', status: 'Connected' },
  { id: 9, name: 'AppDeploy app registry', status: 'Connected' },
  { id: 10, name: 'Web release pipeline', status: 'Ready' },
  { id: 11, name: 'Mobile and 4K scaling', status: 'Ready' },
  { id: 12, name: 'Health and error checks', status: 'Ready' },
  { id: 13, name: 'Project export bundle', status: 'Ready' },
  { id: 14, name: 'Market signal scoring', status: 'Limited' },
  { id: 15, name: 'Competitor watchlist', status: 'Ready' },
  { id: 16, name: 'Revenue opportunity board', status: 'Ready' },
  { id: 17, name: 'Apple Store publishing', status: 'Setup Required' },
  { id: 18, name: 'Google Play publishing', status: 'Setup Required' },
  { id: 19, name: 'Microsoft Store publishing', status: 'Setup Required' },
  { id: 20, name: 'Payments and billing', status: 'Setup Required' },
  { id: 21, name: 'DNS and custom domains', status: 'Setup Required' },
  { id: 22, name: 'Game / arcade hardware audit', status: 'Hardware Required' },
];

export const projectTypes = ['AI application', 'SaaS platform', 'Mobile app', 'Web app', 'Browser extension', 'Game / arcade', 'Workflow automation', 'API / backend'];

export const appDeployApps = [
  { name: 'Violet Profit Core', url: 'https://nourish-ai-violet-profit-core-g531oj.v2.appdeploy.ai/', detail: 'Administrator console and live guidance' },
  { name: 'Marketplace Intelligence', url: 'https://nourish-ai-meal-tracker-0x9wcu.v2.appdeploy.ai/', detail: 'Listings, ownership and buyer/seller operations' },
  { name: 'Daily Operations', url: 'https://a382240bb730662c71.v2.appdeploy.ai/', detail: 'Scheduled operations and changed-signal R&D' },
  { name: 'Violet Nourish AI', url: 'https://violet-nourish-ai-p25t26.v2.appdeploy.ai/', detail: 'Existing meal and pantry tracker' },
  { name: 'Market Pricing Center', url: 'https://fd597466f5e5b91ffc.v2.appdeploy.ai/', detail: 'Sourced competition and pricing workspace' },
  { name: 'Intelligence Studio', url: 'https://malltalk-j9034o.v2.appdeploy.ai/', detail: 'Generation and intelligence workflows' },
  { name: 'Revenue Command Center', url: 'https://violet-ai-command-center-ssuwi1.v2.appdeploy.ai/', detail: 'Revenue operations and quote studio' },
  { name: 'We-Talk Workspace', url: 'https://526edda912f2bf33fd.v2.appdeploy.ai/', detail: 'Communication, learning and project coaching' },
  { name: 'Unified Resource Map', url: 'https://9e34b7052d1ee1cbe1.v2.appdeploy.ai/', detail: 'Operational resource and validation map' },
];

export const deploymentTargets = [
  { name: 'Web (AppDeploy)', status: 'Connected' as Status, detail: 'Public web deployment', url: 'https://dashboard.appdeploy.ai' },
  { name: 'Apple App Store', status: 'Setup Required' as Status, detail: 'Developer credentials needed', url: 'https://appstoreconnect.apple.com/' },
  { name: 'Google Play', status: 'Setup Required' as Status, detail: 'Console credentials needed', url: 'https://play.google.com/console/' },
  { name: 'Microsoft Store', status: 'Setup Required' as Status, detail: 'Partner Center needed', url: 'https://partner.microsoft.com/dashboard' },
  { name: 'Game / Arcade', status: 'Hardware Required' as Status, detail: 'Audit target hardware', url: 'https://docs.unity3d.com/' },
  { name: 'GitHub', status: 'Connected' as Status, detail: 'timfarmerisat/expo', url: 'https://github.com/timfarmerisat/expo' },
  { name: 'DNS & Domains', status: 'Setup Required' as Status, detail: 'Add domain records', url: 'https://dashboard.appdeploy.ai' },
  { name: 'Payments', status: 'Setup Required' as Status, detail: 'Connect provider', url: 'https://stripe.com/docs' },
];

export const marketCategories = ['AI productivity', 'Market intelligence', 'Developer tools', 'Workflow automation', 'Vertical SaaS'];

export const commandSuggestions = [
  'Create a detailed MVP build plan with acceptance criteria',
  'Compare three product positions and identify differentiation',
  'Design the database schema and API boundaries',
  'Create an App Store, Google Play, and web release checklist',
  'Identify IP, licensing, security, and compliance risks',
  'Turn this research into prioritized engineering tasks',
];

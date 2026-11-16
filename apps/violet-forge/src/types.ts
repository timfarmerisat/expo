export type Status = 'Connected' | 'Ready' | 'Limited' | 'Setup Required' | 'Hardware Required';

export interface Project {
  id: string;
  name: string;
  type: string;
  objective: string;
  stage: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  priority: string;
  done: boolean;
  createdAt: string;
}

export interface ResearchRecord {
  id: string;
  url: string;
  sourceTitle: string;
  question: string;
  summary: string;
  createdAt: string;
}

export interface AssetRecord {
  id: string;
  prompt: string;
  path: string;
  url: string;
  createdAt: string;
}

export interface VaultFile {
  path: string;
  url: string;
  name: string;
}

export interface QuoteRecord {
  id: string;
  projectName: string;
  client: string;
  price: number;
  laborHours: number;
  laborRate: number;
  tools: number;
  fees: number;
  cost: number;
  profit: number;
  margin: number;
  createdAt: string;
}

export interface ResourceRecord {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  owner: string;
  status: string;
  createdAt: string;
}

export interface BootstrapData {
  projects: Project[];
  tasks: Task[];
  research: ResearchRecord[];
  assets: AssetRecord[];
  files: VaultFile[];
  quotes: QuoteRecord[];
  resources: ResourceRecord[];
}

export interface AppUser {
  userId: string;
  name?: string;
  email?: string;
  picture?: string;
}

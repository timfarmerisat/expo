import type { ReactNode } from 'react';

export function Panel({ title, action, className = '', children }: { title: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return <section className={`panel ${className}`}><header className="panel-head"><h2>{title}</h2>{action}</header>{children}</section>;
}

export function StatusBadge({ value }: { value: string }) {
  const key = value.toLowerCase().replace(/\s+/g, '-');
  return <span className={`status status-${key}`}><i />{value}</span>;
}

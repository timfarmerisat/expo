import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function Modal({ title, onClose, wide = false, children }: { title: string; onClose: () => void; wide?: boolean; children: ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}><header><h2>{title}</h2><button className="icon-button" aria-label="Close" onClick={onClose}><X size={18} /></button></header>{children}</section></div>;
}

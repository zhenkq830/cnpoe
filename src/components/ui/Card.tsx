import type { ReactNode } from 'react';

export default function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`bg-poe-card border border-poe-border rounded-xl p-4 ${className}`}>
      {title && <h4 className="text-xs font-semibold text-poe-muted uppercase tracking-wider mb-3">{title}</h4>}
      {children}
    </div>
  );
}

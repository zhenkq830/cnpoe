import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const V: Record<Variant, string> = {
  primary: 'bg-poe-gold/20 border border-poe-gold/50 text-poe-gold-light hover:bg-poe-gold/30',
  secondary: 'bg-poe-card border border-poe-border text-poe-text hover:bg-poe-border/50',
  ghost: 'text-poe-muted hover:text-poe-text border border-transparent',
  danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
};
const S: Record<Size, string> = { sm: 'px-2.5 py-1 text-xs', md: 'px-4 py-2 text-sm' };

export default function Button({
  variant = 'secondary', size = 'md', className = '', children, ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <button className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors ${V[variant]} ${S[size]} ${p.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`} {...p}>
      {children}
    </button>
  );
}

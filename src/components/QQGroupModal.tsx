import { useState, useCallback } from 'react';
import Button from './ui/Button';

const GROUPS = [
  { label: '1群', number: '443050018' },
  { label: '2群', number: '533572652' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function QQGroupModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-24" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm poe-card p-6 space-y-4 shadow-2xl animate-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center">
          <span className="text-3xl">💬</span>
          <h3 className="text-lg font-bold text-poe-text mt-2">加入 QQ 交流群</h3>
          <p className="text-xs text-poe-muted mt-1">欢迎加入流放工坊，一起交流 PoE2！</p>
        </div>

        {/* Group list */}
        <div className="space-y-3">
          {GROUPS.map(g => (
            <QQGroupRow key={g.number} label={g.label} number={g.number} />
          ))}
        </div>

        {/* Close */}
        <div className="text-center pt-2 border-t border-poe-border">
          <button onClick={onClose} className="text-xs text-poe-muted hover:text-poe-text transition-colors">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function QQGroupRow({ label, number }: { label: string; number: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = number;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [number]);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-poe-darker/50 border border-poe-border">
      <div>
        <span className="text-xs text-poe-muted">{label}</span>
        <p className="text-sm font-mono font-bold text-poe-gold-light mt-0.5">{number}</p>
      </div>
      <Button size="sm" variant={copied ? 'primary' : 'secondary'} onClick={handleCopy}>
        {copied ? '已复制' : '复制'}
      </Button>
    </div>
  );
}

/** 悬浮小按钮 (右下角) */
export function FloatingQQButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 w-11 h-11 rounded-full bg-poe-gold/20 border-2 border-poe-gold/50 text-poe-gold-light hover:bg-poe-gold/30 shadow-lg flex items-center justify-center text-lg transition-all lg:hidden"
        title="加入 QQ 群"
      >
        💬
      </button>
      <QQGroupModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

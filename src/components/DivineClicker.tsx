import { useState, useCallback } from 'react';

export default function DivineClicker() {
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('divine-clicks');
    return saved ? parseInt(saved) : 0;
  });
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setClicks(prev => [...prev, { id, x, y }]);
    setTimeout(() => setClicks(prev => prev.filter(c => c.id !== id)), 800);
    setCount(prev => {
      const next = prev + 1;
      localStorage.setItem('divine-clicks', String(next));
      return next;
    });
  }, []);

  return (
    <div className="p-3">
      <p className="text-[10px] font-semibold text-poe-muted uppercase tracking-wider px-1 pb-2">
        神圣点击
      </p>
      <div className="relative flex flex-col items-center">
        {/* Click area */}
        <button
          onClick={handleClick}
          className="w-16 h-16 rounded-full bg-poe-gold/20 border-2 border-poe-gold/40
                     hover:bg-poe-gold/30 hover:border-poe-gold/60 hover:scale-105
                     active:scale-95 transition-all duration-100 cursor-pointer
                     flex items-center justify-center select-none"
          title="点击获得神圣石！"
        >
          <span className="text-2xl">💎</span>
        </button>

        {/* Floating +1 texts */}
        {clicks.map(c => (
          <span
            key={c.id}
            className="absolute text-xs font-bold text-poe-gold-light pointer-events-none animate-float"
            style={{ left: c.x, top: c.y }}
          >
            +1
          </span>
        ))}

        {/* Counter */}
        <div className="mt-2 text-center">
          <p className="text-[10px] text-poe-muted">神圣石</p>
          <p className="text-sm font-mono font-bold text-poe-gold-light">{count.toLocaleString()}</p>
        </div>
      </div>
      <style>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-30px) scale(1.3); }
        }
        .animate-float { animation: float-up 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}

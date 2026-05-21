interface Props {
  ilvlMin: number;
  ilvlMax: number;
  onChange: (min: number, max: number) => void;
}

const PRESETS: { label: string; min: number; max: number }[] = [
  { label: '81+', min: 81, max: 0 },
  { label: '82+', min: 82, max: 0 },
  { label: '85+', min: 85, max: 0 },
  { label: '90+', min: 90, max: 0 },
];

export default function IlvlInput({ ilvlMin, ilvlMax, onChange }: Props) {
  return (
    <div className="space-y-2">
      {/* Min / Max inputs */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-poe-muted w-14 shrink-0">物品等级</span>
        <input
          type="number"
          className="poe-input w-16 text-xs text-center"
          placeholder="Min"
          min={0}
          max={100}
          value={ilvlMin || ''}
          onChange={(e) => {
            const v = e.target.value ? parseInt(e.target.value) : 0;
            onChange(Math.max(0, Math.min(100, v)), ilvlMax);
          }}
        />
        <span className="text-poe-muted text-xs">~</span>
        <input
          type="number"
          className="poe-input w-16 text-xs text-center"
          placeholder="不限"
          min={0}
          max={100}
          value={ilvlMax || ''}
          onChange={(e) => {
            const v = e.target.value ? parseInt(e.target.value) : 0;
            onChange(ilvlMin, Math.max(0, Math.min(100, v)));
          }}
        />
      </div>

      {/* Quick preset buttons */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-poe-muted shrink-0">快速:</span>
        {PRESETS.map((p) => {
          const active = ilvlMin === p.min && ilvlMax === p.max;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(p.min, p.max)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                active
                  ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40'
                  : 'bg-poe-dark/50 text-poe-muted border border-poe-border hover:text-poe-text'
              }`}
            >
              {p.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange(0, 0)}
          className="px-2 py-0.5 rounded text-[10px] text-poe-muted hover:text-poe-text border border-transparent"
        >
          清除
        </button>
      </div>
    </div>
  );
}

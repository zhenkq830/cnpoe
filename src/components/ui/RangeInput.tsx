export function MinInput({ label, value, onChange, unit }: {
  label: string; value: number | null; onChange: (v: number | null) => void; unit?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-poe-muted w-20 shrink-0">{label}</span>
      <span className="text-poe-muted text-xs">≥</span>
      <input type="number" className="poe-input w-14 text-xs text-center" placeholder="0"
        value={value ?? ''} onChange={e => onChange(e.target.value ? parseInt(e.target.value) : null)} />
      {unit && <span className="text-poe-muted text-xs">{unit}</span>}
    </div>
  );
}

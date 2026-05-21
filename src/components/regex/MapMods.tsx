import { useMemo } from 'react';
import { buildRegex } from '../../engine/regexEngine';
import { waystoneMods } from '../../data/affixesData';
import type { LangMode } from '../../engine/regexEngine';
import { useAppStore } from '../../store/useAppStore';
import RegexOutput from './RegexOutput';
import Card from '../ui/Card';

const dangerMap: Record<string, string> = {
  prefix_good: 'border-green-500/30 text-green-400 bg-green-500/10',
  prefix_neutral: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  suffix_moderate: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
  suffix_bad: 'border-red-500/30 text-red-400 bg-red-500/10',
};
const dangerLabel: Record<string, string> = {
  prefix_good: '有利',
  prefix_neutral: '中性',
  suffix_moderate: '中等',
  suffix_bad: '致命',
};

export default function MapMods() {
  const { regexInput: f, setRegexInput: set } = useAppStore();
  const lang = (f.lang || 'cn') as LangMode;
  const mids = f.mapModIds || [];
  const result = useMemo(() => buildRegex({ ...f, mapModIds: mids }), [f, mids]);

  const toggle = (id: string) =>
    set({ mapModIds: mids.includes(id) ? mids.filter((x: string) => x !== id) : [...mids, id] });

  const selCat = (cat: string) =>
    set({ mapModIds: [...new Set([...mids, ...waystoneMods.filter((m) => m.category === cat).map((m) => m.id)])] });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {/* Lang toggle */}
        <Card>
          <div className="flex items-center gap-3">
            <span className="text-xs text-poe-muted">语言模式:</span>
            <button onClick={() => set({ lang: 'cn' })}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${lang === 'cn' ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border'}`}>简体中文</button>
            <button onClick={() => set({ lang: 'en' })}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${lang === 'en' ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border'}`}>高效英文</button>
          </div>
        </Card>

        {/* Quick select */}
        <div className="flex flex-wrap gap-1.5">
          {(['suffix_bad', 'suffix_moderate', 'prefix_good', 'prefix_neutral'] as const).map((d) => (
            <button key={d} onClick={() => selCat(d)}
              className={`px-2.5 py-1 rounded-md text-xs border transition-all ${dangerMap[d]} hover:opacity-80`}>{dangerLabel[d]}</button>
          ))}
          <button onClick={() => set({ mapModIds: [] })}
            className="text-xs text-poe-muted hover:text-poe-text px-2">清除</button>
        </div>

        {/* Mod list grouped by category */}
        {(['suffix_bad', 'suffix_moderate', 'prefix_good', 'prefix_neutral'] as const).map(cat => {
          const mods = waystoneMods.filter((m) => m.category === cat);
          if (mods.length === 0) return null;
          return (
            <Card key={cat} title={`${dangerLabel[cat]} (${mods.length})`}>
              <div className="space-y-1">
                {mods.map((m) => {
                  const a = mids.includes(m.id);
                  return (
                    <label key={m.id}
                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors border ${a ? dangerMap[m.category] + ' border-opacity-100' : 'border-transparent bg-poe-dark/30 hover:bg-poe-card/80'}`}>
                      <input type="checkbox" className="w-3.5 h-3.5 rounded accent-poe-gold"
                        checked={a} onChange={() => toggle(m.id)} />
                      <span className="text-xs flex-1">{m.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${dangerMap[m.category]}`}>{dangerLabel[m.category]}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
      <div><RegexOutput regex={result.regex} shortRegex={result.shortRegex} explanation={result.explanation} lang={lang} /></div>
    </div>
  );
}

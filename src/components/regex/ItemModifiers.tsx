import { useMemo, useState } from 'react';
import { buildRegex } from '../../engine/regexEngine';
import { getAllItemMods, getCategoryGroups, getModById } from '../../data/affixesData';
import type { LangMode } from '../../engine/regexEngine';
import { useAppStore } from '../../store/useAppStore';
import RegexOutput from './RegexOutput';
import Card from '../ui/Card';

const RES_IDS = ['fireRes','coldRes','lightRes','chaosRes','allRes','maxResFire','maxResCold','maxResLight'];
const ALL = getAllItemMods();
const GROUPS = getCategoryGroups();

export default function ItemModifiers() {
  const { regexInput: f, setRegexInput: set } = useAppStore();
  const lang = (f.lang || 'cn') as LangMode;
  const result = useMemo(() => buildRegex(f), [f]);
  const [activeCat, setActiveCat] = useState<string>('点伤');

  const cats = Object.keys(GROUPS);
  const allSelected = [...(f.modIds || []), ...(f.resistances || [])];
  const toggle = (id: string) => {
    const isRes = RES_IDS.includes(id);
    if (isRes) {
      const arr = f.resistances || [];
      set({ resistances: arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id] });
    } else {
      const arr = f.modIds || [];
      set({ modIds: arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id] });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {/* Language toggle */}
        <Card>
          <div className="flex items-center gap-3">
            <span className="text-xs text-poe-muted">语言模式:</span>
            <button onClick={() => set({ lang: 'cn' })}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${lang === 'cn' ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border'}`}>简体中文</button>
            <button onClick={() => set({ lang: 'en' })}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${lang === 'en' ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border'}`}>高效英文</button>
          </div>
        </Card>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1">
          {cats.map(cat => {
            const a = activeCat === cat;
            const count = (GROUPS[cat] || []).length;
            return (
              <button key={cat} onClick={() => setActiveCat(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${a ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border hover:text-poe-text'}`}>
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Current category mods */}
        {GROUPS[activeCat] && (
          <Card title={activeCat}>
            <div className="flex flex-wrap gap-1.5 max-h-[60vh] overflow-y-auto">
              {(GROUPS[activeCat] || []).map(modId => {
                const mod = getModById(modId);
                if (!mod) return null;
                const a = allSelected.includes(modId);
                return (
                  <button key={modId} onClick={() => toggle(modId)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium text-left transition-all ${
                      a ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40'
                        : 'bg-poe-dark/50 text-poe-muted border border-poe-border hover:text-poe-text hover:border-poe-muted/50'
                    }`}>
                    {mod.label}
                    {RES_IDS.includes(modId) && (
                      <span className="ml-1 text-[10px] text-poe-muted">(抗性)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Selected summary */}
        {allSelected.length > 0 && (
          <Card title={`已选 (${allSelected.length})`}>
            <div className="flex flex-wrap gap-1">
              {allSelected.map(id => {
                const mod = getModById(id);
                if (!mod) return null;
                return (
                  <span key={id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-poe-gold/10 text-poe-gold-light border border-poe-gold/20">
                    {mod.label}
                    <button onClick={() => toggle(id)} className="text-poe-muted hover:text-poe-red ml-0.5">×</button>
                  </span>
                );
              })}
            </div>
          </Card>
        )}
      </div>
      <div>
        <RegexOutput regex={result.regex} shortRegex={result.shortRegex} explanation={result.explanation} lang={lang} />
      </div>
    </div>
  );
}

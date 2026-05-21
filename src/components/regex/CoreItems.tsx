import { useMemo } from 'react';
import { buildRegex } from '../../engine/regexEngine';
import type { LangMode } from '../../engine/regexEngine';
import { itemClasses } from '../../data/affixesData';
import { useAppStore } from '../../store/useAppStore';
import RegexOutput from './RegexOutput';
import IlvlInput from '../ui/IlvlInput';
import Card from '../ui/Card';
import ControlBar from './ControlBar';

export default function CoreItems() {
  const { regexInput: f, setRegexInput: set } = useAppStore();
  const lang = (f.lang || 'cn') as LangMode;
  const result = useMemo(() => buildRegex(f), [f]);
  const toggle = (arr: string[], id: string) => arr.includes(id) ? arr.filter(x=>x!==id) : [...arr, id];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card>
          <ControlBar lang={lang} logic={(f.logic||'or') as 'or'|'and'} onLang={v=>set({lang:v})} onLogic={v=>set({logic:v})} />
        </Card>

        <Card title="核心物品基底">
          <div className="flex flex-wrap gap-1.5">
            {itemClasses.map(c => {
              const a = f.classIds?.includes(c.id);
              return <button key={c.id} onClick={() => set({ classIds: toggle(f.classIds||[], c.id) })}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${a?'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40':'bg-poe-dark/50 text-poe-muted border border-poe-border hover:text-poe-text'}`}>{c.label}</button>;
            })}
          </div>
        </Card>

        <Card title="物品条件">
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="accent-poe-gold" checked={f.hasQuality||false} onChange={e=>set({hasQuality:e.target.checked})}/>
              <span className="text-xs text-poe-muted">品质(Quality)</span>
            </label>
            <IlvlInput ilvlMin={f.ilvlMin || 0} ilvlMax={f.ilvlMax || 0}
              onChange={(min, max) => set({ ilvlMin: min, ilvlMax: max })} />
          </div>
        </Card>
      </div>
      <div><RegexOutput regex={result.regex} shortRegex={result.shortRegex} explanation={result.explanation} lang={lang}/></div>
    </div>
  );
}

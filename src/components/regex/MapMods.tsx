import { useMemo } from 'react';
import { buildRegex } from '../../engine/regexEngine';
import { waystoneMods } from '../../data/affixesData';
import type { LangMode } from '../../engine/regexEngine';
import { useAppStore } from '../../store/useAppStore';
import RegexOutput from './RegexOutput';
import Card from '../ui/Card';
import ControlBar from './ControlBar';

export default function MapMods() {
  const { regexInput: f, setRegexInput: set } = useAppStore();
  const lang = (f.lang || 'cn') as LangMode;
  const mids = f.mapModIds || [];
  const result = useMemo(() => buildRegex(f), [f]);

  const toggle = (id: string) =>
    set({ mapModIds: mids.includes(id) ? mids.filter((x: string) => x !== id) : [...mids, id] });

  const toggleGroup = (ids: string[]) => {
    const allOn = ids.every(id => mids.includes(id));
    if (allOn) set({ mapModIds: mids.filter((x: string) => !ids.includes(x)) });
    else set({ mapModIds: [...new Set([...mids, ...ids])] });
  };

  const prefixes = waystoneMods.filter(m => m.affix === 'prefix');
  const suffixes = waystoneMods.filter(m => m.affix === 'suffix');

  const ModCheck = ({ m }: { m: typeof waystoneMods[0] }) => {
    const a = mids.includes(m.id);
    return (
      <label className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors border text-xs ${
        a ? 'border-poe-gold/30 text-poe-gold-light bg-poe-gold/5' : 'border-transparent bg-poe-dark/30 hover:bg-poe-card/80 text-poe-muted'
      }`}>
        <input type="checkbox" className="w-3 h-3 rounded accent-poe-gold shrink-0"
          checked={a} onChange={() => toggle(m.id)} />
        <span className="flex-1 truncate">{m.label}</span>
      </label>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {/* Controls */}
        <Card>
          <ControlBar lang={lang} logic={(f.logic||'or') as 'or'|'and'} highlight={f.highlight} showHighlight onLang={v=>set({lang:v})} onLogic={v=>set({logic:v})} onHighlight={v=>set({highlight:v})} onReset={mids.length>0 ? ()=>set({mapModIds:[]}) : undefined} />
        </Card>

        {/* 前缀 */}
        <Card title={`前缀 (${prefixes.length})`}>
          <div className="flex gap-1 mb-2">
            <button onClick={() => toggleGroup(prefixes.map(m=>m.id))}
              className="text-[10px] text-poe-muted hover:text-poe-text">全选/取消</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-72 overflow-y-auto">
            {prefixes.map(m => <ModCheck key={m.id} m={m} />)}
          </div>
        </Card>

        {/* 后缀 */}
        <Card title={`后缀 (${suffixes.length})`}>
          <div className="flex gap-1 mb-2">
            <button onClick={() => toggleGroup(suffixes.map(m=>m.id))}
              className="text-[10px] text-poe-muted hover:text-poe-text">全选/取消</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-72 overflow-y-auto">
            {suffixes.map(m => <ModCheck key={m.id} m={m} />)}
          </div>
        </Card>
      </div>

      <div>
        <RegexOutput regex={result.regex} shortRegex={result.shortRegex} explanation={result.explanation} lang={lang} />
      </div>
    </div>
  );
}

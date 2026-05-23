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
          <ControlBar lang={lang} logic={(f.logic||'or') as 'or'|'and'} highlight={f.highlight} showHighlight onLang={v=>set({lang:v})} onLogic={v=>set({logic:v})} onHighlight={v=>set({highlight:v, mapModIds: v ? mids : [], tierMin: v ? f.tierMin : 0, tierMax: v ? f.tierMax : 0})} onReset={mids.length>0 ? ()=>set({mapModIds:[]}) : undefined} />
        </Card>

        {/* 地图阶级筛选 */}
        <Card title="地图阶级">
          <div className="flex items-center gap-3">
            <span className="text-xs text-poe-muted">最低</span>
            <input type="number" className="poe-input w-14 text-xs text-center"
              min={1} max={16} value={f.highlight === false ? '' : (f.tierMin || '')}
              disabled={f.highlight === false}
              onChange={e => set({ tierMin: e.target.value ? parseInt(e.target.value) : 0 })} />
            <span className="text-poe-muted text-xs">~</span>
            <span className="text-xs text-poe-muted">最高</span>
            <input type="number" className="poe-input w-14 text-xs text-center"
              min={1} max={16} value={f.highlight === false ? '' : (f.tierMax || '')}
              disabled={f.highlight === false}
              onChange={e => set({ tierMax: e.target.value ? parseInt(e.target.value) : 0 })} />
            <span className="text-[10px] text-poe-gold/70 inline-block w-[130px]">
              {f.highlight === false ? '排除模式下不可用' : '不填则筛选所有阶级'}
            </span>
            {f.highlight !== false && ((f.tierMin || 0) > 0 || (f.tierMax || 0) > 0) && (
              <button onClick={() => set({ tierMin: 0, tierMax: 0 })}
                className="text-[10px] text-poe-muted hover:text-poe-red">清除</button>
            )}
          </div>
          {(f.tierMin || 0) > 0 && (f.tierMax || 0) > 0 && (f.tierMax || 0) < (f.tierMin || 0) && f.highlight !== false && (
            <p className="mt-2 text-xs text-poe-red">最高阶级不能低于最低阶级，请修改</p>
          )}
        </Card>

        {/* 换界石基础属性筛选 */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-poe-muted uppercase tracking-wider">基础属性下限</h4>
            {(!!(f.wsPackMin || f.wsMagicMin || f.wsRareMin || f.wsRarityMin || f.wsDropMin)) && (
              <button onClick={() => set({ wsPackMin:0, wsMagicMin:0, wsRareMin:0, wsRarityMin:0, wsDropMin:0 })}
                className="text-[10px] text-poe-muted hover:text-poe-red">重置</button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-poe-muted">怪物群大小 ≥</span>
              <input type="number" className="poe-input text-xs text-center w-full"
                min={0} max={100} value={f.wsPackMin || ''} placeholder="0"
                onChange={e => set({ wsPackMin: Math.min(100, parseInt(e.target.value) || 0) })} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-poe-muted">魔法怪物 ≥</span>
              <input type="number" className="poe-input text-xs text-center w-full"
                min={0} max={100} value={f.wsMagicMin || ''} placeholder="0"
                onChange={e => set({ wsMagicMin: Math.min(100, parseInt(e.target.value) || 0) })} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-poe-muted">稀有怪物 ≥</span>
              <input type="number" className="poe-input text-xs text-center w-full"
                min={0} max={100} value={f.wsRareMin || ''} placeholder="0"
                onChange={e => set({ wsRareMin: Math.min(100, parseInt(e.target.value) || 0) })} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-poe-muted">物品稀有度 ≥</span>
              <input type="number" className="poe-input text-xs text-center w-full"
                min={0} max={200} value={f.wsRarityMin || ''} placeholder="0"
                onChange={e => set({ wsRarityMin: Math.min(200, parseInt(e.target.value) || 0) })} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-poe-muted">{lang === 'tc' ? '換界石掉落' : '引路石掉落'} ≥</span>
              <input type="number" className="poe-input text-xs text-center w-full"
                min={0} max={500} value={f.wsDropMin || ''} placeholder="0"
                onChange={e => set({ wsDropMin: Math.min(500, parseInt(e.target.value) || 0) })} />
            </div>
          </div>
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

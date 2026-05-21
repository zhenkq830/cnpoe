import { useMemo, useState } from 'react';
import { buildRegex } from '../../engine/regexEngine';
import { getAllItemMods, getAvailableMods, itemClasses } from '../../data/affixesData';
import type { LangMode } from '../../engine/regexEngine';
import { useAppStore } from '../../store/useAppStore';
import RegexOutput from './RegexOutput';
import Card from '../ui/Card';
import ControlBar from './ControlBar';

const ALL = getAllItemMods();
const EQ_TYPES = itemClasses.filter(c =>
  ['bows','crossbows','quarterstaves','oneHandMaces','twoHandMaces','staves',
   'wands','sceptres','spears','boots','gloves','bodyArmours','helmets',
   'shields','foci','quivers','rings','amulets','belts'].includes(c.id)
);

export default function ItemModifiers() {
  const { regexInput: f, setRegexInput: set } = useAppStore();
  const lang = (f.lang || 'cn') as LangMode;
  // 装备选择仅用于过滤 UI 词缀, 不加入正则
  const result = useMemo(() => buildRegex({ ...f, classIds: [] }), [f]);

  // 装备选择
  const selectedEq = f.classIds || [];
  const toggleEq = (id: string) => {
    const next = selectedEq.includes(id) ? selectedEq.filter(x => x !== id) : [...selectedEq, id];
    set({ classIds: next });
  };

  // 可用词缀 — 按装备部位取前后缀交集
  const available = getAvailableMods(selectedEq);
  const prefixes = available
    ? ALL.filter(m => available.prefixes.includes(m.id))
    : ALL.filter(m => m.affix === 'prefix');
  const suffixes = available
    ? ALL.filter(m => available.suffixes.includes(m.id))
    : ALL.filter(m => m.affix === 'suffix');

  const allSelected = [...(f.modIds || []), ...(f.resistances || [])];
  const toggleMod = (id: string) => {
    const isRes = ['fireRes','coldRes','lightRes','chaosRes','allRes','maxResFire','maxResCold','maxResLight'].includes(id);
    if (isRes) {
      const arr = f.resistances || [];
      set({ resistances: arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id] });
    } else {
      const arr = f.modIds || [];
      set({ modIds: arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id] });
    }
  };

  const ModButton = ({ m }: { m: typeof ALL[0] }) => {
    const a = allSelected.includes(m.id);
    return (
      <button key={m.id} onClick={() => toggleMod(m.id)}
        className={`px-3 py-1 rounded-md text-xs font-medium text-left transition-all ${
          a ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40'
            : 'bg-poe-dark/30 text-poe-muted border border-poe-border hover:text-poe-text hover:border-poe-muted/50'
        }`}>
        {m.label}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {/* Language + Logic */}
        <Card>
          <ControlBar lang={lang} logic={(f.logic||'or') as 'or'|'and'} onLang={v=>set({lang:v})} onLogic={v=>set({logic:v})} onReset={selectedEq.length>0 ? () => set({ classIds:[], modIds:[], resistances:[] }) : undefined} />
        </Card>

        {/* 装备部位 */}
        <Card title="选择装备部位（不选会显示所有词缀）">
          <div className="flex flex-wrap gap-1">
            {EQ_TYPES.map(c => {
              const a = selectedEq.includes(c.id);
              return (
                <button key={c.id} onClick={() => toggleEq(c.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    a ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40'
                      : 'bg-poe-dark/30 text-poe-muted border border-poe-border hover:text-poe-text'
                  }`}>{c.label}</button>
              );
            })}
          </div>
        </Card>

        {/* 前缀 */}
        <Card title={`前缀 (${prefixes.length})`}>
          <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
            {prefixes.map(m => <ModButton key={m.id} m={m} />)}
          </div>
        </Card>

        {/* 后缀 */}
        <Card title={`后缀 (${suffixes.length})`}>
          <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
            {suffixes.map(m => <ModButton key={m.id} m={m} />)}
          </div>
        </Card>

        {/* 已选 */}
        {allSelected.length > 0 && (
          <Card title={`已选 (${allSelected.length})`}>
            <div className="flex flex-wrap gap-1">
              {allSelected.map(id => {
                const mod = ALL.find(m => m.id === id);
                if (!mod) return null;
                return (
                  <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-poe-gold/10 text-poe-gold-light border border-poe-gold/20">
                    <span className="text-[9px] text-poe-muted">{mod.affix==='prefix'?'前':'后'}</span>
                    {mod.label}
                    <button onClick={() => toggleMod(id)} className="text-poe-muted hover:text-poe-red ml-0.5">×</button>
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

import { useMemo } from 'react';
import { buildRegex } from '../../engine/regexEngine';
import { itemClasses, rarities, moveSpeeds, getAllItemMods, getModById } from '../../data/affixesData';
import type { LangMode } from '../../engine/regexEngine';
import { useAppStore } from '../../store/useAppStore';
import RegexOutput from './RegexOutput';
import { MinInput } from '../ui/RangeInput';
import IlvlInput from '../ui/IlvlInput';
import Card from '../ui/Card';
import ControlBar from './ControlBar';

const RES_IDS = ['fireRes', 'coldRes', 'lightRes', 'chaosRes'];
const FLAT_IDS = ['flat_phys','flat_fire','flat_cold','flat_light','flat_chaos'];
const RES_LABELS: Record<string, string> = { fireRes: '火焰抗性', coldRes: '冰霜抗性', lightRes: '闪电抗性', chaosRes: '混沌抗性' };

export default function VendorSearch() {
  const { regexInput: f, setRegexInput: set } = useAppStore();
  const result = useMemo(() => buildRegex(f), [f]);
  const lang = (f.lang || 'cn') as LangMode;

  const toggle = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {/* Language + Logic toggle */}
        <Card>
          <ControlBar lang={lang} logic={(f.logic||'or') as 'or'|'and'} onLang={v=>set({lang:v})} onLogic={v=>set({logic:v})} />
        </Card>

        <Card title="物品基底">
          <div className="flex flex-wrap gap-1.5">
            {itemClasses.map((c) => {
              const a = f.classIds?.includes(c.id);
              return <button key={c.id} onClick={() => set({ classIds: toggle(f.classIds || [], c.id) })}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${a ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border hover:text-poe-text'}`}>{c.label}</button>;
            })}
          </div>
        </Card>

        <Card title="稀有度 & 属性">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {rarities.map((r) => {
                const a = f.rarities?.includes(r.id);
                return <button key={r.id} onClick={() => set({ rarities: toggle(f.rarities || [], r.id) })}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${a ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border hover:text-poe-text'}`}>{r.label}</button>;
              })}
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="accent-poe-gold" checked={f.hasQuality || false} onChange={(e) => set({ hasQuality: e.target.checked })} />
              <span className="text-xs text-poe-muted">品质</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="accent-poe-gold" checked={f.hasSockets || false} onChange={(e) => set({ hasSockets: e.target.checked })} />
              <span className="text-xs text-poe-muted">插槽</span>
            </label>
            <IlvlInput ilvlMin={f.ilvlMin || 0} ilvlMax={f.ilvlMax || 0} onChange={(min, max) => set({ ilvlMin: min, ilvlMax: max })} />
          </div>
        </Card>

        <Card title="移动速度">
          <div className="flex flex-wrap gap-1.5">
            {moveSpeeds.map((m) => {
              const a = f.moveSpeed === m.value;
              return <button key={m.value} onClick={() => set({ moveSpeed: a ? 0 : m.value })}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${a ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border hover:text-poe-text'}`}>{m.label}</button>;
            })}
          </div>
        </Card>

        <Card title="抗性">
          <div className="flex flex-wrap gap-1.5">
            {RES_IDS.map((id) => {
              const a = f.resistances?.includes(id);
              return <button key={id} onClick={() => set({ resistances: toggle(f.resistances || [], id) })}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${a ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border hover:text-poe-text'}`}>{RES_LABELS[id]}</button>;
            })}
          </div>
        </Card>

        <Card title="装备词缀">
          <div className="flex flex-wrap gap-1.5">
            {getAllItemMods().filter((m) => !RES_IDS.includes(m.id)).map((m) => {
              const a = f.modIds?.includes(m.id);
              return <button key={m.id} onClick={() => set({ modIds: toggle(f.modIds || [], m.id) })}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${a ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border hover:text-poe-text'}`}>{m.label}</button>;
            })}
          </div>
          {/* 点伤数值下限 — 选中任意点伤词缀时显示 */}
          {f.modIds?.some((id: string) => FLAT_IDS.includes(id)) && (
            <div className="mt-3 pt-3 border-t border-poe-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-poe-muted">点伤下限 ≥</span>
                <input type="number" className="poe-input w-14 text-xs text-center" placeholder="0"
                  value={f.flatDmgMin || ''}
                  onChange={e => set({ flatDmgMin: e.target.value ? parseInt(e.target.value) : 0 })} />
                <span className="text-[10px] text-poe-muted">(可选, 筛选数值范围)</span>
              </div>
            </div>
          )}
        </Card>
      </div>
      <div>
        <RegexOutput regex={result.regex} shortRegex={result.shortRegex} explanation={result.explanation} lang={lang} />
      </div>
    </div>
  );
}

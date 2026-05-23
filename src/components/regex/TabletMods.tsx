import { useMemo, useState } from 'react';
import { buildRegex } from '../../engine/regexEngine';
import { tabletTypes, tabletPrefixes, tabletSuffixes } from '../../data/affixesData';
import type { LangMode } from '../../engine/regexEngine';
import { useAppStore } from '../../store/useAppStore';
import RegexOutput from './RegexOutput';
import ControlBar from './ControlBar';
import Card from '../ui/Card';

export default function TabletMods() {
  const { regexInput: f, setRegexInput: set } = useAppStore();
  const lang = (f.lang || 'cn') as LangMode;
  const result = useMemo(() => buildRegex(f), [f]);

  const selectedTablet = f.classIds?.[0] || ''; // 单选石板类型
  const selectedPrefixIds = f.modIds || [];
  const selectedSuffixIds = f.mapModIds || [];

  const togglePrefix = (id: string) => {
    const next = selectedPrefixIds.includes(id)
      ? selectedPrefixIds.filter(x => x !== id)
      : [...selectedPrefixIds, id];
    set({ modIds: next });
  };

  const toggleSuffix = (id: string) => {
    const next = selectedSuffixIds.includes(id)
      ? selectedSuffixIds.filter(x => x !== id)
      : [...selectedSuffixIds, id];
    set({ mapModIds: next });
  };

  const suffixMods = selectedTablet ? (tabletSuffixes[selectedTablet] || []) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {/* Controls */}
        <Card>
          <ControlBar lang={lang} logic={(f.logic||'or') as 'or'|'and'}
            onLang={v=>set({lang:v})} onLogic={v=>set({logic:v})}
            onReset={selectedTablet ? ()=>set({classIds:[],modIds:[],mapModIds:[]}) : undefined} />
        </Card>

        {/* 石板类型 */}
        <Card title={selectedTablet ? `已选: ${tabletTypes.find(t=>t.id===selectedTablet)?.label}` : '选择石板类型'}>
          <div className="flex flex-wrap gap-1.5">
            {tabletTypes.map(t => {
              const a = selectedTablet === t.id;
              const short = t.id === 'precursor' ? '先驱石板' : t.label.replace('先驱石板','');
              return (
                <button key={t.id} onClick={() => set({ classIds: a ? [] : [t.id], mapModIds: [] })}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    a ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40'
                      : 'bg-poe-dark/30 text-poe-muted border border-poe-border hover:text-poe-text'
                  }`}>
                  {short}
                </button>
              );
            })}
          </div>
        </Card>

        {selectedTablet && (
          <>
            {/* 通用前缀 */}
            <Card title={`通用前缀 (${tabletPrefixes.length})`}>
              <div className="flex gap-1 mb-2">
                <button onClick={() => set({ modIds: tabletPrefixes.map(m=>m.id) })}
                  className="text-[10px] text-poe-muted hover:text-poe-text">全选</button>
                <button onClick={() => set({ modIds: [] })}
                  className="text-[10px] text-poe-muted hover:text-poe-text ml-2">取消</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-64 overflow-y-auto">
                {tabletPrefixes.map(m => {
                  const a = selectedPrefixIds.includes(m.id);
                  return (
                    <label key={m.id} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors border text-xs ${
                      a ? 'border-poe-gold/30 text-poe-gold-light bg-poe-gold/5' : 'border-transparent bg-poe-dark/30 hover:bg-poe-card/80 text-poe-muted'
                    }`}>
                      <input type="checkbox" className="w-3 h-3 rounded accent-poe-gold shrink-0"
                        checked={a} onChange={() => togglePrefix(m.id)} />
                      <span className="flex-1 truncate">{m.label}</span>
                    </label>
                  );
                })}
              </div>
            </Card>

            {/* 特有后缀 */}
            <Card title={`石板后缀 (${suffixMods.length})`}>
              {suffixMods.length === 0 ? (
                <p className="text-xs text-poe-muted text-center py-4">后缀数据待补充</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-64 overflow-y-auto">
                  {suffixMods.map(m => {
                    const a = selectedSuffixIds.includes(m.id);
                    return (
                      <label key={m.id} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors border text-xs ${
                        a ? 'border-poe-gold/30 text-poe-gold-light bg-poe-gold/5' : 'border-transparent bg-poe-dark/30 hover:bg-poe-card/80 text-poe-muted'
                      }`}>
                        <input type="checkbox" className="w-3 h-3 rounded accent-poe-gold shrink-0"
                          checked={a} onChange={() => toggleSuffix(m.id)} />
                        <span className="flex-1 truncate">{m.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </Card>
          </>
        )}

        {!selectedTablet && (
          <Card>
            <div className="text-center py-8">
              <TabletIcon icon="/tablet1.png" className="w-10 h-10 mb-3 mx-auto block" />
              <p className="text-poe-muted text-sm">请先选择石板类型</p>
            </div>
          </Card>
        )}
      </div>
      <div>
        <RegexOutput regex={result.regex} shortRegex={result.shortRegex} explanation={result.explanation} lang={lang} />
        {selectedTablet && (
          <div className="mt-4">
            <button
              onClick={() => window.open('https://poe.game.qq.com/trade2/search/poe2/Standard', '_blank')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-poe-gold/20 border border-poe-gold/50 text-poe-gold-light hover:bg-poe-gold/30 transition-colors"
            >
              打开国服市集
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TabletIcon({ icon, className }: { icon: string; className?: string }) {
  if (icon.startsWith('/') || icon.startsWith('http')) {
    return <img src={icon} alt="" className={className || 'w-5 h-5 object-contain'} />;
  }
  return <span className={className}>{icon}</span>;
}

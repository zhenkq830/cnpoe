import { useState } from 'react';
import { GEM_DB, type GemEntry, lookup } from '../data/gemData';
import { SUP_GEM_DB, type SupGemEntry, supLookup } from '../data/supportGemData';

export default function GemBrowser() {
  const [convertInput, setConvertInput] = useState('');
  const [convertResult, setConvertResult] = useState<GemEntry | null>(null);
  const trimmed = convertInput.trim();

  // 罗马数字 ↔ 阿拉伯数字归一化 (Unicode + ASCII)
  const norm = (s: string) => s
    .replace(/Ⅰ/g,'1').replace(/Ⅱ/g,'2').replace(/Ⅲ/g,'3').replace(/Ⅳ/g,'4').replace(/Ⅴ/g,'5')
    .replace(/\sIII(\s|$)/g,' 3$1').replace(/\sII(\s|$)/g,' 2$1').replace(/\sIV(\s|$)/g,' 4$1')
    .replace(/\sI(\s|$)/g,' 1$1');

  const doConvert = (input: string) => {
    const clean = input.trim();
    const n = norm(clean);
    setConvertResult(
      lookup(clean) || supLookup(clean) ||
      lookup(n) || supLookup(n) || null
    );
  };

  const suggestions = (trimmed.length >= 1 && !convertResult)
    ? [...Object.values(GEM_DB), ...Object.values(SUP_GEM_DB)].filter(v => {
        const t = norm(trimmed);
        return norm(v.cn).includes(t) || norm(v.tw).includes(t) || v.en.toLowerCase().includes(t.toLowerCase());
      }).slice(0, 40)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-poe-gold-light">技能宝石名称转换</h1>
        <p className="text-xs text-poe-muted mt-1">输入简体/繁体/英文任意一种，显示全部三种名称 · 335 主动 + 526 辅助</p>
      </div>

      {/* Converter */}
      <div className="poe-card p-5">
        <div className="flex items-center gap-3">
          <input
            className="poe-input flex-1 text-xl font-bold text-center"
            placeholder="输入技能名称..."
            value={convertInput}
            onChange={e => { setConvertInput(e.target.value); setConvertResult(null); }}
            onKeyDown={e => e.key === 'Enter' && doConvert(convertInput)}
          />
          <button
            onClick={() => doConvert(convertInput)}
            className="px-6 py-3 rounded-lg bg-poe-gold/20 border border-poe-gold/40 text-poe-gold-light font-bold text-base hover:bg-poe-gold/30 transition-colors"
          >
            转换
          </button>
        </div>

        {/* Suggestions */}
        {!convertResult && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {suggestions.map(v => (
              <button key={v.cn} onClick={() => { setConvertInput(v.cn); doConvert(v.cn); }}
                className="px-2 py-1 rounded text-xs text-poe-muted bg-poe-dark/30 border border-poe-border hover:text-poe-gold-light hover:border-poe-gold/40 transition-colors"
              >
                {v.cn} / {v.en}
              </button>
            ))}
          </div>
        )}

        {/* Result */}
        {convertResult && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-poe-dark/40 rounded-lg p-3">
              <p className="text-[10px] text-poe-muted mb-1.5">简体中文</p>
              <p className="text-base font-bold text-poe-text">{convertResult.cn || '—'}</p>
            </div>
            <div className="bg-poe-dark/40 rounded-lg p-3">
              <p className="text-[10px] text-poe-muted mb-1.5">繁体中文</p>
              <p className="text-base font-bold text-poe-text">{convertResult.tw || '—'}</p>
            </div>
            <div className="bg-poe-dark/40 rounded-lg p-3">
              <p className="text-[10px] text-poe-muted mb-1.5">English</p>
              <p className="text-base font-bold text-poe-text">{convertResult.en || '—'}</p>
            </div>

            {/* Tags */}
            {(convertResult.cnTags.length > 0 || convertResult.twTags.length > 0) && (
              <div className="col-span-3 flex flex-wrap gap-1.5 justify-center mt-1 pt-3 border-t border-poe-border/50">
                <span className="text-[10px] text-poe-muted mr-1">标签:</span>
                {(convertResult.cnTags.length ? convertResult.cnTags : convertResult.twTags).map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-poe-gold/5 text-poe-gold/60">{t}</span>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Active gem list */}
      <details className="poe-card p-4">
        <summary className="text-xs text-poe-muted cursor-pointer hover:text-poe-text">
          浏览全部 {Object.keys(GEM_DB).length} 个主动技能
        </summary>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 max-h-96 overflow-y-auto">
          {Object.entries(GEM_DB).sort((a, b) => a[1].cn.localeCompare(b[1].cn, 'zh')).map(([en, v]) => (
            <button key={en} onClick={() => { setConvertInput(v.cn); doConvert(v.cn); }}
              className="text-left text-xs px-2 py-1 rounded text-poe-muted hover:text-poe-gold-light hover:bg-poe-gold/5 transition-colors truncate"
            >{v.cn}</button>
          ))}
        </div>
      </details>

      {/* Support gem list */}
      <details className="poe-card p-4">
        <summary className="text-xs text-poe-muted cursor-pointer hover:text-poe-text">
          浏览全部 {Object.keys(SUP_GEM_DB).length} 个辅助技能
        </summary>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 max-h-96 overflow-y-auto">
          {Object.entries(SUP_GEM_DB).sort((a, b) => a[1].cn.localeCompare(b[1].cn, 'zh')).map(([en, v]) => (
            <button key={en} onClick={() => { setConvertInput(v.cn); doConvert(v.cn); }}
              className="text-left text-xs px-2 py-1 rounded text-poe-muted hover:text-poe-gold-light hover:bg-poe-gold/5 transition-colors truncate"
            >{v.cn}</button>
          ))}
        </div>
      </details>
    </div>
  );
}

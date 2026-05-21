/**
 * 一键诊断 — 粘贴游戏物品文本，自动测试所有中文词缀模式
 */
import { useMemo, useState } from 'react';
import { getAllItemMods, waystoneMods, properties } from '../../data/affixesData';
import Card from '../ui/Card';

interface Props {
  text: string;
}

interface DiagResult {
  id: string;
  label: string;
  regex: string;
  match: boolean;
  matchedText: string;
}

export default function DiagnosePanel({ text }: Props) {
  const [showAll, setShowAll] = useState(false);

  const results = useMemo((): DiagResult[] => {
    if (!text.trim()) return [];

    const all: DiagResult[] = [];

    // 物品属性
    for (const p of properties) {
      const r = testPattern(p.id, p.label, p.cn, text);
      if (r) all.push(r);
    }

    // 装备词缀
    for (const m of getAllItemMods()) {
      const r = testPattern(m.id, m.label, m.cn, text);
      if (r) all.push(r);
    }

    // 引路石词缀
    for (const w of waystoneMods) {
      const r = testPattern(w.id, w.label, w.cnRegex, text);
      if (r) all.push(r);
    }

    return all;
  }, [text]);

  const matched = results.filter((r) => r.match);
  const failed = results.filter((r) => !r.match);
  const display = showAll ? results : [...matched, ...failed.slice(0, 10)];

  if (!text.trim()) {
    return (
      <Card title="一键诊断">
        <p className="text-xs text-poe-muted text-center py-4">
          先粘贴物品文本到左侧测试区，这里会自动显示所有词缀的匹配结果
        </p>
      </Card>
    );
  }

  return (
    <Card title={`一键诊断 — ${matched.length}/${results.length} 命中`}>
      {/* Summary */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-poe-green">{matched.length} 条命中</span>
        <span className="text-xs text-poe-red">{failed.length} 条未命中</span>
        <span className="text-xs text-poe-muted">（共 {results.length} 条）</span>
      </div>

      {/* Result list */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {display.map((r) => (
          <div key={r.id}
            className={`flex items-start gap-2 p-1.5 rounded text-[11px] ${
              r.match ? 'bg-poe-green/5 border border-poe-green/10' : 'bg-poe-red/3 border border-red-500/5'
            }`}>
            <span className="shrink-0 mt-0.5">{r.match ? '✅' : '❌'}</span>
            <div className="min-w-0 flex-1">
              <span className={`font-medium ${r.match ? 'text-poe-green' : 'text-poe-red'}`}>{r.label}</span>
              <code className="ml-1.5 text-[10px] text-poe-muted/70">{r.regex}</code>
              {r.match && (
                <span className="block text-[10px] text-poe-gold-light mt-0.5 truncate">
                  匹配: {r.matchedText.length > 60 ? r.matchedText.slice(0, 60) + '...' : r.matchedText}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {failed.length > 10 && !showAll && (
        <button onClick={() => setShowAll(true)}
          className="mt-2 text-xs text-poe-muted hover:text-poe-text">
          显示全部 {failed.length} 条未命中 ▼
        </button>
      )}
    </Card>
  );
}

function testPattern(id: string, label: string, regex: string, text: string): DiagResult | null {
  if (!regex) return null;
  try {
    const re = new RegExp(regex, 'i');
    const m = re.exec(text);
    return {
      id, label, regex,
      match: m !== null,
      matchedText: m ? m[0] : '',
    };
  } catch {
    return { id, label, regex, match: false, matchedText: '' };
  }
}

import { useState, useMemo } from 'react';
import { buildRegex, getLengthColor } from '../../engine/regexEngine';
import type { LangMode } from '../../engine/regexEngine';
import { useAppStore } from '../../store/useAppStore';
import RegexOutput from './RegexOutput';
import DiagnosePanel from './DiagnosePanel';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ControlBar from './ControlBar';
import { useCopy } from '../../hooks/useCopy';

export default function CustomRegex() {
  const { regexInput: f, setRegexInput: set } = useAppStore();
  const lang = (f.lang || 'cn') as LangMode;
  const [testText, setTestText] = useState('');
  const { copied, copy } = useCopy();
  const pattern = f.customText || '';

  const result = useMemo(() => {
    if (!pattern.trim()) return null;
    return buildRegex({ ...f, customText: pattern });
  }, [pattern, f]);

  const highlights = useMemo(() => {
    if (!pattern || !testText) return null;
    try {
      const re = new RegExp(pattern, 'gi');
      const parts: { text: string; match: boolean }[] = [];
      let last = 0, m: RegExpExecArray | null;
      while ((m = re.exec(testText)) !== null) {
        if (m.index > last) parts.push({ text: testText.slice(last, m.index), match: false });
        parts.push({ text: m[0], match: true });
        last = m.index + m[0].length;
        if (m[0].length === 0) last++;
      }
      if (last < testText.length) parts.push({ text: testText.slice(last), match: false });
      return parts.length > 0 ? parts : null;
    } catch { return null; }
  }, [pattern, testText]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card>
          <ControlBar lang={lang} logic={(f.logic||'or') as 'or'|'and'} onLang={v=>set({lang:v})} onLogic={v=>set({logic:v})} />
        </Card>

        <Card title="自定义正则">
          <input type="text" className="poe-input text-sm w-full font-mono"
            placeholder={lang === 'cn' ? '例如: "移动速度提高 25%|最大生命 +80"' : 'e.g. "25% i.+mov|[0-9]+.+life"'}
            value={pattern} onChange={(e) => set({ customText: e.target.value })} spellCheck={false} />
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs font-mono font-bold ${getLengthColor(pattern.length) === 'green' ? 'text-poe-green' : getLengthColor(pattern.length) === 'yellow' ? 'text-poe-yellow' : 'text-poe-red'}`}>{pattern.length}/250</span>
            <Button size="sm" onClick={() => copy(pattern)}>{copied ? '已复制' : '复制'}</Button>
          </div>
        </Card>

        <Card title="测试文本">
          <textarea className="poe-input text-sm w-full h-40 resize-y font-mono"
            placeholder="粘贴游戏中复制的物品文本来测试匹配效果（支持中英文）..."
            value={testText} onChange={(e) => setTestText(e.target.value)} spellCheck={false} />
        </Card>

        <Card title="正则速查">
          <div className="text-xs font-mono text-poe-muted space-y-1">
            <p><code className="text-poe-gold-light">|</code> — 或 (或)</p>
            <p><code className="text-poe-gold-light">[0-9]</code> — 任意数字</p>
            <p><code className="text-poe-gold-light">[0-9]+</code> — 一个或多个数字</p>
            <p><code className="text-poe-gold-light">.*</code> — 任意数量字符</p>
            <p><code className="text-poe-gold-light">[abc]</code> — 字符集</p>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {result && <RegexOutput regex={result.regex} shortRegex={result.shortRegex} explanation={result.explanation} lang={lang} />}

        {highlights && (
          <Card title="匹配结果">
            <div className="bg-poe-dark/50 border border-poe-border rounded-lg p-3 text-sm font-mono leading-relaxed whitespace-pre-wrap break-all">
              {highlights.map((p, i) => p.match
                ? <mark key={i} className="bg-poe-gold/30 text-poe-gold-light rounded px-0.5">{p.text}</mark>
                : <span key={i}>{p.text}</span>
              )}
            </div>
            <p className="mt-2 text-xs text-poe-muted">共 {highlights.filter((p) => p.match).length} 处匹配</p>
          </Card>
        )}

        {!pattern && (
          <div className="poe-card p-8 text-center">
            <p className="text-4xl mb-3">🔧</p>
            <p className="text-poe-muted text-sm">在此编写或测试自定义正则表达式</p>
            <p className="text-poe-muted text-xs mt-1">支持中文和英文关键词，左侧输入后在下方测试匹配效果</p>
          </div>
        )}

        {/* 一键诊断所有词缀 */}
        <DiagnosePanel text={testText} />
      </div>
    </div>
  );
}

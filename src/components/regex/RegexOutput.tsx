import { useCallback } from 'react';
import { useCopy } from '../../hooks/useCopy';
import { getLengthColor, getLengthLabel } from '../../engine/regexEngine';
import { useAppStore } from '../../store/useAppStore';
import { trackCopy } from '../../utils/track';
import DivineGame from '../DivineGame';
import Button from '../ui/Button';

interface Props {
  regex: string;
  shortRegex: string;
  explanation: string[];
  lang: 'cn' | 'tc';
}

export default function RegexOutput({ regex, shortRegex, explanation, lang }: Props) {
  const { copied, copy } = useCopy();
  const { regexInput: f } = useAppStore();
  const display = (shortRegex && shortRegex.length < regex.length) ? shortRegex : regex;

  const handleCopy = useCallback(async (text: string) => {
    const allSelected = [...(f.modIds || []), ...(f.resistances || []), ...(f.mapModIds || [])];
    trackCopy(allSelected);
    copy(text);
  }, [f, copy]);
  const len = display.length;
  const cls = getLengthColor(len) === 'green' ? 'text-poe-green' : getLengthColor(len) === 'yellow' ? 'text-poe-yellow' : 'text-poe-red';

  if (!display) {
    return (
      <div className="space-y-4">
        <div className="poe-card p-6 text-center">
          <p className="text-poe-muted text-sm">选择选项来生成正则表达式</p>
          <p className="text-poe-muted text-xs mt-1">
            {lang === 'tc' ? '繁体模式' : '简体模式'}
          </p>
        </div>
        <DivineGame />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="poe-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-poe-darker/50 border-b border-poe-border">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-poe-muted uppercase tracking-wider">
              {lang === 'tc' ? '繁体正则' : '简体正则'}
            </span>
            <span className={`text-xs font-mono font-bold ${cls}`}>
              {len}/250 {getLengthLabel(len)}
            </span>
            {shortRegex && shortRegex !== regex && shortRegex.length < regex.length && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-poe-gold/10 text-poe-gold border border-poe-gold/30">
                短版
              </span>
            )}
          </div>
          <Button size="sm" onClick={() => handleCopy(display)}>
            {copied ? '已复制' : '复制'}
          </Button>
        </div>

        <div className="p-4 space-y-3">
          <code className={`block w-full font-mono text-sm leading-relaxed break-all p-3 rounded-lg ${
            len > 250 ? 'bg-red-500/5 border border-red-500/20 text-red-300'
            : 'bg-poe-dark/50 border border-poe-border text-poe-green'
          }`}>
            {display}
          </code>

          <div className="h-1.5 bg-poe-dark rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${
              getLengthColor(len) === 'green' ? 'bg-poe-green' : getLengthColor(len) === 'yellow' ? 'bg-poe-yellow' : 'bg-poe-red'
            }`} style={{ width: `${Math.min(100, (len / 250) * 100)}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-poe-muted">
            <span>0</span><span>125</span><span>250</span>
          </div>

          {shortRegex && shortRegex !== regex && (
            <details className="text-xs text-poe-muted">
              <summary className="cursor-pointer hover:text-poe-text">
                长版 ({regex.length} 字符)
              </summary>
              <code className="block mt-1 p-2 rounded bg-poe-dark/50 font-mono break-all">{regex}</code>
            </details>
          )}
        </div>
      </div>

      {explanation.length > 0 && (
        <div className="poe-card p-4">
          <h4 className="text-xs font-semibold text-poe-muted uppercase tracking-wider mb-2">
            中文解释
          </h4>
          <ul className="space-y-1">
            {explanation.map((e, i) => (
              <li key={i} className="text-xs text-poe-text flex gap-2">
                <span className="text-poe-gold shrink-0">•</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DivineGame />
    </div>
  );
}

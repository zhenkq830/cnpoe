import type { LangMode, LogicMode } from '../../engine/regexEngine';

interface Props {
  lang: 'en' | 'cn' | 'tc';
  logic: 'or' | 'and';
  highlight?: boolean;
  showHighlight?: boolean;
  onLang: (v: LangMode) => void;
  onLogic: (v: LogicMode) => void;
  onHighlight?: (v: boolean) => void;
  onReset?: () => void;
}

export default function ControlBar({ lang, logic, highlight, showHighlight, onLang, onLogic, onHighlight, onReset }: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs text-poe-muted">语言:</span>
      <button onClick={() => onLang('cn')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${lang === 'cn' ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border'}`}>简体中文</button>
      <button onClick={() => onLang('tc')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${lang === 'tc' ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border'}`}>繁体中文</button>
      <button onClick={() => onLang('en')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${lang === 'en' ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border'}`}>英文</button>

      <span className="text-poe-border mx-1">|</span>
      <span className="text-xs text-poe-muted">逻辑:</span>
      <button onClick={() => onLogic('or')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${logic !== 'and' ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border'}`}>或</button>
      <button onClick={() => onLogic('and')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${logic === 'and' ? 'bg-poe-green/20 text-poe-green border border-poe-green/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border'}`}>和</button>
      <span className="text-[10px] text-poe-muted/60 hidden sm:inline">
        {logic === 'and' ? '— 必须同时满足' : '— 满足任一即可'}
      </span>

      {showHighlight && onHighlight && (
        <>
          <span className="text-poe-border mx-1">|</span>
          <span className="text-xs text-poe-muted">显示:</span>
          <button onClick={() => onHighlight(true)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${highlight !== false ? 'bg-poe-gold/20 text-poe-gold-light border border-poe-gold/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border'}`}>高亮</button>
          <button onClick={() => onHighlight(false)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${highlight === false ? 'bg-poe-red/20 text-poe-red border border-poe-red/40' : 'bg-poe-dark/50 text-poe-muted border border-poe-border'}`}>排除</button>
          <span className="text-[10px] text-poe-muted/60 hidden sm:inline">
            {highlight === false ? '— 隐藏包含所选词缀的图' : '— 高亮包含所选词缀的图'}
          </span>
        </>
      )}

      {onReset && (
        <button onClick={onReset} className="ml-auto text-[10px] text-poe-muted hover:text-poe-red">重置</button>
      )}
    </div>
  );
}

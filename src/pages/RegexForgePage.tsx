import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import ItemModifiers from '../components/regex/ItemModifiers';
import MapMods from '../components/regex/MapMods';
import TabletMods from '../components/regex/TabletMods';
import CustomRegex from '../components/regex/CustomRegex';
import Button from '../components/ui/Button';

type TabId = 'modifiers' | 'maps' | 'tablet' | 'custom';
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'modifiers', label: '装备词缀', icon: '⚡' },
  { id: 'maps', label: '引路石', icon: '/waystone.png' },
  { id: 'tablet', label: '石板', icon: '/tablet1.png' },
  { id: 'custom', label: '自定义测试', icon: '🔧' },
];

export default function RegexForgePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as TabId) || 'modifiers';
  const setTab = (t: TabId) => {
    if (t !== tab) resetRegexInput();
    setSearchParams(t === 'modifiers' ? {} : { tab: t });
  };
  const { regexInput: f, resetRegexInput } = useAppStore();
  const lang = (f.lang || 'cn') as 'cn' | 'tc';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-poe-text">正则工坊</h1>
          <p className="text-xs text-poe-muted mt-1">
            {lang === 'tc' ? '繁体模式' : '简体模式'}
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={resetRegexInput}>重置</Button>
      </div>

      {/* Tabs */}
      <nav className="flex gap-1 p-1 rounded-xl bg-poe-darker border border-poe-border overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? 'bg-poe-gold/15 text-poe-gold-light border border-poe-gold/30' : 'text-poe-muted hover:text-poe-text border border-transparent'}`}>
            {t.icon.startsWith('/') ? <img src={t.icon} alt="" className="w-4 h-4 object-contain" /> : <span className="text-base">{t.icon}</span>}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      {tab === 'modifiers' && <ItemModifiers />}
      {tab === 'maps' && <MapMods />}
      {tab === 'tablet' && <TabletMods />}
      {tab === 'custom' && <CustomRegex />}

      {/* 版权提示 */}
      <p className="mt-8 text-center text-[10px] text-poe-muted/50">
        © 2025 流放工坊 | cnpoe.com — 请勿商用
      </p>
    </div>
  );
}

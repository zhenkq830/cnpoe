import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import VendorSearch from '../components/regex/VendorSearch';
import ItemModifiers from '../components/regex/ItemModifiers';
import MapMods from '../components/regex/MapMods';
import CoreItems from '../components/regex/CoreItems';
import CustomRegex from '../components/regex/CustomRegex';
import Button from '../components/ui/Button';

type TabId = 'vendor' | 'modifiers' | 'maps' | 'core' | 'custom';
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'vendor', label: '商人搜索', icon: '🏪' },
  { id: 'modifiers', label: '装备词缀', icon: '⚡' },
  { id: 'maps', label: '引路石', icon: '🗺' },
  { id: 'core', label: '核心物品', icon: '💎' },
  { id: 'custom', label: '自定义测试', icon: '🔧' },
];

export default function RegexForgePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as TabId) || 'vendor';
  const setTab = (t: TabId) => setSearchParams(t === 'vendor' ? {} : { tab: t });
  const { regexInput: f, resetRegexInput } = useAppStore();
  const lang = (f.lang || 'cn') as 'en' | 'cn';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-poe-text">正则工坊</h1>
          <p className="text-xs text-poe-muted mt-1">
            {lang === 'cn' ? '简体中文模式 — 使用游戏内中文文本匹配' : '高效英文模式 — 对齐 poe2.re 验证模式'}
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={resetRegexInput}>重置</Button>
      </div>

      {/* Tabs */}
      <nav className="flex gap-1 p-1 rounded-xl bg-poe-darker border border-poe-border overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? 'bg-poe-gold/15 text-poe-gold-light border border-poe-gold/30' : 'text-poe-muted hover:text-poe-text border border-transparent'}`}>
            <span className="text-base">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      {tab === 'vendor' && <VendorSearch />}
      {tab === 'modifiers' && <ItemModifiers />}
      {tab === 'maps' && <MapMods />}
      {tab === 'core' && <CoreItems />}
      {tab === 'custom' && <CustomRegex />}
    </div>
  );
}

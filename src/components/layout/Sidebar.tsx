import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

const SUBNAV: Record<string, { to: string; label: string }[]> = {
  '/regex': [
    { to: '/regex', label: '装备词缀' },
    { to: '/regex?tab=maps', label: '引路石' },
    { to: '/regex?tab=tablet', label: '石板' },
    { to: '/regex?tab=custom', label: '自定义测试' },
  ],
  '/tools': [
    { to: '/tools', label: '伤害计算器' },
    { to: '/tools', label: '天赋树模拟' },
  ],
  '/builds': [
    { to: '/builds', label: '热门BD' },
    { to: '/builds', label: '我的BD' },
  ],
  '/guide': [
    { to: '/guide', label: '新手入门' },
    { to: '/guide', label: '赛季机制' },
    { to: '/guide', label: 'Boss攻略' },
  ],
};

export default function Sidebar() {
  const loc = useLocation();
  const { sidebarOpen } = useAppStore();

  const basePath = '/' + (loc.pathname.split('/')[1] || '');
  const items = SUBNAV[basePath] || [];

  if (!sidebarOpen) return null;

  return (
    <aside className="hidden lg:block w-48 shrink-0">
      <div className="sticky top-16 p-3 space-y-1">
        {items.length > 0 && (
          <p className="text-[10px] font-semibold text-poe-muted uppercase tracking-wider px-2 pb-2">
            {basePath === '/regex' ? '正则工坊' : basePath === '/tools' ? '工具箱' : basePath === '/builds' ? 'BD构建' : '攻略中心'}
          </p>
        )}
        {items.map(item => {
          const active = loc.pathname + loc.search === item.to || (item.to === '/regex' && loc.pathname === '/regex' && !loc.search);
          return (
            <Link key={item.to + item.label} to={item.to}
              className={`block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                active ? 'bg-poe-gold/10 text-poe-gold-light border border-poe-gold/20' : 'text-poe-muted hover:text-poe-text hover:bg-poe-card/50'
              }`}>
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

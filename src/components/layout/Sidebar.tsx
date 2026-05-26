import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

const ALL_NAV = [
  { to: '/regex', label: '正则工坊', children: [
    { to: '/regex', label: '装备词缀' },
    { to: '/regex?tab=maps', label: '引路石' },
    { to: '/regex?tab=tablet', label: '石板' },
    { to: '/regex?tab=custom', label: '自定义测试' },
  ]},
  { to: '/translate', label: '装备翻译' },
  { to: '/guide', label: '技能宝石' },
];

export default function Sidebar() {
  const loc = useLocation();
  const { sidebarOpen } = useAppStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="hidden lg:block w-40 shrink-0">
      <div className="sticky top-16 p-3 space-y-1">
        <p className="text-[10px] font-semibold text-poe-muted uppercase tracking-wider px-2 pb-2">工具导航</p>
        {ALL_NAV.map(item => {
          const active = loc.pathname.startsWith(item.to);
          return (
            <div key={item.to}>
              <Link to={item.to}
                className={`block px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  active ? 'text-poe-gold-light' : 'text-poe-muted hover:text-poe-text'
                }`}>
                {item.label}
              </Link>
              {item.children && active && item.children.map(child => {
                const childActive = loc.pathname + loc.search === child.to || (child.to === '/regex' && loc.pathname === '/regex' && !loc.search);
                return (
                  <Link key={child.to} to={child.to}
                    className={`block pl-5 pr-3 py-1 rounded-lg text-xs transition-colors ${
                      childActive ? 'bg-poe-gold/10 text-poe-gold-light border border-poe-gold/20' : 'text-poe-muted hover:text-poe-text hover:bg-poe-card/50'
                    }`}>
                    {child.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

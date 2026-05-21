import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import QQGroupModal from '../QQGroupModal';

const NAV = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/regex', label: '正则工坊', icon: '⚒' },
  { to: '/tools', label: '工具箱', icon: '🔧' },
  { to: '/builds', label: 'BD构建', icon: '📋' },
  { to: '/guide', label: '攻略中心', icon: '📖' },
];

export default function Navbar() {
  const loc = useLocation();
  const { theme, toggleTheme, sidebarOpen, setSidebarOpen } = useAppStore();
  const [qqOpen, setQqOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-poe-darker/95 backdrop-blur border-b border-poe-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo + hamburger */}
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-1 text-poe-muted hover:text-poe-text"
            onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="text-poe-gold-light">流放</span>
            <span className="text-poe-text">工坊</span>
          </Link>
        </div>

        {/* Center: Nav links (desktop) */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV.map(n => {
            const active = n.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-poe-gold/15 text-poe-gold-light' : 'text-poe-muted hover:text-poe-text hover:bg-poe-card/50'
                }`}>
                <span className="mr-1.5">{n.icon}</span>{n.label}
              </Link>
            );
          })}
        </div>

        {/* Right: QQ + theme */}
        <div className="flex items-center gap-2">
          {/* QQ Group button */}
          <button
            onClick={() => setQqOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       bg-poe-gold/15 border border-poe-gold/40 text-poe-gold-light
                       hover:bg-poe-gold/25 transition-colors"
            title="加入 QQ 交流群"
          >
            <span>💬</span>
            <span>QQ 群</span>
          </button>

          <button onClick={toggleTheme}
            className="p-2 rounded-lg bg-poe-card border border-poe-border text-poe-muted hover:text-poe-text"
            title={theme === 'dark' ? '亮色主题' : '暗色主题'}>
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
        </div>
      </div>

      <QQGroupModal open={qqOpen} onClose={() => setQqOpen(false)} />
    </nav>
  );
}

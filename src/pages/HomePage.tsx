import { Link } from 'react-router-dom';

const MODULES = [
  { to: '/regex', icon: '⚒', title: '正则工坊', desc: '生成 PoE2 游戏内搜索正则表达式 — 装备词缀、引路石、石板、自定义测试', badge: '已上线' },
  { to: '/guide', icon: '💎', title: '技能宝石', desc: '简繁英三语名称互转，方便查询攻略中的技能名称', badge: '已上线' },
  { to: '/tools', icon: '🔧', title: '工具箱', desc: '伤害计算器、天赋树模拟、词缀权重查询等实用工具', badge: '开发中' },
  { to: '/builds', icon: '📋', title: 'BD构建', desc: '热门 BD 分享、装备搭配推荐、天赋树导入导出', badge: '开发中' },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="text-poe-gold-light">流放</span>
          <span className="text-poe-text">工坊</span>
        </h1>
        <p className="mt-3 text-poe-muted text-sm max-w-lg mx-auto leading-relaxed">
          PoE2 中文玩家工具站 — 正则生成、BD构建、攻略指南、实用工具箱
        </p>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODULES.map(m => (
          <Link key={m.to} to={m.to}
            className="block poe-card p-5 hover:border-poe-gold/40 hover:bg-poe-gold/3 transition-all group">
            <div className="flex items-start justify-between">
              <span className="text-3xl">{m.icon}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${
                m.badge === '已上线' ? 'text-poe-green border-poe-green/30 bg-poe-green/10' : 'text-poe-muted border-poe-border bg-poe-dark/30'
              }`}>{m.badge}</span>
            </div>
            <h2 className="mt-3 text-lg font-bold text-poe-text group-hover:text-poe-gold-light transition-colors">{m.title}</h2>
            <p className="mt-1 text-xs text-poe-muted leading-relaxed">{m.desc}</p>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-poe-muted pt-4 border-t border-poe-border">
        <p>流放工坊 — PoE2 中文玩家工具站</p>
      </div>
    </div>
  );
}

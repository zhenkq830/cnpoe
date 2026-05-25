import { useState } from 'react';
import EquipmentDisplay, { type ItemData } from '../components/build/EquipmentDisplay';

const CDN = 'https://web.poecdn.com/gen/image/';
function proxy(url: string) { return `/api/poe-img?url=${encodeURIComponent(url)}`; }
const ICONS = {
  bow:    proxy(CDN+'WzI1LDE0LHsiZiI6IjJESXRlbXMvV2VhcG9ucy9Ud29IYW5kV2VhcG9ucy9Cb3dzL0JvdzA3IiwidyI6MiwiaCI6Mywic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/e3a316543/Bow07.png'),
  helm_d: proxy(CDN+'WzI1LDE0LHsiZiI6IjJESXRlbXMvQXJtb3Vycy9IZWxtZXRzL0Jhc2V0eXBlcy9IZWxtZXREZXgwMyIsInciOjIsImgiOjIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/d964f44629/HelmetDex03.png'),
  body_s: proxy(CDN+'WzI1LDE0LHsiZiI6IjJESXRlbXMvQXJtb3Vycy9Cb2R5QXJtb3Vycy9CYXNldHlwZXMvQm9keVN0cjA4IiwidyI6MiwiaCI6Mywic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/017f2527d7/BodyStr08.png'),
  body_d: proxy(CDN+'WzI1LDE0LHsiZiI6IjJESXRlbXMvQXJtb3Vycy9Cb2R5QXJtb3Vycy9CYXNldHlwZXMvQm9keURleDAzIiwidyI6MiwiaCI6Mywic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/1e5604857a/BodyDex03.png'),
  glove_s:proxy(CDN+'WzI1LDE0LHsiZiI6IjJESXRlbXMvQXJtb3Vycy9HbG92ZXMvQmFzZXR5cGVzL0dsb3Zlc1N0cjAzIiwidyI6MiwiaCI6Miwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/0d3ab1486f/GlovesStr03.png'),
  boot_d: proxy(CDN+'WzI1LDE0LHsiZiI6IjJESXRlbXMvQXJtb3Vycy9Cb290cy9CYXNldHlwZXMvQm9vdHNEZXgwMyIsInciOjIsImgiOjIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/46e1e17e96/BootsDex03.png'),
  ring_a: proxy(CDN+'WzI1LDE0LHsiZiI6IjJESXRlbXMvUmluZ3MvQmFzZXR5cGVzL0FtZXRoeXN0UmluZyIsInciOjEsImgiOjEsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/c021dd54da/AmethystRing.png'),
  ring_g: proxy(CDN+'WzI1LDE0LHsiZiI6IjJESXRlbXMvUmluZ3MvQmFzZXR5cGVzL0dvbGRSaW5nIiwidyI6MSwiaCI6MSwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/0bde220392/GoldRing.png'),
  amulet: proxy(CDN+'WzI1LDE0LHsiZiI6IjJESXRlbXMvQW11bGV0cy9KYWRlQW11bGV0IiwidyI6MSwiaCI6MSwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/b5ec30c23d/JadeAmulet.png'),
  belt:   proxy(CDN+'WzI1LDE0LHsiZiI6IjJESXRlbXMvQmVsdHMvQmFzZXR5cGVzL0JlbHQxMCIsInciOjIsImgiOjEsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/d95952e174/Belt10.png'),
  quiver: proxy(CDN+'WzI1LDE0LHsiZiI6IjJESXRlbXMvUXVpdmVycy9RdWl2ZXJEYW1hZ2UiLCJ3IjoxLCJoIjoyLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/3c6232b9b9/QuiverDamage.png'),
};

/* ================================================================
   装备分期数据 — 模仿 Mobalytics 分级指南
   ================================================================ */
const LEVELS = [
  { lv: 30, label:'Lv.1~30', desc:'前期开荒' },
  { lv: 55, label:'Lv.30~55', desc:'剧情过渡' },
  { lv: 75, label:'Lv.55~75', desc:'异界初期' },
  { lv: 95, label:'Lv.75+', desc:'终局成型' },
];

function mk(slot: string, base: string, rarity: Rarity, icon: string, ilvl: number, lvl: number, explicit: string[], opts?: Partial<ItemData>): ItemData {
  return { slot, name:'', baseType:base, rarity, icon, ilvl, lvlReq:lvl, explicit, ...opts };
}
type Rarity = ItemData['rarity'];
const R='Rare';

const SETS: Record<number, { items: ItemData[]; priority: { slot: string; label: string }[] }> = {
  30: {
    items: [
      mk('Weapon','Shortbow (短弓)',R,ICONS.bow,28,20,['+15% 攻击速度','附加 5-12 冰霜伤害']),
      mk('Helmet','Leather Hood (皮帽)',R,ICONS.helm_d,22,16,['+20 最大生命','+15% 闪避值']),
      mk('Body','Scale Doublet (鳞甲背心)',R,ICONS.body_d,25,18,['+200 闪避值','+30 最大生命']),
      mk('Gloves','Wrapped Mitts (裹手)',R,ICONS.glove_s,20,14,['+10% 攻击速度','+15 最大生命']),
      mk('Boots','Leather Shoes (皮鞋)',R,ICONS.boot_d,20,12,['10% 移动速度提高','+20 最大生命']),
      mk('Ring1','Iron Ring (铁戒指)',R,ICONS.ring_g,18,10,['+15 最大生命','+10% 冰霜抗性']),
      mk('Ring2','Coral Ring (珊瑚戒指)',R,ICONS.ring_a,18,10,['+20 最大生命','+8% 火焰抗性']),
      mk('Amulet','Jade Amulet (翠玉项链)',R,ICONS.amulet,20,12,['+12 敏捷','+15 最大生命']),
      mk('Belt','Leather Belt (皮革腰带)',R,ICONS.belt,20,12,['+25 最大生命','+10% 冰霜抗性']),
      mk('Offhand','Crude Quiver (粗制箭袋)',R,ICONS.quiver,18,10,['+10% 投射物伤害','+10 敏捷']),
    ],
    priority: [
      {slot:'Weapon',label:'任意弓 + 攻击速度'},{slot:'Offhand',label:'任意箭袋'},{slot:'Boots',label:'移速鞋子'},{slot:'Body',label:'闪避胸甲'},
      {slot:'Gloves',label:'攻速手套'},{slot:'Helmet',label:'生命头盔'},{slot:'Amulet',label:'敏捷项链'},{slot:'Belt',label:'生命腰带'},
    ],
  },
  55: {
    items: [
      mk('Weapon','Composite Bow (双子之弓)',R,ICONS.bow,48,35,['+25% 攻击速度','附加 12-28 冰霜伤害','+80 命中值'],{note:'攻速+冰伤优先'}),
      mk('Helmet','Trapper Hood (捕兽兜帽)',R,ICONS.helm_d,42,30,['+40 最大生命','+25% 闪避值','+15% 冰霜抗性']),
      mk('Body','War Plate (征战铠甲)',R,ICONS.body_s,45,35,['+600 闪避值','+50 最大生命','+25% 火焰抗性']),
      mk('Gloves','Gauntlets (手铠)',R,ICONS.glove_s,40,28,['+12% 攻击速度','+35 最大生命'],{crafted:['附加 5-12 冰霜伤害']}),
      mk('Boots','Sollerets (轻鞋)',R,ICONS.boot_d,40,28,['20% 移动速度提高','+40 最大生命','+20% 电抗']),
      mk('Ring1','Amethyst Ring (紫晶戒指)',R,ICONS.ring_a,38,24,['+10% 混沌抗性','+30 最大生命','+15 敏捷']),
      mk('Ring2','Gold Ring (黄金戒指)',R,ICONS.ring_g,35,20,['+15% 物品稀有度','+25 最大生命','+15% 火抗']),
      mk('Amulet','Jade Amulet (翠玉项链)',R,ICONS.amulet,40,28,['+20 敏捷','+35 最大生命','+10% 全元素抗性']),
      mk('Belt','Leather Belt (皮革腰带)',R,ICONS.belt,38,24,['+45 最大生命','+20% 火抗','+15% 冰抗']),
      mk('Offhand','Penetrating Quiver (穿透箭袋)',R,ICONS.quiver,40,28,['+15% 投射物伤害','+22 敏捷','+12% 攻速'],{note:'穿透最优'}),
    ],
    priority: [
      {slot:'Weapon',label:'双子之弓 + 攻速 + 冰伤'},{slot:'Offhand',label:'穿透箭袋'},{slot:'Body',label:'高闪避胸甲'},{slot:'Boots',label:'20% 移速鞋'},
      {slot:'Gloves',label:'攻速手 + 冰点伤'},{slot:'Helmet',label:'生命 + 抗性头'},{slot:'Amulet',label:'敏捷 + 全抗'},{slot:'Belt',label:'生命腰带'},
    ],
  },
  75: {
    items: [
      mk('Weapon','Composite Bow (双子之弓)',R,ICONS.bow,70,62,['+30% 攻击速度','附加 18-42 冰霜伤害','+150 命中值','+20% 暴击率'],{note:'攻速+高冰伤'}),
      mk('Helmet','Trapper Hood (捕兽兜帽)',R,ICONS.helm_d,65,55,['+65 最大生命','+40% 闪避值','+30% 冰抗','+25% 火抗'],{note:'生命+双抗'}),
      mk('Body','War Plate (征战铠甲)',R,ICONS.body_s,68,60,['+1200 闪避值','+80 最大生命','+35% 火抗','+30% 冰抗','+28% 电抗'],{crafted:['+15% 混沌抗性']}),
      mk('Gloves','Gauntlets (手铠)',R,ICONS.glove_s,62,50,['+15% 攻击速度','+55 最大生命','+25% 冰抗'],{crafted:['附加 8-18 冰霜伤害']}),
      mk('Boots','Sollerets (轻鞋)',R,ICONS.boot_d,65,55,['30% 移动速度提高','+70 最大生命','+35% 电抗','+30% 混沌抗']),
      mk('Ring1','Amethyst Ring (紫晶戒指)',R,ICONS.ring_a,60,45,['+15% 混沌抗性','+50 最大生命','+25 敏捷','+20% 冰抗']),
      mk('Ring2','Gold Ring (黄金戒指)',R,ICONS.ring_g,58,40,['+15% 物品稀有度','+40 最大生命','+20% 火抗','+20 智慧']),
      mk('Amulet','Jade Amulet (翠玉项链)',R,ICONS.amulet,62,50,['+25 敏捷','+45 最大生命','+15% 全元素抗性','+20% 暴击伤害']),
      mk('Belt','Utility Belt (功能腰带)',R,ICONS.belt,60,45,['+65 最大生命','+30% 火抗','+25% 冰抗','+15% 药剂回复速度']),
      mk('Offhand','Penetrating Quiver (穿透箭袋)',R,ICONS.quiver,62,50,['+20% 投射物伤害','+30 敏捷','+15% 攻速'],{crafted:['+12% 穿透元素抗性']}),
    ],
    priority: [
      {slot:'Weapon',label:'高攻速+高冰伤弓'},{slot:'Offhand',label:'穿透箭袋+攻速'},{slot:'Body',label:'高闪避+生命+三抗'},{slot:'Boots',label:'30%移速+生命+抗性'},
      {slot:'Gloves',label:'攻速+高冰点伤'},{slot:'Amulet',label:'敏捷+全抗+暴伤'},{slot:'Helmet',label:'生命+双抗头'},{slot:'Belt',label:'生命+双抗腰带'},
    ],
  },
  95: {
    items: [
      mk('Weapon','Composite Bow (双子之弓)',R,ICONS.bow,82,75,['+35% 攻击速度','附加 25-58 冰霜伤害','+250 命中值','+30% 暴击率'],{note:'≥30%攻速+≥50冰伤'}),
      mk('Helmet','Trapper Hood (捕兽兜帽)',R,ICONS.helm_d,78,70,['+85 最大生命','+45% 闪避值','+35% 冰抗','+35% 火抗'],{note:'生命+高三抗'}),
      mk('Body','War Plate (征战铠甲)',R,ICONS.body_s,80,72,['+1800 闪避值','+100 最大生命','+40% 火抗','+38% 冰抗','+35% 电抗'],{crafted:['+20% 混沌抗性']}),
      mk('Gloves','Gauntlets (手铠)',R,ICONS.glove_s,75,68,['+18% 攻击速度','+75 最大生命','+35% 冰抗'],{crafted:['附加 12-25 冰霜伤害']}),
      mk('Boots','Sollerets (轻鞋)',R,ICONS.boot_d,78,70,['35% 移动速度提高','+90 最大生命','+40% 电抗','+35% 混沌抗']),
      mk('Ring1','Amethyst Ring (紫晶戒指)',R,ICONS.ring_a,75,65,['+20% 混沌抗性','+65 最大生命','+35 敏捷','+30% 冰抗']),
      mk('Ring2','Gold Ring (黄金戒指)',R,ICONS.ring_g,72,60,['+20% 物品稀有度','+55 最大生命','+30% 火抗','+25 智慧']),
      mk('Amulet','Jade Amulet (翠玉项链)',R,ICONS.amulet,78,68,['+35 敏捷','+60 最大生命','+20% 全元素抗性','+30% 暴击伤害加成']),
      mk('Belt','Utility Belt (功能腰带)',R,ICONS.belt,75,65,['+85 最大生命','+40% 火抗','+35% 冰抗','+20% 药剂回复速度']),
      mk('Offhand','Penetrating Quiver (穿透箭袋)',R,ICONS.quiver,78,68,['+25% 投射物伤害','+40 敏捷','+18% 攻速'],{crafted:['+15% 穿透元素抗性']}),
    ],
    priority: [
      {slot:'Weapon',label:'≥30%攻速+≥50冰伤'},{slot:'Offhand',label:'穿透箭袋≥15%攻速'},{slot:'Body',label:'1500+闪避+生命+三抗'},{slot:'Boots',label:'35%移速'},
      {slot:'Amulet',label:'敏捷+全抗+暴伤'},{slot:'Gloves',label:'攻速+高冰点伤'},{slot:'Helmet',label:'生命+高三抗'},{slot:'Belt',label:'生命+双抗腰带'},
    ],
  },
};

const TABS = [
  { id:'overview', label:'概览', icon:'📊' },
  { id:'equipment', label:'装备', icon:'🛡' },
  { id:'skills', label:'技能', icon:'⚡' },
  { id:'tree', label:'天赋', icon:'🌳' },
] as const;

export default function BuildGuide() {
  const [tab, setTab] = useState('overview');
  const [levelIdx, setLevelIdx] = useState(3); // 默认终局
  const active = SETS[LEVELS[levelIdx].lv];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-poe-gold-light">冰霜射击锐眼 · 开荒配装指南</h1>
        <p className="text-xs text-poe-muted mt-1">fubgun · 锐眼 · 更新于 2026-05</p>
      </div>

      {/* Tabs */}
      <nav className="flex gap-1 p-1 rounded-xl bg-poe-darker border border-poe-border">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-poe-gold/15 text-poe-gold-light border border-poe-gold/30' : 'text-poe-muted hover:text-poe-text'
            }`}>{t.icon} {t.label}</button>
        ))}
      </nav>

      {/* Level selector */}
      {tab === 'equipment' && (
        <div className="flex gap-1 p-1 rounded-lg bg-poe-dark/50 border border-poe-border/50">
          {LEVELS.map((l, i) => (
            <button key={i} onClick={() => setLevelIdx(i)}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs transition-all ${
                i === levelIdx ? 'bg-poe-gold/15 text-poe-gold-light' : 'text-poe-muted hover:text-poe-text'
              }`}>
              <span className="font-medium">{l.label}</span>
              <span className="block text-[10px] opacity-60">{l.desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {tab === 'equipment' && <EquipmentDisplay items={active.items} priority={active.priority} />}

      {tab === 'overview' && (
        <div className="poe-card p-6 text-center">
          <p className="text-4xl mb-3">🏹</p>
          <p className="text-poe-muted text-sm">冰霜射击 + 冰冻控场 · 远射连锁 · 右下投射物 + 暗影暴击圈</p>
          <p className="text-xs text-poe-muted mt-2">点击「装备」标签查看各阶段配装</p>
        </div>
      )}

      {tab === 'skills' && (
        <div className="poe-card p-6 text-center">
          <p className="text-poe-muted text-sm">技能宝石 — 待开发</p>
        </div>
      )}

      {tab === 'tree' && (
        <div className="poe-card p-6 text-center">
          <p className="text-poe-muted text-sm">天赋树 — 待开发</p>
        </div>
      )}
    </div>
  );
}

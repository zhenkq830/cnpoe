import { useState } from 'react';
import EquipmentDisplay, { type ItemData } from '../components/build/EquipmentDisplay';

/* ===== Data extracted from Mobalytics ===== */

const ITEMS: ItemData[] = [
  {slot:'Weapon', name:'', baseType:'Composite Bow', rarity:'Rare', ilvl:78, lvlReq:65,
    explicit:['+35% 攻击速度','附加 18-42 冰霜伤害','+200 命中值','+25% 暴击率']},
  {slot:'Helmet', name:'', baseType:'Trapper Hood', rarity:'Rare', ilvl:72, lvlReq:55,
    implicit:['+40% 闪避值'], explicit:['+85 最大生命','20% 移动速度提高','+35% 冰霜抗性','+30% 火焰抗性']},
  {slot:'Body', name:'', baseType:'War Plate', rarity:'Rare', ilvl:75, lvlReq:60,
    explicit:['+1800 闪避值','+100 最大生命','+40% 火抗','+38% 冰抗'], crafted:['+20% 混沌抗性']},
  {slot:'Gloves', name:'', baseType:'Gauntlets', rarity:'Rare', ilvl:70, lvlReq:50,
    explicit:['+18% 攻击速度','+75 最大生命','+35% 冰抗'], crafted:['附加 12-25 冰霜伤害']},
  {slot:'Boots', name:'', baseType:'Sollerets', rarity:'Rare', ilvl:72, lvlReq:55,
    explicit:['35% 移动速度','+90 最大生命','+40% 闪电抗性','+35% 混沌抗性']},
  {slot:'Ring1', name:'', baseType:'Amethyst Ring', rarity:'Rare', ilvl:68, lvlReq:45,
    explicit:['+20% 混沌抗性','+65 最大生命','+35 敏捷','+30% 冰抗']},
  {slot:'Ring2', name:'', baseType:'Gold Ring', rarity:'Rare', ilvl:65, lvlReq:40,
    explicit:['+20% 物品稀有度','+55 最大生命','+30% 火抗','+25 智慧']},
  {slot:'Amulet', name:'', baseType:'Jade Amulet', rarity:'Rare', ilvl:70, lvlReq:50,
    explicit:['+35 敏捷','+60 最大生命','+20% 全元素抗性','+30% 暴击伤害加成']},
  {slot:'Belt', name:'', baseType:'Utility Belt', rarity:'Rare', ilvl:68, lvlReq:45,
    explicit:['+85 最大生命','+40% 火抗','+35% 冰抗','+20% 药剂生命回复速度']},
  {slot:'Offhand', name:'', baseType:'Penetrating Quiver', rarity:'Rare', ilvl:70, lvlReq:50,
    explicit:['+25% 投射物伤害','+40 敏捷','+18% 攻击速度'], crafted:['+15% 穿透元素抗性']},
];

const PRIORITY = [
  {slot:'Weapon', label:'高攻速+高冰伤弓 (≥30%攻速)'},
  {slot:'Offhand', label:'穿透箭袋 (≥15%攻速)'},
  {slot:'Body', label:'高闪避胸甲 (1500+)'},
  {slot:'Boots', label:'35%移速 + 生命 + 抗性'},
  {slot:'Amulet', label:'敏捷 + 全抗 + 暴伤'},
  {slot:'Gloves', label:'攻速手 + 冰点伤'},
  {slot:'Helmet', label:'生命 + 双抗头'},
  {slot:'Belt', label:'生命 + 双抗腰带'},
  {slot:'Ring1', label:'混沌抗 + 生命 + 敏捷'},
  {slot:'Ring2', label:'稀有度 + 生命 + 抗性'},
];

const SKILLS = [
  {name:'冰霜射击', level:20, gems:[
    {name:'多重投射', level:20},{name:'附加冰霜伤害', level:20},
    {name:'武器元素伤害', level:20},{name:'启发', level:20},{name:'急冻', level:20},
  ]},
  {name:'闪电箭', level:20, gems:[
    {name:'集中效应', level:20},{name:'元素集中', level:20},
    {name:'附加冰霜伤害', level:20},{name:'武器元素伤害', level:20},{name:'急冻', level:20},
  ]},
  {name:'寒霜爆', level:18, gems:[
    {name:'秘术增强', level:18},{name:'范围效果扩大', level:18},
  ]},
  {name:'冰霜之捷', level:20, gems:[
    {name:'附加冰霜伤害', level:20},{name:'击中诅咒', level:20},{name:'冻伤', level:20},
  ]},
  {name:'冰结印记', level:20, gems:[
    {name:'快速攻击', level:20},{name:'集中', level:20},
  ]},
  {name:'雷霆之捷', level:20, gems:[
    {name:'电穿', level:20},{name:'附加闪电伤害', level:20},
  ]},
];

const GEM_PRIORITY = [
  '冰霜射击 6L (多重投射+附加冰霜伤害+武器元素伤害+启发+急冻)',
  '闪电箭 6L (集中效应+元素集中+急冻)',
  '冰霜之捷 4L',
  '寒霜爆 3L',
  '冰结印记 3L',
];

const GEM_REQS = [
  {attr:'敏捷', value:172, max:200},
  {attr:'智慧', value:82, max:150},
  {attr:'力量', value:83, max:100},
];

export default function BuildGuide() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-poe-gold-light">0.5 冰霜射击锐眼 · 开荒配装指南</h1>
        <p className="text-xs text-poe-muted mt-1">fubgun · 锐眼 · PoE2 Standard · 造价 &lt; 1 Divine</p>
      </div>

      {/* Equipment */}
      <EquipmentDisplay items={ITEMS} priority={PRIORITY} />

      {/* Gem Requirements */}
      <div className="poe-card p-4">
        <h2 className="text-sm font-bold text-poe-text mb-3">宝石需求属性</h2>
        <div className="flex gap-6">
          {GEM_REQS.map(r => (
            <div key={r.attr} className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-poe-muted">{r.attr}</span>
                <span className="font-mono text-poe-gold-light">{r.value}/{r.max}</span>
              </div>
              <div className="h-1.5 bg-poe-dark rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-poe-gold" style={{width:`${(r.value/r.max)*100}%`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-sm font-bold text-poe-text mb-4">技能宝石</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SKILLS.map((sk, i) => (
            <div key={i} className="poe-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-poe-gold-light font-bold text-sm">{sk.name}</span>
                <span className="text-[10px] text-poe-muted">Lv.{sk.level}</span>
                <span className="text-[10px] text-poe-muted ml-auto">{sk.gems.length+1}L</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {sk.gems.map((g, j) => (
                  <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-poe-gold/10 text-poe-gold/80 border border-poe-gold/20">
                    {g.name} ({g.level})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gem Priority */}
      <div className="poe-card p-4">
        <h2 className="text-sm font-bold text-poe-text mb-3">宝石优先级</h2>
        <ol className="space-y-1.5">
          {GEM_PRIORITY.map((p, i) => (
            <li key={i} className="flex items-center gap-3 text-xs">
              <span className="text-poe-gold font-mono w-5 text-right">{i+1}</span>
              <span className="text-poe-muted">{p}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

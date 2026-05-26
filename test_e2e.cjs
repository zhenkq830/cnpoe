/** End-to-end test of ItemTranslator with real equipment */
const fs = require('fs');
const mt = fs.readFileSync('src/data/modTranslations.ts', 'utf8');

function parseMap(content, varName) {
  const map = {};
  const start = content.indexOf('export const ' + varName);
  const objStart = content.indexOf('{', start);
  let depth = 0, end = objStart;
  for (let i = objStart; i < content.length; i++) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  const section = content.substring(objStart + 1, end);
  for (const line of section.split('\n')) {
    const t = line.trim(); if (!t.startsWith('"')) continue;
    const colonIdx = t.indexOf('":');
    if (colonIdx < 0) continue;
    try {
      const key = JSON.parse(t.substring(0, colonIdx + 1));
      let valStr = t.substring(colonIdx + 2).trim();
      if (valStr.endsWith(',')) valStr = valStr.substring(0, valStr.length - 1);
      const val = JSON.parse(valStr);
      map[key] = val;
    } catch(e) {}
  }
  return map;
}

const CN2EN = parseMap(mt, 'CN2EN');
const TW2EN = parseMap(mt, 'TW2EN');

// Parse base type data
function parseBaseMap(f) {
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(/Record<string,string> = \{([\s\S]*)\};/);
  const map = {};
  if (m) for (const l of m[1].split('\n')) {
    const kv = l.match(/"([^"]+)":"([^"]+)",?/);
    if (kv) map[kv[1]] = kv[2];
  }
  return map;
}
const BASE_TYPES = parseBaseMap('src/data/baseTypes.ts');
const POE2_CN = parseBaseMap('src/data/poe2BaseCN.ts');
const POE2_TW = parseBaseMap('src/data/poe2BaseTW.ts');

// Full FIXES + synonyms from ItemTranslator.tsx
const FIXES = [
  [/所有召唤生物技能等级\s*\+?\s*(\d+)/,'+$1 to Level of all Minion Skills'],
  [/所有投射物技能等级\s*\+?\s*(\d+)/,'+$1 to Level of all Projectile Skills'],
  [/所有法术技能等级\s*\+?\s*(\d+)/,'+$1 to Level of all Spell Skills'],
  [/所有攻击技能等级\s*\+?\s*(\d+)/,'+$1 to Level of all Attack Skills'],
  [/弓类技能伤害提高\s*(\d+)%/,'$1% increased Damage with Bow Skills'],
  [/投射物速度提高\s*(\d+)%/,'$1% increased Projectile Speed'],
  [/攻击速度提高\s*(\d+)%/,'$1% increased Attack Speed'],
  [/施法速度提高\s*(\d+)%/,'$1% increased Cast Speed'],
  [/物理伤害提高\s*(\d+)%/,'$1% increased Physical Damage'],
  [/附加\s*(\d+)\s*[-至]\s*(\d+)\s*冰霜伤害/,'Adds $1 to $2 Cold Damage'],
  [/附加\s*(\d+)\s*[-至]\s*(\d+)\s*物理伤害/,'Adds $1 to $2 Physical Damage'],
  [/附加\s*(\d+)\s*[-至]\s*(\d+)\s*火焰伤害/,'Adds $1 to $2 Fire Damage'],
  [/附加\s*(\d+)\s*[-至]\s*(\d+)\s*闪电伤害/,'Adds $1 to $2 Lightning Damage'],
  [/暴击几率\s*\+\s*([\d.]+)%/,'+$1% to Critical Hit Chance'],
  [/获得相当于伤害\s*(\d+)%\s*的额外火焰伤害/,'Gain $1% of Damage as Extra Fire Damage'],
  [/获得相当于伤害\s*(\d+)%\s*的额外冰冷伤害/,'Gain $1% of Damage as Extra Cold Damage'],
  [/获得相当于伤害\s*(\d+)%\s*的额外闪电伤害/,'Gain $1% of Damage as Extra Lightning Damage'],
  [/获得相当于伤害\s*(\d+)%\s*的额外冰霜伤害/,'Gain $1% of Damage as Extra Cold Damage'],
  [/获得相当于伤害\s*(\d+)%\s*的额外物理伤害/,'Gain $1% of Damage as Extra Physical Damage'],
  [/获得相当于伤害\s*(\d+)%\s*的额外混沌伤害/,'Gain $1% of Damage as Extra Chaos Damage'],
  [/获得相当于伤害\s*(\d+)%\s*的额外(.+?)伤害/,'Gain $1% of Damage as Extra $2 Damage'],
  [/最大生命\s*\+?\s*(\d+)/,'+$1 to maximum Life'],
  [/命中值?\s*\+?\s*(\d+)/,'+$1 to Accuracy Rating'],
  [/全部元素抗性\s*\+?\s*(\d+)%/,'+$1% to all Elemental Resistances'],
  [/闪避值提高\s*(\d+)%/,'$1% increased Evasion Rating'],
  [/能量护盾提高\s*(\d+)%/,'$1% increased Energy Shield'],
  [/击杀敌人时回复\s*\+?\s*(\d+)\s*生命/,'+$1 Life gained on Kill'],
  [/附加\s*(\d+)\s*[-至]\s*(\d+)\s*冰冷伤害/,'Adds $1 to $2 Cold Damage'],
  [/附加\s*(\d+)\s*[-至]\s*(\d+)\s*混沌伤害/,'Adds $1 to $2 Chaos Damage'],
  [/最大魔力\s*\+?\s*(\d+)/,'+$1 to maximum Mana'],
  [/投射物射程降低\s*(\d+)%/,'$1% reduced Projectile Range'],
  [/攻击暴击率提高\s*(\d+)%/,'$1% increased Critical Hit Chance for Attacks'],
  [/(\d+)%.*溢出.*额外箭矢/,'$1% Surpassing chance to fire an additional Arrow'],
  [/额外投射物/,'Fires additional Projectile'],
  // TC
  [/增加\s*(\d+)%\s*物理傷害/,'$1% increased Physical Damage'],
  [/增加\s*(\d+)%\s*攻擊速度/,'$1% increased Attack Speed'],
  [/增加\s*(\d+)%\s*投射物速度/,'$1% increased Projectile Speed'],
  [/附加\s*(\d+)\s*至\s*(\d+)\s*物理傷害/,'Adds $1 to $2 Physical Damage'],
  [/附加\s*(\d+)\s*至\s*(\d+)\s*火焰傷害/,'Adds $1 to $2 Fire Damage'],
  [/附加\s*(\d+)\s*至\s*(\d+)\s*冰冷傷害/,'Adds $1 to $2 Cold Damage'],
  [/附加\s*(\d+)\s*至\s*(\d+)\s*閃電傷害/,'Adds $1 to $2 Lightning Damage'],
  [/獲得相當於傷害\s*(\d+)%\s*的額外火焰傷害/,'Gain $1% of Damage as Extra Fire Damage'],
  [/獲得相當於傷害\s*(\d+)%\s*的額外冰冷傷害/,'Gain $1% of Damage as Extra Cold Damage'],
  [/獲得相當於傷害\s*(\d+)%\s*的額外閃電傷害/,'Gain $1% of Damage as Extra Lightning Damage'],
  [/獲得相當於傷害\s*(\d+)%\s*的額外物理傷害/,'Gain $1% of Damage as Extra Physical Damage'],
  [/獲得相當於傷害\s*(\d+)%\s*的額外混沌傷害/,'Gain $1% of Damage as Extra Chaos Damage'],
  [/獲得相當於傷害\s*(\d+)%\s*的額外(.+?)傷害/,'Gain $1% of Damage as Extra $2 Damage'],
  [/暴擊率\s*\+?\s*([\d.]+)%/,'+$1% to Critical Hit Chance'],
  [/全部攻擊技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Attack Skills'],
  [/全部法術技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Spell Skills'],
  [/全部投射物技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Projectile Skills'],
  [/全部召喚生物技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Minion Skills'],
  [/減少\s*(\d+)%\s*投射物範圍/,'$1% reduced Projectile Range'],
  [/命中:\s*增加\s*(\d+)%\s*投射物速度/,'Bonded: $1% increased Projectile Speed'],
  [/命中:\s*獲得相當於傷害\s*(\d+)%\s*的額外(\S+)傷害/,'Bonded: Gain $1% of Damage as Extra $2 Damage'],
  [/命中:\s*增加\s*(\d+)%\s*完全破甲的效果/,'Bonded: $1% increased effect of Fully Broken Armour'],
  [/命中:\s*(.+)/,'Bonded: $1'],
  [/(\d+)%\s*滿溢機率發射額外.*箭矢/,'+$1% Surpassing chance to fire an additional Arrow'],
  [/赋予技能[:\s]*长矛投掷/,'{tags:attack}Grants Skill: Spear Throw'],
  [/赋予技能[:\s]*战矛飞掷/,'{tags:attack}Grants Skill: Spear Throw'],
  [/赋予技能[:\s]*(.+)/,'{tags:attack}Grants Skill: $1'],
  [/获得技能[:\s]*(.+)/,'{tags:attack}Grants Skill: $1'],
  // Generic stat increases (SC)
  [/闪电抗性\s*\+?\s*(\d+)%/,'+$1% to Lightning Resistance'],
];

const SYNONYMS = [[/提高/g,'加快'],[/降低/g,'减慢'],[/闪避值/g,'闪避'],[/冰霜/g,'冰冷'],[/冰冷/g,'冰霜'],[/技能等级/g,'技能石等级']];

function applySynonyms(s) {
  const results = [s];
  for (const [re, repl] of SYNONYMS) {
    const v2 = s.replace(re, repl);
    if (v2 !== s) results.push(v2);
  }
  return results;
}

function translateLine(raw, lang) {
  const db = lang === 'tc' ? TW2EN : CN2EN;
  const clean = raw.trim().replace(/\s+/g,' ').replace(/[：∶]/g,':').replace(/（/g,'(').replace(/）/g,')').replace(/，/g,',').replace(/。/g,'.').replace(/[【】\[\]]/g,'').replace(/(?<=[一-鿿])\s+(?=[一-鿿])/g,'').trim();
  const stripped = clean.replace(/\s*\((implicit|enchant|rune|desecrated|crafted|fractured|augmented)\)/gi,'').trim();
  const strippedNoPlus = stripped.replace(/^\+/,'');
  const nums = stripped.match(/\d+(?:\.\d+)?/g) || [];
  const isRune = /\(rune\)/i.test(raw);

  // Headers
  if (/稀有度/.test(clean)) {
    if (clean.includes('传奇')) return 'Rarity: UNIQUE';
    if (clean.includes('稀有')) return 'Rarity: RARE';
    if (clean.includes('魔法')) return 'Rarity: MAGIC';
    return 'Rarity: NORMAL';
  }
  if (/^物品等级/.test(clean)) { const m = clean.match(/(\d+)/); if (m) return 'Item Level: ' + m[1]; }
  if (/^品质/.test(clean)) { const m = clean.match(/(\d+)%/); return m ? 'Quality: +' + m[1] + '%' : null; }
  if (/^插槽/.test(clean)) return null;
  if (/^需求/.test(clean)) {
    const lv = clean.match(/等级\s*(\d+)/);
    const am = {'敏捷':'Dex','力量':'Str','智慧':'Int'};
    let e = 'Requires Level ' + (lv ? lv[1] : '');
    for (const a of clean.matchAll(/(\d+)\s*(敏捷|力量|智慧)/g)) e += ', ' + a[1] + ' ' + am[a[2]];
    return e;
  }
  // TC headers
  if (/^物品等級/.test(clean)) { const m = clean.match(/(\d+)/); if (m) return 'Item Level: ' + m[1]; }
  if (/^已汙染|^已污染/.test(clean)) return 'Corrupted';
  if (/^備註/.test(clean)) { const m = clean.match(/備註[:\s]*(.+)/); if (m) return m[1]; }

  // Damage/stat headers
  const dm = clean.match(/^(物理|闪电|火焰|冰霜|混沌)伤害[:\s]*(\d+)[-\s]*(\d+)/);
  if (dm) { const t = {'物理':'Physical Damage','闪电':'Lightning Damage','火焰':'Fire Damage','冰霜':'Cold Damage','混沌':'Chaos Damage'}; return t[dm[1]] + ': ' + dm[2] + '-' + dm[3]; }
  if (/^(能量护盾|闪避值|护甲)[:\s]/.test(clean)) { const v = clean.match(/(\d+)/); const l = clean.startsWith('能量护盾')?'Energy Shield':clean.startsWith('闪避')?'Evasion Rating':'Armour'; if (v) return l + ': ' + v[1]; }
  if (/^暴击率[:\s]/.test(clean)) { const c = clean.match(/([\d.]+)%/); if (c) return 'Critical Hit Chance: ' + c[1] + '%'; }
  if (/^每秒攻击次数/.test(clean)) { const a = clean.match(/([\d.]+)/); if (a) return 'Attacks per Second: ' + a[1]; }
  if (/已腐[化蝕]|已污染/.test(clean)) return 'Corrupted';
  if (/已複製|已复制/.test(clean)) return 'Mirrored';
  if (/只能在使用|引路石掉落|物品类别|这个装备|cannot/i.test(clean)) return '';
  if (/^-{4,}$/.test(clean)) return '';

  // Base type
  if (clean.length >= 2 && !/[:：\d]/.test(clean) && !/稀有|魔法|普通|传奇|物品|需求|已腐|只能|分裂/.test(clean)) {
    const bt = BASE_TYPES[clean] || POE2_CN[clean] || POE2_TW[clean];
    if (bt) return bt;
    return null;
  }

  // FIXES
  for (const [re, tpl] of FIXES) {
    const m = stripped.match(re);
    if (m) { let r = tpl; for (let i = 1; i < m.length; i++) r = r.replace('$' + i, m[i]); return r; }
  }

  // PoeCharm with synonyms + reverse
  const tryVariants = (s) => {
    const variants = applySynonyms(s);
    for (const v of variants) {
      const e = db[v]; if (e) return e;
      if (nums.length > 0) {
        let p = v;
        nums.forEach((n, i) => { p = p.replace(n, '{' + i + '}') });
        let m = db[p]; if (m) { let r = m; nums.forEach((n, i) => { r = r.replace('{' + i + '}', n) }); return r; }
        let q = v.replace(/[+-]?\d+(?:\.\d+)?%?/g, '').replace(/\s+/g, ' ').trim();
        if (q.length > 1) {
          const rev = '{0} ' + q;
          m = db[rev]; if (m) { let r = m; nums.forEach((n, i) => { r = r.replace('{' + i + '}', n) }); return r; }
          if (/%/.test(v)) {
            const revPct = '{0}% ' + q;
            m = db[revPct]; if (m) { let r = m; nums.forEach((n, i) => { r = r.replace('{' + i + '}', n) }); return r; }
          }
        }
      }
    }
    return null;
  };
  for (const c of [raw, clean, strippedNoPlus]) {
    let r = tryVariants(c);
    if (r) return r;
  }
  return null;
}

function translateItem(text, lang) {
  const lines = text.split('\n');
  const headers = [], implicits = [], explicits = [];
  let baseType = null;

  for (const line of lines) {
    const raw = line.trim();
    if (!raw || raw.length < 2) continue;

    const clean = raw.replace(/\s+/g,' ').replace(/[：∶]/g,':').replace(/（/g,'(').replace(/）/g,')').replace(/，/g,',').replace(/。/g,'.').replace(/[【】\[\]]/g,'').replace(/(?<=[一-鿿])\s+(?=[一-鿿])/g,'').trim();

    // Skip separator lines
    if (/^-{4,}$/.test(clean)) continue;

    // Check base type first
    if (clean.length >= 2 && !/[:：\d]/.test(clean) && !/稀有|魔法|普通|传奇|物品|需求|已腐|只能|分裂/.test(clean)) {
      const bt = BASE_TYPES[clean] || POE2_CN[clean] || POE2_TW[clean];
      if (bt) { baseType = bt; continue; }
    }

    const result = translateLine(raw, lang);
    if (!result) { console.log('  ? ' + raw); continue; }

    if (/^(Rarity|Item Level|Quality|Requires|Corrupted|Mirrored)/.test(result)) {
      console.log('  H ' + raw + ' -> ' + result);
    } else if (/^(Energy Shield|Evasion|Armour|Physical Damage|Fire Damage|Cold Damage|Lightning Damage|Chaos Damage|Critical|Attacks per)/.test(result)) {
      headers.push(result);
      console.log('  S ' + raw + ' -> ' + result);
    } else if (/\(implicit\)/i.test(raw)) {
      implicits.push(result);
      console.log('  I ' + raw + ' -> ' + result);
    } else {
      explicits.push(result);
      console.log('  E ' + raw + ' -> ' + result);
    }
  }

  // Build PoB output
  const out = ['Custom Item'];
  if (baseType) out.push(baseType);
  out.push(...headers);
  if (implicits.length) { out.push('Implicits: ' + implicits.length); out.push(...implicits); }
  out.push(...explicits);
  return out.join('\n');
}

// Test with real PoE2 items
console.log('=== TEST 1: Armour (CN) ===');
const armourItem = `稀有度: 稀有
帝国巨盔
品质: +20%
护甲: 186
物品等级: 78
需求 等级 65, 87 力量
--------
最大生命 +89
护甲提高 42%
冰霜抗性 +30%
火焰抗性 +28%
闪电抗性 +35%`;

console.log(translateItem(armourItem, 'cn'));
console.log('');

console.log('=== TEST 2: Bow (CN) ===');
const bowItem = `稀有度: 稀有
重装强弓
品质: +20%
物理伤害: 45-82
火焰伤害: 12-28
暴击率: 5.00%
每秒攻击次数: 1.20
物品等级: 72
需求 等级 65, 120 敏捷
--------
物理伤害提高 135%
附加 18 至 32 火焰伤害
攻击速度提高 12%
暴击几率 +2.5%
弓类技能伤害提高 30%
发射一支额外箭矢`;

console.log(translateItem(bowItem, 'cn'));
console.log('');

console.log('=== TEST 3: Ring (CN) ===');
const ringItem = `稀有度: 稀有
翡翠戒指
物品等级: 75
--------
最大生命 +65
冰霜抗性 +30%
全部元素抗性 +12%
物品稀有度提高 22%
击杀敌人时回复 +15 生命`;

console.log(translateItem(ringItem, 'cn'));
console.log('');

console.log('=== TEST 4: Body Armour (TC) ===');
const bodyTC = `稀有度: 稀有
征戰鎧甲
品質: +20%
護甲: 456
物品等級: 80
需求 等級 70, 120 力量
--------
最大生命 +120
護甲提高 42%
火焰抗性 +35%
冰冷抗性 +28%
增加 15% 移動速度`;

console.log(translateItem(bodyTC, 'tc'));

/** Test with realistic PoE2 item text, including FIXES + improved PoeCharm matching */
const fs = require('fs');

// Read the actual ItemTranslator data
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
  const lines = section.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith('"')) continue;
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

// FIXES patterns (from the actual file)
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
  [/投射物射程降低\s*(\d+)%/,'$1% reduced Projectile Range'],
  [/攻击暴击率提高\s*(\d+)%/,'$1% increased Critical Hit Chance for Attacks'],
  [/(\d+)%.*溢出.*额外箭矢/,'$1% Surpassing chance to fire an additional Arrow'],
  [/发射一支额外箭矢/,'Fires an additional Arrow'],
  [/获得相当于伤害\s*(\d+)%.*额外伤害/,'Gain $1% of Damage as Extra Elemental Damage'],
  [/额外投射物/,'Fires additional Projectile'],
  [/最大生命\s*\+?\s*(\d+)/,'+$1 to maximum Life'],
  [/命中值?\s*\+?\s*(\d+)/,'+$1 to Accuracy Rating'],
  [/(?:\+?\s*(\d+)\s*命中值)/,'+$1 to Accuracy Rating'],
  // TC
  [/增加\s*(\d+)%\s*物理傷害/,'$1% increased Physical Damage'],
  [/增加\s*(\d+)%\s*攻擊速度/,'$1% increased Attack Speed'],
  [/增加\s*(\d+)%\s*投射物速度/,'$1% increased Projectile Speed'],
  [/附加\s*(\d+)\s*至\s*(\d+)\s*物理傷害/,'Adds $1 to $2 Physical Damage'],
  [/附加\s*(\d+)\s*至\s*(\d+)\s*火焰傷害/,'Adds $1 to $2 Fire Damage'],
  [/附加\s*(\d+)\s*至\s*(\d+)\s*冰冷傷害/,'Adds $1 to $2 Cold Damage'],
  [/附加\s*(\d+)\s*至\s*(\d+)\s*閃電傷害/,'Adds $1 to $2 Lightning Damage'],
  [/全部攻擊技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Attack Skills'],
  [/全部法術技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Spell Skills'],
  [/全部投射物技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Projectile Skills'],
  [/全部召喚生物技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Minion Skills'],
  [/暴擊率\s*\+?\s*([\d.]+)%/,'+$1% to Critical Hit Chance'],
  [/獲得相當於傷害\s*(\d+)%\s*的額外(\S+)傷害/,'Gain $1% of Damage as Extra $2 Damage'],
  [/減少\s*(\d+)%\s*投射物範圍/,'$1% reduced Projectile Range'],
  [/命定:\s*增加\s*(\d+)%\s*投射物速度/,'Bonded: $1% increased Projectile Speed'],
  [/命定:\s*獲得相當於傷害\s*(\d+)%\s*的額外(\S+)傷害/,'Bonded: Gain $1% of Damage as Extra $2 Damage'],
  [/命定:\s*增加\s*(\d+)%\s*完全破甲的效果/,'Bonded: $1% increased effect of Fully Broken Armour'],
  [/命定:\s*(.+)/,'Bonded: $1'],
  [/(\d+)%\s*滿溢機率發射額外.*箭矢/,'+$1% Surpassing chance to fire an additional Arrow'],
];

const SYNONYMS = [
  [/提高/g,'加快'], [/降低/g,'减慢'], [/闪避值/g,'闪避'],
  [/冰霜/g,'冰冷'], [/冰冷/g,'冰霜'],
  [/技能等级/g,'技能石等级'], [/技能石等级/g,'技能等级'],
];

function applySynonyms(s) {
  const results = [s];
  for (const [re, repl] of SYNONYMS) {
    const next = results.map(v => v.replace(re, repl));
    results.push(...next.filter(v => !results.includes(v)));
  }
  return [...new Set(results)];
}

function translateLine(raw, db) {
  const clean = raw.trim().replace(/\s+/g,' ').replace(/[：∶]/g,':').replace(/（/g,'(').replace(/）/g,')').replace(/，/g,',').replace(/。/g,'.').replace(/[【】\[\]]/g,'').replace(/(?<=[一-鿿])\s+(?=[一-鿿])/g,'').trim();
  const stripped = clean.replace(/\s*\((implicit|enchant|rune|desecrated|crafted|fractured|augmented)\)/gi,'').trim();
  const strippedNoPlus = stripped.replace(/^\+/,'');
  const nums = stripped.match(/\d+(?:\.\d+)?/g) || [];

  // FIXES first
  for (const [re, tpl] of FIXES) {
    const m = stripped.match(re);
    if (m) { let r = tpl; for (let i = 1; i < m.length; i++) r = r.replace('$' + i, m[i]); return { en: r, method: 'FIXES' }; }
  }

  // PoeCharm
  const tryVariants = (s) => {
    const variants = applySynonyms(s);
    for (const v of variants) {
      const e = db[v]; if (e) return e;
      if (nums.length > 0) {
        let p = v;
        nums.forEach((n, i) => { p = p.replace(n, '{' + i + '}') });
        let m = db[p];
        if (m) { let r = m; nums.forEach((n, i) => { r = r.replace('{' + i + '}', n) }); return r; }
        let q = v.replace(/[+-]?\d+(?:\.\d+)?%?/g, '').replace(/\s+/g, ' ').trim();
        if (q.length > 1) {
          const rev = nums.length === 1 ? `{0} ${q}`.replace(/\s+/g, ' ').trim() : null;
          if (rev) { m = db[rev]; if (m) { let r = m; nums.forEach((n, i) => { r = r.replace('{' + i + '}', n) }); return r; } }
          if (/%/.test(v)) {
            const revPct = nums.length === 1 ? `{0}% ${q}`.replace(/\s+/g, ' ').trim() : null;
            if (revPct) { m = db[revPct]; if (m) { let r = m; nums.forEach((n, i) => { r = r.replace('{' + i + '}', n) }); return r; } }
          }
        }
      }
    }
    return null;
  };
  for (const c of [raw, clean, strippedNoPlus]) {
    let r = tryVariants(c);
    if (r) { if (/^\+/.test(raw) && !/^\+/.test(r)) r = '+' + r; return { en: r, method: 'PoeCharm' }; }
  }

  return null;
}

// Test with a full item
const item = [
  '稀有度: 稀有',
  '帝国巨盔',
  '品质: +20%',
  '护甲: 186',
  '物品等级: 78',
  '需求 等级 65, 87 力量',
  '--------',
  '最大生命 +89',
  '护甲提高 42%',
  '冰霜抗性 +30%',
  '火焰抗性 +28%',
  '闪电抗性 +35%',
  '混沌抗性 +18%',
];

console.log('=== Full Item Translation (CN) ===');
let ok = 0, fail = 0;
item.forEach(line => {
  const r = translateLine(line, CN2EN);
  if (r && r.en) { ok++; console.log('  [' + r.method + '] ' + line + ' → ' + r.en); }
  else { fail++; console.log('  ✗ ' + line); }
});
console.log('Result: ' + ok + '/' + item.length + ' OK');

// Test all individual mods
console.log('\n=== Additional Mod Tests ===');
const moreTests = [
  '全部元素抗性 +12%',
  '闪避值提高 38%',
  '能量护盾提高 25%',
  '移动速度提高 25%',
  '击杀敌人时回复 +15 生命',
  '获得相当于伤害 8% 的额外火焰伤害',
  '所有法术技能等级 +1',
  '弓类技能伤害提高 30%',
  '投射物速度提高 20%',
  '附加 12 至 22 火焰伤害',
  '攻击速度提高 12%',
  '暴击几率 +2.5%',
];

moreTests.forEach(t => {
  const r = translateLine(t, CN2EN);
  if (r && r.en) { ok++; console.log('  [' + r.method + '] ' + t + ' → ' + r.en); }
  else { fail++; console.log('  ✗ ' + t); }
});
console.log('Total: ' + ok + '/' + (item.length + moreTests.length) + ' OK');

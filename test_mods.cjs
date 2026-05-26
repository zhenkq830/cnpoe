/** Test mod translation matching */
const fs = require('fs');

// Parse CN2EN from modTranslations
const mt = fs.readFileSync('src/data/modTranslations.ts', 'utf8');
const cnMatch = mt.match(/export const CN2EN: Record<string,string> = \{([\s\S]*?)\n\};/);
const CN2EN = {};
if (cnMatch) {
  for (const l of cnMatch[1].split('\n')) {
    const m = l.trim().match(/^"((?:[^"\\]|\\.)*)":"((?:[^"\\]|\\.)*)",?$/);
    if (m) {
      CN2EN[m[1]] = m[2];
    }
  }
}

const TW2EN = {};
const twMatch = mt.match(/export const TW2EN: Record<string,string> = \{([\s\S]*?)\n\};/);
if (twMatch) {
  for (const l of twMatch[1].split('\n')) {
    const m = l.trim().match(/^"((?:[^"\\]|\\.)*)":"((?:[^"\\]|\\.)*)",?$/);
    if (m) {
      TW2EN[m[1]] = m[2];
    }
  }
}

console.log('CN2EN:', Object.keys(CN2EN).length, 'TW2EN:', Object.keys(TW2EN).length);

// Simulate the translation logic
function translateLine(raw, lang) {
  const db = lang === 'tc' ? TW2EN : CN2EN;
  const clean = raw.trim().replace(/\s+/g,' ').replace(/[：∶]/g,':').replace(/（/g,'(').replace(/）/g,')').replace(/，/g,',').replace(/。/g,'.').replace(/[【】\[\]]/g,'').replace(/(?<=[一-鿿])\s+(?=[一-鿿])/g,'').trim();
  const stripped = clean.replace(/\s*\((implicit|enchant|rune|desecrated|crafted|fractured|augmented)\)/gi,'').trim();
  const strippedNoPlus = stripped.replace(/^\+/,'');
  const nums = clean.match(/\d+(?:\.\d+)?/g) || [];

  // Exact matches
  for (const c of [raw, clean, strippedNoPlus]) {
    const e = db[c]; if (e) return { en: e, method: 'exact' };
  }

  // Number placeholder match
  if (nums.length > 0) {
    for (const c of [clean, strippedNoPlus]) {
      let p = c;
      nums.forEach((n, i) => { p = p.replace(n, '{' + i + '}') });
      const e = db[p];
      if (e) {
        let r = e;
        nums.forEach((n, i) => { r = r.replace('{' + i + '}', n) });
        return { en: r, method: 'placeholder' };
      }
    }
  }

  return null;
}

// Test with common PoE2 mod texts
const cnTests = [
  // Weapon mods
  '附加 12 至 22 火焰伤害',
  '附加 8 至 15 冰冷伤害',
  '附加 1 至 32 闪电伤害',
  '物理伤害提高 45%',
  '攻击速度提高 12%',
  '暴击几率 +2.5%',
  '+20 力量',
  '+35 敏捷',
  '+42 智慧',
  '命中值 +150',
  // Armour mods
  '最大生命 +89',
  '护甲提高 42%',
  '闪避值提高 38%',
  '能量护盾提高 25%',
  '冰霜抗性 +30%',
  '火焰抗性 +28%',
  '闪电抗性 +35%',
  '混沌抗性 +18%',
  // Resistance mods
  '全部元素抗性 +12%',
  '+15% 冰霜抗性',
  // Speed mods
  '移动速度提高 25%',
  // Rare mod patterns
  '击杀敌人时回复 +15 生命',
  '物品稀有度提高 22%',
  // PoE2 specific
  '获得相当于伤害 8% 的额外火焰伤害',
  '所有法术技能等级 +1',
  '所有召唤生物技能等级 +2',
  '弓类技能伤害提高 30%',
  '投射物速度提高 20%',
];

const twTests = [
  '附加 12 至 22 火焰傷害',
  '增加 45% 物理傷害',
  '增加 12% 攻擊速度',
  '+20 力量',
  '最大生命 +89',
  '增加 25% 移動速度',
  '全部元素抗性 +12%',
];

console.log('\n=== CN Tests ===');
let cnOk = 0, cnFail = 0;
cnTests.forEach(t => {
  const r = translateLine(t, 'cn');
  if (r) { cnOk++; console.log('  OK [' + r.method + '] ' + t + ' → ' + r.en); }
  else { cnFail++; console.log('  FAIL ' + t); }
});
console.log('CN: ' + cnOk + '/' + cnTests.length + ' OK');

console.log('\n=== TW Tests ===');
let twOk = 0, twFail = 0;
twTests.forEach(t => {
  const r = translateLine(t, 'tc');
  if (r) { twOk++; console.log('  OK [' + r.method + '] ' + t + ' → ' + r.en); }
  else { twFail++; console.log('  FAIL ' + t); }
});
console.log('TW: ' + twOk + '/' + twTests.length + ' OK');

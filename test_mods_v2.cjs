/** Test improved matching logic */
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

// Simulate NEW matching logic (with reverse order)
function translateLine(raw, db) {
  const clean = raw.trim().replace(/\s+/g,' ').replace(/[：∶]/g,':').replace(/（/g,'(').replace(/）/g,')').replace(/，/g,',').replace(/。/g,'.').replace(/[【】\[\]]/g,'').replace(/(?<=[一-鿿])\s+(?=[一-鿿])/g,'').trim();
  const stripped = clean.replace(/\s*\((implicit|enchant|rune|desecrated|crafted|fractured|augmented)\)/gi,'').trim();
  const strippedNoPlus = stripped.replace(/^\+/,'');
  const nums = clean.match(/\d+(?:\.\d+)?/g) || [];

  // Exact match
  for (const c of [raw, clean, strippedNoPlus]) {
    const e = db[c]; if (e) return { en: e, method: 'exact' };
  }

  if (nums.length > 0) {
    for (const c of [clean, strippedNoPlus]) {
      let p = c;
      // Standard: replace numbers in-place
      nums.forEach((n, i) => { p = p.replace(n, '{' + i + '}') });
      let m = db[p];
      if (m) {
        let r = m; nums.forEach((n, i) => { r = r.replace('{' + i + '}', n) });
        return { en: r, method: 'placeholder' };
      }
      // Reverse: move numbers to front
      let q = c.replace(/[+-]?\d+(?:\.\d+)?%?/g, '').replace(/\s+/g, ' ').trim();
      if (q.length > 1) {
        const rev = nums.length === 1
          ? ('{0} ' + q).replace(/\s+/g, ' ').trim()
          : ('{0} {1} ' + q).replace(/\s+/g, ' ').trim();
        m = db[rev];
        if (m) {
          let r = m; nums.forEach((n, i) => { r = r.replace('{' + i + '}', n) });
          return { en: r, method: 'reverse' };
        }
        // With % suffix
        if (/%/.test(c)) {
          const revPct = nums.length === 1
            ? ('{0}% ' + q).replace(/\s+/g, ' ').trim()
            : ('{0}% {1}% ' + q).replace(/\s+/g, ' ').trim();
          m = db[revPct];
          if (m) {
            let r = m; nums.forEach((n, i) => { r = r.replace('{' + i + '}', n) });
            return { en: r, method: 'reverse%' };
          }
        }
      }
    }
  }
  return null;
}

const cnTests = [
  '附加 12 至 22 火焰伤害', '附加 8 至 15 冰冷伤害', '附加 1 至 32 闪电伤害',
  '物理伤害提高 45%', '攻击速度提高 12%', '暴击几率 +2.5%',
  '+20 力量', '+35 敏捷', '+42 智慧', '命中值 +150',
  '最大生命 +89', '护甲提高 42%', '闪避值提高 38%',
  '能量护盾提高 25%', '冰霜抗性 +30%', '火焰抗性 +28%',
  '闪电抗性 +35%', '混沌抗性 +18%', '全部元素抗性 +12%',
  '+15% 冰霜抗性', '移动速度提高 25%', '击杀敌人时回复 +15 生命',
  '物品稀有度提高 22%', '获得相当于伤害 8% 的额外火焰伤害',
  '所有法术技能等级 +1', '所有召唤生物技能等级 +2',
  '弓类技能伤害提高 30%', '投射物速度提高 20%',
];

console.log('=== CN Tests (with reverse matching) ===');
let cnOk = 0;
cnTests.forEach(t => {
  const r = translateLine(t, CN2EN);
  if (r) { cnOk++; console.log('  [' + r.method + '] ' + t + ' → ' + r.en); }
  else { console.log('  ✗ ' + t); }
});
console.log('CN: ' + cnOk + '/' + cnTests.length + ' (' + (cnOk/cnTests.length*100).toFixed(0) + '%)');

console.log('\n=== Debug: failing entries ===');
cnTests.forEach(t => {
  const r = translateLine(t, CN2EN);
  if (!r) {
    // Show what we tried
    const clean = t.trim().replace(/\s+/g,' ').replace(/[：∶]/g,':').replace(/（/g,'(').replace(/）/g,')').replace(/，/g,',').replace(/。/g,'.').replace(/[【】\[\]]/g,'').replace(/(?<=[一-鿿])\s+(?=[一-鿿])/g,'').trim();
    const strippedNoPlus = clean.replace(/^\+/,'');
    const nums = clean.match(/\d+(?:\.\d+)?/g) || [];
    let p = clean;
    nums.forEach((n, i) => { p = p.replace(n, '{' + i + '}') });
    let q = clean.replace(/[+-]?\d+(?:\.\d+)?%?/g, '').replace(/\s+/g, ' ').trim();
    const rev = ('{0} ' + q).replace(/\s+/g, ' ').trim();
    console.log('  FAIL: ' + t);
    console.log('    clean: ' + clean);
    console.log('    placeholder: ' + p);
    console.log('    reverse: ' + rev);
    // Search for similar entries
    const similar = Object.keys(CN2EN).filter(k => k.includes(q.substring(0, 4)));
    console.log('    similar in DB (' + similar.length + '):');
    similar.slice(0, 5).forEach(s => console.log('      ' + s + ' → ' + CN2EN[s]));
  }
});

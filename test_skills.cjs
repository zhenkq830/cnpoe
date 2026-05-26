const fs = require('fs');
const mt = fs.readFileSync('src/data/modTranslations.ts', 'utf8');
const gems = fs.readFileSync('src/data/gemData.ts', 'utf8');
const supgems = fs.readFileSync('src/data/supportGemData.ts', 'utf8');

function parseMap(content, varName) {
  const map = {};
  const start = content.indexOf('export const ' + varName);
  if (start < 0) return map;
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

function parseGemDB(content, varName) {
  const start = content.indexOf('export const ' + varName);
  const objStart = content.indexOf('{', start);
  let depth = 0, end = objStart;
  for (let i = objStart; i < content.length; i++) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  try { return JSON.parse(content.substring(objStart, end)); } catch(e) { console.log(e.message); return {}; }
}

const CN2EN = parseMap(mt, 'CN2EN');
const TW2EN = parseMap(mt, 'TW2EN');
const GEM_DB = parseGemDB(gems, 'GEM_DB');
const SUP_GEM_DB = parseGemDB(supgems, 'SUP_GEM_DB');

function lookupSkill(name) {
  for (const [, v] of Object.entries(GEM_DB)) {
    if (v.cn === name || v.tw === name) return v.en;
  }
  for (const [, v] of Object.entries(SUP_GEM_DB)) {
    if (v.cn === name || v.tw === name) return v.en;
  }
  return null;
}

// Test skill lookup
const tests = ['分解', '長矛投擲', '战矛飞掷', '降解'];
tests.forEach(t => console.log(t + ' -> ' + (lookupSkill(t) || 'NOT FOUND')));

// Test the FIXES matching for grants skill
const FIXES = [
  [/賦予技能[:\s]*長矛投擲/,'Grants Skill: Spear Throw'],
  [/賦予技能[:\s]*戰矛飛擲/,'Grants Skill: Spear Throw'],
  [/获得技能[:\s]*長矛投擲/,'Grants Skill: Spear Throw'],
  [/获得技能[:\s]*戰矛飛擲/,'Grants Skill: Spear Throw'],
  [/賦予技能[:\s]*(.+)/,'Grants Skill: $1'],
  [/获得技能[:\s]*(.+)/,'Grants Skill: $1'],
];

function testLine(raw) {
  const clean = raw.trim().replace(/\s+/g,' ').replace(/[：∶]/g,':').replace(/（/g,'(').replace(/）/g,')').replace(/，/g,',').replace(/。/g,'.').replace(/[【】\[\]]/g,'').replace(/(?<=[一-鿿])\s+(?=[一-鿿])/g,'').trim();
  const stripped = clean.replace(/\s*\((implicit|enchant|rune|desecrated|crafted|fractured|augmented)\)/gi,'').trim();

  for (const [re, tpl] of FIXES) {
    const m = stripped.match(re);
    if (m) {
      let r = tpl;
      for (let i = 1; i < m.length; i++) r = r.replace('$' + i, m[i]);
      // Post-process skill name
      if (r.includes('Grants Skill:')) {
        let txt = r.replace(/^Grants Skill:\s*/, '');
        let lv = '';
        txt = txt.replace(/[等級级]\s*(\d+)/, (_, n) => { lv = 'Level ' + n; return ''; }).trim();
        const en = lookupSkill(txt);
        if (en) r = 'Grants Skill: ' + (lv ? lv + ' ' : '') + en;
        else r = 'Grants Skill: ' + (lv ? lv + ' ' : '') + txt;
      }
      return r;
    }
  }
  return null;
}

console.log('\n=== Skill Grant Tests ===');
['賦予技能: 等級 19 分解', '賦予技能: 長矛投擲', '获得技能: 长矛投掷'].forEach(t => {
  console.log(t + ' -> ' + testLine(t));
});

const fs = require('fs');
const mt = fs.readFileSync('src/data/modTranslations.ts', 'utf8');

function parseMap(content, varName) {
  const map = {};
  const start = content.indexOf('export const ' + varName);
  const objStart = content.indexOf('{', start);
  let depth = 0, end = objStart;
  for (let i = objStart; i < content.length; i++) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  const section = content.substring(objStart + 1, end - 1);
  // Parse JSON-compatible key-value pairs line by line
  const lines = section.split('\n');
  for (const l of lines) {
    const t = l.trim();
    if (!t.startsWith('"')) continue;
    // Find the separating colon (after closing quote of key)
    let keyEnd = 1;
    while (keyEnd < t.length) {
      if (t[keyEnd] === '"' && t[keyEnd - 1] !== '\\') break;
      keyEnd++;
    }
    if (keyEnd >= t.length - 1) continue;
    const key = JSON.parse(t.substring(0, keyEnd + 1));
    const valPart = t.substring(keyEnd + 1).replace(/^:\s*/, '').replace(/,$/, '');
    if (valPart.startsWith('"')) {
      const val = JSON.parse(valPart);
      map[key] = val;
    }
  }
  return map;
}

const CN2EN = parseMap(mt, 'CN2EN');
const TW2EN = parseMap(mt, 'TW2EN');

console.log('CN2EN entries:', Object.keys(CN2EN).length);
console.log('TW2EN entries:', Object.keys(TW2EN).length);

// Search for patterns
const searches = ['附加', '火焰伤害', '最大生命', '命中', '暴击率', '全部元素', '移动速度', '攻击速度'];
searches.forEach(s => {
  const matches = Object.entries(CN2EN).filter(([k]) => k.includes(s));
  console.log('\n--- CN "' + s + '" (' + matches.length + ' entries) ---');
  matches.slice(0, 5).forEach(([k, v]) => console.log('  ' + k + ' -> ' + v));
});

// TW specific
console.log('\n=== TW 附加+火焰 ===');
Object.entries(TW2EN).filter(([k]) => k.includes('附加') && k.includes('火焰')).slice(0, 5).forEach(([k, v]) => console.log('  ' + k + ' -> ' + v));

console.log('\n=== CN 附加+火焰 ===');
Object.entries(CN2EN).filter(([k]) => k.includes('附加') && k.includes('火焰')).slice(0, 5).forEach(([k, v]) => console.log('  ' + k + ' -> ' + v));

// Search for '最大生命'
console.log('\n=== CN 最大生命 ===');
Object.entries(CN2EN).filter(([k]) => k.includes('最大生命')).slice(0, 10).forEach(([k, v]) => console.log('  ' + k + ' -> ' + v));

console.log('\n=== TW 最大生命 ===');
Object.entries(TW2EN).filter(([k]) => k.includes('最大生命')).slice(0, 10).forEach(([k, v]) => console.log('  ' + k + ' -> ' + v));

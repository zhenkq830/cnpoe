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

  // Simpler approach: split by lines, parse each as JSON key:value
  const lines = section.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith('"')) continue;

    // Try to parse as: "key": "value",
    // Find the key (first quoted string)
    const colonIdx = t.indexOf('":');
    if (colonIdx < 0) continue;

    try {
      const key = JSON.parse(t.substring(0, colonIdx + 1));
      let valStr = t.substring(colonIdx + 2).trim();
      if (valStr.endsWith(',')) valStr = valStr.substring(0, valStr.length - 1);
      const val = JSON.parse(valStr);
      map[key] = val;
    } catch(e) {
      // Skip malformed lines
    }
  }
  return map;
}

const CN2EN = parseMap(mt, 'CN2EN');
const TW2EN = parseMap(mt, 'TW2EN');

console.log('CN2EN entries:', Object.keys(CN2EN).length);
console.log('TW2EN entries:', Object.keys(TW2EN).length);

// Now search for specific patterns to understand the word order issue
console.log('\n=== Key word-order analysis ===');

// Check: how many CN entries have {0} BEFORE the stat name vs AFTER?
const cnEntries = Object.keys(CN2EN);
const cnNumFirst = cnEntries.filter(k => /^\{0\}/.test(k));
const cnStatFirst = cnEntries.filter(k => /最大生命|命中值|护甲|闪避/.test(k) && !k.startsWith('{'));
console.log('CN entries starting with {0}:', cnNumFirst.length);
console.log('CN entries with stat name first (sample):');
cnStatFirst.slice(0, 15).forEach(k => {
  if (k.length < 30) console.log('  ' + k + ' -> ' + CN2EN[k]);
});

// Also check entries with both formats
const maxLifeEntries = cnEntries.filter(k => k.includes('最大生命'));
console.log('\nCN 最大生命 entries:', maxLifeEntries.length);
maxLifeEntries.forEach(k => console.log('  [' + k + '] -> ' + CN2EN[k]));

const accEntries = cnEntries.filter(k => k.includes('命中'));
console.log('\nCN 命中 entries:', accEntries.length);
accEntries.slice(0, 10).forEach(k => console.log('  [' + k + '] -> ' + CN2EN[k]));

// Resistance patterns
const resEntries = cnEntries.filter(k => k.includes('抗性'));
console.log('\nCN 抗性 entries:', resEntries.length);
resEntries.slice(0, 10).forEach(k => console.log('  [' + k + '] -> ' + CN2EN[k]));

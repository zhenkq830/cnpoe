/** Find the CN/TW asymmetry - every EN should have both CN and TW */
const fs = require('fs');

// Build EN→CN and EN→TW maps from extracted data
const cnContent = fs.readFileSync('src/data/poe2BaseCN.ts', 'utf8');
const twContent = fs.readFileSync('src/data/poe2BaseTW.ts', 'utf8');

function parseMap(content) {
  const map = {};
  const match = content.match(/Record<string,string> = \{([\s\S]*)\};/);
  if (!match) return map;
  for (const l of match[1].split('\n')) {
    const m = l.match(/"([^"]+)":"([^"]+)",?/);
    if (m) map[m[1]] = m[2]; // name → en
  }
  return map;
}

const cn2en = parseMap(cnContent);
const tw2en = parseMap(twContent);

// Build EN→{cn,tw}
const en2cn = {}, en2tw = {};
for (const [cn, en] of Object.entries(cn2en)) {
  if (!en2cn[en]) en2cn[en] = [];
  en2cn[en].push(cn);
}
for (const [tw, en] of Object.entries(tw2en)) {
  if (!en2tw[en]) en2tw[en] = [];
  en2tw[en].push(tw);
}

// Find EN entries that only have one side
const allEn = new Set([...Object.keys(en2cn), ...Object.keys(en2tw)]);
let cnOnly = 0, twOnly = 0;

console.log('=== EN entries only in CN (missing TW) ===');
for (const en of [...allEn].sort()) {
  if (en2cn[en] && !en2tw[en]) {
    cnOnly++;
    if (cnOnly <= 15) console.log(`  [EN] ${en} → CN: ${en2cn[en].join(', ')}`);
  }
}
console.log(`Total CN-only EN entries: ${cnOnly}`);

console.log('\n=== EN entries only in TW (missing CN) ===');
for (const en of [...allEn].sort()) {
  if (en2tw[en] && !en2cn[en]) {
    twOnly++;
    if (twOnly <= 15) console.log(`  [EN] ${en} → TW: ${en2tw[en].join(', ')}`);
  }
}
console.log(`Total TW-only EN entries: ${twOnly}`);

// Also check: same CN→EN mapping but different TW name?
console.log('\n=== Same EN, has both CN and TW ===');
let both = 0;
for (const en of [...allEn].sort()) {
  if (en2cn[en] && en2tw[en]) both++;
}
console.log(`EN entries with both CN and TW: ${both}`);

console.log(`\nSummary: CN→EN=${Object.keys(cn2en).length}, TW→EN=${Object.keys(tw2en).length}`);
console.log(`Unique EN: CN=${Object.keys(en2cn).length}, TW=${Object.keys(en2tw).length}`);

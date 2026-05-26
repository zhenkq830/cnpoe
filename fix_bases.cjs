/** Clean up base type data: CN/TW perfectly paired, no old merge items */
const fs = require('fs');

function parseMap(f) {
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(/Record<string,string> = \{([\s\S]*)\};/);
  const map = {};
  if (m) for (const l of m[1].split('\n')) {
    const kv = l.match(/"([^"]+)":"([^"]+)",?/);
    if (kv) map[kv[1]] = kv[2];
  }
  return map;
}

const cn = parseMap('src/data/poe2BaseCN.ts');
const tw = parseMap('src/data/poe2BaseTW.ts');

// Build EN → {cn, tw}
const en2cn = {}, en2tw = {};
for (const [k, v] of Object.entries(cn)) { en2cn[v] = k; }
for (const [k, v] of Object.entries(tw)) { en2tw[v] = k; }

// Add missing CN names (found from poe2db.tw)
const missingCn = {
  'Adorned Gloves': '华饰手套',
  'Antler Focus': '鹿角法器',
  'Brigand Mace': '强盗之锤',
  'Crackling Quarterstaff': '霹雳节杖',
  'Frenzied Talisman': '狂怒魔符',
  'Hermit Garb': '隐士束衣',
  'Roaring Talisman': '怒嚎魔符',
  'Sturdy Crossbow': '坚固战弩',
  'Warpick': '战镐',
};
for (const [en, cnName] of Object.entries(missingCn)) {
  en2cn[en] = cnName;
}

// Build paired maps (only EN that have BOTH CN and TW)
const cnOut = {}, twOut = {};
let paired = 0, twOnly = 0, cnOnly = 0;
for (const en of new Set([...Object.keys(en2cn), ...Object.keys(en2tw)])) {
  if (en2cn[en] && en2tw[en]) {
    cnOut[en2cn[en]] = en;
    twOut[en2tw[en]] = en;
    paired++;
  } else if (en2tw[en] && !en2cn[en]) {
    twOnly++;
    console.log('TW-only (no CN found): ' + en + ' ← ' + en2tw[en]);
  } else if (en2cn[en] && !en2tw[en]) {
    cnOnly++;
  }
}

console.log('Paired:', paired);
console.log('TW-only remaining:', twOnly);
console.log('CN-only removed:', cnOnly);

// Write
let c = '// PoE2 CN→EN base types — paired with TW from poe2db.tw\n';
c += `export const POE2_CN_BASE: Record<string,string> = {\n`;
Object.entries(cnOut).sort((a, b) => a[0].localeCompare(b[0], 'zh')).forEach(([k, v]) => {
  c += ` ${JSON.stringify(k)}:${JSON.stringify(v)},\n`;
});
c += '};\n';
fs.writeFileSync('src/data/poe2BaseCN.ts', c);

let t = '// PoE2 TW→EN base types — paired with CN from poe2db.tw\n';
t += `export const POE2_TW_BASE: Record<string,string> = {\n`;
Object.entries(twOut).sort((a, b) => a[0].localeCompare(b[0], 'zh')).forEach(([k, v]) => {
  t += ` ${JSON.stringify(k)}:${JSON.stringify(v)},\n`;
});
t += '};\n';
fs.writeFileSync('src/data/poe2BaseTW.ts', t);

console.log('CN entries:', Object.keys(cnOut).length);
console.log('TW entries:', Object.keys(twOut).length);

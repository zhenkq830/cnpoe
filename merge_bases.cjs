/** Merge new poe2db.tw data with existing POE2_BASE, then update ItemTranslator */
const fs = require('fs');

// Read new CN data
const cnContent = fs.readFileSync('src/data/poe2BaseCN.ts', 'utf8');
const cnMatch = cnContent.match(/export const POE2_CN2EN: Record<string,string> = \{([\s\S]*)\};/);
const cnNew = {};
if (cnMatch) {
  const lines = cnMatch[1].split('\n').filter(l => l.includes(':'));
  lines.forEach(l => {
    const m = l.match(/"([^"]+)":"([^"]+)",?/);
    if (m) cnNew[m[1]] = m[2];
  });
}

// Read new TW data
const twContent = fs.readFileSync('src/data/poe2BaseTW.ts', 'utf8');
const twMatch = twContent.match(/export const POE2_TW2EN: Record<string,string> = \{([\s\S]*)\};/);
const twNew = {};
if (twMatch) {
  const lines = twMatch[1].split('\n').filter(l => l.includes(':'));
  lines.forEach(l => {
    const m = l.match(/"([^"]+)":"([^"]+)",?/);
    if (m) twNew[m[1]] = m[2];
  });
}

// Read old POE2_BASE
const oldContent = fs.readFileSync('src/data/poe2BaseTypes.ts', 'utf8');
const oldMatch = oldContent.match(/export const POE2_BASE: Record<string,string> = \{([\s\S]*)\};/);
const cnOld = {};
if (oldMatch) {
  const lines = oldMatch[1].split('\n').filter(l => l.includes(':'));
  lines.forEach(l => {
    const m = l.match(/"([^"]+)":"([^"]+)",?/);
    if (m) cnOld[m[1]] = m[2];
  });
}

// Merge: new takes priority, then add old entries not in new
const cnMerged = { ...cnNew };
for (const [cn, en] of Object.entries(cnOld)) {
  if (!cnMerged[cn]) cnMerged[cn] = en;
}

// For TW, we don't have old data (only 22 entries), so just use new
const twMerged = { ...twNew };

// PoE1-only items to exclude (confirmed PoE1 base types not in PoE2)
const POE1_ONLY = new Set([
  'Shortsword', 'Messer', 'Morning Star', 'Battle Axe', 'Fury Cleaver',
  'Rippled Greatsword', 'Ultra Greatsword', 'Executioner Greataxe',
  'Vile Greataxe', 'Ember Greataxe', 'Monument Greataxe',
  'Sacrificial Axe', 'Vampiric Blade', 'Keyblade', 'Runic Shortsword',
  'Bandit Hatchet', 'Dull Hatchet', 'Carving Hatchet', 'Boarding Hatchet',
  'Dread Hatchet', 'Profane Cleaver', 'Extended Cleaver',
  'Elegant Glaive', 'Reaver Glaive', 'Light Halberd', 'Ceremonial Halberd',
  'Rending Halberd', 'Crescent Axe', 'Broadsword', 'Cutlass',
  'Arced Longsword', 'Regalia Longsword', 'Commander Sword', 'Sickle Sword',
  'Falchion', 'Scimitar', 'Cinquedea', 'Moon Dagger', 'Arcane Dirk',
  'Simple Dagger', 'Skinning Knife', 'Glass Shank', 'Kris Knife',
  'Strife Pick', 'Battle Pick', 'Flanged Mace', 'Crown Mace',
  'Fortified Hammer', 'Lumen Mace', 'Molten Hammer', 'Calescent Hammer',
  'Dart Trap', 'Spike Trap', 'Bladed Trap', 'Clay Trap', 'Coiled Trap',
  'Shrapnel Trap', 'Incense Trap', 'Urn Trap', 'Medallion Trap',
  'Intricate Trap', 'Refined Trap', 'Lead Trap', 'Clamping Trap',
  'Fishing Rod', 'Flanged Greatblade', 'Ancient Greatblade',
]);

console.log('CN merged:', Object.keys(cnMerged).length, 'entries');
console.log('TW merged:', Object.keys(twMerged).length, 'entries');

// Write merged CN file
let cnOut = '// PoE2 CN→EN base types — merged from poe2db.tw + PoB2\n';
cnOut += '// CN names sourced from poe2db.tw/cn\n';
cnOut += 'export const POE2_CN_BASE: Record<string,string> = {\n';
Object.entries(cnMerged).sort((a, b) => a[0].localeCompare(b[0], 'zh')).forEach(([cn, en]) => {
  cnOut += ` ${JSON.stringify(cn)}:${JSON.stringify(en)},\n`;
});
cnOut += '};\n';

// Write merged TW file
let twOut = '// PoE2 TW→EN base types — from poe2db.tw/tw\n';
twOut += 'export const POE2_TW_BASE: Record<string,string> = {\n';
Object.entries(twMerged).sort((a, b) => a[0].localeCompare(b[0], 'zh')).forEach(([tw, en]) => {
  twOut += ` ${JSON.stringify(tw)}:${JSON.stringify(en)},\n`;
});
twOut += '};\n';

fs.writeFileSync('src/data/poe2BaseCN.ts', cnOut);
fs.writeFileSync('src/data/poe2BaseTW.ts', twOut);

console.log('Files written.');
console.log('\nSample CN entries:');
Object.entries(cnMerged).slice(0, 5).forEach(([cn, en]) => console.log('  ' + cn + ' -> ' + en));
console.log('Sample TW entries:');
Object.entries(twMerged).slice(0, 5).forEach(([tw, en]) => console.log('  ' + tw + ' -> ' + en));

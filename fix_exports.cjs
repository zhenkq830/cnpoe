const fs = require('fs');
let f = fs.readFileSync('src/data/affixesData.ts', 'utf-8');

// Fix: add category field
f = f.replace(/\{ id:/g, '{ category:"",id:');

// Append required exports
const append = `
// === Required exports (auto-restored) ===
export function getAllItemMods(): AffixDef[] { return ALL_MODS; }
export function getModById(id: string): AffixDef | undefined { return ALL_MODS.find(m => m.id === id); }
export function getCategoryGroups(): Record<string,string[]> { return {}; }
export function getAvailableMods(classIds: string[]): {prefixes:string[],suffixes:string[]}|null {
  if (classIds.length === 0) return null;
  const maps = classIds.map(id => EQUIP_MOD_MAP[id]).filter(m => m);
  if (maps.length === 0) return null;
  const pInter = maps.reduce((acc,m) => acc.filter(id => m.prefixes.includes(id)), maps[0].prefixes);
  const sInter = maps.reduce((acc,m) => acc.filter(id => m.suffixes.includes(id)), maps[0].suffixes);
  return { prefixes: pInter, suffixes: sInter };
}
`;

fs.writeFileSync('src/data/affixesData.ts', f + append, 'utf-8');
console.log('Fixed');

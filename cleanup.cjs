const fs = require('fs');
let f = fs.readFileSync('src/data/affixesData.ts', 'utf-8');

// 1. Fix: const waystoneMods → export const waystoneMods
f = f.replace('const waystoneMods: WaystoneMod[] = []', 'export const waystoneMods: WaystoneMod[] = []');

// 2. Fix presets: remove category:"" prefix
f = f.replace(/\{ category:"",id:'(\w+)',name:/g, '{ id:"$1",name:');

// 3. Remove duplicate exports section added by fix_exports.cjs
// Look for the pattern: after the presets section, there should be only ONE set of exports
// The fix_exports.cjs appended getAllItemMods/getModById/getCategoryGroups/getAvailableMods
// The restore_exports.cjs also appended itemClasses/rarities/moveSpeeds etc.
// Find the duplicated section and remove it
const firstDuplicate = f.lastIndexOf('// === Required exports (auto-restored) ===');
if (firstDuplicate > 0) {
  f = f.substring(0, firstDuplicate);
}

// 4. Fix interface defs: remove broken category:"" from interface lines
f = f.replace(/export interface (\w+) \{ category:"",id:/, 'export interface $1 { id:');

fs.writeFileSync('src/data/affixesData.ts', f, 'utf-8');
console.log('Cleanup done');

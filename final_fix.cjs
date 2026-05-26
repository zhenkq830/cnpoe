const fs = require('fs');
let f = fs.readFileSync('src/data/affixesData.ts', 'utf-8');

// Add waystoneMods before presets
const wsMods = '\nconst waystoneMods: WaystoneMod[] = [];\n\n';
f = f.replace('export const presets: PresetDef[] = [', wsMods + 'export const presets: PresetDef[] = [');

// Fix presets that reference waystoneMods (replace with empty arrays)
f = f.replace(/desc:waystoneMods.filter\(m=>m\.affix==='suffix'\).length\+'个后缀一键全选'/g, 'desc:"全部后缀"');
f = f.replace(/params:\{mapModIds:waystoneMods.filter\(m=>m\.affix==='suffix'\).map\(m=>m\.id\)\}/g, 'params:{mapModIds:[]}');
f = f.replace(/desc:waystoneMods.filter\(m=>m\.affix==='prefix'\).length\+'个前缀一键全选'/g, 'desc:"全部前缀"');
f = f.replace(/params:\{mapModIds:waystoneMods.filter\(m=>m\.affix==='prefix'\).map\(m=>m\.id\)\}/g, 'params:{mapModIds:[]}');

fs.writeFileSync('src/data/affixesData.ts', f, 'utf-8');
console.log('Final fix done');

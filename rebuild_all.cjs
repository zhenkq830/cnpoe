const fs = require('fs');

// Parse edited txt files
function parseTxt(file) {
  const data = fs.readFileSync(file, 'utf-8');
  const result = {};
  let cur = '';
  data.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;
    const m = line.match(/^【(.+)】$/);
    if (m) { cur = m[1]; if (!result[cur]) result[cur] = []; return; }
    if (cur) result[cur].push(line);
  });
  return result;
}

const prefixes = parseTxt('prefixes.txt');
const suffixes = parseTxt('suffixes.txt');

// Collect unique mods
const allTexts = new Set();
const eqMap = {};
Object.keys({...prefixes, ...suffixes}).forEach(eqId => {
  eqMap[eqId] = { prefixes: prefixes[eqId] || [], suffixes: suffixes[eqId] || [] };
  eqMap[eqId].prefixes.forEach(t => allTexts.add(t));
  eqMap[eqId].suffixes.forEach(t => allTexts.add(t));
});

// Assign IDs
const mod2id = {};
const id2text = {};
let c = 1;
[...allTexts].sort().forEach(text => {
  const id = 'm' + String(c++).padStart(3, '0');
  mod2id[text] = id;
  id2text[id] = text;
});

// Build ALL_MODS
let out = '// Auto-generated from txt files\n';
out += 'const ALL_MODS: AffixDef[] = [\n';
Object.entries(id2text).sort((a,b) => a[0].localeCompare(b[0])).forEach(([id, text]) => {
  let pCount = 0, sCount = 0;
  Object.values(eqMap).forEach(d => {
    if (d.prefixes.includes(text)) pCount++;
    if (d.suffixes.includes(text)) sCount++;
  });
  const affix = pCount >= sCount ? 'prefix' : 'suffix';
  // label: X stays as X (display uses #)
  const label = text;
  // cn: X→\d+, X%→[\d.]+% (supports decimal), spaces→.*
  const cn = text.replace(/X%/g, '.*[\\\\d.]+%').replace(/X/g, '.*\\\\d+.*').replace(/\s+/g, '.*');
  // tc: 极简关键词 - 取最独特2-5个字, 间用.{0,10}通配 (容忍TC语序词汇差异)
  const kw = text.replace(/X%?/g,'').replace(/[0-9#%\-—~+（）()\s]/g,'').replace(/(伤害|攻击|元素|火焰|冰霜|闪电|混沌|施法|生命|魔力|防御|属性|速度|暴击|范围|回复|偷取|伤害|物理|法术|近战|投射物|召唤|生物|友军|在场|每秒|所有|全部|额外|附加|增加|减少|提高|降低|扩大|缩短|获得|转化|每个|敌人|一名|一个|这装备|此装备|该装备|命中|照亮|晕眩|感电|冻结|易燃|药剂|护符|咒符|充能|几率|机率|效果|持续|时间|范围|能力值|属性|需求|最大|上限|下限|基础)/g,'');
  const tc = kw.substring(0,5).split('').join('.{0,8}');
  out += '  { id:' + JSON.stringify(id) + ', label:' + JSON.stringify(label) + ', affix:' + JSON.stringify(affix) + ', en:"", cn:"' + cn + '", tc:"' + tc + '", example:' + JSON.stringify(text) + ' },\n';
});
out += '];\n\n';

// Build EQUIP_MOD_MAP
out += 'export const EQUIP_MOD_MAP: Record<string,{prefixes:string[],suffixes:string[]}> = {\n';
Object.entries(eqMap).sort((a,b) => a[0].localeCompare(b[0])).forEach(([eqId, eqData]) => {
  const pIds = eqData.prefixes.map(t => mod2id[t]).map(JSON.stringify).join(',');
  const sIds = eqData.suffixes.map(t => mod2id[t]).map(JSON.stringify).join(',');
  out += '  ' + eqId + ': {prefixes:[' + pIds + '],suffixes:[' + sIds + ']},\n';
});
out += '};\n';

fs.writeFileSync('generated_mods.ts', out, 'utf-8');

// Verify samples
console.log('Mods:', Object.keys(id2text).length);

// Show some cn samples
const sampleIds = Object.keys(id2text).filter(id => id2text[id].includes('点生命'));
sampleIds.slice(0, 3).forEach(id => {
  const text = id2text[id];
  const cn = text.replace(/X%/g, '\\\\d+%').replace(/X/g, '\\\\d+').replace(/\s+/g, '.*');
  console.log(text + ' -> cn: ' + cn);
});

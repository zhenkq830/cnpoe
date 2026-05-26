const fs = require('fs');
const data = fs.readFileSync('equip_mods_template.txt', 'utf-8');
const lines = data.split('\n');

const idMap = {
  '单手武器 — 爪':'claws','单手武器 — 匕首':'daggers','单手武器 — 法杖':'wands',
  '单手武器 — 单手剑':'oneHandSwords','单手武器 — 单手斧':'oneHandAxes',
  '单手武器 — 单手锤':'oneHandMaces','单手武器 — 短杖':'sceptres',
  '单手武器 — 战矛':'spears','单手武器 — 连枷':'flails',
  '双手武器 — 弓':'bows','双手武器 — 长杖':'staves',
  '双手武器 — 双手剑':'twoHandSwords','双手武器 — 双手斧':'twoHandAxes',
  '双手武器 — 双手锤':'twoHandMaces','双手武器 — 节杖':'quarterstaves',
  '双手武器 — 战弩':'crossbows','双手武器 — 陷阱':'traps',
  '双手武器 — 魔符':'talismans',
  '饰品 — 项链':'amulets','饰品 — 戒指':'rings','饰品 — 腰带':'belts',
  '防具 — 手套':'gloves','防具 — 鞋子':'boots',
  '防具 — 胸甲':'bodyArmours','防具 — 头部':'helmets',
  '副手 — 箭袋':'quivers','副手 — 盾牌':'shields',
  '副手 — 轻盾':'lightShields','副手 — 法器':'foci',
};

// Common COMPOUND tag endings (ordered longest first)
const TAG_ENDS = [
  '伤害元素火焰施法宝石','伤害元素冰霜施法宝石','伤害元素闪电施法宝石',
  '伤害元素火焰攻击','伤害元素冰霜攻击','伤害元素闪电攻击',
  '元素火焰施法宝石','元素冰霜施法宝石','元素闪电施法宝石',
  '伤害元素火焰','伤害元素冰霜','伤害元素闪电',
  '伤害物理攻击','伤害元素攻击','伤害施法攻击','伤害施法',
  '伤害攻击暴击','攻击暴击','施法暴击','施法宝石',
  '伤害元素','伤害混沌','伤害攻击',
  '生命物理攻击','魔力物理攻击','生命攻击','魔力攻击',
  '生命召唤生物','魔力伤害施法',
  '攻击速度','施法速度','元素抗性',
  '召唤生物宝石','混沌施法宝石','物理施法宝石',
  '攻击','施法','物理','火焰','冰霜','闪电','混沌',
  '伤害','生命','魔力','速度','暴击','召唤',
  '宝石','抗性','护甲','闪避','护盾','能量','属性',
];

function cleanMod(text) {
  for (const end of TAG_ENDS) {
    if (text.endsWith(' ' + end)) return text.slice(0, -(end.length + 1));
    if (text.endsWith(end)) {
      // Make sure there's a space or boundary before the tag
      const before = text.slice(0, -end.length);
      if (before.endsWith(' ') || before.length === 0) {
        return before.trim();
      }
    }
  }
  return text;
}

function stripNum(s) { return s.replace(/^\d+/, '').trim(); }

let cur = '', sec = '';
const eqMap = {};
const mod2id = {};
const id2text = {};

lines.forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('===') || line.startsWith('>>')) return;
  const m = line.match(/【(.+?)】/);
  if (m) { cur = idMap[m[1]] || ''; if (cur && !eqMap[cur]) eqMap[cur] = {prefixes:[],suffixes:[]}; return; }
  if (line.startsWith('前缀') || line.startsWith('后缀')) {
    sec = line.startsWith('前') ? 'prefixes' : 'suffixes';
    const content = line.split(/[：:]/).slice(1).join(':').trim();
    if (content && cur) {
      const mod = stripNum(content);
      if (mod && !eqMap[cur][sec].includes(mod)) eqMap[cur][sec].push(mod);
    }
    return;
  }
  if (cur && sec) {
    const mod = stripNum(line);
    if (mod && !eqMap[cur][sec].includes(mod)) eqMap[cur][sec].push(mod);
  }
});

// Build IDs
let idCounter = 1;
Object.values(eqMap).forEach(eqData => {
  [...eqData.prefixes, ...eqData.suffixes].forEach(text => {
    if (!mod2id[text]) { mod2id[text] = 'm' + String(idCounter++).padStart(3,'0'); id2text[mod2id[text]] = text; }
  });
});

// Generate ALL_MODS with cleaned labels/cnRegex
let out = 'const ALL_MODS: AffixDef[] = [\n';
Object.entries(id2text).sort((a,b) => a[0].localeCompare(b[0])).forEach(([id, text]) => {
  let pCount = 0, sCount = 0;
  Object.values(eqMap).forEach(d => {
    if (d.prefixes.includes(text)) pCount++;
    if (d.suffixes.includes(text)) sCount++;
  });
  const affix = pCount >= sCount ? 'prefix' : 'suffix';

  const cleaned = cleanMod(text);
  const label = cleaned.replace(/#/g,'X').replace(/\s+/g, '').substring(0,25);
  const cn = cleaned.replace(/#%/g, '\\\\d+%').replace(/#/g, '\\\\d+').replace(/\s+/g, '.*');

  out += '  { id:"' + id + '", label:"' + label + '", affix:"' + affix + '", en:"", cn:"' + cn + '", example:"' + cleaned + '" },\n';
});
out += '];\n\n';

// EQUIP_MOD_MAP
out += 'export const EQUIP_MOD_MAP: Record<string,{prefixes:string[],suffixes:string[]}> = {\n';
Object.entries(eqMap).sort((a,b) => a[0].localeCompare(b[0])).forEach(([eqId, eqData]) => {
  const pIds = eqData.prefixes.map(t => mod2id[t]).map(JSON.stringify).join(',');
  const sIds = eqData.suffixes.map(t => mod2id[t]).map(JSON.stringify).join(',');
  out += '  ' + eqId + ': {prefixes:[' + pIds + '],suffixes:[' + sIds + ']},\n';
});
out += '};\n';

fs.writeFileSync('generated_mods.ts', out, 'utf-8');

// Show samples
const samples = Object.entries(id2text).slice(0, 10);
console.log('=== Cleaned samples ===');
samples.forEach(([id, text]) => {
  const cleaned = cleanMod(text);
  console.log(text + ' -> ' + cleaned.replace(/#/g,'X').replace(/\s+/g,''));
});
console.log('Total: ' + Object.keys(id2text).length + ' mods');

const fs = require('fs');

// Read original template data
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

// Tag keywords
const TAG_SET = new Set([
  '伤害','物理','攻击','元素','火焰','冰霜','闪电','混沌','施法',
  '属性','生命','魔力','速度','暴击','召唤','宝石','抗性','护甲',
  '闪避','能量','护盾','范围','几率','充能','回复','偷取','击中','击败',
  '友军','投射物','法术','近战','荆棘','吸纳','等级','数量','再生',
  '加快','扩大','降低','提高','获得','转化','附加','命中','照亮',
  '晕眩','感电','冻结','易燃','再生率','每秒','每击败','每击中',
  '在场','最大值','装填','溢出','药剂','咒符','持续','效果','延长',
  '免疫','冷却','使用','额外','敌人','物品','地图','区域','首领',
  '深渊','裂隙','秘藏','迷雾','祭坛','石板','先驱','光环','图腾',
  '印记','充能球','耐力球','暴击球','狂怒球','掉落','奖励','难度',
  '所需','上限','加快速度','提高速度','伤害提高','伤害降低','效果区域','效果范围',
]);

function stripNum(s) { return s.replace(/^\d+/, '').trim(); }

function splitMod(text) {
  // Split by spaces, then determine which trailing words are tags
  const words = text.split(/\s+/);
  // Find the cutoff: walk backwards, if a word is in TAG_SET, it's a tag
  let cutoff = words.length;
  for (let i = words.length - 1; i >= 0; i--) {
    if (TAG_SET.has(words[i])) {
      cutoff = i;
    } else {
      break;
    }
  }
  const modText = words.slice(0, cutoff).join(' ');
  const tags = words.slice(cutoff);
  return { modText, tags };
}

let cur = '', sec = '';
const eqMap = {};
const mod2id = {};
const modInfo = {}; // id -> {text, tags}

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

// Build id mapping
let idCounter = 1;
Object.values(eqMap).forEach(eqData => {
  [...eqData.prefixes, ...eqData.suffixes].forEach(text => {
    if (!mod2id[text]) {
      mod2id[text] = 'm' + String(idCounter++).padStart(3, '0');
      modInfo[mod2id[text]] = {text};
    }
  });
});

// Now generate ALL_MODS with cleaned labels and cnRegex
let out = '';
out += 'const ALL_MODS: AffixDef[] = [\n';

Object.entries(modInfo).sort((a,b) => a[0].localeCompare(b[0])).forEach(([id, info]) => {
  const text = info.text;
  const { modText, tags } = splitMod(text);

  // Determine affix
  let pCount = 0, sCount = 0;
  Object.values(eqMap).forEach(d => {
    if (d.prefixes.includes(text)) pCount++;
    if (d.suffixes.includes(text)) sCount++;
  });
  const affix = pCount >= sCount ? 'prefix' : 'suffix';

  // Label: clean mod text with # -> X
  const label = modText.replace(/#/g, 'X').replace(/\s+/g, '');

  // cnRegex: mod text with # -> \d+, spaces -> .*
  const cn = modText.replace(/#%/g, '\\\\d+%').replace(/#/g, '\\\\d+').replace(/\s+/g, '.*');

  out += '  { id:"' + id + '", label:"' + label + '", affix:"' + affix + '", en:"", cn:"' + cn + '", example:"' + modText + '" },\n';
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
const samples = Object.entries(modInfo).slice(0, 8);
console.log('=== Sample cleaned mods ===');
samples.forEach(([id, info]) => {
  const { modText, tags } = splitMod(info.text);
  console.log(info.text);
  console.log('  -> label: ' + modText.replace(/#/g, 'X').replace(/\s+/g, ''));
  console.log('  -> tags: [' + tags.join(',') + ']');
  console.log();
});
console.log('Total mods:', Object.keys(modInfo).length);

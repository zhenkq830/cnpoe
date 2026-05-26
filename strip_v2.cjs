const fs = require('fs');
let f = fs.readFileSync('src/data/affixesData.ts', 'utf-8');

// Common trailing tag patterns - remove these from end of both label and cn field
// Order matters: longer patterns first to avoid partial matches
const tagEndings = [
  '伤害元素火焰攻击','伤害元素冰霜攻击','伤害元素闪电攻击','伤害元素攻击',
  '伤害物理攻击','伤害施法','伤害混沌','伤害元素火焰','伤害元素冰霜',
  '伤害元素闪电','伤害元素','伤害攻击暴击','攻击暴击',
  '生命物理攻击','魔力物理攻击','生命攻击','魔力攻击',
  '攻击速度','施法速度','施法暴击','元素火焰施法宝石',
  '元素冰霜施法宝石','元素闪电施法宝石','物理施法宝石','施法宝石',
  '混沌施法宝石','召唤生物宝石',
  '生命召唤生物','魔力伤害施法',
  '元素抗性','属性','元素火焰','元素冰霜','元素闪电',
  '攻击','施法','物理','火焰','冰霜','闪电','混沌',
  '伤害','生命','魔力','速度','暴击','召唤',
  '宝石','抗性','护甲','闪避','护盾','魔力','能量',
];

// Clean labels
let count = 0;
f = f.replace(/"label":"([^"]+)"/g, (match, label) => {
  let newLabel = label;
  for (const ending of tagEndings) {
    if (newLabel.endsWith(ending)) {
      newLabel = newLabel.slice(0, -ending.length);
      count++;
      break;
    }
  }
  return '"label":"' + newLabel + '"';
});

// Clean cn fields
f = f.replace(/"cn":"([^"]+)"/g, (match, cn) => {
  let newCn = cn;
  for (const ending of tagEndings) {
    const cnEnding = '\\.\\*' + ending;
    if (newCn.endsWith(cnEnding)) {
      newCn = newCn.slice(0, -cnEnding.length);
      count++;
      break;
    }
  }
  return '"cn":"' + newCn + '"';
});

fs.writeFileSync('src/data/affixesData.ts', f, 'utf-8');
console.log('Cleaned', count, 'entries');

// Show some cleaned labels
const matches = f.match(/"label":"([^"]{1,30})"/g);
if (matches) {
  console.log('\nSample labels:');
  matches.slice(0, 15).forEach(m => console.log('  ' + m));
}

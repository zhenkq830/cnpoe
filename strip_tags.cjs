const fs = require('fs');
let f = fs.readFileSync('src/data/affixesData.ts', 'utf-8');

const tags = '伤害|物理|攻击|元素|火焰|冰霜|闪电|混沌|施法|属性|生命|魔力|速度|暴击|召唤|宝石|抗性|护甲|闪避|能量|护盾|在场|范围|蓄值|几率|时间|充能|回复|偷取|击中|击败|友军|投射物|法术|近战|远程|荆棘|吸纳|溢出|装填|额外|等级|数量|上限|再生|加快|扩大|降低|提高|延长|获得|转化|附加|命中|照亮|晕眩|感电|冻结|易燃|再生率|最大值|所需|每秒|每击败|每击中|的额外|最大|所有|照明|增加|减少|持续|效果|免疫|避免|增益|损毁|粉碎|击碎|穿透|反射|冷却|使用|消耗|存在|施加|造成|变为|改为|不再|不会|可以|无法|可能|必定|至少|最多|额外具有|额外包含|额外再生|额外增加|额外提高|额外获得|额外附加|额外发射|额外装填|额外填装|额外奖励|难度|奖励|物品|掉落|首领|地图|区域|深渊|裂隙|秘藏|迷雾|祭坛|石板|先驱|图腾|光环|印记|充能球|耐力球|暴击球|狂怒球|效果区域|效果范围|加快速度|提高速度|敌人|伤害提高|伤害降低';

let count = 0;

// Strip tags from labels
f = f.replace(/"label":"([^"]+)"/g, function(match, label) {
  let newLabel = label;
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 5) {
    changed = false;
    iterations++;
    const re = new RegExp(' (' + tags + ')$');
    const before = newLabel;
    newLabel = newLabel.replace(re, '');
    if (before !== newLabel) { changed = true; count++; }
  }
  return '"label":"' + newLabel + '"';
});

// Strip tags from cnRegex (tags separated by .*)
f = f.replace(/"cn":"([^"]+)"/g, function(match, cn) {
  let newCn = cn;
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 5) {
    changed = false;
    iterations++;
    const re = new RegExp('\\.\\*(' + tags + ')$');
    const before = newCn;
    newCn = newCn.replace(re, '');
    if (before !== newCn) { changed = true; }
  }
  return '"cn":"' + newCn + '"';
});

fs.writeFileSync('src/data/affixesData.ts', f, 'utf-8');
console.log('Stripped', count, 'tags from labels');

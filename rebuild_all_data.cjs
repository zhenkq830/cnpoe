/**
 * cnpoe.com 全量数据重建脚本
 * 游戏版本更新后运行: node rebuild_all_data.cjs
 *
 * 数据源: poe2db.tw (编年史)
 * 预计耗时: ~8 分钟
 */

const { execSync } = require('child_process');

const STEPS = [
  {
    name: '技能宝石 (335 主动 + 526 辅助)',
    script: 'update_gems.cjs',
    output: ['src/data/gemData.ts', 'src/data/supportGemData.ts'],
    source: 'poe2db.tw Skill_Gems / Support_Gems (CN + TW)',
    time: '~10s',
  },
  {
    name: '装备基础类型 (916 CN + 925 TW)',
    script: 'extract_bases_v2.cjs',
    output: ['src/data/poe2BaseCN.ts', 'src/data/poe2BaseTW.ts'],
    source: 'poe2db.tw 各装备类别页面 (29 类 × CN/TW)',
    time: '~30s',
  },
  {
    name: '装备词缀库 (412 家族 × 3 语言 × 全 T 阶)',
    script: 'extract_all_mods.cjs',
    output: ['_mod_data.json'],
    source: 'poe2db.tw 各装备类别页面 (59 类 × CN/TW/US)',
    time: '~130s',
  },
  {
    name: '符文/灵核库 (123 符文 × 3 语言)',
    script: 'extract_runes.cjs',
    output: ['_rune_data.json'],
    source: 'poe2db.tw Augment 页面 (CN/TW/US hover data)',
    time: '~270s',
  },
];

console.log('=== cnpoe.com 全量数据重建 ===');
console.log('共 ' + STEPS.length + ' 个步骤，预计 ' + STEPS.reduce((s, t) => s + parseInt(t.time), 0) + 's\n');

STEPS.forEach((step, i) => {
  console.log('[' + (i + 1) + '/' + STEPS.length + '] ' + step.name);
  console.log('  数据源: ' + step.source);
  console.log('  输出:   ' + step.output.join(', '));
  console.log('  预计:   ' + step.time);
  console.log('  脚本:   node ' + step.script + '\n');
});

console.log('手动运行所有步骤:');
STEPS.forEach(s => console.log('  node ' + s.script));

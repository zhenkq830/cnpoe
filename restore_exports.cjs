const fs = require('fs');
let f = fs.readFileSync('src/data/affixesData.ts', 'utf-8');

// Fix interface definitions - remove broken category:""
f = f.replace(/export interface (\w+) \{ category:"\",id:/g, 'export interface $1 { id:');
f = f.replace(/'category:""/g, '');  // leftover in labels

// Now append ALL missing exports
const append = `
// ============================================================
// 石板 (Tablet)
// ============================================================
export interface TabletMod { id:string; label:string; enRegex:string; cnRegex:string; }

export const tabletTypes: { id:string; label:string; icon:string }[] = [
  { id:'precursor', label:'先驱石板', icon:'📜' },
  { id:'breach', label:'裂隙先驱石板', icon:'🔮' },
  { id:'expedition', label:'先祖秘藏先驱石板', icon:'🏺' },
  { id:'delirium', label:'惊悸迷雾先驱石板', icon:'🌫' },
  { id:'ritual', label:'驱灵仪式先驱石板', icon:'🕯' },
  { id:'domination', label:'霸主先驱石板', icon:'👑' },
  { id:'abyss', label:'深渊先驱石板', icon:'🕳' },
];

export const tabletSuffixes: Record<string, TabletMod[]> = {
  breach: [
    { id:'bs_rift_magic', label:'裂隙魔法怪物数量提高', enRegex:'rift.*magic', cnRegex:'裂隙.*魔法怪物' },
    { id:'bs_rift_rare_mon',label:'裂隙额外稀有怪物', enRegex:'rift.*rare', cnRegex:'裂隙.*额外.*稀有' },
    { id:'bs_rift_density1',label:'裂隙怪物密度提高(5-10)%', enRegex:'density', cnRegex:'裂隙.*密度.*提高' },
    { id:'bs_rift_speed', label:'裂隙开合速度加快', enRegex:'rift.*speed', cnRegex:'裂隙.*速度.*加快' },
    { id:'bs_rift_hands', label:'裂隙额外紧握之手', enRegex:'hand', cnRegex:'紧握之手' },
    { id:'bs_rift_splinter',label:'裂隙碎片数量提高', enRegex:'splinter', cnRegex:'裂隙碎片' },
    { id:'bs_rift_three', label:'几率三个额外裂隙', enRegex:'three.*rift', cnRegex:'三个.*额外.*裂隙' },
    { id:'bs_rift_extra', label:'几率额外裂隙', enRegex:'extra.*rift', cnRegex:'额外.*裂隙' },
  ],
  expedition: [
    { id:'es_artifact', label:'先祖秘藏神器数量提高', enRegex:'artifact', cnRegex:'神器.*数量' },
    { id:'es_place_range',label:'炸药放置范围扩大', enRegex:'place.*range', cnRegex:'炸药.*放置.*范围' },
    { id:'es_remnant', label:'先祖秘藏残骸+', enRegex:'remnant', cnRegex:'残骸' },
    { id:'es_blast_range',label:'先祖秘藏爆炸范围扩大', enRegex:'blast.*range', cnRegex:'爆炸.*范围' },
    { id:'es_logbook', label:'符纹怪物日志数量提高', enRegex:'logbook', cnRegex:'日志.*数量' },
    { id:'es_rare_exp', label:'稀有先祖秘藏怪物数量提高', enRegex:'rare.*exp', cnRegex:'稀有.*先祖.*数量' },
    { id:'es_remnant_eff',label:'先祖秘藏残骸效果提高', enRegex:'remnant.*eff', cnRegex:'残骸.*效果' },
    { id:'es_runic_mark',label:'符纹怪物标记数量提高', enRegex:'runic.*mark', cnRegex:'符纹.*标记' },
  ],
  delirium: [
    { id:'ds_splinter', label:'梦魇拟像裂片堆叠数量提高', enRegex:'splinter', cnRegex:'裂片.*堆叠' },
    { id:'ds_duration', label:'惊悸迷雾额外持续时间', enRegex:'duration', cnRegex:'额外.*持续' },
    { id:'ds_dissipate',label:'惊悸迷雾消散速度减慢', enRegex:'dissipate', cnRegex:'消散.*速度' },
    { id:'ds_fill_speed',label:'惊悸迷雾填充速度加快', enRegex:'fill.*speed', cnRegex:'填充.*速度' },
    { id:'ds_pack', label:'惊悸迷雾怪物群规模提高', enRegex:'pack', cnRegex:'迷雾.*怪物群' },
    { id:'ds_mirror', label:'破溃之镜数量提高', enRegex:'mirror', cnRegex:'破溃之镜' },
    { id:'ds_pause', label:'稀有怪物暂停迷雾倒计时', enRegex:'pause', cnRegex:'暂停.*倒计时' },
    { id:'ds_boss', label:'迷雾传奇首领几率总增', enRegex:'boss', cnRegex:'传奇.*首领' },
  ],
  ritual: [
    { id:'rs_tribute', label:'祭坛献祭贡品提高', enRegex:'tribute', cnRegex:'贡品.*提高' },
    { id:'rs_reroll_cost',label:'重置恩典消耗贡品降低', enRegex:'reroll.*cost', cnRegex:'重置.*降低' },
    { id:'rs_defer_cost',label:'延时恩典消耗贡品降低', enRegex:'defer.*cost', cnRegex:'延时.*降低' },
    { id:'rs_defer_speed',label:'延时恩典重现速度加快', enRegex:'defer.*speed', cnRegex:'延时.*加快' },
    { id:'rs_extra_reroll',label:'可额外重置恩典一次', enRegex:'extra.*reroll', cnRegex:'额外.*重置.*恩典' },
    { id:'rs_free_reroll',label:'重置恩典几率不消耗贡品', enRegex:'free.*reroll', cnRegex:'重置.*几率.*不消耗' },
    { id:'rs_magic', label:'再生怪物为魔法几率提高', enRegex:'magic', cnRegex:'魔法.*几率.*提高' },
    { id:'rs_rare', label:'再生怪物为稀有几率提高', enRegex:'rare', cnRegex:'稀有.*几率.*提高' },
    { id:'rs_omen', label:'驱灵恩典为预兆几率提高', enRegex:'omen', cnRegex:'预兆.*几率' },
  ],
  precursor: [
    { id:'ps_waystone', label:'引路石数量提高(30-50)%', enRegex:'waystone', cnRegex:'引路石.*数量' },
    { id:'ps_rare_mod', label:'稀有怪物额外词缀几率', enRegex:'rare.*mod', cnRegex:'稀有.*怪物.*额外.*词缀' },
    { id:'ps_shrine', label:'额外神龛几率', enRegex:'shrine', cnRegex:'神龛.*几率' },
    { id:'ps_shrine_mod',label:'额外神龛(降群规模)', enRegex:'shrine.*pack', cnRegex:'神龛' },
    { id:'ps_strongbox',label:'额外保险箱几率', enRegex:'strongbox', cnRegex:'保险箱.*几率' },
    { id:'ps_strongbox_mod',label:'额外保险箱(降群规模)', enRegex:'strongbox.*pack',cnRegex:'保险箱' },
    { id:'ps_essence', label:'精华几率提高', enRegex:'essence', cnRegex:'精华.*几率' },
    { id:'ps_azmeri', label:'阿兹莫里之灵几率提高', enRegex:'azmeri', cnRegex:'阿兹莫里之灵.*几率' },
    { id:'ps_rogue', label:'盗贼流放者几率提高', enRegex:'rogue', cnRegex:'盗贼流放者.*几率' },
    { id:'ps_ritual_altar',label:'召唤法阵几率提高', enRegex:'altar', cnRegex:'召唤法阵.*几率' },
    { id:'ps_random_mod',label:'额外随机词缀', enRegex:'random.*mod', cnRegex:'额外.*随机.*词缀' },
    { id:'ps_boss_mod',label:'传奇怪物额外词缀', enRegex:'boss.*mod', cnRegex:'传奇.*额外.*词缀' },
  ],
  domination: [
    { id:'ds_strongbox', label:'额外保险箱', enRegex:'strongbox', cnRegex:'额外.*保险箱' },
    { id:'ds_shrine', label:'额外神龛', enRegex:'shrine', cnRegex:'额外.*神龛' },
    { id:'ds_essence', label:'额外精华', enRegex:'essence', cnRegex:'额外.*精华' },
    { id:'ds_azmeri', label:'额外阿兹莫里之灵', enRegex:'azmeri', cnRegex:'额外.*阿兹莫里之灵' },
    { id:'ds_boss_waystone',label:'首领引路石数量提高', enRegex:'boss.*waystone',cnRegex:'首领.*引路石' },
    { id:'ds_boss_exp', label:'首领经验值提高', enRegex:'boss.*exp', cnRegex:'首领.*经验' },
    { id:'ds_boss_rarity',label:'首领物品稀有度提高', enRegex:'boss.*rarity', cnRegex:'首领.*稀有度' },
    { id:'ds_boss_quant',label:'首领物品数量提高', enRegex:'boss.*quant', cnRegex:'首领.*数量' },
  ],
  abyss: [
    { id:'as_monster', label:'深渊怪物数量总增', enRegex:'abyss.*monster',cnRegex:'深渊.*怪物.*总增' },
    { id:'as_rare', label:'深渊额外稀有怪物', enRegex:'abyss.*rare', cnRegex:'深渊.*额外.*稀有' },
    { id:'as_pit', label:'深渊巨坑难度奖励提高', enRegex:'pit', cnRegex:'巨坑.*奖励' },
    { id:'as_despair', label:'深渊通往绝望深渊几率', enRegex:'despair', cnRegex:'绝望深渊' },
    { id:'as_extra', label:'额外一个深渊', enRegex:'extra.*abyss', cnRegex:'额外.*深渊' },
    { id:'as_double_reward',label:'深渊巨坑双倍奖励几率', enRegex:'double.*reward',cnRegex:'双倍.*几率.*奖励' },
    { id:'as_four', label:'几率四个额外深渊', enRegex:'four.*abyss', cnRegex:'四个.*额外.*深渊' },
    { id:'as_affix', label:'深渊怪物深渊词缀几率总增', enRegex:'abyss.*affix', cnRegex:'深渊.*词缀' },
    { id:'as_corrupted', label:'深渊怪物渎灵通货几率', enRegex:'corrupted', cnRegex:'渎灵.*通货' },
  ],
};

export const tabletPrefixes: TabletMod[] = [
  { id:'tp_intensity', label:'怪物强度总增', enRegex:'intensity', cnRegex:'怪物.*强度.*总增' },
  { id:'tp_rarity', label:'物品稀有度提高', enRegex:'rarity', cnRegex:'物品稀有度.*提高' },
  { id:'tp_pack', label:'怪物群规模提高', enRegex:'pack', cnRegex:'怪物群规模.*提高' },
  { id:'tp_magic', label:'魔法怪物数量提高', enRegex:'magic.*mon',cnRegex:'魔法怪物.*数量.*提高' },
  { id:'tp_rare', label:'稀有怪物数量提高', enRegex:'rare.*mon', cnRegex:'稀有怪物.*数量.*提高' },
  { id:'tp_gold', label:'金币数量提高', enRegex:'gold', cnRegex:'金币.*提高' },
  { id:'tp_exp', label:'经验值获取提高', enRegex:'exp', cnRegex:'经验.*提高' },
  { id:'tp_chest', label:'额外稀有宝箱', enRegex:'chest', cnRegex:'额外.*宝箱' },
  { id:'tp_essence', label:'额外精华', enRegex:'essence', cnRegex:'额外.*精华' },
  { id:'tp_waystone', label:'引路石数量提高', enRegex:'waystone', cnRegex:'引路石.*数量' },
  { id:'tp_azmeri', label:'额外阿兹莫里之灵', enRegex:'azmeri', cnRegex:'阿兹莫里之灵' },
  { id:'tp_rogue', label:'额外盗贼流放者', enRegex:'rogue', cnRegex:'盗贼流放者' },
  { id:'tp_ritual_altar',label:'额外召唤法阵', enRegex:'altar', cnRegex:'召唤法阵' },
];

export const rarities: RarityDef[] = [
  { id:'rare',label:'稀有',en:'y: r',cn:'度.*稀有' },
  { id:'magic',label:'魔法',en:'y: m',cn:'度.*魔法' },
  { id:'normal',label:'普通',en:'y: n',cn:'度.*普通' },
];

export const itemClasses: ClassDef[] = [
  { id:'claws',label:'爪',enAbbr:'cl',cnText:'爪' },{ id:'daggers',label:'匕首',enAbbr:'da',cnText:'匕首' },
  { id:'wands',label:'法杖',enAbbr:'wa',cnText:'法杖' },{ id:'oneHandSwords',label:'单手剑',enAbbr:'sw',cnText:'单手剑' },
  { id:'oneHandAxes',label:'单手斧',enAbbr:'ax',cnText:'单手斧' },{ id:'oneHandMaces',label:'单手锤',enAbbr:'on',cnText:'单手锤' },
  { id:'sceptres',label:'短杖',enAbbr:'sc',cnText:'短杖' },{ id:'spears',label:'战矛',enAbbr:'sp',cnText:'战矛' },
  { id:'flails',label:'连枷',enAbbr:'fl',cnText:'连枷' },
  { id:'bows',label:'弓',enAbbr:'bow',cnText:'弓' },{ id:'staves',label:'长杖',enAbbr:'st',cnText:'长杖' },
  { id:'twoHandSwords',label:'双手剑',enAbbr:'2sw',cnText:'双手剑' },{ id:'twoHandAxes',label:'双手斧',enAbbr:'2ax',cnText:'双手斧' },
  { id:'twoHandMaces',label:'双手锤',enAbbr:'tw',cnText:'双手锤' },{ id:'quarterstaves',label:'节杖',enAbbr:'qua',cnText:'节杖' },
  { id:'crossbows',label:'战弩',enAbbr:'cr',cnText:'战弩' },{ id:'traps',label:'陷阱',enAbbr:'tr',cnText:'陷阱' },
  { id:'talismans',label:'魔符',enAbbr:'tal',cnText:'魔符' },
  { id:'amulets',label:'项链',enAbbr:'am',cnText:'项链' },{ id:'rings',label:'戒指',enAbbr:'ri',cnText:'戒指' },
  { id:'belts',label:'腰带',enAbbr:'be',cnText:'腰带' },
  { id:'gloves',label:'手套',enAbbr:'gl',cnText:'手套' },{ id:'boots',label:'鞋子',enAbbr:'boo',cnText:'鞋子' },
  { id:'bodyArmours',label:'胸甲',enAbbr:'bod',cnText:'胸甲' },{ id:'helmets',label:'头部',enAbbr:'he',cnText:'头部' },
  { id:'quivers',label:'箭袋',enAbbr:'qui',cnText:'箭袋' },{ id:'shields',label:'盾牌',enAbbr:'sh',cnText:'盾牌' },
  { id:'lightShields',label:'轻盾',enAbbr:'ls',cnText:'轻盾' },{ id:'foci',label:'法器',enAbbr:'fo',cnText:'法器' },
  { id:'jewel',label:'珠宝',enAbbr:'jewel',cnText:'珠宝' },{ id:'waystone',label:'引路石',enAbbr:'waystone',cnText:'引路石' },
];

export const moveSpeeds: MoveSpeedDef[] = [
  { value:10,label:'1%+',en:'\\\\d+% i.+mov',cn:'移动速度提高.*\\\\d+%' },
  { value:15,label:'15%+',en:'(1[5-9]|[2-9]\\\\d)% i.+mov',cn:'移动速度提高.*(1[5-9]|[2-9]\\\\d)%' },
  { value:20,label:'20%+',en:'([2-9]\\\\d)% i.+mov',cn:'移动速度提高.*([2-9]\\\\d)%' },
  { value:25,label:'25%+',en:'(2[5-9]|[3-9]\\\\d)% i.+mov',cn:'移动速度提高.*(2[5-9]|[3-9]\\\\d)%' },
  { value:30,label:'30%+',en:'([3-9]\\\\d)% i.+mov',cn:'移动速度提高.*([3-9]\\\\d)%' },
  { value:35,label:'35%+',en:'(3[5-9]|[4-9]\\\\d)% i.+mov',cn:'移动速度提高.*(3[5-9]|[4-9]\\\\d)%' },
];

export const properties = [
  { id:'quality',label:'品质',en:'y: \\\\+',cn:'品质.*\\\\\\\\+\\\\\\\\d' },
  { id:'sockets',label:'插槽',en:'ts: S',cn:'插槽' },
];

export function ilvlRegex(min:number,max:number,lang:'en'|'cn'|'tc'='en'):{regex:string|null,explain:string}{
  if(min===0&&max===0)return{regex:null,explain:''};
  if(max>0&&min>max)return{regex:null,explain:''};
  const isCn=lang==='cn'||lang==='tc';
  const pf=isCn?'物品等级.*':'m level: ';
  const efMax=max===0?99:max;
  if(min===0&&efMax>=99)return{regex:\`\${pf}(\\\\d{1,2})\`,explain:isCn?'任意物品等级':'Any Item Level'};
  if(min>0&&min===efMax)return{regex:\`\${pf}\${min}\`,explain:isCn?\`物品等级 = \${min}\`:\`Item Level = \${min}\`};
  const rangeRegex=buildNumberRange(min,efMax);
  const explain=isCn?\`物品等级 \${min}\${max>0?' ~ '+efMax:'+'}\`:\`Item Level \${min}\${max>0?'~'+efMax:'+'}\`;
  return{regex:\`\${pf}\${rangeRegex}\`,explain};
}
function buildNumberRange(min:number,max:number):string{
  if(max-min<=5&&max<=99){const vals:string[]=[];for(let i=min;i<=max;i++)vals.push(String(i));return\`(\${vals.join('|')})\`;}
  const parts:string[]=[];
  if(min<=9){const end=Math.min(max,9);parts.push(min===0&&end===9?'\\\\d':min===end?String(min):\`[\${min}-\${end}]\`);min=10;}
  if(min<=99&&min>=10){const minTens=Math.floor(min/10),maxTens=Math.min(Math.floor(max/10),9);
    if(minTens===maxTens){const mo=min%10,mxo=max%10;parts.push(mo===0&&mxo===9?\`\${minTens}\\\\d\`:mo===mxo?\`\${min}\`:\`\${minTens}[\${mo}-\${mxo}]\`);}
    else{parts.push(min%10===0?\`\${minTens}\\\\d\`:\`\${minTens}[\${min%10}-9]\`);for(let t=minTens+1;t<maxTens;t++)parts.push(\`\${t}\\\\d\`);parts.push(max%10===9?\`\${maxTens}\\\\d\`:\`\${maxTens}[0-\${max%10}]\`);}
    min=100;}
  if(max>=100)parts.push('\\\\d{3,}');
  return parts.length===1?parts[0]:\`(\${parts.join('|')})\`;
}
`;

fs.writeFileSync('src/data/affixesData.ts', f + append, 'utf-8');
console.log('Restored exports');

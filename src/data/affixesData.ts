/**
 * affixesData.ts — PoE2 双语词缀数据 v3 (poe2db.tw 对齐版)
 * 每个词缀均有"真实游戏文本"验证。
 * Copyright (c) 2025 流放工坊 | cnpoe.com
 */

// ============================================================
export interface AffixDef { id:string; label:string; category:string; affix:'prefix'|'suffix'; en:string; cn:string; example:string; }
export interface WaystoneMod { id:string; affix:'prefix'|'suffix'; label:string; enRegex:string; cnRegex:string; }
export interface ClassDef { id:string; label:string; enAbbr:string; cnText:string; }
export interface RarityDef { id:string; label:string; en:string; cn:string; }
export interface MoveSpeedDef { value:number; label:string; en:string; cn:string; }
export interface PresetDef { id:string; name:string; desc:string; icon:string; params:Record<string,unknown>; }

// ============================================================
// 装备词缀 (基于 poe2db.tw + 40件真实装备验证)
// 分类: 前缀=伤害/生命/护盾/技能/偷取/回复等, 后缀=抗性/属性/速度/暴击/命中等
// ============================================================
const ALL_MODS: AffixDef[] = [
  // ========== 前缀 ==========
  // -- 点伤 --
  { id:'flat_phys',  label:'附加物理伤害',        category:'伤害',affix:'prefix',en:'adds.*phys', cn:'附加.*物理伤害',              example:'攻击附加 16 - 22 物理伤害' },
  { id:'flat_fire',  label:'附加火焰伤害',        category:'伤害',affix:'prefix',en:'adds.*fire', cn:'附加.*火焰伤害',              example:'攻击附加 X - Y 火焰伤害' },
  { id:'flat_cold',  label:'附加冰霜伤害',        category:'伤害',affix:'prefix',en:'adds.*cold', cn:'附加.*冰霜伤害',              example:'攻击附加 22 - 35 基础冰霜伤害' },
  { id:'flat_light', label:'附加闪电伤害',        category:'伤害',affix:'prefix',en:'adds.*light',cn:'附加.*闪电伤害',              example:'攻击附加 1 - 58 基础闪电伤害' },
  { id:'flat_chaos', label:'附加混沌伤害',        category:'伤害',affix:'prefix',en:'adds.*chaos',cn:'附加.*混沌伤害',              example:'攻击附加 X - Y 混沌伤害' },
  // -- 攻击附加元素 (戒指/箭袋专用, 不同于武器点伤) --
  { id:'flat_ele_att',label:'攻击附加元素伤害',   category:'伤害',affix:'prefix',en:'adds.*ele',  cn:'攻击附加',             example:'攻击附加 17 - 26 物理伤害' },
  // -- 伤害% --
  { id:'physDmg',    label:'物理伤害提高%',       category:'伤害',affix:'prefix',en:'ph.*da',      cn:'物理伤害提高',         example:'物理伤害提高 170%' },
  { id:'eleDmg',     label:'元素伤害提高%',       category:'伤害',affix:'prefix',en:'ele.*da',     cn:'元素伤害提高',         example:'元素伤害提高 40%' },
  { id:'spellDmg',   label:'法术伤害提高%',       category:'伤害',affix:'prefix',en:'spell.*da',   cn:'法术伤害提高',         example:'法术伤害提高 76%' },
  { id:'fireDmg',    label:'火焰伤害提高%',       category:'伤害',affix:'prefix',en:'\\d f.+da',   cn:'火焰伤害提高',         example:'火焰伤害提高 35%' },
  { id:'coldDmg',    label:'冰霜伤害提高%',       category:'伤害',affix:'prefix',en:'\\d co.+da',  cn:'冰霜伤害提高',         example:'冰霜伤害提高 35%' },
  { id:'lightDmg',   label:'闪电伤害提高%',       category:'伤害',affix:'prefix',en:'\\d l.+da',   cn:'闪电伤害提高',         example:'闪电伤害提高 35%' },
  { id:'chaosDmg',   label:'混沌伤害提高%',       category:'伤害',affix:'prefix',en:'\\d ch.+da',  cn:'混沌伤害提高',         example:'混沌伤害提高 30%' },
  { id:'areaDmg',    label:'范围伤害提高%',       category:'伤害',affix:'prefix',en:'area.*dmg',   cn:'范围伤害提高',         example:'范围伤害提高 20%' },
  { id:'minionDmg',  label:'召唤物伤害提高%',     category:'伤害',affix:'prefix',en:'minion.*dmg', cn:'召唤.*伤害提高',       example:'召唤生物伤害提高 35%' },
  { id:'bowSkillDmg',label:'弓类技能伤害提高%',   category:'伤害',affix:'prefix',en:'bow.*dmg',    cn:'弓类技能伤害提高',     example:'弓类技能伤害提高 40%' },
  { id:'gainExtra',  label:'获得额外伤害%',       category:'伤害',affix:'prefix',en:'gain.*extra', cn:'额外.*伤害',           example:'获得相当于伤害 29% 的额外冰霜伤害' },
  // -- 投射物 --
  { id:'projCount',  label:'投射物数量',          category:'攻击',affix:'prefix',en:'projectile',  cn:'投射物',       example:'所有投射物技能等级 +2' },
  // -- 生命/魔力/护盾 --
  { id:'maxLife',      label:'最大生命',          category:'防御',affix:'prefix',en:'\\d.+life',   cn:'最大生命',                   example:'+48 最大生命' },
  { id:'maxMana',      label:'最大魔力',          category:'防御',affix:'prefix',en:'\\d.+mana',   cn:'最大魔力',                   example:'+62 最大魔力' },
  { id:'energyShield', label:'能量护盾',          category:'防御',affix:'prefix',en:'energy',      cn:'能量护盾',                   example:'+29 最大能量护盾' },
  { id:'incArmour',    label:'护甲提高%',         category:'防御',affix:'prefix',en:'armour.*\\d', cn:'护甲提高',                   example:'护甲提高 30%' },
  { id:'incEvasion',   label:'闪避提高%',         category:'防御',affix:'prefix',en:'evasion.*\\d',cn:'闪避提高',                   example:'闪避提高 30%' },
  { id:'incES',        label:'能量护盾提高%',     category:'防御',affix:'prefix',en:'en.*sh.*\\d', cn:'能量护盾提高',               example:'该装备的能量护盾提高 110%' },
  { id:'incArmourES',  label:'护甲与能量护盾提高%',category:'防御',affix:'prefix',en:'arm.*en',     cn:'护甲.*能量护盾',             example:'护甲与能量护盾提高 20%' },
  { id:'incEvasionES', label:'闪避与能量护盾提高%',category:'防御',affix:'prefix',en:'evasion.*en', cn:'闪避.*能量护盾',             example:'闪避与能量护盾提高 33%' },
  { id:'incArmourEvasion',label:'护甲与闪避提高%',category:'防御',affix:'prefix',en:'arm.*evasion',cn:'护甲.*闪避',                 example:'护甲与闪避提高 20%' },
  { id:'flatEvasion',  label:'闪避值',            category:'防御',affix:'prefix',en:'evasion.*rat',cn:'闪避值',                     example:'+124 点闪避值' },
  // -- 精魂 --
  { id:'spirit', label:'最大精魂', category:'通用',affix:'prefix',en:'spiri', cn:'精魂', example:'+50 精魂' },
  // -- 偷取 --
  { id:'lifeLeech', label:'物理偷取生命', category:'偷取',affix:'prefix',en:'phys.*leech',      cn:'偷.*命',        example:'物理攻击伤害转化为生命偷取' },
  { id:'manaLeech', label:'物理偷取魔力', category:'偷取',affix:'prefix',en:'phys.*leech.*mana', cn:'偷.*魔',        example:'物理攻击伤害转化为魔力偷取' },
  // -- 技能等级 --
  { id:'skillLevel',   label:'所有技能等级+',    category:'技能',affix:'prefix',en:'^\\+.*ills$',  cn:'所有.*技能',            example:'所有投射物技能等级 +2' },
  { id:'fireSkill',    label:'火焰技能等级+',    category:'技能',affix:'prefix',en:'fire.*gem',    cn:'火焰.*技能',            example:'所有火焰法术技能等级 +5' },
  { id:'coldSkill',    label:'冰霜技能等级+',    category:'技能',affix:'prefix',en:'cold.*gem',    cn:'冰霜.*技能',            example:'冰霜技能等级 +2' },
  { id:'lightSkill',   label:'闪电技能等级+',    category:'技能',affix:'prefix',en:'light.*gem',   cn:'闪电.*技能',            example:'闪电技能等级 +2' },
  { id:'physSkill',    label:'物理技能等级+',    category:'技能',affix:'prefix',en:'phys.*gem',    cn:'物理.*技能',            example:'所有物理法术技能等级 +5' },
  { id:'chaosSkill',   label:'混沌技能等级+',    category:'技能',affix:'prefix',en:'chaos.*gem',   cn:'混沌.*技能',            example:'混沌技能等级 +2' },
  { id:'meleeSkill',   label:'近战技能等级+',    category:'技能',affix:'prefix',en:'melee.*gem',   cn:'近战.*技能',            example:'近战技能等级 +2' },
  { id:'minionSkill',  label:'召唤技能等级+',    category:'技能',affix:'prefix',en:'minion.*gem',  cn:'召唤.*技能',            example:'所有召唤生物技能等级 +2' },
  { id:'bowSkill',     label:'弓类技能等级+',    category:'技能',affix:'prefix',en:'bow.*gem',     cn:'弓.*技能',              example:'弓类技能等级 +2' },
  // -- 回复 --
  { id:'regenLife', label:'每秒生命回复',  category:'回复',affix:'prefix',en:'regen.*life', cn:'再生|回复.*命', example:'生命每秒再生 24.9' },
  { id:'regenMana', label:'魔力回复速度%', category:'回复',affix:'prefix',en:'mana.*regen', cn:'魔力再生',      example:'魔力再生率提高 60%' },
  // -- 其他前缀 --
  { id:'rarityFind',  label:'物品稀有度提高%', category:'通用',affix:'prefix',en:'d rari',       cn:'物品稀有度提高',         example:'物品稀有度提高 16%' },
  { id:'lightRadius', label:'照亮范围提高%',   category:'通用',affix:'prefix',en:'light.*rad',   cn:'照亮范围',               example:'照亮范围提高 15%' },
  { id:'reducedAttr', label:'属性需求降低%',   category:'属性',affix:'prefix',en:'attr.*req',    cn:'属性需求降低',           example:'属性需求降低 35%' },
  { id:'minionLife',  label:'召唤物最大生命',  category:'召唤',affix:'prefix',en:'minion.*life', cn:'召唤.*生命',             example:'召唤生物最大生命 +40' },
  { id:'aoeEffect',   label:'技能范围扩大%',   category:'通用',affix:'prefix',en:'area.*effect', cn:'效果范围|效果区域',       example:'技能效果范围扩大 20%' },

  // ========== 后缀 ==========
  // -- 抗性 --
  { id:'fireRes',    label:'火焰抗性+%',    category:'抗性',affix:'suffix',en:'fi.+res',        cn:'火焰抗性',             example:'火焰抗性 +38%' },
  { id:'coldRes',    label:'冰霜抗性+%',    category:'抗性',affix:'suffix',en:'co.+res',        cn:'冰霜抗性',             example:'冰霜抗性 +44%' },
  { id:'lightRes',   label:'闪电抗性+%',    category:'抗性',affix:'suffix',en:'li.+res',        cn:'闪电抗性',             example:'闪电抗性 +30%' },
  { id:'chaosRes',   label:'混沌抗性+%',    category:'抗性',affix:'suffix',en:'ch.+res',        cn:'混沌抗性',             example:'混沌抗性 +15%' },
  { id:'allRes',     label:'所有元素抗性+%',category:'抗性',affix:'suffix',en:'all.*ele.*res',  cn:'元素抗性',             example:'所有元素抗性 +13%' },
  { id:'maxResFire', label:'最大火焰抗性+%',category:'抗性',affix:'suffix',en:'max.*fire.*res', cn:'最大火焰抗性',         example:'最大火焰抗性 +3%' },
  { id:'maxResCold', label:'最大冰霜抗性+%',category:'抗性',affix:'suffix',en:'max.*cold.*res', cn:'最大冰霜抗性',         example:'最大冰霜抗性 +3%' },
  { id:'maxResLight',label:'最大闪电抗性+%',category:'抗性',affix:'suffix',en:'max.*light.*r',  cn:'最大闪电抗性',         example:'最大闪电抗性 +3%' },
  // -- 属性 --
  { id:'strength',     label:'力量',         category:'属性',affix:'suffix',en:'strength',     cn:'力量',                example:'+25 力量' },
  { id:'dexterity',    label:'敏捷',         category:'属性',affix:'suffix',en:'dexterity',    cn:'敏捷',                example:'+9 敏捷' },
  { id:'intelligence', label:'智慧',         category:'属性',affix:'suffix',en:'intelligence', cn:'智慧',                example:'+35 智慧' },
  { id:'allAttr',      label:'所有属性',     category:'属性',affix:'suffix',en:'all.*attr',    cn:'所有属性',            example:'+10 所有属性' },
  // -- 速度 --
  { id:'attackSpeed', label:'攻击速度提高%', category:'速度',affix:'suffix',en:'ck spe',  cn:'攻击速度提高',             example:'攻击速度提高 14%' },
  { id:'castSpeed',   label:'施法速度提高%', category:'速度',affix:'suffix',en:'st spe',  cn:'施法速度提高',             example:'施法速度提高 15%' },
  { id:'projSpeed',   label:'投射物速度提高%',category:'攻击',affix:'suffix',en:'proj.*speed', cn:'投射物速度提高',       example:'投射物速度提高 35%' },
  // -- 暴击 --
  { id:'critChance', label:'暴击率提高%',    category:'暴击',affix:'suffix',en:'crit.*chan',  cn:'暴击率提高',             example:'攻击暴击率提高 29%' },
  { id:'critMulti',  label:'暴击伤害加成%',  category:'暴击',affix:'suffix',en:'crit.*multi', cn:'暴击伤害加成',           example:'攻击伤害的暴击伤害加成 37%' },
  { id:'spellCrit',  label:'法术暴击率提高%',category:'暴击',affix:'suffix',en:'spell.*crit', cn:'法术暴击率',             example:'法术暴击率提高 40%' },
  // -- 其他后缀 --
  { id:'stunThresh',  label:'晕眩阈值',       category:'通用',affix:'suffix',en:'stun.*thresh', cn:'晕眩',                 example:'+317 晕眩阈值' },
  { id:'accuracy',    label:'命中值',         category:'通用',affix:'suffix',en:'accuracy',     cn:'命中',                 example:'+52 命中值' },
  { id:'curseEffect', label:'诅咒效果提高%',  category:'通用',affix:'suffix',en:'curse.*effect',cn:'诅咒效果提高',         example:'诅咒效果提高 15%' },
  { id:'auraEffect',  label:'光环效果提高%',  category:'通用',affix:'suffix',en:'aura.*effect', cn:'光环效果提高',         example:'光环效果提高 10%' },
  { id:'minionSpeed', label:'召唤物攻速/施速%',category:'召唤',affix:'suffix',en:'minion.*speed',cn:'召唤.*速度',           example:'召唤生物速度提高 20%' },
  { id:'cooldown',    label:'冷却回复速度%',  category:'通用',affix:'suffix',en:'cooldown',    cn:'冷却',                 example:'冷却回复速度加快 30%' },
  { id:'movespeed',   label:'移动速度提高%',  category:'速度',affix:'suffix',en:'movement',    cn:'移动速度提高',         example:'移动速度提高 35%' },
];

const CAT_GROUPS: Record<string,string[]> = {
  '前缀 伤害': ['flat_phys','flat_fire','flat_cold','flat_light','flat_chaos','flat_ele_att','physDmg','eleDmg','spellDmg','fireDmg','coldDmg','lightDmg','chaosDmg','areaDmg','minionDmg','projCount','bowSkillDmg','gainExtra'],
  '前缀 防御': ['maxLife','maxMana','energyShield','incArmour','incEvasion','incES','incArmourES','incEvasionES','incArmourEvasion','flatEvasion','spirit','regenLife','regenMana','minionLife'],
  '前缀 技能': ['skillLevel','fireSkill','coldSkill','lightSkill','physSkill','chaosSkill','meleeSkill','minionSkill','bowSkill'],
  '前缀 其他': ['lifeLeech','manaLeech','rarityFind','lightRadius','reducedAttr','aoeEffect'],
  '后缀 抗性': ['fireRes','coldRes','lightRes','chaosRes','allRes','maxResFire','maxResCold','maxResLight'],
  '后缀 属性': ['strength','dexterity','intelligence','allAttr'],
  '后缀 速度': ['attackSpeed','castSpeed','projSpeed','movespeed'],
  '后缀 暴击': ['critChance','critMulti','spellCrit'],
  '后缀 其他': ['stunThresh','accuracy','curseEffect','auraEffect','minionSpeed','cooldown'],
};

export function getAllItemMods():AffixDef[]{return ALL_MODS}
export function getCategoryGroups():Record<string,string[]>{return CAT_GROUPS}
export function getModById(id:string):AffixDef|undefined{return ALL_MODS.find(m=>m.id===id)}

// ============================================================
// EQUIP_MOD_MAP — 基于 poe2db.tw 逐页对照整理
// 格式: 部位ID → { prefixes, suffixes }
// 同一词缀在不同部位可能前后缀不同 (如 skillLevel: 项链=前缀, 箭袋=后缀)
// 修改方式: 在对应部位的 prefixes/suffixes 数组中加/删 ID
// ============================================================
export const EQUIP_MOD_MAP: Record<string,{prefixes:string[],suffixes:string[]}> = {
  // === 武器 ===
  bows: {prefixes:['physDmg','eleDmg','flat_phys','flat_fire','flat_cold','flat_light','flat_chaos','bowSkillDmg','projCount','projSpeed','skillLevel','bowSkill','lifeLeech','manaLeech'],suffixes:['attackSpeed','critChance','critMulti','accuracy','dexterity','strength']},
  crossbows: {prefixes:['physDmg','eleDmg','flat_phys','flat_fire','flat_cold','flat_light','projCount','projSpeed'],suffixes:['attackSpeed','critChance','critMulti','accuracy','dexterity','strength']},
  quarterstaves: {prefixes:['physDmg','eleDmg','flat_phys','flat_cold','flat_light','skillLevel','meleeSkill'],suffixes:['attackSpeed','critChance','critMulti','accuracy','strength','dexterity']},
  oneHandMaces: {prefixes:['physDmg','flat_phys','areaDmg','meleeSkill'],suffixes:['attackSpeed','critChance','critMulti','accuracy','strength','stunThresh']},
  twoHandMaces: {prefixes:['physDmg','flat_phys','areaDmg','meleeSkill'],suffixes:['attackSpeed','critChance','critMulti','accuracy','strength','stunThresh']},
  staves: {prefixes:['spellDmg','eleDmg','fireDmg','coldDmg','lightDmg','flat_fire','flat_cold','flat_light','gainExtra','skillLevel','fireSkill','coldSkill','lightSkill','chaosSkill','regenMana','maxMana','energyShield'],suffixes:['castSpeed','spellCrit','critMulti','intelligence','cooldown']},
  wands: {prefixes:['spellDmg','eleDmg','fireDmg','coldDmg','lightDmg','chaosDmg','gainExtra','skillLevel','fireSkill','coldSkill','lightSkill','chaosSkill','regenMana','spirit','maxMana'],suffixes:['castSpeed','spellCrit','critMulti','intelligence']},
  sceptres: {prefixes:['eleDmg','fireDmg','coldDmg','lightDmg','minionDmg','gainExtra','skillLevel','fireSkill','coldSkill','lightSkill','minionSkill','spirit','maxMana'],suffixes:['castSpeed','intelligence','strength']},
  spears: {prefixes:['physDmg','flat_phys','meleeSkill'],suffixes:['attackSpeed','critChance','critMulti','accuracy','strength','dexterity']},

  // === 防具 ===
  boots: {prefixes:['maxLife','maxMana','energyShield','incArmour','incEvasion','incES','incArmourES','incEvasionES','regenLife','regenMana','rarityFind','reducedAttr'],suffixes:['movespeed','fireRes','coldRes','lightRes','chaosRes','strength','dexterity','intelligence','stunThresh']},
  gloves: {prefixes:['maxLife','maxMana','flat_phys','flat_fire','flat_cold','flat_light','lifeLeech','manaLeech','rarityFind'],suffixes:['attackSpeed','castSpeed','fireRes','coldRes','lightRes','chaosRes','strength','dexterity','intelligence','accuracy','stunThresh']},
  bodyArmours: {prefixes:['maxLife','maxMana','energyShield','incArmour','incEvasion','incES','incArmourES','incEvasionES','incArmourEvasion','flatEvasion','regenLife','spirit','reducedAttr','aoeEffect'],suffixes:['fireRes','coldRes','lightRes','chaosRes','allRes','strength','dexterity','intelligence','stunThresh']},
  helmets: {prefixes:['maxLife','maxMana','energyShield','incArmour','incEvasion','incES','rarityFind','regenLife','regenMana','spirit','minionSkill','skillLevel'],suffixes:['cooldown','fireRes','coldRes','lightRes','chaosRes','allRes','strength','dexterity','intelligence','accuracy','stunThresh']},
  shields: {prefixes:['maxLife','energyShield','incArmour','incES','incArmourES','incArmourEvasion','spirit','reducedAttr'],suffixes:['fireRes','coldRes','lightRes','chaosRes','allRes','maxResFire','maxResCold','maxResLight','strength','stunThresh']},
  foci: {prefixes:['spellDmg','eleDmg','skillLevel','fireSkill','coldSkill','lightSkill','chaosSkill','regenMana','spirit','maxMana','energyShield'],suffixes:['castSpeed','spellCrit','intelligence','cooldown']},

  // === 饰品 ===
  rings: {prefixes:['maxLife','maxMana','energyShield','flat_phys','flat_fire','flat_cold','flat_light','flat_chaos','flat_ele_att','rarityFind','regenLife','regenMana','spirit','cooldown','gainExtra'],suffixes:['fireRes','coldRes','lightRes','chaosRes','allRes','strength','dexterity','intelligence','allAttr','castSpeed','attackSpeed','accuracy','lifeLeech','manaLeech']},
  amulets: {prefixes:['maxLife','maxMana','energyShield','spirit','rarityFind','skillLevel','projCount','regenLife','regenMana','minionSkill','aoeEffect','gainExtra'],suffixes:['cooldown','fireRes','coldRes','lightRes','chaosRes','allRes','maxResFire','maxResCold','maxResLight','strength','dexterity','intelligence','allAttr','castSpeed','attackSpeed','critChance','critMulti','accuracy','stunThresh']},
  belts: {prefixes:['maxLife','maxMana','regenLife','regenMana','rarityFind','incArmour'],suffixes:['cooldown','fireRes','coldRes','lightRes','chaosRes','allRes','strength','dexterity','intelligence','stunThresh']},

  // === 副手/特殊 ===
  // 无最大生命/魔力; 投射物速度为前缀
  quivers: {prefixes:['physDmg','flat_phys','flat_fire','flat_cold','flat_light','flat_chaos','eleDmg','bowSkillDmg','projCount','projSpeed'],suffixes:['attackSpeed','critChance','critMulti','accuracy','dexterity','skillLevel']},
  jewel: {prefixes:[],suffixes:[]},
  waystone: {prefixes:[],suffixes:[]},
};

/** 取选中装备的词缀交集 (返回 {prefixes, suffixes}) */
export function getAvailableMods(classIds:string[]):{prefixes:string[],suffixes:string[]}|null{
  if(classIds.length===0)return null;
  const maps=classIds.map(id=>EQUIP_MOD_MAP[id]).filter(m=>m);
  if(maps.length===0)return null;
  // 取每个部位的前后缀交集
  const pInter=maps.reduce((acc,m)=>acc.filter(id=>m.prefixes.includes(id)),maps[0].prefixes);
  const sInter=maps.reduce((acc,m)=>acc.filter(id=>m.suffixes.includes(id)),maps[0].suffixes);
  return {prefixes:pInter,suffixes:sInter};
}

// ============================================================
// 引路石
// ============================================================
// 引路石词缀 (前缀/后缀, 最短唯一子串)
export const waystoneMods: WaystoneMod[] = [
  // === 前缀 ===
  { id:'ws_extra_fire',  affix:'prefix',label:'怪物额外火焰伤害',   enRegex:'fire$',   cnRegex:'额外.*火焰' },
  { id:'ws_extra_cold',  affix:'prefix',label:'怪物额外冰霜伤害',   enRegex:'col',     cnRegex:'额外.*冰霜' },
  { id:'ws_extra_light', affix:'prefix',label:'怪物额外闪电伤害',   enRegex:'tn',      cnRegex:'额外.*闪电' },
  { id:'ws_extra_chaos', affix:'prefix',label:'怪物额外混沌伤害',   enRegex:'ra ch',   cnRegex:'额外.*混沌' },
  { id:'ws_mon_dmg',     affix:'prefix',label:'怪物伤害提高',       enRegex:'mage$',   cnRegex:'怪物伤害提高' },
  { id:'ws_mon_life',    affix:'prefix',label:'怪物生命总增',       enRegex:'fe$',     cnRegex:'怪物生命' },
  { id:'ws_mon_armour',  affix:'prefix',label:'怪物具有护甲',       enRegex:'oure',    cnRegex:'具.*护甲' },
  { id:'ws_mon_evasive', affix:'prefix',label:'怪物具有闪避',       enRegex:'e eva',   cnRegex:'具.*闪避' },
  { id:'ws_mon_es',      affix:'prefix',label:'怪物生命转护盾',     enRegex:'f m',     cnRegex:'生命.*转.*护盾' },
  { id:'ws_accuracy',    affix:'prefix',label:'怪物命中值提高',     enRegex:'cc',      cnRegex:'命中.*提高' },
  { id:'ws_charge_steal',affix:'prefix',label:'怪物偷取充能球',     enRegex:'r,',      cnRegex:'偷取.*球' },
  { id:'ws_less_curse',  affix:'prefix',label:'怪物诅咒效果总降',   enRegex:'curse',   cnRegex:'诅咒.*降' },
  { id:'ws_enfeeble',    affix:'prefix',label:'周期性衰弱诅咒',     enRegex:'eble',    cnRegex:'衰弱' },
  { id:'ws_temp_chain',  affix:'prefix',label:'周期性时空锁链',     enRegex:'emp',     cnRegex:'时空锁链' },
  { id:'ws_ele_weak',    affix:'prefix',label:'周期性元素要害',     enRegex:'kn',      cnRegex:'元素要害' },
  { id:'ws_ignite_gnd',  affix:'prefix',label:'点燃地面',           enRegex:'ign',     cnRegex:'点燃' },
  { id:'ws_chill_gnd',   affix:'prefix',label:'冰缓地面',           enRegex:'chi',     cnRegex:'冰缓' },
  { id:'ws_shock_gnd',   affix:'prefix',label:'感电地面',           enRegex:'cke',     cnRegex:'感电' },
  { id:'ws_abyss',       affix:'prefix',label:'深渊',               enRegex:'abyss',   cnRegex:'深渊' },
  { id:'ws_abyss_queen', affix:'prefix',label:'深渊孵化女王',       enRegex:'queen',   cnRegex:'孵化女王' },
  { id:'ws_abyss_occupy',affix:'prefix',label:'区域被深渊占据',     enRegex:'occupy',  cnRegex:'深渊占据' },

  // === 后缀 ===
  { id:'ws_rare_mod',    affix:'suffix',label:'稀有怪物额外词缀',   enRegex:'mod',     cnRegex:'额外.*词缀' },
  { id:'ws_extra_crit',  affix:'suffix',label:'怪物额外暴击暴伤',   enRegex:'extra.*crit',cnRegex:'暴击率|暴击伤害' },
  { id:'ws_mon_res',     affix:'suffix',label:'怪物元素抗性',       enRegex:'r el',    cnRegex:'怪物.*抗性' },
  { id:'ws_poison',      affix:'suffix',label:'怪物击中中毒',       enRegex:'ois',     cnRegex:'击中.*中毒' },
  { id:'ws_bleed',       affix:'suffix',label:'怪物击中流血',       enRegex:'blee',    cnRegex:'击中.*流血' },
  { id:'ws_ailment_thresh',affix:'suffix',label:'怪物异常/晕眩阈值', enRegex:'lm',     cnRegex:'异常.*阈|晕眩.*阈' },
  { id:'ws_armour_break',affix:'suffix',label:'怪物粉碎护甲',       enRegex:'eq',      cnRegex:'粉碎.*护' },
  { id:'ws_stun_buildup',affix:'suffix',label:'怪物晕眩积蓄提高',   enRegex:'un b',    cnRegex:'晕眩.*蓄' },
  { id:'ws_freeze',      affix:'suffix',label:'怪物冻结/易燃/感电', enRegex:'mm',      cnRegex:'冻结.*蓄|易燃|感电.*率' },
  { id:'ws_proj',        affix:'suffix',label:'怪物额外投射物',     enRegex:'oj',      cnRegex:'额外.*投射' },
  { id:'ws_aoe',         affix:'suffix',label:'怪物范围效果扩大',   enRegex:'ect$',    cnRegex:'范围.*扩大' },
  { id:'ws_minion_pen',  affix:'suffix',label:'召唤物穿透抗性',     enRegex:'minion',  cnRegex:'召唤.*穿透' },
  { id:'ws_max_res',     affix:'suffix',label:'玩家抗性上限降低',   enRegex:'% ma',    cnRegex:'抗性上限' },
  { id:'ws_flask_less',  affix:'suffix',label:'玩家药剂充能降低',   enRegex:'sk',      cnRegex:'药剂.*降' },
  { id:'ws_less_recov',  affix:'suffix',label:'生命护盾回复总降',   enRegex:'recov',   cnRegex:'回复.*总降' },
  { id:'ws_cooldown',    affix:'suffix',label:'玩家冷却回复总降',   enRegex:'wn',      cnRegex:'冷却.*降' },
  { id:'ws_crit_less',   affix:'suffix',label:'怪物受到暴伤降低',   enRegex:'tak',     cnRegex:'暴伤.*降|暴击伤害降低' },
  { id:'ws_mon_spd',     affix:'suffix',label:'怪物攻速施速移速',   enRegex:'tta',     cnRegex:'怪物.*速度' },
  { id:'ws_soul_eater',  affix:'suffix',label:'源生怪物吞噬灵魂',   enRegex:'soul',    cnRegex:'吞噬灵魂' },
  { id:'ws_no_dmg',      affix:'suffix',label:'周期性无法造成伤害', enRegex:'no.*dmg',  cnRegex:'不能造成伤害' },
  { id:'ws_slow_stack',  affix:'suffix',label:'技能速度总降叠加',   enRegex:'slow',    cnRegex:'速度总降' },
  { id:'ws_vine',        affix:'suffix',label:'怪物施加缓速藤蔓',   enRegex:'vine',    cnRegex:'缓速藤蔓' },
  { id:'ws_death_mark',  affix:'suffix',label:'击败稀有怪死亡印记', enRegex:'death',   cnRegex:'死亡印记' },
  { id:'ws_mana_siphon', affix:'suffix',label:'魔力虹吸地面',       enRegex:'siphon',  cnRegex:'虹吸' },
  { id:'ws_empowered',   affix:'suffix',label:'源生怪物聚魂状态',   enRegex:'empower', cnRegex:'聚魂' },
];

// ============================================================
// 物品基底/稀有度/移速/属性
// ============================================================
export const rarities: RarityDef[] = [
  { id:'rare',label:'稀有',en:'y: r',cn:'稀有' },
  { id:'magic',label:'魔法',en:'y: m',cn:'魔法' },
  { id:'normal',label:'普通',en:'y: n',cn:'普通' },
];
export const itemClasses: ClassDef[] = [
  { id:'amulets',label:'项链',enAbbr:'am',cnText:'项链' },
  { id:'rings',label:'戒指',enAbbr:'ri',cnText:'戒指' },
  { id:'belts',label:'腰带',enAbbr:'be',cnText:'腰带' },
  { id:'wands',label:'法杖',enAbbr:'wa',cnText:'法杖' },
  { id:'sceptres',label:'权杖',enAbbr:'sc',cnText:'权杖' },
  { id:'bows',label:'弓',enAbbr:'bow',cnText:'弓' },
  { id:'crossbows',label:'弩',enAbbr:'cr',cnText:'弩' },
  { id:'quarterstaves',label:'战斗杖',enAbbr:'qua',cnText:'战斗杖' },
  { id:'oneHandMaces',label:'单手锤',enAbbr:'on',cnText:'单手锤' },
  { id:'twoHandMaces',label:'双手锤',enAbbr:'tw',cnText:'双手锤' },
  { id:'staves',label:'长杖',enAbbr:'st',cnText:'长杖' },
  { id:'gloves',label:'手套',enAbbr:'gl',cnText:'手套' },
  { id:'boots',label:'鞋子',enAbbr:'boo',cnText:'鞋子' },
  { id:'bodyArmours',label:'胸甲',enAbbr:'bod',cnText:'胸甲' },
  { id:'helmets',label:'头盔/头部',enAbbr:'he',cnText:'(头盔|头部)' },
  { id:'shields',label:'盾牌',enAbbr:'sh',cnText:'盾牌' },
  { id:'foci',label:'法器',enAbbr:'fo',cnText:'法器' },
  { id:'quivers',label:'箭袋',enAbbr:'qui',cnText:'箭袋' },
  { id:'spears',label:'战矛',enAbbr:'sp',cnText:'战矛' },
  { id:'jewel',label:'珠宝',enAbbr:'jewel',cnText:'珠宝' },
  { id:'waystone',label:'引路石',enAbbr:'waystone',cnText:'引路石' },
];
export const moveSpeeds: MoveSpeedDef[] = [
  { value:10,label:'1%+',en:'\\d+% i.+mov',cn:'移动速度提高 \\d+%' },
  { value:15,label:'15%+',en:'(1[5-9]|[2-9]\\d)% i.+mov',cn:'移动速度提高 (1[5-9]|[2-9]\\d)%' },
  { value:20,label:'20%+',en:'([2-9]\\d)% i.+mov',cn:'移动速度提高 ([2-9]\\d)%' },
  { value:25,label:'25%+',en:'(2[5-9]|[3-9]\\d)% i.+mov',cn:'移动速度提高 (2[5-9]|[3-9]\\d)%' },
  { value:30,label:'30%+',en:'([3-9]\\d)% i.+mov',cn:'移动速度提高 ([3-9]\\d)%' },
  { value:35,label:'35%+',en:'(3[5-9]|[4-9]\\d)% i.+mov',cn:'移动速度提高 (3[5-9]|[4-9]\\d)%' },
];
export const properties = [
  { id:'quality',label:'品质',en:'y: \\+',cn:'品质.*\\+\\d' },
  { id:'sockets',label:'插槽',en:'ts: S',cn:'插槽' },
];

// ============================================================
// ilvlRegex
// ============================================================
export function ilvlRegex(min:number,max:number,lang:'en'|'cn'|'tc'='en'):{regex:string|null,explain:string}{
  if(min===0&&max===0)return{regex:null,explain:''};
  if(max>0&&min>max)return{regex:null,explain:''};
  const isCn=lang==='cn'||lang==='tc';
  const pf=isCn?'物品等级':'m level: ';
  const efMax=max===0?99:max;
  if(min===0&&efMax>=99)return{regex:`${pf}(\\d{1,2})`,explain:isCn?'任意物品等级':'Any Item Level'};
  if(min>0&&min===efMax)return{regex:`${pf}${min}`,explain:isCn?`物品等级 = ${min}`:`Item Level = ${min}`};
  const rangeRegex=buildNumberRange(min,efMax);
  const explain=isCn?`物品等级 ${min}${max>0?' ~ '+efMax:'+'}`:`Item Level ${min}${max>0?'~'+efMax:'+'}`;
  return{regex:`${pf}${rangeRegex}`,explain};
}
function buildNumberRange(min:number,max:number):string{
  if(max-min<=5&&max<=99){const vals:string[]=[];for(let i=min;i<=max;i++)vals.push(String(i));return`(${vals.join('|')})`;}
  const parts:string[]=[];
  if(min<=9){const end=Math.min(max,9);parts.push(min===0&&end===9?'\\d':min===end?String(min):`[${min}-${end}]`);min=10;}
  if(min<=99&&min>=10){const minTens=Math.floor(min/10),maxTens=Math.min(Math.floor(max/10),9);
    if(minTens===maxTens){const mo=min%10,mxo=max%10;parts.push(mo===0&&mxo===9?`${minTens}\\d`:mo===mxo?`${min}`:`${minTens}[${mo}-${mxo}]`);}
    else{parts.push(min%10===0?`${minTens}\\d`:`${minTens}[${min%10}-9]`);for(let t=minTens+1;t<maxTens;t++)parts.push(`${t}\\d`);parts.push(max%10===9?`${maxTens}\\d`:`${maxTens}[0-${max%10}]`);}
    min=100;}
  if(max>=100)parts.push('\\d{3,}');
  return parts.length===1?parts[0]:`(${parts.join('|')})`;
}

// ============================================================
// 预设
// ============================================================
export const presets: PresetDef[] = [
  { id:'bad_suffixes',name:'全部后缀',desc:waystoneMods.filter(m=>m.affix==='suffix').length+'个后缀一键全选',icon:'⚠',params:{mapModIds:waystoneMods.filter(m=>m.affix==='suffix').map(m=>m.id)}},
  { id:'good_prefixes',name:'全部前缀',desc:waystoneMods.filter(m=>m.affix==='prefix').length+'个前缀一键全选',icon:'✅',params:{mapModIds:waystoneMods.filter(m=>m.affix==='prefix').map(m=>m.id)}},
  { id:'life_ms_boots',name:'生命移速鞋',desc:'鞋子+生命+25%+移速+品质',icon:'👢',params:{classIds:['boots'],moveSpeed:25,modIds:['maxLife'],hasQuality:true,ilvlMin:70}},
  { id:'phys_weapon',name:'高物理武器',desc:'弓/弩/战矛+物理伤+点伤+攻速',icon:'⚔',params:{classIds:['bows','crossbows','spears'],rarities:['rare','magic'],modIds:['physDmg','flat_phys','attackSpeed'],hasQuality:true,ilvlMin:65}},
  { id:'caster',name:'施法装备',desc:'法杖/权杖+施速+精魂+全抗',icon:'✨',params:{classIds:['wands','sceptres','foci','rings','amulets'],modIds:['castSpeed','spirit','maxLife','spellDmg'],resistances:['fireRes','coldRes','lightRes','chaosRes']}},
  { id:'ssf_vendor',name:'独狼商人',desc:'饰品+防具+生命+三抗+移速',icon:'🛡',params:{classIds:['rings','amulets','belts','boots','gloves','helmets','bodyArmours'],rarities:['rare','magic'],modIds:['maxLife'],resistances:['fireRes','coldRes','lightRes'],moveSpeed:20,ilvlMin:60}},
];

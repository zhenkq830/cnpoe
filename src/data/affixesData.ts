/**
 * affixesData.ts — PoE2 双语词缀数据 (纯 JSON 风格)
 * 扩展版: 50+ 装备词缀 + 50+ 引路石词缀 + 物品基底/属性/预设
 *
 * Copyright (c) 2025 流放工坊 | cnpoe.com
 * 数据参考 poe2.re / poe2db.tw 并独立整理，请勿商业复制。
 */

// ============================================================
// 类型定义
// ============================================================
export interface AffixDef {
  id: string; label: string; category: string;
  en: string; cn: string; example: string;
}
export interface WaystoneMod {
  id: string; name: string; category: 'prefix_good'|'prefix_neutral'|'suffix_bad'|'suffix_moderate';
  label: string; enRegex: string; cnRegex: string; cnExample: string;
}
export interface ClassDef { id: string; label: string; enAbbr: string; cnText: string; }
export interface RarityDef { id: string; label: string; en: string; cn: string; }
export interface MoveSpeedDef { value: number; label: string; en: string; cn: string; }
export interface PresetDef { id: string; name: string; desc: string; icon: string; params: Record<string, unknown>; }

// ============================================================
// 1. 装备词缀（50+ 条, 按分类组织）
// ============================================================
const ALL_MODS: AffixDef[] = [
  // === 武器伤害 - 点伤 ===
  { id: 'flat_phys',   label: '附加物理伤害',      category: '点伤', en: 'adds.*phys',  cn: '附加.*物理伤害', example: '任意附加物理点伤词缀' },
  { id: 'flat_fire',   label: '附加火焰伤害',      category: '点伤', en: 'adds.*fire',  cn: '附加.*火焰伤害', example: '任意附加火焰点伤词缀' },
  { id: 'flat_cold',   label: '附加冰霜伤害',      category: '点伤', en: 'adds.*cold',  cn: '附加.*冰霜伤害', example: '任意附加冰霜点伤词缀' },
  { id: 'flat_light',  label: '附加闪电伤害',      category: '点伤', en: 'adds.*light', cn: '附加.*闪电伤害', example: '任意附加闪电点伤词缀' },
  { id: 'flat_chaos',  label: '附加混沌伤害',      category: '点伤', en: 'adds.*chaos', cn: '附加.*混沌伤害', example: '任意附加混沌点伤词缀' },

  // === 武器伤害 - 百分比 ===
  { id: 'physDmg',     label: '物理伤害提高',       category: '伤害', en: 'ph.*da',        cn: '物理伤害提高 \\d+%',    example: '物理伤害提高 85%' },
  { id: 'eleDmg',      label: '元素伤害提高',       category: '伤害', en: 'ele.*da',       cn: '元素伤害提高 \\d+%',    example: '元素伤害提高 40%' },
  { id: 'spellDmg',    label: '法术伤害提高',       category: '伤害', en: 'spell.*da',     cn: '法术伤害提高 \\d+%',    example: '法术伤害提高 50%' },
  { id: 'fireDmg',     label: '火焰伤害提高',       category: '伤害', en: '\\d f.+da',     cn: '火焰伤害提高 \\d+%',    example: '火焰伤害提高 35%' },
  { id: 'coldDmg',     label: '冰霜伤害提高',       category: '伤害', en: '\\d co.+da',    cn: '冰霜伤害提高 \\d+%',    example: '冰霜伤害提高 35%' },
  { id: 'lightDmg',    label: '闪电伤害提高',       category: '伤害', en: '\\d l.+da',     cn: '闪电伤害提高 \\d+%',    example: '闪电伤害提高 35%' },
  { id: 'chaosDmg',    label: '混沌伤害提高',       category: '伤害', en: '\\d ch.+da',    cn: '混沌伤害提高 \\d+%',    example: '混沌伤害提高 30%' },
  { id: 'areaDmg',     label: '范围伤害提高',       category: '伤害', en: 'area.*dmg',     cn: '范围伤害提高 \\d+%',    example: '范围伤害提高 20%' },
  { id: 'minionDmg',   label: '召唤物伤害提高',     category: '伤害', en: 'minion.*dmg',   cn: '召唤生物.*伤害提高 \\d+%', example: '召唤生物伤害提高 35%' },

  // === 攻击 / 施法 ===
  { id: 'attackSpeed', label: '攻击速度',           category: '速度', en: 'ck spe',        cn: '攻击速度提高 \\d+%',     example: '攻击速度提高 15%' },
  { id: 'castSpeed',   label: '施法速度',           category: '速度', en: 'st spe',        cn: '施法速度提高 \\d+%',     example: '施法速度提高 15%' },

  // === 投射物 ===
  { id: 'projCount',   label: '投射物数量',         category: '攻击', en: 'projectile',    cn: '投射物数量 \\+\\d+',      example: '投射物数量 +1' },
  { id: 'projSpeed',   label: '投射物速度提高',     category: '攻击', en: 'proj.*speed',   cn: '投射物速度提高 \\d+%',   example: '投射物速度提高 25%' },

  // === 暴击 ===
  { id: 'critChance',  label: '暴击率',             category: '暴击', en: 'crit.*chan',    cn: '暴击率提高 \\d+%',        example: '暴击率提高 30%' },
  { id: 'critMulti',   label: '暴击伤害加成',       category: '暴击', en: 'crit.*multi',   cn: '暴击伤害加成 \\+\\d+%',   example: '暴击伤害加成 +25%' },
  { id: 'spellCrit',   label: '法术暴击率',         category: '暴击', en: 'spell.*crit',   cn: '法术暴击率提高 \\d+%',    example: '法术暴击率提高 40%' },

  // === 属性 ===
  { id: 'strength',    label: '力量',               category: '属性', en: 'strength',      cn: '力量 \\+\\d+',            example: '力量 +25' },
  { id: 'dexterity',   label: '敏捷',               category: '属性', en: 'dexterity',     cn: '敏捷 \\+\\d+',            example: '敏捷 +25' },
  { id: 'intelligence',label: '智慧',               category: '属性', en: 'intelligence',  cn: '智慧 \\+\\d+',            example: '智慧 +25' },
  { id: 'allAttr',     label: '所有属性',           category: '属性', en: 'all.*attr',     cn: '所有属性 \\+\\d+',        example: '所有属性 +10' },
  { id: 'reducedAttr', label: '属性需求降低',       category: '属性', en: 'attr.*req',     cn: '属性需求降低 \\d+%',      example: '属性需求降低 25%' },

  // === 防御 ===
  { id: 'maxLife',     label: '最大生命',           category: '防御', en: '\\d.+life',     cn: '最大生命 \\+\\d+',            example: '最大生命 +80' },
  { id: 'maxMana',     label: '最大魔力',           category: '防御', en: '\\d.+mana',     cn: '最大魔力 \\+\\d+',            example: '最大魔力 +50' },
  { id: 'energyShield',label: '能量护盾',           category: '防御', en: 'energy',        cn: '能量护盾 \\+\\d+',            example: '能量护盾 +45' },
  { id: 'incArmour',   label: '护甲提高',           category: '防御', en: 'armour.*\\d',   cn: '护甲提高 \\d+%',              example: '护甲提高 30%' },
  { id: 'incEvasion',  label: '闪避提高',           category: '防御', en: 'evasion.*\\d',  cn: '闪避提高 \\d+%',              example: '闪避提高 30%' },
  { id: 'incES',       label: '能量护盾提高',       category: '防御', en: 'en.*sh.*\\d',   cn: '能量护盾提高 \\d+%',          example: '能量护盾提高 25%' },
  { id: 'incArmourES', label: '护甲与能量护盾提高', category: '防御', en: 'arm.*en',       cn: '护甲与能量护盾提高 \\d+%',     example: '护甲与能量护盾提高 20%' },
  { id: 'incEvasionES',label: '闪避与能量护盾提高', category: '防御', en: 'evasion.*en',   cn: '闪避与能量护盾提高 \\d+%',     example: '闪避与能量护盾提高 20%' },

  // === 抗性 ===
  { id: 'fireRes',    label: '火焰抗性',            category: '抗性', en: 'fi.+res',       cn: '火焰抗性 \\+\\d+%',            example: '火焰抗性 +30%' },
  { id: 'coldRes',    label: '冰霜抗性',            category: '抗性', en: 'co.+res',       cn: '冰霜抗性 \\+\\d+%',            example: '冰霜抗性 +30%' },
  { id: 'lightRes',   label: '闪电抗性',            category: '抗性', en: 'li.+res',       cn: '闪电抗性 \\+\\d+%',            example: '闪电抗性 +30%' },
  { id: 'chaosRes',   label: '混沌抗性',            category: '抗性', en: 'ch.+res',       cn: '混沌抗性 \\+\\d+%',            example: '混沌抗性 +15%' },
  { id: 'allRes',     label: '全部元素抗性',        category: '抗性', en: 'all.*ele.*res', cn: '全部元素抗性 \\+\\d+%',        example: '全部元素抗性 +10%' },
  { id: 'maxResFire', label: '最大火焰抗性',        category: '抗性', en: 'max.*fire.*res',cn: '最大火焰抗性 \\+\\d+%',         example: '最大火焰抗性 +3%' },
  { id: 'maxResCold', label: '最大冰霜抗性',        category: '抗性', en: 'max.*cold.*res',cn: '最大冰霜抗性 \\+\\d+%',         example: '最大冰霜抗性 +3%' },
  { id: 'maxResLight',label: '最大闪电抗性',        category: '抗性', en: 'max.*light.*r', cn: '最大闪电抗性 \\+\\d+%',        example: '最大闪电抗性 +3%' },

  // === 生命/魔力回复 ===
  { id: 'regenLife',  label: '每秒生命回复',        category: '回复', en: 'regen.*life',   cn: '每秒.*回复.*\\d+.*生命',       example: '每秒回复 15 生命' },
  { id: 'regenMana',  label: '魔力回复速度',        category: '回复', en: 'mana.*regen',   cn: '魔力回复速度提高 \\d+%',       example: '魔力回复速度提高 30%' },

  // === 偷取 ===
  { id: 'lifeLeech',   label: '物理伤害偷取生命',   category: '偷取', en: 'phys.*leech',   cn: '物理伤害.*偷取.*生命',         example: '物理攻击伤害的 2% 偷取为生命' },
  { id: 'manaLeech',   label: '物理伤害偷取魔力',   category: '偷取', en: 'phys.*leech.*mana', cn: '物理伤害.*偷取.*魔力',       example: '物理攻击伤害的 1% 偷取为魔力' },

  // === 技能等级 ===
  { id: 'skillLevel',  label: '所有技能宝石等级',   category: '技能', en: '^\\+.*ills$',   cn: '所有.*技能宝石 \\+\\d+',        example: '所有法术技能宝石 +1' },
  { id: 'fireSkill',   label: '火焰技能宝石等级',   category: '技能', en: 'fire.*gem',     cn: '火焰.*技能宝石 \\+\\d+',        example: '火焰技能宝石 +2' },
  { id: 'coldSkill',   label: '冰霜技能宝石等级',   category: '技能', en: 'cold.*gem',     cn: '冰霜.*技能宝石 \\+\\d+',        example: '冰霜技能宝石 +2' },
  { id: 'lightSkill',  label: '闪电技能宝石等级',   category: '技能', en: 'light.*gem',    cn: '闪电.*技能宝石 \\+\\d+',        example: '闪电技能宝石 +2' },
  { id: 'physSkill',   label: '物理技能宝石等级',   category: '技能', en: 'phys.*gem',     cn: '物理.*技能宝石 \\+\\d+',        example: '物理技能宝石 +2' },
  { id: 'chaosSkill',  label: '混沌技能宝石等级',   category: '技能', en: 'chaos.*gem',    cn: '混沌.*技能宝石 \\+\\d+',        example: '混沌技能宝石 +2' },
  { id: 'meleeSkill',  label: '近战技能宝石等级',   category: '技能', en: 'melee.*gem',    cn: '近战.*技能宝石 \\+\\d+',        example: '近战技能宝石 +2' },
  { id: 'minionSkill', label: '召唤技能宝石等级',   category: '技能', en: 'minion.*gem',   cn: '召唤.*技能宝石 \\+\\d+',        example: '召唤技能宝石 +2' },

  // === 精魂 ===
  { id: 'spirit',      label: '最大精魂',           category: '通用', en: 'spiri',         cn: '最大精魂 \\+\\d+',             example: '最大精魂 +30' },

  // === 召唤物 ===
  { id: 'minionLife',  label: '召唤物最大生命',     category: '召唤', en: 'minion.*life',  cn: '召唤生物.*最大生命 \\+\\d+',    example: '召唤生物最大生命 +40' },
  { id: 'minionSpeed', label: '召唤物攻击/施法速度',category: '召唤', en: 'minion.*speed', cn: '召唤生物.*速度提高 \\d+%',      example: '召唤生物攻击和施法速度提高 20%' },

  // === 通用 ===
  { id: 'rarityFind',  label: '物品稀有度提高',     category: '通用', en: 'd rari',        cn: '物品稀有度提高 \\d+%',          example: '物品稀有度提高 25%' },
  { id: 'lightRadius', label: '照亮范围提高',       category: '通用', en: 'light.*rad',    cn: '照亮范围提高 \\d+%',            example: '照亮范围提高 15%' },
  { id: 'stunThresh',  label: '眩晕门槛提高',       category: '通用', en: 'stun.*thresh',  cn: '眩晕门槛提高 \\d+%',            example: '眩晕门槛提高 20%' },
  { id: 'curseEffect', label: '诅咒效果提高',       category: '通用', en: 'curse.*effect', cn: '诅咒效果提高 \\d+%',            example: '诅咒效果提高 15%' },
  { id: 'auraEffect',  label: '光环效果提高',       category: '通用', en: 'aura.*effect',  cn: '光环效果提高 \\d+%',            example: '非诅咒光环效果提高 10%' },
  { id: 'accuracy',    label: '命中值',             category: '通用', en: 'accuracy',      cn: '命中值 \\+\\d+',                example: '命中值 +250' },
];

// 按分类组织
const CAT_GROUPS: Record<string, string[]> = {
  '点伤':   ['flat_phys','flat_fire','flat_cold','flat_light','flat_chaos'],
  '伤害':   ['physDmg','eleDmg','spellDmg','fireDmg','coldDmg','lightDmg','chaosDmg','areaDmg','minionDmg'],
  '速度':   ['attackSpeed','castSpeed'],
  '攻击':   ['projCount','projSpeed'],
  '暴击':   ['critChance','critMulti','spellCrit'],
  '属性':   ['strength','dexterity','intelligence','allAttr','reducedAttr'],
  '防御':   ['maxLife','maxMana','energyShield','incArmour','incEvasion','incES','incArmourES','incEvasionES'],
  '抗性':   ['fireRes','coldRes','lightRes','chaosRes','allRes','maxResFire','maxResCold','maxResLight'],
  '回复':   ['regenLife','regenMana'],
  '偷取':   ['lifeLeech','manaLeech'],
  '技能':   ['skillLevel','fireSkill','coldSkill','lightSkill','physSkill','chaosSkill','meleeSkill','minionSkill'],
  '召唤':   ['minionLife','minionSpeed'],
  '通用':   ['spirit','rarityFind','lightRadius','stunThresh','curseEffect','auraEffect','accuracy'],
};

/** 获取所有词缀 (带分类) */
export function getAllItemMods(): AffixDef[] { return ALL_MODS; }
/** 获取分类组 */
export function getCategoryGroups(): Record<string, string[]> { return CAT_GROUPS; }
/** 按 ID 获取词缀 */
export function getModById(id: string): AffixDef | undefined { return ALL_MODS.find(m => m.id === id); }

// ============================================================
// 2. 引路石/Waystone 词缀 (对齐 poe2.re Waystone.Gen.ts)
// ============================================================
export const waystoneMods: WaystoneMod[] = [
  // ---- PREFIX: 有利----
  { id: 'ws_rarity',     name: 'Increased Rarity',        category:'prefix_good', label:'物品稀有度提高', enRegex:'rarity',           cnRegex:'物品稀有度提高',              cnExample:'物品稀有度提高 80%' },
  { id: 'ws_quantity',   name: 'Increased Item Quantity',  category:'prefix_good', label:'物品数量提高',   enRegex:'quant',            cnRegex:'物品数量提高',                cnExample:'物品数量提高 25%' },
  { id: 'ws_pack_size',  name: 'Increased Pack size',      category:'prefix_good', label:'怪物群规模提高', enRegex:'pack',             cnRegex:'怪物群规模提高',              cnExample:'怪物群规模提高 15%' },
  { id: 'ws_gold',       name: 'Increased Gold found',     category:'prefix_good', label:'金币掉落提高',   enRegex:'gold',             cnRegex:'金币掉落提高',                cnExample:'金币掉落提高 30%' },
  { id: 'ws_exp',        name: 'Increased Experience',     category:'prefix_good', label:'经验值提高',     enRegex:'exp',              cnRegex:'经验值提高',                  cnExample:'经验值提高 50%' },
  { id: 'ws_rare_mon',   name: 'Additional Rare Monsters', category:'prefix_good', label:'额外稀有怪物',   enRegex:'rare.*mon',        cnRegex:'额外.*稀有怪物|稀有怪物数量提高', cnExample:'稀有怪物数量提高 20%' },
  { id: 'ws_magic_mon',  name: 'Additional Magic Monsters',category:'prefix_good', label:'额外魔法怪物',   enRegex:'magic.*mon',       cnRegex:'额外.*魔法怪物|魔法怪物数量提高', cnExample:'魔法怪物数量提高 25%' },
  { id: 'ws_delirious',  name: 'Area is Delirious',        category:'prefix_good', label:'迷雾笼罩',       enRegex:'delir',            cnRegex:'迷雾笼罩|谵妄',                cnExample:'区域被迷雾笼罩' },

  // ---- SUFFIX: 致命----
  { id: 'ws_ref_phys',   name:'Reflect Physical',   category:'suffix_bad', label:'反射物理伤害',   enRegex:'refl.*phys',  cnRegex:'怪物.*反射.*物理伤害',              cnExample:'怪物反射 15% 物理伤害' },
  { id: 'ws_ref_ele',    name:'Reflect Elemental',  category:'suffix_bad', label:'反射元素伤害',   enRegex:'refl.*ele',   cnRegex:'怪物.*反射.*元素伤害',              cnExample:'怪物反射 15% 元素伤害' },
  { id: 'ws_no_regen',   name:'Cannot Regen',       category:'suffix_bad', label:'无法回复',       enRegex:'no.*regen',   cnRegex:'无法.*回复|不能.*回复',              cnExample:'玩家无法回复生命和魔力' },
  { id: 'ws_less_recov', name:'Less Recovery Rate', category:'suffix_bad', label:'回复速度降低',   enRegex:'recov',       cnRegex:'回复.*速度.*降低',                  cnExample:'回复速度降低 40%' },
  { id: 'ws_pen',        name:'Penetrates Resists', category:'suffix_bad', label:'穿透元素抗性',   enRegex:'pen',         cnRegex:'穿透.*元素抗性|穿透.*抗性',           cnExample:'怪物伤害穿透 10% 元素抗性' },
  { id: 'ws_extra_crit', name:'Extra Crit / Aura',  category:'suffix_bad', label:'额外暴击/暴伤',  enRegex:'extra.*crit', cnRegex:'额外.*暴击|暴击.*加成|暴击.*光环',    cnExample:'怪物暴击率提高 30%' },
  { id: 'ws_extra_dmg',  name:'Extra Damage',       category:'suffix_bad', label:'附加额外伤害',   enRegex:'extra.*dmg',  cnRegex:'附加.*额外.*伤害|额外.*伤害',         cnExample:'怪物附加 25% 额外火焰伤害' },
  { id: 'ws_ailment',    name:'Avoid/Immune Ailments',category:'suffix_bad',label:'免疫异常状态',  enRegex:'ailment',     cnRegex:'免疫.*异常|避免.*元素异常|不受.*异常', cnExample:'怪物免疫元素异常状态' },
  { id: 'ws_less_aura',  name:'Less Aura Effect',   category:'suffix_bad', label:'光环效果降低',   enRegex:'aura',        cnRegex:'光环.*效果.*降低',                   cnExample:'玩家光环效果降低 30%' },
  { id: 'ws_less_curse', name:'Less Curse Effect',  category:'suffix_bad', label:'诅咒效果降低',   enRegex:'curse',       cnRegex:'诅咒.*效果.*降低',                   cnExample:'怪物诅咒效果降低 40%' },
  { id: 'ws_less_def',   name:'Reduced Defences',   category:'suffix_bad', label:'防御降低',       enRegex:'defence',     cnRegex:'防御.*降低|护甲.*降低|闪避.*降低',     cnExample:'玩家防御降低 25%' },
  { id: 'ws_enfeeble',   name:'Cursed w/ Enfeeble', category:'suffix_bad', label:'周期性衰弱诅咒', enRegex:'eble',        cnRegex:'周期性.*衰弱|衰弱.*诅咒',              cnExample:'玩家周期性被施加衰弱诅咒' },
  { id: 'ws_ele_weak',   name:'Cursed w/ Ele Weak', category:'suffix_bad', label:'周期性元素要害', enRegex:'kn',          cnRegex:'周期性.*元素要害|元素要害.*诅咒',       cnExample:'玩家周期性被施加元素要害诅咒' },
  { id: 'ws_temp_chain', name:'Cursed w/ Temp Chain',category:'suffix_bad',label:'周期性时空锁链', enRegex:'emp',         cnRegex:'周期性.*时空锁链|时空锁链.*诅咒',       cnExample:'玩家周期性被施加时空锁链诅咒' },

  // ---- SUFFIX: 中等----
  { id: 'ws_mon_spd',    name:'Monster Speed',       category:'suffix_moderate', label:'怪物速度提高',   enRegex:'tta',             cnRegex:'怪物.*速度.*提高',                    cnExample:'怪物攻速/移速/施速提高 15%' },
  { id: 'ws_adds_phys',  name:'Adds Physical',       category:'suffix_moderate', label:'附加物理伤害',   enRegex:'adds.*phys',      cnRegex:'附加.*物理伤害|额外.*物理',             cnExample:'怪物附加 20-30 物理伤害' },
  { id: 'ws_adds_fire',  name:'Extra Fire Damage',   category:'suffix_moderate', label:'附加火焰伤害',   enRegex:'fire$',           cnRegex:'附加.*火焰伤害|额外.*火焰',             cnExample:'怪物附加 15-25 火焰伤害' },
  { id: 'ws_adds_cold',  name:'Extra Cold Damage',   category:'suffix_moderate', label:'附加冰霜伤害',   enRegex:'col',             cnRegex:'附加.*冰霜伤害|额外.*冰霜',             cnExample:'怪物附加 15-25 冰霜伤害' },
  { id: 'ws_adds_light', name:'Extra Lightning Dmg', category:'suffix_moderate', label:'附加闪电伤害',   enRegex:'tn',              cnRegex:'附加.*闪电伤害|额外.*闪电',             cnExample:'怪物附加 15-25 闪电伤害' },
  { id: 'ws_adds_chaos', name:'Extra Chaos Damage',  category:'suffix_moderate', label:'附加混沌伤害',   enRegex:'ra ch',           cnRegex:'附加.*混沌伤害|额外.*混沌',             cnExample:'怪物附加 10-20 混沌伤害' },
  { id: 'ws_mon_life',   name:'More Monster Life',   category:'suffix_moderate', label:'怪物生命提高',   enRegex:'fe$',             cnRegex:'怪物.*生命.*提高|更多.*生命',           cnExample:'怪物生命提高 30%' },
  { id: 'ws_mon_res',    name:'Monster Resists',     category:'suffix_moderate', label:'怪物元素抗性',   enRegex:'r el',            cnRegex:'怪物.*元素抗性|怪物抗性',               cnExample:'怪物元素抗性 +40%' },
  { id: 'ws_stun',       name:'Cannot be Stunned',   category:'suffix_moderate', label:'免疫眩晕',       enRegex:'stun',            cnRegex:'无法.*眩晕|免疫眩晕',                  cnExample:'怪物无法被眩晕' },
  { id: 'ws_bleed',      name:'Bleed on Hit',        category:'suffix_moderate', label:'击中导致流血',   enRegex:'blee',            cnRegex:'击中.*流血',                          cnExample:'怪物击中时 20% 几率导致流血' },
  { id: 'ws_poison',     name:'Poison on Hit',       category:'suffix_moderate', label:'击中导致中毒',   enRegex:'ois',             cnRegex:'击中.*中毒',                          cnExample:'怪物击中时 20% 几率导致中毒' },
  { id: 'ws_ignite_gnd', name:'Ignited Ground',      category:'suffix_moderate', label:'燃烧地面',       enRegex:'ign',             cnRegex:'燃烧地面',                             cnExample:'区域有燃烧地面' },
  { id: 'ws_chill_gnd',  name:'Chilled Ground',      category:'suffix_moderate', label:'冰缓地面',       enRegex:'chi',             cnRegex:'冰缓地面',                             cnExample:'区域有冰缓地面' },
  { id: 'ws_shock_gnd',  name:'Shocked Ground',      category:'suffix_moderate', label:'感电地面',       enRegex:'cke',             cnRegex:'感电地面',                             cnExample:'区域有感电地面' },
  { id: 'ws_proj',       name:'Extra Projectiles',   category:'suffix_moderate', label:'额外投射物',     enRegex:'oj',              cnRegex:'额外.*投射物',                         cnExample:'怪物发射 2 个额外投射物' },
  { id: 'ws_aoe',        name:'Increased AoE',       category:'suffix_moderate', label:'怪物范围提高',   enRegex:'ect$',            cnRegex:'范围.*效果.*提高|范围.*扩大',           cnExample:'怪物范围效果提高 50%' },
  { id: 'ws_charge_stl', name:'Steal Charges',       category:'suffix_moderate', label:'偷取充能球',     enRegex:'r,',              cnRegex:'偷取.*充能球|窃取.*充能',               cnExample:'怪物击中偷取充能球' },
];

// ============================================================
// 3. 物品基底 / 稀有度 / 移速 / 属性 / 物等辅助函数
// ============================================================
export const rarities: RarityDef[] = [
  { id: 'rare', label:'稀有', en:'y: r', cn:'稀有' },
  { id: 'magic', label:'魔法', en:'y: m', cn:'魔法' },
  { id: 'normal', label:'普通', en:'y: n', cn:'普通' },
];
export const itemClasses: ClassDef[] = [
  { id:'amulets',label:'项链',enAbbr:'am',cnText:'项链'},{ id:'rings',label:'戒指',enAbbr:'ri',cnText:'戒指'},{ id:'belts',label:'腰带',enAbbr:'be',cnText:'腰带'},
  { id:'wands',label:'法杖',enAbbr:'wa',cnText:'法杖'},{ id:'sceptres',label:'权杖',enAbbr:'sc',cnText:'权杖'},{ id:'bows',label:'弓',enAbbr:'bow',cnText:'弓'},
  { id:'crossbows',label:'弩',enAbbr:'cr',cnText:'弩'},{ id:'quarterstaves',label:'战斗杖',enAbbr:'qua',cnText:'战斗杖'},
  { id:'oneHandMaces',label:'单手锤',enAbbr:'on',cnText:'单手锤'},{ id:'twoHandMaces',label:'双手锤',enAbbr:'tw',cnText:'双手锤'},{ id:'staves',label:'长杖',enAbbr:'st',cnText:'长杖'},
  { id:'gloves',label:'手套',enAbbr:'gl',cnText:'手套'},{ id:'boots',label:'鞋子',enAbbr:'boo',cnText:'靴子'},{ id:'bodyArmours',label:'胸甲',enAbbr:'bod',cnText:'胸甲'},
  { id:'helmets',label:'头盔',enAbbr:'he',cnText:'头盔'},{ id:'shields',label:'盾牌',enAbbr:'sh',cnText:'盾牌'},{ id:'foci',label:'法器',enAbbr:'fo',cnText:'法器'},
  { id:'quivers',label:'箭袋',enAbbr:'qui',cnText:'箭袋'},{ id:'jewel',label:'珠宝',enAbbr:'jewel',cnText:'珠宝'},{ id:'waystone',label:'地图石',enAbbr:'waystone',cnText:'地图石'},
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
  { id:'sockets',label:'插槽',en:'ts: S',cn:'插槽.*[RGB]' },
];
export function ilvlRegex(min:number,max:number,lang:'en'|'cn'='en'):{regex:string|null,explain:string}{
  if(min===0&&max===0)return{regex:null,explain:''};
  if(max>0&&min>max)return{regex:null,explain:''};
  const pf=lang==='cn'?'物品等级: ':'m level: ';
  const efMax=max===0?99:max;

  // 全范围 (0-99) — 不需要过滤
  if(min===0&&efMax>=99)return{regex:`${pf}(\\d{1,2})`,explain:lang==='cn'?'任意物品等级':'Any Item Level'};

  // 精确单值
  if(min>0&&min===efMax)return{regex:`${pf}${min}`,explain:lang==='cn'?`物品等级 = ${min}`:`Item Level = ${min}`};

  // 范围 generation
  const rangeRegex = buildNumberRangeRegex(min, efMax);
  const explain = lang==='cn'
    ?`物品等级 ${min}${max>0?' ~ '+efMax:'+'}`  :`Item Level ${min}${max>0?'~'+efMax:'+'}`;

  return { regex: `${pf}${rangeRegex}`, explain };
}

/** 构建精确数字范围 regex */
function buildNumberRangeRegex(min: number, max: number): string {
  // 小范围 (≤5个值) → 枚举
  if (max - min <= 5 && max <= 99) {
    const vals: string[] = [];
    for (let i = min; i <= max; i++) vals.push(String(i));
    return `(${vals.join('|')})`;
  }

  // 大范围 → 逐位模式
  const parts: string[] = [];

  // 处理 1-digit (1-9)
  if (min <= 9) {
    const end = Math.min(max, 9);
    if (min === end) parts.push(String(min));
    else if (min === 0 && end === 9) parts.push('\\d');
    else parts.push(`[${min}-${end}]`);
    min = 10;
  }

  // 处理 2-digit (10-99)
  if (min <= 99 && min >= 10) {
    const minTens = Math.floor(min / 10);
    const maxTens = Math.min(Math.floor(max / 10), 9);

    if (minTens === maxTens) {
      // 同十位: 80-85 → 8[0-5]
      const minOnes = min % 10;
      const maxOnes = max % 10;
      if (minOnes === 0 && maxOnes === 9) parts.push(`${minTens}\\d`);
      else if (minOnes === maxOnes) parts.push(`${min}${minOnes === 0 ? '' : ''}`);
      else parts.push(`${minTens}[${minOnes}-${maxOnes}]`);
    } else {
      // 跨十位: 75-92 → (7[5-9]|8\d|9[0-2])
      // 第一个十位: mTens[ones-9]
      const firstOnes = min % 10;
      if (firstOnes === 0) parts.push(`${minTens}\\d`);
      else parts.push(`${minTens}[${firstOnes}-9]`);

      // 中间完整十位
      for (let t = minTens + 1; t < maxTens; t++) {
        parts.push(`${t}\\d`);
      }

      // 最后一个十位
      const lastOnes = max % 10;
      if (lastOnes === 9) parts.push(`${maxTens}\\d`);
      else parts.push(`${maxTens}[0-${lastOnes}]`);
    }
    min = 100;
  }

  // 处理 3-digit+ (100-999)
  if (max >= 100 && min <= max) {
    if (min <= 100) parts.push('\\d{3,}');
    else parts.push(`\\d{3,}`);
  }

  return parts.length === 1 ? parts[0] : `(${parts.join('|')})`;
}

// ============================================================
// 4. 热门预设
// ============================================================
export const presets: PresetDef[] = [
  { id:'t1_waystone',name:'高收益引路石',desc:'稀有度+数量+怪物群+经验+金币',icon:'🗺',
    params:{mapModIds:['ws_rarity','ws_quantity','ws_pack_size','ws_exp','ws_gold']} },
  { id:'deadly_ws',name:'致命引路石',desc:'反射/无法回复/穿透/暴击/异常免疫',icon:'💀',
    params:{mapModIds:['ws_ref_phys','ws_ref_ele','ws_no_regen','ws_pen','ws_extra_crit','ws_ailment']} },
  { id:'bad_suffixes',name:'坏后缀合集',desc:'全部致命+危险后缀一目了然',icon:'⚠',
    params:{mapModIds:waystoneMods.filter(m=>m.category==='suffix_bad').map(m=>m.id)} },
  { id:'good_prefixes',name:'好前缀合集',desc:'高亮全部有利引路石前缀',icon:'✅',
    params:{mapModIds:waystoneMods.filter(m=>m.category==='prefix_good').map(m=>m.id)} },
  { id:'life_ms_boots',name:'生命移速鞋',desc:'鞋子+生命+25-30%移速+品质',icon:'👢',
    params:{classIds:['boots'],moveSpeed:25,modIds:['maxLife'],hasQuality:true,ilvlMin:70} },
  { id:'phys_weapon',name:'高物理武器',desc:'弓/弩+物理伤+点伤+攻速',icon:'⚔',
    params:{classIds:['bows','crossbows'],rarities:['rare','magic'],modIds:['physDmg','flat_phys','attackSpeed'],hasQuality:true,ilvlMin:65} },
  { id:'caster',name:'施法装备',desc:'法杖/权杖+施速+精魂+全抗',icon:'✨',
    params:{classIds:['wands','sceptres','foci','rings','amulets'],modIds:['castSpeed','spirit','maxLife','spellDmg'],resistances:['fireRes','coldRes','lightRes','chaosRes']} },
  { id:'ssf_vendor',name:'独狼商人',desc:'饰品+防具+生命+三抗+移速',icon:'🛡',
    params:{classIds:['rings','amulets','belts','boots','gloves','helmets','bodyArmours'],rarities:['rare','magic'],modIds:['maxLife'],resistances:['fireRes','coldRes','lightRes'],moveSpeed:20,ilvlMin:60} },
];

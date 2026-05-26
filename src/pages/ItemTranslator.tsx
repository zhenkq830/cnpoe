import { useState, useMemo } from 'react';
import { useCopy } from '../hooks/useCopy';
import { CN2EN, TW2EN } from '../data/modTranslations';
import { POE2_CN2EN, POE2_TW2EN } from '../data/poe2ModTranslations';
import { BASE_TYPES } from '../data/baseTypes';
import { POE2_CN_BASE } from '../data/poe2BaseCN';
import { POE2_TW_BASE } from '../data/poe2BaseTW';
import { GEM_DB, type GemEntry } from '../data/gemData';
import { SUP_GEM_DB, type SupGemEntry } from '../data/supportGemData';
import { lookupPassive } from '../data/passiveNames';

interface TransResult { line: string; en: string; confidence: 'high'|'mid'|'low'; matched?: string; isRune?: boolean; isFractured?: boolean; isEnchant?: boolean }

const TC_MAP: Record<string,string> = {'混沌':'Chaos','物理':'Physical','火焰':'Fire','冰冷':'Cold','閃電':'Lightning','冰霜':'Cold'};

// PoE1(PoeCharm) → PoE2 synonym mapping
const SYNONYMS: [RegExp, string][] = [
  [/提高/g,'加快'], [/降低/g,'减慢'], [/闪避值/g,'闪避'], [/能量护盾/g,'能量护盾'],
  [/冰霜/g,'冰冷'], [/冰冷/g,'冰霜'], [/攻擊速度/g,'攻击速度'],
  [/技能等级/g,'技能石等级'], [/技能石等级/g,'技能等级'],
];

function applySynonyms(s: string): string[] {
  const results = [s, s.replace(/，/g,','), s.replace(/,/g,'，')];
  for (const [re, repl] of SYNONYMS) {
    const next = results.map(v => v.replace(re, repl));
    results.push(...next.filter(v => v !== s));
  }
  return [...new Set(results)];
}

function preClean(s: string): string {
  return s.replace(/\s+/g,' ').replace(/[：∶]/g,':').replace(/（/g,'(').replace(/）/g,')').replace(/，/g,',').replace(/。/g,'.').replace(/[【】\[\]]/g,'').replace(/(?<=[一-鿿])\s+(?=[一-鿿])/g,'').trim();
}

const FIXES: [RegExp, string][] = [
  [/所有召唤生物技能等级\s*\+?\s*(\d+)/,'+$1 to Level of all Minion Skills'],
  [/所有投射物技能等级\s*\+?\s*(\d+)/,'+$1 to Level of all Projectile Skills'],
  [/所有法术技能等级\s*\+?\s*(\d+)/,'+$1 to Level of all Spell Skills'],
  [/所有攻击技能等级\s*\+?\s*(\d+)/,'+$1 to Level of all Attack Skills'],
  [/弓类技能伤害提高\s*(\d+)%/,'$1% increased Damage with Bow Skills'],
  [/增加\s*(\d+)%\s*弓技能的傷害/,'$1% increased Damage with Bow Skills'],
  [/增加\s*(\d+)%\s*弓技能的伤害/,'$1% increased Damage with Bow Skills'],
  // Attack damage crit bonus
  [/增加\s*(\d+)%\s*攻擊傷害的暴擊傷害加成/,'$1% increased Critical Damage Bonus for Attack Damage'],
  [/增加\s*(\d+)%\s*攻击伤害的暴击伤害加成/,'$1% increased Critical Damage Bonus for Attack Damage'],
  [/投射物速度提高\s*(\d+)%/,'$1% increased Projectile Speed'],
  [/攻击速度提高\s*(\d+)%/,'$1% increased Attack Speed'],
  [/施法速度提高\s*(\d+)%/,'$1% increased Cast Speed'],
  [/物理伤害提高\s*(\d+)%/,'$1% increased Physical Damage'],
  [/附加\s*(\d+)\s*[-至]\s*(\d+)\s*冰霜伤害/,'Adds $1 to $2 Cold Damage'],
  [/附加\s*(\d+)\s*[-至]\s*(\d+)\s*物理伤害/,'Adds $1 to $2 Physical Damage'],
  [/附加\s*(\d+)\s*[-至]\s*(\d+)\s*火焰伤害/,'Adds $1 to $2 Fire Damage'],
  [/附加\s*(\d+)\s*[-至]\s*(\d+)\s*闪电伤害/,'Adds $1 to $2 Lightning Damage'],
  [/暴击几率\s*\+\s*([\d.]+)%/,'+$1% to Critical Hit Chance'],
  [/暴击伤害加成\s*\+?\s*(\d+)%/,'+$1% to Critical Damage Bonus'],
  [/暴擊傷害加成\s*\+?\s*(\d+)%/,'+$1% to Critical Damage Bonus'],
  [/\+\s*(\d+)%\s*的?\s*暴击伤害加成/,'+$1% to Critical Damage Bonus'],
  [/\+\s*(\d+)%\s*的?\s*暴擊傷害加成/,'+$1% to Critical Damage Bonus'],
  [/法术暴击伤害加成\s*\+?\s*(\d+)%/,'+$1% to Critical Spell Damage Bonus'],
  [/投射物射程降低\s*(\d+)%/,'$1% reduced Projectile Range'],
  [/攻击暴击率提高\s*(\d+)%/,'$1% increased Critical Hit Chance for Attacks'],
  [/(\d+)%.*溢出.*额外箭矢/,'+$1% Surpassing chance to fire an additional Arrow'],
  [/目标可以同时受到你造成的\s*\+?\s*(\d+)\s*个中毒效果影响/,'Targets can be affected by +$1 of your Poisons at the same time'],
  [/中毒持续时间降低\s*(\d+)%/,'$1% reduced Poison Duration'],
  [/中毒持續時間降低\s*(\d+)%/,'$1% reduced Poison Duration'],
  [/目標可以同時受到你造成的\s*\+?\s*(\d+)\s*個中毒效果影響/,'Targets can be affected by +$1 of your Poisons at the same time'],
  [/弓类攻击发射一支额外箭矢/,'Bow Attacks fire an additional Arrow'],
  [/发射一支额外箭矢/,'Fires an additional Arrow'],
  [/获得相当于伤害\s*(\d+)%\s*的所有元素额外伤害/,'Gain $1% of Damage as Extra Damage of all Elements'],
  [/获得相当于伤害\s*(\d+)%.*额外伤害/,'Gain $1% of Damage as Extra Elemental Damage'],
  [/额外投射物/,'Fires additional Projectile'],
  [/最大生命\s*\+?\s*(\d+)/,'+$1 to maximum Life'],
  [/命中值?\s*\+?\s*(\d+)/,'+$1 to Accuracy Rating'],
  [/(?:\+?\s*(\d+)\s*命中值)/,'+$1 to Accuracy Rating'],
  // Generic stat % increases
  [/閃避值提高\s*(\d+)%/,'$1% increased Evasion Rating'],
  [/能量護盾提高\s*(\d+)%/,'$1% increased Energy Shield'],
  [/能量护盾提高\s*(\d+)%/,'$1% increased Energy Shield'],
  [/闪避值提高\s*(\d+)%/,'$1% increased Evasion Rating'],
  [/护甲提高\s*(\d+)%/,'$1% increased Armour'], // CN: same chars as TC
  // TC stat increases
  [/增加\s*(\d+)%\s*物理傷害/,'$1% increased Physical Damage'],
  [/增加\s*(\d+)%\s*攻擊速度/,'$1% increased Attack Speed'],
  [/增加\s*(\d+)%\s*投射物速度/,'$1% increased Projectile Speed'],
  [/增加\s*(\d+)%\s*施法速度/,'$1% increased Cast Speed'],
  [/增加\s*(\d+)%\s*移動速度/,'$1% increased Movement Speed'],
  [/增加\s*(\d+)%\s*護甲/,'$1% increased Armour'],
  [/增加\s*(\d+)%\s*閃避值/,'$1% increased Evasion Rating'],
  [/增加\s*(\d+)%\s*能量護盾/,'$1% increased Energy Shield'],
  // Elemental resistances
  [/全部元素抗性\s*\+?\s*(\d+)%/,'+$1% to all Elemental Resistances'],
  // Gain extra damage (with element) — specific elements
  [/获得相当于伤害\s*(\d+)%\s*的额外火焰伤害/,'Gain $1% of Damage as Extra Fire Damage'],
  [/获得相当于伤害\s*(\d+)%\s*的额外冰冷伤害/,'Gain $1% of Damage as Extra Cold Damage'],
  [/获得相当于伤害\s*(\d+)%\s*的额外闪电伤害/,'Gain $1% of Damage as Extra Lightning Damage'],
  [/获得相当于伤害\s*(\d+)%\s*的额外冰霜伤害/,'Gain $1% of Damage as Extra Cold Damage'],
  [/获得相当于伤害\s*(\d+)%\s*的额外物理伤害/,'Gain $1% of Damage as Extra Physical Damage'],
  [/获得相当于伤害\s*(\d+)%\s*的额外混沌伤害/,'Gain $1% of Damage as Extra Chaos Damage'],
  [/获得一个能量球时[,，]\s*有\s*(\d+)%\s*的几率随机获得一个额外的能量球/,'$1% chance to gain an additional random Charge when you gain a Charge'],
  [/获得相当于伤害\s*(\d+)%\s*的额外(.+?)伤害/,'Gain $1% of Damage as Extra $2 Damage'],
  // CN attack elemental damage
  [/攻击技能的元素伤害提高\s*(\d+)%/,'$1% increased Elemental Damage with Attack Skills'],
  // TC version
  [/獲得相當於傷害\s*(\d+)%\s*的額外火焰傷害/,'Gain $1% of Damage as Extra Fire Damage'],
  [/獲得相當於傷害\s*(\d+)%\s*的額外冰冷傷害/,'Gain $1% of Damage as Extra Cold Damage'],
  [/獲得相當於傷害\s*(\d+)%\s*的額外閃電傷害/,'Gain $1% of Damage as Extra Lightning Damage'],
  [/獲得相當於傷害\s*(\d+)%\s*的額外物理傷害/,'Gain $1% of Damage as Extra Physical Damage'],
  [/獲得相當於傷害\s*(\d+)%\s*的額外混沌傷害/,'Gain $1% of Damage as Extra Chaos Damage'],
  [/獲得相當於傷害\s*(\d+)%\s*的額外(.+?)傷害/,'Gain $1% of Damage as Extra $2 Damage'],
  // Life on kill
  [/击杀敌人时回复\s*\+?\s*(\d+)\s*生命/,'+$1 Life gained on Kill'],
  [/擊殺敵人時回復\s*\+?\s*(\d+)\s*生命/,'+$1 Life gained on Kill'],
  // Mana/Life on kill (TC format)
  [/每個被擊殺的敵人，獲得\s*(\d+)\s*魔力/,'Gain $1 Mana per Enemy Killed'],
  [/每個被擊殺的敵人，獲得\s*(\d+)\s*生命/,'Gain $1 Life per Enemy Killed'],
  [/每个被击杀的敌人，获得\s*(\d+)\s*魔力/,'Gain $1 Mana per Enemy Killed'],
  [/每个被击杀的敌人，获得\s*(\d+)\s*生命/,'Gain $1 Life per Enemy Killed'],
  // Attack crit chance
  [/增加\s*(\d+)%\s*攻擊暴擊率/,'$1% increased Critical Hit Chance for Attacks'],
  [/增加\s*(\d+)%\s*攻击暴击率/,'$1% increased Critical Hit Chance for Attacks'],
  // Added cold/chaos damage
  [/附加\s*(\d+)\s*[-至]\s*(\d+)\s*冰冷伤害/,'Adds $1 to $2 Cold Damage'],
  [/附加\s*(\d+)\s*[-至]\s*(\d+)\s*混沌伤害/,'Adds $1 to $2 Chaos Damage'],
  // Mana
  // Attributes (CN + TC, with/without 點)
  [/\+\s*(\d+)\s*點?\s*力量/,'+$1 to Strength'],
  [/\+\s*(\d+)\s*點?\s*敏捷/,'+$1 to Dexterity'],
  [/\+\s*(\d+)\s*點?\s*智慧/,'+$1 to Intelligence'],
  [/\+\s*(\d+)\s*点?\s*力量/,'+$1 to Strength'],
  [/\+\s*(\d+)\s*点?\s*敏捷/,'+$1 to Dexterity'],
  [/\+\s*(\d+)\s*点?\s*智慧/,'+$1 to Intelligence'],
  // Attributes (CN + TC, suffix format)
  [/力量\s*\+?\s*(\d+)/,'+$1 to Strength'],
  [/敏捷\s*\+?\s*(\d+)/,'+$1 to Dexterity'],
  [/智慧\s*\+?\s*(\d+)/,'+$1 to Intelligence'],
  // Attributes (CN + TC, with measure word)
  [/(\d+)\s*點\s*力量/,'+$1 to Strength'],
  [/(\d+)\s*點\s*敏捷/,'+$1 to Dexterity'],
  [/(\d+)\s*點\s*智慧/,'+$1 to Intelligence'],
  // Mana & Life prefix/suffix (anchored to avoid matching 命定: +N)
  [/^\+\s*(\d+)\s*最大魔力/,'+$1 to maximum Mana'],
  [/^\+\s*(\d+)\s*最大生命/,'+$1 to maximum Life'],
  // Spirit
  [/\+\s*(\d+)\s*精魂/,'+$1 to Spirit'],
  [/精魂\s*\+?\s*(\d+)/,'+$1 to Spirit'],
  [/最大魔力\s*\+?\s*(\d+)/,'+$1 to maximum Mana'],
  // Leech patterns (with optional 以 prefix)
  [/以\s*(\d+(?:\.\d+)?)%\s*物理伤害偷取生命/,'Leeches $1% of Physical Damage as Life'],
  [/以\s*(\d+(?:\.\d+)?)%\s*物理傷害偷取生命/,'Leeches $1% of Physical Damage as Life'],
  [/以\s*(\d+(?:\.\d+)?)%\s*物理伤害偷取魔力/,'Leeches $1% of Physical Damage as Mana'],
  [/以\s*(\d+(?:\.\d+)?)%\s*物理傷害偷取魔力/,'Leeches $1% of Physical Damage as Mana'],
  [/以\s*(\d+(?:\.\d+)?)%\s*攻擊傷害偷取生命/,'Leeches $1% of Attack Damage as Life'],
  [/以\s*(\d+(?:\.\d+)?)%\s*攻擊傷害偷取魔力/,'Leeches $1% of Attack Damage as Mana'],
  // TC generic % increases for spell/elemental damage
  [/增加\s*(\d+)%\s*法術傷害/,'$1% increased Spell Damage'],
  [/增加\s*(\d+)%\s*法術暴擊率/,'$1% increased Critical Hit Chance for Spells'],
  [/增加\s*(\d+)%\s*法術暴擊傷害加成/,'$1% increased Critical Spell Damage Bonus'],
  [/增加\s*(\d+)%\s*暴擊傷害加成/,'$1% increased Critical Damage Bonus'],
  [/增加\s*(\d+)%\s*法术暴击伤害加成/,'$1% increased Critical Spell Damage Bonus'],
  [/增加\s*(\d+)%\s*暴击伤害加成/,'$1% increased Critical Damage Bonus'],
  [/增加\s*(\d+)%\s*闪电伤害/,'$1% increased Lightning Damage'],
  [/增加\s*(\d+)%\s*闪电暴击伤害加成/,'$1% increased Critical Lightning Damage Bonus'],
  [/增加\s*(\d+)%\s*暈眩累積/,'$1% increased Stun Buildup'],
  [/增加\s*(\d+)%\s*晕眩累积/,'$1% increased Stun Buildup'],
  [/增加\s*(\d+)%\s*閃電傷害/,'$1% increased Lightning Damage'],
  [/增加\s*(\d+)%\s*火焰傷害/,'$1% increased Fire Damage'],
  [/增加\s*(\d+)%\s*冰冷傷害/,'$1% increased Cold Damage'],
  [/增加\s*(\d+)%\s*混沌傷害/,'$1% increased Chaos Damage'],
  // Gain % damage as extra (all elements / specific)
  [/獲得相當於\s*(\d+)%\s*傷害的全元素額外傷害/,'Gain $1% of Damage as Extra Damage of all Elements'],
  [/获得相当于\s*(\d+)%\s*伤害的全元素额外伤害/,'Gain $1% of Damage as Extra Damage of all Elements'],
  // Weapon elemental damage (local)
  [/增加\s*(\d+)%\s*攻擊元素傷害/,'$1% increased Elemental Damage with Attacks'],
  [/增加\s*(\d+)%\s*攻击元素伤害/,'$1% increased Elemental Damage with Attacks'],
  // Weapon-specific stats
  [/增加\s*(\d+)%\s*此武器的投射物速度/,'$1% increased Projectile Speed with this Weapon'],
  [/增加\s*(\d+)%\s*此武器的投射物速度/,'$1% increased Projectile Speed with this Weapon'],
  [/此武器增加\s*(\d+)%\s*近戰打擊範圍/,'$1% increased Melee Strike Range with this Weapon'],
  [/此武器增加\s*(\d+)%\s*近战打击范围/,'$1% increased Melee Strike Range with this Weapon'],
  // Onslaught on kill (preClean converts ， → ,)
  [/以此武器擊中且為最後一擊時,有\s*(\d+)%\s*機率獲得猛攻/,'$1% chance to gain Onslaught on Killing Blow with this Weapon'],
  [/以此武器击中且为最后一击时,有\s*(\d+)%\s*几率获得猛攻/,'$1% chance to gain Onslaught on Killing Blow with this Weapon'],
  [/此武器进行造成最后一击时有\s*(\d+)%\s*的几率获得猛攻/,'$1% chance to gain Onslaught on Killing Blow with this Weapon'],
  // All melee skill gems
  [/全部近戰技能的等級\s*\+?\s*(\d+)/,'+$1 to Level of all Melee Skill Gems'],
  [/全部近战技能的等级\s*\+?\s*(\d+)/,'+$1 to Level of all Melee Skill Gems'],
  [/全部近戰技能寶石等級\s*\+?\s*(\d+)/,'+$1 to Level of all Melee Skill Gems'],
  [/全部近战技能宝石等级\s*\+?\s*(\d+)/,'+$1 to Level of all Melee Skill Gems'],
  // Rage
  [/\+\s*(\d+)\s*層?\s*最大盛怒/,'+$1 to Maximum Rage'],
  [/\+\s*(\d+)\s*层?\s*最大盛怒/,'+$1 to Maximum Rage'],
  // TC extra projectiles
  [/法術技能有\s*(\d+)%\s*機率發射額外\s*(\d+)\s*個投射物/,'Spell Skills have $1% chance to fire $2 additional Projectiles'],
  // TC all-element skill level
  [/全部閃電法術技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Lightning Spell Skills'],
  [/全部冰冷法術技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Cold Spell Skills'],
  [/全部火焰法術技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Fire Spell Skills'],
  [/全部混沌法術技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Chaos Spell Skills'],
  // CN all-element spell levels
  [/所有闪电法术技能等级\s*\+?\s*(\d+)/,'+$1 to Level of all Lightning Spell Skills'],
  [/所有冰霜法术技能等级\s*\+?\s*(\d+)/,'+$1 to Level of all Cold Spell Skills'],
  [/所有火焰法术技能等级\s*\+?\s*(\d+)/,'+$1 to Level of all Fire Spell Skills'],
  [/所有混沌法术技能等级\s*\+?\s*(\d+)/,'+$1 to Level of all Chaos Spell Skills'],
  // TC versions
  [/增加\s*(\d+)%\s*物理傷害/,'$1% increased Physical Damage'],
  [/增加\s*(\d+)%\s*攻擊速度/,'$1% increased Attack Speed'],
  [/增加\s*(\d+)%\s*投射物速度/,'$1% increased Projectile Speed'],
  [/附加\s*(\d+)\s*至\s*(\d+)\s*物理傷害/,'Adds $1 to $2 Physical Damage'],
  [/附加\s*(\d+)\s*至\s*(\d+)\s*火焰傷害/,'Adds $1 to $2 Fire Damage'],
  [/附加\s*(\d+)\s*至\s*(\d+)\s*冰冷傷害/,'Adds $1 to $2 Cold Damage'],
  [/附加\s*(\d+)\s*至\s*(\d+)\s*閃電傷害/,'Adds $1 to $2 Lightning Damage'],
  [/全部攻擊技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Attack Skills'],
  [/全部法術技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Spell Skills'],
  [/全部投射物技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Projectile Skills'],
  [/全部召喚生物技能等級\s*\+?\s*(\d+)/,'+$1 to Level of all Minion Skills'],
  [/暴擊率\s*\+?\s*([\d.]+)%/,'+$1% to Critical Hit Chance'],
  [/弓的攻擊\s*額外發射\s*(\d+)\s*支箭矢/,'Bow Attacks fire $1 additional Arrow'],
  [/賦予技能[:\s]*長矛投擲/,'Grants Skill: Spear Throw'],
  [/賦予技能[:\s]*戰矛飛擲/,'Grants Skill: Spear Throw'],
  [/獲得技能[:\s]*長矛投擲/,'Grants Skill: Spear Throw'],
  [/獲得技能[:\s]*戰矛飛擲/,'Grants Skill: Spear Throw'],
  // Passive allocation enchant (translated in post-processing)
  [/配置\s*(.+)/,'Allocates $1'],
  // Generic skill grant (skill name translated in post-processing)
  [/賦予技能[:\s]*(.+)/,'Grants Skill: $1'],
  [/获得技能[:\s]*(.+)/,'Grants Skill: $1'],
  // TC Bonded: Elemental Infusion & Archon
  [/拾取元素灌注時[,，]\s*有\s*(\d+)%\s*機率獲得額外一個同類型的元素灌注/,'$1% chance when collecting an Elemental Infusion to gain an additional Elemental Infusion of the same type'],
  [/統治者增益效果恢復期加快\s*(\d+)%/,'$1% increased Cooldown Recovery Rate of Archon'],
  [/执政官间隔期的消减速度加快\s*(\d+)%/,'$1% increased Cooldown Recovery Rate of Archon'],
  [/獲得相當於傷害\s*(\d+)%\s*的額外(\S+)傷害/,'Gain $1% of Damage as Extra $2 Damage'],
  [/減少\s*(\d+)%\s*投射物範圍/,'$1% reduced Projectile Range'],
  [/命定:\s*\+(\d+)%\s*最大(\S+)抗性/,'+$1% to Maximum $2 Resistance'],
  [/命定:\s*\+(\d+)\s*最大生命/,'+$1 to maximum Life'],
  [/命定:\s*\+(\d+)\s*最大魔力/,'+$1 to maximum Mana'],
  [/命定:\s*增加\s*(\d+)%\s*投射物速度/,'$1% increased Projectile Speed'],
  [/命定:\s*增加\s*(\d+)%\s*冷卻時間恢復率/,'$1% increased Cooldown Recovery Rate'],
  [/命定:\s*增加\s*(\d+)%\s*冷却时间恢复率/,'$1% increased Cooldown Recovery Rate'],
  [/命定:\s*獲得相當於傷害\s*(\d+)%\s*的額外(\S+)傷害/,'Gain $1% of Damage as Extra $2 Damage'],
  [/命定:\s*增加\s*(\d+)%\s*完全破甲的效果/,'$1% increased effect of Fully Broken Armour'],
  [/护甲完全破损效果提高\s*(\d+)%/,'$1% increased effect of Fully Broken Armour'],
  [/收集元素灌注时有\s*(\d+)%\s*的几率额外获得一个同类型的元素灌注/,'$1% chance when collecting an Elemental Infusion to gain an additional Elemental Infusion of the same type'],
  [/收集元素灌注時有\s*(\d+)%\s*的機率額外獲得一個同類型的元素灌注/,'$1% chance when collecting an Elemental Infusion to gain an additional Elemental Infusion of the same type'],
  [/执政官间隔期的消减速度加快\s*(\d+)%/,'$1% increased Cooldown Recovery Rate of Archon'],
  [/命定:\s*(.+)/,'$1'],
  [/羁绊:\s*(.+)/,'$1'],
  [/(\d+)%\s*滿溢機率發射額外.*箭矢/,'+$1% Surpassing chance to fire an additional Arrow'],
];

function lookupSkill(name: string): string|null {
  for (const [, v] of Object.entries(GEM_DB)) { if (v.cn === name || v.tw === name) return v.en; }
  for (const [, v] of Object.entries(SUP_GEM_DB)) { if (v.cn === name || v.tw === name) return v.en; }
  return null;
}

function translateLine(line: string): TransResult {
  const raw = line.trim(); if (!raw||raw.length<2) return {line:raw,en:'',confidence:'low'};
  let clean = preClean(raw); const db = CN2EN; const otherDb = TW2EN;
  const isRune = /\(rune\)/i.test(raw);
  const isFractured = /\(fractured\)/i.test(raw);
  const isEnchant = /\(enchant\)/i.test(raw);
  // Handle 命定:/Bonded prefix — strip, translate content, re-add at end
  let isBonded = false;
  if (/^(?:命定|羁绊|羈絆)[:\s]/.test(clean)) {
    isBonded = true;
    clean = clean.replace(/^(?:命定|羁绊|羈絆)[:\s]*/,'');
  }
  let stripped = clean.replace(/\s*\((implicit|enchant|rune|desecrated|crafted|fractured|augmented)\)/gi,'').trim();
  const strippedNoPlus = stripped.replace(/^\+/,'');
  const nums = stripped.match(/\d+(?:\.\d+)?/g)||[];

  // === Headers ===
  if (/^稀有度[:\s]/.test(clean)){const r=clean.includes('传奇')?'Rarity: UNIQUE':clean.includes('稀有')?'Rarity: RARE':clean.includes('魔法')?'Rarity: MAGIC':'Rarity: NORMAL';return{line:raw,en:r,confidence:'high',matched:'header'};}
  if (/^(?:物品等级|物品等級|Item Level)[:\s]/i.test(clean)){const m=clean.match(/(\d+)/);if(m)return{line:raw,en:'Item Level: '+m[1],confidence:'high',matched:'header'};}
  if (/^(?:品质|品質|Quality)[:\s]/i.test(clean)){const m=clean.match(/(\d+)%/);return{line:raw,en:m?'Quality: +'+m[1]+'%':'Quality: +20%',confidence:'high',matched:'header'};}
  if (/^(?:插槽|Sockets?)[:\s]/i.test(clean))return{line:raw,en:'Sockets: '+clean.replace(/插槽[:\s]*/,'').replace(/\s/g,' ').trim()||'S',confidence:'high',matched:'header'};
  if (/^(?:需求|需要|Requires?)[:\s]/i.test(clean)){const lv=clean.match(/[等級级]\s*(\d+)/)||clean.match(/Level\s*(\d+)/i);const am:Record<string,string>={'敏捷':'Dex','力量':'Str','智慧':'Int','Dexterity':'Dex','Strength':'Str','Intelligence':'Int'};let e='Requires Level '+(lv?lv[1]:'');for(const a of clean.matchAll(/(\d+)\s*(敏捷|力量|智慧|Dexterity|Strength|Intelligence)/g)){e+=', '+a[1]+' '+(am[a[2]]||a[2]);}return{line:raw,en:e,confidence:'high',matched:'header'};}
  // Modifier lines that look like headers but aren't
  if (/^(?:已汙染|已污染|已腐[化蝕]|破裂之物|已複製|已复制|分裂之物|聖化的|圣化的|Sanctified)/.test(clean))return{line:raw,en:'Corrupted',confidence:'high',matched:'header'};
  if (/^(?:備註|备注)/.test(clean)){const m=clean.match(/(?:備註|备注)[:\s]*(.+)/);if(m)return{line:raw,en:m[1],confidence:'high',matched:'header'};}
  // Stats headers (damage/defense lines) — CN + TC
  const dm=clean.match(/^(?:物理|闪电|火焰|冰霜|混沌|閃電|冰冷)(?:伤害|傷害)[:\s]*(\d+)[-\s到至]*(\d+)/);
  if(dm){const t:Record<string,string>={'物理':'Physical Damage','闪电':'Lightning Damage','火焰':'Fire Damage','冰霜':'Cold Damage','混沌':'Chaos Damage','閃電':'Lightning Damage','冰冷':'Cold Damage'};return{line:raw,en:t[dm[1]]+': '+dm[2]+'-'+dm[3],confidence:'high',matched:'header'};}
  if (/^(?:能量护盾|能量護盾|闪避值|閃避值|护甲值|護甲值|护甲|護甲)[:\s]/.test(clean)){const v=clean.match(/(\d+)/);const l=/^(?:能量护盾|能量護盾)/.test(clean)?'Energy Shield':/^(?:闪避值|閃避值)/.test(clean)?'Evasion Rating':'Armour';if(v)return{line:raw,en:l+': '+v[1],confidence:'high',matched:'header'};}
  if (/^(?:暴击率|暴擊率)[:\s]/.test(clean)){const c=clean.match(/([\d.]+)%/);if(c)return{line:raw,en:'Critical Hit Chance: '+c[1]+'%',confidence:'high',matched:'header'};}
  if (/^(?:每秒攻击次数|每秒攻擊次數)/.test(clean)){const a=clean.match(/([\d.]+)/);if(a)return{line:raw,en:'Attacks per Second: '+a[1],confidence:'high',matched:'header'};}
  // Complex elemental damage header: 元素傷害: X 到 Y (fire), X 到 Y (lightning)
  if (/^元素[伤害傷][:\s]/.test(clean)){
    const parts:string[]=[];
    const elemMap:Record<string,string>={fire:'Fire Damage',lightning:'Lightning Damage',cold:'Cold Damage'};
    for(const em of clean.matchAll(/(\d+)\s*(?:到|至)\s*(\d+)\s*\((\w+)\)/g)){
      const en=elemMap[em[3]]||em[3];
      parts.push(en+': '+em[1]+'-'+em[2]);
    }
    if(parts.length>0)return{line:raw,en:parts.join('\n'),confidence:'high',matched:'header'};
  }
  // Flavor text and unparseable lines
  if (/悉妮蔻拉|辛妮蔻拉|辛尼寇拉|Sinicora/i.test(clean))return{line:raw,en:'',confidence:'low'};

  // === Base type ===
  if(clean.length>=2&&!/[:：\d]/.test(clean)&&!/稀有|魔法|普通|传奇|物品|需求|已腐|只能|分裂/.test(clean)){
    const bt=BASE_TYPES[clean]||POE2_CN_BASE[clean]||POE2_TW_BASE[clean];if(bt)return{line:raw,en:bt,confidence:'high',matched:'baseType',isRune};
  }

  // === FIXES ===
  for(const[re,tpl]of FIXES){const m=stripped.match(re);if(m){let r=tpl;for(let i=1;i<m.length;i++)r=r.replace('$'+i,m[i]);
    // Translate skill name in Grants Skill: patterns
    if(r.includes('Grants Skill:')){
      let txt=r.replace('{tags:attack}','').replace(/^Grants Skill:\s*/,'');
      // Extract optional level: 等級 N / 等级 N → Level N
      let lv='';
      txt=txt.replace(/(?:等級|等级)\s*(\d+)/,(_,n)=>{lv='Level '+n;return '';}).trim();
      // Lookup the skill name in gem database
      const en=lookupSkill(txt);
      if(en)r='Grants Skill: '+(lv?lv+' ':'')+en;
      else r='Grants Skill: '+(lv?lv+' ':'')+txt;
      if(r.includes('{tags:attack}'))r=r.replace('{tags:attack}','');
    }
    // Translate passive name in Allocates patterns
    if(r.startsWith('Allocates ')){
      const name=r.replace('Allocates ','');
      const en=lookupPassive(name);
      if(en)r='Allocates '+en.replace(/_/g,' ');
    }
    if(isBonded)r='Bonded: '+r;if(isEnchant)r='{enchant}'+r;if(isRune)r='{enchant}{rune}'+r;if(isFractured)r='{fractured}'+r;return{line:raw,en:r,confidence:'high',matched:'direct',isRune,isFractured,isEnchant};}}

  // === PoeCharm + PoE2 Mod DB ===
  const tryVariants = (s: string): string|null => {
    const variants = applySynonyms(s);
    for (const v of variants) {
      // Exact match — PoE2 first, then PoeCharm (both languages)
      let e = POE2_CN2EN[v] || POE2_TW2EN[v] || db[v] || otherDb[v]; if (e) return e;
      if (nums.length > 0) {
        // Standard placeholder
        let p = v;
        nums.forEach((n, i) => { p = p.replace(n, '{' + i + '}') });
        let m = POE2_CN2EN[p] || POE2_TW2EN[p] || db[p] || otherDb[p];
        if (m) { let r = m; nums.forEach((n, i) => { r = r.replace('{' + i + '}', n) }); return r; }
        // Reverse: numbers to front
        let q = v.replace(/[+-]?\d+(?:\.\d+)?%?/g, '').replace(/\s+/g, ' ').trim();
        if (q.length > 1) {
          const rev = nums.length === 1 ? `{0} ${q}`.replace(/\s+/g, ' ').trim() : null;
          if (rev) { m = POE2_CN2EN[rev] || POE2_TW2EN[rev] || db[rev] || otherDb[rev]; if (m) { let r = m; nums.forEach((n, i) => { r = r.replace('{' + i + '}', n) }); return r; } }
          if (/%/.test(v)) {
            const revPct = nums.length === 1 ? `{0}% ${q}`.replace(/\s+/g, ' ').trim() : null;
            if (revPct) { m = POE2_CN2EN[revPct] || POE2_TW2EN[revPct] || db[revPct] || otherDb[revPct]; if (m) { let r = m; nums.forEach((n, i) => { r = r.replace('{' + i + '}', n) }); return r; } }
          }
        }
      }
    }
    return null;
  };
  for (const c of [stripped, clean, raw]) {
    let r = tryVariants(c);
    if (r) {
      if (/^\+/.test(raw) && !/^\+/.test(r)) r = '+' + r;
      if (isBonded) r = 'Bonded: ' + r;
      if (isEnchant) r = '{enchant}' + r;
      if (isRune) r = '{enchant}{rune}' + r;
      if (isFractured) r = '{fractured}' + r;
      return { line: raw, en: r, confidence: 'high', matched: 'PoeCharm', isRune, isFractured, isEnchant };
    }
  }

  return{line:raw,en:'',confidence:'low'};
}

export default function ItemTranslator() {
  const [input,setInput]=useState('');
  const {copied,copy}=useCopy();
  const results=useMemo(()=>{
    if(!input.trim())return[];
    const rawLines=input.split('\n');
    // Collect configured passive names to filter out their descriptions
    const passiveNames=new Set<string>();
    for(const l of rawLines){
      const m=l.trim().match(/^配置\s+(.+?)(?:\s*\(enchant\))?$/);
      if(m) passiveNames.add(preClean(m[1]));
    }
    // Pre-process: join split Bonded lines & filter passive descriptions
    const lines:string[]=[];
    for(let i=0;i<rawLines.length;i++){
      let line=rawLines[i];
      // Skip passive description lines (passive name followed by its stats at end of item)
      const trimmed=line.trim();
      if(passiveNames.has(trimmed)){
        // This line is a passive name that was configured — skip it and everything after
        break;
      }
      // If this line starts with 羁绊/命定 and next line looks like a continuation
      if(/^(?:羁绊|命定|羈絆)[：:\s]/.test(trimmed)){
        const next=i+1<rawLines.length?rawLines[i+1].trim():'';
        if(next&&!/^[-]{2,}/.test(next)&&!/^(?:羁绊|命定|羈絆|稀有|品质|物品|需求|插槽|已|備註|备注|Rarity|Item|Quality|Require|Socket|配置|賦予|获得|增加|附加|所有|全部|\+)/i.test(next)){
          line=line.trim()+' '+next;
          i++;
        }
      }
      lines.push(line);
    }
    return lines.map(l=>translateLine(l));
  },[input]);
  const enOutput=useMemo(()=>{
    const implicits:string[]=[],enchants:string[]=[],explicits:string[]=[],headers:string[]=[];
    for(const r of results){
      if(!r.en)continue;
      if(r.matched==='separator')continue;
      if(/^(Rarity|Item Class):/.test(r.en))continue;
      if(r.matched==='baseType'||r.matched==='header'){
        if(/^(Item Level|Sockets|Quality|LevelReq|Armour|Evasion|Energy Shield|Physical Damage|Lightning Damage|Fire Damage|Cold Damage|Chaos Damage|Attacks per Second|Critical Strike Chance)/.test(r.en)) headers.push(r.en);
        continue;
      }
      if(r.isEnchant||/\(enchant\)/i.test(r.line))enchants.push(r.en);
      else if(/\(implicit\)/i.test(r.line)||r.isRune||/^Grants Skill/.test(r.en))implicits.push(r.en);
      else explicits.push(r.en);
    }
    const out=['Custom Item'];
    const bt=results.find(r=>r.matched==='baseType');if(bt)out.push(bt.en);
    out.push(...headers);
    if(implicits.length){out.push('Implicits: '+implicits.length);out.push(...implicits);}
    if(enchants.length){out.push(...enchants);}
    out.push(...explicits);
    return out.join('\n');
  },[results]);
  const stats=useMemo(()=>({total:results.length,ok:results.filter(r=>r.confidence!=='low'&&r.en).length,fail:results.filter(r=>!r.en&&r.line).length}),[results]);

  return(<div className="space-y-6">
    <div><h1 className="text-xl font-bold text-poe-gold-light">装备翻译 → PoB</h1><p className="text-xs text-poe-muted mt-1">粘贴中文装备 Ctrl+C 文本，输出 PoB 可导入英文格式</p></div>
    <p className="text-xs text-poe-gold/70">支持简体/繁体装备文本，自动识别转换</p>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-3"><p className="text-xs text-poe-muted">中文输入</p><textarea className="w-full h-96 text-sm font-mono bg-poe-dark/80 border border-poe-border rounded-lg p-4 text-poe-text placeholder:text-poe-muted/60 focus:outline-none focus:ring-2 focus:ring-poe-gold/30 resize-y" placeholder="Ctrl+C 复制装备文本后粘贴在这里..." value={input} onChange={e=>setInput(e.target.value)} spellCheck={false}/>
        {results.length>0&&<div className="flex items-center gap-3 text-[10px]"><span className="text-poe-muted">共 {stats.total} 行</span><span className="text-poe-green">✓ {stats.ok}</span>{stats.fail>0&&<span className="text-poe-red">✗ {stats.fail}</span>}</div>}
      </div>
      <div className="space-y-3"><div className="flex items-center justify-between"><p className="text-xs text-poe-muted">PoB 输出</p>{enOutput&&<button onClick={()=>copy(enOutput)} className="text-xs px-3 py-1 rounded bg-poe-gold/10 border border-poe-gold/30 text-poe-gold-light hover:bg-poe-gold/20">{copied?'已复制':'一键复制'}</button>}</div>
        {enOutput?<pre className="w-full min-h-[200px] text-sm font-mono bg-poe-dark/80 border border-poe-border rounded-lg p-4 text-poe-green whitespace-pre-wrap overflow-x-auto">{enOutput}</pre>:<div className="w-full h-96 border border-dashed border-poe-border/50 rounded-lg flex items-center justify-center text-poe-muted text-sm">翻译结果显示在这里</div>}
        {results.length>0&&<details className="text-xs"><summary className="text-poe-muted cursor-pointer hover:text-poe-text py-1">逐行对照</summary><div className="mt-2 space-y-1 max-h-80 overflow-y-auto">{results.map((r,i)=>(<div key={i} className={`flex items-start gap-2 py-1 border-b border-poe-border/30 ${r.confidence==='low'&&!r.en?'opacity-40':''}`}><span className={`w-5 text-center shrink-0 ${r.confidence==='high'?'text-poe-green':r.confidence==='mid'?'text-poe-yellow':'text-poe-red'}`}>{r.confidence==='high'?'✓':r.confidence==='mid'?'~':'✗'}</span><span className="text-poe-muted w-48 truncate">{r.line}</span><span className="text-poe-text flex-1 break-all">{r.en||'(未识别)'}</span></div>))}</div></details>}
      </div>
    </div>
  </div>);
}

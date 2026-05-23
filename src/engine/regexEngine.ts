/**
 * 输出格式: "term1|term2|term3" (双引号, | = OR, 空格 = AND)
 *
 * Copyright (c) 2025 流放工坊 | cnpoe.com
 * 核心逻辑参考 poe2.re 开源项目，中文适配部分为独立开发。
 */
import { getAllItemMods, getModById, getCategoryGroups, waystoneMods, tabletPrefixes, tabletSuffixes, properties, rarities, itemClasses, moveSpeeds, ilvlRegex, ALL_MODS_TC } from '../data/affixesData';

export type LangMode = 'en' | 'cn' | 'tc';
export type LogicMode = 'or' | 'and';
const FLAT_IDS = ['flat_phys','flat_fire','flat_cold','flat_light','flat_chaos'];

/** 简体→繁体: 字符转换 + 关键词语修正 + 关键词宽松匹配 */
const SC2TC_CHAR: Record<string,string> = {'护':'護','闪':'閃','伤':'傷','击':'擊','头':'頭','链':'鍊','带':'帶','宝':'寶','权':'權','长':'長','战':'戰','单':'單','双':'雙','锤':'錘','斗':'鬥','电':'電','晕':'暈','阈':'閾','环':'環','诅':'詛','却':'卻','剂':'劑','唤':'喚','类':'類','术':'術','动':'動','点':'點','缓':'緩','积':'積','冻':'凍','额':'額','缀':'綴','质':'質','级':'級','围':'圍','门':'門'};
const SC2TC_WORD: [RegExp,string][] = [
  [/提高/g,'增加'], [/降低/g,'减少'], [/扩大/g,'增加'], [/缩短/g,'减少'],
  [/冰霜/g,'冰冷'], [/阈值/g,'門檻'], [/积蓄/g,'累積'], [/几率/g,'機率'],
  [/施法速度/g,'施放速度'], [/每秒生命再生/g,'每秒生命回復'], [/每秒生命回复/g,'每秒生命回復'],
  [/魔力再生率/g,'魔力回復率'], [/所有元素抗性/g,'全元素抗性'],
  [/击中导致流血/g,'在擊中時引起流血'], [/击中导致中毒/g,'在擊中時造成中毒'],
  [/具有护甲/g,'為裝甲的'], [/具有闪避/g,'為閃避的'],
  [/生命总增/g,'更多怪物生命'], [/回复总降/g,'更少生命和能量護盾恢復率'],
  [/冷却回复总降/g,'更少冷卻時間恢復速度'], [/暴伤降低/g,'遭暴擊時減少承受的額外傷害'],
  [/周期性受到/g,'正在持續被'], [/所有/g,'全部'], [/绝望深渊/g,'無盡深淵'],
  [/属性需求/g,'能力值需求'], [/每击败一名敌人/g,'每個被擊殺的敵人'],
  [/每击中一名敌人/g,'每擊中一名敵人'], [/该装备的/g,'.{0,6}'],
  [/每秒/g,'每秒'], [/照亮范围/g,'照亮範圍'],
];
/**
 * TC 模式: 字符转换 + 词汇替换 → 关键词宽松匹配
 * 策略: 用 .{0,6} 替代固定词组, 容忍 TC 语序差异
 */
function toTC(s: string): string {
  let r = s.split('').map(c => SC2TC_CHAR[c] || c).join('');
  for (const [re, tc] of SC2TC_WORD) r = r.replace(re, tc);
  // 将连续的汉字之间的 .* 替换为更宽松的 .{0,10}
  r = r.replace(/\.\*/g, '.{0,10}');
  return r;
}

export interface BuildInput {
  lang: LangMode;
  logic: LogicMode;
  highlight: boolean;
  classIds: string[];
  rarities: string[];
  hasQuality: boolean;
  hasSockets: boolean;
  ilvlMin: number; ilvlMax: number;
  moveSpeed: number;
  resistances: string[];
  modIds: string[];
  mapModIds: string[];
  flatDmgMin: number;
  tierMin: number;
  tierMax: number;
  customText: string;
}

export function defaultInput(): BuildInput {
  return { lang: 'cn', logic: 'or', highlight: true, classIds: [], rarities: [], hasQuality: false, hasSockets: false, ilvlMin: 0, ilvlMax: 0, moveSpeed: 0, resistances: [], modIds: [], mapModIds: [], flatDmgMin: 0, tierMin: 0, tierMax: 0, customText: '' };
}

// ========================
export function buildRegex(input: Partial<BuildInput>): { regex: string; shortRegex: string; explanation: string[]; length: number } {
  const i = { ...defaultInput(), ...input };
  const cn = i.lang === 'cn' || i.lang === 'tc';
  const tc = i.lang === 'tc';
  const T = (s: string) => tc ? toTC(s) : s;
  const terms: string[] = [];

  // Quality / Sockets — TC 模式用 ALL_MODS_TC 查表
  if (i.hasQuality) { terms.push(tc ? (ALL_MODS_TC['quality']||'品質') : cn ? '品质.*[0-9]' : 'y: \\+'); }
  if (i.hasSockets) { terms.push(tc ? (ALL_MODS_TC['sockets']||'插槽') : cn ? '插槽' : 'ts: S'); }

  // Rarities
  if (i.rarities.length > 0 && i.rarities.length < 3) {
    if (tc) {
      terms.push(i.rarities.map(id => ALL_MODS_TC[id] || rarities.find(r => r.id === id)?.cn || "").filter(Boolean).join("|"));
    } else if (cn) {
      terms.push(i.rarities.map(id => rarities.find(r => r.id === id)?.cn || '').filter(Boolean).join('|'));
    } else {
      const enTerms = i.rarities.map(id => rarities.find(r => r.id === id)?.en || '').filter(Boolean);
      if (enTerms.length === 1) terms.push(enTerms[0]);
      else if (enTerms.length > 1) terms.push(`y: (${enTerms.map(t => t.replace('y: ', '')).join('|')})`);
    }
  }

  // Resistances
  const resIds = ['fireRes','coldRes','lightRes','chaosRes','allRes'];
  const activeRes = i.resistances || [];
  if (activeRes.length > 0) {
    if (tc) {
      const cnTerms = activeRes.map(id => getModById(id)?.tc || ALL_MODS_TC[id] || getModById(id)?.cn || '').filter(Boolean);
      terms.push(cnTerms.join('|'));
    } else if (cn) {
      const cnTerms = activeRes.map(id => getModById(id)?.cn || '').filter(Boolean);
      terms.push(activeRes.length >= 4 ? '(火焰|冰霜|闪电|混沌)抗性 \\+\\d+%' : cnTerms.join('|'));
    } else {
      if (activeRes.length >= 4) { terms.push('resi'); }
      else {
        const enTerms = activeRes.map(id => getModById(id)?.en || '').filter(Boolean);
        if (enTerms.length === 1) terms.push(enTerms[0]);
        else { const pfx = activeRes.map(r => r.slice(0, 2)).join('|'); terms.push(`(${pfx}).+res`); }
      }
    }
  }

  // MoveSpeed — threshold (≥ value)
  if (i.moveSpeed > 0) {
    const ms = moveSpeeds.find(m => m.value === i.moveSpeed);
    if (ms) terms.push(tc ? (ALL_MODS_TC["moveSpeed"] || ms.cn) : cn ? ms.cn : ms.en);
  }

  // Item mods (non-resistance) + 石板前缀
  for (const modId of i.modIds) {
    if (resIds.includes(modId)) continue;
    const mod = getModById(modId);
    if (mod) {
      const base = tc ? (mod.tc || ALL_MODS_TC[modId] || mod.cn) : cn ? mod.cn : mod.en;
      if (i.flatDmgMin > 0 && FLAT_IDS.includes(modId)) {
        const numRx = buildNumAtLeast(i.flatDmgMin);
        terms.push(base.replace('.*', `.*${numRx}.*`));
      } else {
        terms.push(base);
      }
    } else {
      // 查石板前缀
      const tp = tabletPrefixes.find(t => t.id === modId);
      if (tp) terms.push(cn ? tp.cnRegex : tp.enRegex);
    }
  }

  // Item classes
  if (i.classIds.length > 0) {
    if (tc) {
      const texts = i.classIds.map(id => itemClasses.find(c => c.id === id)?.cnText || '').filter(Boolean);
      if (texts.length > 0) terms.push(texts.join('|'));
    } else if (cn) {
      const texts = i.classIds.map(id => itemClasses.find(c => c.id === id)?.cnText || '').filter(Boolean);
      if (texts.length > 0) terms.push(texts.join('|'));
    } else {
      const abbrs = i.classIds.map(id => itemClasses.find(c => c.id === id)?.enAbbr || '').filter(Boolean);
      if (abbrs.length === 1) terms.push(`s: ${abbrs[0]}`);
      else if (abbrs.length > 1) terms.push(`s: (${abbrs.join('|')})`);
    }
  }

  // ItemLevel
  const il = ilvlRegex(i.ilvlMin, i.ilvlMax, i.lang);
  if (il.regex) terms.push(il.regex);

  // Waystone tier filter — poe2re 格式: r [3-9]\)|1[0-5]\) 对应 3-15
  if (i.tierMin > 0 || i.tierMax > 0) {
    const tMin = i.tierMin || 1;
    const tMax = i.tierMax || 16;
    const tr = tierRangeRegex(tMin, Math.min(tMax, 16));
    if (tr !== '\\d+') {
      // CN: 用（前缀防止 "15" 中 "5" 被误匹配
      terms.push(cn ? `（${tr} 阶` : `r ${tr}\\)`);
    }
  }

  // Waystone / Tablet suffix mods
  for (const mid of i.mapModIds) {
    const wm = waystoneMods.find(m => m.id === mid);
    if (wm) { terms.push(cn ? wm.cnRegex : wm.enRegex); continue; }
    // 查石板后缀(遍历所有石板类型)
    for (const t of Object.values(tabletSuffixes)) {
      const ts = t.find(s => s.id === mid);
      if (ts) { terms.push(cn ? ts.cnRegex : ts.enRegex); break; }
    }
  }

  // Custom
  if (i.customText.trim()) terms.push(i.customText.trim());

  // 繁体转换
  const termsFinal = terms;

  // Assemble
  const sep = i.logic === 'and' ? '" "' : '|';
  let full = '', short = '';
  if (termsFinal.length > 0) {
    if (i.highlight) {
      full = `"${termsFinal.join(sep)}"`;
    } else {
      // 排除: !a !b = NOT(a) AND NOT(b) = 排除包含任一选中词缀的物品
      // PoE2 不支持 !"..." 格式, 统一用空格分隔
      full = termsFinal.map(t => `!${t}`).join(' ');
    }
  }
  const shortTerms = compress(termsFinal, i);
  if (shortTerms.length > 0) {
    if (i.highlight) {
      short = `"${shortTerms.join(sep)}"`;
    } else {
      short = shortTerms.map(t => `!${t}`).join(' ');
    }
  }
  const explanation = explain(terms, i, il.explain);

  return { regex: full, shortRegex: short.length <= full.length ? short : full, explanation, length: full.length };
}

function compress(terms: string[], input: Partial<BuildInput>): string[] {
  const isAnd = input.logic === 'and';
  const wSep = isAnd ? ' ' : '|';
  const joined = terms.join(wSep);
  // 250字符限制, 绝大多数情况不需要压缩
  if (isAnd ? joined.length <= 248 : `"${joined}"`.length <= 248) return terms;
  const cn = input.lang === 'cn' || input.lang === 'tc';
  const p: string[][] = [[],[],[],[],[],[]];
  for (const t of terms) {
    if (cn && /^(靴子|手套|弓|弩|项链|戒指|腰带|胸甲|头盔|法杖|权杖|盾牌|法器)/.test(t)) p[0].push(t);
    else if (!cn && t.startsWith('s: ')) p[0].push(t);
    else if (t.includes('移动速度') || t.includes('i.+mov')) p[1].push(t);
    else if (t.includes('生命') || t.includes('life') || t.includes('抗性') || t.includes('.+res')) p[2].push(t);
    else if (t.includes('物品等级') || t.includes('m level:')) p[4].push(t);
    else if (t.includes('品质') || t === 'y: \\+' || t.includes('插槽')) p[5].push(t);
    else p[3].push(t);
  }
  const result = [...p[0], ...p[1], ...p[2], ...p[3], ...p[4], ...p[5]];
  const rj = result.join(wSep);
  return (isAnd ? rj.length : `"${rj}"`.length) <= 248 ? result : [...p[0], ...p[1], ...p[2], ...p[3].slice(0, 8), ...p[4], ...p[5]];
}

function explain(terms: string[], input: Partial<BuildInput>, ilvlExplain: string): string[] {
  const cn = input.lang === 'cn' || input.lang === 'tc';
  const lines: string[] = [];
  for (const t of terms) {
    const mod = getAllItemMods().find(m => cn ? m.cn === t : m.en === t);
    if (mod) {
      const extra = (input.flatDmgMin && FLAT_IDS.includes(mod.id)) ? ` ≥ ${input.flatDmgMin}` : '';
      lines.push(`${mod.label}${extra}`);
      continue;
    }
    const wm = waystoneMods.find(m => cn ? m.cnRegex === t : m.enRegex === t);
    if (wm) { lines.push(`引路石${wm.affix==='prefix'?'前缀':'后缀'}: ${wm.label}`); continue; }
    if (t.includes('移动速度')) {
      const ms = moveSpeeds.find(m => m.value === (input.moveSpeed || 0));
      lines.push(`移动速度 —≥${ms?.label || input.moveSpeed + '%'} 移速词缀`);
    }
    else if (t.includes('品质')) lines.push('品质 (Quality)');
    else if (t.includes('插槽')) lines.push('插槽 (Sockets)');
    else if (t.includes('物品等级') || t.includes('m level:')) lines.push(ilvlExplain || '物品等级筛选');
    else if (cn && /^(靴子|手套|弓|弩|项链|戒指|腰带|胸甲|头盔|法杖|权杖|盾牌|法器|长杖|单手锤|双手锤|战斗杖|箭袋|珠宝|地图石|药剂)/.test(t)) lines.push(`物品基底: ${t}`);
    else if (t.startsWith('s: ')) lines.push(`物品基底(Class): ${t}`);
    else lines.push(`表达式: ${t}`);
  }
  return lines;
}

/** 生成 ≥N 的数字正则片段 */
/** 地图阶级范围 regex (poe2re 格式: r [3-9]\)|1[0-5]\) 对应 tier 3-15) */
function tierRangeRegex(min: number, max: number): string {
  if (min <= 1 && max >= 16) return '\\d+';
  const max16 = Math.min(max, 16);
  const parts: string[] = [];
  // 单位数: 1-9
  if (min <= 9) {
    const end = Math.min(max16, 9);
    parts.push(`[${min}-${end}]`);
  }
  // 双位数: 10-16
  if (max16 >= 10 && min <= 16) {
    const start = Math.max(min, 10);
    if (start === 10 && max16 === 16) {
      parts.push('1[0-6]');
    } else if (start === max16) {
      parts.push(`1${start - 10}`);
    } else {
      parts.push(`1[${start - 10}-${max16 - 10}]`);
    }
  }
  return parts.length === 1 ? parts[0] : `(${parts.join('|')})`;
}

function buildNumAtLeast(n: number): string {
  if (n >= 100) return '\\d{3,}';
  if (n >= 10) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    if (ones === 0) return `([${tens}-9]\\d|\\d{3,})`;
    return `(${tens}[${ones}-9]|[${tens + 1}-9]\\d|\\d{3,})`;
  }
  return `([${n}-9]|\\d{2,})`;
}

export function getLengthColor(len: number): 'green' | 'yellow' | 'red' {
  if (len === 0 || len <= 200) return 'green';
  if (len <= 250) return 'yellow';
  return 'red';
}
export function getLengthLabel(len: number): string {
  if (len === 0) return '';
  if (len <= 200) return '安全';
  if (len <= 250) return '接近上限';
  return '超出限制!';
}

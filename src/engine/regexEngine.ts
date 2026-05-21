/**
 * 流放工坊 — 双语 Regex 引擎
 * 支持 简体中文模式(CN) 和 高效英文模式(EN)
 * 输出格式: "term1|term2|term3" (双引号, | = OR, 空格 = AND)
 *
 * Copyright (c) 2025 流放工坊 | cnpoe.com
 * 核心逻辑参考 poe2.re 开源项目，中文适配部分为独立开发。
 */
import { getAllItemMods, getModById, getCategoryGroups, waystoneMods, properties, rarities, itemClasses, moveSpeeds, ilvlRegex } from '../data/affixesData';

export type LangMode = 'en' | 'cn';
const FLAT_IDS = ['flat_phys','flat_fire','flat_cold','flat_light','flat_chaos'];

export interface BuildInput {
  lang: LangMode;
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
  customText: string;
}

export function defaultInput(): BuildInput {
  return { lang: 'cn', classIds: [], rarities: [], hasQuality: false, hasSockets: false, ilvlMin: 0, ilvlMax: 0, moveSpeed: 0, resistances: [], modIds: [], mapModIds: [], flatDmgMin: 0, customText: '' };
}

// ========================
export function buildRegex(input: Partial<BuildInput>): { regex: string; shortRegex: string; explanation: string[]; length: number } {
  const i = { ...defaultInput(), ...input };
  const cn = i.lang === 'cn';
  const terms: string[] = [];

  // Quality / Sockets
  if (i.hasQuality) { const p = properties.find(x => x.id === 'quality'); terms.push(cn ? (p?.cn || '品质') : (p?.en || 'y: \\+')); }
  if (i.hasSockets) { const p = properties.find(x => x.id === 'sockets'); terms.push(cn ? (p?.cn || '插槽') : (p?.en || 'ts: S')); }

  // Rarities
  if (i.rarities.length > 0 && i.rarities.length < 3) {
    if (cn) {
      terms.push(i.rarities.map(id => rarities.find(r => r.id === id)?.cn || '').filter(Boolean).join('|'));
    } else {
      const enTerms = i.rarities.map(id => rarities.find(r => r.id === id)?.en || '').filter(Boolean);
      if (enTerms.length === 1) terms.push(enTerms[0]);
      else if (enTerms.length > 1) terms.push(`y: (${enTerms.map(t => t.replace('y: ', '')).join('|')})`);
    }
  }

  // Resistances (from modIds that are res types)
  const resIds = ['fireRes','coldRes','lightRes','chaosRes','allRes'];
  const activeRes = i.resistances || [];
  if (activeRes.length > 0) {
    if (cn) {
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
    if (ms) terms.push(cn ? ms.cn : ms.en);
  }

  // Item mods (non-resistance)
  for (const modId of i.modIds) {
    if (resIds.includes(modId)) continue;
    const mod = getModById(modId);
    if (!mod) continue;
    const base = cn ? mod.cn : mod.en;
    // 点伤 → 注入数值范围
    if (i.flatDmgMin > 0 && FLAT_IDS.includes(modId)) {
      const numRx = buildNumAtLeast(i.flatDmgMin);
      const injected = base.replace('.*', `.*${numRx}.*`);
      terms.push(injected);
    } else {
      terms.push(base);
    }
  }

  // Item classes
  if (i.classIds.length > 0) {
    if (cn) {
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

  // Waystone mods
  for (const mid of i.mapModIds) {
    const wm = waystoneMods.find(m => m.id === mid);
    if (wm) terms.push(cn ? wm.cnRegex : wm.enRegex);
  }

  // Custom
  if (i.customText.trim()) terms.push(i.customText.trim());

  // Assemble
  const full = terms.length > 0 ? `"${terms.join('|')}"` : '';
  const shortTerms = compress(terms, i);
  const short = shortTerms.length > 0 ? `"${shortTerms.join('|')}"` : '';
  const explanation = explain(terms, i, il.explain);

  return { regex: full, shortRegex: short.length <= full.length ? short : full, explanation, length: full.length };
}

function compress(terms: string[], input: Partial<BuildInput>): string[] {
  const joined = terms.join('|');
  if (`"${joined}"`.length <= 48) return terms;
  const cn = input.lang === 'cn';
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
  const result = [...p[0], ...p[1], ...p[2], ...p[3].slice(0, 2), ...p[4], ...p[5]];
  const rj = result.join('|');
  return `"${rj}"`.length <= 48 ? result : [...p[0], ...p[1], ...p[2], ...p[3].slice(0, 2)];
}

function explain(terms: string[], input: Partial<BuildInput>, ilvlExplain: string): string[] {
  const cn = input.lang === 'cn';
  const lines: string[] = [];
  for (const t of terms) {
    const mod = getAllItemMods().find(m => cn ? m.cn === t : m.en === t);
    if (mod) {
      const extra = (input.flatDmgMin && FLAT_IDS.includes(mod.id)) ? ` ≥ ${input.flatDmgMin}` : '';
      lines.push(`${mod.label}${extra} — 匹配 "${mod.example}"`);
      continue;
    }
    const wm = waystoneMods.find(m => cn ? m.cnRegex === t : m.enRegex === t);
    if (wm) { lines.push(`引路石: ${wm.label} — 匹配 "${wm.cnExample}"`); continue; }
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
  if (len === 0 || len <= 40) return 'green';
  if (len <= 50) return 'yellow';
  return 'red';
}
export function getLengthLabel(len: number): string {
  if (len === 0) return '';
  if (len <= 40) return '安全';
  if (len <= 50) return '接近上限';
  return '超出限制!';
}

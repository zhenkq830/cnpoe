/**
 * 流放工坊 — 双语 Regex 引擎
 * 支持 简体中文模式(CN) 和 高效英文模式(EN)
 * 输出格式: "term1|term2|term3" (双引号, | = OR, 空格 = AND)
 *
 * Copyright (c) 2025 流放工坊 | cnpoe.com
 * 核心逻辑参考 poe2.re 开源项目，中文适配部分为独立开发。
 */
import { getAllItemMods, getModById, getCategoryGroups, waystoneMods, properties, rarities, itemClasses, moveSpeeds, ilvlRegex } from '../data/affixesData';

export type LangMode = 'en' | 'cn' | 'tc';
export type LogicMode = 'or' | 'and';
const FLAT_IDS = ['flat_phys','flat_fire','flat_cold','flat_light','flat_chaos'];

/** 简体→繁体字符转换 */
const SC2TC: Record<string,string> = {'护':'護','闪':'閃','伤':'傷','击':'擊','头':'頭','链':'鍊','带':'帶','宝':'寶','权':'權','长':'長','战':'戰','单':'單','双':'雙','锤':'錘','斗':'鬥','电':'電','晕':'暈','阈':'閾','环':'環','诅':'詛','却':'卻','剂':'劑','唤':'喚','类':'類','术':'術','动':'動','点':'點','缓':'緩','积':'積','冻':'凍','额':'額','缀':'綴','质':'質','级':'級','围':'圍','门':'門','範':'范','選':'选','擇':'择','項':'项','標':'标','籤':'签','萬':'万','與':'与','復':'复','體':'体','機':'机','對':'对','關':'关','係':'系','應':'应','發':'发','開':'开','無':'无','時':'时','書':'书','會':'会','個':'个','們':'们','為':'为','現':'现','領':'领','風':'风','實':'实','學':'学','進':'进','過':'过','運':'运','還':'还','這':'这','兩':'两','嚴':'严','靈':'灵','變':'变','葉':'叶','導':'导','響':'响','爾':'尔','盡':'尽','義':'义','親':'亲','許':'许','論':'论','識':'识','調':'调','負':'负','責':'责','費':'费','車':'车','轉':'转','輪':'轮','軟':'软','較':'较','輕':'轻','軸':'轴','輯':'辑','輸':'输','達':'达','違':'违','遠':'远','遲':'迟','適':'适','遺':'遗','郵':'邮','鄰':'邻','鑑':'鉴','銳':'锐','鍵':'键','鎮':'镇','鏡':'镜','鐘':'钟','鐵':'铁','銀':'银','銅':'铜','鋼':'钢','錢':'钱','錯':'错','鎊':'镑','鑽':'钻','錄':'录','際':'际','陸':'陆','陳':'陈','陰':'阴','陽':'阳','階':'阶','隊':'队','難':'难','險':'险','隨':'随','隱':'隐','雖':'虽','靜':'静','頁':'页','頂':'顶','須':'须','順':'顺','預':'预','頻':'频','題':'题','顏':'颜','願':'愿','顧':'顾','顯':'显'};
function toTC(s: string): string { return s.split('').map(c => SC2TC[c] || c).join(''); }

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
  customText: string;
}

export function defaultInput(): BuildInput {
  return { lang: 'cn', logic: 'or', highlight: true, classIds: [], rarities: [], hasQuality: false, hasSockets: false, ilvlMin: 0, ilvlMax: 0, moveSpeed: 0, resistances: [], modIds: [], mapModIds: [], flatDmgMin: 0, customText: '' };
}

// ========================
export function buildRegex(input: Partial<BuildInput>): { regex: string; shortRegex: string; explanation: string[]; length: number } {
  const i = { ...defaultInput(), ...input };
  const cn = i.lang === 'cn' || i.lang === 'tc';
  const tc = i.lang === 'tc';
  const T = (s: string) => tc ? toTC(s) : s;
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

  // 繁体转换
  const termsFinal = tc ? terms.map(toTC) : terms;

  // Assemble
  const sep = i.logic === 'and' ? '" "' : '|';
  let full = '', short = '';
  if (termsFinal.length > 0) {
    if (i.highlight) {
      full = `"${termsFinal.join(sep)}"`;
    } else if (i.logic === 'and') {
      // 排除+和: !"a.*b" = NOT(a AND b) = 排除同时包含a和b的物品
      full = `!"${termsFinal.join('.*')}"`;
    } else {
      // 排除+或: !a !b = NOT(a) AND NOT(b) = 排除任一包含a或b的物品
      full = termsFinal.map(t => `!${t.includes(' ') ? t : t}`).join(' ');
    }
  }
  const shortTerms = compress(termsFinal, i);
  if (shortTerms.length > 0) {
    if (i.highlight) {
      short = `"${shortTerms.join(sep)}"`;
    } else if (i.logic === 'and') {
      short = `!"${shortTerms.join('.*')}"`;
    } else {
      short = shortTerms.map(t => `!${t.includes(' ') ? t : t}`).join(' ');
    }
  }
  const explanation = explain(terms, i, il.explain);

  return { regex: full, shortRegex: short.length <= full.length ? short : full, explanation, length: full.length };
}

function compress(terms: string[], input: Partial<BuildInput>): string[] {
  const isAnd = input.logic === 'and';
  const jSep = isAnd ? '" "' : '|';
  const wSep = isAnd ? ' ' : '|';
  const joined = terms.join(wSep);
  if (isAnd ? joined.length <= 48 : `"${joined}"`.length <= 48) return terms;
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
  const rj = result.join(wSep);
  return (isAnd ? rj.length : `"${rj}"`.length) <= 48 ? result : [...p[0], ...p[1], ...p[2], ...p[3].slice(0, 2)];
}

function explain(terms: string[], input: Partial<BuildInput>, ilvlExplain: string): string[] {
  const cn = input.lang === 'cn' || input.lang === 'tc';
  const lines: string[] = [];
  for (const t of terms) {
    const mod = getAllItemMods().find(m => cn ? m.cn === t : m.en === t);
    if (mod) {
      const extra = (input.flatDmgMin && FLAT_IDS.includes(mod.id)) ? ` ≥ ${input.flatDmgMin}` : '';
      lines.push(`${mod.label}${extra} — 匹配 "${mod.label}" 词缀`);
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

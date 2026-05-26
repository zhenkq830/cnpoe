/** 更新技能宝石数据库 — 从 poe2db.tw 抓取最新数据 */
const fs = require('fs');
const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (cnpoe.com)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extract(html, prefix) {
  const gems = {};
  const dataTagsRe = /data-tags='([^']+)'/g;
  let m;
  while ((m = dataTagsRe.exec(html)) !== null) {
    const tagsRaw = m[1];
    const rest = html.substring(m.index);
    const linkRe = new RegExp('href="' + prefix + '([^"]+)"[^>]*>([^<]+)<\/a>');
    const linkMatch = rest.match(linkRe);
    if (!linkMatch) continue;
    const en = linkMatch[1]; const name = linkMatch[2].trim();
    if (/^(Act|Ascendancy|Gem|Item|Monster|NPC|Quest|Waystones|patreon|passive|Keywords|Modifiers|Desecrated|Lineage|Spirit_Gems|Support_Gems|Skill_Gems|Crafting|TW|CN|RU)($|\/)/.test(en)) continue;
    if (en.length < 3 || name.length < 1 || en.includes('/')) continue;
    const parts = tagsRaw.split(' ').filter(Boolean);
    const tags = parts.filter(p => p.length > 0 && p.charCodeAt(0) > 127);
    const enDisplay = parts.filter(p => p.length > 0 && p.charCodeAt(0) < 128).join(' ') || en.replace(/_/g, ' ');
    if (!gems[en]) gems[en] = { cn: name, tw: '', cnTags: [], twTags: [], en: enDisplay };
    gems[en].cnTags = tags;
  }
  return gems;
}

function generate(fileName, dbName, interfaceName, lookupName, cnGems, twGems) {
  for (const [en, v] of Object.entries(cnGems)) {
    if (twGems[en]) { v.tw = twGems[en].cn; v.twTags = twGems[en].cnTags; }
  }
  let out = `// Auto-generated from poe2db.tw — ${Object.keys(cnGems).length} gems\n`;
  out += `export interface ${interfaceName} { cn:string; tw:string; en:string; cnTags:string[]; twTags:string[] }\n`;
  out += `export const ${dbName}: Record<string,${interfaceName}> = {\n`;
  Object.entries(cnGems).sort((a, b) => a[0].localeCompare(b[0])).forEach(([en, v]) => {
    out += ' ' + JSON.stringify(en) + ':' + JSON.stringify({ cn: v.cn || '', tw: v.tw || '', en: v.en, cnTags: v.cnTags || [], twTags: v.twTags || [] }) + ',\n';
  });
  out += '};\n\n';
  out += `export function ${lookupName}(name:string):${interfaceName}|null{\n`;
  out += ' const s=name.trim();\n';
  out += ` for(const[,v]of Object.entries(${dbName})){if(v.cn===s||v.tw===s||v.en===s)return v}\n`;
  out += ' return null;\n}\n';
  fs.writeFileSync(`src/data/${fileName}.ts`, out);
  console.log(`  ${fileName}.ts: ${Object.keys(cnGems).length} gems, ${out.length} bytes`);
}

(async () => {
  console.log('Fetching poe2db.tw...');

  const [cnSkill, twSkill, cnSupport, twSupport] = await Promise.all([
    fetch('https://poe2db.tw/cn/Skill_Gems'),
    fetch('https://poe2db.tw/tw/Skill_Gems'),
    fetch('https://poe2db.tw/cn/Support_Gems'),
    fetch('https://poe2db.tw/tw/Support_Gems'),
  ]);

  console.log('Generating...');
  generate('gemData', 'GEM_DB', 'GemEntry', 'lookup',
    extract(cnSkill, '/cn/'), extract(twSkill, '/tw/'));
  generate('supportGemData', 'SUP_GEM_DB', 'SupGemEntry', 'supLookup',
    extract(cnSupport, '/cn/'), extract(twSupport, '/tw/'));

  console.log('Done. Run: npx tsc --noEmit');
})();

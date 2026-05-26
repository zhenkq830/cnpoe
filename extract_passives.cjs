/** Extract passive skill names from poe2db.tw Liquid_Emotions */
const fs = require('fs');
const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (cnpoe.com)' } }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

function extract(html) {
  const passives = {};
  const re = /PassiveSkills"[^>]*data-hover="([^"]+)"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const en = m[2]; // EN name from href
    const name = m[3].trim();
    if (en && name && en.length > 1) {
      passives[en] = name;
    }
  }
  return passives;
}

(async () => {
  console.log('Fetching passive skill data...');

  const [cnHtml, twHtml, usHtml] = await Promise.all([
    fetch('https://poe2db.tw/cn/Liquid_Emotions'),
    fetch('https://poe2db.tw/tw/Liquid_Emotions'),
    fetch('https://poe2db.tw/us/Liquid_Emotions'),
  ]);

  const cnMap = extract(cnHtml);
  const twMap = extract(twHtml);
  const usMap = extract(usHtml);

  console.log('CN passives:', Object.keys(cnMap).length);
  console.log('TW passives:', Object.keys(twMap).length);
  console.log('US passives:', Object.keys(usMap).length);

  // Build paired data by EN name
  const allEn = new Set([...Object.keys(cnMap), ...Object.keys(twMap), ...Object.keys(usMap)]);
  const paired = [];

  for (const en of allEn) {
    paired.push({
      en,
      cn: cnMap[en] || '',
      tw: twMap[en] || '',
    });
  }

  let cnOnly = 0, twOnly = 0, both = 0;
  for (const p of paired) {
    if (p.cn && p.tw) both++;
    else if (p.cn && !p.tw) cnOnly++;
    else if (!p.cn && p.tw) twOnly++;
  }

  console.log('Paired (CN+TW):', both);
  console.log('CN only:', cnOnly);
  console.log('TW only:', twOnly);

  // Write output
  let out = '// PoE2 Passive Skill names — from poe2db.tw Liquid_Emotions\n';
  out += '// ' + paired.length + ' passives\n\n';
  out += 'export const PASSIVE_NAMES: Record<string,{cn:string,tw:string}> = {\n';
  for (const p of paired.sort((a, b) => a.en.localeCompare(b.en))) {
    out += ' ' + JSON.stringify(p.en) + ':' + JSON.stringify({ cn: p.cn, tw: p.tw }) + ',\n';
  }
  out += '};\n\n';
  out += 'export function lookupPassive(name:string): string|null {\n';
  out += ' const s=name.trim();\n';
  out += ' for(const[en,v]of Object.entries(PASSIVE_NAMES)){if(v.cn===s||v.tw===s)return en}\n';
  out += ' return null;\n';
  out += '}\n';

  fs.writeFileSync('src/data/passiveNames.ts', out);
  console.log('\nWritten to src/data/passiveNames.ts (' + (out.length / 1024).toFixed(0) + 'KB)');

  // Show samples
  console.log('\nSample passives:');
  paired.filter(p => p.cn && p.tw).slice(0, 5).forEach(p => {
    console.log('  ' + p.en + ' ← CN:' + p.cn + ' TW:' + p.tw);
  });
})();

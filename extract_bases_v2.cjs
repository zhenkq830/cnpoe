/** Extract base types from poe2db.tw — paired CN+TW by EN name */
const fs = require('fs');
const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (cnpoe.com)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400) {
        https.get(res.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, r2 => {
          let d = ''; r2.on('data', c => d += c); r2.on('end', () => resolve(d));
        }).on('error', reject);
        return;
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function extract(html) {
  const result = {};
  const re = /<a class="whiteitem[^"]*" [^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const en = m[1].replace(/_/g, ' ');
    const name = m[2].trim();
    if (en && name && en.length > 1 && !en.includes('data-hover') && !en.includes('<')) {
      result[en] = name;
    }
  }
  return result;
}

const CATEGORIES = [
  'Wands', 'One_Hand_Maces', 'Sceptres', 'Spears', 'Bows',
  'Staves', 'Two_Hand_Maces', 'Quarterstaves', 'Crossbows',
  'Talismans', 'Quivers', 'Shields', 'Bucklers', 'Foci',
  'Gloves', 'Boots', 'Body_Armours', 'Helmets',
  'Amulets', 'Rings', 'Belts',
  'Life_Flasks', 'Mana_Flasks', 'Charms',
  'Jewels', 'Tablet',
  'Claws', 'Daggers', 'Flails',
];

(async () => {
  console.log('Fetching paired CN+TW base types...\n');

  const cn2en = {};  // CN name → EN
  const tw2en = {};  // TW name → EN
  const errors = [];

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const pct = `[${i + 1}/${CATEGORIES.length}]`;

    try {
      const [twHtml, cnHtml] = await Promise.all([
        fetch(`https://poe2db.tw/tw/${cat}`),
        fetch(`https://poe2db.tw/cn/${cat}`),
      ]);

      const twItems = extract(twHtml); // EN → TW
      const cnItems = extract(cnHtml); // EN → CN

      // Pair by EN name
      let paired = 0, twOnly = 0, cnOnly = 0;
      for (const [en, tw] of Object.entries(twItems)) {
        tw2en[tw] = en;
        if (cnItems[en]) {
          cn2en[cnItems[en]] = en;
          paired++;
        } else {
          twOnly++;
        }
      }
      for (const [en, cn] of Object.entries(cnItems)) {
        if (!twItems[en]) {
          cn2en[cn] = en;
          cnOnly++;
        } else if (!cn2en[cn]) {
          cn2en[cn] = en;
        }
      }

      const status = twOnly > 0 || cnOnly > 0 ? ` ⚠ TW+${twOnly} CN+${cnOnly}` : '';
      console.log(`${pct} ${cat}: ${paired} paired${status}`);
    } catch (e) {
      console.log(`${pct} ${cat}: ERROR - ${e.message}`);
      errors.push(cat);
    }

    if (i < CATEGORIES.length - 1) await sleep(200);
  }

  // Also merge in old POE2_BASE entries that aren't in the new data
  const oldContent = fs.readFileSync('src/data/poe2BaseTypes.ts', 'utf8');
  const oldMatch = oldContent.match(/export const POE2_BASE: Record<string,string> = \{([\s\S]*)\};/);
  let oldMerged = 0;
  if (oldMatch) {
    for (const l of oldMatch[1].split('\n')) {
      const m = l.match(/"([^"]+)":"([^"]+)",?/);
      if (m && !cn2en[m[1]]) {
        cn2en[m[1]] = m[2];
        oldMerged++;
      }
    }
  }

  // Write output
  let cnOut = '// PoE2 CN→EN base types — paired from poe2db.tw/cn + /tw\n';
  cnOut += `export const POE2_CN_BASE: Record<string,string> = {\n`;
  Object.entries(cn2en).sort((a, b) => a[0].localeCompare(b[0], 'zh')).forEach(([cn, en]) => {
    cnOut += ` ${JSON.stringify(cn)}:${JSON.stringify(en)},\n`;
  });
  cnOut += '};\n';

  let twOut = '// PoE2 TW→EN base types — paired from poe2db.tw/tw + /cn\n';
  twOut += `export const POE2_TW_BASE: Record<string,string> = {\n`;
  Object.entries(tw2en).sort((a, b) => a[0].localeCompare(b[0], 'zh')).forEach(([tw, en]) => {
    twOut += ` ${JSON.stringify(tw)}:${JSON.stringify(en)},\n`;
  });
  twOut += '};\n';

  fs.writeFileSync('src/data/poe2BaseCN.ts', cnOut);
  fs.writeFileSync('src/data/poe2BaseTW.ts', twOut);

  console.log(`\nDone! CN: ${Object.keys(cn2en).length}, TW: ${Object.keys(tw2en).length}`);
  console.log(`Old entries merged: ${oldMerged}`);
  if (errors.length) console.log(`Errors: ${errors.join(', ')}`);
})();

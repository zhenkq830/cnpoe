/** Extract all base type names from poe2db.tw */
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

// Categories to skip (not equipment base types)
const SKIP = new Set([
  'Skill_Gems', 'Support_Gems', 'Meta_Skill_Gem', 'Stackable_Currency',
  'Waystones', 'Map_Fragments', 'Misc_Map_Items', 'Expedition_Logbooks',
  'Inscribed_Ultimatum', 'Trial_Coins', 'Pinnacle_Keys', 'Vault_Keys',
  'Incubators', 'Augment', 'Omen', 'Relics',
]);

// Equipment categories from the Items page
const CATEGORIES = [
  'Wands', 'One_Hand_Maces', 'Sceptres', 'Spears', 'Bows',
  'Staves', 'Two_Hand_Maces', 'Quarterstaves', 'Crossbows',
  'Talismans', 'Quivers', 'Shields', 'Bucklers', 'Foci',
  'Gloves', 'Boots', 'Body_Armours', 'Helmets',
  'Amulets', 'Rings', 'Belts',
  'Life_Flasks', 'Mana_Flasks', 'Charms',
  'Jewels', 'Tablet',
  // Try disabled categories too - some might have items
  'Claws', 'Daggers', 'Flails',
];

function extract(html) {
  const items = [];
  const re = /<a class="whiteitem[^"]*" [^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const en = m[1].replace(/_/g, ' ');
    const name = m[2].trim();
    if (en && name && en.length > 1 && !en.includes('data-hover')) {
      items.push({ en, name });
    }
  }
  return items;
}

(async () => {
  console.log('Fetching base types from poe2db.tw...\n');

  const tw2en = {};
  const cn2en = {};
  const errors = [];

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const pct = `[${i + 1}/${CATEGORIES.length}]`;

    // Fetch TW and CN in parallel
    try {
      const [twHtml, cnHtml] = await Promise.all([
        fetch(`https://poe2db.tw/tw/${cat}`),
        fetch(`https://poe2db.tw/cn/${cat}`),
      ]);

      const twItems = extract(twHtml);
      const cnItems = extract(cnHtml);

      // Match TW and CN by English name
      for (const tw of twItems) {
        tw2en[tw.name] = tw.en;
      }
      for (const cn of cnItems) {
        cn2en[cn.name] = cn.en;
      }

      console.log(`${pct} ${cat}: TW=${twItems.length} CN=${cnItems.length}`);
    } catch (e) {
      console.log(`${pct} ${cat}: ERROR - ${e.message}`);
      errors.push(cat);
    }

    // Small delay between requests
    if (i < CATEGORIES.length - 1) await sleep(200);
  }

  // Write output files
  let twOut = '// PoE2 TW→EN base types — auto-generated from poe2db.tw\n';
  twOut += `export const POE2_TW2EN: Record<string,string> = {\n`;
  Object.entries(tw2en).sort((a, b) => a[0].localeCompare(b[0], 'zh')).forEach(([tw, en]) => {
    twOut += ` ${JSON.stringify(tw)}:${JSON.stringify(en)},\n`;
  });
  twOut += '};\n';

  let cnOut = '// PoE2 CN→EN base types — auto-generated from poe2db.tw\n';
  cnOut += `export const POE2_CN2EN: Record<string,string> = {\n`;
  Object.entries(cn2en).sort((a, b) => a[0].localeCompare(b[0], 'zh')).forEach(([cn, en]) => {
    cnOut += ` ${JSON.stringify(cn)}:${JSON.stringify(en)},\n`;
  });
  cnOut += '};\n';

  fs.writeFileSync('src/data/poe2BaseTW.ts', twOut);
  fs.writeFileSync('src/data/poe2BaseCN.ts', cnOut);

  console.log(`\nDone! TW: ${Object.keys(tw2en).length} entries, CN: ${Object.keys(cn2en).length} entries`);
  console.log(`Errors: ${errors.length > 0 ? errors.join(', ') : 'none'}`);
})();

/** Full modifier extraction from poe2db.tw — all categories, 3 languages */
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
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseModsView(html) {
  const idx = html.indexOf('new ModsView(');
  if (idx < 0) return null;
  const start = html.indexOf('(', idx) + 1;
  let depth = 0, end = -1;
  let inString = false, escaped = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (escaped) { escaped = false; continue; }
    if (c === '\\') { escaped = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (c === '{' || c === '[') depth++;
    if (c === '}' || c === ']') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end < 0) return null;
  try { return JSON.parse(html.substring(start, end)); }
  catch(e) { return null; }
}

// Equipment categories with their poe2db page URLs
// Armor variants: str, dex, int, str_dex, str_int, dex_int, str_dex_int
const ARMOR_VARIANTS = ['str', 'dex', 'int', 'str_dex', 'str_int', 'dex_int'];
const BODY_VARIANTS = ['str', 'dex', 'int', 'str_dex', 'str_int', 'dex_int', 'str_dex_int'];

const CATEGORIES = [
  // Weapons
  'Wands', 'One_Hand_Maces', 'Sceptres', 'Spears', 'Bows',
  'Staves', 'Two_Hand_Maces', 'Quarterstaves', 'Crossbows',
  'Claws', 'Daggers', 'Flails',
  // Off-hand
  'Talismans', 'Quivers', 'Shields', 'Bucklers', 'Foci',
  // Armor — sub-variants
  ...ARMOR_VARIANTS.map(v => 'Gloves_' + v),
  ...ARMOR_VARIANTS.map(v => 'Boots_' + v),
  ...ARMOR_VARIANTS.map(v => 'Helmets_' + v),
  ...BODY_VARIANTS.map(v => 'Body_Armours_' + v),
  // Jewelry
  'Amulets', 'Rings', 'Belts',
  // Flasks
  'Life_Flasks', 'Mana_Flasks',
  // Other
  'Charms', 'Jewels',
  // Tablets
  'Tablet', 'Breach_Precursor_Tablet', 'Expedition_Precursor_Tablet',
  'Delirium_Precursor_Tablet', 'Ritual_Precursor_Tablet',
  'Precursor_Tablet', 'Overseer_Precursor_Tablet',
  // Shields sub-variants
  'Shields_str', 'Shields_str_dex', 'Shields_str_int',
];

const LANGS = ['cn', 'tw', 'us'];

// Collect all modifier families
const allData = {}; // {familyName: {cn: {tiers,tags}, tw: {...}, us: {...}}}

function extractModText(str) {
  return str.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

(async () => {
  console.log('Starting full modifier extraction...');
  console.log('Categories:', CATEGORIES.length, 'Languages:', LANGS.length);
  console.log('Total pages:', CATEGORIES.length * LANGS.length);
  console.log('');

  const t0 = Date.now();
  let fetched = 0, parsed = 0, failed = 0;
  const categoryMods = {}; // {category: {cn: families, tw: families, us: families}}

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const pct = '[' + (i + 1) + '/' + CATEGORIES.length + ']';
    categoryMods[cat] = {};

    for (const lang of LANGS) {
      const url = 'https://poe2db.tw/' + lang + '/' + cat;
      try {
        const html = await fetch(url);
        const data = parseModsView(html);
        fetched++;

        if (data && data.normal && data.normal.length > 0) {
          categoryMods[cat][lang] = data;
          parsed++;

          // Index by family name for cross-language matching
          data.normal.forEach(entry => {
            const family = (entry.ModFamilyList || ['unknown'])[0];
            if (!allData[family]) allData[family] = { cn: null, tw: null, us: null, tags: new Set() };
            // Store the best data per language per family
            if (!allData[family][lang]) {
              allData[family][lang] = { tiers: [], modType: entry.ModGenerationTypeID };
            }
            allData[family][lang].tiers.push({
              name: entry.Name,
              level: parseInt(entry.Level) || 0,
              weight: parseInt(entry.DropChance) || 0,
              text: extractModText(entry.str),
              rawStr: entry.str,
            });
            // Tags from the first entry's description
            if (data.opt && data.opt.attr) {
              data.opt.attr.forEach(t => allData[family].tags.add(t));
            }
          });

          // Also index by family from other categories (corrupted, essence, etc.)
          for (const pool of ['corrupted', 'desecrated', 'essence', 'socketable', 'bonded', 'perfect_essence']) {
            if (data[pool] && data[pool].length > 0) {
              data[pool].forEach(entry => {
                const family = (entry.ModFamilyList || ['unknown'])[0];
                if (!allData[family]) allData[family] = { cn: null, tw: null, us: null, tags: new Set() };
                if (!allData[family][lang]) {
                  allData[family][lang] = { tiers: [], modType: entry.ModGenerationTypeID };
                }
                allData[family][lang].tiers.push({
                  name: entry.Name,
                  level: parseInt(entry.Level) || 0,
                  weight: parseInt(entry.DropChance) || 0,
                  text: extractModText(entry.str),
                  pool: pool,
                });
              });
            }
          }
        }
      } catch(e) {
        failed++;
      }
      await sleep(120);
    }

    const modCount = Object.keys(categoryMods[cat]).length;
    console.log(pct + ' ' + cat + ': ' + modCount + ' languages with mod data');
  }

  // Build the output: only keep families with at least 2 languages
  const completeFamilies = {};
  let totalTiers = 0;
  for (const [family, langs] of Object.entries(allData)) {
    const langCount = [langs.cn, langs.tw, langs.us].filter(Boolean).length;
    if (langCount >= 2) {
      completeFamilies[family] = {
        cn: langs.cn ? langs.cn.tiers : [],
        tw: langs.tw ? langs.tw.tiers : [],
        us: langs.us ? langs.us.tiers : [],
        tags: [...langs.tags],
      };
      totalTiers += Math.max(langs.cn?.tiers.length || 0, langs.tw?.tiers.length || 0, langs.us?.tiers.length || 0);
    }
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('\n=== SUMMARY ===');
  console.log('Time: ' + elapsed + 's');
  console.log('Fetched: ' + fetched + ' | Parsed: ' + parsed + ' | Failed: ' + failed);
  console.log('Total families (multi-lang): ' + Object.keys(completeFamilies).length);
  console.log('Total tiers: ' + totalTiers);

  // Write output
  const out = {
    generated: new Date().toISOString(),
    source: 'poe2db.tw',
    families: completeFamilies,
  };
  fs.writeFileSync('_mod_data.json', JSON.stringify(out, null, 2));
  console.log('\nWritten to _mod_data.json (' + (JSON.stringify(out).length / 1024 / 1024).toFixed(1) + 'MB)');

  // Show some samples
  console.log('\n=== Sample families ===');
  const sampleFams = Object.entries(completeFamilies).slice(0, 5);
  sampleFams.forEach(([fam, data]) => {
    console.log('\n' + fam + ':');
    const cnTiers = data.cn.length;
    const twTiers = data.tw.length;
    const usTiers = data.us.length;
    console.log('  CN:' + cnTiers + ' tiers, TW:' + twTiers + ' tiers, US:' + usTiers + ' tiers');
    if (data.cn[0]) console.log('  CN T1: ' + data.cn[0].name + ' | ' + data.cn[0].text);
    if (data.tw[0]) console.log('  TW T1: ' + data.tw[0].name + ' | ' + data.tw[0].text);
    if (data.us[0]) console.log('  US T1: ' + data.us[0].name + ' | ' + data.us[0].text);
  });
})();

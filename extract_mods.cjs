/** Extract modifier data from poe2db.tw HTML */
const fs = require('fs');
const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (cnpoe.com)' } }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

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
  try {
    return JSON.parse(html.substring(start, end));
  } catch(e) {
    console.error('Parse error:', e.message);
    return null;
  }
}

(async () => {
  // Test with the saved Bows TW HTML
  let html = fs.readFileSync('_bows_tw.html', 'utf8');
  const data = parseModsView(html);

  if (!data) {
    console.log('Failed to parse ModsView from saved HTML');
    return;
  }

  console.log('Top-level keys:', Object.keys(data).join(', '));
  console.log('baseitem:', JSON.stringify(data.baseitem).substring(0, 150));

  // Check all array values at top level
  const modCategories = {};
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val)) {
      modCategories[key] = val;
      console.log(key + ': ' + val.length + ' entries');
    }
  }

  // Show normal mods
  if (data.normal) {
    const entries = data.normal;
    console.log('\n=== BOW MODS (normal): ' + entries.length + ' tiers ===');

    const families = {};
    entries.forEach(e => {
      const f = (e.ModFamilyList || ['unknown'])[0];
      if (!families[f]) families[f] = [];
      families[f].push(e);
    });

    console.log('Mod families: ' + Object.keys(families).length);
    for (const [fam, tiers] of Object.entries(families)) {
      tiers.sort((a, b) => parseInt(a.Level) - parseInt(b.Level));
      console.log('\n  ' + fam + ' (' + tiers.length + ' tiers):');
      tiers.forEach(t => {
        const desc = t.str.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        const tnum = tiers.length - tiers.indexOf(t);
        console.log('    T' + tnum + ' | Lv' + t.Level + ' | ' + t.Name + ' | ' + desc.substring(0, 100) + ' | w:' + t.DropChance);
      });
    }
  }
})();

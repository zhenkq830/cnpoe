/** Extract rune/soul core data from poe2db.tw */
const fs = require('fs');
const https = require('https');

function fetch(url, referer) {
  return new Promise((resolve, reject) => {
    const headers = { 'User-Agent': 'Mozilla/5.0 (cnpoe.com)' };
    if (referer) headers['Referer'] = referer;
    https.get(url, { headers }, res => {
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

function parseItemList(html) {
  const items = [];
  const re = /<a class="whiteitem SoulCore"[^>]*data-hover="([^"]+)"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    items.push({ hoverUrl: m[1], enKey: m[2], name: m[3].trim() });
  }
  return items;
}

function parseHover(html) {
  const result = { name: '', implicits: [], bonded: [], reqLevel: '', stackSize: '' };
  // Name
  const nameM = html.match(/<span class="lc">([^<]+)<\/span>/);
  if (nameM) result.name = nameM[1].trim();
  // Stack (CN/TW/US)
  const stackM = html.match(/(?:堆叠数量|堆疊數量|Stack Count)[^<]*<span[^>]*>([^<]+)<\/span>/);
  if (stackM) result.stackSize = stackM[1].trim();
  // Level (CN/TW/US)
  const lvM = html.match(/(?:等级|等級|Level)\s*<span[^>]*>(\d+)<\/span>/);
  if (lvM) result.reqLevel = lvM[1];
  // implicitMods (normal effects) — exclude bonded section headers
  const impRe = /<div class="implicitMod">([\s\S]*?)<\/div>/g;
  let impM;
  while ((impM = impRe.exec(html)) !== null) {
    const text = impM[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text && !/羁绊|命定|結羈絆|Bonded|bonded/i.test(text)) {
      result.implicits.push(text);
    }
  }
  // bondedMods
  const bondRe = /<div class="bondedMod">([\s\S]*?)<\/div>/g;
  let bondM;
  while ((bondM = bondRe.exec(html)) !== null) {
    const text = bondM[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text && text.length > 2) result.bonded.push(text);
  }
  return result;
}

(async () => {
  console.log('Fetching rune data from poe2db.tw...\n');
  const t0 = Date.now();

  // Step 1: Get item lists from CN, TW, US
  const cnItems = parseItemList(await fetch('https://poe2db.tw/cn/Augment'));
  const twItems = parseItemList(await fetch('https://poe2db.tw/tw/Augment'));
  const usItems = parseItemList(await fetch('https://poe2db.tw/us/Augment'));

  console.log('Items found: CN=' + cnItems.length + ' TW=' + twItems.length + ' US=' + usItems.length);

  // Build name maps by EN key
  const cnNames = {}, twNames = {}, usNames = {};
  cnItems.forEach(i => { cnNames[i.enKey] = i.name; });
  twItems.forEach(i => { twNames[i.enKey] = i.name; });
  usItems.forEach(i => { usNames[i.enKey] = i.name; });

  // Step 2: Fetch hover data for ALL items in all 3 languages
  const allKeys = [...new Set([...Object.keys(cnNames), ...Object.keys(twNames), ...Object.keys(usNames)])];
  console.log('Unique runes: ' + allKeys.length + ', fetching hover data...\n');

  const runeData = {};
  let done = 0;

  // Fetch in batches for CN, TW, US
  for (const lang of ['cn', 'tw', 'us']) {
    const items = lang === 'cn' ? cnItems : lang === 'tw' ? twItems : usItems;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const enKey = item.enKey;
      if (!runeData[enKey]) runeData[enKey] = { enKey, names: {}, implicits: {}, bonded: {} };

      try {
        const refUrl = 'https://poe2db.tw/' + lang + '/Augment';
        const hover = await fetch(item.hoverUrl, refUrl);
        const data = parseHover(hover);
        runeData[enKey].names[lang] = data.name || item.name;
        runeData[enKey].implicits[lang] = data.implicits;
        runeData[enKey].bonded[lang] = data.bonded;
        if (data.reqLevel) runeData[enKey].reqLevel = data.reqLevel;
        if (data.stackSize) runeData[enKey].stackSize = data.stackSize;
      } catch(e) {
        // Use list name as fallback
        runeData[enKey].names[lang] = item.name;
      }

      done++;
      if (done % 20 === 0) console.log('  Progress: ' + done + '/' + (items.length * 3));
      await sleep(80);
    }
  }

  // Step 3: Build structured output
  const runes = Object.values(runeData).filter(r => r.names.cn || r.names.tw || r.names.us);

  // For each rune, pair the mods by position (CN[0] ↔ TW[0] ↔ US[0])
  const paired = runes.map(r => {
    const cnImps = r.implicits.cn || [];
    const twImps = r.implicits.tw || [];
    const usImps = r.implicits.us || [];
    const cnBond = r.bonded.cn || [];
    const twBond = r.bonded.tw || [];
    const usBond = r.bonded.us || [];

    // Pair by index
    const maxImp = Math.max(cnImps.length, twImps.length, usImps.length);
    const implicits = [];
    for (let i = 0; i < maxImp; i++) {
      implicits.push({ cn: cnImps[i] || '', tw: twImps[i] || '', us: usImps[i] || '' });
    }

    const maxBond = Math.max(cnBond.length, twBond.length, usBond.length);
    const bonded = [];
    for (let i = 0; i < maxBond; i++) {
      bonded.push({ cn: cnBond[i] || '', tw: twBond[i] || '', us: usBond[i] || '' });
    }

    return {
      key: r.enKey,
      names: r.names,
      reqLevel: r.reqLevel || '',
      stackSize: r.stackSize || '',
      implicits,
      bonded,
    };
  });

  // Write output
  const out = {
    generated: new Date().toISOString(),
    source: 'poe2db.tw/Augment',
    count: paired.length,
    runes: paired,
  };
  fs.writeFileSync('_rune_data.json', JSON.stringify(out, null, 2));

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('\nDone in ' + elapsed + 's!');
  console.log('Runes extracted: ' + paired.length);
  console.log('Output: _rune_data.json (' + (JSON.stringify(out).length / 1024).toFixed(0) + 'KB)');

  // Sample
  if (paired.length > 0) {
    const s = paired[0];
    console.log('\n=== Sample: ' + s.key + ' ===');
    console.log('Names: CN=' + (s.names.cn || '') + ' TW=' + (s.names.tw || '') + ' US=' + (s.names.us || ''));
    console.log('Level: ' + s.reqLevel + ' Stack: ' + s.stackSize);
    console.log('Implicits (' + s.implicits.length + '):');
    s.implicits.forEach((imp, i) => console.log('  [' + i + '] CN: ' + imp.cn + '\n      TW: ' + imp.tw + '\n      US: ' + imp.us));
    console.log('Bonded (' + s.bonded.length + '):');
    s.bonded.forEach((b, i) => console.log('  [' + i + '] CN: ' + b.cn + '\n      TW: ' + b.tw + '\n      US: ' + b.us));
  }
})();

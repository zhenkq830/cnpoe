/** Build PoE2 CN→EN / TW→EN mod lookup from extracted mod data */
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('_mod_data.json', 'utf8'));

// For each family, extract the common text template from all tiers
// Replace number ranges like (40—49) or 40—49 with {0}, {1}, etc.
function extractTemplate(text) {
  // Strip HTML tags
  let t = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  // Replace number ranges: (40—49) or 40—49 or 40 to 49 → {N}
  // First pass: replace parenthesized ranges
  t = t.replace(/\((\d+(?:\.\d+)?)[—\-~](\d+(?:\.\d+)?)\)/g, '{N}');
  // Second pass: replace bare ranges with spaces
  t = t.replace(/(\d+(?:\.\d+)?)\s*[—\-~至到]\s*(\d+(?:\.\d+)?)/g, '{N}');
  // Third pass: replace remaining standalone numbers (single values)
  t = t.replace(/(?<!\{)\b\d+(?:\.\d+)?\b/g, '{N}');
  // Clean up extra spaces around placeholders
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

// Collect all unique CN→EN and TW→EN mappings
const cn2en = {};
const tw2en = {};
let totalRaw = 0, totalUnique = 0;

for (const [familyName, family] of Object.entries(data.families)) {
  const cnTiers = family.cn || [];
  const twTiers = family.tw || [];
  const usTiers = family.us || [];

  if (cnTiers.length === 0 || usTiers.length === 0) continue;

  // Get the "cleanest" tier (usually T1, the highest tier) for template
  // But different tiers may have slightly different text, so collect all
  for (let i = 0; i < Math.max(cnTiers.length, twTiers.length, usTiers.length); i++) {
    const cn = cnTiers[i];
    const tw = twTiers[i];
    const us = usTiers[i];
    if (!cn || !us) continue;

    totalRaw++;
    const cnKey = extractTemplate(cn.text);
    const twKey = tw ? extractTemplate(tw.text) : '';
    const usVal = extractTemplate(us.text);

    if (cnKey && usVal && cnKey.length > 2 && usVal.length > 2) {
      if (!cn2en[cnKey]) { cn2en[cnKey] = usVal; totalUnique++; }
      if (twKey && twKey.length > 2 && !tw2en[twKey]) {
        tw2en[twKey] = usVal;
      }
    }
  }
}

// Clean up: normalize placeholder patterns to use {0}, {1} format
function normalizePlaceholders(s) {
  // Replace {N} with numbered placeholders
  let idx = 0;
  return s.replace(/\{N\}/g, () => '{' + (idx++) + '}');
}

const cnFinal = {}, twFinal = {};
for (const [k, v] of Object.entries(cn2en)) {
  cnFinal[normalizePlaceholders(k)] = normalizePlaceholders(v);
}
for (const [k, v] of Object.entries(tw2en)) {
  twFinal[normalizePlaceholders(k)] = normalizePlaceholders(v);
}

console.log('Raw entries processed:', totalRaw);
console.log('Unique CN→EN mappings:', Object.keys(cnFinal).length);
console.log('Unique TW→EN mappings:', Object.keys(twFinal).length);

// Write TypeScript output
let out = '// PoE2 mod translations — auto-generated from poe2db.tw modifier data\n';
out += '// ' + Object.keys(cnFinal).length + ' CN→EN, ' + Object.keys(twFinal).length + ' TW→EN\n\n';
out += 'export const POE2_CN2EN: Record<string,string> = {\n';
for (const [k, v] of Object.entries(cnFinal).sort((a, b) => a[0].localeCompare(b[0], 'zh'))) {
  out += ' ' + JSON.stringify(k) + ':' + JSON.stringify(v) + ',\n';
}
out += '};\n\n';
out += 'export const POE2_TW2EN: Record<string,string> = {\n';
for (const [k, v] of Object.entries(twFinal).sort((a, b) => a[0].localeCompare(b[0], 'zh'))) {
  out += ' ' + JSON.stringify(k) + ':' + JSON.stringify(v) + ',\n';
}
out += '};\n';

fs.writeFileSync('src/data/poe2ModTranslations.ts', out);
console.log('Written to src/data/poe2ModTranslations.ts (' + (out.length / 1024).toFixed(0) + 'KB)');

// Show samples
console.log('\nSample CN mappings:');
const samples = Object.entries(cnFinal).filter(([k]) => k.includes('物理') && k.includes('{0}')).slice(0, 5);
samples.forEach(([k, v]) => console.log('  ' + k + ' → ' + v));

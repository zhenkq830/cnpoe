const fs = require('fs');
let f = fs.readFileSync('src/data/affixesData.ts', 'utf-8');

let count = 0;
f = f.replace(/"cn":"([^"]+)"/g, (match, cn) => {
  let s = cn;
  // X% -> \\d+%
  s = s.replace(/X%/g, '\\\\d+%');
  // X -> \\d+
  s = s.replace(/X/g, '\\\\d+');
  if (s !== cn) count++;
  return '"cn":"' + s + '"';
});

fs.writeFileSync('src/data/affixesData.ts', f, 'utf-8');
console.log('Fixed ' + count + ' cn fields');

// Verify
const lines = f.split('\n').filter(l => l.includes('点生命'));
lines.forEach(l => console.log(l.trim().substring(0, 100)));

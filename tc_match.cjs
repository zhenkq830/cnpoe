const fs=require('fs');
let data=fs.readFileSync('src/data/affixesData.ts','utf-8');

function parseTC(file){const d=fs.readFileSync(file,'utf-8'),r={};let cur='';
d.split('\n').forEach(l=>{l=l.trim();if(!l)return;const m=l.match(/^【(.+)】$/);if(m){cur=m[1];if(!r[cur])r[cur]=[];return;}if(cur){let t=l.replace(/^\d+/,'').trim();if(t)r[cur].push(t);}});return r;}

// Get ALL unique TC texts
const tcPre=parseTC('tc_prefixes.txt'),tcSuf=parseTC('tc_suffixes.txt');
const allTc=[];
Object.values(tcPre).forEach(arr=>arr.forEach(t=>allTc.push(t)));
Object.values(tcSuf).forEach(arr=>arr.forEach(t=>allTc.push(t)));

// Get ALL SC labels with their IDs
const id2label={},label2id={};
const modsStart=data.indexOf('const ALL_MODS');
const modsEnd=data.indexOf('];',modsStart)+2;
const modsSection=data.substring(modsStart,modsEnd);
for(const lm of modsSection.matchAll(/{ id:"(m\d+)", label:"([^"]+)"/g)) {
  id2label[lm[1]]=lm[2];label2id[lm[2]]=lm[1];
}

// SC→TC char conversion for cross-language matching
const S2T={'闪':'閃','护':'護','伤':'傷','击':'擊','电':'電','晕':'暈','阈':'閾','环':'環','门':'門','点':'點','减':'減','免':'免'};
function s2t(s){return s.split('').map(c=>S2T[c]||c).join('');}

// For each TC text, find best matching SC mod by character overlap
const scLabels=Object.entries(id2label).map(([id,label])=>({id,label,chars:new Set([...s2t(label)])}));

const mod2tc={};
for(const tc of [...new Set(allTc)]) {
  const tcChars=new Set([...tc]);
  let bestId=null,bestScore=0;
  for(const {id,label,chars} of scLabels) {
    let score=0;
    for(const c of chars) if(tcChars.has(c)) score++;
    if(score>bestScore){bestScore=score;bestId=id;}
  }
  if(bestId && bestScore>=1) { // 1 char overlap minimum
    if(!mod2tc[bestId])mod2tc[bestId]=[];
    mod2tc[bestId].push(tc);
  }
}

// For mods with entries, pick best
const mod2regex={};
Object.entries(mod2tc).forEach(([modId,texts])=>{
  const unique=[...new Set(texts)];
  const re=unique[0].replace(/#%/g,'[\\\\d.]+%').replace(/#/g,'\\\\d+').replace(/\s+/g,'.*');
  mod2regex[modId]=re;
});

// Update tc fields
let newData=data.replace(/{ id:"(m\d+)", label:"[^"]+", affix:"(?:prefix|suffix)", en:"[^"]*", cn:"[^"]+", tc:"[^"]*", example:"[^"]*"/g,(match,id)=>{
  const tc=mod2regex[id]||'';
  return match.replace(/tc:"[^"]*"/,'tc:"'+tc+'"');
});

fs.writeFileSync('src/data/affixesData.ts',newData,'utf-8');

// Show some matches
console.log('Mods matched:',Object.keys(mod2regex).length);
['m009','m020','m017','m126','m130'].forEach(id=>{
  console.log(id+' ('+(id2label[id]||'')+'): '+ (mod2regex[id]||'no match'));
});

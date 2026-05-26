const fs=require('fs');
const data=fs.readFileSync('src/data/affixesData.ts','utf-8');

function parseTC(file){const d=fs.readFileSync(file,'utf-8'),r={};let cur='';
d.split('\n').forEach(l=>{l=l.trim();if(!l)return;const m=l.match(/^【(.+)】$/);if(m){cur=m[1];if(!r[cur])r[cur]=[];return;}if(cur){let t=l.replace(/^\d+/,'').trim();if(t)r[cur].push(t);}});return r;}

const cn2id={};const cls=data.match(/export const itemClasses[^;]+/);
if(cls){(cls[0].match(/{ id:"(\w+)",label:"([^"]+)"/g)||[]).forEach(e=>{const m=e.match(/id:"(\w+)",label:"([^"]+)"/);cn2id[m[2]]=m[1];});}

const eqMods={};const eqRe=/(\w+): \{prefixes:\[([^\]]*)\],suffixes:\[([^\]]*)\]/g;let m;
while((m=eqRe.exec(data))!==null)eqMods[m[1]]={prefixes:m[2].split(',').map(s=>s.replace(/"/g,'').trim()).filter(Boolean),suffixes:m[3].split(',').map(s=>s.replace(/"/g,'').trim()).filter(Boolean)};

const tcPre=parseTC('tc_prefixes.txt'),tcSuf=parseTC('tc_suffixes.txt');
const mod2tc={};
Object.entries(tcPre).forEach(([cn_eq,tcList])=>{
  const eqId=cn2id[cn_eq];if(!eqId||!eqMods[eqId])return;
  const scList=eqMods[eqId].prefixes;
  const n=Math.min(tcList.length,scList.length);
  for(let i=0;i<n;i++){if(!mod2tc[scList[i]])mod2tc[scList[i]]=[];mod2tc[scList[i]].push(tcList[i]);}
});
Object.entries(tcSuf).forEach(([cn_eq,tcList])=>{
  const eqId=cn2id[cn_eq];if(!eqId||!eqMods[eqId])return;
  const scList=eqMods[eqId].suffixes;
  const n=Math.min(tcList.length,scList.length);
  for(let i=0;i<n;i++){if(!mod2tc[scList[i]])mod2tc[scList[i]]=[];mod2tc[scList[i]].push(tcList[i]);}
});

// Labels for scoring
const id2label={};
const modsStart=data.indexOf('const ALL_MODS');
const modsEnd=data.indexOf('];',modsStart)+2;
const modsSection=data.substring(modsStart,modsEnd);
for(const lm of modsSection.matchAll(/{ id:"(m\d+)", label:"([^"]+)"/g))id2label[lm[1]]=lm[2];

// Best TC per mod
const mod2regex={};
Object.entries(mod2tc).forEach(([modId,texts])=>{
  const scLabel=id2label[modId]||'';
  const unique=[...new Set(texts)];
  const scored=unique.map(tc=>({tc,score:[...scLabel].filter(c=>tc.includes(c)).length}));
  scored.sort((a,b)=>b.score-a.score);
  const best=scored[0]&&scored[0].score>0?scored[0].tc:null;
  if(!best)return;
  const re=best.replace(/#%/g,'[\\\\d.]+%').replace(/#/g,'\\\\d+').replace(/\s+/g,'.*');
  mod2regex[modId]=re;
});

// Replace each mod entry
let newData=data.replace(/{ id:"(m\d+)", label:"[^"]+", affix:"(?:prefix|suffix)", en:"[^"]*", cn:"[^"]+", tc:"[^"]*", example:"[^"]*"/g,(match,id)=>{
  const tc=mod2regex[id]||'';
  return match.replace(/tc:"[^"]*"/,'tc:"'+tc+'"');
});

fs.writeFileSync('src/data/affixesData.ts',newData,'utf-8');
console.log('Done. m020 tc:',mod2regex['m020']||'not found');
console.log('m017 tc:',mod2regex['m017']||'not found');

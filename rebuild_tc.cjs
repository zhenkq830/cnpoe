const fs=require('fs');

function parseTC(file) {
  const d=fs.readFileSync(file,'utf-8'),r={};let cur='';
  d.split('\n').forEach(l=>{l=l.trim();if(!l)return;
    const m=l.match(/^【(.+)】$/);if(m){cur=m[1];if(!r[cur])r[cur]=[];return;}
    if(cur){let t=l.replace(/^\d+/,'').trim();if(t)r[cur].push(t);}
  });return r;
}

const data=fs.readFileSync('src/data/affixesData.ts','utf-8');

// EQUIP_MOD_MAP
const eqMods={};
const eqRe=/(\w+): \{prefixes:\[([^\]]*)\],suffixes:\[([^\]]*)\]/g;
let m;
while((m=eqRe.exec(data))!==null) {
  eqMods[m[1]]={
    prefixes:m[2].split(',').map(s=>s.replace(/"/g,'').trim()).filter(Boolean),
    suffixes:m[3].split(',').map(s=>s.replace(/"/g,'').trim()).filter(Boolean)
  };
}

// itemClasses cn→id
const cn2id={};
const clsMatch=data.match(/export const itemClasses[^;]+/);
if(clsMatch){
  (clsMatch[0].match(/{ id:"(\w+)",label:"([^"]+)"/g)||[]).forEach(e=>{
    const m=e.match(/id:"(\w+)",label:"([^"]+)"/);cn2id[m[2]]=m[1];
  });
}

const tcPre=parseTC('tc_prefixes.txt'),tcSuf=parseTC('tc_suffixes.txt');

// Match TC→SC by position (only when counts match)
const mod2tc={};
Object.entries(tcPre).forEach(([cn_eq,tcList])=>{
  const eqId=cn2id[cn_eq];if(!eqId||!eqMods[eqId])return;
  const scList=eqMods[eqId].prefixes;
  if(tcList.length!==scList.length)return;
  tcList.forEach((tc,i)=>{if(!mod2tc[scList[i]])mod2tc[scList[i]]=[];mod2tc[scList[i]].push(tc);});
});
Object.entries(tcSuf).forEach(([cn_eq,tcList])=>{
  const eqId=cn2id[cn_eq];if(!eqId||!eqMods[eqId])return;
  const scList=eqMods[eqId].suffixes;
  if(tcList.length!==scList.length)return;
  tcList.forEach((tc,i)=>{if(!mod2tc[scList[i]])mod2tc[scList[i]]=[];mod2tc[scList[i]].push(tc);});
});

// Extract SC labels for similarity matching
const id2label={};
for(const lm of data.matchAll(/{ id:"(m\d+)", label:"([^"]+)"/g)) id2label[lm[1]]=lm[2];

// Generate TC regex: pick TC text with best character overlap with SC label
const mod2regex={};
Object.entries(mod2tc).forEach(([modId,texts])=>{
  const scLabel=id2label[modId]||'';
  const unique=[...new Set(texts)];
  // Score by overlap: count SC label characters appearing in TC text
  const scored=unique.map(tc=>({tc,score:[...scLabel].filter(c=>tc.includes(c)).length}));
  scored.sort((a,b)=>b.score-a.score);
  const best=scored[0]?.tc||unique[0]||'';
  const re=best.replace(/#%/g,'[\\d.]+%').replace(/#/g,'\\d+').replace(/\s+/g,'.*');
  mod2regex[modId]=re;
});

// Update tc fields in data
let f=data;
f=f.replace(/("tc":)"[^"]*"/g,(match,prefix)=>{
  const id=match.match(/"m\d+"/);
  if(!id)return match;
  const newTc=mod2regex[id[0].replace(/"/g,'')]||'';
  return prefix+'"'+newTc+'"';
});

fs.writeFileSync('src/data/affixesData.ts',f,'utf-8');
console.log('Done. Mods with TC:',Object.keys(mod2regex).length);

const fs=require('fs');
let data=fs.readFileSync('src/data/affixesData.ts','utf-8');

function parseTC(file){const d=fs.readFileSync(file,'utf-8'),r={};let cur='';
d.split('\n').forEach(l=>{l=l.trim();if(!l)return;const m=l.match(/^【(.+)】$/);if(m){cur=m[1];if(!r[cur])r[cur]=[];return;}if(cur){let t=l.replace(/^\d+/,'').trim();if(t)r[cur].push(t);}});return r;}

const cn2id={};const cls=data.match(/export const itemClasses[^;]+/);
if(cls){(cls[0].match(/{ id:"(\w+)",label:"([^"]+)"/g)||[]).forEach(e=>{const m=e.match(/id:"(\w+)",label:"([^"]+)"/);cn2id[m[2]]=m[1];});}

const eqMods={};const eqRe=/(\w+): \{prefixes:\[([^\]]*)\],suffixes:\[([^\]]*)\]/g;let m;
while((m=eqRe.exec(data))!==null)eqMods[m[1]]={prefixes:m[2].split(',').map(s=>s.replace(/"/g,'').trim()).filter(Boolean),suffixes:m[3].split(',').map(s=>s.replace(/"/g,'').trim()).filter(Boolean)};

const tcPre=parseTC('tc_prefixes.txt'),tcSuf=parseTC('tc_suffixes.txt');
const mod2tc={};

// Step 1: Position matching for equipment with matching counts
const ok=[],skip=[];
Object.entries(tcPre).forEach(([cn_eq,tcList])=>{
  const eqId=cn2id[cn_eq];if(!eqId||!eqMods[eqId])return;
  const sc=eqMods[eqId].prefixes;
  if(tcList.length===sc.length){ok.push(cn_eq);tcList.forEach((t,i)=>{if(!mod2tc[sc[i]])mod2tc[sc[i]]=[];mod2tc[sc[i]].push(t);});}
  else skip.push(cn_eq+' pre('+tcList.length+'vs'+sc.length+')');
});
Object.entries(tcSuf).forEach(([cn_eq,tcList])=>{
  const eqId=cn2id[cn_eq];if(!eqId||!eqMods[eqId])return;
  const sc=eqMods[eqId].suffixes;
  if(tcList.length===sc.length){ok.push(cn_eq);tcList.forEach((t,i)=>{if(!mod2tc[sc[i]])mod2tc[sc[i]]=[];mod2tc[sc[i]].push(t);});}
  else skip.push(cn_eq+' suf('+tcList.length+'vs'+sc.length+')');
});

// Step 2: For mods without TC yet, find best match from all TC texts
// using character overlap with SC→TC conversion
const S2T={'闪':'閃','护':'護','伤':'傷','击':'擊','电':'電','晕':'暈','阈':'閾','环':'環','门':'門','点':'點','减':'減','免':'免','积':'積','冻':'凍','扩':'擴','缩':'縮','质':'質','级':'級','围':'圍','长':'長','战':'戰','单':'單','双':'雙','锤':'錘','斗':'鬥'};
function s2t(s){return s.split('').map(c=>S2T[c]||c).join('');}

// Get all unique TC texts
const allTc=[];
Object.values(tcPre).forEach(a=>a.forEach(t=>allTc.push(t)));
Object.values(tcSuf).forEach(a=>a.forEach(t=>allTc.push(t)));

// For mods without TC, do text matching
const id2label={};
for(const lm of data.matchAll(/{ id:"(m\d+)", label:"([^"]+)"/g))id2label[lm[1]]=lm[2];

let filled=0;
for(const id of Object.keys(id2label)){
  if(mod2tc[id]&&mod2tc[id].length>0)continue;
  const label=s2t(id2label[id]).replace(/X/g,'').replace(/#/g,'');
  const lc=[...new Set(label)].filter(c=>!/[0-9%#\-—~+（）()\s]/g.test(c));
  if(lc.length===0)continue;

  let best=null,bestScore=0;
  for(const tc of [...new Set(allTc)]){
    if(Object.values(mod2tc).some(arr=>arr.includes(tc)))continue; // already assigned
    let score=0;
    for(const c of lc)if(tc.includes(c))score++;
    if(score>bestScore){bestScore=score;best=tc;}
  }
  if(best&&bestScore>=Math.max(1,lc.length*0.3)){
    const re=best.replace(/#%/g,'[\\\\d.]+%').replace(/#/g,'\\\\d+').replace(/\s+/g,'.*');
    mod2tc[id]=[best];filled++;
  }
}

const mod2regex={};
Object.entries(mod2tc).forEach(([modId,texts])=>{
  const unique=[...new Set(texts)];
  // Score each TC by overlap with SC label
  const label=s2t(id2label[modId]||'').replace(/X/g,'');
  const lc=[...new Set(label)].filter(c=>!/[0-9%#\-—~+（）()\s]/g.test(c));
  const scored=unique.map(tc=>({tc,score:lc.filter(c=>tc.includes(c)).length}));
  scored.sort((a,b)=>b.score-a.score);
  const best=scored[0]?.tc||unique[0];
  mod2regex[modId]=best.replace(/#%/g,'[\\\\d.]+%').replace(/#/g,'\\\\d+').replace(/\s+/g,'.*');
});

// Update
let newData=data.replace(/{ id:"(m\d+)", label:"[^"]+", affix:"(?:prefix|suffix)", en:"[^"]*", cn:"[^"]+", tc:"[^"]*", example:"[^"]*"/g,(match,id)=>{
  const tc=mod2regex[id]||'';
  return match.replace(/tc:"[^"]*"/,'tc:"'+tc+'"');
});
fs.writeFileSync('src/data/affixesData.ts',newData,'utf-8');

console.log('OK eq:',ok.length,'Skipped:',skip.length,'Text-filled:',filled);
console.log('Mods with TC:',Object.keys(mod2regex).length);
skip.forEach(s=>console.log('  SKIP: '+s));

// Verify key mods
['m126','m125','m124','m123','m122','m121','m120','m009','m020'].forEach(id=>{
  console.log(id+' ('+(id2label[id]||'').substring(0,25)+'): '+(mod2regex[id]||'EMPTY').substring(0,40));
});

const fs=require('fs');
let data=fs.readFileSync('src/data/affixesData.ts','utf-8');

function parseTC(file){const d=fs.readFileSync(file,'utf-8'),r={};let cur='';
d.split('\n').forEach(l=>{l=l.trim();if(!l)return;const m=l.match(/^【(.+)】$/);if(m){cur=m[1];if(!r[cur])r[cur]=[];return;}if(cur){let t=l.replace(/^\d+/,'').trim();if(t)r[cur].push(t);}});return r;}

// EQUIP_MOD_MAP
const eqRe=/(\w+): \{prefixes:\[([^\]]*)\],suffixes:\[([^\]]*)\]/g;const eqMods={};let m;
while((m=eqRe.exec(data))!==null)eqMods[m[1]]={prefixes:m[2].split(',').map(s=>s.replace(/"/g,'').trim()).filter(Boolean),suffixes:m[3].split(',').map(s=>s.replace(/"/g,'').trim()).filter(Boolean)};

const cn2id={};const cls=data.match(/export const itemClasses[^;]+/);
if(cls){(cls[0].match(/{ id:"(\w+)",label:"([^"]+)"/g)||[]).forEach(e=>{const m=e.match(/id:"(\w+)",label:"([^"]+)"/);cn2id[m[2]]=m[1];});}

const tcPre=parseTC('tc_prefixes.txt'),tcSuf=parseTC('tc_suffixes.txt');

// Get all unique TC texts with their equipment+position info
const allTc=[];
Object.entries(tcPre).forEach(([cn_eq,tcList])=>{tcList.forEach((t,i)=>allTc.push({text:t,eq:cn2id[cn_eq]||'',pos:i,type:'prefix'}));});
Object.entries(tcSuf).forEach(([cn_eq,tcList])=>{tcList.forEach((t,i)=>allTc.push({text:t,eq:cn2id[cn_eq]||'',pos:i,type:'suffix'}));});

// SC→TC char conversion
const S2T={'闪':'閃','护':'護','伤':'傷','击':'擊','电':'電','晕':'暈','阈':'閾','环':'環','门':'門','点':'點','减':'減','免':'免','积':'積','冻':'凍','扩':'擴','缩':'縮','质':'質','级':'級','围':'圍','长':'長','战':'戰','单':'單','双':'雙','锤':'錘','斗':'鬥','选':'選','择':'擇','项':'項','标':'標','签':'籤','万':'萬','与':'與','复':'復','体':'體','机':'機','对':'對','关':'關','系':'係','应':'應','发':'發','开':'開','无':'無','时':'時','书':'書','会':'會','个':'個','们':'們','为':'為','现':'現','领':'領','风':'風','实':'實','学':'學','进':'進','过':'過','运':'運','还':'還','这':'這','两':'兩','严':'嚴','灵':'靈','变':'變','叶':'葉','导':'導','响':'響','尔':'爾','尽':'盡','义':'義','亲':'親','许':'許','论':'論','识':'識','调':'調','负':'負','责':'責','费':'費','车':'車','转':'轉','轮':'輪','软':'軟','较':'較','轻':'輕','轴':'軸','辑':'輯','输':'輸','达':'達','违':'違','远':'遠','迟':'遲','适':'適','遗':'遺','邮':'郵','邻':'鄰','鉴':'鑑','锐':'銳','键':'鍵','镇':'鎮','镜':'鏡','钟':'鐘','铁':'鐵','银':'銀','铜':'銅','钢':'鋼','钱':'錢','错':'錯','镑':'鎊','钻':'鑽','录':'錄','际':'際','陆':'陸','陈':'陳','阴':'陰','阳':'陽','阶':'階','队':'隊','难':'難','险':'險','随':'随','隐':'隱','虽':'雖','静':'靜','页':'頁','顶':'頂','须':'須','顺':'順','预':'預','频':'頻','题':'題','颜':'顏','愿':'願','顾':'顧','显':'顯'};
function s2t(s){return s.split('').map(c=>S2T[c]||c).join('');}

// Get SC labels
const id2label={};
for(const lm of data.matchAll(/{ id:"(m\d+)", label:"([^"]+)"/g))id2label[lm[1]]=lm[2];

// For each SC mod, find best TC text match from ALL equipment types
const mod2tc={};
for(const [id,label] of Object.entries(id2label)){
  const sclabel=s2t(label).replace(/X/g,'').replace(/#/g,'');
  const scChars=[...new Set(sclabel)].filter(c=>!/[0-9%#\-—~+（）()\s.\/]/g.test(c));
  if(scChars.length===0)continue;

  let best=null,bestScore=0;
  for(const tc of allTc){
    let score=0;
    for(const c of scChars)if(tc.text.includes(c))score++;
    score/=scChars.length; // normalize
    if(score>bestScore){bestScore=score;best=tc.text;}
  }
  if(best&&bestScore>=0.4)mod2tc[id]=best; // 40% overlap minimum
}

// Generate regexes
const merged={};
Object.entries(mod2tc).forEach(([id,tc])=>{
  merged[id]=tc.replace(/#%/g,'[\\\\d.]+%').replace(/#/g,'\\\\d+').replace(/\s+/g,'.*');
});

// Remove old ALL_MODS_TC
const oldIdx=data.indexOf('const ALL_MODS_TC');
if(oldIdx>0){const end=data.indexOf('};\n',oldIdx)+3;data=data.substring(0,oldIdx)+data.substring(end+1);}

// Insert new
let out='const ALL_MODS_TC: Record<string,string> = {\n';
Object.entries(merged).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([id,regex])=>{
  out+='  '+JSON.stringify(id)+': '+JSON.stringify(regex)+',\n';
});
out+='};\n';
const insertPoint=data.indexOf('];',data.indexOf('const ALL_MODS'))+2;
data=data.substring(0,insertPoint+1)+'\n'+out+'\n'+data.substring(insertPoint+1);
fs.writeFileSync('src/data/affixesData.ts',data,'utf-8');

console.log('TC mods:',Object.keys(merged).length);
['m020','m017','m126','m125','m130','m131','m009','m120','m121','m122','m123','m124'].forEach(id=>{
  console.log(id+'('+(id2label[id]||'').substring(0,16)+'): '+(merged[id]||'MISSING').substring(0,50));
});

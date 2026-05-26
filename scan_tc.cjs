const fs=require('fs');
const data=fs.readFileSync('src/data/affixesData.ts','utf-8');

let ok=0,warn=0,empty=0;
for(const m of data.matchAll(/{ id:"(m\d+)", label:"([^"]+)", affix:"(prefix|suffix)", en:"[^"]*", cn:"[^"]+", tc:"([^"]*)"/g)){
  const id=m[1],label=m[2].replace(/X/g,'').replace(/#/g,''),tc=m[4];
  if(!tc){empty++;continue}
  // Clean tc: remove regex metacharacters
  const tcClean=tc.replace(/\\\\/g,'').replace(/\\d\+/g,'').replace(/\[\\.\\]\+/g,'').replace(/\.\*/g,'').replace(/\.\{[0-9,]+\}/g,'');
  const lc=[...new Set(label)].filter(c=>!/[0-9%#\-—~+（）()\s\.\/\-]/.test(c));
  const tcSet=new Set(tcClean);
  const missing=lc.filter(c=>!tcSet.has(c));
  const ratio=missing.length/lc.length;
  if(ratio>=0.8 && lc.length>=3) {
    console.log('!! '+id+' ('+label.substring(0,20)+'): TC mismatch - '+(tcClean.substring(0,30)));
    warn++;
  } else if(ratio>=0.5 && lc.length>=4) {
    console.log('?  '+id+' ('+label.substring(0,20)+'): TC partial - '+(tcClean.substring(0,30)));
    warn++;
  } else ok++;
}
console.log('\nOK:'+ok+' Warnings:'+warn+' Empty:'+empty);

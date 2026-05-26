const fs=require('fs');
const tc2mod=JSON.parse(fs.readFileSync('tc_mapping.json','utf-8'));
let f=fs.readFileSync('src/data/affixesData.ts','utf-8');

// First fix corrupted cn fields
f=f.replace(/"cn":"([^"]+)"/g, (match,cn)=>{
  let s=cn.replace(/\\\\\\d\+/g,'\\\\d+');
  return '"cn":"'+s+'"';
});

// Build mod2regex from tc_mapping
const mod2regex={};
Object.entries(tc2mod).forEach(([tc,modId])=>{
  if(!mod2regex[modId])mod2regex[modId]=new Set();
  mod2regex[modId].add(tc);
});

// Generate TC regex and update
f=f.replace(/("tc":)"[^"]*"/g, (match,prefix)=>{
  const id=match.match(/"m\d+"/);
  if(!id)return match;
  const modId=id[0].replace(/"/g,'');
  const texts=mod2regex[modId];
  if(!texts)return match;
  const best=[...texts].sort((a,b)=>b.length-a.length)[0];
  // TC regex: # -> \\d+, #% -> [\\d.]+%, spaces -> .*
  const regex=best.replace(/#%/g,'[\\d.]+%').replace(/#/g,'\\d+').replace(/\s+/g,'.*');
  return prefix+'"'+regex+'"';
});

fs.writeFileSync('src/data/affixesData.ts',f,'utf-8');
console.log('Done');

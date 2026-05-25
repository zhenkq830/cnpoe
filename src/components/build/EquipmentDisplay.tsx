import { useState, useCallback, useRef, useEffect } from 'react';

/* ================================================================
   Types
   ================================================================ */
export type Rarity = 'Normal'|'Magic'|'Rare'|'Unique';
export interface ItemData {
  slot: string; name: string; baseType: string; rarity: Rarity;
  icon?: string; ilvl: number; lvlReq: number;
  implicit?: string[]; explicit: string[];
  crafted?: string[]; enchant?: string;
  flavour?: string; note?: string; corrupted?: boolean;
}

const R = {
  Normal:{ border:'#6b6b78',bg:'#15151e',text:'#9a9aa8',glow:'rgba(107,107,120,0.15)' },
  Magic:{ border:'#4a7fd4',bg:'#131a2a',text:'#6ea0f0',glow:'rgba(74,127,212,0.2)' },
  Rare:{ border:'#c9a040',bg:'#1a1509',text:'#e0c060',glow:'rgba(201,160,64,0.25)' },
  Unique:{ border:'#e08830',bg:'#1a0d07',text:'#f0b050',glow:'rgba(224,136,48,0.3)' },
};
const CN: Record<Rarity,string> = { Normal:'普通',Magic:'魔法',Rare:'稀有',Unique:'传奇' };

const SLOTS = [
  { id:'Helmet', label:'头盔' },{ id:'Amulet', label:'项链' },{ id:'Weapon', label:'主手武器' },
  { id:'Offhand', label:'副手' },{ id:'Body', label:'胸甲' },{ id:'Ring1', label:'戒指①' },
  { id:'Ring2', label:'戒指②' },{ id:'Gloves', label:'手套' },{ id:'Belt', label:'腰带' },{ id:'Boots', label:'鞋子' },
] as const;

/* 像素坐标 — 原图 629x642, 用于覆盖在 2211.png 上 */
const SLOT_PX: Record<string,{x:number;y:number;w:number;h:number}> = {
  Helmet: {x:315,y:125,w:72,h:72}, Amulet: {x:420,y:200,w:52,h:52},
  Weapon: {x:510,y:320,w:72,h:144}, Offhand:{x:120,y:320,w:72,h:144},
  Body:   {x:315,y:340,w:72,h:72}, Ring1:  {x:440,y:240,w:52,h:52},
  Ring2:  {x:190,y:240,w:52,h:52}, Gloves: {x:200,y:440,w:52,h:52},
  Belt:   {x:315,y:430,w:72,h:52}, Boots:  {x:430,y:440,w:52,h:52},
};

function itemIcon(item: ItemData): string { return item.icon || ''; }

function Tooltip({ item, x, y }: { item: ItemData; x: number; y: number }) {
  const clr = R[item.rarity];
  const left = Math.min(x + 16, window.innerWidth - 310);
  const top = Math.max(10, Math.min(y - 20, window.innerHeight - 500));
  return (
    <div className="fixed z-[500] pointer-events-none w-[290px]" style={{ left, top }}>
      <div className="rounded-xl overflow-hidden" style={{ background:'linear-gradient(180deg,#0d0d1a,#080810)', border:`2px solid ${clr.border}`, boxShadow:`0 0 30px ${clr.glow},0 8px 32px rgba(0,0,0,0.7)` }}>
        <div className="px-4 py-3 flex items-center gap-3" style={{ background:`linear-gradient(180deg,${clr.border}22,transparent)` }}>
          {item.icon && <img src={item.icon} alt="" className="w-9 h-9 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />}
          <div>
            <p className="text-sm font-bold" style={{ color:clr.text }}>{item.name || item.baseType}</p>
            <p className="text-[10px] text-gray-500">{item.baseType} · {CN[item.rarity]}</p>
          </div>
        </div>
        <div className="px-4 py-3 space-y-2.5">
          <div className="flex gap-4 text-[10px] text-gray-600"><span>ilvl: {item.ilvl}</span><span>需求: Lv.{item.lvlReq}</span></div>
          {item.flavour && <p className="text-[10px] italic text-gray-500 leading-relaxed pb-2 border-b border-white/5">{item.flavour}</p>}
          {item.enchant && <p className="text-[11px] text-purple-300/80">{item.enchant}</p>}
          {item.implicit?.map((m,i) => <p key={'i'+i} className="text-[11px] text-gray-400">{m}</p>)}
          {item.explicit.map((m,i) => <p key={'e'+i} className="text-[11px] text-blue-300/90">{m}</p>)}
          {item.crafted?.map((m,i) => <p key={'c'+i} className="text-[11px] text-cyan-300/70">{m}</p>)}
        </div>
        <div className="px-4 py-2 flex justify-between text-[9px] text-gray-600" style={{ borderTop:'1px solid rgba(255,255,255,0.05)', background:'rgba(0,0,0,0.2)' }}>
          <span>需求 {item.lvlReq} 级</span><span style={{color:clr.text}}>{CN[item.rarity]}</span>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentDisplay({ items, priority }: { items: ItemData[]; priority?: { slot:string; label:string }[] }) {
  const [focusSlot, setFocusSlot] = useState<string|null>(null);
  const [tooltip, setTooltip] = useState<{item:ItemData;x:number;y:number}|null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => { if (imgRef.current) setScale(imgRef.current.clientWidth / 629); };
    update(); window.addEventListener('resize', update); return () => window.removeEventListener('resize', update);
  }, []);
  const map = Object.fromEntries(items.map(i => [i.slot, i]));
  const focused = focusSlot ? map[focusSlot] : undefined;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Paper doll */}
      <div className="xl:col-span-2 flex flex-col items-center">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-4">装备配置</p>
        <div className="relative mx-auto" style={{ maxWidth: 629 }}>
          <img ref={imgRef} src="/items/2211.png" alt="" className="w-full h-auto block" onLoad={() => { if (imgRef.current) setScale(imgRef.current.clientWidth / 629); }} />
          {SLOTS.map(s => {
            const it = map[s.id];
            const px = SLOT_PX[s.id] || {x:315,y:321,w:72,h:72};
            const clr = it ? R[it.rarity] : R.Normal;
            const isFocused = focusSlot === s.id;
            return (
              <div key={s.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none transition-all duration-200 hover:scale-105 rounded-xl"
                style={{
                  left: px.x * scale, top: px.y * scale,
                  width: px.w * scale, height: px.h * scale,
                  zIndex: isFocused ? 20 : 10,
                  transform: isFocused ? 'translate(-50%,-50%) scale(1.12)' : 'translate(-50%,-50%)',
                }}
                onClick={() => setFocusSlot(isFocused ? null : s.id)}
                onMouseEnter={e => it && setTooltip({item:it, x:e.clientX, y:e.clientY})}
                onMouseMove={e => it && setTooltip({item:it, x:e.clientX, y:e.clientY})}
                onMouseLeave={() => setTooltip(null)}
              >
                <div className="w-full h-full rounded-xl flex flex-col items-center justify-center gap-0.5 p-1"
                  style={{
                    background: `radial-gradient(ellipse at 30% 20%, ${clr.border}18, ${clr.bg} 70%)`,
                    border: `2px solid ${clr.border}`,
                    boxShadow: isFocused ? `0 0 24px ${clr.glow}` : `0 2px 8px rgba(0,0,0,0.4)`,
                  }}>
                  {it ? (
                    <>
                      {it.icon ? (
                        <img src={it.icon} alt="" className="w-7 h-7 object-contain" />
                      ) : (
                        <span className="text-lg leading-none">⬡</span>
                      )}
                      <span className="text-[7px] font-semibold text-center leading-none w-full truncate px-0.5" style={{ color:clr.text }}>
                        {(it.name || it.baseType).slice(0, 6)}
                      </span>
                    </>
                  ) : (
                    <span className="text-[9px] text-gray-600">{s.label}</span>
                  )}
                </div>
                {isFocused && <div className="absolute inset-0 rounded-xl pointer-events-none ring-2 ring-white/20" />}
              </div>
            );
          })}
        </div>
        {/* Focus detail */}
        {focused && (
          <div className="mt-4 w-full max-w-md animate-in">
            <div className="rounded-xl overflow-hidden" style={{ background:'linear-gradient(180deg,#0d0d1a,#080810)', border:`2px solid ${R[focused.rarity].border}`, boxShadow:`0 0 30px ${R[focused.rarity].glow}` }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ background:`linear-gradient(180deg,${R[focused.rarity].border}18,transparent)` }}>
                <div className="flex items-center gap-3">
                  {focused.icon && <img src={focused.icon} alt="" className="w-10 h-10 object-contain" />}
                  <div>
                    <p className="text-sm font-bold" style={{color:R[focused.rarity].text}}>{focused.name || focused.baseType}</p>
                    <p className="text-[11px] text-gray-500">{focused.baseType} · {CN[focused.rarity]} · ilvl {focused.ilvl}</p>
                  </div>
                </div>
                <button onClick={() => setFocusSlot(null)} className="text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-white/5">✕</button>
              </div>
              <div className="px-4 py-3 space-y-1.5 text-xs">
                <p className="text-gray-600 text-[10px]">需求等级: {focused.lvlReq}</p>
                {focused.implicit?.map((m,i) => <p key={i} className="text-gray-400">{m}</p>)}
                {focused.explicit.map((m,i) => <p key={i} className="text-blue-300/90">{m}</p>)}
                {focused.crafted?.map((m,i) => <p key={i} className="text-cyan-400/70">{m}</p>)}
                {focused.corrupted && <p className="text-red-400">已腐化</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        {priority && (
          <div className="poe-card p-4">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-4">装备优先级</h3>
            <div className="space-y-1.5">
              {priority.map((p,i) => {
                const it = map[p.slot]; const clr = it ? R[it.rarity] : R.Normal;
                return (
                  <div key={i} className="flex items-center gap-3 text-xs px-3 py-2 rounded-lg hover:bg-white/[0.03] cursor-default"
                    style={{ borderLeft:`3px solid ${clr.border}` }}>
                    <span className="text-gray-600 w-5 text-right font-mono text-[11px]">{i+1}</span>
                    <span className="text-gray-300 flex-1">{p.label}</span>
                    <span className="text-gray-600 text-[10px]">{SLOTS.find(s=>s.id===p.slot)?.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="poe-card p-4">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-4">配装统计</h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(R) as Rarity[]).map(r => {
              const n = items.filter(i => i.rarity===r).length;
              if (!n) return null;
              return <div key={r} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{background:R[r].border}}/>
                <span className="text-gray-400">{CN[r]}</span><span className="text-gray-500 ml-auto">{n}件</span>
              </div>;
            })}
          </div>
          <p className="text-[10px] text-gray-600 mt-3 pt-3 border-t border-white/5">共{items.length}件 · 需求Lv.{Math.max(...items.map(i=>i.lvlReq))}</p>
        </div>
      </div>

      {tooltip && <Tooltip item={tooltip.item} x={tooltip.x} y={tooltip.y} />}
      <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}@keyframes fade-in-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.animate-in{animation:fade-in-up .25s ease-out}`}</style>
    </div>
  );
}

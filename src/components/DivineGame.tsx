import { useState, useCallback, useRef, useEffect } from 'react';

interface Stat {
  label: string;
  min: number;
  max: number;
  current: number;
  unit?: string;
}

interface Item {
  id: string;
  name: string;
  icon: string;
  baseType: string;
  rarity: '传奇';
  flavor: string;
  stats: Stat[];
}

const INITIAL_ITEMS: Item[] = [
  {
    id: 'm1', name: '猎首', icon: '🎭', baseType: '皮革腰带', rarity: '传奇',
    flavor: '……属于帝国最臭名昭著的军阀，猎首雷默。',
    stats: [
      { label: '力量', min: 40, max: 55, current: 48, unit: undefined },
      { label: '敏捷', min: 40, max: 55, current: 51, unit: undefined },
      { label: '最大生命', min: 45, max: 55, current: 50, unit: undefined },
    ],
  },
  {
    id: 'm2', name: '魔暴之痕', icon: '🏹', baseType: '暴击弓', rarity: '传奇',
    flavor: '他牺牲了精确性，以换取前所未有的破坏力。',
    stats: [
      { label: '物理伤害', min: 120, max: 180, current: 152, unit: '%' },
      { label: '暴击率', min: 30, max: 50, current: 41, unit: '%' },
      { label: '攻击速度', min: 8, max: 16, current: 12, unit: '%' },
    ],
  },
  {
    id: 'm3', name: '大血甲', icon: '🛡', baseType: '征战铠甲', rarity: '传奇',
    flavor: '当血肉成为最坚固的护盾，钢铁便失去了意义。',
    stats: [
      { label: '护甲', min: 200, max: 300, current: 248, unit: '%' },
      { label: '最大生命', min: 20, max: 40, current: 31, unit: '%' },
      { label: '火焰抗性', min: 30, max: 50, current: 42, unit: '%' },
    ],
  },
  {
    id: 'm4', name: '法血', icon: '🧪', baseType: '药剂师腰带', rarity: '传奇',
    flavor: '最致命的毒药往往装在最精致的瓶子里。',
    stats: [
      { label: '药剂效果', min: 15, max: 25, current: 19, unit: '%' },
      { label: '冷却回复', min: 10, max: 20, current: 15, unit: '%' },
      { label: '混沌抗性', min: 20, max: 40, current: 28, unit: '%' },
    ],
  },
  {
    id: 'm5', name: '全知', icon: '💍', baseType: '紫晶戒指', rarity: '传奇',
    flavor: '真正的力量源于对万物的理解。',
    stats: [
      { label: '全属性', min: 10, max: 20, current: 15, unit: undefined },
      { label: '元素抗性', min: 15, max: 30, current: 22, unit: '%' },
      { label: '穿透元素抗性', min: 10, max: 25, current: 18, unit: '%' },
    ],
  },
  {
    id: 'm6', name: '永恒诅咒', icon: '💀', baseType: '黑曜护身符', rarity: '传奇',
    flavor: '千万个声音在诉说，被囚禁于永无止境的循环之中。',
    stats: [
      { label: '最大生命', min: 10, max: 20, current: 16, unit: '%' },
      { label: '混沌抗性', min: 15, max: 30, current: 23, unit: '%' },
      { label: '护盾回复', min: 20, max: 40, current: 31, unit: '%' },
    ],
  },
];

// 每件装备的数值覆盖坐标 (原图593x442中的像素)
const STAT_POSITIONS: Record<string, { cx: number; cy: number; w: number; h: number }[]> = {
  junheng: [
    { cx: 241, cy: 233, w: 47, h: 31 },
  ],
};

// 当前装备状态
const EQUIPS: Item[] = [
  {
    id: 'junheng', name: '均衡之符', icon: '/junheng.png', baseType: '黑曜护身符', rarity: '传奇',
    flavor: '万物归于平衡，两极相生相克。',
    stats: [
      { label: '全属性', min: 50, max: 100, current: 75 },
    ],
  },
];

export default function DivineGame() {
  const [items, setItems] = useState<Item[]>(() => EQUIPS.map(e => ({...e, stats: e.stats.map(s => ({...s}))})));
  const [divActive, setDivActive] = useState(false);
  const [divHovered, setDivHovered] = useState(false);
  const [hovered, setHovered] = useState<Item | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [divCount, setDivCount] = useState(() => {
    const saved = localStorage.getItem('divine-count');
    return saved ? parseInt(saved) : 20;
  });
  const [message, setMessage] = useState('');
  const [memo, setMemo] = useState(() => {
    try { return localStorage.getItem('divine-memo') || ''; } catch { return ''; }
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    const img = imgRef.current;
    if (img) setScale(img.clientWidth / 874);
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  const divineId = 'divine';

  const saveItems = (next: Item[]) => {
    setItems(next);
    try { localStorage.setItem('divine-items', JSON.stringify(next)); } catch {}
  };

  const handleDiv = useCallback((e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    if (!divActive) return;
    if (divCount <= 0) {
      setMessage('神圣石不足！');
      setDivActive(false);
      return;
    }
    saveItems(items.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        stats: item.stats.map(s => ({
          ...s,
          current: Math.floor(Math.random() * (s.max - s.min + 1)) + s.min,
        })),
      };
    }));
    const next = divCount - 1;
    setDivCount(next);
    localStorage.setItem('divine-count', String(next));
    const it = items.find(i => i.id === itemId);
    if (next <= 0) {
      setDivActive(false);
      setMessage('神圣石用完了！');
    } else {
      setMessage(`${it?.name} 已Div！剩余 ${next} 神圣石 (可继续点击装备)`);
    }
  }, [divActive, divCount, items]);

  const handleDivRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDivActive(!divActive);
    setMessage(divActive ? '' : '已激活，点击装备进行roll值');
  }, [divActive]);

  const handleHover = useCallback((e: React.MouseEvent, item: Item | null) => {
    setHovered(item);
    if (item) {
      setTooltipPos({ x: e.clientX + 12, y: e.clientY - 10 });
    }
  }, []);

  const resetAll = () => {
    saveItems(EQUIPS.map(e => ({...e, stats: e.stats.map(s => ({...s}))})));
    setDivCount(20);
    localStorage.setItem('divine-count', '20');
    setDivActive(false);
    setMessage('已重置');
  };

  return (<>
    <div className="game-area relative">
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-poe-text">神圣模拟器</span>
          <span className="text-[10px] text-poe-muted ml-2">(右键神圣石激活，再点装备)</span>
        </div>
        <button onClick={resetAll} className="text-[9px] text-poe-muted hover:text-poe-red">重置</button>
      </div>

      {/* Inventory */}
      <div className="mx-2 mb-2 rounded-lg border border-poe-border relative" style={{ maxWidth: 874 }}>
        <img ref={imgRef} src="/chuangkou.png" alt="" className="w-full h-auto block" onLoad={updateScale} />
        {/* Divine orb */}
        {divCount > 0 && (
        <div
          className="absolute rounded flex items-center justify-center cursor-pointer transition-all duration-150 select-none"
          style={{
            left: 79 * scale, top: 68 * scale,
            width: 74.2 * scale, height: 148.4 * scale,
          }}
          onClick={(e) => { e.preventDefault(); if (divActive) { setDivActive(false); setMessage('已取消激活'); } }}
          onContextMenu={handleDivRightClick}
          onMouseEnter={(e) => { setDivHovered(true); setTooltipPos({ x: e.clientX + 12, y: e.clientY - 10 }); }}
          onMouseMove={(e) => setTooltipPos({ x: e.clientX + 12, y: e.clientY - 10 })}
          onMouseLeave={() => setDivHovered(false)}
        >
          <img src="/div.png" alt="神圣石" className="w-4/5 h-4/5 object-contain" />
          <span className="absolute text-[10px] font-bold text-white px-1.5 rounded" style={{ bottom: 43, right: 16, fontFamily: 'Arial, sans-serif' }}>
            {divCount}
          </span>
        </div>
        )}
        {/* 均衡之符 */}
        <div
          className="absolute rounded flex items-center justify-center cursor-pointer
            transition-all duration-150 select-none"
          style={{ left: 218 * scale, top: 61 * scale, width: 85.2 * scale, height: 170.5 * scale }}
          onClick={(e) => handleDiv(e, 'junheng')}
          onMouseEnter={(e) => { const it = items.find(i => i.id === 'junheng'); if (it) setHovered(it); setTooltipPos({ x: e.clientX + 12, y: e.clientY - 10 }); }}
          onMouseMove={(e) => setTooltipPos({ x: e.clientX + 12, y: e.clientY - 10 })}
          onMouseLeave={() => setHovered(null)}
        >
          <img src="/junheng.png" alt="均衡之符" className="w-4/5 h-3/5 object-contain" />
        </div>
      </div>

      {/* Status */}
      <div className="px-3 pb-2">
        <p className="text-[9px] text-poe-muted text-center">{message}</p>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div
          className="fixed z-[200] w-64 pointer-events-none"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div>
            {/* Header — junheng 跳过，截图自带 */}
            {hovered.id !== 'junheng' && (
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-poe-border">
                <span className="text-2xl">{hovered.icon}</span>
                <div>
                  <p className="text-sm font-bold text-poe-gold-light">{hovered.name}</p>
                  <p className="text-[10px] text-poe-muted">{hovered.baseType}</p>
                </div>
              </div>
            )}

            {hovered.id === 'junheng' ? (
              /* junheng 专用: 直接显示截图，无header */
              <div className="relative" style={{ width: 400 }}>
                <img src="/junheng1.png" alt="" className="w-full h-auto block" />
                {/* 属性数字覆盖 */}
                {(() => {
                  const live = items.find(eq => eq.id === 'junheng');
                  const stats = live?.stats || [];
                  return stats.map((s, i) => {
                  const pos = STAT_POSITIONS.junheng[i];
                  if (!pos) return null;
                  const scale = 400 / 593;
                  return (
                    <span key={i} className="absolute font-bold text-center pointer-events-none"
                      style={{
                        left: pos.cx * scale,
                        top: pos.cy * scale,
                        transform: 'translate(-50%, -50%)',
                        fontSize: 20,
                        color: '#5757A8',
                        fontFamily: '\"Noto Sans SC\", \"Microsoft YaHei\", \"PingFang SC\", sans-serif',
                        lineHeight: 1,
                        fontWeight: 400,
                        background: '#0a0a0f',
                        padding: '2px 6px',
                        borderRadius: 2,
                        textShadow: '0 0 3px rgba(87,87,168,0.4), 0 1px 1px rgba(0,0,0,0.8)',
                        letterSpacing: '0.02em',
                      }}
                    >{s.current > 0 ? '+' : ''}{s.current}{s.unit || ''}</span>
                  );
                })})()}
              </div>
            ) : (
              <>
                {/* Flavor */}
                <p className="text-[9px] italic text-poe-gold/60 mb-2 leading-relaxed">
                  {hovered.flavor}
                </p>
                {/* Stats */}
                <div className="space-y-0.5 text-xs">
                  {hovered.stats.map((s, i) => {
                    const pct = ((s.current - s.min) / (s.max - s.min) * 100);
                    const color = pct >= 80 ? 'text-poe-red' : pct >= 50 ? 'text-poe-yellow' : pct <= 30 ? 'text-poe-green' : 'text-poe-gold-light';
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-poe-muted truncate flex-1">{s.label}:</span>
                        <span className={`font-mono font-bold ${color}`}>{s.current}{s.unit || ''}</span>
                        <span className="text-[9px] text-poe-muted/50 w-16 text-right">({s.min}-{s.max}{s.unit || ''})</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Divine hint */}
            {hovered.stats.length > 0 && (
              <p className="text-[9px] text-poe-gold/50 mt-2 pt-1.5 border-t border-poe-border">
                可用神圣石重roll数值
              </p>
            )}
          </div>
        </div>
      )}

      {/* Divine orb hover tooltip */}
      {divHovered && !hovered && (
        <div
          className="fixed z-[200] pointer-events-none"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div>
            <p className="text-xs font-bold text-poe-gold-light mb-2">神圣石</p>
            <img src="/div1.png" alt="神圣石说明" className="w-80 max-w-none rounded" />
          </div>
        </div>
      )}
    </div>

    {/* 备忘录 */}
    <div className="mx-2">
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-poe-text">备忘录</span>
          <span className="text-[10px] text-poe-muted">(仅本机保存)</span>
        </div>
      </div>
      <textarea
        className="text-xs w-full font-mono bg-poe-dark/80 border border-poe-border rounded-lg px-3 py-2 text-poe-text placeholder:text-poe-muted/60 focus:outline-none focus:ring-2 focus:ring-poe-gold/30 focus:border-poe-gold/50 transition-colors resize-y" style={{ height: 400 }}
        placeholder=""
        value={memo}
        onChange={(e) => {
          setMemo(e.target.value);
          try { localStorage.setItem('divine-memo', e.target.value); } catch {}
        }}
        spellCheck={false}
      />
      <p className="text-[9px] text-poe-muted/50 mt-1 text-right">右下角可拖动调节大小</p>
    </div>
  </>);
}

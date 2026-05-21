/**
 * 流放工坊 (PoE2 Exile Workshop)
 * Copyright (c) 2025 cnpoe.com
 * All Rights Reserved.
 */
interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CopyrightModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md poe-card p-6 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center">
          <span className="text-3xl">⚒</span>
          <h3 className="text-lg font-bold text-poe-text mt-2">关于本站</h3>
          <p className="text-xs text-poe-muted mt-1">流放工坊 — PoE2 中文玩家工具站</p>
        </div>

        {/* Copyright */}
        <div className="space-y-3 text-xs text-poe-text leading-relaxed p-4 rounded-lg bg-poe-dark/30 border border-poe-border">
          <p>
            <span className="text-poe-gold-light font-semibold">© 2025 流放工坊 | cnpoe.com</span>
            <br />
            <span className="text-poe-muted">All Rights Reserved.</span>
          </p>
          <p className="text-poe-muted">
            本网站代码、词缀数据及正则生成逻辑均属原创开发成果。
            未经许可，禁止商业复制、二次贩卖或用于盈利目的。
          </p>
          <p className="text-poe-muted">
            正则工坊核心引擎参考并致谢：
          </p>
          <p>
            <a href="https://poe2.re" className="text-poe-gold-light hover:underline">poe2.re</a>
            <span className="text-poe-muted mx-1">·</span>
            <a href="https://github.com/veiset/poe2.re" className="text-poe-gold-light hover:underline">GitHub</a>
            <span className="text-poe-muted mx-1">·</span>
            <a href="https://poe2db.tw" className="text-poe-gold-light hover:underline">poe2db.tw</a>
          </p>
          <div className="pt-2 border-t border-poe-border">
            <p className="text-poe-gold-light/80 text-center">
              欢迎交流，但请尊重劳动成果，感谢支持！
            </p>
          </div>
        </div>

        {/* Close */}
        <div className="text-center">
          <button onClick={onClose} className="text-xs text-poe-muted hover:text-poe-text transition-colors">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 流放工坊 (PoE2 Exile Workshop)
 * Copyright (c) 2025 cnpoe.com
 * All Rights Reserved.
 */
import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { FloatingQQButton } from '../QQGroupModal';

function Footer() {
  const [copied1, setCopied1] = useState(false);
  const [copied2, setCopied2] = useState(false);

  const copy = useCallback(async (num: string, setter: (v: boolean) => void) => {
    try { await navigator.clipboard.writeText(num); } catch {
      const ta = document.createElement('textarea'); ta.value = num;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    setter(true); setTimeout(() => setter(false), 2000);
  }, []);

  return (
    <footer className="mt-auto border-t border-poe-border bg-poe-darker/50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: copyright */}
          <div className="text-xs text-poe-muted text-center sm:text-left">
            <p className="font-bold text-poe-text mb-1">流放工坊</p>
            <p>PoE2 中文玩家工具站 — 开源项目</p>
            <p className="mt-1">
              <a href="https://poe2.re" className="text-poe-gold-light hover:underline">poe2.re</a>
              {' · '}
              <a href="https://www.pathofexile.com" className="text-poe-gold-light hover:underline">PoE2 官方</a>
            </p>
          </div>

          {/* Center: QQ groups */}
          <div className="text-center">
            <p className="text-xs text-poe-muted mb-2">加入 QQ 交流群</p>
            <div className="flex items-center gap-3">
              <div className="text-xs">
                <span className="text-poe-muted">1群 </span>
                <span className="font-mono text-poe-gold-light">443050018</span>
                <button onClick={() => copy('443050018', setCopied1)}
                  className="ml-1.5 text-[10px] text-poe-muted hover:text-poe-gold-light transition-colors">
                  {copied1 ? '已复制' : '复制'}
                </button>
              </div>
              <span className="text-poe-border">|</span>
              <div className="text-xs">
                <span className="text-poe-muted">2群 </span>
                <span className="font-mono text-poe-gold-light">533572652</span>
                <button onClick={() => copy('533572652', setCopied2)}
                  className="ml-1.5 text-[10px] text-poe-muted hover:text-poe-gold-light transition-colors">
                  {copied2 ? '已复制' : '复制'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: version + links */}
          <div className="hidden sm:block text-xs text-poe-muted text-right">
            <p className="font-mono text-[10px] text-poe-gold/50">{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}</p>
            <p>如有问题或建议 · 欢迎加群反馈</p>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="mt-4 pt-3 border-t border-poe-border/50 text-center">
          <p className="text-[10px] text-poe-muted/70">
            © 2025 流放工坊 | cnpoe.com All Rights Reserved.
            本网站代码及词缀数据未经允许禁止商业复制、二次贩卖或用于盈利目的。
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
          {children}
        </main>
      </div>
      <Footer />
      <FloatingQQButton />
    </div>
  );
}

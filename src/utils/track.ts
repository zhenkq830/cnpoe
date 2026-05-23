/** 轻量统计 — 走 Umami 自定义事件, 失败不影响用户 */

declare global { interface Window { umami?: { track: (event: string, data?: Record<string,unknown>) => void } } }

export function trackCopy(selected: string[]) {
  try {
    window.umami?.track('regex_copy', {
      count: selected.length,
      mods: selected.slice(0, 20).join(','),
    });
  } catch {}
}

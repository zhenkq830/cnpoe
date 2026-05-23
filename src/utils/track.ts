/** 轻量统计 — 走 Umami 自定义事件 */

declare global { interface Window { umami?: { track: (event: string, data?: Record<string,unknown>) => void } } }

export function trackCopy(selected: string[]) {
  try {
    // 总次数
    window.umami?.track('regex_copy', { count: selected.length });
    // 每条词缀独立事件, 后台可按 name 分组统计
    for (const id of selected) {
      window.umami?.track('mod_copied', { name: id });
    }
  } catch {}
}

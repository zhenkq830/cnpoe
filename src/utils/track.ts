/** 轻量统计 — 走 Umami 自定义事件 */

declare global { interface Window { umami?: { track: (event: string, data?: Record<string,unknown>) => void } } }

export function trackCopy(selected: string[]) {
  try {
    window.umami?.track('regex_copy', { count: selected.length });
    for (const id of selected) {
      // 词缀ID直接进事件名, 后台自动分组统计
      window.umami?.track('mod|' + id);
    }
  } catch {}
}

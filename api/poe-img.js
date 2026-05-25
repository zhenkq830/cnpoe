/** PoE CDN 图片代理 — Vercel 海外取图, 国内用户可见 */

export default async function handler(req, res) {
  const parsed = new URL(req.url, 'https://cnpoe.com');
  const url = parsed.searchParams.get('url');
  if (!url || !url.startsWith('https://web.poecdn.com/')) {
    res.statusCode = 400; res.end('bad url'); return;
  }
  try {
    const r = await fetch(url);
    if (!r.ok) { res.statusCode = r.status; res.end(); return; }
    const buf = await r.arrayBuffer();
    res.setHeader('Content-Type', r.headers.get('content-type') || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = 200;
    res.end(Buffer.from(buf));
  } catch { res.statusCode = 502; res.end(); }
}

/** PoE CDN 图片镜像代理 — Vercel 海外取图, 国内用户才能看到 */

export default async function handler(req, res) {
  const url = req.query?.url;
  if (!url) return res.status(400).end('missing url');

  // 只代理 PoE CDN
  if (!url.startsWith('https://web.poecdn.com/')) return res.status(403).end('blocked');

  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).end();
    const buf = await r.arrayBuffer();
    const ct = r.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(Buffer.from(buf));
  } catch { res.status(502).end(); }
}

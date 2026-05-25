/** PoE CDN 图片代理 */
module.exports = async function handler(req, res) {
  const urlObj = new URL(req.url, 'https://cnpoe.com');
  const url = urlObj.searchParams.get('url');
  if (!url || !url.startsWith('https://web.poecdn.com/')) {
    res.status(400).end('bad url'); return;
  }
  try {
    const r = await fetch(url);
    if (!r.ok) { res.status(r.status).end(); return; }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', r.headers.get('content-type') || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(buf);
  } catch { res.status(502).end(); }
};

/** PoE CDN 图片代理 */
module.exports = async function handler(req, res) {
  try {
    const urlObj = new URL(req.url, 'https://cnpoe.com');
    const src = urlObj.searchParams.get('url');
    if (!src || !src.startsWith('https://web.poecdn.com/')) {
      res.statusCode = 400; res.end('bad url'); return;
    }
    const r = await fetch(src);
    if (!r.ok) { res.statusCode = r.status; res.end(); return; }
    const buf = Buffer.from(await r.arrayBuffer());
    const ct = r.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = 200;
    res.end(buf);
  } catch (e) {
    res.statusCode = 502;
    res.end('proxy error: ' + (e.message || ''));
  }
};

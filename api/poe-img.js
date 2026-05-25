export default async function handler(req, res) {
  const u = new URL(req.url, 'https://cnpoe.com');
  const src = u.searchParams.get('url');
  if (!src || !src.startsWith('https://web.poecdn.com/')) {
    return res.status(400).send('bad url');
  }
  const r = await fetch(src);
  if (!r.ok) return res.status(r.status).send('');
  const buf = Buffer.from(await r.arrayBuffer());
  res.setHeader('content-type', r.headers.get('content-type') || 'image/png');
  res.setHeader('cache-control', 'public, max-age=86400, s-maxage=604800');
  return res.status(200).send(buf);
}

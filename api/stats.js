/** Umami 统计数据代理 — API key 仅存服务端, 永不暴露 */

const UMAMI_API = 'https://cloud.umami.is/api';
const WEBSITE_ID = 'df989e38-80a7-469d-b4f0-be4b9aee4682';

export default async function handler(req, res) {
  const apiKey = process.env.UMAMI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'API key not configured' });
    return;
  }

  try {
    const now = Date.now();
    const startAt = now - 7 * 24 * 60 * 60 * 1000;

    const r = await fetch(
      `${UMAMI_API}/websites/${WEBSITE_ID}/events?startAt=${startAt}&endAt=${now}&unit=day`,
      { headers: { 'x-umami-api-key': apiKey } }
    );

    if (!r.ok) {
      res.status(r.status).json({ error: 'Umami API error' });
      return;
    }

    const data = await r.json();

    const counts = {};
    for (const ev of data) {
      if (ev.event_name && ev.event_name.startsWith('mod|')) {
        const key = ev.event_name.slice(4);
        counts[key] = (counts[key] || 0) + (ev.count || 1);
      }
    }

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ updated: new Date().toISOString(), top: sorted });
  } catch (e) {
    res.status(500).json({ error: 'Internal error' });
  }
}

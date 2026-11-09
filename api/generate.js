const { auth } = require('./_kv');
const meta = (h, p) => {
  const m = h.match(new RegExp('<meta[^>]+(?:property|name)=["\']' + p + '["\'][^>]*content=["\']([^"\']*)["\']', 'i')) ||
            h.match(new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:property|name)=["\']' + p + '["\']', 'i'));
  return m ? m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'") : '';
};
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  if (!auth(req)) return res.status(401).json({ error: 'Password salah' });
  const link = (req.body || {}).url;
  if (!/^https?:\/\//.test(link || '')) return res.status(400).json({ error: 'Link tidak valid' });
  let title = '', desc = '', image = '', price = '';
  try {
    const r = await fetch(link, { redirect: 'follow', headers: { 'User-Agent': 'facebookexternalhit/1.1', 'Accept-Language': 'id-ID,id;q=0.9' } });
    const h = await r.text();
    title = meta(h, 'og:title') || (h.match(/<title>([^<]*)/i) || [])[1] || '';
    desc = meta(h, 'og:description') || meta(h, 'description');
    image = meta(h, 'og:image');
    price = meta(h, 'product:price:amount') || ((h.match(/"price"\s*:\s*"?([\d.]+)/) || [])[1] || '');
    if (price.includes('.') && price.split('.')[1].length <= 2) price = String(Math.round(parseFloat(price)));
  } catch (e) { /* lanjut, isi manual */ }
  let out = { title, description: desc };
  if (process.env.ANTHROPIC_API_KEY && (title || desc)) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 600,
          messages: [{ role: 'user', content: 'Tulis ulang judul dan deskripsi produk Shopee ini dalam bahasa Indonesia yang menarik, natural, tidak lebay, dan jangan mengarang spesifikasi yang tidak ada. Judul maks 70 karakter, deskripsi 2-3 kalimat. Balas HANYA JSON: {"title":"...","description":"..."}\n\nJudul: ' + title + '\nDeskripsi: ' + desc }]
        })
      });
      const d = await r.json();
      out = JSON.parse(d.content[0].text.replace(/```json|```/g, '').trim());
    } catch (e) { /* pakai teks asli */ }
  }
  res.json({ title: out.title, description: out.description, image, price, link, scraped: !!(title || image) });
};

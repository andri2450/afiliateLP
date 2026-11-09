const { kv, auth } = require('./_kv');
const load = async () => JSON.parse((await kv(['GET', 'products'])) || '[]');
module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
      return res.json(await load());
    }
    if (!auth(req)) return res.status(401).json({ error: 'Password salah' });
    let list = await load();
    if (req.method === 'POST') {
      const p = req.body || {};
      if (!p.title || !p.link) return res.status(400).json({ error: 'Judul dan link wajib diisi' });
      list.unshift({ id: Date.now().toString(36), title: p.title, description: p.description || '', price: p.price || '', image: p.image || '', link: p.link });
    } else if (req.method === 'DELETE') {
      list = list.filter((x) => x.id !== req.query.id);
    } else return res.status(405).end();
    await kv(['SET', 'products', JSON.stringify(list)]);
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

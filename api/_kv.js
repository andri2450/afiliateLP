const U = process.env.KV_REST_API_URL, T = process.env.KV_REST_API_TOKEN;
async function kv(cmd) {
  const r = await fetch(U, { method: 'POST', headers: { Authorization: 'Bearer ' + T }, body: JSON.stringify(cmd) });
  return (await r.json()).result;
}
const auth = (req) => !!process.env.ADMIN_PASSWORD && req.headers['x-admin-password'] === process.env.ADMIN_PASSWORD;
module.exports = { kv, auth };
